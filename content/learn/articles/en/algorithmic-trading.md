---
title: Algorithmic trading
description: Learn what algorithmic trading is, how it relates to quantitative strategies, what a trading system needs beyond the signal, and why the gap between backtest and live execution exists.
order: 15
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T18:29:00Z'
---

**Algorithmic trading** is the execution of trading decisions by a program rather than by a person
placing orders. The program may decide *what* to trade, *when*, and *how*, or only the last of the
three; the term covers everything from a script that splits a large order into pieces to a system
that runs a strategy end to end without intervention.

It is often used interchangeably with *quantitative trading*, and the overlap is large, but the
emphasis differs. A [quantitative strategy](quantitative-strategy) is about the decision rule and
its evidence. Algorithmic trading is about turning decisions into orders reliably, at the right
price, under conditions the backtest never saw.

## The spectrum

- **Execution algorithms** take a decision made elsewhere and work the order: time-weighted or
  volume-weighted slicing, participation targets, iceberg orders. Their goal is to minimise
  [slippage](slippage) and impact, not to predict direction.
- **Systematic strategies** generate the decisions themselves from a rule, and execute them with
  simple order logic. Most retail and prosumer algorithmic trading lives here.
- **High-frequency trading** competes on latency, holding positions for seconds or less. It is a
  different engineering discipline with different infrastructure, and most of its edge is
  inaccessible without co-location and direct market access.

The families are distinguished by holding period and by what the edge depends on, which in turn
decides what the system has to be good at.

## What a trading system contains

The signal is one component of a system that has at least six:

1. **Market data ingestion.** A live feed, usually over WebSocket, normalised into the same
   representation the strategy was backtested on. Reconnects, gaps, and out-of-order events are
   the normal case, not the exception.
2. **Strategy evaluation.** The rule, computing indicators and state on each update and emitting
   signals.
3. **Order management.** Turning a signal into an order with a type, size, and flags; tracking
   acknowledgements, fills, partial fills, and rejections; retrying or cancelling.
4. **Position and balance tracking.** Knowing what is held, at what cost, and what is available,
   reconciled against the exchange rather than assumed from the order log.
5. **Risk controls.** Protective stops, exposure limits, maximum loss per day, and a kill switch
   that stops trading when the system's own assumptions are violated.
6. **Monitoring.** Logging every decision and fill so live behaviour can be compared with the
   backtest, and alerting when the two diverge.

A system that has the first two and improvises the rest will work until the first disconnection,
partial fill, or exchange outage, which is to say not for long.

## The backtest-to-live gap

A backtest assumes that every signal became a fill at the observed price. Live trading breaks that
assumption in several places at once:

- **Fills.** Market orders pay the spread and impact; limit orders may not fill. See
  [Slippage](slippage).
- **Latency.** The price the strategy reacted to is stale by the time the order arrives.
- **Partial fills and rejections.** A position can be half the intended size, or none, while the
  strategy believes it is full.
- **Data differences.** The live feed and the historical record are produced by different paths
  and can differ in timing, sampling, and gaps.
- **Outages.** The exchange, the connection, or the system itself goes down with a position open.
- **Regime change.** The market the strategy was tuned on is not the market it trades in.

None of these are reasons not to backtest. They are reasons to model costs pessimistically, to
validate out of sample, to paper-trade before committing capital, and to monitor live results
against the backtest's expectations from the first order.

## Order types and protective logic

The order types a system uses shape its risk:

- **Market** orders fill immediately at the available price; certainty of execution, uncertainty of
  price.
- **Limit** orders fill only at the stated price or better; certainty of price, uncertainty of
  execution. Flags such as good-till-cancelled, immediate-or-cancel, and fill-or-kill decide what
  happens to the unfilled part.
- **Stop** orders become market or limit orders when a trigger price is reached; they are the usual
  form of a protective exit.
- **Trailing stops** follow the favourable price extreme at a fixed distance and trigger on a
  retracement, locking in part of a move without a fixed target.

A protective exit expressed on the entry, "buy here, and exit if price falls five percent", is
safer than a separate stop order that the strategy has to remember to place and cancel.

## Common mistakes

- **Deploying a backtest.** Code that passed a historical simulation is not yet a trading system.
  It lacks reconciliation, error handling, and a kill switch.
- **Assuming the order log is the position.** Positions are what the exchange says they are.
- **No maximum loss.** A strategy that is wrong about the market can lose slowly; a system that is
  wrong about its state can lose everything quickly. Daily and per-position limits are not optional.
- **Trusting the live feed to match history.** Compare the two before trusting a signal computed on
  one to reproduce a backtest computed on the other.
- **Changing the strategy in production without re-testing.** Every edit is a new
  [revision](strategy-revision) that has not been backtested.

## Algorithmic trading in QTSurfer

QTSurfer's documented surface today is the research half of the loop: strategies, backtests, and
parameter exploration. The engine underneath is built so the same strategy code runs unchanged
against historical data and against a live feed: indicators update incrementally per event, and a
strategy expresses decisions as signals rather than as orders.

Those signals already carry the execution intent a live pipeline needs. A buy or sell signal
defaults to a market order at the strategy's reference price; it can be turned into a limit order,
given a maximum number of attempts and order flags, and can arm a protective stop, fixed or
trailing, that the engine manages after the entry fills. Information signals record indicator
values and chart markers alongside the trades, so a decision can be explained after the fact from
the same record in backtest and live.

The engine also provides execution pipelines for the common position structures: single-entry long
and short, and scaling into a position over several entries. Market data enters through a
normalised streaming layer that is published as open source under the QTSurfer organisation, so
the representation a strategy is backtested on is the one it would trade on.

## Related concepts

- [Quantitative strategy](quantitative-strategy) — the decision side, and the research loop.
- [Slippage](slippage) — the cost that separates simulated and live fills.
- [Backtesting](backtesting) — what a historical simulation can and cannot claim.
- [Strategy revision](strategy-revision) — why production changes need re-testing.
- Developer guide: [Signal emission and order options](/docs/developers/api/strategy_coding).
