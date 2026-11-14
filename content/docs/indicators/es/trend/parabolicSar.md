---
title: "SAR parabólico"
description: "Cómo el SAR parabólico dibuja un stop que persigue al precio y se acelera a medida que sigue la tendencia, y se invierte cuando el precio lo toca, y cómo usarlo en una estrategia de QTSurfer."
order: 5.45
lastUpdated: '2026-11-14T12:16:29Z'
---

El **SAR parabólico** (*stop and reverse*), de Welles Wilder, dibuja un stop que persigue al precio más deprisa cuanto más dura la tendencia, y pasa al otro lado cuando el precio lo toca.

Pruébalo en una serie y cambia el paso y el máximo.

<div data-indicator-chart="parabolicSar"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
SAR  = SAR anterior + AF × (EP − SAR anterior)
EP   = el extremo de la tendencia: el máximo más alto en una subida, el mínimo más bajo en una caída
AF   = el factor de aceleración: empieza en el paso, crece el paso con cada EP nuevo, hasta el máximo
```

El paso es 0,02 y el máximo 0,2 por defecto; el motor exige que los dos sean mayores que 0. En una subida el SAR nunca está por encima de los mínimos de las dos últimas barras, y en una caída nunca por debajo de sus máximos. Cuando el precio lo toca, el SAR salta al antiguo `EP`, la tendencia se invierte y `AF` vuelve a empezar. La primera barra fija el SAR en su mínimo, la segunda la tendencia; el gráfico dibuja desde la actualización 2.

## Cómo leerlo

- **Los puntos están bajo el precio en una subida y sobre él en una caída.** En las series reales del gráfico, con los valores por defecto, el cierre está por encima del SAR en del 47 % al 55 % de las barras, y lo cruza de 21 a 26 veces en las 299 barras dibujadas.
- **Es un stop, no un filtro de tendencia.** En un rango se invierte una y otra vez, y cada inversión es una pérdida; el [ADX](/docs/indicators/trend/adx) o el [ratio de eficiencia](/docs/indicators/trend/efficiencyRatio) dicen cuándo hay una tendencia que seguir.
- **El paso y el máximo fijan lo ajustado que es**: un paso mayor cierra la distancia antes e invierte más a menudo.

## En una estrategia

```
uses pro.parabolicSar
setup:
  parabolicSar(0.02, 0.2)
```

`parabolicSar(0.02, 0.2)` registra `psar0.02_0.2`. Su id por defecto lleva un punto, así que cuando una `window` tiene que referirse a él, ponle un nombre: `parabolicSar("sar", 0.02, 0.2)`. En Java la clase es `ParabolicSarRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.trend.pro`, y un grupo la recibe con `indicators.add("psar0.02_0.2", new ParabolicSarRTIndicator(0.02, 0.2))`.

El paso y el máximo son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [SuperTrend](/docs/indicators/trend/superTrend): otro stop que se invierte con la tendencia.
- [Salida Chandelier](/docs/indicators/trend/chandelierExit): un stop que cuelga de los extremos.
- [Índice direccional medio](/docs/indicators/trend/adx): cuán fuerte es la tendencia, para saber cuándo usar un stop así.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
