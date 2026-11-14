---
title: "Ratio de eficiencia"
description: "Cómo el ratio de eficiencia contrapone el movimiento neto del precio a la suma de sus movimientos, de 0 a 1, lo recto que fue el precio, y cómo usarlo en una estrategia de QTSurfer."
order: 5.44
---

El **ratio de eficiencia** (*efficiency ratio*), de Perry Kaufman, contrapone el movimiento neto del precio en `N` barras a la suma de todos sus movimientos: 1 cuando fue en línea recta, cerca de 0 cuando divagó. Es con lo que [KAMA](/docs/indicators/averages/kama) adapta su velocidad.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="efficiencyRatio"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
ER = |precio − precio de hace N barras| / Σ |cambio del precio|        sobre las últimas N barras
```

Una ventana sin movimiento da 0. `N` cambios necesitan `N + 1` precios, así que el primer valor llega en la actualización `N + 1`, y la línea lee 0 antes.

## Cómo leerlo

- **Lee 1 en una recta, subida o caída**, y 0 en un precio que no se mueve o que acaba donde empezó.
- **La mayor parte del tiempo es bajo.** En las series reales del gráfico, con periodo 10, está por encima de 0,5 en del 17 % al 20 % de las barras y por debajo de 0,3 en del 52 % al 61 %: los precios pasan la mayor parte del tiempo divagando.
- **No dice nada de la dirección**, solo de lo recto que fue el precio.

## En una estrategia

```
uses pro.efficiencyRatio
setup:
  efficiencyRatio(10)
```

`efficiencyRatio(10)` registra `er10`. En Java la clase es `EfficiencyRatioRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.trend.pro`, y un grupo la recibe con `indicators.add("er10", new EfficiencyRatioRTIndicator(10))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil adaptativa de Kaufman](/docs/indicators/averages/kama): la media que adapta su velocidad con este ratio.
- [Índice de choppiness](/docs/indicators/volatility/choppinessIndex): otra forma de distinguir un mercado que divaga de uno con tendencia.
- [Índice direccional medio](/docs/indicators/trend/adx): cuán fuerte es la tendencia.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
