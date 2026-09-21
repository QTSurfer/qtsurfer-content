---
title: QTScript (beta)
description: Un lenguaje compacto para escribir estrategias — cada sección, las ventanas, qué hay en su ámbito, y cómo compila igual que Java.
order: 5.15
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 1234ca1a762e589f51b4679af889ca6cba5802cb
upstreamPath: docs/qtscript.md
lastUpdated: '2026-09-21T12:08:42Z'
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
| `setup:` | Los indicadores, **una llamada al builder por línea** (el mismo catálogo que usa una estrategia Java). Las líneas bajo `setup:` van indentadas, y la primera línea que vuelve a la columna 0 cierra la sección | `ema(12)` · `bollinger(20, 2)` |
| Ventanas | Donde va la lógica — consulta abajo | `rsi(14) window m1 { ... }` |

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

Una sección llamada `Principal` a la que nada hace referencia vigila el valor principal (`price`, o
`rate` en funding), lo que da el fichero útil más corto:

```
strategy Simple

Principal m1 {
  if (actual > prev) emitBuy(price);
}
```

## Dentro de un cuerpo

Tu Java, más lo que ya está en ámbito — nada necesita importarse:

| En ámbito | Qué es |
|---|---|
| `actual`, `prev` | el valor nuevo y el anterior de la ventana |
| `price` (ticker) · `price open high low close volume` (kline) · `rate` (funding) | los valores actuales, como variables normales |
| `value("nombre")` | el valor actual de cualquier otro indicador |
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
patrón de instrumento mal formado) como para errores de Java dentro de un cuerpo. Un fallo mientras
corre la estrategia se registra en el job de la misma forma, en la línea de la que viene el cuerpo:

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
