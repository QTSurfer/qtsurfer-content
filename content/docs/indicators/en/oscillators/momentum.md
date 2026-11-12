---
title: "Momentum"
description: "How the momentum gives the difference between the latest price and the price N bars ago, in price units, why it does not compare between instruments, and how to use it in a QTSurfer strategy."
order: 2.41
lastUpdated: '2026-11-12T21:21:22Z'
---

The **momentum** is the difference between the latest price and the price `N` bars ago, in price units: how far the price has gone in `N` bars, and in which direction.

Try it on a series below and change the period.

<div data-indicator-chart="momentum"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
momentum = price − price N bars ago
```

The first value is on update `N + 1`, and the chart draws from there; before it the line reads 0.

## Reading it

- **The zero line is the price of `N` bars ago.** Above it the price is higher than then, below it lower. On a straight rise of 2 per bar it reads `2 × N` = 20 at period 10, on a straight fall −20, and 0 on a price that does not move.
- **It is in price units, so it does not compare between instruments.** On the real series of the chart, at period 10, it goes from −25,437 to 16,124 on the daily BTC/USDT and from −106 to 38 on the 15-minute ETH/USDT. To compare, use the [rate of change](/docs/indicators/oscillators/roc), which is the same thing as a percentage.
- **It is positive on 47 % to 52 % of the bars** of the real series of the chart.

## In a strategy

```
uses pro.momentum
setup:
  momentum(10)
```

`momentum(10)` registers `mom10`. In Java the class is `MomentumRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("mom10", new MomentumRTIndicator(10))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Rate of change](/docs/indicators/oscillators/roc): the same difference as a percentage of the old price.
- [Detrended price oscillator](/docs/indicators/oscillators/detrendedPriceOscillator): a past price against the average, to show cycles.
- [CCI](/docs/indicators/oscillators/cci): how far the price is from its average, in units of the usual deviation.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
