---
title: Curva de equity
description: Aprende qué registra una curva de equity durante un backtest, cómo normalizarla y leerla, y qué formas delatan una estrategia frágil en lugar de una robusta.
order: 5
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T20:33:24Z'
---

Una **curva de equity** es el valor de la cuenta de una estrategia representado a lo largo del tiempo.
En un backtest empieza en el capital inicial y se mueve conforme las operaciones simuladas realizan
beneficios, pérdidas y costes. Es el artefacto con más información que produce un backtest: todas las
métricas resumen, desde la rentabilidad total hasta el drawdown máximo, son función de esta única
serie.

Una rentabilidad final comprime todo el experimento en un número. La curva conserva la trayectoria, y
en la trayectoria viven la mayoría de las preguntas útiles.

## Qué registra la curva

Cada punto es una marca de tiempo y un valor de equity. La equity es el saldo de la cuenta en moneda
de cotización, `capital inicial + beneficio neto acumulado`, no un porcentaje ni un precio.

La frecuencia con que se registran los puntos importa. Una curva muestreada en cada operación muestra
los resultados realizados en los momentos en que la estrategia cerró posiciones, pero no dice nada de
las oscilaciones no realizadas entre esos momentos. Una curva valorada a mercado en cada tick muestra
la trayectoria completa, incluido el riesgo de las posiciones abiertas, con un tamaño mucho mayor.
Averigua cuál de las dos estás mirando antes de leerla.

### Normalizar para comparar

Dos curvas con distinto capital inicial no pueden compararse por su valor bruto. Normaliza cada punto
respecto a su equity inicial:

```text
return%(t) = (E(t) / E(0) − 1) · 100
```

Una cuenta que empieza en `100` y pasa a `110.5` y luego a `90.25` se lee como `+10.5 %` y `−9.75 %`
en la escala normalizada, cualesquiera que fueran los importes en moneda.

Para curvas largas o con fuerte capitalización compuesta, un eje vertical logarítmico mantiene los
movimientos porcentuales iguales con el mismo tamaño visual. En un eje lineal, la misma pérdida del
10 % parece pequeña al principio y enorme al final.

## Leer la forma

- **Pendiente y consistencia.** Una pendiente estable con pequeñas fluctuaciones es el aspecto de una
  ventaja repetible. Una línea plana con unos pocos saltos verticales es una estrategia cuya
  rentabilidad depende de un puñado de operaciones.
- **Drawdowns.** Cada bajada por debajo de un máximo anterior es un [drawdown](drawdown). Su
  profundidad, su frecuencia y lo que tardan en recuperarse son el perfil de riesgo de la estrategia
  en forma gráfica.
- **Periodos planos.** Tramos largos sin movimiento significan que la estrategia no estaba operando.
  Puede ser intencionado, o puede significar que la condición de entrada nunca se cumplió en un
  régimen para el que la estrategia no fue diseñada.
- **Escalones.** Escalones regulares indican operativa poco frecuente con tamaño fijo. No son un
  problema en sí, pero avisan de que el tamaño de la muestra lo fija el número de operaciones, no el
  rango de fechas.
- **Dependencia del régimen.** Una curva que sube solo durante un periodo identificable y se mantiene
  plana o cae en el resto probablemente se ha ajustado a ese periodo y no al mercado.
- **Aceleración tardía.** Ganancias fuertes concentradas al final de la ventana son la forma que con
  más frecuencia produce la suerte o un parámetro ajustado a los datos recientes.

## Errores habituales

- **Juzgar por el punto final.** El valor final es un punto. Dos curvas pueden compartirlo mientras
  una es una línea recta y la otra un precipicio seguido de una recuperación.
- **Leer una curva submuestreada como si fuera la original.** Una curva reducida para mostrarla
  conserva su forma general, pero los máximos y mínimos individuales entre los puntos conservados
  pueden haberse suavizado.
- **Comparar curvas con distintas hipótesis de comisiones.** Los costes actúan en cada operación, así
  que dos ejecuciones que solo difieren en las comisiones pueden tener curvas visiblemente distintas.
  Guarda la configuración junto al gráfico.
- **Confundir una curva suave dentro de muestra con robustez.** Una curva puede hacerse
  arbitrariamente suave sobre datos históricos añadiendo reglas. La suavidad solo es evidencia cuando
  aparece en datos con los que la estrategia no se ajustó.

## Las curvas de equity en QTSurfer

Un backtest completado devuelve su curva de equity junto con las métricas de rendimiento en cuanto la
estrategia ha emitido al menos una operación. El primer punto es un ancla en el inicio del backtest
con el capital inicial; cada punto posterior es una muestra por rendimiento emitido, de modo que la
curva registra los resultados realizados en esos momentos. La equity es el valor de la cuenta en moneda
de cotización, y la normalización anterior la convierte en rentabilidad porcentual.

La curva pasa por una canalización de transformación fija, `resample → differential → outMode`:

- `resample` limita el resultado a un número de puntos elegido, conservando el primer y el último
  punto exactos y los extremos globales.
- `differential` codifica en deltas las marcas de tiempo y la equity a partir del segundo punto para
  reducir la carga útil; el primer punto se mantiene absoluto y cada punto posterior se reconstruye
  sumando su delta al valor anterior.
- `outMode` elige entre objetos (`ARRAY`) o arrays paralelos (`SHORT`).

Los metadatos de la respuesta informan de lo que ocurrió realmente, incluidos `inputPointCount`,
`outputPointCount` y si se ejecutaron el remuestreo o la codificación en deltas. Una salvaguarda de
tamaño en el servidor puede forzar una representación compacta, así que la fuente de verdad sobre la
forma son los metadatos, no la petición.

En un backtest simple la transformación se fija al enviar la ejecución y la curva se devuelve en
línea. En un barrido de parámetros, las filas de la clasificación son resultados agregados y solo
llevan curva los ensayos retenidos, seleccionados con `mode` (`auto`, `topN`, `topPct` o `none`); esas
filas contienen un puntero que se obtiene por separado, con la transformación elegida en el momento de
la lectura. Los valores de los indicadores y los marcadores de compra o venta que hay detrás de la curva
agregada están disponibles como señales almacenadas cuando la ejecución las solicita.

## Conceptos relacionados

- [Drawdown](drawdown) — la medida de cada bajada de la curva.
- [Backtesting](backtesting) — el experimento que produce la curva.
- [Sobreajuste](overfitting) — por qué una curva histórica suave no es evidencia por sí sola.
- Glosario: [Curva de equity](/learn/glossary/equity-curve), [Drawdown](/learn/glossary/drawdown),
  [CAGR](/learn/glossary/cagr).
- Guía para desarrolladores: [Curvas de equity](/docs/developers/api/equity_curves).
