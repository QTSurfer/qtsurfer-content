---
title: "Chaikin money flow (CMF)"
description: "How the Chaikin money flow measures how much of the volume of the last N bars was bought and how much sold, judged by where each bar closed in its range, from -1 to 1, and how to use it in a QTSurfer strategy."
order: 6.4
lastUpdated: '2026-11-12T15:34:29Z'
---

The **Chaikin money flow** (CMF), by Marc Chaikin, measures how much of the volume of the last `N` bars was bought and how much sold, judged by where each bar closed in its range. It runs from −1 to 1.

Try it on a series below and change the period.

<div data-indicator-chart="cmf"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
multiplier = ((close − low) − (high − close)) / (high − low)        −1 at the low, 1 at the high
CMF        = Σ (multiplier × volume) / Σ volume                      over the last N bars
```

A bar with no range has a multiplier of 0. The first value is on update `N`, and the chart draws from there.

## Reading it

- **It reads the close inside the bar, not the change from the last close.** A bar that closes at its high counts as buying, whatever it did against the previous bar.
- **It reads 1 when every bar closes at its high and −1 when every bar closes at its low**, and 0 on a price that does not move.
- **It stays well inside its limits.** On the real series of the chart it never goes beyond 0.5 in either direction.

## In a strategy

```
uses pro.cmf
setup:
  cmf(20)
```

`cmf(20)` registers `cmf20`. In Java, `Pro.on(indicators).cmf(20)`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Money flow index](/docs/indicators/volume/mfi): a volume-weighted RSI, between 0 and 100.
- [On-balance volume](/docs/indicators/volume/obv): the running total of volume.
- [ATR](/docs/indicators/volatility/atr): the range of a bar, the other thing the multiplier looks at.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
