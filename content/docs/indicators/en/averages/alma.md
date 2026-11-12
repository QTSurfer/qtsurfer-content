---
title: "Arnaud Legoux moving average (ALMA)"
description: "How the Arnaud Legoux moving average weights the last prices with a bell curve whose peak the offset moves toward the latest one, what the offset and the sigma change, and how to use it in a QTSurfer strategy."
order: 1.72
---

The **Arnaud Legoux moving average** (ALMA), by Arnaud Legoux and Dimitrios Kouzis-Loukas, weights the last `N` prices with a bell curve. An offset moves the peak of the bell toward the latest price, so the line is smooth and trails the price little.

Try it on a series below and change the period.

<div data-indicator-chart="alma"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
m  = ⌊offset × (N − 1)⌋              offset 0.85 by default
s  = N / sigma                        sigma 6 by default
wᵢ = exp(−(i − m)² / (2 s²))          i = 0 the oldest of the last N prices … N − 1 the latest
ALMA = Σ wᵢ × priceᵢ / Σ wᵢ
```

The weights add up to 1 after the division, so the line is always between the lowest and the highest of the last `N` prices. The first value is on update `N`, and the chart draws from there.

## Reading it

- **The offset says where the bell sits in the window.** At 0 its peak is on the oldest of the last `N` prices and at 1 on the latest; at the default 0.85 it is close to the latest, and on a straight rise of 2 per bar the ALMA of period 20 trails the price by 3.9 bars where an EMA of the same period trails it by 9.5.
- **The sigma says how wide the bell is.** A larger sigma narrows it, so fewer of the last prices count and the line follows the price closer; a smaller one widens it toward a plain average.
- **It never overshoots.** The weights are all positive, so the line stays between the lowest and the highest of the last `N` prices and a jump is followed without overshoot, which the DEMA and the least squares average do not give.
- **On the daily BTC/USDT series of the chart**, at period 20 its mean distance from the close is 2.4 % of the price, against 3.8 % for the EMA of the same period.

## In a strategy

```
uses pro.alma
setup:
  alma(20)
```

`alma(20)` registers `alma20`, with the offset and the sigma at their defaults. A form with a name takes the two as well, after the period: `alma("fast", 20, 0.85, 6.0)`. The engine accepts an offset from 0 to 1 and a sigma above 0, and rejects any other when it builds the indicator. In Java the class is `AlmaRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.averages.pro`, and a group takes it with `indicators.add("alma20", new AlmaRTIndicator(20, 0.85, 6.0))`.

The period, the offset and the sigma are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

## Related

- [Exponential moving average](/docs/indicators/averages/ema): the exponential average, which trails more.
- [Hull moving average](/docs/indicators/averages/hma): another smooth average that trails little.
- [Weighted moving average](/docs/indicators/averages/wma): the weights of a straight line, instead of a bell.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
