---
title: "Volatilidad"
description: "Indicadores de cuánto se mueve el precio: el rango verdadero medio, la desviación típica, la varianza, los indicadores de volatilidad del motor, los cuatro estimadores OHLC y seis indicadores pro más."
order: 4
---

En los catálogos de QTSurfer, los indicadores de volatilidad son `atr`, `stdDev`, `variance`, `volatility` y `percentVolatility`, los cuatro estimadores OHLC `parkinson`, `garmanKlass`, `rogersSatchell` y `yangZhang`, y los indicadores pro `natr`, `choppinessIndex`, `massIndex`, `ewmaVolatility`, `realizedVolatility` y `relativeVolatilityIndex`: medidas de cuánto se mueve el precio, o de con qué frecuencia. Responden preguntas distintas, y las unidades las distinguen: unas están en las unidades del precio, una en su cuadrado, algunas en porcentaje del precio y otras por barra.

- [ATR](/docs/indicators/volatility/atr): cuánto se mueve el precio en una barra, huecos incluidos, en unidades de precio. Necesita barras.
- [Desviación típica](/docs/indicators/volatility/stdDev): cuán dispersos están los últimos precios, en unidades de precio.
- [Varianza](/docs/indicators/volatility/variance): su cuadrado.
- [Volatilidad](/docs/indicators/volatility/volatility): con qué frecuencia cambia el precio, como porcentaje de las actualizaciones.
- [Volatilidad porcentual](/docs/indicators/volatility/percentVolatility): el tamaño medio de los cambios, en porcentaje.
- [Parkinson](/docs/indicators/volatility/parkinson), [Garman-Klass](/docs/indicators/volatility/garmanKlass), [Rogers-Satchell](/docs/indicators/volatility/rogersSatchell) y [Yang-Zhang](/docs/indicators/volatility/yangZhang): cuatro estimadores de la volatilidad por barra a partir de la apertura, el máximo, el mínimo y el cierre. Indicadores pro que leen barras completas.
- [NATR](/docs/indicators/volatility/natr): el ATR como porcentaje del cierre. Un indicador pro que lee barras completas.
- [Índice de choppiness](/docs/indicators/volatility/choppinessIndex) e [índice de masa](/docs/indicators/volatility/massIndex): si el mercado divaga, y si el rango se ensancha. Indicadores pro que leen barras completas.
- [Volatilidad EWMA](/docs/indicators/volatility/ewmaVolatility) y [volatilidad realizada](/docs/indicators/volatility/realizedVolatility): la volatilidad por barra a partir de los rendimientos logarítmicos, con pesos que decaen o iguales. Indicadores pro que leen un solo precio.
- [Índice de volatilidad relativa](/docs/indicators/volatility/relativeVolatilityIndex): la idea del RSI aplicada a la desviación típica. Un indicador pro que lee un solo precio.

Los catálogos los tienen con sus formas: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators).
