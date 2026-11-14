---
title: "Volatility"
description: "Indicators of how much the price moves: the average true range, the standard deviation, the variance, the volatility indicators of the engine, the four OHLC estimators and six more pro indicators."
order: 4
lastUpdated: '2026-11-13T23:26:15Z'
---

In the QTSurfer catalogues, the volatility indicators are `atr`, `stdDev`, `variance`, `volatility` and `percentVolatility`, the four OHLC estimators `parkinson`, `garmanKlass`, `rogersSatchell` and `yangZhang`, and the pro indicators `natr`, `choppinessIndex`, `massIndex`, `ewmaVolatility`, `realizedVolatility` and `relativeVolatilityIndex`: measures of how much the price moves, or of how often. They answer different questions, and the units tell them apart: some are in the units of the price, one in its square, some in percent of the price and some per bar.

- [ATR](/docs/indicators/volatility/atr): how much the price moves in a bar, gaps included, in price units. It needs bars.
- [Standard deviation](/docs/indicators/volatility/stdDev): how spread out the last prices are, in price units.
- [Variance](/docs/indicators/volatility/variance): its square.
- [Volatility](/docs/indicators/volatility/volatility): how often the price changes, as a percentage of the updates.
- [Percent volatility](/docs/indicators/volatility/percentVolatility): the average size of the changes, as a percentage.
- [Parkinson](/docs/indicators/volatility/parkinson), [Garman-Klass](/docs/indicators/volatility/garmanKlass), [Rogers-Satchell](/docs/indicators/volatility/rogersSatchell) and [Yang-Zhang](/docs/indicators/volatility/yangZhang): four estimators of the volatility per bar from the open, high, low and close. Pro indicators that read whole bars.
- [NATR](/docs/indicators/volatility/natr): the ATR as a percentage of the close. A pro indicator that reads whole bars.
- [Choppiness index](/docs/indicators/volatility/choppinessIndex) and [mass index](/docs/indicators/volatility/massIndex): whether the market wanders, and whether the range is widening. Pro indicators that read whole bars.
- [EWMA volatility](/docs/indicators/volatility/ewmaVolatility) and [realized volatility](/docs/indicators/volatility/realizedVolatility): the volatility per bar from the log returns, with decaying or equal weights. Pro indicators that read one price.
- [Relative volatility index](/docs/indicators/volatility/relativeVolatilityIndex): the RSI idea applied to the standard deviation. A pro indicator that reads one price.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
