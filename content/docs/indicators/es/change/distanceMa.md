---
title: "Distancia a una media"
description: "Cómo la distancia a una media mide cuánto se aleja el precio de una media móvil en porcentaje, qué medias admite y cómo usarla en una estrategia de QTSurfer."
order: 9.04
lastUpdated: '2026-11-22T23:27:04Z'
---

La **distancia a una media** es cuánto se aleja el precio de una media móvil, en porcentaje de la media: positiva por encima, negativa por debajo.

Pruébala en una serie, frente a una EMA, y cambia su periodo.

<div data-indicator-chart="distanceMa"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
distancia a la media = 100 × (precio − media) / media
```

Admite una [SMA](/docs/indicators/averages/sma), una [EMA](/docs/indicators/averages/ema) o una [MMA](/docs/indicators/averages/mma), y rechaza cualquier otro indicador. Está lista cuando lo está la media, y da 0 cuando la media es 0.

## Cómo leerla

- **El cero es el precio cruzando su media.** El signo es el lado en el que está el precio.
- **Una distancia grande es un precio estirado.** Dice cuánto se ha alejado el precio de su nivel habitual, no que vaya a volver: en una tendencia fuerte sigue siendo grande mucho tiempo.
- **Para otra media, usa la [distancia](/docs/indicators/change/distance)**: `distance("gap", "price", "hma20")` mide el precio frente a cualquier indicador.

## En una estrategia

```
setup:
  ema(20)
  distanceMa("ema20")
```

`distanceMa("ema20")` registra `distema20`, y la media tiene que registrarse antes. En Java, `.distanceMa("ema20")` en el builder.

## Relacionado

- [Distancia](/docs/indicators/change/distance): la separación entre dos indicadores cualesquiera.
- [Oscilador de precio sin tendencia](/docs/indicators/oscillators/detrendedPriceOscillator): un precio pasado frente a la media.
- [Puntuación z](/docs/indicators/statistics/zScore): la misma separación, en desviaciones en lugar de porcentaje.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
