---
title: Patrones de estrategia
description: Aplica filtros, salidas, transiciones de estado y cálculos a nivel de mercado reutilizables.
order: 3
lastUpdated: '2026-09-16T18:33:01Z'
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: 47cc75d5b0a11695ac0f8b5e80513780a3f671b8
upstreamPath: skills/qtsurfer-java-strategy/references/patterns.md
---

Patrones probados extraídos de estrategias en producción y de backtests heredados.

## Cadena de filtrado de ruido

El patrón de procesamiento de señal más sofisticado del código base. Convierte un indicador crudo
en una señal limpia y suavizada:

```
señal cruda
  → clamp(±umbral → 0)              suprime micro-ruido
    → percentChange                 convierte a tasa de cambio
      → conditional(≠0, EMA(n))     solo alimenta la EMA con cambios distintos de cero
```

```java
indicators
    .add("cruda", TickerValueSource.Close)
    .distance("distemas", "ema60", "ema500")
    .clamp("distemas", v -> Math.abs(v) <= 0.1, 0.0)
    .percentChange("cambioDistemas")
    .conditional("suaveDistemas", "cambioDistemas", v -> v != 0,
        indicators.getReadOnlyExisting("ema500"), zeroIndicator)
    .window("suaveDistemas", WindowTime.s1, new DetectorListener(this, indicators));
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
    .distance("distCorta", "ema60", "ema500")   // momento a corto plazo
    .distance("distLarga", "ema500", "ema2500") // tendencia a medio plazo
    .gain("rachaLarga", "ema7500");               // tendencia alcista macro
```

**Puerta de entrada:** `distLarga >= 0,35` Y `distCorta` en subida Y racha macro >= 300.

---

## Variantes de salida con trailing

### Trailing al punto medio (probado en producción, ~7 % de media)

```java
// En onChange:
double pctGanancia = (precio - precioCompra) / precioCompra * 100;
if (pctGanancia > pctGananciaMax) pctGananciaMax = pctGanancia;
double disparador = pctGananciaMax - (pctGananciaMax - pctGananciaMin) / 2;
if (pctGanancia > pctGananciaMin && pctGanancia <= disparador) {
    emitSell(precio);
}
```

Vende cuando la ganancia retrocede hasta el punto medio entre el umbral mínimo y la ganancia
máxima. Se autocalibra a la magnitud del movimiento.

### Trailing al pico

```java
// En onChange:
if (precio > precioMax) precioMax = precio;
double caidaDesdePico = (precioMax - precio) / precioMax * 100;
if (caidaDesdePico >= 1.0) emitSell(precio); // caída del 1% desde el pico
```

Más simple. Bueno para operaciones rápidas de scalping.

### Reinicio por ganancia de EMA

```java
// En onChange:
if (gananciaEmaSalida.getPeriodCount() == 0) emitSell(precio);
```

Vende cuando la EMA de salida deja de subir (el momento se ha agotado). Requiere un
`GainRTIndicator` que envuelva la EMA de salida.

---

## Stop-loss condicional

Un stop-loss consciente del macro contexto que evita saltar durante caídas saludables:

```java
// En onChange:
double pctGanancia = (precio - precioCompra) / precioCompra * 100;
if (pctGanancia < 0
        && Math.abs(pctGanancia) >= 0.5            // pérdida > 0.5%
        && distLarga < 0.01) {                     // tendencia macro debilitándose
    emitSell(precio);
    store.set("fallido");
}
```

Solo se activa cuando el contexto macro también es débil. Reduce los stops en falso en mercados
volátiles pero con tendencia de fondo.

---

## Protección de reentrada (estado `"fallido"`)

Bloquea nuevas entradas tras una operación perdedora hasta que el contexto macro se reinicie por
completo:

```java
// Listener de entrada:
if (store.is("fallido")) return;  // bloquea hasta que se reinicie el macro
// ...condiciones de entrada...

// Comprobación de reinicio macro aparte (en otra ventana o update):
if (store.is("fallido") && emaLargaValor < emaMuyLargaValor) {
    store.unset("fallido");
}
```

Evita el revenge trading tras un stop-loss. La condición de reinicio (`emaLargaValor < emaMuyLargaValor`)
asegura que se complete un ciclo macro entero antes de permitir la reentrada.

---

## Actividad de instrumento basada en OPS

Rastrea las operaciones por segundo de cada instrumento para identificar monedas dormidas que
despiertan:

```java
// En update():
long now = System.currentTimeMillis();
long currentOps = opsCounter.incrementAndGet();
if (now - lastOpsWindow > 1000) {
    double ops = (double) currentOps / ((now - lastOpsWindow) / 1000.0);
    lastOps = ops;
    lastOpsWindow = now;
    opsCounter.set(0);
}
// ops bajas + pico repentino = candidata a pump
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
| S3         | Racha de EMA muy larga >= 300  | Distancia en subida 10+ ticks     | Distancia >= 0,35 %     |

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

// EntryListener.onChange(StateStore store, ...) { store.set("enPosicion"); ... }
// ExitListener.onChange(StateStore store, ...)  { if (store.is("enPosicion")) ... }
```

---

## Puerta de volatilidad

Evita entradas durante periodos de baja actividad:

```java
indicators
    .addPrice()
    .add("vlts", new VolatilityRTIndicator(smaPeriods).clampUpdates(warmupPeriods))
    // ...otros indicadores...

// En el listener de entrada:
double volatilidad = indicators.getValue("vlts");
if (volatilidad < 50.0) return; // mercado sin actividad suficiente
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
    super.update(ticker);                       // el motor actualiza el grupo de ESTE instrumento
    Instrument instr = ticker.instrument();

    double z = getRTIndicator(instr, "zScoreCierre")  // indicador propio de este instrumento
        .map(RTIndicator::getValue).orElse(Double.NaN);

    List<Double> precios = new ArrayList<>();         // lee entre todos los instrumentos rastreados
    for (Instrument otro : getInstruments()) {
        getRTIndicator(otro, "price")
            .filter(RTIndicator::isReady)
            .ifPresent(ind -> precios.add(ind.getValue()));
    }
    // ... calcula una estadística de todo el mercado a partir de `precios`, luego emitSignal(...)
}
```

Helpers de `AbstractTickerStrategy`:

- `getInstruments()` — el conjunto de instrumentos que la estrategia está rastreando.
- `getRTIndicator(instrument, name)` → `Optional<RTIndicator>` — el indicador con ese nombre de
  cualquier instrumento (solo lectura, sin re-actualizar).
- Llama siempre a `super.update(ticker)` **primero** — omítelo y los indicadores nunca avanzan.
