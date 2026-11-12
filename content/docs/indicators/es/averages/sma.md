---
title: "Media móvil simple (SMA)"
description: "Cómo la media móvil simple toma la media de los últimos N precios, por qué la de por defecto del motor se renueva una vez por periodo y dibuja una escalera, y cómo usarla en una estrategia de QTSurfer."
order: 1.1
lastUpdated: '2026-11-12T00:02:30Z'
---

La **media móvil simple** (SMA, por sus siglas en inglés) es la media de los últimos `N` precios. Todos los precios de la ventana pesan lo mismo, así que la media suaviza el precio y lo sigue con un retraso de cerca de la mitad de la ventana.

Pruébala en una serie. Cambia el periodo y alterna con la casilla entre la media por defecto del motor y la de los libros.

<div data-indicator-chart="sma"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
SMA = (precio₁ + precio₂ + … + precioₙ) / N        los últimos N precios
```

El modo por defecto del motor es el **discreto**. Toma la media del último bloque completo de `N` precios y la mantiene hasta que se completa el siguiente, así que la línea conserva su valor durante `N` actualizaciones y luego da un salto: una escalera. Hasta que se completa el primer bloque el motor mantiene el primer precio y no se da por listo, y el gráfico dibuja desde la barra que lo completa.

Con la casilla desmarcada la media es la de los libros, una media móvil que toma un valor nuevo con cada precio. Las medias simples que hay bajo el RSI por defecto del motor son las discretas, y por eso ese RSI también es una escalera.

## Cómo leerla

- **Un periodo más largo suaviza más y se retrasa más.** Sobre una recta la media móvil va por detrás del precio la mitad del periodo: 9,5 barras con `N = 20`.
- **La escalera tiene un coste.** Una regla que lee la media discreta ve un solo nivel durante todo un bloque. Si la regla necesita que la media siga al precio, pide la móvil.
- **El precio frente a su media**, y dos medias de periodos distintos entre sí, son las lecturas habituales. El [cruce de EMA](/learn/articles/ema-crossover) es la segunda.

## En una estrategia

```
setup:
  sma(20)
```

`sma(20)` registra `sma20`, la media discreta. Para pedir la móvil, dale un nombre y desactiva el modo: `sma("sma20", 20, false)`. En Java, `.sma(20)` y `.sma("s20", 20, false)` en el builder.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil exponencial](/docs/indicators/averages/ema): la media exponencial, que da más peso a los precios recientes.
- [Media móvil ponderada](/docs/indicators/averages/wma): la media ponderada, con una ventana como esta.
- [RSI](/docs/indicators/oscillators/rsi): el oscilador cuyo valor por defecto se construye sobre esta media.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
