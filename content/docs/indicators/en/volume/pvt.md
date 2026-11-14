---
title: "Price volume trend (PVT)"
description: "How the price volume trend keeps a running total of each bar's volume weighted by the percentage change of the close, and how to use it in a QTSurfer strategy."
order: 6.47
---

The **price volume trend** (PVT) keeps a running total of each bar's volume weighted by the percentage change of the close. It is the [on-balance volume](/docs/indicators/volume/obv) with the size of the move counted, not only its sign.

Try it on a series below. It has no parameter, and the line is drawn in its own pane, in units of volume.

<div data-indicator-chart="pvt"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
PVT = previous PVT + (close − previous close) / previous close × volume
```

It starts at 0 on the first bar. A previous close of 0 leaves it unchanged. The volume is the one of the bars of the series; the real ones carry the exchange's volume.

## Reading it

- **Its level means nothing.** It depends on where the series starts; what counts is its direction and whether it follows the price. On the real series of the chart it ends at −6,470 on the daily BTC/USDT, −214 on the hourly one and −4,327 on the 15-minute ETH/USDT, as the price ended lower.
- **A small move counts little and a big one a lot**, where the on-balance volume counts the whole volume either way.
- **A price that does not move leaves it at 0.**

## In a strategy

```
uses pro.pvt
setup:
  pvt()
```

`pvt()` registers `pvt`. It has no form with parameters. In Java the class is `PvtRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.volume.pro`, and a group takes it with `indicators.add("pvt", new PvtRTIndicator())`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [On-balance volume](/docs/indicators/volume/obv): the same total, counting the whole volume by the sign of the change.
- [Negative volume index](/docs/indicators/volume/negativeVolumeIndex): the percentage change only on the bars where the volume fell.
- [Rate of change](/docs/indicators/oscillators/roc): the percentage change of the price.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
