---
title: Strategy revision
description: Learn why a trading strategy should be versioned as immutable revisions, what a revision must carry to make a result reproducible, and how QTSurfer ties every backtest to the exact code that produced it.
order: 12
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

A **strategy revision** is an immutable snapshot of a strategy's code at one point in its
development. Research on trading strategies produces many variants of the same idea, and a result
is only evidence if it can be traced to the exact variant that produced it. Revisions are the unit
that makes that traceability possible.

The alternative, one editable strategy whose past states are lost, turns every stored result into
a number with no referent. "The RSI strategy scored a Sharpe of 1.4" is meaningless if the RSI
strategy has been edited nine times since.

## What a revision has to preserve

A result is reproducible when the following can be recovered together:

- **The code**, byte for byte, including its default parameter values.
- **The data**: instrument, date range, cadence, and the identity of the dataset if it was
  uploaded rather than managed.
- **The configuration**: initial capital, allocation per trade, fees, and any risk assumptions.
- **The parameter values** actually used, when the run overrode the defaults.
- **The engine version** that ran it, since metrics and fills can change between versions.

A revision owns the first item. The others are properties of the run, and a well-designed system
attaches them to the result rather than to the strategy, so the same revision can be tested under
many configurations without ambiguity.

## Why immutability matters

- **Comparisons stay valid.** Two results from the same revision differ only in what the run
  changed. Two results from "the same strategy" edited between them differ in unknown ways.
- **Failures remain as evidence.** A revision that scored badly is part of the research record. It
  tells the next reader which idea was tried and rejected, and it is one of the discarded trials
  that the multiple-testing corrections in [Overfitting](overfitting) need to count.
- **Sharing is honest.** Publishing a specific revision means the reader evaluates exactly what
  the author tested, not whatever the file contains next week.
- **Bugs become locatable.** When a live behaviour differs from a backtest, the revision pins one
  side of the comparison.

## Working with revisions

- **One hypothesis per revision.** Change the entry filter, or the exit, or the sizing, and
  record what the change was meant to improve. A revision that changes three things at once cannot
  attribute its result to any of them.
- **Write the intent down at creation time.** A description that says "adds a volatility gate to
  reduce whipsaws in ranges" is the difference between a research log and a pile of files.
- **Let results accumulate on the revision.** Backtests, sweeps, and walk-forward runs against the
  same revision build a picture of it. Moving on to a new revision after every run loses that.
- **Keep the losers.** Deleting revisions that did not work is how survivorship bias enters a
  personal research process.

## Common mistakes

- **Overwriting instead of versioning.** Editing in place destroys the referent of every past
  result.
- **Versioning by filename.** `strategy_v2_final_FIXED.java` is not a revision system; it is the
  absence of one.
- **Treating formatting changes as new versions.** A reformatted file that computes the same thing
  is the same strategy. Versioning it separately fragments the results across identical code.
- **Confusing the revision with the run.** A revision does not have "a Sharpe ratio". A run of a
  revision on a dataset under a configuration does.

## Revisions in QTSurfer

In QTSurfer a strategy is Java code, and **every save creates a new revision**. Revisions are
never overwritten, and every backtest, sweep, and marketplace listing points at exactly one
revision, so a result always names the exact code that produced it. The strategy's title identifies
the idea across revisions; the revision identifies the code.

A revision is saved only once the code **validates and compiles**. Compilation answers whether the
source is valid Java and returns the strategy's declared properties, the parameter keys a sweep or
run may set, with their defaults and any suggested ranges. Validation goes one step further: the
compiled class is instantiated and driven through a bounded synthetic series, so a wiring fault
shows up before the first real backtest. The verdict is recorded against that compilation and
superseded by the next one.

Identity is derived from what the code *means*, not from how it is written. A comment, a blank
line, re-indentation, or reordered imports yield the same identity; renaming a variable or
reordering statements yields a different one. Resubmitting a reformatted strategy therefore returns
the identity it already had, together with any validation already recorded against it. The
identity says nothing about behaviour: two sources that compute the same thing by different means
are two strategies.

Runs attach the remaining reproducibility items to the result: the prepared dataset carries
instrument, range, cadence, and coverage; the run carries capital, fees, and parameter values;
sweeps carry their grid, sampler, objective, and seed. A strategy obtained from the marketplace is
a read-only reference copy, tied to the published revision, unless the listing exposes the code.

## Related concepts

- [Backtesting](backtesting) — what a run of a revision measures.
- [Overfitting](overfitting) — why discarded revisions are evidence too.
- [Survivorship bias](survivorship-bias) — what deleting the losers does to a research record.
- Developer guide: [Compiling and validating a strategy](/docs/developers/api/strategy).
- Product guides: [Strategies](/docs/app/strategies), [Marketplace](/docs/app/marketplace).
