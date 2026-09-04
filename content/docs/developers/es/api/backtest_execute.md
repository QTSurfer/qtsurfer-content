---
title: Backtests
description: Prepara datos históricos, ejecuta una estrategia, sondea su resultado e inspecciona su curva de equity.
order: 5.3
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: dc37afd8cf9ea955d212253460ac5d46b3791bb2
upstreamPath: docs/backtest_execute.md
lastUpdated: '2026-09-04T10:18:11Z'
---

Prepara datos históricos, ejecuta una estrategia compilada contra ellos una vez, sondea el
resultado y traza la curva de equity. Para ejecutar la *misma* estrategia sobre una cuadrícula de
parámetros en su lugar, consulta [`docs/backtest_sweep.md`](backtest_sweep).

| Método | Ruta | Propósito |
|---|---|---|
| `POST` | `/backtest/{exchangeId}/{type}/prepare` | Preparar un conjunto de datos |
| `GET` | `/backtest/{exchangeId}/{type}/prepare/{jobId}` | Sondear el estado de la preparación |
| `POST` | `/backtest/{exchangeId}/{type}/execute` | Ejecutar una estrategia contra un conjunto preparado |
| `GET` | `/backtest/{exchangeId}/{type}/execute/{jobId}` | Sondear el resultado de la ejecución |
| `DELETE` | `/backtest/{exchangeId}/{type}/execute/{jobId}` | Cancelar una ejecución en curso |

`{type}` es el [`DataSourceType`](/docs/api) — `ticker` hoy.

## Preparar datos

`POST .../prepare`

Encola una tarea de preparación sobre un rango de fechas y devuelve un `jobId` de inmediato;
sondea el `GET` de abajo hasta que termine. Los mismos parámetros → el mismo `jobId` (idempotente)
— las llamadas repetidas reutilizan el job existente en lugar de encolar trabajo duplicado.

### Cuerpo de la petición — `PrepareRequest`

Dos formas, según el segmento de ruta `exchangeId`:

