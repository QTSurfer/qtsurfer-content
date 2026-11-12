---
title: "Statistics"
description: "Statistics of the price and of its returns: the exact variance and deviation, the z-score, the kurtosis, the regression, the percentile, the value at risk, the autocorrelation and the Hurst exponent."
order: 7
lastUpdated: '2026-11-12T18:54:41Z'
---

In the QTSurfer catalogues, the statistics are `exactVariance`, `exactStdDev`, `zScore`, `kurtosis`, `linearRegressionSlope`, `simpleLinearRegression`, `rollingPercentile`, `valueAtRisk`, `autocorrelation` and `hurstExponent`: they describe how the last prices, or the last returns, are spread and shaped. All of them are pro indicators: they come with the Pro and Elite plans, and a strategy brings them in with a `uses` line. They read one price, so they work in a `ticker` or a `kline` strategy.

- [Exact variance](/docs/indicators/statistics/exactVariance) and [exact standard deviation](/docs/indicators/statistics/exactStdDev): the spread of the last prices, dividing by `N` where the free ones divide by `N − 1`.
- [Z-score](/docs/indicators/statistics/zScore): how many deviations the latest price is from the mean of the window.
- [Kurtosis](/docs/indicators/statistics/kurtosis): how heavy the tails of the window are, against a normal distribution.
- [Linear regression slope](/docs/indicators/statistics/linearRegressionSlope) and [simple linear regression](/docs/indicators/statistics/simpleLinearRegression): the straight line that best fits the window, and how well it fits.
- [Rolling percentile](/docs/indicators/statistics/rollingPercentile): the price below which a share of the window lies, with its median, minimum and maximum.
- [Value at risk](/docs/indicators/statistics/valueAtRisk): the loss a bar is not expected to exceed, if the returns were normal.
- [Autocorrelation](/docs/indicators/statistics/autocorrelation) and [Hurst exponent](/docs/indicators/statistics/hurstExponent): whether the returns continue or reverse.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
