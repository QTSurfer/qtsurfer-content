---
title: "Money flow index (MFI)"
description: "How the money flow index says what share of the money flow of the last N changes was rising, from 0 to 100, how rarely it reaches 80 or 20 on these series, and how to use it in a QTSurfer strategy."
order: 6.3
---

The **money flow index** (MFI), by Gene Quong and Avrum Soudack, is an RSI that counts money instead of price: it says, from 0 to 100, what share of the money flow of the last `N` changes was rising.

Try it on a series below and change the period.

<div data-indicator-chart="mfi"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
typical = (high + low + close) / 3
flow    = typical × volume
MFI     = 100 − 100 / (1 + rising flow / falling flow)        over the last N changes
```

A change counts as rising flow when the typical price is above the previous one and as falling flow when it is below; an unchanged one counts for neither. When there is no falling flow the MFI reads 100, which includes a price that does not move. The first value is on update `N + 1`, because it needs `N` changes, and the chart draws from there.

## Reading it

- **It is read like the [RSI](/docs/indicators/oscillators/rsi), but each change weighs what was traded in it.**
- **80 and 20 are rare on these series.** On the real series of the chart the MFI is at or above 80 less than 6 % of the time and at or below 20 less than 12 %.
- **On a straight rise it reads 100, and on a straight fall 0.**

## In a strategy

```
uses pro.mfi
setup:
  mfi(14)
```

`mfi(14)` registers `mfi14`. In Java, `Pro.on(indicators).mfi(14)`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [RSI](/docs/indicators/oscillators/rsi): the same idea over the price alone.
- [Chaikin money flow](/docs/indicators/volume/cmf): how the volume splits between buying and selling, from where the bars close.
- [On-balance volume](/docs/indicators/volume/obv): the running total of volume.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
