---
title: "Volatility"
description: "How the volatility indicator gives the share of recent updates in which the price changed, why it reads 100 almost everywhere on candles, and how to use it in a QTSurfer strategy."
order: 4.4
---

The **volatility** of the QTSurfer catalogues is not the statistical one. It is the percentage of the last updates in which the price changed: it says how often the price moves, not by how much.

Try it on a series below and change the period. The chart opens on a kline series, where the price changes at every bar and the line sits at 100: choose a ticker series to see it move.

<div data-indicator-chart="volatility"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
changed = 1 if the price differs from the previous one, 0 if it is the same
volatility = 100 × (the mean of `changed` over a block of N updates)
```

Each update after the first feeds a 1 or a 0 into a simple average, and the engine's default one is the discrete one of the [SMA](/docs/indicators/averages/sma) page: the value is the mean of the last complete block of `N` updates, renewed once per block, so the line is a staircase. It is ready after `N` changes, which is the update number `N + 1`.

## Reading it

- **It reads 100 as long as the price changes at every update.** That is almost everywhere on the real series of the chart: a close is rarely the same as the one before.
- **It falls where a price repeats**, as on the ticker samples, where a repeated price pulls the block it falls in below 100. It tells how often the price changes, not by how much.
- **For how much the price moves, use another one:** the [percent volatility](/docs/indicators/volatility/percentVolatility), the [standard deviation](/docs/indicators/volatility/stdDev) or the [ATR](/docs/indicators/volatility/atr).

## In a strategy

```
setup:
  volatility(5)
```

`volatility(5)` registers `vol5`. In Java, `.volatility(5)` on the builder.

## Related

- [Percent volatility](/docs/indicators/volatility/percentVolatility): the average size of the changes, in percent.
- [Simple moving average](/docs/indicators/averages/sma): the discrete average it feeds.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
