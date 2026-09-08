---
title: Curvas de equity
description: Transforma, retén, recupera y traza curvas de equity de backtests y barridos.
order: 5.5
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: b7fed4c6aa305679a46e27a5b432fbe3823428a7
upstreamPath: docs/equity_curves.md
lastUpdated: '2026-09-04T10:18:11Z'
---

Una curva de equity describe el valor de la cuenta a lo largo de un backtest. QTSurfer devuelve el
mismo contrato `EquityCurveResult` tanto para un backtest simple como para un ensayo retenido de
un barrido, con reglas de entrega distintas:

- Un backtest simple devuelve la curva en línea dentro de `results.equityCurve` y fija su
  transformación cuando se envía la ejecución.
- Una fila de barrido con curva retenida lleva `equityCurve.url`. En la vista de materialización
  (`?order=natural`) puede además traer la curva en línea; obtén su URL para elegir otra
  transformación en el momento de la lectura.

El primer punto es un ancla en la marca de tiempo `from` del backtest con el capital inicial.
Cada punto posterior es una muestra por cada rendimiento emitido. `equity` es el valor de la
cuenta (`initialCapital + cumulativePnl`), no un porcentaje. Para representar la rentabilidad en
porcentaje, normaliza cada valor como `(equity / initialEquity - 1) * 100`.

![Curva de equity ilustrativa normalizada al capital inicial, que asciende hasta un +18,3 % con un drawdown intermedio](/img/docs/equity-curve.svg)

## Formas de la respuesta

`meta.outMode` determina qué representación de los puntos está presente.

### `ARRAY`

```json
{
  "points": [
    {"timestamp": 1700000000000, "equity": 100.0},
    {"timestamp": 1700000060000, "equity": 110.5},
    {"timestamp": 1700000120000, "equity": 90.25}
  ],
  "meta": {
    "inputPointCount": 3,
    "outputPointCount": 3,
    "resampled": false,
    "differential": false,
    "outMode": "ARRAY"
  }
}
```

### `SHORT`

`SHORT` elimina los nombres de propiedad JSON repetidos devolviendo arrays paralelos. Los valores
en el mismo índice forman un punto.

```json
{
  "timestamps": [1700000000000, 1700000060000, 1700000120000],
  "equities": [100.0, 110.5, 90.25],
  "meta": {
    "inputPointCount": 3,
    "outputPointCount": 3,
    "resampled": false,
    "differential": false,
    "outMode": "SHORT"
  }
}
```

No infieras la forma a partir de la petición. Una salvaguarda de tamaño del servidor puede forzar
una representación compacta; `meta.outMode` es la fuente de verdad.

## Pipeline de transformación

Las transformaciones se ejecutan en un orden fijo: `resample` → `differential` → `outMode`.

| Opción | Tipo y valor por defecto | Efecto |
|---|---|---|
| `resample` | entero ≥ 2; omitido | Limita el resultado, como máximo, a este número de puntos. El submuestreo conserva exactamente el primer y el último punto, y los extremos globales. Un techo por encima del tamaño de entrada es un no-op válido. |
| `differential` | booleano; `false` | Mantiene absoluto el primer punto tras el remuestreo y codifica en deltas la marca de tiempo y la equity a partir del segundo punto. |
| `outMode` | `ARRAY` \| `SHORT`; `ARRAY` | Elige entre objetos o arrays paralelos tras las etapas anteriores. |

Los metadatos de la respuesta informan de lo que realmente ocurrió:

| Metadato | Significado |
|---|---|
| `inputPointCount` | Número de puntos recibidos por el pipeline de transformación. |
| `outputPointCount` | Número de puntos tras el pipeline completo. |
| `resampled` | `true` solo cuando el remuestreo cambió el número de puntos. |
| `differential` | `true` solo cuando se ejecutó la codificación en deltas; una curva de cero o un punto no tiene nada que codificar. |
| `outMode` | Representación JSON realmente servida. |

### Decodificar datos diferenciales

El primer punto se mantiene absoluto. Reconstruye cada punto siguiente sumando su delta al valor
reconstruido anterior:

```json
{
  "timestamps": [1700000000000, 60000, 60000],
  "equities": [100.0, 10.5, -20.25],
  "meta": {
    "inputPointCount": 3,
    "outputPointCount": 3,
    "resampled": false,
    "differential": true,
    "outMode": "SHORT"
  }
}
```

Esto reconstruye las marcas de tiempo `1700000000000`, `1700000060000`, `1700000120000` y las
equities `100.0`, `110.5`, `90.25`. La misma regla se aplica a `points` en modo `ARRAY`.

## Backtests simples: elige la transformación al enviar

Una ejecución simple no tiene un endpoint de curva posterior, así que su transformación queda
incrustada en el resultado almacenado. Fija `equityCurve` en `POST .../execute`:

```bash
curl -X POST https://api.qtsurfer.net/v1/backtest/binance/ticker/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prepareJobId": "5ikYAMIO...",
    "strategyId": "2ul144qe9tlwzu5anhwvc6",
    "equityCurve": {"resample": 500, "differential": true, "outMode": "SHORT"}
  }'
```

