---
title: "Oscilador acelerador (AC)"
description: "Cómo el oscilador acelerador toma la distancia entre el oscilador Awesome y su propia media, de modo que gira antes que él, por qué el histograma del motor se mueve a saltos, y cómo usarlo en una estrategia de QTSurfer."
order: 2.57
lastUpdated: '2026-11-13T21:28:19Z'
---

El **oscilador acelerador** (AC, por sus siglas en inglés), de Bill Williams, es la distancia entre el [oscilador Awesome](/docs/indicators/oscillators/awesomeOscillator) y su propia media de 5 barras: lo deprisa que cambia el impulso. Se dibuja como un histograma alrededor de cero.

Pruébalo en una serie. No tiene parámetros: los periodos son 5, 34 y 5.

<div data-indicator-chart="acceleratorOscillator"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
medio = (máximo + mínimo) / 2
AO    = SMA(medio, 5) − SMA(medio, 34)
AC    = AO − SMA(AO, 5)
```

Las medias simples del motor son las **discretas** por defecto, que mantienen la media de un bloque completo hasta que se completa el siguiente (la [página de la SMA](/docs/indicators/averages/sma) lo explica). Así que el histograma se mueve a saltos: el 77 % de sus barras repite el valor anterior, en las series reales del gráfico. El primer valor llega en la actualización 34, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **Gira antes que el oscilador Awesome**, porque mide su cambio. En las series reales del gráfico cruza el cero de 19 a 24 veces en las 267 barras dibujadas, frente a de 5 a 11 del oscilador Awesome.
- **Está en unidades de precio**, así que no se compara entre instrumentos: va de −11 387 a 14 993 en la diaria BTC/USDT y de −34 a 59 en la de 15 minutos ETH/USDT.
- **Es positivo en del 46 % al 60 % de las barras** de las series reales del gráfico.

## En una estrategia

```
uses pro.acceleratorOscillator
setup:
  acceleratorOscillator()
```

`acceleratorOscillator()` registra `acc`. No tiene formas con parámetros. En Java la clase es `AcceleratorOscillatorRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("acc", new AcceleratorOscillatorRTIndicator())`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Oscilador Awesome](/docs/indicators/oscillators/awesomeOscillator): la distancia entre dos medias, que este deriva.
- [MACD](/docs/indicators/oscillators/macd): un histograma de la distancia entre una línea y su media, con medias exponenciales.
- [Media móvil simple](/docs/indicators/averages/sma): la media discreta con la que se construye, explicada allí.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
