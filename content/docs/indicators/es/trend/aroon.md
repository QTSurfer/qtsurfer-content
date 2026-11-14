---
title: "Aroon"
description: "Cómo el Aroon mide cuánto hace que ocurrieron el máximo más alto y el mínimo más bajo de las últimas barras, como dos líneas de 0 a 100 y su diferencia, y cómo usarlo en una estrategia de QTSurfer."
order: 5.41
lastUpdated: '2026-11-14T12:16:29Z'
---

El **Aroon**, de Tushar Chande, mide cuánto hace que ocurrieron el máximo más alto y el mínimo más bajo de las últimas `N` barras. `Up` vale 100 cuando el máximo fue en la última barra y baja hasta 0 al envejecer; `Down` hace lo mismo con el mínimo.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="aroon"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
Up    = 100 × (N − barras desde el máximo más alto) / N        sobre las últimas N + 1 barras
Down  = 100 × (N − barras desde el mínimo más bajo) / N
Aroon = Up − Down
```

La línea principal que registra el motor es la diferencia, de −100 a 100; el gráfico dibuja `Up` y `Down` en un panel con ella. Cuando el mismo extremo aparece varias veces, el motor toma el más antiguo. Una ventana sin movimiento da 0. El primer valor llega en la actualización `N + 1`, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **Una subida recta lee 100 y una caída recta −100**, porque el máximo es siempre la última barra y el mínimo la más antigua, o al revés. Un precio que no se mueve lee 0.
- **Una tendencia tiene `Up` cerca de 100 y `Down` bajo; un rango tiene los dos bajos.** En las series reales del gráfico, con periodo 25, `Up` vale 100 en del 4 % al 8 % de las barras, y las dos líneas están por debajo de 50 en del 19 % al 28 %: un mercado sin extremos recientes.
- **La diferencia es positiva en del 40 % al 51 % de las barras** de las series reales del gráfico.

## En una estrategia

```
uses pro.aroon
setup:
  aroon(25)
```

`aroon(25)` registra `aroon25`, con `aroon25Up` y `aroon25Down` a su lado. En Java la clase es `AroonRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.trend.pro`, y un grupo la recibe con `indicators.add("aroon25", new AroonRTIndicator(25))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Índice direccional medio](/docs/indicators/trend/adx): cuán fuerte es la tendencia, no en qué sentido.
- [Canal de Donchian](/docs/indicators/bands/donchianChannel): el propio máximo más alto y el propio mínimo más bajo.
- [Indicador Vortex](/docs/indicators/trend/vortex): otro par de líneas que dicen hacia dónde va la tendencia.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
