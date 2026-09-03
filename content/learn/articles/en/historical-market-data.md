---
title: Historical market data
description: Learn what historical market data a backtest actually consumes, how tickers differ from candles, why cadence and coverage change results, and how QTSurfer stores and serves exchange history.
order: 13
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

A backtest is only as honest as the data it replays. **Historical market data** is the record of
what an exchange published in the past: prices, trades, quotes, and the bars derived from them. Which
record a strategy consumes, at what resolution, and with what gaps determines what the simulation can
and cannot claim.

Most backtesting errors that are not strategy bugs are data errors: a bar treated as tradable at its
open, a missing hour read as a flat market, a resolution too coarse for the entry logic, or a symbol
list that only contains the instruments that survived.

## Tickers and candles

Exchanges publish several kinds of history, and they are not interchangeable.

- **Ticker events** are the finest record most platforms keep: each update carries a timestamp, a
  last price, and typically volume and top-of-book quotes. A strategy replayed on tickers reacts to
  each update in the order it arrived.
- **Klines**, or candles, aggregate a fixed interval into open, high, low, close, and volume. They
  are compact and fast, and they discard the order of events inside the interval. A candle says the
  high and the low happened; it does not say which came first.
- **Exchange-native klines** are the candles the exchange itself computed. Candles rebuilt from
  tickers can differ slightly, because ticker feeds sample the market rather than record every trade.

The choice shapes what the strategy can see. An entry condition that triggers inside a candle is
being evaluated on information the candle only reveals at its close; see
[Look-ahead bias](look-ahead-bias) for why that matters.

## Cadence

**Cadence** is the interval at which the simulation advances. Coarser cadence means fewer events,
faster runs, and less faithful fills; finer cadence means the opposite. Two rules keep it honest:

- A cadence coarser than the source must be an exact multiple of it. Resampling one-second data to
  five minutes is well defined; resampling it to seven seconds is not.
- A cadence finer than the source cannot be manufactured. One-minute bars do not contain the
  information needed to simulate a one-second strategy, whatever interpolation is applied.

Cadence is also a research variable. A strategy whose result changes materially between one-minute
and five-minute cadence is telling you that its edge lives in the microstructure, or that its fills
are unrealistic at one of the two.

## Coverage and gaps

No historical record is complete. Exchanges go down, feeds reconnect, and quiet instruments produce
no events for long stretches. The important distinction is between a **gap** in the record and a
**quiet hour** in the market: the first is missing data, the second is real data that happens to be
empty.

A useful data service reports coverage explicitly rather than silently filling holes. Coverage is
best expressed as a ratio of periods with data over periods expected, with a reason attached to each
empty period, so the researcher can decide whether a result over a `99.4 %` covered window is
acceptable for the question being asked.

Two subtler coverage problems deserve attention:

- **Survivorship.** A catalogue that only lists instruments currently trading omits everything that
  was delisted. A strategy backtested on that catalogue never sees the failures.
- **Segment mixing.** Spot and futures markets for the same pair are different instruments with
  different prices, funding, and liquidity. Coverage windows are independent per segment.

## Common mistakes

- **Trading at the candle open on information from its close.** The most common form of look-ahead
  and the easiest to introduce by accident.
- **Reading a missing hour as a flat market.** An empty hour usually means low activity, and
  sometimes means a feed outage. The two need different handling.
- **Ignoring timestamp semantics.** Event time, exchange time, and receipt time can differ by
  seconds under load. Backtests should use the time the market produced the event.
- **Assuming one exchange's history describes another.** The same pair on two venues has different
  prices, spreads, and hours of activity.
- **Testing on the cadence that makes the result look best.** Cadence should follow the strategy's
  decision frequency, chosen before the sweep, not after.

## Historical market data in QTSurfer

QTSurfer manages exchange history and exposes it through the same API a backtest uses. The exchange
catalogue lists each instrument with its current price and volume and, separately, the coverage
windows available for tickers and for klines, per `spot` or `futures` segment. Coverage is live
platform state, not a promise that every timestamp is available forever.

Preparing a backtest selects an instrument, a date range, and a cadence from one second up to
quarterly; coarser cadences must be exact multiples of the source. The prepared session reports a
`coverageRatio` (hours with data over total hours) and lists every empty hour with a rationale:
`low_activity`, `pending_conversion` (poll again), or `unknown`. A missing hour usually means low
activity, not missing data, so the recommended pattern is to execute once coverage clears a chosen
threshold rather than wait for hours that may never arrive.

History is stored and served one UTC hour at a time. Each hourly segment can be downloaded as raw
ticker events or as exchange-native klines, in QTSurfer's own **Lastra** columnar format or converted
on demand to Parquet.

Lastra is open source. It is a columnar time-series file format with per-column codecs chosen for
market data: ALP compression for decimal prices, delta-varint for regular timestamps, and ZSTD or
gzip for binary payloads, with a CRC32 per column so a corrupted column fails loudly while the rest
stays readable. Row groups carry timestamp ranges, so a reader can skip the parts of a file outside
its query window, including over HTTP range requests. Readers and writers exist for Java, Python,
and TypeScript, a DuckDB extension queries `.lastra` files directly with SQL, and a converter
round-trips between Lastra, Parquet, CSV, and Arrow. The format and the tooling are published under
the QTSurfer organisation on GitHub.

For data QTSurfer does not manage, a **dataset** can be uploaded as CSV: a header row, a `timestamp`
column in ISO-8601 or epoch seconds, milliseconds, or microseconds, a `close` column, and optional
open, high, low, volume, and quote columns. Cadence and timestamp unit are discovered from the data
rather than declared, ingestion reports the discovered range, cadence, and gap count, and the
dataset is then prepared and executed exactly like a managed exchange.

## Related concepts

- [Backtesting](backtesting) — what the simulation over this data measures.
- [Look-ahead bias](look-ahead-bias) — the data-timing leak that candles make easy.
- Developer guides: [Market data](/docs/developers/api/market_data),
  [Datasets](/docs/developers/api/datasets), [Running a backtest](/docs/developers/api/backtest_execute).
