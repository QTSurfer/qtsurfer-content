---
title: Parameter sweep
description: Evaluating a strategy across a defined grid of parameter combinations.
order: 6
kind: glossary
termId: parameter-sweep
lastUpdated: '2026-09-01T09:41:48Z'
aliases:
  - parameter sweeps
  - parameter grid
  - grid search
links:
  - label: QTSurfer parameter-sweep API guide
    href: /docs/developers/api/backtest_sweep
  - label: Backtesting
    href: /learn/glossary/backtesting
---

A parameter sweep runs the same strategy over multiple combinations of configurable values. It helps
identify sensitivity, stable regions and combinations worth investigating further.

Selecting only the best historical result invites overfitting. A useful sweep also considers nearby
results, sufficient trade counts and out-of-sample or walk-forward validation.
