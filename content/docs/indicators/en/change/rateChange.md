---
title: "Change rate"
description: "How rateChange gives the change of a value since the update before as a fraction, how it differs from the rate of change over N bars, and how to use it in a QTSurfer strategy."
order: 9.01
---

The **change rate** is how much a value changed since the update before, as a fraction of that value: 0.01 is a rise of 1 %. It has no period: it always looks exactly one update back.

Try it on a series below.

<div data-indicator-chart="rateChange"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
change rate = (value − previous value) / |previous value|
```

It is ready from the first update, where it gives 0, and it gives 0 whenever the previous value is 0. The absolute value below the line keeps the sign of the move when the value is negative: from −4 to −2 is 0.5, a rise.

## Reading it

- **It is not the [rate of change](/docs/indicators/oscillators/roc) of the books.** That one compares with the value `N` bars ago and is a percentage. This one compares with the update before and is a fraction.
- **It depends on the cadence.** An update is a tick or a bar, so the same market gives small values on seconds and large ones on days.
- **It reads any indicator**, not only the price: the change rate of an [EMA](/docs/indicators/averages/ema) is the slope of the average, relative to its level.

## In a strategy

```
setup:
  rateChange("rc", "price", false)
```

That registers `rc`, the fraction. With `true` in place of `false` it is the [percent change](/docs/indicators/change/percentChange). In Java, `.rateChange("rc", "price", false)` on the builder.

Give it a name. `rateChange("price")` registers `chgprice`, and so does `percentChange("price")`: the second one registered replaces the first. Do not call it `chg` either, since a ticker strategy registers that name itself.

## Related

- [Percent change](/docs/indicators/change/percentChange): the same change, times 100.
- [Rate of change](/docs/indicators/oscillators/roc): the change over `N` bars, in percent.
- [Percent volatility](/docs/indicators/volatility/percentVolatility): the average size of these changes.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
