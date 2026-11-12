---
title: "Caída máxima (drawdown)"
description: "Cómo la caída máxima guarda la mayor caída desde un máximo hasta un mínimo posterior desde el inicio, como fracción del máximo, por qué nunca baja, y cómo usarla en una estrategia de QTSurfer."
order: 8.05
lastUpdated: '2026-11-12T20:44:51Z'
---

La **caída máxima** (*maximum drawdown*) es la mayor caída desde un máximo hasta un mínimo posterior desde que arrancó el indicador, como fracción del máximo: 0,25 es una caída del 25 %.

Pruébala en una serie. No tiene parámetros, y la línea se dibuja en su propio panel, de 0 a 1.

<div data-indicator-chart="maxDrawdown"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
máximo      = el precio más alto hasta ahora
caída       = (máximo − precio) / máximo                 la caída desde el máximo ahora
caídaMáxima = la mayor caída hasta ahora
```

El primer valor llega en la primera actualización, y lee 0. No rueda sobre una ventana: guarda la mayor caída desde el inicio, así que una vez ocurrida una caída el valor solo puede crecer, y dos ejecuciones que empiezan en barras distintas leen valores distintos. 1 sería una pérdida total. El motor registra la caída del momento a su lado, `maxDdCurrent`, que vuelve a 0 en cada nuevo máximo; el gráfico dibuja las dos.

## Cómo leerla

- **Solo crece.** Con los precios 100, 120, 90, 130, 130, 130 lee 0, 0, 0,25, 0,25, 0,25, 0,25: se queda en el 25 % después de que el precio se haya recuperado y superado su máximo anterior.
- **La caída actual es la otra línea.** Dice a cuánto está el precio de su máximo ahora, y vale 0 en cada barra que hace un máximo nuevo.
- **En un precio que se reduce a la mitad lee 0,5.** Al final de las series reales del gráfico la caída máxima es el 38,7 % en la diaria BTC/USDT, el 9,7 % en la horaria y el 10,2 % en la de 15 minutos ETH/USDT.

## En una estrategia

```
uses pro.maxDrawdown
setup:
  maxDrawdown()
```

`maxDrawdown()` registra `maxDd`, con la caída del momento a su lado como `maxDdCurrent`. En Java la clase es `MaxDrawdownRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, y un grupo la recibe con `indicators.add("maxDd", new MaxDrawdownRTIndicator())`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

## Relacionado

- [Ratio de Calmar](/docs/indicators/risk/calmarRatio): el rendimiento por unidad de la mayor caída de una ventana.
- [Índice de úlcera](/docs/indicators/risk/ulcerIndex): la profundidad y la duración de las caídas de una ventana.
- [Valor en riesgo](/docs/indicators/statistics/valueAtRisk): la pérdida que no se espera que supere una barra.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
