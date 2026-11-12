---
title: "Desviación típica exacta"
description: "Cómo la desviación típica exacta mide la dispersión de los últimos precios en las unidades del precio, dividiendo por N donde la libre divide por N menos 1, y cómo usarla en una estrategia de QTSurfer."
order: 7.02
---

La **desviación típica exacta** es la raíz cuadrada de la media de los cuadrados de las distancias de los últimos `N` precios a su media. Es la contrapartida pro de la [desviación típica](/docs/indicators/volatility/stdDev): divide por `N`, donde aquella divide por `N − 1`.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="exactStdDev"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
desviación = √( Σ (precio − media)² / N )        sobre los últimos N precios
```

Es la raíz cuadrada de la [varianza exacta](/docs/indicators/statistics/exactVariance), calculada a partir de los últimos `N` precios en cada actualización. Una ventana que no se mueve da 0. Da el valor por listo tras `N` actualizaciones, y el gráfico dibuja desde ahí.

## Cómo leerla

- **Está en las unidades del precio**, así que dice en cuántos dólares, o en lo que sea el precio, se reparten los últimos `N` precios. Crece con el precio: compárala con el precio, o usa un indicador porcentual, para comparar instrumentos.
- **Es la desviación típica libre vista desde el otro lado.** La [desviación típica](/docs/indicators/volatility/stdDev) libre es esta multiplicada por `√(N / (N − 1))`: 1,026 con periodo 20, en cada barra de las series reales del gráfico.
- **Es el denominador de la [puntuación z](/docs/indicators/statistics/zScore).** Las [bandas de Bollinger](/docs/indicators/bands/bollinger) usan en cambio la desviación libre, así que con periodo 20 su semianchura es 1,026 veces esta antes del multiplicador.

## En una estrategia

```
uses pro.exactStdDev
setup:
  exactStdDev(20)
```

`exactStdDev(20)` registra `xstd20`. El motor divide por `N − 1` en su lugar cuando se activa su indicador de muestra (`withSampleVariance(true)` en Java), lo que da la desviación típica libre. En Java la clase es `StandardDeviationRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, y un grupo la recibe con `indicators.add("xstd20", new StandardDeviationRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Desviación típica](/docs/indicators/volatility/stdDev): la desviación típica libre, que divide por N − 1.
- [Varianza exacta](/docs/indicators/statistics/exactVariance): su cuadrado.
- [ATR](/docs/indicators/volatility/atr): la dispersión de las barras en vez de la de los cierres.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
