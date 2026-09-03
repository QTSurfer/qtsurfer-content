---
title: Sobreajuste
description: Aprende por qué una estrategia que parece la mejor sobre datos históricos suele fallar después, cómo la selección infla los resultados de un backtest y cómo medir el daño antes de fiarte de una ganadora.
order: 3
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

El **sobreajuste** (*overfitting*) es lo que ocurre cuando una estrategia se moldea a los accidentes
de una muestra histórica concreta en lugar de a una característica repetible del mercado. El backtest
sigue devolviendo un número real, pero ese número describe lo bien que la estrategia memorizó el
pasado, no cómo se comportará con datos que nunca ha visto.

El problema rara vez es una única mala decisión. Se acumula a lo largo de la investigación ordinaria:
añadir un filtro más, probar un valor más de un parámetro, quedarse con la mejor variante y descartar
el resto. Cada paso es razonable por separado. En conjunto, convierten la muestra histórica en datos
de entrenamiento y el rendimiento reportado en una puntuación dentro de muestra.

## Por qué el mejor resultado está sesgado

Supón que una estrategia no tiene ninguna ventaja y que su ratio de Sharpe sobre cualquier muestra es
puro ruido. Ejecútala una vez y obtienes una tirada aleatoria. Ejecútala cuarenta y cuatro veces con
distintos parámetros y quédate con la mejor: no has encontrado una ventaja; has encontrado el máximo de
cuarenta y cuatro tiradas aleatorias.

Ese máximo crece de forma predecible con el número de ensayos. Para ensayos independientes sin
habilidad real, el mejor ratio de Sharpe esperado escala aproximadamente con `√(2 · ln N)`, donde `N`
es el número de ensayos. Diez ensayos ya producen un mejor resultado que impresionaría si viniera de
una sola prueba. Unos cientos de ensayos hacen casi seguro un ganador de aspecto sólido.

Es el problema de las **pruebas múltiples**, y es la razón por la que la primera fila de una
clasificación no puede leerse como evidencia por sí sola. La pregunta relevante no es «¿qué tan bueno
es el ganador?», sino «¿qué aspecto tendría el ganador si nada funcionara?».

## De dónde viene el sobreajuste

- **Demasiados grados de libertad.** Cada parámetro, filtro, umbral y caso especial es un mando que
  puede girarse para encajar en el histórico. Las estrategias con muchos mandos pueden reproducir casi
  cualquier trayectoria pasada.
- **Selección sobre los datos de evaluación.** Elegir la mejor variante con los mismos datos que se
  usan para informar de su rendimiento es el error central. La elección consume la información de la
  muestra.
- **Pocas operaciones.** Un resultado construido con una docena de operaciones está dominado por un
  puñado de eventos. Las muestras pequeñas hacen probables los resultados extremos y poco fiables sus
  estadísticas.
- **Parámetros frágiles.** Una estrategia que solo funciona con `rsiPeriod = 16` y se derrumba con
  `15` o `17` ha encontrado, muy probablemente, una coincidencia en los datos, no una propiedad del
  mercado.
- **Datos de prueba reutilizados.** Un periodo fuera de muestra solo lo es una vez. Ajustar una
  estrategia después de ver su resultado fuera de muestra convierte, sin ruido, ese periodo en datos
  dentro de muestra.

## Un ejemplo concreto

Un trader barre `rsiPeriod` de 7 a 28 y un filtro de tendencia booleano, cuarenta y cuatro
combinaciones en total, y las ordena por ratio de Sharpe. La ganadora presenta un Sharpe de `1.84`
con `rsiPeriod = 16` y el filtro activado.

Dos preguntas deciden si esa fila significa algo:

1. **¿Qué aspecto tienen sus vecinas?** Si `rsiPeriod` 15 y 17 también puntúan bien, la región es una
   meseta y el parámetro está captando algo duradero. Si las vecinas puntúan `0.6` y `0.5`, el `1.84`
   es un pico, y el más mínimo cambio en las condiciones del mercado sacará a la estrategia de él.
2. **¿Cuánta puntuación explica la propia búsqueda?** Cuarenta y cuatro ensayos sin ventaja producen
   un mejor Sharpe lejos de cero. La puntuación de la ganadora debe medirse contra esa línea base, no
   contra cero.

Una meseta en `1.6` gana a un pico en `1.84`. El pico es el número más impresionante y el menos
fiable.

## Errores habituales

- **Informar solo del ganador.** El número de alternativas probadas forma parte de la evidencia.
  Ocultar los ensayos descartados hace imposible cualquier corrección por pruebas múltiples.
- **Añadir reglas hasta que la curva de equity quede suave.** Cada regla que elimina una mala
  operación histórica es una regla ajustada a esa operación.
