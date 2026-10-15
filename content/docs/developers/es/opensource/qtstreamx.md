---
title: QTStreamX
description: Recibe en la JVM datos de mercado cripto normalizados — flujos WebSocket de exchanges y swaps de Uniswap tras un mismo conjunto de interfaces, con el códec, el cliente WebSocket y el transporte como módulos separados.
order: 9.2
lastUpdated: '2026-10-15T12:27:58Z'
---

**QTStreamX** es la biblioteca de código abierto de QTSurfer para recibir datos de mercado en la JVM.
Se conecta a los flujos WebSocket de los exchanges y a las pools de Uniswap v2 y v3 en cadena, y te
entrega los mismos registros normalizados sea cual sea el origen. Está publicada con licencia
Apache-2.0 en la [organización QTSurfer de GitHub](https://github.com/QTSurfer/qtstreamx) y requiere
JDK 25 o posterior.

La lógica de cada exchange, el cliente WebSocket, el códec y el transporte quedan detrás de
interfaces pequeñas, así que eliges las piezas que encajan con tu pila y cambias cualquiera sin tocar
el resto. El README del proyecto es la referencia de cada módulo; esta página es el mapa.

## Qué obtienes

- **Un único modelo de registros.** Tickers, klines, tasas de financiación y operaciones DEX son
  registros de Java con marcas de tiempo en microsegundos. Los instrumentos usan un nombre al estilo
  CCXT: `BTC/USDT` en spot y `BTC/USDT:USDT` en un perpetuo.
- **Siete exchanges.** Binance, Bybit, OKX, Kraken, Bitget, Gate.io y HTX, con pools de conexiones
  gestionadas, reconexión y refresco de instrumentos.
- **Uniswap v2 y v3.** Swaps confirmados y sin duplicados, con recuperación por HTTP y conmutación
  activo/pasivo entre proveedores, convertidos en operaciones, tickers de último precio y velas de un
  segundo.
- **Elige tus piezas.** Códecs JSON o MessagePack, el cliente WebSocket del propio JDK o
  Java-WebSocket, y un transporte NATS son módulos independientes.
- **Ligera por defecto.** El módulo central no tiene dependencias pesadas, y el cliente WebSocket del
  JDK no tiene ninguna.

## Módulos

La biblioteca es un conjunto de módulos; añade solo los que necesites.

| Área | Módulos |
|---|---|
| Núcleo | `qtstreamx-core` — los registros y las interfaces |
| Códecs | `qtstreamx-codec-json`, `qtstreamx-codec-msgpack` |
| Clientes WebSocket | `qtstreamx-ws-native` (JDK, sin dependencias), `qtstreamx-ws-javaws` |
| Transporte | `qtstreamx-transport-nats` |
| Exchanges | `qtstreamx-exchange-binance`, `-bybit`, `-okx`, `-kraken`, `-bitget`, `-gateio`, `-htx` |
| Muchos instrumentos | `qtstreamx-link` — reparte las suscripciones entre conexiones dentro de los límites del exchange, reconecta los enlaces caídos o en silencio y renueva los sockets antes de que caduquen |
| Agregación | `qtstreamx-market-aggregation` — tickers y velas por tiempo de evento a partir de operaciones |
| Uniswap | `qtstreamx-dex-core`, `-dex-uniswap-v2`, `-dex-uniswap-v3`, `-chain-evm-rpc`, `-dex-discovery-uniswap`, `-dex-capture-csv` |

La herramienta de línea de comandos para descubrir pools de Uniswap, un canario y un banco de
pruebas de rendimiento también están en el repositorio. Son módulos de código fuente y de aplicación,
no dependencias de biblioteca; la herramienta de línea de comandos se adjunta a cada versión de GitHub
para Linux, macOS y Windows.

## Instalar

Las bibliotecas se resuelven a través de [JitPack](https://jitpack.io/#QTSurfer/qtstreamx). Añade el
repositorio y los módulos que necesites, con una etiqueta publicada como versión:

```xml
<repositories>
  <repository>
    <id>jitpack.io</id>
    <url>https://jitpack.io</url>
  </repository>
</repositories>

<dependency>
  <groupId>com.qtsurfer.qtstreamx</groupId>
  <artifactId>qtstreamx-link</artifactId>
  <version><!-- una etiqueta de la página de versiones de GitHub --></version>
</dependency>
```

Solo las etiquetas de versión se construyen en JitPack, así que una rama o una versión `-SNAPSHOT` no
se resuelve. La [página de versiones](https://github.com/QTSurfer/qtstreamx/releases) lista las
etiquetas vigentes e indica si cada una es una versión candidata.

## Suscribirse a un flujo

Tickers spot de Binance con el cliente WebSocket del JDK, sin dependencias, usando
`qtstreamx-exchange-binance` y `qtstreamx-ws-native`:

```java
import com.qtsurfer.qtstreamx.core.client.StreamClientConfig;
import com.qtsurfer.qtstreamx.core.model.Instrument;
import com.qtsurfer.qtstreamx.exchange.binance.BinanceStreamClient;
import com.qtsurfer.qtstreamx.ws.jdk.JdkWebSocketClient;

var client = BinanceStreamClient.spot(StreamClientConfig.withDefaults(JdkWebSocketClient::new));
client.connect();
client.subscribeTicker(new Instrument("BTC", "USDT"), ticker -> System.out.println(ticker));
```

Todos los clientes de exchange implementan la misma interfaz `StreamClient`, así que pasar a otro
exchange cambia el cliente que construyes y nada de lo que viene después. Para muchos instrumentos,
usa `qtstreamx-link` en lugar de suscribirte uno a uno.

## Cambiar las piezas

Cada costura es una interfaz y cada implementación es un módulo:

| Interfaz | Implementaciones |
|---|---|
| `StreamCodec` | JSON (Jackson), MessagePack |
| `WebSocketClient` | `java.net.http.WebSocket` del JDK, Java-WebSocket |
| `TransportPublisher` / `TransportSubscriber` | NATS |
| `StreamClient` | Una por exchange |
| `MarketTradeStream` | Uniswap v2, Uniswap v3 |

Un flujo va del WebSocket del exchange a un `StreamClient`, de ahí a un registro, pasa por un
`StreamCodec` y sale por un `TransportPublisher`. Un suscriptor recorre el mismo camino a la inversa.

## Datos de mercado de Uniswap

QTStreamX lee swaps de Uniswap v2 y v3 de las pools que configuras de forma explícita. Combina la
recepción por WebSocket con la recuperación por HTTP, ordena y deduplica los registros, y libera un
evento solo cuando se cumple la política de confirmación que fijaste. Tras un reinicio o un cambio de
proveedor, reconcilia por HTTP antes de que se reanude la entrega en vivo, de modo que una operación
ni se pierde ni se entrega dos veces.

El orden de los tokens de una pool y la orientación del mercado se mantienen separados y explícitos:
una pool de USDC y WETH puede publicar el instrumento `WETH/USDC` sea cual sea el token que el
contrato liste primero, y cada mercado conserva su red, su venue y la dirección del contrato, así que
dos pools del mismo par nunca chocan.

Una biblioteca de descubrimiento y una herramienta de línea de comandos recorren las fábricas de
Uniswap y producen descriptores de pool tipados, acotados por una cabecera de bloque segura, listas de
tokens permitidos y límites de resultados. Nunca clasifican las pools ni te suscriben a los
resultados. Para una captura pequeña y duradera, la misma herramienta escribe en un archivo CSV las
operaciones confirmadas de una pool, con puntos de control que sobreviven a un reinicio.

La integración es de solo lectura de datos de mercado: no enruta órdenes, no firma transacciones ni
gestiona liquidez.

## Páginas relacionadas

- [Código abierto](/docs/developers/opensource) — todos los proyectos de código abierto de QTSurfer,
  con enlaces.
- [Lastra](/docs/developers/opensource/lastra) — el formato de archivo en el que la plataforma sirve
  los datos de mercado.
- [Ejecución en vivo](/docs/developers/api/live) — ejecutar una estrategia sobre un flujo en vivo,
  incluida una pool de Uniswap.
