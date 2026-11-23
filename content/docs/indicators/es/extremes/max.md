---
title: "Máximo"
description: "Cómo el máximo guarda el valor más alto desde el inicio, por qué no tiene ventana y cómo usarlo en una estrategia de QTSurfer."
order: 10.03
lastUpdated: '2026-11-22T23:27:04Z'
---

El **máximo** es el valor más alto visto desde el inicio de la ejecución. Solo sube.

Pruébalo en una serie.

<div data-indicator-chart="max"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
máximo = max(máximo, valor)        desde la primera actualización
```

No tiene ventana y empieza con el primer valor que recibe. Sobre otro indicador ese primer valor es de su calentamiento, y cuenta.

## Cómo leerlo

- **Es un récord, no un canal.** Cuando el precio marca un máximo, la línea se queda ahí hasta otro más alto, tarde lo que tarde.
- **Depende de dónde empieza la ejecución.** La misma fecha marca otro máximo en una ejecución que empezó antes.
- **Para el más alto de las últimas `N` barras**, usa el [canal de Donchian](/docs/indicators/bands/donchianChannel), que olvida.

## En una estrategia

```
setup:
  max("price")
```

`max("price")` registra `maxprice`, y `max("top", "price")` lo registra como `top`. En Java, `.max("price")` en el builder.

## Relacionado

- [Mínimo](/docs/indicators/extremes/min): el valor más bajo desde el inicio.
- [Canal de Donchian](/docs/indicators/bands/donchianChannel): los extremos de las últimas `N` barras.
- [Caída máxima](/docs/indicators/risk/maxDrawdown): la peor caída desde este máximo.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
