---
title: Curva de equity
description: Serie temporal que muestra cómo cambia el valor de una estrategia o cuenta.
order: 3
kind: glossary
termId: equity-curve
lastUpdated: "2026-09-01T09:36:12Z"
aliases:
  - curvas de equity
  - curva de capital
  - curva de valor de la cuenta
links:
  - label: Guía de la API de curvas de equity de QTSurfer
    href: /docs/developers/api/equity_curves
  - label: Drawdown
    href: /learn/glossary/drawdown
---

Una curva de equity es una serie temporal del valor de una cuenta o estrategia. En un backtest suele
comenzar con el capital inicial configurado y cambia conforme las posiciones simuladas generan
beneficios, pérdidas y costes.

![Curva de equity ilustrativa normalizada al capital inicial, que asciende hasta un 18,3 % con un drawdown intermedio](/img/docs/equity-curve.svg)

Su forma revela información que una rentabilidad final oculta, como la volatilidad, los periodos sin
avance, los drawdowns y la dependencia de un número reducido de eventos.
