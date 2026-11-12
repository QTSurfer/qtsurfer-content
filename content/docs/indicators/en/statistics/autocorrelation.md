---
title: "Autocorrelation"
description: "How the autocorrelation measures how much each return resembles the one before, from minus 1 to 1, why it is noisy on a short window, and how to use it in a QTSurfer strategy."
order: 7.10
lastUpdated: '2026-11-12T18:54:41Z'
---

The **autocorrelation** here is the lag-1 autocorrelation of the returns: how much each bar's return resembles the one before. It runs from −1 to 1.

Try it on a series below and change the period.

<div data-indicator-chart="autocorrelation"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
r = ln(price / previous price)                       the return of each bar
autocorrelation = correlation of the pairs (rᵢ, rᵢ₋₁)        over the last N returns
```

`N` returns give `N − 1` pairs, and the correlation is Pearson's, worked out on the pairs. `N` returns need `N + 1` prices, so the first value is on update `N + 1`; before it, and when the returns do not vary, the line reads 0. It needs at least 4 periods, and the engine keeps it between −1 and 1.

## Reading it

- **Above 0 the moves follow each other, below 0 they reverse, near 0 there is no memory at this lag.** Alternating up and down by the same proportion reads −1, and a price that rises by the same amount every bar reads 1.
- **It is noisy on a short window.** At period 20 there are 19 pairs, and pure noise reads within about ±0.46 (two standard errors, `2 / √19`). On the real series of the chart the value is outside ±0.46 on 1.8 % to 9.3 % of the bars: most of what it draws is noise.
- **Constant growth reads 0**: every return is the same, so there is nothing to correlate. The same goes for a price that does not move.
- **On the real series of the chart**, at period 20, its mean is −0.06 on the daily BTC/USDT, −0.11 on the hourly one and −0.16 on the 15-minute ETH/USDT: a mild tendency to reverse.

## In a strategy

```
uses pro.autocorrelation
setup:
  autocorrelation(20)
```

`autocorrelation(20)` registers `acf20`. In Java the class is `AutocorrelationRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, and a group takes it with `indicators.add("acf20", new AutocorrelationRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Hurst exponent](/docs/indicators/statistics/hurstExponent): another way to ask whether moves continue or reverse, over the whole window.
- [Value at risk](/docs/indicators/statistics/valueAtRisk): built from the same returns.
- [Z-score](/docs/indicators/statistics/zScore): how far the latest price is from the mean.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
