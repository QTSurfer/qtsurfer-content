---
title: "Curtosis"
description: "Cómo la curtosis mide lo pesadas que son las colas de los últimos precios frente a una distribución normal, que lee 0, y cómo usarla en una estrategia de QTSurfer."
order: 7.04
lastUpdated: '2026-11-12T18:54:41Z'
---

La **curtosis** es aquí el exceso de curtosis de los últimos `N` precios: cuán pesadas son las colas de su distribución frente a una normal, que lee 0. Las colas pesadas son valores atípicos: unos pocos valores lejos del resto.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="kurtosis"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
m₂ = Σ (x − media)² / N
m₄ = Σ (x − media)⁴ / N
curtosis = (N + 1)(N − 1) × m₄ / ((N − 2)(N − 3) × m₂²) − 3 (N − 1)² / ((N − 2)(N − 3))
```

Es el exceso de curtosis muestral, la G2 de Fisher, que es lo que dan las hojas de cálculo con `CURTOSIS`. Necesita al menos 4 periodos, y una ventana que no se mueve da 0. Da el valor por listo tras `N` actualizaciones, y el gráfico dibuja desde ahí.

## Cómo leerla

- **0 es una distribución normal.** Por encima de 0 las colas son más pesadas, con valores atípicos; por debajo son más ligeras, una cima plana sin atípicos. En muestras normales simuladas la lectura media es 0,06 con periodo 30.
- **En una ventana pequeña oscila mucho.** Un valor atípico sobre una ventana que no se mueve lee 20,0 con periodo 20, y 20 valores equiespaciados leen −1,2.
- **En las series reales del gráfico**, con periodo 20, está por encima de 0 en del 35 % al 38 % de las barras y por encima de 3 en del 3 % al 4 %. Baja hasta −2,1 en las tres y sube hasta 9,3 en la diaria BTC/USDT, 17,7 en la horaria y 18,7 en la de 15 minutos ETH/USDT.
- **La plataforma difiere por ahora.** Hasta que se actualice el motor de la plataforma, una prueba histórica calcula la fórmula anterior, a la que le faltaba un factor y que lee −3,2 en una muestra normal donde esta página lee 0. Los valores de esta página son los corregidos.

## En una estrategia

```
uses pro.kurtosis
setup:
  kurtosis(20)
```

`kurtosis(20)` registra `kurt20`. En Java, `Pro.on(indicators).kurtosis(20)`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Desviación típica exacta](/docs/indicators/statistics/exactStdDev): la dispersión de la misma ventana, en las unidades del precio.
- [Puntuación z](/docs/indicators/statistics/zScore): cuánto se aleja el último precio de la media, que los atípicos estiran.
- [Varianza exacta](/docs/indicators/statistics/exactVariance): el segundo momento sobre el que se construye esta.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