Omitir `equityCurve` significa `ARRAY`, sin remuestreo solicitado y sin codificación
diferencial. La transformación participa en la idempotencia de la ejecución:
`(prepareJobId, strategyId, storeSignals, equityCurve) → jobId`. Cambiar solo la transformación
crea una ejecución distinta en lugar de remodelar un resultado existente.

La curva está presente junto con las métricas de rendimiento después de que la estrategia emita
al menos una operación. Para los valores de los indicadores y los marcadores de compra/venta
detrás de la curva agregada, solicita las señales almacenadas y lee el fichero Parquet en
`signalsUrl`.

## Barridos: seleccionar, retener y obtener curvas

Las filas de un barrido son resultados agregados y por defecto no llevan series temporales.
`EquityCurveRequest` añade controles de retención a las opciones de transformación compartidas:

| Campo | Tipo y valor por defecto | Efecto |
|---|---|---|
| `mode` | `auto` \| `topN` \| `topPct` \| `none`; `auto` | Elige qué ensayos completados retienen curva. `auto` delega la retención en los límites de tamaño del servidor; usa `topN` o `topPct` cuando se necesite una retención determinista. |
| `n` | entero ≥ 1 | Número de ensayos clasificados que retiene `topN`. |
| `maxPct` | número > 0 y ≤ 100 | Porcentaje de ensayos clasificados que retiene `topPct`, redondeado al alza con un mínimo de uno. |
| `resample`, `differential`, `outMode` | opciones compartidas | Valores por defecto usados cuando un `GET` posterior de la curva omite el parámetro de consulta correspondiente. No afectan a la retención. |

```json
{
  "strategyId": "2ul144qe9tlwzu5anhwvc6",
  "sweep": {
    "sampler": "grid",
    "objective": "sharpe",
    "params": {"rsiPeriod": {"from": 7, "to": 28, "step": 1}}
  },
  "equityCurve": {
    "mode": "topN",
    "n": 5,
    "resample": 500,
    "outMode": "SHORT"
  }
}
```

La retención (`mode`, `n`, `maxPct`) forma parte de la identidad del barrido. Los valores por
defecto de la transformación no: dos envíos por lo demás idénticos que solo difieren en
`resample`, `differential` o `outMode` deduplican al mismo `sweepId`.

Con `topN` o `topPct`, toda ejecución completada que produjo operaciones retiene una curva.
`equityCurve` está ausente, no es `null`, solo cuando una ejecución abortó, no produjo operaciones,
o el barrido no pidió retención (`mode: auto` o `none`). La selección cambia cómo se entrega, no si
la curva existe: la vista ordenada lleva un puntero, mientras que la vista de materialización
(`?order=natural`) puede llevar ese mismo puntero junto con los puntos en línea.

Por ejemplo, una fila de la vista ordenada puede contener un puntero:

```json
{
  "runIx": 12,
  "equityCurve": {
    "meta": {
      "inputPointCount": 118,
      "outputPointCount": 118,
      "resampled": false,
      "differential": false,
      "outMode": "ARRAY"
    },
    "url": "/v1/backtest/binance/ticker/executeSweep/5ikYAMIO.../swp_95e47a7f0966ce11/runs/12/equityCurve"
  }
}
```

No uses la presencia de `equityCurve`, ni la ausencia de `url`, para saber si una curva viene en
línea. Las dos señales engañan: una fila que solo lleva puntero tiene `equityCurve`, y una curva en
línea conserva `url` para poder pedirla de nuevo con otra transformación. Mira `points` o
`equities` en su lugar.

Cuando una fila lleva solo el puntero, obtén `url` para la curva real, posiblemente ajustada por
tamaño, y sus metadatos autoritativos. Los metadatos de la fila pueden ser una declaración y no una
medición: en una curva no promocionada, su número de puntos se deriva del número de operaciones en
lugar de leerse del almacenamiento.

## Parámetros de consulta de la curva de un barrido

`GET .../runs/{runIx}/equityCurve` acepta `outMode`, `resample` y `differential`. Un parámetro
omitido en la consulta hereda el valor por defecto de transformación del envío del barrido. Un
valor pasado explícitamente sobrescribe ese valor por defecto para esta lectura:

```bash
curl "https://api.qtsurfer.net$EQUITY_CURVE_URL?outMode=SHORT&resample=500&differential=true" \
  -H "Authorization: Bearer $TOKEN"
```

El servidor puede seguir forzando una representación más pequeña por encima de sus umbrales de
tamaño. Interpreta la respuesta según `meta`, no según los valores por defecto enviados ni la
cadena de consulta.

El endpoint devuelve `404` cuando el barrido o el `runIx` son desconocidos, o cuando ese ensayo no
tiene curva retenida. Ambos casos son deliberadamente indistinguibles para quien llama.

Sin una curva de barrido retenida, reproduce el ensayo elegido con [`params` en un `execute`
simple](backtest_execute#executing-a-backtest) — pasa los valores de parámetro ganadores de la
fila y el mismo `prepareJobId`, sin necesidad de recompilar. Es una ejecución independiente, no
una repetición del ensayo del barrido, pero las dos vías están fijadas para coincidir en todas las
métricas de la clasificación para un mismo vector. Trata una diferencia como un fallo que merece
reportarse.