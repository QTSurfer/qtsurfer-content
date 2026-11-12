---
title: "Commodity channel index (CCI)"
description: "How the CCI measures the distance of the price from its average in units of the usual deviation, what the engine applies it to, and how to use it in a QTSurfer strategy."
order: 2.3
lastUpdated: '2026-11-12T00:02:30Z'
---

The **commodity channel index** (CCI), by Donald Lambert, measures how far the price is from its recent average, in units of how far it usually is. It has no fixed range: it swings around zero.

Try it on a series below and change the period.

<div data-indicator-chart="cci"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
CCI = (price − SMA) / (0.015 × MAD)
```

`SMA` is the simple moving average of the last `N` prices and `MAD` the mean absolute deviation of those prices from it. The constant `0.015` is Lambert's. A price that does not move has a `MAD` of zero, and the engine reads 0 in that case.

The textbook applies it to the typical price, `(high + low + close) / 3`. The engine applies it to the price it is given: the close of a bar, or the last price of a ticker. The engine reports it ready after `N` updates, and the chart draws from there.

## Reading it

- **The levels of 100 and −100 are conventions.** On the real series of the chart about three values in five fall within them, with the engine's CCI on the close, so a value beyond them is not rare.
- **Crossing zero is the price crossing its average.** The sign says on which side of its recent mean the price is, and the size says how far.

## In a strategy

```
setup:
  cci(20)
```

`cci(20)` registers `cci20`. In Java, `.cci(20)` on the builder.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [RSI](/docs/indicators/oscillators/rsi): the other bounded-in-spirit oscillator, with a fixed range.
- [Simple moving average](/docs/indicators/averages/sma): the average the CCI measures the price against.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
