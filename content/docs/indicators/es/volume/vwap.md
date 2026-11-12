---
title: "Precio medio ponderado por volumen (VWAP)"
description: "Cómo el precio medio ponderado por volumen promedia el precio típico de cada barra desde la primera, ponderado por el volumen, por qué nunca se reinicia y se mueve cada vez más despacio, y cómo usarlo en una estrategia de QTSurfer."
order: 6.2
lastUpdated: '2026-11-12T15:34:29Z'
---

El **precio medio ponderado por volumen** (VWAP, por sus siglas en inglés) es el precio medio pagado desde que empezó la serie: el precio típico de cada barra, ponderado por el volumen negociado en ella.

Pruébalo en una serie. No tiene parámetros, y la línea se dibuja sobre el precio.

<div data-indicator-chart="vwap"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
típico = (máximo + mínimo + cierre) / 3
VWAP   = Σ (típico × volumen) / Σ volumen        desde la primera barra
```

Las sumas van desde la primera barra y **nunca se reinician**: el motor no reinicia el VWAP al empezar una sesión ni un día. El primer valor es el precio típico de la primera barra. Como las sumas no dejan de crecer, cada barra nueva pesa menos y la línea se mueve cada vez más despacio.

## Cómo leerlo

- **Es un promedio acumulado, no móvil.** Cuenta cada barra desde el principio, así que en una serie larga sigue poco al precio.
- **Un precio por encima del VWAP** está por encima de lo pagado de media desde el principio, y uno por debajo está por debajo de esa media.
- **En un precio que no se mueve el VWAP es ese precio.**

## En una estrategia

```
uses pro.vwap
setup:
  vwap()
```

`vwap()` registra `vwap`. En Java, `Pro.on(indicators).vwap()`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Volumen en balance](/docs/indicators/volume/obv): el otro indicador de volumen que no tiene parámetros.
- [Media móvil simple](/docs/indicators/averages/sma): un promedio simple del precio, con ventana.
- [Índice de flujo de dinero](/docs/indicators/volume/mfi): un RSI ponderado por volumen, entre 0 y 100.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
