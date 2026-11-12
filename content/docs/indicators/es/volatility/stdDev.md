---
title: "Desviación típica"
description: "Cómo la desviación típica mide cuán dispersos están los últimos N precios alrededor de su media, con la desviación de una muestra, y cómo usarla en una estrategia de QTSurfer."
order: 4.2
---

La **desviación típica** mide cuán dispersos están los últimos `N` precios alrededor de su media. Está en las unidades del precio, y es con lo que se construyen las [bandas de Bollinger](/docs/indicators/bands/bollinger).

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="stdDev"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
s = √( Σ (precio − media)² / (N − 1) )        sobre los últimos N precios
```

El motor divide por `N − 1`, la desviación de una muestra, y no por `N`. La da por lista tras `N` actualizaciones, y el gráfico dibuja desde ahí. Un precio que no se mueve da 0.

## Cómo leerla

- **Mide la dispersión de los precios de la ventana, no la de sus cambios.** Una subida sostenida la eleva tanto como un rango agitado. Para el tamaño de los cambios usa el [ATR](/docs/indicators/volatility/atr) o la [volatilidad porcentual](/docs/indicators/volatility/percentVolatility).
- **Está en unidades de precio**, así que un valor es grande o pequeño respecto al precio.

## En una estrategia

```
setup:
  stdDev(20)
```

`stdDev(20)` registra `stdDev20`. Como las medias, puede leer otro indicador, `stdDev("name", "other", 20)`. En Java, `.stdDev(5)` en el builder.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Varianza](/docs/indicators/volatility/variance): su cuadrado.
- [Bandas de Bollinger](/docs/indicators/bands/bollinger): la banda que está a `k` de estas a cada lado de una media.
- [ATR](/docs/indicators/volatility/atr): cuánto se mueve el precio en una barra.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
