---
title: Indicadores de QTScript
description: Todos los indicadores que puede llamar una estrategia QTScript, gratuitos y pro, agrupados por tipo.
order: 8
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: 5d1c461f4ecc701b2d109b09fe898d6a563d6944
upstreamPath: skills/qtsurfer-qtscript-strategy/references/indicators.md
lastUpdated: '2026-11-05T17:34:21Z'
---

Todos los indicadores que puede llamar un fichero `.qtscript`, agrupados por tipo, con lo que calcula cada uno. Una línea bajo
`setup:` escribe una llamada por su nombre desnudo, como `ema(20)` o `atr(14)`.

- **Los argumentos que acepta cada nombre** son las formas de la tabla bajo «Qué va bajo `setup:`» en
  [la guía de QTScript](/docs/strategies/qtscript#qué-va-bajo-setup). Esta página no las repite.
- Los nombres **gratuitos** funcionan en todos los planes. Hay 39.
- Los nombres **pro** vienen con los planes Pro y Elite y necesitan una línea `uses` (consulta «Los indicadores pro: `uses`» en
  [la guía de QTScript](/docs/strategies/qtscript#los-indicadores-pro-uses), que trae sus formas y los nombres que
  registran). Hay 12.
- Llamado sin un nombre propio, un indicador registra un nombre formado por el suyo y sus parámetros: `rsi(14)` registra
  `rsi14`, `ema(9)` registra `ema9` y `wma(5)` registra `wma5`. Cuando el nombre no es tan evidente, las notas lo dan.
- Un nombre que no está en ninguna de las dos listas, y un nombre pro cuya línea `uses` falta, se rechaza como
  `unknown indicator '<nombre>'`.

| Grupo              | Nombres gratuitos |
| ------------------ | ----------------: |
| Medias             |                 7 |
| Osciladores        |                 4 |
| Bandas             |                 3 |
| Volatilidad        |                 5 |
| Distancia y cambio |                 4 |
| Conteo y extremos  |                 5 |
| Aritmética         |                 3 |
| Transformaciones   |                 2 |
| Comparaciones      |                 6 |

## Medias

| Nombre | Qué es                                 | Notas                                                                                                      |
| ------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `sma`  | Media móvil simple                     | Discreta por defecto; `sma(String, int, boolean)` con `false` es el modo continuo                          |
| `ema`  | Media móvil exponencial                |                                                                                                            |
| `wma`  | Media móvil ponderada                  |                                                                                                            |
| `tema` | Media móvil exponencial triple         |                                                                                                            |
| `hma`  | Media móvil de Hull                    |                                                                                                            |
| `kama` | Media móvil adaptativa de Kaufman      | Recibe el periodo de la razón de eficiencia y los periodos rápido y lento; `kama()` registra `kama10_2_30` |
| `mma`  | Media móvil con el suavizado de Wilder |                                                                                                            |

## Osciladores

| Nombre     | Qué es                                       | Notas                                                                                          |
| ---------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `rsi`      | Índice de fuerza relativa                    | El de Cutler por defecto; `rsi(int, boolean)` con `false` es el suavizado de Wilder            |
| `stochRsi` | RSI estocástico                              | Entre 0 y 100; `stochRsi(14)` registra `stochRsi14`                                            |
| `macd`     | Convergencia y divergencia de medias móviles | 12 y 26 por defecto; `macd()` registra `macd`; la última forma lo ejecuta sobre otro indicador |
| `cci`      | Índice de canal de materias primas           | `cci(20)` registra `cci20`                                                                     |

## Bandas

| Nombre               | Qué es                                                         | Notas                                                                     |
| -------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `bollinger`          | Bandas de Bollinger                                            | Registra la línea central y, a su lado, `<nombre>Upper` y `<nombre>Lower` |
| `bollingerBandwidth` | Anchura de una banda de Bollinger, en porcentaje               | Recibe el nombre de la banda que mide                                     |
| `bollingerPercentB`  | %B de Bollinger, dónde se sitúa el precio dentro de las bandas | Trae bandas propias; `bollingerPercentB()` registra `pctB20_2`            |

## Volatilidad

| Nombre              | Qué es                                            | Notas                                                                                                                                                                                                     |
| ------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `atr`               | Rango verdadero medio, con el suavizado de Wilder | **Lee barras completas: úsalo en una estrategia `kline`.** En una estrategia `ticker` sus valores no son los de la barra y no significan nada. `atr()` registra `atr14`. Es gratuito: no existe `pro.atr` |
| `stdDev`            | Desviación típica                                 |                                                                                                                                                                                                           |
| `variance`          | Varianza                                          |                                                                                                                                                                                                           |
| `volatility`        | Media de la frecuencia con que cambia el precio   | `volatility(5)` registra `vol5`                                                                                                                                                                           |
| `percentVolatility` | Lo mismo, como porcentaje                         | `percentVolatility(5)` registra `pvol5`                                                                                                                                                                   |

## Distancia y cambio

| Nombre          | Qué es                                                      | Notas                                   |
| --------------- | ----------------------------------------------------------- | --------------------------------------- |
| `distance`      | Distancia entre dos indicadores, `(a - b) / b`              |                                         |
| `distanceMa`    | Distancia del precio a una media móvil, `(close - ma) / ma` |                                         |
| `rateChange`    | Tasa de cambio                                              | La forma con `boolean` elige porcentaje |
| `percentChange` | Cambio porcentual, tick a tick                              |                                         |

## Conteo y extremos

| Nombre | Qué es                            | Notas |
| ------ | --------------------------------- | ----- |
| `gain` | Periodos consecutivos de ganancia |       |
| `loss` | Periodos consecutivos de pérdida  |       |
| `max`  | Máximo acumulado                  |       |
| `min`  | Mínimo acumulado                  |       |
| `sum`  | Suma acumulada                    |       |

## Aritmética, transformaciones y comparaciones

| Nombre                                                                      | Qué es                                                               | Notas                                                                                                                                                                                   |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `add`                                                                       | Suma de dos indicadores                                              |                                                                                                                                                                                         |
| `diff`                                                                      | El primer indicador menos el segundo                                 |                                                                                                                                                                                         |
| `mul`                                                                       | Un indicador escalado por un número, o dos indicadores multiplicados |                                                                                                                                                                                         |
| `clamp`                                                                     | Un indicador limitado a un rango                                     |                                                                                                                                                                                         |
| `round`                                                                     | Un indicador redondeado a un número de decimales                     |                                                                                                                                                                                         |
| `equal`, `notEqual`, `greatThan`, `greatOrEqual`, `lessThan`, `lessOrEqual` | Un indicador comparado con un número, como indicador booleano        | Las formas de cinco argumentos eligen entre dos indicadores: `equal("selected", "signal", 1, "emaFast", "emaSlow")` da `emaFast` mientras `signal` vale 1 y `emaSlow` en caso contrario |

## Los indicadores pro

Una línea `uses` los trae: `uses pro.adx, pro.obv` para esos dos, `uses pro.*` para los doce, y varias líneas `uses` se suman. Un plan sin ellos puede registrar la estrategia, pero no ejecutarla (`402`).

Once de los doce leen barras completas, no un solo valor, así que van en una estrategia `kline`: en una estrategia `ticker` sus valores no son los de la barra y no significan nada. `kurtosis` es la excepción, porque lee un solo valor, el precio del grupo (el cierre en una vela), así que significa algo en una estrategia `ticker` y no emite aviso.

### Tendencia

| Nombre       | Qué es                   | Notas                                                                                        |
| ------------ | ------------------------ | -------------------------------------------------------------------------------------------- |
| `adx`        | Índice direccional medio | Las dos líneas direccionales se registran a su lado                                          |
| `superTrend` | Línea SuperTrend         | Una banda superior y otra inferior se registran a su lado                                    |
| `ichimoku`   | Nube de Ichimoku         | La línea Tenkan es la principal, con las líneas Kijun, Senkou A, Senkou B y Chikou a su lado |

### Volumen

| Nombre | Qué es                             | Notas |
| ------ | ---------------------------------- | ----- |
| `obv`  | Volumen en balance (OBV)           |       |
| `vwap` | Precio medio ponderado por volumen |       |
| `mfi`  | Índice de flujo de dinero          |       |
| `cmf`  | Flujo de dinero de Chaikin         |       |

### Estadística

| Nombre     | Qué es                                                 | Notas                                                      |
| ---------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| `kurtosis` | Curtosis en exceso del precio a lo largo de un periodo | Lee un solo valor, no una barra. El periodo es obligatorio |

### Estimadores de volatilidad

Cada uno recibe un factor de anualización como último argumento, opcional.

| Nombre           | Qué es                         | Notas                                                     |
| ---------------- | ------------------------------ | --------------------------------------------------------- |
| `parkinson`      | Volatilidad de Parkinson       | A partir del máximo y el mínimo                           |
| `garmanKlass`    | Volatilidad de Garman-Klass    | A partir de la apertura, el máximo, el mínimo y el cierre |
| `rogersSatchell` | Volatilidad de Rogers-Satchell | A partir de la apertura, el máximo, el mínimo y el cierre |
| `yangZhang`      | Volatilidad de Yang-Zhang      | A partir de la apertura, el máximo, el mínimo y el cierre |

## Lo que QTScript no puede llamar

Los métodos del builder que reciben una función (`predicate`, `fun`, `decorate`, `periodCount`) y `conditional` solo se pueden
escribir en una estrategia Java. También las clases de indicadores que no son nombres del builder: el motor Java tiene muchas
más, gratuitas y pro (un z-score, Aroon, el ratio de Sharpe y otras), y el
[catálogo de indicadores Java](/docs/strategies/java/indicators) las lista con el paquete de cada una.
