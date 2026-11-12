---
title: "Know sure thing (KST)"
description: "How the know sure thing adds four smoothed rates of change of different lengths, with its signal line, why the engine's version moves in steps, and how to use it in a QTSurfer strategy."
order: 2.47
lastUpdated: '2026-11-12T21:21:22Z'
---

The **know sure thing** (KST), by Martin Pring, adds four rates of change of different lengths, each smoothed with a simple average and weighted more the longer it is. It comes with a signal line, the average of the KST itself.

Try it on a series below. It has no parameter: the periods and the weights are the ones of Pring's design.

<div data-indicator-chart="knowSureThing"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
KST    = 1 × SMA₁₀(ROC₁₀) + 2 × SMA₁₀(ROC₁₅) + 3 × SMA₁₀(ROC₂₀) + 4 × SMA₁₅(ROC₃₀)
Signal = SMA₉(KST)
```

The first value is on update 31, when the longest rate of change is ready, and the chart draws from there. **The engine smooths with its default simple average, the [discrete](/docs/indicators/averages/sma) one**, which takes the mean of a complete block and holds it until the next block is complete, where Pring's design uses a moving average. So the KST and its signal move in steps: on the real series of the chart, 87 % of the bars repeat the previous value of the KST, and 89 % that of the signal.

## Reading it

- **The zero line is the sign of the combined momentum**, and the longest rate counts four times what the shortest does, so the KST follows the slow trend more than the fast one.
- **The signal is its average.** The KST crossing its signal is the usual trigger; on the real series of the chart the two cross 15 to 18 times in the 270 bars drawn.
- **Its scale depends on the instrument**: on the real series of the chart it goes from −178 to 171 on the daily BTC/USDT and from −40 to 11 on the 15-minute ETH/USDT.

## In a strategy

```
uses pro.knowSureThing
setup:
  knowSureThing()
```

`knowSureThing()` registers `kst`, with the signal beside it as `kstSignal`. It has no form with parameters. In Java the class is `KnowSureThingRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("kst", new KnowSureThingRTIndicator())`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

## Related

- [Rate of change](/docs/indicators/oscillators/roc): the rate of change it adds four times.
- [Simple moving average](/docs/indicators/averages/sma): the discrete average it smooths with, explained there.
- [Coppock curve](/docs/indicators/oscillators/coppockCurve): another sum of smoothed rates of change.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
