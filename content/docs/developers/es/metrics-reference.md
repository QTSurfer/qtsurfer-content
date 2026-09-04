---
title: Referencia de métricas
description: Cada campo que informa un resultado de backtest, barrido o walk-forward — su definición, unidades, cómo lo calcula el motor y cuándo está presente.
order: 5.9
lastUpdated: '2026-09-04T10:18:11Z'
---

Los resultados llevan dos familias de números con convenciones distintas. Los campos cuyo nombre
termina en `Percent` o `Pct` son porcentajes en escala `0`–`100`. Los campos que son tasas por su
propio nombre — `winRate`, `cagr` — y los ratios ajustados al riesgo son ratios simples: `0.15`
significa quince por ciento, `0.58` significa cincuenta y ocho por ciento. Nada se escala dos
veces, y nada lleva el signo de porcentaje.

Todas las métricas son **netas de comisiones** según la configuración de la ejecución, y todas se
calculan a partir de **operaciones cerradas**: una posición todavía abierta cuando termina la
sesión no contribuye con nada.

## Resultados de una ejecución simple

Presentes en `results` en cuanto la estrategia ha cerrado al menos una operación.

| Campo | Unidades | Definición |
|---|---|---|
| `pnlTotal` | Moneda de cotización | Suma del beneficio y la pérdida realizados en cada operación cerrada. |
| `pnlTotalPercent` | Porcentaje, escala `0`–`100` (negativo si hay pérdidas) | `pnlTotal` como porcentaje del capital inicial. `0` cuando el capital inicial es `0`. |
| `totalTrades` | Recuento | Operaciones cerradas. Es el tamaño de muestra detrás de cualquier otra métrica. |
| `winRate` | Ratio, `0.0`–`1.0` | Proporción de operaciones cerradas cuyo beneficio es **estrictamente positivo**. Una operación que empata cuenta como pérdida. |
| `sharpeRatio` | Ratio | Media de los retornos porcentuales por operación dividida por su desviación típica. Ver más abajo. |
| `sortinoRatio` | Ratio | Media de los retornos porcentuales por operación dividida por su desviación a la baja. Ver más abajo. |
| `cagr` | Ratio | Tasa de crecimiento anual compuesto de la equity, de la primera a la última operación. Ver más abajo. |
| `maxDrawdown` | Moneda de cotización | Mayor caída de máximo a mínimo de la curva de equity. |
| `maxDrawdownPercent` | Porcentaje, escala `0`–`100` | La misma caída relativa al máximo desde el que se produjo. |
| `iops` | Operaciones por segundo | Rendimiento de la ejecución: operaciones de instrumento procesadas por segundo. Una cifra de rendimiento del sistema, no una métrica de la estrategia. |

### Cómo se calculan los ratios

**Retornos por operación.** Cada operación cerrada aporta un retorno, su beneficio realizado como
porcentaje del capital comprometido en ella, con precisión completa. Los ratios de Sharpe y de
Sortino son estadísticas de esa serie, no de retornos por periodo de calendario:

```text
sharpeRatio  = mean(r) / stdev(r)
sortinoRatio = mean(r) / downsideDeviation(r)
```

- Ninguno de los dos ratios está **anualizado**, y ninguno resta una tasa libre de riesgo.
  Compáralos con otros resultados de QTSurfer, no con cifras diarias anualizadas de otros sitios.
- Ambos devuelven `0` cuando se cerraron menos de dos operaciones. `sharpeRatio` devuelve `0`
  cuando todas las operaciones tuvieron el mismo retorno; `sortinoRatio` devuelve `0` cuando
  ninguna operación perdió dinero — una estrategia sin operaciones perdedoras muestra un Sortino
  de cero, no infinito.
- `stdev` es la desviación típica poblacional de la serie.

**CAGR.** Se calcula a partir de la trayectoria de la equity, no de los retornos por operación:

```text
years = (lastTradeTime − firstTradeTime) / 365.25 days
cagr  = (finalEquity / initialCapital) ^ (1 / years) − 1
```

Las ventanas de menos de un año deliberadamente **no se anualizan**: extrapolar unas pocas semanas
a un año produce magnitudes sin sentido, así que para `years < 1` el campo es igual a la
rentabilidad de equity simple, `finalEquity / initialCapital − 1`, que es la misma cantidad que
informa `pnlTotalPercent` en su propia escala. Las dos fórmulas coinciden exactamente en un año.
`cagr` vale `0` cuando no hay capital inicial positivo, no ha pasado tiempo entre operaciones, o
la equity llegó a cero o por debajo.

**Drawdown.** Se rastrea sobre la curva de equity conforme se cierran operaciones: el máximo en
curso, y la caída más profunda desde él en moneda y como fracción de ese máximo. Consulta el
[artículo sobre drawdown](/learn/articles/drawdown) para el cálculo y cómo leerlo.

## Curva de equity

`results.equityCurve` está presente bajo la misma condición que las métricas. Su primer punto es
un ancla en el inicio del backtest con el capital inicial; cada punto posterior se registra cuando
se cierra una operación, así que `equity = initialCapital + cumulativePnl` en ese momento. Los
puntos son valor de la cuenta en moneda de cotización, nunca porcentajes. Las formas, las
transformaciones y los metadatos que dicen qué se sirvió realmente están documentados en [Curvas
de equity](/docs/developers/api/equity_curves).

## Avisos

