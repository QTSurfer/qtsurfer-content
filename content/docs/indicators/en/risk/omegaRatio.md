---
title: "Omega ratio"
description: "How the omega ratio divides the sum of the gains by the sum of the losses of the last returns against a threshold, why it is above 1 exactly when the mean return is positive, and how to use it in a QTSurfer strategy."
order: 8.03
---

The **omega ratio**, by Con Keating and William Shadwick, is the sum of the gains over the sum of the losses of the last `N` returns, measured against a threshold. Above 1 the gains outweigh the losses.

Try it on a series below and change the period.

<div data-indicator-chart="omegaRatio"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
r = ln(price / previous price)                                          the return of each bar
Ω = Σ max(r − threshold, 0) / Σ max(threshold − r, 0)                   over the last N returns, the threshold 0 by default
```

A window with no loss has nothing to divide by, and the ratio reads 0, not infinity. It needs at least 2 periods. `N` returns need `N + 1` prices, so the first value is on update `N + 1`, and the line reads 0 before it. The engine takes a threshold, and the QTScript forms with an extra number pass it (see the catalogue).

## Reading it

- **1 is the line.** Above it the gains outweigh the losses; below it the losses do. With the threshold at 0, the omega ratio is above 1 exactly when the mean log return of the window is positive, which is when the [Sharpe](/docs/indicators/risk/sharpeRatio) and [Sortino](/docs/indicators/risk/sortinoRatio) ratios are positive too: on the real series of the chart, 39 % to 49 % of the bars.
- **It looks at every return, not only at their mean and spread**, as sums of what was gained and what was lost.
- **On the real series of the chart**, at period 20, it goes from 0.08 to 6.6, and its median is 0.88 to 0.99.
- **A window with no loss reads 0**, so the best windows read the worst: a price that rises 1 % every bar reads 0, and so does a price that does not move.

## In a strategy

```
uses pro.omegaRatio
setup:
  omegaRatio(20)
```

`omegaRatio(20)` registers `omega20`. In Java the class is `OmegaRatioRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, and a group takes it with `indicators.add("omega20", new OmegaRatioRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Sharpe ratio](/docs/indicators/risk/sharpeRatio): return per unit of spread.
- [Sortino ratio](/docs/indicators/risk/sortinoRatio): return per unit of downside.
- [Tail ratio](/docs/indicators/risk/tailRatio): the right tail against the left one.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
