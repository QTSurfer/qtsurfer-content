---
title: QTScript (beta)
description: Un lenguaje compacto para escribir estrategias — cada sección, las ventanas, qué hay en su ámbito, y cómo compila igual que Java.
order: 7
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 93b8076c98cfbb780a45e013df14725d5584d283
upstreamPath: docs/qtscript.md
lastUpdated: '2026-11-26T14:09:49Z'
---

QTScript es una forma compacta de escribir una estrategia: conservas la parte que es tuya —
indicadores, ventanas, señales — y dejas fuera la ceremonia de una clase Java (paquete, imports,
clase, clase base, anotaciones de propiedades, código repetitivo de listeners). **Cada cuerpo `{ }`
es Java tal cual**, así que todo lo que ofrece la [API de estrategias Java](/docs/strategies/java/strategy_coding) dentro
de un cuerpo funciona sin cambios. Un fichero QTScript se convierte en exactamente una clase Java y
pasa por la misma compilación en el servidor que una estrategia Java.

Está **en beta** y ganará más sintaxis. Java sigue siendo la vía establecida, con toda la API del
motor; lo que QTScript no puede expresar se escribe en Java (consulta [qué no hace](#qué-no-hace)).

## Se envía como cualquier estrategia

No hay un endpoint aparte ni una cabecera que fijar: envía el fuente en crudo a
[`POST /strategy`](/docs/developers/api/strategy#compilar-una-estrategia) con `Content-Type: text/plain`, exactamente
igual que con Java. La plataforma distingue ambas por el texto — un fuente QTScript empieza por
`strategy`, y los espacios en blanco o comentarios (`//`, `/* */`) antes de esa palabra se ignoran,
así que puede haber una descripción encima del fichero. `.qtscript` es la extensión de fichero
convencional; solo se envía el texto.

```bash
curl -X POST https://api.qtsurfer.net/v1/strategy \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: text/plain" \
  --data-binary @rsi-reversion.qtscript
```

La respuesta es la misma que para Java: un `strategyId` y los `declaredProperties` — cada `param`
que declaraste aparece ahí.

## Una estrategia entera

Este es el fichero completo: sin imports, sin clase, sin listener.

```
strategy "RSI reversion"

param rsiBajo = 30  "Sobrevendido"
param rsiAlto = 70  "Sobrecomprado"

instruments */usdt

setup:
  rsi(14) window m1 {
    if (actual < rsiBajo) emitBuy(price);
    if (actual > rsiAlto) emitSell(price);
  }
```

Declara dos parámetros, acepta cualquier base cotizada en USDT, registra un RSI de 14 periodos y lo
vigila en una ventana de un minuto, emitiendo una señal en cada umbral.

## Las partes de un fichero

| Parte | Qué hace | Ejemplo |
|---|---|---|
| `strategy` | La primera línea: el nombre y, opcionalmente, la fuente de datos (`ticker` por defecto, `kline`, `funding`) | `strategy "RSI reversion"` · `strategy Barras kline` |
| `param` | Un valor configurable. El tipo sale del literal (`9` → `int`, `0.5` → `double`, `true` → `boolean`, `"texto"` → `String`). **El nombre es la clave** que usan los `params` de una ejecución y un eje de barrido | `param rsiBajo = 30 "Sobrevendido"` |
| `init { }` | Opcional. Java tal cual, se ejecuta una vez al construir la estrategia — setters del motor | `init { setPercentGain(0.5); }` |
| `instruments` | Opcional. Qué mercados: pares (`BASE/QUOTE`, cualquiera de los dos lados puede ser `*`), expresiones regulares (`~"..."`, comparadas contra el símbolo completo), o un cuerpo Java para control total | `instruments */usdt` · `instruments btc/usdt, eth/*` |
| `uses` | Opcional. Trae los [indicadores pro](#los-indicadores-pro-uses) al fichero, de modo que `setup:` pueda llamarlos por su nombre sin más. Varias líneas `uses` se suman | `uses pro.*` · `uses pro.adx, pro.ichimoku` |
| `setup:` | Los indicadores, **una llamada al builder por línea** (el catálogo del builder que usa una estrategia Java, [listado abajo](#qué-va-bajo-setup)). Las líneas bajo `setup:` van indentadas, y la primera línea que vuelve a la columna 0 cierra la sección | `ema(12)` · `bollinger(20, 2)` |
| Ventanas | Donde va la lógica — consulta abajo | `rsi(14) window m1 { ... }` |
| `onCommand { }` | Opcional, como mucho una por fichero. Corre cuando la ejecución recibe un [comando](/docs/developers/api/live#comandos) — consulta abajo | `onCommand { if ("flatten".equals($command)) ... }` |

### Qué va bajo `setup:`

Cada línea es una llamada al builder de indicadores que una estrategia Java configura en `setupIndicators`,
[`InstrumentGroupRTIndicator`](https://www.qtsurfer.com/docs/developers/java-api/reference/latest/com/wualabs/qtsurfer/engine/indicators/helpers/group/InstrumentGroupRTIndicator.html),
escrita sin el punto. Estos son los nombres que funcionan:

`add` `bollinger` `bollingerBandwidth` `cci` `clamp` `diff` `distance` `distanceMa` `ema` `equal`
`gain` `greatOrEqual` `greatThan` `lessOrEqual` `lessThan` `loss` `macd` `max` `min` `mul` `notEqual`
`percentChange` `rateChange` `round` `rsi` `sma` `stochRsi` `sum` `wma` `tema` `hma` `mma` `kama` `stdDev` `variance`
`volatility` `percentVolatility` `bollingerPercentB` `atr` `isEqual` `isNotEqual` `isGreatThan` `isGreatOrEqual` `isLessThan` `isLessOrEqual`

Estas son las formas de cada nombre que una línea de QTScript puede escribir: un `String` es el nombre de un indicador,
o bien uno que lee o bien el que registra, y un `Number` es un número entero o un decimal. Qué significa cada argumento
está en el Javadoc del builder.

| Indicador | Las formas que QTScript puede escribir |
|---|---|
| `add` | `add(String, String)` · `add(String, String, String)` |
| `bollinger` | `bollinger()` · `bollinger(int)` · `bollinger(int, Number)` · `bollinger(String, int, Number)` |
| `bollingerBandwidth` | `bollingerBandwidth(String)` |
| `cci` | `cci(int)` · `cci(String, int)` |
| `clamp` | `clamp(String, Number, Number)` · `clamp(String, String, Number, Number)` |
| `diff` | `diff(String, String)` · `diff(String, String, String)` |
| `distance` | `distance(String, String)` · `distance(String, String, String)` |
| `distanceMa` | `distanceMa(String)` · `distanceMa(String, String)` |
| `ema` | `ema(int)` · `ema(String, int)` · `ema(String, String, int)` |
| `equal` | `equal(String, String, Number)` · `equal(String, String, Number, String)` · `equal(String, String, Number, String, String)` |
| `gain` | `gain(String)` · `gain(String, String)` · `gain(String, String, boolean)` |
| `greatOrEqual` | `greatOrEqual(String, String, Number)` · `greatOrEqual(String, String, Number, String)` · `greatOrEqual(String, String, Number, String, String)` |
| `greatThan` | `greatThan(String, String, Number)` · `greatThan(String, String, Number, String)` · `greatThan(String, String, Number, String, String)` |
| `lessOrEqual` | `lessOrEqual(String, String, Number)` · `lessOrEqual(String, String, Number, String)` · `lessOrEqual(String, String, Number, String, String)` |
| `lessThan` | `lessThan(String, String, Number)` · `lessThan(String, String, Number, String)` · `lessThan(String, String, Number, String, String)` |
| `loss` | `loss(String)` · `loss(String, String)` · `loss(String, String, boolean)` |
| `macd` | `macd()` · `macd(String)` · `macd(String, int, int)` · `macd(String, String, int, int)` |
| `max` | `max(String)` · `max(String, String)` |
| `min` | `min(String)` · `min(String, String)` |
| `mul` | `mul(String, Number)` · `mul(String, String)` · `mul(String, String, Number)` · `mul(String, String, String)` |
| `notEqual` | `notEqual(String, String, Number)` · `notEqual(String, String, Number, String)` · `notEqual(String, String, Number, String, String)` |
| `percentChange` | `percentChange(String)` · `percentChange(String, String)` |
| `rateChange` | `rateChange(String)` · `rateChange(String, String, boolean)` |
| `round` | `round(String, int)` · `round(String, String, int)` |
| `rsi` | `rsi(int)` · `rsi(int, boolean)` · `rsi(String, int, boolean)` |
| `sma` | `sma(int)` · `sma(String, int)` · `sma(String, String, int)` · `sma(String, int, boolean)` |
| `stochRsi` | `stochRsi(int)` · `stochRsi(String, int)` |
| `sum` | `sum(String)` · `sum(String, String)` |
| `wma` | `wma(int)` · `wma(String, int)` |
| `tema` | `tema(int)` · `tema(String, int)` |
| `hma` | `hma(int)` · `hma(String, int)` |
| `mma` | `mma(int)` · `mma(String, int)` · `mma(String, String, int)` |
| `kama` | `kama()` · `kama(int, int, int)` · `kama(String, int, int, int)` |
| `stdDev` | `stdDev(int)` · `stdDev(String, int)` · `stdDev(String, String, int)` |
| `variance` | `variance(int)` · `variance(String, int)` · `variance(String, String, int)` |
| `volatility` | `volatility(int)` · `volatility(String, int)` |
| `percentVolatility` | `percentVolatility(int)` · `percentVolatility(String, int)` |
| `bollingerPercentB` | `bollingerPercentB()` · `bollingerPercentB(int)` · `bollingerPercentB(int, Number)` · `bollingerPercentB(String, int, Number)` |
| `atr` | `atr()` · `atr(int)` · `atr(String, int)` |
| `isEqual` | `isEqual(String, String, Number)` |
| `isNotEqual` | `isNotEqual(String, String, Number)` |
| `isGreatThan` | `isGreatThan(String, String, Number)` |
| `isGreatOrEqual` | `isGreatOrEqual(String, String, Number)` |
| `isLessThan` | `isLessThan(String, String, Number)` |
| `isLessOrEqual` | `isLessOrEqual(String, String, Number)` |

Una llamada cuyos argumentos no encajan con
ninguna de sus formas se rechaza indicando las que sí existen: `ema(1, 2, 3)` responde que sus formas son
`ema(int)`, `ema(String, int)` y `ema(String, String, int)`. Los métodos del builder que reciben una función
(`predicate`, `fun`, `decorate`, `periodCount`, `isTrue`) y `conditional`, que recibe una función e indicadores como objetos, solo se
pueden escribir en Java. Para comparar un indicador con un número, usa `equal`, `notEqual`, `greatThan`, `greatOrEqual`,
`lessThan` o `lessOrEqual`. Para leer la comparación como verdadera o falsa dentro de un cuerpo `{ }`, usa `isEqual`,
`isNotEqual`, `isGreatThan`, `isGreatOrEqual`, `isLessThan` o `isLessOrEqual`: [una condición](#una-condición-isvalue).

Llamados sin un nombre propio, los más nuevos registran `atr14`, `wma5`, `tema4`, `hma6`, `mma7`, `kama10_2_30`,
`stdDev5`, `variance5`, `vol5` (`volatility`), `pvol5` (`percentVolatility`) y `pctB20_2` (`bollingerPercentB`); un
multiplicador entero pierde la parte decimal, como en `bollinger`.

`atr` lee barras completas, igual que los indicadores pro: úsalo en una estrategia [`kline`](#velas). En una estrategia
`ticker` sus valores no son los de la barra y no significan nada.

Un nombre que no está en la lista, y que ninguna línea `uses` trae ([siguiente sección](#los-indicadores-pro-uses)), no
es un indicador que puedas usar aquí, y la estrategia se rechaza con `unknown indicator '<nombre>'`: `zscore`
está entre los nombres que responden así, y también `adx` y `kurtosis` salvo que el fichero los traiga con `uses`. Lo mismo
ocurre con `value("nombre")`, que lee un indicador dentro de un cuerpo `{ }` y no tiene sentido en una línea de
`setup:`.

### Los indicadores pro: `uses`

Los indicadores pro no están en la lista de arriba. Un fichero los trae con una línea `uses`, y luego los llama en `setup:`
por su nombre sin más, como cualquier otro indicador.

- `uses pro.*` trae los setenta y seis. `uses pro.adx, pro.ichimoku` trae solo esos. Varias líneas `uses` se suman. Escríbelas junto
  a `param` e `instruments`, antes de `setup:`.
- Solo los nombres que trae una línea `uses` son pro. Con `uses pro.obv`, una llamada a `adx(14)` sigue siendo `unknown
  indicator 'adx'`, indicado en la línea de la llamada. Los nombres propios del builder (`ema`, `rsi` y el resto de la
  lista de arriba) nunca son pro.
- `pro` es el único conjunto que existe. `uses` es una palabra reservada: un fichero no puede tener un `param` ni una
  sección llamados `uses`.
- Treinta y seis de los setenta y seis indicadores pro leen barras enteras (la última columna de la tabla dice cuáles), así que
  úsalos en una estrategia [`kline`](#velas). En una estrategia `ticker` sus valores no son los de la barra y no significan nada,
  y validar o ejecutar la estrategia devuelve un aviso del motor que lo dice. Los otros cuarenta leen el cierre, así que
  significan algo en una estrategia `ticker` y no emiten aviso.
- Una línea pro es una línea `setup:` normal: una llamada por línea, con una ventana detrás como de costumbre.
- Los backtests, los barridos (con walk-forward incluido), [`validate`](/docs/developers/api/strategy#comprobar-que-realmente-funciona) y las
  ejecuciones en vivo ejecutan los indicadores pro.

| Indicador | Formas | Registra, con los argumentos por defecto | También registra | Lee |
|---|---|---|---|---|
| `acceleratorOscillator` | `acceleratorOscillator()` · `acceleratorOscillator(String)` · `acceleratorOscillator(String, boolean)` | `acc` |  | barras |
| `adaptiveFisherTransform` | `adaptiveFisherTransform()` · `adaptiveFisherTransform(String)` · `adaptiveFisherTransform(int, int, int)` · `adaptiveFisherTransform(String, int, int, int)` | `afisher10_5_20` |  | cierre |
| `adl` | `adl()` · `adl(String)` | `adl` |  | barras |
| `adx` | `adx()` · `adx(int)` · `adx(String, int)` | `adx14` | `adx14PlusDI` · `adx14MinusDI` | barras |
| `alma` | `alma(int)` · `alma(String, int)` · `alma(String, int, double, double)` | `alma14`, de `alma(14)` (no hay forma sin argumentos) |  | cierre |
| `aroon` | `aroon()` · `aroon(String)` · `aroon(int)` · `aroon(String, int)` | `aroon25` | `aroon25Up` · `aroon25Down` | barras |
| `autocorrelation` | `autocorrelation(int)` · `autocorrelation(String, int)` | `acf14`, de `autocorrelation(14)` (no hay forma sin argumentos) |  | cierre |
| `awesomeOscillator` | `awesomeOscillator()` · `awesomeOscillator(String)` · `awesomeOscillator(int, int)` · `awesomeOscillator(String, int, int)` · `awesomeOscillator(String, int, int, boolean)` | `ao5_34` |  | barras |
| `balanceOfPower` | `balanceOfPower()` · `balanceOfPower(String)` | `bop` |  | barras |
| `bullBearPower` | `bullBearPower()` · `bullBearPower(String)` · `bullBearPower(int)` · `bullBearPower(String, int)` | `bbp13` | `bbp13Bull` · `bbp13Bear` | barras |
| `calmarRatio` | `calmarRatio(int)` · `calmarRatio(String, int)` · `calmarRatio(String, int, double)` | `calmar14`, de `calmarRatio(14)` (no hay forma sin argumentos) |  | cierre |
| `chaikinOscillator` | `chaikinOscillator()` · `chaikinOscillator(String)` · `chaikinOscillator(int, int)` · `chaikinOscillator(String, int, int)` | `chaikin3_10` |  | barras |
| `chandeForecastOscillator` | `chandeForecastOscillator()` · `chandeForecastOscillator(String)` · `chandeForecastOscillator(int)` · `chandeForecastOscillator(String, int)` | `cfo14` |  | cierre |
| `chandeKrollStop` | `chandeKrollStop()` · `chandeKrollStop(String)` · `chandeKrollStop(int, double, int, int)` · `chandeKrollStop(String, int, double, int, int)` | `cks10_1_9_9` | `cks10_1_9_9StopShort` | barras |
| `chandelierExit` | `chandelierExit()` · `chandelierExit(String)` · `chandelierExit(int, double)` · `chandelierExit(String, int, double)` | `chand22_3` | `chand22_3ShortExit` | barras |
| `choppinessIndex` | `choppinessIndex()` · `choppinessIndex(String)` · `choppinessIndex(int)` · `choppinessIndex(String, int)` | `chop14` |  | barras |
| `cmf` | `cmf()` · `cmf(int)` · `cmf(String, int)` | `cmf20` |  | barras |
| `cmo` | `cmo()` · `cmo(String)` · `cmo(int)` · `cmo(String, int)` | `cmo14` |  | cierre |
| `connorsRsi` | `connorsRsi()` · `connorsRsi(String)` · `connorsRsi(int, int, int)` · `connorsRsi(String, int, int, int)` · `connorsRsi(String, int, int, int, boolean)` | `crsi3_2_100` |  | cierre |
| `coppockCurve` | `coppockCurve()` · `coppockCurve(String)` · `coppockCurve(int, int, int)` · `coppockCurve(String, int, int, int)` | `coppock14_11_10` |  | cierre |
| `dema` | `dema(int)` · `dema(String, int)` | `dema14`, de `dema(14)` (no hay forma sin argumentos) |  | cierre |
| `detrendedPriceOscillator` | `detrendedPriceOscillator()` · `detrendedPriceOscillator(String)` · `detrendedPriceOscillator(int)` · `detrendedPriceOscillator(String, int)` | `dpo20` |  | cierre |
| `donchianChannel` | `donchianChannel()` · `donchianChannel(String)` · `donchianChannel(int)` · `donchianChannel(String, int)` | `donch20` | `donch20Upper` · `donch20Lower` | barras |
| `easeOfMovement` | `easeOfMovement()` · `easeOfMovement(String)` · `easeOfMovement(int)` · `easeOfMovement(String, int)` | `eom14` |  | barras |
| `efficiencyRatio` | `efficiencyRatio()` · `efficiencyRatio(String)` · `efficiencyRatio(int)` · `efficiencyRatio(String, int)` | `er10` |  | cierre |
| `elderForceIndex` | `elderForceIndex()` · `elderForceIndex(String)` · `elderForceIndex(int)` · `elderForceIndex(String, int)` | `efi13` |  | barras |
| `envelopes` | `envelopes()` · `envelopes(String)` · `envelopes(int, double)` · `envelopes(String, int, double)` | `env20_2.5` | `env20_2.5Upper` · `env20_2.5Lower` | cierre |
| `ewmaVolatility` | `ewmaVolatility()` · `ewmaVolatility(String)` · `ewmaVolatility(double)` · `ewmaVolatility(String, double)` · `ewmaVolatility(String, double, double)` | `ewma0.94` |  | cierre |
| `exactStdDev` | `exactStdDev(int)` · `exactStdDev(String, int)` · `exactStdDev(String, int, boolean)` | `xstd14`, de `exactStdDev(14)` (no hay forma sin argumentos) |  | cierre |
| `exactVariance` | `exactVariance(int)` · `exactVariance(String, int)` · `exactVariance(String, int, boolean)` | `xvar14`, de `exactVariance(14)` (no hay forma sin argumentos) |  | cierre |
| `fisherTransform` | `fisherTransform()` · `fisherTransform(String)` · `fisherTransform(int)` · `fisherTransform(String, int)` | `fisher10` |  | cierre |
| `frama` | `frama()` · `frama(String)` · `frama(int)` · `frama(String, int)` | `frama20` |  | cierre |
| `garmanKlass` | `garmanKlass(int)` · `garmanKlass(String, int)` · `garmanKlass(String, int, double)` | `gk14`, de `garmanKlass(14)` (no hay forma sin argumentos) |  | barras |
| `hurstExponent` | `hurstExponent(int)` · `hurstExponent(String, int)` | `hurst14`, de `hurstExponent(14)` (no hay forma sin argumentos) |  | cierre |
| `ichimoku` | `ichimoku()` · `ichimoku(String)` · `ichimoku(int, int, int)` · `ichimoku(String, int, int, int)` | `ichi9_26_52` | `ichi9_26_52Kijun` · `ichi9_26_52SenkouA` · `ichi9_26_52SenkouB` · `ichi9_26_52Chikou` | barras |
| `keltnerChannel` | `keltnerChannel()` · `keltnerChannel(String)` · `keltnerChannel(int, int, double)` · `keltnerChannel(String, int, int, double)` | `kc20_10_1.5` | `kc20_10_1.5Upper` · `kc20_10_1.5Lower` | barras |
| `klingerOscillator` | `klingerOscillator()` · `klingerOscillator(String)` | `klinger` | `klingerSignal` | barras |
| `knowSureThing` | `knowSureThing()` · `knowSureThing(String)` · `knowSureThing(String, int[], int[], double[], int)` · `knowSureThing(String, int[], int[], double[], int, boolean)` | `kst` | `kstSignal` | cierre |
| `kurtosis` | `kurtosis(int)` · `kurtosis(String, int)` | `kurt14`, de `kurtosis(14)` (no hay forma sin argumentos) |  | cierre |
| `leastSquaresMovingAverage` | `leastSquaresMovingAverage()` · `leastSquaresMovingAverage(String)` · `leastSquaresMovingAverage(int)` · `leastSquaresMovingAverage(String, int)` | `lsma25` |  | cierre |
| `linearRegressionSlope` | `linearRegressionSlope(int)` · `linearRegressionSlope(String, int)` | `lrs14`, de `linearRegressionSlope(14)` (no hay forma sin argumentos) | `lrs14Intercept` | cierre |
| `massIndex` | `massIndex()` · `massIndex(String)` · `massIndex(int, int)` · `massIndex(String, int, int)` | `mass25_9` |  | barras |
| `maxDrawdown` | `maxDrawdown()` · `maxDrawdown(String)` | `maxDd` | `maxDdCurrent` | cierre |
| `mcGinleyDynamic` | `mcGinleyDynamic()` · `mcGinleyDynamic(String)` · `mcGinleyDynamic(int)` · `mcGinleyDynamic(String, int)` | `mcg14` |  | cierre |
| `mfi` | `mfi()` · `mfi(int)` · `mfi(String, int)` | `mfi14` |  | barras |
| `momentum` | `momentum()` · `momentum(String)` · `momentum(int)` · `momentum(String, int)` | `mom10` |  | cierre |
| `natr` | `natr(int)` · `natr(String, int)` | `natr14`, de `natr(14)` (no hay forma sin argumentos) |  | barras |
| `negativeVolumeIndex` | `negativeVolumeIndex()` · `negativeVolumeIndex(String)` | `nvi` |  | barras |
| `obv` | `obv()` · `obv(String)` | `obv` |  | barras |
| `omegaRatio` | `omegaRatio(int)` · `omegaRatio(String, int)` · `omegaRatio(String, int, double)` | `omega14`, de `omegaRatio(14)` (no hay forma sin argumentos) |  | cierre |
| `parabolicSar` | `parabolicSar()` · `parabolicSar(String)` · `parabolicSar(double, double)` · `parabolicSar(String, double, double)` | `psar0.02_0.2` |  | barras |
| `parkinson` | `parkinson(int)` · `parkinson(String, int)` · `parkinson(String, int, double)` | `park14`, de `parkinson(14)` (no hay forma sin argumentos) |  | barras |
| `pvt` | `pvt()` · `pvt(String)` | `pvt` |  | barras |
| `realizedVolatility` | `realizedVolatility(int)` · `realizedVolatility(String, int)` · `realizedVolatility(String, int, double)` | `rvol14`, de `realizedVolatility(14)` (no hay forma sin argumentos) |  | cierre |
| `relativeVigorIndex` | `relativeVigorIndex()` · `relativeVigorIndex(String)` · `relativeVigorIndex(int)` · `relativeVigorIndex(String, int)` · `relativeVigorIndex(String, int, boolean)` | `rvgi10` |  | barras |
| `relativeVolatilityIndex` | `relativeVolatilityIndex()` · `relativeVolatilityIndex(String)` · `relativeVolatilityIndex(int, int)` · `relativeVolatilityIndex(String, int, int)` | `rvi10_14` |  | cierre |
| `roc` | `roc()` · `roc(String)` · `roc(int)` · `roc(String, int)` | `roc12` |  | cierre |
| `rogersSatchell` | `rogersSatchell(int)` · `rogersSatchell(String, int)` · `rogersSatchell(String, int, double)` | `rs14`, de `rogersSatchell(14)` (no hay forma sin argumentos) |  | barras |
| `rollingPercentile` | `rollingPercentile(int, double)` · `rollingPercentile(String, int, double)` | `pctl14_0.5`, de `rollingPercentile(14, 0.5)` (no hay forma sin argumentos) | `pctl14_0.5Median` · `pctl14_0.5Min` · `pctl14_0.5Max` | cierre |
| `sharpeRatio` | `sharpeRatio(int)` · `sharpeRatio(String, int)` · `sharpeRatio(String, int, double)` · `sharpeRatio(String, int, double, double)` | `sharpe14`, de `sharpeRatio(14)` (no hay forma sin argumentos) |  | cierre |
| `simpleLinearRegression` | `simpleLinearRegression(int)` · `simpleLinearRegression(String, int)` | `slr14`, de `simpleLinearRegression(14)` (no hay forma sin argumentos) | `slr14Intercept` · `slr14RSquared` · `slr14StandardError` | cierre |
| `skewness` | `skewness(int)` · `skewness(String, int)` | `skew14`, de `skewness(14)` (no hay forma sin argumentos) |  | cierre |
| `sortinoRatio` | `sortinoRatio(int)` · `sortinoRatio(String, int)` · `sortinoRatio(String, int, double)` · `sortinoRatio(String, int, double, double)` | `sortino14`, de `sortinoRatio(14)` (no hay forma sin argumentos) |  | cierre |
| `stochasticOscillator` | `stochasticOscillator()` · `stochasticOscillator(String)` · `stochasticOscillator(int, int, int)` · `stochasticOscillator(String, int, int, int)` · `stochasticOscillator(String, int, int, int, boolean)` | `stoch14_3_3` | `stoch14_3_3D` | barras |
| `superTrend` | `superTrend()` · `superTrend(String)` · `superTrend(int, double)` · `superTrend(String, int, double)` | `st10_3` | `st10_3Upper` · `st10_3Lower` | barras |
| `tailRatio` | `tailRatio(int)` · `tailRatio(String, int)` · `tailRatio(String, int, double, double)` | `tail14`, de `tailRatio(14)` (no hay forma sin argumentos) |  | cierre |
| `trix` | `trix()` · `trix(String)` · `trix(int)` · `trix(String, int)` | `trix15` |  | cierre |
| `trueStrengthIndex` | `trueStrengthIndex()` · `trueStrengthIndex(String)` · `trueStrengthIndex(int, int)` · `trueStrengthIndex(String, int, int)` | `tsi25_13` |  | cierre |
| `ulcerIndex` | `ulcerIndex(int)` · `ulcerIndex(String, int)` | `ulcer14`, de `ulcerIndex(14)` (no hay forma sin argumentos) |  | cierre |
| `ultimateOscillator` | `ultimateOscillator()` · `ultimateOscillator(String)` | `uo` |  | barras |
| `valueAtRisk` | `valueAtRisk(int)` · `valueAtRisk(String, int)` · `valueAtRisk(String, int, double)` · `valueAtRisk(String, int, double, double)` | `valRisk14`, de `valueAtRisk(14)` (no hay forma sin argumentos) |  | cierre |
| `vortex` | `vortex()` · `vortex(String)` · `vortex(int)` · `vortex(String, int)` | `vortex14` | `vortex14ViPlus` · `vortex14ViMinus` | barras |
| `vwap` | `vwap()` · `vwap(String)` | `vwap` |  | barras |
| `williamsR` | `williamsR()` · `williamsR(String)` · `williamsR(int)` · `williamsR(String, int)` | `willr14` |  | barras |
| `yangZhang` | `yangZhang(int)` · `yangZhang(String, int)` · `yangZhang(String, int, double)` | `yz14`, de `yangZhang(14)` (no hay forma sin argumentos) |  | barras |
| `zScore` | `zScore(int)` · `zScore(String, int)` | `zscore14`, de `zScore(14)` (no hay forma sin argumentos) |  | cierre |

`Lee` dice qué recibe el indicador: `barras` son barras enteras (apertura, máximo, mínimo, cierre y volumen) y `cierre` es el cierre de la
barra, o el último precio en una estrategia `ticker`. Una fila que dice «no hay forma sin argumentos» no tiene una llamada con los paréntesis
vacíos: el id que muestra es el que registra la llamada escrita ahí.

Cinco de ellos, `knowSureThing`, `acceleratorOscillator`, `awesomeOscillator`, `relativeVigorIndex` y `stochasticOscillator`, suavizan con
medias móviles por defecto. Su forma con un `boolean` al final conserva en su lugar las medias discretas cuando el valor es `true`, y `false`
es el valor por defecto. `connorsRsi` suaviza sus dos RSI con las medias de Wilder por defecto; su forma con un `boolean` al final toma en su lugar las medias simples de Cutler cuando
el valor es `true`, y `false` es el valor por defecto. En su rango percentil cuenta solo los valores estrictamente menores que el actual.

El `double` de los cuatro estimadores de volatilidad es el factor de anualización. Con otros argumentos el nombre sigue el
mismo patrón: `mfi(20)` registra `mfi20`, `kurtosis(30)` registra `kurt30`, `ichimoku(7, 22, 44)` registra
`ichi7_22_44`, y `superTrend(10, 2.5)` registra `st10_2.5` (un multiplicador entero pierde el decimal: `superTrend(7, 3)`
registra `st7_3`). Con un nombre como primer argumento el indicador se registra con ese nombre, y los demás indicadores
que registra lo toman como prefijo: `adx("trend", 14)` registra `trend`, `trendPlusDI` y `trendMinusDI`.

Algunos registran más de un indicador bajo un mismo nombre, como hace `bollinger` (consulta
[En qué indicador está una ventana](#en-qué-indicador-está-una-ventana)). Una ventana escrita en una línea así se engancha
al principal, de modo que `actual` es su valor, y el cuerpo lee los demás con `value($indicator + "<sufijo>")`, con los
sufijos de la última columna. `$indicator` es el nombre al que está enganchada la ventana, así que también funciona cuando
diste al indicador un nombre propio. El principal de `adx` es el ADX, el de `superTrend` es la línea SuperTrend y el de
`ichimoku` es la línea Tenkan.

Esto lee el ADX con las dos líneas direccionales a su lado:

```
strategy "ADX trend" kline
uses pro.adx

param adxLevel = 25 "ADX level"

setup:
  ema(20)
  atr(14)
  adx(14) window m1 {
    if (actual > adxLevel && value("adx14PlusDI") > value("adx14MinusDI")) emitBuy(close);
    if (actual > adxLevel && value("adx14PlusDI") < value("adx14MinusDI")) emitSell(close);
  }
```

Y este trae todos y usa bandas y una nube:

```
strategy "Cloud and bands" kline
uses pro.*

setup:
  superTrend(10, 3) window m5 {
    if (close > value($indicator + "Upper")) emitSell(close);
    if (close < value($indicator + "Lower")) emitBuy(close);
  }
  ichimoku() window m5 {
    if (close > value($indicator + "SenkouA") && close > value($indicator + "SenkouB")) emitBuy(close);
  }
  vwap()
  yangZhang(20)
```

Un fichero que trae solo `obv` y luego llama a `adx(14)` no compila. La línea de la llamada se rechaza con
`unknown indicator 'adx'`:

```
uses pro.obv

setup:
  adx(14)
```

Una línea `uses` mal formada se rechaza, contra tu fichero como los demás errores de QTScript, con uno de estos mensajes:

- `uses needs the indicators to bring in: uses pro.* or uses pro.adx, pro.ichimoku`, cuando nada sigue a `uses`.
- `expected pro.* or pro.<indicator>, found 'pro'`, para `uses pro`.
- `unknown set 'ta': the only set is pro`, para un conjunto que no existe.
- `unknown pro indicator 'zscore': the pro indicators are adx, cmf, garmanKlass, ichimoku, kurtosis, mfi, obv, parkinson,
  rogersSatchell, superTrend, vwap, yangZhang`, para un miembro que no existe.
- `expected pro.* or pro.<indicator> here`, para una coma sin nada detrás, como en `uses pro.adx,`.
- `expected pro.* or pro.<indicator>, found 'pro.adx pro.obv'`, para dos miembros sin coma entre ellos.

### Los indicadores pro y tu plan

Los indicadores pro vienen con los planes Pro y Elite (tu plan es el `tier` que devuelve [`GET /account`](/docs/developers/api/account)).
Registrar una estrategia que los usa se acepta en cualquier plan; lo que un plan sin ellos no puede hacer es ejecutarla.

- **`POST /strategy` dice lo que necesita la estrategia.** La respuesta lleva `requires`, una lista: `["indicators.pro"]`
  cuando la estrategia usa los indicadores pro y `[]` cuando no. [`GET /strategy/{strategyId}`](/docs/developers/api/strategy#obtener-una-estrategia)
  no lo muestra.
- **Un plan que no los incluye se rechaza con `402 Payment Required`**, sin cabecera `Retry-After`, ya que esperar no cambia
  el plan. Es la respuesta al validar la estrategia, al lanzar un backtest con ella, al lanzar un barrido con ella
  (walk-forward incluido) y al lanzar una ejecución en vivo con ella. El mensaje nombra el primer indicador pro que pide la
  estrategia, la línea de tu fichero y tu plan (en el plan Basic termina en `your plan: basic`). El cuerpo es el error
  habitual, con `retryable` en `false`, de modo que un cliente que reintenta según `retryable` no reintenta este. Cuando la
  plataforma tiene una página donde cambiar de plan, el cuerpo lleva además su dirección como `upgradeUrl`; ningún otro
  error la lleva:

```json
{"code": 402, "message": "strategy uses pro indicators (pro.adx, QTScript line 7); your plan: free", "retryable": false, "upgradeUrl": "https://example.com/upgrade"}
```

## Ventanas

Una ventana se dispara cuando cierra su periodo, no en cada tick, y envuelve un indicador. Un
periodo es uno de `s1 s5 s10 s30 m1 m3 m5`, o un número entero de segundos (`window 900 { ... }`);
si se omite, es `s1`. Cinco formas de escribir una:

```
setup:
  rsi(14) window m1 { ... }      // en línea, sobre el indicador que registra esta línea
  rsi(33) window Sobrevendido    // igual, con el cuerpo en una sección con nombre más abajo
  window price m5 { ... }        // en línea, sobre un indicador por nombre
  window ema12 Tendencia         // por nombre, cuerpo en una sección con nombre

window Sobrevendido m1 { ... }   // una sección con nombre, en la columna 0
Tendencia s5 { ... }             // `window` es opcional aquí
```

Una sección llamada `Main` a la que nada hace referencia vigila el valor principal (`price`, o
`rate` en funding), lo que da el fichero útil más corto:

```
strategy Simple

Main m1 {
  if (actual > prev) emitBuy(price);
}
```

### La ventana te da el valor anterior

Una ventana se dispara cuando cierra su periodo, así que `prev` es el valor que tenía el indicador cuando cerró la
ventana **anterior** y `actual` es su valor ahora: el `close[1]` de otras herramientas. Un cruce, o cualquier otra
cosa que compare un cierre con el anterior, no necesita guardar nada en el [store](#dentro-de-un-cuerpo); el valor
anterior ya está en ámbito.

Esto entra cuando el RSI vuelve a subir por encima de un nivel, una sola vez, en la ventana en la que ocurre:

```
strategy "RSI re-entry"

param nivel = 30 "Nivel que hay que volver a superar"

setup:
  rsi(14) window m1 {
    if (prev < nivel && actual >= nivel) emitBuy(price);
  }
```

En una estrategia `kline`, una ventana sobre `close` te da el cierre de la barra anterior como `prev`, que es lo que
necesita el rango verdadero junto a los `high` y `low` de la propia barra:

```
strategy "True range" kline

setup:
  window close m1 {
    double trueRange = Math.max(high - low, Math.max(Math.abs(high - prev), Math.abs(low - prev)));
    emitInfo("trueRange", trueRange);
  }
```

La primera vez que se dispara una ventana no hay una ventana anterior con la que comparar: `prev` es el valor que
tenía el indicador cuando se abrió esa primera ventana. Una regla que necesite dos cierres reales debe dejar pasar
el primer disparo, y un indicador con periodo de calentamiento, como un RSI o una EMA, tampoco se ha asentado en
sus primeras ventanas. Reserva el store para lo que una ventana no te puede dar: una marca, un contador, un valor de
varias ventanas atrás.

### En qué indicador está una ventana

Dentro del cuerpo de cualquier ventana, `$indicator` es el nombre del indicador al que está enganchada
esa ventana, como un `String`: `"ema12"` para una ventana escrita en la línea `ema(12)`, `"price"` en un
`Main` (`"rate"` en funding). El `$` marca un nombre que aporta QTScript; los nombres que declaras tú no
pueden empezar por uno. Una sección con nombre enganchada a varios indicadores ve, cada vez que se
dispara, el indicador que la disparó.

También es la forma en que un cuerpo llega a un indicador que la misma llamada al builder registró junto
al que ocupa la ventana. `bollinger(20, 2)` registra tres bajo un mismo nombre: la banda media,
`blgr20_2`, y las bandas exteriores, ese nombre seguido de `Upper` y `Lower`. Una ventana escrita en esa
línea se engancha a la banda media, así que `actual` es el valor de la banda media, y
`value($indicator + "Upper")` y `value($indicator + "Lower")` leen las otras dos:

```
setup:
  bollinger(20, 2) window m1 {
    if (price > value($indicator + "Upper")) emitSell(price);
    if (price < value($indicator + "Lower")) emitBuy(price);
  }
```

Una ventana que nombra un indicador que no está registrado, como `window noexiste m1 { ... }`, no se
rechaza al registrar el fuente. Que el nombre exista puede depender de tus `param` (un `param rapida`
usado como `ema(rapida)` registra un nombre distinto para cada valor) y de indicadores registrados desde
Java, así que solo se descubre al [validar](/docs/developers/api/strategy#comprobar-que-realmente-funciona) la estrategia,
que entonces falla en la línea de la ventana: `QTScript line 4: unknown indicator 'noexiste'`.

## Dentro de un cuerpo

Tu Java, más lo que ya está en ámbito — nada necesita importarse:

| En ámbito | Qué es |
|---|---|
| `actual`, `prev` | el valor nuevo de la ventana y el que tenía cuando cerró la ventana anterior — [consulta arriba](#la-ventana-te-da-el-valor-anterior) |
| `price` (ticker) · `price open high low close volume` (kline) · `rate` (funding) | los valores actuales, como variables normales |
| `value("nombre")` | el valor actual de cualquier otro indicador |
| `isValue("nombre")` | si un indicador tiene un valor que no es 0, `false` hasta que lo tiene — [una condición](#una-condición-isvalue) |
| `$indicator` | el nombre del indicador en el que está esta ventana, como un `String` — [ver arriba](#en-qué-indicador-está-una-ventana) |
| `store` | el estado por instrumento que comparten todas las ventanas de ese instrumento |
| `$globalStore` | el estado propio de la estrategia, para lo que no pertenece a un solo instrumento — [ver abajo](#el-almacén-global-globalstore) |
| `emitBuy(price)`, `emitSell(price)`, `emitInfo(clave, valores…)`, `emitSignal(signal)` | emisión de señales |
| cada `param` | legible por su nombre |

Un flag de posición en el store, emitiendo solo una vez en el cruce:

```
strategy "EMA cross"

param rapida = 9  "EMA rápida"
param lenta  = 21 "EMA lenta"

setup:
  ema(rapida)
  ema(lenta)
  window price s5 {
    double f = value("ema" + rapida);
    double s = value("ema" + lenta);
    if (f > s && !store.is("largo")) {
      store.set("largo");
      emitBuy(price);
    }
    if (f < s && store.is("largo")) {
      store.unset("largo");
      emitSell(price);
    }
  }
```

`value("ema" + rapida)` lee cualquier indicador registrado por nombre; `store` es el mismo store
que comparte cada ventana del instrumento.

### Una condición: `isValue`

Una comparación que un cuerpo lee como verdadera o falsa se escribe en una línea de `setup:` con `isEqual`, `isNotEqual`, `isGreatThan`,
`isGreatOrEqual`, `isLessThan` o `isLessOrEqual`. Cada una recibe tres argumentos: el nombre que registra, el indicador que lee y
el número con el que compara. `isLessThan("oversold", "rsi14", 30)` registra `oversold`, que se cumple mientras `rsi14` esté por debajo de 30.

En un cuerpo, `isValue("oversold")` es `true` cuando la condición se cumple y `false` cuando no. También es `false` hasta que `rsi14` tiene
un valor, y en ese tramo `value("oversold")` ya puede leer 1: lee una condición con `isValue`. `isValue` acepta el nombre de
cualquier indicador, no solo el de una condición, y es `true` cuando el indicador tiene un valor y ese valor no es 0.

```
strategy "Oversold touch"

setup:
  rsi(14)
  isLessThan("oversold", "rsi14", 30)
  window oversold m1 {
    if (isValue("oversold") && !store.is("long")) {
      store.set("long");
      emitBuy(price);
    }
    if (!isValue("oversold") && store.is("long")) {
      store.unset("long");
      emitSell(price);
    }
  }
```

`isTrue`, que recibe una función, solo se puede escribir en Java: [mira la guía de Java](/docs/strategies/java/strategy_coding#condiciones-e-isvalue).

### El almacén global: `$globalStore`

`store` es el de un instrumento. El estado que pertenece a la estrategia entera (un recuento entre todos los instrumentos, una marca
que pone un comando) va en el **almacén global**, `$globalStore`: un solo almacén para la estrategia, el mismo objeto en cada ventana
de cada instrumento y en los ganchos.

- Está en el ámbito en un cuerpo de ventana, en `onCommand { }`, en `onAttach { }` y en `onDetach { }`.
- Es un espacio de nombres propio: una clave puesta con `$globalStore` nunca se ve a través de `store` ni de
  `getStateStore("<símbolo>")`, y al revés.
- No está en el ámbito en `init { }` ni en `instruments { }`, que corren antes de que la plataforma arranque la estrategia: usarlo ahí
  es un error de compilación que lo dice.
- Como cualquier `StateStore` es memoria: un reinicio lo vacía.

```
setup:
  rsi(14) window m5 {
    if (actual < 30 && !$globalStore.is("long")) {
      $globalStore.set("long");
      emitBuy(price);
    }
  }
onCommand {
  if ("flatten".equals($command)) $globalStore.set("flat");
}
```

## Velas

`strategy … kline` da los campos de la barra como variables normales. Una estrategia kline nunca
recibe un intervalo: el ancho de la barra es la `cadence` con la que
[preparas los datos](/docs/developers/api/backtest_execute#kline-tú-eliges-el-ancho-de-la-barra), así que el mismo
fichero corre a cualquiera de ellas.

```
strategy "Range breakout" kline

param rangoMinimo = 0.5 "Rango mínimo, en porcentaje"

setup:
  window close m1 {
    double rango = (high - low) / low * 100.0;
    if (rango < rangoMinimo) return;
    if (close > open) emitBuy(close);
    else              emitSell(close);
  }
```

## Manejar un comando

`onCommand { }` es una sección especial, como mucho una por fichero, que corre cuando la plataforma entrega un
[comando](/docs/developers/api/live#comandos) a una ejecución en vivo — `POST /live/{runId}/commands`, aplicado sin reiniciar la
estrategia. No tiene periodo ni indicador: no es una ventana, corre una vez por comando, no una vez por evento
de mercado, y un fichero tiene como mucho una, igual que tiene como mucho un `init { }`.

Dentro de su cuerpo, `$command` es el texto del comando, como un `String` — nada más de lo que tiene el cuerpo
de una ventana (`actual`, `$indicator`, `value(...)`, el `store` ambiental) está en ámbito, porque un comando
no está atado a un tick de mercado ni, a diferencia de una ventana, a un instrumento ya elegido por ti. Cada
`param` sigue siendo legible y asignable.

Un comando puede llevar un objeto `properties` de tu elección, junto a `command` en el cuerpo de la petición.
Lee un valor de ahí con `$command.<clave>` — un `String`, `null` cuando el comando no llevaba esa clave.
`$command.<clave>` solo se dispara cuando `<clave>` no es en sí misma una llamada, así que `$command.equals(...)`,
`$command.startsWith(...)` y el resto se siguen leyendo como métodos normales de `String` sobre el propio
`$command`.

Al cuerpo de una ventana se le entrega el `store` de su instrumento; a `onCommand` no, ya que un comando no
nombra ningún instrumento por sí mismo — pero `getStateStore("<símbolo>")` acepta uno directamente, así que
un comando cuyas propias `properties` nombran un instrumento aún puede alcanzar el store de ese instrumento:

```
strategy "Manual flatten"

onCommand {
  if ("flatten".equals($command)) {
    getStateStore($command.instrument).set("cerrada");
  }
}
```

Una estrategia sin `onCommand { }` no implementa `CommandRequestHandler` del motor, así que un comando enviado
a una de sus ejecuciones se rechaza con `409` (consulta [Comandos](/docs/developers/api/live#comandos)). `$command` y
`$command.<clave>` no son visibles fuera del cuerpo de `onCommand`, igual que `$indicator` no es visible fuera
de una ventana.

Fijar un `param` o escribir en un `StateStore` desde dentro de `onCommand` surten efecto de inmediato, pero
ninguno de los dos sobrevive a un reinicio: un `StateStore` es memoria, se pierde en un reinicio igual que un
campo. Solo [`PUT /live/{runId}/params`](/docs/developers/api/live#parámetros-en-tiempo-de-ejecución) escribe algo de lo que una
ejecución reiniciada realmente parte. `getStateStore(...)` aquí no trata de durabilidad — es cómo `onCommand`
alcanza el estado por instrumento que el cuerpo de una ventana ya lee, ya que un comando no lleva instrumento
propio.

Una estrategia Java implementa el mismo contrato directamente, mediante `CommandRequestHandler` — consulta
[Programar estrategias en Java](/docs/strategies/java/strategy_coding#recibir-comandos).

## Adjuntar y quitar una fuente

`onAttach { }` y `onDetach { }` son secciones especiales, como mucho una de cada por fichero, que corren cuando la plataforma
adjunta una fuente de datos de mercado a una ejecución en vivo o le quita una ([Adjuntar y quitar una
fuente](/docs/developers/api/live#adjuntar-y-quitar-una-fuente)). Como `onCommand { }`, no son ventanas: no tienen periodo
ni indicador, y corren una vez por adjuntado o quitado, no una vez por evento de mercado. Una ejecución arrancada con una
fuente recibe su primer `onAttach` antes del primer evento de mercado; una ejecución que espera no tiene ninguno hasta que se
adjunta una fuente.

Dentro de cualquiera de los dos cuerpos, `$context` es el adjuntado, con estos accesores y nada más:

| Accesor | Devuelve |
|---|---|
| `$context.getId()` | el id del adjuntado, un `String` |
| `$context.getVenueTypeName()` | `"cex"` o `"dex"` |
| `$context.getExchange()`, `$context.getSegment()` | `String`s (`getSegment()` es `""` para un mercado sin segmentos) |
| `$context.getTypeName()` | `"ticker"`, `"kline"` o `"funding"` |
| `$context.getInstrumentCount()`, `$context.getInstrument(i)` | cuántos instrumentos lee el adjuntado, y el `i`-ésimo como símbolo |
| `$context.hasInstrument("BTC/USDT")` | si lee ese instrumento |
| `$context.isWarmingUp()` | si el adjuntado tiene un calentamiento que reproducir (`warmFrom` por encima de `0`) |
| `$context.getReason()` | nunca `null`: `""` en `onAttach`; en `onDetach`, uno de `"OWNER"`, `"REFUSED"`, `"POOL_GONE"`, `"CAPACITY"`, `"FUNDS"` o `"STRATEGY"`. Una fuente retirada por falta de datos, y una pool `dex` de un par que la ejecución ya lee (`SAME_PAIR` en el adjuntado), llegan como `"REFUSED"` |

Para una fuente `dex` el adjuntado lee un instrumento, el par que llevan las velas de la pool (`Rocco/WETH`), y `onAttach`
corre cuando la pool entrega su primera vela, justo antes de ella ([El instrumento de una pool](/docs/developers/api/live#el-instrumento-de-una-pool)).
Adjuntada con `resolveInstrument: false`, `onAttach` corre enseguida y `$context.getInstrument(0)` es un provisional,
`<dirección>/<exchange>:<segmento>`; `onDetach` lleva entonces el par si la pool entregó uno. Empareja los dos ganchos por
`$context.getId()`, el mismo en los dos.

Compara con `"OWNER".equals($context.getReason())`, que se lee igual sea cual sea el valor. Como en `onCommand`, nada de lo que
tiene un cuerpo de ventana (`actual`, `$indicator`, `value(...)`, el `store` ambiente) está en el ámbito, porque el adjuntado
no es un instrumento ya elegido para ti; todo `param` se puede leer y asignar, `getStateStore("<símbolo>")` alcanza el store de
un instrumento, y las llamadas de señal que toman un símbolo funcionan. Una señal emitida desde cualquiera de los dos cuerpos
mientras `$context.isWarmingUp()` es true se descarta, como cualquier señal sobre tiempo reproducido.

```
strategy "Pump watcher" kline

onAttach {
  if ($context.getInstrumentCount() > 0) {
    getStateStore($context.getInstrument(0)).set("watching");
  }
}

onDetach {
  if ("OWNER".equals($context.getReason()) && $context.getInstrumentCount() > 0) {
    getStateStore($context.getInstrument(0)).set("released");
  }
}
```

La memoria de la estrategia (un `param` que cambiaste, un `StateStore`) dura mientras la ejecución tiene al menos una fuente
adjuntada; cuando se quita la última se libera, y el siguiente adjuntado empieza limpio. Un backtest llama a `onAttach` una
vez antes de su primer evento, con su propia fuente, y a `onDetach` una vez después del último, también cuando termina antes
que sus datos (cancelado, sin tiempo, fallado, o porque la estrategia hizo `detach`, lo que le dice `"STRATEGY"`).

`onDetach` corre cuando se quita una fuente mientras la ejecución sigue: por ti, o por la plataforma, con el motivo que dice
por qué. **No** corre cuando la ejecución se detiene o falla: una detención no es un punto de los datos de la ejecución, así
que nada de lo que un gancho emitiera entonces podría atarse a los eventos que la ejecución había leído. Para actuar antes de
que termine una ejecución, cerrando sus posiciones abiertas por ejemplo, envíale un comando ([Manejar un
comando](#manejar-un-comando)) y detén la ejecución una vez aplicado el comando.

### Una estrategia que deja una fuente

`detach();` pide a la plataforma que quite una fuente, porque la estrategia ha acabado con ella ([Una estrategia que deja una
fuente](/docs/developers/api/live#una-estrategia-que-deja-una-fuente)):

- en un cuerpo de **ventana** termina la fuente que lee el instrumento sobre el que trata la ventana;
- en `onAttach { }` termina el adjuntado del que informa el gancho: `detach();` es lo mismo que `detach($context);`;
- en `onDetach { }` se puede llamar y no hace nada: la fuente ya se está yendo.

```
strategy "Quick look" kline

setup:
  window close m5 { emitInfo("seen", close); detach(); }
```

La petición se aplica antes del siguiente evento y a `onDetach` de la estrategia se le dice `"STRATEGY"`. Un backtest, o una ejecución de barrido, deja de leer
ahí también y termina `Completed` con los resultados de lo que leyó ([Backtests](/docs/developers/api/backtest_execute#una-estrategia-puede-terminar-su-backtest-antes)).

`detach` no cierra nada ni cancela nada: la posición que tiene la estrategia, y las órdenes que ha puesto, son suyas para resolverlas antes de irse.
Una estrategia que toma su beneficio y no quiere saber más del token vende primero y hace `detach` después, en ese orden:

```
strategy "Take profit and leave"

param takeProfit = 1.25 "Price at which it sells and leaves"

setup:
  window price m1 {
    if (price >= takeProfit) {
      emitSell(price);
      detach();
    }
  }
```

Una estrategia Java sobrescribe los mismos dos métodos de `Strategy` - consulta [Programar estrategias en
Java](/docs/strategies/java/strategy_coding#adjuntar-y-quitar-una-fuente).

## Dimensionado

Una estrategia dice cuándo y en qué sentido, no cuánto. `emitBuy(price)` y `emitSell(price)` llevan un precio y nada
más, y ninguna llamada pone una cantidad ni un nocional en una señal. El tamaño de cada entrada es un ajuste de la
ejecución, `percentAmountToLock`: el porcentaje del saldo libre de la cuenta que bloquea una entrada, por encima de
0 y hasta 100.

Dónde se da depende de la ejecución: `baseConfig` en un [backtest](/docs/developers/api/backtest_execute) o un
[barrido](/docs/developers/api/backtest_sweep), el bloque `paper` en una [ejecución en vivo en papel](/docs/developers/api/live_paper). Si se omite, un
backtest pone todo el saldo libre en cada entrada y la cuenta en papel de una ejecución en vivo bloquea el 10 %.
Para ver cómo se comporta una estrategia con otro tamaño, vuelve a ejecutarla con otro `percentAmountToLock`; el
fichero no cambia.

## Ejecutarla

Una estrategia QTScript registrada se prepara, ejecuta y barre como cualquier otra:
[`prepare`, `execute`](/docs/developers/api/backtest_execute) y [`executeSweep`](/docs/developers/api/backtest_sweep), con el `strategyId`
que recibiste. Los ejes de barrido y `params` usan los nombres de tus líneas `param`.

| `strategy …` | Prepare | Execute | Sweep |
|---|---|---|---|
| ticker (por defecto) | sí | sí | sí |
| `kline` | sí | sí | sí |
| `funding` | sí | no | no |

Consulta [Fuentes de datos](/docs/developers/api/backtest_execute#fuentes-de-datos) para los detalles, incluido por qué
una estrategia `funding` se puede registrar y sus datos preparar, pero no ejecutar.

## Cuando algo va mal

Los errores se reportan contra **tu** fichero, nunca contra el Java generado. Registrar un fuente
con un error es un `400` cuyo mensaje lleva entradas `Line N, Column M:`, tanto para errores
propios de QTScript (una sección desconocida, un periodo inválido, un parámetro duplicado, un
patrón de instrumento mal formado) como para errores de Java dentro de un cuerpo.

**Un `200` de `POST /strategy` significa que el fuente se analizó y compiló, no que vaya a funcionar.**
Registrar no monta la estrategia, así que lo que solo aparece al montarla lo halla
[`validate`](/docs/developers/api/strategy#comprobar-que-realmente-funciona), que lo reporta contra tu fichero de la misma
forma. El caso a conocer es una ventana sobre un indicador que no está registrado,
`window noexiste m1 { ... }`: se registra, y `validate` acaba `failed` en la línea de la ventana,
`QTScript line 4: unknown indicator 'noexiste'` (consulta
[En qué indicador está una ventana](#en-qué-indicador-está-una-ventana)). Llama a `validate` antes de
ejecutar una estrategia que acabas de escribir.

Un fallo mientras corre la estrategia se registra en el job de la misma forma, en la línea de la que
viene el cuerpo:

```
QTScript line 6: Index 2 out of bounds for length 1
```

## El id de la estrategia

`POST /strategy` devuelve el mismo `strategyId` para el mismo fuente. Para QTScript el id sale del
texto, porque la indentación es parte de la gramática: una marca de orden de bytes (BOM), el estilo
de saltos de línea, los espacios en blanco al final de línea y las líneas en blanco antes de la
primera y después de la última se ignoran; cualquier otra cosa — un comentario, la indentación, una
línea en blanco intermedia — da un id distinto. (Las estrategias Java son más tolerantes; consulta
[Estrategias](/docs/developers/api/strategy#compilar-una-estrategia).)

## Qué no hace

Por diseño, y cada punto es una razón para escribir la estrategia en Java en su lugar:

- **Sin `update()`.** Las ventanas son el modelo; una estrategia que necesita ver cada tick
  pertenece a Java.
- **Sin lógica entre instrumentos** — leer los indicadores de otros instrumentos necesita la clase
  completa.
- **Sin clases de indicador personalizadas**, sin campos o métodos extra más allá de los que
  declaran las secciones, y sin estrategias multi-fuente.
- **Una sola clase.** Cualquier cosa que quiera tipos auxiliares es una estrategia Java.

Cambiar nunca es un callejón sin salida: un fichero `.qtscript` es una clase Java con la ceremonia
quitada.

## Para ir más allá

La skill mantenida **`qtsurfer-qtscript-strategy`** tiene la referencia completa del lenguaje —
cada sección, el filtro de instrumentos en detalle, nombres reservados, y más ejemplos — y funciona
con agentes que leen skills:

```bash
npx skills add QTSurfer/strategy-skills --skill qtsurfer-qtscript-strategy
```

Los cuerpos se escriben contra la API de estrategias documentada en la skill
[`qtsurfer-java-strategy`](https://github.com/QTSurfer/strategy-skills) y en
[Programar estrategias en Java](/docs/strategies/java/strategy_coding).
