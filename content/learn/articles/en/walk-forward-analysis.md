---
title: Walk-forward analysis
description: Learn how walk-forward analysis validates a parameter sweep out of sample with sequential folds, what parameter drift reveals, and how to read fold results honestly.
order: 8
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

**Walk-forward analysis** tests whether the parameters that won a sweep keep working on data they
were not chosen on. The historical window is split into sequential folds. In each fold, the full
parameter grid is optimised on an **in-sample** window, and only the winner is then run on the
**out-of-sample** window immediately after it. The out-of-sample scores, collected across folds,
are the honest estimate of what the optimisation procedure delivers.

The key word is *procedure*. Walk-forward does not validate a parameter set. It validates the act
of choosing one, repeated over time, which is what a trader who re-optimises periodically actually
does.

## How the folds work

Take a prepared session of historical data and a number of folds `k`. Each fold owns a contiguous
slice of the session, split by an in-sample share:

```text
fold 0:  [ in-sample ──────────── ][ out-of-sample ]
fold 1:                            [ in-sample ──────────── ][ out-of-sample ]
fold 2:                                                      [ in-sample ──────────── ][ out ]
```

With an in-sample share of `66 %`, two thirds of each fold's window are used to pick the winner
and the remaining third to score it. Folds are ordered oldest first, and each out-of-sample window
lies strictly after the in-sample window it was chosen on, so no information flows backwards.

### Cost

Every fold runs the whole grid in-sample and then one extra run, the winner, out of sample:

```text
total runs = folds × (grid size + 1)
```

A 22-point grid with 4 folds is 92 runs; a 500-point grid with 4 folds is 2,004 runs where the flat
sweep was 500. This is why walk-forward is a deliberate step after a sweep, not a default on every
one.

## What to read

A walk-forward result has three parts, and each answers a different question.

1. **In-sample versus out-of-sample, per fold.** The in-sample score of a fold's winner is always
   flattering, because any grid produces a good-looking winner on the data it was chosen on. The
   gap between it and the out-of-sample score is the size of the selection effect. A small gap means
   the optimisation found something durable; a large gap means it found the noise in that window.
2. **Consistency across folds.** Out-of-sample scores that are positive and similar across folds
   indicate a procedure that works in different regimes. One excellent fold and three poor ones
   means the result depends on a single market episode.
3. **Parameter drift.** Compare the winning parameters of consecutive folds. Winners that stay in
   the same region of the grid indicate that the parameter means something. Winners that jump
   across the grid every fold indicate that the sweep is re-fitting noise each time, and that no
   single parameter set would have survived.

A drift measure needs at least two folds to compare, which is why two is the structural minimum,
not a tuning choice. It also needs the folds to have finished: an absent drift value means it could
not be computed yet, and that is different from a drift of zero, which is a meaningful reading.

## Common mistakes

- **Too few folds.** One out-of-sample window is one observation. Several folds are needed to see
  whether the out-of-sample scores agree with each other.
- **Out-of-sample windows too short to trade.** A window that produces four trades scores its
  winner on four events. Fold count and in-sample share should leave each out-of-sample window
  enough trades to mean something.
- **Re-tuning after reading the result.** Adjusting the grid, the objective, or the strategy after
  seeing the out-of-sample scores turns those windows into in-sample data. The next walk-forward
  needs data the previous one never touched.
- **Reading the out-of-sample mean as expected live performance.** It is the best available
  estimate, and it is still an estimate from one historical path with its own regimes.
- **Comparing walk-forward output with flat-sweep output.** They measure different things. A flat
  sweep ranks parameter points; walk-forward scores an optimisation procedure. Neither replaces the
  other.

## Walk-forward in QTSurfer

Walk-forward is an option on a parameter sweep. Adding a `walkForward` block with the number of
folds, and optionally the in-sample percentage (`66 %` by default, between `10` and `90`), turns
the sweep into sequential folds over the same prepared session. Omitting the block leaves the sweep
unchanged.

The accepted response confirms the fold plan, including the total number of runs, before any fold
has finished, so a client can tell a walk-forward sweep from a flat one while polling. A request that
exceeds the server's run budget is rejected up front rather than partially executed.

Results arrive one fold at a time, oldest first. Each fold reports its window boundaries, the
parameter vector that won its in-sample optimisation, that winner's in-sample Sharpe ratio, the
number of vectors evaluated, and a full out-of-sample row with the same metrics as any leaderboard
entry: Sharpe, Sortino, profit, CAGR, maximum drawdown, trade count, and win rate.

Across folds, `paramDrift` reports the mean normalised distance between consecutive winners on the
grid. It is omitted, not zero, until at least two folds have completed.

In a walk-forward sweep the leaderboard becomes one row per completed fold, the fold's
out-of-sample winner, rather than one row per parameter point. No plateau score, deflated Sharpe
ratio, or probability of backtest overfitting is reported: those corrections exist to deflate
in-sample winners, and the out-of-sample scores are already the honest number.

## Related concepts

- [Parameter sweep](parameter-sweep) — the search that walk-forward validates.
- [Overfitting](overfitting) — the failure walk-forward is designed to expose.
- [Backtesting](backtesting) — the single-run experiment behind every fold.
- Glossary: [Parameter sweep](/learn/glossary/parameter-sweep), [Sharpe
  ratio](/learn/glossary/sharpe-ratio).
- Developer guide: [Parameter sweeps, walk-forward validation](/docs/developers/api/backtest_sweep#walk-forward-validation).

## Further reading

- Pardo, R. (2008). *The Evaluation and Optimization of Trading Strategies*, 2nd edition. Wiley.
  The standard reference for walk-forward methodology.
