---
title: "Stop de Chande y Kroll"
description: "Cómo el stop de Chande y Kroll dibuja dos líneas de parada a partir de los cierres más alto y más bajo menos y más un múltiplo del rango verdadero medio, y luego toma el extremo de cada una, y cómo usarlo en una estrategia de QTSurfer."
order: 5.42
lastUpdated: '2026-11-14T12:16:29Z'
---

El **stop de Chande y Kroll**, de Tushar Chande y Stanley Kroll, dibuja dos líneas de parada a partir de los extremos de los cierres recientes, desplazadas un múltiplo del [rango verdadero medio](/docs/indicators/volatility/atr), y luego toma el extremo de cada una sobre una segunda ventana.

Pruébalo en una serie y cambia los periodos y el multiplicador.

<div data-indicator-chart="chandeKrollStop"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
primer stop alto = cierre más alto de los últimos periodoStop − multiplicador × ATR(periodoAtr)
primer stop bajo = cierre más bajo de los últimos periodoStop  + multiplicador × ATR(periodoAtr)
StopShort        = el mayor primer stop alto de los últimos periodoFinal
stop long        = el menor primer stop bajo de los últimos periodoFinal                       la línea principal
```

Los valores por defecto son 10, 1, 9 y 9 (periodo del ATR, multiplicador, periodo del stop y periodo final). El motor toma los **cierres** más alto y más bajo, donde algunas descripciones usan los máximos y mínimos de las barras. Rechaza un multiplicador negativo al construir el indicador. El primer valor llega en la actualización `periodoAtr`, y el gráfico dibuja desde ahí. La línea principal que registra el motor es el `stop long`; el gráfico la dibuja a ella y a `StopShort` sobre el precio.

## Cómo leerlo

- **Las dos líneas se cruzan.** La línea principal está en o por encima de `StopShort` solo en del 12 % al 25 % de las barras de las series reales del gráfico: la mayor parte del tiempo la línea `StopShort` es la más alta de las dos.
- **El cierre está por encima de la línea principal en del 54 % al 56 % de las barras** de las series reales del gráfico, y por encima de `StopShort` en del 33 % al 50 %.
- **El multiplicador fija la distancia**: uno mayor aleja las líneas de los cierres.

## En una estrategia

```
uses pro.chandeKrollStop
setup:
  chandeKrollStop(10, 1, 9, 9)
```

`chandeKrollStop(10, 1, 9, 9)` registra `cks10_1_9_9` (el stop long), con `cks10_1_9_9StopShort` a su lado. En Java la clase es `ChandeKrollStopRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.trend.pro`, y un grupo la recibe con `indicators.add("cks10_1_9_9", new ChandeKrollStopRTIndicator(10, 1, 9, 9))`.

Los periodos y el multiplicador son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Salida Chandelier](/docs/indicators/trend/chandelierExit): otro stop a partir de los extremos y el rango medio.
- [SuperTrend](/docs/indicators/trend/superTrend): un stop que sigue al rango medio y se invierte.
- [ATR](/docs/indicators/volatility/atr): el rango por el que se desplazan los stops.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
