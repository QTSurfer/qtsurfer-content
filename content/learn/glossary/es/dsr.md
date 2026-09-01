---
title: Ratio de Sharpe deflactado (DSR)
description: Medida de confianza para un ratio de Sharpe ajustada por pruebas múltiples y retornos no normales.
order: 7
kind: glossary
termId: dsr
lastUpdated: "2026-09-01T09:29:22Z"
aliases:
  - DSR
  - Sharpe deflactado
  - ratio de Sharpe deflactado
links:
  - label: Ratio de Sharpe
    href: /learn/glossary/sharpe-ratio
  - label: Barrido de parámetros
    href: /learn/glossary/parameter-sweep
  - label: Artículo The Deflated Sharpe Ratio
    href: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551
---

El ratio de Sharpe deflactado estima la confianza en que un ratio de Sharpe observado supera un umbral
que tiene en cuenta el número y la calidad de las variantes de estrategia consideradas. También ajusta
el resultado por la longitud de la muestra y por la asimetría y la curtosis de los retornos.

El DSR ayuda a distinguir la evidencia de habilidad de un resultado que puede haber aparecido porque
se probaron muchas alternativas y solo se comunicó la mejor. No corrige un backtest sesgado ni sustituye
la validación fuera de muestra; sus datos de entrada deben describir el proceso de investigación real,
incluidos los intentos fallidos.
