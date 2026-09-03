---
title: Probability of backtest overfitting (PBO)
description: An estimate of how likely an in-sample strategy selection is to underperform out of sample.
order: 7
kind: glossary
termId: pbo
lastUpdated: '2026-09-01T09:41:48Z'
aliases:
  - PBO
  - probability of backtest overfitting
  - backtest overfitting probability
links:
  - label: Overfitting
    href: /learn/articles/overfitting
  - label: Backtesting
    href: /learn/glossary/backtesting
  - label: Parameter sweep
    href: /learn/glossary/parameter-sweep
  - label: The Probability of Backtest Overfitting paper
    href: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2326253
---

The probability of backtest overfitting estimates how often the strategy selected as best in one part
of a historical sample would perform relatively poorly in the complementary, unseen part. The proposed
method uses combinatorially symmetric cross-validation (CSCV) across a set of candidate strategies or
parameter configurations.

A high PBO warns that selection may be exploiting noise rather than finding a repeatable edge. The
estimate applies to the full selection exercise, so omitting discarded configurations or repeatedly
reusing the same data can make the reported result misleading.
