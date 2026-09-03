---
title: Revisión de estrategia
description: Aprende por qué una estrategia de trading debe versionarse como revisiones inmutables, qué debe conservar una revisión para que un resultado sea reproducible y cómo QTSurfer vincula cada backtest al código exacto que lo produjo.
order: 12
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T20:33:24Z'
---

Una **revisión de estrategia** es una instantánea inmutable del código de una estrategia en un punto
de su desarrollo. La investigación sobre estrategias de trading produce muchas variantes de la misma
idea, y un resultado solo es evidencia si puede rastrearse hasta la variante exacta que lo produjo.
Las revisiones son la unidad que hace posible esa trazabilidad.

La alternativa, una única estrategia editable cuyos estados pasados se pierden, convierte cada
resultado almacenado en un número sin referente. «La estrategia de RSI dio un Sharpe de 1,4» no
significa nada si la estrategia de RSI se ha editado nueve veces desde entonces.

## Qué tiene que conservar una revisión

Un resultado es reproducible cuando pueden recuperarse juntos estos elementos:

- **El código**, byte a byte, incluidos sus valores de parámetros por defecto.
- **Los datos**: instrumento, rango de fechas, cadencia y la identidad del dataset si se subió en
  lugar de estar gestionado.
- **La configuración**: capital inicial, asignación por operación, comisiones y cualquier hipótesis
  de riesgo.
- **Los valores de los parámetros** realmente usados, cuando la ejecución sobrescribió los valores por
  defecto.
- **La versión del motor** que lo ejecutó, ya que las métricas y las ejecuciones pueden cambiar entre
  versiones.

Una revisión posee el primer elemento. Los demás son propiedades de la ejecución, y un sistema bien
diseñado los adjunta al resultado y no a la estrategia, de modo que la misma revisión puede probarse
bajo muchas configuraciones sin ambigüedad.

## Por qué importa la inmutabilidad

- **Las comparaciones siguen siendo válidas.** Dos resultados de la misma revisión difieren solo en lo
  que cambió la ejecución. Dos resultados de «la misma estrategia» editada entre medias difieren en
  formas desconocidas.
- **Los fracasos quedan como evidencia.** Una revisión que puntuó mal forma parte del registro de
  investigación. Le dice al siguiente lector qué idea se probó y se rechazó, y es uno de los ensayos
  descartados que las correcciones por pruebas múltiples de [Sobreajuste](overfitting) necesitan
  contar.
- **Compartir es honesto.** Publicar una revisión concreta significa que el lector evalúa exactamente
  lo que el autor probó, no lo que contenga el fichero la semana que viene.
- **Los errores se pueden localizar.** Cuando un comportamiento en vivo difiere de un backtest, la
  revisión fija uno de los lados de la comparación.

## Trabajar con revisiones

- **Una hipótesis por revisión.** Cambia el filtro de entrada, o la salida, o el tamaño, y registra qué
  pretendía mejorar el cambio. Una revisión que cambia tres cosas a la vez no puede atribuir su
  resultado a ninguna de ellas.
- **Escribe la intención en el momento de crearla.** Una descripción que dice «añade una puerta de
  volatilidad para reducir las señales falsas en rango» es la diferencia entre un diario de
  investigación y un montón de ficheros.
- **Deja que los resultados se acumulen sobre la revisión.** Backtests, barridos y ejecuciones
  walk-forward contra la misma revisión construyen una imagen de ella. Pasar a una nueva revisión tras
  cada ejecución pierde eso.
- **Conserva las perdedoras.** Borrar las revisiones que no funcionaron es como el sesgo de
  supervivencia entra en un proceso de investigación personal.

## Errores habituales

- **Sobrescribir en lugar de versionar.** Editar en el sitio destruye el referente de todos los
  resultados pasados.
- **Versionar por nombre de fichero.** `strategy_v2_final_FIXED.java` no es un sistema de revisiones;
  es la ausencia de uno.
- **Tratar los cambios de formato como versiones nuevas.** Un fichero reformateado que calcula lo
  mismo es la misma estrategia. Versionarlo aparte fragmenta los resultados entre código idéntico.
- **Confundir la revisión con la ejecución.** Una revisión no tiene «un ratio de Sharpe». Lo tiene
  una ejecución de una revisión sobre un conjunto de datos bajo una configuración.

## Las revisiones en QTSurfer

En QTSurfer una estrategia es código Java, y **cada guardado crea una nueva revisión**. Las
revisiones nunca se sobrescriben, y cada backtest, barrido y listado del marketplace apunta a
exactamente una revisión, de modo que un resultado siempre nombra el código exacto que lo produjo. El
título de la estrategia identifica la idea a través de las revisiones; la revisión identifica el
código.

Una revisión se guarda solo cuando el código **valida y compila**. La compilación responde si el
código fuente es Java válido y devuelve las propiedades declaradas de la estrategia, las claves de
parámetros que un barrido o una ejecución pueden fijar, con sus valores por defecto y los rangos
sugeridos. La validación va un paso más allá: la clase compilada se instancia y se hace pasar por una
serie sintética acotada, de modo que un fallo de cableado aparece antes del primer backtest real. El
veredicto se registra contra esa compilación y lo sustituye la siguiente.

La identidad se deriva de lo que el código *significa*, no de cómo está escrito. Un comentario, una
línea en blanco, un cambio de sangrado o un reordenamiento de imports producen la misma identidad;
renombrar una variable o reordenar sentencias produce una distinta. Reenviar una estrategia
reformateada devuelve, por tanto, la identidad que ya tenía, junto con cualquier validación ya
registrada contra ella. La identidad no dice nada sobre el comportamiento: dos fuentes que calculan lo
mismo por medios distintos son dos estrategias.

Las ejecuciones adjuntan al resultado los demás elementos de reproducibilidad: el conjunto de datos
preparado lleva instrumento, rango, cadencia y cobertura; la ejecución lleva capital, comisiones y
valores de parámetros; los barridos llevan su cuadrícula, muestreador, objetivo y semilla. Una
estrategia obtenida del marketplace es una copia de referencia de solo lectura, ligada a la revisión
publicada, salvo que el listado exponga el código.

## Conceptos relacionados

- [Backtesting](backtesting) — qué mide una ejecución de una revisión.
- [Sobreajuste](overfitting) — por qué las revisiones descartadas también son evidencia.
- [Sesgo de supervivencia](survivorship-bias) — qué le hace a un registro de investigación borrar las
  perdedoras.
- Guía para desarrolladores: [Compilar y validar una estrategia](/docs/developers/api/strategy).
- Guías del producto: [Estrategias](/docs/app/strategies), [Marketplace](/docs/app/marketplace).
