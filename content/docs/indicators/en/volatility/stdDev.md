---
title: "Standard deviation"
description: "How the standard deviation measures how spread out the last N prices are around their mean, with the deviation of a sample, and how to use it in a QTSurfer strategy."
order: 4.2
lastUpdated: '2026-11-12T00:02:30Z'
---

The **standard deviation** measures how spread out the last `N` prices are around their mean. It is in the units of the price, and it is what the [Bollinger bands](/docs/indicators/bands/bollinger) are made of.

Try it on a series below and change the period.

<div data-indicator-chart="stdDev"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
s = √( Σ (price − mean)² / (N − 1) )        over the last N prices
```

The engine divides by `N − 1`, the deviation of a sample, and not by `N`. It reports it ready after `N` updates, and the chart draws from there. A price that does not move reads 0.

## Reading it

- **It measures the spread of the prices in the window, not of their changes.** A steady climb raises it as much as a noisy range does. For the size of the changes use the [ATR](/docs/indicators/volatility/atr) or the [percent volatility](/docs/indicators/volatility/percentVolatility).
- **It is in price units**, so a value is large or small next to the price.

## In a strategy

```
setup:
  stdDev(20)
```

`stdDev(20)` registers `stdDev20`. Like the averages it can read another indicator, `stdDev("name", "other", 20)`. In Java, `.stdDev(5)` on the builder.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Variance](/docs/indicators/volatility/variance): its square.
- [Bollinger bands](/docs/indicators/bands/bollinger): the band that is `k` of these either side of an average.
- [ATR](/docs/indicators/volatility/atr): how much the price moves in a bar.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
