---
title: Laboratory
description: A visual sandbox to iterate on strategy logic before it becomes code.
order: 4
lastUpdated: '2026-08-18T20:02:23+02:00'
---

Laboratory is where you experiment before committing to a written strategy. Instead of
Java, you build logic visually in the **Strategy Studio** editor, running against a real,
specific slice of market data — not a live feed, a fixed snapshot you choose up front.

## Create a laboratory

Open **Laboratory → New**. Before the Studio opens, pick what it runs against:

- **Exchange** and **instrument** — the market the snapshot comes from.
- **Data type** — tickers or klines.
- **Date and hour** — a specific historical window. Only windows QTSurfer already has data
  for are selectable; use **Load** to fetch a new one.
- **Run configuration** — execution settings for the Studio (defaults come from the
  exchange, and can be overridden per laboratory).

Once loaded, the Studio opens with that data available, and you iterate on the logic
directly inside it — no separate save step per change.

## Why use it instead of writing code directly

Laboratory trades completeness for speed of iteration: you're working against one fixed
window of real data with instant visual feedback, rather than round-tripping through the
strategy wizard's compile step for every change. It's the place to answer "does this idea
have any signal at all" before spending a revision on it in
[Strategies](/docs/app/strategies).

## Saving your work

A laboratory persists its state (the visual logic, as an IR — intermediate representation)
under its own title, independent of any strategy. Editing it later reopens the Studio with
that same state. It doesn't produce a strategy revision on its own — when an idea is ready,
take what you learned into **Strategies → New** and generate or write the real thing.
