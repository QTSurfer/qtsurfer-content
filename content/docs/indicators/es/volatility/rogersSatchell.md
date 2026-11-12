---
title: "Volatilidad de Rogers-Satchell"
description: "Cómo la volatilidad de Rogers-Satchell estima cuánto se mueve el precio en una barra a partir de su apertura, máximo, mínimo y cierre, construida para que una deriva constante no la infle, y cómo usarla en una estrategia de QTSurfer."
order: 4.8
lastUpdated: '2026-11-12T13:54:17Z'
---

La **volatilidad de Rogers-Satchell**, de L. C. G. Rogers y Stuart Satchell, estima cuánto se mueve el precio en una barra a partir de su apertura, máximo, mínimo y cierre, de una manera que una deriva constante del precio no la infla. Es una volatilidad por barra, como fracción del precio.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="rogersSatchell"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
volatilidad = √( media sobre las últimas N barras de  ln(máximo / cierre) × ln(máximo / apertura) + ln(mínimo / cierre) × ln(mínimo / apertura) )
```

`ln` es el logaritmo natural. El valor es por barra y no está anualizado; el último argumento, opcional, es un factor de anualización que lo **multiplica**. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí. Un precio que no se mueve da 0.

## Cómo leerla

- **Está construida para medir el movimiento dentro de la barra alrededor de una deriva.** Una subida o una caída constante del precio no cuenta como volatilidad, que es lo que añadirían los estimadores hechos con el cierre frente a la apertura.
- **No ve los saltos entre barras**, ya que cada término usa la apertura, el máximo, el mínimo y el cierre de una sola barra.
- **Los cuatro estimadores OHLC se parecen en estas series**: en las series reales del gráfico promedian dentro de un 5 % unos de otros.

## En una estrategia

```
uses pro.rogersSatchell
setup:
  rogersSatchell(20)
```

`rogersSatchell(20)` registra `rs20`. En Java, `Pro.on(indicators).rogersSatchell(20)`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Volatilidad de Garman-Klass](/docs/indicators/volatility/garmanKlass): el estimador que añade el cierre frente a la apertura.
- [Volatilidad de Yang-Zhang](/docs/indicators/volatility/yangZhang): usa esta para su término dentro de la barra, y cuenta el salto entre barras.
- [Volatilidad de Parkinson](/docs/indicators/volatility/parkinson): solo a partir del máximo y el mínimo.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
