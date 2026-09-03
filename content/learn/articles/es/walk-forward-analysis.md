---
title: Análisis walk-forward
description: Aprende cómo el análisis walk-forward valida un barrido de parámetros fuera de muestra con pliegues secuenciales, qué revela la deriva de parámetros y cómo leer con honestidad los resultados por pliegue.
order: 8
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

El **análisis walk-forward** comprueba si los parámetros que ganaron un barrido siguen funcionando
con datos con los que no fueron elegidos. La ventana histórica se divide en pliegues (*folds*)
secuenciales. En cada pliegue, la cuadrícula completa de parámetros se optimiza sobre una ventana
**dentro de muestra**, y solo la ganadora se ejecuta después sobre la ventana **fuera de muestra**
inmediatamente posterior. Las puntuaciones fuera de muestra, recogidas a lo largo de los pliegues,
son la estimación honesta de lo que entrega el procedimiento de optimización.

La palabra clave es *procedimiento*. El walk-forward no valida un conjunto de parámetros. Valida el
acto de elegir uno, repetido a lo largo del tiempo, que es lo que hace en realidad un trader que
reoptimiza periódicamente.

## Cómo funcionan los pliegues

Toma una sesión preparada de datos históricos y un número de pliegues `k`. Cada pliegue posee un
tramo contiguo de la sesión, dividido según una proporción dentro de muestra:

```text
fold 0:  [ in-sample ──────────── ][ out-of-sample ]
fold 1:                            [ in-sample ──────────── ][ out-of-sample ]
fold 2:                                                      [ in-sample ──────────── ][ out ]
```

Con una proporción dentro de muestra del 66 %, dos tercios de la ventana de cada pliegue se usan para
elegir a la ganadora y el tercio restante para puntuarla. Los pliegues se ordenan del más antiguo al
más reciente, y cada ventana fuera de muestra queda estrictamente después de la ventana dentro de
muestra sobre la que se eligió, de modo que ninguna información fluye hacia atrás.

### Coste

Cada pliegue ejecuta toda la cuadrícula dentro de muestra y después una ejecución más, la ganadora,
fuera de muestra:

```text
total runs = folds × (grid size + 1)
```

Una cuadrícula de 22 puntos con 4 pliegues son 92 ejecuciones; una de 500 puntos con 4 pliegues son
2.004 ejecuciones donde el barrido plano eran 500. Por eso el walk-forward es un paso deliberado
después de un barrido, no un valor por defecto en todos ellos.

## Qué leer

Un resultado walk-forward tiene tres partes, y cada una responde a una pregunta distinta.

1. **Dentro de muestra frente a fuera de muestra, por pliegue.** La puntuación dentro de muestra de la
   ganadora de un pliegue siempre es halagadora, porque cualquier cuadrícula produce una ganadora de
   buen aspecto sobre los datos con los que se eligió. La distancia entre esa puntuación y la de fuera
   de muestra es el tamaño del efecto de selección. Una distancia pequeña significa que la
   optimización encontró algo duradero; una grande, que encontró el ruido de esa ventana.
2. **Consistencia entre pliegues.** Puntuaciones fuera de muestra positivas y parecidas entre
   pliegues indican un procedimiento que funciona en distintos regímenes. Un pliegue excelente y tres
   pobres significan que el resultado depende de un único episodio de mercado.
3. **Deriva de parámetros.** Compara los parámetros ganadores de pliegues consecutivos. Ganadoras que
   se mantienen en la misma región de la cuadrícula indican que el parámetro significa algo. Ganadoras
   que saltan por la cuadrícula en cada pliegue indican que el barrido está reajustando ruido cada vez,
   y que ningún conjunto de parámetros habría sobrevivido.

Una medida de deriva necesita al menos dos pliegues que comparar, y por eso dos es el mínimo
estructural, no una elección de ajuste. También necesita que los pliegues hayan terminado: un valor de
deriva ausente significa que aún no ha podido calcularse, y eso es distinto de una deriva de cero, que
es una lectura con significado.

