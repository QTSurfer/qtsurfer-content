---
title: Indicadores en Java
description: Configura, compón y amplía el pipeline de indicadores en tiempo real de QTSurfer.
order: 2
lastUpdated: '2026-09-04T10:18:11Z'
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: d0fc9b6b50458ffb46ad07ee472b226d24f31c68
upstreamPath: skills/qtsurfer-java-strategy/references/indicators.md
---

Todos los métodos de abajo están en `InstrumentGroupRTIndicator` y devuelven `this` para
encadenar. El nombre por defecto de un indicador (cuando se omite `name`) es el nombre del método
más los parámetros, por ejemplo `rsi14`.

## Fuentes de precio

```java
.addPrice()                            // close price → "price"
.add("bid",  TickerValueSource.Bid)
.add("ask",  TickerValueSource.Ask)
.add("vol",  TickerValueSource.Volume)
// TickerValueSource: Bid, BidSize, Ask, AskSize, Open, High, Low, Close,
//                   Vwap, Volume, VolumeQuote, PercentChange, AutoAskClose
```

## Medias móviles

```java
.sma(20)                               // 20-period SMA → "sma20"
.sma("s20", 20)                        // custom name
.sma("s20", 20, false)                 // continuous mode (default: discrete)
.sma("s20", "rsi14", 20)              // SMA of another indicator
.ema(9)                                // 9-period EMA → "ema9"
.ema("fast", 9)
.ema("fast", "vol", 9)                // EMA of volume
```

## Osciladores y momento

```java
.rsi(14)                               // Cutler's RSI → "rsi14"
.rsi(14, false)                        // Wilder's smoothing
.rsi("myRsi", 14, true)

.bollinger("bb", 20, 2.0)             // → "bb", "bbUpper", "bbLower"
.bollingerBandwidth("bb")             // % width of a Bollinger band
```

## Tasa de cambio y distancia

```java
.percentChange("price")                // % change tick-over-tick
.rateChange("price")                   // absolute rate of change
.rateChange("rc", "price", true)      // percent=true
.distanceMa("ema9")                   // % distance from MA
.distance("gap", "ema9", "ema21")     // % distance between two indicators
```

## Ganancia / pérdida / extremos

```java
.gain("price")                         // consecutive gain periods
.loss("price")                         // consecutive loss periods
.gain("g", "price", false)            // resetPeriodsOnSustain=false
.max("price")                          // running max
.min("price")                          // running min
.sum("vol")                            // running sum
```

## Aritmética

```java
.add("spread", "ask", "bid")          // spread = ask + bid
.diff("spread", "ask", "bid")         // diff = ask - bid
.mul("price", 0.01)                   // scale by coefficient
.mul("ratio", "vol", "price")         // vol * price
.fun("custom", "a", "b", (a, b) -> a / b)  // arbitrary BiFunction
```

## Predicados y condicionales

```java
.lessThan("oversold", "rsi14", 30)    // boolean: rsi14 < 30
.greatThan("overbought", "rsi14", 70)
.greatOrEqual("ge", "price", 50000)
.lessOrEqual("le", "price", 50000)
.equal("eq", "price", 100)
.notEqual("ne", "price", 100)
.predicate("custom", "price", v -> v > 0 && v < 100)
.periodCount("cnt", "oversold", v -> v > 0)  // count consecutive true periods
```

## Selección condicional

```java
// If indicator == coef → thenIndicator else elseIndicator
.equal("selected", "signal", 1, "emaFast", "emaSlow")
.conditional("out", "flag", ind -> ind.getValue() > 0, thenInd, elseInd)
```

## Transformaciones

```java
.clamp("price", 0.0, 100.0)          // clamp to [min, max]
.clamp("price", v -> v < 0, 0.0)     // clamp when predicate true
.round("price", 2)                    // round to N decimals
.decorate("price", "price", ind -> new MyWrapper(ind))
```

## Window listeners

```java
.window("ema9", WindowTime.s1, listener)     // fire every 1 s
.window("ema9", Duration.ofSeconds(15), l)   // custom duration
.window()                                     // builder pattern
    .windowTime(WindowTime.m5)
    .indicator("rsi14")
    .listener(myListener)
    .build()
```

## Composición de indicadores (acceso de solo lectura)

Al construir un indicador personalizado que referencia a otro, usa una vista de solo lectura para
evitar mutar el estado compartido. Dos enfoques equivalentes:

```java
// Option A — .ro() on any RTIndicator instance (default method on RTIndicator)
RTIndicator src = indicators.getExisting("ema9").ro();
indicators.add("custom", new MyIndicator(src));

// Option B — getReadOnlyExisting() on the indicator group
RTIndicator src = indicators.getReadOnlyExisting("ema9");
indicators.add("custom", new MyIndicator(src));

// Option C — getReadOnly() returns Optional (safe if indicator may not exist)
indicators.getReadOnly("ema9").ifPresent(src ->
    indicators.add("custom", new MyIndicator(src)));
```

