---
title: "Osciladores"
description: "Indicadores que oscilan entre niveles o alrededor de una línea central en lugar de seguir el precio: el RSI, el RSI estocástico, el MACD, el CCI y veinte osciladores pro."
order: 2
---

En los catálogos de QTSurfer, los osciladores son `rsi`, `stochRsi`, `macd`, `cci` y veinte osciladores pro: indicadores que oscilan entre niveles o alrededor de una línea central en lugar de seguir el precio. Se leen frente a esos niveles, para juzgar si un movimiento ha ido más lejos de lo habitual o si su impulso se debilita.

- [RSI](/docs/indicators/oscillators/rsi): fuerza relativa, entre 0 y 100.
- [RSI estocástico](/docs/indicators/oscillators/stochRsi): dónde está el RSI dentro de su propio rango reciente, entre 0 y 100.
- [MACD](/docs/indicators/oscillators/macd): la distancia entre dos medias exponenciales, con su línea de señal y su histograma.
- [CCI](/docs/indicators/oscillators/cci): a qué distancia está el precio de su media, en unidades de la desviación habitual.

**Osciladores pro que leen un solo precio**, que sirven en una estrategia `ticker` o `kline`:

- [Momento](/docs/indicators/oscillators/momentum) y [tasa de cambio](/docs/indicators/oscillators/roc): el cambio en `N` barras, en unidades de precio y en porcentaje.
- [Oscilador de momento de Chande](/docs/indicators/oscillators/cmo): las ganancias frente a las pérdidas de los últimos cambios, de −100 a 100.
- [Índice de fuerza verdadera](/docs/indicators/oscillators/trueStrengthIndex) y [TRIX](/docs/indicators/oscillators/trix): momento con doble y triple suavizado.
- [Curva de Coppock](/docs/indicators/oscillators/coppockCurve) y [Know Sure Thing](/docs/indicators/oscillators/knowSureThing): tasas de cambio suavizadas sumadas.
- [Oscilador de pronóstico de Chande](/docs/indicators/oscillators/chandeForecastOscillator) y [oscilador de precio sin tendencia](/docs/indicators/oscillators/detrendedPriceOscillator): el precio frente a su recta de regresión, y un precio pasado frente a la media.
- [Transformada de Fisher](/docs/indicators/oscillators/fisherTransform) y [transformada de Fisher adaptativa](/docs/indicators/oscillators/adaptiveFisherTransform): el precio situado en su rango reciente, con los extremos estirados.
- [RSI de Connors](/docs/indicators/oscillators/connorsRsi): el RSI del precio, el RSI de la racha y el rango percentil del último rendimiento.

**Osciladores pro que leen barras completas**, que van en una estrategia `kline`:

- [Oscilador estocástico](/docs/indicators/oscillators/stochasticOscillator) y [%R de Williams](/docs/indicators/oscillators/williamsR): el cierre situado en el rango de las últimas barras.
- [Oscilador definitivo](/docs/indicators/oscillators/ultimateOscillator): la presión compradora en tres periodos.
- [Oscilador Awesome](/docs/indicators/oscillators/awesomeOscillator) y [oscilador acelerador](/docs/indicators/oscillators/acceleratorOscillator): la distancia entre dos medias del punto medio de cada barra, y su cambio.
- [Balance de poder](/docs/indicators/oscillators/balanceOfPower) e [índice de vigor relativo](/docs/indicators/oscillators/relativeVigorIndex): el movimiento de la apertura al cierre frente al rango.
- [Fuerza alcista y bajista](/docs/indicators/oscillators/bullBearPower): el máximo y el mínimo de cada barra frente a una media exponencial del cierre.

Los catálogos tienen todos los osciladores con sus formas: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators).
