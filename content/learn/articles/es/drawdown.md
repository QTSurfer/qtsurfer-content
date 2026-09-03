---
title: Drawdown
description: Aprende cómo el drawdown mide la caída desde un máximo anterior de la equity, cómo calcular el drawdown máximo y su duración, y por qué cambia la forma de leer un backtest.
order: 4
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T20:33:24Z'
---

Un **drawdown** es la caída del valor de la cuenta desde un máximo anterior. Empieza en el momento en
que la equity cae por debajo de su máximo acumulado y termina solo cuando se marca un nuevo máximo. El
**drawdown máximo** es la caída más profunda de ese tipo en todo el periodo medido.

La rentabilidad total dice dónde terminó una estrategia. El drawdown dice cuánto costó llegar: qué
parte de la cuenta se perdió desde un punto alto, cuánto duró la pérdida y si el trader habría seguido
ejecutando la estrategia cuando se recuperó.

## Cálculo

Sea `E(t)` la equity en el instante `t` y `P(t)` el máximo acumulado, `P(t) = max E(s)` para todo
`s ≤ t`. El drawdown en `t` es:

```text
DD(t)  = E(t) − P(t)             absolute, in quote currency
DD%(t) = E(t) / P(t) − 1         relative to the peak
```

Ambos son cero o negativos. El drawdown máximo es el mínimo de cualquiera de las dos series en el
periodo:

```text
MaxDD  = min DD(t)
MaxDD% = min DD%(t)
```

Dos medidas de duración suelen acompañar a la profundidad:

- **Duración del drawdown**: tiempo desde el máximo hasta el mínimo.
- **Tiempo de recuperación**: tiempo desde el mínimo hasta un nuevo máximo. Un drawdown aún abierto al
  final del periodo no tiene tiempo de recuperación, y esa ausencia es en sí misma información.

### Ejemplo resuelto

Una cuenta empieza en `100`, sube a `110.5` y luego cae a `90.25`. El máximo acumulado en el tercer
punto es `110.5`, así que:

```text
DD  = 90.25 − 110.5        = −20.25
DD% = 90.25 / 110.5 − 1    = −0.183   →  −18.3 %
```

Observa que el drawdown relativo se mide desde el máximo, no desde el capital inicial. Frente al
`100` inicial la cuenta ha perdido un 9,75 %; frente a su propio máximo, un 18,3 %. El segundo número
es el que el trader habría vivido.

## Qué añade el drawdown a un resultado

- **Riesgo de trayectoria.** Dos estrategias pueden terminar con la misma equity mientras una pasó
  meses un 30 % por debajo de su máximo y la otra nunca cayó más de un 5 %. La rentabilidad final es
  idéntica; la experiencia, los requisitos de margen y la probabilidad de abandonar la estrategia, no.
- **Dimensionamiento de posiciones.** El drawdown máximo histórico de una estrategia es la pérdida
  mínima para la que planificar, no la máxima. Los drawdowns futuros tienden a superar al mayor visto
  en una muestra finita.
- **Rentabilidad por unidad de dolor.** Ratios como `CAGR / |MaxDD%|` (a menudo llamado ratio de
  Calmar) comparan el crecimiento con la pérdida más profunda necesaria para obtenerlo.
- **Consistencia.** Un único drawdown profundo rodeado de ganancias suaves sugiere dependencia de un
  episodio de mercado; muchos drawdowns poco profundos sugieren una estrategia cuyo riesgo está
  repartido en el tiempo.

## Errores habituales

- **Comparar drawdowns absolutos con capitales distintos.** `−20.25` significa cosas distintas en una
  cuenta de `100` y en una de `10,000`. Compara porcentajes, o normaliza antes.
- **Leer la profundidad sin la duración.** Un drawdown del 10 % recuperado en una semana y uno del
  10 % que duró un año no son el mismo riesgo.
- **Tratar el máximo histórico como un techo.** La muestra contiene una única trayectoria. Muestras
  más largas y la operativa real casi siempre encuentran una más profunda.
- **Optimizar para el menor drawdown.** Una estrategia que rara vez opera tiene un drawdown pequeño y
  poco más. El drawdown es una restricción que respetar, no un objetivo que minimizar por sí solo.
- **Medirlo sobre una curva submuestreada.** Una curva reducida a unos cientos de puntos puede perder
  el mínimo exacto o el máximo exacto que definieron el drawdown máximo. Calcúlalo sobre la serie
  completa o usa la métrica que devuelve el motor.

## El drawdown en QTSurfer

Un backtest completado devuelve ambas formas en sus resultados: `maxDrawdown` en moneda de cotización
y `maxDrawdownPercent` relativo al máximo, junto con el ratio de Sharpe, el ratio de Sortino, el CAGR
y el número de operaciones. La curva de equity que hay detrás está disponible en la misma respuesta,
de modo que la profundidad puede ubicarse en el tiempo.

En un barrido de parámetros, cada fila de la clasificación lleva `maxDdPct`, y `maxdd` es uno de los
cuatro objetivos por los que un barrido puede ordenar. Ordena por drawdown solo junto con el número de
operaciones: las filas por debajo del umbral de operaciones se marcan como `belowTradeFloor`
precisamente porque un drawdown bajo construido sobre muy pocas operaciones no es evidencia de control.

Cuando una curva de equity se remuestrea para mostrarla, la transformación conserva el primer y el
último punto y los extremos globales, de modo que sobreviven los valores de equity más alto y más bajo.
El par concreto máximo-mínimo que define el drawdown máximo no está garantizado, y por eso la cifra a
citar es la métrica devuelta, no un valor leído de un gráfico compacto.

## Conceptos relacionados

- [Curva de equity](equity-curve) — la serie de la que se mide cada drawdown.
- [Backtesting](backtesting) — qué puede y qué no puede decirte un resultado histórico.
- [Sobreajuste](overfitting) — por qué el menor drawdown histórico de un barrido puede ser el menos
  fiable.
- Glosario: [Drawdown](/learn/glossary/drawdown), [CAGR](/learn/glossary/cagr), [Ratio de
  Sharpe](/learn/glossary/sharpe-ratio), [Ratio de Sortino](/learn/glossary/sortino-ratio).
- Guías para desarrolladores: [Curvas de equity](/docs/developers/api/equity_curves), [Ejecutar un
  backtest](/docs/developers/api/backtest_execute).
