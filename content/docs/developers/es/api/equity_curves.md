---
title: Curvas de equity
description: Transforma, retén, recupera y traza curvas de equity de backtests y barridos.
order: 5.5
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: dc37afd8cf9ea955d212253460ac5d46b3791bb2
upstreamPath: docs/equity_curves.md
lastUpdated: '2026-09-04T00:00:00Z'
---

Una curva de equity describe el valor de la cuenta a lo largo de un backtest. QTSurfer devuelve el
mismo contrato `EquityCurveResult` tanto para un backtest simple como para un ensayo retenido de
un barrido, con reglas de entrega distintas:

- Un backtest simple devuelve la curva en línea dentro de `results.equityCurve` y fija su
  transformación cuando se envía la ejecución.
- Una fila de la clasificación de un barrido puede llevar un puntero en `equityCurve.url`;
  obténla por separado y elige la transformación en el momento de la lectura.

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

Las filas seleccionadas de la clasificación contienen un puntero, no puntos en línea:

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

`equityCurve` está ausente, no es `null`, en las filas no seleccionadas. Los metadatos de la fila
son una vista previa capturada en el momento de la selección; obtén `url` para la curva real,
posiblemente ajustada por tamaño, y sus metadatos autoritativos.

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

El endpoint devuelve `404` cuando el barrido o el `runIx` son desconocidos, o cuando la curva de
ese ensayo no se retuvo. Ambos casos son deliberadamente indistinguibles para quien llama.

Sin una curva de barrido retenida, reproduce el ensayo elegido con [`params` en un `execute`
simple](backtest_execute#executing-a-backtest) — pasa los valores de parámetro ganadores de la
fila y el mismo `prepareJobId`, sin necesidad de recompilar. Es una ejecución independiente, no
una repetición del ensayo del barrido: las dos vías no comparten simulador, así que una métrica
puede diferir de la fila de la clasificación que te trajo hasta aquí.