---
title: Ejecución en vivo
description: Ejecuta una estrategia de forma continua contra un flujo de mercado en vivo — recibe sus señales y actualiza parámetros por WebSocket.
order: 5.45
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: a0ce71f23b7d9714a490ed9c1d455db72adf3a74
upstreamPath: docs/live.md
lastUpdated: '2026-09-22T19:27:53Z'
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
| `stage` | `sandbox` o `live` — refleja el `stage` de `GET .../live`. |
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
