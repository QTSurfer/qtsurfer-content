---
title: "Volatilidad de Yang-Zhang"
description: "Cómo la volatilidad de Yang-Zhang combina el salto entre barras, el movimiento de apertura a cierre y el término de Rogers-Satchell, por barra y sin anualizar, y cómo usarla en una estrategia de QTSurfer."
order: 4.9
---

La **volatilidad de Yang-Zhang**, de Dennis Yang y Qiang Zhang, estima cuánto se mueve el precio en una barra a partir de su apertura, máximo, mínimo y cierre, y cuenta además el salto entre el cierre de una barra y la apertura de la siguiente. Es una combinación de tres varianzas, por barra, como fracción del precio.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="yangZhang"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
salto      = ln(apertura / cierre anterior)        el salto entre barras
día        = ln(cierre / apertura)
k          = 0,34 / (1,34 + (N + 1) / (N − 1))
volatilidad = √( varianza(salto) + k × varianza(día) + (1 − k) × Rogers-Satchell )
```

Las dos varianzas son sobre las últimas `N` barras y son varianzas muestrales, divididas por `N − 1`. El último término es la media de los términos de [Rogers-Satchell](/docs/indicators/volatility/rogersSatchell) sobre las mismas barras. El valor es por barra y no está anualizado; el último argumento, opcional, es un factor de anualización que lo **multiplica**. Necesita el cierre anterior a la primera barra de la ventana, así que el primer valor llega en la actualización `N + 1`, una más tarde que los otros tres estimadores. Un precio que no se mueve da 0.

## Cómo leerla

- **Es la única de las cuatro que cuenta el salto entre barras.** En un mercado que opera sin parar ese salto es pequeño, así que en las series reales del gráfico los cuatro estimadores promedian dentro de un 5 % unos de otros.
- **Los tres términos están ponderados.** El peso `k` de la varianza de apertura a cierre baja al crecer la ventana, y el término de Rogers-Satchell se queda con el resto.

## En una estrategia

```
uses pro.yangZhang
setup:
  yangZhang(20)
```

`yangZhang(20)` registra `yz20`. En Java, `Pro.on(indicators).yangZhang(20)`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Volatilidad de Rogers-Satchell](/docs/indicators/volatility/rogersSatchell): el término dentro de la barra con el que se construye.
- [Volatilidad de Parkinson](/docs/indicators/volatility/parkinson): solo a partir del máximo y el mínimo.
- [Volatilidad de Garman-Klass](/docs/indicators/volatility/garmanKlass): el estimador que añade el cierre frente a la apertura.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
