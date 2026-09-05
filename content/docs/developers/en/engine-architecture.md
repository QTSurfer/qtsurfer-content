---
title: Engine architecture
description: How the QTSurfer engine turns market data into strategy decisions and results — data sources, incremental indicators, window listeners, signals, execution pipelines, properties, and compilation.
order: 0.5
lastUpdated: '2026-09-05T10:47:57Z'
---

Every QTSurfer strategy runs inside the same engine, whether it is being backtested against
historical data or driven by a live feed. This page describes the parts of that engine a strategy
author interacts with, and the order in which they act on each market event. The class-level
reference is the [Java API documentation](/docs/developers/java-api); the hands-on guides start with
[Java strategies](/docs/developers/java-strategies).

## One event at a time

The engine is event-driven. A market event arrives, the strategy's indicators for that instrument
update, the strategy's logic runs, and any signals it emits are handed to an execution pipeline. In
a backtest the events come from a prepared historical session in chronological order; live, they
come from an exchange stream. The strategy code is the same in both cases, and it never sees an
event before its timestamp.

```text
market event (Ticker · Kline · FundingRate)
  → indicator group for that instrument updates (incremental)
  → window listeners fire when their window elapses
  → strategy logic reads indicators and state, emits signals
  → execution pipeline turns a Buy/Sell signal into an order
  → fills update balances and the yield metrics
```

## Data sources and base classes

A strategy extends one base class, chosen by the data it consumes. The three single-source bases
share the same model — indicator builder, window listeners, `StateStore`, signal emission — and
differ only in the payload their `update(...)` method receives:

| Base class | Event | Notes |
|---|---|---|
| `AbstractTickerStrategy` | `Ticker` | The most common source: last price, volume, top-of-book quotes. |
| `AbstractKlineStrategy` | `Kline` | Candles for the interval the strategy declares. OHLCV only. |
| `AbstractFundingRateStrategy` | `FundingRate` | One update per funding-rate change on perpetual markets. |

A single strategy instance sees every instrument it is subscribed to, each with its own indicator
group and state, so cross-instrument logic reads the other instruments' indicators rather than
running a separate strategy per instrument.

## Indicators

Indicators are **incremental**: each one keeps the state it needs and updates in constant time per
event, whatever its lookback. A 200-period average costs the same per tick as a 10-period one. This
is what makes tick-level backtests over long windows practical, and it is also why indicator values
are only meaningful once the indicator has seen enough events to be ready — every indicator reports
its warm-up state.

Indicators compose by decoration. Any indicator can be the input of another, so a smoothed
oscillator is a moving average whose input is the oscillator, and a normalised value is a transform
whose input is the raw one. The strategy declares its indicators once, by name, in a per-instrument
group; the engine creates one group per instrument and the strategy reads values back by the same
names.

```java
@Override
protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
    indicators
        .addPrice()
        .ema("fast", 20)
        .ema("slow", 50)
        .window("fast", WindowTime.s1, new CrossListener(indicators));
}
```

The catalogue — averages, oscillators, distance and volatility measures, arithmetic and
conditional operators, statistics — is described in [Java indicators](/docs/developers/java-indicators).

## Window listeners and state

Reacting to every tick is rarely what a strategy wants. A **window listener** is attached to an
indicator with a time window; it fires once per window with the previous and current values of that
indicator, which gives the strategy a fixed cadence to reason at and filters out intra-window
flicker. The listener has access to the whole indicator group and to the instrument's `StateStore`.

The `StateStore` is a per-instrument key-value store with typed counters, accumulators, and flags.
It is how a strategy remembers whether it is in a position, how many entries it has scaled into, or
which regime it last observed, without keeping mutable fields that would be shared across
instruments. [Strategy patterns](/docs/developers/strategy-patterns) shows the common uses.

## Signals

A strategy never places an order directly. It emits **signals**:

- `BuySignal` and `SellSignal` express a trade with its order configuration: market by default,
  optionally limit at the signal price, a maximum number of attempts, order flags, and a protective
  stop — fixed or trailing — that the engine arms after the entry fills.
- `InfoStrategySignal` records indicator values, diagnostics, and chart markers. It never causes a
  trade, and it is what makes a decision explainable afterwards.

Signals flow through the engine's event stream to an executor that routes them to the pipeline
owning that instrument's position. The details of each signal type and its options are in
[Signal emission](/docs/developers/api/strategy_coding).

## Execution pipelines

A pipeline is a small state machine that owns one position structure for one instrument and
decides what a signal means given the current state:

| Pipeline | Position structure |
|---|---|
| Single-entry long | Buy once, sell once. A buy while long is ignored; a sell while flat is ignored. |
| Single-entry short | Sell first, buy to cover. |
| Scaling-in long | Several buys accumulate a position; a sell closes part or all of it. |

Each pipeline has a backtest variant that simulates fills against the historical stream instead
of sending orders to an exchange. Protective stops declared on the entry signal are managed by the
pipeline after the fill. When a trade cycle completes, the pipeline reports the realised result to
the strategy's yield metrics, which is where Sharpe, Sortino, CAGR, drawdown, and the equity curve
come from — see the [metrics reference](/docs/developers/metrics-reference).

## Properties and parameters

Strategy parameters are declared as annotated fields:

```java
@StrategyProperty(name = "rsi.period", description = "RSI period", defaultValue = "14")
private int rsiPeriod;
```

The engine registers annotated fields when the strategy is constructed and applies the declared
default the first time the strategy is used — after the leaf class's own field initialisers have
run, so they cannot silently overwrite it. A value is injected straight into the field, or through a
JavaBean setter when one exists, which is where validation or clamping belongs. The field must not
be `static`, since sweep trials run in parallel and would share it, nor `final`.

Properties are what a backtest overrides and a sweep iterates over. Compiling a strategy returns
its declared properties, with defaults and any suggested ranges, so a caller can build a sweep
against known keys — see [Compiling a strategy](/docs/developers/api/strategy).

## Compilation and validation

Strategies are submitted as Java source and compiled on the platform, and the compiler diagnostics
come back verbatim when compilation fails. A compiled strategy's identity is derived from what the
code means, so reformatting does not create a new strategy.

Write ordinary Java for JDK 25. Modern syntax is supported — `var`, lambdas and method references,
switch expressions, records, pattern matching — so a strategy reads the way any other Java class
you would write today reads.

Java is where the platform starts, not where it stops: more languages and more ways to build a
strategy are on the way. This page will say so when they land.

Validation goes one step further than compilation: the engine instantiates the class and drives it
through a bounded synthetic series, so wiring faults such as a listener that never fires or an
indicator read before it is ready surface before the first real backtest. The verdict, together
with any notices the engine raised, is recorded against that compilation.

A running strategy can read the engine version it is executing on through `getEngineVersion()`
and its numeric accessors, which report the loaded engine rather than the one the strategy was
compiled against, and which fail closed when the version cannot be determined.

## Where to go next

- [Java strategies](/docs/developers/java-strategies) — the minimal template and the authoring model.
- [Strategy examples](/docs/developers/strategy-examples) — complete strategies for each pattern.
- [Backtest execution model](/docs/developers/backtest-execution-model) — how a compiled strategy
  becomes a result.
- [Java API documentation](/docs/developers/java-api) — the versioned class reference.
