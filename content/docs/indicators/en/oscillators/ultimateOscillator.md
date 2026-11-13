---
title: "Ultimate oscillator"
description: "How the ultimate oscillator combines the buying pressure over 7, 14 and 28 bars with weights 4, 2 and 1, from 0 to 100, why it rarely reaches 70 or 30, and how to use it in a QTSurfer strategy."
order: 2.55
lastUpdated: '2026-11-13T21:28:19Z'
---

The **ultimate oscillator**, by Larry Williams, combines the buying pressure over three periods, 7, 14 and 28 bars, so that a single period does not decide. It runs from 0 to 100.

Try it on a series below. It has no parameter: the three periods are fixed.

<div data-indicator-chart="ultimateOscillator"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
BP  = close − min(low, previous close)                       the buying pressure of the bar
TR  = max(high, previous close) − min(low, previous close)   the true range of the bar
Avg_n = Σ BP over n bars / Σ TR over n bars
UO  = 100 × (4 × Avg₇ + 2 × Avg₁₄ + Avg₂₈) / 7
```

A period whose true ranges add up to 0 counts as 0. The first value is on update 29, when the 28 bars of the longest period are in, and the chart draws from there.

## Reading it

- **It reads 100 when every bar closes at its true high and 0 when every bar closes at its true low**, and 50 for bars that close in the middle of their range.
- **It stays in the middle.** On the real series of the chart it goes from 24 to 77, and it is above 70 on at most 1.8 % of the bars and below 30 on at most 1.8 %: the levels of 70 and 30 that are usually quoted are rarely reached with the three fixed periods.
- **The weights favour the short period**, which counts four times what the longest does, so it turns sooner than a single 28-bar reading would.

## In a strategy

```
uses pro.ultimateOscillator
setup:
  ultimateOscillator()
```

`ultimateOscillator()` registers `uo`. It has no form with parameters. In Java the class is `UltimateOscillatorRTIndicator`, in `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, and a group takes it with `indicators.add("uo", new UltimateOscillatorRTIndicator())`.

This is a pro indicator: it comes with the Pro and Elite plans, and a strategy brings it in with a `uses` line (see [the QTScript guide](/docs/strategies/qtscript#the-pro-indicators-uses)). It reads whole bars, so it belongs in a `kline` strategy.

## Related

- [RSI](/docs/indicators/oscillators/rsi): relative strength, between 0 and 100.
- [Williams %R](/docs/indicators/oscillators/williamsR): the close in the range of the last bars, from −100 to 0.
- [ATR](/docs/indicators/volatility/atr): the true range it is divided by.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
