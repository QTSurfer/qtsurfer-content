---
title: "Kaufman's adaptive moving average (KAMA)"
description: "How Kaufman's adaptive moving average follows the price fast when it moves in one direction and slowly when it zigzags, what its three periods set, and how to use it in a QTSurfer strategy."
order: 1.7
---

**Kaufman's adaptive moving average** (KAMA), by Perry Kaufman, changes how fast it follows the price: quickly when the price moves in one direction, slowly when it zigzags.

Try it on a series below. Change the efficiency period and the fast and slow periods; the fast one stays below the slow one.

<div data-indicator-chart="kama"></div>

The series are samples, synthetic ones and real crypto ones. They show how the indicator behaves, not what it earns. The line is computed in your browser by the engine's own indicator class, so it is the line a strategy reads.

## What it computes

```text
ER   = |price − price N ago| / (|change₁| + … + |changeₙ|)       the efficiency ratio, 0 to 1
SC   = (ER × (fast − slow) + slow)²       fast = 2 / (fast period + 1), slow = 2 / (slow period + 1)
KAMA = previous KAMA + SC × (price − previous KAMA)
```

`N` is the efficiency period, 10 by default; the fast and slow periods are 2 and 30. The efficiency ratio is 1 when the price has moved straight and 0 when it has gone nowhere. With the defaults the average closes `(2/3)² ≈ 44 %` of the gap to the price at each update on a straight line, and `(2/31)² ≈ 0.4 %` on a zigzag. The first `N` prices pass through unchanged, and the engine starts the formula, and reports the average ready, on the next one.

## Reading it

- **It adapts to the kind of move.** In a straight move it hugs the price, and in a sideways one it almost stands still.
- **The three periods have three jobs.** The efficiency period is how far back it looks to judge the direction, and the fast and slow periods are the limits of its smoothing.

## In a strategy

```
setup:
  kama()
```

`kama()` registers `kama10_2_30`, the three periods being 10, 2 and 30. `kama(10, 2, 30)` says them, and `kama("name", 10, 2, 30)` names the line. In Java, `.kama()` on the builder.

The three periods are parameters, so a [parameter sweep](/learn/articles/parameter-sweep) can explore them, and [walk-forward analysis](/learn/articles/walk-forward-analysis) tells you whether what it found holds outside the sample, which is the defence against [overfitting](/learn/articles/overfitting).

## Related

- [Exponential moving average](/docs/indicators/averages/ema): the exponential average, with a smoothing that does not adapt.
- [Simple moving average](/docs/indicators/averages/sma): the simple average.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
