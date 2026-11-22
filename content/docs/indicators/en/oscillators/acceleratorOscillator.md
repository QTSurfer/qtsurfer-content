---
title: "Accelerator oscillator (AC)"
description: "How the accelerator oscillator takes the gap between the awesome oscillator and its own average, so that it turns before it, why its first four values are not valid yet, and how to use it in a QTSurfer strategy."
order: 2.57
lastUpdated: '2026-11-22T19:38:50Z'
---

The **accelerator oscillator** (AC), by Bill Williams, is the gap between the [awesome oscillator](/docs/indicators/oscillators/awesomeOscillator) and its own 5-bar average: how fast the momentum is changing. It is drawn as a histogram around zero.

Try it on a series below. It has no parameter: the periods are 5, 34 and 5.

<div data-indicator-chart="acceleratorOscillator"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
middle = (high + low) / 2
AO     = SMA(middle, 5) − SMA(middle, 34)
AC     = AO − SMA(AO, 5)
```

The simple averages are the [moving](/docs/indicators/averages/sma) ones, which take a new value with every update, as in Williams' design. The first value is on update 34, and the chart draws from there. **The first four values are a warm-up spike**: the average of the AO still holds values from before the AO was ready. On the daily BTC/USDT the first one is 13,264, three times the highest that follows. The AC is the textbook one from update 38, so leave the four before it out of a rule.

## Reading it

- **It turns before the awesome oscillator**, since it measures its change. On the real series of the chart, from update 38, it crosses zero 20 to 32 times in 263 bars, against 9 to 12 times in 267 for the awesome oscillator.
- **It is in price units**, so it does not compare between instruments: from update 38 it goes from −3,569 to 4,314 on the daily BTC/USDT and from −16 to 11 on the 15-minute ETH/USDT.
- **It is positive on 49 % to 56 % of those bars** of the real series of the chart.

## In a strategy

```
uses pro.acceleratorOscillator
setup:
  acceleratorOscillator()
```

`acceleratorOscillator()` registers `acc`. It has no form with parameters. In Java the class is `AcceleratorOscillatorRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("acc", new AcceleratorOscillatorRTIndicator())`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [Awesome oscillator](/docs/indicators/oscillators/awesomeOscillator): the gap between two averages, which this one differentiates.
- [MACD](/docs/indicators/oscillators/macd): a histogram of the gap between a line and its average, with exponential averages.
- [Simple moving average](/docs/indicators/averages/sma): the average it is built from, in its moving mode.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
