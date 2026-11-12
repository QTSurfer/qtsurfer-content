---
title: "Exponential moving average (EMA)"
description: "How the exponential moving average weights the recent prices more with weights that fall geometrically, what its period sets, and how to use it in a QTSurfer strategy."
order: 1.2
---

The **exponential moving average** (EMA) weights the most recent prices more, with weights that fall geometrically as the prices get older. It never fully forgets a price, and each update needs only the previous value.

Try it on a series below and change the period.

<div data-indicator-chart="ema"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
α   = 2 / (N + 1)
EMA = previous EMA + α × (price − previous EMA)
```

The engine starts the average on the first price and updates it with every price, so it is a continuous line, unlike the discrete simple average. The latest price weighs `α`: about 9.5 % at `N = 20`. The engine reports it ready after `N` updates, and the chart draws from there.

## Reading it

- **It lags as well.** On a straight line it trails the price by half the period, 9.5 bars at `N = 20`, the same as the moving simple average.
- **A jump is absorbed in a different way.** The EMA spreads it over the following prices with decaying weights, while a simple average takes it in at once and drops it all at once, `N` updates later.
- **It is the base of other indicators.** The [EMA crossover](/learn/articles/ema-crossover) builds a strategy from two of them, and the [MACD](/docs/indicators/oscillators/macd) is their difference.

## In a strategy

```
setup:
  ema(20)
```

`ema(20)` registers `ema20`. Give it a name with `ema("fast", 9)`, or feed it another indicator, `ema("signal", "macd", 9)`, which is how the MACD page builds its signal line. In Java, `.ema(9)` and `.ema("fast", "vol", 9)` on the builder.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Simple moving average](/docs/indicators/averages/sma): the simple average, with the same weight on every price.
- [Modified moving average](/docs/indicators/averages/mma): the same average with a gentler weight, `1 / N`.
- [MACD](/docs/indicators/oscillators/macd): the difference of two of them, with its signal line.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
