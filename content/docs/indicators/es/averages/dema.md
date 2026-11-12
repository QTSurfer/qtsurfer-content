---
title: "Media móvil exponencial doble (DEMA)"
description: "Cómo la media móvil exponencial doble combina dos medias exponenciales para recortar el retraso de una sola, lo que cuesta en rebasamiento, y cómo usarla en una estrategia de QTSurfer."
order: 1.71
lastUpdated: '2026-11-12T18:10:40Z'
---

La **media móvil exponencial doble** (DEMA, por sus siglas en inglés), de Patrick Mulloy, combina dos medias exponenciales para recortar el retraso de una sola. Es la versión de dos medias de la [TEMA](/docs/indicators/averages/tema).

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="dema"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
EMA1 = EMA(precio)
EMA2 = EMA(EMA1)
DEMA = 2 × EMA1 − EMA2        las dos con el mismo periodo
```

`EMA2` va por detrás de `EMA1` tanto como `EMA1` va por detrás del precio, así que restarla una vez más cancela ese retraso. El motor arranca las dos medias en su primera entrada, así que las primeras barras de la línea arrastran ese arranque. Da la DEMA por lista tras `N` actualizaciones, y el gráfico dibuja desde ahí.

## Cómo leerla

- **Sobre una recta no se retrasa nada.** Una vez arrancada lee el precio exacto, mientras que una EMA del mismo periodo va por detrás `(N − 1) / 2` barras.
- **Lo paga en rebasamiento.** Tras un salto de 10 en el precio, la DEMA de periodo 20 llega a 111,2 antes de asentarse en 110, un 12 % más allá del movimiento; tras una caída de 10 baja a 98,8. Una EMA nunca pasa del precio.
- **Queda más cerca del precio que una EMA del mismo periodo, y es más nerviosa.** En la serie diaria BTC/USDT del gráfico, con periodo 20 su distancia media al cierre es el 2,5 % del precio frente al 3,8 % de la EMA, y su cambio medio de una barra a otra es el 0,58 % frente al 0,40 %.

## En una estrategia

```
uses pro.dema
setup:
  dema(20)
```

`dema(20)` registra `dema20`. En Java la clase es `DemaRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.averages.pro`, y un grupo la recibe con `indicators.add("dema20", new DemaRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil exponencial triple](/docs/indicators/averages/tema): la misma idea con tres medias: aún menos retraso, más rebasamiento.
- [Media móvil exponencial](/docs/indicators/averages/ema): la media exponencial simple con la que se construye.
- [Media móvil de Hull](/docs/indicators/averages/hma): otra media construida para recortar el retraso, a partir de medias ponderadas.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
