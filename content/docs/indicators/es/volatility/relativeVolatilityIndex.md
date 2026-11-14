---
title: "Índice de volatilidad relativa (RVI)"
description: "Cómo el índice de volatilidad relativa aplica el RSI a la desviación típica del precio en vez de al precio, de 0 a 100, y cómo usarlo en una estrategia de QTSurfer."
order: 4.96
lastUpdated: '2026-11-13T23:26:15Z'
---

El **índice de volatilidad relativa** (RVI, por sus siglas en inglés), de Donald Dorsey, aplica la idea del RSI a la desviación típica del precio en vez de al precio: dice si la volatilidad ha estado subiendo o bajando. Va de 0 a 100.

Pruébalo en una serie y cambia los dos periodos.

<div data-indicator-chart="relativeVolatilityIndex"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
σ      = desviación típica del precio en periodoDesv
sube   = media de Wilder (periodoRsi) de las subidas de σ
baja   = media de Wilder (periodoRsi) de las caídas de σ
RVI    = 100 × sube / (sube + baja)
```

Los valores por defecto son 10 y 14. La desviación es la [desviación típica](/docs/indicators/volatility/stdDev) del motor, y la media arranca como la media de los primeros cambios. La línea lee 50 hasta el primer valor, en la actualización `periodoDesv + periodoRsi + 1`, la 25 con los valores por defecto, donde empieza el gráfico; una ventana donde `σ` no cambia también lee 50.

## Cómo leerlo

- **Por encima de 50 la volatilidad ha estado subiendo, por debajo bajando.** No dice nada de la dirección del precio. Un precio en línea recta, cuya desviación solo crece al principio, lee 100.
- **No baja mucho en las series reales del gráfico**: con los valores por defecto va de 31 a 95, está por encima de 50 en del 37 % al 49 % de las barras y nunca por debajo de 20, así que el nivel inferior habitual no se alcanza.
- **Las lecturas altas son los picos de volatilidad.** Pasa de 80 en del 4 % al 7 % de las barras.

## En una estrategia

```
uses pro.relativeVolatilityIndex
setup:
  relativeVolatilityIndex(10, 14)
```

`relativeVolatilityIndex(10, 14)` registra `rvi10_14`. En Java la clase es `RelativeVolatilityIndexRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.volatility.pro`, y un grupo la recibe con `indicators.add("rvi10_14", new RelativeVolatilityIndexRTIndicator(10, 14))`.

Los dos periodos son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

## Relacionado

- [Desviación típica](/docs/indicators/volatility/stdDev): la desviación de la que toma las subidas y caídas.
- [RSI](/docs/indicators/oscillators/rsi): la misma idea aplicada al precio.
- [Volatilidad EWMA](/docs/indicators/volatility/ewmaVolatility): una estimación de la volatilidad a partir de los rendimientos.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
