---
title: "Normalized average true range (NATR)"
description: "How the normalized average true range gives the average true range as a percentage of the close, so that it compares between instruments and prices, and how to use it in a QTSurfer strategy."
order: 4.91
---

The **normalized average true range** (NATR) is the [average true range](/docs/indicators/volatility/atr) as a percentage of the close, so that it compares between instruments and between price levels.

Try it on a series below and change the period.

<div data-indicator-chart="natr"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
NATR = 100 × ATR(N) / close
```

The ATR is the engine's, the one of its page. A close of 0 gives 0. The first value is on update `N`, and the chart draws from there.

## Reading it

- **It is a percentage of the price**, so a 3 reads the same in any instrument: the average bar moves 3 % of the close.
- **On the real series of the chart**, at period 20, it goes from 2.1 % to 5.9 % on the daily BTC/USDT, from 0.24 % to 0.86 % on the hourly one and from 0.17 % to 0.77 % on the 15-minute ETH/USDT: the timeframe sets the scale.
- **It moves with the price as well as with the range**: a rising price lowers the NATR even if the ATR does not change.

## In a strategy

```
uses pro.natr
setup:
  natr(20)
```

`natr(20)` registers `natr20`. In Java the class is `NatrRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.volatility.pro`, and a group takes it with `indicators.add("natr20", new NatrRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [ATR](/docs/indicators/volatility/atr): the same range, in price units.
- [Percent volatility](/docs/indicators/volatility/percentVolatility): the average size of the changes, as a percentage.
- [Yang-Zhang volatility](/docs/indicators/volatility/yangZhang): a volatility per bar from the open, high, low and close.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
