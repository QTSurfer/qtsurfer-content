---
title: "Índice direccional medio (ADX)"
description: "Cómo el índice direccional medio mide la fuerza de una tendencia, no su dirección, con las dos líneas direccionales que dicen qué lado es más fuerte, y cómo usarlo en una estrategia de QTSurfer."
order: 5.1
lastUpdated: '2026-11-12T13:54:17Z'
---

El **índice direccional medio** (ADX, por sus siglas en inglés), de J. Welles Wilder, mide lo fuerte que es una tendencia, sea cual sea su dirección, de 0 a 100. Dos líneas direccionales se registran a su lado, `+DI` y `−DI`, y dicen qué lado se mueve más.

Pruébalo en una serie y cambia el periodo. La línea del color de acento es el ADX, la verde es `+DI` y la roja es `−DI`.

<div data-indicator-chart="adx"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
+DM = subida del máximo sobre el máximo anterior     si es mayor que la caída del mínimo y positiva, si no 0
−DM = caída del mínimo bajo el mínimo anterior       si es mayor que la subida del máximo y positiva, si no 0
+DI = 100 × suavizado(+DM) / suavizado(TR)
−DI = 100 × suavizado(−DM) / suavizado(TR)
DX  = 100 × |+DI − −DI| / (+DI + −DI)
ADX = suavizado(DX)
```

`TR` es el rango verdadero de la página del [ATR](/docs/indicators/volatility/atr). El suavizado es el de Wilder: el primer valor de cada uno de `TR`, `+DM` y `−DM` es la suma de los primeros `N`, y después cada uno es el anterior menos su `N`-ésima parte más el valor nuevo. El ADX empieza como la media de los primeros `N` valores del `DX` y luego toma `1 / N` de cada valor nuevo. Así, el primer valor llega en la actualización `2N − 1`, y el gráfico dibuja desde ahí. Un precio que no se mueve da 0.

## Cómo leerlo

- **Dice lo fuerte que es la tendencia, no hacia dónde va.** Un ADX alto es una tendencia fuerte, al alza o a la baja; uno bajo es un mercado sin tendencia. Las líneas direccionales dicen el lado: `+DI` está por encima de `−DI` cuando pesan más las subidas, y `−DI` por encima de `+DI` cuando pesan más las caídas.
- **En un precio que solo sube** el ADX vale 100, `+DI` vale 100 y `−DI` vale 0: la máxima tendencia posible.
- **25 es una convención.** En las series reales del gráfico el ADX está en 25 o por encima entre dos quintos y tres quintos del tiempo, así que no es un valor raro.
- **Es lento.** Es un suavizado de un suavizado, así que necesita `2N − 1` actualizaciones para empezar y gira después de que la tendencia haya empezado.

## En una estrategia

```
uses pro.adx
setup:
  adx(14)
```

`adx(14)` registra `adx14`, con las dos líneas direccionales a su lado como `adx14PlusDI` y `adx14MinusDI`. En Java, `Pro.on(indicators).adx(14)`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [ATR](/docs/indicators/volatility/atr): el rango verdadero del que parte su suavizado.
- [SuperTrend](/docs/indicators/trend/superTrend): otro indicador de tendencia, construido sobre el rango medio.
- [Nube de Ichimoku](/docs/indicators/trend/ichimoku): un indicador de tendencia que lee el precio frente a sus propios máximos y mínimos.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
