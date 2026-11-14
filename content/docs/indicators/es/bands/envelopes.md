---
title: "Envolventes"
description: "Cómo las envolventes dibujan dos líneas a un porcentaje fijo por encima y por debajo de una media exponencial, por qué un porcentaje fijo solo encaja con una volatilidad, y cómo usarlas en una estrategia de QTSurfer."
order: 3.42
---

Las **envolventes** dibujan dos líneas a un porcentaje fijo por encima y por debajo de una media exponencial del precio.

Pruébalas en una serie y cambia el periodo y el porcentaje.

<div data-indicator-chart="envelopes"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. Las líneas las calcula tu navegador con la propia clase del indicador del motor, así que son las líneas que lee una estrategia.

## Qué calcula

```text
medio    = EMA(precio, N)
superior = medio × (1 + p / 100)
inferior = medio × (1 − p / 100)
```

`N` es 20 y `p` 2,5 por defecto. El motor rechaza un porcentaje negativo al construir el indicador. La línea principal que registra es el medio. El primer valor llega en la actualización `N`, y el gráfico dibuja desde ahí.

## Cómo leerlo

- **Un porcentaje fijo solo encaja con una volatilidad.** Con el 2,5 % el cierre está fuera de las envolventes en el 53 % de las barras de la diaria BTC/USDT, y en el 4 % de la horaria y el 2 % de la de 15 minutos ETH/USDT: el mismo número es una banda estrecha en una serie y ancha en otra.
- **La anchura no se adapta**: es la misma en un mercado en calma que en uno agitado. Para una banda que sí lo hace, mira el [canal de Keltner](/docs/indicators/bands/keltnerChannel) y las [bandas de Bollinger](/docs/indicators/bands/bollinger).
- **Un precio que no se mueve da 102,5 y 97,5 alrededor de 100** con los valores por defecto.

## En una estrategia

```
uses pro.envelopes
setup:
  envelopes(20, 2.5)
```

`envelopes(20, 2.5)` registra `env20_2.5`, con `env20_2.5Upper` y `env20_2.5Lower` a su lado. Su id por defecto lleva un punto, así que cuando una `window` tiene que referirse a él, ponle un nombre: `envelopes("e", 20, 2.5)`. En Java la clase es `EnvelopesRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.averages.pro`, y un grupo la recibe con `indicators.add("env20_2.5", new EnvelopesRTIndicator(20, 2.5))`.

El periodo y el porcentaje son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

## Relacionado

- [Media móvil exponencial](/docs/indicators/averages/ema): la media alrededor de la que se dibujan las envolventes.
- [Canal de Keltner](/docs/indicators/bands/keltnerChannel): la misma idea con una anchura que sigue al rango medio.
- [Bandas de Bollinger](/docs/indicators/bands/bollinger): la misma idea con una anchura a partir de la desviación.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
