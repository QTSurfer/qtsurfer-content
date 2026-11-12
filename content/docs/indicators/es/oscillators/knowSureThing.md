---
title: "Know Sure Thing (KST)"
description: "Cómo el Know Sure Thing suma cuatro tasas de cambio suavizadas de longitudes distintas, con su línea de señal, por qué la versión del motor se mueve a saltos, y cómo usarlo en una estrategia de QTSurfer."
order: 2.47
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

El primer valor llega en la actualización 31, cuando la tasa de cambio más larga está lista, y el gráfico dibuja desde ahí. **El motor suaviza con su media simple por defecto, la [discreta](/docs/indicators/averages/sma)**, que toma la media de un bloque completo y la mantiene hasta que se completa el siguiente, donde el diseño de Pring usa una media móvil. Así que el KST y su señal se mueven a saltos: en las series reales del gráfico, el 87 % de las barras repite el valor anterior del KST, y el 89 % el de la señal.

## Cómo leerlo

- **La línea de cero es el signo del momento combinado**, y la tasa más larga cuenta cuatro veces lo que la más corta, así que el KST sigue más la tendencia lenta que la rápida.
- **La señal es su media.** El KST cruzando su señal es el disparador habitual; en las series reales del gráfico se cruzan de 15 a 18 veces en las 270 barras dibujadas.
- **Su escala depende del instrumento**: en las series reales del gráfico va de −178 a 171 en la diaria BTC/USDT y de −40 a 11 en la de 15 minutos ETH/USDT.

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
- [Media móvil simple](/docs/indicators/averages/sma): la media discreta con la que suaviza, explicada allí.
- [Curva de Coppock](/docs/indicators/oscillators/coppockCurve): otra suma de tasas de cambio suavizadas.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
