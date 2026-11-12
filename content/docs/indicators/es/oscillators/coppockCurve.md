---
title: "Curva de Coppock"
description: "Cómo la curva de Coppock suaviza con una media ponderada la suma de dos tasas de cambio, diseñada para datos mensuales, y cómo usarla en una estrategia de QTSurfer."
order: 2.46
lastUpdated: '2026-11-12T21:21:22Z'
---

La **curva de Coppock**, de Edwin Coppock, es una media móvil ponderada de la suma de dos tasas de cambio. Se diseñó para detectar oportunidades de compra a largo plazo en índices bursátiles, con datos mensuales.

Pruébala en una serie y cambia los tres periodos.

<div data-indicator-chart="coppockCurve"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
Coppock = WMA( ROC(largo) + ROC(corto), pesos )        largo 14, corto 11, pesos 10 por defecto
```

La [media ponderada](/docs/indicators/averages/wma) da el mayor peso a la última suma. Las tasas de cambio leen 0 mientras se calientan, y la media arranca sobre ellas; el primer valor llega en la actualización `largo + 1`, la 15 con los valores por defecto, y el gráfico dibuja desde ahí.

## Cómo leerla

- **Los periodos son barras, y los valores por defecto son los del diseño mensual**: 14 y 11 meses, promediados sobre 10. En una serie diaria u horaria los mismos números leen algo distinto, así que son lo primero que hay que ajustar.
- **La línea de cero es el signo del momento suavizado.** En las series reales del gráfico, con los valores por defecto, es positiva en del 40 % al 51 % de las barras, y va de −40,9 a 46,4 en la diaria BTC/USDT.
- **Un precio que sube un 1 % cada barra lee 26,5**: las dos tasas son 14,95 y 11,57, y la media ponderada de su suma se asienta en 26,5.

## En una estrategia

```
uses pro.coppockCurve
setup:
  coppockCurve(14, 11, 10)
```

`coppockCurve(14, 11, 10)` registra `coppock14_11_10`. En Java la clase es `CoppockCurveRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("coppock14_11_10", new CoppockCurveRTIndicator(14, 11, 10))`.

Los tres periodos son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

## Relacionado

- [Tasa de cambio](/docs/indicators/oscillators/roc): la tasa de cambio con la que se construye.
- [Media móvil ponderada](/docs/indicators/averages/wma): la media ponderada con la que suaviza.
- [Know Sure Thing](/docs/indicators/oscillators/knowSureThing): otra suma de tasas de cambio suavizadas.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
