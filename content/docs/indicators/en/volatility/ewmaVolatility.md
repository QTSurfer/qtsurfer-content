---
title: "EWMA volatility"
description: "How the EWMA volatility estimates the volatility per bar with exponentially decaying weights on the squared returns, the RiskMetrics way, and how to use it in a QTSurfer strategy."
order: 4.94
lastUpdated: '2026-11-13T23:26:15Z'
---

The **EWMA volatility** estimates the volatility per bar from the squared log returns, with weights that decay exponentially: the RiskMetrics method of J.P. Morgan. It needs no window.

Try it on a series below and change the decay factor.

<div data-indicator-chart="ewmaVolatility"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
r      = ln(price / previous price)
σ²     = λ × previous σ² + (1 − λ) × r²              λ = 0.94 by default
EWMA   = σ
```

The first variance is the first squared return. The engine requires `λ` strictly between 0 and 1 and rejects any other when it builds the indicator, and it can multiply the result by an annualization factor (`√252` for daily bars). The first value is on update 2, and the chart draws from there.

## Reading it

- **It is a volatility per bar, as a fraction of the price**: 0.0199 is 1.99 %. A price that rises 1 % every bar reads 0.00995, which is `ln 1.01`, as a steady return still counts.
- **A shock fades by `√λ` per bar.** After a jump, the line falls by 0.97 each bar at the default 0.94, and never reaches 0 in finite time: unlike a window, it forgets gradually.
- **On the real series of the chart** its median is 0.021 on the daily BTC/USDT, 0.004 on the hourly one and 0.003 on the 15-minute ETH/USDT.

## In a strategy

```
uses pro.ewmaVolatility
setup:
  ewmaVolatility(0.94)
```

`ewmaVolatility(0.94)` registers `ewma0.94`. Its default id has a dot, so when a `window` has to refer to it, give it a name: `ewmaVolatility("vol", 0.94)`. In Java the class is `EwmaVolatilityRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro.volatility`, and a group takes it with `indicators.add("ewma0.94", new EwmaVolatilityRTIndicator(0.94))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The decay factor is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Realized volatility](/docs/indicators/volatility/realizedVolatility): the same estimate over a window of equal weights.
- [Exact standard deviation](/docs/indicators/statistics/exactStdDev): the spread of the prices instead of the returns.
- [Value at risk](/docs/indicators/statistics/valueAtRisk): a loss built from the same returns.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
