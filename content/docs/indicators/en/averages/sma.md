---
title: "Simple moving average (SMA)"
description: "How the simple moving average takes the mean of the last N prices, why the engine's default one renews once per period and draws a staircase, and how to use it in a QTSurfer strategy."
order: 1.1
lastUpdated: '2026-11-12T00:02:30Z'
---

The **simple moving average** (SMA) is the mean of the last `N` prices. Every price in the window weighs the same, so the average smooths the price and follows it with a delay of about half the window.

Try it on a series below. Change the period, and switch with the checkbox between the engine's default and the textbook average.

<div data-indicator-chart="sma"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
SMA = (price₁ + price₂ + … + priceₙ) / N        the last N prices
```

The engine's default is the **discrete** mode. It takes the mean of the last complete block of `N` prices and keeps it until the next block is complete, so the line holds its value for `N` updates and then steps: a staircase. Until the first block is complete the engine holds the first price and does not report itself ready, and the chart draws from the bar that completes it.

With the checkbox off the average is the textbook one, a moving average that takes a new value with every price. The simple averages under the engine's default RSI are the discrete ones, which is why that RSI is a staircase too.

## Reading it

- **A longer period smooths more and lags more.** On a straight line the moving average trails the price by half the period: 9.5 bars at `N = 20`.
- **The staircase has a cost.** A rule that reads the discrete average sees one level for a whole block. If the rule needs the average to follow the price, ask for the moving one.
- **The price against its average**, and two averages of different periods against each other, are the usual readings. The [EMA crossover](/learn/articles/ema-crossover) is the second one.

## In a strategy

```
setup:
  sma(20)
```

`sma(20)` registers `sma20`, the discrete average. To ask for the moving one, give it a name and turn the mode off: `sma("sma20", 20, false)`. In Java, `.sma(20)` and `.sma("s20", 20, false)` on the builder.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Exponential moving average](/docs/indicators/averages/ema): the exponential average, which weights the recent prices more.
- [Weighted moving average](/docs/indicators/averages/wma): the weighted average, with a window like this one.
- [RSI](/docs/indicators/oscillators/rsi): the oscillator whose default is built on this average.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
