---
title: "Relative volatility index (RVI)"
description: "How the relative volatility index applies the RSI to the standard deviation of the price instead of to the price, from 0 to 100, and how to use it in a QTSurfer strategy."
order: 4.96
lastUpdated: '2026-11-13T23:26:15Z'
---

The **relative volatility index** (RVI), by Donald Dorsey, applies the idea of the RSI to the standard deviation of the price instead of to the price: it says whether the volatility has been rising or falling. It runs from 0 to 100.

Try it on a series below and change the two periods.

<div data-indicator-chart="relativeVolatilityIndex"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
σ    = standard deviation of the price over stdPeriod
up   = Wilder average (rsiPeriod) of the rises of σ
down = Wilder average (rsiPeriod) of the falls of σ
RVI  = 100 × up / (up + down)
```

The defaults are 10 and 14. The deviation is the [standard deviation](/docs/indicators/volatility/stdDev) of the engine, and the average starts as the mean of the first changes. The line reads 50 until the first value, on update `stdPeriod + rsiPeriod + 1`, 25 with the defaults, where the chart starts; a window where `σ` does not change also reads 50.

## Reading it

- **Above 50 the volatility has been rising, below 50 falling.** It says nothing about the direction of the price. A price on a straight line, whose deviation only grows at the start, reads 100.
- **It does not go low on the real series of the chart**: at the defaults it goes from 31 to 95, it is above 50 on 37 % to 49 % of the bars and never below 20, so the usual lower level is not reached.
- **The high readings are the volatility spikes.** It is above 80 on 4 % to 7 % of the bars.

## In a strategy

```
uses pro.relativeVolatilityIndex
setup:
  relativeVolatilityIndex(10, 14)
```

`relativeVolatilityIndex(10, 14)` registers `rvi10_14`. In Java the class is `RelativeVolatilityIndexRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.volatility.pro`, and a group takes it with `indicators.add("rvi10_14", new RelativeVolatilityIndexRTIndicator(10, 14))`.

The two periods are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

## Related

- [Standard deviation](/docs/indicators/volatility/stdDev): the deviation it takes the rises and falls of.
- [RSI](/docs/indicators/oscillators/rsi): the same idea applied to the price.
- [EWMA volatility](/docs/indicators/volatility/ewmaVolatility): a volatility estimate from the returns.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
