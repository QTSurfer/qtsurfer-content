---
title: "Media móvil de Hull (HMA)"
description: "Cómo la media móvil de Hull combina medias ponderadas de tres periodos para seguir de cerca el precio y aun así ser suave, y cómo usarla en una estrategia de QTSurfer."
order: 1.5
lastUpdated: '2026-11-12T00:02:30Z'
---

La **media móvil de Hull** (HMA, por sus siglas en inglés), ideada por Alan Hull, está construida para seguir de cerca el precio y aun así ser suave. Combina medias ponderadas de tres periodos distintos.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="hma"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
bruta = 2 × WMA(precio, ⌊N / 2⌋) − WMA(precio, N)
HMA   = WMA(bruta, round(√N))
```

`⌊N / 2⌋` es la mitad del periodo redondeada hacia abajo y `round(√N)` la raíz cuadrada del periodo redondeada al entero más próximo: 4 con `N = 20`. Las tres son las medias ponderadas de la página de la [WMA](/docs/indicators/averages/wma). El motor da la HMA por lista tras `N` actualizaciones, y el gráfico dibuja desde ahí.

## Cómo leerla

- **Sobre una recta va por detrás del precio menos de una barra**, mientras que la WMA del mismo periodo va por detrás más de seis con `N = 20`.
- **Un periodo más largo suaviza más y se retrasa más**, como en todas las medias de aquí.

## En una estrategia

```
setup:
  hma(20)
```

`hma(20)` registra `hma20`. En Java, `.hma(6)` en el builder.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil ponderada](/docs/indicators/averages/wma): la media ponderada con la que está hecha.
- [Media móvil exponencial triple](/docs/indicators/averages/tema): otra media construida para recortar el retraso.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
