---
title: "Chande forecast oscillator (CFO)"
description: "How the Chande forecast oscillator gives the percentage by which the price is above or below its linear regression line, and how to use it in a QTSurfer strategy."
order: 2.48
lastUpdated: '2026-11-12T21:21:22Z'
---

The **Chande forecast oscillator** (CFO), by Tushar Chande, gives the percentage by which the price is above or below its linear regression line.

Try it on a series below and change the period.

<div data-indicator-chart="chandeForecastOscillator"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
CFO = 100 × (price − LSMA) / price        LSMA over the last N prices
```

The line is the [least squares moving average](/docs/indicators/averages/leastSquaresMovingAverage): the regression line taken at the latest bar. Some formulations project the line one bar ahead, the time series forecast; the engine does not. It needs at least 2 periods. The first value is on update `N`, and the chart draws from there.

## Reading it

- **Positive means the price is above its trend line, negative below it.** On a straight line the price is on the line, and the CFO reads 0.
- **It stays in a narrow band.** On the real series of the chart, at period 14, it is within ±5 on 93 % of the bars of the daily BTC/USDT and on every bar of the hourly and the 15-minute series; its extremes on the daily one are −12.5 and 9.9.
- **It is positive on 47 % to 50 % of the bars** of the real series of the chart.

## In a strategy

```
uses pro.chandeForecastOscillator
setup:
  chandeForecastOscillator(14)
```

`chandeForecastOscillator(14)` registers `cfo14`. In Java the class is `ChandeForecastOscillatorRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("cfo14", new ChandeForecastOscillatorRTIndicator(14))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Least squares moving average](/docs/indicators/averages/leastSquaresMovingAverage): the regression line it measures against, as a price.
- [Linear regression slope](/docs/indicators/statistics/linearRegressionSlope): the slope of the same line.
- [Z-score](/docs/indicators/statistics/zScore): the distance from the mean, in deviations.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
