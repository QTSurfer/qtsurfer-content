---
title: "Linear regression slope"
description: "How the linear regression slope gives the slope, in price units per bar, of the straight line that best fits the last prices, and how to use it in a QTSurfer strategy."
order: 7.06
lastUpdated: '2026-11-12T18:54:41Z'
---

The **linear regression slope** is the slope of the straight line that best fits the last `N` prices, by least squares, in price units per bar.

Try it on a series below and change the period.

<div data-indicator-chart="linearRegressionSlope"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
slope = Σ (t − mean t)(price − mean price) / Σ (t − mean t)²        t = 0 … N − 1, the last N prices
```

The denominator is `N (N² − 1) / 12`. It needs at least 2 periods, and a window that does not move gives 0. It reports the value ready after `N` updates, and the chart draws from there. The engine registers the intercept beside the slope, `lrs20Intercept`: the height of the fitted line at the first bar of the window, `mean price − slope × (N − 1) / 2`. The chart draws the slope only.

## Reading it

- **On a straight line it reads the slope of the line exactly**: +3 per bar for prices 50, 53, 56…, at any period.
- **It is in price units per bar, so it does not compare between instruments.** On the real series of the chart it goes from −1,398 to 1,121 on the daily BTC/USDT and from −7.1 to 2.5 on the 15-minute ETH/USDT. A rule that compares it with a number is tied to one instrument and one timeframe; divide it by the price to compare.
- **The zero line is the sign of the trend of the window.** On the real series of the chart the slope is positive on 40 % to 53 % of the bars.

## In a strategy

```
uses pro.linearRegressionSlope
setup:
  linearRegressionSlope(20)
```

`linearRegressionSlope(20)` registers `lrs20`, with the intercept beside it as `lrs20Intercept`. In Java the class is `LinearRegressionSlopeRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, and a group takes it with `indicators.add("lrs20", new LinearRegressionSlopeRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Simple linear regression](/docs/indicators/statistics/simpleLinearRegression): the same slope, with how well the line fits.
- [Least squares moving average](/docs/indicators/averages/leastSquaresMovingAverage): the end of the same line, as a price.
- [Simple moving average](/docs/indicators/averages/sma): the plain mean of the same window.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
