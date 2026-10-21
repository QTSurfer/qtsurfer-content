---
title: Programar estrategias en Java
description: Emite señales de operación e información, configura órdenes y adjunta metadatos de gráfico.
order: 5.1
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 3a97c37ef21dc83a76e523828f926b96f083dd31
upstreamPath: docs/strategy_coding.md
lastUpdated: '2026-10-21T12:09:30Z'
---

Una estrategia de QTSurfer consume datos de mercado, actualiza indicadores y estado, y emite señales.
Esta guía cubre la emisión de señales — el punto donde una observación se convierte en una instrucción
de operar o en un dato para inspeccionar más tarde — y [recibir un comando](#recibir-comandos) desde
fuera de una ejecución en vivo.

Para la API completa de clases, usa el [Javadoc del motor][engine-javadoc], en particular el
[paquete de señales de estrategia][signal-javadoc]. Para redactar con ayuda de un agente, instala
la skill mantenida [`qtsurfer-java-strategy`][strategy-skill]:

```bash
npx skills add QTSurfer/strategy-skills --skill qtsurfer-java-strategy
```

La skill también cubre cómo elegir una clase base de estrategia, configurar indicadores y gestionar
el estado por instrumento. Una vez listo el fuente, [compílalo y valídalo a través de la
API](strategy).

Los helpers de señal de esta guía no están atados a una clase Java: los cuerpos `{ }` de una
estrategia [QTScript](qtscript) (beta) — una forma compacta de escribir una estrategia que deja
fuera la clase, los imports y el listener — llaman a `emitBuy`, `emitSell`, `emitInfo` y
`emitSignal` exactamente como se muestra aquí.

## Señales de ejecución y señales de información

Estas familias de señales tienen efectos distintos:

| Señal | Propósito | ¿Causa una operación? |
|---|---|---|
| `BuySignal` | Expresa una instrucción de compra y su configuración de orden | Sí |
| `SellSignal` | Expresa una instrucción de venta y su configuración de orden | Sí |
| `InfoStrategySignal` | Registra indicadores, diagnósticos o metadatos de visualización | No |

Las tres están en `com.wualabs.qtsurfer.engine.strategy.event.signal`, y una estrategia que nombra una la importa
desde ahí: `import com.wualabs.qtsurfer.engine.strategy.event.signal.InfoStrategySignal;`, igual que `BuySignal`
más abajo. Si solo usas `emitBuy`, `emitSell` y `emitInfo`, que nunca nombran el tipo, no hace falta ningún import.

Una señal de información etiquetada `BUY` sigue siendo solo información. A la inversa,
`emitBuy(price)` emite una señal de compra ejecutable aunque no lleve metadatos de gráfico
adjuntos.

El [ejemplo del README](https://github.com/QTSurfer/qtsurfer-api/blob/848593e88be3b80078c6f98d7cb582f22fd87853/README.md#strategy-example) emite deliberadamente ambas. Publica una
señal de información en cada actualización de ventana para poder inspeccionar la serie de
indicadores, pero solo emite una compra o venta cuando cruzan las medias móviles:

```java
import com.wualabs.qtsurfer.engine.strategy.event.signal.InfoStrategySignal;

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
estrategia lo permita. Es lógica de estrategia en vivo, no datos de señal serializables.

## Dimensionado

Una estrategia dice cuándo y en qué sentido, no cuánto. `emitBuy(price)` y `emitSell(price)` llevan un precio y nada
más, y ninguna llamada pone una cantidad ni un nocional en una señal. El tamaño de cada entrada es un ajuste de la
ejecución, `percentAmountToLock`: el porcentaje del saldo libre de la cuenta que bloquea una entrada, por encima de
0 y hasta 100.

Dónde se da depende de la ejecución: `baseConfig` en un [backtest](backtest_execute) o un
[barrido](backtest_sweep), el bloque `paper` en una [ejecución en vivo en papel](live_paper). Si se omite, un
backtest pone todo el saldo libre en cada entrada y la cuenta en papel de una ejecución en vivo bloquea el 10 %.
Para ver cómo se comporta una estrategia con otro tamaño, vuelve a ejecutarla con otro `percentAmountToLock`; la
clase no cambia.

## Información y metadatos de gráfico

`createInfoSignal()` es azúcar sintáctico local al listener: crea una `InfoStrategySignal` ya
vinculada a la estrategia y el instrumento actuales. Rellénala con `set` y emítela cuando esté
lista:

```java
import com.wualabs.qtsurfer.engine.strategy.event.signal.InfoStrategySignal;

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

Todo lo que haces `set` en una señal es su `data`, y se publica con la señal en una ejecución en vivo: quien
pueda leer la ejecución puede leerlo, así que en una ejecución `public` es público. Una señal cuyo `data` pese
más de 8 KiB (8.192 bytes de su JSON) no se empuja por el canal WebSocket; `GET /live/{runId}/signals` la
devuelve entera de todos modos.

Para un único valor, `emitInfo` es la forma más corta:

```java
emitInfo("zscore", zscore);
```

También acepta pares nombre/valor anidados:

```java
emitInfo("averages", "fast", fast, "slow", slow);
```

`emitInfo` acepta los mismos argumentos en un cuerpo [QTScript](qtscript#dentro-de-un-cuerpo) — el
[README](https://github.com/QTSurfer/qtsurfer-api/blob/1234ca1a762e589f51b4679af889ca6cba5802cb/README.md#the-same-strategy-in-qtscript)
muestra el ejemplo de media móvil de arriba con sus marcadores de gráfico escritos así.

Usa la forma más larga `createInfoSignal()` cuando un evento necesite varios valores de primer
nivel o metadatos de marcador. Las señales de información son útiles para explicar una decisión,
pero nunca sustituyen al `emitBuy` o `emitSell` correspondiente cuando la estrategia tiene que
operar.

## Listeners de ventana y el valor anterior

Un listener de ventana se dispara una vez cuando cierra su periodo, y `onChange` recibe el valor del indicador en ese
momento, `actual`, y el que tenía cuando cerró la ventana **anterior**, `prev`: el `close[1]` de otras herramientas.
Un cruce, o cualquier otra cosa que compare un cierre con el anterior, no necesita guardar nada en el `StateStore`.

Esto entra cuando el RSI vuelve a subir por encima de 30, una sola vez, en la ventana en la que ocurre:

```java
import com.wualabs.qtsurfer.engine.core.state.StateStore;
import com.wualabs.qtsurfer.engine.indicators.helpers.WindowTimeRTIndicator.WindowTime;
import com.wualabs.qtsurfer.engine.indicators.helpers.group.InstrumentGroupRTIndicator;
import com.wualabs.qtsurfer.engine.strategy.AbstractTickerStrategy;
import com.wualabs.qtsurfer.engine.strategy.AbstractWindowListener;

public class RsiReentry extends AbstractTickerStrategy {

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators
            .addPrice()
            .rsi(14)
            .window("rsi14", WindowTime.m1, new Reentry(this, indicators));
    }

    private class Reentry extends AbstractWindowListener {

        public Reentry(AbstractTickerStrategy strategy, InstrumentGroupRTIndicator indicators) {
            super(strategy, indicators);
        }

        @Override
        public void onChange(StateStore store, double prev, double actual) {
            if (prev < 30 && actual >= 30) emitBuy(indicators.getValue("price"));
        }
    }
}
```

En una estrategia kline, una ventana sobre `close` te da el cierre de la barra anterior como `prev`, que es lo que
necesita el rango verdadero junto a los `high` y `low` de la propia barra. Los campos de la barra también son
indicadores, y se registran a partir de un `KlineValueSource`:

```java
import com.wualabs.qtsurfer.engine.core.KlineInterval;
import com.wualabs.qtsurfer.engine.core.state.StateStore;
import com.wualabs.qtsurfer.engine.indicators.core.KlineValueSource;
import com.wualabs.qtsurfer.engine.indicators.helpers.WindowTimeRTIndicator.WindowTime;
import com.wualabs.qtsurfer.engine.indicators.helpers.group.InstrumentGroupRTIndicator;
import com.wualabs.qtsurfer.engine.strategy.AbstractKlineStrategy;
import com.wualabs.qtsurfer.engine.strategy.AbstractWindowListener;

public class TrueRange extends AbstractKlineStrategy {

    @Override
    public KlineInterval getInterval() {
        return KlineInterval.s1;
    }

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators
            .add("high", KlineValueSource.High)
            .add("low", KlineValueSource.Low)
            .add("close", KlineValueSource.Close)
            .window("close", WindowTime.m1, new Range(this, indicators));
    }

    private class Range extends AbstractWindowListener {

        public Range(AbstractKlineStrategy strategy, InstrumentGroupRTIndicator indicators) {
            super(strategy, indicators);
        }

        @Override
        public void onChange(StateStore store, double prev, double actual) {
            double high = indicators.getValue("high");
            double low = indicators.getValue("low");
            double trueRange = Math.max(high - low, Math.max(Math.abs(high - prev), Math.abs(low - prev)));
            emitInfo("trueRange", trueRange);
        }
    }
}
```

Una estrategia kline en Java tiene que sobrescribir `getInterval()`: la clase base lo deja abstracto, y una fuente
sin él se rechaza. En un backtest el ancho de barra no es lo que devuelve, sino el `cadence` con el que se
prepararon los datos, así que `KlineInterval.s1` sirve para cualquier ejecución; a una estrategia `kline` de
[QTScript](qtscript#velas) se le escribe este método.

La primera vez que se dispara una ventana no hay una ventana anterior con la que comparar: `prev` es el valor que
tenía el indicador cuando se abrió esa primera ventana. Una regla que necesite dos cierres reales debe dejar pasar
el primer disparo, y un indicador con periodo de calentamiento, como un RSI o una EMA, tampoco se ha asentado en sus
primeras ventanas. Reserva el `StateStore` para lo que una ventana no te puede dar: una marca, un contador, un valor
de varias ventanas atrás. Un listener que solo necesita el store, `prev` y `actual` puede ser una lambda; uno que
emite una señal extiende `AbstractWindowListener`, como arriba.

## Leer indicadores desde update()

Una estrategia que sobrescribe `update()` en lugar de usar ventanas avanza ella misma los indicadores con
`updateIndicators(instrument, source)`. Devuelve el mapa de indicadores del instrumento, un
`InstrumentMapRTIndicator`, no un indicador: escribe `var`, o este tipo, y lee cada indicador de él por su nombre.

```java
import com.wualabs.qtsurfer.engine.core.Ticker;
import com.wualabs.qtsurfer.engine.core.instrument.Instrument;
import com.wualabs.qtsurfer.engine.indicators.helpers.group.InstrumentMapRTIndicator;

@Override
public void update(Ticker ticker) {
    Instrument instrument = ticker.instrument();
    updateInstrument(instrument, ticker.timestamp());
    InstrumentMapRTIndicator indicators = updateIndicators(instrument, ticker);

    if (!indicators.getReadOnlyExisting("emaSlow").isReady()) return;   // espera al calentamiento

    double fast = indicators.getValue("emaFast");
    double slow = indicators.getValue("emaSlow");
    // ...
}
```

`getReadOnlyExisting(name)` devuelve una vista de solo lectura: lee el valor del indicador vivo e ignora
`update(...)`, sin dar error, así que nada en `update()` puede cambiar por accidente el valor de un indicador
compartido, que es lo que quiere una estrategia que solo lee valores. `getExisting(name)` devuelve el indicador vivo:
un `update` o un `reset` sobre él cambia la serie para todos los que la leen, y nada lo avisa. Las dos lanzan una
excepción si no hay ningún indicador con ese nombre. No escribas el tipo del mapa como `RichRTIndicator`, la interfaz
para escribir un indicador propio: el mapa no la implementa, y el compilador responde `incompatible types`. El
`cannot find symbol` para `getExisting` que le sigue es una consecuencia, y la respuesta lo dice debajo.
`RTIndicator` sí compila, porque el mapa lo es, pero oculta `getExisting` y `getReadOnlyExisting`, que solo tiene el
mapa.

`updateIndicators` por sí solo no publica señales: una estrategia que lo llama desde su propio `update()` opera con
normalidad y deja vacías las señales que guarda un backtest. Para conservarlas, llama primero a
`super.update(ticker)`, que ya hace `updateInstrument` y `updateIndicators`, y lee los indicadores con
`getRTIndicator(instrument, name)`. Devuelve el indicador vivo dentro de un `Optional`, no una vista de solo lectura;
`.map(RTIndicator::ro)` da la vista.

## Recibir comandos

El dueño de una ejecución en vivo puede indicarle un comando desde fuera — `POST /live/{runId}/commands`
— mientras sigue corriendo, sin reiniciarla. Para actuar sobre uno, implementa `CommandRequestHandler`:

```java
import com.wualabs.qtsurfer.engine.strategy.event.request.CommandRequest;
import com.wualabs.qtsurfer.engine.strategy.event.request.CommandRequestHandler;

public class MyStrategy extends AbstractTickerStrategy implements CommandRequestHandler {

    @Override
    public void handle(CommandRequest request) {
        if ("flatten".equals(request.getCommand())) {
            // cierra la posición, cancela órdenes pendientes, lo que signifique "flatten" para esta estrategia
        }
    }
}
```

`handle` corre en el mismo hilo que `update()`, justo antes del evento de mercado al que apunta el
comando, así que ve el estado de la estrategia exactamente como estaba en ese momento y puede llamar a
cualquier cosa que pueda llamar `update()` — leer indicadores, emitir una señal, cambiar campos
internos. Una `RuntimeException` que lance se captura y se cuenta, igual que una de `update()`; un
`Error` desmonta la ejecución.

Un comando es siempre una cadena simple, y es transitorio. También puede llevar un objeto `properties`
de tu elección, junto a `command` en el cuerpo de la petición — no `params`, que sigue siendo lo que
fija una ejecución al arrancar y lo que cambia `PUT /live/{runId}/params`. Cada propiedad aterriza como
una entrada de primer nivel en el propio mapa de `CommandRequest`, así que lee una directamente de
`request` por su nombre — `request.get("<clave>")` — ninguna clave está prohibida, ya que el texto del
comando se guarda aparte (`getCommand()` lo lee, sin verse afectado por nada de esto). Un valor conserva
el tipo JSON con el que llegó, así que asignarlo a un campo `String` cuando quien llama envió un número
o un objeto lanza un `ClassCastException` dentro de `handle`; un cuerpo `onCommand` de QTScript lee el
mismo valor con `$command.<clave>` en su lugar, que siempre lo ensancha a un `String` (`null` para una
clave ausente, nunca un fallo de conversión). Un comando, y sus propiedades, no se guardan como parte de
la ejecución: una réplica que se reinicia reproduce solo el último tramo de datos de mercado, y un
comando de antes de esa ventana simplemente no le llega.

Un comando no lleva instrumento asociado como sí lo hace `update()`; cuando sus propias propiedades
nombran uno, alcanza el store de ese instrumento con `getStateStore(String)`:

```java
@Override
public void handle(CommandRequest request) {
    String instrument = request.get("instrument");
    if (instrument != null) {
        getStateStore(instrument).set("flattened");
    }
}
```

**Ni un campo `@StrategyProperty` ni un `StateStore` escrito desde dentro de `handle` son duraderos.**
Ambos cambian de inmediato, en memoria, igual que cualquier otra asignación, pero ninguno se escribe en
el conjunto de parámetros guardado de la ejecución — una réplica que se reinicia (o una que arranca
después, y nunca corrió `handle` para ese comando) parte de lo último que fijó `PUT /live/{runId}/params`,
no de lo que asignó un comando. La única escritura duradera es una llamada real a
`PUT /live/{runId}/params`, desde fuera de la ejecución — una estrategia no puede llamar a su propia API
REST desde dentro de `handle`.

Una ejecución cuya estrategia no implementa `CommandRequestHandler` responde todos los comandos con un
`409` — implementar la interfaz es lo que hace que `POST /live/{runId}/commands` haga algo.

Una estrategia QTScript también la implementa, mediante su propia sección `onCommand { }` (consulta
[QTScript](qtscript#manejar-un-comando)) — la plataforma reconoce la clase generada como
`CommandRequestHandler` de la misma forma que reconoce esta.

Consulta [Comandos](live#comandos) para la forma de la petición/respuesta y los códigos de error.

## Ver también

- [QTScript (beta)](qtscript) — las mismas estrategias escritas sin la ceremonia.
- [Estrategias](strategy) — compila, valida, lista y recupera una estrategia, en cualquiera de los
  dos lenguajes.

[engine-javadoc]: https://www.qtsurfer.com/docs/developers/java-api
[market-hint-javadoc]: https://www.qtsurfer.com/docs/developers/java-api/reference/latest/com/wualabs/qtsurfer/engine/strategy/event/signal/MarketHintSignal.html
[signal-javadoc]: https://www.qtsurfer.com/docs/developers/java-api/reference/latest/com/wualabs/qtsurfer/engine/strategy/event/signal/package-summary.html
[strategy-skill]: https://github.com/QTSurfer/strategy-skills