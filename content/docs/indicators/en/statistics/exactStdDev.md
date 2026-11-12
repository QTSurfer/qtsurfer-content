---
title: "Exact standard deviation"
description: "How the exact standard deviation measures the spread of the last prices in the units of the price, dividing by N where the free one divides by N minus 1, and how to use it in a QTSurfer strategy."
order: 7.02
lastUpdated: '2026-11-12T18:54:41Z'
---

The **exact standard deviation** is the square root of the mean of the squared distances of the last `N` prices from their mean. It is the pro counterpart of the [standard deviation](/docs/indicators/volatility/stdDev): it divides by `N`, where that one divides by `N − 1`.

Try it on a series below and change the period.

<div data-indicator-chart="exactStdDev"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
deviation = √( Σ (price − mean)² / N )        over the last N prices
```

It is the square root of the [exact variance](/docs/indicators/statistics/exactVariance), worked out from the last `N` prices on every update. A window that does not move gives 0. It reports the value ready after `N` updates, and the chart draws from there.

## Reading it

- **It is in the units of the price**, so it says how many dollars, or whatever the price is in, the last `N` prices spread over. It grows with the price: compare it with the price, or use a percentage indicator, to compare instruments.
- **It is the free standard deviation seen from the other side.** The free [standard deviation](/docs/indicators/volatility/stdDev) is this one times `√(N / (N − 1))`: 1.026 at period 20, on every bar of the real series of the chart.
- **It is the denominator of the [z-score](/docs/indicators/statistics/zScore).** The [Bollinger bands](/docs/indicators/bands/bollinger) use the free deviation instead, so at period 20 their half-width is 1.026 times this one before the multiplier.

## In a strategy

```
uses pro.exactStdDev
setup:
  exactStdDev(20)
```

`exactStdDev(20)` registers `xstd20`. The engine divides by `N − 1` instead when its sample flag is set (`withSampleVariance(true)` in Java), which gives the free standard deviation. In Java the class is `StandardDeviationRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, and a group takes it with `indicators.add("xstd20", new StandardDeviationRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Standard deviation](/docs/indicators/volatility/stdDev): the free standard deviation, which divides by N − 1.
- [Exact variance](/docs/indicators/statistics/exactVariance): its square.
- [ATR](/docs/indicators/volatility/atr): the spread of the bars instead of the spread of the closes.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
