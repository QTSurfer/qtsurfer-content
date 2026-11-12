---
title: "Varianza exacta"
description: "Cómo la varianza exacta mide la dispersión de los últimos precios, dividiendo por N donde la varianza libre divide por N menos 1, y cómo usarla en una estrategia de QTSurfer."
order: 7.01
---

La **varianza exacta** es la media de los cuadrados de las distancias de los últimos `N` precios a su media. Es la contrapartida pro de la [varianza](/docs/indicators/volatility/variance): divide por `N`, donde aquella divide por `N − 1`.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="exactVariance"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
varianza = Σ (precio − media)² / N        sobre los últimos N precios
```

El motor la calcula a partir de los últimos `N` precios en cada actualización, primero la media y luego los cuadrados de las distancias, y no con sumas acumuladas. Una ventana que no se mueve da 0. Da el valor por listo tras `N` actualizaciones, y el gráfico dibuja desde ahí.

## Cómo leerla

- **Es la varianza libre vista desde el otro lado.** La [varianza](/docs/indicators/volatility/variance) libre es esta multiplicada por `N / (N − 1)`: 1,053 con periodo 20, en cada barra de las series reales del gráfico.
- **Rara vez se lee por sí sola.** Sus unidades son el cuadrado de las del precio, así que su tamaño dice poco a simple vista; la [desviación típica exacta](/docs/indicators/statistics/exactStdDev) es su raíz cuadrada, en las unidades del precio.
- **Nunca baja de 0**, y vale 0 en una ventana que no se mueve.

## En una estrategia

```
uses pro.exactVariance
setup:
  exactVariance(20)
```

`exactVariance(20)` registra `xvar20`. El motor divide por `N − 1` en su lugar cuando se activa su indicador de muestra (`withSampleVariance(true)` en Java), lo que da la varianza libre. En Java la clase es `VarianceRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, y un grupo la recibe con `indicators.add("xvar20", new VarianceRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Varianza](/docs/indicators/volatility/variance): la varianza libre, que divide por N − 1.
- [Desviación típica exacta](/docs/indicators/statistics/exactStdDev): su raíz cuadrada, en las unidades del precio.
- [Puntuación z](/docs/indicators/statistics/zScore): cuánto se aleja el último precio de la media, en desviaciones.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
