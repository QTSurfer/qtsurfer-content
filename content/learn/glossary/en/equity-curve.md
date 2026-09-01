---
title: Equity curve
description: A time series showing how the value of a strategy or account changes.
order: 5
kind: glossary
termId: equity-curve
lastUpdated: "2026-09-01T09:36:12Z"
aliases:
  - equity curves
  - account value curve
links:
  - label: QTSurfer equity-curve API guide
    href: /docs/developers/api/equity_curves
  - label: Drawdown
    href: /learn/glossary/drawdown
---

An equity curve is a time series of account or strategy value. In a backtest it normally starts at the
configured initial capital and changes as simulated positions produce profits, losses and costs.

![Illustrative equity curve normalized to starting capital, rising to +18.3% with an intervening drawdown](/img/docs/equity-curve.svg)

Its shape reveals information hidden by a final return, including volatility, flat periods, drawdowns
and whether performance depends on a small number of events.
