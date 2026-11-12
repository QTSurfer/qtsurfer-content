---
title: "Parkinson volatility"
description: "How the Parkinson volatility estimates how much the price moves in a bar from its high and low alone, per bar and not annualized, and how to use it in a QTSurfer strategy."
order: 4.6
---

The **Parkinson volatility**, by Michael Parkinson, estimates how much the price moves in a bar from its high and low alone. It is a volatility per bar, as a fraction of the price: 0.02 is 2 %.

Try it on a series below and change the period.

<div data-indicator-chart="parkinson"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
volatility = √( Σ ln(high / low)² / (4 × N × ln 2) )        over the last N bars
```

`ln` is the natural logarithm. The value is per bar and not annualized. The last argument, optional, is an annualization factor that **multiplies** the value, so to scale a per-bar volatility to a year, pass the square root of the number of bars in a year. The first value is on update `N`, and the chart draws from there. A price that does not move reads 0.

## Reading it

- **It uses the whole range of each bar**, not only where the bar closed.
- **It does not see the jumps between bars.** It reads the high and the low of each bar, so a gap between one close and the next open does not count. The [Yang-Zhang volatility](/docs/indicators/volatility/yangZhang) is the one of the four that does count it.
- **The four OHLC estimators are close on these series.** On the real series of the chart they average within about 5 % of each other, since these markets trade around the clock and there is little jump between bars.

## In a strategy

```
uses pro.parkinson
setup:
  parkinson(20)
```

`parkinson(20)` registers `park20`. In Java, `Pro.on(indicators).parkinson(20)`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Garman-Klass volatility](/docs/indicators/volatility/garmanKlass): adds the open and the close to the range.
- [Yang-Zhang volatility](/docs/indicators/volatility/yangZhang): also counts the jump between bars.
- [ATR](/docs/indicators/volatility/atr): the range of a bar, in price units.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
