---
title: "Maximum drawdown"
description: "How the maximum drawdown keeps the largest fall from a peak to a later low since the start, as a fraction of the peak, why it never goes down, and how to use it in a QTSurfer strategy."
order: 8.05
---

The **maximum drawdown** is the largest fall from a peak to a later low since the indicator started, as a fraction of the peak: 0.25 is a fall of 25 %.

Try it on a series below. It has no parameter, and the line is drawn in its own pane, from 0 to 1.

<div data-indicator-chart="maxDrawdown"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
peak        = the highest price so far
drawdown    = (peak − price) / peak                 the fall from the peak now
maxDrawdown = the highest drawdown so far
```

The first value is on the first update, and reads 0. It does not roll over a window: it keeps the largest drawdown since the start, so once a fall has happened the value can only grow, and two runs that start at different bars read different values. 1 would be a total loss. The engine registers the drawdown of the moment beside it, `maxDdCurrent`, which comes back to 0 at each new high; the chart draws both.

## Reading it

- **It only grows.** For the prices 100, 120, 90, 130, 130, 130 it reads 0, 0, 0.25, 0.25, 0.25, 0.25: it stays at 25 % after the price has recovered and gone beyond its old peak.
- **The current drawdown is the other line.** It says how far the price is from its peak now, and it is 0 on every bar that makes a new high.
- **On a price that halves it reads 0.5.** At the end of the real series of the chart the maximum drawdown is 38.7 % on the daily BTC/USDT, 9.7 % on the hourly one and 10.2 % on the 15-minute ETH/USDT.

## In a strategy

```
uses pro.maxDrawdown
setup:
  maxDrawdown()
```

`maxDrawdown()` registers `maxDd`, with the drawdown of the moment beside it as `maxDdCurrent`. In Java the class is `MaxDrawdownRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, and a group takes it with `indicators.add("maxDd", new MaxDrawdownRTIndicator())`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

## Related

- [Calmar ratio](/docs/indicators/risk/calmarRatio): the return per unit of the largest fall of a window.
- [Ulcer index](/docs/indicators/risk/ulcerIndex): the depth and duration of the drawdowns of a window.
- [Value at risk](/docs/indicators/statistics/valueAtRisk): the loss a bar is not expected to exceed.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
