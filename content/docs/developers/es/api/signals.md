---
title: Canales de señales
description: Un proveedor vende los avisos de un canal como ofertas y códigos de un solo uso; las ejecuciones en vivo de una suscripción reciben el instrumento adjuntado, al instante o tras un retraso.
order: 5.47
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 8fd7c0742c8940b7643f4e899aef9e51a1cd2ade
upstreamPath: docs/signals.md
lastUpdated: '2026-11-28T11:11:09Z'
---

Un **canal de señales** lleva **avisos** de un proveedor a ejecuciones en vivo. Un proveedor es cualquier usuario, normalmente un
servicio que detecta un instrumento a punto de moverse. Publica un aviso que dice «este par, o esta pool, merece atención
ahora». Lo que vende es el acceso a esos avisos, como **ofertas**: un retraso, un número de ejecuciones, una duración. Cada venta
es un **código** de un solo uso. Quien canjea un código obtiene una **suscripción** que alimenta sus ejecuciones en vivo: cada
aviso llega a esas ejecuciones con el retraso de la oferta, **adjuntándoles** el instrumento, como lo haría
`POST /live/{runId}/attachments`.

| Método | Ruta | Para qué sirve |
|---|---|---|
| `POST` | `/signals/channels` | Crear un canal tuyo |
| `GET` | `/signals/channels` | Listar tus canales |
| `GET` | `/signals/channels/public` | Explorar los canales públicos y sus ofertas (sin token) |
| `GET` | `/signals/channels/{channelId}` | Leer un canal |
| `PATCH` | `/signals/channels/{channelId}` | Cambiar un canal tuyo, o sustituir su dirección de webhook |
| `DELETE` | `/signals/channels/{channelId}` | Borrar un canal tuyo |
| `POST` | `/signals/channels/{channelId}/notices` | Publicar un aviso |
| `GET` | `/signals/channels/{channelId}/notices` | Listar tus avisos y cómo se entregaron |
| `POST` | `/signals/hook/{hookKey}` | Publicar un aviso por la dirección de webhook del canal (sin token) |
| `POST` | `/signals/channels/{channelId}/offers` | Crear una oferta de un canal tuyo |
| `GET` | `/signals/channels/{channelId}/offers` | Listar sus ofertas, con lo que vendieron |
| `POST` | `/signals/offers/{offerId}/codes` | Acuñar códigos para una oferta, uno por venta |
| `GET` | `/signals/offers/{offerId}/codes` | Listar los códigos de una oferta y su estado |
| `DELETE` | `/signals/codes/{codeId}` | Revocar un código, y la suscripción que dio |
| `POST` | `/signals/subscriptions` | Canjear un código |
| `GET` | `/signals/subscriptions` | Listar tus suscripciones |
| `GET` | `/signals/subscriptions/{subscriptionId}` | Leer una suscripción |
| `DELETE` | `/signals/subscriptions/{subscriptionId}` | Cancelar una suscripción |
| `POST` | `/signals/subscriptions/{subscriptionId}/renew` | Renovar una suscripción con otro código |
| `POST` | `/signals/subscriptions/{subscriptionId}/runs` | Alimentar una ejecución tuya desde una suscripción |
| `DELETE` | `/signals/subscriptions/{subscriptionId}/runs/{runId}` | Dejar de alimentar una ejecución |
| `GET` | `/signals/subscriptions/{subscriptionId}/deliveries` | Lo que recibieron las ejecuciones de una suscripción |

