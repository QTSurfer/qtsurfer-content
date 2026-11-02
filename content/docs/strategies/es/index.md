---
id: strategies
title: Estrategias
description: Escribe una estrategia de QTSurfer en Java, el lenguaje del motor, o en QTScript, un lenguaje compacto que se convierte en una clase Java, y mira cómo se relacionan.
order: 0
lastUpdated: '2026-11-02T14:41:16Z'
---

Una estrategia es la parte de QTSurfer que decide cuándo comprar o vender: observa indicadores sobre un flujo de
mercado y emite señales. Puedes escribirla en dos lenguajes, y desde que la envías la plataforma los trata igual.

## Java, el lenguaje del motor

Una estrategia en Java es una clase Java normal que extiende una de las clases base de estrategia del motor. Es la vía
consolidada y tiene toda la API del motor: indicadores configurados en el builder, listeners de ventana, estado, señales
con sus parámetros de orden y, cuando una estrategia los necesita, `update()` en cada tick, lógica entre instrumentos,
clases de indicador propias y tipos auxiliares.

- [Estrategias en Java](/docs/strategies/java): el modelo, las clases base, la configuración, el estado, las señales y las propiedades.
- [Indicadores en Java](/docs/strategies/java/indicators): el catálogo de indicadores gratuitos y pro, y cómo escribir el tuyo.
- [Patrones de estrategia](/docs/strategies/java/patterns) y [ejemplos de estrategias](/docs/strategies/java/examples).
- [Programar estrategias en Java](/docs/strategies/java/strategy_coding): la guía de la API para escribir Java.

## QTScript, el más nuevo

QTScript es un lenguaje compacto para las mismas estrategias, en beta. Conservas la parte que es tuya, los indicadores,
las ventanas y las señales, y dejas fuera la ceremonia de una clase Java: paquete, imports, clase, clase base,
anotaciones de propiedades y código repetitivo de listeners. Cada cuerpo `{ }` es Java tal cual, así que todo lo que
ofrece la API de Java dentro de un cuerpo funciona sin cambios. Irá ganando sintaxis.

```
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

- [QTScript](/docs/strategies/qtscript): el lenguaje, las partes de un fichero, las ventanas y los parámetros.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators): todos los indicadores que puede llamar una estrategia QTScript.

## Cómo se relacionan

QTScript no es un segundo motor. Un fichero QTScript se convierte en exactamente una clase Java y pasa por la misma
compilación en el servidor que una estrategia en Java, así que todo lo que es cierto de una estrategia Java una vez
compilada lo es de una QTScript.

- **Los mismos indicadores.** Las líneas bajo `setup:` son llamadas al builder de indicadores que una estrategia Java
  configura en `setupIndicators`. Los indicadores pro están en los dos lenguajes, y en los dos necesitan un plan que los
  incluya.
- **Las mismas fuentes de datos.** Una estrategia lee tickers, velas o tasas de financiación, en cualquiera de los dos.
- **La misma entrada.** Envías el código fuente tal cual a [`POST /strategy`](/docs/developers/api/strategy), como
  `text/plain`, para los dos. No hay un endpoint aparte: la plataforma los distingue por el texto, porque un código
  QTScript empieza por `strategy`.
- **Las mismas ejecuciones.** Una vez registrada, una estrategia se valida, se prueba en backtest, se barre y se ejecuta
  en vivo sea cual sea el lenguaje en que se escribió.

## Lo que QTScript deja para Java

Por diseño, y cada punto es un motivo para escribir la estrategia en Java:

- **Sin `update()`**: las ventanas son el modelo, así que una estrategia que tiene que ver cada tick va en Java.
- **Sin lógica entre instrumentos.**
- **Sin clases de indicador propias**, ni campos o métodos extra más allá de lo que declaran las secciones, ni
  estrategias con varias fuentes.
- **Una sola clase**: lo que quiera tipos auxiliares es una estrategia Java.

Cambiar nunca es un callejón sin salida: un fichero `.qtscript` es una clase Java con la ceremonia quitada.

## Por dónde empezar

| Tu estrategia                                                                  | Escríbela en                                                   |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Unos pocos indicadores y las reglas de sus ventanas                            | QTScript                                                       |
| Necesita cada tick, otros instrumentos, un indicador propio o tipos auxiliares | Java                                                           |
| Empezó en QTScript y se te quedó pequeña                                       | Java: el fichero ya es una clase Java con la ceremonia quitada |
