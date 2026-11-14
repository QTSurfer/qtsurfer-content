---
title: "Vortex indicator"
description: "How the vortex indicator compares the movement from each low to the next high with the one from each high to the next low, as two lines around 1, and how to use it in a QTSurfer strategy."
order: 5.46
lastUpdated: '2026-11-14T12:16:29Z'
---

The **vortex indicator**, by Etienne Botes and Douglas Siepman, compares the upward movement, from each bar's low to the next bar's high, with the downward one, from each high to the next low, against the true range. It draws two lines: `VI+` and `VI−`.

Try it on a series below and change the period.

<div data-indicator-chart="vortex"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
VM+  = |high − previous low|
VM−  = |low − previous high|
VI+  = Σ VM+ over N bars / Σ TR over N bars
VI−  = Σ VM− over N bars / Σ TR over N bars
```

`TR` is the true range. The main line the engine registers is `VI+ − VI−`, which is not drawn: the chart draws `VI+` and `VI−`. The first value is on update `N + 1`, and the chart draws from there.

## Reading it

- **`VI+` above `VI−` is an uptrend, below it a downtrend**, and the crossing is the usual signal. On the real series of the chart, at period 14, `VI+` is above `VI−` on 43 % to 52 % of the bars, and the two cross 34 to 39 times in the 286 bars drawn.
- **Both lines are around 1.** Their medians are between 0.99 and 1.03 on the real series of the chart, and they can go beyond 1: on bars that rise by one with a range of one, `VI+` reads 2 and `VI−` 0.
- **A price that does not move reads 0 in both.**

## In a strategy

```
uses pro.vortex
setup:
  vortex(14)
```

`vortex(14)` registers `vortex14`, with `vortex14ViPlus` and `vortex14ViMinus` beside it. In Java the class is `VortexRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.trend.pro`, and a group takes it with `indicators.add("vortex14", new VortexRTIndicator(14))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Average directional index](/docs/indicators/trend/adx): the directional lines of Wilder, with the strength of the trend.
- [Aroon](/docs/indicators/trend/aroon): another pair of lines that say which way the trend goes.
- [ATR](/docs/indicators/volatility/atr): the true range the movements are divided by.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