- **Tomar una cuadrícula fina por exhaustividad.** Un paso de `1` en un periodo que se comporta igual
  de 14 a 18 añade ensayos, no información, e infla la línea base de las pruebas múltiples.
- **Optimizar dos veces sobre la misma ventana.** Barrido grueso, luego refinamiento, luego un último
  retoque, todo sobre las mismas fechas, es un único ajuste largo dentro de muestra.
- **Confundir una buena métrica con una buena estrategia.** Un objetivo que minimiza el drawdown
  puede satisfacerlo una estrategia que apenas opera. Lee el número de operaciones junto a cualquier
  puntuación.

## Cómo lo mide QTSurfer

Un barrido de parámetros en QTSurfer conserva todos los ensayos y devuelve varias correcciones que
atacan directamente los mecanismos anteriores, en lugar de dejar la clasificación como única salida.

- **Clasificación por meseta por defecto.** La clasificación ordena por el objetivo de la *peor*
  ejecución del vecindario inmediato de cada punto de parámetros, de modo que un pico que no
  sobrevive a sus vecinos no gana por defecto. `ranking=raw` restaura el orden sin ajustar, y
  `neighbourCount: 0` marca un punto cuya puntuación de meseta no tiene vecinos que la respalden.
- **Ratio de Sharpe deflactado por ensayo.** Cada fila de la clasificación lleva un valor
  `deflatedSharpe`: la probabilidad de que el Sharpe del ensayo refleje una ventaja real y no la
  mejor tirada entre todos los vectores probados. Los valores por encima de `0.95`, aproximadamente,
  sobreviven a la corrección por pruebas múltiples; los valores iguales o inferiores a `0.5` son
  indistinguibles del mejor de un montón de lanzamientos de moneda.
- **Probabilidad de sobreajuste del backtest.** Un barrido completado devuelve `pbo`, calculado
  mediante validación cruzada combinatoria simétrica sobre todo el barrido. Un valor por encima de
  `0.5`, aproximadamente, significa que el proceso de selección está eligiendo ruido.
- **Umbral de operaciones.** Los ensayos por debajo de `minTradeFloor` (treinta operaciones por
  defecto) permanecen en los resultados pero se marcan como `belowTradeFloor`, para que una
  puntuación alta construida sobre un puñado de operaciones sea visible como tal.
- **Vistas de sensibilidad.** El endpoint de sensibilidad agrega todas las ejecuciones por valor de
  parámetro. Una marginal plana significa que un eje no importó; que `best`, `mean` y `worst`
  discrepen significa que el eje solo funciona en compañía concreta.
- **Validación walk-forward.** Añadir `walkForward` a un barrido optimiza cada pliegue sobre su
  propia ventana y puntúa a la ganadora solo sobre la ventana siguiente, no vista. El `paramDrift`
  devuelto muestra si las ganadoras se mantienen en la misma región de pliegue en pliegue o saltan por
  la cuadrícula.

Ninguna de ellas repara un backtest que filtró información futura o usó datos defectuosos. Te dicen
cuánto de un resultado atractivo habría producido la búsqueda por sí sola.

## Conceptos relacionados

- [Backtesting](backtesting) — qué mide una simulación histórica y qué hipótesis viajan con el
  resultado.
- [Sesgo de anticipación](look-ahead-bias) — la otra gran razón por la que un backtest no puede
  reproducirse en vivo.
- [Barrido de parámetros](parameter-sweep) — cómo explorar una cuadrícula sin seleccionar el ruido que
  contiene.
- [Análisis walk-forward](walk-forward-analysis) — validación secuencial fuera de muestra de un barrido.
- Glosario: [Ratio de Sharpe deflactado](/learn/glossary/dsr), [Probabilidad de sobreajuste del
  backtest](/learn/glossary/pbo), [Ratio de Sharpe](/learn/glossary/sharpe-ratio).
- Guía para desarrolladores: [Barridos de parámetros](/docs/developers/api/backtest_sweep).

## Lecturas adicionales

- Bailey, D. H. y López de Prado, M. (2014). *The Deflated Sharpe Ratio: Correcting for Selection
  Bias, Backtest Overfitting and Non-Normality*. Journal of Portfolio Management.
- Bailey, D. H., Borwein, J., López de Prado, M. y Zhu, Q. J. (2017). *The Probability of Backtest
  Overfitting*. Journal of Computational Finance.
- Bailey, D. H., Borwein, J., López de Prado, M. y Zhu, Q. J. (2014). *Pseudo-Mathematics and
  Financial Charlatanism: The Effects of Backtest Overfitting on Out-of-Sample Performance*. Notices
  of the American Mathematical Society.
