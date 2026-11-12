---
title: "Percentil móvil"
description: "Cómo el percentil móvil da el precio por debajo del cual está una parte de los últimos precios, con la mediana, el mínimo y el máximo de la misma ventana, y cómo usarlo en una estrategia de QTSurfer."
order: 7.08
---

El **percentil móvil** es el precio por debajo del cual está una parte dada de los últimos `N` precios, por ejemplo el percentil 95. El motor lo da con la mediana, el mínimo y el máximo de la misma ventana.

Pruébalo en una serie y cambia el periodo y el percentil.

<div data-indicator-chart="rollingPercentile"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
ordenados = los últimos N precios, en orden
rango     = percentil × (N − 1)
valor     = ordenados[⌊rango⌋] + (rango − ⌊rango⌋) × (ordenados[⌊rango⌋ + 1] − ordenados[⌊rango⌋])
```

El percentil es una fracción entre 0 y 1, 0,95 por defecto, y el motor rechaza cualquier otra al construir el indicador. Es la interpolación lineal que usan por defecto la función de hoja de cálculo `PERCENTIL.INC` y NumPy. Mientras la ventana se llena, el valor se calcula sobre los precios hasta el momento; se da por listo en la actualización `N`, y el gráfico dibuja desde ahí. El motor registra la mediana, el mínimo y el máximo de la ventana a su lado, y el gráfico dibuja las cuatro líneas sobre el precio.

## Cómo leerlo

- **Es un nivel de precio que sigue a la ventana.** Dibujado sobre el precio, el percentil 95 es el nivel en el que el precio estuvo igual o por debajo el 95 % de las últimas `N` barras, así que un cierre por encima es un cierre cerca de lo alto de su rango reciente.
- **No es el máximo.** En una subida recta de 2 por barra el percentil 95 va 1,9 por detrás del último precio, mientras que el máximo es el propio último precio. Con el 0,95 por defecto, la mediana, el percentil y el máximo están siempre en ese orden.
- **Los precios tienen tendencia, así que visitan a menudo lo alto.** En las series reales del gráfico, con periodo 20, el cierre está por encima de su propio percentil 95 en del 8,5 % al 12,8 % de las barras, frente al 5 % si el orden de los precios fuera aleatorio.

## En una estrategia

```
uses pro.rollingPercentile
setup:
  rollingPercentile(20, 0.95)
```

`rollingPercentile(20, 0.95)` registra `pctl20_0.95`, con `pctl20_0.95Median`, `pctl20_0.95Min` y `pctl20_0.95Max` a su lado. El id lleva un punto, así que cuando una `window` tiene que referirse a él, ponle un nombre: `rollingPercentile("p95", 20, 0.95)` registra `p95`, `p95Median`, `p95Min` y `p95Max`. En Java la clase es `RollingPercentileRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro`, y un grupo la recibe con `indicators.add("pctl20_0.95", new RollingPercentileRTIndicator(20, 0.95))`.

El periodo y el percentil son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

## Relacionado

- [Bandas de Bollinger](/docs/indicators/bands/bollinger): una banda en torno a la media, a partir de la desviación, en vez de a partir del orden de los precios.
- [Desviación típica exacta](/docs/indicators/statistics/exactStdDev): la dispersión de la misma ventana, como un solo número.
- [Media móvil simple](/docs/indicators/averages/sma): la media de la misma ventana.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
