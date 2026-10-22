---
title: Paper trading en ejecuciones en vivo
description: Ejecuta en simulación las señales de una ejecución en vivo — configúralo, y lee sus cuentas, su curva de equity y sus KPIs.
order: 5.46
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: c86f02ce5ec438734ce62a5738863345aeedc59f
upstreamPath: docs/live_paper.md
lastUpdated: '2026-10-22T21:25:37Z'
---

Arranca una [ejecución en vivo](live) con un bloque `paper` y sus hints se ejecutan en simulación
desde el primer tick, exactamente como los ejecutaría un backtest: las órdenes se llenan, las
posiciones se abren y se cierran, y la ejecución acumula equity y los mismos KPIs que reporta un
backtest. No se envía nada a un exchange. Sin el bloque, la ejecución no tiene paper trading.

| Método | Ruta | Propósito |
|---|---|---|
| `POST` | `/strategy/{strategyId}/live` | Arrancar una ejecución — con un bloque `paper` para hacerle paper trading |
| `GET` | `/live/{runId}/paper` | Cada cuenta paper: equity, posiciones abiertas, KPIs |
| `GET` | `/live/{runId}/paper/equity` | La curva de equity de una cuenta, con la forma de cualquier [curva de equity](equity_curves) |
| `GET` | `/live/{runId}/signals?type=paper` | Elementos paper intercalados en las señales de la ejecución (solo con `output: mix`) |

Ambas rutas paper siguen la misma regla de acceso que las señales de una ejecución: su dueño, o
cualquiera si la ejecución es `public`. Una ejecución arrancada sin bloque `paper` responde `404` en
las dos.

## Arrancar una ejecución con paper trading

```
POST /v1/strategy/6bsh31ikwkuivhtgcoa6s4/live
{
  "sources": [{"venueType": "cex", "exchange": "binance", "segment": "spot", "type": "ticker",
               "instruments": ["BTC/USDT", "ETH/USDT"]}],
  "paper": {"initialFunding": 1000, "feeRate": 0.001, "percentAmountToLock": 20}
}

201
{
  "strategyId": "6bsh31ikwkuivhtgcoa6s4",
  "runId": "6TzAPiPpsOWwBLdLBZCxwH",
  "stage": "SANDBOX",
  "state": "STARTING",
  …
  "paper": {"initialFunding": 1000.0, "buyFeeRate": 0.001, "sellFeeRate": 0.001, "feeLeg": "RECEIVED",
            "percentAmountToLock": 20.0, "output": "separate"}
}
```

El bloque acepta la misma economía que el `baseConfig` de un backtest, con los mismos valores por
defecto y límites, así que un mismo objeto pasa de un backtest a una ejecución en vivo sin cambios:

