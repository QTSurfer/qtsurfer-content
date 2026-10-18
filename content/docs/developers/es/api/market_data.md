---
title: Datos de mercado
description: Descubre exchanges, instrumentos y datos históricos de mercado a través de la API REST.
order: 5.7
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 2816b264c2398991c87e618a70a433b2d4d8de3e
upstreamPath: docs/market_data.md
lastUpdated: '2026-10-18T10:27:25Z'
---

Todas las rutas de datos de mercado requieren un JWT bearer obtenido de la
[autenticación](auth).
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

Una respuesta de instrumentos es un envoltorio HAL. Su array `data` contiene `id`, `symbol`, `base`,
`quote`, el `lastPrice` y `volume24h` actuales, más ventanas independientes de
`coverage.tickers` y `coverage.klines`. `meta.updatedAt` identifica cuándo se ensambló el
catálogo; `meta.segment` identifica el segmento realmente servido y `meta.venueType` el tipo de venue del
exchange (`cex` aquí, `dex` en un listado de pools). Trata la cobertura como estado vivo de la
plataforma, no como una promesa de que cada marca de tiempo estará disponible para siempre.

Los dos tipos de listado, el de instrumentos y el de [pools](#pools-de-un-exchange-descentralizado), se
pueden leer del mismo modo: los campos de la tabla significan lo mismo en cada uno, y el resto es propio de
un solo tipo.

| Campo | Significado | En |
| --- | --- | --- |
| `meta.venueType` | `cex` o `dex`, como lo lista `GET /exchanges` para el exchange | ambos |
| `id` | Identificador que se usa en las demás rutas: el par de un instrumento (`BTC/USDT`), la dirección de una pool | ambos |
| `symbol` | El nombre del instrumento o del par, tal como lo nombran las señales de una ejecución. Igual que `id` en un instrumento | ambos |
| `base`, `quote` | Símbolo de cada lado | ambos |
| `lastPrice` | Precio de una unidad de la base en la moneda de cotización; ausente cuando no hay | ambos |
| `volume24h` | Volumen de las últimas 24 horas, en la moneda de cotización; ausente cuando no hay | ambos |
| `coverage` | Rango temporal de los datos disponibles, por tipo de dato | solo instrumentos |
| `settle` | Moneda de liquidación de un instrumento de futuros | solo instrumentos de futuros |
| `baseAddress`, `quoteAddress`, `feePercent`, `tvlUsd`, `volume24hUsd`, `createdAt` | Direcciones de los tokens, nivel de comisión, liquidez y volumen en dólares, fecha de creación | solo pools |

El `lastPrice` y el `volume24h` de un instrumento se refrescan cada pocos minutos; los de una pool son los
de `meta.updatedAt`, que se refresca cada hora, así que el precio de una pool puede tener hasta una hora de
antigüedad.

Un campo sin dato se omite de la entrada, nunca se envía como `null`: lee un `lastPrice`, un `volume24h` o
un `createdAt` ausentes como «no se conoce».

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
     "feePercent": 0.01, "lastPrice": 2411.285967, "volume24h": 274033077.4, "tvlUsd": 19857902.02,
     "volume24hUsd": 273876056.45, "createdAt": "2026-07-02T20:51:08Z"}
  ],
  "meta": {"updatedAt": "2026-10-14T22:32:34Z", "exchange": "robinhood", "segment": "uniswap-v3", "venueType": "dex", "minTvlUsd": 10000, "limit": 50},
  "_links": {"self": {"href": "/v1/exchange/robinhood/uniswap-v3/instruments"}, "uniswap-v3": {"href": "/v1/exchange/robinhood/uniswap-v3/instruments"}}
}
```

El `id` de una pool es su dirección, en minúsculas. `symbol` es el par tal como lo nombran las señales de una
ejecución, que no siempre es el orden en que lo muestran otros sitios (la misma pool puede aparecer como
`USDG / WETH` en otro lugar), así que identifica una pool por su dirección. Un protocolo puede tener varias
pools del mismo par, una por nivel de comisión (`feePercent`).

`lastPrice` es el precio de una unidad de la base en el token de cotización (`2411.285967` USDG por un WETH
en el ejemplo) y `volume24h` es lo operado en las últimas 24 horas en ese token de cotización; `volume24hUsd`
es el mismo volumen en dólares, y por él se ordena el listado. Cualquiera de los dos puede estar ausente. Son
los de `meta.updatedAt`, con hasta una hora de antigüedad.

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
`2026-10-15T10` cubre `[2026-10-15T10:00:00Z, 2026-10-15T11:00:00Z)` (la hora tiene que estar
dentro de los últimos 7 días, ver más abajo: lee el ejemplo como la forma del valor). El valor por
defecto `format=lastra` es el formato columnar compacto propio de QTSurfer; `format=parquet` le pide al
servicio que convierta el mismo segmento al vuelo. La respuesta es respectivamente
`application/vnd.qtsurfer.lastra` o `application/vnd.apache.parquet`, y `Content-Disposition` aporta un
nombre de fichero útil.

```bash
# the hour has to be one of the last 7 days
curl --fail --remote-name \
  "https://api.qtsurfer.net/v1/exchange/binance/tickers/BTC/USDT?hour=2026-10-15T10&format=parquet" \
  -H "Authorization: Bearer $QTSURFER_JWT"
