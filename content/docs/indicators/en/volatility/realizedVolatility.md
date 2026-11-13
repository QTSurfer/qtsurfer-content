---
title: "Realized volatility"
description: "How the realized volatility takes the standard deviation of the last log returns, per bar, with equal weights, and how to use it in a QTSurfer strategy."
order: 4.95
---

The **realized volatility** is the standard deviation of the last `N` log returns, per bar, with equal weights.

Try it on a series below and change the period.

<div data-indicator-chart="realizedVolatility"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
r  = ln(price / previous price)
RV = √( Σ (r − mean r)² / N )            over the last N returns
```

The deviation divides by `N`. `N` returns need `N + 1` prices, so the first value is on update `N + 1`, and the line reads 0 before it. The engine can multiply the result by an annualization factor (`√252` for daily bars).

## Reading it

- **It is a volatility per bar, as a fraction of the price**, and it is 0 on a price that rises by the same percentage every bar, because the returns do not vary.
- **It is close to the EWMA volatility**: on the real series of the chart the medians are 0.020, 0.003 and 0.003 for the realized volatility, against 0.021, 0.004 and 0.003 for the EWMA one. The difference is how they forget: a window drops an old return all at once, the EWMA gradually.
- **It ranges from 0.009 to 0.049 on the daily BTC/USDT** at period 20.

## In a strategy

```
uses pro.realizedVolatility
setup:
  realizedVolatility(20)
```

`realizedVolatility(20)` registers `rvol20`. In Java the class is `RealizedVolatilityRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro.volatility`, and a group takes it with `indicators.add("rvol20", new RealizedVolatilityRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [EWMA volatility](/docs/indicators/volatility/ewmaVolatility): the same estimate with exponentially decaying weights.
- [Standard deviation](/docs/indicators/volatility/stdDev): the spread of the prices, in price units.
- [Sharpe ratio](/docs/indicators/risk/sharpeRatio): the mean return over this same spread.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
