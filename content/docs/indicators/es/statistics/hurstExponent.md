---
title: "Exponente de Hurst"
description: "Cómo el exponente de Hurst estima, a partir del rango reescalado de los rendimientos, si los movimientos tienden a continuar o a revertirse, cerca de 0,5 en un paseo aleatorio, y cómo usarlo en una estrategia de QTSurfer."
order: 7.11
---

El **exponente de Hurst** es aquí una estimación por rango reescalado de lo persistentes que son los rendimientos: cerca de 0,5 para un paseo aleatorio, por encima de 0,5 cuando los movimientos tienden a continuar, por debajo de 0,5 cuando tienden a revertirse.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="hurstExponent"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
r     = ln(precio / precio anterior)               el rendimiento de cada barra
suma_k = Σ (rⱼ − media r), j hasta k                 la suma acumulada de los últimos N rendimientos
R     = suma más alta − suma más baja                el rango de la suma acumulada
S     = desviación de los N rendimientos             dividiendo por N
H     = ln(R / S) / ln N
```

Es una sola ventana y no una regresión sobre varias escalas, así que es ruidoso, y una ventana corta lo sesga. `N` rendimientos necesitan `N + 1` precios, así que el primer valor llega en la actualización `N + 1`; antes, y cuando los rendimientos no varían, la línea lee 0,5. Necesita al menos 4 periodos.

## Cómo leerlo

- **0,5 es el centro, no un veredicto.** En paseos aleatorios simulados la lectura promedia 0,50 con periodo 20 y de 0,53 a 0,54 con periodo 100, y una lectura suelta se dispersa unos 0,07 en torno a su media con periodo 20: más del 80 % están entre 0,4 y 0,6.
- **Los rendimientos que se siguen leen más alto y los que se revierten leen más bajo.** Rendimientos simulados con autocorrelación +0,6 promedian 0,61 con periodo 20 y 0,64 con periodo 100; con −0,6, 0,38 y 0,41.
- **En las series reales del gráfico**, con periodo 20, se mueve entre 0,25 y 0,65 y promedia de 0,47 a 0,50: una ventana de 20 rendimientos no distingue con confianza un mercado con tendencia de uno aleatorio.

## En una estrategia

```
uses pro.hurstExponent
setup:
  hurstExponent(20)
```

`hurstExponent(20)` registra `hurst20`. En Java la clase es `HurstExponentRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, y un grupo la recibe con `indicators.add("hurst20", new HurstExponentRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Autocorrelación](/docs/indicators/statistics/autocorrelation): la misma pregunta, hecha sobre un retardo.
- [Desviación típica exacta](/docs/indicators/statistics/exactStdDev): la dispersión por la que se reescala el rango.
- [Valor en riesgo](/docs/indicators/statistics/valueAtRisk): construido con los mismos rendimientos.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
