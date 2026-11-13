---
title: "Connors RSI"
description: "How the Connors RSI averages the RSI of the price, the RSI of the streak of rises or falls and the percent rank of the latest return, from 0 to 100, and how to use it in a QTSurfer strategy."
order: 2.52
---

The **Connors RSI**, by Larry Connors, averages three things: the RSI of the price, the RSI of the streak of consecutive rises or falls, and where the latest return ranks among the recent ones. It runs from 0 to 100.

Try it on a series below and change the three periods.

<div data-indicator-chart="connorsRsi"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
streak = consecutive closes up (+1, +2, …) or down (−1, −2, …), 0 when the close is unchanged
rank   = 100 × (the number of the last N returns at or below the latest − 1) / (N − 1)
CRSI   = (RSI(price, 3) + RSI(streak, 2) + rank) / 3
```

`N` is the rank period, 100 by default. The two RSIs are the engine's default [RSI](/docs/indicators/oscillators/rsi). The first value is on update `N + 1`, 101 with the defaults, and the chart draws from there; before it the line reads 0.

## Reading it

- **The levels usually quoted, 90 and 10, are rarely reached.** On the real series of the chart, at the defaults, the Connors RSI is above 90 on 2 % to 4 % of the bars and below 10 on 1 % to 7 %.
- **On a straight rise it reads 66.7**: both RSIs are at 100, and the rank is 0 because every return is smaller than the one before. A price that rises by the same amount every bar is not an extreme for this indicator.
- **The periods are Connors' own, for daily bars**: 3 for the price, 2 for the streak and 100 for the rank. On another timeframe they are the first thing to adjust.

## In a strategy

```
uses pro.connorsRsi
setup:
  connorsRsi(3, 2, 100)
```

`connorsRsi(3, 2, 100)` registers `crsi3_2_100`. In Java the class is `ConnorsRsiRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("crsi3_2_100", new ConnorsRsiRTIndicator(3, 2, 100))`.

The three periods are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

## Related

- [RSI](/docs/indicators/oscillators/rsi): the oscillator two thirds of this one are made of.
- [Rate of change](/docs/indicators/oscillators/roc): the return whose rank is the third part.
- [Stochastic RSI](/docs/indicators/oscillators/stochRsi): another oscillator built on the RSI.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