`.ro()` es un método por defecto del propio `RTIndicator` — disponible en cualquier instancia de
indicador sin pasar por el grupo. Úsalo cuando ya tienes una referencia al objeto indicador.

## Catálogo de indicadores avanzado (estadística y pro)

Más allá de los métodos del builder fluido de arriba, el motor incluye unas 150 clases de
indicadores en dos niveles, un subpaquete por categoría: `com.wualabs.qtsurfer.engine.indicators.<category>`
para el nivel **gratuito** (`averages`, `momentum`, `distance`, `bollinger`, `statistics`, …) y
`com.wualabs.qtsurfer.engine.indicators.<category>.pro` para el nivel **de pago, privado en el
servidor** (`averages.pro`, `trend.pro`, `momentum.pro`, `volatility.pro`, `volume.pro`,
`statistics.pro`, …) — el segmento de paquete `pro` es siempre la marca del nivel de pago. Las
clases pro no se distribuyen en el port OSS/TypeScript del motor. Son instancias `RTIndicator`
normales — añade cualquiera de ellas por clase con `.add("name", new XxxRTIndicator(...))`, y
léelas con `indicators.getValue("name")`:

```java
import com.wualabs.qtsurfer.engine.indicators.statistics.StandardDeviationRTIndicator;
import com.wualabs.qtsurfer.engine.indicators.statistics.pro.ZScoreRTIndicator;

indicators
    .addPrice()                                                      // "price"
    .sma("mean", 20)
    .add("std",    new StandardDeviationRTIndicator(20))             // ctor (int periods)
    .add("stdOf",  new StandardDeviationRTIndicator(                 // ctor (RTIndicator, int periods)
            indicators.getReadOnlyExisting("mean"), 20))
    .add("zscore", new ZScoreRTIndicator(/* see class for ctor */));
```

Los constructores varían según la clase — la mayoría acepta `(int periods)` y/o `(RTIndicator
source, int periods)`; algunos (construidos con lombok) difieren, así que consulta la clase.
Clases útiles por categoría — Tendencia, Volumen y los ratios de rendimiento son **solo pro hoy**,
el nivel gratuito todavía no tiene ningún indicador en esas categorías:

| Categoría             | Nivel     | Clases `*RTIndicator`                                                                                                                                                                      |
| ---------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Medias móviles         | Gratuito  | `Sma`, `Ema`, `Wma`, `Hma`, `Kama`, `Tema`, `Mma`                                                                                                                                           |
| Medias móviles         | Pro       | `Alma`, `Dema`, `Frama`, `LeastSquaresMovingAverage`, `McGinleyDynamic`, `Smma`, `Wma` (gemela O(1)), `Envelopes`                                                                          |
| Estadística            | Gratuito  | `StandardDeviation`, `Variance`                                                                                                                                                             |
| Estadística            | Pro       | `StandardDeviation`, `Variance` (gemelas O(1)), `ZScore`, `Skewness`, `Kurtosis`, `RollingPercentile`, `Correlation`, `Covariance`, `Beta`, `LinearRegressionSlope`, `SimpleLinearRegression` |
| Tendencia              | Solo pro  | `Adx`, `Aroon`, `SuperTrend`, `ParabolicSar`, `Ichimoku`, `DonchianChannel`, `EfficiencyRatio`                                                                                              |
| Volatilidad            | Gratuito  | `VolatilityRTIndicator`, `PercentVolatilityRTIndicator`                                                                                                                                     |
| Volatilidad            | Pro       | `Atr`, `Natr`, `RealizedVolatility`, `Parkinson`, `GarmanKlass`, `EwmaVolatility`                                                                                                           |
| Volumen                | Solo pro  | `Vwap`, `Obv`, `Mfi`, `Cmf`, `Adl`, `ElderForceIndex`                                                                                                                                       |
| Osciladores            | Gratuito  | `Macd`, `StochasticRsi`, `Cci`                                                                                                                                                              |
| Osciladores            | Pro       | `StochasticOscillator`, `Roc`, `Momentum`, `WilliamsR`, `UltimateOscillator`                                                                                                                |
| Ratios (rendimiento)   | Solo pro  | `SharpeRatio`, `SortinoRatio`, `CalmarRatio`, `MaxDrawdown`, `OmegaRatio`, `UlcerIndex`                                                                                                     |

Compón estas clases alimentando la vista de solo lectura de un indicador al constructor
`(RTIndicator, …)` de otro (por ejemplo, un `ZScore` de una `Sma`). Así se hacen estadísticas
móviles o agregaciones **sin reinventar la rueda** en `update()`.

## Escribir un `RTIndicator` personalizado

Cuando ningún indicador integrado encaja, implementa la interfaz `RTIndicator`
(`com.wualabs.qtsurfer.engine.indicators.core.RTIndicator`) — o extiende `AbstractRTIndicator`
para el andamiaje común:

