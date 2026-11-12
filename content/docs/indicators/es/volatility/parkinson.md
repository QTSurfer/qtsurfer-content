---
title: "Volatilidad de Parkinson"
description: "Cómo la volatilidad de Parkinson estima cuánto se mueve el precio en una barra solo a partir de su máximo y su mínimo, por barra y sin anualizar, y cómo usarla en una estrategia de QTSurfer."
order: 4.6
lastUpdated: '2026-11-12T13:54:17Z'
---

La **volatilidad de Parkinson**, de Michael Parkinson, estima cuánto se mueve el precio en una barra solo a partir de su máximo y su mínimo. Es una volatilidad por barra, como fracción del precio: 0,02 es un 2 %.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="parkinson"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
volatilidad = √( Σ ln(máximo / mínimo)² / (4 × N × ln 2) )        sobre las últimas N barras
```

`ln` es el logaritmo natural. El valor es por barra y no está anualizado. El último argumento, opcional, es un factor de anualización que **multiplica** el valor, así que para llevar una volatilidad por barra a un año, pasa la raíz cuadrada del número de barras de un año. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí. Un precio que no se mueve da 0.

## Cómo leerla

- **Usa el rango entero de cada barra**, no solo dónde cerró la barra.
- **No ve los saltos entre barras.** Lee el máximo y el mínimo de cada barra, así que un hueco entre un cierre y la apertura siguiente no cuenta. La [volatilidad de Yang-Zhang](/docs/indicators/volatility/yangZhang) es la única de las cuatro que sí lo cuenta.
- **Los cuatro estimadores OHLC se parecen en estas series.** En las series reales del gráfico promedian dentro de un 5 % unos de otros, porque estos mercados operan sin parar y hay poco salto entre barras.

## En una estrategia

```
uses pro.parkinson
setup:
  parkinson(20)
```

`parkinson(20)` registra `park20`. En Java, `Pro.on(indicators).parkinson(20)`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Volatilidad de Garman-Klass](/docs/indicators/volatility/garmanKlass): añade la apertura y el cierre al rango.
- [Volatilidad de Yang-Zhang](/docs/indicators/volatility/yangZhang): cuenta además el salto entre barras.
- [ATR](/docs/indicators/volatility/atr): el rango de una barra, en unidades de precio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
