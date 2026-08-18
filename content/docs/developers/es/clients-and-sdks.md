---
title: Clientes y SDKs
description: Elige entre los SDKs de flujo y los clientes API de bajo nivel de QTSurfer.
order: 5
lastUpdated: '2026-08-18T20:02:23+02:00'
---

QTSurfer ofrece SDKs orientados a los flujos habituales y clientes de bajo nivel que siguen de cerca
la API HTTP. Elige la biblioteca de mayor nivel que te proporcione el control que necesitas.

## SDKs de flujo

- [SDK de Java](https://qtsurfer.github.io/sdk-java/) — flujos Java, autenticación y errores
  normalizados.
- [SDK de TypeScript](https://qtsurfer.github.io/sdk-ts/) — orquestación, polling, cancelación,
  errores normalizados y ejecución de backtests con una sola llamada.

Usa un SDK cuando quieras resolver la autenticación y las operaciones de varios pasos como un único
flujo.

## Clientes API generados

- [Cliente API de Java](https://qtsurfer.github.io/api-client-java/)
- [Cliente API de TypeScript](https://qtsurfer.github.io/api-client-ts/)
- [Cliente API de Python](https://qtsurfer.github.io/api-client-python/qtsurfer/api/client.html)

Usa un cliente API cuando quieras una operación tipada por endpoint y prefieras controlar el polling,
los reintentos y la composición de los flujos. El cliente TypeScript utiliza `fetch` nativo y es
compatible con Node.js 20 o posterior, navegadores modernos, Deno y Bun.

La documentación oficial no incluye actualmente un SDK de alto nivel para Python; utiliza
directamente el cliente API.
