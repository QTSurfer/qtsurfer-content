---
title: "Operadores"
description: "Cómo sumar, restar, multiplicar, limitar y redondear indicadores en una estrategia de QTSurfer, con los nombres que registra cada operador."
order: 11
lastUpdated: '2026-11-24T11:52:27Z'
---

Los operadores construyen un indicador a partir de otros: `add`, `diff`, `mul`, `clamp` y `round`. Cada uno lee indicadores por su nombre, así que regístralos antes, y su resultado es un indicador como cualquier otro: una ventana puede vigilarlo y otro operador puede leerlo. No tienen gráfico propio, porque dibujan lo que se les dé: el demo de abajo muestra cuatro de ellos sobre un par de medias.

| Operador | Qué calcula | Sin nombre propio registra |
| --- | --- | --- |
| `add("a", "b")` | `a + b` | `addab` |
| `diff("a", "b")` | `a − b` | `diffab` |
| `mul("a", "b")` | `a × b` | `mulab` |
| `mul("a", 2)` | `a × 2` | `mula` |
| `clamp("a", 0, 100)` | `a`, mantenido entre 0 y 100 | `clmpa` |
| `round("a", 2)` | `a`, redondeado a 2 decimales | `rounda` |

Todos admiten además el nombre que registran como primer argumento: `diff("gap", "a", "b")` registra `gap`.

## Pruébalos

Elige un operador y mueve los controles. Las dos líneas grises son una [EMA](/docs/indicators/averages/ema) rápida y otra lenta, y la línea de color es lo que registra el operador. Las líneas bajo el gráfico son la estrategia que lo dibuja: cambia un control y cambian con él. Por defecto sale `round` sobre una serie con precios cerca de 100, donde se ven sus escalones.

<div data-indicator-demo="operators"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Las líneas las calcula tu navegador con las propias clases de indicadores del motor, así que son las líneas que lee una estrategia. En una serie con precios de decenas de miles, redondear la distancia a unos pocos decimales no cambia nada que se vea.

## Qué vigilar

- **Da un nombre a cada uno.** El nombre por defecto lleva las entradas y no los números, así que `mul("price", 2)` y `mul("price", 3)` registran los dos `mulprice`, y el segundo que se registra sustituye al primero. El motor avisa en el registro cuando un nombre pasa a leer otro indicador, pero no se detiene.
- **La mitad se redondea hacia arriba**, también bajo cero: 2,5 se redondea a 3 y −2,5 a −2.
- **Están listos cuando lo está lo que leen**, así que un operador sobre una media espera a la media.
- **Una diferencia está en las unidades de sus entradas.** Para comparar instrumentos, usa la [distancia](/docs/indicators/change/distance), que es un porcentaje.

## En una estrategia

```
setup:
  ema(9)
  ema(21)
  diff("gap", "ema9", "ema21")
  round("gapRounded", "gap", 2)
```

Eso registra la separación entre las dos medias y la misma redondeada a dos decimales. En Java son los métodos del mismo nombre en el builder, y `clamp` admite además una condición y el valor que pone cuando se cumple.

Los catálogos los tienen con sus formas: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators).

La comparación de un indicador con un número, que da 1 o 0, no es un operador sino una condición: tiene [su propia página](/docs/indicators/operators/conditions).
