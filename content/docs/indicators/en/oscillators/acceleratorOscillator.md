---
title: "Accelerator oscillator (AC)"
description: "How the accelerator oscillator takes the gap between the awesome oscillator and its own average, so that it turns before it, why the engine's histogram moves in steps, and how to use it in a QTSurfer strategy."
order: 2.57
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

The engine's simple averages are its default **discrete** ones, which hold the mean of a complete block until the next block is complete (the [SMA page](/docs/indicators/averages/sma) explains it). So the histogram moves in steps: 77 % of its bars repeat the previous value, on the real series of the chart. The first value is on update 34, and the chart draws from there.

## Reading it

- **It turns before the awesome oscillator**, since it measures its change. On the real series of the chart it crosses zero 19 to 24 times in the 267 bars drawn, against 5 to 11 for the awesome oscillator.
- **It is in price units**, so it does not compare between instruments: it goes from −11,387 to 14,993 on the daily BTC/USDT and from −34 to 59 on the 15-minute ETH/USDT.
- **It is positive on 46 % to 60 % of the bars** of the real series of the chart.

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
- [Simple moving average](/docs/indicators/averages/sma): the discrete average it is built from, explained there.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
