---
title: "Transformada de Fisher"
description: "Cómo la transformada de Fisher sitúa el precio en su rango reciente, lo suaviza y estira los extremos con la tangente hiperbólica inversa, acotada a unos 3,8, y cómo usarla en una estrategia de QTSurfer."
order: 2.50
---

La **transformada de Fisher**, de John Ehlers, sitúa el precio en su rango reciente, lo suaviza y estira los extremos con la tangente hiperbólica inversa, de modo que los puntos de giro destaquen.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="fisherTransform"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
x       = 2 × (precio − mínimo) / (máximo − mínimo) − 1        sobre los últimos N precios, acotado a [−0,999, 0,999]
v       = 0,33 × x + 0,67 × v anterior                          el suavizado
Fisher  = 0,5 × ln( (1 + v) / (1 − v) )                         v acotado a [−0,999, 0,999]
```

Mientras la ventana se llena, el mínimo y el máximo son los de los precios hasta el momento; el primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí. Una ventana sin rango da `x = 0`. Necesita al menos 2 periodos. Algunas implementaciones suman a la última línea la mitad del resultado anterior (`+ 0,5 × Fisher anterior`), lo que duplica su amplitud en reposo; el motor no lo hace.

## Cómo leerla

- **Está acotada a 3,80**, porque `v` se detiene en 0,999: una subida recta lee +3,80, una caída recta −3,80, y un precio que no se mueve 0.
- **La transformada estira los extremos.** En las series reales del gráfico, con periodo 10, va de −2,4 a 2,4, y pasa de ±1,5 en del 4 % al 6 % de las barras.
- **Gira pronto, cuando el precio toca un límite del rango.** Es positiva en del 42 % al 52 % de las barras de las series reales del gráfico.

## En una estrategia

```
uses pro.fisherTransform
setup:
  fisherTransform(10)
```

`fisherTransform(10)` registra `fisher10`. En Java la clase es `FisherTransformRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("fisher10", new FisherTransformRTIndicator(10))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [RSI estocástico](/docs/indicators/oscillators/stochRsi): otro valor situado en su propio rango reciente.
- [RSI](/docs/indicators/oscillators/rsi): las ganancias frente al total, de 0 a 100.
- [CCI](/docs/indicators/oscillators/cci): a qué distancia está el precio de su media, en unidades de la desviación habitual.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
