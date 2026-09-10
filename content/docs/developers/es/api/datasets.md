---
title: Conjuntos de datos
description: Sube datos históricos de ticker y úsalos en el flujo estándar de backtesting.
order: 5.6
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 92aeb9355a85b700698bce2ffcbedd2363bf1799
upstreamPath: docs/datasets.md
lastUpdated: '2026-09-10T21:40:58Z'
---

Haz backtest contra un CSV o un fichero parquet que subes en lugar de contra un exchange
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

v1 es solo datos de ticker — `type` es siempre `"ticker"`. `instrument` debe ser un par spot llano
(`BASE/QUOTE`, exactamente una `/`); las formas de derivados (`BTC/USDT:USDT`) se rechazan.

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

**CSV o parquet.** Un CSV necesita fila de cabecera; un fichero parquet ya lleva sus columnas con
nombre. En cualquiera de los dos casos, `timestamp` (ISO-8601, o segundos/milisegundos/
microsegundos de época numéricos — detectado en la primera fila, y exigido después para cada fila
posterior) y `close` son obligatorias. Opcionales: `open`, `high`, `low`, `volume`, `quoteVolume`,
`bid`, `bidSize`, `ask`, `askSize`. **La cadencia y la unidad de la marca de tiempo se descubren a
partir de los datos, no se declaran.**

