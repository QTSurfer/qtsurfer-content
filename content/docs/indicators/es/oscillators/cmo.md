---
title: "Oscilador de momento de Chande (CMO)"
description: "Cómo el oscilador de momento de Chande contrapone las ganancias a las pérdidas de los últimos N cambios, de −100 a 100, sin suavizado, y cómo usarlo en una estrategia de QTSurfer."
order: 2.43
lastUpdated: '2026-11-12T21:21:22Z'
---

El **oscilador de momento de Chande** (CMO, por sus siglas en inglés), de Tushar Chande, contrapone las ganancias a las pérdidas de los últimos `N` cambios de precio, de −100 a 100, sin suavizado.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="cmo"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
ganancias = suma de las subidas del precio en los últimos N cambios
pérdidas  = suma de las caídas del precio en los últimos N cambios
CMO       = 100 × (ganancias − pérdidas) / (ganancias + pérdidas)
```

Las sumas son de exactamente los últimos `N` cambios, sin suavizado, lo que hace al CMO más nervioso que un [RSI](/docs/indicators/oscillators/rsi) del mismo periodo. Una ventana sin cambios da 0. `N` cambios necesitan `N + 1` precios, así que el primer valor llega en la actualización `N + 1`, y la línea lee 0 antes.

## Cómo leerlo

- **Lee 100 cuando todos los cambios son subidas y −100 cuando todos son caídas**, y 0 en un precio que no se mueve o cuando subidas y caídas pesan lo mismo.
- **Los extremos son raros.** En las series reales del gráfico, con periodo 14, el CMO va de −95,8 a 84,2; pasa de ±50 en del 13 % al 15 % de las barras y de ±80 en del 0,3 % al 1,7 %.
- **Es positivo en del 43 % al 53 % de las barras** de las series reales del gráfico.

## En una estrategia

```
uses pro.cmo
setup:
  cmo(14)
```

`cmo(14)` registra `cmo14`. En Java la clase es `CmoRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("cmo14", new CmoRTIndicator(14))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [RSI](/docs/indicators/oscillators/rsi): las ganancias frente al total, suavizadas, de 0 a 100.
- [RSI estocástico](/docs/indicators/oscillators/stochRsi): dónde está el RSI dentro de su propio rango reciente.
- [Tasa de cambio](/docs/indicators/oscillators/roc): el cambio sobre toda la ventana, como porcentaje.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
