---
title: "Subida"
description: "Cómo gain da el tamaño de cada subida y cuenta las subidas seguidas, por qué necesita un nombre y cómo usarlo en una estrategia de QTSurfer."
order: 10.01
lastUpdated: '2026-11-22T19:06:11Z'
---

La **subida** es cuánto subió el valor desde la actualización anterior, en las unidades de lo que lee, y 0 cuando no sube. Junto al valor guarda un contador: cuántas subidas han llegado seguidas.

Pruébala en una serie.

<div data-indicator-chart="gain"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
subida = max(valor − valor anterior, 0)
racha  = subidas seguidas
```

Está lista desde la primera actualización, donde da 0. Una bajada reinicia la racha, y también un valor sin cambios, salvo que el tercer argumento sea `false`: entonces un valor sin cambios conserva la racha sin sumarle.

## Cómo leerla

- **El valor es un importe, la racha es un recuento.** Responden a preguntas distintas: cuánto ha subido ahora y desde cuándo viene subiendo.
- **Sobre una media mide la pendiente.** La subida de una [EMA](/docs/indicators/averages/ema) es mayor que 0 mientras la media sube, y su racha es la edad de esa subida.
- **Subir es habitual.** En las series reales del gráfico algo menos de la mitad de las actualizaciones son subidas, así que una sola dice poco.

## En una estrategia

```
setup:
  gain("gains", "price")
```

Eso registra `gains`, el importe. Dale un nombre: `gain("price")` registra `_gainprice`, y un nombre que empieza por `_` está oculto, así que no se informa con las señales. En Java, `.gain("gains", "price")` en el builder, y la racha es `((GainRTIndicator) indicators.getExisting("gains")).getPeriodCount()`.

## Relacionado

- [Bajada](/docs/indicators/extremes/loss): lo mismo para las bajadas.
- [RSI](/docs/indicators/oscillators/rsi): la subida media frente a la bajada media.
- [Suma](/docs/indicators/extremes/sum): sobre una subida, el total de las subidas desde el inicio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
