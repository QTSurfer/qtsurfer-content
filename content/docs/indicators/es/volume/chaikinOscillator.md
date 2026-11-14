---
title: "Oscilador de Chaikin"
description: "Cómo el oscilador de Chaikin toma la distancia entre una media exponencial rápida y una lenta de la línea de acumulación/distribución, y cómo usarlo en una estrategia de QTSurfer."
order: 6.42
---

El **oscilador de Chaikin**, de Marc Chaikin, es la distancia entre una media exponencial rápida y una lenta de la [línea de acumulación/distribución](/docs/indicators/volume/adl): el impulso del flujo de dinero. Se dibuja en torno a cero.

Pruébalo en una serie y cambia los dos periodos.

<div data-indicator-chart="chaikinOscillator"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
Chaikin = EMA(ADL, rápida) − EMA(ADL, lenta)        rápida 3, lenta 10 por defecto
```

Las dos medias arrancan en el primer valor de la línea. El primer valor llega en la actualización `lenta`, y el gráfico dibuja desde ahí. El volumen es el de las barras de la serie; las reales llevan el volumen de la bolsa.

## Cómo leerlo

- **Por encima de cero el flujo de dinero gana velocidad, por debajo la pierde**; no dice nada del nivel de la línea. En las series reales del gráfico es positivo en del 34 % al 57 % de las barras.
- **Está en unidades de volumen**, así que no se compara entre instrumentos: va de −31 513 a 33 971 en la diaria BTC/USDT y de −9792 a 7663 en la de 15 minutos ETH/USDT.
- **Es nervioso con los periodos cortos**, 3 y 10, que son los de Chaikin.

## En una estrategia

```
uses pro.chaikinOscillator
setup:
  chaikinOscillator(3, 10)
```

`chaikinOscillator(3, 10)` registra `chaikin3_10`. En Java la clase es `ChaikinOscillatorRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.volume.pro`, y un grupo la recibe con `indicators.add("chaikin3_10", new ChaikinOscillatorRTIndicator(3, 10))`.

Los dos periodos son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Línea de acumulación/distribución](/docs/indicators/volume/adl): la línea de la que toma la distancia.
- [MACD](/docs/indicators/oscillators/macd): la misma distancia, sobre el precio.
- [Flujo de dinero de Chaikin](/docs/indicators/volume/cmf): el flujo de dinero como ratio entre −1 y 1.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
