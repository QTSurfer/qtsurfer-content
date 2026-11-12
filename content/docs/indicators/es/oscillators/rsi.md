---
title: Índice de fuerza relativa (RSI)
description: "Cómo el RSI convierte las ganancias y pérdidas recientes en un número entre 0 y 100, cómo cambian la línea su periodo y su suavizado, y cómo usarlo en una estrategia de QTSurfer."
order: 2.1
lastUpdated: '2026-11-12T00:02:30Z'
---

El **índice de fuerza relativa** (RSI, por sus siglas en inglés) mide cuánto del movimiento reciente del precio ha sido
al alza y cuánto a la baja, y lo expresa como un número entre 0 y 100. J. Welles Wilder Jr. lo presentó en 1978. Por
convención, por encima de 70 se lee como sobrecompra y por debajo de 30 como sobreventa: el precio ha subido, o bajado,
más de lo habitual para ese periodo.

Pruébalo en una serie. Cambia el periodo, los dos niveles y el suavizado, y mira cómo siguen la línea, las flechas y el
recuento. Las flechas marcan dónde el RSI vuelve a situarse por encima del nivel de sobreventa (al alza) y por debajo
del de sobrecompra (a la baja).

<div data-indicator-demo="rsi"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para
saber cuánto gana. La línea la calcula tu navegador con la propia clase de RSI del motor, así que es la línea que lee
una estrategia.

## Qué calcula

Sobre los últimos `N` cambios de precio (14 por defecto), el RSI compara la ganancia media con la pérdida media:

```text
RS  = ganancia media / pérdida media
RSI = 100 − 100 / (1 + RS)
```

Una ganancia es una subida de un precio al siguiente, una pérdida es el tamaño de una bajada, y un precio que no cambia
no cuenta como ninguna de las dos. Con solo ganancias el RSI vale 100, y con solo pérdidas vale 0. Como trabaja con
cocientes de cambios, el RSI no depende del nivel del precio y se mueve entre 0 y 100 en cualquier instrumento.

## Dos formas de promediar

La forma de llevar las dos medias es la única elección que cambia la línea.

- **El suavizado de Wilder** actualiza las dos medias con cada precio nuevo: conserva `(N − 1) / N` de la media anterior
  y suma `1 / N` del cambio nuevo. Es el RSI de los programas de gráficos y de TA-Lib: una línea continua que reacciona
  un poco en cada barra.
- **Las medias simples** son el valor por defecto del motor, la variante que suele llamarse RSI de Cutler. El motor las
  renueva una vez por periodo de `N` actualizaciones, así que la línea mantiene su valor durante `N` actualizaciones y
  luego da un salto: una escalera. Por eso el gráfico ofrece las dos.

Elige «Suavizado de Wilder» y «Media de Cutler (por defecto del motor)» en el gráfico para ver la diferencia sobre la
misma serie. En una estrategia se elige con el segundo argumento de la llamada: `rsi(14)` es el valor por defecto del
motor y `rsi(14, false)` es el suavizado de Wilder, tanto en QTScript como en Java (`.rsi(14)` y `.rsi(14, false)` en el
builder).

## Cómo leerlo

- **Los niveles son convenciones, no leyes.** 70 y 30 son los habituales, y el gráfico te deja moverlos. Un periodo
  corto llega a los extremos más a menudo: prueba `N = 5`, `14` y `30` sobre la misma serie y cuenta cuántas barras
  quedan fuera de los niveles.
- **La sobrecompra no es por sí sola una señal de venta.** En una tendencia fuerte el RSI puede mantenerse por encima de
  70 mucho tiempo mientras el precio sigue subiendo, y lo mismo por debajo de 30 en una caída. Por eso suele usarse como
  señal de vuelta a la media en mercados laterales, o junto con un filtro de tendencia.
- **Las flechas marcan la vuelta, no el extremo.** Muestran el momento en que el RSI sale de la zona, que es lo que suele
  leer quien opera reversiones. Con las medias por defecto del motor suele haber menos flechas que con el suavizado de
  Wilder, porque la línea se mueve con menos frecuencia.
- **La divergencia.** Un máximo nuevo del precio que el RSI no confirma lo leen algunos como una pérdida de impulso. Es
  una lectura discrecional, y el gráfico no la marca.

## Cuando no hay nada que dividir

Un precio que no se mueve no tiene ganancias ni pérdidas, así que la fórmula divide cero entre cero. El motor sigue a
TA-Lib: devuelve 0 cuando no hay ganancia ni pérdida, 100 cuando hay ganancias y ninguna pérdida, y 0 cuando hay pérdidas
y ninguna ganancia. Otras bibliotecas devuelven otros valores para una serie plana, unas 100 y otras ningún valor, así
que compara lo comparable cuando contrastes el motor con otra herramienta. Y una regla como `rsi < 30` se dispara en un
mercado que no se mueve, así que asegúrate de que un flujo plano no pueda alcanzarla.

## En una estrategia

```
strategy "RSI reversion"

param rsiLow  = 30  "Oversold"
param rsiHigh = 70  "Overbought"

instruments */usdt

setup:
  rsi(14, false) window m1 {
    if (actual < rsiLow)  emitBuy(price);
    if (actual > rsiHigh) emitSell(price);
  }
```

Es el ejemplo de QTScript de la [visión general de Estrategias](/docs/strategies), con el suavizado de Wilder. Emite una
compra cuando el RSI está por debajo de `rsiLow` y una venta cuando está por encima de `rsiHigh`, cada vez que se cierra
la ventana. Ilustra la sintaxis; no es una recomendación.

El periodo y los dos niveles son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede
explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene
fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [SMA](/docs/indicators/averages/sma) y [MMA](/docs/indicators/averages/mma): las medias que hay bajo el RSI por defecto del motor y
  bajo el suavizado de Wilder.
- [Cruce de EMA](/learn/articles/ema-crossover): la contrapartida de seguimiento de tendencia, con su propio gráfico.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators):
  todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
