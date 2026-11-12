---
title: "Media móvil exponencial (EMA)"
description: "Cómo la media móvil exponencial da más peso a los precios recientes con pesos que caen de forma geométrica, qué fija su periodo y cómo usarla en una estrategia de QTSurfer."
order: 1.2
lastUpdated: '2026-11-12T00:02:30Z'
---

La **media móvil exponencial** (EMA, por sus siglas en inglés) da más peso a los precios más recientes, con pesos que caen de forma geométrica a medida que los precios envejecen. Nunca olvida del todo un precio, y cada actualización solo necesita el valor anterior.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="ema"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
α   = 2 / (N + 1)
EMA = EMA anterior + α × (precio − EMA anterior)
```

El motor arranca la media en el primer precio y la actualiza con cada precio, así que es una línea continua, a diferencia de la media simple discreta. El último precio pesa `α`: cerca de un 9,5 % con `N = 20`. El motor la da por lista tras `N` actualizaciones, y el gráfico dibuja desde ahí.

## Cómo leerla

- **También se retrasa.** Sobre una recta va por detrás del precio la mitad del periodo, 9,5 barras con `N = 20`, igual que la media simple móvil.
- **Un salto se absorbe de otra manera.** La EMA lo reparte entre los precios siguientes con pesos decrecientes, mientras que una media simple lo incorpora de golpe y lo suelta de golpe, `N` actualizaciones después.
- **Es la base de otros indicadores.** El [cruce de EMA](/learn/articles/ema-crossover) construye una estrategia con dos de ellas, y el [MACD](/docs/indicators/oscillators/macd) es su diferencia.

## En una estrategia

```
setup:
  ema(20)
```

`ema(20)` registra `ema20`. Ponle un nombre con `ema("fast", 9)`, o aliméntala con otro indicador, `ema("signal", "macd", 9)`, que es como la página del MACD construye su línea de señal. En Java, `.ema(9)` y `.ema("fast", "vol", 9)` en el builder.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil simple](/docs/indicators/averages/sma): la media simple, con el mismo peso en todos los precios.
- [Media móvil modificada](/docs/indicators/averages/mma): la misma media con un peso más suave, `1 / N`.
- [MACD](/docs/indicators/oscillators/macd): la diferencia de dos de ellas, con su línea de señal.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
