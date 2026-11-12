---
title: "Double exponential moving average (DEMA)"
description: "How the double exponential moving average combines two exponential averages to cut the lag of one, what it costs in overshoot, and how to use it in a QTSurfer strategy."
order: 1.71
---

The **double exponential moving average** (DEMA), by Patrick Mulloy, combines two exponential averages to cut the lag of a single one. It is the two-average version of the [TEMA](/docs/indicators/averages/tema).

Try it on a series below and change the period.

<div data-indicator-chart="dema"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
EMA1 = EMA(price)
EMA2 = EMA(EMA1)
DEMA = 2 × EMA1 − EMA2        both over the same period
```

`EMA2` trails `EMA1` by about as much as `EMA1` trails the price, so subtracting it once more cancels that delay. The engine starts both averages on their first input, so the first bars of the line carry that start. It reports the DEMA ready after `N` updates, and the chart draws from there.

## Reading it

- **On a straight line it does not lag at all.** Once it has started it reads the price exactly, where an EMA of the same period trails it by `(N − 1) / 2` bars.
- **It pays for that in overshoot.** After a jump of 10 in the price the DEMA of period 20 reaches 111.2 before it settles at 110, 12 % beyond the move; after a fall of 10 it goes to 98.8. An EMA never passes the price.
- **It is closer to the price than an EMA of the same period, and jumpier.** On the daily BTC/USDT series of the chart, at period 20 its mean distance from the close is 2.5 % of the price against 3.8 % for the EMA, and its mean change from bar to bar is 0.58 % against 0.40 %.

## In a strategy

```
uses pro.dema
setup:
  dema(20)
```

`dema(20)` registers `dema20`. In Java the class is `DemaRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.averages.pro`, and a group takes it with `indicators.add("dema20", new DemaRTIndicator(20))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads one price, the last price of a ticker or the close of a kline, so it works in either kind of strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Triple exponential moving average](/docs/indicators/averages/tema): the same idea with three averages: less lag still, more overshoot.
- [Exponential moving average](/docs/indicators/averages/ema): the single exponential average it is built from.
- [Hull moving average](/docs/indicators/averages/hma): another average built to cut the lag, from weighted averages.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
