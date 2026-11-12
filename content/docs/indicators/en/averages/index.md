---
title: "Averages"
description: "Moving averages of the price: the simple, exponential, weighted, double and triple exponential, Hull, modified, Kaufman's adaptive, Arnaud Legoux, fractal adaptive, least squares and McGinley averages."
order: 1
lastUpdated: '2026-11-12T18:10:40Z'
---

In the QTSurfer catalogues, the averages are `sma`, `ema`, `wma`, `tema`, `hma`, `mma`, `kama`, `dema`, `alma`, `frama`, `leastSquaresMovingAverage` and `mcGinleyDynamic`: averages of the last prices that smooth the price and follow it with a delay. They differ in how they weight the prices, and in how much delay they accept.

- [SMA](/docs/indicators/averages/sma): the mean of the last `N` prices, in the engine's discrete mode by default.
- [EMA](/docs/indicators/averages/ema): the exponential average, with weights that fall geometrically.
- [WMA](/docs/indicators/averages/wma): the weights of the last `N` prices fall in a straight line.
- [TEMA](/docs/indicators/averages/tema): three exponential averages combined to cut the lag.
- [HMA](/docs/indicators/averages/hma): weighted averages of three periods, for a close and smooth line.
- [MMA](/docs/indicators/averages/mma): Wilder's smoothing, an exponential average with a gentler weight.
- [KAMA](/docs/indicators/averages/kama): Kaufman's average, which adapts its speed to how straight the price moves.
- [DEMA](/docs/indicators/averages/dema): two exponential averages combined to cut the lag, at the price of some overshoot. A pro indicator.
- [ALMA](/docs/indicators/averages/alma): the last prices weighted by a bell curve whose peak the offset moves toward the latest price. A pro indicator.
- [FRAMA](/docs/indicators/averages/frama): an exponential average whose speed follows the fractal dimension of the price, so it runs on a straight line and nearly stops in a range. A pro indicator.
- [LSMA](/docs/indicators/averages/leastSquaresMovingAverage): the end of the straight line that best fits the last prices. A pro indicator.
- [McGinley Dynamic](/docs/indicators/averages/mcGinleyDynamic): an average that moves faster toward a price below it and slower toward one above it. A pro indicator.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
