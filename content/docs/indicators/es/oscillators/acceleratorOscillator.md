---
title: "Oscilador acelerador (AC)"
description: "Cómo el oscilador acelerador toma la distancia entre el oscilador Awesome y su propia media, de modo que gira antes que él, por qué sus cuatro primeros valores aún no son válidos, y cómo usarlo en una estrategia de QTSurfer."
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

Las medias simples son las [móviles](/docs/indicators/averages/sma), que toman un valor nuevo en cada actualización, como en el diseño de Williams. El primer valor llega en la actualización 34, y el gráfico dibuja desde ahí. **Los cuatro primeros valores son un pico del calentamiento**: la media del AO todavía conserva valores de antes de que el AO estuviera listo. En la diaria BTC/USDT el primero es 13 264, el triple del más alto de los que siguen. El AC es el de los manuales desde la actualización 38, así que deja fuera de una regla los cuatro anteriores.

## Cómo leerlo

- **Gira antes que el oscilador Awesome**, porque mide su cambio. En las series reales del gráfico, desde la actualización 38, cruza el cero de 20 a 32 veces en 263 barras, frente a de 9 a 12 veces en 267 del oscilador Awesome.
- **Está en unidades de precio**, así que no se compara entre instrumentos: desde la actualización 38 va de −3569 a 4314 en la diaria BTC/USDT y de −16 a 11 en la de 15 minutos ETH/USDT.
- **Es positivo en del 49 % al 56 % de esas barras** de las series reales del gráfico.

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
- [Media móvil simple](/docs/indicators/averages/sma): la media con la que se construye, en su modo móvil.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
