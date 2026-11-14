---
title: "Choppiness index"
description: "How the choppiness index tells a market that wanders from one that trends by comparing the sum of the true ranges with the range of the window, from 0 to 100, and how to use it in a QTSurfer strategy."
order: 4.92
lastUpdated: '2026-11-13T23:26:15Z'
---

The **choppiness index**, by Bill Dreiss, tells a market that wanders from one that trends: it compares the sum of the true ranges of the last `N` bars with the range of the whole window. High is choppy, low is trending.

Try it on a series below and change the period.

<div data-indicator-chart="choppinessIndex"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
CHOP = 100 × log₁₀( Σ TR over N bars / (highest high − lowest low) ) / log₁₀(N)
```

`TR` is the true range of each bar (the first bar uses its high less its low). A window with no range gives 0. The first value is on update `N`, and the chart draws from there.

## Reading it

- **High means choppy, low means trending.** The levels usually quoted are 61.8 and 38.2. On the real series of the chart, at period 14, the index is above 61.8 on 5 % to 14 % of the bars and below 38.2 on 11 % to 14 %, and it goes from 6 to 74.
- **It says nothing about the direction**, only about how straight the market moved: a clean fall and a clean rise both read low.
- **It tells when to use a trend indicator and when not to.** A trend rule fares worse when the index is high.

## In a strategy

```
uses pro.choppinessIndex
setup:
  choppinessIndex(14)
```

`choppinessIndex(14)` registers `chop14`. In Java the class is `ChoppinessIndexRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.volatility.pro`, and a group takes it with `indicators.add("chop14", new ChoppinessIndexRTIndicator(14))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Average directional index](/docs/indicators/trend/adx): how strong the trend is, not which way.
- [ATR](/docs/indicators/volatility/atr): the true range it adds up.
- [Kaufman's adaptive moving average](/docs/indicators/averages/kama): an average that adapts to how straight the price moves.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
