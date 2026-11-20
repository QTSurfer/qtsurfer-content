---
title: Canales de señales
description: Un proveedor publica avisos sobre un instrumento; las ejecuciones en vivo suscritas al canal lo reciben adjuntado, al instante o tras un retraso.
order: 5.47
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: b730b82dbf370bf69cd52983fde46366d7ba82f2
upstreamPath: docs/signals.md
lastUpdated: '2026-11-19T23:58:57Z'
---

Un **canal de señales** lleva **avisos** de un proveedor a ejecuciones en vivo. Un proveedor es cualquier usuario, normalmente un
servicio que detecta un instrumento a punto de moverse. Publica un aviso que dice «este par, o esta pool, merece atención
ahora». Cualquier usuario puede **suscribir** una de sus ejecuciones en vivo al canal. Cada aviso se entrega entonces a la
ejecución **adjuntándole** el instrumento, como lo haría `POST /live/{runId}/attachments`, al instante o tras el retraso que
eligió la suscripción.

| Método | Ruta | Para qué sirve |
|---|---|---|
| `POST` | `/signals/channels` | Crear un canal tuyo |
| `GET` | `/signals/channels` | Listar tus canales |
| `GET` | `/signals/channels/public` | Explorar los canales públicos (sin token) |
| `GET` | `/signals/channels/{channelId}` | Leer un canal |
| `PATCH` | `/signals/channels/{channelId}` | Cambiar un canal tuyo, o sustituir su dirección de webhook |
| `DELETE` | `/signals/channels/{channelId}` | Borrar un canal tuyo |
| `POST` | `/signals/channels/{channelId}/notices` | Publicar un aviso |
| `GET` | `/signals/channels/{channelId}/notices` | Listar tus avisos y cómo se entregaron |
| `POST` | `/signals/hook/{hookKey}` | Publicar un aviso por la dirección de webhook del canal (sin token) |
| `POST` | `/signals/channels/{channelId}/subscriptions` | Suscribir una ejecución tuya |
| `GET` | `/signals/subscriptions` | Listar tus suscripciones |
| `DELETE` | `/signals/subscriptions/{subscriptionId}` | Terminar una suscripción |
| `GET` | `/signals/subscriptions/{subscriptionId}/deliveries` | Lo que recibió una suscripción |

