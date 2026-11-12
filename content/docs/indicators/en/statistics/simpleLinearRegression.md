---
title: "Simple linear regression"
description: "How the simple linear regression fits a straight line to the last prices and gives how well it fits, with the slope, the intercept, the R squared and the standard error, and how to use it in a QTSurfer strategy."
order: 7.07
---

The **simple linear regression** fits a straight line to the last `N` prices, by least squares, and says how well it fits: the slope, the intercept, the R² and the standard error.

Try it on a series below and change the period.

<div data-indicator-chart="simpleLinearRegression"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
slope = Σ (t − mean t)(price − mean price) / Σ (t − mean t)²        t = 0 … N − 1, the last N prices
R²    = (Σ (t − mean t)(price − mean price))² / (Σ (t − mean t)² × Σ (price − mean price)²)
error = √( (Σ (price − mean price)² − slope × Σ (t − mean t)(price − mean price)) / (N − 2) )
```

The chart draws the slope, the main line. The engine registers the rest beside it: `slr20Intercept`, `slr20RSquared` and `slr20StandardError`. The R² is 0 for a window that does not move; the error is 0 below 3 values or when the fit is perfect. It needs at least 2 periods, and it reports the value ready after `N` updates.

## Reading it

- **The R² says whether to believe the slope.** 1 means every price is on the line; 0 means the line explains none of the spread. On a straight line it is 1. On the real series of the chart, at period 20, its mean is 0.39 to 0.44, it is above 0.8 on 9 % to 14 % of the bars and below 0.2 on 27 % to 34 %.
- **The standard error is in price units**: how far the prices are from the line, on average. On a straight rise of 2 per bar with a wobble of ±1, the R² reads 0.995 and the error 0.85.
- **The slope is the number of the [linear regression slope](/docs/indicators/statistics/linearRegressionSlope)**, the same line with the same fit; this page adds the fit.

## In a strategy

```
uses pro.simpleLinearRegression
setup:
  simpleLinearRegression(20)
```

`simpleLinearRegression(20)` registers `slr20`, with `slr20Intercept`, `slr20RSquared` and `slr20StandardError` beside it. In Java the class is `SimpleLinearRegressionRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, and a group takes it with `indicators.add("slr20", new SimpleLinearRegressionRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Linear regression slope](/docs/indicators/statistics/linearRegressionSlope): the slope alone.
- [Least squares moving average](/docs/indicators/averages/leastSquaresMovingAverage): the end of the same line, as a price.
- [Z-score](/docs/indicators/statistics/zScore): another way to say how far the latest price is from what the window suggests.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
