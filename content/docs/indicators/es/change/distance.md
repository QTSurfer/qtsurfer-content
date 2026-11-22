---
title: "Distancia"
description: "Cómo la distancia mide la separación entre dos indicadores en porcentaje del segundo, por qué su línea de cero es un cruce y cómo usarla en una estrategia de QTSurfer."
order: 9.03
lastUpdated: '2026-11-22T19:06:11Z'
---

La **distancia** es la separación entre dos indicadores, en porcentaje del segundo, la base. Entre dos medias dice cuál está encima y por cuánto.

Pruébala en una serie, entre dos EMA, y cambia sus periodos.

<div data-indicator-chart="distance"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
distancia = 100 × (a − b) / b
```

Está lista cuando lo están los dos indicadores, y da 0 cuando la base es 0.

## Cómo leerla

- **Su línea de cero es un cruce.** La distancia entre una media rápida y una lenta cambia de signo donde se cruzan, así que un solo número recoge el [cruce de EMA](/learn/articles/ema-crossover) y lo claro que es.
- **Compara instrumentos**, porque es relativa: 0,5 es medio por ciento tanto si el precio es 2 como si es 60 000.
- **Es el [MACD](/docs/indicators/oscillators/macd) en porcentaje** cuando las medias son sus dos EMA: el MACD es la misma separación, en las unidades del precio.

## En una estrategia

```
setup:
  ema(9)
  ema(21)
  distance("gap", "ema9", "ema21")
```

Eso registra `gap`, y las dos medias tienen que registrarse antes. Sin nombre, `distance("ema9", "ema21")` registra `distema9ema21`. En Java, `.distance("gap", "ema9", "ema21")` en el builder.

Los periodos de las medias son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra.

## Relacionado

- [Distancia a una media](/docs/indicators/change/distanceMa): el precio frente a una media.
- [MACD](/docs/indicators/oscillators/macd): la separación entre dos EMA, en las unidades del precio.
- [EMA](/docs/indicators/averages/ema): la media que usa el gráfico.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
