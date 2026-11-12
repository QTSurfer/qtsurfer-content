---
title: "Z-score"
description: "How the z-score says how many standard deviations the latest price is from the mean of the last prices, why it cannot pass the square root of N minus 1, and how to use it in a QTSurfer strategy."
order: 7.03
---

The **z-score** says how many standard deviations the latest price is from the mean of the last `N` prices.

Try it on a series below and change the period.

<div data-indicator-chart="zScore"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
z = (price − mean) / deviation        mean and deviation of the last N prices, the latest one included
```

The deviation is the [exact standard deviation](/docs/indicators/statistics/exactStdDev), which divides by `N`. A window that does not move gives 0. It reports the value ready after `N` updates, and the chart draws from there.

## Reading it

- **It cannot go beyond `√(N − 1)`**, because the latest price is part of the window it is measured against: 4.36 at period 20, and 2 at period 5. One outlier over a window that does not move reads exactly that.
- **It is not rare to be beyond 2.** On the real series of the chart, at period 20, the z-score is beyond ±2 on 9 % to 12 % of the bars and beyond ±3 on 1.4 %. Prices trend, and the latest one is often far from the mean of a window it has just been walking away from.
- **The zero line is the mean of the window**: above it the price is above its own recent average, below it the price is below.

## In a strategy

```
uses pro.zScore
setup:
  zScore(20)
```

`zScore(20)` registers `zscore20`. In Java the class is `ZScoreRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, and a group takes it with `indicators.add("zscore20", new ZScoreRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Exact standard deviation](/docs/indicators/statistics/exactStdDev): the deviation it divides by.
- [Bollinger %B](/docs/indicators/bands/bollingerPercentB): where the price sits inside a band of the mean and the deviation.
- [Simple moving average](/docs/indicators/averages/sma): the mean it subtracts, when it is the plain mean.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
