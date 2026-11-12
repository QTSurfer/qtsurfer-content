---
title: "Volume-weighted average price (VWAP)"
description: "How the volume-weighted average price averages the typical price of every bar since the first, weighted by volume, why it never resets and moves ever more slowly, and how to use it in a QTSurfer strategy."
order: 6.2
lastUpdated: '2026-11-12T15:34:29Z'
---

The **volume-weighted average price** (VWAP) is the average price paid since the series began: the typical price of each bar, weighted by the volume traded in it.

Try it on a series below. It has no parameter, and the line is drawn over the price.

<div data-indicator-chart="vwap"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
typical = (high + low + close) / 3
VWAP    = Σ (typical × volume) / Σ volume        from the first bar
```

The sums run from the first bar and **never reset**: the engine does not restart the VWAP at the start of a session or of a day. The first value is the typical price of the first bar. Because the sums keep growing, each new bar weighs less and the line moves ever more slowly.

## Reading it

- **It is a cumulative average, not a moving one.** Every bar since the start counts, so on a long series it follows the price little.
- **A price above the VWAP** is above the average paid since the start, and a price below it is under that average.
- **On a price that does not move the VWAP is that price.**

## In a strategy

```
uses pro.vwap
setup:
  vwap()
```

`vwap()` registers `vwap`. In Java, `Pro.on(indicators).vwap()`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [On-balance volume](/docs/indicators/volume/obv): the other volume indicator that has no parameter.
- [Simple moving average](/docs/indicators/averages/sma): a plain average of the price, with a window.
- [Money flow index](/docs/indicators/volume/mfi): a volume-weighted RSI, between 0 and 100.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
