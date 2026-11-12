---
title: "Media móvil modificada (MMA)"
description: "Cómo la media móvil modificada, el suavizado que usa J. Welles Wilder, es una media exponencial con un peso más suave, y cómo usarla en una estrategia de QTSurfer."
order: 1.6
---

La **media móvil modificada** (MMA, por sus siglas en inglés) es el suavizado que usa J. Welles Wilder en sus indicadores, como el RSI y el ATR. Es una media exponencial con un peso más suave.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="mma"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
α   = 1 / N
MMA = MMA anterior + α × (precio − MMA anterior)
```

Es una EMA con `α = 1 / N` en lugar de `2 / (N + 1)`, así que una MMA de `N` periodos es la misma línea que una EMA de `2N − 1` periodos: la MMA de 20 y la EMA de 39 coinciden. El motor la arranca en el primer precio y la da por lista tras `N` actualizaciones.

## Cómo leerla

- **Es más lenta que una EMA del mismo periodo.** Su peso sobre el precio más reciente es menor, `1 / N` frente a `2 / (N + 1)`, así que sigue al precio más tarde y de forma más suave.
- **Es lo que significa «el suavizado de Wilder».** `rsi(14, false)` y el [ATR](/docs/indicators/volatility/atr) la usan.

## En una estrategia

```
setup:
  mma(14)
```

`mma(14)` registra `mma14`. Como la EMA, puede leer otro indicador, `mma("name", "other", 14)`. En Java, `.mma(7)` en el builder.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil exponencial](/docs/indicators/averages/ema): la misma media con un peso de `2 / (N + 1)`.
- [RSI](/docs/indicators/oscillators/rsi): el oscilador que la usa en su variante de Wilder.
- [ATR](/docs/indicators/volatility/atr): el indicador de rango que suaviza con ella.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
