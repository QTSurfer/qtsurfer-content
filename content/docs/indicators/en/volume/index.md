---
title: "Volume"
description: "Indicators that read the volume traded: the on-balance volume, the volume-weighted average price, the money flow index and the Chaikin money flow."
order: 6
---

In the QTSurfer catalogues, the volume indicators are `obv`, `vwap`, `mfi` and `cmf`: they weigh or split what happens to the price by the volume traded. All four are pro indicators: they come with the Pro and Elite plans, a strategy brings them in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)), and they read whole bars, so they belong in a `kline` strategy. The sample series of the charts carry volume, in the klines and in the tickers alike.

- [OBV](/docs/indicators/volume/obv): a running total of volume, added when the close rises and subtracted when it falls.
- [VWAP](/docs/indicators/volume/vwap): the average price paid since the series began, weighted by volume; it never resets.
- [MFI](/docs/indicators/volume/mfi): an RSI that counts money instead of price, from 0 to 100.
- [CMF](/docs/indicators/volume/cmf): how the volume splits between buying and selling, from where each bar closes in its range, from −1 to 1.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
