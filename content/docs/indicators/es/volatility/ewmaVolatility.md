---
title: "Volatilidad EWMA"
description: "Cómo la volatilidad EWMA estima la volatilidad por barra con pesos que decaen exponencialmente sobre los rendimientos al cuadrado, a la manera de RiskMetrics, y cómo usarla en una estrategia de QTSurfer."
order: 4.94
lastUpdated: '2026-11-13T23:26:15Z'
---

La **volatilidad EWMA** estima la volatilidad por barra a partir de los rendimientos logarítmicos al cuadrado, con pesos que decaen exponencialmente: el método RiskMetrics de J.P. Morgan. No necesita ventana.

Pruébala en una serie y cambia el factor de decaimiento.

<div data-indicator-chart="ewmaVolatility"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
r      = ln(precio / precio anterior)
σ²     = λ × σ² anterior + (1 − λ) × r²              λ = 0,94 por defecto
EWMA   = σ
```

La primera varianza es el primer rendimiento al cuadrado. El motor exige que `λ` esté estrictamente entre 0 y 1 y rechaza cualquier otro al construir el indicador, y puede multiplicar el resultado por un factor de anualización (`√252` para barras diarias). El primer valor llega en la actualización 2, y el gráfico dibuja desde ahí.

## Cómo leerla

- **Es una volatilidad por barra, como fracción del precio**: 0,0199 es el 1,99 %. Un precio que sube un 1 % cada barra lee 0,00995, que es `ln 1,01`, porque un rendimiento constante también cuenta.
- **Un golpe se apaga a `√λ` por barra.** Tras un salto, la línea baja un 0,97 cada barra con el 0,94 por defecto, y no llega nunca a 0 en tiempo finito: a diferencia de una ventana, olvida poco a poco.
- **En las series reales del gráfico** su mediana es 0,021 en la diaria BTC/USDT, 0,004 en la horaria y 0,003 en la de 15 minutos ETH/USDT.

## En una estrategia

```
uses pro.ewmaVolatility
setup:
  ewmaVolatility(0.94)
```

`ewmaVolatility(0.94)` registra `ewma0.94`. Su id por defecto lleva un punto, así que cuando una `window` tiene que referirse a él, ponle un nombre: `ewmaVolatility("vol", 0.94)`. En Java la clase es `EwmaVolatilityRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro.volatility`, y un grupo la recibe con `indicators.add("ewma0.94", new EwmaVolatilityRTIndicator(0.94))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El factor de decaimiento es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Volatilidad realizada](/docs/indicators/volatility/realizedVolatility): la misma estimación sobre una ventana de pesos iguales.
- [Desviación típica exacta](/docs/indicators/statistics/exactStdDev): la dispersión de los precios en vez de los rendimientos.
- [Valor en riesgo](/docs/indicators/statistics/valueAtRisk): una pérdida construida con los mismos rendimientos.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
