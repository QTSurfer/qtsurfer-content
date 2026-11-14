---
title: "Línea de acumulación/distribución (ADL)"
description: "Cómo la línea de acumulación/distribución lleva un total acumulado del volumen de cada barra ponderado por dónde está el cierre en su rango, por qué su nivel no significa nada y su dirección sí, y cómo usarla en una estrategia de QTSurfer."
order: 6.41
lastUpdated: '2026-11-14T12:16:29Z'
---

La **línea de acumulación/distribución** (ADL, por sus siglas en inglés), de Marc Chaikin, lleva un total acumulado del volumen de cada barra ponderado por dónde está el cierre en su rango: todo cuenta como compra en el máximo, todo como venta en el mínimo.

Pruébala en una serie. No tiene parámetros, y la línea se dibuja en su propio panel, en unidades de volumen.

<div data-indicator-chart="adl"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
multiplicador = ((cierre − mínimo) − (máximo − cierre)) / (máximo − mínimo)        −1 en el mínimo, 1 en el máximo
ADL           = ADL anterior + multiplicador × volumen
```

Una barra sin rango tiene un multiplicador de 0. El primer valor llega en la primera barra. El volumen es el de las barras de la serie; las reales llevan el volumen de la bolsa.

## Cómo leerlo

- **Su nivel no significa nada.** Depende de dónde empieza la serie. Lo que cuenta es su dirección y si sigue al precio: en las series reales del gráfico acaba en 6018 en la diaria BTC/USDT, −1130 en la horaria y −38 356 en la de 15 minutos ETH/USDT.
- **En barras que cierran en su máximo suma todo el volumen de cada barra**: 4000 tras 80 barras de volumen 50; en su mínimo lo resta; en barras sin rango se queda en 0.
- **Sube en del 44 % al 52 % de las barras** de las series reales del gráfico.

## En una estrategia

```
uses pro.adl
setup:
  adl()
```

`adl()` registra `adl`. No tiene formas con parámetros. En Java la clase es `AdlRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.volume.pro`, y un grupo la recibe con `indicators.add("adl", new AdlRTIndicator())`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Oscilador de Chaikin](/docs/indicators/volume/chaikinOscillator): el impulso de esta línea: dos medias de ella.
- [Flujo de dinero de Chaikin](/docs/indicators/volume/cmf): el mismo multiplicador sobre una ventana, como ratio.
- [Volumen en balance](/docs/indicators/volume/obv): el total acumulado del volumen según el signo del cambio.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
