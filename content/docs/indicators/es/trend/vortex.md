---
title: "Indicador Vortex"
description: "Cómo el indicador Vortex compara el movimiento de cada mínimo al máximo siguiente con el de cada máximo al mínimo siguiente, como dos líneas en torno a 1, y cómo usarlo en una estrategia de QTSurfer."
order: 5.46
---

El **indicador Vortex**, de Etienne Botes y Douglas Siepman, compara el movimiento al alza, del mínimo de cada barra al máximo de la siguiente, con el movimiento a la baja, de cada máximo al mínimo siguiente, frente al rango verdadero. Dibuja dos líneas: `VI+` y `VI−`.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="vortex"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
VM+  = |máximo − mínimo anterior|
VM−  = |mínimo − máximo anterior|
VI+  = Σ VM+ en N barras / Σ TR en N barras
VI−  = Σ VM− en N barras / Σ TR en N barras
```

`TR` es el rango verdadero. La línea principal que registra el motor es `VI+ − VI−`, que no se dibuja: el gráfico dibuja `VI+` y `VI−`. El primer valor llega en la actualización `N + 1`, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **`VI+` por encima de `VI−` es una tendencia alcista, por debajo bajista**, y el cruce es la señal habitual. En las series reales del gráfico, con periodo 14, `VI+` está por encima de `VI−` en del 43 % al 52 % de las barras, y las dos se cruzan de 34 a 39 veces en las 286 barras dibujadas.
- **Las dos líneas rondan 1.** Sus medianas están entre 0,99 y 1,03 en las series reales del gráfico, y pueden pasar de 1: en barras que suben uno con un rango de uno, `VI+` lee 2 y `VI−` 0.
- **Un precio que no se mueve lee 0 en las dos.**

## En una estrategia

```
uses pro.vortex
setup:
  vortex(14)
```

`vortex(14)` registra `vortex14`, con `vortex14ViPlus` y `vortex14ViMinus` a su lado. En Java la clase es `VortexRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.trend.pro`, y un grupo la recibe con `indicators.add("vortex14", new VortexRTIndicator(14))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Índice direccional medio](/docs/indicators/trend/adx): las líneas direccionales de Wilder, con la fuerza de la tendencia.
- [Aroon](/docs/indicators/trend/aroon): otro par de líneas que dicen hacia dónde va la tendencia.
- [ATR](/docs/indicators/volatility/atr): el rango verdadero por el que se dividen los movimientos.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
