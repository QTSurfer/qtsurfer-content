---
title: "Chande momentum oscillator (CMO)"
description: "How the Chande momentum oscillator sets the gains against the losses of the last N changes, from minus 100 to 100, with no smoothing, and how to use it in a QTSurfer strategy."
order: 2.43
lastUpdated: '2026-11-12T21:21:22Z'
---

The **Chande momentum oscillator** (CMO), by Tushar Chande, sets the gains against the losses of the last `N` price changes, from −100 to 100, with no smoothing.

Try it on a series below and change the period.

<div data-indicator-chart="cmo"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
gains  = sum of the price rises over the last N changes
losses = sum of the price falls over the last N changes
CMO    = 100 × (gains − losses) / (gains + losses)
```

The sums are over exactly the last `N` changes, with no smoothing, which makes the CMO more nervous than an [RSI](/docs/indicators/oscillators/rsi) of the same period. A window with no change gives 0. `N` changes need `N + 1` prices, so the first value is on update `N + 1`, and the line reads 0 before it.

## Reading it

- **It reads 100 when every change is a rise and −100 when every change is a fall**, and 0 on a price that does not move or when rises and falls weigh the same.
- **The extremes are rare.** On the real series of the chart, at period 14, the CMO goes from −95.8 to 84.2; it is beyond ±50 on 13 % to 15 % of the bars and beyond ±80 on 0.3 % to 1.7 %.
- **It is positive on 43 % to 53 % of the bars** of the real series of the chart.

## In a strategy

```
uses pro.cmo
setup:
  cmo(14)
```

`cmo(14)` registers `cmo14`. In Java the class is `CmoRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("cmo14", new CmoRTIndicator(14))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [RSI](/docs/indicators/oscillators/rsi): the gains against the total, smoothed, from 0 to 100.
- [Stochastic RSI](/docs/indicators/oscillators/stochRsi): where the RSI sits in its own recent range.
- [Rate of change](/docs/indicators/oscillators/roc): the change over the whole window, as a percentage.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
