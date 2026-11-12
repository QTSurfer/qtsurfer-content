---
title: "Estadística"
description: "Estadística del precio y de sus rendimientos: la varianza y la desviación exactas, la puntuación z, la asimetría y la curtosis, la regresión, el percentil, el valor en riesgo, la autocorrelación y el exponente de Hurst."
order: 7
---

En los catálogos de QTSurfer, las estadísticas son `exactVariance`, `exactStdDev`, `zScore`, `skewness`, `kurtosis`, `linearRegressionSlope`, `simpleLinearRegression`, `rollingPercentile`, `valueAtRisk`, `autocorrelation` y `hurstExponent`: describen cómo se reparten y qué forma tienen los últimos precios, o los últimos rendimientos. Todas son indicadores pro: vienen con los planes Pro y Elite, y una estrategia los trae con una línea `uses`. Leen un solo precio, así que sirven en una estrategia `ticker` o `kline`.

- [Varianza exacta](/docs/indicators/statistics/exactVariance) y [desviación típica exacta](/docs/indicators/statistics/exactStdDev): la dispersión de los últimos precios, dividiendo por `N` donde las libres dividen por `N − 1`.
- [Puntuación z](/docs/indicators/statistics/zScore): a cuántas desviaciones está el último precio de la media de la ventana.
- [Asimetría](/docs/indicators/statistics/skewness) y [curtosis](/docs/indicators/statistics/kurtosis): cuán desequilibrada está la ventana, y cuán pesadas son sus colas, frente a una distribución normal.
- [Pendiente de la regresión lineal](/docs/indicators/statistics/linearRegressionSlope) y [regresión lineal simple](/docs/indicators/statistics/simpleLinearRegression): la recta que mejor ajusta la ventana, y lo bien que ajusta.
- [Percentil móvil](/docs/indicators/statistics/rollingPercentile): el precio por debajo del cual está una parte de la ventana, con su mediana, mínimo y máximo.
- [Valor en riesgo](/docs/indicators/statistics/valueAtRisk): la pérdida que no se espera que supere una barra, si los rendimientos fueran normales.
- [Autocorrelación](/docs/indicators/statistics/autocorrelation) y [exponente de Hurst](/docs/indicators/statistics/hurstExponent): si los rendimientos continúan o se revierten.

Los catálogos los tienen con sus formas: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators).
