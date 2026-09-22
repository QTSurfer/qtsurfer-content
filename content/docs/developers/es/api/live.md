---
title: Ejecución en vivo
description: Ejecuta una estrategia de forma continua contra un flujo de mercado en vivo — recibe sus señales y actualiza parámetros por WebSocket.
order: 5.45
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 2ab1bcbc32470544a42e33f402e79dfa2c1b61db
upstreamPath: docs/live.md
lastUpdated: '2026-09-22T23:26:54Z'
---

Ejecuta una estrategia de forma continua contra un flujo de mercado en vivo, observa sus señales a
medida que ocurren, y cambia sus parámetros sin reiniciarla.

| Método | Ruta | Propósito |
|---|---|---|
| `POST` | `/strategy/{strategyId}/live` | Arrancar una estrategia en vivo |
| `GET` | `/strategy/{strategyId}/live` | Leer la ejecución actual (o la última) de esta estrategia |
| `DELETE` | `/strategy/{strategyId}/live` | Detenerla |
| `GET` | `/live/public` | Explorar ejecuciones que otros usuarios han hecho públicas |
| `PATCH` | `/live/{runId}` | Cambiar visibilidad, nombre o descripción |
| `PUT` | `/live/{runId}/params` | Cambiar parámetros mientras sigue en vivo |
| `GET` | `/live/{runId}/signals` | Leer las señales que ya ha producido |
| `POST` | `/live/token` | Generar un token de conexión WebSocket |

## Ciclo de vida: sandbox, luego live

Arrancar una ejecución (`POST /strategy/{strategyId}/live`) nunca la pone delante de nada que lea
sus señales de inmediato. Empieza en la etapa `sandbox` — una prueba corta, comparando una segunda
ejecución independiente contra la primera para ver si concuerdan — y se promueve a `live`
automáticamente en cuanto la supera. Sondea `stage` en `GET`/`PATCH` `.../live` para ver cómo pasa
de `SANDBOX` a `LIVE`; no hay una llamada aparte de "promover".

Solo una ejecución por estrategia a la vez. Volver a arrancar mientras una está en `RUNNING` es
`409` — detenla primero con `DELETE`.

Un `DELETE` es una petición, no una parada instantánea: `desired` pasa a `STOPPED` de inmediato,
pero `state` puede seguir en `RUNNING` durante una ventana corta mientras la ejecución concluye.
Volver a llamar a `DELETE` sobre una ejecución ya detenida no es un error.

## Fuentes

`sources` acepta exactamente una entrada (las estrategias multi-fuente todavía no están
soportadas):

```json
{
  "sources": [
    {"venueType": "cx", "exchange": "binance", "segment": "spot", "type": "ticker", "instruments": ["BTC/USDT"]}
  ]
}
```

`type` es `ticker` o `kline`. Ambos se conectan a la cadencia más ligera (más rápida) disponible
para el exchange — hoy eso es 1 tick/segundo en todos los exchanges soportados; elegir entre
varias cadencias todavía no está disponible. `instruments` puede ser `["*"]` para todos los
instrumentos que ofrezca el exchange/segmento, sujeto al límite de número de instrumentos de tu
plan.

## Visibilidad

Una ejecución es `private` por defecto — solo tú puedes leer su estado o recibir sus señales. Fijar
`visibility: public` (mediante `PATCH /live/{runId}`) hace dos cosas:

- aparece en el catálogo de `GET /live/public`, listada sin revelar quién es su dueño ni qué
  estrategia la ejecuta;
- su canal de señales (ver abajo) acepta una suscripción WebSocket de cualquiera, no solo de ti.

Volver a `private` también desconecta a cualquiera que esté suscrito en ese momento a ese canal —
en el mejor esfuerzo, y no deshace el cambio de visibilidad si la desconexión en sí falla.

## Parámetros en tiempo de ejecución

`params` en `POST /strategy/{strategyId}/live` solo fija los valores con los que **arranca** una
ejecución. Para cambiar uno mientras la ejecución sigue corriendo, llama a `PUT
/live/{runId}/params` (o la llamada WebSocket equivalente `live.params` de más abajo — ambas pasan
por la misma validación y aterrizan en el mismo valor en el mismo instante). Cada clave debe ser
una que tu estrategia declare; una clave no declarada es `400`.

El `effectiveAtMs` de la respuesta no es "ahora" — son unos segundos más adelante, el primer
momento en que el nuevo valor está garantizado que se aplique. Este margen existe para que, si una
ejecución tiene más de un worker de ejecución detrás, todos adopten el cambio en el mismo punto en
lugar de que uno lo aplique unos eventos antes que el otro.

