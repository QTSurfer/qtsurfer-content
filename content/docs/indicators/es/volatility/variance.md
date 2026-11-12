---
title: "Varianza"
description: "Cómo la varianza, el cuadrado de la desviación típica, mide la dispersión de los últimos N precios, con el divisor de una muestra, y cómo usarla en una estrategia de QTSurfer."
order: 4.3
---

La **varianza** es el cuadrado de la [desviación típica](/docs/indicators/volatility/stdDev): la media de los cuadrados de las distancias de los últimos `N` precios a su media. Está en el cuadrado de las unidades del precio.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="variance"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
varianza = Σ (precio − media)² / (N − 1)        sobre los últimos N precios
```

El motor divide por `N − 1`, igual que en la desviación típica, que es su raíz cuadrada. La da por lista tras `N` actualizaciones. Un precio que no se mueve da 0.

## Cómo leerla

- **Rara vez se lee por sí sola.** Sus unidades son el cuadrado de las del precio, así que su tamaño dice poco a simple vista. Es de lo que la desviación típica toma la raíz.
- **Crece con el cuadrado de la escala.** El doble de dispersión da cuatro veces la varianza.

## En una estrategia

```
setup:
  variance(20)
```

`variance(20)` registra `variance20`. En Java, `.variance(5)` en el builder.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Desviación típica](/docs/indicators/volatility/stdDev): su raíz cuadrada, en las unidades del precio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
