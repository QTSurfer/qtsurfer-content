---
title: "Canal de Keltner"
description: "Cómo el canal de Keltner dibuja dos líneas a un múltiplo del rango verdadero medio por encima y por debajo de una media exponencial del cierre, y cómo usarlo en una estrategia de QTSurfer."
order: 3.43
---

El **canal de Keltner**, de Chester Keltner y en la versión de Linda Raschke, dibuja dos líneas a un múltiplo del [rango verdadero medio](/docs/indicators/volatility/atr) por encima y por debajo de una media exponencial del cierre, así que su anchura sigue a la volatilidad.

Pruébalo en una serie y cambia los dos periodos y el multiplicador.

<div data-indicator-chart="keltnerChannel"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
medio    = EMA(cierre, periodoEma)
superior = medio + multiplicador × ATR(periodoAtr)
inferior = medio − multiplicador × ATR(periodoAtr)
```

Los valores por defecto son 20, 10 y 1,5. El motor rechaza un multiplicador negativo al construir el indicador. La línea principal que registra es el medio. El primer valor llega en la actualización `periodoEma`, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **La anchura sigue a la volatilidad.** En las series reales del gráfico, con los valores por defecto, el cierre está fuera del canal en el 25 % de las barras de la diaria BTC/USDT, el 20 % de la horaria y el 19 % de la de 15 minutos ETH/USDT: una proporción mucho más estable que la del porcentaje fijo de las [envolventes](/docs/indicators/bands/envelopes).
- **Es más estrecho que las bandas de Bollinger en un mercado en calma y más ancho en uno agitado**, porque mide el rango de la barra, no la dispersión de los cierres.
- **El multiplicador es el número que hay que ajustar**: uno mayor ensancha el canal y reduce la proporción de cierres fuera de él.

## En una estrategia

```
uses pro.keltnerChannel
setup:
  keltnerChannel(20, 10, 1.5)
```

`keltnerChannel(20, 10, 1.5)` registra `kc20_10_1.5`, con `kc20_10_1.5Upper` y `kc20_10_1.5Lower` a su lado. Su id por defecto lleva un punto, así que cuando una `window` tiene que referirse a él, ponle un nombre: `keltnerChannel("k", 20, 10, 1.5)`. En Java la clase es `KeltnerChannelRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.volatility.pro`, y un grupo la recibe con `indicators.add("kc20_10_1.5", new KeltnerChannelRTIndicator(20, 10, 1.5))`.

Los dos periodos y el multiplicador son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [ATR](/docs/indicators/volatility/atr): el rango del que la anchura es un múltiplo.
- [Bandas de Bollinger](/docs/indicators/bands/bollinger): una banda a partir de la desviación de los cierres.
- [Envolventes](/docs/indicators/bands/envelopes): un porcentaje fijo en vez del rango.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
