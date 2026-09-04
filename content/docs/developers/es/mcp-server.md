---
title: Servidor MCP
description: Ejecuta QTSurfer desde un asistente de IA — instala el servidor Model Context Protocol, conéctalo a Claude Code o Codex con una clave de API, y usa sus herramientas para datos de mercado, conjuntos de datos, backtests y barridos.
order: 8
lastUpdated: '2026-09-04T10:18:11Z'
---

El servidor MCP de QTSurfer expone el backtesting y los datos de mercado como herramientas sobre
el [Model Context Protocol](https://modelcontextprotocol.io), de modo que un asistente compatible
con MCP puede listar exchanges, enviar una estrategia, ejecutar un barrido y leer los resultados
sin salir de la conversación. Se publica como
[QTSurfer/mcp-java](https://github.com/QTSurfer/mcp-java) bajo Apache-2.0, habla JSON-RPC 2.0
sobre la entrada y salida estándar, y está respaldado por el [SDK de
Java](https://github.com/QTSurfer/sdk-java), que gestiona la autenticación y la orquestación de
compilar, preparar y ejecutar, con reintentos y cancelación.

## Instalación

En Linux y macOS, el instalador detecta la plataforma y elige un binario nativo (Linux x86_64,
Apple Silicon) o un fat JAR con un script envoltorio (otras arquitecturas, Java 21 o posterior):

```bash
curl -fsSL https://raw.githubusercontent.com/QTSurfer/mcp-java/main/install.sh | bash
```

En Windows:

```powershell
irm https://raw.githubusercontent.com/QTSurfer/mcp-java/main/install.ps1 | iex
```

El fat JAR se ejecuta en cualquier sitio con JDK 21 o posterior, y se publica una imagen Docker
como `ghcr.io/qtsurfer/mcp-java`. Cada release en GitHub lleva las tres entregas; fija una versión
con la variable `VERSION` cuando la reproducibilidad importe.

## Autenticación

Genera una clave de API de larga duración en la aplicación web de QTSurfer y pásala al servidor
mediante la variable de entorno `QTSURFER_APIKEY` o la opción `--apikey`. Al arrancar, el servidor
intercambia la clave por un token de corta duración y lo renueva durante toda la vida del proceso.
Si la clave falta o se rechaza, el servidor termina con un error claro antes de exponer ninguna
herramienta, así que el fallo aparece en la lista de servidores del asistente en lugar de como un
error de herramienta confuso más adelante.

## Conectar un asistente

Claude Code lee `~/.claude.json`:

```json
{
  "mcpServers": {
    "qtsurfer": {
      "type": "stdio",
      "command": "/path/to/qtsurfer-mcp",
      "env": { "QTSURFER_APIKEY": "<your-api-key>" }
    }
  }
}
```

OpenAI Codex lee `~/.codex/config.toml`:

```toml
[mcp_servers.qtsurfer]
command = "/path/to/qtsurfer-mcp"

[mcp_servers.qtsurfer.env]
QTSURFER_APIKEY = "<your-api-key>"
```

Para el fat JAR, el comando es `java` con `-jar /path/to/qtsurfer-mcp-java.jar` como argumentos;
para Docker, `docker run -i --rm -e QTSURFER_APIKEY ghcr.io/qtsurfer/mcp-java:latest`. Cualquier
otro cliente MCP que admita servidores stdio se configura de la misma forma.

## Herramientas

| Área | Herramientas | Qué hacen |
|---|---|---|
| Datos de mercado | `list_exchanges`, `list_instruments`, `download_tickers`, `download_klines` | Descubrir exchanges e instrumentos con sus ventanas de cobertura; transmitir un segmento de una hora UTC a un fichero local. |
| Conjuntos de datos | `upload_dataset`, `list_datasets`, `get_dataset`, `get_dataset_upload`, `finalize_dataset_upload`, `delete_dataset` | Crear o versionar un conjunto de datos a partir de un CSV local, sondear su ingesta y gestionarlo. |
| Estrategias | `list_strategies`, `get_strategy_code`, `delete_strategy` | Inspeccionar y liberar las estrategias registradas en la cuenta. |
| Backtests | `submit_backtest`, `get_job_status`, `get_equity_curve`, `list_jobs` | Compilar código fuente Java y ejecutarlo contra un instrumento o un conjunto de datos listo; leer métricas y una curva de equity submuestreada. |
| Barridos | `submit_sweep`, `get_sweep_status`, `get_sweep_sensitivity`, `get_sweep_run_equity_curve`, `cancel_sweep` | Ejecutar una cuadrícula de parámetros, opcionalmente validada con walk-forward; leer la clasificación ordenada por meseta, las marginales de sensibilidad y las curvas retenidas. |

`submit_backtest` recibe el código fuente Java completo de la clase de estrategia como
`strategyCode`; la compilación ocurre en la plataforma. Para una ejecución sobre un conjunto de
datos, pasa `datasetId` y omite el exchange y el instrumento. `submit_sweep` bloquea hasta que la
plataforma ha compilado la estrategia, preparado la sesión y aceptado el barrido, lo que en una
ventana larga tarda lo mismo que tarde la preparación.

Un barrido a través de MCP es el mismo objeto que un barrido a través de la API, lo cual importa
porque no es un bucle de backtests: la clasificación se ordena por meseta, cada fila lleva un
ratio de Sharpe deflactado, el barrido informa de una probabilidad de sobreajuste del backtest,
los pliegues walk-forward se puntúan fuera de muestra, y las marginales de sensibilidad dicen si
un eje movió el objetivo en absoluto. Consulta [Barridos de
parámetros](/docs/developers/api/backtest_sweep) para la semántica.

## Ficheros locales: subidas y descargas

Subir un conjunto de datos y descargar datos de mercado tocan el sistema de ficheros local, así
que cada una está desactivada hasta que se le da un directorio raíz: `--upload-root` (o
`QTSURFER_UPLOAD_ROOT`) para ficheros de conjunto de datos legibles, y `--download-root` (o
`QTSURFER_DOWNLOAD_ROOT`) para la salida de segmentos escribible. Las rutas se canonicalizan y
deben permanecer bajo su raíz; los escapes por symlink o por recorrido de directorios se rechazan;
las descargas se escriben a través de un fichero temporal y nunca sobrescriben uno existente salvo
que se pida. La herramienta de subida solo devuelve identificadores de conjunto de datos e
ingesta, nunca la URL de almacenamiento de corta duración.

Con Docker, monta el directorio de subida como solo lectura y un directorio de descarga separado
como escribible:

```bash
docker run -i --rm -e QTSURFER_APIKEY \
  -e QTSURFER_UPLOAD_ROOT=/uploads -e QTSURFER_DOWNLOAD_ROOT=/downloads \
  -v "$PWD/datasets:/uploads:ro" -v "$PWD/exports:/downloads" \
  ghcr.io/qtsurfer/mcp-java:latest
```

## Una sesión típica

```text
> list_exchanges
> list_instruments exchangeId=binance
> submit_backtest exchangeId=binance instrument=BTC/USDT from=2026-05-10 to=2026-05-16 strategyCode=<Java source>
> get_job_status jobId=<id>
> submit_sweep exchangeId=binance instrument=BTC/USDT from=2026-01-01 to=2026-03-31 params={"rsiPeriod":{"from":7,"to":28,"step":1}}
> get_sweep_status sweepId=<id>
> get_sweep_sensitivity sweepId=<id>
```

El asistente rellena el fuente de la estrategia, normalmente generado con la [skill de
estrategia](https://github.com/QTSurfer/strategy-skills), y lee los resultados de vuelta como
texto. Las métricas siguen la [referencia de métricas](/docs/developers/metrics-reference); el
servidor representa los ratios como porcentajes en sus resúmenes para que se lean mejor.

## Opciones

```text
--url    <base-url>    API base URL (default: https://api.qtsurfer.net/v1)
--apikey <key>         Long-lived API key (default: QTSURFER_APIKEY)
--upload-root <dir>    Permit dataset upload files only beneath this directory
--download-root <dir>  Permit market-data output only beneath this directory
--stub                 In-memory stub, no backend required
```

El modo stub ejecuta la superficie de herramientas contra datos en memoria, lo cual basta para
comprobar la configuración de un asistente antes de gastar una clave de API.

## Páginas relacionadas

- [Estrategias en Java](/docs/developers/java-strategies) — el modelo de estrategia contra el que
  escribe el asistente.
- [Modelo de ejecución de un backtest](/docs/developers/backtest-execution-model) — qué orquestan
  las herramientas.
- [Clientes y SDKs](/docs/developers/clients-and-sdks) — el SDK sobre el que está construido el
  servidor.