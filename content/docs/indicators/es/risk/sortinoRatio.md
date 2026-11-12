---
title: "Ratio de Sortino"
description: "Cómo el ratio de Sortino divide el rendimiento medio de las últimas barras por la desviación de los rendimientos por debajo de un objetivo, de modo que solo las caídas cuentan como riesgo, y cómo usarlo en una estrategia de QTSurfer."
order: 8.02
lastUpdated: '2026-11-12T20:44:51Z'
---

El **ratio de Sortino**, de Frank Sortino, es el ratio de Sharpe con solo la caída como riesgo: el rendimiento medio sobre la desviación de los rendimientos que quedan por debajo de un objetivo. Aquí es por barra, sin anualizar.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="sortinoRatio"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
r       = ln(precio / precio anterior)                                   el rendimiento de cada barra
Sortino = (media(r) − objetivo) / √( Σ min(r − objetivo, 0)² / N )        sobre los últimos N rendimientos, el objetivo 0 por defecto
```

La desviación a la baja divide por `N`, toda la ventana, y no por el número de barras que perdieron. Una ventana sin ninguna pérdida tiene desviación 0, y el ratio lee 0, no un valor alto. `N` rendimientos necesitan `N + 1` precios, así que el primer valor llega en la actualización `N + 1`, y la línea lee 0 antes. El motor admite un rendimiento mínimo aceptable, el objetivo, y un factor de anualización que multiplica el resultado, 1 por defecto; las formas de QTScript con números extra los pasan (consulta el catálogo).

## Cómo leerlo

- **Solo las caídas cuentan como riesgo.** En una ventana que solo cae, todo rendimiento es una pérdida, la media es la desviación a la baja con el signo cambiado, y el ratio lee exactamente −1.
- **Tiene el signo del rendimiento medio**, como el ratio de Sharpe, y en las series reales del gráfico, con periodo 20, va de −0,56 a 2,7: sube más que el ratio de Sharpe porque una ventana con pocas pérdidas tiene una desviación a la baja pequeña. Es mayor que el ratio de Sharpe en valor absoluto en del 92 % al 97 % de las barras.
- **Una ventana sin ninguna pérdida lee 0**, no un valor alto: un precio que sube un 1 % cada barra lee 0, y también uno que no se mueve.

## En una estrategia

```
uses pro.sortinoRatio
setup:
  sortinoRatio(20)
```

`sortinoRatio(20)` registra `sortino20`. En Java la clase es `SortinoRatioRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, y un grupo la recibe con `indicators.add("sortino20", new SortinoRatioRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Ratio de Sharpe](/docs/indicators/risk/sharpeRatio): la misma idea con toda la dispersión como riesgo.
- [Ratio omega](/docs/indicators/risk/omegaRatio): ganancias sobre pérdidas, como sumas.
- [Valor en riesgo](/docs/indicators/statistics/valueAtRisk): la pérdida que no se espera que supere una barra.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
