---
title: "Anchura de las bandas de Bollinger"
description: "Cómo la anchura da lo que miden de ancho las bandas de Bollinger en porcentaje de su línea media, cómo leerla y cómo usarla en una estrategia de QTSurfer."
order: 3.2
---

La **anchura de las bandas de Bollinger** es lo que mide de ancho una [banda de Bollinger](/docs/indicators/bands/bollinger) como porcentaje de su línea media. Dice cuánto de ancha es la banda respecto al precio.

Pruébala en una serie y cambia los periodos y el multiplicador de la banda.

<div data-indicator-chart="bollingerBandwidth"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
anchura = 100 × (superior − inferior) / media
```

Las bandas son las de la página de Bollinger: la media es una media simple de `N` precios, y la superior y la inferior están a `k` desviaciones típicas a cada lado, con la desviación de una muestra (dividiendo por `N − 1`). Donde la banda no tiene anchura, como en un precio que no se mueve, la anchura vale 0. Está lista cuando lo están las bandas, tras `N` actualizaciones.

## Cómo leerla

- **Sigue la volatilidad del precio.** La banda se ensancha cuando el precio se dispersa y se estrecha cuando está tranquilo, así que la anchura es una medida de la volatilidad.
- **Es un porcentaje, así que se puede comparar** en el tiempo y entre instrumentos, cosa que no puede hacer lo que mide la banda en unidades de precio.
- **Una banda estrecha dice que el mercado ha estado tranquilo.** No dice hacia dónde irá el precio cuando deje de estarlo.

## En una estrategia

```
setup:
  bollinger(20, 2)
  bollingerBandwidth("blgr20_2")
```

La anchura mide una banda que se registra antes. `bollingerBandwidth("blgr20_2")` toma el nombre de la banda y registra `blgr20_2BW`. En Java, `.bollinger("bb", 20, 2.0)` y `.bollingerBandwidth("bb")` en el builder.

Los periodos y el multiplicador son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Bandas de Bollinger](/docs/indicators/bands/bollinger): la banda en sí, con su %B y sus flechas.
- [%B de Bollinger](/docs/indicators/bands/bollingerPercentB): dónde se sitúa el precio dentro de la banda.
- [Desviación típica](/docs/indicators/volatility/stdDev): la desviación con la que se construye la banda.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
