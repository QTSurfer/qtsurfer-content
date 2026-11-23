---
title: "Cambio porcentual"
description: "Cómo el cambio porcentual da el cambio de un valor desde la actualización anterior en porcentaje, cuál es su tamaño típico y cómo usarlo en una estrategia de QTSurfer."
order: 9.02
lastUpdated: '2026-11-22T23:27:04Z'
---

El **cambio porcentual** es cuánto cambió un valor desde la actualización anterior, en porcentaje: 1 es una subida del 1 %. Es la tasa de cambio multiplicada por 100, sin periodo.

Pruébalo en una serie.

<div data-indicator-chart="percentChange"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
cambio porcentual = 100 × (valor − valor anterior) / |valor anterior|
```

Está listo desde la primera actualización, donde da 0, y da 0 siempre que el valor anterior sea 0.

## Cómo leerlo

- **Su tamaño es el de la cadencia.** En las series reales del gráfico el cambio típico, la mediana de su tamaño, es del 1,15 % por barra en días de BTC/USDT, del 0,17 % en horas de BTC/USDT y del 0,15 % en cuartos de hora de ETH/USDT. Un umbral fijado para una no dice nada en otra.
- **Reacciona a una sola actualización**, así que es la medida más ruidosa de un movimiento. Para actuar con él, suavízalo o compáralo con su tamaño habitual.
- **No es el cambio porcentual del ticker.** El que pone un exchange en su ticker cubre su propia ventana, a menudo de 24 horas, y una estrategia ticker lo tiene como `chg`. Este cubre una actualización.

## En una estrategia

```
setup:
  percentChange("pc", "price")
```

Eso registra `pc`. En Java, `.percentChange("pc", "price")` en el builder.

Dale un nombre. Sin él, `percentChange("price")` registra `pchgprice`, y `rateChange("price")` registra `chgprice`: son dos nombres, así que pueden convivir. Evita `chg`, que una estrategia ticker ya registra.

## Relacionado

- [Tasa de cambio](/docs/indicators/change/rateChange): el mismo cambio, como fracción.
- [Tasa de cambio sobre N barras](/docs/indicators/oscillators/roc): el cambio sobre `N` barras, en porcentaje.
- [Volatilidad porcentual](/docs/indicators/volatility/percentVolatility): el tamaño medio de estos cambios.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
