---
title: "Ease of movement (EMV)"
description: "How the ease of movement says how easily the price moves for the volume it takes, averaging the move of the middle of each bar over its volume per unit of range, and how to use it in a QTSurfer strategy."
order: 6.43
---

The **ease of movement** (EMV), by Richard Arms, says how easily the price moves for the volume it takes: it divides the move of the middle of each bar by its volume per unit of range, and averages the last `N` values.

Try it on a series below and change the period.

<div data-indicator-chart="easeOfMovement"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
distance = (high + low) / 2 − (previous high + previous low) / 2
box      = volume / 10000 / (high − low)
EMV₁     = distance / box
EMV      = mean of the last N values of EMV₁
```

A bar with no range or no volume counts as 0. The first value is on update `N + 1`, and the chart draws from there. The volume is the one of the bars of the series; the real ones carry the exchange's volume.

## Reading it

- **Positive says the price rose easily, negative that it fell easily**, and near 0 that it took a lot of volume to move it. On the real series of the chart it is positive on 34 % to 57 % of the bars.
- **Its scale depends on the volume unit and on the price**, so a threshold does not carry between instruments: it goes from −2,544,468 to 1,657,504 on the daily BTC/USDT and from −221 to 92 on the 15-minute ETH/USDT.
- **The divisor 10,000 is the engine's**: it only rescales.

## In a strategy

```
uses pro.easeOfMovement
setup:
  easeOfMovement(14)
```

`easeOfMovement(14)` registers `eom14`. In Java the class is `EaseOfMovementRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.volume.pro`, and a group takes it with `indicators.add("eom14", new EaseOfMovementRTIndicator(14))`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [On-balance volume](/docs/indicators/volume/obv): the volume added or subtracted by the sign of the change.
- [Money flow index](/docs/indicators/volume/mfi): the volume-weighted RSI, between 0 and 100.
- [ATR](/docs/indicators/volatility/atr): how much a bar moves, without the volume.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
