---
title: "Oscilador estocástico"
description: "Cómo el oscilador estocástico sitúa el cierre en el rango de las últimas barras, con su %K suavizado y su %D, por qué las líneas del motor se mueven a saltos, y cómo usarlo en una estrategia de QTSurfer."
order: 2.53
lastUpdated: '2026-11-13T21:28:19Z'
---

El **oscilador estocástico**, de George Lane, sitúa el cierre en el rango de las últimas `N` barras, de 0 en el mínimo más bajo a 100 en el máximo más alto. Viene con una línea suavizada, `%K`, y una media de ella, `%D`.

Pruébalo en una serie y cambia los tres periodos.

<div data-indicator-chart="stochasticOscillator"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
%K bruto = 100 × (cierre − mínimo más bajo) / (máximo más alto − mínimo más bajo)        sobre las últimas k barras
%K       = SMA(%K bruto, kSuav)                                                           el %K lento
%D       = SMA(%K, dSuav)
```

Los periodos son 14, 3 y 3 por defecto. Una ventana sin rango da un `%K` bruto de 50. El primer valor llega en la actualización `k`, y el gráfico dibuja desde ahí. Las medias simples del motor son las **discretas** por defecto, que mantienen la media de un bloque completo hasta que se completa el siguiente (la [página de la SMA](/docs/indicators/averages/sma) lo explica). Así que `%K` y `%D` se mueven a saltos: el 66 % de las barras repite el valor anterior, en las series reales del gráfico.

## Cómo leerlo

- **0 es un cierre en el fondo del rango y 100 un cierre en lo alto**, y lee 50 en una barra sin rango o en un doji a media altura. Una subida recta de barras que cierran en su máximo lee 100.
- **Los niveles 80 y 20 se alcanzan a menudo.** En las series reales del gráfico, con los valores por defecto, `%K` está en 80 o por encima en del 7 % al 16 % de las barras y en 20 o por debajo en del 10 % al 18 %.
- **Las líneas van a saltos.** El libro suaviza con medias móviles y la línea cambia con cada barra; aquí `%K` y `%D` mantienen un valor durante un bloque de 3 barras. Una regla que cruza `%K` sobre `%D` ve el cruce solo al final de un bloque.

## En una estrategia

```
uses pro.stochasticOscillator
setup:
  stochasticOscillator(14, 3, 3)
```

`stochasticOscillator(14, 3, 3)` registra `stoch14_3_3`, con `%D` a su lado como `stoch14_3_3D`. En Java la clase es `StochasticOscillatorRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("stoch14_3_3", new StochasticOscillatorRTIndicator(14, 3, 3))`.

Los tres periodos son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [%R de Williams](/docs/indicators/oscillators/williamsR): la misma posición en el rango, sin suavizado, de −100 a 0.
- [RSI estocástico](/docs/indicators/oscillators/stochRsi): la misma idea aplicada al RSI.
- [RSI](/docs/indicators/oscillators/rsi): fuerza relativa, entre 0 y 100.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
