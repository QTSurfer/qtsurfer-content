---
title: "Calmar ratio"
description: "How the Calmar ratio divides the annualized return of the last bars by their largest drawdown, why its default factor suits daily bars only, and how to use it in a QTSurfer strategy."
order: 8.04
lastUpdated: '2026-11-12T20:44:51Z'
---

The **Calmar ratio**, by Terry Young, divides the annualized return of the last `N` bars by their largest drawdown: how much return for how deep a fall.

Try it on a series below and change the period.

<div data-indicator-chart="calmarRatio"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
r      = ln(price / previous price)                          the return of each bar
cum_k  = Σ r up to the k-th of the last N returns             the cumulative log return, from 0 at the window's start
DD     = largest (highest cum so far − cum_k)                 the largest drawdown of the window
Calmar = mean(r) × 252 / DD                                   252 by default
```

The drawdown is measured on the cumulative log return, so it is in log units, the log of the peak over the value, and not a percentage of the peak. The 252 is the annualization factor for daily bars; it multiplies the mean return and is a parameter (the QTScript forms with an extra number pass it, see the catalogue). A window with no drawdown reads 0. It needs at least 2 periods. `N` returns need `N + 1` prices, so the first value is on update `N + 1`, and the line reads 0 before it.

## Reading it

- **The default factor is for daily bars.** On the hourly and the 15-minute series of the chart it multiplies a much smaller return by the same 252, so the figures are not annual ones. Give the factor of the series, the number of its bars in a year.
- **In a window that only falls it reads `−252 / N`**: −12.6 at period 20, which is the lowest value on the three real series of the chart.
- **It can be huge on a short window**, because the drawdown can be tiny: on the real series of the chart, at period 20, it goes up to 86.6 on the daily BTC/USDT, 108.7 on the hourly one and 110.3 on the 15-minute ETH/USDT.
- **A window with no drawdown reads 0**, so a price that rises 1 % every bar reads 0, and so does a price that does not move. It has the sign of the mean return.

## In a strategy

```
uses pro.calmarRatio
setup:
  calmarRatio(20)
```

`calmarRatio(20)` registers `calmar20`. In Java the class is `CalmarRatioRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, and a group takes it with `indicators.add("calmar20", new CalmarRatioRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Maximum drawdown](/docs/indicators/risk/maxDrawdown): the largest fall since the start, as a fraction of the peak.
- [Sharpe ratio](/docs/indicators/risk/sharpeRatio): return per unit of spread, per bar.
- [Ulcer index](/docs/indicators/risk/ulcerIndex): the depth and duration of the drawdowns of the window.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
