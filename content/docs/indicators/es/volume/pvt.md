---
title: "Tendencia precio-volumen (PVT)"
description: "Cómo la tendencia precio-volumen lleva un total acumulado del volumen de cada barra ponderado por el cambio porcentual del cierre, y cómo usarla en una estrategia de QTSurfer."
order: 6.47
---

La **tendencia precio-volumen** (PVT, por sus siglas en inglés) lleva un total acumulado del volumen de cada barra ponderado por el cambio porcentual del cierre. Es el [volumen en balance](/docs/indicators/volume/obv) contando el tamaño del movimiento, no solo su signo.

Pruébala en una serie. No tiene parámetros, y la línea se dibuja en su propio panel, en unidades de volumen.

<div data-indicator-chart="pvt"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
PVT = PVT anterior + (cierre − cierre anterior) / cierre anterior × volumen
```

Empieza en 0 en la primera barra. Un cierre anterior de 0 lo deja sin cambios. El volumen es el de las barras de la serie; las reales llevan el volumen de la bolsa.

## Cómo leerlo

- **Su nivel no significa nada.** Depende de dónde empieza la serie; lo que cuenta es su dirección y si sigue al precio. En las series reales del gráfico acaba en −6470 en la diaria BTC/USDT, −214 en la horaria y −4327 en la de 15 minutos ETH/USDT, porque el precio acabó más bajo.
- **Un movimiento pequeño cuenta poco y uno grande mucho**, donde el volumen en balance cuenta todo el volumen en los dos casos.
- **Un precio que no se mueve la deja en 0.**

## En una estrategia

```
uses pro.pvt
setup:
  pvt()
```

`pvt()` registra `pvt`. No tiene formas con parámetros. En Java la clase es `PvtRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.volume.pro`, y un grupo la recibe con `indicators.add("pvt", new PvtRTIndicator())`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Volumen en balance](/docs/indicators/volume/obv): el mismo total, contando todo el volumen según el signo del cambio.
- [Índice de volumen negativo](/docs/indicators/volume/negativeVolumeIndex): el cambio porcentual solo en las barras donde el volumen bajó.
- [Tasa de cambio](/docs/indicators/oscillators/roc): el cambio porcentual del precio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
