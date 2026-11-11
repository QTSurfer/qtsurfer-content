---
title: "Hull moving average (HMA)"
description: "How the Hull moving average combines weighted averages of three periods to follow the price closely and still be smooth, and how to use it in a QTSurfer strategy."
order: 1.5
---

The **Hull moving average** (HMA), devised by Alan Hull, is built to follow the price closely and still be smooth. It combines weighted averages of three different periods.

Try it on a series below and change the period.

<div data-indicator-chart="hma"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
raw = 2 × WMA(price, ⌊N / 2⌋) − WMA(price, N)
HMA = WMA(raw, round(√N))
```

`⌊N / 2⌋` is half the period rounded down and `round(√N)` the square root of the period rounded to the nearest whole number: 4 for `N = 20`. The three are the weighted averages of the [WMA](/docs/indicators/averages/wma) page. The engine reports the HMA ready after `N` updates, and the chart draws from there.

## Reading it

- **On a straight line it trails the price by less than a bar**, where the WMA of the same period trails it by more than six at `N = 20`.
- **A longer period smooths more and lags more**, as for every average here.

## In a strategy

```
setup:
  hma(20)
```

`hma(20)` registers `hma20`. In Java, `.hma(6)` on the builder.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Weighted moving average](/docs/indicators/averages/wma): the weighted average it is made of.
- [Triple exponential moving average](/docs/indicators/averages/tema): another average built to cut the lag.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
