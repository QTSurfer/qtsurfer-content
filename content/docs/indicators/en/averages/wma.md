---
title: "Weighted moving average (WMA)"
description: "How the weighted moving average weights the last N prices from 1 to N, what happens in the first bars, and how to use it in a QTSurfer strategy."
order: 1.3
lastUpdated: '2026-11-12T00:02:30Z'
---

The **weighted moving average** (WMA) weights the last `N` prices in a straight line: the newest weighs `N` and the oldest weighs 1.

Try it on a series below and change the period.

<div data-indicator-chart="wma"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
WMA = (1 × price₁ + 2 × price₂ + … + N × priceₙ) / (1 + 2 + … + N)        price₁ the oldest of the last N
```

The divisor is `N × (N + 1) / 2`. In the first bars, before `N` prices have arrived, the engine weights the prices it has from 1 upwards. It reports itself ready once the window is full, and the chart draws from there.

## Reading it

- **It weights the recent prices more than the simple average does, and it has a window.** A price leaves the average completely after `N` updates, which an EMA never does.
- **On a straight line it trails the price by a third of the period**, about 6.3 bars at `N = 20`, against the half of the simple average and the EMA.

## In a strategy

```
setup:
  wma(20)
```

`wma(20)` registers `wma20`. In Java, `.wma(5)` on the builder.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Simple moving average](/docs/indicators/averages/sma): the simple average, with the same weight on every price.
- [Hull moving average](/docs/indicators/averages/hma): the average built from three of these.
- [Exponential moving average](/docs/indicators/averages/ema): the exponential average, with a weight that falls geometrically.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
