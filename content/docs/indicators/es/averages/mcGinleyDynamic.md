---
title: "Dinámica de McGinley"
description: "Cómo la dinámica de McGinley cambia su velocidad según lo lejos que está el precio, moviéndose más deprisa hacia un precio por debajo y más despacio hacia uno por encima, y cómo usarla en una estrategia de QTSurfer."
order: 1.75
lastUpdated: '2026-11-12T18:10:40Z'
---

La **dinámica de McGinley**, de John McGinley, es una media móvil que cambia su velocidad según lo lejos que está el precio: se mueve más deprisa hacia un precio por debajo y más despacio hacia uno por encima.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="mcGinleyDynamic"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
MD = MD anterior + (precio − MD anterior) / (N × (precio / MD anterior)⁴)
```

El primer valor es el primer precio. La cuarta potencia hace la adaptación: con un precio un 10 % por encima de la línea el paso es 0,68 del que da un precio sobre la línea, y con un precio un 10 % por debajo es 1,52. Algunas formulaciones añaden una constante al denominador (0,6 es la habitual); la del motor no tiene ninguna. Da la línea por lista en la primera actualización, así que el gráfico dibuja desde la primera barra.

## Cómo leerla

- **Es lenta, más lenta que una EMA del mismo periodo.** En una subida constante va por detrás del precio unas `N` barras (de 13 a 14,5 con el 14 por defecto, en subidas rectas de 0,5, 2 y 10 por barra), donde una EMA de 14 va 6,5. No cambies una por otra con el mismo periodo.
- **Se inclina hacia las caídas.** La línea baja hasta un precio que cae más deprisa de lo que sube hasta uno que sube.
- **Con su valor por defecto es una de las medias más suaves de esta guía, y una de las más alejadas del precio.** En la serie diaria BTC/USDT del gráfico, con periodo 14 su distancia media al cierre es el 4,7 % del precio frente al 3,1 % de la EMA de 14, y su cambio medio de una barra a otra es el 0,37 % frente al 0,48 %.
- **Tras un salto de 10 aún no ha llegado al nivel nuevo a las 60 barras** (109,8 con periodo 14), donde la EMA de 14 está a menos de 0,01.

## En una estrategia

```
uses pro.mcGinleyDynamic
setup:
  mcGinleyDynamic(14)
```

`mcGinleyDynamic(14)` registra `mcg14`. En Java la clase es `McGinleyDynamicRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.averages.pro`, y un grupo la recibe con `indicators.add("mcg14", new McGinleyDynamicRTIndicator(14))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil exponencial](/docs/indicators/averages/ema): la media exponencial, con una velocidad fija.
- [Media móvil adaptativa de Kaufman](/docs/indicators/averages/kama): otra media que adapta su velocidad, según lo recto que se mueve el precio.
- [Media móvil modificada](/docs/indicators/averages/mma): el suavizado de Wilder, una media exponencial lenta.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
