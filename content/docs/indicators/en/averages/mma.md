---
title: "Modified moving average (MMA)"
description: "How the modified moving average, the smoothing J. Welles Wilder uses, is an exponential average with a gentler weight, and how to use it in a QTSurfer strategy."
order: 1.6
---

The **modified moving average** (MMA) is the smoothing that J. Welles Wilder uses in his indicators, such as the RSI and the ATR. It is an exponential average with a gentler weight.

Try it on a series below and change the period.

<div data-indicator-chart="mma"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
α   = 1 / N
MMA = previous MMA + α × (price − previous MMA)
```

It is an EMA with `α = 1 / N` in place of `2 / (N + 1)`, so an MMA of `N` periods is the same line as an EMA of `2N − 1` periods: the MMA of 20 and the EMA of 39 coincide. The engine starts it on the first price and reports it ready after `N` updates.

## Reading it

- **It is slower than an EMA of the same period.** Its weight on the newest price is smaller, `1 / N` against `2 / (N + 1)`, so it follows the price later and more smoothly.
- **It is what "Wilder's smoothing" means.** `rsi(14, false)` and the [ATR](/docs/indicators/volatility/atr) use it.

## In a strategy

```
setup:
  mma(14)
```

`mma(14)` registers `mma14`. Like the EMA it can read another indicator, `mma("name", "other", 14)`. In Java, `.mma(7)` on the builder.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Exponential moving average](/docs/indicators/averages/ema): the same average with a weight of `2 / (N + 1)`.
- [RSI](/docs/indicators/oscillators/rsi): the oscillator that uses it for its Wilder variant.
- [ATR](/docs/indicators/volatility/atr): the range indicator that smooths with it.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
