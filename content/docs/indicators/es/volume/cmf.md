---
title: "Flujo de dinero de Chaikin (CMF)"
description: "Cómo el flujo de dinero de Chaikin mide cuánto del volumen de las últimas N barras se compró y cuánto se vendió, juzgado por dónde cerró cada barra dentro de su rango, de -1 a 1, y cómo usarlo en una estrategia de QTSurfer."
order: 6.4
lastUpdated: '2026-11-12T15:34:29Z'
---

El **flujo de dinero de Chaikin** (CMF, por sus siglas en inglés), de Marc Chaikin, mide cuánto del volumen de las últimas `N` barras se compró y cuánto se vendió, juzgado por dónde cerró cada barra dentro de su rango. Va de −1 a 1.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="cmf"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
multiplicador = ((cierre − mínimo) − (máximo − cierre)) / (máximo − mínimo)        −1 en el mínimo, 1 en el máximo
CMF           = Σ (multiplicador × volumen) / Σ volumen                            sobre las últimas N barras
```

Una barra sin rango tiene un multiplicador de 0. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **Lee el cierre dentro de la barra, no el cambio desde el último cierre.** Una barra que cierra en su máximo cuenta como compra, haya hecho lo que haya hecho frente a la barra anterior.
- **Vale 1 cuando cada barra cierra en su máximo y −1 cuando cada barra cierra en su mínimo**, y 0 en un precio que no se mueve.
- **Se queda bien dentro de sus límites.** En las series reales del gráfico no pasa nunca de 0,5 en ninguna dirección.

## En una estrategia

```
uses pro.cmf
setup:
  cmf(20)
```

`cmf(20)` registra `cmf20`. En Java, `Pro.on(indicators).cmf(20)`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Índice de flujo de dinero](/docs/indicators/volume/mfi): un RSI ponderado por volumen, entre 0 y 100.
- [Volumen en balance](/docs/indicators/volume/obv): el total acumulado del volumen.
- [ATR](/docs/indicators/volatility/atr): el rango de una barra, lo otro que mira el multiplicador.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
