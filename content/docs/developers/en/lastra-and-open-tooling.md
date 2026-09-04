---
title: Lastra and open tooling
description: Read the market data QTSurfer serves outside the platform — the Lastra columnar format and its open-source readers for Python, DuckDB, TypeScript, and Java, converters to Parquet and CSV, and the streaming library behind the feed.
order: 7
lastUpdated: '2026-09-03T22:06:47Z'
---

The hourly market-data segments QTSurfer serves are files you can keep, query, and convert with
open-source tools. The format, the readers, and the converters are published under the
[QTSurfer organisation on GitHub](https://github.com/QTSurfer) under the Apache-2.0 licence. This
page shows the shortest path from a downloaded segment to a DataFrame, a SQL query, or a Parquet
file.

## The Lastra format

**Lastra** is a columnar file format for numeric time series. Each column carries its own codec,
chosen for the kind of data it holds:

| Column kind | Codec | Typical size |
|---|---|---|
| Timestamps at a regular cadence | Delta-varint | About one byte per value |
| Decimal prices and volumes | ALP (adaptive lossless floating-point) | A few bits per value at two decimals |
| Volatile measurements | Gorilla XOR, or Pongo (decimal-aware Gorilla) | |
| Strings, labels, JSON payloads | Variable-length, optionally ZSTD or gzip | |

A file holds a **series** section — regular rows sharing one timestamp column — and an optional
**events** section for sparse, independently timestamped records such as signals. Columns can carry
key-value metadata, for example an indicator's parameters. Every column has a CRC32 in the footer,
so a corrupted column fails loudly on access while the others remain readable. Larger files are
split into **row groups** with per-group timestamp ranges, which lets a reader skip the groups
outside a query window — including over HTTP range requests against a remote file.

Compression is lossless: values round-trip bit for bit across the Java, Python, and TypeScript
implementations. The wire format is specified in the format document of the reference
implementation, [lastra-java](https://github.com/QTSurfer/lastra-java).

## Getting a segment

Both hourly routes return a file. `format=lastra` is the default; `format=parquet` converts the same
segment on demand. See [Market data](/docs/developers/api/market_data) for the routes and the
`hour` parameter.

```bash
curl --fail --remote-name \
  "https://api.qtsurfer.net/v1/exchange/binance/tickers/BTC/USDT?hour=2026-01-15T10" \
  -H "Authorization: Bearer $QTSURFER_JWT"
```

Klines are much smaller than tickers; ask for the kline segment when bar-level data is enough.

## Python

[lastra-py](https://github.com/QTSurfer/lastra-py) is on PyPI as `lastra`. Columns are decoded on
demand into NumPy arrays; columns you do not read are not decompressed.

```python
from lastra import LastraReader

with open("binance_BTC-USDT_tickers_2026-01-15T10.lastra", "rb") as f:
    r = LastraReader.from_stream(f)
    ts = r.read_series_long("ts")          # numpy int64, epoch milliseconds
    close = r.read_series_double("close")  # numpy float64
```

The column names inside a segment come from the file itself; list `r.series_columns` to see them
before reading. Pandas, Polars, and Arrow adapters are on the project's roadmap; until then, build a
DataFrame from the arrays.

## DuckDB

[duckdb-lastra](https://github.com/QTSurfer/duckdb-lastra) is a DuckDB extension that reads
`.lastra` files as tables, with predicate pushdown on the timestamp so row groups outside a `WHERE`
range are never decoded.

```sql
LOAD lastra;

SELECT ts, close
FROM 'binance_BTC-USDT_tickers_2026-01-15T10.lastra'
WHERE ts BETWEEN 1768471200000 AND 1768472100000
LIMIT 100;
```

`read_lastra('file.lastra')` is the explicit table function behind the replacement scan.
Because DuckDB can read over HTTP, the same query works against a remote file with range requests.

## TypeScript

[lastra-ts](https://github.com/QTSurfer/lastra-ts) is on npm as `@qtsurfer/lastra`: a reader for
browsers and Node.js with zero-copy `Float64Array` output and Apache Arrow interop.

```typescript
import { LastraReader } from '@qtsurfer/lastra';

const buffer = await fetch('/data/btc-1h.lastra').then((r) => r.arrayBuffer());
const reader = new LastraReader(buffer);

const ts = reader.readSeriesLong('ts');
const close = reader.readSeriesDouble('close');
```

Converting to an Arrow table makes the data available to DuckDB-WASM and the usual browser
charting and analysis libraries.

## Java

[lastra-java](https://github.com/QTSurfer/lastra-java) is the reference implementation, with both
a writer and a reader, Java 11 and later, available through JitPack.

```java
LastraReader r = LastraReader.from(inputStream);
long[] ts = r.readSeriesLong("ts");
double[] close = r.readSeriesDouble("close");
```

For range queries, iterate the row groups and skip those whose `tsMin`/`tsMax` fall outside the
window; only the overlapping groups are decoded.

## Converting

[lastra-convert](https://github.com/QTSurfer/lastra-convert) is a command-line converter between
Lastra, Parquet, and CSV, with the format detected from the file extension. It ships as a fat JAR
and as native binaries for Linux, macOS, and Windows on each release.

```bash
lastra-convert segment.lastra segment.parquet   # Lastra → Parquet, ZSTD, lossless
lastra-convert segment.lastra segment.csv       # Lastra → CSV
lastra-convert data.parquet --smart             # Parquet → Lastra, codecs chosen per column
```

[lastra-convert-py](https://github.com/QTSurfer/lastra-convert-py) is the Python port, adding
Arrow as a source and target.

## The rest of the toolbox

- [alp-java](https://github.com/QTSurfer/alp-java) and [alp-py](https://github.com/QTSurfer/alp-py)
  implement the ALP codec on its own, bit-exact with each other, for use outside Lastra.
- [parquet-lite](https://github.com/QTSurfer/parquet-lite) reads and writes Parquet from Java
  without Hadoop dependencies. It is what makes the on-demand `format=parquet` conversion and the
  stored-signals Parquet files lightweight.
- [qtstreamx](https://github.com/QTSurfer/qtstreamx) is the JVM streaming library that normalises
  exchange WebSocket feeds into tickers, klines, and funding rates, with pluggable transports and
  codecs. It is the representation the platform's data is captured in, which is why a downloaded
  segment looks the way it does.

## Related pages

- [Market data](/docs/developers/api/market_data) — the routes that return segments.
- [Datasets](/docs/developers/api/datasets) — uploading your own history as CSV.
- Learn: [Historical market data](/learn/articles/historical-market-data) — tickers versus klines,
  cadence, coverage, and gaps.
