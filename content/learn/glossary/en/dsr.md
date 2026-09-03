---
title: Deflated Sharpe ratio (DSR)
description: A confidence measure for a Sharpe ratio adjusted for multiple testing and non-normal returns.
order: 3
kind: glossary
termId: dsr
lastUpdated: '2026-09-03T16:10:49Z'
aliases:
  - DSR
  - deflated Sharpe
  - deflated Sharpe ratio
links:
  - label: Overfitting
    href: /learn/articles/overfitting
  - label: Sharpe ratio
    href: /learn/glossary/sharpe-ratio
  - label: Parameter sweep
    href: /learn/glossary/parameter-sweep
  - label: The Deflated Sharpe Ratio paper
    href: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551
---

The deflated Sharpe ratio estimates the confidence that an observed Sharpe ratio exceeds a benchmark
that accounts for the number and quality of the strategy trials considered. It also adjusts for the
sample length and for skewness and kurtosis in the returns.

DSR helps distinguish evidence of skill from a result that may have emerged because many alternatives
were tested and only the best one was reported. It does not repair a biased backtest or replace
out-of-sample validation; its inputs must describe the actual research process, including unsuccessful
trials.
