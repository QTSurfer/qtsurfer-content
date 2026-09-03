---
title: Equity curve
description: Learn what an equity curve records during a backtest, how to normalise and read it, and which shapes signal a fragile strategy rather than a robust one.
order: 5
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T16:10:49Z'
---

An **equity curve** is the account value of a strategy plotted through time. In a backtest it starts
at the initial capital and moves as simulated trades realise profits, losses, and costs. It is the
most information-dense artefact a backtest produces: every summary metric, from total return to
maximum drawdown, is a function of this one series.

A final return compresses the whole experiment into a number. The curve keeps the path, and the
path is where most of the useful questions live.

## What the curve records

Each point is a timestamp and an equity value. Equity is the account balance in quote currency,
`initial capital + cumulative net profit`, not a percentage and not a price.

How often points are recorded matters. A curve sampled on every trade shows the realised results
at the moments the strategy closed positions, but it says nothing about unrealised swings between
those moments. A curve marked to market on every tick shows the full path, including open-position
risk, at a much larger size. Know which one you are looking at before reading it.

### Normalising for comparison

Two curves with different starting capital cannot be compared by raw value. Normalise each point to
its starting equity:

```text
return%(t) = (E(t) / E(0) − 1) · 100
```

An account that starts at `100` and moves to `110.5` then `90.25` reads `+10.5 %` and `−9.75 %`
on the normalised scale, whatever the currency amounts were.

For long or strongly compounding curves, a logarithmic vertical axis keeps equal percentage moves
the same visual size. On a linear axis, the same `10 %` loss looks small early and enormous late.

## Reading the shape

- **Slope and consistency.** A steady slope with small fluctuations is what a repeatable edge looks
  like. A flat line with a few vertical jumps is a strategy whose return depends on a handful of
  trades.
- **Drawdowns.** Every dip below a previous high is a [drawdown](drawdown). Their depth, frequency,
  and how long they take to recover are the strategy's risk profile in graphical form.
- **Flat periods.** Long stretches without movement mean the strategy was not trading. That may be
  intended, or it may mean the entry condition was never met in a regime the strategy was not built
  for.
- **Stair steps.** Regular steps indicate infrequent trading at a fixed size. They are not a
  problem by themselves, but they warn that the trade count, not the date range, sets the sample
  size.
- **Regime dependence.** A curve that rises only during one identifiable period and is flat or
  falling elsewhere has likely fitted that period rather than the market.
- **Late acceleration.** Strong gains concentrated at the very end of the window are the shape most
  often produced by luck or by a parameter tuned to recent data.

## Common mistakes

- **Judging by the endpoint.** The final value is one point. Two curves can share it while one is a
  straight line and the other a cliff followed by a recovery.
- **Reading a downsampled curve as the raw one.** A curve reduced for display keeps its overall
  shape, but individual peaks and troughs between preserved points may be smoothed away.
- **Comparing curves from different fee assumptions.** Costs act on every trade, so two runs that
  differ only in fees can have visibly different curves. Keep configuration with the chart.
- **Mistaking a smooth in-sample curve for robustness.** A curve can be made arbitrarily smooth on
  historical data by adding rules. Smoothness is only evidence when it appears on data the strategy
  was not tuned on.

## Equity curves in QTSurfer

A completed backtest returns its equity curve with the yield metrics once the strategy has emitted
at least one trade. The first point is an anchor at the backtest start with the initial capital;
every later point is one sample per emitted yield, so the curve records realised results at those
moments. Equity is the account value in quote currency, and the normalisation above converts it to
percentage return.

The curve passes through a fixed transform pipeline, `resample → differential → outMode`:

- `resample` limits the result to a chosen number of points while preserving the exact first and
  last points and the global extrema.
- `differential` delta-encodes timestamps and equity from the second point onward to shrink the
  payload; the first point stays absolute and each later point is reconstructed by adding its delta
  to the previous value.
- `outMode` selects objects (`ARRAY`) or parallel arrays (`SHORT`).

The response metadata reports what actually happened, including `inputPointCount`,
`outputPointCount`, and whether resampling or delta encoding ran. A server size guard may force a
compact representation, so the metadata, not the request, is the source of truth for the shape.

For a plain backtest the transform is fixed when the run is submitted and the curve is returned
inline. In a parameter sweep, leaderboard rows are aggregate outcomes and carry curves only for
retained trials, selected by `mode` (`auto`, `topN`, `topPct`, or `none`); those rows hold a pointer
that is fetched separately, with the transform chosen at read time. The indicator values and buy or
sell markers behind the aggregate curve are available as stored signals when the run requests them.

## Related concepts

- [Drawdown](drawdown) — the measure of every dip in the curve.
- [Backtesting](backtesting) — the experiment that produces the curve.
- [Overfitting](overfitting) — why a smooth historical curve is not evidence on its own.
- Glossary: [Equity curve](/learn/glossary/equity-curve), [Drawdown](/learn/glossary/drawdown),
  [CAGR](/learn/glossary/cagr).
- Developer guide: [Equity curves](/docs/developers/api/equity_curves).
