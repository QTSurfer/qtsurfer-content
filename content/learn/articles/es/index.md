---
id: learn-index
title: Aprende los conceptos de las estrategias cuantitativas
description: Explicaciones prácticas sobre backtesting, sesgos, riesgo y evaluación de estrategias, conectadas con flujos de trabajo reproducibles en QTSurfer.
order: 0
kind: landing
author: QTSurfer
datePublished: "2026-08-31"
lastUpdated: '2026-09-03T20:33:24Z'
---

Construir una estrategia es solo una parte del trading cuantitativo. También necesitas entender qué
mide un experimento, qué hipótesis han moldeado el resultado y cómo un rendimiento aparentemente
sólido puede llevarte a engaño.

Learn ofrece explicaciones prácticas de los conceptos que hay detrás de QTSurfer. Cada artículo conecta
la idea con un flujo de trabajo reproducible en lugar de quedarse en una definición de diccionario.

## Por dónde empezar

- [Estrategia cuantitativa](quantitative-strategy) — qué hace cuantitativa a una estrategia, sus
  cinco componentes y el ciclo de investigación desde la hipótesis hasta la validación.
- [Backtesting](backtesting) — qué puede decirte una simulación histórica, qué no, y qué hipótesis
  deben acompañar a cada resultado.
- [Sesgo de anticipación](look-ahead-bias) — cómo se filtra información futura en una estrategia y
  hace imposible reproducir el backtest en trading real.
- [Sobreajuste](overfitting) — por qué el mejor resultado de una búsqueda está sesgado, y cómo medir
  cuánto de él ha producido la propia búsqueda.
- [Sesgo de supervivencia](survivorship-bias) — cómo el universo, el catálogo y el registro publicado
  excluyen en silencio los fracasos.

## Leer un resultado

- [Curva de equity](equity-curve) — qué registra la serie del valor de la cuenta, cómo normalizarla y
  qué formas delatan fragilidad.
- [Drawdown](drawdown) — la caída desde un máximo anterior, su profundidad y duración, y por qué
  cambia la lectura de una rentabilidad.
- [Ratio de Sharpe](sharpe-ratio) — rentabilidad por unidad de variabilidad, las convenciones que
  hacen comparables dos valores y cómo lo calcula exactamente QTSurfer.
- [Slippage](slippage) — el coste entre el precio decidido y el obtenido, y cómo tenerlo en cuenta en
  un backtest.

## Explorar parámetros

- [Barrido de parámetros](parameter-sweep) — muestreo en cuadrícula, aleatorio y por hipercubo
  latino, clasificaciones, mesetas y vistas de sensibilidad.
- [Análisis walk-forward](walk-forward-analysis) — validación secuencial fuera de muestra de un
  barrido y qué revela la deriva de parámetros.

## Estrategias

- [Cruce de EMA](ema-crossover) — la regla de seguimiento de tendencia de referencia: retardo,
  señales falsas, filtros útiles y cómo implementarla y barrerla.
- [Revisión de estrategia](strategy-revision) — versiones inmutables del código de una estrategia, y
  por qué cada resultado debe apuntar a una.
- [Trading algorítmico](algorithmic-trading) — de la decisión a la orden: qué necesita un sistema de
  trading más allá de la señal, y la brecha entre backtest y operativa real.

## Datos

- [Datos históricos de mercado](historical-market-data) — tickers frente a velas, cadencia, cobertura
  y huecos, y cómo QTSurfer almacena y sirve el histórico de los exchanges.
