---
title: "Rango verdadero medio normalizado (NATR)"
description: "Cómo el rango verdadero medio normalizado da el rango verdadero medio como porcentaje del cierre, de modo que se compara entre instrumentos y precios, y cómo usarlo en una estrategia de QTSurfer."
order: 4.91
lastUpdated: '2026-11-13T23:26:15Z'
---

El **rango verdadero medio normalizado** (NATR, por sus siglas en inglés) es el [rango verdadero medio](/docs/indicators/volatility/atr) como porcentaje del cierre, de modo que se compara entre instrumentos y entre niveles de precio.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="natr"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
NATR = 100 × ATR(N) / cierre
```

El ATR es el del motor, el de su página. Un cierre de 0 da 0. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **Es un porcentaje del precio**, así que un 3 se lee igual en cualquier instrumento: la barra media se mueve el 3 % del cierre.
- **En las series reales del gráfico**, con periodo 20, va del 2,1 % al 5,9 % en la diaria BTC/USDT, del 0,24 % al 0,86 % en la horaria y del 0,17 % al 0,77 % en la de 15 minutos ETH/USDT: la temporalidad fija la escala.
- **Se mueve con el precio además de con el rango**: un precio que sube baja el NATR aunque el ATR no cambie.

## En una estrategia

```
uses pro.natr
setup:
  natr(20)
```

`natr(20)` registra `natr20`. En Java la clase es `NatrRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.volatility.pro`, y un grupo la recibe con `indicators.add("natr20", new NatrRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [ATR](/docs/indicators/volatility/atr): el mismo rango, en unidades de precio.
- [Volatilidad porcentual](/docs/indicators/volatility/percentVolatility): el tamaño medio de los cambios, en porcentaje.
- [Volatilidad de Yang-Zhang](/docs/indicators/volatility/yangZhang): una volatilidad por barra a partir de la apertura, el máximo, el mínimo y el cierre.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
