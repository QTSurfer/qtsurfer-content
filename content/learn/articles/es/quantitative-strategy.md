---
title: Estrategia cuantitativa
description: Aprende qué hace cuantitativa a una estrategia de trading, qué componentes tiene toda estrategia de este tipo, cómo funciona el ciclo de investigación de la hipótesis a la validación y cómo se corresponde QTSurfer con él.
order: 14
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

Una **estrategia cuantitativa** es un conjunto de reglas de trading definidas con la precisión
suficiente para poder computarse. Con los mismos datos, produce las mismas decisiones cada vez, que es
lo que permite probarla sobre el histórico, compararla con alternativas y ejecutarla sin una persona en
el bucle.

La palabra *cuantitativa* se refiere al método, no a la complejidad. Una regla de medias móviles de
dos líneas es cuantitativa; la intuición de un trader respaldada por gráficos no lo es, por mucha
aritmética que la sostenga. La línea divisoria es si la decisión puede reproducirse solo a partir de
la regla y los datos.

## Componentes

Toda estrategia cuantitativa, de la más simple a la más elaborada, contiene las mismas partes. Dejar
una implícita es la fuente habitual de un resultado que no puede reproducirse.

1. **Universo.** Qué instrumentos considera la estrategia y cómo se elige ese conjunto a lo largo del
   tiempo. Consulta [Sesgo de supervivencia](survivorship-bias) para ver por qué importa «a lo largo
   del tiempo».
2. **Datos.** Qué observa la estrategia: tickers, velas a una cadencia, tasas de financiación, niveles
   del libro de órdenes. Los datos definen lo que la estrategia puede saber en cada momento.
3. **Señal.** El cálculo que convierte observaciones en una opinión: indicadores, umbrales, modelos.
   Es lo que la mayoría entiende por «la estrategia», y es una parte de cinco.
4. **Tamaño.** Cuánto operar cuando la señal se dispara: fracción fija del capital, escalado por
   volatilidad, entrada escalonada en una posición.
5. **Ejecución y riesgo.** Tipo de orden, stops de protección, exposición máxima y las condiciones
   bajo las que la estrategia deja de operar.

Dos estrategias con la misma señal y distinto tamaño o distintas salidas son estrategias distintas, y
pueden tener resultados opuestos.

## Familias

La mayoría de las estrategias pertenecen a un número pequeño de familias, distinguidas por el
comportamiento del mercado del que dependen:

- El **seguimiento de tendencia** asume que los movimientos persisten: comprar fortaleza, vender
  debilidad, aceptar muchas pérdidas pequeñas por unas pocas ganancias grandes. El [cruce de
  EMA](ema-crossover) es el ejemplo canónico.
- La **reversión a la media** asume que los movimientos se pasan de largo: ir contra los extremos,
  aceptar muchas ganancias pequeñas por unas pocas pérdidas grandes cuando el extremo era el inicio
  de una tendencia.
- El **carry** cobra un pago estructural, como una tasa de financiación, y gestiona el riesgo de precio
  a su alrededor.
- El **valor relativo** opera un instrumento contra otro cuando su relación se aparta de su rango
  habitual.
- La **creación de mercado** aporta liquidez y gana el spread, y depende más del control del
  inventario y de la selección adversa que de opiniones direccionales.

Conocer la familia te dice en qué régimen sufrirá la estrategia, que es lo primero contra lo que
debería contrastarse un backtest.

## El ciclo de investigación

1. **Hipótesis.** Una afirmación sobre el comportamiento del mercado que haría rentable a la
   estrategia, escrita antes de mirar ningún dato. «El momento a corto plazo persiste unas horas en
   pares líquidos tras una expansión de volatilidad» es comprobable; «compra barato, vende caro» no lo
   es.
2. **Implementación.** La regla como código, con los parámetros declarados en lugar de incrustados.
3. **Backtest.** Una ejecución sobre un instrumento y una ventana, sobre todo para encontrar errores de
   implementación y comprobar que la estrategia opera como se pretende. Consulta
   [Backtesting](backtesting).
4. **Exploración.** Un [barrido de parámetros](parameter-sweep) para aprender cómo responde la
   estrategia a sus parámetros, y una vista de sensibilidad para descubrir cuáles de ellos importan.
