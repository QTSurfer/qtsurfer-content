---
title: Backtesting
description: Backtests de mercado vs. simulados, y cómo crear el primero.
order: 3
lastUpdated: '2026-08-18T18:44:33Z'
---

Un backtest corre una revisión de estrategia contra datos históricos e informa cómo
habría rendido. QTSurfer tiene dos tipos:

- **Backtests de mercado** — una estrategia corrida contra datos históricos reales de un
  exchange real. Es el estándar, y el que recorre esta página.
- **Backtests simulados** — una variante más avanzada pensada para barridos de parámetros:
  defines un barrido reducido, lo ejecutas y después envías un **refinamiento** para
  acotarlo más dentro del mismo backtest simulado, como una fase nueva. Son para cuando ya
  estás optimizando una estrategia existente, no para validar una nueva.

## Crear mi primer backtesting

Abre **Backtesting → Nuevo**. El flujo es un asistente de seis pasos; cada paso tiene que
completarse para desbloquear el siguiente, y siempre puedes volver atrás.

### 1. Exchange

Elige el exchange cuyos datos e instrumentos usará el backtest.

### 2. Datos

Elige qué datos de mercado alimentan la simulación y con qué granularidad (la
**cadencia** — desde ticks crudos hasta velas diarias; la cadencia en tiempo real usa cada
actualización e ignora cualquier multiplicador). Mayor resolución es más fiel, a costa de
una corrida más lenta.

### 3. Estrategia

Elige qué estrategia (y revisión) probar.

### 4. Instrumentos

Elige el instrumento o los instrumentos de contraparte y el rango de fechas históricas sobre el que
correrá el backtest.

### 5. Capital y costos

Define el capital inicial (en la moneda de cotización), el porcentaje de capital asignado
a cada operación, y los supuestos de comisiones:

- Una **comisión porcentual** se aplica a cada operación.
- Una **comisión absoluta** (compra/venta, en moneda de cotización) sobrescribe el
  porcentaje cuando está definida.

Aquí también se encuentran los supuestos de riesgo de la simulación.

### 6. Revisión

Confirma el resumen de cada paso y crea el backtest. Queda en cola para ejecutarse; podrás
verlo en la tarjeta `Backtests` del dashboard y en la tabla de [mejores
backtests](/docs/app/getting-started) cuando tenga un resultado.

## Leer un resultado

Cada backtest y ejecución completados se ordenan por **Sharpe ratio** y **PnL total** — las
mismas dos cifras por las que ordenan las tablas "mejores backtests" y "mejores ejecuciones"
del dashboard, así que una corrida sólida se detecta sin necesidad de abrirla.

## Siguiente paso

Cuando un backtest funciona bien, hay dos caminos naturales: [publicar la estrategia en el
Mercado](/docs/app/marketplace), o abrir [Laboratorio](/docs/app/laboratory) para iterar la
próxima idea antes de escribir más código.
