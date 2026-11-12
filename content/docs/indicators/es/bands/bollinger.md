---
title: Bandas de Bollinger
description: "Cómo las bandas de Bollinger envuelven el precio en una banda que se ensancha y se estrecha con su volatilidad, qué leen de ella el %B y la anchura, y cómo usarlas en una estrategia de QTSurfer."
order: 3.1
lastUpdated: '2026-11-12T00:02:30Z'
---

Las **bandas de Bollinger** dibujan una banda alrededor de una media móvil del precio. La banda es un número de
desviaciones típicas del precio a cada lado de la media, así que se ensancha cuando el precio es volátil y se estrecha
cuando está tranquilo. Las ideó John Bollinger.

Pruébalo en una serie. Cambia los periodos y el multiplicador. El panel bajo el precio muestra el %B, dónde se sitúa el
precio dentro de la banda: 0 en la banda inferior y 1 en la superior. Las flechas marcan dónde el precio vuelve a entrar
en la banda después de haber estado fuera.

<div data-indicator-demo="bollinger"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para
saber cuánto gana. Las líneas las calculan en tu navegador los propios indicadores del motor, así que son las líneas que
lee una estrategia.

## Qué calcula

```text
media    = SMA(N)                      20 por defecto
superior = media + k × s               k = 2 por defecto
inferior = media − k × s
%B       = (precio − inferior) / (superior − inferior)
anchura  = 100 × (superior − inferior) / media
```

`s` es la desviación típica de los últimos `N` precios. El motor divide por `N − 1`, la desviación de una muestra, y no
por `N`. Eso hace que sus bandas sean `√(N / (N − 1))` más anchas que las de una herramienta que divide por `N`: cerca
de un 2,6 % más anchas con 20 periodos. Tenlo presente cuando compares el motor con otra herramienta.

El %B vale 0 en la banda inferior, 0,5 en la media y 1 en la banda superior, y es menor que 0 o mayor que 1 cuando el
precio está fuera de la banda. La anchura es un porcentaje de la línea media: cuánto mide de ancha la banda respecto al
precio, que es lo que permite compararla en el tiempo y entre instrumentos.

## Cómo leerlas

- **Las bandas no son límites.** Con 20 periodos y `k = 2`, alrededor de uno de cada diez cierres de las series reales
  del gráfico queda fuera de las bandas, más del 5 por ciento que dejaría fuera una distribución normal a dos
  desviaciones típicas. El multiplicador decide con qué frecuencia: con `k = 1` queda fuera cerca de la mitad de los
  cierres y con `k = 3` cerca de uno de cada cien.
- **En una tendencia el precio cabalga una banda.** Los cierres pueden quedarse por encima de la banda superior, o por
  debajo de la inferior, mucho tiempo. En la serie ticker con tendencia del gráfico, los cierres por encima de la banda
  superior superan muchas veces a los que quedan por debajo de la inferior.
- **Las flechas marcan la vuelta al interior.** Muestran al precio volviendo a entrar en la banda después de haber estado
  fuera, la lectura de un mercado que regresa a su media. Falla en una tendencia, donde el precio cabalga la banda y no
  regresa.
- **La anchura y la compresión.** Una banda estrecha dice que el mercado ha estado tranquilo. No dice hacia dónde irá el
  precio cuando deje de estarlo. Esta es la anchura sola:

<div data-indicator-chart="bollingerBandwidth"></div>

## En una estrategia

```
setup:
  bollinger(20, 2)
  bollingerPercentB(20, 2)
  bollingerBandwidth("blgr20_2")
```

Estas tres líneas de un fichero QTScript registran `blgr20_2`, `blgr20_2Upper` y `blgr20_2Lower` (la banda), `pctB20_2`
(el %B) y `blgr20_2BW` (la anchura). En Java, `.bollinger("bb", 20, 2.0)` registra `bb`, `bbUpper` y `bbLower`, y
`.bollingerBandwidth("bb")` registra la anchura de esa banda.

Una ventana sobre el %B actúa sobre la vuelta al interior de la banda:

```
strategy "Bollinger re-entry"

setup:
  bollingerPercentB(20, 2) window m1 {
    if (prev < 0 && actual >= 0) emitBuy(price);
    if (prev > 1 && actual <= 1) emitSell(price);
  }
```

`actual` es el %B cuando se cierra la ventana y `prev` su valor cuando se cerró la anterior, así que la primera condición
es el precio volviendo por encima de la banda inferior y la segunda volviendo por debajo de la superior. Las flechas del
gráfico aplican la misma regla en cada barra de la muestra. Ilustra la sintaxis; no es una recomendación.

Los periodos y el multiplicador son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede
explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene
fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [%B de Bollinger](/docs/indicators/bands/bollingerPercentB) y [anchura](/docs/indicators/bands/bollingerBandwidth): las dos
  medidas que se toman de la banda, cada una con su página.
- [Desviación típica](/docs/indicators/volatility/stdDev): con lo que se construye la banda.
- [RSI](/docs/indicators/oscillators/rsi) y [MACD](/docs/indicators/oscillators/macd): los osciladores, para leerlos junto
  a las bandas.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators):
  todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
