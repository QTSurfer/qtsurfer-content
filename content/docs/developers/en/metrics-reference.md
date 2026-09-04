---
title: Metrics reference
description: Every field a backtest, sweep, or walk-forward result reports — its definition, units, how the engine computes it, and when it is present.
order: 5.9
lastUpdated: '2026-09-03T22:06:47Z'
---

Results carry two families of numbers with different conventions. Fields whose name ends in
`Percent` or `Pct` are percentages on a `0`–`100` scale. Fields that are rates by name — `winRate`,
`cagr` — and the risk-adjusted ratios are plain ratios: `0.15` means fifteen percent, `0.58` means
fifty-eight percent. Nothing is scaled twice, and nothing carries a percent sign.

All metrics are **net of fees** as configured on the run, and all are computed from **closed
trades**: a position still open when the session ends contributes nothing.

## Single-run results

Present in `results` once the strategy has closed at least one trade.

| Field | Units | Definition |
|---|---|---|
| `pnlTotal` | Quote currency | Sum of realised profit and loss over every closed trade. |
| `pnlTotalPercent` | Percent, `0`–`100` scale (negative when losing) | `pnlTotal` as a percentage of the initial capital. `0` when the initial capital is `0`. |
| `totalTrades` | Count | Closed trades. This is the sample size behind every other metric. |
| `winRate` | Ratio, `0.0`–`1.0` | Share of closed trades whose profit is **strictly positive**. A break-even trade counts as a loss. |
| `sharpeRatio` | Ratio | Mean of the per-trade percentage returns divided by their standard deviation. See below. |
| `sortinoRatio` | Ratio | Mean of the per-trade percentage returns divided by their downside deviation. See below. |
| `cagr` | Ratio | Compound annual growth rate of the equity, from the first to the last trade. See below. |
| `maxDrawdown` | Quote currency | Largest peak-to-trough decline of the equity curve. |
| `maxDrawdownPercent` | Percent, `0`–`100` scale | The same decline relative to the peak it fell from. |
| `iops` | Operations per second | Throughput of the run: instrument operations processed per second. A performance figure, not a strategy metric. |

### How the ratios are computed

**Per-trade returns.** Each closed trade contributes one return, its realised profit as a
percentage of the capital committed to it, at full precision. The Sharpe and Sortino ratios are
statistics of that series, not of calendar-period returns:

```text
sharpeRatio  = mean(r) / stdev(r)
sortinoRatio = mean(r) / downsideDeviation(r)
```

- Neither ratio is **annualised**, and neither subtracts a risk-free rate. Compare them with other
  QTSurfer results, not with annualised daily figures from elsewhere.
- Both report `0` when fewer than two trades were closed. `sharpeRatio` reports `0` when every
  trade had the same return; `sortinoRatio` reports `0` when no trade lost money — a strategy
  without a losing trade shows a zero Sortino, not an infinite one.
- `stdev` is the population standard deviation of the series.

**CAGR.** Computed from the equity path, not from trade returns:

```text
years = (lastTradeTime − firstTradeTime) / 365.25 days
cagr  = (finalEquity / initialCapital) ^ (1 / years) − 1
```

Windows shorter than one year are deliberately **not annualised**: extrapolating a few weeks to a
year produces meaningless magnitudes, so for `years < 1` the field equals the plain equity return,
`finalEquity / initialCapital − 1`, which is the same quantity `pnlTotalPercent` reports on its own
scale. The two formulas agree exactly at one year. `cagr` is `0` when there is no positive initial
capital, no elapsed time between trades, or the equity went to zero or below.

**Drawdown.** Tracked on the equity curve as trades close: the running peak, and the deepest fall
from it in currency and as a fraction of that peak. See the [drawdown article](/learn/articles/drawdown)
for the calculation and its reading.

## Equity curve

`results.equityCurve` is present under the same condition as the metrics. Its first point is an
anchor at the backtest start with the initial capital; each later point is recorded when a trade
closes, so `equity = initialCapital + cumulativePnl` at that moment. Points are account value in
quote currency, never percentages. Shapes, transforms, and the metadata that says what was actually
served are documented in [Equity curves](/docs/developers/api/equity_curves).

## Notices

