---
title: QTScript (beta)
description: Un lenguaje compacto para escribir estrategias — cada sección, las ventanas, qué hay en su ámbito, y cómo compila igual que Java.
order: 5.15
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 3a97c37ef21dc83a76e523828f926b96f083dd31
upstreamPath: docs/qtscript.md
lastUpdated: '2026-10-15T12:10:55Z'
---

QTScript es una forma compacta de escribir una estrategia: conservas la parte que es tuya —
indicadores, ventanas, señales — y dejas fuera la ceremonia de una clase Java (paquete, imports,
clase, clase base, anotaciones de propiedades, código repetitivo de listeners). **Cada cuerpo `{ }`
es Java tal cual**, así que todo lo que ofrece la [API de estrategias Java](strategy_coding) dentro
de un cuerpo funciona sin cambios. Un fichero QTScript se convierte en exactamente una clase Java y
pasa por la misma compilación en el servidor que una estrategia Java.

Está **en beta** y ganará más sintaxis. Java sigue siendo la vía establecida, con toda la API del
motor; lo que QTScript no puede expresar se escribe en Java (consulta [qué no hace](#qué-no-hace)).

## Se envía como cualquier estrategia

No hay un endpoint aparte ni una cabecera que fijar: envía el fuente en crudo a
[`POST /strategy`](strategy#compilar-una-estrategia) con `Content-Type: text/plain`, exactamente
igual que con Java. La plataforma distingue ambas por el texto — un fuente QTScript empieza por
`strategy`, y los espacios en blanco o comentarios (`//`, `/* */`) antes de esa palabra se ignoran,
así que puede haber una descripción encima del fichero. `.qtscript` es la extensión de fichero
convencional; solo se envía el texto.

```bash
curl -X POST https://api.qtsurfer.net/v1/strategy \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: text/plain" \
  --data-binary @rsi-reversion.qtscript
```

La respuesta es la misma que para Java: un `strategyId` y los `declaredProperties` — cada `param`
que declaraste aparece ahí.

## Una estrategia entera

Este es el fichero completo: sin imports, sin clase, sin listener.

```
strategy "RSI reversion"

param rsiBajo = 30  "Sobrevendido"
param rsiAlto = 70  "Sobrecomprado"

instruments */usdt

setup:
  rsi(14) window m1 {
    if (actual < rsiBajo) emitBuy(price);
    if (actual > rsiAlto) emitSell(price);
  }
```

Declara dos parámetros, acepta cualquier base cotizada en USDT, registra un RSI de 14 periodos y lo
vigila en una ventana de un minuto, emitiendo una señal en cada umbral.

## Las partes de un fichero

| Parte | Qué hace | Ejemplo |
|---|---|---|
| `strategy` | La primera línea: el nombre y, opcionalmente, la fuente de datos (`ticker` por defecto, `kline`, `funding`) | `strategy "RSI reversion"` · `strategy Barras kline` |
| `param` | Un valor configurable. El tipo sale del literal (`9` → `int`, `0.5` → `double`, `true` → `boolean`, `"texto"` → `String`). **El nombre es la clave** que usan los `params` de una ejecución y un eje de barrido | `param rsiBajo = 30 "Sobrevendido"` |
| `init { }` | Opcional. Java tal cual, se ejecuta una vez al construir la estrategia — setters del motor | `init { setPercentGain(0.5); }` |
| `instruments` | Opcional. Qué mercados: pares (`BASE/QUOTE`, cualquiera de los dos lados puede ser `*`), expresiones regulares (`~"..."`, comparadas contra el símbolo completo), o un cuerpo Java para control total | `instruments */usdt` · `instruments btc/usdt, eth/*` |
| `setup:` | Los indicadores, **una llamada al builder por línea** (el catálogo libre del builder que usa una estrategia Java, [listado abajo](#qué-va-bajo-setup)). Las líneas bajo `setup:` van indentadas, y la primera línea que vuelve a la columna 0 cierra la sección | `ema(12)` · `bollinger(20, 2)` |
| Ventanas | Donde va la lógica — consulta abajo | `rsi(14) window m1 { ... }` |
| `onCommand { }` | Opcional, como mucho una por fichero. Corre cuando la ejecución recibe un [comando](live#comandos) — consulta abajo | `onCommand { if ("flatten".equals($command)) ... }` |

### Qué va bajo `setup:`

Cada línea es una llamada al builder de indicadores que una estrategia Java configura en `setupIndicators`,
[`InstrumentGroupRTIndicator`](https://www.qtsurfer.com/docs/developers/java-api/reference/latest/com/wualabs/qtsurfer/engine/indicators/helpers/group/InstrumentGroupRTIndicator.html),
escrita sin el punto. Estos son los nombres que funcionan:

`add` `bollinger` `bollingerBandwidth` `cci` `clamp` `conditional` `diff` `distance` `distanceMa` `ema` `equal`
`gain` `greatOrEqual` `greatThan` `lessOrEqual` `lessThan` `loss` `macd` `max` `min` `mul` `notEqual`
`percentChange` `rateChange` `round` `rsi` `sma` `stochRsi` `sum`

Los argumentos que admite cada uno están en el Javadoc del builder. Una llamada cuyos argumentos no encajan con
ninguna de sus formas se rechaza indicando las que sí existen: `ema(1, 2, 3)` responde que sus formas son
`ema(int)`, `ema(String, int)` y `ema(String, String, int)`. Los métodos del builder que reciben una función
(`predicate`, `fun`, `decorate`, `periodCount`) solo se pueden escribir en Java.

Un nombre que no está en la lista no es un indicador que puedas usar aquí, y la estrategia se rechaza con
`unknown indicator '<nombre>'`: `atr`, `wma`, `adx` y `zscore` están entre los nombres que responden así. Lo mismo
ocurre con `value("nombre")`, que lee un indicador dentro de un cuerpo `{ }` y no tiene sentido en una línea de
`setup:`.

## Ventanas

Una ventana se dispara cuando cierra su periodo, no en cada tick, y envuelve un indicador. Un
periodo es uno de `s1 s5 s10 s30 m1 m3 m5`, o un número entero de segundos (`window 900 { ... }`);
si se omite, es `s1`. Cinco formas de escribir una:

```
setup:
  rsi(14) window m1 { ... }      // en línea, sobre el indicador que registra esta línea
  rsi(33) window Sobrevendido    // igual, con el cuerpo en una sección con nombre más abajo
  window price m5 { ... }        // en línea, sobre un indicador por nombre
  window ema12 Tendencia         // por nombre, cuerpo en una sección con nombre

window Sobrevendido m1 { ... }   // una sección con nombre, en la columna 0
Tendencia s5 { ... }             // `window` es opcional aquí
```

Una sección llamada `Main` a la que nada hace referencia vigila el valor principal (`price`, o
`rate` en funding), lo que da el fichero útil más corto:

```
strategy Simple

Main m1 {
  if (actual > prev) emitBuy(price);
}
```

### La ventana te da el valor anterior

Una ventana se dispara cuando cierra su periodo, así que `prev` es el valor que tenía el indicador cuando cerró la
ventana **anterior** y `actual` es su valor ahora: el `close[1]` de otras herramientas. Un cruce, o cualquier otra
cosa que compare un cierre con el anterior, no necesita guardar nada en el [store](#dentro-de-un-cuerpo); el valor
anterior ya está en ámbito.

Esto entra cuando el RSI vuelve a subir por encima de un nivel, una sola vez, en la ventana en la que ocurre:

```
strategy "RSI re-entry"

param nivel = 30 "Nivel que hay que volver a superar"

setup:
  rsi(14) window m1 {
    if (prev < nivel && actual >= nivel) emitBuy(price);
  }
```

En una estrategia `kline`, una ventana sobre `close` te da el cierre de la barra anterior como `prev`, que es lo que
necesita el rango verdadero junto a los `high` y `low` de la propia barra:

```
strategy "True range" kline

setup:
  window close m1 {
    double trueRange = Math.max(high - low, Math.max(Math.abs(high - prev), Math.abs(low - prev)));
    emitInfo("trueRange", trueRange);
  }
```

La primera vez que se dispara una ventana no hay una ventana anterior con la que comparar: `prev` es el valor que
tenía el indicador cuando se abrió esa primera ventana. Una regla que necesite dos cierres reales debe dejar pasar
el primer disparo, y un indicador con periodo de calentamiento, como un RSI o una EMA, tampoco se ha asentado en
sus primeras ventanas. Reserva el store para lo que una ventana no te puede dar: una marca, un contador, un valor de
varias ventanas atrás.

### En qué indicador está una ventana

Dentro del cuerpo de cualquier ventana, `$indicator` es el nombre del indicador al que está enganchada
esa ventana, como un `String`: `"ema12"` para una ventana escrita en la línea `ema(12)`, `"price"` en un
`Main` (`"rate"` en funding). El `$` marca un nombre que aporta QTScript; los nombres que declaras tú no
pueden empezar por uno. Una sección con nombre enganchada a varios indicadores ve, cada vez que se
dispara, el indicador que la disparó.

También es la forma en que un cuerpo llega a un indicador que la misma llamada al builder registró junto
al que ocupa la ventana. `bollinger(20, 2)` registra tres bajo un mismo nombre: la banda media,
`blgr20_2`, y las bandas exteriores, ese nombre seguido de `Upper` y `Lower`. Una ventana escrita en esa
línea se engancha a la banda media, así que `actual` es el valor de la banda media, y
`value($indicator + "Upper")` y `value($indicator + "Lower")` leen las otras dos:

```
setup:
  bollinger(20, 2) window m1 {
    if (price > value($indicator + "Upper")) emitSell(price);
    if (price < value($indicator + "Lower")) emitBuy(price);
  }
```

Una ventana que nombra un indicador que no está registrado, como `window noexiste m1 { ... }`, no se
rechaza al registrar el fuente. Que el nombre exista puede depender de tus `param` (un `param rapida`
usado como `ema(rapida)` registra un nombre distinto para cada valor) y de indicadores registrados desde
Java, así que solo se descubre al [validar](strategy#comprobar-que-realmente-funciona) la estrategia,
que entonces falla en la línea de la ventana: `QTScript line 4: unknown indicator 'noexiste'`.

## Dentro de un cuerpo

Tu Java, más lo que ya está en ámbito — nada necesita importarse:

| En ámbito | Qué es |
|---|---|
| `actual`, `prev` | el valor nuevo de la ventana y el que tenía cuando cerró la ventana anterior — [consulta arriba](#la-ventana-te-da-el-valor-anterior) |
| `price` (ticker) · `price open high low close volume` (kline) · `rate` (funding) | los valores actuales, como variables normales |
| `value("nombre")` | el valor actual de cualquier otro indicador |
| `$indicator` | el nombre del indicador en el que está esta ventana, como un `String` — [ver arriba](#en-qué-indicador-está-una-ventana) |
| `store` | el estado por instrumento que comparten todas las ventanas de ese instrumento |
| `emitBuy(price)`, `emitSell(price)`, `emitInfo(clave, valores…)`, `emitSignal(signal)` | emisión de señales |
| cada `param` | legible por su nombre |

Un flag de posición en el store, emitiendo solo una vez en el cruce:

```
strategy "EMA cross"

param rapida = 9  "EMA rápida"
param lenta  = 21 "EMA lenta"

setup:
  ema(rapida)
  ema(lenta)
  window price s5 {
    double f = value("ema" + rapida);
    double s = value("ema" + lenta);
    if (f > s && !store.is("largo")) {
      store.set("largo");
      emitBuy(price);
    }
    if (f < s && store.is("largo")) {
      store.unset("largo");
      emitSell(price);
    }
  }
```

`value("ema" + rapida)` lee cualquier indicador registrado por nombre; `store` es el mismo store
que comparte cada ventana del instrumento.

## Velas

`strategy … kline` da los campos de la barra como variables normales. Una estrategia kline nunca
recibe un intervalo: el ancho de la barra es la `cadence` con la que
[preparas los datos](backtest_execute#kline-tú-eliges-el-ancho-de-la-barra), así que el mismo
fichero corre a cualquiera de ellas.

```
strategy "Range breakout" kline

param rangoMinimo = 0.5 "Rango mínimo, en porcentaje"

setup:
  window close m1 {
    double rango = (high - low) / low * 100.0;
    if (rango < rangoMinimo) return;
    if (close > open) emitBuy(close);
    else              emitSell(close);
  }
```

## Manejar un comando

`onCommand { }` es una sección especial, como mucho una por fichero, que corre cuando la plataforma entrega un
[comando](live#comandos) a una ejecución en vivo — `POST /live/{runId}/commands`, aplicado sin reiniciar la
estrategia. No tiene periodo ni indicador: no es una ventana, corre una vez por comando, no una vez por evento
de mercado, y un fichero tiene como mucho una, igual que tiene como mucho un `init { }`.

Dentro de su cuerpo, `$command` es el texto del comando, como un `String` — nada más de lo que tiene el cuerpo
de una ventana (`actual`, `$indicator`, `value(...)`, el `store` ambiental) está en ámbito, porque un comando
no está atado a un tick de mercado ni, a diferencia de una ventana, a un instrumento ya elegido por ti. Cada
`param` sigue siendo legible y asignable.

Un comando puede llevar un objeto `properties` de tu elección, junto a `command` en el cuerpo de la petición.
Lee un valor de ahí con `$command.<clave>` — un `String`, `null` cuando el comando no llevaba esa clave.
`$command.<clave>` solo se dispara cuando `<clave>` no es en sí misma una llamada, así que `$command.equals(...)`,
`$command.startsWith(...)` y el resto se siguen leyendo como métodos normales de `String` sobre el propio
`$command`.

Al cuerpo de una ventana se le entrega el `store` de su instrumento; a `onCommand` no, ya que un comando no
nombra ningún instrumento por sí mismo — pero `getStateStore("<símbolo>")` acepta uno directamente, así que
un comando cuyas propias `properties` nombran un instrumento aún puede alcanzar el store de ese instrumento:

```
strategy "Manual flatten"

onCommand {
  if ("flatten".equals($command)) {
    getStateStore($command.instrument).set("cerrada");
  }
}
```

Una estrategia sin `onCommand { }` no implementa `CommandRequestHandler` del motor, así que un comando enviado
a una de sus ejecuciones se rechaza con `409` (consulta [Comandos](live#comandos)). `$command` y
`$command.<clave>` no son visibles fuera del cuerpo de `onCommand`, igual que `$indicator` no es visible fuera
de una ventana.

Fijar un `param` o escribir en un `StateStore` desde dentro de `onCommand` surten efecto de inmediato, pero
ninguno de los dos sobrevive a un reinicio: un `StateStore` es memoria, se pierde en un reinicio igual que un
campo. Solo [`PUT /live/{runId}/params`](live#parámetros-en-tiempo-de-ejecución) escribe algo de lo que una
réplica reiniciada realmente parte. `getStateStore(...)` aquí no trata de durabilidad — es cómo `onCommand`
alcanza el estado por instrumento que el cuerpo de una ventana ya lee, ya que un comando no lleva instrumento
propio.

Una estrategia Java implementa el mismo contrato directamente, mediante `CommandRequestHandler` — consulta
[Programar estrategias en Java](strategy_coding#recibir-comandos).

## Dimensionado

Una estrategia dice cuándo y en qué sentido, no cuánto. `emitBuy(price)` y `emitSell(price)` llevan un precio y nada
más, y ninguna llamada pone una cantidad ni un nocional en una señal. El tamaño de cada entrada es un ajuste de la
ejecución, `percentAmountToLock`: el porcentaje del saldo libre de la cuenta que bloquea una entrada, por encima de
0 y hasta 100.

Dónde se da depende de la ejecución: `baseConfig` en un [backtest](backtest_execute) o un
[barrido](backtest_sweep), el bloque `paper` en una [ejecución en vivo en papel](live_paper). Si se omite, un
backtest pone todo el saldo libre en cada entrada y la cuenta en papel de una ejecución en vivo bloquea el 10 %.
Para ver cómo se comporta una estrategia con otro tamaño, vuelve a ejecutarla con otro `percentAmountToLock`; el
fichero no cambia.

## Ejecutarla

Una estrategia QTScript registrada se prepara, ejecuta y barre como cualquier otra:
[`prepare`, `execute`](backtest_execute) y [`executeSweep`](backtest_sweep), con el `strategyId`
que recibiste. Los ejes de barrido y `params` usan los nombres de tus líneas `param`.

| `strategy …` | Prepare | Execute | Sweep |
|---|---|---|---|
| ticker (por defecto) | sí | sí | sí |
| `kline` | sí | sí | sí |
| `funding` | sí | aún no | aún no |

Consulta [Fuentes de datos](backtest_execute#fuentes-de-datos) para los detalles, incluido por qué
una estrategia `funding` se puede registrar y sus datos preparar, pero todavía no ejecutar.

## Cuando algo va mal

Los errores se reportan contra **tu** fichero, nunca contra el Java generado. Registrar un fuente
con un error es un `400` cuyo mensaje lleva entradas `Line N, Column M:`, tanto para errores
propios de QTScript (una sección desconocida, un periodo inválido, un parámetro duplicado, un
patrón de instrumento mal formado) como para errores de Java dentro de un cuerpo.

**Un `200` de `POST /strategy` significa que el fuente se analizó y compiló, no que vaya a funcionar.**
Registrar no monta la estrategia, así que lo que solo aparece al montarla lo halla
[`validate`](strategy#comprobar-que-realmente-funciona), que lo reporta contra tu fichero de la misma
forma. El caso a conocer es una ventana sobre un indicador que no está registrado,
`window noexiste m1 { ... }`: se registra, y `validate` acaba `failed` en la línea de la ventana,
`QTScript line 4: unknown indicator 'noexiste'` (consulta
[En qué indicador está una ventana](#en-qué-indicador-está-una-ventana)). Llama a `validate` antes de
ejecutar una estrategia que acabas de escribir.

Un fallo mientras corre la estrategia se registra en el job de la misma forma, en la línea de la que
viene el cuerpo:

```
QTScript line 6: Index 2 out of bounds for length 1
```

## El id de la estrategia

`POST /strategy` devuelve el mismo `strategyId` para el mismo fuente. Para QTScript el id sale del
texto, porque la indentación es parte de la gramática: una marca de orden de bytes (BOM), el estilo
de saltos de línea, los espacios en blanco al final de línea y las líneas en blanco antes de la
primera y después de la última se ignoran; cualquier otra cosa — un comentario, la indentación, una
línea en blanco intermedia — da un id distinto. (Las estrategias Java son más tolerantes; consulta
[Estrategias](strategy#compilar-una-estrategia).)

## Qué no hace

Por diseño, y cada punto es una razón para escribir la estrategia en Java en su lugar:

- **Sin `update()`.** Las ventanas son el modelo; una estrategia que necesita ver cada tick
  pertenece a Java.
- **Sin lógica entre instrumentos** — leer los indicadores de otros instrumentos necesita la clase
  completa.
- **Sin clases de indicador personalizadas**, sin campos o métodos extra más allá de los que
  declaran las secciones, y sin estrategias multi-fuente.
- **Una sola clase.** Cualquier cosa que quiera tipos auxiliares es una estrategia Java.

Cambiar nunca es un callejón sin salida: un fichero `.qtscript` es una clase Java con la ceremonia
quitada.

## Para ir más allá

La skill mantenida **`qtsurfer-qtscript-strategy`** tiene la referencia completa del lenguaje —
cada sección, el filtro de instrumentos en detalle, nombres reservados, y más ejemplos — y funciona
con agentes que leen skills:

```bash
npx skills add QTSurfer/strategy-skills --skill qtsurfer-qtscript-strategy
```

Los cuerpos se escriben contra la API de estrategias documentada en la skill
[`qtsurfer-java-strategy`](https://github.com/QTSurfer/strategy-skills) y en
[Programar estrategias en Java](strategy_coding).
