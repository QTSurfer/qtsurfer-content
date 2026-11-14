---
title: "Klinger oscillator"
description: "How the Klinger oscillator takes the gap between a fast and a slow average of a volume force that follows the trend of the bar, with its signal line, and how to use it in a QTSurfer strategy."
order: 6.45
---

The **Klinger oscillator**, by Stephen Klinger, takes the gap between a fast and a slow exponential average of a volume force that follows the trend of each bar. It comes with a signal line, an average of itself.

Try it on a series below. It has no parameter: the periods are 34, 55 and 13.

<div data-indicator-chart="klingerOscillator"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
trend = +1 if (high + low + close) is at or above the previous one, else −1
dm    = high − low
cm    = dm if the trend changed, else previous cm + dm
VF    = volume × |2 × dm / cm − 1| × trend × 100
KVO   = EMA(VF, 34) − EMA(VF, 55)
Signal = EMA(KVO, 13)
```

A `cm` of 0 gives a force of 0. The averages start on the first force. The first value is on update 56, and the chart draws from there. A tie of the sum counts as a rise. The volume is the one of the bars of the series; the real ones carry the exchange's volume.

## Reading it

- **Above zero the volume force is with the rises, below it with the falls.** On the real series of the chart it is positive on 57 % to 71 % of the bars.
- **It crosses its signal often**: 55 to 63 times in the 245 bars drawn, on the three real series of the chart, so a crossing alone is a weak trigger.
- **Its scale is volume**, so it does not compare between instruments: it goes from −247,045 to 235,869 on the daily BTC/USDT and from −79,965 to 34,345 on the 15-minute ETH/USDT.

## In a strategy

```
uses pro.klingerOscillator
setup:
  klingerOscillator()
```

`klingerOscillator()` registers `klinger`, with the signal beside it as `klingerSignal`. It has no form with parameters. In Java the class is `KlingerOscillatorRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.volume.pro`, and a group takes it with `indicators.add("klinger", new KlingerOscillatorRTIndicator())`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [Chaikin oscillator](/docs/indicators/volume/chaikinOscillator): another gap between two averages of a volume flow.
- [On-balance volume](/docs/indicators/volume/obv): the running total of volume by the sign of the change.
- [MACD](/docs/indicators/oscillators/macd): the same gap with a signal line, on the price.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
