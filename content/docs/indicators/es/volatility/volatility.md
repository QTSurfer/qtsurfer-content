---
title: "Volatilidad"
description: "Cómo el indicador de volatilidad da la proporción de actualizaciones recientes en las que cambió el precio, por qué marca 100 casi siempre sobre velas, y cómo usarlo en una estrategia de QTSurfer."
order: 4.4
---

La **volatilidad** de los catálogos de QTSurfer no es la estadística. Es el porcentaje de las últimas actualizaciones en las que cambió el precio: dice con qué frecuencia se mueve el precio, no cuánto.

Pruébalo en una serie y cambia el periodo. El gráfico abre sobre una serie kline, donde el precio cambia en cada barra y la línea está en 100: elige una serie ticker para verla moverse.

<div data-indicator-chart="volatility"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
cambió = 1 si el precio difiere del anterior, 0 si es el mismo
volatilidad = 100 × (la media de `cambió` sobre un bloque de N actualizaciones)
```

Cada actualización tras la primera pasa un 1 o un 0 a una media simple, y la de por defecto del motor es la discreta de la página de la [SMA](/docs/indicators/averages/sma): el valor es la media del último bloque completo de `N` actualizaciones, renovada una vez por bloque, así que la línea es una escalera. Está lista tras `N` cambios, que es la actualización número `N + 1`.

## Cómo leerla

- **Marca 100 mientras el precio cambie en cada actualización.** Eso es casi siempre en las series reales del gráfico: un cierre rara vez es igual al anterior.
- **Baja donde un precio se repite**, como en las muestras ticker, donde un precio repetido arrastra por debajo de 100 el bloque en que cae. Dice con qué frecuencia cambia el precio, no cuánto.
- **Para saber cuánto se mueve el precio, usa otro:** la [volatilidad porcentual](/docs/indicators/volatility/percentVolatility), la [desviación típica](/docs/indicators/volatility/stdDev) o el [ATR](/docs/indicators/volatility/atr).

## En una estrategia

```
setup:
  volatility(5)
```

`volatility(5)` registra `vol5`. En Java, `.volatility(5)` en el builder.

## Relacionado

- [Volatilidad porcentual](/docs/indicators/volatility/percentVolatility): el tamaño medio de los cambios, en porcentaje.
- [Media móvil simple](/docs/indicators/averages/sma): la media discreta que alimenta.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
