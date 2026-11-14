---
title: "Índice de masa"
description: "Cómo el índice de masa suma el cociente de una media exponencial simple y doble del rango de la barra, para detectar giros a partir de un rango que se ensancha, y cómo usarlo en una estrategia de QTSurfer."
order: 4.93
lastUpdated: '2026-11-13T23:26:15Z'
---

El **índice de masa** (*mass index*), de Donald Dorsey, suma el cociente de una media exponencial simple y doble del rango de cada barra. Busca el ensanchamiento del rango que a menudo precede a un giro, sin idea de su sentido.

Pruébalo en una serie y cambia los dos periodos.

<div data-indicator-chart="massIndex"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
rango   = máximo − mínimo
simple  = EMA(rango, periodoEma)
doble   = EMA(simple, periodoEma)
MASA    = Σ (simple / doble) en las últimas periodoSuma barras
```

Los valores por defecto son 25 y 9. Un cociente con una media doble de 0 cuenta como 1. El primer valor llega en la actualización `periodoSuma`, y el gráfico dibuja desde ahí.

## Cómo leerla

- **Con un rango constante lee el periodo de la suma.** Un rango constante da un cociente de 1 en cada barra y una lectura de 25 con los valores por defecto; el índice sube de 25 cuando el rango se ensancha y baja cuando se estrecha.
- **La señal habitual es el abultamiento.** El abultamiento de giro de Dorsey es una subida por encima de 27 seguida de una bajada por debajo de 26,5. En las series reales del gráfico el índice pasa de 27 en del 9 % al 17 % de las barras, y va de 20 a 31.
- **No dice en qué sentido va el giro**, solo que el rango se ha ido ensanchando.

## En una estrategia

```
uses pro.massIndex
setup:
  massIndex(25, 9)
```

`massIndex(25, 9)` registra `mass25_9`. En Java la clase es `MassIndexRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.volatility.pro`, y un grupo la recibe con `indicators.add("mass25_9", new MassIndexRTIndicator(25, 9))`.

Los dos periodos son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Media móvil exponencial](/docs/indicators/averages/ema): la media del rango con la que se construye.
- [ATR](/docs/indicators/volatility/atr): el rango, como una sola media.
- [Índice de choppiness](/docs/indicators/volatility/choppinessIndex): otra forma de leer si el rango divaga.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
