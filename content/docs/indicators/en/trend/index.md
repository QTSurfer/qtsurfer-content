---
title: "Trend"
description: "Indicators of whether the market is trending and which way: the average directional index, the SuperTrend, the Ichimoku cloud and six more pro indicators."
order: 5
lastUpdated: '2026-11-14T12:16:29Z'
---

In the QTSurfer catalogues, the trend indicators are `adx`, `superTrend`, `ichimoku`, `aroon`, `chandeKrollStop`, `chandelierExit`, `efficiencyRatio`, `parabolicSar` and `vortex`: they say whether the market is trending, how strongly, and on which side the price stands. All of them are pro indicators: they come with the Pro and Elite plans, a strategy brings them in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)), and they read whole bars, so they belong in a `kline` strategy; the efficiency ratio is the exception and reads one price.

- [ADX](/docs/indicators/trend/adx): how strong the trend is, whichever way it goes, with the two directional lines.
- [SuperTrend](/docs/indicators/trend/superTrend): a line that follows the price at a distance of a multiple of the average range, and flips when the price crosses it.
- [Ichimoku cloud](/docs/indicators/trend/ichimoku): the price against the middles of its own highs and lows over three periods.
- [Aroon](/docs/indicators/trend/aroon): how long ago the highest high and the lowest low were, as two lines and their difference.
- [Vortex](/docs/indicators/trend/vortex): the upward movement against the downward one, as two lines around 1.
- [Efficiency ratio](/docs/indicators/trend/efficiencyRatio): the net move of the price against the sum of its moves, from 0 to 1. It reads one price.
- [Parabolic SAR](/docs/indicators/trend/parabolicSar), [Chandelier exit](/docs/indicators/trend/chandelierExit) and [Chande Kroll stop](/docs/indicators/trend/chandeKrollStop): three stops that follow the price and flip or ratchet with the trend.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
