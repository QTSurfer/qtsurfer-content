---
title: Datos históricos de mercado
description: Aprende qué datos históricos de mercado consume realmente un backtest, en qué se diferencian los tickers de las velas, por qué la cadencia y la cobertura cambian los resultados y cómo QTSurfer almacena y sirve el histórico de los exchanges.
order: 13
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

Un backtest solo es tan honesto como los datos que reproduce. Los **datos históricos de mercado** son
el registro de lo que un exchange publicó en el pasado: precios, operaciones, cotizaciones y las
barras derivadas de ellos. Qué registro consume una estrategia, con qué resolución y con qué huecos
determina lo que la simulación puede y no puede afirmar.

La mayoría de los errores de backtesting que no son errores de la estrategia son errores de datos: una
barra tratada como operable a su apertura, una hora ausente leída como un mercado plano, una
resolución demasiado gruesa para la lógica de entrada, o una lista de símbolos que solo contiene los
instrumentos que sobrevivieron.

## Tickers y velas

Los exchanges publican varios tipos de histórico, y no son intercambiables.

- Los **eventos de ticker** son el registro más fino que conservan la mayoría de las plataformas: cada
  actualización lleva una marca de tiempo, un último precio y, normalmente, volumen y las mejores
  cotizaciones del libro. Una estrategia reproducida sobre tickers reacciona a cada actualización en el
  orden en que llegó.
- Las **klines**, o velas, agregan un intervalo fijo en apertura, máximo, mínimo, cierre y volumen.
  Son compactas y rápidas, y descartan el orden de los eventos dentro del intervalo. Una vela dice que
  el máximo y el mínimo ocurrieron; no dice cuál fue primero.
- Las **klines nativas del exchange** son las velas que calculó el propio exchange. Las velas
  reconstruidas a partir de tickers pueden diferir ligeramente, porque los flujos de ticker muestrean
  el mercado en lugar de registrar cada operación.

La elección determina lo que la estrategia puede ver. Una condición de entrada que se dispara dentro
de una vela se está evaluando con información que la vela solo revela a su cierre; consulta
[Sesgo de anticipación](look-ahead-bias) para ver por qué importa.

## Cadencia

La **cadencia** es el intervalo con el que avanza la simulación. Una cadencia más gruesa significa
menos eventos, ejecuciones más rápidas y ejecuciones de órdenes menos fieles; una más fina significa lo
contrario. Dos reglas la mantienen honesta:

- Una cadencia más gruesa que la de origen debe ser un múltiplo exacto de ella. Remuestrear datos de
  un segundo a cinco minutos está bien definido; remuestrearlos a siete segundos, no.
- Una cadencia más fina que la de origen no puede fabricarse. Las barras de un minuto no contienen la
  información necesaria para simular una estrategia de un segundo, por mucha interpolación que se
  aplique.

La cadencia es también una variable de investigación. Una estrategia cuyo resultado cambia de forma
sustancial entre cadencias de un minuto y de cinco te está diciendo que su ventaja vive en la
microestructura, o que sus ejecuciones no son realistas en una de las dos.

## Cobertura y huecos

Ningún registro histórico es completo. Los exchanges se caen, los flujos se reconectan y los
instrumentos tranquilos no producen eventos durante largos tramos. La distinción importante es entre un
**hueco** en el registro y una **hora tranquila** en el mercado: el primero son datos ausentes; la
segunda son datos reales que resultan estar vacíos.

Un servicio de datos útil informa de la cobertura de forma explícita en lugar de rellenar los agujeros
en silencio. La cobertura se expresa mejor como una proporción de periodos con datos sobre periodos
esperados, con un motivo asociado a cada periodo vacío, de modo que quien investiga pueda decidir si un
resultado sobre una ventana cubierta al 99,4 % es aceptable para la pregunta que se hace.

Dos problemas de cobertura más sutiles merecen atención:

- **Supervivencia.** Un catálogo que solo lista los instrumentos que cotizan actualmente omite todo lo
  que fue retirado. Una estrategia probada sobre ese catálogo nunca ve los fracasos.
