---
title: "Volumen"
description: "Indicadores que leen el volumen negociado: el volumen en balance, el precio medio ponderado por volumen, el índice de flujo de dinero y el flujo de dinero de Chaikin."
order: 6
lastUpdated: '2026-11-12T15:34:29Z'
---

En los catálogos de QTSurfer, los indicadores de volumen son `obv`, `vwap`, `mfi` y `cmf`: ponderan o reparten lo que le pasa al precio según el volumen negociado. Los cuatro son indicadores pro: vienen con los planes Pro y Elite, una estrategia los trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)), y leen barras completas, así que van en una estrategia `kline`. Las series de muestra de los gráficos llevan volumen, tanto las de velas como las de ticker.

- [OBV](/docs/indicators/volume/obv): un total acumulado del volumen, sumado cuando el cierre sube y restado cuando baja.
- [VWAP](/docs/indicators/volume/vwap): el precio medio pagado desde que empezó la serie, ponderado por volumen; nunca se reinicia.
- [MFI](/docs/indicators/volume/mfi): un RSI que cuenta dinero en lugar de precio, de 0 a 100.
- [CMF](/docs/indicators/volume/cmf): cómo se reparte el volumen entre compra y venta, según dónde cierra cada barra dentro de su rango, de −1 a 1.

Los catálogos los tienen con sus formas: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators).
