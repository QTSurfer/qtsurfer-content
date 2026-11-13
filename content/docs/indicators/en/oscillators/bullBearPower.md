---
title: "Bull and bear power"
description: "How the bull and bear power give how far the high and the low of each bar are from an exponential average of the close, in price units, and how to use them in a QTSurfer strategy."
order: 2.59
lastUpdated: '2026-11-13T21:28:19Z'
---

The **bull power** and the **bear power**, by Alexander Elder, say how far the high and the low of each bar are from an exponential average of the close: how high the buyers pushed, and how low the sellers did.

Try it on a series below and change the period.

<div data-indicator-chart="bullBearPower"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
Bull = high − EMA(close, N)
Bear = low  − EMA(close, N)
```

The engine registers the sum of the two as the main line, `bbp13`, which is not drawn: the chart draws `Bull` and `Bear`. The average is the [EMA](/docs/indicators/averages/ema), 13 bars by default, and the first value is on update `N`, from where the chart draws.

## Reading it

- **The bull power is usually above zero and the bear power below it**, since the high of a bar is usually above the average and its low below it. On the real series of the chart, at period 13, the bull power is above 0 on 64 % to 72 % of the bars and the bear power below 0 on 70 % to 77 %.
- **They are in price units**, so they do not compare between instruments.
- **A bear power that rises above zero**, or a bull power that falls below it, says that a whole bar, high and low, has moved to one side of the average.

## In a strategy

```
uses pro.bullBearPower
setup:
  bullBearPower(13)
```

`bullBearPower(13)` registers `bbp13`, with `bbp13Bull` and `bbp13Bear` beside it. In Java the class is `BullBearPowerRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("bbp13", new BullBearPowerRTIndicator(13))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Exponential moving average](/docs/indicators/averages/ema): the average the high and the low are measured from.
- [Balance of power](/docs/indicators/oscillators/balanceOfPower): who won each bar, from −1 to 1.
- [ATR](/docs/indicators/volatility/atr): how much a bar moves, in price units.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
