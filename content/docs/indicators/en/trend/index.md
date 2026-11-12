---
title: "Trend"
description: "Indicators of whether the market is trending and which way: the average directional index, the SuperTrend and the Ichimoku cloud."
order: 5
---

In the QTSurfer catalogues, the trend indicators are `adx`, `superTrend` and `ichimoku`: they say whether the market is trending, how strongly, and on which side the price stands. All three are pro indicators: they come with the Pro and Elite plans, a strategy brings them in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)), and they read whole bars, so they belong in a `kline` strategy.

- [ADX](/docs/indicators/trend/adx): how strong the trend is, whichever way it goes, with the two directional lines.
- [SuperTrend](/docs/indicators/trend/superTrend): a line that follows the price at a distance of a multiple of the average range, and flips when the price crosses it.
- [Ichimoku cloud](/docs/indicators/trend/ichimoku): the price against the middles of its own highs and lows over three periods.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
