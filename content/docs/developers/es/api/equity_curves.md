---
title: Curvas de equity
description: Transforma, retén, recupera y traza curvas de equity de backtests y barridos.
order: 5.5
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: e1224d410f43ddf65a397a1c0de828036cc50434
upstreamPath: docs/equity_curves.md
lastUpdated: '2026-10-22T21:18:46Z'
---

Una curva de equity describe el valor de la cuenta a lo largo de un backtest, o de una cuenta de paper
trading en vivo. QTSurfer devuelve el mismo contrato `EquityCurveResult` para un backtest simple, para un
ensayo retenido de un barrido y para la cuenta de paper trading de una ejecución en vivo, con reglas de
entrega distintas:

- Un backtest simple devuelve la curva en línea dentro de `results.equityCurve` y fija su
  transformación cuando se envía la ejecución.
- Una fila de barrido con curva retenida lleva `equityCurve.url`. En la vista de materialización
  (`?order=natural`) puede además traer la curva en línea; obtén su URL para elegir otra
  transformación en el momento de la lectura.
- Una ejecución en vivo arrancada con un bloque `paper` sirve la curva de cada cuenta bajo demanda desde
  `GET /live/{runId}/paper/equity`, que acepta los mismos parámetros de transformación en cada lectura.
  Consulta [Cuentas de paper trading en vivo](#cuentas-de-paper-trading-en-vivo).

En la curva de un backtest o de un barrido, el primer punto es un ancla en la marca de tiempo `from` del
backtest con el capital inicial. Cada punto posterior es una muestra por cada rendimiento emitido. `equity` es
el valor de la cuenta (`initialCapital + cumulativePnl`), no un porcentaje. Para representar la rentabilidad en
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

## Cuentas de paper trading en vivo

Una ejecución en vivo arrancada con un [bloque `paper`](live_paper) tiene una cuenta simulada por moneda de
cotización, y `GET /live/{runId}/paper/equity` sirve la curva de una cuenta con esta misma forma, con los mismos
parámetros de consulta `outMode`, `resample` y `differential`, el mismo `meta` y la misma guarda de tamaño. Lo
que cambia es que la curva es en vivo y lo que viaja a su lado:

- **Crece mientras la ejecución corre, y no tiene punto ancla.** El primer punto es el primer valor que registró
  la cuenta. Nada se fija al enviar: un parámetro omitido en la petición significa `ARRAY`, sin remuestreo y sin
  codificación diferencial.
- **Es una sola serie de equity corriente.** El valor tras cada operación cerrada y, cada minuto de tiempo de
  mercado mientras haya posiciones abiertas, el valor marcado a mercado.
- **`currency` y `gaps` vienen junto a la curva.** `currency` es la cuenta (las cuentas nunca se suman; se puede
  omitir solo cuando la ejecución tiene una única cuenta). `gaps` enumera, como milisegundos de época, los
  momentos en que se perdieron posiciones abiertas porque la ejecución se reinició con ellas abiertas. Un hueco
  no es un punto de la curva y `meta` no lo cuenta.
- **La curva propia de un instrumento.** `?instrument=BTC/USDT` responde el PnL realizado acumulado de ese
  instrumento desde 0, con un punto en cada una de sus operaciones cerradas, con esta misma forma y las mismas
  opciones. `measure` dice qué son los valores: `equity` para la curva de una cuenta, `realisedPnl` para la de un
  instrumento, y con `&measure=totalPnl` el PnL realizado más el valor no realizado de su posición abierta en cada
  marca. Consulta [Por instrumento](live_paper#por-instrumento).
- **Con una cuenta por instrumento,** `?instrument=ETH/USDT` selecciona la cuenta que es ese instrumento, y la
  respuesta es su propia curva `equity` con esta misma forma (`measure: equity`, con los `gaps` de la cuenta), no
  una parte de una cuenta compartida. Consulta [Una cuenta por instrumento](live_paper#una-cuenta-por-instrumento).
- **`sinceMs` empieza desde un momento de mercado, inclusive,** de modo que un cliente que ya tiene la curva
  lea solo lo nuevo. Una curva demasiado larga para leerla en una sola petición responde `400`: acótala con
  `sinceMs`, o pagínala.
- **`limit` pagina la curva cruda.** El servidor compacta una curva larga y remuestrea una muy larga, así que
  para leer todos los puntos da `limit` (o `cursor`): la respuesta es una página de la curva cruda, con la misma
  forma, con `_links.next` mientras haya más. `resample` no se puede combinar con ello. Consulta
  [Leer la curva cruda por páginas](live_paper#la-curva-de-equity).

```bash
curl "https://api.qtsurfer.net/v1/live/$RUN_ID/paper/equity?currency=USDT&outMode=SHORT&resample=500&differential=true" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "currency": "USDT",
  "measure": "equity",
  "timestamps": [1758330060000, 18000, 42000],
  "equities": [999.62, -0.03, 0.85],
  "gaps": [],
  "meta": {
    "inputPointCount": 3,
    "outputPointCount": 3,
    "resampled": false,
    "differential": true,
    "outMode": "SHORT"
  }
}
```

Lee la forma a partir de `meta.outMode`, como en cualquier curva. Las cuentas de la ejecución, sus KPIs y su
último equity están en `GET /live/{runId}/paper`; el recorrido de una ejecución de paper trading está en
[Paper trading en ejecuciones en vivo](live_paper#la-curva-de-equity).
