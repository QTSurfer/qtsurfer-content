---
title: Probabilidad de sobreajuste del backtest (PBO)
description: Estimación de la probabilidad de que una estrategia elegida dentro de muestra rinda peor fuera de muestra.
order: 5
kind: glossary
termId: pbo
lastUpdated: '2026-09-01T09:41:48Z'
aliases:
  - PBO
  - probabilidad de sobreajuste del backtest
  - probabilidad de sobreajuste en backtesting
links:
  - label: Backtesting
    href: /learn/glossary/backtesting
  - label: Barrido de parámetros
    href: /learn/glossary/parameter-sweep
  - label: Artículo The Probability of Backtest Overfitting
    href: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2326253
---

La probabilidad de sobreajuste del backtest estima con qué frecuencia la estrategia elegida como la
mejor en una parte de la muestra histórica obtendría un resultado relativamente pobre en la parte
complementaria no observada. El método propuesto utiliza validación cruzada combinatoria simétrica
(CSCV) sobre un conjunto de estrategias o configuraciones de parámetros candidatas.

Un PBO alto advierte de que la selección puede estar aprovechando ruido en lugar de encontrar una
ventaja repetible. La estimación se aplica al proceso de selección completo, por lo que omitir las
configuraciones descartadas o reutilizar repetidamente los mismos datos puede producir un resultado
engañoso.
