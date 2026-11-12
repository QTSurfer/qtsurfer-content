---
title: "Ratio de Sharpe"
description: "Cómo el ratio de Sharpe divide el rendimiento medio de las últimas barras por lo que varían los rendimientos, por barra y sin anualizar, por qué una ventana sin variación lee 0, y cómo usarlo en una estrategia de QTSurfer."
order: 8.01
lastUpdated: '2026-11-12T20:44:51Z'
---

El **ratio de Sharpe**, de William Sharpe, divide el rendimiento medio de las últimas `N` barras por lo que varían los rendimientos: rendimiento por unidad de riesgo. Aquí es por barra, sin anualizar.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="sharpeRatio"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
r      = ln(precio / precio anterior)                       el rendimiento de cada barra
Sharpe = (media(r) − tasa libre de riesgo) / desviación(r)    sobre los últimos N rendimientos, la tasa 0 por defecto
```

La desviación divide por `N`; una desviación muestral, que divide por `N − 1`, daría un valor un 2,5 % menor con periodo 20 (un factor `√((N − 1) / N)`). Una ventana cuyos rendimientos no varían tiene desviación 0, y el ratio lee 0, no un valor alto. `N` rendimientos necesitan `N + 1` precios, así que el primer valor llega en la actualización `N + 1`, y la línea lee 0 antes. El motor admite una tasa libre de riesgo por barra y un factor de anualización que multiplica el resultado, 1 por defecto; las formas de QTScript con números extra los pasan (consulta el catálogo).

## Cómo leerlo

- **Es un ratio por barra, así que es pequeño.** En las series reales del gráfico, con periodo 20, va de −0,63 a 0,63. Para compararlo con las cifras de un informe, anualízalo: con barras diarias, multiplica por `√252` = 15,9.
- **Su signo es el del rendimiento medio**, y la línea de cero separa los dos: en las series reales del gráfico es positivo en del 39 % al 49 % de las barras.
- **Una ventana sin variación lee 0**, sea cual sea su rendimiento: un precio que sube un 1 % cada barra lee 0, y también uno que no se mueve.
- **Una ventana corta dice poco.** Con 20 rendimientos, el error típico de un ratio cercano a 0 es de unos `1 / √20` = 0,22, así que una lectura de 0,3 queda bien dentro del ruido.

## En una estrategia

```
uses pro.sharpeRatio
setup:
  sharpeRatio(20)
```

`sharpeRatio(20)` registra `sharpe20`. En Java la clase es `SharpeRatioRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, y un grupo la recibe con `indicators.add("sharpe20", new SharpeRatioRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Ratio de Sortino](/docs/indicators/risk/sortinoRatio): la misma idea con solo la caída como riesgo.
- [Ratio omega](/docs/indicators/risk/omegaRatio): ganancias sobre pérdidas, sin suposición sobre la dispersión.
- [Desviación típica exacta](/docs/indicators/statistics/exactStdDev): la dispersión de los precios, en vez de la de los rendimientos.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
