---
title: "Rate of change (ROC)"
description: "How the rate of change gives the percentage change of the price over the last N bars, why it compares between instruments where the momentum does not, and how to use it in a QTSurfer strategy."
order: 2.42
---

The **rate of change** (ROC) is the percentage change of the price over the last `N` bars. It is the [momentum](/docs/indicators/oscillators/momentum) divided by the old price.

Try it on a series below and change the period.

<div data-indicator-chart="roc"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
ROC = 100 × (price − price N bars ago) / price N bars ago
```

The first value is on update `N + 1`, and the chart draws from there; before it the line reads 0. A past price of 0 gives 0.

## Reading it

- **It is a percentage, so it compares between instruments.** On the real series of the chart, at period 12, it goes from −29.5 % to 27.2 % on the daily BTC/USDT, from −5.7 % to 5.0 % on the hourly one and from −4.9 % to 2.1 % on the 15-minute ETH/USDT.
- **It compounds.** A price that rises 1 % every bar reads 12.68 at period 12, not 12: it is `1.01¹² − 1`.
- **It is positive on 46 % to 51 % of the bars** of the real series of the chart; the zero line is a price equal to the one `N` bars ago.

## In a strategy

```
uses pro.roc
setup:
  roc(12)
```

`roc(12)` registers `roc12`. In Java the class is `RocRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("roc12", new RocRTIndicator(12))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Momentum](/docs/indicators/oscillators/momentum): the same difference in price units.
- [Coppock curve](/docs/indicators/oscillators/coppockCurve): a weighted average of two rates of change.
- [Know sure thing](/docs/indicators/oscillators/knowSureThing): four smoothed rates of change added together.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
