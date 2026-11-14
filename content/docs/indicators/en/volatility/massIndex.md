---
title: "Mass index"
description: "How the mass index adds up the ratio of a single to a double exponential average of the bar range, to spot reversals from a widening range, and how to use it in a QTSurfer strategy."
order: 4.93
lastUpdated: '2026-11-13T23:26:15Z'
---

The **mass index**, by Donald Dorsey, adds up the ratio of a single to a double exponential average of the range of each bar. It looks for the widening of the range that often comes before a reversal, with no idea of its direction.

Try it on a series below and change the two periods.

<div data-indicator-chart="massIndex"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
range  = high − low
single = EMA(range, emaPeriod)
double = EMA(single, emaPeriod)
MASS   = Σ (single / double) over the last sumPeriod bars
```

The defaults are 25 and 9. A ratio with a double average of 0 counts as 1. The first value is on update `sumPeriod`, and the chart draws from there.

## Reading it

- **With a steady range it reads the sum period.** A constant range gives a ratio of 1 on every bar and a reading of 25 at the defaults; the index moves above 25 when the range widens and below when it narrows.
- **The usual signal is the bulge.** Dorsey's reversal bulge is a rise above 27 followed by a fall below 26.5. On the real series of the chart the index is above 27 on 9 % to 17 % of the bars, and it goes from 20 to 31.
- **It does not say which way the reversal goes**, only that the range has been widening.

## In a strategy

```
uses pro.massIndex
setup:
  massIndex(25, 9)
```

`massIndex(25, 9)` registers `mass25_9`. In Java the class is `MassIndexRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.volatility.pro`, and a group takes it with `indicators.add("mass25_9", new MassIndexRTIndicator(25, 9))`.

The two periods are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [Exponential moving average](/docs/indicators/averages/ema): the average of the range it is built from.
- [ATR](/docs/indicators/volatility/atr): the range, as one average.
- [Choppiness index](/docs/indicators/volatility/choppinessIndex): another way to read whether the range is wandering.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
