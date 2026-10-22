---
title: Conjuntos de datos
description: Sube datos históricos de ticker y úsalos en el flujo estándar de backtesting.
order: 5.6
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: a77af5626880963724d9ff228c5a51411c21fdef
upstreamPath: docs/datasets.md
lastUpdated: '2026-10-22T11:15:56Z'
---

Haz backtest contra un CSV, un fichero parquet o un fichero lastra que subes en lugar de contra un exchange
gestionado: crea un conjunto de datos, sube el fichero (`PUT`) a una URL prefirmada, finalízalo
para disparar la ingesta, y luego [prepara/ejecuta](backtest_execute) exactamente como de
costumbre pero con el `exchangeId: user` reservado.

| Método | Ruta | Propósito |
|---|---|---|
| `POST` | `/datasets` | Crear un conjunto de datos + primera sesión de subida |
| `GET` | `/datasets` | Listar tus conjuntos de datos |
| `GET` | `/datasets/{datasetId}` | Obtener uno |
| `DELETE` | `/datasets/{datasetId}` | Eliminar |
| `POST` | `/datasets/{datasetId}/uploads` | Abrir una nueva sesión de subida para un conjunto de datos existente |
| `POST` | `/datasets/{datasetId}/uploads/{uploadId}/finalize` | Disparar la ingesta |
| `GET` | `/datasets/{datasetId}/uploads/{uploadId}` | Sondear el estado de subida/ingesta |
| `POST` | `/datasets/imports` | Crear un conjunto de datos buscando el histórico en lugar de subirlo |
| `GET` | `/datasets/{datasetId}/imports/{importId}` | Sondear el estado de búsqueda/ingesta |

