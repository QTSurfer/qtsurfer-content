---
title: "Mínimo"
description: "Cómo el mínimo guarda el valor más bajo desde el inicio, dónde empieza cuando su fuente es un indicador y cómo usarlo en una estrategia de QTSurfer."
order: 10.04
lastUpdated: '2026-11-22T23:27:04Z'
---

El **mínimo** es el valor más bajo visto desde el inicio de la ejecución. Solo baja.

Pruébalo en una serie.

<div data-indicator-chart="min"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
mínimo = min(mínimo, valor)        desde la primera actualización
```

No tiene ventana y empieza con el primer valor que su fuente está lista para dar. Sobre otro indicador se deja fuera el calentamiento: el mínimo de un RSI es lo más bajo que el RSI ha llegado desde que estuvo listo, no el 0 que tiene mientras arranca.

## Cómo leerlo

- **Es un récord, no un canal.** Cuando el precio marca un mínimo, la línea se queda ahí hasta otro más bajo.
- **Sobre un indicador es su lectura más baja**, contada desde la actualización en que el indicador está listo.
- **Para el más bajo de las últimas `N` barras**, usa el [canal de Donchian](/docs/indicators/bands/donchianChannel), que olvida.

## En una estrategia

```
setup:
  min("price")
```

`min("price")` registra `minprice`, y `min("bottom", "price")` lo registra como `bottom`. En Java, `.min("price")` en el builder.

## Relacionado

- [Máximo](/docs/indicators/extremes/max): el valor más alto desde el inicio.
- [Canal de Donchian](/docs/indicators/bands/donchianChannel): los extremos de las últimas `N` barras.
- [RSI](/docs/indicators/oscillators/rsi): un indicador cuya lectura más baja puede guardar un mínimo.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
