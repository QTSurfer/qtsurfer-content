---
title: "Volatilidad de Garman-Klass"
description: "Cómo la volatilidad de Garman-Klass estima cuánto se mueve el precio en una barra a partir de su apertura, máximo, mínimo y cierre, por barra y sin anualizar, y cómo usarla en una estrategia de QTSurfer."
order: 4.7
---

La **volatilidad de Garman-Klass**, de Mark Garman y Michael Klass, estima cuánto se mueve el precio en una barra a partir de su apertura, máximo, mínimo y cierre. Es una volatilidad por barra, como fracción del precio.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="garmanKlass"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
volatilidad = √( media sobre las últimas N barras de  0,5 × ln(máximo / mínimo)² − (2 ln 2 − 1) × ln(cierre / apertura)² )
```

`ln` es el logaritmo natural. El valor es por barra y no está anualizado; el último argumento, opcional, es un factor de anualización que lo **multiplica**. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí. Un precio que no se mueve da 0.

## Cómo leerla

- **Mira dónde cerró la barra frente a dónde abrió, además de su rango.**
- **No ve los saltos entre barras.** Cada término usa la apertura, el máximo, el mínimo y el cierre de una sola barra, así que un hueco entre un cierre y la apertura siguiente no cuenta.
- **Los cuatro estimadores OHLC se parecen en estas series**: en las series reales del gráfico promedian dentro de un 5 % unos de otros.

## En una estrategia

```
uses pro.garmanKlass
setup:
  garmanKlass(20)
```

`garmanKlass(20)` registra `gk20`. En Java, `Pro.on(indicators).garmanKlass(20)`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Volatilidad de Parkinson](/docs/indicators/volatility/parkinson): solo a partir del máximo y el mínimo.
- [Volatilidad de Rogers-Satchell](/docs/indicators/volatility/rogersSatchell): un estimador construido para que una deriva constante no lo infle.
- [Volatilidad de Yang-Zhang](/docs/indicators/volatility/yangZhang): cuenta además el salto entre barras.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
