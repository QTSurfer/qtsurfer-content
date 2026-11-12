---
title: "Fractal adaptive moving average (FRAMA)"
description: "How the fractal adaptive moving average sets its speed from the fractal dimension of the last prices, running fast on a straight line and nearly stopping in a range, and how to use it in a QTSurfer strategy."
order: 1.73
lastUpdated: '2026-11-12T18:10:40Z'
---

The **fractal adaptive moving average** (FRAMA), by John Ehlers, is an exponential average whose speed follows the fractal dimension of the last prices: it runs at full speed when the price moves in a straight line and nearly stops when it wanders.

Try it on a series below and change the period.

<div data-indicator-chart="frama"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
N1 = (highest − lowest of the older half of the last N prices) / (N / 2)
N2 = (highest − lowest of the newer half) / (N / 2)
N3 = (highest − lowest of all N) / N
D  = (ln(N1 + N2) − ln(N3)) / ln 2        near 1 on a straight line, up to 2 on noise
α  = exp(−4.6 × (D − 1))                  kept between 0.01 and 1
FRAMA = α × price + (1 − α) × previous FRAMA
```

The engine reads one price, not the highs and lows of each bar, and an odd period is taken as the next even one: `frama(21)` computes as `frama(22)`. While the window fills, the line is the price itself; it is reported ready on update `N`, and the chart draws from there. A window with no range gives `D = 1`, and so `α = 1`.

## Reading it

- **On a straight line it is the price.** `α` goes to 1 and the line reads the price exactly, with no lag at all; a price that does not move gives the same.
- **In a range it nearly stops.** On the real series of the chart the median `α` is between 0.14 and 0.19, `α` is under 0.1 on 31 % to 42 % of the bars and it is 1 on about one bar in ten, so the line hugs the price when it runs and flattens when it wanders.
- **It is the closest to the price of the averages of this guide**, on the three real series of the chart, at their default periods. On the daily BTC/USDT series of the chart, at period 20 its mean distance from the close is 1.7 % of the price, against 3.8 % for the EMA, and it is among the jumpiest: its mean change from bar to bar is 0.70 % against 0.40 %.
- **It never overshoots.** It is always between the previous line and the price, so a jump is followed without overshoot.

## In a strategy

```
uses pro.frama
setup:
  frama(20)
```

`frama(20)` registers `frama20`; `frama(21)` registers `frama21` but computes with 22, as the id keeps the number given. In Java the class is `FramaRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.averages.pro`, and a group takes it with `indicators.add("frama20", new FramaRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Kaufman's adaptive moving average](/docs/indicators/averages/kama): Kaufman's adaptive average, which also adapts its speed, by how straight the price moves.
- [Exponential moving average](/docs/indicators/averages/ema): the exponential average, with a speed that never changes.
- [ATR](/docs/indicators/volatility/atr): another way to tell a range from a move.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
