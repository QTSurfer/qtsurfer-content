---
title: "Ichimoku cloud"
description: "How the Ichimoku cloud reads the price against the middles of its own highest highs and lowest lows over three periods, why the engine's lines are not displaced, and how to use it in a QTSurfer strategy."
order: 5.3
---

The **Ichimoku cloud** (Ichimoku Kinko Hyo), devised by Goichi Hosoda, reads the price against the middles of its own highest highs and lowest lows over three periods. Five lines register: Tenkan, Kijun, Senkou A, Senkou B and Chikou. The space between Senkou A and Senkou B is the cloud.

Try it on a series below and change the three periods. The line in the accent colour is the Tenkan, the grey one is the Kijun, and the green and red ones are Senkou A and Senkou B, the two edges of the cloud.

<div data-indicator-chart="ichimoku"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
Tenkan   = (highest high + lowest low) / 2     over 9 bars
Kijun    = (highest high + lowest low) / 2     over 26 bars
Senkou A = (Tenkan + Kijun) / 2
Senkou B = (highest high + lowest low) / 2     over 52 bars
Chikou   = the close
```

The three periods are 9, 26 and 52 by default. **None of the lines is displaced.** The textbook plots Senkou A and Senkou B 26 bars ahead of the price and the Chikou line 26 bars behind it; the engine gives the value for the current bar, and that is what a strategy compares. So the cloud of a textbook chart, the one computed 26 bars ago, is not the pair of Senkou lines read now.

The first value is on update 52, the longest period, and the chart draws from there. The chart leaves the Chikou line out, since it is the close that the candles already show.

## Reading it

- **Tenkan is the fast line and Senkou B the slow one.** On a straight rise the Tenkan trails the price by 4 bars, the Kijun by 12.5, Senkou A by 8.25 and Senkou B by 25.5.
- **The cloud is the gap between Senkou A and Senkou B.** A price above both lines is above the cloud, a price below both is under it, and a price between them is inside it. Remember that the lines are the ones of the current bar.
- **The Tenkan crossing the Kijun** is the usual signal of a change in the short-term direction, and it is read against where the price stands relative to the cloud.

## In a strategy

```
uses pro.ichimoku
setup:
  ichimoku(9, 26, 52)
```

`ichimoku(9, 26, 52)` registers `ichi9_26_52`, the Tenkan line, with `ichi9_26_52Kijun`, `ichi9_26_52SenkouA`, `ichi9_26_52SenkouB` and `ichi9_26_52Chikou` beside it; `ichimoku()` takes 9, 26 and 52. In Java, `Pro.on(indicators).ichimoku()`.

The three periods are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [Average directional index](/docs/indicators/trend/adx): how strong the trend is, whichever side it is on.
- [SuperTrend](/docs/indicators/trend/superTrend): a single line that follows the price and flips when it is crossed.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
