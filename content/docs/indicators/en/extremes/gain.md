---
title: "Gain"
description: "How the gain gives the size of each rise and keeps the count of rises in a row, why it needs a name, and how to use it in a QTSurfer strategy."
order: 10.01
lastUpdated: '2026-11-22T19:06:11Z'
---

The **gain** is the size of the rise since the update before, in the units of what it reads, and 0 when there is no rise. Beside the value it keeps a counter: how many rises have come in a row.

Try it on a series below.

<div data-indicator-chart="gain"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
gain   = max(value − previous value, 0)
streak = rises in a row
```

It is ready from the first update, where it gives 0. A fall resets the streak, and so does an unchanged value, unless the third argument is `false`: then an unchanged value keeps the streak without adding to it.

## Reading it

- **The value is an amount, the streak is a count.** They answer different questions: how much it rose now, and for how long it has been rising.
- **Over an average it measures the slope.** The gain of an [EMA](/docs/indicators/averages/ema) is above 0 while the average rises, and its streak is the age of that rise.
- **Rises are common.** On the real series of the chart a little under half of the updates are rises, so a single gain says little.

## In a strategy

```
setup:
  gain("gains", "price")
```

That registers `gains`, the amount. Give it a name: `gain("price")` registers `_gainprice`, and a name that starts with `_` is hidden, so it is not reported with the signals. In Java, `.gain("gains", "price")` on the builder, and the streak is `((GainRTIndicator) indicators.getExisting("gains")).getPeriodCount()`.

## Related

- [Loss](/docs/indicators/extremes/loss): the same for the falls.
- [RSI](/docs/indicators/oscillators/rsi): the average gain against the average loss.
- [Sum](/docs/indicators/extremes/sum): over a gain, the total of the rises since the start.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
