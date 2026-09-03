---
title: Trading algorítmico
description: Aprende qué es el trading algorítmico, cómo se relaciona con las estrategias cuantitativas, qué necesita un sistema de trading más allá de la señal y por qué existe la brecha entre backtest y ejecución real.
order: 15
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

El **trading algorítmico** es la ejecución de decisiones de trading por un programa en lugar de por una
persona que coloca órdenes. El programa puede decidir *qué* operar, *cuándo* y *cómo*, o solo lo
último de los tres; el término abarca desde un script que trocea una orden grande hasta un sistema que
ejecuta una estrategia de principio a fin sin intervención.

A menudo se usa como sinónimo de *trading cuantitativo*, y el solapamiento es grande, pero el énfasis
es distinto. Una [estrategia cuantitativa](quantitative-strategy) trata de la regla de decisión y de
su evidencia. El trading algorítmico trata de convertir decisiones en órdenes de forma fiable, al
precio adecuado, bajo condiciones que el backtest nunca vio.

## El espectro

- Los **algoritmos de ejecución** toman una decisión tomada en otro sitio y trabajan la orden: troceado
  ponderado por tiempo o por volumen, objetivos de participación, órdenes iceberg. Su objetivo es
  minimizar el [slippage](slippage) y el impacto, no predecir la dirección.
- Las **estrategias sistemáticas** generan ellas mismas las decisiones a partir de una regla y las
  ejecutan con una lógica de órdenes sencilla. La mayor parte del trading algorítmico de particulares y
  prosumidores vive aquí.
- El **trading de alta frecuencia** compite en latencia, manteniendo posiciones durante segundos o
  menos. Es una disciplina de ingeniería distinta con una infraestructura distinta, y la mayor parte de
  su ventaja es inaccesible sin colocación en el centro de datos y acceso directo al mercado.

Las familias se distinguen por el periodo de tenencia y por aquello de lo que depende la ventaja, lo
que a su vez decide en qué tiene que ser bueno el sistema.

## Qué contiene un sistema de trading

La señal es un componente de un sistema que tiene al menos seis:

1. **Ingesta de datos de mercado.** Un flujo en vivo, normalmente por WebSocket, normalizado a la
   misma representación con la que se hizo el backtest de la estrategia. Las reconexiones, los huecos y
   los eventos desordenados son el caso normal, no la excepción.
2. **Evaluación de la estrategia.** La regla, calculando indicadores y estado en cada actualización y
   emitiendo señales.
3. **Gestión de órdenes.** Convertir una señal en una orden con tipo, tamaño e indicadores; seguir los
   acuses de recibo, las ejecuciones, las ejecuciones parciales y los rechazos; reintentar o cancelar.
4. **Seguimiento de posiciones y saldos.** Saber qué se tiene, a qué coste y qué hay disponible,
   conciliado contra el exchange y no supuesto a partir del registro de órdenes.
5. **Controles de riesgo.** Stops de protección, límites de exposición, pérdida máxima por día y un
   interruptor de emergencia que detiene la operativa cuando se violan las propias hipótesis del
   sistema.
6. **Seguimiento.** Registrar cada decisión y cada ejecución para poder comparar el comportamiento en
   vivo con el backtest, y alertar cuando los dos divergen.

Un sistema que tiene los dos primeros e improvisa el resto funcionará hasta la primera desconexión,
ejecución parcial o caída del exchange, es decir, no durante mucho tiempo.

## La brecha entre backtest y operativa real

Un backtest asume que cada señal se convirtió en una ejecución al precio observado. La operativa real
rompe esa hipótesis en varios sitios a la vez:

- **Ejecuciones.** Las órdenes a mercado pagan el spread y el impacto; las órdenes limitadas pueden no
  ejecutarse. Consulta [Slippage](slippage).
- **Latencia.** El precio al que reaccionó la estrategia está desfasado cuando la orden llega.
- **Ejecuciones parciales y rechazos.** Una posición puede ser la mitad del tamaño previsto, o
  ninguno, mientras la estrategia cree que está completa.
- **Diferencias de datos.** El flujo en vivo y el registro histórico los producen caminos distintos y
  pueden diferir en tiempos, muestreo y huecos.
