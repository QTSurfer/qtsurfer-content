---
title: Programar estrategias en Java
description: Emite señales de operación e información, configura órdenes y adjunta metadatos de gráfico.
order: 5.1
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 848593e88be3b80078c6f98d7cb582f22fd87853
upstreamPath: docs/strategy_coding.md
lastUpdated: '2026-09-04T00:00:00Z'
---

Una estrategia de QTSurfer consume datos de mercado, actualiza indicadores y estado, y emite
señales. Esta guía se centra en la emisión de señales: el punto donde una observación se convierte
en una instrucción de operar o en un dato para inspeccionar más tarde.

Para la API completa de clases, usa el [Javadoc del motor][engine-javadoc], en particular el
[paquete de señales de estrategia][signal-javadoc]. Para redactar con ayuda de un agente, instala
la skill mantenida [`qtsurfer-java-strategy`][strategy-skill]:

```bash
npx skills add QTSurfer/strategy-skills --skill qtsurfer-java-strategy
```

La skill también cubre cómo elegir una clase base de estrategia, configurar indicadores, gestionar
el estado por instrumento y el subconjunto de Java que acepta el compilador de estrategias. Una vez
listo el fuente, [compílalo y valídalo a través de la API](strategy).

## Señales de ejecución y señales de información

Estas familias de señales tienen efectos distintos:

| Señal | Propósito | ¿Causa una operación? |
|---|---|---|
| `BuySignal` | Expresa una instrucción de compra y su configuración de orden | Sí |
| `SellSignal` | Expresa una instrucción de venta y su configuración de orden | Sí |
| `InfoStrategySignal` | Registra indicadores, diagnósticos o metadatos de visualización | No |

Una señal de información etiquetada `BUY` sigue siendo solo información. A la inversa,
`emitBuy(price)` emite una señal de compra ejecutable aunque no lleve metadatos de gráfico
adjuntos.

