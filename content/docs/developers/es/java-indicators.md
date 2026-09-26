---
title: Indicadores en Java
description: Configura, compón y amplía el pipeline de indicadores en tiempo real de QTSurfer.
order: 2
lastUpdated: '2026-09-17T23:06:52Z'
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: f19882e308b405b3bf2443d4e7f9eb81c3b826a1
upstreamPath: skills/qtsurfer-java-strategy/references/indicators.md
---

Todos los métodos de abajo están en `InstrumentGroupRTIndicator` y devuelven `this` para
encadenar. El nombre por defecto de un indicador (cuando se omite `name`) es el nombre del método
más los parámetros, por ejemplo `rsi14`.

## Fuentes de precio

```java
.addPrice()                            // precio de cierre → "price"
.add("bid",  TickerValueSource.Bid)
.add("ask",  TickerValueSource.Ask)
.add("vol",  TickerValueSource.Volume)
// TickerValueSource: Bid, BidSize, Ask, AskSize, Open, High, Low, Close,
//                   Vwap, Volume, VolumeQuote, PercentChange, AutoAskClose
```

## Medias móviles

```java
.sma(20)                               // SMA de 20 periodos → "sma20"
.sma("s20", 20)                        // nombre personalizado
.sma("s20", 20, false)                 // modo continuo (por defecto: discreto)
.sma("s20", "rsi14", 20)              // SMA de otro indicador
.ema(9)                                // EMA de 9 periodos → "ema9"
.ema("rapida", 9)
.ema("rapida", "vol", 9)              // EMA del volumen
```

## Osciladores y momento

```java
.rsi(14)                               // RSI de Cutler → "rsi14"
.rsi(14, false)                        // suavizado de Wilder
.rsi("miRsi", 14, true)

.bollinger("bb", 20, 2.0)             // → "bb", "bbUpper", "bbLower"
.bollingerBandwidth("bb")             // % de anchura de una banda de Bollinger
```

## Tasa de cambio y distancia

```java
.percentChange("price")                // % de cambio tick a tick
.rateChange("price")                   // tasa de cambio absoluta
.rateChange("rc", "price", true)      // percent=true
.distanceMa("ema9")                   // % de distancia respecto a la MA
.distance("gap", "ema9", "ema21")     // % de distancia entre dos indicadores
```

## Ganancia / pérdida / extremos

```java
.gain("price")                         // periodos consecutivos de ganancia
.loss("price")                         // periodos consecutivos de pérdida
.gain("g", "price", false)            // resetPeriodsOnSustain=false
.max("price")                          // máximo acumulado
.min("price")                          // mínimo acumulado
.sum("vol")                            // suma acumulada
```

## Aritmética

```java
.add("spread", "ask", "bid")          // spread = ask + bid
.diff("spread", "ask", "bid")         // diff = ask - bid
.mul("price", 0.01)                   // escala por un coeficiente
.mul("ratio", "vol", "price")         // vol * price
.fun("personalizada", "a", "b", (a, b) -> a / b)  // BiFunction arbitraria
```

## Predicados y condicionales

```java
.lessThan("sobrevendido", "rsi14", 30)    // booleano: rsi14 < 30
.greatThan("sobrecomprado", "rsi14", 70)
.greatOrEqual("ge", "price", 50000)
.lessOrEqual("le", "price", 50000)
.equal("eq", "price", 100)
.notEqual("ne", "price", 100)
.predicate("personalizada", "price", v -> v > 0 && v < 100)
.periodCount("cnt", "sobrevendido", v -> v > 0)  // cuenta periodos consecutivos en true
```

## Selección condicional

```java
// Si indicador == coef → entoncesInd si no sinoInd
.equal("seleccionado", "senal", 1, "emaRapida", "emaLenta")
.conditional("salida", "bandera", ind -> ind.getValue() > 0, entoncesInd, sinoInd)
```

## Transformaciones

```java
.clamp("price", 0.0, 100.0)          // limita el valor a [min, max]
.clamp("price", v -> v < 0, 0.0)     // aplica el clamp cuando el predicado es true
.round("price", 2)                    // redondea a N decimales
.decorate("price", "price", ind -> new MiEnvoltorio(ind))
```

## Window listeners

