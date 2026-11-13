---
title: "Canal de Donchian"
description: "Cómo el canal de Donchian dibuja el máximo más alto y el mínimo más bajo de las últimas barras con su punto medio, por qué el cierre nunca sale de su propio canal, y cómo usarlo en una estrategia de QTSurfer."
order: 3.41
---

El **canal de Donchian**, de Richard Donchian, dibuja el máximo más alto y el mínimo más bajo de las últimas `N` barras, con el punto medio entre ellos.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="donchianChannel"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
superior = máximo más alto de las últimas N barras
inferior = mínimo más bajo de las últimas N barras
medio    = (superior + inferior) / 2
```

La ventana incluye la última barra. La línea principal que registra el motor es la media; el gráfico dibuja las tres sobre el precio. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **El cierre nunca sale de su propio canal**, porque la última barra está en la ventana: en las series reales del gráfico el cierre está dentro en todas las barras. Una ruptura se lee frente al canal de la barra anterior, y aun así, con periodo 20, el cierre llegó a la línea superior anterior en del 2 % al 4 % de las barras.
- **Su anchura sigue a la volatilidad.** Con periodo 20 el canal mide de media el 16,1 % del cierre en la diaria BTC/USDT, el 2,6 % en la horaria y el 2,4 % en la de 15 minutos ETH/USDT.
- **Es una línea en escalones.** Solo se mueve cuando entra en la ventana un máximo o un mínimo nuevo, o sale uno antiguo.

## En una estrategia

```
uses pro.donchianChannel
setup:
  donchianChannel(20)
```

`donchianChannel(20)` registra `donch20` (el medio), con `donch20Upper` y `donch20Lower` a su lado. En Java la clase es `DonchianChannelRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.trend.pro`, y un grupo la recibe con `indicators.add("donch20", new DonchianChannelRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Percentil móvil](/docs/indicators/statistics/rollingPercentile): la misma ventana, con los percentiles del cierre.
- [Bandas de Bollinger](/docs/indicators/bands/bollinger): una banda a partir de la desviación en vez de a partir de los extremos.
- [ATR](/docs/indicators/volatility/atr): cuánto se mueve una barra, para dimensionar el canal.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
