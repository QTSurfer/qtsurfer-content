---
title: "Williams %R"
description: "How Williams %R places the close in the range of the last bars from minus 100 to 0, as the fast stochastic minus 100, and how to use it in a QTSurfer strategy."
order: 2.54
lastUpdated: '2026-11-13T21:28:19Z'
---

**Williams %R**, by Larry Williams, places the close in the range of the last `N` bars, from −100 at the lowest low to 0 at the highest high. It is the unsmoothed stochastic oscillator turned upside down.

Try it on a series below and change the period.

<div data-indicator-chart="williamsR"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
%R = −100 × (highest high − close) / (highest high − lowest low)        over the last N bars
```

It is the raw `%K` of the [stochastic oscillator](/docs/indicators/oscillators/stochasticOscillator) minus 100. A window with no range gives 0, where the stochastic gives 50. The first value is on update `N`, and the chart draws from there.

## Reading it

- **0 is a close at the top of the range and −100 a close at the bottom**, and −50 is the middle: a doji in the middle of its range reads −50.
- **It has no smoothing, so it is nervous.** On the real series of the chart, at period 14, it is at or above −20 on 9 % to 21 % of the bars and at or below −80 on 14 % to 20 %.
- **It is the stochastic oscillator before the averages**, so it reacts to every bar and, unlike the stochastic of the engine, it does not move in steps.

## In a strategy

```
uses pro.williamsR
setup:
  williamsR(14)
```

`williamsR(14)` registers `willr14`. In Java the class is `WilliamsRRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("willr14", new WilliamsRRTIndicator(14))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Stochastic oscillator](/docs/indicators/oscillators/stochasticOscillator): the same position, smoothed, from 0 to 100.
- [Stochastic RSI](/docs/indicators/oscillators/stochRsi): the same idea applied to the RSI.
- [CCI](/docs/indicators/oscillators/cci): how far the price is from its average, in units of the usual deviation.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
