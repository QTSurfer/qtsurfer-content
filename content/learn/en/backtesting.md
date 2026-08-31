---
title: Backtesting
description: Learn what a trading-strategy backtest measures, which assumptions matter, and how to interpret historical results without mistaking them for a forecast.
order: 1
kind: concept
author: QTSurfer
datePublished: '2026-08-31'
lastUpdated: '2026-08-31T20:06:27Z'
---

A **backtest** applies a fixed trading strategy to historical market data and simulates the decisions
that the strategy would have made over that period. It is an experiment about a precisely defined
strategy, dataset, and execution model—not a prediction of future profit.

## What a backtest can answer

A well-specified backtest can help you investigate questions such as:

- Did the strategy's rules produce signals in the expected situations?
- How did returns and drawdowns evolve through different market conditions?
- How frequently did the strategy trade?
- How sensitive was the result to fees, slippage, or parameter values?
- Did a code change improve one period while making another period worse?

These answers are meaningful only when the strategy revision and every relevant input are known. A
headline return without its dataset, dates, costs, parameters, and execution assumptions is not a
reproducible result.

## The experiment behind the number

A basic backtest proceeds in chronological order:

1. Load the market information available at the current simulation time.
2. Update indicators using only information available at that time.
3. Let the strategy evaluate its rules and emit signals.
4. Apply the execution model, including fees and any simulated slippage.
5. Update positions, cash, and equity.
6. Move to the next event without allowing later data to influence an earlier decision.

Suppose a strategy buys when a 20-period exponential moving average rises above a 50-period average
and sells when it falls below. The crossover rule alone does not define the experiment. You must also
specify the candle interval, instrument, exchange data, test dates, starting capital, order timing,
fees, and how an order is filled when a signal occurs.

## Returns and equity

For equity `E(t)` at time `t`, a simple period return is:

```text
return(t) = (E(t) - E(t-1)) / E(t-1)
```

The final return is useful, but it hides the path taken to reach it. Two backtests can finish with the
same return while exposing the trader to very different drawdowns, volatility, holding periods, and
trade concentrations. Inspect the equity curve and the underlying trades rather than treating one
aggregate metric as the result.

## Assumptions that commonly change the outcome

### Trading costs

Fees compound across trades. A strategy with a small average edge and high turnover can look viable
before costs and unprofitable after them.

### Slippage and fills

A signal price is not automatically an executable price. Liquidity, spread, order type, latency, and
bar resolution affect the price at which a simulated order should fill.

### Data quality

Missing intervals, duplicate observations, incorrect timestamps, symbol changes, and incomplete
market coverage can all alter signals. Record the dataset identity and validate it before comparing
runs.

### Information timing

The strategy must not use a closing price to trade earlier in the same interval, or use any other
value that was unknown at decision time. This failure is called
[look-ahead bias](./look-ahead-bias).

### Parameter selection

Trying many parameter combinations and reporting only the winner turns the test period into part of
the training process. The winning result needs validation on data that did not choose it.

## A practical review checklist

Before trusting a backtest enough to continue investigating it, ask:

- Is the exact strategy revision immutable and recoverable?
- Are the exchange, instrument, market segment, interval, and date range recorded?
- Were indicators warmed up before their values were used?
- Could every input have been known at the simulated decision time?
- Are fees, spread, slippage, and fill assumptions plausible?
- Are rejected or unfilled orders represented rather than silently treated as fills?
- Does performance depend on a small number of trades or one market regime?
- Were parameters selected on the same data used to report performance?
- Can another person run the same inputs and obtain the same result?

## Backtesting in QTSurfer

QTSurfer strategies are revisioned, and a backtest points to a specific revision. Keep the revision,
dataset, configuration, and resulting metrics together when comparing experiments. Use the detailed
result to inspect the equity path and individual decisions, then change one controlled input at a time
when testing an explanation.

The [product backtesting guide](/docs/app/backtesting) explains the application workflow. The
[developer documentation](/docs/developers) covers strategy construction and signal emission.

## The right conclusion

A backtest can reject an idea, expose implementation mistakes, and show how a strategy behaved under
specified historical conditions. It cannot establish that the same behaviour will continue. Treat it
as evidence in an iterative research process, not as proof of future performance.
