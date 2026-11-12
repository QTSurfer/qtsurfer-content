---
title: Moving average convergence divergence (MACD)
description: "How the MACD turns two exponential averages into a momentum line with a signal line and a histogram, how its three periods change them, and how to use it in a QTSurfer strategy."
order: 2.2
lastUpdated: '2026-11-12T00:02:30Z'
---

The **moving average convergence divergence** (MACD) is the gap between a fast and a slow exponential moving average of
the price. Gerald Appel devised it. The gap is positive while the fast average is above the slow one, it grows as they
pull apart (the divergence) and shrinks as they come together (the convergence). A second average, of the gap itself,
gives a signal line to read it against.

Try it on a series below. Change the three periods and watch the line, the signal line, the histogram and the arrows
follow. The arrows mark where the MACD crosses its signal line, which is where the histogram changes sign.

<div data-indicator-demo="macd"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The
three lines are computed in your browser by the engine's own indicators, so they are the lines a strategy reads.

## What it computes

```text
MACD      = EMA(short) − EMA(long)        12 and 26 by default
signal    = EMA(MACD, 9)
histogram = MACD − signal
```

The MACD is above zero while the short average is above the long one, and it crosses zero where the two averages cross.
It is in the units of the price, so unlike the RSI it has no fixed range: it can only be compared with its own history,
and a figure that is large on one instrument says nothing on another. The signal line is an average of the MACD, so it
follows it with a delay, and the histogram is the gap between the two: it crosses zero where the MACD crosses its signal
line.

In QTSurfer, `macd` is the first line only, the difference of the two averages. The signal line and the histogram are two
more calls on the builder, an EMA that reads the MACD and the difference of the two, and the chart builds them that way.
Both averages start from the first price, so the line means little at first: the engine reports it ready once the slow
average has seen its periods, and the chart draws from that bar.

## Reading it

- **The crossing of the signal line.** When the MACD crosses above its signal line the histogram turns positive, and when
  it crosses below it turns negative. The arrows mark those bars. It is the classic reading, and it comes after the move:
  both lines are averages, so they lag the price.
- **The zero line.** The MACD crosses zero where the short and the long average cross, so this is the
  [EMA crossover](/learn/articles/ema-crossover) read from a different angle.
- **The histogram.** Its height says how far apart the MACD and its signal line are. A histogram that shrinks means the
  two are coming together, before they cross.
- **The periods are conventions.** 12, 26 and 9 are the usual ones. Shorter periods react sooner and cross more often,
  longer ones cross less often and later: on the real series of the chart, `6, 13, 5` crosses roughly twice as often as
  the default and `24, 52, 18` less than half as often.

## In a strategy

```
setup:
  macd("macd", 12, 26)
  ema("signal", "macd", 9)
  diff("hist", "macd", "signal")
```

These three lines of a QTScript file register `macd`, `signal` and `hist`. In Java, the same calls on the builder are
`.macd("macd", 12, 26)`, `.ema("signal", "macd", 9)` and `.diff("hist", "macd", "signal")`.

A window on the last of them acts on the crossing:

```
strategy "MACD cross"

setup:
  macd("macd", 12, 26)
  ema("signal", "macd", 9)
  diff("hist", "macd", "signal") window m1 {
    if (prev < 0 && actual >= 0) emitBuy(price);
    if (prev > 0 && actual <= 0) emitSell(price);
  }
```

The window sits on the histogram: `actual` is its value when the window closes and `prev` its value when the previous one
closed, so the two conditions are the MACD crossing above its signal line and crossing below it. The arrows of the chart
apply the same rule on every bar of the sample. It illustrates the syntax; it is not a recommendation.

The three periods are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and
[walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample,
which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [RSI](/docs/indicators/oscillators/rsi): the momentum oscillator with a fixed range, to read alongside it.
- [EMA](/docs/indicators/averages/ema): the average the MACD is the difference of.
- [EMA crossover](/learn/articles/ema-crossover): the trend-following rule the MACD is built from.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators):
  every indicator a strategy can call, with its forms and the names it registers.
