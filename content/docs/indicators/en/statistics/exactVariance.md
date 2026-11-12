---
title: "Exact variance"
description: "How the exact variance measures the spread of the last prices, dividing by N where the free variance divides by N minus 1, and how to use it in a QTSurfer strategy."
order: 7.01
lastUpdated: '2026-11-12T18:54:41Z'
---

The **exact variance** is the mean of the squared distances of the last `N` prices from their mean. It is the pro counterpart of the [variance](/docs/indicators/volatility/variance): it divides by `N`, where that one divides by `N − 1`.

Try it on a series below and change the period.

<div data-indicator-chart="exactVariance"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
variance = Σ (price − mean)² / N        over the last N prices
```

The engine works it out from the last `N` prices on every update, first the mean and then the squared distances, and not from running sums. A window that does not move gives 0. It reports the value ready after `N` updates, and the chart draws from there.

## Reading it

- **It is the free variance seen from the other side.** The free [variance](/docs/indicators/volatility/variance) is this one times `N / (N − 1)`: 1.053 at period 20, on every bar of the real series of the chart.
- **It is rarely read on its own.** Its units are the square of the price's, so its size means little to the eye; the [exact standard deviation](/docs/indicators/statistics/exactStdDev) is its square root, in the units of the price.
- **It never goes below 0**, and it reads 0 on a window that does not move.

## In a strategy

```
uses pro.exactVariance
setup:
  exactVariance(20)
```

`exactVariance(20)` registers `xvar20`. The engine divides by `N − 1` instead when its sample flag is set (`withSampleVariance(true)` in Java), which gives the free variance. In Java the class is `VarianceRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, and a group takes it with `indicators.add("xvar20", new VarianceRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Variance](/docs/indicators/volatility/variance): the free variance, which divides by N − 1.
- [Exact standard deviation](/docs/indicators/statistics/exactStdDev): its square root, in the units of the price.
- [Z-score](/docs/indicators/statistics/zScore): how far the latest price is from the mean, in deviations.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