- **Caídas.** El exchange, la conexión o el propio sistema se caen con una posición abierta.
- **Cambio de régimen.** El mercado con el que se ajustó la estrategia no es el mercado en el que
  opera.

Ninguna de estas cosas es una razón para no hacer backtests. Son razones para modelar los costes con
pesimismo, validar fuera de muestra, operar en papel antes de comprometer capital y vigilar los
resultados en vivo contra las expectativas del backtest desde la primera orden.

## Tipos de orden y lógica de protección

Los tipos de orden que usa un sistema moldean su riesgo:

- Las órdenes **a mercado** se ejecutan de inmediato al precio disponible; certeza de ejecución,
  incertidumbre de precio.
- Las órdenes **limitadas** se ejecutan solo al precio indicado o mejor; certeza de precio,
  incertidumbre de ejecución. Indicadores como válida hasta cancelación, inmediata o cancelar y
  ejecutar o anular deciden qué ocurre con la parte no ejecutada.
- Las órdenes **stop** se convierten en órdenes a mercado o limitadas cuando se alcanza un precio de
  disparo; son la forma habitual de una salida de protección.
- Los **stops dinámicos** siguen el extremo favorable del precio a una distancia fija y se disparan en
  un retroceso, asegurando parte de un movimiento sin un objetivo fijo.

Una salida de protección expresada en la entrada, «compra aquí, y sal si el precio cae un cinco por
ciento», es más segura que una orden stop separada que la estrategia tiene que acordarse de colocar y
cancelar.

## Errores habituales

- **Desplegar un backtest.** Un código que ha pasado una simulación histórica todavía no es un sistema
  de trading. Le faltan conciliación, gestión de errores y un interruptor de emergencia.
- **Asumir que el registro de órdenes es la posición.** Las posiciones son lo que dice el exchange.
- **Sin pérdida máxima.** Una estrategia equivocada sobre el mercado puede perder despacio; un sistema
  equivocado sobre su propio estado puede perderlo todo deprisa. Los límites diarios y por posición no
  son opcionales.
- **Confiar en que el flujo en vivo coincide con el histórico.** Compara los dos antes de fiarte de que
  una señal calculada sobre uno reproduzca un backtest calculado sobre el otro.
- **Cambiar la estrategia en producción sin volver a probarla.** Cada edición es una nueva
  [revisión](strategy-revision) que no ha pasado por un backtest.

## El trading algorítmico en QTSurfer

La superficie documentada de QTSurfer hoy es la mitad de investigación del ciclo: estrategias,
backtests y exploración de parámetros. El motor subyacente está construido para que el mismo código de
estrategia se ejecute sin cambios contra datos históricos y contra un flujo en vivo: los indicadores se
actualizan de forma incremental por evento, y una estrategia expresa sus decisiones como señales y no
como órdenes.

Esas señales ya llevan la intención de ejecución que una canalización en vivo necesita. Una señal de
compra o de venta es por defecto una orden a mercado al precio de referencia de la estrategia; puede
convertirse en una orden limitada, recibir un número máximo de intentos e indicadores de orden, y armar
un stop de protección, fijo o dinámico, que el motor gestiona una vez ejecutada la entrada. Las señales
informativas registran valores de indicadores y marcadores de gráfico junto a las operaciones, de modo
que una decisión pueda explicarse a posteriori a partir del mismo registro en backtest y en vivo.

El motor proporciona además canalizaciones de ejecución para las estructuras de posición habituales:
largo y corto de entrada única, y entrada escalonada en una posición a lo largo de varias compras. Los
datos de mercado entran a través de una capa de streaming normalizada que se publica como código
abierto bajo la organización QTSurfer, de modo que la representación con la que se hace el backtest de
una estrategia es la misma con la que operaría.

## Conceptos relacionados

- [Estrategia cuantitativa](quantitative-strategy) — el lado de la decisión, y el ciclo de
  investigación.
- [Slippage](slippage) — el coste que separa las ejecuciones simuladas de las reales.
- [Backtesting](backtesting) — qué puede y qué no puede afirmar una simulación histórica.
- [Revisión de estrategia](strategy-revision) — por qué los cambios en producción necesitan volver a
  probarse.
- Guía para desarrolladores: [Emisión de señales y opciones de orden](/docs/developers/api/strategy_coding).