Los alcances que necesitan estas operaciones están en [Autenticación y alcances](auth#el-alcance-que-exige-cada-operación).

## Cómo funciona

1. El proveedor crea un canal y las **ofertas** que vende, por ejemplo 0 s para 1 ejecución y 60 s para 3 ejecuciones, 30 días
   cada una. Acuña **códigos** para una oferta, uno por venta, y entrega cada código a quien lo compró, donde sea que venda
   (el `purchaseUrl` de la oferta dice dónde).
2. El comprador **canjea** el código y obtiene una **suscripción** con las condiciones de la oferta. Arranca ejecuciones,
   normalmente sin `sources`, para que esperen (consulta [Adjuntar y quitar una fuente](live#adjuntar-y-quitar-una-fuente)),
   y alimenta desde ella hasta el `maxRuns` de la suscripción.
3. El proveedor publica un aviso sobre un instrumento.
4. Cuando el aviso vence, en su publicación más el retraso de la suscripción, el instrumento se adjunta a cada ejecución que
   alimenta la suscripción. Una ejecución que esperaba arranca con él; una que ya lee lo toma como una fuente más, en el
   `effectiveAtMs` del adjuntado. La estrategia se entera en `onAttach`, como con cualquier adjuntado (consulta
   [QTScript](/docs/strategies/qtscript) y [Programar estrategias en Java](/docs/strategies/java/strategy_coding)).

Una entrega es un adjuntado corriente de la ejecución del comprador: el plan del comprador y las reglas de las fuentes de la
ejecución deciden si cabe. Un aviso nunca le cuesta al comprador más que un adjuntado que hubiera hecho él mismo. No se quita
nada cuando llega un aviso posterior, ni cuando termina una suscripción; quita tú un adjuntado cuando termines con él.

## Crear un canal

```json
POST /signals/channels
{
  "name": "Early pool alerts",
  "description": "Pools about to move, seconds ahead.",
  "visibility": "public"
}
```

```json
{
  "channelId": "7aQk2mVn9pXr4sTw1yZb3c",
  "name": "Early pool alerts",
  "description": "Pools about to move, seconds ahead.",
  "visibility": "public",
  "delays": [],
  "offers": [],
  "createdAtMs": 1758330000000,
  "webhookUrl": "https://api.qtsurfer.net/v1/signals/hook/7aQk2mVn9pXr4sTw1yZb3c.Jp3kQ0aZx9LmB2vT7nWc4e",
  "subscriptions": 0
}
```

| Campo | Qué significa |
|---|---|
| `name` | Obligatorio, de 1 a 64 caracteres. Lo que ven los compradores. Tu usuario nunca se le muestra a nadie. |
| `description` | Opcional, hasta 500 caracteres. |
| `visibility` | `unlisted` (el valor por defecto): solo se encuentra por su `channelId`. `public`: aparece además en `GET /signals/channels/public`, con sus ofertas. |

`delays` son los retrasos de las ofertas del canal, y `offers` lo que vende. `webhookUrl`, `subscriptions` (cuántas hay activas y
sin caducar; nunca quién las tiene) y los ids y recuentos de las ofertas solo se te muestran a ti, el propietario.

`PATCH /signals/channels/{channelId}` cambia cualquiera de ellos. `"rotateWebhook": true` sustituye `webhookUrl`, y la dirección
antigua deja de publicar al instante. `DELETE` termina todas las suscripciones del canal, y los avisos que aún estaban por
entregar no se entregan.

## Vender: ofertas y códigos

```json
POST /signals/channels/{channelId}/offers
{ "delay": 60, "maxRuns": 3, "durationDays": 30, "purchaseUrl": "https://shop.example/early-alerts" }
```

| Campo | Qué significa |
|---|---|
| `delay` | Obligatorio, de `0` a `3600` segundos: cuánto después de su publicación llega un aviso a las ejecuciones de una suscripción de esta oferta. |
| `maxRuns` | Obligatorio, de `1` a `100`: cuántas ejecuciones del comprador alimenta a la vez una suscripción. |
| `durationDays` | Opcional, de `1` a `3650`: cuánto dura una suscripción desde el momento en que se canjea su código, y lo que añade una renovación. Si se omite, no caduca. |
| `purchaseUrl` | Opcional, una dirección `https` de como mucho 500 caracteres: dónde vendes la oferta. Se muestra con el canal y con cada suscripción de la oferta. |

Un canal tiene como mucho 10 ofertas, y varias pueden compartir un retraso. `GET /signals/channels/{channelId}/offers` las lista
con lo que vendieron: códigos acuñados y canjeados, suscripciones activas ahora y las ejecuciones que alimentan.

```json
POST /signals/offers/{offerId}/codes
{ "count": 2 }
```

```json
{
  "codes": [
    { "codeId": "8cWv3nLq6rTz1yPk5mXb2a", "code": "qsc_K7pQ2mZr9xVb4nLt8wYc3dGh6jFs1aEu", "prefix": "qsc_K7pQ" },
    { "codeId": "1dXr6mNp3sQv8zWk2yTc7b", "code": "qsc_R2vT8nWq4kMz7yXp1cLb6dGf3hJs9aNe", "prefix": "qsc_R2vT" }
  ]
}
```

**Esta respuesta es la única vez que se muestran los códigos**: la plataforma solo guarda una huella de cada uno, y `GET
/signals/offers/{offerId}/codes` lista sus prefijos y estados (`UNUSED`, `REDEEMED`, `REVOKED`), nunca quién los canjeó. Entrega
cada código al comprador al que se vendió, y mantén los demás en secreto hasta entonces. Hasta 100 códigos por llamada, y 10 000
por oferta.

`DELETE /signals/codes/{codeId}` revoca un código, por ejemplo para un reembolso. Si se había canjeado, **se revoca la
suscripción entera que creó o renovó**, incluido cualquier tiempo pagado antes con otros códigos: sus ejecuciones dejan de
alimentarse y las entregas aún no hechas quedan `SKIPPED` con `ACCESS_REVOKED`.

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
| `ref` | Opcional, hasta 64 caracteres. Nombra la alerta, no el instrumento: el instrumento ya está en `source`. El mismo `ref` al mismo canal devuelve el aviso que hizo mientras ese aviso no ha caducado (antes de su `expiresAtMs`), así que una petición reintentada o una alerta repetida es segura, y esa repetición no cuenta contra la tasa del canal. Cuando el aviso ha caducado, el mismo `ref` hace un aviso nuevo, que cuenta contra la tasa como cualquier otro: una alerta sobre el mismo instrumento un rato después se entrega. |
| `expiresIn` | Opcional, de `1` a `3600` segundos, `300` por defecto. Una entrega no hecha para entonces queda `EXPIRED`. Una suscripción cuyo retraso es mayor que esto nunca recibe el aviso. |
| `data` | Opcional. Texto para que lo lean los compradores junto al aviso: hasta 16 entradas. Las claves van en minúsculas (letras, dígitos, `_`, partes separadas por `.`), de hasta 64 caracteres. Los valores tienen de 1 a 256 caracteres, sin caracteres de control. No llega a la estrategia. |

`deliveries` es a cuántas ejecuciones va el aviso: las alimentadas, cuando se publica, por una suscripción activa y sin caducar.
Lo que hizo cada entrega le toca leerlo al comprador; `GET /signals/channels/{channelId}/notices` te muestra los recuentos por
estado.

### Qué nombra `source`, por mercado

`source` es el instrumento del que trata el aviso, e `instruments` es cómo se nombra. Cada campo se lee exactamente como se leen las
[fuentes de una ejecución](live#fuentes), y una fuente que ninguna ejecución podría leer es `400`.

| Mercado | `venueType`, `exchange`, `segment` | `instruments` |
|---|---|---|
| Un exchange centralizado | `cex`, un exchange y uno de sus segmentos, como `binance` y `spot` | De 1 a 10 pares escritos `BASE/QUOTE`, sin `*`: `["SOL/USDT"]` |
| Una pool en una cadena EVM | `dex`, la cadena y el protocolo de la pool, como `robinhood` y `uniswap-v3` | Exactamente una entrada: la dirección de la pool, `["0x3f4e0b2c8e1a4b6d9c0f1a2b3c4d5e6f708192a3"]` |
| Un token en `solana` | `dex`, `solana` y `pumpfun` | Exactamente una entrada: el mint del token, en base58, **sensible a mayúsculas**, escrito exactamente como lo tiene el token: `["2TngN4B7XaoGSKsYvttq5bFAdM4Z4xCSnuyRwGiFpump"]` |

En `solana` el aviso nombra el **token**, no una pool: el mint es el único identificador, y la ejecución lee el token desde su
curva de bonding hasta la pool que pump.fun crea para él, como una sola serie (consulta [Solana: un token por su
mint](live#solana-un-token-por-su-mint)). Así que un proveedor no elige una pool, y no envía ninguna: cualquier otro campo, en el cuerpo
o en `source`, es `400`. Dos tokens pueden compartir nombre o símbolo; solo el mint los distingue, por eso es el
instrumento y el `ref` no lo es.

Lo demás que un comprador deba leer junto a la alerta, como el nombre del token, va en `data`.

### Por la dirección de webhook

Un emisor que no puede conseguir un token, ni poner una cabecera, publica con el mismo cuerpo en el `webhookUrl` del canal:

```bash
curl -X POST "https://api.qtsurfer.net/v1/signals/hook/7aQk2mVn9pXr4sTw1yZb3c.Jp3kQ0aZx9LmB2vT7nWc4e" \
  -H "Content-Type: application/json" \
  -d '{"source":{"venueType":"cex","exchange":"binance","segment":"spot","instruments":["SOL/USDT"]},"ref":"a-17"}'
```

La dirección es la credencial: mantenla en secreto y sustitúyela si se filtra. Responde igual que publicar con un token, con los
límites de tu plan. Una dirección que no es la actual de un canal responde `404`.

## Comprar: canjear, alimentar tus ejecuciones, renovar

```json
POST /signals/subscriptions
{ "code": "qsc_K7pQ2mZr9xVb4nLt8wYc3dGh6jFs1aEu" }
```

```json
{
  "subscriptionId": "9cLm3nQp5rSt7uVw1xYz2A",
  "channelId": "7aQk2mVn9pXr4sTw1yZb3c",
  "channelName": "Early pool alerts",
  "delay": 60,
  "maxRuns": 3,
  "expiresAtMs": 1760922000000,
  "state": "ACTIVE",
  "purchaseUrl": "https://shop.example/early-alerts",
  "runs": [],
  "createdAtMs": 1758330000000
}
```

Un código se usa una vez. Enviar tú mismo el mismo código otra vez devuelve la suscripción que te dio (`200`), así que una
petición reintentada es segura; un código que canjeó otra persona es `409` con `reason: CODE_USED`. Un código que no existe,
se revocó, o cuyo canal se borró es `404`.

Tienes una sola suscripción a un canal a la vez. Un código de un canal al que ya estás suscrito es `409` con
`reason: ALREADY_SUBSCRIBED`, y el código **no se usa**: sigue siendo válido, así que renueva la suscripción que tienes con un
código de su propia oferta (mira más abajo), o cancélala primero para suscribirte con otra oferta. Una suscripción `EXPIRED` sigue
teniendo el canal, porque renovarla es para lo que sirve (no cuenta contra el límite de tu plan, que es una
cuenta distinta); una que cancelaste, o que se revocó, no lo tiene, así que puedes volver a suscribirte al canal.
Esto se comprueba antes del límite de tu plan.

```json
POST /signals/subscriptions/{subscriptionId}/runs
{ "runId": "5t5oAmQ4PD0lQRoCU58uE0", "type": "ticker" }
```

| Campo | Qué significa |
|---|---|
| `runId` | Obligatorio. Una de tus ejecuciones en vivo. |
| `type` | Opcional, `ticker` o `kline`, `kline` por defecto. Cómo lee la ejecución el instrumento de un exchange centralizado; tiene que ser uno que consuma la estrategia de la ejecución. Una pool se lee siempre como `kline`. |
| `warmFrom` | Opcional, de `0` a `3600`, `0` por defecto: el calentamiento de cada adjuntado que hace una entrega (consulta [Calentar la ejecución](live#calentar-la-ejecución-warmfrom)). Con `0` la estrategia lee desde el momento de la entrega, que es la forma más rápida de actuar sobre un aviso. Una pool entregada a una ejecución que ya lee otra se lee desde ese momento, diga lo que diga esto. |
| `resolveInstrument` | Opcional, `true` por defecto. Para una pool: si a la estrategia se le avisa de ella cuando la pool entrega su primera vela (`true`) o enseguida, con un instrumento provisional (`false`), como con [un adjuntado](live#el-instrumento-de-una-pool). |

Una suscripción alimenta como mucho sus `maxRuns` ejecuciones a la vez (`429` con `reason: SUBSCRIPTION_RUNS_LIMIT` si se pasa),
y una ejecución la alimenta a la vez una sola suscripción de un canal (`409` con `reason: RUN_FED_BY_ANOTHER`, que solo puede causar una segunda
suscripción al mismo canal, hecha antes de que se te limitara a una). `DELETE
/signals/subscriptions/{subscriptionId}/runs/{runId}` deja de alimentar una ejecución; `DELETE
/signals/subscriptions/{subscriptionId}` cancela la suscripción. Lo que ya se adjuntó se queda adjuntado.

Una suscripción pasado su `expiresAtMs` queda `EXPIRED`: no alimenta nada y no cuenta contra el límite de tu plan, pero
sigue siendo tu suscripción a su canal hasta que la canceles. `POST /signals/subscriptions/{subscriptionId}/renew` con otro código de **la misma
oferta** mueve su caducidad en la duración de la oferta, desde su caducidad actual o, si ya caducó, desde ahora; una suscripción
caducada se reanuda con las ejecuciones que alimentaba, y vuelve a contar contra tu plan (`429` con `reason: PLAN_LIMIT` si estás
en su límite). Un código de otra oferta es `409` con `reason: OTHER_OFFER`: para pasar a esa oferta, cancela la suscripción y canjea el código; una suscripción revocada o cancelada no se puede
renovar (`SUBSCRIPTION_INACTIVE`), ni una cuya oferta no caduca (`DOES_NOT_EXPIRE`).

## Leer las entregas

`GET /signals/subscriptions/{subscriptionId}/deliveries` lista cada aviso que vence para las ejecuciones que alimenta la
suscripción, una entrega por ejecución (`runId`), la más reciente primero, y lo que hizo cada una. Una entrega lleva el `source`
y el `data` del aviso desde su `dueAtMs`; antes de eso dice que viene un aviso y cuándo, no de qué trata, así que una
suscripción con retraso no se entera del instrumento antes que su nivel.

| `status` | Qué significa |
|---|---|
| `PENDING` | Aún no toca, o se está haciendo. |
| `ATTACHED` | El instrumento se adjuntó a la ejecución; `attachmentId` nombra el adjuntado. Lee los `attachments` de la ejecución para saber cómo está. Un aviso sobre un instrumento que la ejecución ya tiene adjuntado cuenta como entregado, con ese adjuntado. |
| `REFUSED` | La ejecución no pudo tomarlo; `reason` dice por qué (más abajo). |
| `EXPIRED` | No se hizo antes de que el aviso caducara. |
| `SKIPPED` | No se hizo: `NOT_RUNNING` (la ejecución no estaba corriendo), `UNSUBSCRIBED` (la ejecución ya no se alimenta, o la suscripción se canceló), `ACCESS_REVOKED` (el proveedor revocó su código), `SUBSCRIPTION_EXPIRED` o `CHANNEL_DELETED`. |

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

| Plan | Canales que posees | Suscripciones que mantienes a la vez | Avisos por canal, cada 60 segundos |
|---|---|---|---|
| free | 0 | 0 | 0 |
| basic | 1 | 2 | 6 |
| pro | 3 | 10 | 30 |
| elite | 10 | 50 | 60 |

Un plan con `0` en algo no lo incluye: la operación se rechaza con `402`. Una suscripción que caducó, se revocó o se canceló no
cuenta. Pasado el límite, crear un canal, canjear un código o renovar una suscripción caducada se rechaza con `429` y
`reason: PLAN_LIMIT`, sin `Retry-After`. Publicar por encima de la tasa se rechaza con `429` y `reason: NOTICE_RATE_LIMIT`,
`retryable: true`, y `Retry-After` dice cuándo cabe el siguiente aviso. Cuántas ejecuciones alimenta una suscripción es cosa de la
oferta, no del plan.

## Qué puede rechazar una petición

| Estado | Cuándo |
|---|---|
| `400` | Un campo fuera de sus reglas; un `source` de aviso que no es un instrumento o una pool de un mercado que se pueda seguir en vivo; un `type` de ejecución que su estrategia no consume; un `purchaseUrl` que no es `https`. |
| `402` | Tu plan no lo incluye (consulta [Límites por plan](#límites-por-plan)). |
| `404` | No existe ese canal, oferta, código, ejecución o suscripción tuya (o el canal se borró), o una dirección de webhook que no es la actual. |
| `409` | `CODE_USED`, `ALREADY_SUBSCRIBED`, `OTHER_OFFER`, `SUBSCRIPTION_INACTIVE`, `DOES_NOT_EXPIRE`, `RUN_FED_BY_ANOTHER`; un canal con 10 ofertas (`OFFER_LIMIT`) o una oferta con 10 000 códigos (`CODE_LIMIT`). |
| `429` | `PLAN_LIMIT`, `SUBSCRIPTION_RUNS_LIMIT` o `NOTICE_RATE_LIMIT`, como arriba. |

## Guías relacionadas

- [Ejecución en vivo](live): ejecuciones que esperan, y adjuntar una fuente.
- [QTScript](/docs/strategies/qtscript) y [Programar estrategias en Java](/docs/strategies/java/strategy_coding): `onAttach` y `onDetach`.
- [Autenticación y alcances](auth): el alcance `signals`.
