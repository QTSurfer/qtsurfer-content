---
title: "Averages"
description: "Moving averages of the price: the simple, exponential, weighted, triple exponential, Hull, modified and Kaufman's adaptive averages."
order: 1
lastUpdated: '2026-11-12T00:02:30Z'
---

In the QTSurfer catalogues, the averages are `sma`, `ema`, `wma`, `tema`, `hma`, `mma` and `kama`: averages of the last prices that smooth the price and follow it with a delay. They differ in how they weight the prices, and in how much delay they accept.

- [SMA](/docs/indicators/averages/sma): the mean of the last `N` prices, in the engine's discrete mode by default.
- [EMA](/docs/indicators/averages/ema): the exponential average, with weights that fall geometrically.
- [WMA](/docs/indicators/averages/wma): the weights of the last `N` prices fall in a straight line.
- [TEMA](/docs/indicators/averages/tema): three exponential averages combined to cut the lag.
- [HMA](/docs/indicators/averages/hma): weighted averages of three periods, for a close and smooth line.
- [MMA](/docs/indicators/averages/mma): Wilder's smoothing, an exponential average with a gentler weight.
- [KAMA](/docs/indicators/averages/kama): Kaufman's average, which adapts its speed to how straight the price moves.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
