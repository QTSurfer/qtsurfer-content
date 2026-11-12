---
title: "Hurst exponent"
description: "How the Hurst exponent estimates from the rescaled range of the returns whether moves tend to continue or to reverse, about 0.5 for a random walk, and how to use it in a QTSurfer strategy."
order: 7.11
lastUpdated: '2026-11-12T18:54:41Z'
---

The **Hurst exponent** here is a rescaled-range estimate of how persistent the returns are: about 0.5 for a random walk, above 0.5 when moves tend to continue, below 0.5 when they tend to reverse.

Try it on a series below and change the period.

<div data-indicator-chart="hurstExponent"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
r     = ln(price / previous price)               the return of each bar
sum_k = Σ (rⱼ − mean r), j up to k                the running sum of the last N returns
R     = highest sum − lowest sum                   the range of the running sum
S     = deviation of the N returns                 dividing by N
H     = ln(R / S) / ln N
```

It is a single window and not a regression over several scales, so it is noisy, and a short window biases it. `N` returns need `N + 1` prices, so the first value is on update `N + 1`; before it, and when the returns do not vary, the line reads 0.5. It needs at least 4 periods.

## Reading it

- **0.5 is the centre, not a verdict.** On simulated random walks the reading averages 0.50 at period 20 and 0.53 to 0.54 at period 100, and a single reading spreads about 0.07 around its mean at period 20: more than 80 % of them are between 0.4 and 0.6.
- **Returns that follow each other read higher and returns that reverse read lower.** Simulated returns with an autocorrelation of +0.6 average 0.61 at period 20 and 0.64 at period 100; with −0.6, 0.38 and 0.41.
- **On the real series of the chart**, at period 20, it moves between 0.25 and 0.65 and averages 0.47 to 0.50: a window of 20 returns cannot tell a trending market from a random one with confidence.

## In a strategy

```
uses pro.hurstExponent
setup:
  hurstExponent(20)
```

`hurstExponent(20)` registers `hurst20`. In Java the class is `HurstExponentRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, and a group takes it with `indicators.add("hurst20", new HurstExponentRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Autocorrelation](/docs/indicators/statistics/autocorrelation): the same question, asked of one lag.
- [Exact standard deviation](/docs/indicators/statistics/exactStdDev): the spread the range is rescaled by.
- [Value at risk](/docs/indicators/statistics/valueAtRisk): built from the same returns.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
