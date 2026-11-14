---
title: "Índice de volumen negativo (NVI)"
description: "Cómo el índice de volumen negativo se mueve solo en las barras donde el volumen bajó respecto a la anterior, según el cambio porcentual del cierre, empezando en 1000, y cómo usarlo en una estrategia de QTSurfer."
order: 6.46
---

El **índice de volumen negativo** (NVI, por sus siglas en inglés), de Paul Dysart y Norman Fosback, empieza en 1000 y se mueve solo en las barras donde el volumen bajó respecto a la anterior, según el cambio porcentual del cierre. La idea es que los informados operan en las barras tranquilas.

Pruébalo en una serie. No tiene parámetros, y la línea se dibuja en su propio panel, desde 1000.

<div data-indicator-chart="negativeVolumeIndex"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
NVI = NVI anterior + (cierre − cierre anterior) / cierre anterior × NVI anterior        si volumen < volumen anterior
NVI = NVI anterior                                                                       en otro caso
```

Empieza en 1000 en la primera barra. Un cierre anterior de 0 lo deja sin cambios. El volumen es el de las barras de la serie; las reales llevan el volumen de la bolsa.

## Cómo leerlo

- **Su nivel empieza en 1000 y significa poco**; lo que cuenta es su dirección. En las series reales del gráfico acaba en 807 en la diaria BTC/USDT, 1027 en la horaria y 975 en la de 15 minutos ETH/USDT.
- **No se mueve en las barras donde el volumen se mantuvo o subió.** En las series reales del gráfico cambia en del 51 % al 55 % de las barras.
- **Un precio que no se mueve, o barras de volumen creciente, lo dejan en 1000.**

## En una estrategia

```
uses pro.negativeVolumeIndex
setup:
  negativeVolumeIndex()
```

`negativeVolumeIndex()` registra `nvi`. No tiene formas con parámetros. En Java la clase es `NegativeVolumeIndexRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.volume.pro`, y un grupo la recibe con `indicators.add("nvi", new NegativeVolumeIndexRTIndicator())`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Tendencia precio-volumen](/docs/indicators/volume/pvt): el volumen ponderado por el cambio porcentual, en cada barra.
- [Volumen en balance](/docs/indicators/volume/obv): el total acumulado del volumen según el signo del cambio.
- [Tasa de cambio](/docs/indicators/oscillators/roc): el cambio porcentual del precio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
