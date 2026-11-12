---
title: "Índice de canal de materias primas (CCI)"
description: "Cómo el CCI mide la distancia del precio a su media en unidades de la desviación habitual, a qué lo aplica el motor y cómo usarlo en una estrategia de QTSurfer."
order: 2.3
lastUpdated: '2026-11-12T00:02:30Z'
---

El **índice de canal de materias primas** (CCI, por sus siglas en inglés), de Donald Lambert, mide a qué distancia está el precio de su media reciente, en unidades de la distancia a la que suele estar. No tiene un rango fijo: oscila alrededor de cero.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="cci"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
CCI = (precio − SMA) / (0,015 × MAD)
```

`SMA` es la media móvil simple de los últimos `N` precios y `MAD` la desviación media absoluta de esos precios respecto a ella. La constante `0,015` es la de Lambert. Un precio que no se mueve tiene una `MAD` de cero, y el motor da 0 en ese caso.

Los libros lo aplican al precio típico, `(máximo + mínimo + cierre) / 3`. El motor lo aplica al precio que recibe: el cierre de una barra, o el último precio de un ticker. El motor lo da por listo tras `N` actualizaciones, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **Los niveles de 100 y −100 son convenciones.** En las series reales del gráfico cerca de tres valores de cada cinco caen dentro de ellos, con el CCI del motor sobre el cierre, así que un valor fuera de ellos no es raro.
- **Cruzar el cero es el precio cruzando su media.** El signo dice a qué lado de su media reciente está el precio, y el tamaño dice a qué distancia.

## En una estrategia

```
setup:
  cci(20)
```

`cci(20)` registra `cci20`. En Java, `.cci(20)` en el builder.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [RSI](/docs/indicators/oscillators/rsi): el otro oscilador, con un rango fijo.
- [Media móvil simple](/docs/indicators/averages/sma): la media frente a la que el CCI mide el precio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
