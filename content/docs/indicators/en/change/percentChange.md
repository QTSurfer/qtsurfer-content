---
title: "Percent change"
description: "How percentChange gives the change of a value since the update before in percent, what its typical size is, and how to use it in a QTSurfer strategy."
order: 9.02
lastUpdated: '2026-11-22T19:06:11Z'
---

The **percent change** is how much a value changed since the update before, in percent: 1 is a rise of 1 %. It is the change rate times 100, with no period.

Try it on a series below.

<div data-indicator-chart="percentChange"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
percent change = 100 × (value − previous value) / |previous value|
```

It is ready from the first update, where it gives 0, and it gives 0 whenever the previous value is 0.

## Reading it

- **Its size belongs to the cadence.** On the real series of the chart the typical change, the median of its size, is 1.15 % a bar on BTC/USDT days, 0.17 % on BTC/USDT hours and 0.15 % on ETH/USDT quarters of an hour. A threshold set for one says nothing on another.
- **It reacts to one update only**, so it is the noisiest measure of a move. To act on it, smooth it or compare it with its usual size.
- **It is not the percent change of the ticker.** The one an exchange puts in its ticker covers its own window, often 24 hours, and a ticker strategy has it as `chg`. This one covers one update.

## In a strategy

```
setup:
  percentChange("pc", "price")
```

That registers `pc`. In Java, `.percentChange("pc", "price")` on the builder.

Give it a name. `percentChange("price")` registers `chgprice`, the name `rateChange("price")` registers too, and the second one registered replaces the first. Avoid `chg`, which a ticker strategy already registers.

## Related

- [Change rate](/docs/indicators/change/rateChange): the same change, as a fraction.
- [Rate of change](/docs/indicators/oscillators/roc): the change over `N` bars, in percent.
- [Percent volatility](/docs/indicators/volatility/percentVolatility): the average size of these changes.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
