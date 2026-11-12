---
title: "Detrended price oscillator (DPO)"
description: "How the detrended price oscillator sets a past price against the average to remove the trend and show cycles, why it is not a signal of the present, and how to use it in a QTSurfer strategy."
order: 2.49
---

The **detrended price oscillator** (DPO) sets a price from the past against the current simple average, which centres the average on that price and removes the trend, to show the cycles around it.

Try it on a series below and change the period.

<div data-indicator-chart="detrendedPriceOscillator"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
DPO = price (⌊N / 2⌋ + 1) bars ago − SMA(N)
```

The average is the moving one, over the last `N` prices. It needs at least 3 periods. The first value is on update `N`, and the chart draws from there.

## Reading it

- **It is not a signal of the present.** It compares a price from `N / 2 + 1` bars ago with today's average, so what it shows has already happened. On a straight rise of 2 per bar it reads −3.0 at period 20, and +3.0 on a straight fall, not 0.
- **It is in price units**, so it does not compare between instruments: on the real series of the chart, at period 20, it goes from −10,262 to 8,038 on the daily BTC/USDT and from −45 to 46 on the 15-minute ETH/USDT.
- **It is positive on 51 % to 52 % of the bars** of the real series of the chart.

## In a strategy

```
uses pro.detrendedPriceOscillator
setup:
  detrendedPriceOscillator(20)
```

`detrendedPriceOscillator(20)` registers `dpo20`. In Java the class is `DetrendedPriceOscillatorRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("dpo20", new DetrendedPriceOscillatorRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Simple moving average](/docs/indicators/averages/sma): the average the past price is set against.
- [Momentum](/docs/indicators/oscillators/momentum): the latest price against a past one.
- [CCI](/docs/indicators/oscillators/cci): how far the price is from its average, in units of the usual deviation.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
