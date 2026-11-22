---
title: "Loss"
description: "How loss gives the size of each fall as a positive number and keeps the count of falls in a row, why it needs a name, and how to use it in a QTSurfer strategy."
order: 10.02
lastUpdated: '2026-11-22T19:06:11Z'
---

The **loss** is the size of the fall since the update before, as a positive number in the units of what it reads, and 0 when there is no fall. Beside the value it keeps a counter: how many falls have come in a row.

Try it on a series below.

<div data-indicator-chart="loss"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
loss   = max(previous value − value, 0)
streak = falls in a row
```

It is ready from the first update, where it gives 0. A rise resets the streak, and so does an unchanged value, unless the third argument is `false`: then an unchanged value keeps the streak without adding to it.

## Reading it

- **It is never negative.** A fall of 3 reads 3, so a rule compares it with a positive threshold.
- **The value is an amount, the streak is a count**: how much it fell now, and for how long it has been falling.
- **It is the fall of one update**, not the loss of a position and not a drawdown.

## In a strategy

```
setup:
  loss("losses", "price")
```

That registers `losses`, the amount. Give it a name: `loss("price")` registers `_lossprice`, and a name that starts with `_` is hidden, so it is not reported with the signals. In Java, `.loss("losses", "price")` on the builder, and the streak is `((LossRTIndicator) indicators.getExisting("losses")).getPeriodCount()`.

## Related

- [Gain](/docs/indicators/extremes/gain): the same for the rises.
- [RSI](/docs/indicators/oscillators/rsi): the average gain against the average loss.
- [Maximum drawdown](/docs/indicators/risk/maxDrawdown): the worst fall from a peak.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
