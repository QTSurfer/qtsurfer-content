---
title: Backtesting
description: Prueba de una estrategia con datos históricos antes de arriesgar capital real.
order: 1
kind: glossary
termId: backtesting
lastUpdated: "2026-09-01T09:29:22Z"
aliases:
  - backtest
  - backtests
  - simulación histórica
links:
  - label: Introducción al backtesting
    href: /learn/articles/backtesting
  - label: Guía de la API de backtests de QTSurfer
    href: /docs/developers/api/backtest_execute
  - label: Backtesting en Wikipedia
    href: https://es.wikipedia.org/wiki/Backtesting
---

El backtesting consiste en ejecutar una estrategia de trading con datos históricos para estimar cómo
se habría comportado bajo unas condiciones definidas. El resultado depende de los instrumentos, el
periodo, la resolución de los datos, las comisiones, el capital y el modelo de ejecución elegidos.

Un backtest aporta información sobre un modelo en condiciones pasadas, pero no es una predicción. El
sesgo de anticipación, el sobreajuste, los costes omitidos y los datos deficientes pueden producir
resultados artificialmente favorables.
