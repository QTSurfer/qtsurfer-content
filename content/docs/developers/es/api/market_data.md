---
title: Datos de mercado
description: Descubre exchanges, instrumentos y datos históricos de mercado a través de la API REST.
order: 5.7
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 848593e88be3b80078c6f98d7cb582f22fd87853
upstreamPath: docs/market_data.md
lastUpdated: '2026-09-04T10:18:11Z'
---

Todas las rutas de datos de mercado requieren un JWT bearer obtenido de la
[autenticación](https://github.com/QTSurfer/qtsurfer-api/blob/848593e88be3b80078c6f98d7cb582f22fd87853/README.md#api-quick-start).
Exponen el catálogo de exchanges y los datos históricos que gestiona QTSurfer; no envían un
backtest ni crean estado en el servidor.

## Descubrir exchanges e instrumentos

`GET /exchanges` lista los ids de exchange disponibles actualmente. Usa un id con cualquiera de
las dos rutas de instrumentos:

| Ruta | Significado |
| --- | --- |
| `GET /exchange/{exchangeId}/instruments` | Instrumentos en el segmento `spot` por defecto |
| `GET /exchange/{exchangeId}/{segment}/instruments` | Instrumentos en un segmento `spot` o `futures` explícito |

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

Los `_links` de la respuesta proporcionan enlaces de descubrimiento `self`, `spot` y `futures`. Un
exchange ausente, un segmento desconocido o un catálogo no disponible devuelven `404`.

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
- [Conjuntos de datos](datasets) cubre datos CSV subidos por el usuario cuando la cobertura de un
  exchange gestionado no es la fuente deseada.