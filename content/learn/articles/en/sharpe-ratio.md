---
title: Sharpe ratio
description: Learn what the Sharpe ratio measures, why its value depends on the return series and convention used, how to compare it honestly, and exactly how QTSurfer computes it.
order: 9
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T18:29:00Z'
---

The **Sharpe ratio** compares what a strategy earned with how much its returns varied while
earning it. It is the most quoted single figure in strategy evaluation, and the most frequently
misread, because its value depends on choices that are rarely stated next to the number: which
return series, over what period, annualised or not, against which benchmark.

Two Sharpe ratios are comparable only when those choices match. Most disagreements about whether
"a Sharpe of 1.2 is good" are disagreements about conventions, not about the strategy.

## Calculation

For a series of periodic returns `r₁ … rₙ` and a risk-free rate `r_f` over the same period:

```text
Sharpe = mean(r − r_f) / stdev(r − r_f)
```

The numerator is the average excess return; the denominator is the standard deviation of those
returns, a measure of how much they scatter around the average. A higher value means more return
per unit of variability.

Practitioners usually annualise the figure so strategies with different sampling frequencies can
be compared. If returns are sampled `N` times per year and are independent of each other:

```text
Sharpe_annual ≈ Sharpe_period · √N
```

Daily returns use `√252` (trading days) or `√365` (markets that never close); monthly returns use
`√12`. The independence assumption is doing real work in that formula: overlapping or
autocorrelated returns make it wrong, sometimes badly.

### Per-trade versus per-period

A Sharpe ratio can be computed from **calendar-period** returns (daily, weekly) or from
**per-trade** returns (one observation per closed trade). They are different statistics:

- Per-period Sharpe includes the flat stretches when the strategy held no position, and reflects
  the experience of holding the account through time.
- Per-trade Sharpe measures the consistency of the trades themselves, ignoring how they are spaced.
  Its sample size is the trade count, not the date range.

A per-trade Sharpe of `0.3` from a strategy that trades 200 times a year and a daily annualised
Sharpe of `1.5` may describe the same strategy. Neither is wrong; they answer different questions.

### Worked example

A strategy closes eight trades with these returns, in percent:

```text
+1.2  −0.8  +0.9  +2.1  −1.5  +0.6  +1.8  −0.3

mean    = 0.50 %
stdev   = 1.19 %
Sharpe  = 0.50 / 1.19 = 0.42   (per trade, no risk-free adjustment)
```

Eight observations make this a rough estimate: one more losing trade of `−2 %` moves it to
`0.16`. The trade count is part of the reading.

## Interpreting it

- **It rewards consistency, not size.** A strategy that earns `0.2 %` on every trade has an
  enormous Sharpe ratio and a modest return. Read it with total return and drawdown.
- **It treats upside and downside variability alike.** A strategy with occasional large gains is
  penalised for them. The [Sortino ratio](/learn/glossary/sortino-ratio) uses only downside
  deviation and avoids that.
- **It assumes returns are roughly symmetric.** Strategies with rare large losses (short
  volatility, tight stops that occasionally gap) show a high Sharpe until the loss arrives. Skewness
  and kurtosis matter, and the deflated Sharpe ratio adjusts for them.
- **It is inflated by selection.** The best Sharpe among many trials overstates the underlying
  edge. See [Overfitting](overfitting) for how much.

## Common mistakes

- **Comparing across conventions.** An annualised daily Sharpe from one platform against a
  per-trade Sharpe from another says nothing.
- **Annualising a short window.** Multiplying a two-week result by `√26` produces an impressive
  number from almost no evidence.
- **Reading a high Sharpe on few trades as skill.** Small samples produce extreme values by chance.
- **Treating the risk-free rate as irrelevant.** At meaningful interest rates, omitting it inflates
  every strategy equally and makes weak ones look positive.
- **Optimising for Sharpe alone.** A sweep ranked purely by Sharpe drifts towards strategies that
  trade rarely and cautiously in the sample. Plateau ranking and trade floors exist for this
  reason.

## The Sharpe ratio in QTSurfer

QTSurfer computes the Sharpe ratio from **per-trade returns**: each closed trade contributes one
return, expressed as a percentage of the capital involved, net of fees. The ratio is the mean of
those returns divided by their standard deviation. It is **not annualised** and includes no
risk-free adjustment, so it should be compared with other QTSurfer results, not with annualised
figures from elsewhere. A backtest with fewer than two trades, or with identical returns on every
trade, reports `0`.

The Sortino ratio follows the same construction with downside deviation in the denominator, and
reports `0` when no trade lost money: a strategy with no losses in the sample shows a zero Sortino,
not an infinite one, so read it alongside the win rate and trade count. A trade counts as a win
only when its profit is strictly positive; a break-even trade is a loss.

CAGR is computed from the equity path rather than from trade returns: the ratio of final to
initial equity, annualised over the time between the first and last trade using years of 365.25
days. Windows shorter than one year are deliberately **not** annualised, because extrapolating a
few weeks to a full year produces meaningless magnitudes; for those the figure equals the plain
total return.

In a parameter sweep, Sharpe and Sortino are two of the four objectives a leaderboard can rank
by. Because the winning Sharpe of a sweep is a selected maximum, each row also carries a
**deflated Sharpe ratio**: the probability that the trial's Sharpe reflects real edge given the
number of trials, the sample length, and the skewness and kurtosis of its returns. Values above
roughly `0.95` survive the correction; values at or below `0.5` are what the best of a pile of
random trials would show.

## Related concepts

- [Overfitting](overfitting) — why the best Sharpe in a search is biased upward.
- [Drawdown](drawdown) — the risk dimension Sharpe does not capture.
- [Parameter sweep](parameter-sweep) — objectives, plateau ranking, and the deflated Sharpe ratio.
- Glossary: [Sharpe ratio](/learn/glossary/sharpe-ratio), [Sortino
  ratio](/learn/glossary/sortino-ratio), [Deflated Sharpe ratio](/learn/glossary/dsr),
  [CAGR](/learn/glossary/cagr).
- Developer guides: [Running a backtest](/docs/developers/api/backtest_execute), [Parameter
  sweeps](/docs/developers/api/backtest_sweep).

## Further reading

- Sharpe, W. F. (1994). *The Sharpe Ratio*. Journal of Portfolio Management.
- Lo, A. W. (2002). *The Statistics of Sharpe Ratios*. Financial Analysts Journal. On why the
  `√N` annualisation fails for autocorrelated returns.
- Bailey, D. H. and López de Prado, M. (2014). *The Deflated Sharpe Ratio*. Journal of Portfolio
  Management.
