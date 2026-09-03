---
title: EMA crossover
description: Learn how an exponential moving average crossover strategy works, why it lags and whipsaws, which parameters matter, and how to implement and sweep it in QTSurfer.
order: 11
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

An **EMA crossover** strategy holds a position when a fast exponential moving average is above a
slow one and exits, or reverses, when it drops below. It is the simplest trend-following rule
that can be written down completely, which is why it is the standard first strategy: two
parameters, one signal, no discretion, and every failure mode of trend following visible in
miniature.

It is not a strategy anyone expects to be profitable as written. It is the reference point against
which filters, exits, and sizing rules are measured.

## The exponential moving average

A simple moving average weights the last `N` prices equally. An exponential moving average weights
recent prices more, with weights decaying geometrically:

```text
α       = 2 / (N + 1)
EMA_t   = α · price_t + (1 − α) · EMA_(t−1)
```

`N` is the nominal period. An EMA with `N = 20` gives the latest price a weight of about `9.5 %`
and never fully forgets any earlier price, which makes it smoother than a 20-period SMA at the
same responsiveness, and cheaper to compute: each update needs only the previous value.

The EMA lags the price by construction. Smoothing is the removal of recent information, and the
slower the average, the later it reacts.

## The crossover rule

```text
fast = EMA(price, N_fast)
slow = EMA(price, N_slow)          with N_fast < N_slow

enter long   when fast crosses above slow
exit         when fast crosses below slow
```

Common pairs are `9/21`, `12/26`, `20/50`, and `50/200`, the last one known as the golden cross
and death cross on daily charts. The numbers are conventions, not findings.

### Behaviour in trends and ranges

In a sustained trend the fast average stays on one side of the slow one, the position is held, and
the strategy captures most of the move minus the lag at entry and exit. In a ranging market the
averages cross repeatedly around each other, and each cross is a round trip that pays costs for a
small or negative move. This is the **whipsaw**, and it is the dominant cost of every crossover
strategy.

The parameter choice trades one against the other: shorter periods enter trends earlier and
whipsaw more; longer periods whipsaw less and give back more of each trend at the turns.

## Worked example

Prices over ten updates, `N_fast = 3` and `N_slow = 5`, both averages seeded at the first price:

```text
t   price   fast(3)   slow(5)   state
1   100.0   100.00    100.00    —
2   101.0   100.50    100.33    fast > slow
3   103.0   101.75    101.22    long
4   102.0   101.88    101.48    long
5   100.0   100.94    100.99    fast < slow → exit
6    99.0    99.97    100.33    flat
7   101.0   100.48    100.55    flat
8   104.0   102.24    101.70    fast > slow → long
9   105.0   103.62    102.80    long
10  104.0   103.81    103.20    long
```

The first entry at `t = 2` catches a small rise, exits at `t = 5` after the pullback for a loss
once costs are included, and re-enters at `t = 8` into the larger move. That is the whole
character of the rule in ten rows: it pays for the false start to be present for the real one.

## Making it usable

- **Trend filter.** Only take longs when price, or the slow average, is above a much slower
  reference. Removes many of the whipsaws in ranges at the cost of late entries.
- **Minimum separation.** Require the averages to be apart by a threshold, in percent or in
  volatility units, before acting. A cross that barely happens is noise.
- **Confirmation.** Act on the cross only if it still holds after a short window rather than on
  the first tick that crosses.
- **Volatility gate.** Trade only when a volatility measure is inside a range; both dead and
  violent markets are bad for the rule.
- **Separate exits.** A trailing stop or a time-based exit often beats waiting for the reverse
  cross, which returns a large part of every trend.

Each addition is a parameter, and every parameter is a way to fit the sample. Add one at a time
and check that it improves results out of sample, not just on the window it was tuned on.

## Common mistakes

- **Optimising the periods finely.** The response to `N_fast` and `N_slow` is smooth; a sweep with
  steps of `1` mostly measures noise. Use coarse steps and look for a plateau.
- **Ignoring costs.** The crossover trades often in ranges, and a cost-free backtest hides the
  whipsaw's price entirely.
- **Testing on a single trending window.** The rule looks excellent on any strong trend. The test
  is how it behaves across regimes.
- **Sweeping combinations where the fast period is not shorter.** A grid over both periods
  includes points with `N_fast ≥ N_slow`, which are a different strategy or none at all. Guard
  against them in code or discard them from the results.
- **Confusing the reverse cross with a good exit.** It is the exit that requires no extra
  parameter, not the one that keeps the most profit.

## EMA crossover in QTSurfer

The crossover is the reference strategy in QTSurfer's documentation, and both of its natural
implementations are shown there. A ticker-driven strategy sets up the two averages once:

```java
@Override
protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
    indicators.addPrice().ema("fast", 9).ema("slow", 21);
}
```

Indicators are incremental: each update costs the same regardless of the period, and values are
read back by name. The cross can be detected in the per-tick update loop, comparing the current
relation with the previous one, or in a **window listener** that runs on a fixed schedule with a
`CrossDetector`, which is the pattern that avoids reacting to every intra-second flicker.

To make the periods sweepable, declare them as strategy properties:

```java
@StrategyProperty(name = "ema.fast", description = "Fast EMA period", defaultValue = "9")
private int fastPeriod = 9;

@StrategyProperty(name = "ema.slow", description = "Slow EMA period", defaultValue = "21")
private int slowPeriod = 21;
```

Properties are injected before the indicators are set up, and compiling the strategy returns them
as `declaredProperties`, so a sweep can be written against known keys:

```json
"params": {
  "ema.fast": {"from": 5,  "to": 20,  "step": 5},
  "ema.slow": {"from": 20, "to": 100, "step": 20}
}
```

Read the result through the sensitivity view before the leaderboard. A crossover that only works at
one exact pair of periods has found a coincidence; the useful outcome is a region of the grid
where the plateau score holds, and a walk-forward run to see whether the winning region stays put
from fold to fold.

The complete examples, including the update-loop and window-listener variants, are in the
developer guide.

## Related concepts

- [Parameter sweep](parameter-sweep) — how to explore the two periods without selecting noise.
- [Slippage](slippage) — the cost the whipsaw pays on every false start.
- [Overfitting](overfitting) — why each added filter is also a way to fit the sample.
- Developer guides: [Strategy examples](/docs/developers/strategy-examples), [Java
  indicators](/docs/developers/java-indicators), [Strategy
  patterns](/docs/developers/strategy-patterns).
- Product guide: [Strategies](/docs/app/strategies).
