---
title: "RSI estocástico"
description: "Cómo el RSI estocástico sitúa el RSI entre sus valores más bajo y más alto de las últimas N actualizaciones, por qué llega tan a menudo a 0 y a 100, y cómo usarlo en una estrategia de QTSurfer."
order: 2.4
lastUpdated: '2026-11-12T11:00:05Z'
---

El **RSI estocástico** aplica la fórmula del oscilador estocástico al [RSI](/docs/indicators/oscillators/rsi) en lugar de al precio. Dice dónde está el RSI entre su valor más bajo y su valor más alto de las últimas `N` actualizaciones, de 0 a 100. Lo idearon Tushar Chande y Stanley Kroll.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="stochRsi"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
stochRSI = 100 × (RSI − RSI más bajo de los últimos N) / (RSI más alto de los últimos N − RSI más bajo de los últimos N)
```

El RSI es el de la [página del RSI](/docs/indicators/oscillators/rsi), con el suavizado de Wilder, y `N` es a la vez su periodo y la longitud de la ventana: el motor usa un solo periodo para los dos. El RSI no está definido en la primera barra, así que la ventana empieza en la segunda: el primer valor de la línea, en la actualización `N`, se toma sobre `N − 1` valores del RSI, y el gráfico dibuja desde ahí. Donde la ventana no tiene dispersión, como en un precio que no se mueve o que solo sube, el valor es 0.

El builder tiene una forma más, que construye el RSI con las medias simples discretas de la página de la [SMA](/docs/indicators/averages/sma), el valor por defecto del `rsi` del propio motor. Ese RSI conserva su valor durante todo un periodo, así que el estocástico de él solo toma los valores 0 y 100. Existe para las estrategias escritas con el valor por defecto anterior de este indicador, no para usarlo como oscilador.

## Cómo leerlo

- **Es el RSI, reescalado a su propio rango reciente.** Dice dónde está el RSI en ese rango, no dónde está el precio, así que llega a 0 y a 100 cada vez que el RSI marca un nuevo valor mínimo o máximo de la ventana.
- **Pasa mucho tiempo en los extremos.** En las series reales del gráfico la línea está en 20 o por debajo entre una cuarta parte y un tercio del tiempo, y en 80 o por encima cerca de un tercio, así que un valor más allá de esos niveles no es raro, y los niveles son convenciones.
- **Se mueve más deprisa que el RSI.** Puede pasar de un extremo al otro en pocas barras, y una regla que actúa en cada cruce de un nivel actúa a menudo. Léelo junto con el [RSI](/docs/indicators/oscillators/rsi) o frente a un filtro de tendencia, no solo.

## En una estrategia

```
setup:
  stochRsi(14)
```

`stochRsi(14)` registra `stochRsi14`. En Java, `.stochRsi(14)` en el builder.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [RSI](/docs/indicators/oscillators/rsi): el oscilador con el que se construye.
- [CCI](/docs/indicators/oscillators/cci): otro oscilador, que se lee alrededor de cero y no entre niveles fijos.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
