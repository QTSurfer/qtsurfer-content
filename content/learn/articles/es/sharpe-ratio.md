---
title: Ratio de Sharpe
description: Aprende qué mide el ratio de Sharpe, por qué su valor depende de la serie de retornos y de la convención usada, cómo compararlo con honestidad y exactamente cómo lo calcula QTSurfer.
order: 9
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

El **ratio de Sharpe** compara lo que ganó una estrategia con cuánto variaron sus retornos mientras lo
ganaba. Es la cifra individual más citada en la evaluación de estrategias, y la que con más frecuencia
se lee mal, porque su valor depende de elecciones que rara vez se indican junto al número: qué serie de
retornos, sobre qué periodo, anualizado o no, contra qué referencia.

Dos ratios de Sharpe solo son comparables cuando esas elecciones coinciden. La mayoría de las
discusiones sobre si «un Sharpe de 1,2 es bueno» son discusiones sobre convenciones, no sobre la
estrategia.

## Cálculo

Para una serie de retornos periódicos `r₁ … rₙ` y una tasa libre de riesgo `r_f` sobre el mismo
periodo:

```text
Sharpe = mean(r − r_f) / stdev(r − r_f)
```

El numerador es el exceso de retorno medio; el denominador es la desviación típica de esos retornos,
una medida de cuánto se dispersan alrededor de la media. Un valor más alto significa más retorno por
unidad de variabilidad.

En la práctica suele anualizarse la cifra para poder comparar estrategias con distintas frecuencias de
muestreo. Si los retornos se muestrean `N` veces al año y son independientes entre sí:

```text
Sharpe_annual ≈ Sharpe_period · √N
```

Los retornos diarios usan `√252` (días de negociación) o `√365` (mercados que nunca cierran); los
mensuales, `√12`. La hipótesis de independencia hace un trabajo real en esa fórmula: retornos
solapados o autocorrelacionados la hacen incorrecta, a veces gravemente.

### Por operación frente a por periodo

Un ratio de Sharpe puede calcularse a partir de retornos por **periodo de calendario** (diarios,
semanales) o a partir de retornos **por operación** (una observación por operación cerrada). Son
estadísticas distintas:

- El Sharpe por periodo incluye los tramos planos en los que la estrategia no tenía posición, y
  refleja la experiencia de mantener la cuenta a lo largo del tiempo.
- El Sharpe por operación mide la consistencia de las propias operaciones, ignorando cómo se espacian.
  Su tamaño de muestra es el número de operaciones, no el rango de fechas.

Un Sharpe por operación de `0.3` de una estrategia que opera 200 veces al año y un Sharpe diario
anualizado de `1.5` pueden describir la misma estrategia. Ninguno es erróneo; responden a preguntas
distintas.

### Ejemplo resuelto

Una estrategia cierra ocho operaciones con estos retornos, en porcentaje:

```text
+1.2  −0.8  +0.9  +2.1  −1.5  +0.6  +1.8  −0.3

mean    = 0.50 %
stdev   = 1.19 %
Sharpe  = 0.50 / 1.19 = 0.42   (per trade, no risk-free adjustment)
```

Ocho observaciones hacen de esto una estimación burda: una operación perdedora más de `−2 %` lo lleva a
`0.16`. El número de operaciones forma parte de la lectura.

## Interpretarlo

- **Premia la consistencia, no el tamaño.** Una estrategia que gana un 0,2 % en cada operación tiene
  un ratio de Sharpe enorme y una rentabilidad modesta. Léelo junto a la rentabilidad total y el
  drawdown.
- **Trata igual la variabilidad al alza y a la baja.** Una estrategia con grandes ganancias
  ocasionales es penalizada por ellas. El [ratio de Sortino](/learn/glossary/sortino-ratio) usa solo
  la desviación a la baja y evita eso.
- **Asume que los retornos son aproximadamente simétricos.** Las estrategias con pérdidas grandes y
  raras (venta de volatilidad, stops ajustados que de vez en cuando saltan con un hueco) muestran un
  Sharpe alto hasta que llega la pérdida. La asimetría y la curtosis importan, y el ratio de Sharpe
  deflactado las ajusta.
- **Lo infla la selección.** El mejor Sharpe entre muchos ensayos sobrestima la ventaja subyacente.
  Consulta [Sobreajuste](overfitting) para ver cuánto.

