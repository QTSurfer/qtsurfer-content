---
title: "Bollinger bandwidth"
description: "How the bandwidth gives the width of a Bollinger band in percent of its middle line, how to read it, and how to use it in a QTSurfer strategy."
order: 3.2
---

The **Bollinger bandwidth** is the width of a [Bollinger band](/docs/indicators/bands/bollinger) as a percentage of its middle line. It says how wide the band is next to the price.

Try it on a series below and change the periods and the multiplier of the band.

<div data-indicator-chart="bollingerBandwidth"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
bandwidth = 100 × (upper − lower) / middle
```

The bands are the ones of the Bollinger page: the middle is a simple average of `N` prices, and the upper and the lower are `k` standard deviations either side of it, with the deviation of a sample (dividing by `N − 1`). Where the band has no width, as on a price that does not move, the bandwidth reads 0. It is ready when the bands are, after `N` updates.

## Reading it

- **It follows the volatility of the price.** The band widens when the price spreads and narrows when it is quiet, so the bandwidth is a measure of volatility.
- **It is a percentage, so it can be compared** over time and between instruments, which the width of the band in price units cannot.
- **A narrow band says the market has been quiet.** It does not say which way the price will go when it stops being so.

## In a strategy

```
setup:
  bollinger(20, 2)
  bollingerBandwidth("blgr20_2")
```

The bandwidth measures a band that is registered first. `bollingerBandwidth("blgr20_2")` takes the name of the band, and registers `blgr20_2BW`. In Java, `.bollinger("bb", 20, 2.0)` and `.bollingerBandwidth("bb")` on the builder.

The periods and the multiplier are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Bollinger bands](/docs/indicators/bands/bollinger): the band itself, with its %B and its arrows.
- [Bollinger %B](/docs/indicators/bands/bollingerPercentB): where the price sits in the band.
- [Standard deviation](/docs/indicators/volatility/stdDev): the deviation the band is made of.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
