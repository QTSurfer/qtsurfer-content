---
title: "Keltner channel"
description: "How the Keltner channel draws two lines at a multiple of the average true range above and below an exponential average of the close, and how to use it in a QTSurfer strategy."
order: 3.43
---

The **Keltner channel**, by Chester Keltner and in the version of Linda Raschke, draws two lines at a multiple of the [average true range](/docs/indicators/volatility/atr) above and below an exponential average of the close, so its width follows the volatility.

Try it on a series below and change the two periods and the multiplier.

<div data-indicator-chart="keltnerChannel"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
middle = EMA(close, emaPeriod)
upper  = middle + multiplier × ATR(atrPeriod)
lower  = middle − multiplier × ATR(atrPeriod)
```

The defaults are 20, 10 and 1.5. The engine rejects a negative multiplier when it builds the indicator. The main line it registers is the middle. The first value is on update `emaPeriod`, and the chart draws from there.

## Reading it

- **The width follows the volatility.** On the real series of the chart, with the defaults, the close is outside the channel on 25 % of the bars of the daily BTC/USDT, 20 % of the hourly one and 19 % of the 15-minute ETH/USDT: a far steadier share than the fixed percentage of the [envelopes](/docs/indicators/bands/envelopes) gives.
- **It is narrower than the Bollinger bands in a calm market and wider in a wild one**, because it measures the bar's range, not the spread of the closes.
- **The multiplier is the one number to tune**: a larger one widens the channel and cuts the share of closes outside it.

## In a strategy

```
uses pro.keltnerChannel
setup:
  keltnerChannel(20, 10, 1.5)
```

`keltnerChannel(20, 10, 1.5)` registers `kc20_10_1.5`, with `kc20_10_1.5Upper` and `kc20_10_1.5Lower` beside it. Its default id has a dot, so when a `window` has to refer to it, give it a name: `keltnerChannel("k", 20, 10, 1.5)`. In Java the class is `KeltnerChannelRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.volatility.pro`, and a group takes it with `indicators.add("kc20_10_1.5", new KeltnerChannelRTIndicator(20, 10, 1.5))`.

The two periods and the multiplier are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [ATR](/docs/indicators/volatility/atr): the range the width is a multiple of.
- [Bollinger bands](/docs/indicators/bands/bollinger): a band from the deviation of the closes.
- [Envelopes](/docs/indicators/bands/envelopes): a fixed percentage instead of the range.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
