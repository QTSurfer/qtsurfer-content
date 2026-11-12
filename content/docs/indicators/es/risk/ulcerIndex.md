---
title: "Índice de úlcera"
description: "Cómo el índice de úlcera mide la profundidad y la duración de las caídas de los últimos precios, la raíz de la media de sus caídas porcentuales al cuadrado, y cómo usarlo en una estrategia de QTSurfer."
order: 8.06
---

El **índice de úlcera**, de Peter Martin, mide la profundidad y la duración de las caídas de los últimos `N` precios: la raíz de la media de sus caídas porcentuales al cuadrado desde el máximo. Está en puntos porcentuales.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="ulcerIndex"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
máximo_k = el precio más alto desde el primero de los últimos N precios hasta el k-ésimo
DD_k     = 100 × (máximo_k − precio_k) / máximo_k                 la caída porcentual de cada uno de los últimos N precios
Úlcera   = √( Σ DD_k² / N )
```

El máximo es el precio más alto desde el primer precio de la ventana, así que una ventana que solo sube, o que no se mueve, lee 0. Algunas formulaciones toman la caída de cada barra desde el precio más alto de las `N` barras anteriores; con esa versión el valor del motor es menor: en la serie diaria BTC/USDT del gráfico, con periodo 20, es 0,73 de ese de media. El primer valor llega en la actualización `N`, y la línea lee 0 en la primera barra.

## Cómo leerlo

- **Está en puntos porcentuales del precio**, y nunca baja de 0. En un precio que cae un 1 % cada barra lee 10,4 con periodo 20.
- **En las series reales del gráfico**, con periodo 20, va de 1,0 a 19,6 en la diaria BTC/USDT (mediana 3,7), de 0,07 a 4,9 en la horaria (mediana 0,50) y de 0,09 a 3,8 en la de 15 minutos ETH/USDT (mediana 0,47).
- **Olvida lo que sale de la ventana.** La [caída máxima](/docs/indicators/risk/maxDrawdown) guarda su mayor caída para siempre; el índice de úlcera solo cuenta los últimos `N` precios.

## En una estrategia

```
uses pro.ulcerIndex
setup:
  ulcerIndex(20)
```

`ulcerIndex(20)` registra `ulcer20`. En Java la clase es `UlcerIndexRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, y un grupo la recibe con `indicators.add("ulcer20", new UlcerIndexRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Caída máxima](/docs/indicators/risk/maxDrawdown): la mayor caída desde el inicio.
- [Ratio de Calmar](/docs/indicators/risk/calmarRatio): el rendimiento por unidad de la mayor caída de una ventana.
- [Desviación típica exacta](/docs/indicators/statistics/exactStdDev): una dispersión que cuenta igual las subidas y las caídas.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
