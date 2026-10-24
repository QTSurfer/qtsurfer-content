---
title: Clientes y SDKs
description: Elige entre los SDKs de flujo y los clientes API de bajo nivel de QTSurfer.
order: 6
lastUpdated: '2026-10-18T22:43:08Z'
---

QTSurfer ofrece SDKs orientados a los flujos habituales y clientes de bajo nivel que siguen de cerca
la API HTTP. Elige la biblioteca de mayor nivel que te proporcione el control que necesitas.

La documentación de referencia generada de todos los clientes está reunida en la página de
[documentación de referencia](https://www.qtsurfer.com/reference). Está en inglés.

## SDKs de flujo

- [SDK de Java](https://github.com/QTSurfer/sdk-java) · [documentación](https://www.qtsurfer.com/reference/sdk-java/latest/index.html) — flujos Java,
  autenticación, errores normalizados, y
  [ejecución en vivo](https://github.com/QTSurfer/sdk-java/blob/main/docs/live.md) por WebSocket.
- [SDK de TypeScript](https://github.com/QTSurfer/sdk-ts) · [documentación](https://www.qtsurfer.com/reference/sdk-ts/latest/index.html) — orquestación,
  polling, cancelación, errores normalizados, ejecución de backtests con una sola llamada, y
  [ejecución en vivo](https://github.com/QTSurfer/sdk-ts/blob/main/docs/live.md) por WebSocket.
- [SDK de Python](https://github.com/QTSurfer/sdk-python) · [documentación](https://www.qtsurfer.com/reference/sdk-python/latest/index.html) — flujos Python,
  autenticación, renovación de tokens, errores normalizados, y
  [ejecución en vivo](https://github.com/QTSurfer/sdk-python/blob/main/docs/live.md) por REST: ciclo de vida, señales
  retenidas y equity del paper; aún sin cliente WebSocket gestionado.

Usa un SDK cuando quieras resolver la autenticación y las operaciones de varios pasos como un único
flujo.

## Clientes API generados

- [Cliente API de Java](https://github.com/QTSurfer/api-client-java) · [documentación](https://www.qtsurfer.com/reference/api-client-java/latest/index.html)
- [Cliente API de TypeScript](https://github.com/QTSurfer/api-client-ts) · [documentación](https://www.qtsurfer.com/reference/api-client-ts/latest/index.html)
- [Cliente API de Python](https://github.com/QTSurfer/api-client-python) · [documentación](https://www.qtsurfer.com/reference/api-client-python/latest/qtsurfer/api/client.html)

Usa un cliente API cuando quieras una operación tipada por endpoint y prefieras controlar el polling,
los reintentos y la composición de los flujos. El cliente TypeScript utiliza `fetch` nativo y es
compatible con Node.js 20 o posterior, navegadores modernos, Deno y Bun.
