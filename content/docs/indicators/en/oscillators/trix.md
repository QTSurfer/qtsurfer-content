---
title: "TRIX"
description: "How the TRIX gives the percentage change of a triple exponential average, which filters out the small moves, and how to use it in a QTSurfer strategy."
order: 2.45
lastUpdated: '2026-11-12T21:21:22Z'
---

The **TRIX**, by Jack Hutson, is the percentage change of a triple exponential average: three exponential averages in a row filter out the small moves, and the rate of the result is what is left.

Try it on a series below and change the period.

<div data-indicator-chart="trix"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
EMA1 = EMA(price)
EMA2 = EMA(EMA1)
EMA3 = EMA(EMA2)
TRIX = 100 × (EMA3 − previous EMA3) / previous EMA3        the three over the same period
```

The three averages start on their first input. The first value is on update `N`, and it reads 0 there; the chart draws from there.

## Reading it

- **It is the rate of the triple average, in percent per bar.** A price that rises 1 % every bar reads 1.00 once the averages have caught up.
- **The zero line is the triple average stopping.** Above it the average rises, below it falls. On the real series of the chart, at period 15, it is positive on 32 % to 52 % of the bars, and it goes from −1.02 to 0.76 on the daily BTC/USDT.
- **It is slow.** Three smoothings in a row make it turn well after the price has turned.

## In a strategy

```
uses pro.trix
setup:
  trix(15)
```

`trix(15)` registers `trix15`. In Java the class is `TrixRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("trix15", new TrixRTIndicator(15))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Triple exponential moving average](/docs/indicators/averages/tema): the triple exponential average itself, as a price.
- [True strength index](/docs/indicators/oscillators/trueStrengthIndex): another double-smoothed momentum, from −100 to 100.
- [Rate of change](/docs/indicators/oscillators/roc): the change over a window, with no smoothing.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
