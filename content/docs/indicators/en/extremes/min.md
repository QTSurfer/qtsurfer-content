---
title: "Minimum"
description: "How min keeps the lowest value since the start, what the warm-up of its source does to it, and how to use it in a QTSurfer strategy."
order: 10.04
lastUpdated: '2026-11-22T19:06:11Z'
---

The **minimum** is the lowest value seen since the start of the run. It only goes down.

Try it on a series below.

<div data-indicator-chart="min"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
minimum = min(minimum, value)        from the first update
```

It has no window and it starts with the first value it receives. Over another indicator that first value is one of its warm-up, and it counts: an RSI gives 0 while it starts, so the minimum of an RSI is 0 for the whole run.

## Reading it

- **It is a record, not a channel.** Once the price sets a low, the line stays there until a lower one.
- **Use it over the price**, or over an indicator whose first values are in the range of the later ones.
- **For the lowest of the last `N` bars**, use the [Donchian channel](/docs/indicators/bands/donchianChannel), which forgets.

## In a strategy

```
setup:
  min("price")
```

`min("price")` registers `minprice`, and `min("bottom", "price")` registers it as `bottom`. In Java, `.min("price")` on the builder.

## Related

- [Maximum](/docs/indicators/extremes/max): the highest value since the start.
- [Donchian channel](/docs/indicators/bands/donchianChannel): the extremes of the last `N` bars.
- [RSI](/docs/indicators/oscillators/rsi): why its running minimum is 0.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
