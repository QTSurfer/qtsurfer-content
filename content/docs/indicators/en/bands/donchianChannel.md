---
title: "Donchian channel"
description: "How the Donchian channel draws the highest high and the lowest low of the last bars with their middle, why the close never leaves its own channel, and how to use it in a QTSurfer strategy."
order: 3.41
lastUpdated: '2026-11-13T23:26:15Z'
---

The **Donchian channel**, by Richard Donchian, draws the highest high and the lowest low of the last `N` bars, with the middle between them.

Try it on a series below and change the period.

<div data-indicator-chart="donchianChannel"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
upper  = highest high of the last N bars
lower  = lowest low of the last N bars
middle = (upper + lower) / 2
```

The window includes the latest bar. The main line the engine registers is the middle; the chart draws the three over the price. The first value is on update `N`, and the chart draws from there.

## Reading it

- **The close never leaves its own channel**, because the latest bar is in the window: on the real series of the chart the close is inside it on every bar. A breakout is read against the channel of the previous bar, and even then, at period 20, the close reached the previous upper line on 2 % to 4 % of the bars.
- **Its width follows the volatility.** At period 20 the channel is on average 16.1 % of the close on the daily BTC/USDT, 2.6 % on the hourly one and 2.4 % on the 15-minute ETH/USDT.
- **It is a step line.** It only moves when a new high or low enters the window, or an old one leaves it.

## In a strategy

```
uses pro.donchianChannel
setup:
  donchianChannel(20)
```

`donchianChannel(20)` registers `donch20` (the middle), with `donch20Upper` and `donch20Lower` beside it. In Java the class is `DonchianChannelRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.trend.pro`, and a group takes it with `indicators.add("donch20", new DonchianChannelRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Rolling percentile](/docs/indicators/statistics/rollingPercentile): the same window, with the percentiles of the close.
- [Bollinger bands](/docs/indicators/bands/bollinger): a band from the deviation instead of from the extremes.
- [ATR](/docs/indicators/volatility/atr): how much a bar moves, to size the channel.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
