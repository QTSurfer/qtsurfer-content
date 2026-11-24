---
title: "Condiciones"
description: "Cómo las condiciones isLessThan, isGreatThan y las demás comparan un indicador con un número y dan 1 o 0, cómo las lee una estrategia con isValue y cómo usarlas en una estrategia de QTSurfer."
order: 11.01
---

Una **condición** compara un indicador con un número y da 1 mientras la comparación se cumple y 0 mientras no. Hay seis, una por comparación: `isEqual`, `isNotEqual`, `isGreatThan`, `isGreatOrEqual`, `isLessThan` e `isLessOrEqual`.

Prueba una abajo. La línea sobre el precio es una [EMA](/docs/indicators/averages/ema), la línea de trazos es el número con el que se compara, y las barras bajo el gráfico son la condición: altas mientras se cumple.

<div data-indicator-demo="conditions"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comportan las condiciones, no para saber cuánto gana una estrategia. Las líneas las calcula tu navegador con las propias clases de indicadores del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
isLessThan("name", "a", x)       1 si a <  x, si no 0
isLessOrEqual("name", "a", x)    1 si a <= x, si no 0
isGreatThan("name", "a", x)      1 si a >  x, si no 0
isGreatOrEqual("name", "a", x)   1 si a >= x, si no 0
isEqual("name", "a", x)          1 si a == x, si no 0
isNotEqual("name", "a", x)       1 si a != x, si no 0
```

Cada una recibe tres argumentos: el nombre que registra, el indicador que lee y el número con el que compara. Su resultado es un indicador como cualquier otro: una ventana puede vigilarlo y un [operador](/docs/indicators/operators) puede leerlo. Está lista cuando lo está el indicador que lee.

## Cómo leerla

- **Una condición y su contraria suman 1.** `isLessThan` e `isGreatOrEqual` nunca valen 1 a la vez, ni tampoco `isEqual` e `isNotEqual`.
- **La igualdad de un precio casi nunca se cumple.** La media de un precio es un número decimal que rara vez es exactamente el que elegiste, así que `isEqual` casi siempre da 0 e `isNotEqual` casi siempre 1. Usa `isLessOrEqual` o `isGreatOrEqual` para atrapar un nivel.
- **Léela con `isValue`, no con `value`.** En el cuerpo de una ventana, `isValue("name")` es `true` cuando la condición se cumple, y `false` cuando no se cumple o mientras el indicador que lee aún no tiene valor. En ese tramo `value("name")` ya puede leer 1, así que una regla que lo pruebe se dispara antes de tiempo. `isValue` acepta el nombre de cualquier indicador, no solo el de una condición: es `true` cuando el indicador tiene un valor y ese valor no es 0.
- **Un número, no un indicador.** El tercer argumento es un número. Para comparar dos indicadores, toma su [diferencia](/docs/indicators/operators) y compárala con 0.

## En una estrategia

```
setup:
  rsi(14)
  isLessThan("oversold", "rsi14", 30)
  window oversold m1 {
    if (isValue("oversold")) emitBuy(price);
  }
```

Eso registra `oversold`, que se cumple mientras el RSI esté por debajo de 30, y la lee con `isValue` en el cuerpo de una ventana. La estrategia completa, con el estado que evita comprar dos veces, está en [Una condición: `isValue`](/docs/strategies/qtscript#una-condición-isvalue).

En Java son los métodos del mismo nombre del builder, y el listener también tiene `isValue`. Una condición también se puede hacer a partir de una función con `isTrue("calm", "rsi14", v -> v > 40 && v < 60)`, que solo Java puede escribir: mira [Condiciones e `isValue`](/docs/strategies/java/strategy_coding#condiciones-e-isvalue).

## Relacionado

- [Operadores](/docs/indicators/operators): `add`, `diff`, `mul`, `clamp` y `round`, que construyen un indicador a partir de otros.
- [RSI](/docs/indicators/oscillators/rsi): el indicador que más se compara con un nivel.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) y [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
