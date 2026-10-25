---
title: Clients and SDKs
description: Choose between QTSurfer workflow SDKs and low-level generated API clients.
order: 6
lastUpdated: '2026-10-24T14:57:08Z'
---

QTSurfer provides opinionated SDKs for common workflows and lower-level clients that map closely to
the HTTP API. Choose the highest-level library that still gives you the control you need.

The generated reference documentation of every client is gathered on the
[reference documentation](https://www.qtsurfer.com/reference) page.

## Workflow SDKs

- [Java SDK](https://github.com/QTSurfer/sdk-java) · [documentation](https://www.qtsurfer.com/reference/sdk-java/latest/index.html) — Java workflows,
  authentication, normalized errors, and
  [live execution](https://github.com/QTSurfer/sdk-java/blob/main/docs/live.md) over WebSocket.
- [TypeScript SDK](https://github.com/QTSurfer/sdk-ts) · [documentation](https://www.qtsurfer.com/reference/sdk-ts/latest/index.html) — workflow orchestration,
  polling, cancellation, normalized errors, a single-call backtest flow, and
  [live execution](https://github.com/QTSurfer/sdk-ts/blob/main/docs/live.md) over WebSocket.
- [Python SDK](https://github.com/QTSurfer/sdk-python) · [documentation](https://www.qtsurfer.com/reference/sdk-python/latest/index.html) — Python workflows,
  authentication, token refresh, normalized errors, and
  [live execution](https://github.com/QTSurfer/sdk-python/blob/main/docs/live.md) over REST — lifecycle, retained
  signals and paper equity; no managed WebSocket client yet.

Use an SDK when you want authentication and multi-step operations handled as one workflow.

## Generated API clients

- [Java API client](https://github.com/QTSurfer/api-client-java) · [documentation](https://www.qtsurfer.com/reference/api-client-java/latest/index.html)
- [TypeScript API client](https://github.com/QTSurfer/api-client-ts) · [documentation](https://www.qtsurfer.com/reference/api-client-ts/latest/index.html)
- [Python API client](https://github.com/QTSurfer/api-client-python) · [documentation](https://www.qtsurfer.com/reference/api-client-python/latest/qtsurfer/api/client.html)

Use an API client when you want one typed operation per endpoint and prefer to own polling, retries,
and workflow composition. The TypeScript client uses native `fetch` and supports Node.js 20 or later,
modern browsers, Deno, and Bun.
