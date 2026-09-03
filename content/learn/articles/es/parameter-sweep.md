---
title: Barrido de parámetros
description: Aprende a explorar el espacio de parámetros de una estrategia con muestreo en cuadrícula, aleatorio y por hipercubo latino, a leer una clasificación sin seleccionar ruido y a usar las vistas de sensibilidad para encontrar regiones estables.
order: 7
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

Un **barrido de parámetros** ejecuta la misma estrategia muchas veces, cada una con una combinación
distinta de valores configurables, y recoge los resultados uno junto a otro. El propósito no es
encontrar la mejor combinación. Es aprender cómo responde la estrategia a sus parámetros: cuáles
importan, qué rangos son estables y dónde el rendimiento es una coincidencia de los datos.

Un backtest aislado responde «¿cómo le fue a esta configuración?». Un barrido responde «¿cómo se
comporta esta idea?», que es una pregunta más útil y más peligrosa, porque la propia búsqueda produce
ganadoras tanto si la idea funciona como si no.

## Definir el espacio

Cada parámetro barrido es un **eje**, expresado como un rango numérico con un paso o como una lista
explícita de valores. La **cuadrícula** es el producto cartesiano de todos los ejes, así que su tamaño
se multiplica:

```text
rsiPeriod:      7 … 28, step 1     → 22 values
useTrendFilter: [true, false]      →  2 values
                                     44 combinations
```

Añadir un tercer eje con diez valores convierte 44 en 440. Añadir un cuarto lo convierte en miles. La
cuadrícula crece geométricamente mientras los datos históricos no, así que la mayoría de esos ensayos
prueban los mismos episodios de mercado con etiquetas ligeramente distintas.

Tres muestreadores abordan ese crecimiento de forma distinta:

- **Cuadrícula** evalúa todas las combinaciones. Exhaustivo, fácil de razonar y el único muestreador
  cuyos resultados tienen vecinos bien definidos para el análisis de mesetas.
- **Aleatorio** extrae un número fijo de combinaciones de manera uniforme. Barato e insesgado, pero
  aparecen agrupaciones y huecos por azar.
- **Hipercubo latino (LHS)** también extrae un número fijo de muestras, pero estratifica cada eje de
  modo que cada región de cada parámetro queda cubierta una vez. Ofrece una cobertura similar a la de
  la cuadrícula al coste del muestreo aleatorio, lo que lo hace adecuado para una primera pasada sobre
  un espacio grande.

El **objetivo** decide cómo se ordenan los ensayos: rentabilidad ajustada al riesgo (ratio de Sharpe o
de Sortino), beneficio bruto o drawdown máximo. El objetivo es una lente, no un veredicto; el mismo
barrido puede reordenarse por otro objetivo sin volver a ejecutar nada.

## Leer una clasificación

La lista ordenada es la vista menos informativa de un barrido, porque la parte alta de cualquier
clasificación es donde se concentra el sesgo de selección. Léela teniendo en cuenta lo siguiente.

- **Los vecinos importan más que el ganador.** Un punto cuyos vecinos también puntúan bien está en una
  meseta; un punto cuyos vecinos puntúan mal es un pico. Las mesetas sobreviven a los cambios del
  mercado; los picos, no.
- **El número de operaciones fija el tamaño de la muestra.** Un ensayo con quince operaciones tiene
  quince observaciones, por largo que sea el rango de fechas. Su puntuación es una estadística de
  muestra pequeña.
- **Cada ensayo cuenta contra el ganador.** Cuantas más combinaciones se prueben, mejor parece la
  mejor solo por azar. Consulta [Sobreajuste](overfitting) para ver cómo crece esa línea base.
- **Los ensayos abortados no son malos resultados.** Una ejecución que falló no midió nada. Tratarla
  como un mal resultado inventa evidencia contra un valor de parámetro que nunca se probó.

## Sensibilidad: qué ejes importaron

Una clasificación dice qué punto ganó. No puede decir si un eje marcó alguna diferencia. Dos vistas
agregadas responden a eso:

- Una **marginal** colapsa el resto de ejes: para cada valor de un parámetro, agrega todos los
  ensayos que lo usaron. Una marginal plana significa que el eje fue irrelevante en el rango barrido.
  Cuando la mejor, la media y la peor puntuación de un valor discrepan mucho, ese valor solo funciona
  en compañía concreta, lo que es una interacción escondida tras un único número.
- Un **mapa de calor** hace lo mismo sobre un par de ejes, de modo que la interacción se hace visible
  directamente. El número de superficies es cuadrático en el número de ejes, otra razón para barrer
  pocos ejes a la vez.

