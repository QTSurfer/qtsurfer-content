---
title: Patrones de QTScript
description: Aplica filtros, salidas, transiciones de estado y puertas reutilizables en una estrategia QTScript.
order: 9
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: 7c6e6ae7ab538e8e1988a1bfefaa55f0878e6201
upstreamPath: skills/qtsurfer-qtscript-strategy/references/patterns.md
---

Patrones que se repiten en estrategias que han corrido de verdad, escritos como ficheros `.qtscript` completos: pega uno, cambia los números
y compila. Son la versión QTScript de los [patrones de estrategias en Java](/docs/strategies/java/patterns), con los
mismos nombres donde la idea es la misma. El lenguaje está en [la guía de QTScript](/docs/strategies/qtscript); las estrategias completas, una por fuente de datos, están en
[los ejemplos](/docs/strategies/qtscript/examples).

Todos los ficheros son una estrategia `ticker` que lee `price`, y cada número es un `param`, así que un barrido puede buscarlo. Los valores son
puntos de partida, no recomendaciones: salen de una estrategia sobre un feed de un segundo, y otro instrumento u otro periodo de ventana
quiere el suyo. Ninguno de estos ficheros es una estrategia para ejecutar tal cual: cada uno muestra una pieza, y un backtest de ella sola sobre
un día no será rentable. Los cuerpos son Java llano, como en todo QTScript; `store` es el estado propio del instrumento (consulta
[Dentro de un cuerpo](/docs/strategies/qtscript#dentro-de-un-cuerpo)).

## Cadena de filtrado de ruido

Convierte un indicador en bruto en una señal limpia y suavizada:

```
señal en bruto
  → clamp (dentro de ±banda → 0)     suprime el micro-ruido
    → cambio porcentual               tasa de cambio de lo que queda
      → media condicional             solo un cambio distinto de cero la mueve
```

La versión en Java de este patrón usa un `clamp` con una función y un `conditional`, y QTScript no puede escribir ninguno de los dos en una línea
de `setup:`. La distancia sigue siendo una línea de `setup:`; las tres etapas se escriben en el cuerpo, y la media se guarda en el `store`:

```qtscript
strategy "Noise filtering chain"

param noiseBand  = 0.1  "Distance inside +/- this is noise (percent)"
param smoothN    = 20   "Length of the average, counted in non-zero changes"
param enterAbove = 0.05 "Smoothed change that opens a position"

setup:
  ema(60)
  ema(500)
  distance("distEmas", "ema60", "ema500")
  window distEmas s1 {
    // 1. clamp: inside the band the distance is noise and reads as 0
    double clean = Math.abs(actual) <= noiseBand ? 0.0 : actual;

    // 2. percent change of the cleaned distance
    double before = (Double) store.getState("clean", 0.0);
    store.setState("clean", clean);
    double change = before == 0.0 ? 0.0 : (clean - before) / Math.abs(before) * 100.0;

    // 3. conditional average: a zero change leaves it where it was
    double smooth = (Double) store.getState("smooth", 0.0);
    if (change != 0.0) {
      smooth += 2.0 / (smoothN + 1) * (change - smooth);
      store.setState("smooth", smooth);
    }

    if (smooth > enterAbove && !store.is("long")) {
      store.set("long");
      emitBuy(price);
    }
    if (smooth < -enterAbove && store.is("long")) {
      store.unset("long");
      emitSell(price);
    }
  }
```

**Por qué:** la distancia entre dos EMA es demasiado ruidosa para decidir con ella tal como llega. Alimentar la media solo con cambios reales evita
que los largos tramos en los que nada se mueve la diluyan con ceros.

---

## Análisis de la distancia entre EMA

Usa la **distancia entre EMA** como señal principal en lugar de los valores en bruto de las EMA. Una distancia es una derivada: mide el
impulso de la tendencia, no la tendencia en sí.

```qtscript
strategy "EMA distance entry"

param entryDist = 0.35 "Medium-term distance needed to enter (percent)"
param minStreak = 300  "Consecutive gains of the macro EMA needed"

setup:
  ema(60)
  ema(500)
  ema(2500)
  ema(7500)
  distance("shortDist", "ema60", "ema500")     // short-term momentum
  distance("longDist", "ema500", "ema2500")    // medium-term trend
  gain("macroGain", "ema7500")                 // macro uptrend
  window shortDist s1 {
    if (store.is("long")) {
      if (actual < 0) {                              // the short-term momentum has turned
        store.unset("long");
        emitSell(price);
      }
      return;
    }
    if (value("longDist") < entryDist) return;       // the trend is there
    if (actual <= prev) return;                      // and the momentum is rising
    long macroStreak = ((GainRTIndicator) indicators.getExisting("macroGain")).getPeriodCount();
    if (macroStreak < minStreak) return;             // and so is the macro picture
    store.set("long");
    emitBuy(price);
  }
```

**Puerta de entrada:** `longDist >= entryDist` y `shortDist` subiendo y la racha macro `>= minStreak`. El valor de un `gain` es el
tamaño de su última subida, no un recuento: la racha de subidas consecutivas es el propio contador del indicador, `getPeriodCount()`, que un
cuerpo lee a través de `indicators` con la conversión que usan las estrategias en Java. Una condición de impulso, una condición de
tendencia y una protección contra falsos positivos es la regla práctica de una puerta: un solo indicador rara vez merece una operación por sí
solo.

Las EMA largas necesitan mucho recorrido para asentarse (la de 7500 ticks son dos horas de datos de un segundo): deja que un backtest empiece bastante antes
del rango que te interesa.

---

## Variantes de salida con trailing

Las tres comparten aquí la misma entrada, un cruce de EMA, para que solo cambie la salida.

### Trailing de punto medio

Vende cuando la ganancia retrocede hasta el punto medio entre el umbral mínimo y la ganancia máxima. Se calibra solo al tamaño
del movimiento.

```qtscript
strategy "Midpoint trailing exit"

param trailFrom = 0.5 "Gain below which the trail does not apply (percent)"

setup:
  ema(20)
  ema(50)
  window price s1 {
    if (!store.is("long")) {
      if (value("ema20") > value("ema50")) {
        store.set("long");
        store.setState("buyPrice", price);
        store.setState("peakGain", 0.0);
        emitBuy(price);
      }
      return;
    }
    double buyPrice = (Double) store.getState("buyPrice", price);
    double pcnGain = (price - buyPrice) / buyPrice * 100.0;
    double peak = Math.max((Double) store.getState("peakGain", 0.0), pcnGain);
    store.setState("peakGain", peak);
    double trigger = peak - (peak - trailFrom) / 2.0;
    if (pcnGain > trailFrom && pcnGain <= trigger) {
      store.unset("long");
      emitSell(price);
    }
  }
```

### Trailing de pico

Más simple, y bueno para scalps más rápidos: vende cuando el precio cae un porcentaje fijo desde el precio más alto desde la entrada.

```qtscript
strategy "Peak trailing exit"

param trailPct = 1.0 "Fall from the peak that closes the position (percent)"

setup:
  ema(20)
  ema(50)
  window price s1 {
    if (!store.is("long")) {
      if (value("ema20") > value("ema50")) {
        store.set("long");
        store.setState("peakPrice", price);
        emitBuy(price);
      }
      return;
    }
    double peak = Math.max((Double) store.getState("peakPrice", price), price);
    store.setState("peakPrice", peak);
    if ((peak - price) / peak * 100.0 >= trailPct) {
      store.unset("long");
      emitSell(price);
    }
  }
```

### Reinicio por ganancia de la EMA

Vende cuando la EMA de salida deja de subir: el impulso se ha agotado. El contador de racha lee 0 en las primeras ventanas tras la entrada, así que se
da a la posición unas cuantas ventanas antes de que se aplique la salida.

```qtscript
strategy "EMA gain exit"

param holdWindows = 3 "Windows the position is held before the exit applies"

setup:
  ema(20)
  ema(50)
  gain("exitGain", "ema50")
  window price s1 {
    if (!store.is("long")) {
      if (value("ema20") > value("ema50")) {
        store.set("long");
        store.reset("held");
        emitBuy(price);
      }
      return;
    }
    long streak = ((GainRTIndicator) indicators.getExisting("exitGain")).getPeriodCount();
    if (store.inc("held") > holdWindows && streak == 0) {
      store.unset("long");
      emitSell(price);
    }
  }
```

---

## Stop-loss condicional

Un stop-loss que tiene en cuenta el contexto macro y evita saltar durante una caída sana: solo se dispara cuando la posición está perdiendo **y** la
tendencia macro también se está debilitando.

```qtscript
strategy "Conditional stop-loss"

param enterDist = 0.2  "Medium-term distance that opens a position (percent)"
param maxLoss   = 0.5  "Loss that arms the stop (percent)"
param weakDist  = 0.01 "Macro distance under which the trend counts as weakening (percent)"

setup:
  ema(500)
  ema(2500)
  distance("longDist", "ema500", "ema2500")
  window price s1 {
    if (!store.is("long")) {
      if (value("longDist") >= enterDist) {
        store.set("long");
        store.setState("buyPrice", price);
        emitBuy(price);
      }
      return;
    }
    double buyPrice = (Double) store.getState("buyPrice", price);
    double pcnGain = (price - buyPrice) / buyPrice * 100.0;
    if (pcnGain < 0 && Math.abs(pcnGain) >= maxLoss && value("longDist") < weakDist) {
      store.unset("long");
      emitSell(price);
    }
  }
```

**Por qué:** un stop simple vende cada caída de una tendencia que sigue sana. Exigir que el contexto macro también sea débil reduce los
falsos stops en mercados volátiles pero con tendencia. El coste es que se deja correr una pérdida con una tendencia macro fuerte: combínalo
con una salida que no dependa del macro (un trailing, arriba) si eso importa.

---

## Protección de reentrada (el estado «fail»)

Bloquea nuevas entradas tras una operación perdedora hasta que el contexto macro se haya reiniciado por completo. La ventana de entrada y la comprobación de reinicio son dos
ventanas del mismo instrumento, y hablan a través del `store`:

```qtscript
strategy "Re-entry protection"

param stopPct = 1.0 "Loss that closes the position and arms the block (percent)"

setup:
  ema(200)
  ema(1000)
  window price s1 {
    if (!store.is("long")) {
      if (store.is("fail")) return;                 // blocked until the macro context resets
      if (value("ema200") > value("ema1000")) {
        store.set("long");
        store.setState("buyPrice", price);
        emitBuy(price);
      }
      return;
    }
    double buyPrice = (Double) store.getState("buyPrice", price);
    if ((price - buyPrice) / buyPrice * 100.0 <= -stopPct) {
      store.unset("long");
      store.set("fail");
      emitSell(price);
    }
  }
  window ema200 m1 {
    // the reset: the short EMA has fallen under the long one, a whole cycle has passed
    if (store.is("fail") && actual < value("ema1000")) store.unset("fail");
  }
```

**Por qué:** evita el «revenge trading» tras un stop. Exigir `ema200 < ema1000` antes de que se levante el bloqueo hace que se complete un ciclo
macro entero antes de que la estrategia pueda volver a entrar, en lugar de reentrar en el mismo mercado en caída un minuto después.

---

## Estado compartido entre ventanas

Todas las ventanas de un instrumento comparten un `store`: una ventana de entrada puede poner una marca y una ventana de salida con otro periodo la lee
de inmediato, sin nada que conectar. Aquí las dos ventanas son secciones con nombre, cada una con su propio periodo:

```qtscript
strategy "Entry and exit windows"

param exitDrop = 0.3 "Fall from the entry price that closes the position (percent)"

setup:
  ema(10)
  window ema10 Entry
  window price Exit

window Entry s1 {
  if (actual > prev && !store.is("inPosition")) {
    store.set("inPosition");
    store.setState("entry", price);
    emitBuy(price);
  }
}

window Exit s5 {
  if (!store.is("inPosition")) return;
  double entry = (Double) store.getState("entry", price);
  if ((entry - price) / entry * 100.0 >= exitDrop) {
    store.unset("inPosition");
    emitSell(price);
  }
}
```

**Por qué:** la decisión de entrada y la de salida rara vez quieren el mismo reloj. El store es lo único que comparten, y es
el del propio instrumento, así que dos instrumentos que ejecutan esta estrategia nunca ven la marca del otro. El estado que pertenece a la estrategia
entera es `$globalStore` (consulta [El almacén global](/docs/strategies/qtscript#el-almacén-global-globalstore)).

---

## Puerta de volatilidad

Evita entradas en periodos de poca actividad, y durante el calentamiento del propio indicador de volatilidad, cuando sus valores aún
no significan nada:

```qtscript
strategy "Volatility gate"

param volWindow = 30    "Ticks the volatility is measured over"
param minVol    = 0.01  "Volatility (percent) below which the market is too quiet"
param warmup    = 120   "Windows skipped while the indicator settles"

setup:
  ema(20)
  ema(100)
  percentVolatility(volWindow)
  isLessThan("quiet", "pvol" + volWindow, minVol)
  window ema20 s1 {
    if (store.inc("windows") < warmup) return;   // warm-up: nothing is decided yet
    if (isValue("quiet")) return;                // the market is not active enough
    if (actual > value("ema100") && !store.is("long")) {
      store.set("long");
      emitBuy(price);
    }
    if (actual < value("ema100") && store.is("long")) {
      store.unset("long");
      emitSell(price);
    }
  }
```

**Por qué:** un cruce en un mercado que apenas se mueve es sobre todo spread y redondeo. Leer la puerta como una condición
(`isValue`, consulta [Una condición: `isValue`](/docs/strategies/qtscript#una-condición-isvalue)) la deja en una sola línea en la ventana de entrada, y el contador de ventanas hace el
trabajo del `clampUpdates(n)` de Java: se ignoran las primeras `warmup` ventanas.

---

## Lo que se queda en Java

Dos patrones del catálogo de Java no tienen versión QTScript, porque QTScript no tiene `update()` y el cuerpo de una ventana trabaja con un solo
instrumento:

- **Estrategias entre instrumentos (de todo el mercado)**: leer los indicadores de otro instrumento necesita la clase completa y `update(Ticker)`.
  Un backtest solo ve el instrumento para el que se preparó, así que una estrategia así es una estrategia en vivo. Lo que tiene QTScript es
  `$globalStore`, el estado compartido por toda la estrategia, que basta para un recuento o una marca entre instrumentos pero no para leer
  sus indicadores.
- **Actividad de instrumentos por OPS** (operaciones por segundo y por instrumento): cuenta cada tick, y una ventana solo se dispara cuando se cierra su
  periodo.

Los dos están en los [patrones de estrategias en Java](/docs/strategies/java/patterns).