| campo | por defecto | significado |
|---|---|---|
| `initialFunding` | `100` | Capital inicial de cada cuenta, en la moneda de cotización de esa cuenta. Como máximo 1.000.000.000. Con `accounts: instrument` es el capital de CADA cuenta de instrumento, nunca el total de la ejecución. |
| `feeRate` | `0.001` | Comisión de ambos lados (0.001 = 0,1 %). |
| `buyFeeRate` / `sellFeeRate` | `feeRate` | Comisiones por lado; sustituyen a `feeRate`. |
| `feeLeg` | `RECEIVED` | En qué activo se cobran las comisiones: `RECEIVED`, `QUOTE` o `BASE`. |
| `percentAmountToLock` | ver abajo | Porcentaje del saldo libre de la cuenta que bloquea cada entrada, en porcentaje (0–100]. |
| `output` | `separate` | `separate`, o `mix` para escribir además los elementos paper en las señales de la ejecución (ver [abajo](#salida-separate-o-mix)). |
| `accounts` | `currency` | `currency`: una cuenta compartida por moneda de cotización. `instrument`: una cuenta aislada por instrumento, cada una con su propio `initialFunding` (ver [Una cuenta por instrumento](#una-cuenta-por-instrumento)). |

El `GET /strategy/{strategyId}/live` de la propia ejecución devuelve el bloque tal como se aceptó:
`feeRate` resuelto en `buyFeeRate`/`sellFeeRate`, los valores por defecto rellenados y `feeLeg` en
mayúsculas.

**Dimensionado.** Sin `percentAmountToLock`, cada entrada bloquea el 10 % del saldo libre de la
cuenta, salvo que la estrategia fije el suyo. Un backtest usa por defecto todo el saldo, pero una
ejecución en vivo opera varios pares a la vez, y usar todo el saldo dejaría que el primero se quedara
con toda la cuenta. Con `20`, como arriba, la primera entrada bloquea 200 de los 1000, y una segunda
entrada abierta mientras la primera sigue abierta bloquea el 20 % de los 800 restantes: 160.

### Qué se rechaza

Todo lo inválido es un `400`, nunca se ajusta en silencio:

```json
{"code": 400, "message": "paper.slippage is not a known field (known: [initialFunding, feeRate, buyFeeRate, sellFeeRate, feeLeg, percentAmountToLock, output, accounts])"}
{"code": 400, "message": "paper.initialFunding must be > 0"}
{"code": 400, "message": "paper.output must be one of [separate, mix]"}
{"code": 400, "message": "paper.accounts must be one of [currency, instrument]"}
{"code": 400, "message": "paper.accounts = instrument needs the instruments named, not a wildcard ('*'): it opens one account for each"}
```

**Estrategias que escuchan su propia ejecución.** Una estrategia que sobrescribe
`getExecutionCallback()` reacciona a sus fills y se detiene, y el paper trading es el único sitio
donde una ejecución en vivo ejecuta. Arrancar una sin bloque `paper` se rechaza (basta
`"paper": {}`):

```json
{"code": 400, "message": "this strategy listens to execution events (it overrides getExecutionCallback()), and paper trading is where its orders are executed: a paper block is required, e.g. \"paper\": {}"}
```

## Cuentas: una por moneda de cotización

Cada moneda de cotización que opera la ejecución tiene su propia cuenta simulada, abierta con
`initialFunding` en **su propia moneda** la primera vez que se opera uno de sus pares. Las cuentas
nunca se suman: no hay conversión entre monedas.

| `instruments` | cuentas |
|---|---|
| `["BTC/USDT", "ETH/USDT"]` | una: `USDT` (1000 USDT), compartida por ambos pares |
| `["BTC/USDT", "ETH/BTC"]` | dos: `USDT` (1000 USDT) y `BTC` (1000 BTC) |

Los pares que comparten cuenta comparten su saldo: el dimensionado siempre es un porcentaje de lo
que a esa cuenta aún le queda libre.

### Una cuenta por instrumento

Con `"accounts": "instrument"` en el bloque `paper`, cada instrumento tiene en cambio una cuenta propia, abierta con
`initialFunding` en la moneda de cotización del instrumento la primera vez que se opera. Cada una es una simulación
de ese instrumento solo, exactamente lo que haría un backtest suyo con la misma economía: nunca usa el saldo de otro
instrumento, así que es la forma de comparar una ejecución en vivo con un backtest de cada instrumento.

| `instruments` | `accounts: currency` (por defecto) | `accounts: instrument` |
|---|---|---|
| `["BTC/USDT", "ETH/USDT"]` | una: `USDT` (1000 USDT), compartida | dos: `BTC/USDT` (1000 USDT) y `ETH/USDT` (1000 USDT) |
| `["BTC/USDT", "ETH/BTC"]` | dos: `USDT` y `BTC` | dos: `BTC/USDT` (1000 USDT) y `ETH/BTC` (1000 BTC) |

Tres cosas que conviene saber:

- **`initialFunding` es el capital de cada cuenta, nunca el total de la ejecución.** Dos instrumentos con
  `"initialFunding": 1000` son dos cuentas de 1000, no 1000 repartidos entre ellos. Las cuentas nunca se suman, ni en
  la misma moneda ni en otra, y nada aquí informa de un total.
- **Es menos realista que la cuenta compartida.** Un exchange tiene una cartera por activo, no una por par: con una
  cuenta compartida, una ejecución `*/USDT` al 25 % por entrada puede mantener cuatro instrumentos desde una cartera
  de USDT, y lo que vende vuelve como USDT. Usa el modo aislado para preguntar «cómo le habría ido a esta estrategia
  solo con este instrumento»; usa el compartido para preguntar cómo se comporta la ejecución con una sola cartera.
- **Sin `percentAmountToLock`, una entrada bloquea todo el saldo libre**, como hace un backtest, porque nada se
  comparte. La cuenta compartida conserva su 10 % por defecto. Un valor que des gana en ambos.

Los instrumentos hay que nombrarlos: `"instruments": ["*"]`, o un par con `*` en un lado, se rechaza sea cual sea el
plan, ya que abriría una cuenta, cada una con todo el `initialFunding`, para cada instrumento del exchange. El reparto
se fija al arrancar la ejecución y se devuelve con el bloque.

## Leer una cuenta

`GET /live/{runId}/paper` devuelve cada cuenta tal como se registró por última vez. Para la
ejecución de arriba, poco después de las 01:02 UTC (BTC/USDT comprado a las 01:00:10 y vendido a las
01:01:18 con −0.41; ETH/USDT comprado a las 01:00:25 y aún abierto):

```
GET /v1/live/6TzAPiPpsOWwBLdLBZCxwH/paper

200
{
  "runId": "6TzAPiPpsOWwBLdLBZCxwH",
  "stage": "SANDBOX",
  "accounts": [{
    "currency": "USDT",
    "initialFunding": 1000.0,
    "equity": 1000.44,
    "equityAtMs": 1758330120000,
    "equityKind": "mark",
    "realisedPnl": -0.41,
    "unrealisedPnl": 0.85,
    "totalPnl": 0.44,
    "trades": 1,
    "gaps": 0,
    "openPositions": [{
      "instrument": "ETH/USDT", "base": 0.05948, "cost": 160.0,
      "markPrice": 2704.25, "markedAtMs": 1758330120000, "unrealisedPnl": 0.85
    }],
    "kpi": {
      "totalTrades": 1, "winCount": 0, "lossCount": 1, "winRate": 0.0,
      "pnlTotal": -0.41, "pnlTotalPercent": -0.041,
      "sharpeRatio": null, "sortinoRatio": null, "cagr": -0.00041,
      "maxDrawdown": 0.41, "maxDrawdownPercent": 0.041
    }
  }]
}
```

| campo | significado |
|---|---|
| `equity` | El último valor registrado: en la última operación cerrada (`equityKind: equity`, capital más PnL realizado), o en la última valoración a mercado (`equityKind: mark`, que además valora las posiciones abiertas a precio de mercado). Hasta que exista alguno, el capital inicial. |
| `realisedPnl` | Suma del PnL de las operaciones cerradas. |
| `unrealisedPnl` | Lo que valen sus posiciones abiertas sobre su coste en la última marca, en la moneda de la cuenta: la suma de los `unrealisedPnl` de `openPositions`. `0` cuando no mantiene nada. Ausente mientras alguna de sus posiciones no tiene marca vigente. |
| `totalPnl` | `realisedPnl` más `unrealisedPnl`; ausente cuando lo está `unrealisedPnl`. Cuando `equityKind` es `mark` y está presente, es `equity` menos `initialFunding`. |
| `trades` | Operaciones cerradas. |
| `gaps` | Veces que se perdieron posiciones abiertas porque la ejecución se reinició con ellas abiertas (ver [Huecos](#huecos)). |
| `openPositions` | Lo que se mantiene ahora: `base` en el activo base, `cost` en la moneda de la cuenta. Cuando la última marca valoró la posición tal como está ahora, también dice `markPrice` (el precio al que se valoró), `markedAtMs` (cuándo) y `unrealisedPnl` (`base` por `markPrice`, menos `cost`). Una posición abierta o cambiada desde la última marca, hace como mucho un minuto, aún no tiene ninguno de los tres. |
| `kpi` | Los mismos KPIs que reporta un backtest, sobre las operaciones cerradas hasta ahora; ausente hasta la primera. |

Los KPIs usan las unidades del backtest: `winRate` y `cagr` son ratios (`0.15` = 15 %);
`pnlTotalPercent` y `maxDrawdownPercent` son porcentajes (escala 0–100); `sharpeRatio` y
`sortinoRatio` son por operación, no anualizados, y `null` hasta que hay operaciones suficientes para
calcularlos.

### Por instrumento

Una cuenta la comparten todos los instrumentos de su moneda de cotización, así que cada cuenta también dice qué
realizó **por instrumento**: `instruments`, una entrada por cada instrumento que ha cerrado alguna operación o
mantiene una posición ahora, en orden de instrumento. Para una ejecución con BTC/USDT y ETH/USDT en una cuenta de
1000 USDT:

```
"instruments": [
  {
    "instrument": "BTC/USDT", "trades": 3, "wins": 2, "losses": 1,
    "realisedPnl": 12.0, "contributionPct": 1.2,
    "unrealisedPnl": 0.0, "totalPnl": 12.0,
    "kpi": {
      "totalTrades": 3, "winCount": 2, "lossCount": 1, "winRate": 0.6667,
      "pnlTotal": 12.0, "pnlTotalPercent": 1.2,
      "sharpeRatio": 0.6794, "sortinoRatio": 1.7321, "cagr": 0.012,
      "maxDrawdown": 4.0, "maxDrawdownPercent": 0.396
    }
  },
  {
    "instrument": "ETH/USDT", "trades": 2, "wins": 0, "losses": 2,
    "realisedPnl": -3.0, "contributionPct": -0.3,
    "unrealisedPnl": 0.85, "totalPnl": -2.15,
    "openPosition": {
      "base": 0.05948, "cost": 160.0,
      "markPrice": 2704.25, "markedAtMs": 1758330120000, "unrealisedPnl": 0.85
    },
    "kpi": {
      "totalTrades": 2, "winCount": 0, "lossCount": 2, "winRate": 0.0,
      "pnlTotal": -3.0, "pnlTotalPercent": -0.3,
      "sharpeRatio": -1.0, "sortinoRatio": -0.7071, "cagr": -0.003,
      "maxDrawdown": 3.0, "maxDrawdownPercent": 0.3
    }
  }
]
```

| campo | significado |
|---|---|
| `instrument` | El par. |
| `trades`, `wins`, `losses` | Sus operaciones cerradas. Una operación gana si su PnL es mayor que cero, así que una operación con un PnL exactamente cero cuenta como pérdida. |
| `realisedPnl` | Suma del PnL de sus operaciones cerradas, en la moneda de la cuenta. Los `realisedPnl` de los instrumentos suman el de la cuenta. |
| `contributionPct` | `realisedPnl` como porcentaje del `initialFunding` de la cuenta (escala 0–100), de modo que las contribuciones de los instrumentos suman la rentabilidad realizada de la cuenta. |
| `openPosition` | Lo que mantiene ahora (`base` en el activo base, `cost` en la moneda de la cuenta); ausente cuando no mantiene nada. Con los mismos `markPrice`, `markedAtMs` y `unrealisedPnl` que una entrada de `openPositions` de la cuenta, cuando la última marca es de la posición tal como está. Un instrumento que mantiene una posición pero aún no ha cerrado ninguna operación figura en la lista, sin `kpi`. |
| `unrealisedPnl` | Lo que vale su posición abierta sobre su coste, en la última marca; `0` cuando no mantiene nada. Ausente mientras su posición no tiene marca vigente. Sumado sobre los instrumentos es el `unrealisedPnl` de la cuenta, la parte de `equity` (en una marca) que no es capital ni realizado. |
| `totalPnl` | `realisedPnl` más `unrealisedPnl`; ausente cuando lo está `unrealisedPnl`. |
| `kpi` | Los KPIs de las operaciones cerradas de ese instrumento solas, con el `initialFunding` de la cuenta como capital, de modo que su `pnlTotalPercent` es igual a su `contributionPct`. Mismas unidades que las de la cuenta; ausente hasta su primera operación cerrada. |

**Qué es el desglose, y qué no.** Es exacto para lo que se realizó. No es cómo le habría ido al instrumento por su
cuenta: sus entradas dependieron de lo que los demás ya habían bloqueado de la misma cuenta (con
`percentAmountToLock: 20`, una segunda entrada bloquea el 20 % de lo que dejó libre la primera), así que otra
combinación de instrumentos lo habría dimensionado de otra manera. Responde qué instrumento suma a la cuenta y
cuál resta.

### Cuentas por instrumento

Para una ejecución arrancada con `"accounts": "instrument"`, cada entrada de `accounts` es un instrumento y lo dice
con `instrument`; `currency` es su cotización, y dos cuentas pueden compartirla. No hay `instruments` que desglosar,
ya que la cuenta ya es un instrumento.

```
GET /v1/live/6TzAPiPpsOWwBLdLBZCxwH/paper

200
{
  "runId": "6TzAPiPpsOWwBLdLBZCxwH",
  "stage": "SANDBOX",
  "accounts": [
    {
      "currency": "USDT", "instrument": "BTC/USDT",
      "initialFunding": 1000.0, "equity": 1001.2, "equityAtMs": 1758330120000, "equityKind": "mark",
      "realisedPnl": 1.2, "unrealisedPnl": 0.0, "totalPnl": 1.2, "trades": 3, "gaps": 0, "openPositions": [],
      "kpi": {"totalTrades": 3, "winCount": 2, "lossCount": 1, "winRate": 0.6667, "pnlTotal": 1.2, "pnlTotalPercent": 0.12}
    },
    {
      "currency": "USDT", "instrument": "ETH/USDT",
      "initialFunding": 1000.0, "equity": 997.35, "equityAtMs": 1758330120000, "equityKind": "mark",
      "realisedPnl": -3.5, "unrealisedPnl": 0.85, "totalPnl": -2.65, "trades": 2, "gaps": 0,
      "openPositions": [{
        "instrument": "ETH/USDT", "base": 0.05948, "cost": 160.0,
        "markPrice": 2704.25, "markedAtMs": 1758330120000, "unrealisedPnl": 0.85
      }],
      "kpi": {"totalTrades": 2, "winCount": 0, "lossCount": 2, "winRate": 0.0, "pnlTotal": -3.5, "pnlTotalPercent": -0.35}
    }
  ]
}
```

Cada cuenta tiene su propio `initialFunding` y sus propios KPIs, calculados solo sobre sus operaciones. Su
`unrealisedPnl` y su `totalPnl` son los de cualquier cuenta (arriba): lo que vale su posición, y eso con lo que
realizó, así que aquí son los del propio instrumento. Lee `GET /live/{runId}/paper/equity?instrument=ETH/USDT` para
la curva de una de ellas (consulta [La curva de equity](#la-curva-de-equity)).

## La curva de equity

`GET /v1/live/{runId}/paper/equity` devuelve la curva completa de una cuenta, de la más antigua a la más
reciente, con la misma forma que cualquier otra [curva de equity](equity_curves) de la API: `{points, meta}`
o, con `outMode=SHORT`, `{timestamps, equities, meta}`, moldeada por los mismos parámetros de consulta
`outMode`, `resample` y `differential` y descrita por el mismo `meta`. A su lado vienen la `currency` de la
cuenta y sus `gaps`. La curva se conserva durante toda la vida de la ejecución, así que, a diferencia de las
señales, no hay una ventana móvil. Es por **cuenta**, no por par: BTC/USDT y ETH/USDT comparten una.

Es una sola serie de equity corriente, hecha de dos tipos de punto:

| punto | cuándo | `equity` |
|---|---|---|
| operación cerrada | tras cada operación cerrada, de cualquier par | capital más PnL realizado |
| marca | una vez por minuto de tiempo de mercado, mientras haya alguna posición abierta | capital más PnL realizado más las posiciones abiertas a precio de mercado |

Donde la ejecución se reinició con posiciones abiertas, esas posiciones se pierden (consulta [Huecos](#huecos))
y la curva no tiene valor ahí: ese momento figura en `gaps`, junto a la curva, y no es un punto de ella.

Para la ejecución de arriba, desde su inicio:

| hora | evento | punto |
|---|---|---|
| 01:00:10 | BTC/USDT comprado (200 USDT) | — |
| 01:00:25 | ETH/USDT comprado (160 USDT) | — |
| 01:01:00 | un minuto con ambos abiertos, −0.38 no realizado | marca 999.62 |
| 01:01:18 | BTC/USDT vendido, −0.41 | operación cerrada 999.59 |
| 01:02:00 | un minuto con ETH/USDT abierto, +0.85 no realizado | marca 1000.44 |
| 01:02:31 | ETH/USDT vendido, +0.72 | operación cerrada 1000.31 |
| 01:03:00 | nada abierto | — |
| 01:03:40 | BTC/USDT comprado otra vez (200.06 USDT) | — |
| 01:04:00 | un minuto con BTC/USDT abierto, −0.12 no realizado | marca 1000.19 |

```
GET /v1/live/6TzAPiPpsOWwBLdLBZCxwH/paper/equity

200
{
  "currency": "USDT",
  "measure": "equity",
  "points": [
    {"timestamp": 1758330060000, "equity": 999.62},
    {"timestamp": 1758330078000, "equity": 999.59},
    {"timestamp": 1758330120000, "equity": 1000.44},
    {"timestamp": 1758330151000, "equity": 1000.31},
    {"timestamp": 1758330240000, "equity": 1000.19}
  ],
  "gaps": [],
  "meta": {"inputPointCount": 5, "outputPointCount": 5, "resampled": false, "differential": false, "outMode": "ARRAY"}
}
```

Las formas compactas son las que tiene cualquier curva. La misma curva, codificada en deltas en arrays
paralelos (el primer valor sigue siendo absoluto, consulta
[decodificar datos diferenciales](equity_curves#decodificar-datos-diferenciales)):

```
GET /v1/live/6TzAPiPpsOWwBLdLBZCxwH/paper/equity?outMode=SHORT&differential=true

200
{
  "currency": "USDT",
  "measure": "equity",
  "timestamps": [1758330060000, 18000, 42000, 31000, 89000],
  "equities": [999.62, -0.03, 0.85, -0.13, -0.12],
  "gaps": [],
  "meta": {"inputPointCount": 5, "outputPointCount": 5, "resampled": false, "differential": true, "outMode": "SHORT"}
}
```

Una ejecución larga tiene una curva larga. `resample` la acota (`?resample=500` son como mucho 500 puntos,
conservando el primero, el último y los extremos), y por encima de un tamaño fijado en el servidor la forma se
compacta se haya pedido lo que se haya pedido, como en cualquier curva: lee `meta.outMode`. `sinceMs` empieza
desde un momento de mercado dado, inclusive, de modo que un cliente que ya tiene una curva lea solo lo nuevo.
Una curva demasiado larga para leerla en una sola petición responde `400`; acótala con `sinceMs`, o pagínala.

**Leer la curva cruda por páginas.** El servidor compacta una curva larga y, por encima de un tamaño mayor, la
remuestrea, así que la respuesta de la curva entera no sirve para tomar todos los puntos. Para tomarlos todos,
pide páginas: da `limit` (hasta 1000, 100 por defecto) y la respuesta es una página de la curva cruda, de la más
antigua a la más reciente, con `_links.next` mientras haya más.

```
GET /v1/live/6TzAPiPpsOWwBLdLBZCxwH/paper/equity?limit=3

200
{
  "currency": "USDT",
  "measure": "equity",
  "points": [
    {"timestamp": 1758330060000, "equity": 999.62},
    {"timestamp": 1758330078000, "equity": 999.59},
    {"timestamp": 1758330120000, "equity": 1000.44}
  ],
  "gaps": [],
  "meta": {"inputPointCount": 3, "outputPointCount": 3, "resampled": false, "differential": false, "outMode": "ARRAY"},
  "_links": {"next": {"href": "/v1/live/6TzAPiPpsOWwBLdLBZCxwH/paper/equity?cursor=eyJ0cyI6MTc1ODMzMDEyMDAwMCwiaWQiOiI…&limit=3&currency=USDT"}}
}
```

Sigue `_links.next` tal cual (el cursor es opaco); una página sin `_links` es la última:

```
200
{
  "currency": "USDT",
  "measure": "equity",
  "points": [
    {"timestamp": 1758330151000, "equity": 1000.31},
    {"timestamp": 1758330240000, "equity": 1000.19}
  ],
  "gaps": [],
  "meta": {"inputPointCount": 2, "outputPointCount": 2, "resampled": false, "differential": false, "outMode": "ARRAY"}
}
```

Una página tiene la misma forma que la curva entera, así que `outMode` y `differential` se le aplican y el
enlace siguiente los conserva; cada página se decodifica por sí sola, con su propio primer valor absoluto. Una
página contiene como mucho `limit` entradas y un [hueco](#huecos) cuenta como una, así que una página con un
hueco tiene un punto menos, y el momento del hueco está en los `gaps` de esa página. `resample` no se puede
combinar con la paginación (`400`): una curva remuestreada es una sola respuesta, una paginada es la curva
cruda. Un cursor nunca pierde ni repite una entrada, ni siquiera entre dos entradas del mismo milisegundo.

**Varias cuentas.** Cada cuenta tiene su propia curva, que nunca se suma a otra. `currency` la elige, y solo se
puede omitir cuando la ejecución tiene una única cuenta (o todavía ninguna, lo que da una curva vacía). Con
varias cuentas y sin `currency`, la petición es un `400` que las enumera. Para una ejecución sobre BTC/USDT y
ETH/BTC, `?currency=BTC` es la cuenta BTC:

```
GET /v1/live/6TzAPiPpsOWwBLdLBZCxwH/paper/equity?currency=BTC

200
{
  "currency": "BTC",
  "measure": "equity",
  "points": [
    {"timestamp": 1758330060000, "equity": 999.9981},
    {"timestamp": 1758330097000, "equity": 1000.0012}
  ],
  "gaps": [],
  "meta": {"inputPointCount": 2, "outputPointCount": 2, "resampled": false, "differential": false, "outMode": "ARRAY"}
}
```

**La curva de un instrumento.** Para el desglose de arriba (consulta [Por instrumento](#por-instrumento)),
`?instrument=BTC/USDT` responde el **PnL realizado acumulado** de ese instrumento, desde 0: un punto en cada una
de sus operaciones cerradas. Es la misma forma de curva, con las mismas opciones y la misma paginación, y la
respuesta dice qué son sus valores en `measure`: `equity` en la curva de una cuenta, `realisedPnl` en la de un
instrumento (la forma llama `equity` a sus valores en ambos casos). Un instrumento pertenece a la cuenta de su
moneda de cotización, así que no hace falta dar `currency`, y dar una distinta es un `400`. Los últimos valores
de las curvas de todos los instrumentos de una cuenta suman el `realisedPnl` de la cuenta. Entre medias solo
siguen la parte realizada de la propia curva de la cuenta hasta el orden en que se procesaron las operaciones: la
curva de la cuenta se registra en ese orden y esta se sirve por hora del evento, y dos instrumentos que cierran
casi a la vez pueden quedar marcados ligeramente fuera de él, así que en esos puntos las dos difieren en una
operación. Los huecos de la cuenta no se atribuyen a un instrumento, así que aquí `gaps` está vacío.

```
GET /v1/live/6TzAPiPpsOWwBLdLBZCxwH/paper/equity?instrument=BTC/USDT

200
{
  "currency": "USDT",
  "instrument": "BTC/USDT",
  "measure": "realisedPnl",
  "points": [
    {"timestamp": 1758330078000, "equity": 10.0},
    {"timestamp": 1758330190000, "equity": 6.0},
    {"timestamp": 1758330310000, "equity": 12.0}
  ],
  "gaps": [],
  "meta": {"inputPointCount": 3, "outputPointCount": 3, "resampled": false, "differential": false, "outMode": "ARRAY"}
}
```

**Con una cuenta por instrumento**, `?instrument=ETH/USDT` no pide una parte de una cuenta compartida: SELECCIONA la
cuenta que es ese instrumento, y la respuesta es la curva propia de esa cuenta, su `equity` (ya incluye sus marcas),
con el `instrument` junto a la `currency` y los `gaps` propios de la cuenta. En su lugar se puede dar `currency` solo
mientras nombre una única cuenta, `measure` no se aplica (un `400`), y con varias cuentas hay que nombrar una.

```
GET /v1/live/6TzAPiPpsOWwBLdLBZCxwH/paper/equity?instrument=ETH/USDT

200
{
  "currency": "USDT",
  "instrument": "ETH/USDT",
  "measure": "equity",
  "points": [
    {"timestamp": 1758330060000, "equity": 999.1},
    {"timestamp": 1758330120000, "equity": 996.5}
  ],
  "gaps": [],
  "meta": {"inputPointCount": 2, "outputPointCount": 2, "resampled": false, "differential": false, "outMode": "ARRAY"}
}
```

**Con lo que mantiene y aún no ha vendido.** `?instrument=ETH/USDT&measure=totalPnl` añade a cada punto el valor no
realizado de la posición abierta del instrumento: un punto en cada operación cerrada (entonces no se mantiene nada,
así que es el PnL realizado acumulado) y en cada marca mientras hay una posición abierta (lo realizado hasta
entonces, más lo que vale la posición en esa marca). La respuesta dice `"measure": "totalPnl"`. El valor por defecto
es `measure=realisedPnl`; `measure` sin `instrument` es un `400`, ya que la curva de una cuenta es `equity` y ya
incluye sus marcas.

```
GET /v1/live/6TzAPiPpsOWwBLdLBZCxwH/paper/equity?instrument=ETH/USDT&measure=totalPnl

200
{
  "currency": "USDT",
  "instrument": "ETH/USDT",
  "measure": "totalPnl",
  "points": [
    {"timestamp": 1758329950000, "equity": -1.0},
    {"timestamp": 1758330010000, "equity": -3.0},
    {"timestamp": 1758330060000, "equity": -3.4},
    {"timestamp": 1758330120000, "equity": -2.15}
  ],
  "gaps": [],
  "meta": {"inputPointCount": 4, "outputPointCount": 4, "resampled": false, "differential": false, "outMode": "ARRAY"}
}
```

Los dos primeros puntos son operaciones cerradas (−1.0, y luego −2.0 más); la posición abierta a las 01:00:25 vale
−0.4 en la marca de las 01:01:00 (−3.0 − 0.4) y +0.85 en la de las 01:02:00 (−3.0 + 0.85).

## Salida: `separate` o `mix`

Con `output: separate` (el valor por defecto), el paper trading queda fuera de las señales de la
ejecución: léelo con las rutas de arriba. Con `output: mix`, cada elemento paper se escribe además en
las señales de la propia ejecución, como `type: paper`, justo después de la señal que lo causó.
Fíltralos con `type`:

```
GET /v1/live/6TzAPiPpsOWwBLdLBZCxwH/signals?type=paper&limit=4

200
{
  "signals": [
    {"type": "paper", "kind": "fill",   "eventTsMs": 1758330010000,
     "instrument": {"exchange": "binance", "segment": "spot", "symbol": "BTC/USDT"},
     "data": {"side": "buy", "orderKind": "market", "price": 84389.41, "amount": 0.00237,
              "counterAmount": 200.0, "feeBase": 0.00000237, "feeQuote": 0.0}, …},
    {"type": "paper", "kind": "trade",  "eventTsMs": 1758330078000,
     "instrument": {"exchange": "binance", "segment": "spot", "symbol": "BTC/USDT"},
     "data": {"side": "long", "entryTsMs": 1758330010000, "enterAmount": 200.0,
              "exitAmount": 199.59, "pnl": -0.41}, …},
    {"type": "paper", "kind": "equity", "eventTsMs": 1758330078000, "instrument": null,
     "data": {"currency": "USDT", "equity": 999.59}, …},
    {"type": "paper", "kind": "kpi",    "eventTsMs": 1758330078000, "instrument": null,
     "data": {"currency": "USDT", "totalTrades": 1, "winRate": 0.0, "pnlTotal": -0.41, …}, …}
  ],
  "availableSinceMs": 1757725212000,
  "_links": {"next": {"href": "/v1/live/6TzAPiPpsOWwBLdLBZCxwH/signals?cursor=…&limit=4&type=paper"}}
}
```

Cada entrada tiene la forma completa de señal descrita en [Ejecución en vivo](live#forma-de-la-señal)
(`v`, `signalId`, `runId`, `stage`, `paramsVersion`, `emittedAtMs`, `order: null`, `regenerated`,
`digest`), abreviada aquí como `…`. `kind` indica qué es el elemento:

| `kind` | cuándo | `instrument` | `data` |
|---|---|---|---|
| `fill` | una orden se llenó | el par | `side` (`buy`/`sell`), `orderKind` (`market`, `limit`, `stop`, `stopTrailing`), `price`, `amount`, `counterAmount`, `feeBase`, `feeQuote` |
| `trade` | una posición se cerró | el par | `side` (`long`/`short`), `entryTsMs`, `enterAmount`, `exitAmount`, `pnl` |
| `equity` | tras cada operación cerrada | `null` | `currency`, `equity` |
| `kpi` | tras cada operación cerrada | `null` | `currency` y los KPIs de [Leer una cuenta](#leer-una-cuenta) |
| `mark` | una vez por minuto de tiempo de mercado mientras hay posiciones abiertas | `null` | `currency`, `equity`, `realisedPnl`, `unrealisedPnl`, `openPositions` (cuántas) y `positions`, una entrada por posición abierta: `instrument`, `base`, `cost`, `markPrice`, `unrealisedPnl` (sus `unrealisedPnl` suman el de la marca) |
| `gap` | posiciones abiertas perdidas en un reinicio | el par | `currency`, `base`, `cost` |

`equity`, `kpi` y `mark` tratan de una cuenta entera, así que su `instrument` es `null` y
`data.currency` nombra la cuenta. `type` se combina con `instrument`:
`?type=paper&instrument=ETH/USDT` devuelve solo los fills, operaciones y huecos de ese par.

Los elementos paper se conservan junto con las señales de la ejecución, bajo la misma ventana móvil,
pero **nunca se empujan por el canal WebSocket**, diga lo que diga `relay`. Para el registro completo
y permanente usa las rutas paper.

## Huecos

La plataforma puede reiniciar una ejecución, por ejemplo al desplegar una versión nueva. Su paper
trading continúa desde su registro: las operaciones cerradas, el PnL realizado, la curva de equity y
los KPIs se conservan, y nada se cuenta dos veces. Las posiciones que estaban **abiertas** en el
reinicio, y cualquier orden pendiente, no se pueden trasladar: cada posición abierta se reporta como
un `gap`, con lo que mantenía, y deja de contarse.

```json
"gaps": [1758333600000]
```

Un hueco no es un punto de la curva: la curva enumera su momento en `gaps`, y el `gaps` de la cuenta los
cuenta. En una ejecución `mix`, la señal correspondiente nombra el par y lo que se mantenía:

```json
{"type": "paper", "kind": "gap", "instrument": {"exchange": "binance", "segment": "spot", "symbol": "ETH/USDT"},
 "data": {"currency": "USDT", "base": 0.05948, "cost": 160.0}, …}
```
