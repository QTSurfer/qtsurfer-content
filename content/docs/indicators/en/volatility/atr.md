---
title: "Average true range (ATR)"
description: "How the average true range measures how much the price moves in a bar, gaps included, why it needs bars and not a ticker, and how to use it in a QTSurfer strategy."
order: 4.1
lastUpdated: '2026-11-12T00:02:30Z'
---

The **average true range** (ATR), by J. Welles Wilder, measures how much the price moves in a bar, counting the gaps between bars. It is in the units of the price and says nothing about direction.

Try it on a series below. It reads whole bars, so choose a kline series: on a ticker series the chart has nothing to draw, and says so.

<div data-indicator-chart="atr"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
TR  = max(high − low, |high − previous close|, |low − previous close|)
ATR = previous ATR + (TR − previous ATR) / N
```

The true range `TR` is the largest of the bar's own range and the distance from the previous close to the bar's high and to its low, so a gap counts. The first bar has no previous close and its range is `high − low`. The engine starts the average on the mean of the first `N` ranges and then smooths as Wilder does, the [MMA](/docs/indicators/averages/mma) weight of `1 / N`. It is ready after `N` bars.

It needs the high, the low and the close of each bar. A ticker carries a 24-hour high and low and not those of a bar, so on a ticker feed the engine raises a notice and the ATR draws nothing.

## Reading it

- **It is wider when the market is more volatile**, and it counts the gaps that the range of a bar alone would miss.
- **It is in price units.** A value is large or small next to the price: to compare instruments, divide by the price, or use the [percent volatility](/docs/indicators/volatility/percentVolatility).
- **It has no direction.** It says how much the price moves, not where.

## In a strategy

```
setup:
  atr(14)
```

`atr(14)` registers `atr14`. It belongs in a `kline` strategy. In Java, `.atr(14)` on the builder.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Modified moving average](/docs/indicators/averages/mma): the smoothing it uses.
- [Standard deviation](/docs/indicators/volatility/stdDev): another measure of how much the price spreads, from the prices and not the ranges.
- [Percent volatility](/docs/indicators/volatility/percentVolatility): the average size of the changes, as a percentage.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
