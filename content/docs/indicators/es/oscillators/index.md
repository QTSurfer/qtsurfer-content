---
title: "Osciladores"
description: "Indicadores que oscilan entre niveles o alrededor de una línea central en lugar de seguir el precio: el RSI, el RSI estocástico, el MACD, el CCI y diez osciladores pro."
order: 2
---

En los catálogos de QTSurfer, los osciladores son `rsi`, `stochRsi`, `macd`, `cci` y los osciladores pro `momentum`, `roc`, `cmo`, `trueStrengthIndex`, `trix`, `coppockCurve`, `knowSureThing`, `chandeForecastOscillator`, `detrendedPriceOscillator` y `fisherTransform`: indicadores que oscilan entre niveles o alrededor de una línea central en lugar de seguir el precio. Se leen frente a esos niveles, para juzgar si un movimiento ha ido más lejos de lo habitual o si su impulso se debilita.

- [RSI](/docs/indicators/oscillators/rsi): fuerza relativa, entre 0 y 100.
- [RSI estocástico](/docs/indicators/oscillators/stochRsi): dónde está el RSI dentro de su propio rango reciente, entre 0 y 100.
- [MACD](/docs/indicators/oscillators/macd): la distancia entre dos medias exponenciales, con su línea de señal y su histograma.
- [CCI](/docs/indicators/oscillators/cci): a qué distancia está el precio de su media, en unidades de la desviación habitual.
- [Momento](/docs/indicators/oscillators/momentum) y [tasa de cambio](/docs/indicators/oscillators/roc): el cambio en `N` barras, en unidades de precio y en porcentaje. Indicadores pro.
- [Oscilador de momento de Chande](/docs/indicators/oscillators/cmo): las ganancias frente a las pérdidas de los últimos cambios, de −100 a 100. Un indicador pro.
- [Índice de fuerza verdadera](/docs/indicators/oscillators/trueStrengthIndex) y [TRIX](/docs/indicators/oscillators/trix): momento con doble y triple suavizado. Indicadores pro.
- [Curva de Coppock](/docs/indicators/oscillators/coppockCurve) y [Know Sure Thing](/docs/indicators/oscillators/knowSureThing): tasas de cambio suavizadas sumadas. Indicadores pro.
- [Oscilador de pronóstico de Chande](/docs/indicators/oscillators/chandeForecastOscillator) y [oscilador de precio sin tendencia](/docs/indicators/oscillators/detrendedPriceOscillator): el precio frente a su recta de regresión, y un precio pasado frente a la media. Indicadores pro.
- [Transformada de Fisher](/docs/indicators/oscillators/fisherTransform): el precio situado en su rango reciente, con los extremos estirados. Un indicador pro.

Los osciladores pro de aquí leen un solo precio, así que sirven en una estrategia `ticker` o `kline`.

Los catálogos tienen todos los osciladores con sus formas: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators).
