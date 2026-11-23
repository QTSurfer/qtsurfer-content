---
title: "Know Sure Thing (KST)"
description: "Cómo el Know Sure Thing suma cuatro tasas de cambio suavizadas de longitudes distintas, con su línea de señal, desde qué actualización están listas las dos, y cómo usarlo en una estrategia de QTSurfer."
order: 2.47
lastUpdated: '2026-11-22T19:38:50Z'
---

El **Know Sure Thing** (KST), de Martin Pring, suma cuatro tasas de cambio de longitudes distintas, cada una suavizada con una media simple y con más peso cuanto más larga es. Viene con una línea de señal, la media del propio KST.

Pruébalo en una serie. No tiene parámetros: los periodos y los pesos son los del diseño de Pring.

<div data-indicator-chart="knowSureThing"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
KST    = 1 × SMA₁₀(ROC₁₀) + 2 × SMA₁₀(ROC₁₅) + 3 × SMA₁₀(ROC₂₀) + 4 × SMA₁₅(ROC₃₀)
Señal  = SMA₉(KST)
```

El primer valor llega en la actualización 53, cuando el KST y su señal están listos, y el gráfico dibuja desde ahí. Las medias simples son las [móviles](/docs/indicators/averages/sma), que toman un valor nuevo en cada actualización, como en el diseño de Pring. El KST solo ya es el de Pring desde la actualización 45, pero el motor lo da por listo junto con su señal, así que una regla que lea cualquiera de los dos recibe valores desde la 53.

## Cómo leerlo

- **La línea de cero es el signo del momento combinado**, y la tasa más larga cuenta cuatro veces lo que la más corta, así que el KST sigue más la tendencia lenta que la rápida.
- **La señal es su media.** El KST cruzando su señal es el disparador habitual. En las series reales del gráfico se cruzan de 13 a 16 veces en las 248 barras desde la actualización 53.
- **Su escala depende del instrumento**: en las series reales del gráfico, desde la actualización 53, va de −178 a 210 en la diaria BTC/USDT y de −32 a 11 en la de 15 minutos ETH/USDT.

## En una estrategia

```
uses pro.knowSureThing
setup:
  knowSureThing()
```

`knowSureThing()` registra `kst`, con la señal a su lado como `kstSignal`. No tiene formas con parámetros. En Java la clase es `KnowSureThingRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("kst", new KnowSureThingRTIndicator())`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

## Relacionado

- [Tasa de cambio](/docs/indicators/oscillators/roc): la tasa de cambio que suma cuatro veces.
- [Media móvil simple](/docs/indicators/averages/sma): la media con la que suaviza, en su modo móvil.
- [Curva de Coppock](/docs/indicators/oscillators/coppockCurve): otra suma de tasas de cambio suavizadas.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
