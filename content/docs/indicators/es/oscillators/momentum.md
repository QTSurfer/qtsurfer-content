---
title: "Momento (momentum)"
description: "Cómo el momento da la diferencia entre el último precio y el precio de hace N barras, en unidades de precio, por qué no se compara entre instrumentos, y cómo usarlo en una estrategia de QTSurfer."
order: 2.41
lastUpdated: '2026-11-12T21:21:22Z'
---

El **momento** (*momentum*) es la diferencia entre el último precio y el precio de hace `N` barras, en unidades de precio: cuánto se ha movido el precio en `N` barras, y en qué sentido.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="momentum"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
momento = precio − precio de hace N barras
```

El primer valor llega en la actualización `N + 1`, y el gráfico dibuja desde ahí; antes la línea lee 0.

## Cómo leerlo

- **La línea de cero es el precio de hace `N` barras.** Por encima el precio es mayor que entonces, por debajo menor. En una subida recta de 2 por barra lee `2 × N` = 20 con periodo 10, en una caída recta −20, y 0 en un precio que no se mueve.
- **Está en unidades de precio, así que no se compara entre instrumentos.** En las series reales del gráfico, con periodo 10, va de −25 437 a 16 124 en la diaria BTC/USDT y de −106 a 38 en la de 15 minutos ETH/USDT. Para comparar, usa la [tasa de cambio](/docs/indicators/oscillators/roc), que es lo mismo expresado en porcentaje.
- **Es positivo en del 47 % al 52 % de las barras** de las series reales del gráfico.

## En una estrategia

```
uses pro.momentum
setup:
  momentum(10)
```

`momentum(10)` registra `mom10`. En Java la clase es `MomentumRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("mom10", new MomentumRTIndicator(10))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Tasa de cambio](/docs/indicators/oscillators/roc): la misma diferencia como porcentaje del precio antiguo.
- [Oscilador de precio sin tendencia](/docs/indicators/oscillators/detrendedPriceOscillator): un precio pasado frente a la media, para mostrar ciclos.
- [CCI](/docs/indicators/oscillators/cci): a qué distancia está el precio de su media, en unidades de la desviación habitual.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
