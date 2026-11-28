---
title: Ejemplos de QTScript
description: Usa estrategias QTScript completas, una por cada fuente de datos.
order: 10
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: 0c9fa0a8cb6b01c195c39246bcfe1b6cab74335f
upstreamPath: skills/qtsurfer-qtscript-strategy/references/examples.md
---

Ficheros `.qtscript` completos: cada uno es la estrategia entera, sin omitir nada. QTScript está en beta;
consulta [la guía de QTScript](/docs/strategies/qtscript) para el lenguaje y la
[guía de estrategias en Java](/docs/strategies/java/strategy_coding) para la API contra la que se escriben los cuerpos entre llaves.

## 1. RSI de reversión (ticker)

La estrategia útil más pequeña: un indicador, una ventana, dos señales.

```qtscript
strategy "RSI reversion"

param rsiLow  = 30  "Oversold"
param rsiHigh = 70  "Overbought"

instruments */usdt

setup:
  rsi(14) window m1 {
    if (actual < rsiLow)  emitBuy(price);
    if (actual > rsiHigh) emitSell(price);
  }
```

## 2. Cruce de EMA con una marca de posición (ticker)

Dos indicadores leídos por nombre, y el store compartido por instrumento usado para emitir en el cruce una sola
vez.

```qtscript
strategy "EMA cross"

param fast = 9  "Fast EMA"
param slow = 21 "Slow EMA"

instruments */usdt

setup:
  ema(fast)
  ema(slow)
  window price s5 {
    double f = value("ema" + fast);
    double s = value("ema" + slow);
    if (f > s && !store.is("long")) {
      store.set("long");
      emitBuy(price);
    }
    if (f < s && store.is("long")) {
      store.unset("long");
      emitSell(price);
    }
  }
```

`value("name")` lee cualquier indicador registrado; `store` es el mismo store que comparte cada ventana del
instrumento.

## 3. Secciones con nombre y un contador compartido (ticker)

Dos ventanas sobre indicadores y periodos distintos, con los cuerpos escritos en la columna 0 en lugar de en línea.

```qtscript
strategy "Two windows"

param rsiLow = 30

setup:
  rsi(14) window Oversold
  ema(20)
  window ema20 Trend

window Oversold m1 {
  if (actual < rsiLow && store.inc("oversoldBars") >= 3) {
    emitBuy(price);
  }
}

Trend m5 {
  store.setState("trendUp", actual > prev);
}
```

Los dos cuerpos escriben en un mismo store, así que `Trend` puede dejar un valor que `Oversold` lee en su siguiente cierre.

## 4. Cruzar un nivel con `prev` (ticker)

Una ventana te da como `prev` el valor que tenía el indicador cuando se cerró la ventana anterior, así que un cruce no
necesita nada en el store. Esta entra cuando el RSI vuelve a subir por encima de un nivel, una sola vez, en la ventana en la que
ocurre.

```qtscript
strategy "RSI re-entry"

param level = 30 "Level to climb back through"

setup:
  rsi(14) window m1 {
    if (prev < level && actual >= level) emitBuy(price);
  }
```

La primera vez que se dispara una ventana no hay ventana anterior: `prev` es el valor que tenía el indicador cuando esa
primera ventana se abrió, y un indicador con periodo de calentamiento aún no se ha asentado. Deja pasar los primeros disparos
cuando la regla necesite dos cierres reales.

## 5. Rango real desde el cierre anterior (kline)

En `kline`, una ventana sobre `close` da el cierre de la barra anterior como `prev`, que es lo que necesita el rango real
junto al `high` y el `low` de la propia barra.

```qtscript
strategy "True range" kline

setup:
  window close m1 {
    double trueRange = Math.max(high - low, Math.max(Math.abs(high - prev), Math.abs(low - prev)));
    emitInfo("trueRange", trueRange);
  }
```

## 6. Ruptura del rango de la vela (kline)

En `kline` los campos de la barra están en el ámbito como variables sueltas. El ancho de la barra no está en el fichero: es
la `cadence` con la que preparas los datos (`1m`, `1h`, `1d`, …), así que la misma estrategia corre con cualquiera
de ellas.

```qtscript
strategy "Range breakout" kline

param minRange = 0.5 "Minimum range, percent"

setup:
  window close m1 {
    double range = (high - low) / low * 100.0;
    if (range < minRange) return;
    if (close > open) emitBuy(close);
    else              emitSell(close);
  }
```

## 7. Vigilancia de la tasa de funding (funding)

Una estrategia que calcula en lugar de operar: `emitInfo` adjunta campos a una señal informativa.
En funding no hay precio: el valor es `rate`. La plataforma acepta este fichero y puede preparar los
datos de funding, pero por ahora se rechaza un backtest o un barrido sobre datos de funding.

```qtscript
strategy "Funding watch" funding

instruments ~"^[A-Z]+/USDT:USDT$"

Main m5 {
  emitInfo("funding", rate, "instrument", instrument.symbol());
}
```

La expresión regular limita esto a perpetuos cotizados y liquidados en USDT, que es lo que ve una estrategia
de funding.

