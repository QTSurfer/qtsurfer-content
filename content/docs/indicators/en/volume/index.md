---
title: "Volume"
description: "Indicators that read the volume traded: the on-balance volume, the volume-weighted average price, the money flow index, the Chaikin money flow and seven more pro indicators."
order: 6
---

In the QTSurfer catalogues, the volume indicators are `obv`, `vwap`, `mfi`, `cmf`, `adl`, `chaikinOscillator`, `easeOfMovement`, `elderForceIndex`, `klingerOscillator`, `negativeVolumeIndex` and `pvt`: they weigh or split what happens to the price by the volume traded. All of them are pro indicators: they come with the Pro and Elite plans, a strategy brings them in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)), and they read whole bars, so they belong in a `kline` strategy. The sample series of the charts carry volume, in the klines and in the tickers alike.

- [OBV](/docs/indicators/volume/obv): a running total of volume, added when the close rises and subtracted when it falls.
- [VWAP](/docs/indicators/volume/vwap): the average price paid since the series began, weighted by volume; it never resets.
- [MFI](/docs/indicators/volume/mfi): an RSI that counts money instead of price, from 0 to 100.
- [CMF](/docs/indicators/volume/cmf): how the volume splits between buying and selling, from where each bar closes in its range, from −1 to 1.
- [ADL](/docs/indicators/volume/adl) and [Chaikin oscillator](/docs/indicators/volume/chaikinOscillator): the running total of that split, and the gap between two averages of it.
- [Ease of movement](/docs/indicators/volume/easeOfMovement): how easily the price moves for the volume it takes.
- [Elder force index](/docs/indicators/volume/elderForceIndex): the change of the close times the volume, smoothed.
- [Klinger oscillator](/docs/indicators/volume/klingerOscillator): the gap between two averages of a volume force that follows the trend, with its signal.
- [Negative volume index](/docs/indicators/volume/negativeVolumeIndex) and [price volume trend](/docs/indicators/volume/pvt): running totals weighted by the percentage change of the close.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
