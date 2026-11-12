---
title: "Rogers-Satchell volatility"
description: "How the Rogers-Satchell volatility estimates how much the price moves in a bar from its open, high, low and close, built so that a steady drift does not inflate it, and how to use it in a QTSurfer strategy."
order: 4.8
---

The **Rogers-Satchell volatility**, by L. C. G. Rogers and Stuart Satchell, estimates how much the price moves in a bar from its open, high, low and close, in a way that a steady drift of the price does not inflate. It is a volatility per bar, as a fraction of the price.

Try it on a series below and change the period.

<div data-indicator-chart="rogersSatchell"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
volatility = √( mean over the last N bars of  ln(high / close) × ln(high / open) + ln(low / close) × ln(low / open) )
```

`ln` is the natural logarithm. The value is per bar and not annualized; the last argument, optional, is an annualization factor that **multiplies** it. The first value is on update `N`, and the chart draws from there. A price that does not move reads 0.

## Reading it

- **It is built to measure the movement inside the bar around a drift.** A steady climb or fall of the price does not count as volatility, which is what the estimators made from the close against the open would add.
- **It does not see the jumps between bars**, since each term uses the open, high, low and close of one bar.
- **The four OHLC estimators are close on these series**: on the real series of the chart they average within about 5 % of each other.

## In a strategy

```
uses pro.rogersSatchell
setup:
  rogersSatchell(20)
```

`rogersSatchell(20)` registers `rs20`. In Java, `Pro.on(indicators).rogersSatchell(20)`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Garman-Klass volatility](/docs/indicators/volatility/garmanKlass): the estimator that adds the close against the open.
- [Yang-Zhang volatility](/docs/indicators/volatility/yangZhang): uses this one for its in-bar term, and counts the jump between bars.
- [Parkinson volatility](/docs/indicators/volatility/parkinson): from the high and the low alone.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
