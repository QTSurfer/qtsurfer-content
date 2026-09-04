---
title: Patrones de estrategia
description: Aplica filtros, salidas, transiciones de estado y cálculos a nivel de mercado reutilizables.
order: 3
lastUpdated: '2026-09-04T10:18:11Z'
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: d0fc9b6b50458ffb46ad07ee472b226d24f31c68
upstreamPath: skills/qtsurfer-java-strategy/references/patterns.md
---

Patrones probados extraídos de estrategias en producción y de backtests heredados.

## Cadena de filtrado de ruido

El patrón de procesamiento de señal más sofisticado del código base. Convierte un indicador crudo
en una señal limpia y suavizada:

```
raw signal
  → clamp(±threshold → 0)        suppress micro-noise
    → percentChange               convert to rate of change
      → conditional(≠0, EMA(n))  only feed non-zero changes to EMA
```

```java
indicators
    .add("raw", TickerValueSource.Close)
    .distance("distemas", "ema60", "ema500")
    .clamp("distemas", v -> Math.abs(v) <= 0.1, 0.0)
    .percentChange("chgDistemas")
    .conditional("smoothDistemas", "chgDistemas", v -> v != 0,
        indicators.getReadOnlyExisting("ema500"), zeroIndicator)
    .window("smoothDistemas", WindowTime.s1, new DetectorListener(this, indicators));
```

**Por qué:** las señales crudas de distancia entre EMA tienen demasiado ruido para decisiones
fiables. El condicional evita que el relleno con ceros diluya la EMA cuando no hay un cambio
significativo.

---

## Análisis de distancia entre EMA

Usa la **distancia entre EMA** como señal principal en lugar de los valores crudos de EMA. La
distancia es una derivada — mide el momento de la tendencia, no la tendencia en sí.

```java
indicators
    .ema("ema60", 60)
    .ema("ema500", 500)
    .ema("ema2500", 2500)
    .distance("shortDistemas", "ema60", "ema500")   // short-term momentum
    .distance("longDistemas",  "ema500", "ema2500") // medium-term trend
    .gain("longStreakCount", "ema7500");              // macro uptrend
```

**Puerta de entrada:** `longDistemas >= 0,35` Y `shortDistemas` en subida Y racha macro >= 300.

---

## Variantes de salida con trailing

### Trailing al punto medio (probado en producción, ~7 % de media)

```java
// In onChange:
double percentGain = (price - buyPrice) / buyPrice * 100;
if (percentGain > maxPcnGain) maxPcnGain = percentGain;
double trigger = maxPcnGain - (maxPcnGain - minPercentGain) / 2;
if (percentGain > minPercentGain && percentGain <= trigger) {
    emitSell(price);
}
```

Vende cuando la ganancia retrocede hasta el punto medio entre el umbral mínimo y la ganancia
máxima. Se autocalibra a la magnitud del movimiento.

### Trailing al pico

```java
// In onChange:
if (price > maxPrice) maxPrice = price;
double fallFromPeak = (maxPrice - price) / maxPrice * 100;
if (fallFromPeak >= 1.0) emitSell(price); // 1% drop from peak
```

Más simple. Bueno para operaciones rápidas de scalping.

### Reinicio por ganancia de EMA

```java
// In onChange:
if (exitEmaGain.getPeriodCount() == 0) emitSell(price);
```

Vende cuando la EMA de salida deja de subir (el momento se ha agotado). Requiere un
`GainRTIndicator` que envuelva la EMA de salida.

---

## Stop-loss condicional

Un stop-loss consciente del macro contexto que evita saltar durante caídas saludables:

```java
// In onChange:
double percentGain = (price - buyPrice) / buyPrice * 100;
if (percentGain < 0
        && Math.abs(percentGain) >= 0.5           // loss > 0.5%
        && longDistemas < 0.01) {                  // macro trend weakening
    emitSell(price);
    store.set("fail");
}
```

Solo se activa cuando el contexto macro también es débil. Reduce los stops en falso en mercados
volátiles pero con tendencia de fondo.

---

## Protección de reentrada (estado `"fail"`)

Bloquea nuevas entradas tras una operación perdedora hasta que el contexto macro se reinicie por
completo:

```java
// Entry listener:
if (store.is("fail")) return;  // block until macro reset
// ...entry conditions...

// Separate macro reset check (in another window or update):
if (store.is("fail") && longEmaValue < vlongEmaValue) {
    store.unset("fail");
}
```

