---
title: Autenticación y alcances
description: Cambia tu clave de API por un token y consulta qué permiten los alcances de tu clave.
order: 5.05
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 2816b264c2398991c87e618a70a433b2d4d8de3e
upstreamPath: docs/auth.md
lastUpdated: '2026-10-18T10:27:25Z'
---

Todas las rutas, salvo `POST /auth/token` y el catálogo público `GET /live/public`, esperan un JWT
bearer (`Authorization: Bearer <token>`). El JWT es de corta duración y se obtiene cambiando tu clave
de API, emitida en la aplicación web, en `POST /auth/token`. La clave en sí solo se acepta en esa
ruta.

## Obtener un token

```bash
curl -X POST https://api.qtsurfer.net/v1/auth/token \
  -H "X-API-Key: <your-api-key>"
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scopes": { "backtests": ["read", "write", "execute"], "exchanges": ["read"] },
  "tier": "free"
}
```

| Campo | Notas |
|---|---|
| `access_token` | envíalo como `Authorization: Bearer <token>` en cada otra llamada |
| `token_type` | siempre `Bearer` |
| `expires_in` | segundos hasta que el token caduca. Pide uno nuevo antes, o ante un `401` |
| `scopes` | lo que puede hacer tu clave, [más abajo](#alcances) |
| `tier` | el plan de suscripción para el que se emitió el token; fija tus límites, consulta [Cuenta](account) |

Una clave desconocida, revocada o caducada se responde con `401`; el cuerpo es `AuthTokenError` en
la referencia de la API. Donde un despliegue exige alcances, una clave que no lleva ninguno se
responde con `403` con el código `apikey_without_scopes` y sin token: crea en la aplicación web una
clave con al menos un alcance.

## Alcances

Una clave lleva alcances: un mapa de un recurso a las acciones que puede realizar sobre él, en
minúsculas.

```json
{ "backtests": ["read", "write", "execute"], "exchanges": ["read"] }
```

- Un alcance es un recurso y una acción: un recurso solo se lista con al menos una acción. Una clave
  puede hacer algo o no puede; una clave sin alcances es `{}`.
- Los ves en dos sitios, como el mismo mapa: el `scopes` de la respuesta del token de arriba, y el
  `scopes` de [`GET /account`](account#obtener-tu-plan-y-sus-límites), que no necesita un token nuevo.
- El token lleva los alcances que tenía tu clave cuando se emitió. Cambia los alcances de la clave y
  el cambio se ve desde el siguiente token, como mucho `expires_in` segundos después.
- **Hoy la API informa de los alcances de una clave; todavía no rechaza una operación porque falte
  un alcance.** Las tablas de abajo son lo que exigirá cada operación cuando lo haga, de modo que se
  puede dar a una clave los alcances que necesita con antelación.

### Recursos y acciones

| Recurso | Acciones | Cubre |
|---|---|---|
| `exchanges` | `read` | la lista de exchanges, sus instrumentos y pools |
| `market_data` | `read` | las descargas horarias de tickers y klines |
| `strategies` | `read`, `write` | listar, inspeccionar y leer el código fuente de una estrategia; compilar, validar y borrar una |
| `backtests` | `read`, `write`, `execute` | preparar, ejecutar, barrer y cancelar backtests; leer su estado y resultados |
| `datasets` | `read`, `write` | listar y leer tus conjuntos de datos; crearlos, subirlos, importarlos y borrarlos |
| `live` | `read`, `write`, `execute` | leer ejecuciones en vivo, sus señales y cuentas de paper; cambiar una ejecución; arrancar, parar y mandar comandos a una, y gestionar su flujo |

`read` lista y obtiene. `write` crea, cambia, cancela o borra sin ejecutar nada. `execute` arranca
una ejecución: un backtest, un barrido, una ejecución en vivo.

### El alcance que exige cada operación

**Exchanges y datos de mercado** — [Datos de mercado](market_data)

| Operación | Alcance |
|---|---|
| `GET /exchanges`, `GET /exchange/{exchangeId}/instruments`, `GET /exchange/{exchangeId}/{segment}/instruments` | `exchanges` : `read` |
| `GET /exchange/{exchangeId}/tickers/{base}/{quote}`, `GET /exchange/{exchangeId}/klines/{base}/{quote}` | `market_data` : `read` |

**Estrategias** — [Estrategias](strategy)

| Operación | Alcance |
|---|---|
| `GET /strategies`, `GET /strategy/{strategyId}`, `GET /strategy/{strategyId}/code` | `strategies` : `read` |
| `POST /strategy`, `POST /strategy/{strategyId}/validate`, `DELETE /strategy/{strategyId}` | `strategies` : `write` |

**Backtests y barridos** — [Backtests](backtest_execute), [Barridos de parámetros](backtest_sweep)

| Operación | Alcance |
|---|---|
| `POST …/prepare`, `DELETE …/execute/{jobId}`, `DELETE …/executeSweep/{requestId}/{sweepId}` | `backtests` : `write` |
| `POST …/execute`, `POST …/executeSweep/{requestId}` | `backtests` : `execute` |
| `GET …/prepare/{jobId}`, `GET …/execute/{jobId}`, `GET …/executeSweep/…` (resultado, sensibilidad, curva de equity) | `backtests` : `read` |

**Conjuntos de datos** — [Conjuntos de datos](datasets)

| Operación | Alcance |
|---|---|
| `GET /datasets`, `GET /datasets/{datasetId}`, `GET /datasets/{datasetId}/uploads/{uploadId}`, `GET /datasets/{datasetId}/imports/{importId}` | `datasets` : `read` |
| `POST /datasets`, `DELETE /datasets/{datasetId}`, `POST /datasets/{datasetId}/uploads`, `POST /datasets/{datasetId}/uploads/{uploadId}/finalize`, `POST /datasets/imports` | `datasets` : `write` |

**Ejecuciones en vivo** — [Ejecución en vivo](live), [Paper trading](live_paper)

| Operación | Alcance |
|---|---|
| `GET /live`, `GET /live/{runId}`, `GET /strategy/{strategyId}/live`, `GET /live/{runId}/signals`, `GET /live/{runId}/paper`, `GET /live/{runId}/paper/equity`, `POST /live/token` | `live` : `read` |
| `PATCH /live/{runId}`, `PUT /live/{runId}/params` | `live` : `write` |
| `POST /strategy/{strategyId}/live`, `DELETE /strategy/{strategyId}/live`, `POST /live/{runId}/commands`, `POST /live/{runId}/stream`, `DELETE /live/{runId}/stream` | `live` : `execute` |

**Sin alcance:** `GET /account` y `GET /account/usage` necesitan un token válido y nada más;
`GET /live/public` no necesita ningún token.
