---
title: "%R de Williams"
description: "Cómo el %R de Williams sitúa el cierre en el rango de las últimas barras de −100 a 0, como el estocástico rápido menos 100, y cómo usarlo en una estrategia de QTSurfer."
order: 2.54
lastUpdated: '2026-11-13T21:28:19Z'
---

El **%R de Williams**, de Larry Williams, sitúa el cierre en el rango de las últimas `N` barras, de −100 en el mínimo más bajo a 0 en el máximo más alto. Es el oscilador estocástico sin suavizar, vuelto del revés.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="williamsR"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
%R = −100 × (máximo más alto − cierre) / (máximo más alto − mínimo más bajo)        sobre las últimas N barras
```

Es el `%K` bruto del [oscilador estocástico](/docs/indicators/oscillators/stochasticOscillator) menos 100. Una ventana sin rango da 0, donde el estocástico da 50. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **0 es un cierre en lo alto del rango y −100 un cierre en el fondo**, y −50 es el medio: un doji a media altura de su rango lee −50.
- **No tiene suavizado, así que es nervioso.** En las series reales del gráfico, con periodo 14, está en −20 o por encima en del 9 % al 21 % de las barras y en −80 o por debajo en del 14 % al 20 %.
- **Es el oscilador estocástico antes de las medias**, así que reacciona a cada barra y, a diferencia del estocástico del motor, no se mueve a saltos.

## En una estrategia

```
uses pro.williamsR
setup:
  williamsR(14)
```

`williamsR(14)` registra `willr14`. En Java la clase es `WilliamsRRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("willr14", new WilliamsRRTIndicator(14))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Oscilador estocástico](/docs/indicators/oscillators/stochasticOscillator): la misma posición, suavizada, de 0 a 100.
- [RSI estocástico](/docs/indicators/oscillators/stochRsi): la misma idea aplicada al RSI.
- [CCI](/docs/indicators/oscillators/cci): a qué distancia está el precio de su media, en unidades de la desviación habitual.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
