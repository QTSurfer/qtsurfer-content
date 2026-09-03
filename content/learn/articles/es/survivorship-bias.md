---
title: Sesgo de supervivencia
description: Aprende cómo el sesgo de supervivencia entra en un backtest a través del universo de instrumentos, el catálogo de datos y el conjunto de estrategias publicadas, y cómo construir un universo tal como era en su momento.
order: 10
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T20:33:24Z'
---

El **sesgo de supervivencia** es el error de estudiar solo lo que sobrevivió. Un backtest ejecutado
sobre los instrumentos que existen hoy, los conjuntos de datos que siguen disponibles o las
estrategias que merecieron escribirse ha excluido en silencio todo lo que fracasó por el camino. La
muestra parece completa y no lo es, y los resultados se inclinan hacia el éxito porque los fracasos se
retiraron antes de que empezara el experimento.

Es un problema de selección de datos, no un error de la estrategia, y sobrevive a cualquier cantidad
de cuidado en el código.

## Tres puertas de entrada

### El universo de instrumentos

Una estrategia probada «sobre los cincuenta pares con más volumen» casi siempre significa los
cincuenta con más volumen *hoy*. Algunos de los pares que estaban entre los cincuenta primeros hace
tres años han sido retirados desde entonces, han perdido su liquidez o se han hundido. Un universo
construido desde el presente contiene solo los tokens que conservaron valor, y una estrategia que
compra caídas sobre ese universo está comprando caídas de activos que, por construcción, se
recuperaron.

El efecto es más fuerte en los mercados cripto, donde las incorporaciones y retiradas son frecuentes y
la dispersión entre supervivientes y caídos es extrema.

### El catálogo de datos

Los datos históricos suelen conservarse para lo que todavía cotiza. Cuando un par deja de negociarse,
su histórico a menudo deja de recogerse, se archiva o desaparece del catálogo que explora quien
investiga. Incluso alguien cuidadoso que quiera los instrumentos fallidos puede no encontrar datos de
ellos.

### Las propias estrategias

Solo se comparten los backtests con éxito. Las publicaciones en foros, los artículos, los listados del
marketplace y las propias notas del trader describen las ideas que funcionaron; las docenas que no lo
hicieron se borran o se olvidan. Quien aprende de ese registro sobrestima con qué frecuencia funciona
una idea plausible. Es el mismo mecanismo que el [sobreajuste](overfitting), a nivel de la comunidad
investigadora en lugar de a nivel de la cuadrícula de parámetros.

## Un ejemplo concreto

Una estrategia de momento se prueba de enero de 2024 a junio de 2026 sobre los cincuenta mayores pares
spot listados en un exchange a junio de 2026. Doce de los pares que habrían cumplido el criterio en
enero de 2024 ya no están listados y quedan fuera de la prueba.

En el universo real de enero de 2024, la estrategia habría mantenido posiciones en algunos de esos
doce. Varios perdieron la mayor parte de su valor antes de ser retirados, y las reglas de salida de la
estrategia no estaban diseñadas para un token que deja de cotizar. El backtest sobre el universo
superviviente presenta una rentabilidad del 31 %; una reconstrucción que incluya los pares retirados,
con una salida forzada a su última cotización, presenta un 9 %. Ninguno de los dos números es
inventado. El primero, simplemente, describe una cartera que nadie podría haber elegido de antemano.

## Errores habituales

- **Construir el universo desde una clasificación actual.** Las clasificaciones por volumen,
  capitalización o estado de cotización deben tomarse a fecha de inicio del backtest, no a fecha de
  hoy.
- **Tratar el histórico ausente como «sin datos» y no como «instrumento muerto».** Un instrumento sin
  datos a partir de cierta fecha es información sobre lo que le ocurrió.
- **Probar las salidas solo sobre activos que se recuperaron.** Una regla de stop-loss parece
  innecesaria sobre un universo en el que todo volvió.
- **Aprender solo de resultados publicados.** La tasa base de ideas de estrategia que fracasan es
  invisible en cualquier colección de éxitos.
- **Confundir supervivencia con anticipación.** La anticipación usa *precios* futuros; la
  supervivencia usa la *composición* futura del universo. Ambas filtran el futuro, por rutas
  distintas.

## La supervivencia en QTSurfer

El catálogo de exchanges de QTSurfer lista cada instrumento con su precio y volumen actuales y, por
instrumento, las ventanas de cobertura disponibles para tickers y para klines. La cobertura es por
instrumento y por segmento de mercado, de modo que el registro de un par no se alarga ni se recorta
para igualarlo a los demás, y un instrumento que dejó de cotizar muestra una ventana que termina en
lugar de desaparecer del histórico. Trata el catálogo como estado vivo de la plataforma: lo que lista
hoy no es una promesa sobre lo que estaba listado al inicio de una ventana de backtest.

De ahí se siguen dos prácticas:

- Elige el universo a partir de las ventanas de cobertura del catálogo y del propio histórico del
  instrumento a fecha de inicio del backtest, no de la clasificación actual. Si la pregunta es «qué
  habría hecho esta estrategia en 2024», el universo es el de 2024.
- Cuando el histórico de un par no lo gestiona la plataforma, súbelo como dataset: un CSV con una
  columna `timestamp` y otra `close`, opcionalmente con apertura, máximo, mínimo y volumen, se ingiere
  con su cadencia y sus huecos descubiertos y puede prepararse y ejecutarse exactamente igual que un
  exchange gestionado. Así es como los doce pares retirados del ejemplo anterior vuelven a la prueba.

Los backtests en QTSurfer ejecutan un instrumento por sesión preparada, de modo que un estudio de
universo es un conjunto de ejecuciones, una por instrumento, sobre la misma revisión de estrategia.
Para este propósito es una ventaja: el resultado de cada instrumento es visible por sí mismo, y los que
habrían fracasado no se diluyen dentro de una cifra de cartera.

## Conceptos relacionados

- [Backtesting](backtesting) — las hipótesis que viajan con cada resultado.
- [Datos históricos de mercado](historical-market-data) — ventanas de cobertura, huecos y datasets.
- [Sesgo de anticipación](look-ahead-bias) — la otra ruta por la que el futuro se filtra en una
  prueba.
- [Sobreajuste](overfitting) — la supervivencia a nivel de estrategias y parámetros.
- Guías para desarrolladores: [Datos de mercado](/docs/developers/api/market_data),
  [Datasets](/docs/developers/api/datasets).

## Lecturas adicionales

- Brown, S. J., Goetzmann, W., Ibbotson, R. G. y Ross, S. A. (1992). *Survivorship Bias in
  Performance Studies*. Review of Financial Studies.
- Elton, E. J., Gruber, M. J. y Blake, C. R. (1996). *Survivor Bias and Mutual Fund Performance*.
  Review of Financial Studies.
