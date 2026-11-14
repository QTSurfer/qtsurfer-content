---
title: "Parabolic SAR"
description: "How the parabolic SAR draws a trailing stop that speeds up as a trend goes on and flips when the price touches it, and how to use it in a QTSurfer strategy."
order: 5.45
---

The **parabolic SAR** (stop and reverse), by Welles Wilder, draws a trailing stop that moves toward the price faster the longer the trend lasts, and flips to the other side when the price touches it.

Try it on a series below and change the step and the maximum.

<div data-indicator-chart="parabolicSar"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
SAR  = previous SAR + AF × (EP − previous SAR)
EP   = the extreme of the trend: highest high in a rise, lowest low in a fall
AF   = the acceleration factor: starts at the step, grows by the step with every new EP, up to the maximum
```

The step is 0.02 and the maximum 0.2 by default; the engine requires both above 0. In a rise the SAR is never above the lows of the last two bars, and in a fall never below their highs. When the price touches it, the SAR jumps to the old `EP`, the trend flips and `AF` starts again. The first bar sets the SAR at its low, the second one the trend; the chart draws from update 2.

## Reading it

- **The dots are under the price in a rise and over it in a fall.** On the real series of the chart, with the defaults, the close is above the SAR on 47 % to 55 % of the bars, and it crosses it 21 to 26 times in the 299 bars drawn.
- **It is a stop, not a trend filter.** In a range it flips again and again, and every flip is a loss; the [ADX](/docs/indicators/trend/adx) or the [efficiency ratio](/docs/indicators/trend/efficiencyRatio) tell when there is a trend to follow.
- **The step and the maximum set how tight it is**: a larger step closes the gap sooner and flips more often.

## In a strategy

```
uses pro.parabolicSar
setup:
  parabolicSar(0.02, 0.2)
```

`parabolicSar(0.02, 0.2)` registers `psar0.02_0.2`. Its default id has a dot, so when a `window` has to refer to it, give it a name: `parabolicSar("sar", 0.02, 0.2)`. In Java the class is `ParabolicSarRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.trend.pro`, and a group takes it with `indicators.add("psar0.02_0.2", new ParabolicSarRTIndicator(0.02, 0.2))`.

The step and the maximum are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [SuperTrend](/docs/indicators/trend/superTrend): another stop that flips with the trend.
- [Chandelier exit](/docs/indicators/trend/chandelierExit): a stop that hangs from the extremes.
- [Average directional index](/docs/indicators/trend/adx): how strong the trend is, to know when to use a stop like this.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
