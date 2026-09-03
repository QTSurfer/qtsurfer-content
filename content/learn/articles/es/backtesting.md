---
title: Backtesting
description: Aprende qué mide el backtest de una estrategia de trading, qué hipótesis importan y cómo interpretar resultados históricos sin confundirlos con una predicción.
order: 1
kind: concept
author: QTSurfer
datePublished: "2026-08-31"
lastUpdated: '2026-09-03T00:00:00Z'
---

Un **backtest** aplica una estrategia de trading fija a datos históricos de mercado y simula las
decisiones que esa estrategia habría tomado durante ese periodo. Es un experimento sobre una
estrategia, un conjunto de datos y un modelo de ejecución definidos con precisión, no una predicción
de beneficios futuros.

## Qué puede responder un backtest

Un backtest bien especificado te ayuda a investigar preguntas como estas:

- ¿Las reglas de la estrategia generaron señales en las situaciones esperadas?
- ¿Cómo evolucionaron la rentabilidad y los drawdowns en distintas condiciones de mercado?
- ¿Con qué frecuencia operó la estrategia?
- ¿Cuánto dependió el resultado de las comisiones, el slippage o los valores de los parámetros?
- ¿Un cambio en el código mejoró un periodo y empeoró otro?

Estas respuestas solo tienen sentido cuando se conocen la revisión de la estrategia y todas las
entradas relevantes. Una rentabilidad titular sin su conjunto de datos, fechas, costes, parámetros e
hipótesis de ejecución no es un resultado reproducible.

## El experimento detrás del número

Un backtest básico avanza en orden cronológico:

1. Carga la información de mercado disponible en el instante actual de la simulación.
2. Actualiza los indicadores usando únicamente la información disponible en ese instante.
3. Deja que la estrategia evalúe sus reglas y emita señales.
4. Aplica el modelo de ejecución, incluidas las comisiones y cualquier slippage simulado.
5. Actualiza posiciones, efectivo y equity.
6. Pasa al siguiente evento sin permitir que datos posteriores influyan en una decisión anterior.

Supón una estrategia que compra cuando una media móvil exponencial de 20 periodos sube por encima de
una de 50 periodos y vende cuando cae por debajo. La regla del cruce, por sí sola, no define el
experimento. También hay que especificar el intervalo de las velas, el instrumento, los datos del
exchange, las fechas de prueba, el capital inicial, el momento de las órdenes, las comisiones y cómo se
ejecuta una orden cuando se produce una señal.

## Rentabilidad y equity

Para una equity `E(t)` en el instante `t`, la rentabilidad simple de un periodo es:

```text
return(t) = (E(t) - E(t-1)) / E(t-1)
```

La rentabilidad final es útil, pero oculta el camino recorrido para llegar a ella. Dos backtests
pueden terminar con la misma rentabilidad y haber expuesto al trader a drawdowns, volatilidad,
periodos de tenencia y concentraciones de operaciones muy distintos. Examina la curva de equity y las
operaciones subyacentes en lugar de tratar una única métrica agregada como el resultado.

## Hipótesis que suelen cambiar el resultado

### Costes de transacción

Las comisiones se acumulan operación tras operación. Una estrategia con una pequeña ventaja media y
una alta rotación puede parecer viable antes de costes y no serlo después.

### Slippage y ejecuciones

El precio de una señal no es automáticamente un precio ejecutable. La liquidez, el spread, el tipo de
orden, la latencia y la resolución de las barras afectan al precio al que debería ejecutarse una orden
simulada.

### Calidad de los datos

Intervalos ausentes, observaciones duplicadas, marcas de tiempo incorrectas, cambios de símbolo y una
cobertura de mercado incompleta pueden alterar las señales. Registra la identidad del conjunto de datos
y valídalo antes de comparar ejecuciones.

### Momento de la información

La estrategia no debe usar un precio de cierre para operar antes dentro del mismo intervalo, ni
ningún otro valor desconocido en el momento de la decisión. Ese fallo se llama
[sesgo de anticipación](./look-ahead-bias).

### Selección de parámetros

Probar muchas combinaciones de parámetros e informar solo de la ganadora convierte el periodo de
prueba en parte del proceso de entrenamiento. El resultado ganador necesita validarse con datos que
no lo hayan elegido.

## Una lista de comprobación práctica

Antes de fiarte de un backtest lo suficiente como para seguir investigándolo, pregúntate:

- ¿La revisión exacta de la estrategia es inmutable y recuperable?
- ¿Están registrados el exchange, el instrumento, el segmento de mercado, el intervalo y el rango de
  fechas?
- ¿Se calentaron los indicadores antes de usar sus valores?
- ¿Podía conocerse cada entrada en el momento simulado de la decisión?
- ¿Son plausibles las hipótesis de comisiones, spread, slippage y ejecución?
- ¿Se representan las órdenes rechazadas o no ejecutadas, en lugar de tratarlas en silencio como
  ejecutadas?
- ¿Depende el rendimiento de un número pequeño de operaciones o de un solo régimen de mercado?
- ¿Se seleccionaron los parámetros con los mismos datos usados para informar del rendimiento?
- ¿Puede otra persona ejecutar las mismas entradas y obtener el mismo resultado?

## Backtesting en QTSurfer

Las estrategias de QTSurfer tienen revisiones, y un backtest apunta a una revisión concreta. Mantén
juntos la revisión, el conjunto de datos, la configuración y las métricas resultantes cuando compares
experimentos. Usa el resultado detallado para inspeccionar la trayectoria de la equity y las decisiones
individuales, y cambia una sola entrada controlada cada vez cuando pongas a prueba una explicación.

La [guía de backtesting del producto](/docs/app/backtesting) explica el flujo de trabajo en la
aplicación. La [documentación para desarrolladores](/docs/developers) cubre la construcción de
estrategias y la emisión de señales.

## La conclusión correcta

Un backtest puede descartar una idea, sacar a la luz errores de implementación y mostrar cómo se
comportó una estrategia bajo unas condiciones históricas concretas. No puede establecer que ese mismo
comportamiento vaya a continuar. Trátalo como evidencia dentro de un proceso de investigación
iterativo, no como prueba de rendimiento futuro.
