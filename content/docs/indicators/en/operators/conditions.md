---
title: "Conditions"
description: "How the conditions isLessThan, isGreatThan and the rest compare an indicator with a number and give 1 or 0, how a strategy reads them with isValue, and how to use them in a QTSurfer strategy."
order: 11.01
---

A **condition** compares an indicator with a number and gives 1 while the comparison holds and 0 while it does not. There are six, one per comparison: `isEqual`, `isNotEqual`, `isGreatThan`, `isGreatOrEqual`, `isLessThan` and `isLessOrEqual`.

Try one below. The line over the price is an [EMA](/docs/indicators/averages/ema), the dashed line is the number it is compared with, and the bars under the chart are the condition: tall while it holds.

<div data-indicator-demo="conditions"></div>

The series are samples, synthetic ones and real crypto ones. They show how the conditions behave, not what a strategy earns. The lines are computed in your browser by the engine's own indicator classes, so they are the lines a strategy reads.

## What it computes

```text
isLessThan("name", "a", x)       1 if a <  x, else 0
isLessOrEqual("name", "a", x)    1 if a <= x, else 0
isGreatThan("name", "a", x)      1 if a >  x, else 0
isGreatOrEqual("name", "a", x)   1 if a >= x, else 0
isEqual("name", "a", x)          1 if a == x, else 0
isNotEqual("name", "a", x)       1 if a != x, else 0
```

Each takes three arguments: the name it registers, the indicator it reads and the number it compares with. Its result is an indicator like any other: a window can watch it and an [operator](/docs/indicators/operators) can read it. It is ready when the indicator it reads is.

## Reading it

- **A condition and its opposite add up to 1.** `isLessThan` and `isGreatOrEqual` are never both 1, and neither are `isEqual` and `isNotEqual`.
- **Equality of a price almost never holds.** The average of a price is a decimal number that is rarely exactly the one you chose, so `isEqual` is almost always 0 and `isNotEqual` almost always 1. Use `isLessOrEqual` or `isGreatOrEqual` to catch a level.
- **Read it with `isValue`, not with `value`.** In the body of a window, `isValue("name")` is `true` when the condition holds, and `false` when it does not or while the indicator it reads has no value yet. In that stretch `value("name")` can already read 1, so a rule that tests it fires too early. `isValue` takes the name of any indicator, not only a condition: it is `true` when the indicator has a value and that value is not 0.
- **A number, not an indicator.** The third argument is a number. To compare two indicators, take their [difference](/docs/indicators/operators) and compare that with 0.

## In a strategy

```
setup:
  rsi(14)
  isLessThan("oversold", "rsi14", 30)
  window oversold m1 {
    if (isValue("oversold")) emitBuy(price);
  }
```

That registers `oversold`, which holds while the RSI is below 30, and reads it with `isValue` in a window body. The complete strategy, with the state that keeps it from buying twice, is in [A condition: `isValue`](/docs/strategies/qtscript#a-condition-isvalue).

In Java they are the methods of the same names on the builder, and the listener has `isValue` too. A condition can also be made from a function with `isTrue("calm", "rsi14", v -> v > 40 && v < 60)`, which only Java can write: see [Conditions and `isValue`](/docs/strategies/java/strategy_coding#conditions-and-isvalue).

## Related

- [Operators](/docs/indicators/operators): `add`, `diff`, `mul`, `clamp` and `round`, which build an indicator out of others.
- [RSI](/docs/indicators/oscillators/rsi): the indicator most often compared with a level.
- [QTScript indicators](/docs/strategies/qtscript/indicators) and [Java indicators](/docs/strategies/java/indicators): every indicator a strategy can call, with its forms and the names it registers.
