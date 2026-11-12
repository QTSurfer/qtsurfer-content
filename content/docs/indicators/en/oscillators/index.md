---
title: "Oscillators"
description: "Indicators that swing between levels or around a centre line instead of following the price: the RSI, the stochastic RSI, the MACD, the CCI and ten pro oscillators."
order: 2
lastUpdated: '2026-11-12T21:21:22Z'
---

In the QTSurfer catalogues, the oscillators are `rsi`, `stochRsi`, `macd`, `cci` and the pro oscillators `momentum`, `roc`, `cmo`, `trueStrengthIndex`, `trix`, `coppockCurve`, `knowSureThing`, `chandeForecastOscillator`, `detrendedPriceOscillator` and `fisherTransform`: indicators that swing between levels or around a centre line rather than follow the price. They are read against those levels, to judge whether a move has gone further than usual or whether its momentum is fading.

- [RSI](/docs/indicators/oscillators/rsi): relative strength, between 0 and 100.
- [Stochastic RSI](/docs/indicators/oscillators/stochRsi): where the RSI sits in its own recent range, between 0 and 100.
- [MACD](/docs/indicators/oscillators/macd): the gap between two exponential averages, with its signal line and its histogram.
- [CCI](/docs/indicators/oscillators/cci): how far the price is from its average, in units of the usual deviation.
- [Momentum](/docs/indicators/oscillators/momentum) and [rate of change](/docs/indicators/oscillators/roc): the change over `N` bars, in price units and as a percentage. Pro indicators.
- [Chande momentum oscillator](/docs/indicators/oscillators/cmo): the gains against the losses of the last changes, from −100 to 100. A pro indicator.
- [True strength index](/docs/indicators/oscillators/trueStrengthIndex) and [TRIX](/docs/indicators/oscillators/trix): double- and triple-smoothed momentum. Pro indicators.
- [Coppock curve](/docs/indicators/oscillators/coppockCurve) and [know sure thing](/docs/indicators/oscillators/knowSureThing): smoothed rates of change added together. Pro indicators.
- [Chande forecast oscillator](/docs/indicators/oscillators/chandeForecastOscillator) and [detrended price oscillator](/docs/indicators/oscillators/detrendedPriceOscillator): the price against its regression line, and a past price against the average. Pro indicators.
- [Fisher transform](/docs/indicators/oscillators/fisherTransform): the price placed in its recent range, with the extremes stretched. A pro indicator.

The pro oscillators here read one price, so they work in a `ticker` or a `kline` strategy.

The catalogues have every oscillator with its forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
