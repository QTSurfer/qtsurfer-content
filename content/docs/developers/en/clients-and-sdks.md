---
title: Clients and SDKs
description: Choose between QTSurfer workflow SDKs and low-level generated API clients.
order: 5
lastUpdated: '2026-08-18T20:02:23+02:00'
---

QTSurfer provides opinionated SDKs for common workflows and lower-level clients that map closely to
the HTTP API. Choose the highest-level library that still gives you the control you need.

## Workflow SDKs

- [Java SDK](https://qtsurfer.github.io/sdk-java/) — Java workflows, authentication, and normalized
  errors.
- [TypeScript SDK](https://qtsurfer.github.io/sdk-ts/) — workflow orchestration, polling,
  cancellation, normalized errors, and a single-call backtest flow.

Use an SDK when you want authentication and multi-step operations handled as one workflow.

## Generated API clients

- [Java API client](https://qtsurfer.github.io/api-client-java/)
- [TypeScript API client](https://qtsurfer.github.io/api-client-ts/)
- [Python API client](https://qtsurfer.github.io/api-client-python/qtsurfer/api/client.html)

Use an API client when you want one typed operation per endpoint and prefer to own polling, retries,
and workflow composition. The TypeScript client uses native `fetch` and supports Node.js 20 or later,
modern browsers, Deno, and Bun.

There is currently no high-level Python SDK listed in the official documentation; Python developers
should use the API client directly.