## Errores habituales

- **Pocos pliegues.** Una ventana fuera de muestra es una observación. Hacen falta varios pliegues
  para ver si las puntuaciones fuera de muestra concuerdan entre sí.
- **Ventanas fuera de muestra demasiado cortas para operar.** Una ventana que produce cuatro
  operaciones puntúa a su ganadora sobre cuatro eventos. El número de pliegues y la proporción dentro
  de muestra deben dejar a cada ventana fuera de muestra suficientes operaciones como para significar
  algo.
- **Reajustar tras leer el resultado.** Ajustar la cuadrícula, el objetivo o la estrategia después de
  ver las puntuaciones fuera de muestra convierte esas ventanas en datos dentro de muestra. El
  siguiente walk-forward necesita datos que el anterior nunca tocó.
- **Leer la media fuera de muestra como rendimiento esperado en vivo.** Es la mejor estimación
  disponible, y sigue siendo una estimación a partir de una única trayectoria histórica con sus propios
  regímenes.
- **Comparar la salida walk-forward con la de un barrido plano.** Miden cosas distintas. Un barrido
  plano ordena puntos de parámetros; el walk-forward puntúa un procedimiento de optimización. Ninguno
  sustituye al otro.

## El walk-forward en QTSurfer

El walk-forward es una opción de un barrido de parámetros. Añadir un bloque `walkForward` con el
número de pliegues y, opcionalmente, el porcentaje dentro de muestra (66 % por defecto, entre `10` y
`90`) convierte el barrido en pliegues secuenciales sobre la misma sesión preparada. Omitir el bloque
deja el barrido sin cambios.

La respuesta de aceptación confirma el plan de pliegues, incluido el número total de ejecuciones,
antes de que termine ningún pliegue, de modo que un cliente puede distinguir un barrido walk-forward de
uno plano mientras consulta el estado. Una petición que exceda el presupuesto de ejecuciones del
servidor se rechaza de entrada en lugar de ejecutarse parcialmente.

Los resultados llegan pliegue a pliegue, del más antiguo al más reciente. Cada pliegue informa de los
límites de su ventana, del vector de parámetros que ganó su optimización dentro de muestra, del ratio
de Sharpe dentro de muestra de esa ganadora, del número de vectores evaluados y de una fila completa
fuera de muestra con las mismas métricas que cualquier entrada de la clasificación: Sharpe, Sortino,
beneficio, CAGR, drawdown máximo, número de operaciones y tasa de acierto.

A lo largo de los pliegues, `paramDrift` informa de la distancia normalizada media entre ganadoras
consecutivas en la cuadrícula. Se omite, no vale cero, hasta que al menos dos pliegues han terminado.

En un barrido walk-forward, la clasificación pasa a tener una fila por pliegue completado, la ganadora
fuera de muestra del pliegue, en lugar de una fila por punto de parámetros. No se informa de
puntuación de meseta, ratio de Sharpe deflactado ni probabilidad de sobreajuste del backtest: esas
correcciones existen para deflactar ganadoras dentro de muestra, y las puntuaciones fuera de muestra ya
son el número honesto.

## Conceptos relacionados

- [Barrido de parámetros](parameter-sweep) — la búsqueda que el walk-forward valida.
- [Sobreajuste](overfitting) — el fallo que el walk-forward está diseñado para destapar.
- [Backtesting](backtesting) — el experimento de una sola ejecución detrás de cada pliegue.
- Glosario: [Barrido de parámetros](/learn/glossary/parameter-sweep), [Ratio de
  Sharpe](/learn/glossary/sharpe-ratio).
- Guía para desarrolladores: [Barridos de parámetros, validación walk-forward](/docs/developers/api/backtest_sweep#walk-forward-validation).

## Lecturas adicionales

- Pardo, R. (2008). *The Evaluation and Optimization of Trading Strategies*, 2.ª edición. Wiley.
  La referencia estándar sobre la metodología walk-forward.
