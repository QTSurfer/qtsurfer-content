---
title: "Volatilidad realizada"
description: "Cómo la volatilidad realizada toma la desviación típica de los últimos rendimientos logarítmicos, por barra, con pesos iguales, y cómo usarla en una estrategia de QTSurfer."
order: 4.95
---

La **volatilidad realizada** es la desviación típica de los últimos `N` rendimientos logarítmicos, por barra, con pesos iguales.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="realizedVolatility"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
r  = ln(precio / precio anterior)
RV = √( Σ (r − media r)² / N )            sobre los últimos N rendimientos
```

La desviación divide por `N`. `N` rendimientos necesitan `N + 1` precios, así que el primer valor llega en la actualización `N + 1`, y la línea lee 0 antes. El motor puede multiplicar el resultado por un factor de anualización (`√252` para barras diarias).

## Cómo leerla

- **Es una volatilidad por barra, como fracción del precio**, y vale 0 en un precio que sube el mismo porcentaje cada barra, porque los rendimientos no varían.
- **Se parece a la volatilidad EWMA**: en las series reales del gráfico las medianas son 0,020, 0,003 y 0,003 para la realizada, frente a 0,021, 0,004 y 0,003 para la EWMA. La diferencia es cómo olvidan: una ventana suelta un rendimiento antiguo de golpe, la EWMA poco a poco.
- **Va de 0,009 a 0,049 en la diaria BTC/USDT** con periodo 20.

## En una estrategia

```
uses pro.realizedVolatility
setup:
  realizedVolatility(20)
```

`realizedVolatility(20)` registra `rvol20`. En Java la clase es `RealizedVolatilityRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro.volatility`, y un grupo la recibe con `indicators.add("rvol20", new RealizedVolatilityRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Volatilidad EWMA](/docs/indicators/volatility/ewmaVolatility): la misma estimación con pesos que decaen exponencialmente.
- [Desviación típica](/docs/indicators/volatility/stdDev): la dispersión de los precios, en unidades de precio.
- [Ratio de Sharpe](/docs/indicators/risk/sharpeRatio): el rendimiento medio sobre esta misma dispersión.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
