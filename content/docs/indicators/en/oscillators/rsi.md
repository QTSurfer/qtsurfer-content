---
title: Relative strength index (RSI)
description: "How the RSI turns recent gains and losses into a number between 0 and 100, how its period and its smoothing change the line, and how to use it in a QTSurfer strategy."
order: 2.1
lastUpdated: '2026-11-11T19:40:19Z'
---

The **relative strength index** (RSI) measures how much of the recent price movement has been up and how much down, and
reports it as a number between 0 and 100. J. Welles Wilder Jr. introduced it in 1978. By convention, above 70 is read as
overbought and below 30 as oversold: the price has risen, or fallen, further than is usual for the period.

Try it on a series below. Change the period, the two levels and the smoothing, and watch the line, the arrows and the
count follow. The arrows mark where the RSI comes back above the oversold level (up) and back below the overbought level
(down).

<div data-indicator-demo="rsi"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The
line is computed in your browser by the engine's own RSI class, so it is the line a strategy reads.

## What it computes

Over the last `N` price changes (14 by default), the RSI compares the average gain with the average loss:

```text
RS  = average gain / average loss
RSI = 100 − 100 / (1 + RS)
```

A gain is a rise from one price to the next, a loss is the size of a fall, and a price that does not change counts as
neither. With only gains the RSI is 100, and with only losses it is 0. Because it works on ratios of changes, the RSI
does not depend on the level of the price, and it stays between 0 and 100 on any instrument.

## Two ways to average

How the two averages are kept is the one choice that changes the line.

- **Wilder's smoothing** updates both averages with every new price: it keeps `(N − 1) / N` of the previous average and
  adds `1 / N` of the new change. This is the RSI of charting packages and of TA-Lib: a continuous line that reacts a
  little at every bar.
- **Simple averages** are the engine's default, the variant often called Cutler's RSI. The engine renews them once per
  period of `N` updates, so the line holds its value for `N` updates and then steps: a staircase. That is why the chart
  offers both.

Choose "Wilder's smoothing" and "Cutler's average (engine default)" in the chart to see the difference on the same
series. In a strategy you choose with the second argument of the call: `rsi(14)` is the engine's default and
`rsi(14, false)` is Wilder's smoothing, in QTScript and in Java alike (`.rsi(14)` and `.rsi(14, false)` on the builder).

## Reading it

- **The levels are conventions, not laws.** 70 and 30 are the usual ones, and the chart lets you move them. A short
  period reaches the extremes more often: try `N = 5`, `14` and `30` on the same series and count how many bars fall
  beyond the levels.
- **Overbought is not a sell signal on its own.** In a strong trend the RSI can stay above 70 for a long time while the
  price keeps rising, and the same below 30 in a fall. That is why it is usually used as a signal of return to the mean
  in ranging markets, or together with a trend filter.
- **The arrows mark the way back, not the extreme.** They show the moment the RSI leaves the zone, which is what a
  trader who trades reversions usually reads. With the engine's default averages there tend to be fewer arrows than with
  Wilder's smoothing, because the line moves less often.
- **Divergence.** A new price high that the RSI does not confirm is read by some as fading momentum. It is a
  discretionary reading, and the chart does not mark it.

## When there is nothing to divide

A price that does not move has no gains and no losses, so the formula divides zero by zero. The engine follows TA-Lib:
it returns 0 when there is neither gain nor loss, 100 when there are gains and no losses, and 0 when there are losses
and no gains. Other libraries return other values for a flat series, some 100 and some no value at all, so compare like
with like when you check the engine against another tool. And a rule such as `rsi < 30` fires on a market that does not
move, so make sure a flat feed cannot reach it.

## In a strategy

```
strategy "RSI reversion"

param rsiLow  = 30  "Oversold"
param rsiHigh = 70  "Overbought"

instruments */usdt

setup:
  rsi(14, false) window m1 {
    if (actual < rsiLow)  emitBuy(price);
    if (actual > rsiHigh) emitSell(price);
  }
```

This is the QTScript example of the [Strategies overview](/docs/strategies), with Wilder's smoothing. It emits a buy
when the RSI is below `rsiLow` and a sell when it is above `rsiHigh`, each time the window closes. It illustrates the
syntax; it is not a recommendation.

The period and the two levels are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them,
and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the
sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [SMA](/docs/indicators/averages/sma) and [MMA](/docs/indicators/averages/mma): the averages under the engine's default RSI and
  under Wilder's smoothing.
- [EMA crossover](/learn/articles/ema-crossover): the trend-following counterpart, with its own chart.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators):
  every indicator a strategy can call, with its forms and the names it registers.