```
PUT /live/6TzAPiPpsOWwBLdLBZCxwH/params
{"params": {"emaFastPeriod": "12"}}

200
{"runId": "6TzAPiPpsOWwBLdLBZCxwH", "paramsVersion": 2, "effectiveAtMs": 1758330015000}
```

## Recibir señales y actualizar parámetros en vivo: la conexión WebSocket

Sondear `GET .../live` te dice el *estado* de la ejecución; no transmite su salida. Para recibir
las señales de una ejecución a medida que ocurren, o para enviar una actualización de parámetros
por la misma conexión en lugar de una llamada REST aparte, abre una conexión WebSocket:

Las señales solo llegan a este canal para una ejecución arrancada con `relay: true` (campo propio
de `POST .../live`, `false` por defecto) — y solo una vez alcanza la etapa `live`; una ejecución
todavía en `sandbox` nunca hace relay, sea lo que sea lo que se pidió al arrancar.
`GET`/`PATCH .../live` devuelven en `relay` lo que se pidió ya combinado con esa regla de etapa —
`true` ahí significa que las señales están llegando al canal ahora mismo, no solo que se pasó
`relay: true` en algún momento.

1. **Genera un token.** `POST /live/token` (JWT bearer, igual que cualquier otro endpoint) devuelve
   un `token` de corta duración y su `expiresAtMs`. Genera uno nuevo antes de que expire el actual
   o ante un fallo de conexión que parezca relacionado con la autenticación.
2. **Conecta.** Abre un WebSocket a `wss://rt.qtsurfer.net/connection/websocket` y envía, como
   primer mensaje:
   ```json
   {"id": 1, "connect": {"token": "<el token del paso 1>"}}
   ```
   Una conexión exitosa responde con tu propio id de `client`:
   ```json
   {"id": 1, "connect": {"client": "<id-de-cliente>", "ping": 25000, "pong": true}}
   ```
3. **Suscríbete al canal de señales de la ejecución**, llamado `sig:<runId>` — por ejemplo
   `sig:6TzAPiPpsOWwBLdLBZCxwH`:
   ```json
   {"id": 2, "subscribe": {"channel": "sig:6TzAPiPpsOWwBLdLBZCxwH"}}
   ```
   Puedes suscribirte al canal de cualquier ejecución de esta forma, pero la conexión solo se
   admite realmente en él si eres el dueño de esa ejecución o es `public` — el canal de una
   ejecución privada ajena rechaza la suscripción. Cada señal llega entonces como un `push` en el
   canal, con su `data` en la forma de abajo.
4. **Llama a `live.params`** (la forma WebSocket de `PUT /live/{runId}/params`, solo para el
   dueño):
   ```json
   {"id": 3, "rpc": {"method": "live.params", "data": {"runId": "6TzAPiPpsOWwBLdLBZCxwH", "params": {"emaFastPeriod": "12"}}}}
   ```
   Éxito:
   ```json
   {"id": 3, "rpc": {"data": {"runId": "6TzAPiPpsOWwBLdLBZCxwH", "paramsVersion": 2, "effectiveAtMs": 1758330015000}}}
   ```
   Fallo (refleja el mismo 400/404/409 del endpoint REST):
   ```json
   {"id": 3, "error": {"code": 404, "message": "no such run"}}
   ```

### Forma de la señal

Cada payload `push` en un canal `sig:<runId>`:

```json
{
  "v": 1,
  "signalId": "…",
  "runId": "6TzAPiPpsOWwBLdLBZCxwH",
  "stage": "live",
  "paramsVersion": 2,
  "type": "hint",
  "kind": "BUY",
  "eventTsMs": 1758330012000,
  "emittedAtMs": 1758330012040,
  "instrument": {"exchange": "binance", "segment": "spot", "symbol": "BTC/USDT"},
  "order": {"orderKind": "MARKET", "price": null, "amount": null, "stopPrice": null, "trailPct": null},
  "data": {},
  "regenerated": false,
  "digest": "…"
}
```

