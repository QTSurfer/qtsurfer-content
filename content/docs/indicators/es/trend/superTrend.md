---
title: "SuperTrend"
description: "Cómo el SuperTrend sigue al precio a una distancia de un múltiplo del rango medio, cambia de lado cuando el precio lo cruza, y cómo usarlo en una estrategia de QTSurfer."
order: 5.2
---

El **SuperTrend** es una línea que sigue al precio a una distancia fijada por el rango medio: por debajo en una subida y por encima en una caída. Cuando el cierre cruza la línea, salta al otro lado. Se usa como stop de seguimiento y como señal de tendencia.

Pruébalo en una serie. Cambia el periodo del rango y el multiplicador.

<div data-indicator-chart="superTrend"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
medio    = (máximo + mínimo) / 2
superior = medio + multiplicador × ATR        la banda superior solo baja
inferior = medio − multiplicador × ATR        la banda inferior solo sube
línea    = la banda inferior en una subida, la banda superior en una caída
```

El `ATR` es el rango verdadero medio de la página del [ATR](/docs/indicators/volatility/atr), salvo en cómo empieza: durante las primeras `N` barras es la media de los rangos hasta ese momento, y a partir de ahí se suaviza como hace Wilder. Las bandas se arrastran: la superior solo puede bajar y la inferior solo subir. La línea empieza en una subida. Cuando un cierre cae por debajo de la banda inferior, la línea pasa a la banda superior, que vuelve a empezar desde su valor básico; cuando un cierre sube por encima de la banda superior, pasa a la inferior. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí.

Las dos bandas se registran a su lado, como `Upper` y `Lower`, y el gráfico dibuja solo la línea. Un precio que no se mueve da una línea sobre el precio.

## Cómo leerlo

- **La línea es un stop.** En una subida se queda por debajo del precio y solo sube; un cierre por debajo de ella acaba la subida. Los cambios de lado son las señales.
- **En una subida recta va por detrás del precio el multiplicador por el rango medio.**
- **Un multiplicador mayor cambia de lado con menos frecuencia.** Mantiene la línea más lejos del precio, así que el precio tiene que ir más lejos para cruzarla. En las series del gráfico, un multiplicador de 1,5 cambia la línea varias veces más a menudo que uno de 4,5.
- **Llega tarde por diseño.** Cambia de lado solo después de que el precio haya atravesado la línea, así que devuelve parte de un movimiento antes de dar la señal.

## En una estrategia

```
uses pro.superTrend
setup:
  superTrend(10, 3)
```

`superTrend(10, 3)` registra `st10_3`, con las bandas a su lado como `st10_3Upper` y `st10_3Lower`; los argumentos son el periodo del rango y el multiplicador, y `superTrend()` toma 10 y 3. En Java, `Pro.on(indicators).superTrend(10, 3)`.

El periodo del rango y el multiplicador son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [ATR](/docs/indicators/volatility/atr): el rango medio sobre el que se construye.
- [Índice direccional medio](/docs/indicators/trend/adx): lo fuerte que es la tendencia, sea cual sea su lado.
- [Nube de Ichimoku](/docs/indicators/trend/ichimoku): un indicador de tendencia que lee el precio frente a sus propios máximos y mínimos.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
