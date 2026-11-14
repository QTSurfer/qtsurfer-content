---
title: "Facilidad de movimiento (EMV)"
description: "Cómo la facilidad de movimiento dice con qué facilidad se mueve el precio por el volumen que cuesta, promediando el movimiento del punto medio de cada barra sobre su volumen por unidad de rango, y cómo usarla en una estrategia de QTSurfer."
order: 6.43
lastUpdated: '2026-11-14T12:16:29Z'
---

La **facilidad de movimiento** (EMV, por sus siglas en inglés), de Richard Arms, dice con qué facilidad se mueve el precio por el volumen que cuesta: divide el movimiento del punto medio de cada barra por su volumen por unidad de rango, y promedia los últimos `N` valores.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="easeOfMovement"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
distancia = (máximo + mínimo) / 2 − (máximo anterior + mínimo anterior) / 2
caja      = volumen / 10000 / (máximo − mínimo)
EMV₁      = distancia / caja
EMV       = media de los últimos N valores de EMV₁
```

Una barra sin rango o sin volumen cuenta como 0. El primer valor llega en la actualización `N + 1`, y el gráfico dibuja desde ahí. El volumen es el de las barras de la serie; las reales llevan el volumen de la bolsa.

## Cómo leerlo

- **Positivo dice que el precio subió con facilidad, negativo que bajó con facilidad**, y cerca de 0 que costó mucho volumen moverlo. En las series reales del gráfico es positivo en del 34 % al 57 % de las barras.
- **Su escala depende de la unidad del volumen y del precio**, así que un umbral no sirve entre instrumentos: va de −2 544 468 a 1 657 504 en la diaria BTC/USDT y de −221 a 92 en la de 15 minutos ETH/USDT.
- **El divisor 10 000 es el del motor**: solo cambia la escala.

## En una estrategia

```
uses pro.easeOfMovement
setup:
  easeOfMovement(14)
```

`easeOfMovement(14)` registra `eom14`. En Java la clase es `EaseOfMovementRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.volume.pro`, y un grupo la recibe con `indicators.add("eom14", new EaseOfMovementRTIndicator(14))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Volumen en balance](/docs/indicators/volume/obv): el volumen sumado o restado según el signo del cambio.
- [Índice de flujo de dinero](/docs/indicators/volume/mfi): el RSI ponderado por volumen, entre 0 y 100.
- [ATR](/docs/indicators/volatility/atr): cuánto se mueve una barra, sin el volumen.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
