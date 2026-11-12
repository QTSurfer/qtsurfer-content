---
title: "Average directional index (ADX)"
description: "How the average directional index measures the strength of a trend, not its direction, with the two directional lines that say which side is stronger, and how to use it in a QTSurfer strategy."
order: 5.1
---

The **average directional index** (ADX), by J. Welles Wilder, measures how strong a trend is, whatever its direction, from 0 to 100. Two directional lines register beside it, `+DI` and `−DI`, and say which side is moving more.

Try it on a series below and change the period. The line in the accent colour is the ADX, the green one is `+DI` and the red one is `−DI`.

<div data-indicator-chart="adx"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The lines are computed in your browser by the engine's own indicator class, so they are the lines a strategy reads.

## What it computes

```text
+DM = rise of the high over the previous high     if it is larger than the fall of the low and positive, else 0
−DM = fall of the low under the previous low      if it is larger than the rise of the high and positive, else 0
+DI = 100 × smoothed(+DM) / smoothed(TR)
−DI = 100 × smoothed(−DM) / smoothed(TR)
DX  = 100 × |+DI − −DI| / (+DI + −DI)
ADX = smoothed(DX)
```

`TR` is the true range of the [ATR](/docs/indicators/volatility/atr) page. The smoothing is Wilder's: the first value of each of `TR`, `+DM` and `−DM` is the sum of the first `N`, and then each is the previous one less its `N`th part plus the new value. The ADX starts as the mean of the first `N` values of the `DX` and then takes `1 / N` of each new one. So the first value is on update `2N − 1`, and the chart draws from there. A price that does not move reads 0.

## Reading it

- **It says how strong the trend is, not which way.** A high ADX is a strong trend, up or down; a low one is a market without a trend. The directional lines say the side: `+DI` is above `−DI` when the rises weigh more, and `−DI` above `+DI` when the falls do.
- **On a price that only rises** the ADX reads 100, `+DI` reads 100 and `−DI` reads 0: the most trend there can be.
- **25 is a convention.** On the real series of the chart the ADX is at or above 25 between two fifths and three fifths of the time, so it is not a rare value.
- **It is slow.** It is a smoothing of a smoothing, so it needs `2N − 1` updates to start and it turns after the trend has begun.

## In a strategy

```
uses pro.adx
setup:
  adx(14)
```

`adx(14)` registers `adx14`, with the two directional lines beside it as `adx14PlusDI` and `adx14MinusDI`. In Java, `Pro.on(indicators).adx(14)`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

The period is a parameter, so a [parameter sweep](/learn/articles/parameter-sweep) can explore it, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [ATR](/docs/indicators/volatility/atr): the true range its smoothing starts from.
- [SuperTrend](/docs/indicators/trend/superTrend): another trend indicator, built on the average range.
- [Ichimoku cloud](/docs/indicators/trend/ichimoku): a trend indicator that reads the price against its own highs and lows.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
