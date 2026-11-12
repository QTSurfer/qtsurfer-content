---
title: "Variance"
description: "How the variance, the square of the standard deviation, measures the spread of the last N prices, with the divisor of a sample, and how to use it in a QTSurfer strategy."
order: 4.3
lastUpdated: '2026-11-12T00:02:30Z'
---

The **variance** is the square of the [standard deviation](/docs/indicators/volatility/stdDev): the mean of the squared distances of the last `N` prices from their mean. It is in the square of the units of the price.

Try it on a series below and change the period.

<div data-indicator-chart="variance"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
variance = Σ (price − mean)² / (N − 1)        over the last N prices
```

The engine divides by `N − 1`, as for the standard deviation, which is its square root. It reports it ready after `N` updates. A price that does not move reads 0.

## Reading it

- **It is rarely read on its own.** Its units are the square of the price's, so its size means little to the eye. It is what the standard deviation takes the root of.
- **It grows with the square of the scale.** Twice the spread gives four times the variance.

## In a strategy

```
setup:
  variance(20)
```

`variance(20)` registers `variance20`. In Java, `.variance(5)` on the builder.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Standard deviation](/docs/indicators/volatility/stdDev): its square root, in the units of the price.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
