---
title: "Ratio de colas"
description: "Cómo el ratio de colas compara el percentil 95 de los últimos rendimientos con el valor absoluto del 5, la cola derecha frente a la izquierda, y cómo usarlo en una estrategia de QTSurfer."
order: 8.07
---

El **ratio de colas** compara la cola derecha de los últimos `N` rendimientos con la izquierda: el percentil 95 sobre el valor absoluto del 5. Por encima de 1 los mejores rendimientos son mayores que los peores.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="tailRatio"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
r             = ln(precio / precio anterior)                          el rendimiento de cada barra
ratio de colas = percentil 95 de r / |percentil 5 de r|                sobre los últimos N rendimientos
```

Los percentiles interpolan linealmente, como en el [percentil móvil](/docs/indicators/statistics/rollingPercentile). Una ventana cuyo percentil 5 es 0 lee 0. Necesita al menos 2 periodos. `N` rendimientos necesitan `N + 1` precios, así que el primer valor llega en la actualización `N + 1`, y la línea lee 0 antes. El motor admite otros percentiles (`withPercentiles(upper, lower)` en Java), y las formas de QTScript con dos números extra los pasan (consulta el catálogo).

## Cómo leerlo

- **Por encima de 1 la cola derecha es más larga que la izquierda**, por debajo lo es la izquierda. Alternar subida y bajada con la misma proporción lee exactamente 1.
- **No está acotado, y puede ser negativo.** Cuando el propio percentil 95 está por debajo de 0, como en una ventana que solo cae, el ratio es negativo: un precio que cae un 1 % cada barra lee −1, y uno que sube un 1 % cada barra lee 1.
- **Se apoya en pocos rendimientos.** Con periodo 20 los percentiles 95 y 5 están entre los dos mayores y los dos menores rendimientos, así que un rendimiento grande mueve el ratio: en las series reales del gráfico va de 0,18 a 9,3, y su mediana es de 0,95 a 1,05.
- **Un precio que no se mueve lee 0**, porque su percentil 5 es 0.

## En una estrategia

```
uses pro.tailRatio
setup:
  tailRatio(20)
```

`tailRatio(20)` registra `tail20`. En Java la clase es `TailRatioRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, y un grupo la recibe con `indicators.add("tail20", new TailRatioRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Percentil móvil](/docs/indicators/statistics/rollingPercentile): el percentil con el que se construye, del precio.
- [Ratio omega](/docs/indicators/risk/omegaRatio): ganancias sobre pérdidas, como sumas.
- [Curtosis](/docs/indicators/statistics/kurtosis): cuán pesadas son las colas de una ventana.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