```

Usa un segmento de klines cuando baste con datos a nivel de barra; los tickers pueden ser mucho
más grandes. Los consumidores de descargas deberían transmitir la respuesta a disco o a un lector
compatible en lugar de acumular una hora entera en memoria.

### Qué horas

Los últimos 7 días: una hora que empezó como mucho 7 días antes de la petición y ya ha terminado.
Las rutas dan una hora de un instrumento, rápido; no son la forma de obtener histórico más antiguo
ni un rango. Para eso, [importa un conjunto de datos](datasets#importar-un-conjunto-de-datos-en-lugar-de-subirlo)
con el histórico del exchange (`POST /datasets/imports` con `type: "cex"`) y descárgalo como se
descarga cualquier conjunto de datos.

### La hora en curso y las últimas horas

La hora en curso, y una hora que ya ha terminado pero todavía no está almacenada, pueden
responderse con lo recibido hasta ese momento: `200` con `X-Data-Status: provisional` y
`X-Data-Through`, el instante de la última fila (una hora UTC ISO-8601, sea cual sea la unidad de
`ts`). No todos los despliegues del servicio dan respuestas provisionales: donde no las dan, esas
horas son `404` con `NOT_YET_AVAILABLE` y un `Retry-After`, y un cliente que las necesite maneja
ambos casos. Las columnas, la unidad de tiempo y los formatos son los de cualquier otra hora. Una respuesta provisional todavía
puede crecer y la hora almacenada la sustituye en cuanto existe: úsala para la punta del mercado, no
como registro de una hora. Tarda segundos en construirse, más cuanto más avanzada esté la hora, y el
servicio limita cuántas construye a la vez, así que un `503` con `Retry-After` es una petición de
volver a preguntar, no un fallo. Cuando no hay nada que dar, porque el instrumento aún no tiene
filas en la hora o lo recibido no llega hasta el inicio de la hora, la respuesta es también `404`
con `NOT_YET_AVAILABLE`.

### Marcas de tiempo

En una respuesta Lastra la columna `ts` contiene **microsegundos** desde el epoch. Lo declaran los
metadatos de la columna (`ts_unit: micros`) y también la cabecera de respuesta `X-Ts-Unit: micros`,
de modo que un lector no tiene que adivinar la unidad por la magnitud. Una respuesta Parquet tiene
su columna de marca de tiempo como `TIMESTAMP` en milisegundos.

### Errores

Una petición fallida responde con [`ResponseError`](/docs/api): `code` y `message` y, cuando la
causa tiene un nombre estable, `reason`, y cuando hay una petición que permite superarla, `next`. Un
cliente se ramifica según `reason`, no según el texto de `message`.

| Estado | `reason` | Significado | Qué hacer |
| --- | --- | --- | --- |
| `400` | ninguno | `hour` ausente o no `YYYY-MM-DDTHH`, `format` desconocido, o una hora en el futuro | corrige la petición |
| `400` | `OUTSIDE_WINDOW` | la hora es anterior a los últimos 7 días | envía `next`: la petición `POST /datasets/imports` que importa exactamente esa hora (añade un `name`) |
| `404` | `NOT_YET_AVAILABLE` | la hora todavía no está almacenada y no se dio una respuesta provisional para ella; lleva `Retry-After` | vuelve a preguntar pasados esos segundos |
| `404` | `NO_DATA` | la hora está almacenada y no contiene nada para este instrumento | ninguna: no hay datos que obtener |
| `503` | `TEMPORARILY_UNAVAILABLE` | se están limitando las lecturas (almacenadas o provisionales) y esta no se sirvió; lleva `Retry-After` | vuelve a preguntar pasados esos segundos |
| `500` | ninguno | fallo inesperado; el mensaje no dice nada de su causa | reintenta más tarde |

```json
{
  "code": 400,
  "message": "Hour older than 7 days: import it as a dataset",
  "reason": "OUTSIDE_WINDOW",
  "next": {
    "method": "POST",
    "path": "/datasets/imports",
    "body": {
      "type": "cex",
      "instrument": "BTC/USDT",
      "from": "2026-09-01T10:00:00Z",
      "to": "2026-09-01T11:00:00Z",
      "cex": { "exchange": "binance", "segment": "spot", "dataType": "klines" }
    }
  }
}
```

`next.path` es relativa a la URL del servidor (la que ya termina en `/v1`). Lo que depende de ti y
el servicio no puede conocer, como el `name` del conjunto de datos, se deja para que lo añadas tú.

## Guías relacionadas

- [Backtests](backtest_execute) usan datos de exchange gestionados tras preparar una ventana
  solicitada.
- [Conjuntos de datos](datasets) cubre datos subidos por el usuario — CSV o parquet — cuando la
  cobertura de un exchange gestionado no es la fuente deseada.