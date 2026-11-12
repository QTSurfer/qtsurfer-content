---
title: "Least squares moving average (LSMA)"
description: "How the least squares moving average takes the end of the straight line that best fits the last prices, why it does not lag on a trend and overshoots at a turn, and how to use it in a QTSurfer strategy."
order: 1.74
---

The **least squares moving average** (LSMA), also called the linear regression line or the end-point moving average, is the value at the latest bar of the straight line that best fits the last `N` prices.

Try it on a series below and change the period.

<div data-indicator-chart="leastSquaresMovingAverage"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
fit   price ≈ a + b × t          over the last N prices, t = 0 … N − 1, by least squares
LSMA = a + b × (N − 1)           the line at the latest bar
```

It needs at least 2 periods. The first value is on update `N`, and the chart draws from there. The default period is 25.

## Reading it

- **On a straight line it does not lag at all**: a line fits itself, so the LSMA reads the price exactly.
- **It overshoots at a turn, and more than the DEMA.** After a jump of 10 in the price the LSMA of period 25 reaches 113.1 before it settles at 110, and after a fall of 10 it goes down to 96.9: the fitted line keeps rising past the step. An average with positive weights never does that.
- **It is a line, not a smoothing.** It gives the value the window's own trend would reach now, so it follows a trend closely and goes wrong faster when the trend breaks.
- **On the daily BTC/USDT series of the chart**, at period 25 its mean distance from the close is 2.7 % of the price, against 4.2 % for the EMA of the same period.

## In a strategy

```
uses pro.leastSquaresMovingAverage
setup:
  leastSquaresMovingAverage(25)
```

`leastSquaresMovingAverage(25)` registers `lsma25`. In Java the class is `LeastSquaresMovingAverageRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.averages.pro`, and a group takes it with `indicators.add("lsma25", new LeastSquaresMovingAverageRTIndicator(25))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Simple moving average](/docs/indicators/averages/sma): the plain mean, which lags on a trend.
- [Double exponential moving average](/docs/indicators/averages/dema): another average that removes the lag on a trend, and overshoots.
- [Hull moving average](/docs/indicators/averages/hma): a smoother way to cut the lag.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
