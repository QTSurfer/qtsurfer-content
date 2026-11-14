---
title: "Negative volume index (NVI)"
description: "How the negative volume index moves only on the bars where the volume fell from the previous one, by the percentage change of the close, starting at 1000, and how to use it in a QTSurfer strategy."
order: 6.46
lastUpdated: '2026-11-14T12:16:29Z'
---

The **negative volume index** (NVI), by Paul Dysart and Norman Fosback, starts at 1000 and moves only on the bars where the volume fell from the previous bar, by the percentage change of the close. The idea is that the informed trade in the quiet bars.

Try it on a series below. It has no parameter, and the line is drawn in its own pane, from 1000.

<div data-indicator-chart="negativeVolumeIndex"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
NVI = previous NVI + (close − previous close) / previous close × previous NVI        if volume < previous volume
NVI = previous NVI                                                                    otherwise
```

It starts at 1000 on the first bar. A previous close of 0 leaves it unchanged. The volume is the one of the bars of the series; the real ones carry the exchange's volume.

## Reading it

- **Its level starts at 1000 and means little**; what counts is its direction. On the real series of the chart it ends at 807 on the daily BTC/USDT, 1,027 on the hourly one and 975 on the 15-minute ETH/USDT.
- **It does not move on the bars where the volume held or rose.** On the real series of the chart it changes on 51 % to 55 % of the bars.
- **A price that does not move, or bars of rising volume, leave it at 1000.**

## In a strategy

```
uses pro.negativeVolumeIndex
setup:
  negativeVolumeIndex()
```

`negativeVolumeIndex()` registers `nvi`. It has no form with parameters. In Java the class is `NegativeVolumeIndexRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.volume.pro`, and a group takes it with `indicators.add("nvi", new NegativeVolumeIndexRTIndicator())`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [Price volume trend](/docs/indicators/volume/pvt): the volume weighted by the percentage change, on every bar.
- [On-balance volume](/docs/indicators/volume/obv): the running total of volume by the sign of the change.
- [Rate of change](/docs/indicators/oscillators/roc): the percentage change of the price.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
