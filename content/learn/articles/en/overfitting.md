---
title: Overfitting
description: Learn why a strategy that looks best on historical data often fails afterwards, how selection inflates backtest results, and how to measure the damage before trusting a winner.
order: 3
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

**Overfitting** is what happens when a strategy is shaped to the accidents of one historical sample
rather than to a repeatable feature of the market. The backtest still reports a real number, but the
number describes how well the strategy memorised the past, not how it will behave on data it has
never seen.

The problem is rarely a single bad decision. It accumulates through ordinary research: adding one
more filter, trying one more parameter value, keeping the best variant and discarding the rest. Each
step is reasonable on its own. Together they turn the historical sample into training data, and the
reported performance into an in-sample score.

## Why the best result is biased

Suppose a strategy has no edge at all, and its Sharpe ratio on any given sample is pure noise. Run
it once and you get a random draw. Run it forty-four times with different parameters and keep the
best one, and you have not found an edge; you have found the maximum of forty-four random draws.

That maximum grows predictably with the number of trials. For independent trials with no real skill,
the expected best Sharpe ratio scales with roughly `√(2 · ln N)`, where `N` is the number of trials.
Ten trials already produce a best-looking result that would be impressive if it came from a single
test. A few hundred trials make a strong-looking winner almost guaranteed.

This is the **multiple-testing** problem, and it is why a leaderboard's top row cannot be read as
evidence on its own. The relevant question is not "how good is the winner?" but "how good would the
winner look if nothing worked?"

## Where overfitting comes from

- **Too many degrees of freedom.** Every parameter, filter, threshold, and special case is a knob
  that can be turned to fit history. Strategies with many knobs can reproduce almost any past path.
- **Selection on the evaluation data.** Choosing the best variant on the same data used to report
  its performance is the core mistake. The choice consumes the information in the sample.
- **Too few trades.** A result built from a dozen trades is dominated by a handful of events. Small
  samples make extreme outcomes likely and their statistics unreliable.
- **Fragile parameters.** A strategy that only works at `rsiPeriod = 16` and collapses at `15` or
  `17` has most likely found a coincidence in the data, not a property of the market.
- **Reused test data.** An out-of-sample period is only out of sample once. Tuning a strategy after
  seeing its out-of-sample result quietly turns that period into in-sample data.

## A concrete example

A trader sweeps `rsiPeriod` from 7 to 28 and a boolean trend filter, forty-four combinations in
total, and ranks them by Sharpe ratio. The winner reports a Sharpe of `1.84` at `rsiPeriod = 16`
with the filter on.

Two questions decide whether that row means anything:

1. **What do its neighbours look like?** If `rsiPeriod` 15 and 17 also score well, the region is a
   plateau and the parameter is capturing something durable. If the neighbours score `0.6` and
   `0.5`, the `1.84` is a spike, and the smallest change in market conditions will move the
   strategy off it.
2. **How much of the score is explained by the search?** Forty-four trials with no edge produce a
   best Sharpe that is far from zero. The winner's score has to be measured against that baseline,
   not against zero.

A plateau at `1.6` beats a spike at `1.84`. The spike is the more impressive number and the less
trustworthy one.

## Common mistakes

- **Reporting only the winner.** The number of alternatives tried is part of the evidence. Hiding
  discarded trials makes any correction for multiple testing impossible.
- **Adding rules until the equity curve looks smooth.** Each rule that removes one bad historical
  trade is a rule fitted to that trade.
- **Treating a fine grid as thoroughness.** A step of `1` on a period that behaves the same from
  14 to 18 adds trials, not information, and inflates the multiple-testing baseline.
- **Optimising on the same window twice.** Coarse sweep, then refinement, then a final tweak, all on
  the same dates, is one long in-sample fit.
- **Confusing a good metric with a good strategy.** A drawdown-minimising objective can be satisfied
  by a strategy that barely trades. Read trade count alongside any score.

## How QTSurfer measures it

A parameter sweep in QTSurfer keeps every trial and reports several corrections that address the
mechanisms above directly, rather than leaving the leaderboard as the only output.

- **Plateau ranking by default.** The ranked leaderboard sorts by the objective of the *worst* run
  in each parameter point's immediate neighbourhood, so a spike that does not survive its neighbours
  does not win by default. `ranking=raw` restores the unadjusted ordering, and `neighbourCount: 0`
  flags a point whose plateau score has no neighbours to support it.
- **Deflated Sharpe ratio per trial.** Each leaderboard row carries a `deflatedSharpe` value: the
  probability that the trial's Sharpe reflects real edge rather than the best draw among however
  many vectors were tried. Values above roughly `0.95` survive the multiple-testing correction;
  values at or below `0.5` are indistinguishable from the best of a pile of coin flips.
- **Probability of backtest overfitting.** A completed sweep reports `pbo`, computed by
  combinatorially symmetric cross-validation over the whole sweep. A value above roughly `0.5`
  means the selection process is picking noise.
- **Trade floor.** Trials below the `minTradeFloor` (thirty trades by default) stay in the results
  but are flagged `belowTradeFloor`, so a strong score built on a handful of trades is visible as
  such.
- **Sensitivity views.** The sensitivity endpoint aggregates every run by parameter value. A flat
  marginal means an axis did not matter; `best`, `mean`, and `worst` disagreeing means the axis only
  works in specific company.
- **Walk-forward validation.** Adding `walkForward` to a sweep optimises each fold on its own window
  and scores the winner only on the following, unseen window. The reported `paramDrift` shows whether
  winners stay in the same region from fold to fold or jump across the grid.

None of these repair a backtest that leaked future information or used bad data. They tell you how
much of a good-looking result the search itself would have produced.

## Related concepts

- [Backtesting](backtesting) — what a historical simulation measures and which assumptions travel
  with the result.
- [Look-ahead bias](look-ahead-bias) — the other main reason a backtest cannot be reproduced live.
- [Parameter sweep](parameter-sweep) — how to explore a grid without selecting the noise in it.
- [Walk-forward analysis](walk-forward-analysis) — sequential out-of-sample validation of a sweep.
- Glossary: [Deflated Sharpe ratio](/learn/glossary/dsr), [Probability of backtest
  overfitting](/learn/glossary/pbo), [Sharpe ratio](/learn/glossary/sharpe-ratio).
- Developer guide: [Parameter sweeps](/docs/developers/api/backtest_sweep).

## Further reading

- Bailey, D. H. and López de Prado, M. (2014). *The Deflated Sharpe Ratio: Correcting for Selection
  Bias, Backtest Overfitting and Non-Normality*. Journal of Portfolio Management.
- Bailey, D. H., Borwein, J., López de Prado, M. and Zhu, Q. J. (2017). *The Probability of Backtest
  Overfitting*. Journal of Computational Finance.
- Bailey, D. H., Borwein, J., López de Prado, M. and Zhu, Q. J. (2014). *Pseudo-Mathematics and
  Financial Charlatanism: The Effects of Backtest Overfitting on Out-of-Sample Performance*. Notices
  of the American Mathematical Society.
