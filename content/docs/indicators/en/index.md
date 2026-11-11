---
id: indicators
title: Indicators
description: "How each QTSurfer indicator works, with a chart you can change: what it computes, how its parameters shape it, and how to use it in a strategy."
order: 0
lastUpdated: '2026-11-11T21:04:22Z'
---

An indicator turns a price series into a number a strategy can act on: a trend, a momentum, a volatility. Each page here
explains one indicator and runs it, in your browser, on a series you choose, with the same indicator class the engine
runs. Change its parameters and watch the line change.

The pages are grouped as the catalogues group the indicators:

- [Oscillators](/docs/indicators/oscillators): the [RSI](/docs/indicators/oscillators/rsi) and the
  [MACD](/docs/indicators/oscillators/macd), so far.
- [Bands](/docs/indicators/bands): the [Bollinger bands](/docs/indicators/bands/bollinger), so far.

More indicators will follow. For every indicator a strategy can call, with its forms and the names it registers, see the
catalogues: [QTScript indicators](/docs/strategies/qtscript/indicators) and
[Java indicators](/docs/strategies/java/indicators).

## Try any indicator

Pick an indicator, a series and its parameters. The chart draws what the engine computes, over the price or in a pane of
its own, under the names a strategy reads it by, and shows the `setup:` line of a QTScript strategy that makes the same
call. It draws and does not interpret: for how an indicator is read, with its levels and its signals, see its page where
there is one, such as the [RSI](/docs/indicators/oscillators/rsi).

<div data-indicator-chart="any"></div>

An indicator that reads whole bars, such as the ATR, needs a kline series: a ticker carries a price and nothing else, and
the chart says so.

The charts run on sample series: synthetic ones, with the shape of a ticker or of a kline, and real crypto ones in
several timeframes. They show how an indicator behaves. They are not the result of a strategy.
