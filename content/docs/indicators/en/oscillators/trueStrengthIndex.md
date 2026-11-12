---
title: "True strength index (TSI)"
description: "How the true strength index double-smooths the price changes and sets them against their double-smoothed size, from minus 100 to 100, and how to use it in a QTSurfer strategy."
order: 2.44
lastUpdated: '2026-11-12T21:21:22Z'
---

The **true strength index** (TSI), by William Blau, double-smooths the price changes and sets them against the double-smoothed size of those changes, from −100 to 100.

Try it on a series below and change the two periods.

<div data-indicator-chart="trueStrengthIndex"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
change = price − previous price
TSI    = 100 × EMA(EMA(change, long), short) / EMA(EMA(|change|, long), short)
```

The long period is 25 by default and the short one 13. The exponential averages start on their first input, and a window with no change gives 0. The first value is on update 14 with the defaults, and the line reads 0 before it.

## Reading it

- **It reads 100 on a straight rise and −100 on a straight fall**, and 0 on a price that does not move.
- **It is slow and smooth.** The two smoothings make it turn after the price has turned. On the real series of the chart, with the defaults, it goes from −85.6 to 55.3.
- **It is positive on 27 % to 49 % of the bars** of the real series of the chart.

## In a strategy

```
uses pro.trueStrengthIndex
setup:
  trueStrengthIndex(25, 13)
```

`trueStrengthIndex(25, 13)` registers `tsi25_13`. In Java the class is `TrueStrengthIndexRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("tsi25_13", new TrueStrengthIndexRTIndicator(25, 13))`.

The two periods are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

## Related

- [TRIX](/docs/indicators/oscillators/trix): another triple-smoothed momentum, as a percentage.
- [MACD](/docs/indicators/oscillators/macd): the gap between two exponential averages.
- [Chande momentum oscillator](/docs/indicators/oscillators/cmo): gains against losses, with no smoothing.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
