---
title: Strategies
description: What a strategy is, how revisions work, and how to create your first one.
order: 2
lastUpdated: '2026-08-18T20:27:48+02:00'
---

A strategy is a piece of **Java** code that reacts to market data and emits trading
signals. Every save creates a new **revision** — strategies are versioned, and every
backtest points at exactly one revision, so a result always names the exact code that
produced it.

## Create your first strategy

Open **Strategies → New** (or the "New" action on the Strategies card on the dashboard).
The flow is a four-step wizard, and you can go back to any earlier step without losing
what you entered.

### 1. Idea

Give the strategy a title and a description. The title identifies it across every future
revision — letters, numbers, spaces, and `. , _ / ( ) + & : -` are allowed. The description
is free text: what the strategy is trying to do and the reasoning behind it.

### 2. Generate

You don't have to write Java by hand. This step hands you a ready-made prompt — built from
the title and description you just entered plus a link to QTSurfer's official strategy
skill (the engine's API, signal format, and authoring conventions) — and three ways to turn
it into code:

- **Open Codex** or **Open Claude Code** — opens the assistant with the prompt copied to
  your clipboard, or use **Copy prompt** to paste it into any AI assistant yourself.
- **Advanced mode** — skip the assistant and write or paste Java directly.

The AI runs outside QTSurfer: generate the code there, then come back and paste it into the
next step.

### 3. Paste code

Paste the generated Java into the editor. **Load example** fills in a small working
reference strategy if you want to see the expected shape first — an EMA crossover:

```java
public class EmaCrossStrategy extends AbstractTickerStrategy {

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators
                .addPrice()
                .ema("fast", 20)
                .ema("slow", 50)
                .window("fast", WindowTime.s1, new CrossListener(indicators));
    }

    private class CrossListener extends AbstractWindowListener {
        @Override
        public void onChange(StateStore store, double prev, double actual) {
            double fast = indicators.getValue("fast");
            double slow = indicators.getValue("slow");
            InfoStrategySignal signal = createInfoSignal();

            if (fast > slow && !store.is("bullish")) {
                store.set("bullish");
                signal.set("_m", "shape", "arrowUp", "text", "BUY", "color", "#16a34a");
                emitSignal(signal);
            } else if (fast < slow && store.is("bullish")) {
                store.unset("bullish");
                signal.set("_m", "shape", "arrowDown", "text", "SELL", "color", "#dc2626");
                emitSignal(signal);
            }
        }
    }
}
```

### 4. Review

The strategy is only saved once the code **validates and compiles**. This step sends it to
the backend compiler; a failed compile keeps you on this step with the error message and
the offending line highlighted in the editor, so you can fix it and retry without losing
your work.

## After creation

- **Revisions** — editing a strategy again produces a new revision, never overwrites the
  old one. Every backtest and every marketplace listing points at a specific revision.
- **Share** — from your strategy list, **Share** opens the publishing flow for a revision:
  visibility, access model, and an optional price. See [Marketplace](/docs/app/marketplace).
- **Reference copies** — a strategy you picked up from the Marketplace is a read-only
  reference copy (no source, no edit/clone/new-revision) unless you bought a **CODE**
  listing — see Marketplace for the distinction.
