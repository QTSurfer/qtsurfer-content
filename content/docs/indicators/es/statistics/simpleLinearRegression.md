---
title: "Regresión lineal simple"
description: "Cómo la regresión lineal simple ajusta una recta a los últimos precios y da lo bien que ajusta, con la pendiente, la ordenada en el origen, el R cuadrado y el error típico, y cómo usarla en una estrategia de QTSurfer."
order: 7.07
---

La **regresión lineal simple** ajusta una recta a los últimos `N` precios, por mínimos cuadrados, y dice lo bien que ajusta: la pendiente, la ordenada en el origen, el R² y el error típico.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="simpleLinearRegression"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
pendiente = Σ (t − media t)(precio − media precio) / Σ (t − media t)²        t = 0 … N − 1, los últimos N precios
R²        = (Σ (t − media t)(precio − media precio))² / (Σ (t − media t)² × Σ (precio − media precio)²)
error     = √( (Σ (precio − media precio)² − pendiente × Σ (t − media t)(precio − media precio)) / (N − 2) )
```

El gráfico dibuja la pendiente, la línea principal. El motor registra el resto a su lado: `slr20Intercept`, `slr20RSquared` y `slr20StandardError`. El R² es 0 en una ventana que no se mueve; el error es 0 con menos de 3 valores o cuando el ajuste es perfecto. Necesita al menos 2 periodos, y da el valor por listo tras `N` actualizaciones.

## Cómo leerla

- **El R² dice si creer la pendiente.** 1 significa que todos los precios están sobre la recta; 0 que la recta no explica nada de la dispersión. En una recta vale 1. En las series reales del gráfico, con periodo 20, su media es de 0,39 a 0,44, está por encima de 0,8 en del 9 % al 14 % de las barras y por debajo de 0,2 en del 27 % al 34 %.
- **El error típico está en unidades de precio**: lo lejos que están los precios de la recta, de media. En una subida recta de 2 por barra con una oscilación de ±1, el R² lee 0,995 y el error 0,85.
- **La pendiente es el número de la [pendiente de la regresión lineal](/docs/indicators/statistics/linearRegressionSlope)**, la misma recta con el mismo ajuste; esta página añade el ajuste.

## En una estrategia

```
uses pro.simpleLinearRegression
setup:
  simpleLinearRegression(20)
```

`simpleLinearRegression(20)` registra `slr20`, con `slr20Intercept`, `slr20RSquared` y `slr20StandardError` a su lado. En Java la clase es `SimpleLinearRegressionRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, y un grupo la recibe con `indicators.add("slr20", new SimpleLinearRegressionRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Pendiente de la regresión lineal](/docs/indicators/statistics/linearRegressionSlope): la pendiente sola.
- [Media móvil de mínimos cuadrados](/docs/indicators/averages/leastSquaresMovingAverage): el extremo de la misma recta, como precio.
- [Puntuación z](/docs/indicators/statistics/zScore): otra forma de decir lo lejos que está el último precio de lo que sugiere la ventana.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
