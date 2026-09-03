---
title: Parameter sweep
description: Learn how to explore a strategy's parameter space with grid, random, and Latin hypercube sampling, read a leaderboard without selecting noise, and use sensitivity views to find stable regions.
order: 7
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

A **parameter sweep** runs the same strategy many times, each with a different combination of
configurable values, and collects the results side by side. The purpose is not to find the single
best combination. It is to learn how the strategy responds to its parameters: which ones matter,
which ranges are stable, and where performance is a coincidence of the data.

A single backtest answers "how did this configuration do?". A sweep answers "how does this idea
behave?", which is a more useful question and a more dangerous one, because the search itself
produces winners whether or not the idea works.

## Defining the space

Each swept parameter is an **axis**, expressed either as a numeric range with a step or as an
explicit list of values. The **grid** is the Cartesian product of all axes, so its size multiplies:

```text
rsiPeriod:      7 … 28, step 1     → 22 values
useTrendFilter: [true, false]      →  2 values
                                     44 combinations
```

Adding a third axis with ten values turns 44 into 440. Adding a fourth turns it into thousands. The
grid grows geometrically while the historical data does not, so most of those trials are testing the
same market episodes with slightly different labels.

Three samplers address that growth differently:

- **Grid** evaluates every combination. Exhaustive, easy to reason about, and the only sampler whose
  results have well-defined neighbours for plateau analysis.
- **Random** draws a fixed number of combinations uniformly. Cheap and unbiased, but clusters and
  gaps appear by chance.
- **Latin hypercube (LHS)** also draws a fixed number of samples, but stratifies each axis so that
  every region of every parameter is covered once. It gives grid-like coverage at random-sampling
  cost, which suits a first pass over a large space.

The **objective** decides how trials are ranked: risk-adjusted return (Sharpe or Sortino ratio),
raw profit, or maximum drawdown. The objective is a lens, not a verdict; the same sweep can be
re-scored by another objective without re-running anything.

## Reading a leaderboard

The ranked list is the least informative view of a sweep, because the top of any ranking is where
selection bias concentrates. Read it with the following in mind.

- **Neighbours matter more than the winner.** A point whose neighbours also score well sits on a
  plateau; a point whose neighbours score badly is a spike. Plateaus survive changes in the market;
  spikes do not.
- **Trade count sets the sample size.** A trial with fifteen trades has fifteen observations,
  however long the date range. Its score is a small-sample statistic.
- **Every trial counts against the winner.** The more combinations tried, the better the best one
  looks by chance alone. See [Overfitting](overfitting) for how that baseline grows.
- **Aborted trials are not bad results.** A run that failed measured nothing. Treating it as a poor
  outcome invents evidence against a parameter value that was never actually tested.

## Sensitivity: which axes mattered

A leaderboard says which point won. It cannot say whether an axis made any difference. Two
aggregate views answer that:

- A **marginal** collapses every other axis: for each value of one parameter, aggregate all trials
  that used it. A flat marginal means the axis was irrelevant over the range swept. When the best,
  mean, and worst scores at a value disagree strongly, that value only works in specific company,
  which is an interaction hiding behind a single number.
- A **heatmap** does the same over a pair of axes, so the interaction becomes visible directly.
  The number of surfaces is quadratic in the axis count, another reason to sweep few axes at a time.

Sensitivity is what turns a sweep from a search into an experiment. The conclusion is not "use
`rsiPeriod = 16`"; it is "`rsiPeriod` between 14 and 18 behaves the same, and the trend filter is
where the result comes from".

## A working sequence

1. **Start coarse.** Wide ranges, large steps, or an LHS sample of a few dozen points. The aim is
   the shape of the response, not the optimum.
2. **Read the marginals.** Drop axes that are flat. Narrow ranges to the regions that hold up.
3. **Refine once.** A second sweep over the surviving region with finer steps. Every additional
   refinement on the same data is another round of in-sample fitting.
4. **Prefer the plateau.** Choose a point inside a stable region, not the single best row.
5. **Validate out of sample.** Run the sweep with [walk-forward folds](walk-forward-analysis), or
   hold back a period the sweep never saw, before believing any number.

## Common mistakes

- **Sweeping everything at once.** Six axes produce a grid nobody can interpret and a multiple-
  testing baseline nobody can beat.
- **Steps finer than the data can resolve.** A period that behaves identically from 14 to 18 does
  not need five trials; it needs one and a note that the region is flat.
- **Changing the objective until something wins.** Re-scoring is a tool for understanding, not for
  finding the metric under which the favourite looks best.
- **Refining repeatedly on the same window.** Coarse, refined, refined again: each pass consumes
  more of the sample's information, and the final winner has been chosen with all of it.
- **Ignoring the trade floor.** A spectacular score on nine trades is a story about nine trades.

## Parameter sweeps in QTSurfer

A sweep runs against the same prepared dataset as a plain backtest, so every trial sees exactly the
same data, instrument, and date range. The request declares one axis per strategy property, as a
range or a value list; picks a sampler (`grid`, `random`, or `lhs`), an objective (`sharpe`,
`sortino`, `pnl`, or `maxdd`), and optionally a seed for reproducibility. The response confirms the
number of trials before any of them runs, and an identical request does not enqueue a duplicate.

The leaderboard defaults to **plateau ranking**: rows sort by the objective of the worst run in
their immediate neighbourhood, so a spike does not win by default. Each row reports its raw score,
plateau score, neighbour count, trade count, whether it fell below the trade floor, and a
**deflated Sharpe ratio** that corrects for the number of vectors tried. A finished sweep also
reports the **probability of backtest overfitting** across the whole grid.

The **sensitivity** endpoint returns marginals and pairwise heatmaps aggregated from stored trial
rows, without re-running anything, and works on a sweep still in flight. Aborted runs are excluded
throughout. Equity curves are retained for selected trials only, and cancelling a sweep keeps every
row already completed.

In the application, this is the **simulated backtest** workflow: define a reduced sweep, run it,
then submit a refinement that narrows it as a new phase of the same experiment.

## Related concepts

- [Overfitting](overfitting) — why the top of a leaderboard is biased and how much.
- [Walk-forward analysis](walk-forward-analysis) — sequential out-of-sample validation of a sweep.
- [Backtesting](backtesting) — the single-run experiment a sweep repeats.
- Glossary: [Parameter sweep](/learn/glossary/parameter-sweep), [Deflated Sharpe
  ratio](/learn/glossary/dsr), [Probability of backtest overfitting](/learn/glossary/pbo).
- Developer guide: [Parameter sweeps](/docs/developers/api/backtest_sweep).
