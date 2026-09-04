---
title: Estrategias en Java
description: Construye estrategias QTSurfer con indicadores, window listeners, estado y señales.
order: 1
lastUpdated: '2026-09-04T10:18:11Z'
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: 5c90b3afbb7a4ccace1e3054060525ee0e2caef3
upstreamPath: skills/qtsurfer-java-strategy/SKILL.md
---

Una estrategia de QTSurfer es una clase Java sencilla (sin anotaciones de framework) que extiende
una clase base de estrategia — la más habitual es `AbstractTickerStrategy` (consulta [Clases base
de estrategia](#clases-base-de-estrategia) para las variantes de kline, funding rate y multi-fuente).
Recibe datos de mercado en tiempo real, configura indicadores técnicos y emite señales de compra o
venta. El motor compila las estrategias en el servidor — no hace falta ninguna herramienta local.

## Plantilla mínima

```java
import com.wualabs.qtsurfer.engine.indicators.helpers.group.InstrumentGroupRTIndicator;
import com.wualabs.qtsurfer.engine.strategy.AbstractTickerStrategy;

public class MyStrategy extends AbstractTickerStrategy {

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        // configure indicators here — called once per instrument on first tick
    }
}
```

## Imports permitidos

El código de estrategia se ejecuta en un classloader aislado con una lista blanca de paquetes —
importar cualquier cosa fuera de ella falla en tiempo de ejecución (no de compilación), con un
error del estilo `<class> could not be found` a secas y sin indicación de _por qué_. Permitidos,
por paquete de primer nivel (se incluye cada subpaquete):

- `com.wualabs.qtsurfer.engine.*` — la propia API de estrategias e indicadores
- `java.lang`, `java.util` (incluidos `java.util.stream`, `java.util.function`, `java.util.regex`, `java.util.concurrent.atomic`), `java.math`
- `java.time` (incluidos `java.time.format`, `java.time.temporal`) — `Duration`, `Instant`, `LocalDate`, etc., se pueden usar sin problema, por ejemplo en `.window(name, Duration.ofSeconds(n), listener)`
- `java.text` — `DecimalFormat`/`NumberFormat` para formatear valores en mensajes de señal o logs

Bloqueados explícitamente sea cual sea el paquete: `System`, `Runtime`, `Thread`,
`Executor`/`ExecutorService`. `java.io` está bloqueado por completo — una estrategia no tiene por
qué hacer entrada/salida de ficheros o de red por su cuenta; todos los datos de mercado y la
ejecución de órdenes pasan por la API del motor de arriba.

Esta lista es deliberadamente pequeña y está compilada dentro de la plataforma en lugar de ser
configurable — un sandbox para código de usuario no confiable no debería poder ampliarse por un
canal más débil que un cambio de código revisado. Si una estrategia necesita algo fuera de ella,
eso es una decisión de plataforma, no algo que sortear desde el cliente.

`acceptInstrument` y `getExecutionMode` tienen valores por defecto razonables (aceptar todos los
instrumentos, modo LONG). Sobrescríbelos solo si lo necesitas:

```java
import com.wualabs.qtsurfer.engine.core.instrument.Instrument;
import com.wualabs.qtsurfer.engine.strategy.execution.ExecutionMode;

@Override
public boolean acceptInstrument(Instrument instrument) {
    return instrument.base().equals("BTC"); // filter instruments here if needed
}

@Override
public ExecutionMode getExecutionMode(Instrument instrument) {
    return ExecutionMode.LONG; // LONG, SHORT, or LONG_MULTI
}
```

> Nota: el `acceptInstrument` **por defecto** _no_ es incondicional — filtra según la moneda de
> salida de la estrategia / `acceptCurrency`. Para aceptar **todos** los instrumentos sin
> condición, sobrescríbelo explícitamente devolviendo `true`.

## Nivel de lenguaje

El código de estrategia se compila contra una base de lenguaje bastante anterior al JDK sobre el
que corre la propia plataforma — escribirlo como Java moderno produce un error de compilación sin
ninguna pista de que la causa es el nivel de lenguaje y no una errata. En concreto, evita:

- **`var`** (inferencia de tipo en variables locales) — declara el tipo explícitamente.
  `updateIndicators(...)` devuelve `InstrumentMapRTIndicator`; `setupIndicators` recibe
  `InstrumentGroupRTIndicator` — dos tipos distintos, fáciles de confundir en cuanto no puedes
  apoyarte en `var` para taparlo.
- **Lambdas y referencias a método** (`x -> ...`, `Foo::bar`) — no es solo cuestión de estilo: aquí
  no compilan en absoluto, en ninguna posición (argumento, asignación, valor de retorno). Usa una
  clase interna con nombre o anónima, que es además lo que ya exige todo window listener (ver más
  abajo).
- **Expresiones `switch`** (`switch (x) { case 1 -> ...; }`) — usa una sentencia `switch` clásica,
  o `if`/`else`.
- **Records**, **tipos sellados**, **coincidencia de patrones** (`instanceof` con vinculación,
  `switch` con patrones) — nada de esto está disponible; escribe el equivalente en formato largo.
- **Una variable local capturada sin `final`** — una clase anónima o interna que lee una variable
  de su método envolvente necesita que esa variable esté declarada `final`, explícitamente. La
  captura de variables efectivamente finales (sin palabra clave, mientras no se reasignen) no está
  soportada: una variable que sería legal capturar en Java moderno aquí sigue necesitando la
  palabra clave.

Dos más, específicas de implementar una interfaz funcional genérica (`Predicate<Double>`,
`BiFunction<Double,Double,Double>`, …) como clase anónima — la sobrescritura de aspecto natural
parece correcta y aun así no compila:

- **Declara los parámetros sobrescritos como `Object`, no con el tipo real del genérico**, y haz la
  conversión dentro del cuerpo del método.
  `new Predicate<Double>() { public boolean test(Double v) { ... } }` falla con
  _«must implement method ... test(Object)»_ — el método puente que necesita una sobrescritura
  tipada como `Double` nunca se genera. `public boolean test(Object v) { return (Double) v > 0; }`
  es lo que compila de verdad. Esto aplica a cada parámetro de cada método de estas interfaces:
  `BiFunction.apply(Object, Object)`, `Consumer.accept(Object)`, todos.
- **El tipo de retorno no tiene este problema** — decláralo con el tipo real (`Double`, no
  `Object`); solo los parámetros necesitan ser `Object`.

Los bloques de texto y el `try`-with-resources sí funcionan. Ante la duda, escríbelo como lo haría
Java 7.

## Configuración de indicadores

Todos los indicadores se definen en `setupIndicators` mediante el builder fluido de
`InstrumentGroupRTIndicator`. Los métodos devuelven `this` para encadenar llamadas.

```java
@Override
protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
    indicators
        .addPrice()                     // source: close price
        .ema("emaFast", 9)             // 9-period EMA named "emaFast"
        .ema("emaSlow", 21)            // 21-period EMA named "emaSlow"
        .rsi(14)                        // 14-period RSI named "rsi14"
        .bollinger("bb", 20, 2.0)      // Bollinger Bands → "bb", "bbUpper", "bbLower"
        .window("emaFast", WindowTime.s1, new MyListener(this, indicators));
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
import com.wualabs.qtsurfer.engine.indicators.helpers.group.InstrumentMapRTIndicator;

@Override
public void update(Ticker ticker) {
    Instrument instrument = ticker.instrument();
    updateInstrument(instrument, ticker.timestamp());
    InstrumentMapRTIndicator ind = updateIndicators(instrument, ticker);

    if (!ind.getExisting("emaSlow").isReady()) return; // wait for warmup

    double fast = ind.getValue("emaFast");
    double slow = ind.getValue("emaSlow");

    if (fast > slow) emitBuy(instrument, ticker.last());
    else             emitSell(instrument, ticker.last());
}
```

`Ticker` es un record del motor — lee sus campos con métodos de acceso: `ticker.last()`,
`ticker.bid()`, `ticker.ask()`, `ticker.instrument()`, `ticker.timestamp()`.

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
    InstrumentMapRTIndicator ind = updateIndicators(instrument, ticker);

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
store.inc("count")          // int counter, returns new value
store.dec("count")
store.set("inPosition")     // boolean flag → true
store.unset("inPosition")   // → false
store.is("inPosition")      // read boolean
store.add("pnl", delta)     // double accumulator, returns new value
store.setState("key", obj)  // arbitrary object
store.getState("key", def)  // with default
```

## Propiedades configurables

```java
@StrategyProperty(name = "rsi.period", description = "RSI period", defaultValue = "14")
private int rsiPeriod;

@StrategyProperty(name = "ema.fast", description = "Fast EMA period", defaultValue = "9")
private int fastPeriod;
```

La anotación y el campo son toda la declaración — sin getter, sin setter. Las propiedades se
inyectan antes de que se llame a `setupIndicators`, y lo mismo vale para un vector de parámetros de
`submit_sweep`: se escribe directamente en el campo.

**La clave de parámetro de `submit_sweep` es el `name` de la anotación (con puntos), NO el nombre
del campo Java.** En el ejemplo de arriba, la clave de la cuadrícula es `rsi.period` / `ema.fast`,
no `rsiPeriod` / `fastPeriod`:

**Deja que `defaultValue` sea el único sitio donde se escribe el valor por defecto.** Un
inicializador de campo (`private int fastPeriod = 9;`) se ejecuta _después_ de haberse aplicado el
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
InfoStrategySignal signal = createInfoStrategySignal(instrument);  // from AbstractTickerStrategy
signal.set("interval", "1m");
signal.set("zscore", z);
signal.set("vwap", vwap);
emitSignal(signal);
```

- **Dentro de un window listener (`AbstractWindowListener.onChange`) — `createInfoSignal()`**, instrumento implícito:

```java
InfoStrategySignal signal = createInfoSignal();  // listener knows its instrument
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

Los suscriptores leen los campos con `signal.get("key")` / `signal.has("key")` y
`signal.getInstrument()`. Prefija el nombre de un campo con `_` para que quede fuera de los
metadatos de reporte.

## Helper de detección de cruces

```java
import com.wualabs.qtsurfer.engine.strategy.CrossDetector;

private final CrossDetector fastSlowCross = new CrossDetector(); // one instance per pair watched

// In onChange or update:
CrossDetector.Cross cross = fastSlowCross.check(fast, slow);
if (cross.above()) emitBuy(price);
if (cross.below()) emitSell(price);
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
| `AbstractFundingRateStrategy` | `FundingRate` (record)       | `update(FundingRate)`                    | ✅                                |
| `AbstractMultiSourceStrategy` | Ticker + Kline + FundingRate | `onTicker` / `onKline` / `onFundingRate` | ⚠️ solo motor — aún no pública    |

- **`AbstractKlineStrategy`** se suscribe a velas del `getInterval()` (un `KlineInterval`). **Solo
  OHLCV** — los campos de tamaño del libro de órdenes, vwap y cambio porcentual no están disponibles
  en esta vía. `Kline` es una clase simple, así que usa getters (`kline.getInstrument()`,
  `kline.getCloseTime()`), a diferencia del record `Ticker`.
- **`AbstractFundingRateStrategy`** recibe `update(FundingRate)` en cada actualización de la tasa
  de financiación.
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
    log.info("running on engine {}", getEngineVersion());  // e.g. "1.0.81"

    if (getEngineVersionMajor() >= 1) { /* ... */ }        // also getEngineVersionMinor()
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
- **Lambda como listener** — no es una cuestión de estilo: aquí las lambdas no compilan en
  absoluto. Usa una clase interna con nombre (consulta [Nivel de lenguaje](#nivel-de-lenguaje)).
- **`var` en código de estrategia** — no compila; declara el tipo explícitamente (consulta
  [Nivel de lenguaje](#nivel-de-lenguaje)).
- **`emitBuy(price)` fuera de un window listener** — esa sobrecarga de un solo argumento solo existe
  en `AbstractWindowListener`; en cualquier otro sitio (`update()`, métodos auxiliares) es
  `emitBuy(instrument, price)` (consulta [Emisión de señales](#emisión-de-señales)).
- **Usar getters de JavaBean sobre `Ticker`** — `Ticker` es un record; usa `ticker.last()` en lugar
  de `ticker.getLast()`, `ticker.instrument()` en lugar de `ticker.getInstrument()`,
  `ticker.timestamp()` en lugar de `ticker.getTimestamp().getTime()`.
