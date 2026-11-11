---
title: Bollinger bands
description: "How the Bollinger bands wrap the price in a band that widens and narrows with its volatility, what the %B and the bandwidth read from it, and how to use them in a QTSurfer strategy."
order: 5
---

**Bollinger bands** draw a band around a moving average of the price. The band is a number of standard deviations of the
price either side of the average, so it widens when the price is volatile and narrows when it is quiet. John Bollinger
devised them.

Try it on a series below. Change the periods and the multiplier. The pane under the price shows the %B, where the price
sits in the band: 0 at the lower band and 1 at the upper one. The arrows mark where the price comes back inside the band
after being outside it.

<div data-indicator-demo="bollinger"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The
lines are computed in your browser by the engine's own indicators, so they are the lines a strategy reads.

## What it computes

```text
middle = SMA(N)                        20 by default
upper  = middle + k × s                k = 2 by default
lower  = middle − k × s
%B     = (price − lower) / (upper − lower)
width  = 100 × (upper − lower) / middle
```

`s` is the standard deviation of the last `N` prices. The engine divides by `N − 1`, the deviation of a sample, and not by
`N`. That makes its bands `√(N / (N − 1))` wider than those of a tool that divides by `N`: about 2.6 % wider with 20
periods. Keep it in mind when you compare the engine with another tool.

The %B is 0 at the lower band, 0.5 at the middle and 1 at the upper band, and it is below 0 or above 1 when the price is
outside the band. The width, the bandwidth, is a percentage of the middle line: how wide the band is next to the price,
which is what lets you compare it over time and between instruments.

## Reading it

- **The bands are not limits.** With 20 periods and `k = 2`, about one close in ten of the real series of the chart falls
  outside the bands, more than the 5 percent a normal distribution would leave outside two standard deviations. The
  multiplier decides how often: with `k = 1` about half of the closes are outside and with `k = 3` about one in a
  hundred.
- **In a trend the price rides a band.** The closes can stay above the upper band, or below the lower one, for a long
  time. On the trending ticker series of the chart, the closes above the upper band outnumber those below the lower one
  many times over.
- **The arrows mark the way back inside.** They show the price coming back into the band after being outside it, the
  reading of a market that returns to its mean. It misfires in a trend, where the price rides the band and does not
  return.
- **The bandwidth and the squeeze.** A narrow band says the market has been quiet. It does not say which way the price
  will go when it stops being so. This is the bandwidth on its own:

<div data-indicator-chart="bollingerBandwidth"></div>

## In a strategy

```
setup:
  bollinger(20, 2)
  bollingerPercentB(20, 2)
  bollingerBandwidth("blgr20_2")
```

These three lines of a QTScript file register `blgr20_2`, `blgr20_2Upper` and `blgr20_2Lower` (the band), `pctB20_2` (the
%B) and `blgr20_2BW` (the bandwidth). In Java, `.bollinger("bb", 20, 2.0)` registers `bb`, `bbUpper` and `bbLower`, and
`.bollingerBandwidth("bb")` registers the width of that band.

A window on the %B acts on the way back inside the band:

```
strategy "Bollinger re-entry"

setup:
  bollingerPercentB(20, 2) window m1 {
    if (prev < 0 && actual >= 0) emitBuy(price);
    if (prev > 1 && actual <= 1) emitSell(price);
  }
```

`actual` is the %B when the window closes and `prev` its value when the previous one closed, so the first condition is the
price coming back above the lower band and the second one coming back below the upper band. The arrows of the chart
apply the same rule on every bar of the sample. It illustrates the syntax; it is not a recommendation.

The periods and the multiplier are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them,
and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the
sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [RSI](/docs/indicators/oscillators/rsi) and [MACD](/docs/indicators/oscillators/macd): the oscillators, to read alongside
  the bands.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators):
  every indicator a strategy can call, with its forms and the names it registers.
