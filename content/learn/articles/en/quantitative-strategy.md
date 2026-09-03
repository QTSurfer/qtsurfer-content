---
title: Quantitative strategy
description: Learn what makes a trading strategy quantitative, which components every such strategy has, how the research loop from hypothesis to validation works, and how QTSurfer maps onto it.
order: 14
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

A **quantitative strategy** is a set of trading rules defined precisely enough to be computed. Given
the same data, it produces the same decisions every time, which is what allows it to be tested on
history, compared with alternatives, and executed without a person in the loop.

The word *quantitative* refers to the method, not to the complexity. A two-line moving-average rule
is quantitative; a trader's intuition backed by charts is not, however much arithmetic supports
it. The dividing line is whether the decision can be reproduced from the rule and the data alone.

## Components

Every quantitative strategy, from the simplest to the most elaborate, contains the same parts.
Leaving one implicit is the usual source of a result that cannot be reproduced.

1. **Universe.** Which instruments the strategy considers, and how that set is chosen over time.
   See [Survivorship bias](survivorship-bias) for why "over time" matters.
2. **Data.** What the strategy observes: tickers, candles at a cadence, funding rates, order book
   levels. The data defines what the strategy can know at each moment.
3. **Signal.** The computation that turns observations into a view: indicators, thresholds, models.
   This is what most people mean by "the strategy" and it is one part of five.
4. **Sizing.** How much to trade when the signal fires: fixed fraction of capital, volatility
   scaled, scaled into a position over several entries.
5. **Execution and risk.** Order type, protective stops, maximum exposure, and the conditions under
   which the strategy stops trading.

Two strategies with the same signal and different sizing or exits are different strategies, and
they can have opposite results.

## Families

Most strategies belong to a small number of families, distinguished by the market behaviour they
depend on:

- **Trend following** assumes moves persist: buy strength, sell weakness, accept many small losses
  for a few large gains. The [EMA crossover](ema-crossover) is the canonical example.
- **Mean reversion** assumes moves overshoot: fade extremes, accept many small gains for a few
  large losses when the extreme was the start of a trend.
- **Carry** collects a structural payment, such as a funding rate, and manages the price risk
  around it.
- **Relative value** trades one instrument against another when their relationship departs from
  its usual range.
- **Market making** provides liquidity and earns the spread, and depends on inventory and
  adverse-selection control more than on directional views.

Knowing the family tells you what regime the strategy will suffer in, which is the first thing a
backtest should be checked against.

## The research loop

1. **Hypothesis.** A statement about market behaviour that would make the strategy profitable,
   written before any data is looked at. "Short-term momentum persists for a few hours in liquid
   pairs after a volatility expansion" is testable; "buy low, sell high" is not.
2. **Implementation.** The rule as code, with parameters declared rather than embedded.
3. **Backtest.** One run on one instrument and window, mainly to find implementation errors and
   to check that the strategy trades as intended. See [Backtesting](backtesting).
4. **Exploration.** A [parameter sweep](parameter-sweep) to learn how the strategy responds to its
   parameters, and a sensitivity view to find out which of them matter.
5. **Validation.** [Walk-forward analysis](walk-forward-analysis) or a held-out period, under a
   realistic cost model, to estimate what the optimisation procedure delivers on unseen data.
6. **Decision.** Keep, revise, or reject. A rejected strategy is a result, and a
   [revision](strategy-revision) that stays in the record.
7. **Monitoring.** Once trading, compare live behaviour with the backtest continuously. A strategy
   whose live results fall outside what its backtests predicted has stopped being the strategy that
   was tested.

The loop is a loop: most strategies go through it several times, and the discipline is to change
one thing per pass.

## Common mistakes

- **Starting from the data instead of the hypothesis.** Searching for patterns and then explaining
  them produces strategies fitted to noise. See [Overfitting](overfitting).
- **Treating the signal as the whole strategy.** Sizing and exits often contribute more to the
  result than the entry rule.
- **Skipping the cost model until the end.** Costs change which parameters win.
- **Reading one backtest as a verdict.** One instrument and one window is a smoke test, not
  evidence.
- **Changing several things at once.** A pass through the loop that alters the signal, the sizing,
  and the data cannot attribute its result to any of them.

## Quantitative strategies in QTSurfer

QTSurfer is built around this loop, with one surface per stage.

- **Author.** A strategy is Java code extending a base class, with indicators set up once and read
  by name, per-instrument state, and signals emitted when a condition holds. Parameters are declared
  as strategy properties so they can be swept rather than edited. An AI-assisted prompt built from
  the strategy's title and description can produce a first draft against the published strategy
  skill.
- **Validate.** Saving compiles the code and creates an immutable revision; validation drives the
  compiled class through a synthetic series to catch wiring faults before any real run.
- **Backtest.** A run points at one revision, one prepared dataset with its coverage, and one
  configuration of capital, allocation, and fees, and returns the yield metrics, the equity curve,
  and any diagnostics the engine raised.
- **Explore.** A sweep runs the revision across a grid, random, or Latin hypercube sample of its
  properties on the same prepared data, ranks trials by plateau score, reports a deflated Sharpe
  ratio per trial and a probability of overfitting for the whole sweep, and exposes marginals and
  heatmaps. Walk-forward folds validate the procedure out of sample.
- **Share.** A specific revision can be published to the marketplace with visibility, code
  exposure, and pricing controls, and reused by others in their own analyses.

The engine underneath computes indicators incrementally, so a strategy costs the same per update
whatever its lookback, and the same strategy code is designed to run against historical data and
against a live feed.

## Related concepts

- [Algorithmic trading](algorithmic-trading) — the execution side: how decisions become orders.
- [Backtesting](backtesting), [Parameter sweep](parameter-sweep), [Walk-forward
  analysis](walk-forward-analysis) — the stages of the loop.
- [Strategy revision](strategy-revision) — the unit that makes results reproducible.
- Developer guides: [Java strategies](/docs/developers/java-strategies), [Strategy
  patterns](/docs/developers/strategy-patterns).
- Product guides: [Getting started](/docs/app/getting-started), [Laboratory](/docs/app/laboratory).
