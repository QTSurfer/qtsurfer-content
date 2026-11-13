---
title: "Fuerza alcista y bajista"
description: "Cómo la fuerza alcista y la bajista dan lo lejos que están el máximo y el mínimo de cada barra de una media exponencial del cierre, en unidades de precio, y cómo usarlas en una estrategia de QTSurfer."
order: 2.59
lastUpdated: '2026-11-13T21:28:19Z'
---

La **fuerza alcista** y la **fuerza bajista** (*bull power* y *bear power*), de Alexander Elder, dicen lo lejos que están el máximo y el mínimo de cada barra de una media exponencial del cierre: hasta dónde empujaron los compradores, y hasta dónde los vendedores.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="bullBearPower"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
Alcista = máximo − EMA(cierre, N)
Bajista = mínimo − EMA(cierre, N)
```

El motor registra la suma de las dos como línea principal, `bbp13`, que no se dibuja: el gráfico dibuja `Bull` y `Bear`. La media es la [EMA](/docs/indicators/averages/ema), de 13 barras por defecto, y el primer valor llega en la actualización `N`, desde donde dibuja el gráfico.

## Cómo leerla

- **La fuerza alcista suele estar por encima de cero y la bajista por debajo**, porque el máximo de una barra suele estar sobre la media y su mínimo bajo ella. En las series reales del gráfico, con periodo 13, la fuerza alcista está por encima de 0 en del 64 % al 72 % de las barras y la bajista por debajo de 0 en del 70 % al 77 %.
- **Están en unidades de precio**, así que no se comparan entre instrumentos.
- **Una fuerza bajista que sube por encima de cero**, o una alcista que baja por debajo, dice que una barra entera, con su máximo y su mínimo, se ha movido a un lado de la media.

## En una estrategia

```
uses pro.bullBearPower
setup:
  bullBearPower(13)
```

`bullBearPower(13)` registra `bbp13`, con `bbp13Bull` y `bbp13Bear` a su lado. En Java la clase es `BullBearPowerRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("bbp13", new BullBearPowerRTIndicator(13))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil exponencial](/docs/indicators/averages/ema): la media desde la que se miden el máximo y el mínimo.
- [Balance de poder](/docs/indicators/oscillators/balanceOfPower): quién ganó cada barra, de −1 a 1.
- [ATR](/docs/indicators/volatility/atr): cuánto se mueve una barra, en unidades de precio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
