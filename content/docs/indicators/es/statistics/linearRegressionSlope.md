---
title: "Pendiente de la regresión lineal"
description: "Cómo la pendiente de la regresión lineal da la pendiente, en unidades de precio por barra, de la recta que mejor ajusta los últimos precios, y cómo usarla en una estrategia de QTSurfer."
order: 7.06
lastUpdated: '2026-11-12T18:54:41Z'
---

La **pendiente de la regresión lineal** es la pendiente de la recta que mejor ajusta los últimos `N` precios, por mínimos cuadrados, en unidades de precio por barra.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="linearRegressionSlope"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
pendiente = Σ (t − media t)(precio − media precio) / Σ (t − media t)²        t = 0 … N − 1, los últimos N precios
```

El denominador es `N (N² − 1) / 12`. Necesita al menos 2 periodos, y una ventana que no se mueve da 0. Da el valor por listo tras `N` actualizaciones, y el gráfico dibuja desde ahí. El motor registra la ordenada en el origen junto a la pendiente, `lrs20Intercept`: la altura de la recta ajustada en la primera barra de la ventana, `media del precio − pendiente × (N − 1) / 2`. El gráfico dibuja solo la pendiente.

## Cómo leerla

- **En una recta lee exactamente la pendiente de la recta**: +3 por barra para los precios 50, 53, 56…, con cualquier periodo.
- **Está en unidades de precio por barra, así que no se compara entre instrumentos.** En las series reales del gráfico va de −1398 a 1121 en la diaria BTC/USDT y de −7,1 a 2,5 en la de 15 minutos ETH/USDT. Una regla que la compara con un número queda atada a un instrumento y a una temporalidad; divídela por el precio para comparar.
- **La línea de cero es el signo de la tendencia de la ventana.** En las series reales del gráfico la pendiente es positiva en del 40 % al 53 % de las barras.

## En una estrategia

```
uses pro.linearRegressionSlope
setup:
  linearRegressionSlope(20)
```

`linearRegressionSlope(20)` registra `lrs20`, con la ordenada en el origen a su lado como `lrs20Intercept`. En Java la clase es `LinearRegressionSlopeRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, y un grupo la recibe con `indicators.add("lrs20", new LinearRegressionSlopeRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Regresión lineal simple](/docs/indicators/statistics/simpleLinearRegression): la misma pendiente, con lo bien que ajusta la recta.
- [Media móvil de mínimos cuadrados](/docs/indicators/averages/leastSquaresMovingAverage): el extremo de la misma recta, como precio.
- [Media móvil simple](/docs/indicators/averages/sma): la media simple de la misma ventana.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
