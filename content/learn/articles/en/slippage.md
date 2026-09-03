---
title: Slippage
description: Learn what slippage is, where it comes from, how it combines with fees to erode a strategy's edge, and how to account for it in a backtest that cannot observe real fills.
order: 6
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T18:29:00Z'
---

**Slippage** is the difference between the price a strategy decided to trade at and the price it
actually obtained. A backtest sees a price and assumes a fill; a live order meets a spread, a queue,
a moving market, and a counterparty. The gap between the two is a cost, and for many strategies it
is the cost that decides whether the edge survives.

Fees are known in advance and easy to model. Slippage is neither, which is why it is the
assumption most often left out of a backtest and most often responsible for the difference between
the simulated and the live equity curve.

## Where slippage comes from

- **The spread.** A market buy fills at the ask, a market sell at the bid. A strategy that reasons
  from the last traded price or the mid price pays roughly half the spread on every side without
  ever seeing it.
- **Market impact.** An order larger than the liquidity resting at the best price walks the book.
  The larger the order relative to the venue's depth, the worse the average fill.
- **Latency.** Between the decision and the exchange acknowledging the order, the market moves.
  Fast markets and slow paths make this term dominant.
- **Volatility at the moment of trading.** Signals often fire when the market is moving, precisely
  when spreads widen and depth thins. Slippage is worst when the strategy most wants to trade.
- **Protective stops.** A stop that exits at market during a sharp move fills wherever the market
  is, which can be far from the stop level.

Limit orders avoid paying the spread but introduce a different cost: the order may not fill, and
the trades that fail to fill are disproportionately the ones that would have been profitable,
because the market ran away from the price.

## Why it compounds

Costs act on every trade and scale with trading frequency. Take a strategy whose average trade
earns `0.30 %` before costs:

```text
fee per side          0.10 %
slippage per side     0.05 %
round trip            2 × (0.10 + 0.05) = 0.30 %

net per trade         0.30 % − 0.30 % = 0.00 %
```

The strategy is profitable in a cost-free backtest and flat in reality. Halve the slippage
estimate and it keeps `0.05 %` per trade; double it and it loses money. The conclusion depends
entirely on a number the backtest cannot observe, which is why that number has to be chosen
deliberately and tested across a range.

## Estimating it

There is no universal figure. Reasonable starting points:

- **Liquid spot pairs, small orders**: half the typical spread per side, a few basis points on a
  major pair.
- **Less liquid pairs or larger orders**: half the spread plus an impact term that grows with order
  size relative to visible depth.
- **Stop exits and news-driven entries**: several times the calm-market estimate.

The honest approach is a sensitivity test: run the same strategy under two or three cost
assumptions and see where the conclusion changes. A strategy that survives a pessimistic cost
model is worth more than one that only works under the optimistic one.

## Common mistakes

- **Backtesting with zero costs, then "adding them later".** Costs change which parameters win, not
  just the final number. A parameter sweep run without costs selects the most active configuration,
  which is exactly the one costs punish most.
- **Assuming limit orders always fill.** Modelling a limit strategy with guaranteed fills removes
  its main risk from the simulation.
- **Using the closing price of a bar as the fill.** A decision taken at the bar's close cannot be
  executed at that price; the fill happens in the next bar, at a price the strategy did not see.
- **Ignoring the size of the account.** Slippage that is negligible for a small account becomes
  material when the same strategy trades size. A backtest fixes a capital figure; check the fills
  are plausible at that figure.
- **Modelling fees but not slippage.** Fees are the visible half of the cost. A model that stops
  there systematically overstates net performance.

## Slippage in QTSurfer

QTSurfer models trading costs explicitly through the fee configuration of a backtest. A
percentage fee applies per side, with separate buy and sell rates available, and the application
also supports an absolute fee per trade in quote currency that overrides the percentage. All
reported metrics, from profit to Sharpe ratio, are net of these fees.

Fills happen at the price the strategy passes when it emits a signal: the strategy's current
reference price by default, which for a ticker-driven strategy is the last observed price. The
signal defaults to a market order; a strategy can turn it into a limit order at that price, set a
maximum number of attempts, and attach order flags. Protective stops declared on the entry signal,
fixed or trailing, are managed by the engine and exit at market unless a stop-limit price is set.

There is no separate slippage parameter. The practical approach is to fold the expected slippage
into the per-side fee rate: a `0.10 %` fee and an expected `0.05 %` slippage become a `0.15 %` fee
rate. Because the fee rate is part of the backtest configuration rather than a strategy property,
a sensitivity test means running the same prepared dataset and strategy under two or three fee
assumptions and comparing the results, or the same sweep under each assumption.

Data resolution matters as much as the cost figure. Running on ticker events, the finest cadence
available, means each fill is evaluated at a price the market actually printed; a coarser cadence
hides the path inside each interval and makes the fill assumption weaker. Choose the cadence to
match the strategy's decision frequency, and treat any result that changes materially between
cadences as a warning that its edge lives in the microstructure.

## Related concepts

- [Backtesting](backtesting) — the assumptions that travel with every result.
- [Historical market data](historical-market-data) — cadence, tickers versus candles, and what a
  fill assumption can rest on.
- [Overfitting](overfitting) — why a cost-free sweep selects the configurations costs punish most.
- Developer guides: [Signal emission](/docs/developers/api/strategy_coding), [Parameter
  sweeps](/docs/developers/api/backtest_sweep).
- Product guide: [Backtesting](/docs/app/backtesting).
