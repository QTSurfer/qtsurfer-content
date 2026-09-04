---
title: Barridos de parámetros
description: Ejecuta cuadrículas de parámetros, clasifica ensayos y valida resultados con pliegues walk-forward.
order: 5.4
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: dc37afd8cf9ea955d212253460ac5d46b3791bb2
upstreamPath: docs/backtest_sweep.md
lastUpdated: '2026-09-04T10:18:11Z'
---

Ejecuta una estrategia sobre una cuadrícula de parámetros en lugar de un único conjunto fijo de
valores, sondea una clasificación ordenada, valida opcionalmente al ganador fuera de muestra con
pliegues walk-forward, e inspecciona qué parámetros movieron realmente el objetivo.

Los cinco endpoints comparten `{exchangeId}/{type}/executeSweep/{requestId}` (`requestId` es el
`jobId` de `POST /backtest/{exchangeId}/{type}/prepare` — un barrido reutiliza el mismo conjunto
de datos preparado, nunca uno nuevo):

| Método | Ruta | Propósito |
|---|---|---|
| `POST` | `.../executeSweep/{requestId}` | Enviar un barrido |
| `GET` | `.../executeSweep/{requestId}/{sweepId}` | Sondear el progreso y la clasificación |
| `DELETE` | `.../executeSweep/{requestId}/{sweepId}` | Cancelar un barrido en curso |
| `GET` | `.../executeSweep/{requestId}/{sweepId}/sensitivity` | Marginales y mapas de calor |
| `GET` | `.../executeSweep/{requestId}/{sweepId}/runs/{runIx}/equityCurve` | La curva de un ensayo seleccionado — consulta la [guía compartida de curvas de equity](equity_curves#sweeps-select-retain-and-fetch-curves) |

## Enviar un barrido

`POST .../executeSweep/{requestId}`

### Cuerpo de la petición — `ExecuteSweepRequest`

| Campo | Tipo | Por defecto | Notas |
|---|---|---|---|
| `strategyId` | string | — | obligatorio |
| `sweep` | [`SweepSpecRequest`](#sweep--sweepspecrequest) | — | obligatorio — la propia cuadrícula |
| `baseConfig` | [`SweepBaseConfig`](#baseconfig--sweepbaseconfig) | — | configuración de backtest compartida por todos los ensayos |
| `walkForward` | [`WalkForwardRequest`](#validación-walk-forward) | — | activa la validación fuera de muestra en lugar de un barrido plano |
| `equityCurve` | [`EquityCurveRequest`](equity_curves#sweeps-select-retain-and-fetch-curves) | `{mode: "auto"}` | selecciona las curvas de ensayo retenidas y su transformación de respuesta por defecto |
| `storeSignals` | boolean | `false` | almacena señales de cada ensayo; deja `false` para barridos normales |
| `shards` | entero ≥ 0 | `0` | número de shards horizontales solicitado; `0` lo elige automáticamente |
| `minTradeFloor` | entero ≥ 0 | `30` | los ensayos por debajo de este número de operaciones se marcan (`belowTradeFloor`) pero permanecen en los resultados |

#### `sweep` — `SweepSpecRequest`

| Campo | Tipo | Por defecto | Notas |
|---|---|---|---|
| `params` | mapa de string → [`SweepAxis`](#params--mapa-de-sweepaxis) | — | obligatorio, ≥ 1 entrada — un eje por parámetro barrido |
| `sampler` | `grid` \| `random` \| `lhs` | `grid` | |
| `objective` | `sharpe` \| `sortino` \| `pnl` \| `maxdd` | `sharpe` | |
| `samples` | entero ≥ 1 | — | número de muestras para `random`/`lhs`; se ignora con `grid` |
| `seed` | int64 | — | semilla de reproducibilidad. Si se omite → el servidor genera una (`L64X128MixRandom` de Java) y devuelve el valor efectivo en `ExecuteSweepAccepted.seed` |

##### `params` — mapa de `SweepAxis`

Cada propiedad de estrategia barrida obtiene un eje, expresado como un rango numérico o como una
lista explícita:

```json
"rsiPeriod":       {"from": 7, "to": 28, "step": 1},
"useTrendFilter":  {"values": [true, false]}
```

- **rango** — `from`, `to`, `step` (todos obligatorios, `step` > 0)
- **enumerado** — `values` (≥ 1 elemento, cada uno `number` o `boolean`)

#### `baseConfig` — `SweepBaseConfig`

Se aplica de forma idéntica a todos los ensayos del barrido.

| Campo | Tipo | Por defecto | Notas |
|---|---|---|---|
| `initialFunding` | número > 0 | `10000` | |
| `feeRate` | número ≥ 0 | `0.001` | |
| `buyFeeRate` / `sellFeeRate` | número ≥ 0 | — | sobrescribe `feeRate` por lado |
| `feeLeg` | `RECEIVED` \| `QUOTE` \| `BASE` | `RECEIVED` | |
| `percentAmountToLock` | número, 0 &lt; n ≤ 100 | — | |

#### `equityCurve` — `EquityCurveRequest`

La selección, retención, valores por defecto de transformación, respuestas con puntero y
sobrescrituras en el momento de la lectura están documentados en la [guía compartida de curvas de
equity](equity_curves#sweeps-select-retain-and-fetch-curves).

### Ejemplo

```bash
curl -X POST "https://api.qtsurfer.net/v1/backtest/binance/ticker/executeSweep/$PREPARE_JOB_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "strategyId": "2ul144qe9tlwzu5anhwvc6",
    "sweep": {
      "sampler": "grid",
      "objective": "sharpe",
      "params": {
        "rsiPeriod": {"from": 7, "to": 28, "step": 1},
        "useTrendFilter": {"values": [true, false]}
      }
    }
  }'
```

`ExecuteSweepAccepted` (`202`):

```json
{
  "sweepId": "swp_95e47a7f0966ce11",
  "requestId": "5ikYAMIO...",
  "totalRuns": 44,
  "shards": 1,
  "seed": 487221,
  "queued": true
}
```

`queued: false` significa que ya existía un barrido idéntico y esta llamada no encoló un
duplicado — las peticiones de preparación y ejecución son idempotentes, indexadas por su cuerpo.

Errores: `400` especificación inválida o la cuadrícula expandida excede el límite del servidor ·
`404` `requestId` no encontrado o expirado · `429` cola de barridos o límite de concurrencia por
usuario alcanzado.

## Sondear el progreso y la clasificación

`GET .../executeSweep/{requestId}/{sweepId}`

| Parámetro de consulta | Tipo | Por defecto | Notas |
|---|---|---|---|
| `objective` | `sharpe` \| `sortino` \| `pnl` \| `maxdd` | el objetivo propio del barrido | reordena la clasificación por un objetivo distinto al que se usó al enviarlo |
| `order` | `ranked` \| `natural` | `ranked` | `natural` devuelve todas las filas, sin truncar, en orden estable por `runIx` — úsalo para materializar filas de ensayo duraderas |
| `ranking` | `plateau` \| `raw` | `plateau` | cómo se ordena la vista `ranked`; se ignora cuando `order=natural` |

`ranking=plateau` ordena por **puntuación de meseta** — el objetivo de la ejecución *peor* en el
vecindario inmediato de un punto de parámetros — en lugar del objetivo bruto, de modo que un pico
que no sobrevive a un pequeño desplazamiento de los parámetros ya no gana por defecto. Pasa
`ranking=raw` para el orden antiguo, sin ajustar.

### Respuesta — `ExecuteSweepResult`

| Campo | Notas |
|---|---|
| `status` | `RUNNING` \| `COMPLETED` \| `PARTIAL` \| `CANCELLED` |
| `ranking` | qué ordenación se aplicó **realmente** — no siempre la solicitada (un barrido sin cuadrícula almacenada no puede ordenarse por meseta y recae en `raw`) |
| `pbo`, `pboSplits` | probabilidad de sobreajuste del backtest, validación cruzada combinatoria simétrica sobre todo el barrido. `> ~0,5` → el barrido está seleccionando ruido. Presente solo cuando termina el último shard, y solo para un barrido sin walk-forward |
| `failReason` | por qué el barrido produjo menos de lo que debería — la causa reportada por el *primer* shard que falló, no una lista exhaustiva. Convierte una clasificación vacía con `done: 0` en una respuesta (por ejemplo, `"Failed to load/configure strategy"`) en lugar de un misterio |
| `progress` | [`SweepProgress`](#progress--sweepprogress) |
| `leaderboardSize` | total de filas disponibles actualmente |
| `truncated` | `true` solo cuando la vista `ranked` excede su límite de visualización |
| `leaderboard` | array de [`SweepRunRow`](#filas-de-la-clasificación--sweeprunrow) |
| `walkForward` | presente solo para un barrido walk-forward — consulta [más abajo](#validación-walk-forward) |
| `state` | la misma forma [`JobState`](backtest_execute#response--preparejobstate) que lleva el resultado de una ejecución simple — no una imitación, el mismo tipo. Ver más abajo cómo se relaciona con el `status` de arriba |

`state.status` es un **vocabulario distinto** del propio campo `status` del barrido de arriba
(`New` / `Started` / `Completed` / `Aborted` / `Failed`, derivado de él — `PARTIAL` y `CANCELLED`
se convierten ambos en `Aborted`, ya que el `PARTIAL` de un barrido ya es terminal, a diferencia
del `Partial` no terminal en el que puede estar un job simple). `state.completed` son ticks reales
procesados en un barrido plano; en un barrido walk-forward siempre vale `0` por ahora.
`state.size` siempre vale `0` en toda vía de execute y sweep hoy — nada lo rellena todavía.

#### `progress` — `SweepProgress`

Divide los shards (o, en un barrido walk-forward, los pliegues): cada unidad está terminada,
fallida, reintentándose, o aún sin empezar.

| Campo | Notas |
|---|---|
| `done`, `total` | filas/unidades completadas frente al total |
| `aborted` | **ejecuciones** individuales que se ejecutaron y abortaron (a nivel de fila) |
| `shardCount`, `pendingShards` | total de shards y los que aún quedan pendientes |
| `failedShards` | shards/pliegues completos que fallaron y **no** se reintentarán — distinto de `aborted`, que cuenta ejecuciones malas, no unidades ausentes |
| `retrying` | unidades cuyo último intento tuvo un error transitorio y están en cola para reintentar — todavía no es un fallo |
| `notStarted` | unidades que no han reportado nada; si persiste junto a un `stalledSeconds` en aumento, merece investigarse |
| `stalledSeconds` | segundos desde que algo avanzó por última vez; omitido en un barrido terminado |
| `etaSeconds` | segundos restantes aproximados; conservador (2–5× de largo) cuando parte del barrido pasó tiempo esperando para reintentar. Omitido, nunca `0`, cuando no se puede calcular |

#### Filas de la clasificación — `SweepRunRow`

| Campo | Notas |
|---|---|
| `runIx` | índice determinista de base cero en la expansión de la cuadrícula, estable entre shards y ordenaciones |
| `rank` | presente solo en la vista `ranked` |
| `plateauScore`, `neighbourCount` | la puntuación de meseta es el objetivo del peor vecino; `neighbourCount: 0` significa que el punto no tenía vecinos con los que compararse — la puntuación no está respaldada, no confirmada. Léelos siempre juntos |
| `deflatedSharpe` | probabilidad de que el Sharpe de esta ejecución refleje una ventaja real y no la mejor tirada entre todos los vectores probados. `> ~0,95` sobrevive a la corrección por pruebas múltiples; `≤ 0,5` es indistinguible del mejor de un montón de lanzamientos de moneda |
| `params`, `sharpe`, `sortino`, `pnl`, `pnlPct`, `cagr`, `maxDdPct`, `trades`, `winRate` | los resultados propios del ensayo |
| `belowTradeFloor`, `aborted`, `runtimeMs` | |
| `equityCurve` | presente solo cuando se seleccionó la curva de este ensayo — consulta [Curvas de equity](equity_curves#sweeps-select-retain-and-fetch-curves) |

### Ejemplo

```bash
curl "https://api.qtsurfer.net/v1/backtest/binance/ticker/executeSweep/$PREPARE_JOB_ID/$SWEEP_ID" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "status": "RUNNING",
  "ranking": "plateau",
  "progress": {
    "done": 31, "total": 44, "aborted": 0,
    "shardCount": 1, "pendingShards": 0,
    "failedShards": 0, "retrying": 0, "notStarted": 1,
    "etaSeconds": 12
  },
  "leaderboardSize": 31,
  "truncated": false,
  "leaderboard": [
    {
      "runIx": 12, "rank": 1,
      "params": {"rsiPeriod": 16, "useTrendFilter": true},
      "sharpe": 1.84, "plateauScore": 1.61, "neighbourCount": 6,
      "sortino": 2.10, "pnl": 812.40, "pnlPct": 8.12, "cagr": 0.31,
      "maxDdPct": 6.4, "trades": 118, "winRate": 0.576,
      "belowTradeFloor": false, "aborted": false, "runtimeMs": 842
    }
  ],
  "state": {
    "contextId": "swp_95e47a7f0966ce11",
    "status": "Started", "size": 0, "completed": 31,
    "startTime": "2026-03-18T13:21:28.958Z", "endTime": null
  }
}
```

Errores: `404` barrido no encontrado o expirado.

## Validación walk-forward

Añade `walkForward` al cuerpo de `executeSweep` para comprobar si los parámetros ganadores siguen
funcionando, no solo cuáles ganaron. Los datos se dividen en pliegues secuenciales; cada uno
optimiza la cuadrícula completa sobre su propia ventana y se puntúa **solo** en la ventana
inmediatamente posterior — datos sobre los que no se eligió a su ganador. Omite el bloque y nada
del barrido cambia, incluida la forma de la respuesta.

El coste es la razón de que sea opcional: `folds × totalRuns` backtests, así que 4 pliegues sobre
una cuadrícula de 500 puntos son 2004 ejecuciones donde el barrido plano son 500. Una petición que
exceda el presupuesto de barridos del servidor es un `400`.

### `WalkForwardRequest`

| Campo | Tipo | Por defecto | Notas |
|---|---|---|---|
| `folds` | entero ≥ 2 | — | obligatorio. 2 es un mínimo estructural, no una elección de ajuste: `paramDrift` compara los ganadores de pliegues consecutivos, y un único pliegue no tiene pareja con la que compararse |
| `inSamplePct` | entero, 10–90 | `66` | proporción de la sesión sobre la que optimiza cada pliegue; el resto es donde se puntúa a su ganador |

### Ejemplo

```bash
curl -X POST "https://api.qtsurfer.net/v1/backtest/binance/ticker/executeSweep/$PREPARE_JOB_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "strategyId": "2ul144qe9tlwzu5anhwvc6",
    "sweep": {"sampler":"grid","objective":"sharpe",
              "params":{"rsiPeriod":{"from":7,"to":28,"step":1}}},
    "walkForward": {"folds": 4}
  }'
# → 202 {"sweepId":"swp_...","walkForward":{"folds":4,"inSamplePct":66,"totalRuns":92}}
```

`ExecuteSweepAccepted.walkForward` (`WalkForwardAccepted`: `folds`, `inSamplePct`, `totalRuns`)
confirma el plan de pliegues en el momento en que se acepta el barrido — antes de que termine
ningún pliegue — así que es seguro bifurcar la lógica mientras se sondea si un barrido es
walk-forward o una cuadrícula plana.

### Forma del resultado — `WalkForwardResult`

En `getSweepResult`, `ExecuteSweepResult.walkForward` está presente solo para un barrido
walk-forward, y su **presencia**, no su contenido, es lo que lo identifica como tal:

| Campo | Notas |
|---|---|
| `folds`, `inSamplePct` | pliegues solicitados y proporción dentro de muestra resuelta |
| `completedFolds` | pliegues terminados hasta ahora; `0` mientras el primero sigue en curso |
| `paramDrift` | distancia media normalizada en la cuadrícula entre ganadores de pliegues consecutivos. Bajo = el parámetro significa algo; ganadores que saltan por la cuadrícula en cada pliegue = el barrido está ajustándose al ruido. **Ausente no es cero** — se omite cuando no puede calcularse (menos de dos pliegues terminados), porque `0` es en sí misma una lectura con significado aquí |
| `results` | una [`WalkForwardFold`](#walkforwardfold) por cada pliegue completado, del más antiguo al más reciente |

#### `WalkForwardFold`

| Campo | Notas |
|---|---|
| `foldIx` | posición en la secuencia, del más antiguo al más reciente |
| `inSampleFrom`, `inSampleTo`, `outOfSampleTo` | índices de ventana dentro de la sesión preparada |
| `params` | el vector que ganó la ventana de optimización de este pliegue |
| `inSampleSharpe` | cómo puntuó ese ganador en la ventana sobre la que se eligió — solo está ahí para compararla con `outOfSample`, ya que cualquier cuadrícula produce un ganador halagador dentro de muestra |
| `outOfSample` | una fila [`SweepRunRow`](#filas-de-la-clasificación--sweeprunrow) completa — el número honesto |
| `vectorsRun` | vectores evaluados dentro de muestra antes de elegir al ganador |

Cuando `walkForward` está presente, la `leaderboard` de nivel superior pasa a tener una fila por
pliegue completado — el ganador fuera de muestra de ese pliegue, con `runIx` llevando el índice
del pliegue en lugar de una posición en la cuadrícula — en lugar de una fila por punto de
parámetros. `ranking` es siempre `raw`, y no se reporta puntuación de meseta, DSR ni `pbo`: las
puntuaciones fuera de muestra ya son el número honesto.

## Sensibilidad de parámetros

`GET .../executeSweep/{requestId}/{sweepId}/sensitivity`

| Parámetro de consulta | Tipo | Notas |
|---|---|---|
| `objective` | `sharpe` \| `sortino` \| `pnl` \| `maxdd` | por defecto, el objetivo propio del barrido |

Agregado directamente a partir de las filas almacenadas del barrido — sin reejecución, sin
llamada al motor — así que funciona sobre un barrido todavía en curso (los agregados describen
entonces lo que haya terminado hasta el momento). Las ejecuciones abortadas se excluyen siempre:
una ejecución que lanzó una excepción no midió nada, y contarla como un mal resultado inventaría
evidencia contra un valor que nunca se probó de verdad. `404` si el barrido es desconocido o ha
expirado.

Una clasificación dice qué punto ganó; no puede decir si un eje importó en absoluto. La
sensibilidad responde a eso con dos vistas:

- **Marginal** — un eje, colapsando todos los demás: para cada valor, agrega todas las ejecuciones
  que lo usaron, cualesquiera que fueran los demás parámetros. Una marginal plana significa que el
  eje fue irrelevante en el rango barrido. Que `best`, `mean` y `worst` discrepen ya es en sí una
  señal — un `best` alto con un `mean` pobre solo funciona en compañía específica, una interacción
  invisible tras un único número.
- **Mapa de calor** — lo mismo, sobre un *par* de ejes, de modo que la interacción se hace visible
  directamente. Cuadrático en el número de ejes (`N` ejes → `N(N-1)/2` superficies), por lo que
  esto es un endpoint separado en lugar de campos en la respuesta de sondeo —
  `heatmapsTruncated: true` significa que al menos una superficie se dejó fuera para mantenerse
  dentro del presupuesto de respuesta.

### `SweepSensitivity`

| Campo | Notas |
|---|---|
| `rowsAnalysed` | filas disponibles en el momento del cálculo; crece mientras el barrido sigue en curso |
| `marginals` | array de `{param, points: [{value, count, best, mean, worst}]}` |
| `heatmaps` | array de `{paramA, paramB, cells: [{valueA, valueB, count, best, mean}]}` |
| `heatmapsTruncated` | `true` cuando se descartó una superficie de dos parámetros para mantenerse dentro del presupuesto |

### Ejemplo

```bash
curl "https://api.qtsurfer.net/v1/backtest/binance/ticker/executeSweep/$PREPARE_JOB_ID/$SWEEP_ID/sensitivity" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "sweepId": "swp_95e47a7f0966ce11",
  "status": "COMPLETED",
  "objective": "sharpe",
  "rowsAnalysed": 44,
  "marginals": [
    {
      "param": "rsiPeriod",
      "points": [
        {"value": 7,  "count": 4, "best": 0.94, "mean": 0.62, "worst": 0.31},
        {"value": 16, "count": 4, "best": 1.84, "mean": 1.53, "worst": 1.22},
        {"value": 28, "count": 4, "best": 0.77, "mean": 0.55, "worst": 0.28}
      ]
    }
  ],
  "heatmaps": [
    {
      "paramA": "rsiPeriod",
      "paramB": "useTrendFilter",
      "cells": [
        {"valueA": 16, "valueB": true, "count": 1, "best": 1.84, "mean": 1.84}
      ]
    }
  ],
  "heatmapsTruncated": false
}
```

Representado, `heatmaps[0]` de arriba se ve así (ilustrativo — la respuesta solo lleva los
números; trazarlos es cosa del cliente):

![Sharpe medio por rsiPeriod × useTrendFilter, un mapa de calor 8×2 con pico de 1,84 para rsiPeriod 16 con useTrendFilter true](/img/docs/sweep-sensitivity-heatmap.svg)

## Cancelar un barrido

`DELETE .../executeSweep/{requestId}/{sweepId}`

Solicita la cancelación entre vectores de parámetros — las filas ya completadas siguen siendo
legibles.

```json
{"status": "cancelling", "sweepId": "swp_95e47a7f0966ce11"}
```

Errores: `404` barrido no encontrado.

## Visualizar a un ganador: curva de equity

La [guía compartida de curvas de equity](equity_curves) cubre los modos de retención de un
barrido, los punteros de la clasificación, los parámetros de consulta en el momento de la
lectura, las transformaciones de respuesta, los metadatos, el trazado, y la vía de reproducción
manual cuando no se retuvo la curva de un ensayo.