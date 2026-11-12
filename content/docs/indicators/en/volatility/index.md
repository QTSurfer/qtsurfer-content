---
title: "Volatility"
description: "Indicators of how much the price moves: the average true range, the standard deviation, the variance, and the volatility indicators of the engine."
order: 4
---

In the QTSurfer catalogues, the volatility indicators are `atr`, `stdDev`, `variance`, `volatility` and `percentVolatility`: measures of how much the price moves, or of how often. They answer different questions, and the units tell them apart: some are in the units of the price, one in its square, and two in percent.

- [ATR](/docs/indicators/volatility/atr): how much the price moves in a bar, gaps included, in price units. It needs bars.
- [Standard deviation](/docs/indicators/volatility/stdDev): how spread out the last prices are, in price units.
- [Variance](/docs/indicators/volatility/variance): its square.
- [Volatility](/docs/indicators/volatility/volatility): how often the price changes, as a percentage of the updates.
- [Percent volatility](/docs/indicators/volatility/percentVolatility): the average size of the changes, as a percentage.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