| Campo | Tipo | Notas |
|---|---|---|
| `from`, `to` | string | obligatorio. ISO-8601, fecha ISO, o fecha ISO básica (`2024-12-14T23:59:59Z`, `2024-12-14`, `20241214`) |
| `instrument` | string | obligatorio **salvo** que `exchangeId` sea el valor reservado `user` |
| `datasetId` | string | **solo** para `exchangeId: user` — un conjunto de datos de `POST /datasets`, en lugar de `instrument` |
| `datasetVersionId` | string | **solo** para `exchangeId: user`, opcional — fija una versión pasada en lugar de la actual del conjunto de datos |
| `cadence` | enum | `1s`, `5s`, `1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `2h`, `4h`, `8h`, `12h`, `1d`, `1w`, `1q` — por defecto `1s`. Los valores más gruesos que el origen deben ser múltiplos exactos de la cadencia de origen |

`exchangeId: user` está reservado para tus propios datos subidos — consulta
[`docs/datasets.md`](datasets).

### Ejemplo

```bash
curl -X POST https://api.qtsurfer.net/v1/backtest/binance/ticker/prepare \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"instrument":"BTC/USDT","from":"2026-03-14","to":"2026-03-15"}'
# → 202 {"jobId": "5ikYAMIO..."}
```

Errores: `400` petición inválida, `from` anterior a la ventana de retención, `to` en el futuro, o
(para `exchangeId: user`) la subida del conjunto de datos no ha terminado de ingerirse /
`cadence` más fina que la cadencia descubierta del conjunto de datos / el rango excede el límite de
tu plan · `404` exchange/tipo no encontrado, o (para `exchangeId: user`) `datasetId`/
`datasetVersionId` no existe o no es tuyo · `429` cola global al límite o demasiados backtests
activos — no aplica a `exchangeId: user`, que lee un fichero ya ingerido en lugar de reclamar
capacidad de worker.

## Sondear el estado de la preparación

`GET .../prepare/{jobId}`

Una preparación de un solo instrumento siempre es terminal (`status: Completed`) — decide a
partir de `coverageRatio` (por ejemplo, ejecuta en cuanto supere un umbral elegido) en lugar de
sondear a la espera de horas ausentes que quizá nunca lleguen. Una hora ausente normalmente
significa baja actividad, no datos perdidos.

### Respuesta — `PrepareJobState`

La forma `JobState` (`contextId`, `status`, `statusDetail`, `size`, `completed`, `startTime`,
`endTime`) más un resumen de cobertura. **Dos formas de cobertura**, según sea exchange o
conjunto de datos:

| Campo | Notas |
|---|---|
| `dataFrom`, `dataTo` | rango de datos disponible. Presente en ambos casos |
| `coverageRatio` | `0`–`1`. Exchange gestionado: `hoursWithData / totalHours`. Conjunto de datos (`exchangeId: user`): `rows / expectedStepsAtCadence` sobre el rango propio de la versión del conjunto de datos, repitiendo lo que calculó la ingesta una vez |
| `totalHours`, `hoursWithData` | solo exchange gestionado — ausente en una preparación respaldada por un conjunto de datos |
| `hoursWithoutData` | solo exchange gestionado — una entrada por cada hora vacía: `{hour, expected, rationale}`. `rationale` es `pending_conversion` (un nuevo sondeo puede rellenarla), `low_activity`, o `unknown` |
| `cadence`, `gaps`, `largestGapSteps` | solo respaldado por conjunto de datos — la cadencia propia descubierta de la versión del conjunto de datos, y su número/tamaño de huecos a esa cadencia |

### Ejemplo

```bash
curl https://api.qtsurfer.net/v1/backtest/binance/ticker/prepare/$PREPARE_JOB_ID \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "contextId": "ctx_0bjmoxd4vahkgc0hnvdldh",
  "status": "Completed",
  "size": 0,
  "completed": 24,
  "startTime": "2026-04-14T15:00:00Z",
  "endTime": "2026-04-14T15:00:01Z",
  "dataFrom": "2026-04-14T13:00:00Z",
  "dataTo": "2026-04-14T15:30:05Z",
  "coverageRatio": 0.994,
  "totalHours": 168,
  "hoursWithData": 167,
  "hoursWithoutData": [
    {"hour": "2026-04-14T02:00:00Z", "expected": 0, "rationale": "low_activity"}
  ]
}
```

## Ejecutar un backtest

`POST .../execute`

Ejecuta la estrategia identificada por `strategyId` sobre los datos de `prepareJobId`; el
instrumento y el rango de fechas se recuperan del job de preparación, no se vuelven a enviar.
Funciona igual para una preparación respaldada por un conjunto de datos. El mismo
`(prepareJobId, strategyId, storeSignals, equityCurve, params)` → el mismo `jobId` (idempotente) —
una petición que omite `equityCurve` o `params` deduplica exactamente igual que antes de que esos
campos existieran. Dos vectores de `params` distintos sobre la misma preparación son dos jobs
distintos, y `9` y `9.0` son el mismo.

Acepta opcionalmente `params`: propiedades de estrategia para esta única ejecución, aplicadas sin
recompilar. Así es como se vuelve a ejecutar una fila ganadora de la clasificación de un barrido
para obtener su `equityCurve` — una fila de barrido lleva las métricas de clasificación pero nunca
una curva, sea cual sea su tamaño (consulta [`docs/backtest_sweep.md`](backtest_sweep)). Compila la
estrategia una vez, llama a este endpoint N veces con distintos `params`, y cada respuesta es un
resultado de backtest normal con la curva incluida. La reejecución es una ejecución independiente,
no una repetición del ensayo del barrido — las dos vías no comparten simulador, así que una métrica
puede diferir de la fila de la clasificación que te trajo hasta aquí.

### Cuerpo de la petición

| Campo | Tipo | Notas |
|---|---|---|
| `prepareJobId` | string | obligatorio — debe ser un job de preparación `Completed` |
| `strategyId` | string | obligatorio |
| `storeSignals` | boolean | por defecto `false`. Cuando es `true`, el worker sube las señales emitidas a almacenamiento de objetos y el resultado gana `signalsUrl`/`signalsId` |
| `equityCurve` | [`EquityCurveOptions`](equity_curves#plain-backtests-choose-the-transform-on-submit) | opcional — remodela la curva incrustada en `results.equityCurve` |
| `params` | object | opcional, como máximo 64 entradas. Mapa plano de nombre de propiedad de estrategia → escalar (número, cadena o booleano). Las claves son el `name` declarado en `@StrategyProperty` (no necesariamente el campo Java que anota) — `GET`/`POST /strategy` devuelve `declaredProperties` con los nombres válidos. Una clave desconocida hace fallar el job en lugar de ejecutarse silenciosamente con los valores por defecto. Omite una clave para dejarla en su valor por defecto; `null` no es un valor. Los arrays se rechazan — una lista es un eje de barrido, este endpoint ejecuta exactamente un vector. `strategyId`, `storeSignals`, `equityCurve`, `backtestEnabled`, `backtestFakeExecution` están reservados (configuran el job, no la estrategia) |

### Ejemplo

```bash
curl -X POST https://api.qtsurfer.net/v1/backtest/binance/ticker/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prepareJobId":"5ikYAMIO...","strategyId":"2ul144qe9tlwzu5anhwvc6"}'
# → 202 {"jobId": "4GmNN0i9..."}
```

Reejecutar una fila de la clasificación de un barrido para obtener su curva, con `params`:

```bash
curl -X POST https://api.qtsurfer.net/v1/backtest/binance/ticker/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prepareJobId":"5ikYAMIO...","strategyId":"2ul144qe9tlwzu5anhwvc6","params":{"ema.fast.period":9,"ema.slow.period":21}}'
# → 202 {"jobId": "9k2LpQi7..."}
```

Errores: `400` petición inválida · `404` job de preparación no encontrado o expirado · `429`
limitado por tasa.

## Sondear el resultado

`GET .../execute/{jobId}`

Un `202` (cuerpo vacío, `{}`) significa que el resultado aún no es legible — sigue sondeando dentro
de tu timeout habitual, y nunca lo trates como terminal. Se devuelve tanto mientras el job sigue en
marcha *como* cuando el resultado almacenado de un job terminal no se pudo leer de vuelta, así que
un bucle de sondeo debe fijarse en `200` más `state.status`, no en "ya no es 202".

### Respuesta — `BacktestJobResult`

`state` ([`JobState`](#respuesta--preparejobstate)) más `results` (`ResultMap`):

| Campo | Notas |
|---|---|
| `hostName`, `iops`, `strategyId`, `instrument` | siempre presentes. `strategyId` aquí es el **id de contexto de ejecución** (`strategy:<user>:<strategyId>`) — toma el segmento tras los últimos dos puntos para recuperar el id con el que compilaste |
| `pnlTotal`, `pnlTotalPercent`, `totalTrades`, `winRate`, `sharpeRatio`, `sortinoRatio`, `cagr`, `maxDrawdown`, `maxDrawdownPercent` | métricas de rendimiento — presentes en cuanto la estrategia emite al menos una operación |
| `equityCurve` | [`EquityCurveResult`](equity_curves) — presente bajo la misma condición que las métricas de rendimiento |
| `params` | las propiedades de estrategia con las que se ejecutó esta ejecución, devueltas tal como se enviaron. Ausente cuando la petición no llevaba ninguna — su presencia es lo que distingue una ejecución parametrizada de una con los valores por defecto declarados |
| `notices` | diagnósticos que emitió el motor, cada uno `{level, code, message, provenance: execute}`. **Su ausencia significa que no se emitió nada** — la única superficie donde el silencio es una respuesta real. También se emiten en ejecuciones fallidas o abortadas, y esas son las que más merece la pena leer: una ejecución sin operaciones a menudo explica aquí por qué |
| `noticesTruncated` | cuántos avisos se descartaron por encima del límite de 50; ausente cuando no hubo ninguno |
| `signalCount`, `signalsId`, `signalsUrl`, `signalsUpload`, `signalsUploadedAt`, `signalsUploadReason` | solo cuando la petición fijó `storeSignals: true`. `signalsUpload` es `Done` \| `Failed` \| `Skipped`; `signalsUrl` es un fichero Parquet con **todas** las señales emitidas (valores de indicadores, marcadores) — el detalle completo detrás del `equityCurve` agregado |

### Ejemplo

```bash
curl https://api.qtsurfer.net/v1/backtest/binance/ticker/execute/$EXECUTE_JOB_ID \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "state": {"status": "Completed", "completed": 85058},
  "results": {
    "pnlTotal": 42.75, "pnlTotalPercent": 2.25, "totalTrades": 156, "winRate": 0.5833,
    "sharpeRatio": 1.245, "sortinoRatio": 1.872, "cagr": 0.1534,
    "maxDrawdown": 12.50, "maxDrawdownPercent": 8.75, "iops": 123956.53,
    "equityCurve": {
      "points": [
        {"timestamp": 1700000000000, "equity": 100.0},
        {"timestamp": 1700000060000, "equity": 110.5},
        {"timestamp": 1700000120000, "equity": 90.25}
      ],
      "meta": {
        "inputPointCount": 3, "outputPointCount": 3,
        "resampled": false, "differential": false, "outMode": "ARRAY"
      }
    }
  }
}
```

Errores: `400` petición inválida · `404` job de ejecución no encontrado.

## Cancelar

`DELETE .../execute/{jobId}`

Solicita la cancelación; el estado pasa a `Aborted` una vez procesado — asíncrono, así que sondea
con `GET` para confirmarlo. `200` `{"status": "cancelling", "jobId": "..."}` · `404` no encontrado.

## Visualizar la curva de equity

La [guía compartida de curvas de equity](equity_curves) cubre el trazado, la normalización
porcentual, las formas `ARRAY` y `SHORT`, el remuestreo, la codificación diferencial, los
metadatos, las salvaguardas de tamaño y la distinta semántica de envío/lectura para backtests
simples y ensayos retenidos de un barrido.