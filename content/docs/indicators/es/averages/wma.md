---
title: "Media móvil ponderada (WMA)"
description: "Cómo la media móvil ponderada pesa los últimos N precios de 1 a N, qué pasa en las primeras barras y cómo usarla en una estrategia de QTSurfer."
order: 1.3
lastUpdated: '2026-11-12T00:02:30Z'
---

La **media móvil ponderada** (WMA, por sus siglas en inglés) pesa los últimos `N` precios en línea recta: el más reciente pesa `N` y el más antiguo pesa 1.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="wma"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
WMA = (1 × precio₁ + 2 × precio₂ + … + N × precioₙ) / (1 + 2 + … + N)        precio₁ el más antiguo de los últimos N
```

El divisor es `N × (N + 1) / 2`. En las primeras barras, antes de que hayan llegado `N` precios, el motor pondera los precios que tiene a partir de 1. Se da por listo cuando la ventana está llena, y el gráfico dibuja desde ahí.

## Cómo leerla

- **Pondera más los precios recientes que la media simple, y tiene una ventana.** Un precio sale por completo de la media tras `N` actualizaciones, cosa que una EMA no hace nunca.
- **Sobre una recta va por detrás del precio un tercio del periodo**, unas 6,3 barras con `N = 20`, frente a la mitad de la media simple y de la EMA.

## En una estrategia

```
setup:
  wma(20)
```

`wma(20)` registra `wma20`. En Java, `.wma(5)` en el builder.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil simple](/docs/indicators/averages/sma): la media simple, con el mismo peso en todos los precios.
- [Media móvil de Hull](/docs/indicators/averages/hma): la media construida con tres de estas.
- [Media móvil exponencial](/docs/indicators/averages/ema): la media exponencial, con un peso que cae de forma geométrica.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
