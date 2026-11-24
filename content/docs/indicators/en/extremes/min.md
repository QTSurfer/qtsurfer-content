---
title: "Minimum"
description: "How the minimum keeps the lowest value since the start, where it starts when its source is an indicator, and how to use it in a QTSurfer strategy."
order: 10.04
lastUpdated: '2026-11-22T23:27:04Z'
---

The **minimum** is the lowest value seen since the start of the run. It only goes down.

Try it on a series below.

<div data-indicator-chart="min"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
minimum = min(minimum, value)        from the first update
```

It has no window and it starts with the first value its source is ready to give. Over another indicator the warm-up is left out: the minimum of an RSI is the lowest the RSI has reached since it was ready, not the 0 it holds while it starts.

## Reading it

- **It is a record, not a channel.** Once the price sets a low, the line stays there until a lower one.
- **Over an indicator it is its lowest reading**, counted from the update the indicator is ready.
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
- [RSI](/docs/indicators/oscillators/rsi): an indicator whose lowest reading a minimum can keep.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
