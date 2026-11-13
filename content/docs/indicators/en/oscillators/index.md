---
title: "Oscillators"
description: "Indicators that swing between levels or around a centre line instead of following the price: the RSI, the stochastic RSI, the MACD, the CCI and twenty pro oscillators."
order: 2
lastUpdated: '2026-11-13T21:28:19Z'
---

In the QTSurfer catalogues, the oscillators are `rsi`, `stochRsi`, `macd`, `cci` and twenty pro oscillators: indicators that swing between levels or around a centre line rather than follow the price. They are read against those levels, to judge whether a move has gone further than usual or whether its momentum is fading.

- [RSI](/docs/indicators/oscillators/rsi): relative strength, between 0 and 100.
- [Stochastic RSI](/docs/indicators/oscillators/stochRsi): where the RSI sits in its own recent range, between 0 and 100.
- [MACD](/docs/indicators/oscillators/macd): the gap between two exponential averages, with its signal line and its histogram.
- [CCI](/docs/indicators/oscillators/cci): how far the price is from its average, in units of the usual deviation.

**Pro oscillators that read one price**, which work in a `ticker` or a `kline` strategy:

- [Momentum](/docs/indicators/oscillators/momentum) and [rate of change](/docs/indicators/oscillators/roc): the change over `N` bars, in price units and as a percentage.
- [Chande momentum oscillator](/docs/indicators/oscillators/cmo): the gains against the losses of the last changes, from −100 to 100.
- [True strength index](/docs/indicators/oscillators/trueStrengthIndex) and [TRIX](/docs/indicators/oscillators/trix): double- and triple-smoothed momentum.
- [Coppock curve](/docs/indicators/oscillators/coppockCurve) and [know sure thing](/docs/indicators/oscillators/knowSureThing): smoothed rates of change added together.
- [Chande forecast oscillator](/docs/indicators/oscillators/chandeForecastOscillator) and [detrended price oscillator](/docs/indicators/oscillators/detrendedPriceOscillator): the price against its regression line, and a past price against the average.
- [Fisher transform](/docs/indicators/oscillators/fisherTransform) and [adaptive Fisher transform](/docs/indicators/oscillators/adaptiveFisherTransform): the price placed in its recent range, with the extremes stretched.
- [Connors RSI](/docs/indicators/oscillators/connorsRsi): the RSI of the price, the RSI of the streak and the percent rank of the latest return.

**Pro oscillators that read whole bars**, which belong in a `kline` strategy:

- [Stochastic oscillator](/docs/indicators/oscillators/stochasticOscillator) and [Williams %R](/docs/indicators/oscillators/williamsR): the close placed in the range of the last bars.
- [Ultimate oscillator](/docs/indicators/oscillators/ultimateOscillator): the buying pressure over three periods.
- [Awesome oscillator](/docs/indicators/oscillators/awesomeOscillator) and [accelerator oscillator](/docs/indicators/oscillators/acceleratorOscillator): the gap between two averages of the middle of each bar, and its change.
- [Balance of power](/docs/indicators/oscillators/balanceOfPower) and [relative vigor index](/docs/indicators/oscillators/relativeVigorIndex): the move from the open to the close against the range.
- [Bull and bear power](/docs/indicators/oscillators/bullBearPower): the high and the low of each bar against an exponential average of the close.

The catalogues have every oscillator with its forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
