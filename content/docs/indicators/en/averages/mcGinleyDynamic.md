---
title: "McGinley Dynamic"
description: "How the McGinley Dynamic changes its speed with how far the price is from it, moving faster toward a price below and slower toward a price above, and how to use it in a QTSurfer strategy."
order: 1.75
---

The **McGinley Dynamic**, by John McGinley, is a moving average that changes its speed with how far the price is from it: it moves faster toward a price below it and slower toward a price above it.

Try it on a series below and change the period.

<div data-indicator-chart="mcGinleyDynamic"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
MD = previous MD + (price − previous MD) / (N × (price / previous MD)⁴)
```

The first value is the first price. The fourth power does the adapting: with a price 10 % above the line the step is 0.68 of the one a price at the line gives, and with a price 10 % below it is 1.52. Some formulations add a constant to the denominator (0.6 is the usual one); the engine's has none. It reports the line ready on the first update, so the chart draws from the first bar.

## Reading it

- **It is slow, slower than an EMA of the same period.** On a steady climb it trails the price by about `N` bars (13 to 14.5 at the default 14, on straight rises of 0.5, 2 and 10 per bar), where an EMA of 14 trails it by 6.5. Do not swap one for the other with the same period.
- **It leans toward falls.** The line comes down to a falling price faster than it goes up to a rising one.
- **At its default it is one of the smoother averages of this guide, and one of those farther from the price.** On the daily BTC/USDT series of the chart, at period 14 its mean distance from the close is 4.7 % of the price against 3.1 % for the EMA of 14, and its mean change from bar to bar is 0.37 % against 0.48 %.
- **After a jump of 10 it is still short of the new level after 60 bars** (109.8 at period 14), where the EMA of 14 is within 0.01 of it.

## In a strategy

```
uses pro.mcGinleyDynamic
setup:
  mcGinleyDynamic(14)
```

`mcGinleyDynamic(14)` registers `mcg14`. In Java the class is `McGinleyDynamicRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.averages.pro`, and a group takes it with `indicators.add("mcg14", new McGinleyDynamicRTIndicator(14))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Exponential moving average](/docs/indicators/averages/ema): the exponential average, with a fixed speed.
- [Kaufman's adaptive moving average](/docs/indicators/averages/kama): another average that adapts its speed, by how straight the price moves.
- [Modified moving average](/docs/indicators/averages/mma): Wilder's smoothing, a slow exponential average.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
