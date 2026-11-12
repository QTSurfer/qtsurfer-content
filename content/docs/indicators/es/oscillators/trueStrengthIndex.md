---
title: "Índice de fuerza verdadera (TSI)"
description: "Cómo el índice de fuerza verdadera suaviza dos veces los cambios de precio y los contrapone a su tamaño suavizado dos veces, de −100 a 100, y cómo usarlo en una estrategia de QTSurfer."
order: 2.44
---

El **índice de fuerza verdadera** (TSI, por sus siglas en inglés), de William Blau, suaviza dos veces los cambios de precio y los contrapone al tamaño, suavizado dos veces, de esos cambios, de −100 a 100.

Pruébalo en una serie y cambia los dos periodos.

<div data-indicator-chart="trueStrengthIndex"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
cambio = precio − precio anterior
TSI    = 100 × EMA(EMA(cambio, largo), corto) / EMA(EMA(|cambio|, largo), corto)
```

El periodo largo es 25 por defecto y el corto 13. Las medias exponenciales arrancan en su primera entrada, y una ventana sin cambios da 0. El primer valor llega en la actualización 14 con los valores por defecto, y la línea lee 0 antes.

## Cómo leerlo

- **Lee 100 en una subida recta y −100 en una caída recta**, y 0 en un precio que no se mueve.
- **Es lento y suave.** Los dos suavizados hacen que gire después de que el precio haya girado. En las series reales del gráfico, con los valores por defecto, va de −85,6 a 55,3.
- **Es positivo en del 27 % al 49 % de las barras** de las series reales del gráfico.

## En una estrategia

```
uses pro.trueStrengthIndex
setup:
  trueStrengthIndex(25, 13)
```

`trueStrengthIndex(25, 13)` registra `tsi25_13`. En Java la clase es `TrueStrengthIndexRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("tsi25_13", new TrueStrengthIndexRTIndicator(25, 13))`.

Los dos periodos son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

## Relacionado

- [TRIX](/docs/indicators/oscillators/trix): otro momento con triple suavizado, como porcentaje.
- [MACD](/docs/indicators/oscillators/macd): la distancia entre dos medias exponenciales.
- [Oscilador de momento de Chande](/docs/indicators/oscillators/cmo): ganancias frente a pérdidas, sin suavizado.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