Un conjunto de datos contiene un instrumento, y su `type` — `ticker` o `klines` — dice qué son sus filas: se
lee de los datos cuando una subida o una importación se ha ingerido, consulta [Qué es el `type`](#qué-es-el-type). `instrument` debe ser
un par spot llano (`BASE/QUOTE`, exactamente una `/`); las formas de derivados (`BTC/USDT:USDT`) se rechazan.

## Crear un conjunto de datos

`POST /datasets` — crea el conjunto de datos **y** su primera sesión de subida en una sola
llamada: una URL prefirmada a la que tu cliente sube (`PUT`) el fichero directamente, sin
credenciales de la API implicadas en ese `PUT`.

| Campo | Tipo | Notas |
|---|---|---|
| `name` | string | obligatorio, único entre tus conjuntos de datos. `409` si ya está en uso |
| `instrument` | string | obligatorio, par spot llano |

```bash
curl -X POST https://api.qtsurfer.net/v1/datasets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My BTC ticks","instrument":"BTC/USDT"}'
```

`DatasetCreated` (`201`) — los metadatos disponibles inmediatamente tras la creación más la
sesión de subida. Todavía no es el [`Dataset`](#forma-del-conjunto-de-datos) completo: campos de
ciclo de vida como `createdAt`, `currentVersionId`, el rango y la cadencia se obtienen de
`GET /datasets/{datasetId}` tras las etapas correspondientes del ciclo de vida.

```json
{
  "datasetId": "ds_3f9a1c2e7b0d4a5f", "name": "My BTC ticks",
  "type": "ticker", "instrument": "BTC/USDT",
  "uploadId": "up_1a2b3c4d5e6f7a8b",
  "upload": {
    "url": "https://storage.qtsurfer.com/.../uploads/up_1a2b3c4d5e6f7a8b/raw.csv?X-Amz-...",
    "expiresInMinutes": 15
  }
}
```

`uploadId` es lo que pasas a [finalizar](#finalizar-una-subida-disparar-la-ingesta); `upload.url`
es el destino prefirmado — sube (`PUT`) el fichero en bruto ahí directamente, sin cabecera
`Authorization`.

El `"type": "ticker"` de esta respuesta es provisional: el conjunto de datos aún no tiene datos. Una vez
ingerida la subida, su `type` es lo que contiene el fichero ([Qué es el `type`](#qué-es-el-type)), así que un fichero de velas es `klines`
cuando lo lees de nuevo.

¿Perdiste esta respuesta? No se pierde nada — llama a [`POST .../uploads`](#abrir-una-nueva-sesión-de-subida)
sobre el id de este conjunto de datos y recuperas exactamente la misma sesión de subida, siempre
que aún no la hayas finalizado.

Errores: `400` petición inválida, o `instrument` no es un par spot llano · `409` nombre de
conjunto de datos ya en uso · `429` se ha alcanzado el límite de conjuntos de datos de tu plan —
elimina uno, o mejora de plan.

## Abrir una nueva sesión de subida

`POST /datasets/{datasetId}/uploads` — obtén una sesión de subida nueva para un conjunto de datos
que ya tienes: un fichero corregido, o el siguiente tramo de histórico. Mismo contrato de
idempotencia que la mitad de subida propia de `POST /datasets`: como mucho hay una sesión abierta
por conjunto de datos a la vez, así que volver a llamar a esto antes de finalizar simplemente
devuelve esa misma sesión — seguro de reintentar si se pierde una respuesta. Una vez que una
sesión se ha finalizado (con éxito o no), la siguiente llamada aquí abre una genuinamente nueva.

```bash
curl -X POST https://api.qtsurfer.net/v1/datasets/$DATASET_ID/uploads \
  -H "Authorization: Bearer $TOKEN"
```

`201` — la misma forma `{uploadId, upload}` que devuelve `POST /datasets`, sin los metadatos del
conjunto de datos alrededor:

```json
{
  "uploadId": "up_1a2b3c4d5e6f7a8b",
  "upload": {
    "url": "https://storage.qtsurfer.com/.../uploads/up_1a2b3c4d5e6f7a8b/raw.csv?X-Amz-...",
    "expiresInMinutes": 15
  }
}
```

Errores: `404` no existe ese conjunto de datos para este usuario.

## Subir el fichero

**CSV, parquet o lastra.** Un CSV necesita fila de cabecera; un fichero parquet ya lleva sus
columnas con nombre; un fichero `lastra` es nuestro propio formato columnar nativo — el mismo que
te devuelve por defecto el `dataUrl` de un conjunto de datos, así que descargar un conjunto de
datos y entregarle ese mismo fichero a otro usuario para que lo suba funciona sin ninguna
conversión de por medio. Para CSV/parquet, `timestamp` (ISO-8601, o segundos/milisegundos/
microsegundos de época numéricos — detectado en la primera fila, y exigido después para cada fila
posterior) y `close` son obligatorias; opcionales: `open`, `high`, `low`, `volume`, `quoteVolume`,
`bid`, `bidSize`, `ask`, `askSize`. Una subida lastra lleva su propio conjunto fijo de columnas en
su lugar (ya es una descarga de `dataUrl`, no un formato que construyas a mano) y solo necesita que
estén presentes una serie de marca de tiempo y una de cierre. **La cadencia y la unidad de la marca
de tiempo se descubren a partir de los datos, no se declaran,** para las tres.

Una subida CSV se convierte a nuestro formato columnar nativo (`lastra`) para almacenarla. Una
subida parquet o lastra se guarda hoy tal cual. En ambos casos, consulta `dataFormat` en la
[versión lista](#datasetversion--una-subida-ingerida-con-éxito) para saber qué recibes de vuelta
realmente — no lo des por hecho a partir de cómo la subiste (un CSV convertido y un fichero lastra
subido reportan ambos `dataFormat: "lastra"`).

Los bytes que se suben (`PUT`) a `upload.url` pueden ser ese fichero directamente, comprimidos en
gzip (`.gz`), o en zip (`.zip`, exactamente un fichero dentro — un conjunto de datos es un único
fichero sin importar cómo viaje). El formato se detecta a partir del propio contenido: en este
flujo no hay ni nombre de fichero ni `Content-Type` con los que un cliente pueda declararlo, así
que no hace falta enviar nada más que los bytes.

```bash
curl -X PUT "$UPLOAD_URL" --data-binary @my-btc-ticks.csv
# or gzip/zip it first -- detected from content, no extra parameter needed
curl -X PUT "$UPLOAD_URL" --data-binary @my-btc-ticks.csv.gz
```

## Finalizar una subida (disparar la ingesta)

`POST /datasets/{datasetId}/uploads/{uploadId}/finalize` — llama a esto una vez que el `PUT` de
arriba se ha completado. Encola la ingesta y devuelve el control de inmediato; sondea
[`GET .../uploads/{uploadId}`](#sondear-la-ingesta) más abajo. **Idempotente mientras la subida
siga abierta** — un finalize repetido antes de que haya producido una versión devuelve el mismo
`jobId` en lugar de encolar una segunda ingesta. Una vez que SÍ ha producido una versión,
`uploadId` queda gastado: volver a finalizarlo es un `409`, incluso con bytes distintos recién
subidos (`PUT`) a la misma URL — [abre una nueva sesión de subida](#abrir-una-nueva-sesión-de-subida)
en lugar de reutilizar una ya gastada.

```bash
curl -X POST https://api.qtsurfer.net/v1/datasets/$DATASET_ID/uploads/$UPLOAD_ID/finalize \
  -H "Authorization: Bearer $TOKEN"
# → 202 {"jobId": "dataset-upload:.../ds_3f9a1c2e7b0d4a5f:up_1a2b3c4d5e6f7a8b"}
```

Errores: `404` no existe ese conjunto de datos para este usuario; `uploadId` no se emitió para
este conjunto de datos (nunca se acuñó, o se acuñó para otro distinto); o todavía no se ha subido
(`PUT`) nada a `upload.url` — un finalize sin nada que finalizar · `409` `uploadId` ya produjo una
versión (el mensaje de error lo nombra) · `413` el fichero subido es muchas veces el límite de tamaño de tu
plan para un conjunto de datos (consulta [Límites de tamaño](#límites-de-tamaño): el límite en sí se
aplica al tamaño almacenado, que solo se conoce tras la conversión) · `429` se alcanzó o se superaría el límite de almacenamiento total
de tu cuenta (`maxTotalStorageBytes` de [`GET /account`](account)) — elimina un conjunto de datos
para liberar espacio, o mejora de plan.

## Límites de tamaño

`maxDatasetBytes` ([`GET /account`](account)) limita el tamaño **almacenado** de una versión de un
conjunto de datos: los `bytes` que reporta su versión lista, que para una subida CSV es el fichero
`lastra` convertido, no el fichero que subiste. **Estima a partir de las filas, no del tamaño del
fichero.** El tamaño almacenado sigue a las filas y a las columnas, y un CSV puede salir más grande o
más pequeño que el fichero. Medido con datos sintéticos de un segundo: unos 92 bytes por fila para un
CSV `timestamp,close`, unos 55 para `timestamp,open,high,low,close,volume`. Los datos reales se
comprimen de otra manera, así que toma estas cifras como un orden de magnitud y, para un fichero
grande, sube primero un trozo pequeño y escala a partir de sus `bytes` y `rows`.

El tamaño almacenado solo se conoce una vez convertido el fichero, así que ahí es donde decide el
límite: `POST .../finalize` responde `202`, y una subida por encima del límite acaba `failed` cuando
la [sondeas](#sondear-la-ingesta), con un error como `Dataset is 196976000 bytes, exceeds the tier's
100000000 byte limit`. Sondea en lugar de dar por hecho que el `202` significa que se almacenó. Lo
que `finalize` rechaza por sí mismo con `413` es un fichero muchas veces mayor que el límite, muy por
encima de lo que la conversión podría dejar por debajo.

## Sondear la ingesta

`GET /datasets/{datasetId}/uploads/{uploadId}` — sondea tras finalizar hasta que `status` sea
`ready` o `failed`. También informa de `uploading` (finalize aún no llamado, pero el fichero ya se
subió) antes de que finalices. **Se registra de forma duradera una vez existe una versión**, así que
`ready`/`failed` son respuestas permanentes; `uploading`/`ingesting` reflejan estado en curso que
puede caducar por sí mismo (ver el caso `404` más abajo).

### Respuesta — `DatasetUploadState`

| Campo | Notas |
|---|---|
| `status` | `uploading` (fichero subido con `PUT`, aún no finalizado) → `ingesting` (finalize llamado, el worker analiza/valida) → `ready` (`version` lleva el resultado) \| `failed` (por ejemplo, contrato CSV incorrecto, unidades de marca de tiempo mezcladas, un `.zip` sin fichero dentro o con más de uno) |
| `jobId` | el id del job de ingesta, mientras `status` es `ingesting` |
| `error` | motivo legible, presente cuando `status` es `failed`. Se registra de forma duradera junto con el fallo — sigue disponible sondees cuando sondees después |
| `version` | una [`DatasetVersion`](#datasetversion--una-subida-ingerida-con-éxito), presente cuando `status` es `ready` o `failed` |

#### `DatasetVersion` — una subida ingerida con éxito

| Campo | Notas |
|---|---|
| `id` | el id de la versión — pásalo como `datasetVersionId` en la preparación para fijarla |
| `bytes` | tamaño del fichero **almacenado** (`dataUrl`) — un `lastra` convertido para una subida CSV (descomprimida antes, si llegó como `.gz`/`.zip`), o el propio fichero parquet/lastra, sin convertir, para una subida parquet o lastra. No el tamaño de los bytes subidos originalmente (`PUT`) |
| `rows` | número de filas de datos |
| `cadence` | descubierta a partir de las propias marcas de tiempo de los datos: una cuadrícula fija (`1s`, `5s`, `15s`, `1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `2h`, `4h`, `8h`, `12h`, `1d`, `1w`) cuando al menos la mitad de los intervalos entre filas caen en ese paso (se tolera un pequeño desajuste de reloj), o `rt` — datos nativos a la tasa en que se capturaron, cada fila con su propia marca de tiempo sin paso fijo (swaps on-chain por operación, ticks espaciados por bloque o de menos de un segundo, intervalos irregulares). Un conjunto de datos `rt` se puede remuestrear a cualquier cadencia fija al preparar |
| `timestampUnit` | `iso` \| `s` \| `ms` \| `us` — la unidad en la que llegó la columna `timestamp` |
| `gaps`, `largestGapSteps` | número de huecos a la cadencia descubierta, y el tamaño del mayor en pasos de esa cadencia. Siempre `0` para `rt` |
| `dataUrl` | URL GET prefirmada al fichero almacenado — consulta `dataFormat`. Presente una vez `ready` |
| `dataFormat` | `lastra` (convertido, desde una subida CSV/gzip/zip, o sin convertir, desde una subida lastra — el valor por sí solo no distingue cuál) \| `parquet` (sin convertir, desde una subida parquet) |

```bash
curl https://api.qtsurfer.net/v1/datasets/$DATASET_ID/uploads/$UPLOAD_ID \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "uploadId": "up_1a2b3c4d5e6f7a8b",
  "status": "ready",
  "version": {
    "datasetId": "ds_3f9a1c2e7b0d4a5f", "id": "dsv_8e2b4f19c6a03d7e",
    "bytes": 4831022, "rows": 86400, "cadence": "1s",
    "timestampUnit": "iso", "gaps": 0, "largestGapSteps": 0,
    "dataUrl": "https://storage.qtsurfer.com/.../dsv_8e2b4f19c6a03d7e/ticker_BTC_USDT_....lastra?X-Amz-...",
    "dataFormat": "lastra"
  }
}
```

Errores: `404` no existe ese conjunto de datos para este usuario, o realmente no se sabe nada de
este `uploadId` — sin versión, sin job en curso, nunca se subió (`PUT`) nada a su URL de subida.

## Importar un conjunto de datos en lugar de subirlo

`POST /datasets/imports` — una segunda forma de meter datos en un conjunto de datos: en lugar de
subir (`PUT`) un fichero tú mismo, le pides a la API que vaya a buscar el histórico por ti. Crea el
conjunto de datos y arranca la búsqueda en la misma llamada — no hay un paso de subida aparte, y el
resultado acaba siendo una versión de conjunto de datos indistinguible de una subida una vez lista.

`type` elige el tipo de mercado del que viene el histórico, con los mismos dos valores que el
`venueType` de [`GET /exchanges`](market_data): `dex` — histórico sobre el propio mercado on-chain
de un pool/par — y `cex` — el histórico del mercado de un exchange centralizado, que conserva la
plataforma. Cada uno tiene su propio bloque (`dex`, `cex`). Un exchange descentralizado de
`GET /exchanges` (`robinhood`, por ejemplo) se importa con `type: dex`; como `exchange` de una
importación `cex`, su id es `400`.

Una importación `cex` cubre un instrumento a lo largo de un rango: la API lee ese rango del
histórico del exchange, construye las barras de la `cadence` pedida a partir de los datos más finos
que tiene y guarda el resultado como una versión de conjunto de datos, exactamente igual que en una
subida. Consulta [Importar el histórico de un exchange](#importar-el-histórico-de-un-exchange) más
abajo.

Una importación `dex` tiene dos formas de datos, elegidas por la `cadence` de nivel superior:

* Omitida/en blanco (por defecto) — histórico de swaps on-chain, reproducido directamente desde la
  propia cadena del pool/par, cada swap con su propia marca de tiempo (cadencia nativa por
  operación).
* `1s` \| `1m` \| `5m` — velas pre-agregadas a esa anchura en lugar de operaciones en bruto. El
  `type` del conjunto de datos resultante es `klines`, no `ticker` ([Qué es el `type`](#qué-es-el-type): las velas no llevan libro). Los
  swaps reproducidos como barras de una anchura, también sin libro, salen igualmente como `klines`.

| Campo | Tipo | Notas |
|---|---|---|
| `name` | cadena | obligatorio, único entre tus conjuntos de datos. `409` si ya está en uso |
| `instrument` | cadena | obligatorio, par spot llano — la etiqueta propia del conjunto de datos, independiente del orden de los tokens on-chain del pool |
| `from`, `to` | cadena (fecha-hora) | obligatorio, ISO-8601 UTC. `from` inclusivo, `to` exclusivo, `from < to`. El rango total está limitado por tu plan |
| `cadence` | cadena | opcional. Para `dex`: omitida/en blanco = cadencia nativa por operación (ver abajo); uno de `1s` \| `1m` \| `5m` pide velas pre-agregadas a esa anchura en una red que las soporte (cualquier otro valor es `400`) — en una red que no las soporte, se ignora silenciosamente, ver abajo. Para `cex`: consulta [Importar el histórico de un exchange](#importar-el-histórico-de-un-exchange) |
| `type` | cadena | obligatorio, `"dex"` \| `"cex"` |
| `dex.network` | cadena | obligatorio, uno de `ethereum` \| `robinhood` |
| `dex.id` | cadena | obligatorio salvo que una `cadence` de velas realmente se resuelva (ver abajo) — una `cadence` de velas ignorada en una red sin velas sigue exigiendo este campo. `"uniswap"` es el único valor por ahora — qué protocolo DEX on-chain implementa `dex.contract` |
| `dex.version` | cadena | obligatorio salvo que una `cadence` de velas realmente se resuelva (ver abajo). `"v2"` \| `"v3"` |
| `dex.contract` | cadena | obligatorio, la dirección del contrato del pool (v3) o par (v2) |
| `dex.factory` | cadena | opcional — omite para autodescubrirla on-chain a partir de `contract`; indícala solo si ya la conoces o el pool/par pertenece a una factory no canónica. En cualquier caso el pool/par se valida contra la factory que se use antes de buscar nada. Se ignora si una `cadence` de velas realmente se resuelve (ver abajo) |

**La cadencia on-chain es nativa, no se remuestrea.** Una importación `dex` normal (sin `cadence`)
mantiene la propia cadencia de eventos por operación de la fuente — cada swap en la marca de tiempo
en la que ocurrió, así que la `cadence` de la versión resultante es `rt` salvo que los swaps caigan
por casualidad en una cuadrícula fija — en lugar de agruparlos en velas; remuestrea a una cadencia
más gruesa después, como un paso aparte, si necesitas una a partir de datos on-chain. Pedir
`cadence: "1s"`/`"1m"`/`"5m"` en su lugar te da velas pre-agregadas a esa anchura directamente —
pero solo en una red que realmente tenga una fuente de velas detrás. En cualquier otra red, una
`cadence` de velas se ignora silenciosamente y la importación sigue como si `cadence` nunca se
hubiera enviado (nativa, `dex.id`/`dex.version` obligatorios) — no falla, ni de forma síncrona ni
asíncrona. Qué redes soportan velas hoy no forma parte de este contrato y puede cambiar; si
necesitas saberlo antes de importar, pide la cadencia nativa y comprueba la propia `cadence` de la
versión resultante en lugar de asumirlo.

```bash
curl -X POST https://api.qtsurfer.net/v1/datasets/imports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "weth-usdc-week",
    "instrument": "WETH/USDC",
    "from": "2026-08-01T00:00:00Z",
    "to": "2026-08-08T00:00:00Z",
    "type": "dex",
    "dex": {
      "network": "ethereum",
      "id": "uniswap",
      "version": "v3",
      "contract": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
    }
  }'
# → 202 {"datasetId":"ds_3f9a1c2e7b0d4a5f","importId":"imp_01j9z...","jobId":"dataset-import:...","status":"fetching"}
```

O, para velas pre-agregadas en lugar de swaps on-chain en bruto:

```bash
curl -X POST https://api.qtsurfer.net/v1/datasets/imports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "weth-usdc-1s",
    "instrument": "WETH/USDC",
    "from": "2026-08-01T00:00:00Z",
    "to": "2026-08-01T06:00:00Z",
    "cadence": "1s",
    "type": "dex",
    "dex": {
      "network": "ethereum",
      "contract": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
    }
  }'
```

`importId` es con lo que sondeas, más abajo — no hay un paso de "finalizar" aparte como en una
subida.

Errores: `400` petición inválida, `instrument` no es un par spot llano, `from >= to`, `cadence`
presente pero no uno de sus valores soportados, el rango excede el límite de importación de tu
plan, la estimación aproximada de tamaño del rango excede el límite de filas de tu plan,
`dex.network`/`dex.id` no es uno de sus valores soportados, `dex.contract`/`dex.factory` fallan la
validación básica de forma, o (cuando se omite `cadence`) falta `dex.id`/`dex.version` (si el
pool/par realmente se resuelve, y para una `cadence` de velas si esa combinación se puede servir en
la red pedida, se comprueba después, de forma asíncrona — ver `failed` abajo) · `409` nombre de
conjunto de datos ya en uso · `429` se alcanzó el límite de conjuntos de datos de tu plan, o ya se
alcanzó el límite de almacenamiento total de tu cuenta (`maxTotalStorageBytes` de [`GET
/account`](account)) — elimina un conjunto de datos para liberar hueco o espacio, o mejora de
plan.

### Importar el histórico de un exchange

`type: "cex"` importa un instrumento de un exchange centralizado a lo largo de un rango. Mismo
endpoint, mismos campos `name`, `instrument`, `from`, `to` y `cadence`, mismos límites (el rango
está limitado por el `maxImportRangeHours` de tu plan, [`GET /account`](account)) y el mismo sondeo
de más abajo; solo cambia el bloque que dice qué importar:

| Campo | Tipo | Notas |
|---|---|---|
| `cex.exchange` | cadena | obligatorio, el `id` de un exchange centralizado (`venueType` `cex`) de `GET /exchanges`, en minúsculas. El id de un exchange descentralizado es `400`: usa `type: dex` |
| `cex.segment` | cadena | obligatorio, uno de los `segments` del exchange. `spot` es el único segmento que admite hoy una importación `cex`, lo que concuerda con que `instrument` sea un par spot llano |
| `cex.dataType` | cadena | obligatorio, `"ticker"` \| `"klines"`. Lo que se trae, y por tanto el `type` del conjunto de datos resultante ([Qué es el `type`](#qué-es-el-type): los tickers llevan el libro, las klines no) |

`cadence` es opcional y admite las mismas etiquetas que la cadencia de una preparación de backtest,
tanto para tickers como para klines: `1s`, `5s`, `1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `2h`, `4h`,
`8h`, `12h`, `1d`, `1w` o `1q`. Cualquier otra etiqueta es `400`. Si se omite, el conjunto de datos
se queda con la cadencia más fina que contienen **todas las partes** del rango. Las barras se
construyen a partir de los datos más finos que contienen todas las partes del rango, así que un
rango cuyo histórico cambia de cadencia a mitad (de `1m` a `1s`, por ejemplo) sale entero con la más
gruesa: el conjunto de datos no tiene ningún hueco que sea solo un cambio de cadencia. Una `cadence`
más fina que esa, o que no sea múltiplo exacto de ella, hace fallar la importación (`failed`, y
`error` nombra la cadencia más fina que contiene el rango) en lugar de darte un conjunto de datos
con una cadencia distinta de la que pediste.

```bash
curl -X POST https://api.qtsurfer.net/v1/datasets/imports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "btc-usdt-1s-sept",
    "instrument": "BTC/USDT",
    "from": "2026-09-01T00:00:00Z",
    "to": "2026-09-01T06:00:00Z",
    "cadence": "1s",
    "type": "cex",
    "cex": {
      "exchange": "binance",
      "segment": "spot",
      "dataType": "klines"
    }
  }'
# → 202 {"datasetId":"ds_3f9a1c2e7b0d4a5f","importId":"imp_01j9z...","jobId":"dataset-import:...","status":"fetching"}
```

Errores, además de los anteriores: `400` falta el bloque `cex`, `cex.exchange` no es un exchange
centralizado de `GET /exchanges` (uno descentralizado incluido), `cex.segment` no es `spot`,
`cex.dataType` no es `ticker` ni `klines`, o una `cadence` que no es ninguna de las etiquetas
anteriores. Si el rango contiene datos, y si los contiene lo bastante finos para la `cadence`, se
comprueba después, de forma asíncrona: ver `failed` abajo.

## Sondear una importación

`GET /datasets/{datasetId}/imports/{importId}` — sondea tras `POST /datasets/imports` hasta que
`status` sea `ready` o `failed`. Una importación pasa tiempo real buscando en su fuente antes de
que se aloje nada; una vez buscada, reentra exactamente en la misma cadena de ingesta que usa una
subida.

### Respuesta — `DatasetImportState`

| Campo | Notas |
|---|---|
| `status` | `fetching` (leyendo de la fuente, nada alojado todavía — el único estado que solo reporta una importación) → `ingesting` (buscado, alojado, el worker analiza/valida) → `ready` (`version` lleva el resultado) \| `failed` |
| `jobId` | el id del job de búsqueda/ingesta, mientras `status` es `fetching` o `ingesting` |
| `error` | motivo legible, presente cuando `status` es `failed` — un pool/par que no se resuelve, sin datos en el rango pedido, un rango más antiguo de lo que retiene la fuente, una `cadence` `cex` más fina que la que contiene el rango (el mensaje nombra la más fina), la búsqueda superando el límite de tiempo de tu plan, o cualquiera de los motivos del lado de ingesta que puede llevar `DatasetUploadState.error`, una vez que la búsqueda pasa el testigo a esa misma cadena. Se registra de forma duradera, igual que en la vía de subida |
| `version` | una [`DatasetVersion`](#datasetversion--una-subida-ingerida-con-éxito), presente cuando `status` es `ready` o `failed` |

```bash
curl https://api.qtsurfer.net/v1/datasets/$DATASET_ID/imports/$IMPORT_ID \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "importId": "imp_01j9z1x2y3z4a5b6c7d8e9f0g1",
  "status": "ready",
  "version": {
    "datasetId": "ds_3f9a1c2e7b0d4a5f", "id": "dsv_8e2b4f19c6a03d7e",
    "bytes": 4831022, "rows": 604800, "cadence": "rt",
    "timestampUnit": "us", "gaps": 0, "largestGapSteps": 0,
    "dataUrl": "https://storage.qtsurfer.com/.../dsv_8e2b4f19c6a03d7e/ticker_WETH_USDC_....lastra?X-Amz-...",
    "dataFormat": "lastra"
  }
}
```

Errores: `404` no existe ese conjunto de datos para este usuario, o realmente no se sabe nada de
este `importId`.

## Qué es el `type`

El `type` de un conjunto de datos dice qué son sus filas. Se decide cuando una versión pasa a `ready`, y es el
`type` de la versión **actual**. Una importación que ya sabe qué trajo lo dice, y no se adivina nada: una
importación `cex` es su `dataType`, y una importación `dex` que pidió velas es `klines`. Todo lo demás (una
subida de CSV, Lastra o Parquet, una importación `dex` de swaps on-chain) se lee de las filas:

| Las filas | `type` |
|---|---|
| llevan un libro de órdenes (`bid`, `bidSize`, `ask` o `askSize`) en alguna fila | `ticker` |
| no tienen libro, y llevan `open`, `high`, `low` y `close` en todas las filas | `klines` |
| cualquier otra cosa: solo un `close` (un fichero de `timestamp,close` es un precio), o solo algunas de las cuatro columnas OHLC, o solo algunas filas | `ticker` |

Dos comprobaciones más evitan que un ticker pase por velas. En un ticker, la apertura, el máximo, el mínimo y el
volumen son las cifras móviles de 24 horas del exchange, no las de un intervalo. Un fichero sin libro sigue
siendo `ticker` si se cumple alguna de estas dos condiciones:

* **El máximo y el mínimo casi nunca cambian.** Al menos 100 filas en las que cambian entre menos de 1 de cada
  200 filas consecutivas. Un fichero donde todas las filas tienen el mismo precio (`high` igual a `low`, un
  instrumento que nadie negoció) sigue siendo de velas. Esta comprobación no distingue las cifras de 24 horas de
  barras con una cadencia gruesa (una hora o más).
* **Las aperturas no siguen a los cierres.** Una barra abre donde cerró la anterior (dentro del 0,01 % de él);
  la apertura de una ventana de 24 horas no. Al menos 20 filas, de las que menos de 1 de cada 20 abren en el
  cierre que tienen antes.

Solo las filas de una subida y de una importación `dex` de swaps pasan por estas comprobaciones. No deciden nada
para una importación que declara su `type`.

Hasta que la primera versión es `ready`, el `type` es solo la etiqueta de la forma en que se creó el conjunto de
datos (`ticker` para una subida, `klines` para una importación que pidió velas). Una subida posterior de otro
tipo de datos cambia el `type` del conjunto de datos; cada versión conserva el suyo, y un backtest que fija
`datasetVersionId` se juzga por el de esa versión. Los conjuntos de datos almacenados antes de esta regla
conservan el `type` que tenían.

## Forma del conjunto de datos

Tanto [`GET /datasets`](#listar-tus-conjuntos-de-datos) como [`GET
/datasets/{datasetId}`](#obtener-un-conjunto-de-datos) devuelven esto — `from`/`to`/`cadence`/
`timestampUnit` reflejan el rango, la cadencia y la unidad de marca de tiempo propios descubiertos
de la versión *actual*, y `status`, `bytes`, `rows`, `gaps` y `largestGapSteps` dicen si es
utilizable y qué tamaño tiene, así que no necesitas una segunda llamada para ver qué cubre un
conjunto de datos.

| Campo | Notas |
|---|---|
| `datasetId`, `name`, `type` (`"ticker"` \| `"klines"`), `instrument`, `createdAt`, `status` | siempre presentes. `type` dice qué son las filas de la versión actual, decidido cuando la versión pasó a `ready` ([Qué es el `type`](#qué-es-el-type)): `"klines"` para velas (una subida con `open`, `high`, `low` y `close` en todas las filas y sin libro; una importación `dex` que pidió una `cadence` de velas; una importación `cex` con `dataType: "klines"`), `"ticker"` para un libro o un precio suelto. Antes de que la primera versión sea `ready` es solo la etiqueta de la forma en que se creó el conjunto de datos |
| `currentVersionId` | la versión finalizada e ingerida con éxito más reciente. **Ausente hasta que al menos una subida ha terminado de ingerirse** |
| `status` | `ready` — `currentVersionId` está fijado y los campos de abajo lo describen; `failed` — el intento de subida o importación más reciente falló, no hay nada que leer todavía (consulta `error`); `pending` — nunca se intentó nada (recién creado, o una subida nunca se finalizó) |
| `updatedAt` | cuándo cambió `currentVersionId` por última vez; ausente hasta que tiene un valor |
| `from`, `to`, `cadence`, `timestampUnit` | el rango/cadencia/unidad de marca de tiempo propios de la versión actual (una cuadrícula fija o cadencia `rt`, `iso`\|`s`\|`ms`\|`us` para `timestampUnit`, consulta [`DatasetVersion`](#datasetversion--una-subida-ingerida-con-éxito)), tal como se descubrieron en la ingesta. **Ausentes hasta que existe una versión** |
| `bytes`, `rows`, `gaps`, `largestGapSteps` | el tamaño almacenado, el número de filas, el número de huecos y el mayor hueco (en pasos de su cadencia) propios de la versión actual. **Presentes solo cuando `status` es `ready`** — consulta [`DatasetVersion`](#datasetversion--una-subida-ingerida-con-éxito) para saber qué mide `bytes` exactamente |
| `error` | por qué falló el intento más reciente. **Presente solo cuando `status` es `failed`** |

`GET /datasets/{datasetId}` por sí solo añade `dataUrl`/`dataFormat` (con el mismo significado que
en [`DatasetVersion`](#datasetversion--una-subida-ingerida-con-éxito)) una vez que la versión
actual está `ready`, más `_links.self`. El listado masivo no los emite nunca — una URL de descarga
prefirmada para cada conjunto de datos en una pantalla que no dibuja ninguna gráfica no compensa
la exposición.

## Listar tus conjuntos de datos

`GET /datasets` — todos los conjuntos de datos que has creado y no has eliminado, los creados más
recientemente primero. **Nunca un `404`** — un array vacío si no tienes ninguno, la misma
convención que `GET /strategies`.

```bash
curl https://api.qtsurfer.net/v1/datasets -H "Authorization: Bearer $TOKEN"
```

`GET /datasets?includeDeleted=true` lista también los conjuntos de datos que has eliminado, cada uno
con el `deletedAt` en que se eliminó — útil para mantener tu propia copia de la lista sincronizada,
de modo que un conjunto eliminado aparezca como eliminado en lugar de limitarse a desaparecer.

## Obtener un conjunto de datos

`GET /datasets/{datasetId}` — un [`Dataset`](#forma-del-conjunto-de-datos) más un `_links.self`.

```bash
curl https://api.qtsurfer.net/v1/datasets/$DATASET_ID -H "Authorization: Bearer $TOKEN"
```

Errores: `404` no existe ese conjunto de datos para este usuario.

## Eliminar un conjunto de datos

`DELETE /datasets/{datasetId}` — eliminación suave. Deja de aparecer en los endpoints de listado/
obtención y ya no puede usarse para preparar, pero sus datos de objeto se recuperan más tarde en
lugar de purgarse en el acto, así que un backtest ya en marcha contra una de sus versiones no se
interrumpe.

```bash
curl -X DELETE https://api.qtsurfer.net/v1/datasets/$DATASET_ID -H "Authorization: Bearer $TOKEN"
# → {"datasetId": "ds_3f9a1c2e7b0d4a5f", "deleted": true}
```

Errores: `404` no existe ese conjunto de datos para este usuario, o ya está eliminado.

## Hacer backtest contra un conjunto de datos

Una vez que una versión está `ready`, prepara y ejecuta exactamente igual que contra un exchange
gestionado, pero con `exchangeId: user` y `datasetId` en lugar de `instrument`:

```bash
curl -X POST https://api.qtsurfer.net/v1/backtest/user/ticker/prepare \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"datasetId":"ds_3f9a1c2e7b0d4a5f","from":"2026-03-14","to":"2026-03-15"}'
# → 202 {"jobId":"5ikYAMIO...","datasetId":"ds_3f9a1c2e7b0d4a5f","datasetVersionId":"dsv_8e2b4f19c6a03d7e"}
```

`execute` no cambia — el mismo cuerpo de petición que contra un exchange gestionado, ya que el
instrumento y el rango se recuperan de `prepareJobId` en cualquier caso. Consulta
[`docs/backtest_execute.md`](backtest_execute) para la referencia completa de prepare/execute,
incluidos los campos `datasetId`/`datasetVersionId` de `PrepareRequest` y la forma de cobertura
respaldada por conjunto de datos en `PrepareJobState` (`cadence`/`gaps`/`largestGapSteps` en lugar
de los `totalHours`/`hoursWithData`/`hoursWithoutData` recorridos por hora).

### Qué conjuntos de datos se ejecutan con cada `{type}`

El `{type}` de la ruta dice con qué se alimenta la estrategia; el `type` del propio conjunto de datos dice lo
que contiene. Tanto las ejecuciones `ticker` como las `kline` aceptan un conjunto de datos, y un conjunto de
datos de velas se puede ejecutar de cualquiera de las dos maneras:

| `{type}` de la ejecución | conjunto de datos de `type` `ticker` | conjunto de datos de `type` `klines` |
|---|---|---|
| `ticker` | sí | sí |
| `kline` | `400` al preparar | sí |

Una ejecución `kline` sobre un conjunto de datos lee las filas del propio conjunto como las barras: no se
construye ningún ticker a partir de ellas. Por defecto cada fila es una barra, con la `cadence` propia del
conjunto de datos. Una `cadence` más gruesa que sea un múltiplo exacto de ella agrega las filas en barras más
anchas, y una barra que el rango cubre solo en parte se descarta en lugar de emitirse corta. `execute`,
`executeSweep` y walk-forward la aceptan.

La barra a la que pertenece una fila es su marca de tiempo truncada a la cadencia del conjunto de datos, así que
un fichero marcado en la apertura de cada barra y otro marcado en su cierre (el último milisegundo de la barra)
dan las mismas barras. Una marca de tiempo fuera de la rejilla de la cadencia (un fichero de un minuto marcado
en el :20 de cada minuto) se trunca sobre ella, y la primera barra, que entonces abre antes de tu `from`, se
descarta como cualquier barra que el rango cubre solo en parte.

Una preparación `kline` sobre un conjunto de datos que no es `klines` se rechaza con un `400` que nombra el
tipo del conjunto de datos, antes de encolar nada, y dice que se prepare como datos de ticker. Una ejecución
`ticker` sobre un conjunto de datos `klines` se acepta: cada barra se lee como una muestra, sin libro de
órdenes.

El `type` que lee esta tabla es el de la versión que leerá la ejecución: la actual, o la que fija un
`datasetVersionId` ([Qué es el `type`](#qué-es-el-type)). Por tanto, un fichero que subes es `klines` una vez ingerido si contiene velas
(`open`, `high`, `low` y `close` en todas las filas, cada apertura en el cierre anterior, sin libro), y se
ejecuta como barras; un fichero con libro, o solo con un precio, es `ticker`. Un conjunto de datos de velas
también procede de una [importación](#importar-un-conjunto-de-datos-en-lugar-de-subirlo) de las velas de un
exchange (o de una importación `dex` que pide una `cadence` de velas).