Una subida CSV se convierte a nuestro formato columnar nativo (`lastra`) para almacenarla. Una
subida parquet se guarda hoy tal cual. En ambos casos, consulta `dataFormat` en la [versión
lista](#datasetversion--una-subida-ingerida-con-éxito) para saber qué recibes de vuelta
realmente — no lo des por hecho a partir de cómo la subiste.

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
versión (el mensaje de error lo nombra) · `413` el fichero subido excede el límite de tamaño de tu
plan para un conjunto de datos.

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
| `bytes` | tamaño del fichero **almacenado** (`dataUrl`) — un `lastra` convertido para una subida CSV (descomprimida antes, si llegó como `.gz`/`.zip`), o el propio fichero parquet para una subida parquet. No el tamaño de los bytes subidos originalmente (`PUT`) |
| `rows` | número de filas de datos |
| `cadence` | descubierta a partir de las propias marcas de tiempo de los datos: una cuadrícula fija (`1s`, `5s`, `15s`, `1m`, `5m`, `15m`, `30m`, `1h`, `4h`, `1d`) cuando al menos la mitad de los intervalos entre filas caen en ese paso (se tolera un pequeño desajuste de reloj), o `rt` — datos nativos a la tasa en que se capturaron, cada fila con su propia marca de tiempo sin paso fijo (swaps on-chain por operación, ticks espaciados por bloque o de menos de un segundo, intervalos irregulares). Un conjunto de datos `rt` se puede remuestrear a cualquier cadencia fija al preparar |
| `timestampUnit` | `iso` \| `s` \| `ms` \| `us` — la unidad en la que llegó la columna `timestamp` |
| `gaps`, `largestGapSteps` | número de huecos a la cadencia descubierta, y el tamaño del mayor en pasos de esa cadencia. Siempre `0` para `rt` |
| `dataUrl` | URL GET prefirmada al fichero almacenado — consulta `dataFormat`. Presente una vez `ready` |
| `dataFormat` | `lastra` (convertido, desde una subida CSV/gzip/zip) \| `parquet` (sin convertir, desde una subida parquet) |

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

`type` elige la fuente. `dex` — histórico sobre el propio mercado on-chain de un pool/par — es el
único valor por ahora; otros tipos de fuente se sumarán a este mismo endpoint más adelante. Una
importación `dex` tiene dos formas de datos, elegidas por la `cadence` de nivel superior:

* Omitida/en blanco (por defecto) — histórico de swaps on-chain, reproducido directamente desde la
  propia cadena del pool/par, cada swap con su propia marca de tiempo (cadencia nativa por
  operación).
* `1s` \| `1m` \| `5m` — velas pre-agregadas a esa anchura en lugar de operaciones en bruto. El
  `type` del conjunto de datos resultante es `klines`, no `ticker`.

| Campo | Tipo | Notas |
|---|---|---|
| `name` | cadena | obligatorio, único entre tus conjuntos de datos. `409` si ya está en uso |
| `instrument` | cadena | obligatorio, par spot llano — la etiqueta propia del conjunto de datos, independiente del orden de los tokens on-chain del pool |
| `from`, `to` | cadena (fecha-hora) | obligatorio, ISO-8601 UTC. `from` inclusivo, `to` exclusivo, `from < to`. El rango total está limitado por tu plan |
| `cadence` | cadena | opcional. Omitida/en blanco = cadencia nativa por operación (ver abajo). Uno de `1s` \| `1m` \| `5m` pide en su lugar velas pre-agregadas a esa anchura — cualquier otro valor es `400` |
| `type` | cadena | obligatorio, `"dex"` es el único valor por ahora |
| `dex.network` | cadena | obligatorio, uno de `ethereum` \| `robinhood` |
| `dex.id` | cadena | obligatorio salvo que `cadence` pidiera velas, en cuyo caso se ignora. `"uniswap"` es el único valor por ahora — qué protocolo DEX on-chain implementa `dex.contract` |
| `dex.version` | cadena | obligatorio salvo que `cadence` pidiera velas, en cuyo caso se ignora. `"v2"` \| `"v3"` |
| `dex.contract` | cadena | obligatorio, la dirección del contrato del pool (v3) o par (v2) |
| `dex.factory` | cadena | opcional — omite para autodescubrirla on-chain a partir de `contract`; indícala solo si ya la conoces o el pool/par pertenece a una factory no canónica. En cualquier caso el pool/par se valida contra la factory que se use antes de buscar nada. Se ignora si `cadence` pidió velas |

**La cadencia on-chain es nativa, no se remuestrea.** Una importación `dex` normal (sin `cadence`)
mantiene la propia cadencia de eventos por operación de la fuente — cada swap en la marca de tiempo
en la que ocurrió, así que la `cadence` de la versión resultante es `rt` salvo que los swaps caigan
por casualidad en una cuadrícula fija — en lugar de agruparlos en velas; remuestrea a una cadencia
más gruesa después, como un paso aparte, si necesitas una a partir de datos on-chain. Pedir
`cadence: "1s"`/`"1m"`/`"5m"` en su lugar te da velas pre-agregadas a esa anchura directamente. No
todas las redes soportan todavía todas las cadencias — una combinación no soportada falla de forma
asíncrona, igual que un pool que no se resuelve (ver `failed` abajo), no en el momento de la
petición.

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
conjunto de datos ya en uso · `429` se alcanzó el límite de conjuntos de datos de tu plan.

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
| `error` | motivo legible, presente cuando `status` es `failed` — un pool/par que no se resuelve, sin datos en el rango pedido, un rango más antiguo de lo que retiene la fuente, la búsqueda superando el límite de tiempo de tu plan, o cualquiera de los motivos del lado de ingesta que puede llevar `DatasetUploadState.error`, una vez que la búsqueda pasa el testigo a esa misma cadena. Se registra de forma duradera, igual que en la vía de subida |
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

## Forma del conjunto de datos

Tanto [`GET /datasets`](#listar-tus-conjuntos-de-datos) como [`GET
/datasets/{datasetId}`](#obtener-un-conjunto-de-datos) devuelven esto — `from`/`to`/`cadence`
reflejan el rango y la cadencia propios descubiertos de la versión *actual*, así que no necesitas
una segunda llamada para ver qué cubre un conjunto de datos.

| Campo | Notas |
|---|---|
| `datasetId`, `name`, `type` (`"ticker"` \| `"klines"`), `instrument`, `createdAt` | siempre presentes. `type` es `"klines"` solo para una importación `dex` que pidió una `cadence` de velas; `"ticker"` para todo lo demás (subidas, e importaciones `dex` de cadencia nativa) |
| `currentVersionId` | la versión finalizada e ingerida con éxito más reciente. **Ausente hasta que al menos una subida ha terminado de ingerirse** |
| `updatedAt` | cuándo cambió `currentVersionId` por última vez; ausente hasta que tiene un valor |
| `from`, `to`, `cadence` | el rango/cadencia propios de la versión actual (una cuadrícula fija o `rt`, consulta [`DatasetVersion`](#datasetversion--una-subida-ingerida-con-éxito)), tal como se descubrieron en la ingesta. **Ausentes hasta que existe una versión** |

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