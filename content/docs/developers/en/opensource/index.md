---
title: Open source
description: Index of the open-source projects QTSurfer publishes on GitHub — API clients and SDKs, the MCP server and strategy skills, the Lastra data format and its tooling, market-data streaming, a charting component, and the API contract and documentation.
order: 9
lastUpdated: '2026-10-07T17:36:06Z'
---

QTSurfer publishes the libraries, formats, and tools around the platform as open source under the
[QTSurfer organisation on GitHub](https://github.com/QTSurfer). This page indexes them: what each
project is for, where to find it, and which page of these docs covers it in more depth. Code is
published under the Apache-2.0 licence; the documentation prose in `qtsurfer-content` is CC BY 4.0.
Each repository's README states its own terms, and is the authority for them.

## Clients and SDKs

Talk to the QTSurfer API from your own code. The SDKs wrap the API in complete workflows; the API
clients are generated from the OpenAPI contract and map one to one onto its endpoints. See
[Clients and SDKs](/docs/developers/clients-and-sdks) for how to choose between them.

- [sdk-java](https://github.com/QTSurfer/sdk-java) — the Java SDK. Authentication, the compile,
  prepare, and execute workflow with retries and cancellation, live execution over WebSocket, and
  normalised errors. Published through JitPack.
- [sdk-ts](https://github.com/QTSurfer/sdk-ts) — the TypeScript SDK, with the same workflow
  orchestration, a single-call backtest flow, and live execution. On npm as `@qtsurfer/sdk`.
- [sdk-python](https://github.com/QTSurfer/sdk-python) — the Python SDK, with workflow
  orchestration, token refresh on expiry, and a pluggable token store. On PyPI as `qtsurfer-sdk`.
- [api-client-java](https://github.com/QTSurfer/api-client-java) — the generated Java client for the
  REST API. Published through JitPack.
- [api-client-ts](https://github.com/QTSurfer/api-client-ts) — the generated TypeScript client:
  fully typed, tree-shakeable, built on the native `fetch`. On npm as `@qtsurfer/api-client`.
- [api-client-python](https://github.com/QTSurfer/api-client-python) — the generated Python client.
  On PyPI as `qtsurfer-api-client`.

## AI assistants

- [mcp-java](https://github.com/QTSurfer/mcp-java) — the QTSurfer Model Context Protocol server. It
  exposes account, live execution, backtesting, and market data as tools to any MCP-capable
  assistant over standard input and output. Installation and the tool list are in
  [MCP server](/docs/developers/mcp-server).
- [strategy-skills](https://github.com/QTSurfer/strategy-skills) — agent skills for writing, reviewing,
  and debugging QTSurfer strategies in Java and in QTScript. They follow the open Agent Skills
  format, so they work with Claude Code, Codex, Cursor, Cline, and other agents that support it. The
  [strategy guides](/docs/developers/java-strategies) in these docs are generated from them.

## Lastra and data formats

The hourly market-data segments QTSurfer serves are files you can keep, query, and convert. The
Lastra format, its readers and writers, and the converters are open. See
[Lastra](/docs/developers/opensource/lastra) for the shortest path from a
downloaded segment to a DataFrame, a SQL query, or a Parquet file.

- [lastra-java](https://github.com/QTSurfer/lastra-java) — the reference implementation of
  **Lastra**, a columnar file format for numeric time series with a codec per column, row groups,
  and CRC32 integrity checks. It also holds the specification of the wire format. Published through
  JitPack.
- [lastra-py](https://github.com/QTSurfer/lastra-py) — a Python reader and writer, bit-exact with the
  Java implementation. On PyPI as `lastra`.
- [lastra-ts](https://github.com/QTSurfer/lastra-ts) — a TypeScript reader for the browser and
  Node.js, with Apache Arrow interoperability. On npm as `@qtsurfer/lastra`.
- [duckdb-lastra](https://github.com/QTSurfer/duckdb-lastra) — a DuckDB extension that queries
  `.lastra` files as tables with timestamp pushdown, including remote files over HTTP range requests.
- [lastra-convert](https://github.com/QTSurfer/lastra-convert) — a command-line converter, with a Java
  API, between Lastra, Parquet, and CSV.
- [lastra-convert-py](https://github.com/QTSurfer/lastra-convert-py) — the Python counterpart, which
  also converts Apache Arrow. On PyPI as `lastra-convert`.
- [alp-java](https://github.com/QTSurfer/alp-java) — a dependency-free Java implementation of ALP,
  the adaptive lossless floating-point compression that Lastra uses for decimal columns such as
  prices. It follows the published algorithm of Afroozeh and Boncz (SIGMOD 2024).
- [alp-py](https://github.com/QTSurfer/alp-py) — the Python implementation of ALP, byte-compatible
  with `alp-java`. On PyPI as `alp-codec`.
- [parquet-lite](https://github.com/QTSurfer/parquet-lite) — a Java library to read and write Apache
  Parquet files without the Hadoop dependency tree. It is a fork of
  [strategicblue/parquet-floor](https://github.com/strategicblue/parquet-floor). Published through JitPack.

## Market-data streaming

- [qtstreamx](https://github.com/QTSurfer/qtstreamx) — normalised market-data streaming for the JVM.
  Exchange WebSocket feeds and on-chain Uniswap swaps sit behind one set of interfaces and one
  record model (tickers, klines, funding rates, trades), and the codec, WebSocket client, and
  transport are separate modules you can swap.

## Visualisation

- [svelte-timeseries](https://github.com/QTSurfer/svelte-timeseries) — a Svelte component for
  exploring very large time series in the browser. It reads Parquet, Arrow, and Lastra through
  DuckDB-WASM, and renders with either Apache ECharts or TradingView Lightweight Charts, with
  markers and events overlaid. On npm as `@qtsurfer/svelte-timeseries`, with a
  [live demo](https://qtsurfer.github.io/svelte-timeseries).

## API contract and documentation

- [qtsurfer-api](https://github.com/QTSurfer/qtsurfer-api) — the OpenAPI specification, the
  AsyncAPI contract of the live-execution WebSocket, and the Markdown guides behind the
  [API section](/docs/developers/api) of these docs. The interactive reference is published at
  [qtsurfer.github.io](https://qtsurfer.github.io).
- [qtsurfer-engine-java-docs](https://github.com/QTSurfer/qtsurfer-engine-java-docs) — the published
  Java API reference for the types a strategy author uses: strategy base classes, the market-data
  model, the indicator catalogue, and the fee, slippage, and fill models. It is browsable on this
  site as the [Java API reference](/docs/developers/java-api).
- [qtsurfer-content](https://github.com/QTSurfer/qtsurfer-content) — the source of the documentation,
  Learn articles, and glossary on this site, in every published language. It accepts corrections as
  pull requests.
