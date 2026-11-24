---
title: "Operators"
description: "How to add, subtract, multiply, limit and round indicators in a QTSurfer strategy, with the names each operator registers."
order: 11
lastUpdated: '2026-11-22T19:06:11Z'
---

The operators build an indicator out of others: `add`, `diff`, `mul`, `clamp` and `round`. Each reads indicators by their names, so register those first, and its result is an indicator like any other: a window can watch it and another operator can read it. They have no chart, since they draw whatever they are given.

| Operator | What it computes | With no name of its own it registers |
| --- | --- | --- |
| `add("a", "b")` | `a + b` | `addab` |
| `diff("a", "b")` | `a − b` | `diffab` |
| `mul("a", "b")` | `a × b` | `mulab` |
| `mul("a", 2)` | `a × 2` | `mula` |
| `clamp("a", 0, 100)` | `a`, held between 0 and 100 | `clmpa` |
| `round("a", 2)` | `a`, rounded to 2 decimals | `rounda` |

Every one also takes the name to register as its first argument: `diff("gap", "a", "b")` registers `gap`.

## What to watch

- **Give each one a name.** The default name carries the inputs and not the numbers, so `mul("price", 2)` and `mul("price", 3)` both register `mulprice`, and the second one registered replaces the first. The engine logs a warning when a name starts to read a different indicator, but it does not stop.
- **A half rounds upwards**, also below zero: 2.5 rounds to 3 and −2.5 to −2.
- **They are ready when what they read is**, so an operator over an average waits for the average.
- **A difference is in the units of its inputs.** To compare instruments, use the [distance](/docs/indicators/change/distance), which is a percentage.

## In a strategy

```
setup:
  ema(9)
  ema(21)
  diff("gap", "ema9", "ema21")
  round("gapRounded", "gap", 2)
```

That registers the gap between the two averages and the same rounded to two decimals. In Java they are the methods of the same names on the builder, and `clamp` also takes a condition and the value to put when it holds.

The catalogues have them with their forms: [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators).
