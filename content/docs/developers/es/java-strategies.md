---
title: Estrategias en Java
description: Construye estrategias QTSurfer con indicadores, window listeners, estado y señales.
order: 1
lastUpdated: '2026-08-18T18:44:33Z'
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: d0fc9b6b50458ffb46ad07ee472b226d24f31c68
upstreamPath: skills/qtsurfer-java-strategy/SKILL.md
---

Una estrategia de QTSurfer es una clase Java sencilla (sin anotaciones de framework) que extiende
una clase base de estrategia — la más habitual es `AbstractTickerStrategy` (consulta [Clases base
de estrategia](#clases-base-de-estrategia) para las variantes de kline, funding rate y multi-fuente).
Recibe datos de mercado en tiempo real, configura indicadores técnicos y emite señales de compra o
venta. El motor compila las estrategias en el servidor — no hace falta ninguna herramienta local.

## Plantilla mínima

```java
import com.wualabs.qtsurfer.engine.indicators.helpers.group.InstrumentGroupRTIndicator;
import com.wualabs.qtsurfer.engine.strategy.AbstractTickerStrategy;

public class MyStrategy extends AbstractTickerStrategy {

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        // configure indicators here — called once per instrument on first tick
    }
}
```

`acceptInstrument` y `getExecutionMode` tienen valores por defecto razonables (aceptar todos los
instrumentos, modo LONG). Sobrescríbelos solo si lo necesitas:

```java
import com.wualabs.qtsurfer.engine.core.Instrument;
import com.wualabs.qtsurfer.engine.strategy.execution.ExecutionMode;

@Override
public boolean acceptInstrument(Instrument instrument) {
    return instrument.base().equals("BTC"); // filter instruments here if needed
}

@Override
public ExecutionMode getExecutionMode(Instrument instrument) {
    return ExecutionMode.LONG; // LONG, SHORT, or LONG_MULTI
}
```

> Nota: el `acceptInstrument` **por defecto** _no_ es incondicional — filtra según la moneda de
> salida de la estrategia / `acceptCurrency`. Para aceptar **todos** los instrumentos sin
> condición, sobrescríbelo explícitamente devolviendo `true`.

## Configuración de indicadores

Todos los indicadores se definen en `setupIndicators` mediante el builder fluido de
`InstrumentGroupRTIndicator`. Los métodos devuelven `this` para encadenar llamadas.

```java
@Override
protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
    indicators
        .addPrice()                     // source: close price
        .ema("emaFast", 9)             // 9-period EMA named "emaFast"
        .ema("emaSlow", 21)            // 21-period EMA named "emaSlow"
        .rsi(14)                        // 14-period RSI named "rsi14"
        .bollinger("bb", 20, 2.0)      // Bollinger Bands → "bb", "bbUpper", "bbLower"
        .window("emaFast", WindowTime.s1, new MyListener(this, indicators));
}
```

Consulta [el catálogo de indicadores](/docs/developers/java-indicators) para verlo completo.

### Valores de `WindowTime`

`WindowTime.s1`, `s5`, `s10`, `s30`, `m1`, `m3`, `m5`
Personalizado: `Duration.ofSeconds(n)` o `Duration.ofMinutes(n)`

### Leer valores de indicadores fuera de un listener

```java
import com.wualabs.qtsurfer.engine.core.Instrument;
import com.wualabs.qtsurfer.engine.core.Ticker;

@Override
public void update(Ticker ticker) {
    Instrument instrument = ticker.instrument();
    updateInstrument(instrument, ticker.timestamp());
    var ind = updateIndicators(instrument, ticker);

    if (!ind.getExisting("emaSlow").isReady()) return; // wait for warmup

    double fast = ind.getValue("emaFast");
    double slow = ind.getValue("emaSlow");

    if (fast > slow) emitBuy(ticker.last());
    else             emitSell(ticker.last());
}
```

`Ticker` es un record del motor — lee sus campos con métodos de acceso: `ticker.last()`,
`ticker.bid()`, `ticker.ask()`, `ticker.instrument()`, `ticker.timestamp()`.

## Patrón de window listener (recomendado)

Los listeners se disparan una vez por ventana de tiempo en lugar de en cada tick. Prefiérelo frente
a `update()` en estrategias que reaccionan al cierre de una barra.

```java
import com.wualabs.qtsurfer.engine.strategy.AbstractWindowListener;
import com.wualabs.qtsurfer.engine.core.state.StateStore;
import com.wualabs.qtsurfer.engine.indicators.helpers.WindowTimeRTIndicator.WindowTime;

public class MyStrategy extends AbstractTickerStrategy {

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators
            .addPrice()
            .rsi(14)
            .window("rsi14", WindowTime.m1, new SignalListener(this, indicators));
    }

    private class SignalListener extends AbstractWindowListener {

        public SignalListener(AbstractTickerStrategy strategy,
                              InstrumentGroupRTIndicator indicators) {
            super(strategy, indicators);
        }

        @Override
        public void onChange(StateStore store, double prev, double actual) {
            long count = store.inc("bars");

            if (actual < 30) emitBuy(indicators.getValue("price"));
            if (actual > 70) emitSell(indicators.getValue("price"));
        }
    }
}
```

`AbstractWindowListener` te da:

- `emitBuy(price)` / `emitSell(price)` / `emitSignal(signal)`
- `getPrevInstant()` / `getCurrInstant()` — cuándo se abrió / cerró la ventana que acaba de dispararse
- `getEngineVersion()` / `getEngineVersionMajor()` / `getEngineVersionMinor()` — la versión del
  motor en ejecución (consulta [Versión del motor](#versión-del-motor))
- `this.instrument` — instrumento actual
- `this.indicators` — grupo de indicadores

La detección de cruces es un helper independiente, no un método del listener — consulta el
[helper de detección de cruces](#helper-de-detección-de-cruces) más abajo.

`store` llega como primer parámetro de `onChange` — ya resuelto, sin nada que inicializar. Es el
mismo store que comparten todos los listeners de este instrumento (consulta [Gestión de
estado](#gestión-de-estado) más abajo); `getPrevInstant()`/`getCurrInstant()` solo se resuelven
cuando el listener está registrado en una ventana (mediante `.window(...)`, como arriba) — llamarlos
en un listener enganchado a un indicador simple lanza una excepción.

## Gestión de estado

`StateStore` es por instrumento y lo comparten todos los listeners del grupo de indicadores de ese
instrumento (un único store, no uno por ventana). Se crea de forma perezosa — una ventana que nadie
escucha nunca lo toca. Dentro de un window listener llega como primer parámetro de `onChange`; fuera
de un listener (por ejemplo en `update()`) accede a él con `getStateStore(instrument)`, que devuelve
`Optional<StateStore>`:

```java
@Override
public void update(Ticker ticker) {
    Instrument instrument = ticker.instrument();
    updateInstrument(instrument, ticker.timestamp());
    var ind = updateIndicators(instrument, ticker);

    StateStore store = getStateStore(instrument).orElseThrow();
    long ticks = store.inc("ticks");
    // ...
}
```

`getStateStore(instrument)` se hereda de la clase base de estrategia — siempre presente (nunca
`Optional.empty()`) para las clases base documentadas, así que `.orElseThrow()` es seguro; es
`Optional` porque el contrato subyacente de `Strategy` permite que una implementación no soporte
estado por instrumento en absoluto. Llamarlo, a diferencia del acceso al store propio de una
ventana, resuelve el store de inmediato — no espera a un listener.

```java
store.inc("count")          // int counter, returns new value
store.dec("count")
store.set("inPosition")     // boolean flag → true
store.unset("inPosition")   // → false
store.is("inPosition")      // read boolean
store.add("pnl", delta)     // double accumulator, returns new value
store.setState("key", obj)  // arbitrary object
store.getState("key", def)  // with default
```

## Propiedades configurables

```java
@StrategyProperty(name = "rsi.period", description = "RSI period", defaultValue = "14")
private int rsiPeriod = 14;

@StrategyProperty(name = "ema.fast", description = "Fast EMA period", defaultValue = "9")
private int fastPeriod = 9;
```

Las propiedades se inyectan antes de que se llame a `setupIndicators`.

## Emisión de señales

| Método                | Cuándo usarlo                                                    |
| --------------------- | ----------------------------------------------------------------- |
| `emitBuy(price)`     | Entrar en largo                                                   |
| `emitSell(price)`    | Entrar en corto / cerrar el largo                                 |
| `emitSignal(signal)` | Señal personalizada (`BuySignal`, `SellSignal`, `InfoStrategySignal`) |

### Señales de datos / analítica — `InfoStrategySignal`

Para estrategias que no operan y que emiten **campos calculados** (analítica, métricas) en lugar de
compra/venta, construye un `InfoStrategySignal`, adjúntale pares clave/valor arbitrarios y
llama a `emitSignal`:

```java
InfoStrategySignal signal = createInfoStrategySignal(instrument);  // from AbstractTickerStrategy
signal.set("interval", "1m");
signal.set("zscore", z);
signal.set("vwap", vwap);
emitSignal(signal);
```

Los suscriptores leen los campos con `signal.get("key")` / `signal.has("key")` y
`signal.getInstrument()`. Prefija el nombre de un campo con `_` para que quede fuera de los
metadatos de reporte.

## Helper de detección de cruces

```java
import com.wualabs.qtsurfer.engine.strategy.CrossDetector;

private final CrossDetector fastSlowCross = new CrossDetector(); // one instance per pair watched

// In onChange or update:
CrossDetector.Cross cross = fastSlowCross.check(fast, slow);
if (cross.above()) emitBuy(price);
if (cross.below()) emitSell(price);
```

Una única llamada a `check(left, right)` informa de ambas direcciones a la vez, de modo que siempre
describen el mismo tick.

## Compilar y enviar

Usa un [SDK oficial o cliente de API](/docs/developers/clients-and-sdks) para integrarlo en tu
aplicación. El flujo de MCP también está disponible para backtests asistidos por un agente.

### Enviar vía MCP

Descarga el servidor MCP desde [las releases de QTSurfer/mcp-java](https://github.com/QTSurfer/mcp-java/releases/latest)
(binario nativo o fat JAR) y configúralo en tu agente. Una vez conectado:

1. Usa `list_exchanges` → `list_instruments` para elegir un exchange e instrumento válidos.
2. Llama a `submit_backtest` con `strategyCode` = el código fuente Java completo de tu clase de estrategia.
3. Sondea `get_job_status` hasta `COMPLETED` y lee los resultados.

El motor compila la estrategia en el servidor — solo se envía el fuente `.java`.

## Clases base de estrategia

Toda estrategia extiende una clase base del motor, elegida según la fuente de datos que consume.
Las tres clases base de una sola fuente extienden `AbstractSubscriptionStrategy<T>` y comparten el
**mismo modelo** que documenta esta skill (constructor de indicadores, window listeners,
`StateStore`, emisión de señales) — solo cambia el payload de `update(...)`. Los ejemplos de aquí
usan `Ticker`, la fuente más habitual. Los tipos viven en `com.wualabs.qtsurfer.engine.core`.

| Clase base                    | Fuente                        | Manejador                                | Vía `submit_backtest`           |
| ----------------------------- | ----------------------------- | ----------------------------------------- | -------------------------------- |
| `AbstractTickerStrategy`      | `Ticker` (record)            | `update(Ticker)`                         | ✅ principal, totalmente documentada |
| `AbstractKlineStrategy`       | `Kline` (clase)               | `update(Kline)`                          | ✅                                |
| `AbstractFundingRateStrategy` | `FundingRate` (record)       | `update(FundingRate)`                    | ✅                                |
| `AbstractMultiSourceStrategy` | Ticker + Kline + FundingRate | `onTicker` / `onKline` / `onFundingRate` | ⚠️ solo motor — aún no pública    |

- **`AbstractKlineStrategy`** se suscribe a velas del `getInterval()` (un `KlineInterval`). **Solo
  OHLCV** — los campos de tamaño del libro de órdenes, vwap y cambio porcentual no están disponibles
  en esta vía. `Kline` es una clase simple, así que usa getters (`kline.getInstrument()`,
  `kline.getCloseTime()`), a diferencia del record `Ticker`.
- **`AbstractFundingRateStrategy`** recibe `update(FundingRate)` en cada actualización de la tasa
  de financiación.
- **`AbstractMultiSourceStrategy`** declara `getRequiredSources()` → `Set<MarketDataSource>`
  (`Ticker`, `KLine`, `FundingRate`) y despacha cada una a `onTicker` / `onKline` / `onFundingRate`;
  cuando se requiere `KLine`, `getKlineInterval()` no puede ser nulo. Compila y se registra en el
  motor, pero **todavía no se puede ejecutar vía el `submit_backtest` público** — no publiques
  estrategias multi-fuente para backtest hasta que esté disponible.

## Estrategias entre instrumentos (a nivel de mercado)

Una instancia de estrategia ve **todos** los instrumentos aceptados, cada uno con su propio grupo
de indicadores. Para calcular algo _entre_ instrumentos (un percentil de todo el mercado, un
ranking de fuerza relativa, una señal de cesta), sobrescribe `update(Ticker)` y lee los indicadores
de otros instrumentos con `getInstruments()` / `getRTIndicator(...)`. Consulta [patrones de
estrategia](/docs/developers/strategy-patterns) → «Estrategias entre instrumentos (a nivel de
mercado)».

## Versión del motor

Hay tres accesores disponibles sin necesidad de importar nada, tanto en la estrategia como dentro
de un window listener:

```java
@Override
public void update(Ticker ticker) {
    log.info("running on engine {}", getEngineVersion());  // e.g. "1.0.81"

    if (getEngineVersionMajor() >= 1) { /* ... */ }        // also getEngineVersionMinor()
}
```

El valor se lee de los propios metadatos del jar del motor cargado, así que informa del motor que
realmente está en ejecución y no del que estaba vigente cuando se compiló la estrategia. Nada de
esto lanza excepciones — cuando la versión no puede determinarse, `getEngineVersion()` devuelve
`EngineVersion.UNKNOWN` (`"unknown"`) y los accesores numéricos devuelven
`EngineVersion.UNKNOWN_COMPONENT` (`-1`), así que son seguros de llamar sin comprobación previa y
una puerta de versión falla cerrada en lugar de coincidir por accidente. La versión mayor y la
menor se resuelven juntas: comprueba una y puedes confiar en la otra.

Para el componente de parche, importa la clase del motor — deliberadamente no está reflejada en el
azúcar sintáctico:

```java
import com.wualabs.qtsurfer.engine.EngineVersion;

int patch = EngineVersion.getPatch();  // 81
```

Merece la pena emitirla (en un `InfoStrategySignal`, o registrarla en el primer tick) en
estrategias que se almacenan y se vuelven a ejecutar más tarde: las API del motor sí cambian entre
versiones, y una estrategia guardada que de repente se comporta mal es mucho más fácil de
diagnosticar cuando el motor sobre el que corrió queda registrado junto al resultado.

## Errores habituales

- **Olvidar comprobar `isReady()`** — los indicadores necesitan periodos de calentamiento.
  Compruébalo siempre antes de leer valores.
- **Mutar indicadores en `update()`** — usa `getReadOnlyExisting()` en lugar de `getExisting()`
  para evitar cambios accidentales de estado.
- **Un `setupIndicators` por clase de estrategia** — se llama una vez por instrumento, no por tick.
- **Clase interna frente a lambda para listeners** — `AbstractWindowListener` da acceso a helpers;
  prefiere una clase interna frente a una lambda cruda.
- **Usar getters de JavaBean sobre `Ticker`** — `Ticker` es un record; usa `ticker.last()` en lugar
  de `ticker.getLast()`, `ticker.instrument()` en lugar de `ticker.getInstrument()`,
  `ticker.timestamp()` en lugar de `ticker.getTimestamp().getTime()`.
