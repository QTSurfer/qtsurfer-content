---
title: "Tasa de cambio (ROC)"
description: "Cómo la tasa de cambio da el cambio porcentual del precio en las últimas N barras, por qué se compara entre instrumentos donde el momento no, y cómo usarla en una estrategia de QTSurfer."
order: 2.42
lastUpdated: '2026-11-12T21:21:22Z'
---

La **tasa de cambio** (ROC, por sus siglas en inglés) es el cambio porcentual del precio en las últimas `N` barras. Es el [momento](/docs/indicators/oscillators/momentum) dividido por el precio antiguo.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="roc"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
ROC = 100 × (precio − precio de hace N barras) / precio de hace N barras
```

El primer valor llega en la actualización `N + 1`, y el gráfico dibuja desde ahí; antes la línea lee 0. Un precio pasado de 0 da 0.

## Cómo leerla

- **Es un porcentaje, así que se compara entre instrumentos.** En las series reales del gráfico, con periodo 12, va del −29,5 % al 27,2 % en la diaria BTC/USDT, del −5,7 % al 5,0 % en la horaria y del −4,9 % al 2,1 % en la de 15 minutos ETH/USDT.
- **Se compone.** Un precio que sube un 1 % cada barra lee 12,68 con periodo 12, no 12: es `1,01¹² − 1`.
- **Es positiva en del 46 % al 51 % de las barras** de las series reales del gráfico; la línea de cero es un precio igual al de hace `N` barras.

## En una estrategia

```
uses pro.roc
setup:
  roc(12)
```

`roc(12)` registra `roc12`. En Java la clase es `RocRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("roc12", new RocRTIndicator(12))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Momento](/docs/indicators/oscillators/momentum): la misma diferencia en unidades de precio.
- [Curva de Coppock](/docs/indicators/oscillators/coppockCurve): una media ponderada de dos tasas de cambio.
- [Know Sure Thing](/docs/indicators/oscillators/knowSureThing): cuatro tasas de cambio suavizadas sumadas.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
