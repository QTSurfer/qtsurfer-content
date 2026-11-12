---
title: "%B de Bollinger"
description: "Cómo el %B dice dónde está el precio dentro de una banda de Bollinger, 0 en la banda inferior y 1 en la superior, cómo leerlo y cómo usarlo en una estrategia de QTSurfer."
order: 3.3
lastUpdated: '2026-11-12T00:02:30Z'
---

El **%B de Bollinger** dice dónde está el precio dentro de una [banda de Bollinger](/docs/indicators/bands/bollinger): 0 en la banda inferior, 1 en la superior, y fuera de ese rango cuando el precio está fuera de la banda.

Pruébalo en una serie y cambia los periodos y el multiplicador de la banda.

<div data-indicator-chart="bollingerPercentB"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
%B = (precio − inferior) / (superior − inferior)
```

Las bandas son las de la página de Bollinger. El %B vale 0,5 cuando el precio está en la línea media, menos de 0 cuando está por debajo de la banda inferior y más de 1 cuando está por encima de la superior. Donde la banda no tiene anchura, como en un precio que no se mueve, vale 0. Está listo cuando lo están las bandas, tras `N` actualizaciones.

## Cómo leerlo

- **Es una posición, no un precio.** Se lee igual en cualquier instrumento, así que un nivel suyo se puede usar entre instrumentos, cosa que un nivel del precio no permite.
- **0 y 1 son las bandas.** El %B sale de ese rango cuando el precio cierra fuera de ellas, y las flechas de la [página de Bollinger](/docs/indicators/bands/bollinger) marcan dónde vuelve a entrar.
- **En las series reales del gráfico cerca de uno de cada diez cierres queda fuera de las bandas** con 20 periodos y `k = 2`, así que un %B por debajo de 0 o por encima de 1 no es raro.

## En una estrategia

```
setup:
  bollingerPercentB(20, 2)
```

`bollingerPercentB(20, 2)` registra `pctB20_2`, y construye por dentro las bandas que necesita. En Java, `.bollingerPercentB()` registra lo mismo, para 20 periodos y un multiplicador de 2.

## Relacionado

- [Bandas de Bollinger](/docs/indicators/bands/bollinger): la banda en sí, con sus flechas y una estrategia que lee el %B.
- [Anchura de las bandas de Bollinger](/docs/indicators/bands/bollingerBandwidth): cuánto de ancha es la banda.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
