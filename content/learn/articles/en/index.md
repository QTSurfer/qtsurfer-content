---
id: learn-index
title: Learn quantitative strategy concepts
description: Practical explanations of backtesting, bias, risk, and strategy evaluation, connected to reproducible QTSurfer workflows.
order: 0
kind: landing
author: QTSurfer
datePublished: "2026-08-31"
lastUpdated: '2026-09-03T18:29:00Z'
---

Building a strategy is only part of quantitative trading. You also need to understand what an
experiment measures, which assumptions shaped the result, and how apparently strong performance can
mislead you.

Learn provides practical explanations of the concepts behind QTSurfer. Each article connects the idea
to a reproducible workflow rather than stopping at a dictionary definition.

## Start here

- [Quantitative strategy](quantitative-strategy) — what makes a strategy quantitative, its five
  components, and the research loop from hypothesis to validation.
- [Backtesting](backtesting) — what a historical simulation can tell you, what it cannot, and which
  assumptions must travel with every result.
- [Look-ahead bias](look-ahead-bias) — how future information can leak into a strategy and make a
  backtest impossible to reproduce in live trading.
- [Overfitting](overfitting) — why the best result of a search is biased, and how to measure how
  much of it the search itself produced.
- [Survivorship bias](survivorship-bias) — how the universe, the catalogue, and the published record
  quietly exclude the failures.

## Reading a result

- [Equity curve](equity-curve) — what the account-value series records, how to normalise it, and
  which shapes signal fragility.
- [Drawdown](drawdown) — the fall from a previous peak, its depth and duration, and why it changes
  how a return should be read.
- [Sharpe ratio](sharpe-ratio) — return per unit of variability, the conventions that make two
  values comparable, and exactly how QTSurfer computes it.
- [Slippage](slippage) — the cost between the decided and the obtained price, and how to account
  for it in a backtest.

## Exploring parameters

- [Parameter sweep](parameter-sweep) — grid, random, and Latin hypercube sampling, leaderboards,
  plateaus, and sensitivity views.
- [Walk-forward analysis](walk-forward-analysis) — sequential out-of-sample validation of a sweep
  and what parameter drift reveals.

## Strategies

- [EMA crossover](ema-crossover) — the reference trend-following rule: lag, whipsaw, useful
  filters, and how to implement and sweep it.
- [Strategy revision](strategy-revision) — immutable versions of a strategy's code, and why every
  result should point at one.
- [Algorithmic trading](algorithmic-trading) — from decision to order: what a trading system needs
  beyond the signal, and the backtest-to-live gap.

## Data

- [Historical market data](historical-market-data) — tickers versus candles, cadence, coverage and
  gaps, and how QTSurfer stores and serves exchange history.
