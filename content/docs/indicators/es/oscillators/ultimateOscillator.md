---
title: "Oscilador definitivo (Ultimate)"
description: "Cómo el oscilador definitivo combina la presión compradora en 7, 14 y 28 barras con pesos 4, 2 y 1, de 0 a 100, por qué rara vez llega a 70 o 30, y cómo usarlo en una estrategia de QTSurfer."
order: 2.55
lastUpdated: '2026-11-13T21:28:19Z'
---

El **oscilador definitivo** (*ultimate oscillator*), de Larry Williams, combina la presión compradora en tres periodos, 7, 14 y 28 barras, de modo que un solo periodo no decida. Va de 0 a 100.

Pruébalo en una serie. No tiene parámetros: los tres periodos son fijos.

<div data-indicator-chart="ultimateOscillator"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
BP  = cierre − min(mínimo, cierre anterior)                       la presión compradora de la barra
TR  = max(máximo, cierre anterior) − min(mínimo, cierre anterior)  el rango verdadero de la barra
Prom_n = Σ BP en n barras / Σ TR en n barras
UO  = 100 × (4 × Prom₇ + 2 × Prom₁₄ + Prom₂₈) / 7
```

Un periodo cuyos rangos verdaderos suman 0 cuenta como 0. El primer valor llega en la actualización 29, cuando están las 28 barras del periodo más largo, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **Lee 100 cuando todas las barras cierran en su máximo verdadero y 0 cuando todas cierran en su mínimo verdadero**, y 50 para barras que cierran a media altura de su rango.
- **Se queda en el medio.** En las series reales del gráfico va de 24 a 77, y pasa de 70 en como mucho el 1,8 % de las barras y baja de 30 en como mucho el 1,8 %: los niveles de 70 y 30 que se citan habitualmente se alcanzan rara vez con los tres periodos fijos.
- **Los pesos favorecen el periodo corto**, que cuenta cuatro veces lo que el más largo, así que gira antes que una lectura única de 28 barras.

## En una estrategia

```
uses pro.ultimateOscillator
setup:
  ultimateOscillator()
```

`ultimateOscillator()` registra `uo`. No tiene formas con parámetros. En Java la clase es `UltimateOscillatorRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("uo", new UltimateOscillatorRTIndicator())`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [RSI](/docs/indicators/oscillators/rsi): fuerza relativa, entre 0 y 100.
- [%R de Williams](/docs/indicators/oscillators/williamsR): el cierre en el rango de las últimas barras, de −100 a 0.
- [ATR](/docs/indicators/volatility/atr): el rango verdadero por el que se divide.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
