---
title: "Sharpe ratio"
description: "How the Sharpe ratio divides the mean return of the last bars by how much the returns vary, per bar and not annualized, why a window with no variation reads 0, and how to use it in a QTSurfer strategy."
order: 8.01
lastUpdated: '2026-11-12T20:44:51Z'
---

The **Sharpe ratio**, by William Sharpe, divides the mean return of the last `N` bars by how much the returns vary: return per unit of risk. Here it is per bar, not annualized.

Try it on a series below and change the period.

<div data-indicator-chart="sharpeRatio"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
r      = ln(price / previous price)                       the return of each bar
Sharpe = (mean(r) − risk-free rate) / deviation(r)         over the last N returns, the rate 0 by default
```

The deviation divides by `N`; a sample deviation, dividing by `N − 1`, would give a value 2.5 % lower at period 20 (a factor `√((N − 1) / N)`). A window whose returns do not vary has a deviation of 0, and the ratio reads 0, not a high value. `N` returns need `N + 1` prices, so the first value is on update `N + 1`, and the line reads 0 before it. The engine takes a risk-free rate per bar and an annualization factor that multiplies the result, 1 by default; the QTScript forms with extra numbers pass them (see the catalogue).

## Reading it

- **It is a ratio per bar, so it is small.** On the real series of the chart, at period 20, it goes from −0.63 to 0.63. To compare it with the figures of a report, annualize it: with daily bars, multiply by `√252` = 15.9.
- **Its sign is the sign of the mean return**, and the zero line splits the two: on the real series of the chart it is positive on 39 % to 49 % of the bars.
- **A window with no variation reads 0**, whatever its return: a price that rises 1 % every bar reads 0, and so does a price that does not move.
- **A short window says little.** With 20 returns, the standard error of a ratio near 0 is about `1 / √20` = 0.22, so a reading of 0.3 is well inside the noise.

## In a strategy

```
uses pro.sharpeRatio
setup:
  sharpeRatio(20)
```

`sharpeRatio(20)` registers `sharpe20`. In Java the class is `SharpeRatioRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, and a group takes it with `indicators.add("sharpe20", new SharpeRatioRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Sortino ratio](/docs/indicators/risk/sortinoRatio): the same idea with only the downside as risk.
- [Omega ratio](/docs/indicators/risk/omegaRatio): gains over losses, with no assumption about the spread.
- [Exact standard deviation](/docs/indicators/statistics/exactStdDev): the spread of the prices, instead of the spread of the returns.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
