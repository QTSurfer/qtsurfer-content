---
title: "Value at risk (VaR)"
description: "How the value at risk gives the loss a bar is not expected to exceed with 95 percent confidence if the returns were normal, how often real losses pass it, and how to use it in a QTSurfer strategy."
order: 7.09
lastUpdated: '2026-11-12T18:54:41Z'
---

The **value at risk** (VaR) is the loss that a bar is not expected to exceed, with 95 % confidence, if the returns followed a normal distribution with the mean and the deviation of the last `N` returns.

Try it on a series below and change the period.

<div data-indicator-chart="valueAtRisk"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
r   = ln(price / previous price)               the return of each bar
VaR = 1.6449 × deviation(r) − mean(r)           over the last N returns
```

1.6449 is the one-sided 95 % point of the normal distribution, and the deviation divides by `N`. The result is a fraction of the price: 0.035 is a loss of 3.5 %. `N` returns need `N + 1` prices, so the first value is on update `N + 1`, and the line reads 0 before it. The engine also takes a confidence level, 0.95 by default, and an annualization factor, 1 by default; the QTScript forms with extra numbers pass them (see the catalogue).

## Reading it

- **It is a loss written as a positive number**, as a share of the price. On the real series of the chart, at period 20, its mean is 3.5 % on the daily BTC/USDT (from 1.6 % to 9.5 %) and 0.6 % on the hourly and the 15-minute series.
- **Real losses pass it more often than 5 %.** On the three real series of the chart, the loss of the next bar went past the value at risk on 5.4 %, 5.7 % and 6.1 % of the bars: the normal distribution is an assumption, and the tails of the returns are heavier.
- **It can be negative.** The mean return is subtracted, so in a steady rise it outweighs the deviation: a price that rises 1 % every bar reads −0.00995, a window with no losses. A price that does not move reads 0.

## In a strategy

```
uses pro.valueAtRisk
setup:
  valueAtRisk(20)
```

`valueAtRisk(20)` registers `valRisk20`. In Java the class is `ValueAtRiskRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, and a group takes it with `indicators.add("valRisk20", new ValueAtRiskRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Exact standard deviation](/docs/indicators/statistics/exactStdDev): the spread of the prices, which the value at risk takes from the returns instead.
- [Z-score](/docs/indicators/statistics/zScore): another way to put the latest move in deviations.
- [ATR](/docs/indicators/volatility/atr): how much a bar moves, in price units.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
