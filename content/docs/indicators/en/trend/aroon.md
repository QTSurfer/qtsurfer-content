---
title: "Aroon"
description: "How the Aroon measures how long ago the highest high and the lowest low of the last bars were, as two lines from 0 to 100 and their difference, and how to use it in a QTSurfer strategy."
order: 5.41
lastUpdated: '2026-11-14T12:16:29Z'
---

The **Aroon**, by Tushar Chande, measures how long ago the highest high and the lowest low of the last `N` bars were. `Up` is 100 when the high was on the latest bar and falls to 0 as it ages; `Down` does the same for the low.

Try it on a series below and change the period.

<div data-indicator-chart="aroon"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
Up   = 100 × (N − bars since the highest high) / N        over the last N + 1 bars
Down = 100 × (N − bars since the lowest low) / N
Aroon = Up − Down
```

The main line the engine registers is the difference, from −100 to 100; the chart draws `Up` and `Down` over a pane with it. When the same extreme appears several times, the engine takes the oldest. A window with no movement gives 0. The first value is on update `N + 1`, and the chart draws from there.

## Reading it

- **A straight rise reads 100 and a straight fall −100**, since the high is always the latest bar and the low the oldest, or the opposite. A price that does not move reads 0.
- **A trend has `Up` near 100 and `Down` low; a range has both low.** On the real series of the chart, at period 25, `Up` is 100 on 4 % to 8 % of the bars, and both lines are under 50 on 19 % to 28 %: a market with no recent extreme.
- **The difference is positive on 40 % to 51 % of the bars** of the real series of the chart.

## In a strategy

```
uses pro.aroon
setup:
  aroon(25)
```

`aroon(25)` registers `aroon25`, with `aroon25Up` and `aroon25Down` beside it. In Java the class is `AroonRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.trend.pro`, and a group takes it with `indicators.add("aroon25", new AroonRTIndicator(25))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Average directional index](/docs/indicators/trend/adx): how strong the trend is, not which way.
- [Donchian channel](/docs/indicators/bands/donchianChannel): the highest high and the lowest low themselves.
- [Vortex indicator](/docs/indicators/trend/vortex): another pair of lines that say which way the trend goes.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
