---
title: "Percent volatility"
description: "How the percent volatility gives the average absolute percent change between consecutive prices over a block of N changes, and how to use it in a QTSurfer strategy."
order: 4.5
---

The **percent volatility** is the average size of the changes of the price, as a percentage: how much it moves from one update to the next, on average. Being a percentage, it can be compared between instruments.

Try it on a series below and change the period.

<div data-indicator-chart="percentVolatility"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
change = 100 × |price − previous price| / previous price
percent volatility = the mean of `change` over a block of N changes
```

The engine feeds each change into a simple average, and its default one is the discrete one of the [SMA](/docs/indicators/averages/sma) page: the value is the mean of the last complete block of `N` changes, renewed once per block, so the line is a staircase that steps every `N` updates. It is ready after `N` changes, which is the update number `N + 1`.

## Reading it

- **It is per update**, so it depends on the timeframe: the change from one hour to the next is not that from one day to the next.
- **It is a percentage**, unlike the [ATR](/docs/indicators/volatility/atr) and the [standard deviation](/docs/indicators/volatility/stdDev), which are in the units of the price, so it compares instruments directly.
- **It counts the size of each change, not its direction**: a rise and a fall of the same size weigh the same.

## In a strategy

```
setup:
  percentVolatility(5)
```

`percentVolatility(5)` registers `pvol5`. In Java, `.percentVolatility(5)` on the builder.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [ATR](/docs/indicators/volatility/atr): the range of a bar, in the units of the price.
- [Standard deviation](/docs/indicators/volatility/stdDev): the spread of the prices, in the units of the price.
- [Volatility](/docs/indicators/volatility/volatility): how often the price changes.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