5. **Validación.** [Análisis walk-forward](walk-forward-analysis) o un periodo reservado, bajo un
   modelo de costes realista, para estimar qué entrega el procedimiento de optimización con datos no
   vistos.
6. **Decisión.** Conservar, revisar o rechazar. Una estrategia rechazada es un resultado, y una
   [revisión](strategy-revision) que permanece en el registro.
7. **Seguimiento.** Una vez operando, compara continuamente el comportamiento en vivo con el backtest.
   Una estrategia cuyos resultados en vivo caen fuera de lo que sus backtests predijeron ha dejado de
   ser la estrategia que se probó.

El ciclo es un ciclo: la mayoría de las estrategias lo recorren varias veces, y la disciplina consiste
en cambiar una sola cosa por pasada.

## Errores habituales

- **Empezar por los datos en lugar de por la hipótesis.** Buscar patrones y explicarlos después
  produce estrategias ajustadas al ruido. Consulta [Sobreajuste](overfitting).
- **Tratar la señal como toda la estrategia.** El tamaño y las salidas suelen contribuir más al
  resultado que la regla de entrada.
- **Dejar el modelo de costes para el final.** Los costes cambian qué parámetros ganan.
- **Leer un backtest como un veredicto.** Un instrumento y una ventana son una prueba de humo, no
  evidencia.
- **Cambiar varias cosas a la vez.** Una pasada por el ciclo que altera la señal, el tamaño y los
  datos no puede atribuir su resultado a ninguno de ellos.

## Las estrategias cuantitativas en QTSurfer

QTSurfer está construido alrededor de este ciclo, con una superficie por etapa.

- **Autoría.** Una estrategia es código Java que extiende una clase base, con indicadores configurados
  una vez y leídos por nombre, estado por instrumento y señales emitidas cuando se cumple una
  condición. Los parámetros se declaran como propiedades de la estrategia para poder barrerlos en lugar
  de editarlos. Un prompt asistido por IA construido a partir del título y la descripción de la
  estrategia puede producir un primer borrador contra la skill de estrategia publicada.
- **Validación.** Guardar compila el código y crea una revisión inmutable; la validación hace pasar la
  clase compilada por una serie sintética para atrapar fallos de cableado antes de cualquier ejecución
  real.
- **Backtest.** Una ejecución apunta a una revisión, a un conjunto de datos preparado con su cobertura
  y a una configuración de capital, asignación y comisiones, y devuelve las métricas de rendimiento, la
  curva de equity y cualquier diagnóstico que haya emitido el motor.
- **Exploración.** Un barrido ejecuta la revisión sobre una cuadrícula, una muestra aleatoria o un
  hipercubo latino de sus propiedades sobre los mismos datos preparados, ordena los ensayos por
  puntuación de meseta, informa de un ratio de Sharpe deflactado por ensayo y de una probabilidad de
  sobreajuste para todo el barrido, y expone marginales y mapas de calor. Los pliegues walk-forward
  validan el procedimiento fuera de muestra.
- **Compartir.** Una revisión concreta puede publicarse en el marketplace con controles de
  visibilidad, exposición del código y precio, y reutilizarse por otros en sus propios análisis.

El motor subyacente calcula los indicadores de forma incremental, de modo que una estrategia cuesta lo
mismo por actualización sea cual sea su ventana de cálculo, y el mismo código de estrategia está
diseñado para ejecutarse contra datos históricos y contra un flujo en vivo.

## Conceptos relacionados

- [Trading algorítmico](algorithmic-trading) — el lado de la ejecución: cómo las decisiones se
  convierten en órdenes.
- [Backtesting](backtesting), [Barrido de parámetros](parameter-sweep), [Análisis
  walk-forward](walk-forward-analysis) — las etapas del ciclo.
- [Revisión de estrategia](strategy-revision) — la unidad que hace reproducibles los resultados.
- Guías para desarrolladores: [Estrategias Java](/docs/developers/java-strategies), [Patrones de
  estrategia](/docs/developers/strategy-patterns).
- Guías del producto: [Primeros pasos](/docs/app/getting-started), [Laboratorio](/docs/app/laboratory).
