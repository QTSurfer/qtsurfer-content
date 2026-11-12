---
title: "Riesgo y rendimiento"
description: "Riesgo y rendimiento del precio: los ratios de Sharpe, Sortino, omega, Calmar y de colas, la caída máxima y el índice de úlcera."
order: 8
lastUpdated: '2026-11-12T20:44:51Z'
---

En los catálogos de QTSurfer, los indicadores de riesgo son `sharpeRatio`, `sortinoRatio`, `omegaRatio`, `calmarRatio`, `maxDrawdown`, `ulcerIndex` y `tailRatio`: pesan lo que rinde el precio frente a lo que arriesga. Todos son indicadores pro: vienen con los planes Pro y Elite, y una estrategia los trae con una línea `uses`. Leen un solo precio, así que sirven en una estrategia `ticker` o `kline`. La mayoría se construyen con los rendimientos logarítmicos de las últimas `N` barras, y son por barra, sin anualizar, salvo el ratio de Calmar, cuyo factor por defecto es para barras diarias.

- [Ratio de Sharpe](/docs/indicators/risk/sharpeRatio): el rendimiento medio sobre lo que varían los rendimientos.
- [Ratio de Sortino](/docs/indicators/risk/sortinoRatio): el rendimiento medio sobre la desviación de los rendimientos por debajo de un objetivo.
- [Ratio omega](/docs/indicators/risk/omegaRatio): la suma de las ganancias sobre la suma de las pérdidas.
- [Ratio de Calmar](/docs/indicators/risk/calmarRatio): el rendimiento anualizado sobre la mayor caída de la ventana.
- [Caída máxima](/docs/indicators/risk/maxDrawdown): la mayor caída desde un máximo desde el inicio, como fracción del máximo.
- [Índice de úlcera](/docs/indicators/risk/ulcerIndex): la profundidad y la duración de las caídas de la ventana.
- [Ratio de colas](/docs/indicators/risk/tailRatio): la cola derecha de los rendimientos frente a la izquierda.

Los catálogos los tienen con sus formas: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators).
