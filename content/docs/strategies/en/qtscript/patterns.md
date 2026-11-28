---
title: QTScript patterns
description: Apply reusable filters, exits, state transitions and gates in a QTScript strategy.
order: 9
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: 7c6e6ae7ab538e8e1988a1bfefaa55f0878e6201
upstreamPath: skills/qtsurfer-qtscript-strategy/references/patterns.md
lastUpdated: '2026-11-28T18:24:14Z'
---

Patterns that recur in strategies that have run for real, written as complete `.qtscript` files: paste one, change the numbers,
and it compiles. They are the QTScript side of the [Java strategy patterns](/docs/strategies/java/patterns), with the
same names where the idea is the same. The language is in [the QTScript guide](/docs/strategies/qtscript); whole strategies, one per data source, are in
[the examples](/docs/strategies/qtscript/examples).

Every file is a `ticker` strategy that reads `price`, and every number is a `param`, so a sweep can search it. The values are
starting points, not recommendations: they come from a strategy on a one-second feed, and another instrument or another window
period wants its own. None of these files is a strategy to run as it stands: each one shows a piece, and a backtest of it alone on
one day will not be profitable. The bodies are plain Java, as everywhere in QTScript; `store` is the instrument's own state (see
[Inside a body](/docs/strategies/qtscript#inside-a-body)).

## Noise filtering chain

Turns a raw indicator into a clean, smoothed signal:

```
raw signal
  → clamp (inside ±band → 0)         suppress micro-noise
    → percent change                  rate of change of what is left
      → conditional average           only a non-zero change moves it
```

The Java version of this pattern uses a `clamp` with a function and a `conditional`, and QTScript cannot write either on a `setup:`
line. The distance stays a `setup:` line; the three stages are written in the body, and the average is kept in the `store`:

```qtscript
strategy "Noise filtering chain"

param noiseBand  = 0.1  "Distance inside +/- this is noise (percent)"
param smoothN    = 20   "Length of the average, counted in non-zero changes"
param enterAbove = 0.05 "Smoothed change that opens a position"

setup:
  ema(60)
  ema(500)
  distance("distEmas", "ema60", "ema500")
  window distEmas s1 {
    // 1. clamp: inside the band the distance is noise and reads as 0
    double clean = Math.abs(actual) <= noiseBand ? 0.0 : actual;

    // 2. percent change of the cleaned distance
    double before = (Double) store.getState("clean", 0.0);
    store.setState("clean", clean);
    double change = before == 0.0 ? 0.0 : (clean - before) / Math.abs(before) * 100.0;

    // 3. conditional average: a zero change leaves it where it was
    double smooth = (Double) store.getState("smooth", 0.0);
    if (change != 0.0) {
      smooth += 2.0 / (smoothN + 1) * (change - smooth);
      store.setState("smooth", smooth);
    }

    if (smooth > enterAbove && !store.is("long")) {
      store.set("long");
      emitBuy(price);
    }
    if (smooth < -enterAbove && store.is("long")) {
      store.unset("long");
      emitSell(price);
    }
  }
```

**Why:** the distance between two EMAs is too noisy to decide on as it comes. Feeding the average only with real changes keeps the
long stretches where nothing moves from diluting it with zeros.

---

## EMA distance analysis

Use the **distance between EMAs** as the primary signal instead of raw EMA values. A distance is a derivative: it measures the
momentum of the trend, not the trend itself.

```qtscript
strategy "EMA distance entry"

param entryDist = 0.35 "Medium-term distance needed to enter (percent)"
param minStreak = 300  "Consecutive gains of the macro EMA needed"

setup:
  ema(60)
  ema(500)
  ema(2500)
  ema(7500)
  distance("shortDist", "ema60", "ema500")     // short-term momentum
  distance("longDist", "ema500", "ema2500")    // medium-term trend
  gain("macroGain", "ema7500")                 // macro uptrend
  window shortDist s1 {
    if (store.is("long")) {
      if (actual < 0) {                              // the short-term momentum has turned
        store.unset("long");
        emitSell(price);
      }
      return;
    }
    if (value("longDist") < entryDist) return;       // the trend is there
    if (actual <= prev) return;                      // and the momentum is rising
    long macroStreak = ((GainRTIndicator) indicators.getExisting("macroGain")).getPeriodCount();
    if (macroStreak < minStreak) return;             // and so is the macro picture
    store.set("long");
    emitBuy(price);
  }
```

**Entry gate:** `longDist >= entryDist` and `shortDist` rising and the macro streak `>= minStreak`. The value of a `gain` is the
size of its last rise, not a count: the streak of consecutive rises is the indicator's own counter, `getPeriodCount()`, which a
body reads through `indicators` with the cast the Java strategies use. One momentum condition, one trend
condition and one guard against false positives is the rule of thumb for a gate: a single indicator rarely deserves a trade on its
own.

The long EMAs need a long run to settle (the 7500-tick one is two hours of one-second data): let a backtest start well before
the range you care about.

---

## Trailing exit variants

All three share the same entry here, an EMA crossing, so that only the exit differs.

### Midpoint trailing

Sells when the gain retraces to the midpoint between the minimum threshold and the peak gain. It calibrates itself to the size of
the move.

```qtscript
strategy "Midpoint trailing exit"

param trailFrom = 0.5 "Gain below which the trail does not apply (percent)"

setup:
  ema(20)
  ema(50)
  window price s1 {
    if (!store.is("long")) {
      if (value("ema20") > value("ema50")) {
        store.set("long");
        store.setState("buyPrice", price);
        store.setState("peakGain", 0.0);
        emitBuy(price);
      }
      return;
    }
    double buyPrice = (Double) store.getState("buyPrice", price);
    double pcnGain = (price - buyPrice) / buyPrice * 100.0;
    double peak = Math.max((Double) store.getState("peakGain", 0.0), pcnGain);
    store.setState("peakGain", peak);
    double trigger = peak - (peak - trailFrom) / 2.0;
    if (pcnGain > trailFrom && pcnGain <= trigger) {
      store.unset("long");
      emitSell(price);
    }
  }
```

### Peak trailing

Simpler, and good for faster scalps: sells when the price falls a fixed percentage from the highest price since the entry.

```qtscript
strategy "Peak trailing exit"

param trailPct = 1.0 "Fall from the peak that closes the position (percent)"

setup:
  ema(20)
  ema(50)
  window price s1 {
    if (!store.is("long")) {
      if (value("ema20") > value("ema50")) {
        store.set("long");
        store.setState("peakPrice", price);
        emitBuy(price);
      }
      return;
    }
    double peak = Math.max((Double) store.getState("peakPrice", price), price);
    store.setState("peakPrice", peak);
    if ((peak - price) / peak * 100.0 >= trailPct) {
      store.unset("long");
      emitSell(price);
    }
  }
```

### EMA gain reset

Sells when the exit EMA stops rising: the momentum is spent. The streak counter reads 0 on the first windows after the entry, so the
position is given a few windows before the exit applies.

```qtscript
strategy "EMA gain exit"

param holdWindows = 3 "Windows the position is held before the exit applies"

setup:
  ema(20)
  ema(50)
  gain("exitGain", "ema50")
  window price s1 {
    if (!store.is("long")) {
      if (value("ema20") > value("ema50")) {
        store.set("long");
        store.reset("held");
        emitBuy(price);
      }
      return;
    }
    long streak = ((GainRTIndicator) indicators.getExisting("exitGain")).getPeriodCount();
    if (store.inc("held") > holdWindows && streak == 0) {
      store.unset("long");
      emitSell(price);
    }
  }
```

---

## Conditional stop-loss

A macro-aware stop-loss, which avoids stopping out during a healthy dip: it fires only when the position is losing **and** the
macro trend is also weakening.

```qtscript
strategy "Conditional stop-loss"

param enterDist = 0.2  "Medium-term distance that opens a position (percent)"
param maxLoss   = 0.5  "Loss that arms the stop (percent)"
param weakDist  = 0.01 "Macro distance under which the trend counts as weakening (percent)"

setup:
  ema(500)
  ema(2500)
  distance("longDist", "ema500", "ema2500")
  window price s1 {
    if (!store.is("long")) {
      if (value("longDist") >= enterDist) {
        store.set("long");
        store.setState("buyPrice", price);
        emitBuy(price);
      }
      return;
    }
    double buyPrice = (Double) store.getState("buyPrice", price);
    double pcnGain = (price - buyPrice) / buyPrice * 100.0;
    if (pcnGain < 0 && Math.abs(pcnGain) >= maxLoss && value("longDist") < weakDist) {
      store.unset("long");
      emitSell(price);
    }
  }
```

**Why:** a plain stop sells every dip of a trend that is still healthy. Asking for the macro context to be weak as well reduces the
false stops in markets that are volatile but trending. The cost is that a loss with a strong macro trend is allowed to run: pair it
with an exit that does not depend on the macro (a trailing one, above) if that matters.

---

## Re-entry protection (the "fail" state)

Blocks new entries after a losing trade until the macro context has fully reset. The entry window and the reset check are two
windows on the same instrument, and they talk through the `store`:

```qtscript
strategy "Re-entry protection"

param stopPct = 1.0 "Loss that closes the position and arms the block (percent)"

setup:
  ema(200)
  ema(1000)
  window price s1 {
    if (!store.is("long")) {
      if (store.is("fail")) return;                 // blocked until the macro context resets
      if (value("ema200") > value("ema1000")) {
        store.set("long");
        store.setState("buyPrice", price);
        emitBuy(price);
      }
      return;
    }
    double buyPrice = (Double) store.getState("buyPrice", price);
    if ((price - buyPrice) / buyPrice * 100.0 <= -stopPct) {
      store.unset("long");
      store.set("fail");
      emitSell(price);
    }
  }
  window ema200 m1 {
    // the reset: the short EMA has fallen under the long one, a whole cycle has passed
    if (store.is("fail") && actual < value("ema1000")) store.unset("fail");
  }
```

**Why:** it prevents revenge trading after a stop. Requiring `ema200 < ema1000` before the block lifts makes a full macro cycle
complete before the strategy can enter again, instead of re-entering the same falling market a minute later.

---

## Shared state between windows

Every window of an instrument shares one `store`: an entry window can set a flag and an exit window with another period reads it
straight away, with nothing to wire. Here the two windows are named sections, each with its own period:

```qtscript
strategy "Entry and exit windows"

param exitDrop = 0.3 "Fall from the entry price that closes the position (percent)"

setup:
  ema(10)
  window ema10 Entry
  window price Exit

window Entry s1 {
  if (actual > prev && !store.is("inPosition")) {
    store.set("inPosition");
    store.setState("entry", price);
    emitBuy(price);
  }
}

window Exit s5 {
  if (!store.is("inPosition")) return;
  double entry = (Double) store.getState("entry", price);
  if ((entry - price) / entry * 100.0 >= exitDrop) {
    store.unset("inPosition");
    emitSell(price);
  }
}
```

**Why:** the entry decision and the exit decision rarely want the same clock. The store is the only thing they share, and it is
the instrument's own, so two instruments running this strategy never see each other's flag. State that belongs to the strategy as a
whole is `$globalStore` (see [The global store](/docs/strategies/qtscript#the-global-store-globalstore)).

---

## Volatility gate

Prevents entries during low-activity periods, and during the warm-up of the volatility indicator itself, when its values do not
mean anything yet:

```qtscript
strategy "Volatility gate"

param volWindow = 30    "Ticks the volatility is measured over"
param minVol    = 0.01  "Volatility (percent) below which the market is too quiet"
param warmup    = 120   "Windows skipped while the indicator settles"

setup:
  ema(20)
  ema(100)
  percentVolatility(volWindow)
  isLessThan("quiet", "pvol" + volWindow, minVol)
  window ema20 s1 {
    if (store.inc("windows") < warmup) return;   // warm-up: nothing is decided yet
    if (isValue("quiet")) return;                // the market is not active enough
    if (actual > value("ema100") && !store.is("long")) {
      store.set("long");
      emitBuy(price);
    }
    if (actual < value("ema100") && store.is("long")) {
      store.unset("long");
      emitSell(price);
    }
  }
```

**Why:** a crossing in a market that is hardly moving is mostly spread and rounding. Reading the gate as a condition
(`isValue`, see [A condition: `isValue`](/docs/strategies/qtscript#a-condition-isvalue)) keeps it to one line in the entry window, and the window counter does the
job of the Java `clampUpdates(n)`: the first `warmup` windows are ignored.

---

## What stays in Java

Two patterns of the Java catalogue have no QTScript version, because QTScript has no `update()` and a window body works for one
instrument:

- **Cross-instrument (market-wide) strategies**: reading another instrument's indicators needs the full class and `update(Ticker)`.
  A backtest sees only the instrument it was prepared for, so such a strategy is a live one. What QTScript has is
  `$globalStore`, state shared by the whole strategy, which is enough for a count or a flag across instruments but not for reading
  their indicators.
- **OPS-based instrument activity** (operations per second per instrument): it counts every tick, and a window only fires when its
  period closes.

Both are in the [Java strategy patterns](/docs/strategies/java/patterns).
