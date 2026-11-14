---
title: "Chandelier exit"
description: "How the chandelier exit hangs a stop at a multiple of the average true range below the highest high, and another above the lowest low, and how to use it in a QTSurfer strategy."
order: 5.43
lastUpdated: '2026-11-14T12:16:29Z'
---

The **chandelier exit**, by Chuck LeBeau, hangs a stop from the highest high of the last `N` bars, at a multiple of the [average true range](/docs/indicators/volatility/atr) below it, for a long position; and another from the lowest low, above it, for a short one.

Try it on a series below and change the period and the multiplier.

<div data-indicator-chart="chandelierExit"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
long exit  = highest high of the last N bars − multiplier × ATR(N)
short exit = lowest low of the last N bars   + multiplier × ATR(N)
```

The defaults are 22 and 3. The engine rejects a negative multiplier when it builds the indicator. The main line it registers is the long exit, and the short exit comes beside it as `ShortExit`. The first value is on update `N`, and the chart draws from there.

## Reading it

- **Each line is a ratchet in a trend**: in a rise the long exit climbs with the highest high and never falls while the high holds. It falls when the high leaves the window or the range widens.
- **The close breaks them often.** On the real series of the chart, with the defaults, the close is below the long exit on 26 % to 31 % of the bars and above the short exit on 24 % to 28 %.
- **The multiplier is the one number to tune**: 3 is the usual; a smaller one stops out sooner.

## In a strategy

```
uses pro.chandelierExit
setup:
  chandelierExit(22, 3)
```

`chandelierExit(22, 3)` registers `chand22_3` (the long exit), with `chand22_3ShortExit` beside it. In Java the class is `ChandelierExitRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.trend.pro`, and a group takes it with `indicators.add("chand22_3", new ChandelierExitRTIndicator(22, 3))`.

The period and the multiplier are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [SuperTrend](/docs/indicators/trend/superTrend): a stop that follows the average range and flips.
- [Chande Kroll stop](/docs/indicators/trend/chandeKrollStop): another stop from the extremes and the average range.
- [Donchian channel](/docs/indicators/bands/donchianChannel): the highest high and lowest low it hangs from.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