Los alcances que necesitan estas operaciones están en [Autenticación y alcances](auth#el-alcance-que-exige-cada-operación).

## Cómo funciona

1. El proveedor crea un canal y dice qué **retrasos** ofrece, por ejemplo `[0, 60]`: entregado al instante, o un minuto
   después.
2. Un suscriptor arranca una ejecución, normalmente sin `sources`, para que espere (consulta
   [Adjuntar y quitar una fuente](live#adjuntar-y-quitar-una-fuente)). Después suscribe la ejecución al canal, eligiendo uno
   de los retrasos.
3. El proveedor publica un aviso sobre un instrumento.
4. Cuando el aviso le toca a una suscripción, en su publicación más el retraso de la suscripción, el instrumento se adjunta a
   la ejecución. Una ejecución que esperaba arranca con él; una que ya lee lo toma como una fuente más, en el `effectiveAtMs`
   del adjuntado. La estrategia se entera en `onAttach`, como con cualquier adjuntado (consulta
   [QTScript](/docs/strategies/qtscript) y [Programar estrategias en Java](/docs/strategies/java/strategy_coding)).

Una entrega es un adjuntado corriente de la ejecución del suscriptor: el plan del suscriptor y las reglas de las fuentes de la
ejecución deciden si cabe. Un aviso nunca le cuesta al suscriptor más que un adjuntado que hubiera hecho él mismo. No se quita
nada cuando llega un aviso posterior; quita tú un adjuntado cuando termines con él.

## Crear un canal

```json
POST /signals/channels
{
  "name": "Early pool alerts",
  "description": "Pools about to move, seconds ahead.",
  "visibility": "public",
  "delays": [0, 60]
}
```

```json
{
  "channelId": "7aQk2mVn9pXr4sTw1yZb3c",
  "name": "Early pool alerts",
  "description": "Pools about to move, seconds ahead.",
  "visibility": "public",
  "delays": [0, 60],
  "createdAtMs": 1758330000000,
  "webhookUrl": "https://api.qtsurfer.net/v1/signals/hook/7aQk2mVn9pXr4sTw1yZb3c.Jp3kQ0aZx9LmB2vT7nWc4e",
  "subscriptions": 0
}
```

| Campo | Qué significa |
|---|---|
| `name` | Obligatorio, de 1 a 64 caracteres. Lo que ven los suscriptores. Tu usuario nunca se le muestra a nadie. |
| `description` | Opcional, hasta 500 caracteres. |
| `visibility` | `unlisted` (el valor por defecto): solo se encuentra por su `channelId`, que das a quien quieras. `public`: aparece además en `GET /signals/channels/public`. |
| `delays` | De 1 a 4 segundos enteros distintos, de `0` a `3600`; si se omite, `[0]`. Cada suscripción elige uno. |

`webhookUrl` y `subscriptions` (cuántas hay activas; nunca quién las tiene) solo se te muestran a ti, el propietario.

`PATCH /signals/channels/{channelId}` cambia cualquiera de ellos. Una suscripción conserva el retraso que eligió aunque `delays`
ya no lo ofrezca. `"rotateWebhook": true` sustituye `webhookUrl`, y la dirección antigua deja de publicar al instante.
`DELETE` termina todas las suscripciones, y los avisos que aún estaban por entregar no se entregan.

## Publicar un aviso

```json
POST /signals/channels/{channelId}/notices
{
  "source": {
    "venueType": "dex",
    "exchange": "robinhood",
    "segment": "uniswap-v3",
    "instruments": ["0x3f4e0b2c8e1a4b6d9c0f1a2b3c4d5e6f708192a3"]
  },
  "ref": "alert-8841",
  "expiresIn": 300,
  "data": { "direction": "up", "confidence": "high" }
}
```

```json
{
  "noticeId": "2Hn8sKp4vQx7mRt1wYz6Ab",
  "deliveries": 12,
  "receivedAtMs": 1758330000000,
  "expiresAtMs": 1758330300000
}
```

| Campo | Qué significa |
|---|---|
| `source` | Obligatorio. El instrumento: una fuente como la toma un arranque (consulta [Fuentes](live#fuentes)), sin `type` y con los instrumentos nombrados uno a uno. Para una fuente `cex`, de 1 a 10 pares, sin `*`. Para una fuente `dex`, exactamente una pool. |
| `ref` | Opcional, hasta 64 caracteres. El mismo `ref` al mismo canal devuelve el aviso que ya hizo, así que una petición reintentada o una alerta repetida es segura. Una repetición no cuenta contra la tasa del canal. |
| `expiresIn` | Opcional, de `1` a `3600` segundos, `300` por defecto. Una entrega no hecha para entonces queda `EXPIRED`. Una suscripción cuyo retraso es mayor que esto nunca recibe el aviso. |
| `data` | Opcional. Texto para que lo lean los suscriptores junto al aviso: hasta 16 entradas. Las claves van en minúsculas (letras, dígitos, `_`, partes separadas por `.`), de hasta 64 caracteres. Los valores tienen de 1 a 256 caracteres, sin caracteres de control. No llega a la estrategia. |

`deliveries` es a cuántas suscripciones va el aviso: las que están activas cuando se publica. Una suscripción hecha después no lo
recibe. Lo que hizo cada entrega le toca leerlo al suscriptor; `GET /signals/channels/{channelId}/notices` te muestra los
recuentos por estado.

### Por la dirección de webhook

Un emisor que no puede conseguir un token, ni poner una cabecera, publica con el mismo cuerpo en el `webhookUrl` del canal:

```bash
curl -X POST "https://api.qtsurfer.net/v1/signals/hook/7aQk2mVn9pXr4sTw1yZb3c.Jp3kQ0aZx9LmB2vT7nWc4e" \
  -H "Content-Type: application/json" \
  -d '{"source":{"venueType":"cex","exchange":"binance","segment":"spot","instruments":["SOL/USDT"]},"ref":"a-17"}'
```

La dirección es la credencial: mantenla en secreto y sustitúyela si se filtra. Responde igual que publicar con un token, con los
límites de tu plan. Una dirección que no es la actual de un canal responde `404`.

## Suscribir una ejecución

```json
POST /signals/channels/{channelId}/subscriptions
{ "runId": "5t5oAmQ4PD0lQRoCU58uE0", "delay": 60 }
```

| Campo | Qué significa |
|---|---|
| `runId` | Obligatorio. Una de tus ejecuciones en vivo. Cada ejecución se suscribe a un canal una sola vez. |
| `delay` | Opcional. Uno de los `delays` del canal; si se omite, el menor. |
| `type` | Opcional, `ticker` o `kline`, `kline` por defecto. Cómo lee la ejecución el instrumento de un exchange centralizado; tiene que ser uno que consuma la estrategia de la ejecución. Una pool se lee siempre como `kline`. |
| `warmFrom` | Opcional, de `0` a `3600`, `0` por defecto: el calentamiento de cada adjuntado que hace una entrega (consulta [Calentar la ejecución](live#calentar-la-ejecución-warmfrom)). Con `0` la estrategia lee desde el momento de la entrega, que es la forma más rápida de actuar sobre un aviso. Una pool entregada a una ejecución que ya lee otra se lee desde ese momento, diga lo que diga esto. |

Se puede suscribir a cualquier canal, `unlisted` o `public`, tuyo o de cualquiera, siempre que tengas su `channelId`.
`DELETE /signals/subscriptions/{subscriptionId}` termina una suscripción. Lo que ya adjuntó se queda adjuntado.

## Leer las entregas

`GET /signals/subscriptions/{subscriptionId}/deliveries` lista cada aviso que la suscripción tenía que recibir, el más reciente
primero, con su `source` y su `data`, y lo que hizo su entrega:

| `status` | Qué significa |
|---|---|
| `PENDING` | Aún no toca, o se está haciendo. |
| `ATTACHED` | El instrumento se adjuntó a la ejecución; `attachmentId` nombra el adjuntado. Lee los `attachments` de la ejecución para saber cómo está. Un aviso sobre un instrumento que la ejecución ya tiene adjuntado cuenta como entregado, con ese adjuntado. |
| `REFUSED` | La ejecución no pudo tomarlo; `reason` dice por qué (más abajo). |
| `EXPIRED` | No se hizo antes de que el aviso caducara. |
| `SKIPPED` | No se hizo: `NOT_RUNNING` (la ejecución no estaba corriendo), `UNSUBSCRIBED` o `CHANNEL_DELETED`. |

El `reason` de una entrega `REFUSED`:

| `reason` | Cuándo |
|---|---|
| `PLAN_LIMIT` | Un límite de tu plan: los instrumentos que puede leer una ejecución, las pools que puedes seguir a la vez, o las ejecuciones que puedes tener leyendo a la vez. |
| `PLAN_REQUIRED` | Tu plan ya no incluye ejecuciones en vivo, o suscripciones. |
| `OTHER_FEED` | La ejecución lee otro mercado: toda fuente adjuntada a una ejecución a la vez está en el mismo. |
| `NOT_ACCEPTED` | La estrategia de la ejecución no acepta ese instrumento o ese `type`. |
| `CAPACITY` | La plataforma no tenía sitio. |

Los conjuntos pueden crecer: lee un `status` desconocido como no entregado, y un `reason` desconocido como un rechazo.

## Límites por plan

Esta tabla es el único sitio que los lista.

| Plan | Canales que posees | Suscripciones activas | Avisos por canal, cada 60 segundos |
|---|---|---|---|
| free | 0 | 0 | 0 |
| basic | 1 | 2 | 6 |
| pro | 3 | 10 | 30 |
| elite | 10 | 50 | 60 |

Un plan con `0` en algo no lo incluye: la operación se rechaza con `402`. Pasado el límite, crear un canal o suscribirse se
rechaza con `429` y `reason: PLAN_LIMIT`, sin `Retry-After`. Publicar por encima de la tasa se rechaza con `429` y
`reason: NOTICE_RATE_LIMIT`, `retryable: true`, y `Retry-After` dice cuándo cabe el siguiente aviso.

## Qué puede rechazar una petición

| Estado | Cuándo |
|---|---|
| `400` | Un campo fuera de sus reglas; un `source` de aviso que no es un instrumento o una pool de un mercado que se pueda seguir en vivo; un `type` de suscripción que la estrategia de la ejecución no consume. |
| `402` | Tu plan no lo incluye (consulta [Límites por plan](#límites-por-plan)). |
| `404` | No existe ese canal (o se borró), no existe esa ejecución o suscripción tuya, o una dirección de webhook que no es la actual. Publicar en un canal que no es tuyo, cambiarlo o borrarlo también es `404`. |
| `409` | La ejecución ya está suscrita al canal, o `delay` no es uno de los que ofrece el canal. |
| `429` | `PLAN_LIMIT` o `NOTICE_RATE_LIMIT`, como arriba. |

## Guías relacionadas

- [Ejecución en vivo](live): ejecuciones que esperan, y adjuntar una fuente.
- [QTScript](/docs/strategies/qtscript) y [Programar estrategias en Java](/docs/strategies/java/strategy_coding): `onAttach` y `onDetach`.
- [Autenticación y alcances](auth): el alcance `signals`.
