---
title: "Accumulation/distribution line (ADL)"
description: "How the accumulation/distribution line keeps a running total of each bar's volume weighted by where the close sits in its range, why its level means nothing and its direction does, and how to use it in a QTSurfer strategy."
order: 6.41
lastUpdated: '2026-11-14T12:16:29Z'
---

The **accumulation/distribution line** (ADL), by Marc Chaikin, keeps a running total of each bar's volume weighted by where the close sits in its range: all of it counts as buying at the high, all as selling at the low.

Try it on a series below. It has no parameter, and the line is drawn in its own pane, in units of volume.

<div data-indicator-chart="adl"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
multiplier = ((close − low) − (high − close)) / (high − low)        −1 at the low, 1 at the high
ADL        = previous ADL + multiplier × volume
```

A bar with no range has a multiplier of 0. The first value is on the first bar. The volume is the one of the bars of the series; the real ones carry the exchange's volume.

## Reading it

- **Its level means nothing.** It depends on where the series starts. What counts is its direction and whether it follows the price: on the real series of the chart it ends at 6,018 on the daily BTC/USDT, −1,130 on the hourly one and −38,356 on the 15-minute ETH/USDT.
- **On bars that close at their high it adds the whole volume of every bar**: 4,000 after 80 bars of volume 50; at their low it subtracts it; on bars with no range it stays at 0.
- **It rises on 44 % to 52 % of the bars** of the real series of the chart.

## In a strategy

```
uses pro.adl
setup:
  adl()
```

`adl()` registers `adl`. It has no form with parameters. In Java the class is `AdlRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.volume.pro`, and a group takes it with `indicators.add("adl", new AdlRTIndicator())`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [Chaikin oscillator](/docs/indicators/volume/chaikinOscillator): the momentum of this line: two averages of it.
- [Chaikin money flow](/docs/indicators/volume/cmf): the same multiplier over a window, as a ratio.
- [On-balance volume](/docs/indicators/volume/obv): the running total of volume by the sign of the change.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
