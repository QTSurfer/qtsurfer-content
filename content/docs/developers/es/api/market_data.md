---
title: Datos de mercado
description: Descubre exchanges, instrumentos y datos históricos de mercado a través de la API REST.
order: 5.7
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: cd83df1b9540eb18ceee0b589e7a0adc8732c0e6
upstreamPath: docs/market_data.md
lastUpdated: '2026-09-07T13:26:56Z'
---

Todas las rutas de datos de mercado requieren un JWT bearer obtenido de la
[autenticación](https://github.com/QTSurfer/qtsurfer-api/blob/848593e88be3b80078c6f98d7cb582f22fd87853/README.md#api-quick-start).
Exponen el catálogo de exchanges y los datos históricos que gestiona QTSurfer; no envían un
backtest ni crean estado en el servidor.

## Descubrir exchanges e instrumentos

`GET /exchanges` lista los exchanges que conoce la plataforma, centralizados y descentralizados, cada uno
con su `venueType` y los `segments` que ofrece. Los ids, los tipos de venue y los segmentos van en
minúsculas, escritos igual allí donde la API los toma:

```json
[
  {"id": "binance", "name": "Binance", "venueType": "cex", "segments": ["spot", "futures"], "liveSegments": ["spot"]},
  {"id": "bybit", "name": "Bybit", "venueType": "cex", "segments": ["spot", "futures"], "liveSegments": ["spot"]},
  {"id": "robinhood", "name": "Robinhood Chain", "venueType": "dex", "segments": ["uniswap-v3"], "liveSegments": ["uniswap-v3"]}
]
```

`venueType` es `cex` para un exchange centralizado y `dex` para uno descentralizado. Los `segments` de un
exchange `cex` son los segmentos de mercado bajo los que se listan sus instrumentos; `liveSegments` son los
de entre ellos que una ejecución en vivo puede leer, porque se publican datos en vivo para ellos (hoy
`spot`). En un exchange `dex` ambos son los protocolos cuyas pools puede leer una ejecución en vivo
(consulta [Pools DEX](live#pools-dex)). Un exchange `dex` no tiene archivos por hora, datasets ni
backtests, así que su id da `400` en toda ruta que tome un `exchangeId` salvo las dos rutas de instrumentos,
que listan sus pools. Usa cualquiera de las dos rutas de instrumentos con el id de cualquier exchange que
`GET /exchanges` liste:

| Ruta | Significado |
| --- | --- |
| `GET /exchange/{exchangeId}/instruments` | Instrumentos en el segmento `spot` por defecto |
| `GET /exchange/{exchangeId}/{segment}/instruments` | Instrumentos en un segmento explícito: `spot` o `futures`, o un protocolo de un exchange `dex` (`uniswap-v3`) |

Una respuesta de instrumentos es un envoltorio HAL. Su array `data` contiene `id`, `base`,
`quote`, el `lastPrice` y `volume24h` actuales, más ventanas independientes de
`coverage.tickers` y `coverage.klines`. `meta.updatedAt` identifica cuándo se ensambló el
catálogo; `meta.segment` identifica el segmento realmente servido. Trata la cobertura como estado
vivo de la plataforma, no como una promesa de que cada marca de tiempo estará disponible para
siempre.

```bash
curl https://api.qtsurfer.net/v1/exchange/binance/spot/instruments \
  -H "Authorization: Bearer $QTSURFER_JWT"
```

Los `_links` de la respuesta proporcionan enlaces de descubrimiento `self`, `spot` y `futures`. Un exchange
que `GET /exchanges` no lista, y un segmento que el exchange no tiene, devuelven `400`; un catálogo que no
está disponible devuelve `404`. El segmento se escribe en minúsculas.

### Pools de un exchange descentralizado

En un exchange `dex` los instrumentos son sus pools, y aquí se encuentra la dirección que va en
`instruments` de una [ejecución en vivo](live#pools-dex):

```bash
curl https://api.qtsurfer.net/v1/exchange/robinhood/uniswap-v3/instruments \
  -H "Authorization: Bearer $QTSURFER_JWT"
```

```json
{
  "data": [
    {"id": "0x52e65b17fb6e5ba00ed806f37afcd2daa50271ca", "symbol": "WETH/USDG", "base": "WETH", "quote": "USDG",
     "baseAddress": "0x0bd7d308f8e1639fab988df18a8011f41eacad73", "quoteAddress": "0x5fc5360d0400a0fd4f2af552add042d716f1d168",
     "feePercent": 0.01, "tvlUsd": 19857902.02, "volume24hUsd": 273876056.45, "createdAt": "2026-07-02T20:51:08Z"}
  ],
  "meta": {"updatedAt": "2026-10-14T22:32:34Z", "exchange": "robinhood", "segment": "uniswap-v3", "minTvlUsd": 10000, "limit": 50},
  "_links": {"self": {"href": "/v1/exchange/robinhood/uniswap-v3/instruments"}, "uniswap-v3": {"href": "/v1/exchange/robinhood/uniswap-v3/instruments"}}
}
```

El `id` de una pool es su dirección, en minúsculas. `symbol` es el par tal como lo nombran las señales de una
ejecución, que no siempre es el orden en que lo muestran otros sitios (la misma pool puede aparecer como
`USDG / WETH` en otro lugar), así que identifica una pool por su dirección. Un protocolo puede tener varias
pools del mismo par, una por nivel de comisión (`feePercent`).

El listado trae las 50 pools con más volumen en las últimas 24 horas (`volume24hUsd`) entre las que tienen al
menos 10 000 dólares de liquidez (`tvlUsd`), y se actualiza cada hora (`meta.updatedAt`); `meta` indica ambos
límites. Es un punto de partida, no todo el mercado: una ejecución en vivo puede leer cualquier pool del
protocolo, esté listada o no. `404` significa que el listado no está disponible en este momento.

## Descargar segmentos horarios

Dos rutas devuelven bytes en lugar de JSON:

| Ruta | Contenido |
| --- | --- |
| `GET /exchange/{exchangeId}/tickers/{base}/{quote}` | Eventos de ticker en bruto de una hora UTC |
| `GET /exchange/{exchangeId}/klines/{base}/{quote}` | Klines nativas del exchange agregadas de una hora UTC |

Ambas requieren el parámetro de consulta `hour` en forma UTC `YYYY-MM-DDTHH`. Por ejemplo,
`2026-01-15T10` cubre `[2026-01-15T10:00:00Z, 2026-01-15T11:00:00Z)`. El valor por defecto
`format=lastra` es el formato columnar compacto propio de QTSurfer; `format=parquet` le pide al
servicio que convierta el mismo segmento al vuelo. La respuesta es respectivamente
`application/vnd.lastra` o `application/vnd.apache.parquet`, y `Content-Disposition` aporta un
nombre de fichero útil.

```bash
curl --fail --remote-name \
  "https://api.qtsurfer.net/v1/exchange/binance/tickers/BTC/USDT?hour=2026-01-15T10&format=parquet" \
  -H "Authorization: Bearer $QTSURFER_JWT"
```

Usa un segmento de klines cuando baste con datos a nivel de barra; los tickers pueden ser mucho
más grandes. Una hora o parámetro mal formados es `400`; una hora válida sin segmento almacenado
es `404`. Los consumidores de descargas deberían transmitir la respuesta a disco o a un lector
compatible en lugar de acumular una hora entera en memoria.

## Guías relacionadas

- [Backtests](backtest_execute) usan datos de exchange gestionados tras preparar una ventana
  solicitada.
- [Conjuntos de datos](datasets) cubre datos subidos por el usuario — CSV o parquet — cuando la
  cobertura de un exchange gestionado no es la fuente deseada.