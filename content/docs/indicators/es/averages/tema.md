---
title: "Media móvil exponencial triple (TEMA)"
description: "Cómo la media móvil exponencial triple combina tres medias exponenciales para recortar el retraso de una sola, y cómo usarla en una estrategia de QTSurfer."
order: 1.4
---

La **media móvil exponencial triple** (TEMA, por sus siglas en inglés) combina tres medias exponenciales para recortar el retraso de una sola.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="tema"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
EMA1 = EMA(precio)
EMA2 = EMA(EMA1)
EMA3 = EMA(EMA2)
TEMA = 3 × EMA1 − 3 × EMA2 + EMA3        las tres con el mismo periodo
```

Cada media suaviza la anterior y va un poco más por detrás, y la combinación cancela ese retraso. El motor arranca cada una de las tres en su primera entrada, así que las primeras barras de la línea arrastran ese arranque. Da la TEMA por lista tras `N` actualizaciones, y el gráfico dibuja desde ahí.

## Cómo leerla

- **Sobre una recta no se retrasa nada**, mientras que una EMA del mismo periodo va por detrás del precio la mitad del periodo.
- **No es la misma línea que una EMA del mismo periodo.** No cambies una por otra en una regla sin un [barrido de parámetros](/learn/articles/parameter-sweep).

## En una estrategia

```
setup:
  tema(20)
```

`tema(20)` registra `tema20`. En Java, `.tema(4)` en el builder.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil exponencial](/docs/indicators/averages/ema): la media exponencial simple con la que se construye.
- [Media móvil de Hull](/docs/indicators/averages/hma): otra media construida para recortar el retraso.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
