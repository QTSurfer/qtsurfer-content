---
title: Clients and SDKs
description: Choose between QTSurfer workflow SDKs and low-level generated API clients.
order: 6
lastUpdated: '2026-09-23T16:04:42Z'
---

QTSurfer provides opinionated SDKs for common workflows and lower-level clients that map closely to
the HTTP API. Choose the highest-level library that still gives you the control you need.

## Workflow SDKs

- [Java SDK](https://github.com/QTSurfer/sdk-java) · [documentation](https://qtsurfer.github.io/sdk-java/) — Java workflows,
  authentication, normalized errors, and
  [live execution](https://github.com/QTSurfer/sdk-java/blob/main/docs/live.md) over WebSocket.
- [TypeScript SDK](https://github.com/QTSurfer/sdk-ts) · [documentation](https://qtsurfer.github.io/sdk-ts/) — workflow orchestration,
  polling, cancellation, normalized errors, a single-call backtest flow, and
  [live execution](https://github.com/QTSurfer/sdk-ts/blob/main/docs/live.md) over WebSocket.
- [Python SDK](https://github.com/QTSurfer/sdk-python) · [documentation](https://qtsurfer.github.io/sdk-python/) — Python workflows,
  authentication, token refresh, normalized errors, and
  [live execution](https://github.com/QTSurfer/sdk-python/blob/main/docs/live.md) over WebSocket.

Use an SDK when you want authentication and multi-step operations handled as one workflow.

## Generated API clients

- [Java API client](https://github.com/QTSurfer/api-client-java) · [documentation](https://qtsurfer.github.io/api-client-java/)
- [TypeScript API client](https://github.com/QTSurfer/api-client-ts) · [documentation](https://qtsurfer.github.io/api-client-ts/)
- [Python API client](https://github.com/QTSurfer/api-client-python) · [documentation](https://qtsurfer.github.io/api-client-python/qtsurfer/api/client.html)

Use an API client when you want one typed operation per endpoint and prefer to own polling, retries,
and workflow composition. The TypeScript client uses native `fetch` and supports Node.js 20 or later,
modern browsers, Deno, and Bun.
