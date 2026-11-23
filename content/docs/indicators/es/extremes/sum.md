---
title: "Suma"
description: "Cómo la suma acumula todos los valores desde el inicio, sobre qué fuentes tiene sentido y cómo usarla en una estrategia de QTSurfer."
order: 10.05
lastUpdated: '2026-11-22T23:27:04Z'
---

La **suma** es el total de todos los valores desde el inicio de la ejecución.

Pruébala en una serie, sobre el precio, que muestra cómo acumula.

<div data-indicator-chart="sum"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
suma = suma anterior + valor        desde la primera actualización
```

No tiene ventana y suma todos los valores que recibe, incluidos los del calentamiento de su fuente.

## Cómo leerla

- **Sobre el precio dice poco**: crece en cada actualización y mide sobre todo lo larga que es la ejecución.
- **Sobre un flujo sí dice algo.** La suma de una [subida](/docs/indicators/extremes/gain) es el total de las subidas desde el inicio, y la suma del volumen es lo negociado.
- **Para la suma de los últimos `N` valores**, usa una [SMA](/docs/indicators/averages/sma) con su tercer argumento a `false`, multiplicada por `N`.

## En una estrategia

```
setup:
  gain("gains", "price")
  sum("gains")
```

`sum("gains")` registra `sumgains`, el total de las subidas. El gráfico de arriba ejecuta `sum("price")`, que registra `sumprice`. En Java, `.sum("gains")` en el builder.

## Relacionado

- [Subida](/docs/indicators/extremes/gain) y [bajada](/docs/indicators/extremes/loss): valores que merece la pena sumar.
- [SMA](/docs/indicators/averages/sma): la media de los últimos `N` valores.
- [OBV](/docs/indicators/volume/obv): una suma del volumen con el signo del movimiento.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
