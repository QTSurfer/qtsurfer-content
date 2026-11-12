---
title: "Volatilidad"
description: "Indicadores de cuánto se mueve el precio: el rango verdadero medio, la desviación típica, la varianza, los indicadores de volatilidad del motor y los cuatro estimadores OHLC."
order: 4
lastUpdated: '2026-11-12T00:02:30Z'
---

En los catálogos de QTSurfer, los indicadores de volatilidad son `atr`, `stdDev`, `variance`, `volatility` y `percentVolatility`, y los cuatro estimadores OHLC `parkinson`, `garmanKlass`, `rogersSatchell` y `yangZhang`: medidas de cuánto se mueve el precio, o de con qué frecuencia. Responden preguntas distintas, y las unidades las distinguen: unas están en las unidades del precio, una en su cuadrado, dos en porcentaje, y los estimadores son una fracción del precio por barra.

- [ATR](/docs/indicators/volatility/atr): cuánto se mueve el precio en una barra, huecos incluidos, en unidades de precio. Necesita barras.
- [Desviación típica](/docs/indicators/volatility/stdDev): cuán dispersos están los últimos precios, en unidades de precio.
- [Varianza](/docs/indicators/volatility/variance): su cuadrado.
- [Volatilidad](/docs/indicators/volatility/volatility): con qué frecuencia cambia el precio, como porcentaje de las actualizaciones.
- [Volatilidad porcentual](/docs/indicators/volatility/percentVolatility): el tamaño medio de los cambios, en porcentaje.
- [Parkinson](/docs/indicators/volatility/parkinson), [Garman-Klass](/docs/indicators/volatility/garmanKlass), [Rogers-Satchell](/docs/indicators/volatility/rogersSatchell) y [Yang-Zhang](/docs/indicators/volatility/yangZhang): cuatro estimadores de la volatilidad por barra a partir de la apertura, el máximo, el mínimo y el cierre. Son indicadores pro: vienen con los planes Pro y Elite y leen barras completas.

Los catálogos los tienen con sus formas: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators).
