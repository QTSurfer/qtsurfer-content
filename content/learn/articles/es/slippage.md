---
title: Slippage
description: Aprende qué es el slippage, de dónde viene, cómo se combina con las comisiones para erosionar la ventaja de una estrategia y cómo tenerlo en cuenta en un backtest que no puede observar ejecuciones reales.
order: 6
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T00:00:00Z'
---

El **slippage** (deslizamiento) es la diferencia entre el precio al que una estrategia decidió operar y
el precio que obtuvo realmente. Un backtest ve un precio y asume una ejecución; una orden en vivo se
encuentra con un spread, una cola, un mercado en movimiento y una contraparte. La distancia entre
ambos es un coste, y para muchas estrategias es el coste que decide si la ventaja sobrevive.

Las comisiones se conocen de antemano y son fáciles de modelar. El slippage no es ninguna de las dos
cosas, y por eso es la hipótesis que con más frecuencia se deja fuera de un backtest y la que con más
frecuencia explica la diferencia entre la curva de equity simulada y la real.

## De dónde viene el slippage

- **El spread.** Una compra a mercado se ejecuta al precio de venta (*ask*) y una venta a mercado al
  precio de compra (*bid*). Una estrategia que razona a partir del último precio negociado o del
  precio medio paga aproximadamente medio spread en cada lado sin verlo nunca.
- **Impacto de mercado.** Una orden mayor que la liquidez disponible al mejor precio recorre el libro.
  Cuanto mayor sea la orden respecto a la profundidad de la plataforma, peor será la ejecución media.
- **Latencia.** Entre la decisión y el acuse de recibo del exchange, el mercado se mueve. Los mercados
  rápidos y los caminos lentos hacen dominante este término.
- **Volatilidad en el momento de operar.** Las señales suelen dispararse cuando el mercado se mueve,
  justo cuando los spreads se ensanchan y la profundidad se reduce. El slippage es peor cuando la
  estrategia más quiere operar.
- **Stops de protección.** Un stop que sale a mercado durante un movimiento brusco se ejecuta donde
  esté el mercado, que puede estar lejos del nivel del stop.

Las órdenes limitadas evitan pagar el spread pero introducen un coste distinto: la orden puede no
ejecutarse, y las operaciones que no se ejecutan son, de forma desproporcionada, las que habrían sido
rentables, porque el mercado se alejó del precio.

## Por qué se acumula

Los costes actúan en cada operación y escalan con la frecuencia de negociación. Toma una estrategia
cuya operación media gana un 0,30 % antes de costes:

```text
fee per side          0.10 %
slippage per side     0.05 %
round trip            2 × (0.10 + 0.05) = 0.30 %

net per trade         0.30 % − 0.30 % = 0.00 %
```

La estrategia es rentable en un backtest sin costes y se queda en cero en la realidad. Reduce a la
mitad la estimación de slippage y conserva un 0,05 % por operación; duplícala y pierde dinero. La
conclusión depende por completo de un número que el backtest no puede observar, y por eso ese número
tiene que elegirse deliberadamente y ponerse a prueba en un rango.

## Estimarlo

No hay una cifra universal. Puntos de partida razonables:

- **Pares spot líquidos, órdenes pequeñas**: medio spread típico por lado, unos pocos puntos básicos
  en un par principal.
- **Pares menos líquidos u órdenes mayores**: medio spread más un término de impacto que crece con el
  tamaño de la orden respecto a la profundidad visible.
- **Salidas por stop y entradas motivadas por noticias**: varias veces la estimación de mercado
  tranquilo.

El enfoque honesto es una prueba de sensibilidad: ejecuta la misma estrategia bajo dos o tres
hipótesis de coste y observa dónde cambia la conclusión. Una estrategia que sobrevive a un modelo de
costes pesimista vale más que una que solo funciona con el optimista.

## Errores habituales

- **Hacer el backtest sin costes y «añadirlos después».** Los costes cambian qué parámetros ganan, no
  solo el número final. Un barrido de parámetros sin costes selecciona la configuración más activa,
  que es exactamente la que más castigan los costes.
- **Asumir que las órdenes limitadas siempre se ejecutan.** Modelar una estrategia de órdenes
  limitadas con ejecuciones garantizadas elimina de la simulación su principal riesgo.
- **Usar el precio de cierre de una barra como ejecución.** Una decisión tomada al cierre de la barra
  no puede ejecutarse a ese precio; la ejecución ocurre en la barra siguiente, a un precio que la
  estrategia no vio.
- **Ignorar el tamaño de la cuenta.** Un slippage insignificante para una cuenta pequeña se vuelve
  material cuando la misma estrategia opera con tamaño. Un backtest fija una cifra de capital;
  comprueba que las ejecuciones sean plausibles con esa cifra.
- **Modelar comisiones pero no slippage.** Las comisiones son la mitad visible del coste. Un modelo
  que se queda ahí sobrestima sistemáticamente el rendimiento neto.

## El slippage en QTSurfer

QTSurfer modela los costes de transacción de forma explícita a través de la configuración de
comisiones de un backtest. Se aplica una comisión porcentual por lado, con tasas separadas de compra y
de venta disponibles, y la aplicación admite además una comisión absoluta por operación en moneda de
cotización que anula el porcentaje. Todas las métricas devueltas, del beneficio al ratio de Sharpe,
son netas de estas comisiones.

Las ejecuciones se producen al precio que la estrategia pasa al emitir una señal: por defecto, el
precio de referencia actual de la estrategia, que para una estrategia guiada por tickers es el último
precio observado. La señal es por defecto una orden a mercado; una estrategia puede convertirla en
una orden limitada a ese precio, fijar un número máximo de intentos y adjuntar indicadores de orden.
Los stops de protección declarados en la señal de entrada, fijos o dinámicos, los gestiona el motor y
salen a mercado salvo que se fije un precio de stop-limit.

No existe un parámetro de slippage separado. El enfoque práctico es incorporar el slippage esperado a
la tasa de comisión por lado: una comisión del 0,10 % y un slippage esperado del 0,05 % se convierten en
una tasa de comisión del 0,15 %. Como la tasa de comisión forma parte de la configuración del backtest y
no es una propiedad de la estrategia, una prueba de sensibilidad consiste en ejecutar el mismo conjunto
de datos preparado y la misma estrategia bajo dos o tres hipótesis de comisión y comparar los
resultados, o el mismo barrido bajo cada hipótesis.

La resolución de los datos importa tanto como la cifra de coste. Ejecutar sobre eventos de ticker, la
cadencia más fina disponible, significa que cada ejecución se evalúa a un precio que el mercado imprimió
realmente; una cadencia más gruesa oculta la trayectoria dentro de cada intervalo y debilita la
hipótesis de ejecución. Elige la cadencia según la frecuencia de decisión de la estrategia, y trata
cualquier resultado que cambie de forma sustancial entre cadencias como una advertencia de que su
ventaja vive en la microestructura.

## Conceptos relacionados

- [Backtesting](backtesting) — las hipótesis que viajan con cada resultado.
- [Datos históricos de mercado](historical-market-data) — cadencia, tickers frente a velas, y sobre
  qué puede apoyarse una hipótesis de ejecución.
- [Sobreajuste](overfitting) — por qué un barrido sin costes selecciona las configuraciones que más
  castigan los costes.
- Guías para desarrolladores: [Emisión de señales](/docs/developers/api/strategy_coding), [Barridos
  de parámetros](/docs/developers/api/backtest_sweep).
- Guía del producto: [Backtesting](/docs/app/backtesting).
