---
title: "Envelopes"
description: "How the envelopes draw two lines at a fixed percentage above and below an exponential average, why a fixed percentage fits one volatility only, and how to use them in a QTSurfer strategy."
order: 3.42
---

The **envelopes** draw two lines at a fixed percentage above and below an exponential average of the price.

Try it on a series below and change the period and the percentage.

<div data-indicator-chart="envelopes"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
middle = EMA(price, N)
upper  = middle × (1 + p / 100)
lower  = middle × (1 − p / 100)
```

`N` is 20 and `p` 2.5 by default. The engine rejects a negative percentage when it builds the indicator. The main line it registers is the middle. The first value is on update `N`, and the chart draws from there.

## Reading it

- **A fixed percentage fits one volatility only.** At 2.5 % the close is outside the envelopes on 53 % of the bars of the daily BTC/USDT, and on 4 % of the hourly one and 2 % of the 15-minute ETH/USDT: the same number is a tight band on one series and a wide one on another.
- **The width does not adapt**: it is the same in a calm market as in a wild one. For a band that does, see the [Keltner channel](/docs/indicators/bands/keltnerChannel) and the [Bollinger bands](/docs/indicators/bands/bollinger).
- **A price that does not move gives 102.5 and 97.5 around 100** at the defaults.

## In a strategy

```
uses pro.envelopes
setup:
  envelopes(20, 2.5)
```

`envelopes(20, 2.5)` registers `env20_2.5`, with `env20_2.5Upper` and `env20_2.5Lower` beside it. Its default id has a dot, so when a `window` has to refer to it, give it a name: `envelopes("e", 20, 2.5)`. In Java the class is `EnvelopesRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.averages.pro`, and a group takes it with `indicators.add("env20_2.5", new EnvelopesRTIndicator(20, 2.5))`.

The period and the percentage are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

## Related

- [Exponential moving average](/docs/indicators/averages/ema): the average the envelopes are drawn around.
- [Keltner channel](/docs/indicators/bands/keltnerChannel): the same idea with a width that follows the average range.
- [Bollinger bands](/docs/indicators/bands/bollinger): the same idea with a width from the deviation.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