| campo | significado |
|---|---|
| `signalId` | Id estable de esta señal exacta — deduplica con él si tu conexión se reconecta a mitad de flujo. |
| `stage` | Siempre `live` en este canal — una ejecución solo hace relay una vez `relay` está en efecto, lo que nunca pasa en `sandbox` (ver arriba). |
| `paramsVersion` | El conjunto de parámetros vigente cuando se produjo esta señal. |
| `type` | `hint`, `info`, `marker`, o `command`. |
| `kind` | `BUY`/`SELL` para un `hint`; el nombre del comando para un `command`; ausente en otro caso. |
| `eventTsMs` | Hora de mercado en que se produjo la señal. |
| `emittedAtMs` | Hora en que se publicó — siempre ≥ `eventTsMs`. |
| `order` | Presente solo para un `hint`. |
| `data` | El payload de forma libre propio de la señal. |
| `regenerated` | `true` solo para una señal republicada para rellenar un hueco en el histórico registrado — siempre `false` para una señal que ves por primera vez. |
| `digest` | Hash del contenido, para verificar que dos entregas independientes de la misma señal concuerdan. |

Quién es el dueño de la ejecución, qué estrategia o compilación produjo una señal, y la posición
exacta de datos de mercado detrás de ella nunca se incluyen en este canal, sea la ejecución
pública o privada.

## Leer las señales que una ejecución ya produjo

El canal de arriba es solo en vivo: lleva lo que ocurre mientras estás conectado, y solo para una
ejecución que pidió `relay`. `GET /live/{runId}/signals` sirve el registro en su lugar — las
señales de una ejecución se guardan de todas formas, así que esto funciona tanto si `relay` estuvo
activo como si no, y en ambas etapas. Úsalo para ponerte al día tras una desconexión, para leer una
ejecución a la que nunca hiciste relay, o simplemente para paginar hacia atrás sobre lo que ya ha
pasado.

```
GET /v1/live/6TzAPiPpsOWwBLdLBZCxwH/signals?sinceMs=1758330000000&limit=20

200
{
  "signals": [ { "signalId": "…", "eventTsMs": 1758330012000, … } ],
  "availableSinceMs": 1757725212000,
  "_links": {"next": {"href": "/v1/live/6TzAPiPpsOWwBLdLBZCxwH/signals?cursor=eyJzZXEiOjQyfQ&limit=20"}}
}
```

Cada entrada tiene la misma forma que empuja el canal — la tabla de arriba aplica sin cambios,
salvo que aquí `stage` es la etapa en la que estaba la ejecución cuando se produjo la señal, así
que las señales de una ejecución sandbox se leen como `sandbox`. Pagina con `_links.next` mientras
esté presente; `limit` es 20 por defecto y su tope es 100. Legible por el dueño de la ejecución, y
por cualquiera si la ejecución es `public` — la misma regla que aplica el canal a una suscripción.

### Filtrar por instrumento

`instrument` es opcional y reduce la página sin cambiar nada más:

| `instrument` | devuelve |
|---|---|
| omitido, o `*` | todos los instrumentos que cubre la ejecución |
| `BTC/USDT` | solo ese par |
| `*/USDT` | cualquier base contra esa cotizada |
| `BTC/*` | esa base contra cualquier cotizada |
| `BTC/USDT,ETH/EUR` | cada par de la lista |

Los símbolos coinciden exactamente, mayúsculas incluidas — pásalos tal como los reporta esta API
(como aparecen en `sources` de la propia ejecución, o en `instrument.symbol` de una señal).

### La ventana se mueve, y los cursores caducan

Las señales se guardan durante un margen limitado, y las más antiguas se descartan continuamente a
medida que llegan otras nuevas. Cuánto puedes leer hacia atrás no es por tanto un número fijo de
horas: una ejecución que produce muchas señales consume ese margen más rápido, y también lo hacen
otras ejecuciones que lo comparten. Dos consecuencias a tener en cuenta:

- **`availableSinceMs`** en cada respuesta es el momento más antiguo todavía respondible. Pedir un
  `sinceMs` anterior a eso no es un error: te sirven desde `availableSinceMs` en adelante, y el
  campo te dice que eso es lo que pasó.
- **Un cursor puede caducar**, y en una ejecución con mucho tráfico puede caducar en minutos.
  Cuando la posición a la que apunta ya se descartó, la siguiente página responde `410` en vez de
  servir en silencio una página recortada que parece completa:

  ```json
  {"code": 410, "message": "the cursor's position is no longer retained by the signal stream (it now starts at availableSinceMs=1757725212000)"}
  ```

  Trátalo como un resultado normal de paginar un sistema en vivo, no como un fallo: lee el
  `availableSinceMs` que indica y vuelve a empezar desde ahí. Si estás paginando para mostrar un
  historial largo, trae las páginas que necesites en una sola pasada en vez de mantener un cursor
  durante el tiempo de reflexión de un usuario.
