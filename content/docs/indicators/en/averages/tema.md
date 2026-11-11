---
title: "Triple exponential moving average (TEMA)"
description: "How the triple exponential moving average combines three exponential averages to cut the lag of one, and how to use it in a QTSurfer strategy."
order: 1.4
---

The **triple exponential moving average** (TEMA) combines three exponential averages to cut the lag of a single one.

Try it on a series below and change the period.

<div data-indicator-chart="tema"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
EMA1 = EMA(price)
EMA2 = EMA(EMA1)
EMA3 = EMA(EMA2)
TEMA = 3 × EMA1 − 3 × EMA2 + EMA3        the three over the same period
```

Each average smooths the one before it and trails it a little more, and the combination cancels that delay. The engine starts each of the three on its first input, so the first bars of the line carry that start. It reports the TEMA ready after `N` updates, and the chart draws from there.

## Reading it

- **On a straight line it does not lag at all**, where an EMA of the same period trails the price by half the period.
- **It is not the same line as an EMA of the same period.** Do not swap one for the other in a rule without a [parameter sweep](/learn/articles/parameter-sweep).

## In a strategy

```
setup:
  tema(20)
```

`tema(20)` registers `tema20`. In Java, `.tema(4)` on the builder.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Exponential moving average](/docs/indicators/averages/ema): the single exponential average it is built from.
- [Hull moving average](/docs/indicators/averages/hma): another average built to cut the lag.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
