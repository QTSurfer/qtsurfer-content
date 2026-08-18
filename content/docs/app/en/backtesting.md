---
title: Backtesting
description: Market vs. simulated backtests, and how to create your first one.
order: 3
lastUpdated: '2026-08-18T20:02:23+02:00'
---

A backtest runs a strategy revision against historical data and reports how it would have
performed. QTSurfer has two kinds:

- **Market backtests** — a strategy run against real historical data from a real exchange.
  This is the standard, and the one this page walks through.
- **Simulated backtests** — a more advanced variant built for parameter sweeps: you define
  a reduced sweep, run it, then submit a **refinement** to narrow it further inside the
  same simulated backtest as a new phase. Reach for these once you're optimizing an
  existing strategy rather than validating a new one.

## Create your first backtest

Open **Backtesting → New**. The flow is a six-step wizard; each step must be completed
before the next unlocks, and you can always go back.

### 1. Exchange

Pick the exchange whose data and instruments the backtest will use.

### 2. Data

Choose what market data feeds the simulation and at what granularity (the **cadence** —
from raw ticks up to daily bars; real-time cadence uses every update and ignores any
multiplier). Higher resolution is more faithful, at the cost of a slower run.

### 3. Strategy

Pick which strategy (and revision) to test.

### 4. Instruments

Pick the counterpart instrument(s) and the historical date range the backtest will run
over.

### 5. Capital & costs

Set the initial capital (in quote currency), the percentage of capital allocated per trade,
and the fee assumptions:

- A **percentage fee** applies to every trade.
- An **absolute fee** (buy/sell, in quote currency) overrides the percentage when set.

This is also where risk assumptions for the simulation live.

### 6. Review

Confirm every step's summary and create the backtest. It's queued for execution — the
`Backtests` card on the dashboard and the [best backtests](/docs/app/getting-started) table
are where you'll see it once it has a result.

## Reading a result

Every completed backtest and execution is ranked by **Sharpe ratio** and **total PnL** —
the same two figures the dashboard's "best backtests" and "best executions" tables sort by,
so a strong run is easy to spot without opening it.

## Next step

Once a backtest is running well, two natural directions: [share the strategy on the
Marketplace](/docs/app/marketplace), or open [Laboratory](/docs/app/laboratory) to iterate
on the next idea before writing more code.
