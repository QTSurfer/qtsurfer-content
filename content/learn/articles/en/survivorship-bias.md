---
title: Survivorship bias
description: Learn how survivorship bias enters a backtest through the instrument universe, the data catalogue, and the set of strategies reported, and how to build a universe as it looked at the time.
order: 10
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T18:29:00Z'
---

**Survivorship bias** is the error of studying only what survived. A backtest run over the
instruments that exist today, the datasets that are still available, or the strategies that were
worth writing up, has silently excluded everything that failed along the way. The sample looks
complete and is not, and the results lean towards success because the failures were removed
before the experiment began.

It is a data-selection problem rather than a strategy bug, and it survives every amount of care
in the strategy code.

## Three places it enters

### The instrument universe

A strategy tested "on the top fifty pairs by volume" almost always means the top fifty *today*.
Some of the pairs that were in the top fifty three years ago have since been delisted, lost their
liquidity, or collapsed. A universe built from the present contains only the tokens that held
value, and a strategy that buys dips on such a universe is buying dips on assets that, by
construction, recovered.

The effect is strongest in crypto markets, where listings and delistings are frequent and the
dispersion between survivors and casualties is extreme.

### The data catalogue

Historical data is usually kept for what is still traded. When a pair stops trading, its history
often stops being collected, is archived, or is dropped from the catalogue a researcher browses.
Even a careful researcher who wants the failed instruments may find no data for them.

### The strategies themselves

Only successful backtests get shared. Forum posts, papers, marketplace listings, and the trader's
own notes describe the ideas that worked; the dozens that did not are deleted or forgotten. Anyone
learning from that record overestimates how often a plausible idea works. This is the same
mechanism as [overfitting](overfitting) at the level of the research community rather than the
parameter grid.

## A concrete example

A momentum strategy is tested from January 2024 to June 2026 on the fifty largest spot pairs
listed on an exchange as of June 2026. Twelve of the pairs that would have qualified in January
2024 are no longer listed and are absent from the test.

In the actual January 2024 universe, the strategy would have held positions in some of those
twelve. Several lost most of their value before delisting, and the strategy's exit rules were not
designed for a token that stops trading. The backtest on the survivor universe reports a `31 %`
return; a reconstruction including the delisted pairs, with a forced exit at their last quote,
reports `9 %`. Neither number is fabricated. The first one simply describes a portfolio that
nobody could have chosen in advance.

## Common mistakes

- **Building the universe from a current ranking.** Rankings by volume, market capitalisation, or
  listing status must be taken as of the backtest's start, not as of today.
- **Treating missing history as "no data" rather than "dead instrument".** An instrument with no
  data after a certain date is information about what happened to it.
- **Testing the exits only on assets that recovered.** A stop-loss rule looks unnecessary on a
  universe where everything came back.
- **Learning from published results only.** The base rate of strategy ideas that fail is invisible
  in any collection of successes.
- **Confusing survivorship with look-ahead.** Look-ahead uses future *prices*; survivorship uses
  the future *composition* of the universe. Both leak the future, by different routes.

## Survivorship in QTSurfer

QTSurfer's exchange catalogue lists each instrument with its current price and volume and, per
instrument, the coverage windows available for tickers and for klines. Coverage is per instrument
and per market segment, so the record of a pair is not extended or trimmed to match the others,
and an instrument that stopped trading shows a window that ends rather than disappearing from the
history. Treat the catalogue as live platform state: what it lists today is not a promise about
what was listed at the start of a backtest window.

Two practices follow:

- Choose the universe from the catalogue's coverage windows and the instrument's own history as of
  the backtest's start date, not from the current ranking. If the question is "what would this
  strategy have done in 2024", the universe is the 2024 one.
- When a pair's history is not managed by the platform, upload it as a dataset: a CSV with a
  `timestamp` and `close` column, optionally with open, high, low, and volume, is ingested with its
  discovered cadence and gaps and can be prepared and executed exactly like a managed exchange.
  This is how the delisted twelve in the example above get back into the test.

Backtests in QTSurfer run one instrument per prepared session, so a universe study is a set of
runs, one per instrument, on the same strategy revision. That is a feature for this purpose: each
instrument's result is visible on its own, and the ones that would have failed are not averaged
away inside a portfolio number.

## Related concepts

- [Backtesting](backtesting) — the assumptions that travel with every result.
- [Historical market data](historical-market-data) — coverage windows, gaps, and datasets.
- [Look-ahead bias](look-ahead-bias) — the other route by which the future leaks into a test.
- [Overfitting](overfitting) — survivorship at the level of strategies and parameters.
- Developer guides: [Market data](/docs/developers/api/market_data),
  [Datasets](/docs/developers/api/datasets).

## Further reading

- Brown, S. J., Goetzmann, W., Ibbotson, R. G. and Ross, S. A. (1992). *Survivorship Bias in
  Performance Studies*. Review of Financial Studies.
- Elton, E. J., Gruber, M. J. and Blake, C. R. (1996). *Survivor Bias and Mutual Fund
  Performance*. Review of Financial Studies.
