---
title: Drawdown
description: Learn how drawdown measures the fall from a previous equity peak, how to calculate maximum drawdown and its duration, and why it changes how a backtest should be read.
order: 4
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

A **drawdown** is the decline in account value from a previous peak. It starts the moment equity
drops below its running maximum and ends only when a new maximum is set. **Maximum drawdown** is the
deepest such decline over the whole period measured.

Total return says where a strategy finished. Drawdown says what it cost to get there: how much of
the account was lost from a high point, how long the loss lasted, and whether the trader would have
still been running the strategy when it recovered.

## Calculation

Let `E(t)` be the equity at time `t` and `P(t)` the running peak, `P(t) = max E(s)` for all
`s ≤ t`. The drawdown at `t` is:

```text
DD(t)  = E(t) − P(t)             absolute, in quote currency
DD%(t) = E(t) / P(t) − 1         relative to the peak
```

Both are zero or negative. Maximum drawdown is the minimum of either series over the period:

```text
MaxDD  = min DD(t)
MaxDD% = min DD%(t)
```

Two duration measures usually travel with the depth:

- **Drawdown duration** — time from the peak to the trough.
- **Recovery time** — time from the trough back to a new peak. A drawdown still open at the end of
  the period has no recovery time, and that absence is itself information.

### Worked example

An account starts at `100`, rises to `110.5`, then falls to `90.25`. The running peak at the third
point is `110.5`, so:

```text
DD  = 90.25 − 110.5        = −20.25
DD% = 90.25 / 110.5 − 1    = −0.183   →  −18.3 %
```

Note that the relative drawdown is measured from the peak, not from the starting capital. Against
the initial `100` the account is down `9.75 %`; against its own peak it is down `18.3 %`. The
second number is the one a trader would have experienced.

## What drawdown adds to a result

- **Path risk.** Two strategies can end at the same equity while one spent months `30 %` below
  its peak and the other never fell more than `5 %`. The final return is identical; the experience,
  the margin requirements, and the probability of abandoning the strategy are not.
- **Position sizing.** A strategy's historical maximum drawdown is the minimum loss to plan for,
  not the maximum. Future drawdowns tend to exceed the largest one seen in a finite sample.
- **Return per unit of pain.** Ratios such as `CAGR / |MaxDD%|` (often called the Calmar ratio)
  compare growth with the deepest loss required to obtain it.
- **Consistency.** A single deep drawdown surrounded by smooth gains suggests dependence on one
  market episode; many shallow drawdowns suggest a strategy whose risk is spread across time.

## Common mistakes

- **Comparing absolute drawdowns across different capital.** `−20.25` means something different on
  an account of `100` and an account of `10,000`. Compare percentages, or normalise first.
- **Reading depth without duration.** A `10 %` drawdown recovered in a week and a `10 %` drawdown
  that lasted a year are not the same risk.
- **Treating the historical maximum as a ceiling.** The sample contains one path. Longer samples and
  live trading almost always find a deeper one.
- **Optimising for the smallest drawdown.** A strategy that rarely trades has a small drawdown and
  little else. Drawdown is a constraint to respect, not an objective to minimise on its own.
- **Measuring from a downsampled curve.** A curve reduced to a few hundred points can miss the
  exact trough or the exact peak that defined the maximum drawdown. Compute it from the full series
  or use the metric the engine reports.

## Drawdown in QTSurfer

A completed backtest reports both forms in its results: `maxDrawdown` in quote currency and
`maxDrawdownPercent` relative to the peak, alongside the Sharpe ratio, Sortino ratio, CAGR, and
trade count. The equity curve behind them is available in the same response, so the depth can be
located in time.

In a parameter sweep, every leaderboard row carries `maxDdPct`, and `maxdd` is one of the four
objectives a sweep can rank by. Rank by drawdown only together with the trade count: rows below the
trade floor are flagged `belowTradeFloor` precisely because a low drawdown built on very few trades
is not evidence of control.

When an equity curve is resampled for display, the transform preserves the first and last points and
the global extrema, so the highest and lowest equity values survive. The specific peak-to-trough pair
that defines the maximum drawdown is not guaranteed to, which is why the reported metric, not a
value read off a compact chart, is the figure to quote.

## Related concepts

- [Equity curve](equity-curve) — the series from which every drawdown is measured.
- [Backtesting](backtesting) — what a historical result can and cannot tell you.
- [Overfitting](overfitting) — why the smallest historical drawdown in a sweep may be the least
  reliable one.
- Glossary: [Drawdown](/learn/glossary/drawdown), [CAGR](/learn/glossary/cagr), [Sharpe
  ratio](/learn/glossary/sharpe-ratio), [Sortino ratio](/learn/glossary/sortino-ratio).
- Developer guide: [Equity curves](/docs/developers/api/equity_curves), [Running a
  backtest](/docs/developers/api/backtest_execute).
