---
title: "Chaikin oscillator"
description: "How the Chaikin oscillator takes the gap between a fast and a slow exponential average of the accumulation/distribution line, and how to use it in a QTSurfer strategy."
order: 6.42
---

The **Chaikin oscillator**, by Marc Chaikin, is the gap between a fast and a slow exponential average of the [accumulation/distribution line](/docs/indicators/volume/adl): the momentum of the money flow. It is drawn around zero.

Try it on a series below and change the two periods.

<div data-indicator-chart="chaikinOscillator"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
Chaikin = EMA(ADL, fast) − EMA(ADL, slow)        fast 3, slow 10 by default
```

Both averages start on the first value of the line. The first value is on update `slow`, and the chart draws from there. The volume is the one of the bars of the series; the real ones carry the exchange's volume.

## Reading it

- **Above zero the money flow is gaining speed, below it losing**; it says nothing about the level of the line. On the real series of the chart it is positive on 34 % to 57 % of the bars.
- **It is in units of volume**, so it does not compare between instruments: it goes from −31,513 to 33,971 on the daily BTC/USDT and from −9,792 to 7,663 on the 15-minute ETH/USDT.
- **It is nervous with the short periods**, 3 and 10, which are those of Chaikin.

## In a strategy

```
uses pro.chaikinOscillator
setup:
  chaikinOscillator(3, 10)
```

`chaikinOscillator(3, 10)` registers `chaikin3_10`. In Java the class is `ChaikinOscillatorRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.volume.pro`, and a group takes it with `indicators.add("chaikin3_10", new ChaikinOscillatorRTIndicator(3, 10))`.

The two periods are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [Accumulation/distribution line](/docs/indicators/volume/adl): the line it takes the gap of.
- [MACD](/docs/indicators/oscillators/macd): the same gap, on the price.
- [Chaikin money flow](/docs/indicators/volume/cmf): the money flow as a ratio between −1 and 1.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
