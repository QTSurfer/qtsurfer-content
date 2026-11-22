---
title: "Oscilador Awesome (AO)"
description: "Cómo el oscilador Awesome toma la distancia entre una media móvil rápida y una lenta del punto medio de cada barra, qué valores toma, y cómo usarlo en una estrategia de QTSurfer."
order: 2.56
lastUpdated: '2026-11-13T21:28:19Z'
---

El **oscilador Awesome** (AO, por sus siglas en inglés), de Bill Williams, es la distancia entre una media simple rápida y una lenta del punto medio de cada barra. Se dibuja como un histograma alrededor de cero.

Pruébalo en una serie y cambia los dos periodos.

<div data-indicator-chart="awesomeOscillator"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
medio = (máximo + mínimo) / 2
AO    = SMA(medio, rápida) − SMA(medio, lenta)        rápida 5, lenta 34 por defecto
```

Las medias simples son las [móviles](/docs/indicators/averages/sma), que toman un valor nuevo en cada actualización, como en el diseño de Williams, así que el histograma cambia en cada barra. El primer valor llega en la actualización `lenta`, la 34 con los valores por defecto, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **La línea de cero es el cruce de las dos medias.** Por encima, la media rápida de los precios medios está sobre la lenta; por debajo, al revés. En las series reales del gráfico cruza el cero de 9 a 12 veces en las 267 barras dibujadas.
- **Está en unidades de precio**, así que no se compara entre instrumentos: va de −12 619 a 11 403 en la diaria BTC/USDT y de −71 a 25 en la de 15 minutos ETH/USDT.
- **Es positivo en del 40 % al 57 % de las barras** de las series reales del gráfico.

## En una estrategia

```
uses pro.awesomeOscillator
setup:
  awesomeOscillator(5, 34)
```

`awesomeOscillator(5, 34)` registra `ao5_34`. En Java la clase es `AwesomeOscillatorRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("ao5_34", new AwesomeOscillatorRTIndicator(5, 34))`.

Los dos periodos son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Oscilador acelerador](/docs/indicators/oscillators/acceleratorOscillator): el impulso de este: su distancia a su propia media.
- [MACD](/docs/indicators/oscillators/macd): la misma idea con medias exponenciales del cierre.
- [Media móvil simple](/docs/indicators/averages/sma): la media con la que se construye, en su modo móvil.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
