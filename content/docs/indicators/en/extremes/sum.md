---
title: "Sum"
description: "How the sum accumulates every value since the start, which sources it makes sense over, and how to use it in a QTSurfer strategy."
order: 10.05
lastUpdated: '2026-11-22T19:06:11Z'
---

The **sum** is the total of every value since the start of the run.

Try it on a series below, over the price, which shows how it accumulates.

<div data-indicator-chart="sum"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
sum = previous sum + value        from the first update
```

It has no window and it adds every value it receives, those of the warm-up of its source included.

## Reading it

- **Over the price it says little**: it grows on every update and measures mostly how long the run is.
- **Over a flow it means something.** The sum of a [gain](/docs/indicators/extremes/gain) is the total of the rises since the start, and the sum of the volume is what was traded.
- **For the sum of the last `N` values**, use an [SMA](/docs/indicators/averages/sma) with its third argument `false`, times `N`.

## In a strategy

```
setup:
  gain("gains", "price")
  sum("gains")
```

`sum("gains")` registers `sumgains`, the total of the rises. The chart above runs `sum("price")`, which registers `sumprice`. In Java, `.sum("gains")` on the builder.

## Related

- [Gain](/docs/indicators/extremes/gain) and [loss](/docs/indicators/extremes/loss): values that are worth adding.
- [SMA](/docs/indicators/averages/sma): the mean of the last `N` values.
- [OBV](/docs/indicators/volume/obv): a sum of the volume with the sign of the move.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
