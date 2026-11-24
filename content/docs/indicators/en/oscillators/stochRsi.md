---
title: "Stochastic RSI"
description: "How the stochastic RSI places the RSI between its lowest and highest values of the last N updates, why it reaches 0 and 100 so often, and how to use it in a QTSurfer strategy."
order: 2.4
lastUpdated: '2026-11-17T14:36:56Z'
---

The **stochastic RSI** applies the formula of the stochastic oscillator to the [RSI](/docs/indicators/oscillators/rsi) instead of to the price. It says where the RSI sits between its lowest and its highest value of the last `N` updates, from 0 to 100. It was devised by Tushar Chande and Stanley Kroll.

Try it on a series below and change the period.

<div data-indicator-chart="stochRsi"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
stochRSI = 100 × (RSI − lowest RSI of the last N) / (highest RSI of the last N − lowest RSI of the last N)
```

The RSI is the one of the [RSI page](/docs/indicators/oscillators/rsi), with Wilder's smoothing, and `N` is both its period and the length of the window: the engine uses one period for the two. The RSI is ready after `N` updates, and the engine reports the stochastic RSI ready when the window holds `N` values of it: the first value of the line is on update `2N − 1`, 27 with the default 14, and the chart draws from there. Where the window has no spread, as on a price that does not move or that only rises, the value reads 0.

## Reading it

- **It is the RSI, rescaled to its own recent range.** It says where the RSI is in that range, not where the price is, so it reaches 0 and 100 each time the RSI makes a new lowest or highest value of the window.
- **It spends a lot of time at the extremes.** On the real series of the chart the line is at or below 20 between a quarter and a third of the time, and at or above 80 about a third of it, so a value beyond those levels is not rare, and the levels are conventions.
- **It moves faster than the RSI.** It can swing from one extreme to the other in a few bars, and a rule that acts on every crossing of a level acts often. Read it together with the [RSI](/docs/indicators/oscillators/rsi) or against a trend filter, not alone.

## In a strategy

```
setup:
  stochRsi(14)
```

`stochRsi(14)` registers `stochRsi14`. In Java, `.stochRsi(14)` on the builder.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [RSI](/docs/indicators/oscillators/rsi): the oscillator it is made from.
- [CCI](/docs/indicators/oscillators/cci): another oscillator, read around zero rather than between fixed levels.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
