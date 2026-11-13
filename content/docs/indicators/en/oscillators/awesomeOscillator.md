---
title: "Awesome oscillator (AO)"
description: "How the awesome oscillator takes the gap between a fast and a slow average of the middle of each bar, why the engine's histogram moves in steps, and how to use it in a QTSurfer strategy."
order: 2.56
lastUpdated: '2026-11-13T21:28:19Z'
---

The **awesome oscillator** (AO), by Bill Williams, is the gap between a fast and a slow simple average of the middle of each bar. It is drawn as a histogram around zero.

Try it on a series below and change the two periods.

<div data-indicator-chart="awesomeOscillator"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
middle = (high + low) / 2
AO     = SMA(middle, fast) − SMA(middle, slow)        fast 5, slow 34 by default
```

The engine's simple averages are its default **discrete** ones, which hold the mean of a complete block until the next block is complete (the [SMA page](/docs/indicators/averages/sma) explains it). So the histogram moves in steps: 77 % of its bars repeat the previous value, on the real series of the chart, where a moving average would change it on every bar. The first value is on update `slow`, 34 with the defaults, and the chart draws from there.

## Reading it

- **The zero line is the crossing of the two averages.** Above it the fast average of the middle prices is above the slow one, below it under. On the real series of the chart it crosses zero 5 to 11 times in the 267 bars drawn.
- **It is in price units**, so it does not compare between instruments: it goes from −17,866 to 15,253 on the daily BTC/USDT and from −102 to 28 on the 15-minute ETH/USDT.
- **It is positive on 30 % to 59 % of the bars** of the real series of the chart.

## In a strategy

```
uses pro.awesomeOscillator
setup:
  awesomeOscillator(5, 34)
```

`awesomeOscillator(5, 34)` registers `ao5_34`. In Java the class is `AwesomeOscillatorRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("ao5_34", new AwesomeOscillatorRTIndicator(5, 34))`.

The two periods are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [Accelerator oscillator](/docs/indicators/oscillators/acceleratorOscillator): the momentum of this one: its gap to its own average.
- [MACD](/docs/indicators/oscillators/macd): the same idea with exponential averages of the close.
- [Simple moving average](/docs/indicators/averages/sma): the discrete average it is built from, explained there.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
