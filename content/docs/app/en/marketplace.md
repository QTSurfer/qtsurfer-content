---
title: Marketplace
description: Discover strategies shared by the community, and how to publish your own.
order: 5
lastUpdated: '2026-08-18T18:44:33Z'
---

The Marketplace is where strategies move between accounts: discover what other users have
published, evaluate a listing before taking it, and reuse it in your own backtests — or
publish one of your own strategies for others to find.

## Use a strategy from the Marketplace

1. Browse the catalog and open a listing to evaluate it.
2. **Free listings** — click **Use strategy** to add it straight to your platform.
3. **Premium listings** — require payment before the strategy is copied into your
   platform and you can run backtests with it.
4. Once it's in your platform, adapt parameters, instruments, and dates and run your own
   [backtest](/docs/app/backtesting) with it, same as any strategy you wrote yourself.

A strategy you picked up this way is a **reference copy**: it carries what it needs to
backtest and copy-trade, but not necessarily the source — whether you can read or edit the
code depends on the listing's **exposure** (see below).

## Publish a strategy

1. First, [create the strategy](/docs/app/strategies) — a clear title, and the code
   generated and compiled through the strategy editor.
2. Once it exists in your platform, open **Share** on the revision you want to publish
   (from the strategy list, or from the strategy itself).
3. In the sharing screen, choose:
   - **Revision** — exactly which one is published; publishing a later revision doesn't
     retroactively change what earlier buyers received.
   - **Visibility** — public or private.
   - **Exposure** — whether buyers get the source code or a compiled reference only.
   - **Price** — optional; leave unset for a free listing.
4. Publish. `Strategy.shared` flips on the moment at least one revision is public.

## Where results factor in

A track record sells a strategy better than a description does — the same [Sharpe ratio
and PnL](/docs/app/backtesting) figures the dashboard ranks internally are what makes a
listing worth taking.
