---
title: "Medias"
description: "Medias móviles del precio: las medias simple, exponencial, ponderada, exponencial triple, de Hull, modificada y adaptativa de Kaufman."
order: 1
---

En los catálogos de QTSurfer, las medias son `sma`, `ema`, `wma`, `tema`, `hma`, `mma` y `kama`: medias de los últimos precios que suavizan el precio y lo siguen con retraso. Se diferencian en cómo pesan los precios y en cuánto retraso aceptan.

- [SMA](/docs/indicators/averages/sma): la media de los últimos `N` precios, en el modo discreto del motor por defecto.
- [EMA](/docs/indicators/averages/ema): la media exponencial, con pesos que caen de forma geométrica.
- [WMA](/docs/indicators/averages/wma): los pesos de los últimos `N` precios caen en línea recta.
- [TEMA](/docs/indicators/averages/tema): tres medias exponenciales combinadas para recortar el retraso.
- [HMA](/docs/indicators/averages/hma): medias ponderadas de tres periodos, para una línea ajustada y suave.
- [MMA](/docs/indicators/averages/mma): el suavizado de Wilder, una media exponencial con un peso más suave.
- [KAMA](/docs/indicators/averages/kama): la media de Kaufman, que adapta su velocidad a lo recto que se mueve el precio.

Los catálogos las tienen con sus formas: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators).
