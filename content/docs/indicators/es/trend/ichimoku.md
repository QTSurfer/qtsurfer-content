---
title: "Nube de Ichimoku"
description: "Cómo la nube de Ichimoku lee el precio frente a los puntos medios de sus propios máximos y mínimos de tres periodos, por qué las líneas del motor no están desplazadas, y cómo usarla en una estrategia de QTSurfer."
order: 5.3
---

La **nube de Ichimoku** (Ichimoku Kinko Hyo), ideada por Goichi Hosoda, lee el precio frente a los puntos medios de sus propios máximos y mínimos de tres periodos. Se registran cinco líneas: Tenkan, Kijun, Senkou A, Senkou B y Chikou. El espacio entre Senkou A y Senkou B es la nube.

Pruébala en una serie y cambia los tres periodos. La línea del color de acento es la Tenkan, la gris es la Kijun, y la verde y la roja son Senkou A y Senkou B, los dos bordes de la nube.

<div data-indicator-chart="ichimoku"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
Tenkan   = (máximo más alto + mínimo más bajo) / 2     en 9 barras
Kijun    = (máximo más alto + mínimo más bajo) / 2     en 26 barras
Senkou A = (Tenkan + Kijun) / 2
Senkou B = (máximo más alto + mínimo más bajo) / 2     en 52 barras
Chikou   = el cierre
```

Los tres periodos son 9, 26 y 52 por defecto. **Ninguna de las líneas está desplazada.** Los libros dibujan Senkou A y Senkou B 26 barras por delante del precio y la línea Chikou 26 barras por detrás; el motor da el valor de la barra actual, y eso es lo que compara una estrategia. Así, la nube de un gráfico de libro, la calculada hace 26 barras, no es el par de líneas Senkou leídas ahora.

El primer valor llega en la actualización 52, el periodo más largo, y el gráfico dibuja desde ahí. El gráfico deja fuera la línea Chikou, porque es el cierre que ya muestran las velas.

## Cómo leerla

- **Tenkan es la línea rápida y Senkou B la lenta.** En una subida recta la Tenkan va por detrás del precio 4 barras, la Kijun 12,5, Senkou A 8,25 y Senkou B 25,5.
- **La nube es el hueco entre Senkou A y Senkou B.** Un precio por encima de las dos líneas está por encima de la nube, uno por debajo de las dos está bajo ella, y uno entre ellas está dentro. Recuerda que las líneas son las de la barra actual.
- **El cruce de la Tenkan con la Kijun** es la señal habitual de un cambio en la dirección a corto plazo, y se lee frente a dónde está el precio respecto a la nube.

## En una estrategia

```
uses pro.ichimoku
setup:
  ichimoku(9, 26, 52)
```

`ichimoku(9, 26, 52)` registra `ichi9_26_52`, la línea Tenkan, con `ichi9_26_52Kijun`, `ichi9_26_52SenkouA`, `ichi9_26_52SenkouB` y `ichi9_26_52Chikou` a su lado; `ichimoku()` toma 9, 26 y 52. En Java, `Pro.on(indicators).ichimoku()`.

Los tres periodos son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Índice direccional medio](/docs/indicators/trend/adx): lo fuerte que es la tendencia, sea cual sea su lado.
- [SuperTrend](/docs/indicators/trend/superTrend): una sola línea que sigue al precio y cambia de lado cuando se cruza.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
