---
title: "Volatilidad porcentual"
description: "Cómo la volatilidad porcentual da el cambio porcentual absoluto medio entre precios consecutivos sobre un bloque de N cambios, y cómo usarla en una estrategia de QTSurfer."
order: 4.5
---

La **volatilidad porcentual** es el tamaño medio de los cambios del precio, en porcentaje: cuánto se mueve de una actualización a la siguiente, de media. Al ser un porcentaje, se puede comparar entre instrumentos.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="percentVolatility"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
cambio = 100 × |precio − precio anterior| / precio anterior
volatilidad porcentual = la media de `cambio` sobre un bloque de N cambios
```

El motor pasa cada cambio a una media simple, y la de por defecto es la discreta de la página de la [SMA](/docs/indicators/averages/sma): el valor es la media del último bloque completo de `N` cambios, renovada una vez por bloque, así que la línea es una escalera que da un salto cada `N` actualizaciones. Está lista tras `N` cambios, que es la actualización número `N + 1`.

## Cómo leerla

- **Es por actualización**, así que depende de la temporalidad: el cambio de una hora a la siguiente no es el de un día al siguiente.
- **Es un porcentaje**, a diferencia del [ATR](/docs/indicators/volatility/atr) y de la [desviación típica](/docs/indicators/volatility/stdDev), que están en las unidades del precio, así que compara instrumentos directamente.
- **Cuenta el tamaño de cada cambio, no su dirección**: una subida y una bajada del mismo tamaño pesan igual.

## En una estrategia

```
setup:
  percentVolatility(5)
```

`percentVolatility(5)` registra `pvol5`. En Java, `.percentVolatility(5)` en el builder.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [ATR](/docs/indicators/volatility/atr): el rango de una barra, en las unidades del precio.
- [Desviación típica](/docs/indicators/volatility/stdDev): la dispersión de los precios, en las unidades del precio.
- [Volatilidad](/docs/indicators/volatility/volatility): con qué frecuencia cambia el precio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
