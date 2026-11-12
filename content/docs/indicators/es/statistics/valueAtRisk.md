---
title: "Valor en riesgo (VaR)"
description: "Cómo el valor en riesgo da la pérdida que no se espera que una barra supere con un 95 por ciento de confianza si los rendimientos fueran normales, con qué frecuencia la pasan las pérdidas reales, y cómo usarlo en una estrategia de QTSurfer."
order: 7.09
lastUpdated: '2026-11-12T18:54:41Z'
---

El **valor en riesgo** (VaR, por sus siglas en inglés) es la pérdida que no se espera que una barra supere, con un 95 % de confianza, si los rendimientos siguieran una distribución normal con la media y la desviación de los últimos `N` rendimientos.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="valueAtRisk"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
r   = ln(precio / precio anterior)               el rendimiento de cada barra
VaR = 1,6449 × desviación(r) − media(r)           sobre los últimos N rendimientos
```

1,6449 es el punto unilateral del 95 % de la distribución normal, y la desviación divide por `N`. El resultado es una fracción del precio: 0,035 es una pérdida del 3,5 %. `N` rendimientos necesitan `N + 1` precios, así que el primer valor llega en la actualización `N + 1`, y la línea lee 0 antes. El motor admite también un nivel de confianza, 0,95 por defecto, y un factor de anualización, 1 por defecto; las formas de QTScript con números extra los pasan (consulta el catálogo).

## Cómo leerlo

- **Es una pérdida escrita como número positivo**, como parte del precio. En las series reales del gráfico, con periodo 20, su media es el 3,5 % en la diaria BTC/USDT (del 1,6 % al 9,5 %) y el 0,6 % en las series horaria y de 15 minutos.
- **Las pérdidas reales lo pasan más de un 5 % de las veces.** En las tres series reales del gráfico, la pérdida de la barra siguiente pasó el valor en riesgo en el 5,4 %, el 5,7 % y el 6,1 % de las barras: la distribución normal es una hipótesis, y las colas de los rendimientos son más pesadas.
- **Puede ser negativo.** Se resta el rendimiento medio, así que en una subida constante pesa más que la desviación: un precio que sube un 1 % cada barra lee −0,00995, una ventana sin pérdidas. Un precio que no se mueve lee 0.

## En una estrategia

```
uses pro.valueAtRisk
setup:
  valueAtRisk(20)
```

`valueAtRisk(20)` registra `valRisk20`. En Java la clase es `ValueAtRiskRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, y un grupo la recibe con `indicators.add("valRisk20", new ValueAtRiskRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Desviación típica exacta](/docs/indicators/statistics/exactStdDev): la dispersión de los precios, que el valor en riesgo toma de los rendimientos.
- [Puntuación z](/docs/indicators/statistics/zScore): otra forma de poner el último movimiento en desviaciones.
- [ATR](/docs/indicators/volatility/atr): cuánto se mueve una barra, en unidades de precio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
