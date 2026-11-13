---
title: "Oscilador Awesome (AO)"
description: "Cómo el oscilador Awesome toma la distancia entre una media rápida y una lenta del punto medio de cada barra, por qué el histograma del motor se mueve a saltos, y cómo usarlo en una estrategia de QTSurfer."
order: 2.56
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

Las medias simples del motor son las **discretas** por defecto, que mantienen la media de un bloque completo hasta que se completa el siguiente (la [página de la SMA](/docs/indicators/averages/sma) lo explica). Así que el histograma se mueve a saltos: el 77 % de sus barras repite el valor anterior, en las series reales del gráfico, donde una media móvil lo cambiaría en cada barra. El primer valor llega en la actualización `lenta`, la 34 con los valores por defecto, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **La línea de cero es el cruce de las dos medias.** Por encima la media rápida de los precios medios está sobre la lenta, por debajo por debajo. En las series reales del gráfico cruza el cero de 5 a 11 veces en las 267 barras dibujadas.
- **Está en unidades de precio**, así que no se compara entre instrumentos: va de −17 866 a 15 253 en la diaria BTC/USDT y de −102 a 28 en la de 15 minutos ETH/USDT.
- **Es positivo en del 30 % al 59 % de las barras** de las series reales del gráfico.

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
- [Media móvil simple](/docs/indicators/averages/sma): la media discreta con la que se construye, explicada allí.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
