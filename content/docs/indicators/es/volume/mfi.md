---
title: "Índice de flujo de dinero (MFI)"
description: "Cómo el índice de flujo de dinero dice qué parte del flujo de dinero de los últimos N cambios subía, de 0 a 100, lo poco que llega a 80 o a 20 en estas series, y cómo usarlo en una estrategia de QTSurfer."
order: 6.3
lastUpdated: '2026-11-12T15:34:29Z'
---

El **índice de flujo de dinero** (MFI, por sus siglas en inglés), de Gene Quong y Avrum Soudack, es un RSI que cuenta dinero en lugar de precio: dice, de 0 a 100, qué parte del flujo de dinero de los últimos `N` cambios subía.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="mfi"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
típico = (máximo + mínimo + cierre) / 3
flujo  = típico × volumen
MFI    = 100 − 100 / (1 + flujo que sube / flujo que baja)        sobre los últimos N cambios
```

Un cambio cuenta como flujo que sube cuando el precio típico está por encima del anterior y como flujo que baja cuando está por debajo; uno sin cambio no cuenta para ninguno. Cuando no hay flujo que baje el MFI vale 100, lo que incluye un precio que no se mueve. El primer valor llega en la actualización `N + 1`, porque necesita `N` cambios, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **Se lee como el [RSI](/docs/indicators/oscillators/rsi), pero cada cambio pesa lo que se negoció en él.**
- **80 y 20 son raros en estas series.** En las series reales del gráfico el MFI está en 80 o por encima menos del 6 % del tiempo y en 20 o por debajo menos del 12 %.
- **En una subida recta vale 100, y en una caída recta 0.**

## En una estrategia

```
uses pro.mfi
setup:
  mfi(14)
```

`mfi(14)` registra `mfi14`. En Java, `Pro.on(indicators).mfi(14)`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [RSI](/docs/indicators/oscillators/rsi): la misma idea sobre el precio solo.
- [Flujo de dinero de Chaikin](/docs/indicators/volume/cmf): cómo se reparte el volumen entre compra y venta, según dónde cierran las barras.
- [Volumen en balance](/docs/indicators/volume/obv): el total acumulado del volumen.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
