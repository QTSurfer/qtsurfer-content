---
title: "Distance and change"
description: "How far one value is from another, and how much a value changed since the update before: the change rate, the percent change and the two distances."
order: 9
lastUpdated: '2026-11-22T19:06:11Z'
---

In the QTSurfer catalogues, the indicators of distance and change are `rateChange`, `percentChange`, `distance` and `distanceMa`: small building blocks that turn one or two values into a relative measure, which compares across instruments. They read an indicator by its name, such as `price`, and work in a `ticker` or a `kline` strategy.

- [Change rate](/docs/indicators/change/rateChange): the change since the update before, as a fraction.
- [Percent change](/docs/indicators/change/percentChange): the same change, in percent.
- [Distance](/docs/indicators/change/distance): how far one indicator is from another, in percent of the other.
- [Distance from an average](/docs/indicators/change/distanceMa): how far the price is from its moving average, in percent of the average.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
