---
title: "Media móvil de Arnaud Legoux (ALMA)"
description: "Cómo la media móvil de Arnaud Legoux pondera los últimos precios con una campana cuyo pico el desplazamiento acerca al último, qué cambian el desplazamiento y la sigma, y cómo usarla en una estrategia de QTSurfer."
order: 1.72
---

La **media móvil de Arnaud Legoux** (ALMA, por sus siglas en inglés), de Arnaud Legoux y Dimitrios Kouzis-Loukas, pondera los últimos `N` precios con una campana. Un desplazamiento acerca el pico de la campana al último precio, así que la línea es suave y va poco por detrás del precio.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="alma"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
m  = ⌊desplazamiento × (N − 1)⌋       desplazamiento 0,85 por defecto
s  = N / sigma                        sigma 6 por defecto
wᵢ = exp(−(i − m)² / (2 s²))          i = 0 el más antiguo de los últimos N precios … N − 1 el último
ALMA = Σ wᵢ × precioᵢ / Σ wᵢ
```

Los pesos suman 1 tras la división, así que la línea está siempre entre el mínimo y el máximo de los últimos `N` precios. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí.

## Cómo leerla

- **El desplazamiento dice dónde está la campana en la ventana.** En 0 su pico está en el más antiguo de los últimos `N` precios y en 1 en el último; con el 0,85 por defecto queda cerca del último, y en una subida recta de 2 por barra la ALMA de periodo 20 va 3,9 barras por detrás del precio, donde una EMA del mismo periodo va 9,5.
- **La sigma dice lo ancha que es la campana.** Una sigma mayor la estrecha, así que cuentan menos de los últimos precios y la línea sigue más de cerca al precio; una menor la ensancha hacia una media simple.
- **Nunca rebasa.** Todos los pesos son positivos, así que la línea se queda entre el mínimo y el máximo de los últimos `N` precios y un salto se sigue sin rebasamiento, lo que no dan la DEMA ni la media de mínimos cuadrados.
- **En la serie diaria BTC/USDT del gráfico**, con periodo 20 su distancia media al cierre es el 2,4 % del precio, frente al 3,8 % de la EMA del mismo periodo.

## En una estrategia

```
uses pro.alma
setup:
  alma(20)
```

`alma(20)` registra `alma20`, con el desplazamiento y la sigma por defecto. Una forma con nombre admite también los dos, tras el periodo: `alma("fast", 20, 0.85, 6.0)`. El motor acepta un desplazamiento de 0 a 1 y una sigma mayor que 0, y rechaza cualquier otro al construir el indicador. En Java la clase es `AlmaRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.averages.pro`, y un grupo la recibe con `indicators.add("alma20", new AlmaRTIndicator(20, 0.85, 6.0))`.

El periodo, el desplazamiento y la sigma son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

## Relacionado

- [Media móvil exponencial](/docs/indicators/averages/ema): la media exponencial, que va más por detrás.
- [Media móvil de Hull](/docs/indicators/averages/hma): otra media suave que va poco por detrás.
- [Media móvil ponderada](/docs/indicators/averages/wma): los pesos de una recta, en vez de una campana.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
