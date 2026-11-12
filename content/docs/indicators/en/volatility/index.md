---
title: "Volatility"
description: "Indicators of how much the price moves: the average true range, the standard deviation, the variance, the volatility indicators of the engine, and the four OHLC estimators."
order: 4
lastUpdated: '2026-11-12T13:54:17Z'
---

In the QTSurfer catalogues, the volatility indicators are `atr`, `stdDev`, `variance`, `volatility` and `percentVolatility`, and the four OHLC estimators `parkinson`, `garmanKlass`, `rogersSatchell` and `yangZhang`: measures of how much the price moves, or of how often. They answer different questions, and the units tell them apart: some are in the units of the price, one in its square, two in percent, and the estimators are a fraction of the price per bar.

- [ATR](/docs/indicators/volatility/atr): how much the price moves in a bar, gaps included, in price units. It needs bars.
- [Standard deviation](/docs/indicators/volatility/stdDev): how spread out the last prices are, in price units.
- [Variance](/docs/indicators/volatility/variance): its square.
- [Volatility](/docs/indicators/volatility/volatility): how often the price changes, as a percentage of the updates.
- [Percent volatility](/docs/indicators/volatility/percentVolatility): the average size of the changes, as a percentage.
- [Parkinson](/docs/indicators/volatility/parkinson), [Garman-Klass](/docs/indicators/volatility/garmanKlass), [Rogers-Satchell](/docs/indicators/volatility/rogersSatchell) and [Yang-Zhang](/docs/indicators/volatility/yangZhang): four estimators of the volatility per bar from the open, high, low and close. They are pro indicators: they come with the Pro and Elite plans and read whole bars.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
