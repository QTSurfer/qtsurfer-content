---
title: "Rolling percentile"
description: "How the rolling percentile gives the price below which a share of the last prices lie, with the median, the minimum and the maximum of the same window, and how to use it in a QTSurfer strategy."
order: 7.08
lastUpdated: '2026-11-12T18:54:41Z'
---

The **rolling percentile** is the price below which a given share of the last `N` prices lie, for example the 95th percentile. The engine gives it with the median, the minimum and the maximum of the same window.

Try it on a series below and change the period and the percentile.

<div data-indicator-chart="rollingPercentile"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
sorted = the last N prices, in order
rank   = percentile × (N − 1)
value  = sorted[⌊rank⌋] + (rank − ⌊rank⌋) × (sorted[⌊rank⌋ + 1] − sorted[⌊rank⌋])
```

The percentile is a fraction between 0 and 1, 0.95 by default, and the engine rejects any other when it builds the indicator. It is the linear interpolation that the spreadsheet function `PERCENTILE.INC` and NumPy use by default. While the window fills, the value is worked out on the prices so far; it is reported ready on update `N`, and the chart draws from there. The engine registers the median, the minimum and the maximum of the window beside it, and the chart draws the four lines over the price.

## Reading it

- **It is a price level that follows the window.** Drawn over the price, the 95th percentile is the level that the price was at or below on 95 % of the last `N` bars, so a close above it is a close near the top of its recent range.
- **It is not the maximum.** On a straight rise of 2 per bar the 95th percentile trails the latest price by 1.9, where the maximum is the latest price itself. At the default 0.95, the median, the percentile and the maximum are always in that order.
- **Prices trend, so the top is visited often.** On the real series of the chart, at period 20, the close is above its own 95th percentile on 8.5 % to 12.8 % of the bars, against 5 % if the order of the prices were random.

## In a strategy

```
uses pro.rollingPercentile
setup:
  rollingPercentile(20, 0.95)
```

`rollingPercentile(20, 0.95)` registers `pctl20_0.95`, with `pctl20_0.95Median`, `pctl20_0.95Min` and `pctl20_0.95Max` beside it. The id has a dot, so when a `window` has to refer to it, give it a name: `rollingPercentile("p95", 20, 0.95)` registers `p95`, `p95Median`, `p95Min` and `p95Max`. In Java the class is `RollingPercentileRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, and a group takes it with `indicators.add("pctl20_0.95", new RollingPercentileRTIndicator(20, 0.95))`.

The period and the percentile are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

## Related

- [Bollinger bands](/docs/indicators/bands/bollinger): a band around the mean, from the deviation, instead of from the order of the prices.
- [Exact standard deviation](/docs/indicators/statistics/exactStdDev): the spread of the same window, as one number.
- [Simple moving average](/docs/indicators/averages/sma): the mean of the same window.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
