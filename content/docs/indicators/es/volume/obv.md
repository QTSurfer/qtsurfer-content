---
title: "Volumen en balance (OBV)"
description: "Cómo el volumen en balance lleva un total acumulado del volumen, sumado cuando el cierre sube y restado cuando baja, por qué su nivel no significa nada y su dirección sí, y cómo usarlo en una estrategia de QTSurfer."
order: 6.1
---

El **volumen en balance** (OBV, por sus siglas en inglés), de Joseph Granville, es un total acumulado del volumen: suma el volumen de una barra cuando el cierre está por encima del cierre anterior, lo resta cuando está por debajo, y lo deja como estaba cuando son iguales.

Pruébalo en una serie. No tiene parámetros, y la línea se dibuja en su propio panel, en unidades de volumen.

<div data-indicator-chart="obv"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
OBV = OBV anterior + volumen        si cierre > cierre anterior
OBV = OBV anterior − volumen        si cierre < cierre anterior
OBV = OBV anterior                  si cierre = cierre anterior
```

La primera barra no tiene cierre anterior y el OBV empieza en 0 ahí, así que el gráfico dibuja desde la primera barra. El motor necesita el cierre y el volumen de cada barra.

## Cómo leerlo

- **Su nivel no significa nada.** Depende de dónde empieza la serie, en la primera barra. Lo que cuenta es su dirección y si sigue al precio.
- **En una subida recta suma el volumen de cada barra**, y en una caída recta lo resta; en un precio que no se mueve se queda en 0.
- **Cuenta todo el volumen de una barra como compra o como venta**, según dónde esté el cierre respecto al cierre anterior, sea cual sea el tamaño del movimiento: un cierre un céntimo por encima y un cierre un diez por ciento por encima suman lo mismo.

## En una estrategia

```
uses pro.obv
setup:
  obv()
```

`obv()` registra `obv`. En Java, `Pro.on(indicators).obv()`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Precio medio ponderado por volumen](/docs/indicators/volume/vwap): el otro indicador de volumen que no tiene parámetros.
- [Índice de flujo de dinero](/docs/indicators/volume/mfi): un RSI ponderado por volumen, entre 0 y 100.
- [Flujo de dinero de Chaikin](/docs/indicators/volume/cmf): cómo se reparte el volumen entre compra y venta, según dónde cierran las barras.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