```java
.window("ema9", WindowTime.s1, listener)     // se dispara cada 1 s
.window("ema9", Duration.ofSeconds(15), l)   // duración personalizada
.window()                                     // patrón builder
    .windowTime(WindowTime.m5)
    .indicator("rsi14")
    .listener(myListener)
    .build()
```

## Composición de indicadores (acceso de solo lectura)

Al construir un indicador personalizado que referencia a otro, usa una vista de solo lectura para
evitar mutar el estado compartido. Dos enfoques equivalentes:

```java
// Opción A — .ro() en cualquier instancia de RTIndicator (método por defecto de RTIndicator)
RTIndicator fuente = indicators.getExisting("ema9").ro();
indicators.add("personalizado", new MiIndicador(fuente));

// Opción B — getReadOnlyExisting() en el grupo de indicadores
RTIndicator fuente = indicators.getReadOnlyExisting("ema9");
indicators.add("personalizado", new MiIndicador(fuente));

// Opción C — getReadOnly() devuelve Optional (seguro si el indicador puede no existir)
indicators.getReadOnly("ema9").ifPresent(fuente ->
    indicators.add("personalizado", new MiIndicador(fuente)));
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
    .sma("media", 20)
    .add("desv",    new StandardDeviationRTIndicator(20))             // constructor (int periods)
    .add("desvDe",  new StandardDeviationRTIndicator(                 // constructor (RTIndicator, int periods)
            indicators.getReadOnlyExisting("media"), 20))
    .add("zscore", new ZScoreRTIndicator(/* ver la clase para el constructor */));
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

public class MiIndicador implements RTIndicator {
    private double valor;
    private boolean listo;

    @Override public double getValue() { return valor; }

    @Override public double update(double nuevoValor) {     // se llama una vez por tick con el valor de origen
        this.valor = /* calcula de forma incremental a partir de nuevoValor */ nuevoValor;
        this.listo = true;
        return valor;
    }

    @Override public boolean isReady() { return listo; }  // controla el calentamiento (por defecto true)

    @Override public void reset() { valor = 0; listo = false; }  // de Resettable
}
```

Regístralo como cualquier indicador integrado: `indicators.add("miInd", new MiIndicador())`. La
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

public class MiIndicadorOhlc implements RichRTIndicator<MarketSnapshot> {
    private double valor;
    @Override public double updateFrom(MarketSnapshot instantanea) {  // instantánea completa: O/H/L/C/V, bid/ask
        this.valor = /* combina varios campos */ 0;
        return valor;
    }
    @Override public double getValue() { return valor; }
    @Override public double update(double v) { return valor; }  // ruta escalar sin usar
    @Override public void reset() { valor = 0; }
}
```

El motor construye el snapshot una vez por tick y lo despacha a cada `RichRTIndicator`
registrado, mientras los indicadores escalares siguen recibiendo su campo extraído. Se registra
igual: `indicators.add("miOhlc", new MiIndicadorOhlc())`.

## Indicadores ocultos

Prefíjalos con `_` para excluirlos de los metadatos de reporte de señales:

```java
.gain("_gananciaCruda", "price")   // uso interno, no se reporta
```

Es azúcar sintáctico sobre la entrada de metadatos `VISIBILITY` — ver más abajo.

## Metadatos de indicador

Todo indicador lleva pequeños metadatos descriptivos clave/valor sobre sí mismo, separados de su
nombre de búsqueda registrado, legibles desde cualquier instancia de `RTIndicator` (por ejemplo,
vía `indicators.getExisting("name")` / `getReadOnlyExisting("name")`):

```java
RTIndicator ind = indicators.getExisting("gap");
ind.getId();                     // id de tipo canónico, p. ej. "distance", "bollinger", "rsi"
ind.getDisplayHint();            // DisplayHint: ABSOLUTE (por defecto), PERCENT o VOLUME
ind.isHidden();                  // true si es solo interno (el prefijo "_" de arriba lo activa)
ind.getMeta().get("periods");    // cualquier otra clave descriptiva, o null si no está definida
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
    new MiIndicadorDistancia(a, b)
        .withMeta(IndicatorMeta.ID, "distance")
        .withMeta("periods", 20)
        .withDisplayHint(DisplayHint.PERCENT));
```

Los metadatos son un **descriptor de solo escritura** — un indicador nunca debe leer sus propios
metadatos para dirigir su cálculo, eso lo convertiría en un segundo canal de configuración no
declarado. Fíjalos una sola vez al registrar; léelos solo desde fuera.
