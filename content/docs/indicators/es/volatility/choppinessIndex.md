---
title: "Índice de oscilación (choppiness)"
description: "Cómo el índice de choppiness distingue un mercado que divaga de uno con tendencia comparando la suma de los rangos verdaderos con el rango de la ventana, de 0 a 100, y cómo usarlo en una estrategia de QTSurfer."
order: 4.92
---

El **índice de choppiness** (*choppiness index*), de Bill Dreiss, distingue un mercado que divaga de uno con tendencia: compara la suma de los rangos verdaderos de las últimas `N` barras con el rango de toda la ventana. Alto es errático, bajo es con tendencia.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="choppinessIndex"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
CHOP = 100 × log₁₀( Σ TR en N barras / (máximo más alto − mínimo más bajo) ) / log₁₀(N)
```

`TR` es el rango verdadero de cada barra (la primera usa su máximo menos su mínimo). Una ventana sin rango da 0. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **Alto significa errático, bajo significa con tendencia.** Los niveles que se citan habitualmente son 61,8 y 38,2. En las series reales del gráfico, con periodo 14, el índice pasa de 61,8 en del 5 % al 14 % de las barras y baja de 38,2 en del 11 % al 14 %, y va de 6 a 74.
- **No dice nada de la dirección**, solo de lo recto que se movió el mercado: una caída limpia y una subida limpia leen las dos bajo.
- **Dice cuándo usar un indicador de tendencia y cuándo no.** Una regla de tendencia rinde peor cuando el índice está alto.

## En una estrategia

```
uses pro.choppinessIndex
setup:
  choppinessIndex(14)
```

`choppinessIndex(14)` registra `chop14`. En Java la clase es `ChoppinessIndexRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.volatility.pro`, y un grupo la recibe con `indicators.add("chop14", new ChoppinessIndexRTIndicator(14))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Índice direccional medio](/docs/indicators/trend/adx): cuán fuerte es la tendencia, no en qué sentido.
- [ATR](/docs/indicators/volatility/atr): el rango verdadero que suma.
- [Media móvil adaptativa de Kaufman](/docs/indicators/averages/kama): una media que se adapta a lo recto que se mueve el precio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
