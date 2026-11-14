---
title: "Chande Kroll stop"
description: "How the Chande Kroll stop draws two stop lines from the highest and lowest closes less and plus a multiple of the average true range, then takes the extreme of each, and how to use it in a QTSurfer strategy."
order: 5.42
---

The **Chande Kroll stop**, by Tushar Chande and Stanley Kroll, draws two stop lines from the extremes of the recent closes, moved by a multiple of the [average true range](/docs/indicators/volatility/atr), and then takes the extreme of each over a second window.

Try it on a series below and change the periods and the multiplier.

<div data-indicator-chart="chandeKrollStop"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
first high stop = highest close of the last stopPeriod − multiplier × ATR(atrPeriod)
first low stop  = lowest close of the last stopPeriod  + multiplier × ATR(atrPeriod)
StopShort       = highest first high stop of the last finalPeriod
stop long       = lowest first low stop of the last finalPeriod                       the main line
```

The defaults are 10, 1, 9 and 9 (ATR period, multiplier, stop period and final period). The engine takes the highest and lowest **closes**, where some descriptions use the highs and lows of the bars. It rejects a negative multiplier when it builds the indicator. The first value is on update `atrPeriod`, and the chart draws from there. The main line the engine registers is the `stop long`; the chart draws it and `StopShort` over the price.

## Reading it

- **The two lines cross.** The main line is at or above `StopShort` on only 12 % to 25 % of the bars of the real series of the chart: most of the time the `StopShort` line is the higher of the two.
- **The close is above the main line on 54 % to 56 % of the bars** of the real series of the chart, and above `StopShort` on 33 % to 50 %.
- **The multiplier sets the distance**: a larger one pushes the lines away from the closes.

## In a strategy

```
uses pro.chandeKrollStop
setup:
  chandeKrollStop(10, 1, 9, 9)
```

`chandeKrollStop(10, 1, 9, 9)` registers `cks10_1_9_9` (the stop long), with `cks10_1_9_9StopShort` beside it. In Java the class is `ChandeKrollStopRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.trend.pro`, and a group takes it with `indicators.add("cks10_1_9_9", new ChandeKrollStopRTIndicator(10, 1, 9, 9))`.

The periods and the multiplier are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [Chandelier exit](/docs/indicators/trend/chandelierExit): another stop from the extremes and the average range.
- [SuperTrend](/docs/indicators/trend/superTrend): a stop that follows the average range and flips.
- [ATR](/docs/indicators/volatility/atr): the range the stops are moved by.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
