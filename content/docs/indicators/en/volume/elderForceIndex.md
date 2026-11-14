---
title: "Elder force index"
description: "How the Elder force index smooths the change of the close times the volume, so that a big move on a big volume weighs the most, and how to use it in a QTSurfer strategy."
order: 6.44
lastUpdated: '2026-11-14T12:16:29Z'
---

The **Elder force index**, by Alexander Elder, smooths the change of the close times the volume: a big move on a big volume weighs the most. It is drawn around zero.

Try it on a series below and change the period.

<div data-indicator-chart="elderForceIndex"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
force = (close − previous close) × volume
EFI   = EMA(force, N)
```

The average starts on the first force. The first value is on update `N + 1`, and the chart draws from there. The volume is the one of the bars of the series; the real ones carry the exchange's volume.

## Reading it

- **Above zero the buyers have the force, below it the sellers.** On a straight rise of 1 per bar with a volume of 50 it reads 50, and on a straight fall −50.
- **Its scale is price times volume**, so it does not compare between instruments: it goes from −199,679,272 to 65,155,699 on the daily BTC/USDT and from −1,060,728 to 21,355 on the 15-minute ETH/USDT.
- **It is positive on 37 % to 47 % of the bars** of the real series of the chart.

## In a strategy

```
uses pro.elderForceIndex
setup:
  elderForceIndex(13)
```

`elderForceIndex(13)` registers `efi13`. In Java the class is `ElderForceIndexRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.volume.pro`, and a group takes it with `indicators.add("efi13", new ElderForceIndexRTIndicator(13))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [On-balance volume](/docs/indicators/volume/obv): the volume added or subtracted by the sign of the change.
- [Price volume trend](/docs/indicators/volume/pvt): the volume weighted by the percentage change.
- [Exponential moving average](/docs/indicators/averages/ema): the average the force is smoothed with.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
