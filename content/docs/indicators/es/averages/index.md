---
title: "Medias"
description: "Medias móviles del precio: las medias simple, exponencial, ponderada, exponencial doble y triple, de Hull, modificada, adaptativa de Kaufman, de Arnaud Legoux, adaptativa fractal, de mínimos cuadrados y la dinámica de McGinley."
order: 1
---

En los catálogos de QTSurfer, las medias son `sma`, `ema`, `wma`, `tema`, `hma`, `mma`, `kama`, `dema`, `alma`, `frama`, `leastSquaresMovingAverage` y `mcGinleyDynamic`: medias de los últimos precios que suavizan el precio y lo siguen con retraso. Se diferencian en cómo pesan los precios y en cuánto retraso aceptan.

- [SMA](/docs/indicators/averages/sma): la media de los últimos `N` precios, en el modo discreto del motor por defecto.
- [EMA](/docs/indicators/averages/ema): la media exponencial, con pesos que caen de forma geométrica.
- [WMA](/docs/indicators/averages/wma): los pesos de los últimos `N` precios caen en línea recta.
- [TEMA](/docs/indicators/averages/tema): tres medias exponenciales combinadas para recortar el retraso.
- [HMA](/docs/indicators/averages/hma): medias ponderadas de tres periodos, para una línea ajustada y suave.
- [MMA](/docs/indicators/averages/mma): el suavizado de Wilder, una media exponencial con un peso más suave.
- [KAMA](/docs/indicators/averages/kama): la media de Kaufman, que adapta su velocidad a lo recto que se mueve el precio.
- [DEMA](/docs/indicators/averages/dema): dos medias exponenciales combinadas para recortar el retraso, a costa de algo de rebasamiento. Un indicador pro.
- [ALMA](/docs/indicators/averages/alma): los últimos precios ponderados por una campana cuyo pico el desplazamiento acerca al último precio. Un indicador pro.
- [FRAMA](/docs/indicators/averages/frama): una media exponencial cuya velocidad sigue la dimensión fractal del precio, así que corre en una recta y casi se para en un rango. Un indicador pro.
- [LSMA](/docs/indicators/averages/leastSquaresMovingAverage): el extremo de la recta que mejor ajusta los últimos precios. Un indicador pro.
- [Dinámica de McGinley](/docs/indicators/averages/mcGinleyDynamic): una media que se mueve más deprisa hacia un precio por debajo y más despacio hacia uno por encima. Un indicador pro.

Los catálogos las tienen con sus formas: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators).
