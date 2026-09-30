---
title: Ejecución en vivo
description: Ejecuta una estrategia de forma continua contra un flujo de mercado en vivo — recibe sus señales y actualiza parámetros por WebSocket.
order: 5.45
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 9a8e03675f67ce80ef43f33a5207b8b5387749c7
upstreamPath: docs/live.md
lastUpdated: '2026-09-27T21:29:01Z'
---

Ejecuta una estrategia de forma continua contra un flujo de mercado en vivo, observa sus señales a
medida que ocurren, y cambia sus parámetros sin reiniciarla.

| Método | Ruta | Propósito |
|---|---|---|
| `POST` | `/strategy/{strategyId}/live` | Arrancar una estrategia en vivo |
| `GET` | `/strategy/{strategyId}/live` | Leer la ejecución actual (o la última) de esta estrategia |
| `DELETE` | `/strategy/{strategyId}/live` | Detenerla |
| `GET` | `/live` | Listar tus propias ejecuciones |
| `GET` | `/live/public` | Explorar ejecuciones que otros usuarios han hecho públicas |
| `PATCH` | `/live/{runId}` | Cambiar visibilidad, nombre o descripción |
| `PUT` | `/live/{runId}/params` | Cambiar parámetros mientras sigue en vivo |
| `POST` | `/live/{runId}/commands` | Indicarle un comando mientras sigue en vivo |
| `GET` | `/live/{runId}/signals` | Leer las señales que ya ha producido |
| `GET` | `/live/{runId}/paper` | Leer su paper trading — consulta [Paper trading](live_paper) |
| `GET` | `/live/{runId}/paper/equity` | Paginar su curva de equity de paper trading — consulta [Paper trading](live_paper) |
| `POST` | `/live/token` | Generar un token de conexión WebSocket |

## Ciclo de vida: sandbox, luego live

