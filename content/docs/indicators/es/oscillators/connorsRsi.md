---
title: "RSI de Connors"
description: "Cómo el RSI de Connors promedia el RSI del precio, el RSI de la racha de subidas o caídas y el rango percentil del último rendimiento, de 0 a 100, y cómo usarlo en una estrategia de QTSurfer."
order: 2.52
lastUpdated: '2026-11-13T21:28:19Z'
---

El **RSI de Connors**, de Larry Connors, promedia tres cosas: el RSI del precio, el RSI de la racha de subidas o caídas consecutivas y el puesto que ocupa el último rendimiento entre los recientes. Va de 0 a 100.

Pruébalo en una serie y cambia los tres periodos.

<div data-indicator-chart="connorsRsi"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
racha = cierres consecutivos al alza (+1, +2, …) o a la baja (−1, −2, …), 0 si el cierre no cambia
rango = 100 × (el número de los últimos N rendimientos iguales o menores que el último − 1) / (N − 1)
CRSI  = (RSI(precio, 3) + RSI(racha, 2) + rango) / 3
```

`N` es el periodo del rango, 100 por defecto. Los dos RSI son el [RSI](/docs/indicators/oscillators/rsi) por defecto del motor. El primer valor llega en la actualización `N + 1`, la 101 con los valores por defecto, y el gráfico dibuja desde ahí; antes la línea lee 0.

## Cómo leerlo

- **Los niveles que se citan habitualmente, 90 y 10, se alcanzan rara vez.** En las series reales del gráfico, con los valores por defecto, el RSI de Connors pasa de 90 en del 2 % al 4 % de las barras y baja de 10 en del 1 % al 7 %.
- **En una subida recta lee 66,7**: los dos RSI están en 100, y el rango es 0 porque cada rendimiento es menor que el anterior. Un precio que sube lo mismo cada barra no es un extremo para este indicador.
- **Los periodos son los propios de Connors, para barras diarias**: 3 para el precio, 2 para la racha y 100 para el rango. En otra temporalidad son lo primero que hay que ajustar.

## En una estrategia

```
uses pro.connorsRsi
setup:
  connorsRsi(3, 2, 100)
```

`connorsRsi(3, 2, 100)` registra `crsi3_2_100`. En Java la clase es `ConnorsRsiRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("crsi3_2_100", new ConnorsRsiRTIndicator(3, 2, 100))`.

Los tres periodos son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

## Relacionado

- [RSI](/docs/indicators/oscillators/rsi): el oscilador del que están hechos dos tercios de este.
- [Tasa de cambio](/docs/indicators/oscillators/roc): el rendimiento cuyo rango es la tercera parte.
- [RSI estocástico](/docs/indicators/oscillators/stochRsi): otro oscilador construido sobre el RSI.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
