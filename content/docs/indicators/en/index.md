---
id: indicators
title: Indicators
description: "How each QTSurfer indicator works, with a chart you can change: what it computes, how its parameters shape it, and how to use it in a strategy."
order: 0
lastUpdated: '2026-11-12T21:10:07Z'
---

An indicator turns a price series into a number a strategy can act on: a trend, a momentum, a volatility. Each page here
explains one indicator and runs it, in your browser, on a series you choose, with the same indicator class the engine
runs. Change its parameters and watch the line change.

The pages are grouped as the catalogues group the indicators:

- [Averages](/docs/indicators/averages): the [SMA](/docs/indicators/averages/sma), [EMA](/docs/indicators/averages/ema),
  [WMA](/docs/indicators/averages/wma), [TEMA](/docs/indicators/averages/tema), [HMA](/docs/indicators/averages/hma),
  [MMA](/docs/indicators/averages/mma) and [KAMA](/docs/indicators/averages/kama), and five pro averages: the
  [DEMA](/docs/indicators/averages/dema), [ALMA](/docs/indicators/averages/alma),
  [FRAMA](/docs/indicators/averages/frama), [LSMA](/docs/indicators/averages/leastSquaresMovingAverage) and
  [McGinley Dynamic](/docs/indicators/averages/mcGinleyDynamic).
- [Oscillators](/docs/indicators/oscillators): the [RSI](/docs/indicators/oscillators/rsi),
  the [stochastic RSI](/docs/indicators/oscillators/stochRsi), the [MACD](/docs/indicators/oscillators/macd) and
  the [CCI](/docs/indicators/oscillators/cci).
- [Bands](/docs/indicators/bands): the [Bollinger bands](/docs/indicators/bands/bollinger), their
  [%B](/docs/indicators/bands/bollingerPercentB) and their [bandwidth](/docs/indicators/bands/bollingerBandwidth).
- [Volatility](/docs/indicators/volatility): the [ATR](/docs/indicators/volatility/atr),
  the [standard deviation](/docs/indicators/volatility/stdDev), the [variance](/docs/indicators/volatility/variance),
  the [volatility](/docs/indicators/volatility/volatility), the
  [percent volatility](/docs/indicators/volatility/percentVolatility) and four pro estimators: the
  [Parkinson](/docs/indicators/volatility/parkinson), [Garman-Klass](/docs/indicators/volatility/garmanKlass),
  [Rogers-Satchell](/docs/indicators/volatility/rogersSatchell) and [Yang-Zhang](/docs/indicators/volatility/yangZhang) volatilities.
- [Trend](/docs/indicators/trend): the pro indicators [ADX](/docs/indicators/trend/adx),
  [SuperTrend](/docs/indicators/trend/superTrend) and [Ichimoku cloud](/docs/indicators/trend/ichimoku).
- [Volume](/docs/indicators/volume): the pro indicators [OBV](/docs/indicators/volume/obv),
  [VWAP](/docs/indicators/volume/vwap), [MFI](/docs/indicators/volume/mfi) and [CMF](/docs/indicators/volume/cmf).
- [Statistics](/docs/indicators/statistics): the pro indicators [exact variance](/docs/indicators/statistics/exactVariance),
  [exact standard deviation](/docs/indicators/statistics/exactStdDev), [z-score](/docs/indicators/statistics/zScore),
  [skewness](/docs/indicators/statistics/skewness), [kurtosis](/docs/indicators/statistics/kurtosis), [linear regression slope](/docs/indicators/statistics/linearRegressionSlope),
  [simple linear regression](/docs/indicators/statistics/simpleLinearRegression),
  [rolling percentile](/docs/indicators/statistics/rollingPercentile), [value at risk](/docs/indicators/statistics/valueAtRisk),
  [autocorrelation](/docs/indicators/statistics/autocorrelation) and [Hurst exponent](/docs/indicators/statistics/hurstExponent).
- [Risk and performance](/docs/indicators/risk): the pro indicators [Sharpe ratio](/docs/indicators/risk/sharpeRatio),
  [Sortino ratio](/docs/indicators/risk/sortinoRatio), [omega ratio](/docs/indicators/risk/omegaRatio),
  [Calmar ratio](/docs/indicators/risk/calmarRatio), [maximum drawdown](/docs/indicators/risk/maxDrawdown),
  [Ulcer index](/docs/indicators/risk/ulcerIndex) and [tail ratio](/docs/indicators/risk/tailRatio).

For every indicator a strategy can call, with its forms and the names it registers, see the catalogues:
[QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).

## Try any indicator

Pick an indicator, a series and its parameters. The chart draws what the engine computes, over the price or in a pane of
its own, under the names a strategy reads it by, and shows the `setup:` line of a QTScript strategy that makes the same
call. It draws and does not interpret: for how an indicator is read, with its levels and its signals, see its page where
there is one, such as the [RSI](/docs/indicators/oscillators/rsi).

<div data-indicator-chart="any"></div>

An indicator that reads whole bars, such as the ATR, belongs on a kline series: a ticker carries the exchange's statistics
over a window and not a bar's, so on a ticker series the line is computed from those, it does not mean what the name of
the indicator says, and the chart says so.

The charts run on sample series, all of them with open, high, low, close and volume: synthetic ones, with the shape of a
ticker or of a kline, and real crypto ones in several timeframes. They show how an indicator behaves. They are not the result of a strategy.
