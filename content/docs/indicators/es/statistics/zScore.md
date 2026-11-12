---
title: "Puntuación z"
description: "Cómo la puntuación z dice a cuántas desviaciones típicas está el último precio de la media de los últimos precios, por qué no puede pasar de la raíz de N menos 1, y cómo usarla en una estrategia de QTSurfer."
order: 7.03
---

La **puntuación z** dice a cuántas desviaciones típicas está el último precio de la media de los últimos `N` precios.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="zScore"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
z = (precio − media) / desviación        media y desviación de los últimos N precios, incluido el último
```

La desviación es la [desviación típica exacta](/docs/indicators/statistics/exactStdDev), que divide por `N`. Una ventana que no se mueve da 0. Da el valor por listo tras `N` actualizaciones, y el gráfico dibuja desde ahí.

## Cómo leerla

- **No puede pasar de `√(N − 1)`**, porque el último precio forma parte de la ventana con la que se mide: 4,36 con periodo 20, y 2 con periodo 5. Un valor atípico sobre una ventana que no se mueve da exactamente eso.
- **No es raro pasar de 2.** En las series reales del gráfico, con periodo 20, la puntuación z pasa de ±2 en del 9 % al 12 % de las barras y de ±3 en el 1,4 %. Los precios tienen tendencia, y el último suele estar lejos de la media de una ventana de la que se acaba de alejar.
- **La línea de cero es la media de la ventana**: por encima el precio está sobre su propia media reciente, por debajo está por debajo.

## En una estrategia

```
uses pro.zScore
setup:
  zScore(20)
```

`zScore(20)` registra `zscore20`. En Java la clase es `ZScoreRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, y un grupo la recibe con `indicators.add("zscore20", new ZScoreRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Desviación típica exacta](/docs/indicators/statistics/exactStdDev): la desviación por la que divide.
- [%B de Bollinger](/docs/indicators/bands/bollingerPercentB): dónde está el precio dentro de una banda de la media y la desviación.
- [Media móvil simple](/docs/indicators/averages/sma): la media que resta, cuando es la media simple.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
