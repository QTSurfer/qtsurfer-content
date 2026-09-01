---
title: Look-ahead bias
description: Understand how future information leaks into trading-strategy backtests, why it inflates performance, and how to prevent it.
order: 2
kind: concept
author: QTSurfer
datePublished: "2026-08-31"
lastUpdated: "2026-08-31T20:06:27Z"
---

**Look-ahead bias** occurs when a historical simulation makes a decision using information that would
not have been available at that point in time. The strategy is effectively allowed to see the future,
so its simulated performance cannot be reproduced in live trading.

The leak can be obvious, such as reading tomorrow's price, or subtle, such as using a completed candle
before that candle has closed.

## A simple example

Imagine a strategy evaluated at 10:03 using five-minute candles. The candle covering 10:00–10:05 does
not yet have a final close, high, low, or volume. If the backtest supplies the completed 10:05 candle
and lets the strategy trade at 10:03, the decision contains two minutes of future market information.

The code may appear chronologically ordered while the data assigned to each timestamp is not. That is
why preventing look-ahead bias requires checking both strategy logic and dataset semantics.

## Common sources

### Trading on a closing value too early

A strategy calculates an indicator from a bar's final close and assumes it can fill an order at that
same close. In a real market, the final value is only known once the interval ends; the next executable
price may already be different.

### Negative shifts or future rows

Data preparation code labels a row with a future return or shifts a column backwards. That label may
be appropriate for model training, but it must never appear among the features available to the
strategy at decision time.

### Full-sample normalization

The mean, variance, minimum, or maximum is calculated across the entire test period and then used to
normalize earlier observations. The transformation embeds knowledge of values that had not occurred
yet. Fit transformations on the permitted training window and carry only those fitted parameters
forward.

### Misaligned datasets

Joining candles, fundamentals, funding rates, or higher-timeframe indicators by their nominal date can
make a value appear earlier than it was actually published or completed. Align data by availability
time, not merely by the period it describes.

### Revised historical information

Some datasets are corrected or revised after first publication. A backtest using the final revised
value assumes information that a live strategy would not have seen. Point-in-time datasets preserve
what was known on each date.

### Selecting with future performance

Choosing a strategy or parameter set because it performs best across the complete reporting period is
not a row-level data leak, but it creates the same informational advantage at the research level. Keep
an untouched validation period for the final evaluation.

## How to prevent it

### Define event availability

For every input, record when it becomes usable by the strategy. A candle timestamp might represent its
open time or close time; those interpretations are not interchangeable.

### Process events monotonically

The simulation clock should move forward only. Indicators and strategy state should update from the
current event and retained past state, never from a collection that already contains later events.

### Separate signal and execution timing

State explicitly whether a signal calculated at an interval close may execute at that close, at the
next interval open, or through a more detailed execution model. Choose the assumption before looking
at which version produces the better return.

### Fit transformations inside the training boundary

Any learned threshold, scaler, feature selection, or parameter choice must be derived only from its
training data. Refit it when a walk-forward window advances instead of calculating it once over the
full history.

### Add causality tests

A useful test truncates the dataset at a given time and verifies that all signals before that cutoff
remain unchanged when later data is added. If historical signals change after appending future rows,
the pipeline is leaking information or recalculating past state incorrectly.

### Review suspiciously smooth results

Very high win rates, fills consistently close to local extrema, unusually small drawdowns, or a large
performance drop when delaying execution by one event are reasons to inspect timing carefully. They
are clues, not proof, but they often reveal unrealistic access to information.

## Look-ahead bias in QTSurfer experiments

Keep the strategy revision, data identity, event interval, and execution configuration attached to
every result. When strategy code consumes window or indicator updates, confirm what event completed
the value and what price can realistically be used by a signal emitted from that callback.

Compare a suspicious result with a deliberately delayed execution or a stricter data cutoff. The goal
is not to preserve the attractive result; it is to establish that each decision could have been made
with the information available at that moment.

Read [Backtesting](./backtesting) for the wider experiment design and the
[QTSurfer backtesting guide](/docs/app/backtesting) for the product workflow.

## The key question

For every value used by the strategy, ask: **when would this exact value first have been available in
the live system?** If the simulated decision occurs earlier, the backtest has looked ahead.
