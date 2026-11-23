---
title: "Distance from an average"
description: "How the distance from an average measures how far the price is from a moving average in percent, which averages it takes, and how to use it in a QTSurfer strategy."
order: 9.04
lastUpdated: '2026-11-22T23:27:04Z'
---

The **distance from an average** is how far the price is from a moving average, in percent of the average: positive above it, negative below.

Try it on a series below, against an EMA, and change its period.

<div data-indicator-chart="distanceMa"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
distance from the average = 100 × (price − average) / average
```

It takes an [SMA](/docs/indicators/averages/sma), an [EMA](/docs/indicators/averages/ema) or an [MMA](/docs/indicators/averages/mma), and refuses any other indicator. It is ready when the average is, and it gives 0 when the average is 0.

## Reading it

- **Zero is the price crossing its average.** The sign is the side the price is on.
- **A large distance is a stretched price.** It says how far the price has gone from its usual level, not that it will come back: in a strong trend it stays large for a long time.
- **For another average, use the [distance](/docs/indicators/change/distance)**: `distance("gap", "price", "hma20")` measures the price against any indicator.

## In a strategy

```
setup:
  ema(20)
  distanceMa("ema20")
```

`distanceMa("ema20")` registers `distema20`, and the average has to be registered before it. In Java, `.distanceMa("ema20")` on the builder.

## Related

- [Distance](/docs/indicators/change/distance): the gap between any two indicators.
- [Detrended price oscillator](/docs/indicators/oscillators/detrendedPriceOscillator): a past price against the average.
- [Z-score](/docs/indicators/statistics/zScore): the same gap, in deviations instead of percent.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