La sensibilidad es lo que convierte un barrido de una búsqueda en un experimento. La conclusión no es
«usa `rsiPeriod = 16`»; es «`rsiPeriod` entre 14 y 18 se comporta igual, y el filtro de tendencia es
de donde sale el resultado».

## Una secuencia de trabajo

1. **Empieza grueso.** Rangos amplios, pasos grandes o una muestra LHS de unas pocas docenas de
   puntos. El objetivo es la forma de la respuesta, no el óptimo.
2. **Lee las marginales.** Descarta los ejes planos. Estrecha los rangos a las regiones que aguantan.
3. **Refina una vez.** Un segundo barrido sobre la región superviviente con pasos más finos. Cada
   refinamiento adicional sobre los mismos datos es otra ronda de ajuste dentro de muestra.
4. **Prefiere la meseta.** Elige un punto dentro de una región estable, no la mejor fila aislada.
5. **Valida fuera de muestra.** Ejecuta el barrido con [pliegues walk-forward](walk-forward-analysis),
   o reserva un periodo que el barrido nunca haya visto, antes de creer ningún número.

## Errores habituales

- **Barrerlo todo a la vez.** Seis ejes producen una cuadrícula que nadie puede interpretar y una
  línea base de pruebas múltiples que nadie puede superar.
- **Pasos más finos de lo que los datos pueden resolver.** Un periodo que se comporta idénticamente
  de 14 a 18 no necesita cinco ensayos; necesita uno y una nota de que la región es plana.
- **Cambiar el objetivo hasta que algo gane.** Reordenar es una herramienta para entender, no para
  encontrar la métrica bajo la cual el favorito queda mejor.
- **Refinar repetidamente sobre la misma ventana.** Grueso, refinado, refinado otra vez: cada pasada
  consume más información de la muestra, y la ganadora final se ha elegido con toda ella.
- **Ignorar el umbral de operaciones.** Una puntuación espectacular con nueve operaciones es una
  historia sobre nueve operaciones.

## Los barridos de parámetros en QTSurfer

Un barrido se ejecuta contra el mismo conjunto de datos preparado que un backtest simple, de modo que
todos los ensayos ven exactamente los mismos datos, instrumento y rango de fechas. La petición declara
un eje por propiedad de la estrategia, como rango o como lista de valores; elige un muestreador
(`grid`, `random` o `lhs`), un objetivo (`sharpe`, `sortino`, `pnl` o `maxdd`) y, opcionalmente, una
semilla para la reproducibilidad. La respuesta confirma el número de ensayos antes de que se ejecute
ninguno, y una petición idéntica no encola un duplicado.

La clasificación usa por defecto la **ordenación por meseta**: las filas se ordenan por el objetivo de
la peor ejecución de su vecindario inmediato, de modo que un pico no gana por defecto. Cada fila
informa de su puntuación bruta, su puntuación de meseta, su número de vecinos, su número de
operaciones, si quedó por debajo del umbral de operaciones y un **ratio de Sharpe deflactado** que
corrige por el número de vectores probados. Un barrido terminado informa además de la **probabilidad
de sobreajuste del backtest** sobre toda la cuadrícula.

El endpoint de **sensibilidad** devuelve marginales y mapas de calor por pares agregados a partir de
las filas de ensayo almacenadas, sin volver a ejecutar nada, y funciona sobre un barrido aún en curso.
Las ejecuciones abortadas se excluyen en todo momento. Las curvas de equity se retienen solo para los
ensayos seleccionados, y cancelar un barrido conserva todas las filas ya completadas.

En la aplicación, este es el flujo de los **backtests simulados**: define un barrido reducido,
ejecútalo y envía después un refinamiento que lo acote como una nueva fase del mismo experimento.

## Conceptos relacionados

- [Sobreajuste](overfitting) — por qué la parte alta de una clasificación está sesgada, y cuánto.
- [Análisis walk-forward](walk-forward-analysis) — validación secuencial fuera de muestra de un barrido.
- [Backtesting](backtesting) — el experimento de una sola ejecución que un barrido repite.
- Glosario: [Barrido de parámetros](/learn/glossary/parameter-sweep), [Ratio de Sharpe
  deflactado](/learn/glossary/dsr), [Probabilidad de sobreajuste del backtest](/learn/glossary/pbo).
- Guía para desarrolladores: [Barridos de parámetros](/docs/developers/api/backtest_sweep).
