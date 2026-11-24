---
title: "Know sure thing (KST)"
description: "How the know sure thing adds four smoothed rates of change of different lengths, with its signal line, from which update both are ready, and how to use it in a QTSurfer strategy."
order: 2.47
lastUpdated: '2026-11-22T19:38:50Z'
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

The first value is on update 53, when the KST and its signal are both ready, and the chart draws from there. The simple averages are the [moving](/docs/indicators/averages/sma) ones, which take a new value with every update, as in Pring's design. The KST alone is already Pring's from update 45, but the engine reports it ready together with its signal, so a rule that reads either gets values from 53 on.

## Reading it

- **The zero line is the sign of the combined momentum**, and the longest rate counts four times what the shortest does, so the KST follows the slow trend more than the fast one.
- **The signal is its average.** The KST crossing its signal is the usual trigger. On the real series of the chart the two cross 13 to 16 times in the 248 bars from update 53.
- **Its scale depends on the instrument**: on the real series of the chart, from update 53, it goes from −178 to 210 on the daily BTC/USDT and from −32 to 11 on the 15-minute ETH/USDT.

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
- [Simple moving average](/docs/indicators/averages/sma): the average it smooths with, in its moving mode.
- [Coppock curve](/docs/indicators/oscillators/coppockCurve): another sum of smoothed rates of change.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
