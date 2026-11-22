---
title: "Bajada"
description: "Cómo loss da el tamaño de cada bajada como número positivo y cuenta las bajadas seguidas, por qué necesita un nombre y cómo usarlo en una estrategia de QTSurfer."
order: 10.02
---

La **bajada** es cuánto bajó el valor desde la actualización anterior, como número positivo en las unidades de lo que lee, y 0 cuando no baja. Junto al valor guarda un contador: cuántas bajadas han llegado seguidas.

Pruébala en una serie.

<div data-indicator-chart="loss"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
bajada = max(valor anterior − valor, 0)
racha  = bajadas seguidas
```

Está lista desde la primera actualización, donde da 0. Una subida reinicia la racha, y también un valor sin cambios, salvo que el tercer argumento sea `false`: entonces un valor sin cambios conserva la racha sin sumarle.

## Cómo leerla

- **Nunca es negativa.** Una bajada de 3 marca 3, así que una regla la compara con un umbral positivo.
- **El valor es un importe, la racha es un recuento**: cuánto ha bajado ahora y desde cuándo viene bajando.
- **Es la bajada de una actualización**, no la pérdida de una posición ni una caída desde un máximo.

## En una estrategia

```
setup:
  loss("losses", "price")
```

Eso registra `losses`, el importe. Dale un nombre: `loss("price")` registra `_lossprice`, y un nombre que empieza por `_` está oculto, así que no se informa con las señales. En Java, `.loss("losses", "price")` en el builder, y la racha es `((LossRTIndicator) indicators.getExisting("losses")).getPeriodCount()`.

## Relacionado

- [Subida](/docs/indicators/extremes/gain): lo mismo para las subidas.
- [RSI](/docs/indicators/oscillators/rsi): la subida media frente a la bajada media.
- [Caída máxima](/docs/indicators/risk/maxDrawdown): la peor caída desde un máximo.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
