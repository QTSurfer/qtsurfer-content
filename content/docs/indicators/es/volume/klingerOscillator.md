---
title: "Oscilador de Klinger"
description: "Cómo el oscilador de Klinger toma la distancia entre una media rápida y una lenta de una fuerza de volumen que sigue la tendencia de la barra, con su línea de señal, y cómo usarlo en una estrategia de QTSurfer."
order: 6.45
---

El **oscilador de Klinger**, de Stephen Klinger, toma la distancia entre una media exponencial rápida y una lenta de una fuerza de volumen que sigue la tendencia de cada barra. Viene con una línea de señal, una media de sí mismo.

Pruébalo en una serie. No tiene parámetros: los periodos son 34, 55 y 13.

<div data-indicator-chart="klingerOscillator"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
tendencia = +1 si (máximo + mínimo + cierre) es igual o mayor que el anterior, si no −1
dm        = máximo − mínimo
cm        = dm si cambió la tendencia, si no cm anterior + dm
VF        = volumen × |2 × dm / cm − 1| × tendencia × 100
KVO       = EMA(VF, 34) − EMA(VF, 55)
Señal     = EMA(KVO, 13)
```

Un `cm` de 0 da una fuerza de 0. Las medias arrancan en la primera fuerza. El primer valor llega en la actualización 56, y el gráfico dibuja desde ahí. Un empate de la suma cuenta como subida. El volumen es el de las barras de la serie; las reales llevan el volumen de la bolsa.

## Cómo leerlo

- **Por encima de cero la fuerza del volumen está con las subidas, por debajo con las caídas.** En las series reales del gráfico es positivo en del 57 % al 71 % de las barras.
- **Cruza su señal a menudo**: de 55 a 63 veces en las 245 barras dibujadas, en las tres series reales del gráfico, así que un cruce solo es un disparador débil.
- **Su escala es volumen**, así que no se compara entre instrumentos: va de −247 045 a 235 869 en la diaria BTC/USDT y de −79 965 a 34 345 en la de 15 minutos ETH/USDT.

## En una estrategia

```
uses pro.klingerOscillator
setup:
  klingerOscillator()
```

`klingerOscillator()` registra `klinger`, con la señal a su lado como `klingerSignal`. No tiene formas con parámetros. En Java la clase es `KlingerOscillatorRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.volume.pro`, y un grupo la recibe con `indicators.add("klinger", new KlingerOscillatorRTIndicator())`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Oscilador de Chaikin](/docs/indicators/volume/chaikinOscillator): otra distancia entre dos medias de un flujo de volumen.
- [Volumen en balance](/docs/indicators/volume/obv): el total acumulado del volumen según el signo del cambio.
- [MACD](/docs/indicators/oscillators/macd): la misma distancia con una línea de señal, sobre el precio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