## 8. Un inicializador y el filtro nativo de instrumentos

`init` para los setters del motor, y la forma entre llaves de `instruments` cuando un patrón no basta.

```qtscript
strategy "Configured"

param gain = 0.5 "Minimum percent gain"

init {
  setPercentGain(gain);
  setMultiEntryEnabled(true);
}

instruments {
  if (instrument.quote().equalsIgnoreCase("usdt")) {
    return !instrument.base().equals("USDC");
  }
  return false;
}

setup:
  ema(12) window m1 {
    if (actual > prev) emitBuy(price);
  }
```

> `init` no puede asignar un `param`: `setPercentGain(gain)` _lee_ uno, y eso está bien. Asignar
> `gain` ahí se sobrescribiría con el valor por defecto declarado; el compilador avisa.

## 9. Indicadores pro: bandas y una nube (kline)

`uses pro.*` trae los setenta y seis indicadores pro. Treinta y seis de ellos leen barras completas y por eso van en una estrategia `kline`
(la última columna de la tabla de [la guía de QTScript](/docs/strategies/qtscript#los-indicadores-pro-uses) dice cuáles). Esta usa bandas y una nube: una ventana sobre `superTrend` o `ichimoku` se engancha a la línea
principal, y el cuerpo lee las demás con `value($indicator + "…")`. Ejecutarla necesita el plan Pro o Elite; con otro
plan la respuesta es un `402`.

```qtscript
strategy "Cloud and bands" kline
uses pro.*

setup:
  superTrend(10, 3) window m5 {
    if (close > value($indicator + "Upper")) emitSell(close);
    if (close < value($indicator + "Lower")) emitBuy(close);
  }
  ichimoku() window m5 {
    if (close > value($indicator + "SenkouA") && close > value($indicator + "SenkouB")) emitBuy(close);
  }
  vwap()
  yangZhang(20)
```

## 10. Precio de entrada, stop loss y take profit (kline)

Un número que se guarda entre ventanas es un valor en el store: se escribe con `setState` y se lee con una conversión y un
valor por defecto (consulta [Dentro de un cuerpo](/docs/strategies/qtscript#dentro-de-un-cuerpo)). Aquí el precio de entrada es la
posición: `0.0` significa sin posición.

```qtscript
strategy "RSI with stop and target" kline

param rsiLow  = 30  "Oversold level"
param stopPct = 2.0 "Stop loss, percent under the entry"
param takePct = 4.0 "Take profit, percent over the entry"

setup:
  rsi(14) window m1 {
    double entry = (Double) store.getState("entry", 0.0);
    if (entry == 0.0) {
      if (actual < rsiLow) {
        store.setState("entry", close);
        emitBuy(close);
      }
    } else if (close <= entry * (1 - stopPct / 100) || close >= entry * (1 + takePct / 100)) {
      store.setState("entry", 0.0);
      emitSell(close);
    }
  }
```

## 11. Máximo de las últimas N barras (kline)

`max` y `min` son extremos acumulados, no el extremo de las últimas N barras, así que las barras se guardan en el store:
un anillo de claves `bars` para los máximos y otro para los mínimos, y la posición `n` como valor. La barra
que se cierra se compara primero y se escribe después, de modo que se mide contra las N anteriores.

```qtscript
strategy "Breakout of the last N bars" kline

param bars = 20 "Bars to look back"

setup:
  window close m1 {
    int n = (Integer) store.getState("n", 0);
    if (n >= bars) {
      double highest = -Double.MAX_VALUE;
      double lowest = Double.MAX_VALUE;
      for (int i = 0; i < bars; i++) {
        highest = Math.max(highest, (Double) store.getState("h" + i, 0.0));
        lowest = Math.min(lowest, (Double) store.getState("l" + i, 0.0));
      }
      if (close > highest && !store.is("long")) {
        store.set("long");
        emitBuy(close);
      }
      if (close < lowest && store.is("long")) {
        store.unset("long");
        emitSell(close);
      }
    }
    store.setState("h" + (n % bars), high);
    store.setState("l" + (n % bars), low);
    store.setState("n", n + 1);
  }
```

Un `double[]` o una `List` serían más cortos, y funcionan en el servidor, pero el Laboratorio no traduce
ninguno de los dos: las claves en el store funcionan en ambos.

## 12. Un enfriamiento contado en barras (kline)

Las barras desde la última señal son un valor, no un contador: el cuerpo tiene que leer la cuenta sin moverla,
y un contador solo se lee por lo que devuelve `inc`. Empezar desde `cooldown` deja pasar la primera señal.

```qtscript
strategy "RSI with a cooldown" kline

param rsiLow   = 30 "Oversold level"
param cooldown = 15 "Bars to wait after a signal"

setup:
  rsi(14) window m1 {
    int since = (Integer) store.getState("since", cooldown) + 1;
    store.setState("since", since);
    if (since > cooldown && actual < rsiLow) {
      emitBuy(close);
      store.setState("since", 0);
    }
  }
```