```java
import com.wualabs.qtsurfer.engine.indicators.core.RTIndicator;

public class MyIndicator implements RTIndicator {
    private double value;
    private boolean ready;

    @Override public double getValue() { return value; }

    @Override public double update(double newValue) {     // called once per tick with the source value
        this.value = /* compute incrementally from newValue */ newValue;
        this.ready = true;
        return value;
    }

    @Override public boolean isReady() { return ready; }  // gate warmup (default true)

    @Override public void reset() { value = 0; ready = false; }  // from Resettable
}
```

Regístralo como cualquier indicador integrado: `indicators.add("myInd", new MyIndicator())`. La
interfaz es pequeña: `getValue()` (salida actual), `update(double)` (incremental, por tick),
`isReady()` (puerta de calentamiento, por defecto `true`), `reset()`. `update(Number)` /
`update(RTIndicator)` y `ro()` (vista de solo lectura) vienen como métodos por defecto, gratis.

### Indicadores enriquecidos (acceso al snapshot completo)

Los indicadores escalares reciben un único `double` (un campo, extraído vía
`TickerValueSource`). Cuando un indicador necesita **más de un campo** — OHLC para el ATR,
volumen+precio para VWAP/OBV, bid/ask para microestructura — implementa
`RichRTIndicator<T extends MarketSnapshot>` en su lugar y lee el snapshot completo:

```java
import com.wualabs.qtsurfer.engine.indicators.core.RichRTIndicator;
import com.wualabs.qtsurfer.engine.core.MarketSnapshot;

public class MyOhlcIndicator implements RichRTIndicator<MarketSnapshot> {
    private double value;
    @Override public double updateFrom(MarketSnapshot snap) {  // full snapshot: O/H/L/C/V, bid/ask
        this.value = /* combine several fields */ 0;
        return value;
    }
    @Override public double getValue() { return value; }
    @Override public double update(double v) { return value; }  // scalar path unused
    @Override public void reset() { value = 0; }
}
```

El motor construye el snapshot una vez por tick y lo despacha a cada `RichRTIndicator`
registrado, mientras los indicadores escalares siguen recibiendo su campo extraído. Se registra
igual: `indicators.add("myOhlc", new MyOhlcIndicator())`.

## Indicadores ocultos

Prefíjalos con `_` para excluirlos de los metadatos de reporte de señales:

```java
.gain("_rawGain", "price")   // internal use, not reported
```

Es azúcar sintáctico sobre la entrada de metadatos `VISIBILITY` — ver más abajo.

## Metadatos de indicador

Todo indicador lleva pequeños metadatos descriptivos clave/valor sobre sí mismo, separados de su
nombre de búsqueda registrado, legibles desde cualquier instancia de `RTIndicator` (por ejemplo,
vía `indicators.getExisting("name")` / `getReadOnlyExisting("name")`):

```java
RTIndicator ind = indicators.getExisting("gap");
ind.getId();                     // canonical type id, e.g. "distance", "bollinger", "rsi"
ind.getDisplayHint();            // DisplayHint: ABSOLUTE (default), PERCENT, or VOLUME
ind.isHidden();                  // true if internal-only (the "_" prefix above sets this)
ind.getMeta().get("periods");    // any other descriptive key, or null if unset
```

Útil para introspección sin analizar el nombre como cadena de texto — por ejemplo, comprobar
`getDisplayHint() == DisplayHint.PERCENT` antes de formatear un valor para mostrarlo, o `getId()`
para bifurcar de forma genérica según qué indicador esté registrado bajo un nombre. `distance()`
/ `percentChange()` / `distanceMa()` fijan `PERCENT` automáticamente; la mayoría del resto de
indicadores no lleva metadatos — `getMeta()` devuelve el `IndicatorMeta.EMPTY` compartido, nunca
`null`.

Para adjuntar metadatos a un indicador **personalizado** (consulta [Escribir un RTIndicator
personalizado](#escribir-un-rtindicator-personalizado)), extiende `AbstractRTIndicator` y usa sus
setters fluidos en el registro:

```java
import com.wualabs.qtsurfer.engine.indicators.core.AbstractRTIndicator;
import com.wualabs.qtsurfer.engine.indicators.core.IndicatorMeta;
import com.wualabs.qtsurfer.engine.indicators.core.DisplayHint;

indicators.add("gap",
    new MyDistanceIndicator(a, b)
        .withMeta(IndicatorMeta.ID, "distance")
        .withMeta("periods", 20)
        .withDisplayHint(DisplayHint.PERCENT));
```

Los metadatos son un **descriptor de solo escritura** — un indicador nunca debe leer sus propios
metadatos para dirigir su cálculo, eso lo convertiría en un segundo canal de configuración no
declarado. Fíjalos una sola vez al registrar; léelos solo desde fuera.
