---
title: "Volumen"
description: "Indicadores que leen el volumen negociado: el volumen en balance, el precio medio ponderado por volumen, el índice de flujo de dinero, el flujo de dinero de Chaikin y siete indicadores pro más."
order: 6
---

En los catálogos de QTSurfer, los indicadores de volumen son `obv`, `vwap`, `mfi`, `cmf`, `adl`, `chaikinOscillator`, `easeOfMovement`, `elderForceIndex`, `klingerOscillator`, `negativeVolumeIndex` y `pvt`: ponderan o reparten lo que le pasa al precio según el volumen negociado. Todos son indicadores pro: vienen con los planes Pro y Elite, una estrategia los trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)), y leen barras completas, así que van en una estrategia `kline`. Las series de muestra de los gráficos llevan volumen, tanto las de velas como las de ticker.

- [OBV](/docs/indicators/volume/obv): un total acumulado del volumen, sumado cuando el cierre sube y restado cuando baja.
- [VWAP](/docs/indicators/volume/vwap): el precio medio pagado desde que empezó la serie, ponderado por volumen; nunca se reinicia.
- [MFI](/docs/indicators/volume/mfi): un RSI que cuenta dinero en lugar de precio, de 0 a 100.
- [CMF](/docs/indicators/volume/cmf): cómo se reparte el volumen entre compra y venta, según dónde cierra cada barra dentro de su rango, de −1 a 1.
- [ADL](/docs/indicators/volume/adl) y [oscilador de Chaikin](/docs/indicators/volume/chaikinOscillator): el total acumulado de ese reparto, y la distancia entre dos medias de él.
- [Facilidad de movimiento](/docs/indicators/volume/easeOfMovement): con qué facilidad se mueve el precio por el volumen que cuesta.
- [Índice de fuerza de Elder](/docs/indicators/volume/elderForceIndex): el cambio del cierre por el volumen, suavizado.
- [Oscilador de Klinger](/docs/indicators/volume/klingerOscillator): la distancia entre dos medias de una fuerza de volumen que sigue la tendencia, con su señal.
- [Índice de volumen negativo](/docs/indicators/volume/negativeVolumeIndex) y [tendencia precio-volumen](/docs/indicators/volume/pvt): totales acumulados ponderados por el cambio porcentual del cierre.

Los catálogos los tienen con sus formas: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators).
