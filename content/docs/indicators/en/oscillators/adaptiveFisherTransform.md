---
title: "Adaptive Fisher transform"
description: "How the adaptive Fisher transform changes the window of the Fisher transform with the efficiency ratio of the price, short in a trend and long in a range, reaching twice the amplitude at rest, and how to use it in a QTSurfer strategy."
order: 2.51
---

The **adaptive Fisher transform** is the [Fisher transform](/docs/indicators/oscillators/fisherTransform) with a window that changes with how straight the price moves: short when it trends, long when it wanders. It takes the efficiency ratio of Perry Kaufman to set the window.

Try it on a series below and change the three periods.

<div data-indicator-chart="adaptiveFisherTransform"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
ER      = |price − price er bars ago| / Σ |change|, over the last er bars           the efficiency ratio
window  = round(min + (1 − ER) × (max − min)), kept between min and max
x       = 2 × (price − lowest) / (highest − lowest) − 1                              over the last `window` prices, kept in [−0.999, 0.999]
v       = 0.5 × x + 0.5 × previous v
Fisher  = 0.5 × ln( (1 + v) / (1 − v) ) + 0.5 × previous Fisher                      v kept in [−0.999, 0.999]
```

`er` is 10, `min` 5 and `max` 20 by default. The engine requires `er` below `max`, `min` at least 2 and not above `max`, and rejects other values when it builds the indicator. A straight line has an efficiency ratio of 1 and uses the shortest window; a price that wanders has a ratio near 0 and uses the longest. The first value is on update `max`, and the chart draws from there. **Unlike the plain Fisher transform, this one adds half of its previous result**, so at rest it reaches twice the amplitude.

## Reading it

- **It is bounded by 7.60**, twice the bound of the plain Fisher transform: a straight rise reads +7.60, a straight fall −7.60. On the real series of the chart it goes from −6.1 to 5.7.
- **±1.5 is not a rare reading here.** The extra half of the previous result doubles the amplitude, so the line is beyond ±1.5 on 48 % to 57 % of the bars of the real series of the chart; do not carry the levels of the plain Fisher transform over to this one.
- **It is positive on 40 % to 51 % of the bars** of the real series of the chart.

## In a strategy

```
uses pro.adaptiveFisherTransform
setup:
  adaptiveFisherTransform(10, 5, 20)
```

`adaptiveFisherTransform(10, 5, 20)` registers `afisher10_5_20`. In Java the class is `AdaptiveFisherTransformRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("afisher10_5_20", new AdaptiveFisherTransformRTIndicator(10, 5, 20))`.

The three periods are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

## Related

- [Fisher transform](/docs/indicators/oscillators/fisherTransform): the same transform with a fixed window and no second smoothing.
- [Kaufman's adaptive moving average](/docs/indicators/averages/kama): another indicator that adapts to the efficiency ratio.
- [Stochastic RSI](/docs/indicators/oscillators/stochRsi): another value placed in its own recent range.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
