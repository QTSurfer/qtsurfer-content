---
title: "Stochastic oscillator"
description: "How the stochastic oscillator places the close in the range of the last bars, with its smoothed %K and its %D, why the engine's lines move in steps, and how to use it in a QTSurfer strategy."
order: 2.53
lastUpdated: '2026-11-13T21:28:19Z'
---

The **stochastic oscillator**, by George Lane, places the close in the range of the last `N` bars, from 0 at the lowest low to 100 at the highest high. It comes with a smoothed line, `%K`, and an average of it, `%D`.

Try it on a series below and change the three periods.

<div data-indicator-chart="stochasticOscillator"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
raw %K = 100 × (close − lowest low) / (highest high − lowest low)        over the last k bars
%K     = SMA(raw %K, kSmooth)                                            the slow %K
%D     = SMA(%K, dSmooth)
```

The periods are 14, 3 and 3 by default. A window with no range gives a raw `%K` of 50. The first value is on update `k`, and the chart draws from there. The engine's simple averages are its default **discrete** ones, which hold the mean of a complete block until the next block is complete (the [SMA page](/docs/indicators/averages/sma) explains it). So `%K` and `%D` move in steps: 66 % of the bars repeat the previous value, on the real series of the chart.

## Reading it

- **0 is a close at the bottom of the range and 100 a close at the top**, and it reads 50 on a bar with no range or a doji in the middle. A straight rise of bars that close at their high reads 100.
- **The levels 80 and 20 are reached often.** On the real series of the chart, at the defaults, `%K` is at or above 80 on 7 % to 16 % of the bars and at or below 20 on 10 % to 18 %.
- **The lines are in steps.** The textbook smooths with moving averages and the line changes with every bar; here `%K` and `%D` hold a value for a block of 3 bars. A rule that crosses `%K` over `%D` sees the crossing only at the end of a block.

## In a strategy

```
uses pro.stochasticOscillator
setup:
  stochasticOscillator(14, 3, 3)
```

`stochasticOscillator(14, 3, 3)` registers `stoch14_3_3`, with `%D` beside it as `stoch14_3_3D`. In Java the class is `StochasticOscillatorRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("stoch14_3_3", new StochasticOscillatorRTIndicator(14, 3, 3))`.

The three periods are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [Williams %R](/docs/indicators/oscillators/williamsR): the same position in the range, with no smoothing, from −100 to 0.
- [Stochastic RSI](/docs/indicators/oscillators/stochRsi): the same idea applied to the RSI.
- [RSI](/docs/indicators/oscillators/rsi): relative strength, between 0 and 100.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
