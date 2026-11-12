---
title: "Tail ratio"
description: "How the tail ratio compares the 95th percentile of the last returns with the absolute value of the 5th, the right tail against the left one, and how to use it in a QTSurfer strategy."
order: 8.07
lastUpdated: '2026-11-12T20:44:51Z'
---

The **tail ratio** compares the right tail of the last `N` returns with the left one: the 95th percentile over the absolute value of the 5th. Above 1 the best returns are larger than the worst ones.

Try it on a series below and change the period.

<div data-indicator-chart="tailRatio"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
r          = ln(price / previous price)                          the return of each bar
tail ratio = percentile 95 of r / |percentile 5 of r|             over the last N returns
```

The percentiles interpolate linearly, as in the [rolling percentile](/docs/indicators/statistics/rollingPercentile). A window whose 5th percentile is 0 reads 0. It needs at least 2 periods. `N` returns need `N + 1` prices, so the first value is on update `N + 1`, and the line reads 0 before it. The engine takes other percentiles (`withPercentiles(upper, lower)` in Java), and the QTScript forms with two extra numbers pass them (see the catalogue).

## Reading it

- **Above 1 the right tail is longer than the left one**, below 1 the left one is. Alternating up and down by the same proportion reads exactly 1.
- **It is not bounded, and it can be negative.** When the 95th percentile is itself below 0, as in a window that only falls, the ratio is negative: a price that falls 1 % every bar reads −1, and one that rises 1 % every bar reads 1.
- **It rests on a few returns.** At period 20 the 95th and the 5th percentiles are between the two largest and the two smallest returns, so one big return moves the ratio: on the real series of the chart it goes from 0.18 to 9.3, and its median is 0.95 to 1.05.
- **A price that does not move reads 0**, as its 5th percentile is 0.

## In a strategy

```
uses pro.tailRatio
setup:
  tailRatio(20)
```

`tailRatio(20)` registers `tail20`. In Java the class is `TailRatioRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, and a group takes it with `indicators.add("tail20", new TailRatioRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Rolling percentile](/docs/indicators/statistics/rollingPercentile): the percentile it is built from, of the price.
- [Omega ratio](/docs/indicators/risk/omegaRatio): gains over losses, as sums.
- [Kurtosis](/docs/indicators/statistics/kurtosis): how heavy the tails of a window are.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
