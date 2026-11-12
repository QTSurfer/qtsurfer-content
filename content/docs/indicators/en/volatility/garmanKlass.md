---
title: "Garman-Klass volatility"
description: "How the Garman-Klass volatility estimates how much the price moves in a bar from its open, high, low and close, per bar and not annualized, and how to use it in a QTSurfer strategy."
order: 4.7
---

The **Garman-Klass volatility**, by Mark Garman and Michael Klass, estimates how much the price moves in a bar from its open, high, low and close. It is a volatility per bar, as a fraction of the price.

Try it on a series below and change the period.

<div data-indicator-chart="garmanKlass"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
volatility = √( mean over the last N bars of  0.5 × ln(high / low)² − (2 ln 2 − 1) × ln(close / open)² )
```

`ln` is the natural logarithm. The value is per bar and not annualized; the last argument, optional, is an annualization factor that **multiplies** it. The first value is on update `N`, and the chart draws from there. A price that does not move reads 0.

## Reading it

- **It looks at where the bar closed against where it opened, as well as at its range.**
- **It does not see the jumps between bars.** Each term uses the open, high, low and close of one bar, so a gap between one close and the next open does not count.
- **The four OHLC estimators are close on these series**: on the real series of the chart they average within about 5 % of each other.

## In a strategy

```
uses pro.garmanKlass
setup:
  garmanKlass(20)
```

`garmanKlass(20)` registers `gk20`. In Java, `Pro.on(indicators).garmanKlass(20)`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Parkinson volatility](/docs/indicators/volatility/parkinson): from the high and the low alone.
- [Rogers-Satchell volatility](/docs/indicators/volatility/rogersSatchell): an estimator built so that a steady drift does not inflate it.
- [Yang-Zhang volatility](/docs/indicators/volatility/yangZhang): also counts the jump between bars.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
