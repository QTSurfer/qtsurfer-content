---
title: QTStreamX
description: Stream normalised crypto market data on the JVM — exchange WebSocket feeds and Uniswap swaps behind one set of interfaces, with the codec, WebSocket client, and transport as separate modules.
order: 9.2
lastUpdated: '2026-10-15T12:27:58Z'
---

**QTStreamX** is QTSurfer's open-source library for streaming market data on the JVM. It connects to exchange
WebSocket feeds and to on-chain Uniswap v2 and v3 pools, and gives you the same normalised records
whichever source they came from. It is published under the Apache-2.0 licence in the
[QTSurfer organisation on GitHub](https://github.com/QTSurfer/qtstreamx), and it needs JDK 25 or
later.

Exchange logic, WebSocket client, codec, and transport sit behind small interfaces, so you pick the
pieces that fit your stack and swap any of them without touching the rest. The project README is the
reference for every module; this page is the map.

## What you get

- **One record model.** Tickers, klines, funding rates, and DEX trades are Java records with
  microsecond timestamps. Instruments use a CCXT-style name: `BTC/USDT` for spot, `BTC/USDT:USDT`
  for a perpetual.
- **Seven exchanges.** Binance, Bybit, OKX, Kraken, Bitget, Gate.io, and HTX, with managed
  connection pools, reconnection, and instrument refresh.
- **Uniswap v2 and v3.** Confirmed, deduplicated swaps with HTTP catch-up and active/passive
  provider failover, turned into trades, last-price tickers, and one-second candles.
- **Pick your parts.** JSON or MessagePack codecs, the JDK's own WebSocket client or
  Java-WebSocket, and a NATS transport are each their own module.
- **Light by default.** The core module has no heavy dependencies, and the JDK WebSocket client has
  none at all.

## Modules

The library is a set of modules; add only the ones you need.

| Area | Modules |
|---|---|
| Core | `qtstreamx-core` — the records and the interfaces |
| Codecs | `qtstreamx-codec-json`, `qtstreamx-codec-msgpack` |
| WebSocket clients | `qtstreamx-ws-native` (JDK, no dependencies), `qtstreamx-ws-javaws` |
| Transport | `qtstreamx-transport-nats` |
| Exchanges | `qtstreamx-exchange-binance`, `-bybit`, `-okx`, `-kraken`, `-bitget`, `-gateio`, `-htx` |
| Many instruments | `qtstreamx-link` — partitions subscriptions across connections within exchange limits, reconnects dropped or silent links, and renews sockets before they expire |
| Aggregation | `qtstreamx-market-aggregation` — tickers and event-time candles from trades |
| Uniswap | `qtstreamx-dex-core`, `-dex-uniswap-v2`, `-dex-uniswap-v3`, `-chain-evm-rpc`, `-dex-discovery-uniswap`, `-dex-capture-csv` |

The command-line tool for discovering Uniswap pools, a canary, and a benchmark are also in the
repository. They are source and application modules, not library dependencies; the command-line
tool is attached to each GitHub release for Linux, macOS, and Windows.

## Install

Libraries are resolved through [JitPack](https://jitpack.io/#QTSurfer/qtstreamx). Add the
repository and the modules you need, with a released tag as the version:

```xml
<repositories>
  <repository>
    <id>jitpack.io</id>
    <url>https://jitpack.io</url>
  </repository>
</repositories>

<dependency>
  <groupId>com.qtsurfer.qtstreamx</groupId>
  <artifactId>qtstreamx-link</artifactId>
  <version><!-- a tag from the GitHub releases page --></version>
</dependency>
```

Only release tags build on JitPack, so a branch or a `-SNAPSHOT` version does not resolve. The
[releases page](https://github.com/QTSurfer/qtstreamx/releases) lists the current tags and says
whether each is a release candidate.

## Subscribe to a feed

Binance spot tickers with the dependency-free JDK WebSocket client, using
`qtstreamx-exchange-binance` and `qtstreamx-ws-native`:

```java
import com.qtsurfer.qtstreamx.core.client.StreamClientConfig;
import com.qtsurfer.qtstreamx.core.model.Instrument;
import com.qtsurfer.qtstreamx.exchange.binance.BinanceStreamClient;
import com.qtsurfer.qtstreamx.ws.jdk.JdkWebSocketClient;

var client = BinanceStreamClient.spot(StreamClientConfig.withDefaults(JdkWebSocketClient::new));
client.connect();
client.subscribeTicker(new Instrument("BTC", "USDT"), ticker -> System.out.println(ticker));
```

Every exchange client implements the same `StreamClient` interface, so moving to another exchange
changes the client you build and nothing after it. For many instruments, use `qtstreamx-link`
instead of subscribing one by one.

## Swap the pieces

Each seam is an interface, and each implementation is a module:

| Interface | Implementations |
|---|---|
| `StreamCodec` | JSON (Jackson), MessagePack |
| `WebSocketClient` | JDK `java.net.http.WebSocket`, Java-WebSocket |
| `TransportPublisher` / `TransportSubscriber` | NATS |
| `StreamClient` | One per exchange |
| `MarketTradeStream` | Uniswap v2, Uniswap v3 |

A feed flows from the exchange WebSocket through a `StreamClient`, into a record, through a
`StreamCodec`, and out through a `TransportPublisher`. A subscriber runs the same path backwards.

## Uniswap market data

QTStreamX reads Uniswap v2 and v3 swaps from pools you configure explicitly. It combines WebSocket
delivery with HTTP catch-up, orders and deduplicates the logs, and releases an event only after the
confirmation policy you set. After a restart or a switch of provider it reconciles over HTTP before
live delivery resumes, so a trade is neither dropped nor delivered twice.

A pool's token order and the market's orientation are kept separate and explicit: a pool of USDC
and WETH can publish the instrument `WETH/USDC` whichever token the contract lists first, and every
market keeps its network, venue, and contract address, so two pools of the same pair never collide.

A discovery library and a command-line tool scan Uniswap factories into typed pool descriptors,
bounded by a safe block head, token allowlists, and result limits. They never rank pools or
subscribe to the results for you. For a small, durable capture, the same tool writes the confirmed
trades of one pool to a CSV file, with checkpoints that survive a restart.

The integration is read-only market data: it does not route orders, sign transactions, or manage
liquidity.

## Related pages

- [Open source](/docs/developers/opensource) — every QTSurfer open-source project, with links.
- [Lastra](/docs/developers/opensource/lastra) — the file format the platform serves market data in.
- [Live execution](/docs/developers/api/live) — running a strategy on a live feed, including a
  Uniswap pool.
