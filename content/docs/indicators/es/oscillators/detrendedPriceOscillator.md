---
title: "Oscilador de precio sin tendencia (DPO)"
description: "Cómo el oscilador de precio sin tendencia contrapone un precio pasado a la media para quitar la tendencia y mostrar ciclos, por qué no es una señal del presente, y cómo usarlo en una estrategia de QTSurfer."
order: 2.49
---

El **oscilador de precio sin tendencia** (DPO, por sus siglas en inglés) contrapone un precio del pasado a la media simple actual, lo que centra la media en ese precio y quita la tendencia, para mostrar los ciclos en torno a ella.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="detrendedPriceOscillator"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
DPO = precio de hace (⌊N / 2⌋ + 1) barras − SMA(N)
```

La media es la móvil, sobre los últimos `N` precios. Necesita al menos 3 periodos. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **No es una señal del presente.** Compara un precio de hace `N / 2 + 1` barras con la media de hoy, así que lo que muestra ya ha ocurrido. En una subida recta de 2 por barra lee −3,0 con periodo 20, y +3,0 en una caída recta, no 0.
- **Está en unidades de precio**, así que no se compara entre instrumentos: en las series reales del gráfico, con periodo 20, va de −10 262 a 8 038 en la diaria BTC/USDT y de −45 a 46 en la de 15 minutos ETH/USDT.
- **Es positivo en del 51 % al 52 % de las barras** de las series reales del gráfico.

## En una estrategia

```
uses pro.detrendedPriceOscillator
setup:
  detrendedPriceOscillator(20)
```

`detrendedPriceOscillator(20)` registra `dpo20`. En Java la clase es `DetrendedPriceOscillatorRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("dpo20", new DetrendedPriceOscillatorRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil simple](/docs/indicators/averages/sma): la media frente a la que se contrapone el precio pasado.
- [Momento](/docs/indicators/oscillators/momentum): el último precio frente a uno pasado.
- [CCI](/docs/indicators/oscillators/cci): a qué distancia está el precio de su media, en unidades de la desviación habitual.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