Evita el revenge trading tras un stop-loss. La condición de reinicio (`longEma < vlongEma`)
asegura que se complete un ciclo macro entero antes de permitir la reentrada.

---

## Actividad de instrumento basada en OPS

Rastrea las operaciones por segundo de cada instrumento para identificar monedas dormidas que
despiertan:

```java
// In update():
long now = System.currentTimeMillis();
long currentOps = opsCounter.incrementAndGet();
if (now - lastOpsWindow > 1000) {
    double ops = (double) currentOps / ((now - lastOpsWindow) / 1000.0);
    lastOps = ops;
    lastOpsWindow = now;
    opsCounter.set(0);
}
// Low ops + sudden spike = pump candidate
```

**Patrón:** ordena todos los instrumentos por ops ascendente. Las monedas con &lt; 0,1 ops/s que
de repente se disparan son candidatas a pump.

---

## Filtro de entrada multietapa

Todas las estrategias probadas en producción usan de 2 a 3 etapas de confirmación independientes
antes de entrar:

| Estrategia | Etapa 1                        | Etapa 2                          | Etapa 3               |
| ---------- | ------------------------------- | ---------------------------------- | ----------------------- |
| S1         | Ancho de BB en [0,5, 0,6]      | Precio por encima de la EMA500    | —                        |
| S2         | Racha de ganancia de EMA >= 3  | Precio por encima de la EMA200    | Volatilidad >= 50 %     |
| S3         | Racha de VlongEMA >= 300       | Distancia en subida 10+ ticks     | Distancia >= 0,35 %     |

**Regla general:** al menos una condición de momento + una condición de tendencia macro + una
protección contra ruido/falsos positivos.

---

## Estado compartido entre ventanas

Toda ventana construida sobre el mismo `InstrumentGroupRTIndicator` comparte un único
`StateStore` a nivel de instrumento — sin cableado adicional. Una ventana de entrada puede fijar
un flag y una ventana de salida del mismo grupo lo lee de inmediato, porque ambas llamadas a
`onChange` reciben el mismo store:

```java
indicators
    .addPrice()
    .ema("ema10", 10)
    .window("ema10", WindowTime.s1, new EntryListener(this, indicators))
    .window("price", Duration.ofMillis(100), new ExitListener(this, indicators));

// EntryListener.onChange(StateStore store, ...) { store.set("inPosition"); ... }
// ExitListener.onChange(StateStore store, ...)  { if (store.is("inPosition")) ... }
```

---

## Puerta de volatilidad

Evita entradas durante periodos de baja actividad:

```java
indicators
    .addPrice()
    .add("vlts", new VolatilityRTIndicator(smaPeriods).clampUpdates(warmupPeriods))
    // ...other indicators...

// In entry listener:
double volatility = indicators.getValue("vlts");
if (volatility < 50.0) return; // market not active enough
```

`clampUpdates(n)` suprime las primeras N actualizaciones (devuelve 0) para dejar que la SMA
subyacente se caliente antes de que los valores de volatilidad tengan sentido.

---

## Estrategias entre instrumentos (a nivel de mercado)

Una instancia de estrategia ve **todos** los instrumentos aceptados, cada uno con su propio grupo
de indicadores. Para calcular algo _entre_ instrumentos (un percentil de todo el mercado, un
ranking de fuerza relativa, una señal de cesta), sobrescribe `update(Ticker)`, llama primero a
`super.update(ticker)` para que el motor avance los indicadores del instrumento que disparó el
evento, y luego lee los indicadores de cualquier instrumento:

```java
@Override
public void update(Ticker ticker) {
    super.update(ticker);                       // engine updates THIS instrument's group
    Instrument ins = ticker.instrument();

    double z = getRTIndicator(ins, "closeZScore")     // this instrument's own indicator
        .map(RTIndicator::getValue).orElse(Double.NaN);

    List<Double> prices = new ArrayList<>();          // read across all tracked instruments
    for (Instrument other : getInstruments()) {
        getRTIndicator(other, "price")
            .filter(RTIndicator::isReady)
            .ifPresent(ind -> prices.add(ind.getValue()));
    }
    // ... compute a market-wide stat from `prices`, then emitSignal(...)
}
```

Helpers de `AbstractTickerStrategy`:

- `getInstruments()` — el conjunto de instrumentos que la estrategia está rastreando.
- `getRTIndicator(instrument, name)` → `Optional<RTIndicator>` — el indicador con ese nombre de
  cualquier instrumento (solo lectura, sin re-actualizar).
- Llama siempre a `super.update(ticker)` **primero** — omítelo y los indicadores nunca avanzan.
