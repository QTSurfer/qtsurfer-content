---
id: indicators
title: Indicadores
description: "Cómo funciona cada indicador de QTSurfer, con un gráfico que puedes cambiar: qué calcula, cómo lo modelan sus parámetros y cómo usarlo en una estrategia."
order: 0
lastUpdated: '2026-11-12T14:29:40Z'
---

Un indicador convierte una serie de precios en un número sobre el que una estrategia puede actuar: una tendencia, un
impulso, una volatilidad. Cada página explica un indicador y lo ejecuta, en tu navegador, sobre la serie que elijas, con
la misma clase de indicador que ejecuta el motor. Cambia sus parámetros y mira cómo cambia la línea.

Las páginas se agrupan como los catálogos agrupan los indicadores:

- [Medias](/docs/indicators/averages): la [SMA](/docs/indicators/averages/sma), la [EMA](/docs/indicators/averages/ema),
  la [WMA](/docs/indicators/averages/wma), la [TEMA](/docs/indicators/averages/tema), la [HMA](/docs/indicators/averages/hma),
  la [MMA](/docs/indicators/averages/mma) y la [KAMA](/docs/indicators/averages/kama).
- [Osciladores](/docs/indicators/oscillators): el [RSI](/docs/indicators/oscillators/rsi),
  el [RSI estocástico](/docs/indicators/oscillators/stochRsi), el [MACD](/docs/indicators/oscillators/macd) y
  el [CCI](/docs/indicators/oscillators/cci).
- [Bandas](/docs/indicators/bands): las [bandas de Bollinger](/docs/indicators/bands/bollinger), su
  [%B](/docs/indicators/bands/bollingerPercentB) y su [anchura](/docs/indicators/bands/bollingerBandwidth).
- [Volatilidad](/docs/indicators/volatility): el [ATR](/docs/indicators/volatility/atr),
  la [desviación típica](/docs/indicators/volatility/stdDev), la [varianza](/docs/indicators/volatility/variance),
  la [volatilidad](/docs/indicators/volatility/volatility), la
  [volatilidad porcentual](/docs/indicators/volatility/percentVolatility) y cuatro estimadores pro: las volatilidades de
  [Parkinson](/docs/indicators/volatility/parkinson), [Garman-Klass](/docs/indicators/volatility/garmanKlass),
  [Rogers-Satchell](/docs/indicators/volatility/rogersSatchell) y [Yang-Zhang](/docs/indicators/volatility/yangZhang).
- [Tendencia](/docs/indicators/trend): los indicadores pro [ADX](/docs/indicators/trend/adx),
  [SuperTrend](/docs/indicators/trend/superTrend) y [nube de Ichimoku](/docs/indicators/trend/ichimoku).
- [Volumen](/docs/indicators/volume): los indicadores pro [OBV](/docs/indicators/volume/obv),
  [VWAP](/docs/indicators/volume/vwap), [MFI](/docs/indicators/volume/mfi) y [CMF](/docs/indicators/volume/cmf).

Para todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran, consulta los
catálogos: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e
[indicadores de Java](/docs/strategies/java/indicators).

## Prueba cualquier indicador

Elige un indicador, una serie y sus parámetros. El gráfico dibuja lo que calcula el motor, sobre el precio o en un panel
propio, con los nombres con los que lo lee una estrategia, y muestra la línea de `setup:` de una estrategia QTScript que
hace la misma llamada. Dibuja y no interpreta: para saber cómo se lee un indicador, con sus niveles y sus señales, mira su
página cuando la tiene, como la del [RSI](/docs/indicators/oscillators/rsi).

<div data-indicator-chart="any"></div>

Un indicador que lee barras completas, como el ATR, va en una serie kline: un ticker lleva las estadísticas del exchange
sobre una ventana y no las de una barra, así que en una serie ticker la línea se calcula con ellas, no significa lo que
dice el nombre del indicador, y el gráfico lo dice.

Los gráficos usan series de muestra, todas con apertura, máximo, mínimo, cierre y volumen: sintéticas, con la forma de un
ticker o de un kline, y reales de criptomonedas en varias temporalidades. Muestran cómo se comporta un indicador. No son el resultado de una estrategia.
