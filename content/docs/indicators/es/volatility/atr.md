---
title: "Rango verdadero medio (ATR)"
description: "Cómo el rango verdadero medio mide cuánto se mueve el precio en una barra, huecos incluidos, por qué necesita barras y no un ticker, y cómo usarlo en una estrategia de QTSurfer."
order: 4.1
lastUpdated: '2026-11-12T00:02:30Z'
---

El **rango verdadero medio** (ATR, por sus siglas en inglés), de J. Welles Wilder, mide cuánto se mueve el precio en una barra, contando los huecos entre barras. Está en las unidades del precio y no dice nada de la dirección.

Pruébalo en una serie. Lee barras completas, así que elige una serie kline: en una serie ticker el gráfico no tiene nada que dibujar, y lo dice.

<div data-indicator-chart="atr"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
TR  = max(máximo − mínimo, |máximo − cierre anterior|, |mínimo − cierre anterior|)
ATR = ATR anterior + (TR − ATR anterior) / N
```

El rango verdadero `TR` es el mayor entre el rango propio de la barra y la distancia del cierre anterior al máximo y al mínimo de la barra, así que un hueco cuenta. La primera barra no tiene cierre anterior y su rango es `máximo − mínimo`. El motor arranca la media en la media de los primeros `N` rangos y luego suaviza como hace Wilder, con el peso de `1 / N` de la [MMA](/docs/indicators/averages/mma). Está listo tras `N` barras.

Necesita el máximo, el mínimo y el cierre de cada barra. Un ticker lleva un máximo y un mínimo de 24 horas y no los de una barra, así que con un flujo de tickers el motor emite un aviso y el ATR no dibuja nada.

## Cómo leerlo

- **Es mayor cuando el mercado es más volátil**, y cuenta los huecos que el rango de una barra por sí solo no vería.
- **Está en unidades de precio.** Un valor es grande o pequeño respecto al precio: para comparar instrumentos, divide por el precio, o usa la [volatilidad porcentual](/docs/indicators/volatility/percentVolatility).
- **No tiene dirección.** Dice cuánto se mueve el precio, no hacia dónde.

## En una estrategia

```
setup:
  atr(14)
```

`atr(14)` registra `atr14`. Va en una estrategia `kline`. En Java, `.atr(14)` en el builder.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil modificada](/docs/indicators/averages/mma): el suavizado que usa.
- [Desviación típica](/docs/indicators/volatility/stdDev): otra medida de cuánto se dispersa el precio, a partir de los precios y no de los rangos.
- [Volatilidad porcentual](/docs/indicators/volatility/percentVolatility): el tamaño medio de los cambios, en porcentaje.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
