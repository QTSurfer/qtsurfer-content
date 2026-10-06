---
title: Estrategias en Java
description: Construye estrategias QTSurfer con indicadores, window listeners, estado y señales.
order: 1
lastUpdated: '2026-10-06T12:57:29Z'
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: aa726ec584fa46b083b263c800ffbc55156a25d7
upstreamPath: skills/qtsurfer-java-strategy/SKILL.md
---

Una estrategia de QTSurfer es una clase Java sencilla (sin anotaciones de framework) que extiende
una clase base de estrategia — la más habitual es `AbstractTickerStrategy` (consulta [Clases base
de estrategia](#clases-base-de-estrategia) para las variantes de kline, funding rate y multi-fuente).
Recibe datos de mercado en tiempo real, configura indicadores técnicos y emite señales de compra o
venta. El motor compila las estrategias en el servidor — no hace falta ninguna herramienta local.

> **También disponible: QTScript (`.qtscript`), en beta** — un lenguaje compacto de estrategias
> cuyos cuerpos entre llaves son Java tal cual, cubierto por la skill
> **`qtsurfer-qtscript-strategy`**. Encaja con una estrategia que es un puñado de indicadores y
> cuerpos de ventana. Todo lo que sigue continúa siendo la forma de escribir una estrategia con la
> API completa del motor — `update()`, lógica entre instrumentos, indicadores personalizados,
> tipos auxiliares — y es en lo que se expande QTScript.

## Plantilla mínima

```java
import com.wualabs.qtsurfer.engine.indicators.helpers.group.InstrumentGroupRTIndicator;
import com.wualabs.qtsurfer.engine.strategy.AbstractTickerStrategy;

public class MyStrategy extends AbstractTickerStrategy {

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        // configura los indicadores aquí — se llama una vez por instrumento en el primer tick
    }
}
```

## Imports permitidos

El código de estrategia puede importar desde un conjunto fijo de paquetes — importar cualquier cosa
fuera de él falla en tiempo de ejecución (no de compilación), con un error del estilo
`<class> could not be found` a secas y sin indicación de _por qué_. Permitidos, por paquete de
primer nivel (se incluye cada subpaquete):

- `com.wualabs.qtsurfer.engine.*` — la propia API de estrategias e indicadores
- `java.lang`, `java.util` (incluidos `java.util.stream`, `java.util.function`, `java.util.regex`, `java.util.concurrent.atomic`), `java.math`
- `java.time` (incluidos `java.time.format`, `java.time.temporal`) — `Duration`, `Instant`, `LocalDate`, etc., se pueden usar sin problema, por ejemplo en `.window(name, Duration.ofSeconds(n), listener)`
- `java.text` — `DecimalFormat`/`NumberFormat` para formatear valores en mensajes de señal o logs

Bloqueados explícitamente sea cual sea el paquete: `System`, `Runtime`, `Thread`,
`Executor`/`ExecutorService`. `java.io` está bloqueado por completo — una estrategia no tiene por
qué hacer entrada/salida de ficheros o de red por su cuenta; todos los datos de mercado y la
ejecución de órdenes pasan por la API del motor de arriba.

`acceptInstrument` y `getExecutionMode` tienen valores por defecto razonables (aceptar todos los
instrumentos, modo LONG). Sobrescríbelos solo si lo necesitas:

```java
import com.wualabs.qtsurfer.engine.core.instrument.Instrument;
import com.wualabs.qtsurfer.engine.strategy.execution.ExecutionMode;

@Override
public boolean acceptInstrument(Instrument instrument) {
    return instrument.base().equals("BTC"); // filtra instrumentos aquí si hace falta
}

@Override
public ExecutionMode getExecutionMode(Instrument instrument) {
    return ExecutionMode.LONG; // LONG, SHORT, or LONG_MULTI
}
```

> Nota: el `acceptInstrument` **por defecto** _no_ es incondicional — filtra según la moneda de
> salida de la estrategia / `acceptCurrency`. Para aceptar **todos** los instrumentos sin
> condición, sobrescríbelo explícitamente devolviendo `true`.

## Nivel del lenguaje

El código de una estrategia es Java moderno corriente. Las lambdas, las referencias a método, `var`,
los records, las expresiones `switch`, el pattern matching de `instanceof` y los bloques de texto
compilan y se ejecutan, y también el `+` entre cadenas. Un window listener que solo necesita el
`StateStore` y los dos valores puede ser una lambda (consulta el [patrón de window
listener](#patrón-de-window-listener-recomendado)); los ejemplos de abajo usan la forma que se lea
mejor.

## Configuración de indicadores

Todos los indicadores se definen en `setupIndicators` mediante el builder fluido de
`InstrumentGroupRTIndicator`. Los métodos devuelven `this` para encadenar llamadas.

```java
@Override
protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
    indicators
        .addPrice()                     // fuente: precio de cierre
        .ema("emaRapida", 9)           // EMA de 9 periodos llamada "emaRapida"
        .ema("emaLenta", 21)           // EMA de 21 periodos llamada "emaLenta"
        .rsi(14)                        // RSI de 14 periodos llamado "rsi14"
        .bollinger("bb", 20, 2.0)      // Bandas de Bollinger → "bb", "bbUpper", "bbLower"
        .window("emaRapida", WindowTime.s1, new MiListener(this, indicators));
}
```

Consulta [el catálogo de indicadores](/docs/developers/java-indicators) para verlo completo.

### Valores de `WindowTime`

`WindowTime.s1`, `s5`, `s10`, `s30`, `m1`, `m3`, `m5`
Personalizado: `Duration.ofSeconds(n)` o `Duration.ofMinutes(n)`

### Leer valores de indicadores fuera de un listener

```java
import com.wualabs.qtsurfer.engine.core.instrument.Instrument;
import com.wualabs.qtsurfer.engine.core.Ticker;

@Override
public void update(Ticker ticker) {
    Instrument instrument = ticker.instrument();
    updateInstrument(instrument, ticker.timestamp());
    var ind = updateIndicators(instrument, ticker);

    if (!ind.getExisting("emaLenta").isReady()) return; // espera el calentamiento

    double rapido = ind.getValue("emaRapida");
    double lento = ind.getValue("emaLenta");

    if (rapido > lento) emitBuy(instrument, ticker.last());
    else                emitSell(instrument, ticker.last());
}
```

`Ticker` es un record del motor — lee sus campos con métodos de acceso: `ticker.last()`,
`ticker.bid()`, `ticker.ask()`, `ticker.instrument()`, `ticker.timestamp()`.

**`updateIndicators(...)` por sí solo no publica nada.** Hace avanzar los indicadores de este
instrumento, pero las series de indicadores y las marcas de compra/venta que un backtest conserva con
`storeSignals` salen de las señales que emite `super.update(ticker)`. Una estrategia que sobrescribe
`update()` y llama ella misma a `updateIndicators` opera con normalidad y deja vacías las señales
guardadas (`signalCount: 0`). Para conservarlas, llama primero a `super.update(ticker)` — que ya hace
`updateInstrument` y `updateIndicators` — y lee los indicadores con `getRTIndicator(instrument, name)`,
que no los actualiza una segunda vez:

```java
@Override
public void update(Ticker ticker) {
    super.update(ticker);                      // hace avanzar los indicadores y publica sus señales
    Instrument instrument = ticker.instrument();

    var emaLenta = getRTIndicator(instrument, "emaLenta");
    var emaRapida = getRTIndicator(instrument, "emaRapida");
    if (emaLenta.isEmpty() || emaRapida.isEmpty() || !emaLenta.get().isReady()) return; // espera el calentamiento

    if (emaRapida.get().getValue() > emaLenta.get().getValue()) emitBuy(instrument, ticker.last());
    else                                                        emitSell(instrument, ticker.last());
}
```

## Patrón de window listener (recomendado)

Los listeners se disparan una vez por ventana de tiempo en lugar de en cada tick. Prefiérelo frente
a `update()` en estrategias que reaccionan al cierre de una barra.

```java
import com.wualabs.qtsurfer.engine.strategy.AbstractWindowListener;
import com.wualabs.qtsurfer.engine.core.state.StateStore;
import com.wualabs.qtsurfer.engine.indicators.helpers.WindowTimeRTIndicator.WindowTime;

public class MyStrategy extends AbstractTickerStrategy {

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators
            .addPrice()
            .rsi(14)
            .window("rsi14", WindowTime.m1, new SignalListener(this, indicators));
    }

    private class SignalListener extends AbstractWindowListener {

        public SignalListener(AbstractTickerStrategy strategy,
                              InstrumentGroupRTIndicator indicators) {
            super(strategy, indicators);
        }

        @Override
        public void onChange(StateStore store, double prev, double actual) {
            long count = store.inc("bars");

            if (actual < 30) emitBuy(indicators.getValue("price"));
            if (actual > 70) emitSell(indicators.getValue("price"));
        }
    }
}
```

`AbstractWindowListener` te da:

- `emitBuy(price)` / `emitSell(price)` / `emitSignal(signal)`
- `getPrevInstant()` / `getCurrInstant()` — cuándo se abrió / cerró la ventana que acaba de dispararse
- `getEngineVersion()` / `getEngineVersionMajor()` / `getEngineVersionMinor()` — la versión del
  motor en ejecución (consulta [Versión del motor](#versión-del-motor))
- `this.instrument` — instrumento actual
- `this.indicators` — grupo de indicadores

La detección de cruces es un helper independiente, no un método del listener — consulta el
[helper de detección de cruces](#helper-de-detección-de-cruces) más abajo.

`store` llega como primer parámetro de `onChange` — ya resuelto, sin nada que inicializar. Es el
mismo store que comparten todos los listeners de este instrumento (consulta [Gestión de
estado](#gestión-de-estado) más abajo); `getPrevInstant()`/`getCurrInstant()` solo se resuelven
cuando el listener está registrado en una ventana (mediante `.window(...)`, como arriba) — llamarlos
en un listener enganchado a un indicador simple lanza una excepción.

**Un listener que solo necesita el store puede ser una lambda.** `window(...)` recibe el
`OnChangeListener` del motor, una interfaz funcional con el mismo `onChange(store, prev, actual)`;
`prev` es el valor del indicador cuando se cerró la ventana anterior y `actual` su valor ahora.
Extiende `AbstractWindowListener` solo cuando el listener necesite los helpers indicados arriba
(`emitBuy(price)`, `getPrevInstant()`, …).

```java
indicators
    .addPrice()
    .ema("emaLarga", 1800)
    .window("emaLarga", WindowTime.m1, (store, prev, actual) -> {
        int subiendo = store.getState("minutosSubiendo", 0);
        store.setState("minutosSubiendo", actual > prev ? subiendo + 1 : 0);   // minutos consecutivos en que subió la EMA
    });
```

## Gestión de estado

`StateStore` es por instrumento y lo comparten todos los listeners del grupo de indicadores de ese
instrumento (un único store, no uno por ventana). Se crea de forma perezosa — una ventana que nadie
escucha nunca lo toca. Dentro de un window listener llega como primer parámetro de `onChange`; fuera
de un listener (por ejemplo en `update()`) accede a él con `getStateStore(instrument)`, que devuelve
`Optional<StateStore>`:

```java
@Override
public void update(Ticker ticker) {
    Instrument instrument = ticker.instrument();
    updateInstrument(instrument, ticker.timestamp());
    var ind = updateIndicators(instrument, ticker);

    StateStore store = getStateStore(instrument).orElseThrow();
    long ticks = store.inc("ticks");
    // ...
}
```

`getStateStore(instrument)` se hereda de la clase base de estrategia — siempre presente (nunca
`Optional.empty()`) para las clases base documentadas, así que `.orElseThrow()` es seguro; es
`Optional` porque el contrato subyacente de `Strategy` permite que una implementación no soporte
estado por instrumento en absoluto. Llamarlo, a diferencia del acceso al store propio de una
ventana, resuelve el store de inmediato — no espera a un listener.

```java
store.inc("count")          // contador int, devuelve el nuevo valor
store.dec("count")
store.set("enPosicion")     // flag booleano → true
store.unset("enPosicion")   // → false
store.is("enPosicion")      // lee el booleano
store.add("pnl", delta)     // acumulador double, devuelve el nuevo valor
store.setState("key", obj)  // objeto arbitrario
store.getState("key", def)  // con valor por defecto
```

## Propiedades configurables

```java
@StrategyProperty(name = "rsi.periodo", description = "Periodo del RSI", defaultValue = "14")
private int periodoRsi;

@StrategyProperty(name = "ema.rapida", description = "Periodo de la EMA rápida", defaultValue = "9")
private int periodoRapido;
```

La anotación y el campo son toda la declaración — sin getter, sin setter. Las propiedades se
inyectan antes de que se llame a `setupIndicators`, y lo mismo vale para un vector de parámetros de
`submit_sweep`: se escribe directamente en el campo.

**La clave de parámetro de `submit_sweep` es el `name` de la anotación (con puntos), NO el nombre
del campo Java.** En el ejemplo de arriba, la clave de la cuadrícula es `rsi.periodo` / `ema.rapida`,
no `periodoRsi` / `periodoRapido`:

**Deja que `defaultValue` sea el único sitio donde se escribe el valor por defecto.** Un
inicializador de campo (`private int periodoRapido = 9;`) se ejecuta _después_ de haberse aplicado el
valor por defecto de la anotación y lo sobrescribe, así que, si los dos llegan a discrepar, la
estrategia corre con el inicializador mientras la plataforma registra el valor de la anotación
junto a los resultados. Declarar el valor por defecto una sola vez, en la anotación, elimina la
duda.

Declara un setter de JavaBean solo cuando la propiedad lo necesite — validación, acotado, o
recalcular algo derivado de ella. Cuando existe un setter, todos los canales de inyección pasan por
él, así que la protección nunca se salta. El campo no puede ser `static` (su valor se compartiría
entre ensayos de un barrido corriendo en paralelo) ni `final` (nada podría asignarlo tras la
construcción); cualquiera de los dos casos necesita un setter, y una propiedad sin ninguno se
reporta como aviso en lugar de omitirse en silencio.

`min`, `max` y `step` en la anotación son pistas de rango orientativas que puede leer la cuadrícula
de parámetros de un barrido — no se validan contra ellas, son solo un rango sugerido para
prerrellenarla.

**Escribe `min`, `max` y `step` como decimales — `1.0`, no `1` — incluso en una propiedad entera.**
Son elementos `double`, y un literal entero ahí se registra sin error: el rango se descarta de las
propiedades declaradas, `validate` falla y un backtest de la estrategia falla sin decir por qué.

## Recibir comandos

El dueño de una ejecución en vivo puede indicarle un comando desde fuera — `POST /live/{runId}/commands`
con `{"command": "<texto>"}` — mientras sigue corriendo, sin reiniciarla. Para actuar sobre uno,
implementa `CommandRequestHandler`:

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

**Un comando es siempre una cadena simple, y es transitorio.** También puede llevar un objeto
`properties` de tu elección, junto a `command` en el cuerpo de la petición — no `params`, que sigue
siendo lo que fija una ejecución al arrancar y lo que cambia `PUT /live/{runId}/params`. Cada propiedad
aterriza como una entrada de primer nivel en el propio mapa de `CommandRequest`, así que lee una
directamente de `request` por su nombre — `request.get("<clave>")` — ninguna clave está prohibida, ya
que el texto del comando se guarda aparte (`getCommand()` lo lee, sin verse afectado por nada de esto).
Un valor conserva el tipo JSON con el que llegó, así que asignarlo a un campo `String` cuando quien
llama envió un número o un objeto lanza un `ClassCastException` dentro de `handle`; el azúcar
`$command.<clave>` de QTScript lee el mismo valor pero siempre lo ensancha a un `String`. Un comando, y
sus propiedades, no se guardan como parte de la ejecución: una réplica que se reinicia reproduce solo el
último tramo de datos de mercado, y un comando de antes de esa ventana simplemente no le llega.

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

**Asignar un campo `@StrategyProperty` desde dentro de `handle` no es duradero.** Cambia el valor en
memoria de esta réplica de inmediato, igual que cualquier otra asignación de campo, pero nada lo
escribe en el conjunto de parámetros guardado de la ejecución — una réplica que se reinicia (o una que
arranca después, y nunca corrió `handle` para ese comando) parte de lo último que fijó
`PUT /live/{runId}/params`, no de lo que asignó un comando. `StateStore` no es más duradero: también
es memoria, se pierde en un reinicio igual que un campo. Nada de lo que hace un comando desde dentro de
`handle` sobrevive a un reinicio por sí solo — la única escritura duradera es una llamada real a
`PUT /live/{runId}/params`, desde fuera de la ejecución (una estrategia no puede llamar a su propia API
REST desde dentro de `handle`).

Una ejecución cuya estrategia no implementa `CommandRequestHandler` responde todos los comandos con un
`409` — implementar la interfaz es lo que hace que `POST /live/{runId}/commands` haga algo.

Una estrategia QTScript también la implementa, mediante su propia sección `onCommand { }` (consulta la
skill `qtsurfer-qtscript-strategy`) — la plataforma reconoce la clase generada como
`CommandRequestHandler` de la misma forma que reconoce esta.

## Emisión de señales

Hay dos sobrecargas, y cuál está disponible depende de desde dónde llames — confundirlas falla al
compilar con un error de método inexistente, no en tiempo de ejecución:

| Método                                                        | Dónde está disponible                                                                                                    |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `emitBuy(instrument, price)` / `emitSell(instrument, price)` | En cualquier punto de la propia clase de estrategia — `update()`, `onChange()` antes de delegar, métodos auxiliares       |
| `emitBuy(price)` / `emitSell(price)`                         | Solo dentro de un window listener (`AbstractWindowListener.onChange`, ver más abajo) — ahí el instrumento es implícito    |
| `emitSignal(signal)`                                         | Señal personalizada (`BuySignal`, `SellSignal`, `InfoStrategySignal`), en cualquiera de los dos contextos                 |

### Señales de datos / analítica — `InfoStrategySignal`

Para estrategias que no operan y que emiten **campos calculados** (analítica, métricas) en lugar de
compra/venta, construye un `InfoStrategySignal`, adjúntale pares clave/valor arbitrarios y llama a
`emitSignal`. Hay dos constructores, siguiendo la misma convención que `emitBuy`:

- **Nivel de estrategia (`update()`) — `createInfoStrategySignal(instrument)`**, instrumento explícito:

```java
InfoStrategySignal signal = createInfoStrategySignal(instrument);  // de AbstractTickerStrategy
signal.set("interval", "1m");
signal.set("zscore", z);
signal.set("vwap", vwap);
emitSignal(signal);
```

- **Dentro de un window listener (`AbstractWindowListener.onChange`) — `createInfoSignal()`**, instrumento implícito:

```java
InfoStrategySignal signal = createInfoSignal();  // el listener ya conoce su instrumento
signal.set("interval", "1m");
signal.set("zscore", z);
signal.set("vwap", vwap);
emitSignal(signal);
```

La forma del listener no recibe instrumento porque el listener ya lo conoce — la misma convención
que el azúcar sintáctico `emitBuy(price)` / `emitSell(price)` de arriba. `createInfoSignal()` solo
existe dentro del ámbito del listener; en el nivel de estrategia usa
`createInfoStrategySignal(instrument)`.

`signal.set(...)` también acepta un estilo varargs de datos de mercado para el marcador de gráfico
`_m`, por ejemplo
`signal.set("_m", "position", "belowBar", "shape", "arrowUp", "color", "#26a69a", "text", "BUY")`.

Todo lo que haces `set` en una señal es su `data`, y en una ejecución en vivo se publica con la señal:
quien pueda leer la ejecución puede leerlo, así que en una ejecución `public` es público. No pongas ahí
nada que no le enseñarías a un desconocido. Una señal cuyo `data` pese más de 8 KiB (8.192 bytes de su
JSON) no se empuja por el canal WebSocket (`GET /live/{runId}/signals` la devuelve entera de todos
modos), así que mantenlo a los pocos campos que necesita un lector.

Los suscriptores leen los campos con `signal.get("key")` / `signal.has("key")` y
`signal.getInstrument()`. Prefija el nombre de un campo con `_` para que quede fuera de los
metadatos de reporte.

## Helper de detección de cruces

```java
import com.wualabs.qtsurfer.engine.strategy.CrossDetector;

private final CrossDetector cruceRapidoLento = new CrossDetector(); // una instancia por par vigilado

// En onChange o update:
CrossDetector.Cross cruce = cruceRapidoLento.check(rapido, lento);
if (cruce.above()) emitBuy(precio);
if (cruce.below()) emitSell(precio);
```

Una única llamada a `check(left, right)` informa de ambas direcciones a la vez, de modo que siempre
describen el mismo tick.

## Compilar y enviar

Usa un [SDK oficial o cliente de API](/docs/developers/clients-and-sdks) para integrarlo en tu
aplicación. El flujo de MCP también está disponible para backtests asistidos por un agente.

### Enviar vía MCP

Descarga el servidor MCP desde [las releases de QTSurfer/mcp-java](https://github.com/QTSurfer/mcp-java/releases/latest)
(binario nativo o fat JAR) y configúralo en tu agente. Una vez conectado:

1. Usa `list_exchanges` → `list_instruments` para elegir un exchange e instrumento válidos.
2. Llama a `submit_backtest` con `strategyCode` = el código fuente Java completo de tu clase de estrategia.
3. Sondea `get_job_status` hasta `COMPLETED` y lee los resultados.

El motor compila la estrategia en el servidor — solo se envía el fuente `.java`.

## Clases base de estrategia

Toda estrategia extiende una clase base del motor, elegida según la fuente de datos que consume.
Las tres clases base de una sola fuente extienden `AbstractSubscriptionStrategy<T>` y comparten el
**mismo modelo** que documenta esta skill (constructor de indicadores, window listeners,
`StateStore`, emisión de señales) — solo cambia el payload de `update(...)`. Los ejemplos de aquí
usan `Ticker`, la fuente más habitual. Los tipos viven en `com.wualabs.qtsurfer.engine.core`.

| Clase base                    | Fuente                        | Manejador                                | Vía `submit_backtest`           |
| ----------------------------- | ----------------------------- | ----------------------------------------- | -------------------------------- |
| `AbstractTickerStrategy`      | `Ticker` (record)            | `update(Ticker)`                         | ✅ principal, totalmente documentada |
| `AbstractKlineStrategy`       | `Kline` (clase)               | `update(Kline)`                          | ✅                                |
| `AbstractFundingRateStrategy` | `FundingRate` (record)       | `update(FundingRate)`                    | ⚠️ solo prepare por ahora — una ejecución o un barrido se rechaza (`400`) |
| `AbstractMultiSourceStrategy` | Ticker + Kline + FundingRate | `onTicker` / `onKline` / `onFundingRate` | ⚠️ solo motor — aún no pública    |

- **`AbstractKlineStrategy`** recibe velas. En un backtest el ancho de la barra es la `cadence` con
  la que se prepararon los datos — `1s`, `1m`, `5m`, `15m`, `30m`, `1h`, `4h` o `1d` —, sea lo que sea
  lo que devuelva `getInterval()` (un `KlineInterval`), así que una misma clase corre a cualquiera de
  ellos. **Solo OHLCV** — los campos de tamaño del libro de órdenes, vwap y cambio porcentual no están disponibles
  en esta vía. `Kline` es una clase simple, así que usa getters (`kline.getInstrument()`,
  `kline.getCloseTime()`), a diferencia del record `Ticker`.
- **`AbstractFundingRateStrategy`** recibe `update(FundingRate)` en cada actualización de la tasa
  de financiación. Los datos de funding se pueden preparar, pero un backtest o un barrido sobre ellos
  se rechaza por ahora con un `400` (`funding data can be prepared but not executed yet`) — se
  registra y compila, y todavía no se puede ejecutar mediante `submit_backtest`.
- **`AbstractMultiSourceStrategy`** declara `getRequiredSources()` → `Set<MarketDataSource>`
  (`Ticker`, `KLine`, `FundingRate`) y despacha cada una a `onTicker` / `onKline` / `onFundingRate`;
  cuando se requiere `KLine`, `getKlineInterval()` no puede ser nulo. Compila y se registra en el
  motor, pero **todavía no se puede ejecutar vía el `submit_backtest` público** — no publiques
  estrategias multi-fuente para backtest hasta que esté disponible.

## Estrategias entre instrumentos (a nivel de mercado)

Una instancia de estrategia ve **todos** los instrumentos aceptados, cada uno con su propio grupo
de indicadores. Para calcular algo _entre_ instrumentos (un percentil de todo el mercado, un
ranking de fuerza relativa, una señal de cesta), sobrescribe `update(Ticker)` y lee los indicadores
de otros instrumentos con `getInstruments()` / `getRTIndicator(...)`. Consulta [patrones de
estrategia](/docs/developers/strategy-patterns) → «Estrategias entre instrumentos (a nivel de
mercado)».

## Versión del motor

Hay tres accesores disponibles sin necesidad de importar nada, tanto en la estrategia como dentro
de un window listener:

```java
@Override
public void update(Ticker ticker) {
    log.info("running on engine {}", getEngineVersion());  // p. ej. "1.0.81"

    if (getEngineVersionMajor() >= 1) { /* ... */ }        // también getEngineVersionMinor()
}
```

El valor se lee de los propios metadatos del jar del motor cargado, así que informa del motor que
realmente está en ejecución y no del que estaba vigente cuando se compiló la estrategia. Nada de
esto lanza excepciones — cuando la versión no puede determinarse, `getEngineVersion()` devuelve
`EngineVersion.UNKNOWN` (`"unknown"`) y los accesores numéricos devuelven
`EngineVersion.UNKNOWN_COMPONENT` (`-1`), así que son seguros de llamar sin comprobación previa y
una puerta de versión falla cerrada en lugar de coincidir por accidente. La versión mayor y la
menor se resuelven juntas: comprueba una y puedes confiar en la otra.

Para el componente de parche, importa la clase del motor — deliberadamente no está reflejada en el
azúcar sintáctico:

```java
import com.wualabs.qtsurfer.engine.EngineVersion;

int patch = EngineVersion.getPatch();  // 81
```

Merece la pena emitirla (en un `InfoStrategySignal`, o registrarla en el primer tick) en
estrategias que se almacenan y se vuelven a ejecutar más tarde: las API del motor sí cambian entre
versiones, y una estrategia guardada que de repente se comporta mal es mucho más fácil de
diagnosticar cuando el motor sobre el que corrió queda registrado junto al resultado.

## Errores habituales

- **Olvidar comprobar `isReady()`** — los indicadores necesitan periodos de calentamiento.
  Compruébalo siempre antes de leer valores.
- **Mutar indicadores en `update()`** — usa `getReadOnlyExisting()` en lugar de `getExisting()`
  para evitar cambios accidentales de estado.
- **Un `setupIndicators` por clase de estrategia** — se llama una vez por instrumento, no por tick.
- **Clase o lambda para un listener** — una lambda sirve cuando el listener solo usa el `StateStore`,
  `prev` y `actual`; extiende `AbstractWindowListener` cuando necesita `emitBuy(price)`,
  `getPrevInstant()` u otros helpers.
- **Llamar a `updateIndicators(...)` en lugar de `super.update(ticker)`** — la estrategia opera, pero el
  `storeSignals` de un backtest sale vacío. Llama a `super.update(ticker)` y lee los indicadores con
  `getRTIndicator(...)` (consulta [Leer valores de indicadores fuera de un
  listener](#leer-valores-de-indicadores-fuera-de-un-listener)).
- **`min = 1` en `@StrategyProperty`** — escribe `1.0` (consulta [Propiedades
  configurables](#propiedades-configurables)).
- **`emitBuy(price)` fuera de un window listener** — esa sobrecarga de un solo argumento solo existe
  en `AbstractWindowListener`; en cualquier otro sitio (`update()`, métodos auxiliares) es
  `emitBuy(instrument, price)` (consulta [Emisión de señales](#emisión-de-señales)).
- **Usar getters de JavaBean sobre `Ticker`** — `Ticker` es un record; usa `ticker.last()` en lugar
  de `ticker.getLast()`, `ticker.instrument()` en lugar de `ticker.getInstrument()`,
  `ticker.timestamp()` en lugar de `ticker.getTimestamp().getTime()`.
- **Tratar un comando como estado guardado** — un comando es transitorio (consulta
  [Recibir comandos](#recibir-comandos)): no se reproduce a una réplica entre reinicios. Todo lo que
  deba sobrevivir a uno va en un parámetro, fijado desde dentro de `handle`, no en el comando en sí.
