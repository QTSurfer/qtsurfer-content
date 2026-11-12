---
title: "SuperTrend"
description: "How the SuperTrend follows the price at a distance of a multiple of the average range, flips when the price crosses it, and how to use it in a QTSurfer strategy."
order: 5.2
---

The **SuperTrend** is a line that follows the price at a distance set by the average range: below it in a rise and above it in a fall. When the close crosses the line, it jumps to the other side. It is used as a trailing stop and as a trend signal.

Try it on a series below. Change the period of the range and the multiplier.

<div data-indicator-chart="superTrend"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
middle = (high + low) / 2
upper  = middle + multiplier × ATR        the upper band only comes down
lower  = middle − multiplier × ATR        the lower band only goes up
line   = the lower band in a rise, the upper band in a fall
```

The `ATR` is the average true range of the [ATR](/docs/indicators/volatility/atr) page, except for how it starts: for the first `N` bars it is the mean of the ranges so far, and from there it smooths as Wilder does. The bands ratchet: the upper one can only come down and the lower one only go up. The line starts in a rise. When a close falls under the lower band the line flips to the upper band, which starts again from its basic value; when a close rises above the upper band it flips to the lower one. The first value is on update `N`, and the chart draws from there.

The two bands register beside the line, as `Upper` and `Lower`, and the chart draws only the line. A price that does not move gives a line on the price.

## Reading it

- **The line is a stop.** In a rise it stays below the price and only moves up; a close under it ends the rise. The flips are the signals.
- **On a straight rise it trails the price by the multiplier times the average range.**
- **A larger multiplier flips less often.** It keeps the line farther from the price, so the price has to go further to cross it. On the series of the chart a multiplier of 1.5 flips the line several times more often than one of 4.5.
- **It is late by design.** It flips only after the price has gone through the line, so it gives back part of a move before it signals.

## In a strategy

```
uses pro.superTrend
setup:
  superTrend(10, 3)
```

`superTrend(10, 3)` registers `st10_3`, with the bands beside it as `st10_3Upper` and `st10_3Lower`; the arguments are the period of the range and the multiplier, and `superTrend()` takes 10 and 3. In Java, `Pro.on(indicators).superTrend(10, 3)`.

The period of the range and the multiplier are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [ATR](/docs/indicators/volatility/atr): the average range it is built on.
- [Average directional index](/docs/indicators/trend/adx): how strong the trend is, whichever side it is on.
- [Ichimoku cloud](/docs/indicators/trend/ichimoku): a trend indicator that reads the price against its own highs and lows.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
