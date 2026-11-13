---
title: "Relative vigor index (RVGI)"
description: "How the relative vigor index sets the weighted move from the open to the close against the weighted range of the last bars, why the engine's line moves in steps, and how to use it in a QTSurfer strategy."
order: 2.60
---

The **relative vigor index** (RVGI), by John Ehlers, sets the move from the open to the close against the range, weighted over four bars and smoothed: the idea that prices close higher than they open in an uptrend.

Try it on a series below and change the period.

<div data-indicator-chart="relativeVigorIndex"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
num = ((close − open) + 2 (close₁ − open₁) + 2 (close₂ − open₂) + (close₃ − open₃)) / 6        the last four bars, weights 1, 2, 2, 1
den = ((high − low)   + 2 (high₁ − low₁)   + 2 (high₂ − low₂)   + (high₃ − low₃))   / 6
RVGI = SMA(num, N) / SMA(den, N)
```

The engine's simple averages are its default **discrete** ones, which hold the mean of a complete block until the next block is complete (the [SMA page](/docs/indicators/averages/sma) explains it). So the line moves in steps: 90 % of its bars repeat the previous value, on the real series of the chart. The original adds a signal line; the engine does not. A window with no range gives 0. The first value is on update `N + 3`, 13 with the default period 10, and the chart draws from there.

## Reading it

- **It reads 1 when every bar opens at its low and closes at its high, −1 in the opposite case**, and 0 for bars that close where they open.
- **It is small in practice.** On the real series of the chart, at period 10, it goes from −0.52 to 0.53, and it is positive on 41 % to 48 % of the bars.
- **It is slow.** The four-bar weighting and the average of `N` values of both parts make it turn well after the price has turned.

## In a strategy

```
uses pro.relativeVigorIndex
setup:
  relativeVigorIndex(10)
```

`relativeVigorIndex(10)` registers `rvgi10`. In Java the class is `RelativeVigorIndexRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("rvgi10", new RelativeVigorIndexRTIndicator(10))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Balance of power](/docs/indicators/oscillators/balanceOfPower): the same body against the range, bar by bar.
- [Stochastic oscillator](/docs/indicators/oscillators/stochasticOscillator): the close placed in the range of the last bars.
- [Simple moving average](/docs/indicators/averages/sma): the discrete average it smooths with, explained there.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
