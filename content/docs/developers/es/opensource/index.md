---
title: Código abierto
description: Índice de los proyectos de código abierto que QTSurfer publica en GitHub — clientes y SDK de la API, el servidor MCP y las skills de estrategia, el formato de datos Lastra y sus herramientas, el streaming de datos de mercado, un componente de gráficos, y el contrato y la documentación de la API.
order: 9
lastUpdated: '2026-10-07T21:03:06Z'
---

QTSurfer publica como código abierto las bibliotecas, los formatos y las herramientas que rodean a la
plataforma, en la [organización QTSurfer de GitHub](https://github.com/QTSurfer). Esta página los
indexa: para qué sirve cada proyecto, dónde encontrarlo y qué página de esta documentación lo cubre
con más detalle. El código se publica bajo la licencia Apache-2.0; la prosa de la documentación de
`qtsurfer-content` es CC BY 4.0. El README de cada repositorio indica sus propios términos y es la
referencia para ellos.

## Clientes y SDKs

Habla con la API de QTSurfer desde tu propio código. Los SDK envuelven la API en flujos de trabajo
completos; los clientes de API se generan a partir del contrato OpenAPI y se corresponden uno a uno
con sus endpoints. Consulta [Clientes y SDKs](/docs/developers/clients-and-sdks) para elegir entre
ellos.

- [sdk-java](https://github.com/QTSurfer/sdk-java) — el SDK de Java. Autenticación, el flujo de
  compilar, preparar y ejecutar con reintentos y cancelación, ejecución en vivo por WebSocket y
  errores normalizados. Se publica a través de JitPack.
- [sdk-ts](https://github.com/QTSurfer/sdk-ts) — el SDK de TypeScript, con la misma orquestación del
  flujo, un flujo de backtest en una sola llamada y ejecución en vivo. En npm como `@qtsurfer/sdk`.
- [sdk-python](https://github.com/QTSurfer/sdk-python) — el SDK de Python, con orquestación del flujo,
  renovación del token al caducar y un almacén de tokens intercambiable. En PyPI como `qtsurfer-sdk`.
- [api-client-java](https://github.com/QTSurfer/api-client-java) — el cliente Java generado para la
  API REST. Se publica a través de JitPack.
- [api-client-ts](https://github.com/QTSurfer/api-client-ts) — el cliente TypeScript generado:
  totalmente tipado, compatible con tree-shaking y basado en el `fetch` nativo. En npm como
  `@qtsurfer/api-client`.
- [api-client-python](https://github.com/QTSurfer/api-client-python) — el cliente Python generado.
  En PyPI como `qtsurfer-api-client`.

## Asistentes de IA

- [mcp-java](https://github.com/QTSurfer/mcp-java) — el servidor de Model Context Protocol de
  QTSurfer. Expone la cuenta, la ejecución en vivo, los backtests y los datos de mercado como
  herramientas para cualquier asistente compatible con MCP, por entrada y salida estándar. La
  instalación y la lista de herramientas están en [Servidor MCP](/docs/developers/mcp-server).
- [strategy-skills](https://github.com/QTSurfer/strategy-skills) — skills de agente para escribir,
  revisar y depurar estrategias de QTSurfer en Java y en QTScript. Siguen el formato abierto Agent
  Skills, así que funcionan con Claude Code, Codex, Cursor, Cline y otros agentes que lo admiten. Las
  [guías de estrategias](/docs/developers/java-strategies) de esta documentación se generan a partir
  de ellas.

## Lastra y formatos de datos

Los segmentos horarios de datos de mercado que sirve QTSurfer son ficheros que puedes conservar,
consultar y convertir. El formato Lastra, sus lectores y escritores, y los conversores son abiertos.
Consulta [Lastra](/docs/developers/opensource/lastra) para ver el camino
más corto desde un segmento descargado hasta un DataFrame, una consulta SQL o un fichero Parquet.

- [lastra-java](https://github.com/QTSurfer/lastra-java) — la implementación de referencia de
  **Lastra**, un formato de fichero columnar para series temporales numéricas, con un códec por
  columna, grupos de filas y comprobaciones de integridad CRC32. También contiene la especificación
  del formato en disco. Se publica a través de JitPack.
- [lastra-py](https://github.com/QTSurfer/lastra-py) — un lector y escritor de Python, compatible bit
  a bit con la implementación Java. En PyPI como `lastra`.
- [lastra-ts](https://github.com/QTSurfer/lastra-ts) — un lector de TypeScript para el navegador y
  Node.js, con interoperabilidad con Apache Arrow. En npm como `@qtsurfer/lastra`.
- [duckdb-lastra](https://github.com/QTSurfer/duckdb-lastra) — una extensión de DuckDB que consulta
  ficheros `.lastra` como tablas con filtrado por marca de tiempo, incluidos ficheros remotos mediante
  peticiones de rango HTTP.
- [lastra-convert](https://github.com/QTSurfer/lastra-convert) — un conversor de línea de comandos,
  con una API Java, entre Lastra, Parquet y CSV.
- [lastra-convert-py](https://github.com/QTSurfer/lastra-convert-py) — la versión en Python, que
  también convierte Apache Arrow. En PyPI como `lastra-convert`.
- [alp-java](https://github.com/QTSurfer/alp-java) — una implementación en Java, sin dependencias, de
  ALP, la compresión adaptativa sin pérdida de coma flotante que Lastra usa en columnas decimales
  como los precios. Sigue el algoritmo publicado por Afroozeh y Boncz (SIGMOD 2024).
- [alp-py](https://github.com/QTSurfer/alp-py) — la implementación en Python de ALP, compatible byte a
  byte con `alp-java`. En PyPI como `alp-codec`.
- [parquet-lite](https://github.com/QTSurfer/parquet-lite) — una biblioteca Java para leer y escribir
  ficheros Apache Parquet sin el árbol de dependencias de Hadoop. Es una bifurcación de
  [strategicblue/parquet-floor](https://github.com/strategicblue/parquet-floor). Se publica a través
  de JitPack.

## Streaming de datos de mercado

- [qtstreamx](https://github.com/QTSurfer/qtstreamx) — streaming normalizado de datos de mercado para
  la JVM. Los flujos WebSocket de los exchanges y los swaps de Uniswap en cadena quedan detrás de un
  mismo conjunto de interfaces y de un único modelo de registros (tickers, klines, tasas de
  financiación, operaciones), y el códec, el cliente WebSocket y el transporte son módulos separados
  que puedes intercambiar.

## Visualización

- [svelte-timeseries](https://github.com/QTSurfer/svelte-timeseries) — un componente de Svelte para
  explorar series temporales muy grandes en el navegador. Lee Parquet, Arrow y Lastra mediante
  DuckDB-WASM, y dibuja con Apache ECharts o con TradingView Lightweight Charts, con marcadores y
  eventos superpuestos. En npm como `@qtsurfer/svelte-timeseries`, con una
  [demo en vivo](https://qtsurfer.github.io/svelte-timeseries).

## Contrato y documentación de la API

- [qtsurfer-api](https://github.com/QTSurfer/qtsurfer-api) — la especificación OpenAPI, el contrato
  AsyncAPI del WebSocket de ejecución en vivo y las guías en Markdown en las que se basa la
  [sección de la API](/docs/developers/api) de esta documentación. La referencia interactiva está
  publicada en [qtsurfer.github.io](https://qtsurfer.github.io).
- [qtsurfer-engine-java-docs](https://github.com/QTSurfer/qtsurfer-engine-java-docs) — la referencia
  publicada de la API de Java para los tipos que usa quien escribe una estrategia: las clases base de
  estrategia, el modelo de datos de mercado, el catálogo de indicadores y los modelos de comisiones,
  slippage y ejecución. Se puede consultar en este sitio como
  [referencia de la API de Java](/docs/developers/java-api).
- [qtsurfer-content](https://github.com/QTSurfer/qtsurfer-content) — el origen de la documentación,
  los artículos de Learn y el glosario de este sitio, en todos los idiomas publicados. Acepta
  correcciones mediante pull requests.
