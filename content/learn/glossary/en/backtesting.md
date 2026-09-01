---
title: Backtesting
description: Testing a strategy against historical market data before risking live capital.
order: 1
kind: glossary
termId: backtesting
lastUpdated: "2026-09-01T09:29:22Z"
aliases:
  - backtest
  - backtests
  - historical simulation
links:
  - label: Learn about backtesting
    href: /learn/articles/backtesting
  - label: QTSurfer backtest API guide
    href: /docs/developers/api/backtest_execute
  - label: Backtesting on Wikipedia
    href: https://en.wikipedia.org/wiki/Backtesting
---

Backtesting is the execution of a trading strategy against historical market data to estimate how it
would have behaved under a defined set of assumptions. A result depends on the selected instruments,
period, data resolution, fees, capital and execution model.

A backtest is evidence about a model under past conditions, not a forecast. Look-ahead bias,
overfitting, missing costs and poor-quality data can make results appear stronger than they are.
