---
title: Conjuntos de datos
description: Sube datos históricos de ticker y úsalos en el flujo estándar de backtesting.
order: 5.6
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: dc37afd8cf9ea955d212253460ac5d46b3791bb2
upstreamPath: docs/datasets.md
lastUpdated: '2026-09-04T00:00:00Z'
---

Haz backtest contra un CSV que subes en lugar de contra un exchange gestionado: crea un conjunto
de datos, sube el fichero (`PUT`) a una URL prefirmada, finalízalo para disparar la ingesta, y
luego [prepara/ejecuta](backtest_execute) exactamente como de costumbre pero con el
`exchangeId: user` reservado.

| Método | Ruta | Propósito |
|---|---|---|
| `POST` | `/datasets` | Crear un conjunto de datos + primera sesión de subida |
| `GET` | `/datasets` | Listar tus conjuntos de datos |
| `GET` | `/datasets/{datasetId}` | Obtener uno |
| `DELETE` | `/datasets/{datasetId}` | Eliminar |
| `POST` | `/datasets/{datasetId}/uploads` | Abrir una nueva sesión de subida para un conjunto de datos existente |
| `POST` | `/datasets/{datasetId}/uploads/{uploadId}/finalize` | Disparar la ingesta |
| `GET` | `/datasets/{datasetId}/uploads/{uploadId}` | Sondear el estado de subida/ingesta |

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
es el destino prefirmado — sube (`PUT`) el CSV en bruto ahí directamente, sin cabecera
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

**Formato CSV.** Se requiere fila de cabecera. `timestamp` (ISO-8601, o segundos/milisegundos/
microsegundos de época numéricos — detectado en la primera fila, y exigido después para cada fila
posterior) y `close` son columnas obligatorias. Opcionales: `open`, `high`, `low`, `volume`,
`quoteVolume`, `bid`, `bidSize`, `ask`, `askSize`. **La cadencia y la unidad de la marca de tiempo
se descubren a partir de los datos, no se declaran.**

Los bytes que se suben (`PUT`) a `upload.url` pueden ser ese CSV directamente, comprimidos en
gzip (`.gz`), o en zip (`.zip`, exactamente un fichero dentro — un conjunto de datos es un único
fichero sin importar cómo viaje). Se detecta a partir del propio contenido: en este flujo no hay
ni nombre de fichero ni `Content-Type` con los que un cliente pueda declararlo, así que no hace
falta enviar nada más que los bytes.

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
subió) antes de que finalices. **Respaldado por Postgres una vez existe una versión**, así que
`ready`/`failed` son respuestas permanentes; `uploading`/`ingesting` reflejan estado en curso que
puede caducar por sí mismo (ver el caso `404` más abajo).

### Respuesta — `DatasetUploadState`

| Campo | Notas |
|---|---|
| `status` | `uploading` (fichero subido con `PUT`, aún no finalizado) → `ingesting` (finalize llamado, el worker analiza/valida) → `ready` (`version` lleva el resultado) \| `failed` (por ejemplo, contrato CSV incorrecto, unidades de marca de tiempo mezcladas, un `.zip` sin fichero dentro o con más de uno) |
| `jobId` | el id del job de ingesta, mientras `status` es `ingesting` |
| `version` | una [`DatasetVersion`](#datasetversion), presente cuando `status` es `ready` o `failed` |

#### `DatasetVersion` — una subida ingerida con éxito

| Campo | Notas |
|---|---|
| `id` | el id de la versión — pásalo como `datasetVersionId` en la preparación para fijarla |
| `bytes` | tamaño del CSV en sí -- descomprimido, si la subida fue un `.gz`/`.zip` -- no el tamaño de los bytes subidos (`PUT`) al almacenamiento |
| `rows` | número de filas de datos |
| `cadence` | cadencia de barra descubierta (`1s`, `1m`, `1h`, ...) |
| `timestampUnit` | `iso` \| `s` \| `ms` \| `us` — la unidad en la que llegó la columna `timestamp` |
| `gaps`, `largestGapSteps` | número de huecos a la cadencia descubierta, y el tamaño del mayor en pasos de esa cadencia |

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
    "timestampUnit": "iso", "gaps": 0, "largestGapSteps": 0
  }
}
```

Errores: `404` no existe ese conjunto de datos para este usuario, o realmente no se sabe nada de
este `uploadId` — sin versión, sin job en curso, nunca se subió (`PUT`) nada a su URL de subida.

## Forma del conjunto de datos

Tanto [`GET /datasets`](#listar-tus-conjuntos-de-datos) como [`GET
/datasets/{datasetId}`](#obtener-un-conjunto-de-datos) devuelven esto — `from`/`to`/`cadence`
reflejan el rango y la cadencia propios descubiertos de la versión *actual*, así que no necesitas
una segunda llamada para ver qué cubre un conjunto de datos.

| Campo | Notas |
|---|---|
| `datasetId`, `name`, `type` (`"ticker"`), `instrument`, `createdAt` | siempre presentes |
| `currentVersionId` | la versión finalizada e ingerida con éxito más reciente. **Ausente hasta que al menos una subida ha terminado de ingerirse** |
| `updatedAt` | cuándo cambió `currentVersionId` por última vez; ausente hasta que tiene un valor |
| `from`, `to`, `cadence` | el rango/cadencia propios de la versión actual, tal como se descubrieron en la ingesta. **Ausentes hasta que existe una versión** |

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