El [ejemplo del README](https://github.com/QTSurfer/qtsurfer-api/blob/848593e88be3b80078c6f98d7cb582f22fd87853/README.md#strategy-example) emite deliberadamente ambas. Publica una
señal de información en cada actualización de ventana para poder inspeccionar la serie de
indicadores, pero solo emite una compra o venta cuando cruzan las medias móviles:

```java
InfoStrategySignal signal = createInfoSignal();
signal.set("fast", fast);
signal.set("slow", slow);

if (isBullish && !wasBullish) {
    emitBuy(price);
} else if (!isBullish && wasBullish) {
    emitSell(price);
}

emitSignal(signal);
```

## Helpers de señal

Dentro de un `AbstractWindowListener`, el listener ya conoce su estrategia y su instrumento:

| Helper | Resultado |
|---|---|
| `emitBuy(price)` | Crea y emite de inmediato una `BuySignal` de mercado |
| `emitSell(price)` | Crea y emite de inmediato una `SellSignal` de mercado |
| `createBuySignal(price)` | Crea una señal de compra para personalizarla antes de emitirla |
| `createSellSignal(price)` | Crea una señal de venta para personalizarla antes de emitirla |
| `createInfoSignal()` | Crea una señal de información para rellenarla antes de emitirla |
| `emitInfo(key, values...)` | Crea, rellena y emite de inmediato una señal de información |
| `emitSignal(signal)` | Emite una señal creada o personalizada por el listener |

A nivel de la clase de estrategia, los helpers de operación equivalentes reciben el instrumento de
forma explícita: `emitBuy(instrument, price)`, `emitSell(instrument, price)`,
`createBuySignal(instrument, price)` y `createSellSignal(instrument, price)`. Usa
`createInfoStrategySignal(instrument)` cuando construyas ahí una señal de información.

El `price` que se pasa a los helpers de operación inmediatos es el precio de referencia actual de
la estrategia. La señal es `market` por defecto; cuando una señal cambia a `limit`, ese precio pasa
a ser su precio límite.

## Personalizar señales de compra y venta

Los helpers inmediatos aceptan deliberadamente solo un precio. Para configurar una orden, crea su
señal, fija las opciones necesarias y emítela exactamente una vez:

```java
import com.wualabs.qtsurfer.engine.exchange.trade.OrderFlag;
import com.wualabs.qtsurfer.engine.strategy.event.signal.BuySignal;
import com.wualabs.qtsurfer.engine.strategy.event.signal.MarketHintSignal.OrderKind;

BuySignal buy = createBuySignal(price);
buy.setOrderKind(OrderKind.limit);
buy.setMaxTries(3);
buy.setFlags(OrderFlag.GTC);
buy.set("reason", "ema-cross");
emitSignal(buy);
```

`BuySignal` y `SellSignal` heredan estas opciones de [`MarketHintSignal`][market-hint-javadoc], la
clase base común y referencia autorizada de sus métodos:

| Método | Significado |
|---|---|
| `setOrderKind(OrderKind.market)` | Orden a mercado; es el valor por defecto |
| `setOrderKind(OrderKind.limit)` | Orden límite al `price` de la señal |
| `setMaxTries(n)` | Número máximo de intentos para una compra límite; `n` debe ser positivo |
| `setFlags(flags...)` | Indicadores de orden como `FOK`, `IOC` o `GTC`; el soporte real depende del exchange |
| `setSellPercent(percent)` | Porcentaje de la posición a cerrar; pensado para ejecución multi-entrada, por defecto `100` |
| `setStopPrice(price)` | Stop de protección fijo que se arma tras ejecutarse la entrada |
| `setStopLimitPrice(price)` | Precio límite opcional para ese stop fijo; sin él, el stop sale a mercado |
| `setTrailPercent(percent)` | Stop de protección dinámico, expresado como porcentaje desde el extremo de precio favorable en curso |
| `setStopCondition(condition)` | Predicado en vivo que condiciona un stop fijo o dinámico gestionado por el motor |
| `set(key, values...)` | Metadatos arbitrarios de analítica, procedencia o visualización que viajan con la señal |

Trata `stop` y `stopTrailing` como tipos de orden gestionados por el motor. El código de la
estrategia debe expresar el riesgo de protección en la señal de entrada con `setStopPrice` o
`setTrailPercent`, en lugar de emitir una orden de stop independiente.

### Stops de protección

Una entrada en largo puede armar un stop fijo como parte de la misma señal:

```java
BuySignal buy = createBuySignal(price);
buy.setStopPrice(price * 0.95);
emitSignal(buy);
```

Usa también `setStopLimitPrice` cuando la salida de protección deba ser stop-limit en lugar de
stop-market. Un stop dinámico sigue el extremo favorable y se dispara tras el retroceso
porcentual configurado:

```java
BuySignal buy = createBuySignal(price);
buy.setTrailPercent(2.0);
emitSignal(buy);
```

Los mismos campos se aplican de forma simétrica a una entrada en corto. Una condición de stop la
evalúa el motor de forma repetida y puede suprimir el stop hasta que una condición más amplia de la
estrategia lo permita. Es lógica de estrategia en vivo, no datos de señal serializables. Como las
estrategias compiladas usan un subconjunto restringido de Java, usa un `BooleanSupplier` anónimo en
lugar de una lambda cuando necesites uno.

## Información y metadatos de gráfico

`createInfoSignal()` es azúcar sintáctico local al listener: crea una `InfoStrategySignal` ya
vinculada a la estrategia y el instrumento actuales. Rellénala con `set` y emítela cuando esté
lista:

```java
InfoStrategySignal signal = createInfoSignal();
signal.set("price", price);
signal.set("fast", fast);
signal.set("slow", slow);
emitSignal(signal);
```

`set` almacena un valor directamente. Una lista par de pares nombre/valor crea un objeto anidado
bajo la clave dada, que es por lo que los marcadores de gráfico usan esta forma:

```java
signal.set("_m",
    "position", "belowBar",
    "shape", "arrowUp",
    "color", "#26a69a",
    "text", "BUY");
```

Las posiciones de marcador que usa la visualización estándar son `aboveBar`, `belowBar` e `inBar`;
las formas portables son `circle`, `arrowUp`, `arrowDown` y `square`. Prefijar una propiedad con
`_` la reserva como metadato de control en lugar de una serie normal representada, tal como hace
`_m` aquí.

Para un único valor, `emitInfo` es la forma más corta:

```java
emitInfo("zscore", zscore);
```

También acepta pares nombre/valor anidados:

```java
emitInfo("averages", "fast", fast, "slow", slow);
```

Usa la forma más larga `createInfoSignal()` cuando un evento necesite varios valores de primer
nivel o metadatos de marcador. Las señales de información son útiles para explicar una decisión,
pero nunca sustituyen al `emitBuy` o `emitSell` correspondiente cuando la estrategia tiene que
operar.

[engine-javadoc]: https://qtsurfer.github.io/qtsurfer-engine-java-docs/
[market-hint-javadoc]: https://qtsurfer.github.io/qtsurfer-engine-java-docs/com/wualabs/qtsurfer/engine/strategy/event/signal/MarketHintSignal.html
[signal-javadoc]: https://qtsurfer.github.io/qtsurfer-engine-java-docs/com/wualabs/qtsurfer/engine/strategy/event/signal/package-summary.html
[strategy-skill]: https://github.com/QTSurfer/strategy-skills