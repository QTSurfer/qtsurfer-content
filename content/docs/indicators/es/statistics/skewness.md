---
title: "Asimetría"
description: "Cómo la asimetría mide lo desequilibrada que está la distribución de los últimos precios, 0 para una simétrica, positiva para una cola larga en el lado alto, y cómo usarla en una estrategia de QTSurfer."
order: 7.05
lastUpdated: '2026-11-12T21:10:07Z'
---

La **asimetría** es aquí la asimetría muestral de los últimos `N` precios: cuán desequilibrada está su distribución. 0 es una simétrica; por encima de 0 la cola larga está en el lado alto, por debajo de 0 está en el lado bajo.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="skewness"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
m₂ = Σ (x − media)² / N
m₃ = Σ (x − media)³ / N
asimetría = √(N (N − 1)) / (N − 2) × m₃ / m₂^1,5
```

Es el coeficiente de Fisher–Pearson ajustado G1, que es lo que dan las hojas de cálculo con `COEFICIENTE.ASIMETRIA`. Necesita al menos 3 periodos, y una ventana que no se mueve da 0. Da el valor por listo tras `N` actualizaciones, y el gráfico dibuja desde ahí.

## Cómo leerla

- **0 es una ventana simétrica.** Los precios equiespaciados, como una subida recta, leen 0. Por encima de 0 la cola larga, los valores atípicos, está en el lado alto; por debajo de 0, en el bajo. En muestras normales simuladas la lectura media es 0,05 con periodo 30.
- **En una ventana pequeña oscila mucho.** Un valor atípico sobre una ventana que no se mueve lee `√N`: 4,47 con periodo 20, positivo para un atípico por encima y negativo para uno por debajo.
- **En las series reales del gráfico**, con periodo 20, es positiva en del 44 % al 56 % de las barras y pasa de ±1 en del 14 % al 20 %. Va de −4,3 a 3,2.
- **La plataforma difiere por ahora.** Hasta que se actualice el motor de la plataforma, una prueba histórica calcula la fórmula anterior, que leía el valor corregido multiplicado por `(N / (N − 1))^1,5`: 1,08 veces con periodo 20, y 1,40 con periodo 5. Los valores de esta página son los corregidos.

## En una estrategia

```
uses pro.skewness
setup:
  skewness(20)
```

`skewness(20)` registra `skew20`. En Java la clase es `SkewnessRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, y un grupo la recibe con `indicators.add("skew20", new SkewnessRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Curtosis](/docs/indicators/statistics/kurtosis): cuán pesadas son las colas de la misma ventana.
- [Puntuación z](/docs/indicators/statistics/zScore): cuánto se aleja el último precio de la media, que los atípicos estiran.
- [Desviación típica exacta](/docs/indicators/statistics/exactStdDev): la dispersión de la misma ventana, en las unidades del precio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
