---
title: "Tasa de cambio (una actualización)"
description: "Cómo la tasa de cambio da el cambio de un valor desde la actualización anterior como fracción, en qué se diferencia de la tasa de cambio sobre N barras y cómo usarla en una estrategia de QTSurfer."
order: 9.01
lastUpdated: '2026-11-22T19:12:13Z'
---

La **tasa de cambio** es cuánto cambió un valor desde la actualización anterior, como fracción de ese valor: 0,01 es una subida del 1 %. No tiene periodo: mira siempre exactamente una actualización atrás.

Pruébala en una serie.

<div data-indicator-chart="rateChange"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
tasa de cambio = (valor − valor anterior) / |valor anterior|
```

Está lista desde la primera actualización, donde da 0, y da 0 siempre que el valor anterior sea 0. El valor absoluto del denominador conserva el signo del movimiento cuando el valor es negativo: de −4 a −2 es 0,5, una subida.

## Cómo leerla

- **No es la [tasa de cambio de los manuales](/docs/indicators/oscillators/roc).** Aquella compara con el valor de hace `N` barras y es un porcentaje. Esta compara con la actualización anterior y es una fracción.
- **Depende de la cadencia.** Una actualización es un tick o una barra, así que el mismo mercado da valores pequeños en segundos y grandes en días.
- **Lee cualquier indicador**, no solo el precio: la tasa de cambio de una [EMA](/docs/indicators/averages/ema) es la pendiente de la media, relativa a su nivel.

## En una estrategia

```
setup:
  rateChange("rc", "price", false)
```

Eso registra `rc`, la fracción. Con `true` en lugar de `false` es el [cambio porcentual](/docs/indicators/change/percentChange). En Java, `.rateChange("rc", "price", false)` en el builder.

Dale un nombre. `rateChange("price")` registra `chgprice`, igual que `percentChange("price")`: el segundo que se registra sustituye al primero. Tampoco lo llames `chg`, porque una estrategia ticker ya registra ese nombre.

## Relacionado

- [Cambio porcentual](/docs/indicators/change/percentChange): el mismo cambio, multiplicado por 100.
- [Tasa de cambio sobre N barras](/docs/indicators/oscillators/roc): el cambio sobre `N` barras, en porcentaje.
- [Volatilidad porcentual](/docs/indicators/volatility/percentVolatility): el tamaño medio de estos cambios.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
