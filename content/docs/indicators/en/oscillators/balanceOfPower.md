---
title: "Balance of power (BOP)"
description: "How the balance of power sets the move from the open to the close against the range of each bar, from minus 1 to 1, with no smoothing, and how to use it in a QTSurfer strategy."
order: 2.58
lastUpdated: '2026-11-13T21:28:19Z'
---

The **balance of power** (BOP), by Igor Livshin, sets the move of each bar from its open to its close against its range, from −1 to 1: who won the bar, the buyers or the sellers.

Try it on a series below. It has no parameter, and the line is drawn in its own pane, from −1 to 1.

<div data-indicator-chart="balanceOfPower"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
BOP = (close − open) / (high − low)
```

A bar with no range gives 0. The engine gives the value of each bar, with no smoothing; some charts average it. The first value is on the first bar.

## Reading it

- **It reads 1 for a bar that opens at its low and closes at its high, −1 for the opposite**, and 0 for a doji or a bar with no range.
- **It is nervous, one bar at a time.** On the real series of the chart it goes from −1.00 to 0.97, and it is positive on 48 % of the bars.
- **It looks only at the body against the range**, not at where the bar is against the previous one: a bar can have a BOP of 1 and close below the previous close.

## In a strategy

```
uses pro.balanceOfPower
setup:
  balanceOfPower()
```

`balanceOfPower()` registers `bop`. It has no form with parameters. In Java the class is `BalanceOfPowerRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("bop", new BalanceOfPowerRTIndicator())`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [Relative vigor index](/docs/indicators/oscillators/relativeVigorIndex): the same body against the range, weighted over four bars and smoothed.
- [Chaikin money flow](/docs/indicators/volume/cmf): how the close sits in the range, weighted by the volume.
- [Williams %R](/docs/indicators/oscillators/williamsR): where the close sits in the range of the last bars.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
