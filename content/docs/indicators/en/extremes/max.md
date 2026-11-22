---
title: "Maximum"
description: "How the maximum keeps the highest value since the start, why it has no window, and how to use it in a QTSurfer strategy."
order: 10.03
lastUpdated: '2026-11-22T19:06:11Z'
---

The **maximum** is the highest value seen since the start of the run. It only goes up.

Try it on a series below.

<div data-indicator-chart="max"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
maximum = max(maximum, value)        from the first update
```

It has no window and it starts with the first value it receives. Over another indicator that first value is one of its warm-up, and it counts.

## Reading it

- **It is a record, not a channel.** Once the price sets a high, the line stays there until a higher one, however long that takes.
- **It depends on where the run starts.** The same date reads another maximum in a run that began earlier.
- **For the highest of the last `N` bars**, use the [Donchian channel](/docs/indicators/bands/donchianChannel), which forgets.

## In a strategy

```
setup:
  max("price")
```

`max("price")` registers `maxprice`, and `max("top", "price")` registers it as `top`. In Java, `.max("price")` on the builder.

## Related

- [Minimum](/docs/indicators/extremes/min): the lowest value since the start.
- [Donchian channel](/docs/indicators/bands/donchianChannel): the extremes of the last `N` bars.
- [Maximum drawdown](/docs/indicators/risk/maxDrawdown): the worst fall from this maximum.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
