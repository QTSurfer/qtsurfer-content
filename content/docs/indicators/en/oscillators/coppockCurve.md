---
title: "Coppock curve"
description: "How the Coppock curve smooths the sum of two rates of change with a weighted average, designed for monthly data, and how to use it in a QTSurfer strategy."
order: 2.46
---

The **Coppock curve**, by Edwin Coppock, is a weighted moving average of the sum of two rates of change. It was designed to spot long-term buying opportunities in stock indexes, on monthly data.

Try it on a series below and change the three periods.

<div data-indicator-chart="coppockCurve"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
Coppock = WMA( ROC(long) + ROC(short), weights )        long 14, short 11, weights 10 by default
```

The [weighted average](/docs/indicators/averages/wma) gives the latest sum the largest weight. The rates of change read 0 while they warm up, and the average starts on them; the first value is on update `long + 1`, 15 with the defaults, and the chart draws from there.

## Reading it

- **The periods are bars, and the defaults are those of the monthly design**: 14 and 11 months, averaged over 10. On a daily or an hourly series the same numbers read something different, so they are the first thing to adjust.
- **The zero line is the sign of the smoothed momentum.** On the real series of the chart, at the defaults, it is positive on 40 % to 51 % of the bars, and it goes from −40.9 to 46.4 on the daily BTC/USDT.
- **A price that rises 1 % every bar reads 26.5**: the two rates are 14.95 and 11.57, and the weighted average of their sum settles on 26.5.

## In a strategy

```
uses pro.coppockCurve
setup:
  coppockCurve(14, 11, 10)
```

`coppockCurve(14, 11, 10)` registers `coppock14_11_10`. In Java the class is `CoppockCurveRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("coppock14_11_10", new CoppockCurveRTIndicator(14, 11, 10))`.

The three periods are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

## Related

- [Rate of change](/docs/indicators/oscillators/roc): the rate of change it is built from.
- [Weighted moving average](/docs/indicators/averages/wma): the weighted average it smooths with.
- [Know sure thing](/docs/indicators/oscillators/knowSureThing): another sum of smoothed rates of change.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
