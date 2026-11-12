---
title: "Oscilador de pronóstico de Chande (CFO)"
description: "Cómo el oscilador de pronóstico de Chande da el porcentaje en que el precio está por encima o por debajo de su recta de regresión lineal, y cómo usarlo en una estrategia de QTSurfer."
order: 2.48
lastUpdated: '2026-11-12T21:21:22Z'
---

El **oscilador de pronóstico de Chande** (CFO, por sus siglas en inglés), de Tushar Chande, da el porcentaje en que el precio está por encima o por debajo de su recta de regresión lineal.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="chandeForecastOscillator"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
CFO = 100 × (precio − LSMA) / precio        LSMA sobre los últimos N precios
```

La recta es la [media móvil de mínimos cuadrados](/docs/indicators/averages/leastSquaresMovingAverage): la recta de regresión tomada en la última barra. Algunas formulaciones proyectan la recta una barra hacia delante, el pronóstico de series temporales; el motor no. Necesita al menos 2 periodos. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **Positivo significa que el precio está por encima de su recta de tendencia, negativo por debajo.** En una recta el precio está sobre la recta, y el CFO lee 0.
- **Se queda en una banda estrecha.** En las series reales del gráfico, con periodo 14, está dentro de ±5 en el 93 % de las barras de la diaria BTC/USDT y en todas las de las series horaria y de 15 minutos; sus extremos en la diaria son −12,5 y 9,9.
- **Es positivo en del 47 % al 50 % de las barras** de las series reales del gráfico.

## En una estrategia

```
uses pro.chandeForecastOscillator
setup:
  chandeForecastOscillator(14)
```

`chandeForecastOscillator(14)` registra `cfo14`. En Java la clase es `ChandeForecastOscillatorRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("cfo14", new ChandeForecastOscillatorRTIndicator(14))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil de mínimos cuadrados](/docs/indicators/averages/leastSquaresMovingAverage): la recta de regresión frente a la que mide, como precio.
- [Pendiente de la regresión lineal](/docs/indicators/statistics/linearRegressionSlope): la pendiente de la misma recta.
- [Puntuación z](/docs/indicators/statistics/zScore): la distancia a la media, en desviaciones.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
