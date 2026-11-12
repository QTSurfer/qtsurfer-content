---
title: "Ratio omega"
description: "Cómo el ratio omega divide la suma de las ganancias por la suma de las pérdidas de los últimos rendimientos frente a un umbral, por qué está por encima de 1 exactamente cuando el rendimiento medio es positivo, y cómo usarlo en una estrategia de QTSurfer."
order: 8.03
---

El **ratio omega**, de Con Keating y William Shadwick, es la suma de las ganancias sobre la suma de las pérdidas de los últimos `N` rendimientos, medidas frente a un umbral. Por encima de 1 las ganancias pesan más que las pérdidas.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="omegaRatio"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
r = ln(precio / precio anterior)                                         el rendimiento de cada barra
Ω = Σ max(r − umbral, 0) / Σ max(umbral − r, 0)                          sobre los últimos N rendimientos, el umbral 0 por defecto
```

Una ventana sin ninguna pérdida no tiene nada por lo que dividir, y el ratio lee 0, no infinito. Necesita al menos 2 periodos. `N` rendimientos necesitan `N + 1` precios, así que el primer valor llega en la actualización `N + 1`, y la línea lee 0 antes. El motor admite un umbral, y las formas de QTScript con un número extra lo pasan (consulta el catálogo).

## Cómo leerlo

- **1 es la línea.** Por encima las ganancias pesan más que las pérdidas; por debajo, las pérdidas. Con el umbral en 0, el ratio omega está por encima de 1 exactamente cuando el rendimiento logarítmico medio de la ventana es positivo, que es cuando los ratios de [Sharpe](/docs/indicators/risk/sharpeRatio) y de [Sortino](/docs/indicators/risk/sortinoRatio) también lo son: en las series reales del gráfico, del 39 % al 49 % de las barras.
- **Mira todos los rendimientos, no solo su media y su dispersión**, como sumas de lo ganado y de lo perdido.
- **En las series reales del gráfico**, con periodo 20, va de 0,08 a 6,6, y su mediana es de 0,88 a 0,99.
- **Una ventana sin ninguna pérdida lee 0**, así que las mejores ventanas leen lo peor: un precio que sube un 1 % cada barra lee 0, y también uno que no se mueve.

## En una estrategia

```
uses pro.omegaRatio
setup:
  omegaRatio(20)
```

`omegaRatio(20)` registra `omega20`. En Java la clase es `OmegaRatioRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, y un grupo la recibe con `indicators.add("omega20", new OmegaRatioRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Ratio de Sharpe](/docs/indicators/risk/sharpeRatio): rendimiento por unidad de dispersión.
- [Ratio de Sortino](/docs/indicators/risk/sortinoRatio): rendimiento por unidad de caída.
- [Ratio de colas](/docs/indicators/risk/tailRatio): la cola derecha frente a la izquierda.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
