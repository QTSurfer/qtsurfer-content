---
title: "TRIX"
description: "Cómo el TRIX da el cambio porcentual de una media exponencial triple, que filtra los movimientos pequeños, y cómo usarlo en una estrategia de QTSurfer."
order: 2.45
lastUpdated: '2026-11-12T21:21:22Z'
---

El **TRIX**, de Jack Hutson, es el cambio porcentual de una media exponencial triple: tres medias exponenciales seguidas filtran los movimientos pequeños, y la tasa del resultado es lo que queda.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="trix"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
EMA1 = EMA(precio)
EMA2 = EMA(EMA1)
EMA3 = EMA(EMA2)
TRIX = 100 × (EMA3 − EMA3 anterior) / EMA3 anterior        las tres con el mismo periodo
```

Las tres medias arrancan en su primera entrada. El primer valor llega en la actualización `N`, y ahí lee 0; el gráfico dibuja desde ahí.

## Cómo leerlo

- **Es la tasa de la media triple, en porcentaje por barra.** Un precio que sube un 1 % cada barra lee 1,00 una vez que las medias se han puesto al día.
- **La línea de cero es la media triple deteniéndose.** Por encima la media sube, por debajo baja. En las series reales del gráfico, con periodo 15, es positivo en del 32 % al 52 % de las barras, y va de −1,02 a 0,76 en la diaria BTC/USDT.
- **Es lento.** Tres suavizados seguidos hacen que gire mucho después de que el precio haya girado.

## En una estrategia

```
uses pro.trix
setup:
  trix(15)
```

`trix(15)` registra `trix15`. En Java la clase es `TrixRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("trix15", new TrixRTIndicator(15))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil exponencial triple](/docs/indicators/averages/tema): la propia media exponencial triple, como precio.
- [Índice de fuerza verdadera](/docs/indicators/oscillators/trueStrengthIndex): otro momento con doble suavizado, de −100 a 100.
- [Tasa de cambio](/docs/indicators/oscillators/roc): el cambio sobre una ventana, sin suavizado.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