`results.notices` lista los diagnósticos que emitió el motor, cada uno con un `level`, un
`code`, un `message` y una `provenance`. El campo está **ausente cuando no se emitió nada** — es
el único lugar donde el silencio es una respuesta real. También se emiten avisos en ejecuciones
fallidas y abortadas, y una ejecución sin operaciones normalmente explica aquí por qué.
`noticesTruncated` informa de cuántos se descartaron por encima del límite de cincuenta, y está
ausente cuando no hubo ninguno.

## Filas de la clasificación de un barrido

Cada ensayo de un barrido informa de su propia copia de las métricas de ejecución más los campos
que hacen comparables a los ensayos:

| Campo | Unidades | Definición |
|---|---|---|
| `runIx` | Índice | Posición determinista en la cuadrícula expandida; estable entre shards y ordenaciones. |
| `rank` | Posición | Presente solo en la vista clasificada. |
| `params` | Mapa | El vector de parámetros de este ensayo. |
| `sharpe`, `sortino`, `pnl`, `pnlPct`, `cagr`, `maxDdPct`, `trades`, `winRate` | Como arriba | Los resultados propios del ensayo. `pnlPct` y `maxDdPct` están en escala `0`–`100`; `cagr` y `winRate` son ratios. |
| `plateauScore` | Mismas unidades que el objetivo | El objetivo de la ejecución **peor** en el vecindario inmediato de este punto. La clave de ordenación por defecto. |
| `neighbourCount` | Recuento | Vecinos que existían para la puntuación de meseta. `0` significa que la puntuación no está respaldada, no confirmada. Léelos siempre juntos. |
| `deflatedSharpe` | Probabilidad, `0.0`–`1.0` | Probabilidad de que el Sharpe de este ensayo refleje una ventaja real y no la mejor tirada entre los vectores probados, teniendo en cuenta la longitud de la muestra, la asimetría y la curtosis. Por encima de aproximadamente `0.95` sobrevive a la corrección; igual o por debajo de `0.5` es indistinguible del mejor de un montón de ensayos aleatorios. |
| `belowTradeFloor` | Booleano | `trades` cayó por debajo del `minTradeFloor` del barrido (treinta por defecto). La fila permanece en los resultados. |
| `aborted` | Booleano | La ejecución lanzó una excepción y no midió nada. Las filas abortadas se excluyen de los agregados de sensibilidad. |
| `runtimeMs` | Milisegundos | Tiempo de reloj del ensayo. |

A nivel de barrido, `pbo` es la **probabilidad de sobreajuste del backtest** sobre toda la
cuadrícula, calculada mediante validación cruzada combinatoria simétrica, con `pboSplits` como
número de particiones usadas. Por encima de aproximadamente `0.5`, la selección está eligiendo
ruido. Ambos están presentes solo cuando termina el último shard, y solo para un barrido sin
walk-forward.

El endpoint de sensibilidad agrega el objetivo por valor de parámetro como `best`, `mean` y
`worst`, con `count` ejecuciones detrás de cada punto. Excluye las ejecuciones abortadas, y puede
leerse mientras el barrido sigue en curso.

## Resultados walk-forward

Un barrido walk-forward informa de una fila por pliegue completado en lugar de una por punto de
parámetros:

| Campo | Definición |
|---|---|
| `foldIx` | Posición del pliegue, del más antiguo al más reciente. |
| `inSampleFrom`, `inSampleTo`, `outOfSampleTo` | Índices de ventana dentro de la sesión preparada. |
| `params` | El vector que ganó la optimización dentro de muestra del pliegue. |
| `inSampleSharpe` | El Sharpe de ese ganador en la ventana sobre la que se eligió — el número halagador, ahí para compararlo con el campo siguiente. |
| `outOfSample` | Una fila completa de la clasificación, puntuada sobre la ventana siguiente, no vista — el número honesto. |
| `vectorsRun` | Vectores evaluados dentro de muestra antes de elegir al ganador. |

`paramDrift`, a nivel de barrido, es la distancia media normalizada en la cuadrícula entre
ganadores de pliegues consecutivos. Se **omite, no vale cero**, hasta que al menos dos pliegues
han terminado, porque cero es en sí misma una lectura con significado. Los barridos walk-forward
no informan de puntuación de meseta, Sharpe deflactado ni PBO: esas correcciones existen para
deflactar ganadores dentro de muestra, y las puntuaciones fuera de muestra no necesitan
deflactarse.

## Leer los números juntos

- `totalTrades` primero. Todo ratio es una estadística de muestra pequeña cuando el número de
  operaciones es bajo, y `belowTradeFloor` existe para hacerlo visible en los barridos.
- `sharpeRatio` junto con `winRate`, `maxDrawdownPercent` y la curva de equity. Un ratio alto en
  una curva que ganó todo su dinero en un único episodio es una historia sobre ese episodio.
- `cagr` junto con la duración de la sesión. Por debajo de un año es una rentabilidad simple, no
  una tasa de crecimiento.
- `deflatedSharpe` y `pbo` antes que `rank`. La parte alta de una clasificación es donde vive el
  sesgo de selección.

## Páginas relacionadas

- [Modelo de ejecución de un backtest](/docs/developers/backtest-execution-model) — cuándo
  aparece cada parte de un resultado.
- [Barridos de parámetros](/docs/developers/api/backtest_sweep) — los endpoints detrás de los
  campos del barrido.
- Learn: [Ratio de Sharpe](/learn/articles/sharpe-ratio), [Drawdown](/learn/articles/drawdown),
  [Sobreajuste](/learn/articles/overfitting), [Análisis
  walk-forward](/learn/articles/walk-forward-analysis).