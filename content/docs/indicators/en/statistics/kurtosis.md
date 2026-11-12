---
title: "Kurtosis"
description: "How the kurtosis measures how heavy the tails of the last prices are compared with a normal distribution, which reads 0, and how to use it in a QTSurfer strategy."
order: 7.04
lastUpdated: '2026-11-12T18:54:41Z'
---

The **kurtosis** here is the excess kurtosis of the last `N` prices: how heavy the tails of their distribution are compared with a normal one, which reads 0. Heavy tails are outliers: a few values far from the rest.

Try it on a series below and change the period.

<div data-indicator-chart="kurtosis"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
m₂ = Σ (x − mean)² / N
m₄ = Σ (x − mean)⁴ / N
kurtosis = (N + 1)(N − 1) × m₄ / ((N − 2)(N − 3) × m₂²) − 3 (N − 1)² / ((N − 2)(N − 3))
```

It is the sample excess kurtosis, Fisher's G2, which is what spreadsheets give with `KURT`. It needs at least 4 periods, and a window that does not move gives 0. It reports the value ready after `N` updates, and the chart draws from there.

## Reading it

- **0 is a normal distribution.** Above 0 the tails are heavier, with outliers; below 0 they are lighter, a flat top with no outliers. On simulated normal samples the mean reading is 0.06 at period 30.
- **On a small window it swings wide.** One outlier over a window that does not move reads 20.0 at period 20, and 20 evenly spaced values read −1.2.
- **On the real series of the chart**, at period 20, it is above 0 on 35 % to 38 % of the bars and above 3 on 3 % to 4 %. It goes down to −2.1 on all three and up to 9.3 on the daily BTC/USDT, 17.7 on the hourly one and 18.7 on the 15-minute ETH/USDT.
- **The platform differs for now.** Until the engine of the platform is updated, a backtest computes the earlier formula, which was missing a factor and reads −3.2 on a normal sample where this page reads 0. The values on this page are the corrected ones.

## In a strategy

```
uses pro.kurtosis
setup:
  kurtosis(20)
```

`kurtosis(20)` registers `kurt20`. In Java, `Pro.on(indicators).kurtosis(20)`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Exact standard deviation](/docs/indicators/statistics/exactStdDev): the spread of the same window, in the units of the price.
- [Z-score](/docs/indicators/statistics/zScore): how far the latest price is from the mean, which outliers stretch.
- [Exact variance](/docs/indicators/statistics/exactVariance): the second moment this one is built on.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
