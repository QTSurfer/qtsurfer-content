---
title: "On-balance volume (OBV)"
description: "How the on-balance volume keeps a running total of volume, added when the close rises and subtracted when it falls, why its level means nothing and its direction does, and how to use it in a QTSurfer strategy."
order: 6.1
---

The **on-balance volume** (OBV), by Joseph Granville, is a running total of volume: it adds the volume of a bar when the close is above the previous close, subtracts it when the close is below, and leaves it as it was when the two are equal.

Try it on a series below. It has no parameter, and the line is drawn in its own pane, in units of volume.

<div data-indicator-chart="obv"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
OBV = previous OBV + volume        if close > previous close
OBV = previous OBV − volume        if close < previous close
OBV = previous OBV                 if close = previous close
```

The first bar has no previous close and the OBV starts at 0 there, so the chart draws from the first bar. The engine needs the close and the volume of each bar.

## Reading it

- **Its level means nothing.** It depends on where the series starts, on the first bar. What counts is its direction and whether it follows the price.
- **On a straight rise it adds the volume of every bar**, and on a straight fall it subtracts it; on a price that does not move it stays at 0.
- **It counts the whole volume of a bar as buying or as selling**, according to where the close is against the previous close, whatever the size of the move: a close one cent above and a close ten percent above add the same.

## In a strategy

```
uses pro.obv
setup:
  obv()
```

`obv()` registers `obv`. In Java, `Pro.on(indicators).obv()`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [Volume-weighted average price](/docs/indicators/volume/vwap): the other volume indicator that has no parameter.
- [Money flow index](/docs/indicators/volume/mfi): a volume-weighted RSI, between 0 and 100.
- [Chaikin money flow](/docs/indicators/volume/cmf): how the volume splits between buying and selling, from where the bars close.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
