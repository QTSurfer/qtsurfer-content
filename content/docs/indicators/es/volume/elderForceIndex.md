---
title: "Índice de fuerza de Elder"
description: "Cómo el índice de fuerza de Elder suaviza el cambio del cierre por el volumen, de modo que un gran movimiento con un gran volumen pesa más, y cómo usarlo en una estrategia de QTSurfer."
order: 6.44
lastUpdated: '2026-11-14T12:16:29Z'
---

El **índice de fuerza de Elder** (*force index*), de Alexander Elder, suaviza el cambio del cierre por el volumen: un gran movimiento con un gran volumen es el que más pesa. Se dibuja en torno a cero.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="elderForceIndex"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
fuerza = (cierre − cierre anterior) × volumen
EFI    = EMA(fuerza, N)
```

La media arranca en la primera fuerza. El primer valor llega en la actualización `N + 1`, y el gráfico dibuja desde ahí. El volumen es el de las barras de la serie; las reales llevan el volumen de la bolsa.

## Cómo leerlo

- **Por encima de cero la fuerza la tienen los compradores, por debajo los vendedores.** En una subida recta de 1 por barra con un volumen de 50 lee 50, y en una caída recta −50.
- **Su escala es precio por volumen**, así que no se compara entre instrumentos: va de −199 679 272 a 65 155 699 en la diaria BTC/USDT y de −1 060 728 a 21 355 en la de 15 minutos ETH/USDT.
- **Es positivo en del 37 % al 47 % de las barras** de las series reales del gráfico.

## En una estrategia

```
uses pro.elderForceIndex
setup:
  elderForceIndex(13)
```

`elderForceIndex(13)` registra `efi13`. En Java la clase es `ElderForceIndexRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.volume.pro`, y un grupo la recibe con `indicators.add("efi13", new ElderForceIndexRTIndicator(13))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Volumen en balance](/docs/indicators/volume/obv): el volumen sumado o restado según el signo del cambio.
- [Tendencia precio-volumen](/docs/indicators/volume/pvt): el volumen ponderado por el cambio porcentual.
- [Media móvil exponencial](/docs/indicators/averages/ema): la media con la que se suaviza la fuerza.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
