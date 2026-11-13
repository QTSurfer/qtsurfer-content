---
title: "Índice de vigor relativo (RVGI)"
description: "Cómo el índice de vigor relativo contrapone el movimiento ponderado de la apertura al cierre al rango ponderado de las últimas barras, por qué la línea del motor se mueve a saltos, y cómo usarlo en una estrategia de QTSurfer."
order: 2.60
lastUpdated: '2026-11-13T21:28:19Z'
---

El **índice de vigor relativo** (RVGI, por sus siglas en inglés), de John Ehlers, contrapone el movimiento de la apertura al cierre al rango, ponderado sobre cuatro barras y suavizado: la idea de que en una tendencia alcista los precios cierran más arriba de lo que abren.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="relativeVigorIndex"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
num = ((cierre − apertura) + 2 (cierre₁ − apertura₁) + 2 (cierre₂ − apertura₂) + (cierre₃ − apertura₃)) / 6        las últimas cuatro barras, pesos 1, 2, 2, 1
den = ((máximo − mínimo)   + 2 (máximo₁ − mínimo₁)   + 2 (máximo₂ − mínimo₂)   + (máximo₃ − mínimo₃))   / 6
RVGI = SMA(num, N) / SMA(den, N)
```

Las medias simples del motor son las **discretas** por defecto, que mantienen la media de un bloque completo hasta que se completa el siguiente (la [página de la SMA](/docs/indicators/averages/sma) lo explica). Así que la línea se mueve a saltos: el 90 % de sus barras repite el valor anterior, en las series reales del gráfico. El original añade una línea de señal; el motor no. Una ventana sin rango da 0. El primer valor llega en la actualización `N + 3`, la 13 con el periodo 10 por defecto, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **Lee 1 cuando todas las barras abren en su mínimo y cierran en su máximo, −1 en el caso contrario**, y 0 para barras que cierran donde abren.
- **En la práctica es pequeño.** En las series reales del gráfico, con periodo 10, va de −0,52 a 0,53, y es positivo en del 41 % al 48 % de las barras.
- **Es lento.** La ponderación de cuatro barras y la media de `N` valores de las dos partes hacen que gire mucho después de que el precio haya girado.

## En una estrategia

```
uses pro.relativeVigorIndex
setup:
  relativeVigorIndex(10)
```

`relativeVigorIndex(10)` registra `rvgi10`. En Java la clase es `RelativeVigorIndexRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("rvgi10", new RelativeVigorIndexRTIndicator(10))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Balance de poder](/docs/indicators/oscillators/balanceOfPower): el mismo cuerpo frente al rango, barra a barra.
- [Oscilador estocástico](/docs/indicators/oscillators/stochasticOscillator): el cierre situado en el rango de las últimas barras.
- [Media móvil simple](/docs/indicators/averages/sma): la media discreta con la que suaviza, explicada allí.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