`results.notices` lists diagnostics the engine raised, each with a `level`, a `code`, a `message`,
and a `provenance`. The field is **absent when nothing was raised** — it is the one place where
silence is a real answer. Notices are also raised on failed and aborted runs, and a run with no
trades usually explains why here. `noticesTruncated` reports how many were dropped past the cap of
fifty, and is absent when none were.

## Sweep leaderboard rows

Each trial in a sweep reports its own copy of the run metrics plus the fields that make trials
comparable:

| Field | Units | Definition |
|---|---|---|
| `runIx` | Index | Deterministic position in the expanded grid; stable across shards and rankings. |
| `rank` | Position | Present only in the ranked view. |
| `params` | Map | The parameter vector of this trial. |
| `sharpe`, `sortino`, `pnl`, `pnlPct`, `cagr`, `maxDdPct`, `trades`, `winRate` | As above | The trial's own results. `pnlPct` and `maxDdPct` are on the `0`–`100` scale; `cagr` and `winRate` are ratios. |
| `plateauScore` | Same units as the objective | The objective of the **worst** run in this point's immediate neighbourhood. The default ranking key. |
| `neighbourCount` | Count | Neighbours that existed for the plateau score. `0` means the score is unevidenced, not confirmed. Read the two together. |
| `deflatedSharpe` | Probability, `0.0`–`1.0` | Probability that this trial's Sharpe reflects real edge rather than the best draw among the vectors tried, accounting for sample length, skewness, and kurtosis. Above roughly `0.95` survives the correction; at or below `0.5` is indistinguishable from the best of a pile of random trials. |
| `belowTradeFloor` | Boolean | `trades` fell below the sweep's `minTradeFloor` (thirty by default). The row stays in the results. |
| `aborted` | Boolean | The run threw and measured nothing. Aborted rows are excluded from sensitivity aggregates. |
| `runtimeMs` | Milliseconds | Wall-clock time of the trial. |

At sweep level, `pbo` is the **probability of backtest overfitting** over the whole grid, from
combinatorially symmetric cross-validation, with `pboSplits` the number of splits used. Above
roughly `0.5` the selection is picking noise. Both are present only once the last shard finishes,
and only for a sweep without walk-forward.

The sensitivity endpoint aggregates the objective per parameter value as `best`, `mean`, and
`worst`, with `count` runs behind each point. It excludes aborted runs, and it can be read while the
sweep is still running.

## Walk-forward results

A walk-forward sweep reports one row per completed fold instead of one per parameter point:

| Field | Definition |
|---|---|
| `foldIx` | Position of the fold, oldest first. |
| `inSampleFrom`, `inSampleTo`, `outOfSampleTo` | Window indices into the prepared session. |
| `params` | The vector that won the fold's in-sample optimisation. |
| `inSampleSharpe` | That winner's Sharpe on the window it was chosen on — the flattering number, there to compare against the next field. |
| `outOfSample` | A full leaderboard row scored on the following, unseen window — the honest number. |
| `vectorsRun` | Vectors evaluated in-sample before picking the winner. |

`paramDrift`, at the sweep level, is the mean normalised lattice distance between consecutive fold
winners. It is **omitted, not zero**, until at least two folds have completed, because zero is
itself a meaningful reading. Walk-forward sweeps report no plateau score, deflated Sharpe, or PBO:
those corrections exist to deflate in-sample winners, and out-of-sample scores need no deflating.

## Reading the numbers together

- `totalTrades` first. Every ratio is a small-sample statistic when the trade count is small, and
  `belowTradeFloor` exists to make that visible in sweeps.
- `sharpeRatio` with `winRate`, `maxDrawdownPercent`, and the equity curve. A high ratio on a
  curve that made all its money in one episode is a story about that episode.
- `cagr` with the session length. Under one year it is a plain return, not a growth rate.
- `deflatedSharpe` and `pbo` before `rank`. The top of a leaderboard is where selection bias lives.

## Related pages

- [Backtest execution model](/docs/developers/backtest-execution-model) — when each part of a result appears.
- [Parameter sweeps](/docs/developers/api/backtest_sweep) — the endpoints behind the sweep fields.
- Learn: [Sharpe ratio](/learn/articles/sharpe-ratio), [Drawdown](/learn/articles/drawdown),
  [Overfitting](/learn/articles/overfitting), [Walk-forward analysis](/learn/articles/walk-forward-analysis).
