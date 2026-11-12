---
title: "Autocorrelación"
description: "Cómo la autocorrelación mide cuánto se parece cada rendimiento al anterior, de −1 a 1, por qué es ruidosa en una ventana corta, y cómo usarla en una estrategia de QTSurfer."
order: 7.10
lastUpdated: '2026-11-12T18:54:41Z'
---

La **autocorrelación** es aquí la autocorrelación de retardo 1 de los rendimientos: cuánto se parece el rendimiento de cada barra al de la anterior. Va de −1 a 1.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="autocorrelation"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
r = ln(precio / precio anterior)                       el rendimiento de cada barra
autocorrelación = correlación de los pares (rᵢ, rᵢ₋₁)        sobre los últimos N rendimientos
```

`N` rendimientos dan `N − 1` pares, y la correlación es la de Pearson, calculada sobre los pares. `N` rendimientos necesitan `N + 1` precios, así que el primer valor llega en la actualización `N + 1`; antes, y cuando los rendimientos no varían, la línea lee 0. Necesita al menos 4 periodos, y el motor la mantiene entre −1 y 1.

## Cómo leerla

- **Por encima de 0 los movimientos se siguen, por debajo se revierten, cerca de 0 no hay memoria con este retardo.** Alternar subida y bajada con la misma proporción lee −1, y un precio que sube lo mismo cada barra lee 1.
- **Es ruidosa en una ventana corta.** Con periodo 20 hay 19 pares, y el ruido puro lee dentro de unos ±0,46 (dos errores típicos, `2 / √19`). En las series reales del gráfico el valor queda fuera de ±0,46 en del 1,8 % al 9,3 % de las barras: casi todo lo que dibuja es ruido.
- **Un crecimiento constante lee 0**: todos los rendimientos son iguales, así que no hay nada que correlacionar. Lo mismo vale para un precio que no se mueve.
- **En las series reales del gráfico**, con periodo 20, su media es −0,06 en la diaria BTC/USDT, −0,11 en la horaria y −0,16 en la de 15 minutos ETH/USDT: una ligera tendencia a revertir.

## En una estrategia

```
uses pro.autocorrelation
setup:
  autocorrelation(20)
```

`autocorrelation(20)` registra `acf20`. En Java la clase es `AutocorrelationRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, y un grupo la recibe con `indicators.add("acf20", new AutocorrelationRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Exponente de Hurst](/docs/indicators/statistics/hurstExponent): otra forma de preguntar si los movimientos continúan o se revierten, sobre toda la ventana.
- [Valor en riesgo](/docs/indicators/statistics/valueAtRisk): construido con los mismos rendimientos.
- [Puntuación z](/docs/indicators/statistics/zScore): cuánto se aleja el último precio de la media.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
