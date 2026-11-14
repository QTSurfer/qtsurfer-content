---
title: "Salida de araña (Chandelier)"
description: "Cómo la salida Chandelier cuelga un stop a un múltiplo del rango verdadero medio por debajo del máximo más alto, y otro por encima del mínimo más bajo, y cómo usarla en una estrategia de QTSurfer."
order: 5.43
lastUpdated: '2026-11-14T12:16:29Z'
---

La **salida Chandelier** (*chandelier exit*), de Chuck LeBeau, cuelga un stop del máximo más alto de las últimas `N` barras, a un múltiplo del [rango verdadero medio](/docs/indicators/volatility/atr) por debajo, para una posición larga; y otro del mínimo más bajo, por encima, para una corta.

Pruébala en una serie y cambia el periodo y el multiplicador.

<div data-indicator-chart="chandelierExit"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
salida larga = máximo más alto de las últimas N barras − multiplicador × ATR(N)
salida corta = mínimo más bajo de las últimas N barras + multiplicador × ATR(N)
```

Los valores por defecto son 22 y 3. El motor rechaza un multiplicador negativo al construir el indicador. La línea principal que registra es la salida larga, y la corta viene a su lado como `ShortExit`. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **Cada línea es un trinquete en una tendencia**: en una subida la salida larga sube con el máximo más alto y no baja mientras el máximo se mantiene. Baja cuando el máximo sale de la ventana o el rango se ensancha.
- **El cierre las rompe a menudo.** En las series reales del gráfico, con los valores por defecto, el cierre está por debajo de la salida larga en del 26 % al 31 % de las barras y por encima de la corta en del 24 % al 28 %.
- **El multiplicador es el número que hay que ajustar**: 3 es el habitual; uno menor saca antes.

## En una estrategia

```
uses pro.chandelierExit
setup:
  chandelierExit(22, 3)
```

`chandelierExit(22, 3)` registra `chand22_3` (la salida larga), con `chand22_3ShortExit` a su lado. En Java la clase es `ChandelierExitRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.trend.pro`, y un grupo la recibe con `indicators.add("chand22_3", new ChandelierExitRTIndicator(22, 3))`.

El periodo y el multiplicador son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [SuperTrend](/docs/indicators/trend/superTrend): un stop que sigue al rango medio y se invierte.
- [Stop de Chande y Kroll](/docs/indicators/trend/chandeKrollStop): otro stop a partir de los extremos y el rango medio.
- [Canal de Donchian](/docs/indicators/bands/donchianChannel): el máximo más alto y el mínimo más bajo de los que cuelga.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
