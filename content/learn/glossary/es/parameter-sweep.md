---
title: Barrido de parámetros
description: Evaluación de una estrategia mediante una cuadrícula definida de combinaciones de parámetros.
order: 2
kind: glossary
termId: parameter-sweep
lastUpdated: "2026-09-01T09:36:12Z"
aliases:
  - barridos de parámetros
  - cuadrícula de parámetros
  - búsqueda en cuadrícula
links:
  - label: Guía de la API de barridos de parámetros de QTSurfer
    href: /docs/developers/api/backtest_sweep
  - label: Backtesting
    href: /learn/glossary/backtesting
---

Un barrido de parámetros ejecuta la misma estrategia con múltiples combinaciones de valores
configurables. Ayuda a identificar la sensibilidad, las regiones estables y las combinaciones que
merece la pena investigar con más detalle.

Elegir únicamente el mejor resultado histórico favorece el sobreajuste. Un barrido útil también
considera los resultados cercanos, un número suficiente de operaciones y una validación fuera de
muestra o walk-forward.
