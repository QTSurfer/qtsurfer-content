---
title: "Sortino ratio"
description: "How the Sortino ratio divides the mean return of the last bars by the deviation of the returns below a target, so only the falls count as risk, and how to use it in a QTSurfer strategy."
order: 8.02
---

The **Sortino ratio**, by Frank Sortino, is the Sharpe ratio with only the downside as risk: the mean return over the deviation of the returns that fall below a target. Here it is per bar, not annualized.

Try it on a series below and change the period.

<div data-indicator-chart="sortinoRatio"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
r       = ln(price / previous price)                                   the return of each bar
Sortino = (mean(r) − target) / √( Σ min(r − target, 0)² / N )           over the last N returns, the target 0 by default
```

The downside deviation divides by `N`, the whole window, and not by the number of bars that lost. A window with no loss has a deviation of 0, and the ratio reads 0, not a high value. `N` returns need `N + 1` prices, so the first value is on update `N + 1`, and the line reads 0 before it. The engine takes a minimum acceptable return, the target, and an annualization factor that multiplies the result, 1 by default; the QTScript forms with extra numbers pass them (see the catalogue).

## Reading it

- **Only the falls count as risk.** In a window that only falls, every return is a loss, the mean is the downside deviation with the sign changed, and the ratio reads exactly −1.
- **It has the sign of the mean return**, as the Sharpe ratio does, and on the real series of the chart, at period 20, it goes from −0.56 to 2.7: it climbs higher than the Sharpe ratio because a window with few losses has a small downside deviation. It is larger than the Sharpe ratio in absolute value on 92 % to 97 % of the bars.
- **A window with no loss reads 0**, not a high value: a price that rises 1 % every bar reads 0, and so does a price that does not move.

## In a strategy

```
uses pro.sortinoRatio
setup:
  sortinoRatio(20)
```

`sortinoRatio(20)` registers `sortino20`. In Java the class is `SortinoRatioRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, and a group takes it with `indicators.add("sortino20", new SortinoRatioRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Sharpe ratio](/docs/indicators/risk/sharpeRatio): the same idea with the whole spread as risk.
- [Omega ratio](/docs/indicators/risk/omegaRatio): gains over losses, as sums.
- [Value at risk](/docs/indicators/statistics/valueAtRisk): the loss a bar is not expected to exceed.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
