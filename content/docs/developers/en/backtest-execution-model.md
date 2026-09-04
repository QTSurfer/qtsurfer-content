---
title: Backtest execution model
description: The mental model behind the backtest API — the three identities a run depends on, what each lifecycle stage guarantees, how polling and idempotency work, and what a result contains.
order: 5.8
lastUpdated: '2026-09-03T00:00:00Z'
---

The API guides document each endpoint. This page describes the model those endpoints share, so the
sequence of calls makes sense as a whole and the idempotency and polling rules stop being
surprising. Endpoint-level detail is in [Running a backtest](/docs/developers/api/backtest_execute),
[Parameter sweeps](/docs/developers/api/backtest_sweep), and [Datasets](/docs/developers/api/datasets).

## Three identities

Every backtest result depends on exactly three things, and each has its own identity:

| Identity | Created by | Identifies |
|---|---|---|
| `strategyId` | `POST /strategy` | The compiled code, by meaning. |
| Prepare `jobId` | `POST .../prepare` | One instrument, date range, and cadence of historical data — or one dataset version. |
| Execute `jobId` | `POST .../execute` | One run: a strategy on a prepared session with a given signal-storage and equity-curve configuration. |

The identities are derived from the request content, not generated at random. Submitting the same
source twice yields the same `strategyId`; preparing the same window twice yields the same prepare
job; executing the same strategy on the same session with the same options yields the same execute
job. A retry is therefore always safe: it returns the existing identity instead of doing the work
again. The corollary is that a *different* result needs a *different* input — changing only the
equity-curve transform on an execute request creates a new run, because the transform is part of
the identity.

## Lifecycle

```text
compile ──► validate ──┐
                       ├──► execute ──► poll ──► result
prepare ──► poll ──────┘
```

1. **Compile** turns Java source into a registered strategy and returns its declared properties.
   It answers one question only: is this valid Java.
2. **Validate** instantiates the compiled class against a bounded synthetic series and records a
   verdict. It is optional but cheap, and it catches wiring faults before they cost a real run.
3. **Prepare** loads a historical window into a session and reports its **coverage**: the share of
   expected hours that have data, and a rationale for each empty hour. A single-instrument prepare
   is always terminal; the decision to proceed is made from the coverage ratio, not by waiting for
   more data.
4. **Execute** runs the strategy over the session. Instrument and dates are recovered from the
   prepare job; they are not sent again.
5. **Poll** until the result is readable.
6. **Result** carries the job state, the yield metrics, the equity curve, engine notices, and,
   when requested, a pointer to the stored signals.

A sweep replaces step 4 with many runs over the same prepared session and adds its own polling and
result shape; everything before it is identical.

## Job states

A job's `state.status` moves through `New`, `Started`, and then one of `Completed`, `Aborted`,
or `Failed`. A single execute job can also report `Partial` while still running. The `completed`
counter is the number of events processed so far, which is the only progress signal a plain
execute exposes.

Two vocabularies coexist on sweeps: the sweep's own `status` (`RUNNING`, `COMPLETED`, `PARTIAL`,
`CANCELLED`) and the embedded `state.status` in the job vocabulary above. `PARTIAL` and
`CANCELLED` both map to `Aborted`, because a sweep's `PARTIAL` is terminal where a job's `Partial`
is not.

## Polling rules

- A `202` with an empty body means *not readable yet*. It is returned while the job runs **and**
  when a finished job's stored result cannot be read back, so a poll loop keys off `200` plus a
  terminal `state.status`, never off "no longer 202".
- Polling is not rate-limited by the result itself, but a client should back off: results are
  written once, and the interval between polls is the latency a client adds to its own answer.
- Cancellation is asynchronous. `DELETE` returns `cancelling`; the job reports `Aborted` once the
  worker has processed the request.

## What a result contains

| Part | Present when | Notes |
|---|---|---|
| `state` | Always | Job status, progress, timestamps. |
| Yield metrics | At least one trade was closed | Units and definitions in the [metrics reference](/docs/developers/metrics-reference). |
| `equityCurve` | Same condition as the metrics | One anchor point plus one point per closed trade, in the transform chosen at submit time. |
| `notices` | Something was raised | Diagnostics with a level, a code, and a message. **Absence means nothing was raised** — the one field where silence is an answer. A run with no trades usually explains itself here. |
| `signalsUrl` and related fields | `storeSignals: true` | A Parquet file with every emitted signal: indicator values and markers behind the aggregate curve. |
| `hostName`, `iops` | Always | Where the run executed and its throughput in instrument operations per second. |

The `strategyId` inside a result is the execution context id, of the form
`strategy:<user>:<strategyId>`; the segment after the last colon is the id that was compiled.

## Managed data and datasets

Two data paths lead to the same execute call:

- **Managed exchange.** `exchangeId` names a supported exchange, `instrument` a pair the catalogue
  covers, and coverage is measured in hours with data over hours expected.
- **Dataset.** `exchangeId` is the reserved value `user`, and `datasetId` (optionally pinned to a
  `datasetVersionId`) replaces the instrument. Coverage is measured as rows over the steps the
  discovered cadence implies, and a dataset-backed prepare does not consume worker capacity,
  because it reads an already-ingested file.

Once prepared, a dataset session behaves exactly like a managed one: the same execute, sweep, and
equity-curve endpoints, the same result shape.

## Limits and errors worth planning for

- `400` on prepare: the window starts before the lookback the account tier allows, ends in the
  future, requests a cadence finer than the source, or names a dataset still ingesting.
- `404` on execute: the prepare job expired. Prepared sessions are not kept forever; re-prepare.
- `429`: the global queue is at capacity, or the account has too many active runs. Back off and
  retry; the idempotent identities make the retry free.
- Sweep grids that exceed the server's run budget are rejected at submission, before any run
  starts.

## Related pages

- [Engine architecture](/docs/developers/engine-architecture) — what happens inside a run.
- [Metrics reference](/docs/developers/metrics-reference) — every field in a result.
- [Equity curves](/docs/developers/api/equity_curves) — shapes, transforms, and retention.
- [Clients and SDKs](/docs/developers/clients-and-sdks) — libraries that implement this model for you.
