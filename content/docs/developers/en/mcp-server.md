---
title: MCP server
description: Run QTSurfer from an AI assistant — install the Model Context Protocol server, connect it to Claude Code or Codex with an API key, and use its tools for market data, datasets, strategies, backtests, sweeps, and live runs.
order: 8
lastUpdated: '2026-10-27T14:53:20Z'
---

The QTSurfer MCP server exposes backtesting and market data as tools over the
[Model Context Protocol](https://modelcontextprotocol.io), so an MCP-capable assistant can list
exchanges, submit a strategy, run a sweep, and read the results without leaving the conversation.
It is published as [QTSurfer/mcp-java](https://github.com/QTSurfer/mcp-java) under Apache-2.0,
speaks JSON-RPC 2.0 over standard input and output, and is backed by the
[Java SDK](https://github.com/QTSurfer/sdk-java), which handles authentication and the compile,
prepare, execute orchestration with retries and cancellation.

## Install

On Linux and macOS the installer detects the platform and picks a native binary (Linux x86_64,
Apple Silicon) or a fat JAR with a wrapper script (other architectures, Java 21 or later):

```bash
curl -fsSL https://raw.githubusercontent.com/QTSurfer/mcp-java/main/install.sh | bash
```

On Windows:

```powershell
irm https://raw.githubusercontent.com/QTSurfer/mcp-java/main/install.ps1 | iex
```

The fat JAR runs anywhere with JDK 21 or later, and a Docker image is published as
`ghcr.io/qtsurfer/mcp-java`. Each release on GitHub carries all three deliveries; pin a version with
the `VERSION` variable when reproducibility matters.

## Authentication

Generate a long-lived API key in the QTSurfer web application and hand it to the server through the
`QTSURFER_APIKEY` environment variable or the `--apikey` option. On startup the server exchanges the
key for a short-lived token and refreshes it for the lifetime of the process. If the key is missing
or rejected, the server exits with a clear error before exposing any tools, so the failure shows
up in the assistant's server list rather than as a confusing tool error later.

Create the key with the scopes the work needs. The API refuses an operation whose scope the key
does not carry (`403`, `insufficient_scope`), and a key with no scopes is refused when it is
exchanged for a token. [Authentication and scopes](/docs/developers/api/auth) lists the scope each
operation requires.

## Connect an assistant

Claude Code reads `~/.claude.json`:

```json
{
  "mcpServers": {
    "qtsurfer": {
      "type": "stdio",
      "command": "/path/to/qtsurfer-mcp",
      "env": { "QTSURFER_APIKEY": "<your-api-key>" }
    }
  }
}
```

OpenAI Codex reads `~/.codex/config.toml`:

```toml
[mcp_servers.qtsurfer]
command = "/path/to/qtsurfer-mcp"

[mcp_servers.qtsurfer.env]
QTSURFER_APIKEY = "<your-api-key>"
```

For the fat JAR, the command is `java` with `-jar /path/to/qtsurfer-mcp-java.jar` as arguments;
for Docker, `docker run -i --rm -e QTSURFER_APIKEY ghcr.io/qtsurfer/mcp-java:latest`. Any other
MCP client that supports stdio servers is configured the same way.

## Tools

| Area | Tools | What they do |
|---|---|---|
| Account | `get_account`, `get_account_usage` | Read the plan's limits, the scopes of the API key, and the current use of storage. |
| Market data | `list_exchanges`, `list_instruments`, `list_pools`, `download_tickers`, `download_klines` | Discover exchanges and their segments, instruments with their coverage windows, and DEX pools; stream one UTC-hour segment to a local file. |
| Datasets | `upload_dataset`, `import_dataset`, `get_dataset_import`, `list_datasets`, `get_dataset`, `get_dataset_upload`, `finalize_dataset_upload`, `delete_dataset` | Create or version a dataset from a local CSV or Parquet file, or import the history of an exchange or a pool into one; poll its ingest or its import, and manage it. |
| Strategies | `compile_strategy`, `list_strategies`, `get_strategy_code`, `delete_strategy` | Register source and read the properties it declares and the plan capabilities it requires; inspect and release the strategies registered under the account. |
| Backtests | `submit_backtest`, `get_job_status`, `get_equity_curve`, `list_jobs` | Compile Java source and run it against an instrument or a ready dataset; read metrics and a downsampled equity curve. |
| Sweeps | `submit_sweep`, `get_sweep_status`, `get_sweep_sensitivity`, `get_sweep_run_equity_curve`, `cancel_sweep` | Run a parameter grid, optionally walk-forward validated; read the plateau-ranked leaderboard, sensitivity marginals, and retained curves. |
| Live | `start_live`, `get_live`, `get_live_run`, `list_live`, `list_public_live`, `update_live`, `update_live_params`, `send_live_command`, `get_live_signals`, `rotate_live_stream`, `revoke_live_stream`, `stop_live` | Start a strategy's live run, follow its state, change its metadata and parameters, send it a command, read its retained signals, manage its signal stream, and stop it. |

`submit_backtest` takes the full Java source of the strategy class as `strategyCode`; compilation
happens on the platform. For a dataset run, pass `datasetId` and omit the exchange and instrument.
`submit_sweep` blocks until the platform has compiled the strategy, prepared the session, and
accepted the sweep, which on a long window takes as long as the preparation does.

A sweep through MCP is the same object as a sweep through the API, which matters because it is not
a loop of backtests: the leaderboard is plateau-ranked, each row carries a deflated Sharpe ratio, the
sweep reports a probability of backtest overfitting, walk-forward folds are scored out of sample, and
the sensitivity marginals say whether an axis moved the objective at all. See
[Parameter sweeps](/docs/developers/api/backtest_sweep) for the semantics.

`compile_strategy` registers the source and reports the properties it declares and the plan
capabilities it requires, such as `indicators.pro`. Registering is accepted on any plan; running a
strategy whose requirements the plan does not include is refused with `402`, which carries an
upgrade address when the platform has one and cannot succeed on retry until the plan changes
([the pro indicators and your plan](/docs/developers/api/qtscript#the-pro-indicators-and-your-plan)).

`import_dataset` brings the history of an exchange or a pool into a dataset, and
`get_dataset_import` polls it. The import reports the cadence in effect, which is the plan's default
when none is requested ([Cadences by plan](/docs/developers/api/backtest_execute#cadences-by-plan)).

The live tools drive the same runs as the [live API](/docs/developers/api/live). A first run of a
strategy starts in a sandbox trial before it goes live, and `sandboxMinutes` asks for a longer one;
`stream=true` asks for a secret plain-WebSocket address for the signals, which is to be treated as a
password.

## Local files: uploads and downloads

Dataset upload and market-data download touch the local filesystem, so each is disabled until it
is given a root directory: `--upload-root` (or `QTSURFER_UPLOAD_ROOT`) for readable dataset files
and `--download-root` (or `QTSURFER_DOWNLOAD_ROOT`) for writable segment output. Paths are
canonicalised and must stay under their root; symlink and traversal escapes are rejected; downloads
are written through a temporary file and never overwrite an existing one unless asked. The upload
tool returns dataset and ingest identifiers only, never the short-lived storage URL.

With Docker, mount the upload directory read-only and a separate download directory writable:

```bash
docker run -i --rm -e QTSURFER_APIKEY \
  -e QTSURFER_UPLOAD_ROOT=/uploads -e QTSURFER_DOWNLOAD_ROOT=/downloads \
  -v "$PWD/datasets:/uploads:ro" -v "$PWD/exports:/downloads" \
  ghcr.io/qtsurfer/mcp-java:latest
```

## A typical session

```text
> list_exchanges
> list_instruments exchangeId=binance
> submit_backtest exchangeId=binance instrument=BTC/USDT from=2026-05-10 to=2026-05-16 strategyCode=<Java source>
> get_job_status jobId=<id>
> submit_sweep exchangeId=binance instrument=BTC/USDT from=2026-01-01 to=2026-03-31 params={"rsiPeriod":{"from":7,"to":28,"step":1}}
> get_sweep_status sweepId=<id>
> get_sweep_sensitivity sweepId=<id>
```

The assistant fills in the strategy source, usually generated against the
[strategy skill](https://github.com/QTSurfer/strategy-skills), and reads the results back as text.
Metrics follow the [metrics reference](/docs/developers/metrics-reference); the server renders
ratios as percentages in its summaries for readability.

## Options

```text
--url    <base-url>    API base URL (default: https://api.qtsurfer.net/v1)
--apikey <key>         Long-lived API key (default: QTSURFER_APIKEY)
--upload-root <dir>    Permit dataset upload files only beneath this directory
--download-root <dir>  Permit market-data output only beneath this directory
--stub                 In-memory stub, no backend required
```

The stub mode runs the tool surface against in-memory data, which is enough to check an assistant's
configuration before spending an API key.

## Related pages

- [Java strategies](/docs/developers/java-strategies) — the strategy model the assistant writes against.
- [Backtest execution model](/docs/developers/backtest-execution-model) — what the tools orchestrate.
- [Clients and SDKs](/docs/developers/clients-and-sdks) — the SDK the server is built on.
