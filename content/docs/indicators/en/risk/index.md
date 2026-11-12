---
title: "Risk and performance"
description: "Risk and performance of the price: the Sharpe, Sortino, omega, Calmar and tail ratios, the maximum drawdown and the Ulcer index."
order: 8
lastUpdated: '2026-11-12T20:44:51Z'
---

In the QTSurfer catalogues, the risk indicators are `sharpeRatio`, `sortinoRatio`, `omegaRatio`, `calmarRatio`, `maxDrawdown`, `ulcerIndex` and `tailRatio`: they weigh what the price returns against what it risks. All of them are pro indicators: they come with the Pro and Elite plans, and a strategy brings them in with a `uses` line. They read one price, so they work in a `ticker` or a `kline` strategy. Most are built from the log returns of the last `N` bars, and they are per bar, not annualized, except the Calmar ratio, whose default factor is for daily bars.

- [Sharpe ratio](/docs/indicators/risk/sharpeRatio): the mean return over how much the returns vary.
- [Sortino ratio](/docs/indicators/risk/sortinoRatio): the mean return over the deviation of the returns below a target.
- [Omega ratio](/docs/indicators/risk/omegaRatio): the sum of the gains over the sum of the losses.
- [Calmar ratio](/docs/indicators/risk/calmarRatio): the annualized return over the largest drawdown of the window.
- [Maximum drawdown](/docs/indicators/risk/maxDrawdown): the largest fall from a peak since the start, as a fraction of the peak.
- [Ulcer index](/docs/indicators/risk/ulcerIndex): the depth and duration of the drawdowns of the window.
- [Tail ratio](/docs/indicators/risk/tailRatio): the right tail of the returns against the left one.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
