---
title: "Transformada de Fisher adaptativa"
description: "Cómo la transformada de Fisher adaptativa cambia la ventana de la transformada de Fisher con el ratio de eficiencia del precio, corta en una tendencia y larga en un rango, alcanzando el doble de amplitud en reposo, y cómo usarla en una estrategia de QTSurfer."
order: 2.51
---

La **transformada de Fisher adaptativa** es la [transformada de Fisher](/docs/indicators/oscillators/fisherTransform) con una ventana que cambia según lo recto que se mueve el precio: corta cuando tiene tendencia, larga cuando divaga. Toma el ratio de eficiencia de Perry Kaufman para fijar la ventana.

Pruébala en una serie y cambia los tres periodos.

<div data-indicator-chart="adaptiveFisherTransform"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
ER      = |precio − precio de hace er barras| / Σ |cambio|, sobre las últimas er barras      el ratio de eficiencia
ventana = round(min + (1 − ER) × (max − min)), entre min y max
x       = 2 × (precio − mínimo) / (máximo − mínimo) − 1                                       sobre los últimos `ventana` precios, acotado a [−0,999, 0,999]
v       = 0,5 × x + 0,5 × v anterior
Fisher  = 0,5 × ln( (1 + v) / (1 − v) ) + 0,5 × Fisher anterior                              v acotado a [−0,999, 0,999]
```

`er` es 10, `min` 5 y `max` 20 por defecto. El motor exige que `er` sea menor que `max`, `min` al menos 2 y no mayor que `max`, y rechaza otros valores al construir el indicador. Una recta tiene un ratio de eficiencia de 1 y usa la ventana más corta; un precio que divaga tiene un ratio cercano a 0 y usa la más larga. El primer valor llega en la actualización `max`, y el gráfico dibuja desde ahí. **A diferencia de la transformada de Fisher simple, esta suma la mitad de su resultado anterior**, así que en reposo alcanza el doble de amplitud.

## Cómo leerla

- **Está acotada a 7,60**, el doble de la cota de la transformada de Fisher simple: una subida recta lee +7,60, una caída recta −7,60. En las series reales del gráfico va de −6,1 a 5,7.
- **±1,5 no es una lectura rara aquí.** La mitad extra del resultado anterior duplica la amplitud, así que la línea pasa de ±1,5 en del 48 % al 57 % de las barras de las series reales del gráfico; no traslades a esta los niveles de la transformada de Fisher simple.
- **Es positiva en del 40 % al 51 % de las barras** de las series reales del gráfico.

## En una estrategia

```
uses pro.adaptiveFisherTransform
setup:
  adaptiveFisherTransform(10, 5, 20)
```

`adaptiveFisherTransform(10, 5, 20)` registra `afisher10_5_20`. En Java la clase es `AdaptiveFisherTransformRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("afisher10_5_20", new AdaptiveFisherTransformRTIndicator(10, 5, 20))`.

Los tres periodos son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

## Relacionado

- [Transformada de Fisher](/docs/indicators/oscillators/fisherTransform): la misma transformada con una ventana fija y sin segundo suavizado.
- [Media móvil adaptativa de Kaufman](/docs/indicators/averages/kama): otro indicador que se adapta al ratio de eficiencia.
- [RSI estocástico](/docs/indicators/oscillators/stochRsi): otro valor situado en su propio rango reciente.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