## Errores habituales

- **Comparar entre convenciones.** Un Sharpe diario anualizado de una plataforma frente a un Sharpe
  por operación de otra no dice nada.
- **Anualizar una ventana corta.** Multiplicar un resultado de dos semanas por `√26` produce un
  número impresionante a partir de casi ninguna evidencia.
- **Leer un Sharpe alto con pocas operaciones como habilidad.** Las muestras pequeñas producen valores
  extremos por azar.
- **Tratar la tasa libre de riesgo como irrelevante.** Con tipos de interés significativos, omitirla
  infla por igual todas las estrategias y hace que las débiles parezcan positivas.
- **Optimizar solo para el Sharpe.** Un barrido ordenado únicamente por Sharpe deriva hacia
  estrategias que operan poco y con cautela en la muestra. La ordenación por meseta y los umbrales de
  operaciones existen por esta razón.

## El ratio de Sharpe en QTSurfer

QTSurfer calcula el ratio de Sharpe a partir de **retornos por operación**: cada operación cerrada
aporta un retorno, expresado como porcentaje del capital implicado, neto de comisiones. El ratio es la
media de esos retornos dividida por su desviación típica. **No está anualizado** y no incluye ajuste
por tasa libre de riesgo, de modo que debe compararse con otros resultados de QTSurfer, no con cifras
anualizadas de otros sitios. Un backtest con menos de dos operaciones, o con retornos idénticos en
todas ellas, devuelve `0`.

El ratio de Sortino sigue la misma construcción con la desviación a la baja en el denominador, y
devuelve `0` cuando ninguna operación perdió dinero: una estrategia sin pérdidas en la muestra muestra
un Sortino de cero, no infinito, así que léelo junto a la tasa de acierto y el número de operaciones.
Una operación solo cuenta como ganadora cuando su beneficio es estrictamente positivo; una operación
que empata es una pérdida.

El CAGR se calcula a partir de la trayectoria de la equity y no de los retornos por operación: el
cociente entre la equity final y la inicial, anualizado sobre el tiempo entre la primera y la última
operación usando años de 365,25 días. Las ventanas de menos de un año **no** se anualizan
deliberadamente, porque extrapolar unas pocas semanas a un año completo produce magnitudes sin sentido;
para ellas la cifra coincide con la rentabilidad total simple.

En un barrido de parámetros, Sharpe y Sortino son dos de los cuatro objetivos por los que puede
ordenarse una clasificación. Como el Sharpe ganador de un barrido es un máximo seleccionado, cada fila
lleva además un **ratio de Sharpe deflactado**: la probabilidad de que el Sharpe del ensayo refleje una
ventaja real dado el número de ensayos, la longitud de la muestra y la asimetría y curtosis de sus
retornos. Los valores por encima de `0.95`, aproximadamente, sobreviven a la corrección; los valores
iguales o inferiores a `0.5` son lo que mostraría el mejor de un montón de ensayos aleatorios.

## Conceptos relacionados

- [Sobreajuste](overfitting) — por qué el mejor Sharpe de una búsqueda está sesgado al alza.
- [Drawdown](drawdown) — la dimensión de riesgo que el Sharpe no capta.
- [Barrido de parámetros](parameter-sweep) — objetivos, ordenación por meseta y ratio de Sharpe
  deflactado.
- Glosario: [Ratio de Sharpe](/learn/glossary/sharpe-ratio), [Ratio de
  Sortino](/learn/glossary/sortino-ratio), [Ratio de Sharpe deflactado](/learn/glossary/dsr),
  [CAGR](/learn/glossary/cagr).
- Guías para desarrolladores: [Ejecutar un backtest](/docs/developers/api/backtest_execute), [Barridos
  de parámetros](/docs/developers/api/backtest_sweep).

## Lecturas adicionales

- Sharpe, W. F. (1994). *The Sharpe Ratio*. Journal of Portfolio Management.
- Lo, A. W. (2002). *The Statistics of Sharpe Ratios*. Financial Analysts Journal. Sobre por qué la
  anualización con `√N` falla con retornos autocorrelacionados.
- Bailey, D. H. y López de Prado, M. (2014). *The Deflated Sharpe Ratio*. Journal of Portfolio
  Management.
