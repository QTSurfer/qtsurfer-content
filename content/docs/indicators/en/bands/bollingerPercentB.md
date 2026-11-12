---
title: "Bollinger %B"
description: "How the %B tells where the price sits in a Bollinger band, 0 at the lower band and 1 at the upper one, how to read it, and how to use it in a QTSurfer strategy."
order: 3.3
---

The **Bollinger %B** tells where the price sits in a [Bollinger band](/docs/indicators/bands/bollinger): 0 at the lower band, 1 at the upper band, and outside that range when the price is outside the band.

Try it on a series below and change the periods and the multiplier of the band.

<div data-indicator-chart="bollingerPercentB"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
%B = (price − lower) / (upper − lower)
```

The bands are the ones of the Bollinger page. The %B is 0.5 when the price is on the middle line, below 0 when it is under the lower band and above 1 when it is over the upper one. Where the band has no width, as on a price that does not move, it reads 0. It is ready when the bands are, after `N` updates.

## Reading it

- **It is a position, not a price.** It reads the same on any instrument, so a level of it can be used across instruments, which a level of the price cannot.
- **0 and 1 are the bands.** The %B leaves that range when the price closes outside them, and the arrows of the [Bollinger page](/docs/indicators/bands/bollinger) mark where it comes back in.
- **On the real series of the chart about one close in ten is outside the bands** with 20 periods and `k = 2`, so a %B below 0 or above 1 is not rare.

## In a strategy

```
setup:
  bollingerPercentB(20, 2)
```

`bollingerPercentB(20, 2)` registers `pctB20_2`, and builds the bands it needs inside. In Java, `.bollingerPercentB()` registers the same, for 20 periods and a multiplier of 2.

## Related

- [Bollinger bands](/docs/indicators/bands/bollinger): the band itself, with its arrows and a strategy that reads the %B.
- [Bollinger bandwidth](/docs/indicators/bands/bollingerBandwidth): how wide the band is.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
