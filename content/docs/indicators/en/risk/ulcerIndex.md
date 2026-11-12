---
title: "Ulcer index"
description: "How the Ulcer index measures the depth and the duration of the drawdowns of the last prices, the root of the mean of their squared percentage falls, and how to use it in a QTSurfer strategy."
order: 8.06
lastUpdated: '2026-11-12T20:44:51Z'
---

The **Ulcer index**, by Peter Martin, measures the depth and the duration of the drawdowns of the last `N` prices: the root of the mean of their squared percentage falls from the peak. It is in percentage points.

Try it on a series below and change the period.

<div data-indicator-chart="ulcerIndex"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
peak_k = the highest price from the first of the last N prices up to the k-th
DD_k   = 100 × (peak_k − price_k) / peak_k                 the percentage fall of each of the last N prices
Ulcer  = √( Σ DD_k² / N )
```

The peak is the highest price since the first price of the window, so a window that only rises, or does not move, reads 0. Some formulations take the fall at each bar from the highest price of the `N` bars before it; with that version the engine's value is lower: on the daily BTC/USDT series of the chart, at period 20, it is 0.73 of it on average. The first value is on update `N`, and the line reads 0 on the first bar.

## Reading it

- **It is in percentage points of the price**, and it is never below 0. On a price that falls 1 % every bar it reads 10.4 at period 20.
- **On the real series of the chart**, at period 20, it goes from 1.0 to 19.6 on the daily BTC/USDT (median 3.7), from 0.07 to 4.9 on the hourly one (median 0.50) and from 0.09 to 3.8 on the 15-minute ETH/USDT (median 0.47).
- **It forgets what leaves the window.** The [maximum drawdown](/docs/indicators/risk/maxDrawdown) keeps its largest fall for ever; the Ulcer index only counts the last `N` prices.

## In a strategy

```
uses pro.ulcerIndex
setup:
  ulcerIndex(20)
```

`ulcerIndex(20)` registers `ulcer20`. In Java the class is `UlcerIndexRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, and a group takes it with `indicators.add("ulcer20", new UlcerIndexRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Maximum drawdown](/docs/indicators/risk/maxDrawdown): the largest fall since the start.
- [Calmar ratio](/docs/indicators/risk/calmarRatio): the return per unit of the largest fall of a window.
- [Exact standard deviation](/docs/indicators/statistics/exactStdDev): a spread that counts rises and falls alike.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
