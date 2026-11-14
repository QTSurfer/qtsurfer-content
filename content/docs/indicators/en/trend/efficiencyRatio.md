---
title: "Efficiency ratio"
description: "How the efficiency ratio sets the net move of the price against the sum of its moves, from 0 to 1, how straight the price went, and how to use it in a QTSurfer strategy."
order: 5.44
lastUpdated: '2026-11-14T12:16:29Z'
---

The **efficiency ratio**, by Perry Kaufman, sets the net move of the price over `N` bars against the sum of all its moves: 1 when it went straight, near 0 when it wandered. It is what [KAMA](/docs/indicators/averages/kama) adapts its speed with.

Try it on a series below and change the period.

<div data-indicator-chart="efficiencyRatio"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
ER = |price − price N bars ago| / Σ |price change|        over the last N bars
```

A window with no movement gives 0. `N` changes need `N + 1` prices, so the first value is on update `N + 1`, and the line reads 0 before it.

## Reading it

- **It reads 1 on a straight line, rise or fall**, and 0 on a price that does not move or ends where it started.
- **Most of the time it is low.** On the real series of the chart, at period 10, it is above 0.5 on 17 % to 20 % of the bars and below 0.3 on 52 % to 61 %: prices spend most of their time wandering.
- **It says nothing about the direction**, only about how straight the price went.

## In a strategy

```
uses pro.efficiencyRatio
setup:
  efficiencyRatio(10)
```

`efficiencyRatio(10)` registers `er10`. In Java the class is `EfficiencyRatioRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.trend.pro`, and a group takes it with `indicators.add("er10", new EfficiencyRatioRTIndicator(10))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Kaufman's adaptive moving average](/docs/indicators/averages/kama): the average that adapts its speed with this ratio.
- [Choppiness index](/docs/indicators/volatility/choppinessIndex): another way to tell a market that wanders from one that trends.
- [Average directional index](/docs/indicators/trend/adx): how strong the trend is.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
