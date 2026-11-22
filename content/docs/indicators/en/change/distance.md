---
title: "Distance"
description: "How distance measures the gap between two indicators as a percentage of the second, why its zero line is a crossover, and how to use it in a QTSurfer strategy."
order: 9.03
lastUpdated: '2026-11-22T19:06:11Z'
---

The **distance** is the gap between two indicators, in percent of the second one, the base. Between two averages it says which one is on top and by how much.

Try it on a series below, between two EMAs, and change their periods.

<div data-indicator-chart="distance"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
distance = 100 × (a − b) / b
```

It is ready when both indicators are, and it gives 0 when the base is 0.

## Reading it

- **Its zero line is a crossover.** The distance between a fast and a slow average changes sign where they cross, so one number carries the [EMA crossover](/learn/articles/ema-crossover) and how decided it is.
- **It compares instruments**, because it is relative: 0.5 is half a percent whether the price is 2 or 60,000.
- **It is the [MACD](/docs/indicators/oscillators/macd) as a percentage** when the averages are its two EMAs: the MACD is the same gap, in the units of the price.

## In a strategy

```
setup:
  ema(9)
  ema(21)
  distance("gap", "ema9", "ema21")
```

That registers `gap`, and both averages have to be registered before it. With no name, `distance("ema9", "ema21")` registers `distema9ema21`. In Java, `.distance("gap", "ema9", "ema21")` on the builder.

The periods of the averages are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample.

## Related

- [Distance from an average](/docs/indicators/change/distanceMa): the price against one average.
- [MACD](/docs/indicators/oscillators/macd): the gap between two EMAs, in the units of the price.
- [EMA](/docs/indicators/averages/ema): the average the chart uses.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
