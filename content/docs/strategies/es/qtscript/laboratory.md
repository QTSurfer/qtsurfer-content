---
title: QTScript en el Laboratorio
description: Qué puede usar un fichero QTScript cuando corre en el navegador, y qué no se aplica allí.
order: 11
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: 0c9fa0a8cb6b01c195c39246bcfe1b6cab74335f
upstreamPath: skills/qtsurfer-qtscript-strategy/references/laboratory.md
---

El Laboratorio de QTSurfer ejecuta un fichero `.qtscript` en el navegador, sobre los datos de mercado que la persona ha cargado, y muestra
sus señales, operaciones y métricas a medida que el fichero cambia. No envía el fichero a la plataforma: traduce
los cuerpos por sí mismo, y esa traducción cubre un subconjunto de Java. Todo lo que dice [la guía de QTScript](/docs/strategies/qtscript) sobre
el lenguaje vale aquí; esta página dice qué es más estrecho y qué no se aplica.

## Qué corre

- **Estrategias `ticker` y `kline`.** Una estrategia `funding` se rechaza al compilar:
  `funding strategies are not supported offline yet: they run on the server`. No escribas una para el
  Laboratorio.
- **Todas las secciones**: `strategy`, `param`, `init`, `instruments`, `uses`, `setup:`, ventanas y secciones con nombre.
  `onCommand` compila, pero en el Laboratorio nada envía un comando.
- **Todos los indicadores** de [el catálogo de indicadores](/docs/strategies/qtscript/indicators), los pro incluidos: en el Laboratorio `uses pro.*`
  corre para todos. El plan solo limita lo que ejecuta la plataforma.

## Dentro de un cuerpo

| Funciona | Rechazado aquí, por ejemplo |
| --- | --- |
| variables locales `double`, `int`, `long`, `boolean` y `String` | arrays, y `for (x : xs)` |
| `if`/`else`, `for` y `while` con un índice, `switch`, `? :` | `List`, `ArrayList`, `Map`, `HashMap`, streams, lambdas |
| `Math.*`, `Double.MAX_VALUE`, `Double.valueOf`, conversiones | `String.format`, `BigDecimal`, `try`/`catch` |
| lo que [la guía](/docs/strategies/qtscript#dentro-de-un-cuerpo) lista en el ámbito: `actual`, `prev`, los campos de la barra, `value(...)`, `emitBuy`, `emitSell`, `emitInfo`, `getPrevInstant()` | `System.currentTimeMillis()` y el resto de `System` salvo `out` |
| los métodos de `store` de [Dentro de un cuerpo](/docs/strategies/qtscript#dentro-de-un-cuerpo) | `store.getCounter`, `store.getAccumulator`, `store.getOrCreateState` |

Lo que el Laboratorio no puede traducir se rechaza al compilar el fichero, en su línea, con
`… is not supported offline yet: it runs on the server`. Guarda los valores pasados en el store como varias claves, como
hace el ejemplo 11 de [los ejemplos](/docs/strategies/qtscript/examples), en lugar de en un array.

No escribas `System` en absoluto. `System.out.println` corre aquí e imprime en la salida del Laboratorio, pero la
plataforma rechaza cualquier fichero que nombre `System` antes de compilarlo:
`Strategy source names a forbidden class/package: System`.

## Corre aquí, falla en la plataforma

El Laboratorio descarta las conversiones a `Double`, `Integer` y las demás cajas, y no desempaqueta, así que es más
permisivo que la plataforma con el store. Las conversiones numéricas, como `(int) d`, las ejecuta como Java. Escribe las lecturas como dice [la guía](/docs/strategies/qtscript#dentro-de-un-cuerpo), porque estas corren aquí y fallan allí:

- una lectura sin valor por defecto usada como número: `double x = (Double) store.getState("x")` antes de que se
  hubiera escrito nada es una `NullPointerException`;
- un valor leído con un tipo distinto del que se escribió: `store.setState("p", 0)` y después
  `(Double) store.getState("p", 0.0)` es una `ClassCastException`;
- un contador leído como valor: `(Integer) store.getState("bars", 0)` después de `store.inc("bars")` es una
  `ClassCastException`.

## Lo que no se aplica aquí

El Laboratorio no tiene una API delante: no se registra, valida ni dimensiona nada a partir del fichero. Donde
la guía habla de enviar una estrategia, `POST /strategy`, validarla, el plan y el `402`,
`percentAmountToLock`, o enviar un comando a una ejecución en vivo, eso es la plataforma, no el Laboratorio. Los
ajustes de una ejecución están en el Laboratorio, no en el fichero, y un error se muestra en el editor, en su línea, en
cuanto el fichero compila.
