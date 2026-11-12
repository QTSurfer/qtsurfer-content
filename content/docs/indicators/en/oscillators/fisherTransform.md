---
title: "Fisher transform"
description: "How the Fisher transform places the price in its recent range, smooths it and stretches the extremes with the inverse hyperbolic tangent, bounded to about 3.8, and how to use it in a QTSurfer strategy."
order: 2.50
---

The **Fisher transform**, by John Ehlers, places the price in its recent range, smooths it, and stretches the extremes with the inverse hyperbolic tangent, so that turning points stand out.

Try it on a series below and change the period.

<div data-indicator-chart="fisherTransform"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
x      = 2 × (price − lowest) / (highest − lowest) − 1        over the last N prices, kept in [−0.999, 0.999]
v      = 0.33 × x + 0.67 × previous v                          the smoothing
Fisher = 0.5 × ln( (1 + v) / (1 − v) )                         v kept in [−0.999, 0.999]
```

While the window fills, the lowest and the highest are those of the prices so far; the first value is on update `N`, and the chart draws from there. A window with no range gives `x = 0`. It needs at least 2 periods. Some implementations add half of the previous result to the last line (`+ 0.5 × previous Fisher`), which doubles its amplitude at rest; the engine does not.

## Reading it

- **It is bounded by 3.80**, because `v` stops at 0.999: a straight rise reads +3.80, a straight fall −3.80, and a price that does not move 0.
- **The transform stretches the ends.** On the real series of the chart, at period 10, it goes from −2.4 to 2.4, and it is beyond ±1.5 on 4 % to 6 % of the bars.
- **It turns early, as the price touches a range limit.** It is positive on 42 % to 52 % of the bars of the real series of the chart.

## In a strategy

```
uses pro.fisherTransform
setup:
  fisherTransform(10)
```

`fisherTransform(10)` registers `fisher10`. In Java the class is `FisherTransformRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("fisher10", new FisherTransformRTIndicator(10))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Stochastic RSI](/docs/indicators/oscillators/stochRsi): another value placed in its own recent range.
- [RSI](/docs/indicators/oscillators/rsi): the gains against the total, from 0 to 100.
- [CCI](/docs/indicators/oscillators/cci): how far the price is from its average, in units of the usual deviation.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
