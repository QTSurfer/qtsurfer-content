---
id: strategies
title: Strategies
description: Write a QTSurfer strategy in Java, the language of the engine, or in QTScript, a compact language that becomes a Java class, and see how the two relate.
order: 0
lastUpdated: '2026-11-02T14:41:16Z'
---

A strategy is the part of QTSurfer that decides when to buy or sell: it watches indicators on a market feed and
emits signals. You can write one in two languages, and from the moment you submit it the platform treats them the
same way.

## Java, the language of the engine

A Java strategy is a plain Java class that extends one of the engine's strategy base classes. It is the established
route and has the full engine API: indicators configured on the builder, window listeners, state, signals with their
order parameters and, when a strategy needs them, `update()` on every tick, logic across instruments, custom indicator
classes and helper types.

- [Java strategies](/docs/strategies/java): the model, base classes, setup, state, signals and properties.
- [Java indicators](/docs/strategies/java/indicators): the catalogue of free and pro indicators, and how to write your own.
- [Strategy patterns](/docs/strategies/java/patterns) and [strategy examples](/docs/strategies/java/examples).
- [Coding Java strategies](/docs/strategies/java/strategy_coding): the Java authoring guide of the API.

## QTScript, the newer one

QTScript is a compact language for the same strategies, in beta. You keep the part that is yours, the indicators, the
windows and the signals, and leave out the ceremony of a Java class: package, imports, class, base class, property
annotations and listener boilerplate. Every `{ }` body is plain Java, so whatever the Java API offers inside a body
works unchanged. It will gain syntax.

```
strategy "RSI reversion"

param rsiLow  = 30  "Oversold"
param rsiHigh = 70  "Overbought"

instruments */usdt

setup:
  rsi(14) window m1 {
    if (actual < rsiLow)  emitBuy(price);
    if (actual > rsiHigh) emitSell(price);
  }
```

- [QTScript](/docs/strategies/qtscript): the language, the parts of a file, windows and parameters.
- [QTScript indicators](/docs/strategies/qtscript/indicators): every indicator a QTScript strategy can call.

## How they relate

QTScript is not a second engine. A QTScript file becomes exactly one Java class and goes through the same server-side
compilation as a Java strategy, so everything that is true of a Java strategy once it is compiled is true of a QTScript
one.

- **The same indicators.** The lines under `setup:` are calls on the indicator builder that a Java strategy configures in
  `setupIndicators`. The pro indicators are in both languages, and need a plan that includes them in both.
- **The same data sources.** A strategy reads tickers, klines or funding rates, in either language.
- **The same way in.** You send the raw source to [`POST /strategy`](/docs/developers/api/strategy), as `text/plain`, for
  both. There is no separate endpoint: the platform tells them apart by the text, since a QTScript source starts with
  `strategy`.
- **The same runs.** Once registered, a strategy is validated, backtested, swept and run live whichever language it was
  written in.

## What QTScript leaves to Java

By design, and each one is a reason to write the strategy in Java instead:

- **No `update()`**: windows are the model, so a strategy that has to see every tick belongs in Java.
- **No logic across instruments.**
- **No custom indicator classes**, no extra fields or methods beyond what the sections declare, and no strategies with
  several sources.
- **One class**: anything that wants helper types is a Java strategy.

Switching is never a dead end: a `.qtscript` file is a Java class with the ceremony left out.

## Where to start

| Your strategy                                                                 | Write it in                                                       |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| A handful of indicators and the rules for their windows                       | QTScript                                                          |
| Needs every tick, other instruments, an indicator of your own or helper types | Java                                                              |
| Started in QTScript and outgrew it                                            | Java: the file already is a Java class with the ceremony left out |
