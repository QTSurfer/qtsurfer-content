---
title: "Skewness"
description: "How the skewness measures how lopsided the distribution of the last prices is, 0 for a symmetric one, positive for a long tail on the high side, and how to use it in a QTSurfer strategy."
order: 7.05
---

The **skewness** here is the sample skewness of the last `N` prices: how lopsided their distribution is. 0 is a symmetric one; above 0 the long tail is on the high side, below 0 it is on the low side.

Try it on a series below and change the period.

<div data-indicator-chart="skewness"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
m₂ = Σ (x − mean)² / N
m₃ = Σ (x − mean)³ / N
skewness = √(N (N − 1)) / (N − 2) × m₃ / m₂^1.5
```

It is the adjusted Fisher–Pearson coefficient G1, which is what spreadsheets give with `SKEW`. It needs at least 3 periods, and a window that does not move gives 0. It reports the value ready after `N` updates, and the chart draws from there.

## Reading it

- **0 is a symmetric window.** Evenly spaced prices, such as a straight rise, read 0. Above 0 the long tail, the outliers, is on the high side; below 0, on the low side. On simulated normal samples the mean reading is 0.05 at period 30.
- **On a small window it swings wide.** One outlier over a window that does not move reads `√N`: 4.47 at period 20, positive for an outlier above and negative for one below.
- **On the real series of the chart**, at period 20, it is positive on 44 % to 56 % of the bars and beyond ±1 on 14 % to 20 %. It goes from −4.3 to 3.2.
- **The platform differs for now.** Until the engine of the platform is updated, a backtest computes the earlier formula, which read the corrected value times `(N / (N − 1))^1.5`: 1.08 times at period 20, and 1.40 at period 5. The values on this page are the corrected ones.

## In a strategy

```
uses pro.skewness
setup:
  skewness(20)
```

`skewness(20)` registers `skew20`. In Java the class is `SkewnessRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, and a group takes it with `indicators.add("skew20", new SkewnessRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Kurtosis](/docs/indicators/statistics/kurtosis): how heavy the tails of the same window are.
- [Z-score](/docs/indicators/statistics/zScore): how far the latest price is from the mean, which outliers stretch.
- [Exact standard deviation](/docs/indicators/statistics/exactStdDev): the spread of the same window, in the units of the price.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
