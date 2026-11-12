---
title: "Media móvil de mínimos cuadrados (LSMA)"
description: "Cómo la media móvil de mínimos cuadrados toma el extremo de la recta que mejor ajusta los últimos precios, por qué no se retrasa en una tendencia y rebasa en un giro, y cómo usarla en una estrategia de QTSurfer."
order: 1.74
lastUpdated: '2026-11-12T18:10:40Z'
---

La **media móvil de mínimos cuadrados** (LSMA, por sus siglas en inglés), también llamada recta de regresión lineal o media móvil de punto final, es el valor en la última barra de la recta que mejor ajusta los últimos `N` precios.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="leastSquaresMovingAverage"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
ajuste   precio ≈ a + b × t       sobre los últimos N precios, t = 0 … N − 1, por mínimos cuadrados
LSMA = a + b × (N − 1)            la recta en la última barra
```

Necesita al menos 2 periodos. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí. El periodo por defecto es 25.

## Cómo leerla

- **Sobre una recta no se retrasa nada**: una recta se ajusta a sí misma, así que la LSMA lee el precio exacto.
- **Rebasa en un giro, y más que la DEMA.** Tras un salto de 10 en el precio, la LSMA de periodo 25 llega a 113,1 antes de asentarse en 110, y tras una caída de 10 baja a 96,9: la recta ajustada sigue subiendo más allá del escalón. Una media con pesos positivos nunca hace eso.
- **Es una recta, no un suavizado.** Da el valor que alcanzaría ahora la propia tendencia de la ventana, así que sigue de cerca una tendencia y se equivoca antes cuando la tendencia se rompe.
- **En la serie diaria BTC/USDT del gráfico**, con periodo 25 su distancia media al cierre es el 2,7 % del precio, frente al 4,2 % de la EMA del mismo periodo.

## En una estrategia

```
uses pro.leastSquaresMovingAverage
setup:
  leastSquaresMovingAverage(25)
```

`leastSquaresMovingAverage(25)` registra `lsma25`. En Java la clase es `LeastSquaresMovingAverageRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.averages.pro`, y un grupo la recibe con `indicators.add("lsma25", new LeastSquaresMovingAverageRTIndicator(25))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil simple](/docs/indicators/averages/sma): la media simple, que se retrasa en una tendencia.
- [Media móvil exponencial doble](/docs/indicators/averages/dema): otra media que elimina el retraso en una tendencia, y rebasa.
- [Media móvil de Hull](/docs/indicators/averages/hma): una forma más suave de recortar el retraso.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