Arrancar una ejecución (`POST /strategy/{strategyId}/live`) nunca la pone delante de nadie más que
de ti. Empieza en la etapa `sandbox`, una prueba de **24 horas**. Durante ella la plataforma ejecuta
una segunda ejecución independiente de tu estrategia junto a la primera y comprueba cuatro cosas: que
la ejecución procesa datos de mercado, que su consumo de memoria y su tiempo por tick se mantienen
dentro de lo que la plataforma permite, que no se cuelga ni falla repetidamente, y que las dos
ejecuciones producen las mismas señales. Solo tú puedes leer una ejecución en sandbox: por el canal
WebSocket desde su primera señal si pediste `relay`, y por las rutas de lectura en cualquier caso
(consulta [Visibilidad](#visibilidad)).

Una ejecución que la supera se promueve a `live` automáticamente al cumplirse las 24 horas. No hay
una llamada aparte de "promover" ni nada que hacer mientras esperas. Una ejecución que no la supera
no se promueve, y sigue corriendo en el sandbox.

Lo que puedes observar mientras espera, en `GET`/`PATCH` `.../live`:

- `stage` es `SANDBOX` hasta la promoción y `LIVE` después.
- `state` es la salud de la ejecución ahora mismo (consulta [Estado de una ejecución](#estado-de-una-ejecución)).
- `gate` está **ausente durante toda la prueba** y aparece cuando termina, con el veredicto. Un
  `gate` ausente significa por tanto "la prueba no ha terminado", nunca "nadie está evaluando la
  ejecución". Su campo `passed` es el veredicto; el resto es detalle de diagnóstico cuya forma puede
  cambiar.

## Estado de una ejecución

`state` dice qué está haciendo la ejecución. Es una cadena que puede ganar valores, así que lee uno
desconocido como "en marcha, con algo que mirar".

| `state` | Qué significa |
|---|---|
| `STARTING` | Aceptada; ningún runner ha informado todavía sobre ella. |
| `RUNNING` | En marcha con normalidad. |
| `LAGGING` | En marcha, pero por detrás de los datos de mercado: habitual mientras se pone al día tras arrancar o tras un reinicio de la plataforma. Se despeja sola. |
| `HUNG` | Tu estrategia está atascada dentro de una llamada durante más tiempo del que la plataforma permite. Se despeja cuando esa llamada devuelve. |
| `DEGRADED` | Las ejecuciones independientes de la ejecución produjeron señales distintas a partir de los mismos datos de mercado. La ejecución sigue publicando. En el sandbox esto cuenta en contra de la prueba: la ejecución no se promueve. |
| `FAILED` | La plataforma rechazó la ejecución, no pudo arrancarla, o la ejecución falló mientras corría. `reason` dice por qué (consulta [Por qué una ejecución falló o se detuvo](#por-qué-una-ejecución-falló-o-se-detuvo)). |
| `STOPPED` | Detenida, por ti o por la plataforma (`reason` lo dice cuando fue por superar su margen de recursos). |

`LAGGING`, `HUNG` y `DEGRADED` son indicadores de una ejecución que por lo demás está corriendo:
aparecen y desaparecen, y las señales de la ejecución siguen fluyendo todo el tiempo. `desired` es
lo que pediste por última vez (`RUNNING` o `STOPPED`), y `state` puede ir por detrás durante un
momento.

Solo una ejecución por estrategia a la vez. Volver a arrancar mientras una está en `RUNNING` es
`409` — detenla primero con `DELETE`.

Un `DELETE` es una petición, no una parada instantánea: `desired` pasa a `STOPPED` de inmediato,
pero `state` puede seguir en `RUNNING` durante una ventana corta mientras la ejecución concluye.
Volver a llamar a `DELETE` sobre una ejecución ya detenida no es un error.

### Una ejecución fallida es definitiva, y sigue ocupando su plaza

`FAILED` es definitivo para esa ejecución: no está procesando datos y nada la reinicia. Para volver a
intentarlo, corrige lo que nombra `reason` y arranca una ejecución nueva. Lo habitual es que `desired`
siga en `RUNNING` hasta que detengas tú la ejecución, y una ejecución cuenta como activa por su
`desired`, no por su `state`: una ejecución `FAILED` sigue respondiendo `409` a un nuevo arranque de la
misma estrategia y sigue contando para el límite de ejecuciones en vivo de tu plan. Llama a `DELETE`
sobre ella y arranca de nuevo.

La excepción es una ejecución que nunca puede correr por aquello con lo que se arrancó: cuando su
estrategia no puede consumir su tipo de fuente, la plataforma la detiene ella misma (`desired` pasa a
`STOPPED`, `state` se queda en `FAILED`, `reason` dice por qué), así que no ocupa plaza.

### Por qué una ejecución falló o se detuvo

`GET /strategy/{strategyId}/live`, y cada entrada de `GET /live`, llevan un `reason` cuando hay algo
que decir. Está ausente en caso contrario, y nunca es una traza de pila ni un mensaje interno: es una
frase de un conjunto fijo, así que un cliente puede compararla.

| `reason` | Cuándo |
|---|---|
| `resource: ...` | La plataforma detuvo la ejecución por superar su margen de recursos; el texto dice qué límite. |
| `The run could not start: its strategy cannot consume the source type it was started with.` | Una estrategia ticker arrancada con una fuente `kline`, o al revés. El arranque lo rechaza con un `400` (consulta [Fuentes](#fuentes)); solo puede aparecer en una ejecución creada antes de que existiera esa comprobación. |
| `The run could not start: its definition was refused.` | La definición de la ejecución no es una que la plataforma pueda ejecutar. |
| `The run could not start after several attempts.` | Un arranque que siguió fallando por un motivo que no era tuyo. Arranca de nuevo. |
| `The run stopped because its strategy failed while processing data.` | El propio código de tu estrategia tumbó la ejecución. |
| `The run stopped because it lost its data feed.` | El flujo de datos de mercado de la ejecución se cortó y la ejecución se quedó parada. |
| `The run failed.` | Cualquier otra cosa. |

El conjunto puede crecer. Lee una frase que no reconozcas como «la ejecución falló», y no la analices
en busca de detalle: el texto es para personas.

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

`type` tiene que coincidir con el tipo de estrategia: una estrategia ticker corre sobre una fuente
`ticker` y una estrategia kline sobre una `kline`, y un arranque con la otra se rechaza con `400`,
nombrando ambas. Una estrategia QTScript es una estrategia ticker salvo que su cabecera diga otra cosa
(`strategy "Name" kline`); una Java es la de la clase base que extienda (`AbstractTickerStrategy` o
`AbstractKlineStrategy`).

`type` es `ticker` o `kline`. Ambos se conectan a la cadencia más ligera (más rápida) disponible
para el exchange — hoy eso es 1 tick/segundo en todos los exchanges soportados; elegir entre
varias cadencias todavía no está disponible. `instruments` puede ser `["*"]` para todos los
instrumentos que ofrezca el exchange/segmento, sujeto al límite de número de instrumentos de tu
plan.

## Listar tus ejecuciones

`GET /live` (necesita un token Bearer) devuelve todas las ejecuciones que has arrancado — cualquier
`stage`, cualquier estado `desired`, cualquier `visibility` — de más nueva a más antigua, paginado
igual que `GET /live/public` (`cursor`/`limit`, `_links.next.href`). No filtra por `state`: una
prueba `sandbox` o una ejecución que ya has detenido sigue apareciendo, a diferencia de
`GET /live/public`, que no necesita cabecera `Authorization` pero solo lista ejecuciones ajenas —
de cualquiera, la tuya incluida — que sean `public` y estén corriendo (`RUNNING`).

## Visibilidad

Una ejecución es `private` por defecto — solo tú puedes leer su estado o recibir sus señales. Fijar
`visibility: public` (mediante `PATCH /live/{runId}`) hace dos cosas:

- aparece en el catálogo de `GET /live/public`, listada sin revelar quién es su dueño ni qué
  estrategia la ejecuta;
- su canal de señales (ver abajo) acepta una suscripción WebSocket de cualquiera, no solo de ti.

`public` es lo que pides, y surte efecto cuando la ejecución se promueve a `live`. Hasta entonces —
mientras es una prueba `sandbox` — solo tú puedes leerla, por el canal y por las rutas de lectura, y
no aparece en el catálogo; nada de lo que hiciste hay que repetirlo en la promoción.

Quién puede leer qué, según la ejecución:

| La ejecución | Suscribirse a su canal y leer `.../signals`, `.../paper` | Listada en `GET /live/public` |
|---|---|---|
| Cualquier ejecución tuya | Tú, siempre | — |
| `private` | Solo tú | No |
| `public`, todavía en el `sandbox` | Solo tú (`public` surte efecto en la promoción) | No |
| `public`, promovida a `live` | Cualquiera | Sí, mientras está corriendo |

`relay` es aparte: solo decide si las señales de una ejecución se *empujan* por el canal WebSocket
(opt-in, en cualquiera de las dos etapas) y nunca quién puede leerlas. `GET /live/{runId}/signals`
sirve las señales de una ejecución hayas pedido `relay` o no.

Volver a `private` también desconecta a cualquiera que esté suscrito en ese momento a ese canal —
en el mejor esfuerzo, y no deshace el cambio de visibilidad si la desconexión en sí falla.

## Parámetros en tiempo de ejecución

`params` en `POST /strategy/{strategyId}/live` solo fija los valores con los que **arranca** una
ejecución. Para cambiar uno mientras la ejecución sigue corriendo, llama a `PUT
/live/{runId}/params` (o la llamada WebSocket equivalente `live.params` de más abajo — ambas pasan
por la misma validación y aterrizan en el mismo valor en el mismo instante). Cada clave debe ser
una que tu estrategia declare; una clave no declarada es `400`.

Un `409` significa que la estrategia compilada de esta ejecución no tiene registro de los parámetros
que declara, así que no se pueden cambiar mientras corre. Una ejecución conserva la versión compilada
con la que arrancó: registra de nuevo la estrategia (`POST /strategy` con el mismo fuente, que la
compila otra vez) y arranca una ejecución nueva.

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

## Comandos

`POST /live/{runId}/commands` le dice algo a una estrategia en marcha sin reiniciarla, para una estrategia que
implementa `CommandRequestHandler` del motor — una estrategia Java directamente (consulta
[Programar estrategias en Java](strategy_coding#recibir-comandos)), o una estrategia QTScript mediante
`onCommand { }` (consulta [QTScript](qtscript#manejar-un-comando)). Acepta `{"command": "<texto>"}` — una
cadena simple — y un
objeto `properties` opcional, de tu elección, que viaja sin cambios hasta el propio manejador de la estrategia;
`command` y `properties` son las únicas claves que puede llevar el cuerpo. Responde `202` con `commandId` y
`effectiveAtMs`, la posición de mercado en la que lo aplica cada ejecución detrás del run.

**Un comando es transitorio**, a diferencia de un parámetro: es un evento, no un valor guardado, y nada de él se
escribe en la ejecución. Una réplica que se reinicia reproduce solo su historial de mercado reciente, así que un
comando de antes de esa ventana simplemente no le llega — un par que ya estaba corriendo cuando llegó lo aplica, uno
que arranca después no. Todo lo que la estrategia necesite recordar entre reinicios va en un parámetro
(`PUT /live/{runId}/params`), que sí tiene un valor guardado.

Un `409` significa una de tres cosas, cada una con su propio mensaje: la ejecución no está corriendo; la estrategia
compilada de esta ejecución no tiene registro de si maneja comandos (regístrala de nuevo y arranca una ejecución
nueva, igual que el `409` de `params`); o la estrategia no implementa `CommandRequestHandler` en absoluto. Un `503`
significa que el comando no se pudo entregar ahora mismo y **no** se envió — no hay una vía alternativa para un
evento como sí la hay para una fila de parámetro, así que reintenta la petición misma.

```
POST /live/6TzAPiPpsOWwBLdLBZCxwH/commands
{"command": "flatten", "properties": {"instrument": "BTC/USDT"}}

202
{"runId": "6TzAPiPpsOWwBLdLBZCxwH", "commandId": "0e3f2f1a-9c4b-4d3e-8a2f-6b7c5d4e3f21", "effectiveAtMs": 1758330015000}
```

## Recibir señales y actualizar parámetros en vivo: la conexión WebSocket

Sondear `GET .../live` te dice el *estado* de la ejecución; no transmite su salida. Para recibir
las señales de una ejecución a medida que ocurren, o para enviar una actualización de parámetros
por la misma conexión en lugar de una llamada REST aparte, abre una conexión WebSocket.

La conexión habla el protocolo cliente de [Centrifugo](https://centrifugal.dev) v6 (JSON). Su
contrato legible por máquina es [`asyncapi.yaml`](../asyncapi.yaml), junto al spec OpenAPI: la URL,
cada trama, los nombres de canal, la llamada `live.params` y los códigos de error, con el payload
de la señal compartido con el esquema REST `LiveSignal`.

Los SDKs de QTSurfer ya envuelven esta conexión — consulta
[Clientes y SDKs](/docs/developers/clients-and-sdks) — así que puede que no necesites hablar el
protocolo directamente. Yendo directo, el cliente más sencillo es una librería oficial de
Centrifugo — [`centrifuge`](https://github.com/centrifugal/centrifuge-js) (JavaScript/TypeScript),
[`centrifuge-java`](https://github.com/centrifugal/centrifuge-java),
[`centrifuge-python`](https://github.com/centrifugal/centrifuge-python) y
[otras](https://centrifugal.dev/docs/transports/client_sdk) — porque ya se encarga de los pings, la
renovación del token y la reconexión que se describen abajo. Con una, solo aportas la URL, una
función que genera un token, el nombre del canal y el método RPC.

Las señales solo llegan a este canal para una ejecución arrancada con `relay: true` (campo propio
de `POST .../live`, `false` por defecto). Llegan desde la primera señal de la ejecución, también en la
etapa `sandbox`, donde solo tú puedes suscribirte; el mismo canal continúa sin cambios cuando la
ejecución se promueve a `live`, sobre la misma suscripción: `stage` pasa de `sandbox` a `live` y no
hay que rehacer nada. La ejecución tarda un rato en arrancar en la etapa `live`, así que el canal puede
quedarse en silencio varios minutos en torno a la promoción; lo que la ejecución produjo entretanto
llega después en orden, y cada señal llega una sola vez. `GET`/`PATCH .../live` devuelven en `relay`
lo que se pidió.

1. **Genera un token.** `POST /live/token` (JWT bearer, igual que cualquier otro endpoint) devuelve
   un `token` de corta duración y su `expiresAtMs`.
2. **Conecta.** Abre un WebSocket a `wss://rt.qtsurfer.net/connection/websocket` y envía, como
   primer mensaje:
   ```json
   {"id": 1, "connect": {"token": "<el token del paso 1>"}}
   ```
   Una conexión exitosa responde con tu propio id de `client`, y cuánto le queda al token:
   ```json
   {"id": 1, "connect": {"client": "<id-de-cliente>", "expires": true, "ttl": 600, "ping": 25, "pong": true}}
   ```
   `ttl` y `ping` están en segundos. Un token que no se acepta cierra el socket con el código de
   cierre `3500` (`invalid token`).
3. **Suscríbete al canal de señales de la ejecución**, llamado `sig:<runId>` — por ejemplo
   `sig:6TzAPiPpsOWwBLdLBZCxwH`:
   ```json
   {"id": 2, "subscribe": {"channel": "sig:6TzAPiPpsOWwBLdLBZCxwH"}}
   ```
   Puedes suscribirte al canal de cualquier ejecución de esta forma, pero la conexión solo se
   admite realmente en él si eres el dueño de esa ejecución, o es `public` **y** ha alcanzado la
   etapa `live` — el canal de una ejecución privada ajena, y el de una ejecución pública que todavía
   está en el `sandbox`, rechazan la suscripción con
   `{"id": 2, "error": {"code": 103, "message": "permission denied"}}`. Cada señal llega entonces
   como una trama `push`, sin `id`; la señal en sí es su `pub.data`, en la forma de abajo:
   ```json
   {"push": {"channel": "sig:6TzAPiPpsOWwBLdLBZCxwH", "pub": {"data": {"v": 1, "signalId": "…", …}, "offset": 42}}}
   ```
   Si la ejecución se pone en privado mientras estás suscrito y no es tuya, el servidor te retira
   con `{"push": {"channel": "sig:…", "unsubscribe": {"code": 2000, "reason": "server unsubscribe"}}}`,
   y no te vuelve a suscribir.
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
5. **Mantén la conexión viva.** El servidor envía una trama vacía `{}` como ping; responde a cada
   una con `{}` (eso es lo que pide `"pong": true` en la respuesta de conexión). Si no llega nada
   durante bastante más de `ping` segundos, trata la conexión como muerta y reconecta.
6. **Renueva el token antes de que se acabe el `ttl`**, sobre la misma conexión — genera uno nuevo
   con `POST /live/token` y envíalo:
   ```json
   {"id": 4, "refresh": {"token": "<un token nuevo>"}}
   ```
   que responde `{"id": 4, "refresh": {"expires": true, "ttl": 600}}`. Tus suscripciones no se ven
   afectadas. Una conexión cuyo token no se renueva a tiempo se cierra con el código de cierre
   `3005` (`connection expired`); reconecta con un token nuevo.

Algunos detalles del protocolo a conocer si escribes tu propio cliente: cada respuesta lleva el
`id` del comando que contesta, las tramas que el servidor envía por su cuenta (pushes, pings) no
llevan ninguno, y una trama WebSocket puede contener varias respuestas, un objeto JSON por línea.
Una página de navegador servida desde el origen de otro sitio se rechaza en el *upgrade* del
WebSocket (`403`); un cliente que no envía cabecera `Origin`, como un programa del lado del
servidor o un SDK, no se ve afectado.

Tras una desconexión, el canal no reproduce lo que te perdiste: léelo de vuelta con
`GET /live/{runId}/signals` (más abajo), deduplicando por `signalId`.

### Forma de la señal

Cada señal empujada en un canal `sig:<runId>` (el `pub.data` de la trama `push`):

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
| `stage` | `sandbox` o `live`: la etapa en la que estaba la ejecución cuando produjo la señal. Solo tú recibes una señal `sandbox` por este canal; todos los admitidos en el canal reciben las `live`. |
| `paramsVersion` | El conjunto de parámetros vigente cuando se produjo esta señal. |
| `type` | `hint`, `info`, `marker`, o `command` — más `paper` al leer el histórico de una ejecución `mix` (consulta [Paper trading](live_paper#salida-separate-o-mix); los elementos paper nunca se empujan por este canal). |
| `kind` | `BUY`/`SELL` para un `hint`; el nombre del comando para un `command`; ausente en otro caso. |
| `eventTsMs` | Hora de mercado en que se produjo la señal. |
| `emittedAtMs` | Hora en que se publicó — siempre ≥ `eventTsMs`. |
| `order` | Presente solo para un `hint`. |
| `data` | El payload de forma libre propio de la señal: lo que la estrategia puso ahí con `signal.set(...)`. Quien pueda leer la ejecución puede leerlo, así que en una ejecución `public` es público. Una señal cuyo `data` pese más de 8 KiB (8.192 bytes de su JSON) no se empuja por este canal; [la ruta de historial](#leer-las-señales-que-una-ejecución-ya-produjo) la devuelve entera. |
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

### Filtrar por tipo

`type` reduce a uno o más tipos de señal, separados por comas: `hint`, `info`, `marker`, `command`,
`paper`. Se combina con `instrument` — `?type=hint&instrument=*/USDT` son todos los hints de un par
USDT. Ambos filtros se arrastran en `_links.next`, así que seguirlo mantiene la misma selección.

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

## Paper trading

Arranca una ejecución con un bloque `paper` y sus hints se ejecutan en simulación desde el primer
tick, como los ejecutaría un backtest — fills, operaciones cerradas, equity y los mismos KPIs que
reporta un backtest:

```json
"paper": {"initialFunding": 1000, "feeRate": 0.001, "percentAmountToLock": 20}
```

Léelo con `GET /live/{runId}/paper` y `GET /live/{runId}/paper/equity`. Todo sobre él — la
configuración, una cuenta por moneda de cotización, la curva de equity, la salida `mix` y los
huecos — está en **[Paper trading en ejecuciones en vivo](live_paper)**.
