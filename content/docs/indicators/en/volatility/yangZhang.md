---
title: "Yang-Zhang volatility"
description: "How the Yang-Zhang volatility combines the jump between bars, the open-to-close movement and the Rogers-Satchell term, per bar and not annualized, and how to use it in a QTSurfer strategy."
order: 4.9
lastUpdated: '2026-11-12T13:54:17Z'
---

The **Yang-Zhang volatility**, by Dennis Yang and Qiang Zhang, estimates how much the price moves in a bar from its open, high, low and close, and also counts the jump between one bar's close and the next bar's open. It is a combination of three variances, per bar, as a fraction of the price.

Try it on a series below and change the period.

<div data-indicator-chart="yangZhang"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
overnight = ln(open / previous close)        the jump between bars
day       = ln(close / open)
k         = 0.34 / (1.34 + (N + 1) / (N − 1))
volatility = √( variance(overnight) + k × variance(day) + (1 − k) × Rogers-Satchell )
```

The two variances are over the last `N` bars and are sample variances, divided by `N − 1`. The last term is the mean of the [Rogers-Satchell](/docs/indicators/volatility/rogersSatchell) terms over the same bars. The value is per bar and not annualized; the last argument, optional, is an annualization factor that **multiplies** it. It needs the close before the first bar of the window, so the first value is on update `N + 1`, one later than the other three estimators. A price that does not move reads 0.

## Reading it

- **It is the only one of the four that counts the jump between bars.** On a market that trades around the clock that jump is small, so on the real series of the chart the four estimators average within about 5 % of each other.
- **The three terms are weighted.** The weight `k` of the open-to-close variance falls as the window grows, and the Rogers-Satchell term takes the rest.

## In a strategy

```
uses pro.yangZhang
setup:
  yangZhang(20)
```

`yangZhang(20)` registers `yz20`. In Java, `Pro.on(indicators).yangZhang(20)`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Rogers-Satchell volatility](/docs/indicators/volatility/rogersSatchell): the in-bar term it is made with.
- [Parkinson volatility](/docs/indicators/volatility/parkinson): from the high and the low alone.
- [Garman-Klass volatility](/docs/indicators/volatility/garmanKlass): the estimator that adds the close against the open.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
