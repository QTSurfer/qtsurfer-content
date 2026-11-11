---
title: Convergencia y divergencia de medias móviles (MACD)
description: "Cómo el MACD convierte dos medias exponenciales en una línea de impulso con su línea de señal y su histograma, cómo la cambian sus tres periodos y cómo usarlo en una estrategia de QTSurfer."
order: 3
lastUpdated: '2026-11-11T22:23:04Z'
---

La **convergencia y divergencia de medias móviles** (MACD, por sus siglas en inglés) es la distancia entre una media
móvil exponencial rápida y otra lenta del precio. La ideó Gerald Appel. La distancia es positiva mientras la media
rápida está por encima de la lenta, crece cuando se separan (la divergencia) y se reduce cuando se acercan (la
convergencia). Una segunda media, de la propia distancia, da una línea de señal con la que leerla.

Pruébalo en una serie. Cambia los tres periodos y mira cómo siguen la línea, la línea de señal, el histograma y las
flechas. Las flechas marcan dónde el MACD cruza su línea de señal, que es donde el histograma cambia de signo.

<div data-indicator-demo="macd"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para
saber cuánto gana. Las tres líneas las calculan en tu navegador los propios indicadores del motor, así que son las
líneas que lee una estrategia.

## Qué calcula

```text
MACD       = EMA(corta) − EMA(larga)      12 y 26 por defecto
señal      = EMA(MACD, 9)
histograma = MACD − señal
```

El MACD está por encima de cero mientras la media corta está por encima de la larga, y cruza el cero donde se cruzan las
dos medias. Está en las unidades del precio, así que, a diferencia del RSI, no tiene un rango fijo: solo se puede
comparar con su propia historia, y una cifra grande en un instrumento no dice nada en otro. La línea de señal es una
media del MACD, así que lo sigue con retraso, y el histograma es la distancia entre las dos: cruza el cero donde el
MACD cruza su línea de señal.

En QTSurfer, `macd` es solo la primera línea, la diferencia de las dos medias. La línea de señal y el histograma son dos
llamadas más al builder, una EMA que lee el MACD y la diferencia de los dos, y el gráfico los construye así. Las dos
medias parten del primer precio, así que al principio la línea dice poco: el motor la da por lista cuando la media
lenta ha visto sus periodos, y el gráfico dibuja desde esa barra.

## Cómo leerlo

- **El cruce de la línea de señal.** Cuando el MACD cruza por encima de su línea de señal el histograma se vuelve
  positivo, y cuando cruza por debajo se vuelve negativo. Las flechas marcan esas barras. Es la lectura clásica, y llega
  después del movimiento: las dos líneas son medias, así que van por detrás del precio.
- **La línea de cero.** El MACD cruza el cero donde se cruzan la media corta y la larga, así que es el
  [cruce de EMA](/learn/articles/ema-crossover) visto desde otro ángulo.
- **El histograma.** Su altura dice cuánto distan el MACD y su línea de señal. Un histograma que se encoge significa que
  las dos se acercan, antes de que se crucen.
- **Los periodos son convenciones.** 12, 26 y 9 son los habituales. Con periodos más cortos reacciona antes y cruza más a
  menudo, y con periodos más largos cruza menos y más tarde: en las series reales del gráfico, `6, 13, 5` cruza
  aproximadamente el doble de veces que el valor por defecto y `24, 52, 18` menos de la mitad.

## En una estrategia

```
setup:
  macd("macd", 12, 26)
  ema("signal", "macd", 9)
  diff("hist", "macd", "signal")
```

Estas tres líneas de un fichero QTScript registran `macd`, `signal` y `hist`. En Java, las mismas llamadas al builder son
`.macd("macd", 12, 26)`, `.ema("signal", "macd", 9)` y `.diff("hist", "macd", "signal")`.

Una ventana sobre la última de ellas actúa sobre el cruce:

```
strategy "MACD cross"

setup:
  macd("macd", 12, 26)
  ema("signal", "macd", 9)
  diff("hist", "macd", "signal") window m1 {
    if (prev < 0 && actual >= 0) emitBuy(price);
    if (prev > 0 && actual <= 0) emitSell(price);
  }
```

La ventana está sobre el histograma: `actual` es su valor cuando se cierra la ventana y `prev` su valor cuando se cerró la
anterior, así que las dos condiciones son el MACD cruzando por encima de su línea de señal y cruzando por debajo. Las
flechas del gráfico aplican la misma regla en cada barra de la muestra. Ilustra la sintaxis; no es una recomendación.

Los tres periodos son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos,
y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la
muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [RSI](/docs/indicators/oscillators/rsi): el oscilador de impulso con rango fijo, para leerlo junto a este.
- [Cruce de EMA](/learn/articles/ema-crossover): la regla de seguimiento de tendencia de la que se construye el MACD.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators):
  todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