- **Mezcla de segmentos.** Los mercados spot y de futuros del mismo par son instrumentos distintos con
  precios, financiación y liquidez distintos. Las ventanas de cobertura son independientes por
  segmento.

## Errores habituales

- **Operar a la apertura de la vela con información de su cierre.** La forma más común de
  anticipación y la más fácil de introducir por accidente.
- **Leer una hora ausente como un mercado plano.** Una hora vacía suele significar baja actividad, y a
  veces significa una caída del flujo. Las dos necesitan un tratamiento distinto.
- **Ignorar la semántica de las marcas de tiempo.** La hora del evento, la del exchange y la de
  recepción pueden diferir en segundos bajo carga. Los backtests deben usar la hora en la que el
  mercado produjo el evento.
- **Asumir que el histórico de un exchange describe a otro.** El mismo par en dos plataformas tiene
  precios, spreads y horas de actividad distintos.
- **Probar con la cadencia que hace que el resultado quede mejor.** La cadencia debe seguir la
  frecuencia de decisión de la estrategia, elegida antes del barrido, no después.

## Los datos históricos de mercado en QTSurfer

QTSurfer gestiona el histórico de los exchanges y lo expone a través de la misma API que usa un
backtest. El catálogo de exchanges lista cada instrumento con su precio y volumen actuales y, por
separado, las ventanas de cobertura disponibles para tickers y para klines, por segmento `spot` o
`futures`. La cobertura es estado vivo de la plataforma, no una promesa de que cada marca de tiempo
estará disponible para siempre.

Preparar un backtest selecciona un instrumento, un rango de fechas y una cadencia desde un segundo
hasta trimestral; las cadencias más gruesas deben ser múltiplos exactos de la de origen. La sesión
preparada informa de un `coverageRatio` (horas con datos entre horas totales) y lista cada hora vacía
con un motivo: `low_activity`, `pending_conversion` (vuelve a consultar) o `unknown`. Una hora
ausente suele significar baja actividad, no datos perdidos, así que el patrón recomendado es ejecutar
en cuanto la cobertura supere un umbral elegido, en lugar de esperar horas que quizá nunca lleguen.

El histórico se almacena y se sirve de hora en hora UTC. Cada segmento horario puede descargarse como
eventos de ticker en bruto o como klines nativas del exchange, en el formato columnar propio de
QTSurfer, **Lastra**, o convertido bajo demanda a Parquet.

Lastra es de código abierto. Es un formato de fichero columnar para series temporales con códecs por
columna elegidos para datos de mercado: compresión ALP para precios decimales, delta-varint para marcas
de tiempo regulares y ZSTD o gzip para cargas binarias, con un CRC32 por columna para que una columna
corrupta falle de forma ruidosa mientras el resto sigue siendo legible. Los grupos de filas llevan
rangos de marcas de tiempo, de modo que un lector puede saltarse las partes de un fichero fuera de su
ventana de consulta, incluso mediante peticiones HTTP por rangos. Existen lectores y escritores para
Java, Python y TypeScript, una extensión de DuckDB consulta ficheros `.lastra` directamente con SQL, y
un conversor hace viajes de ida y vuelta entre Lastra, Parquet, CSV y Arrow. El formato y las
herramientas se publican bajo la organización QTSurfer en GitHub.

Para datos que QTSurfer no gestiona, puede subirse un **dataset** como CSV: una fila de cabecera, una
columna `timestamp` en ISO-8601 o en segundos, milisegundos o microsegundos de época, una columna
`close` y columnas opcionales de apertura, máximo, mínimo, volumen y cotización. La cadencia y la unidad
de las marcas de tiempo se descubren a partir de los datos en lugar de declararse, la ingesta informa del
rango, la cadencia y el número de huecos descubiertos, y el dataset se prepara y ejecuta después
exactamente igual que un exchange gestionado.

## Conceptos relacionados

- [Backtesting](backtesting) — qué mide la simulación sobre estos datos.
- [Sesgo de anticipación](look-ahead-bias) — la fuga temporal de datos que las velas hacen fácil.
- Guías para desarrolladores: [Datos de mercado](/docs/developers/api/market_data),
  [Datasets](/docs/developers/api/datasets), [Ejecutar un backtest](/docs/developers/api/backtest_execute).
