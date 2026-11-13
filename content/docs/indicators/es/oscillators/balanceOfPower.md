---
title: "Balance de poder (BOP)"
description: "Cómo el balance de poder contrapone el movimiento de la apertura al cierre al rango de cada barra, de −1 a 1, sin suavizado, y cómo usarlo en una estrategia de QTSurfer."
order: 2.58
---

El **balance de poder** (BOP, por sus siglas en inglés), de Igor Livshin, contrapone el movimiento de cada barra de su apertura a su cierre a su rango, de −1 a 1: quién ganó la barra, los compradores o los vendedores.

Pruébalo en una serie. No tiene parámetros, y la línea se dibuja en su propio panel, de −1 a 1.

<div data-indicator-chart="balanceOfPower"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
BOP = (cierre − apertura) / (máximo − mínimo)
```

Una barra sin rango da 0. El motor da el valor de cada barra, sin suavizado; algunos gráficos lo promedian. El primer valor llega en la primera barra.

## Cómo leerlo

- **Lee 1 para una barra que abre en su mínimo y cierra en su máximo, −1 para la contraria**, y 0 para un doji o una barra sin rango.
- **Es nervioso, una barra cada vez.** En las series reales del gráfico va de −1,00 a 0,97, y es positivo en el 48 % de las barras.
- **Mira solo el cuerpo frente al rango**, no dónde está la barra frente a la anterior: una barra puede tener un BOP de 1 y cerrar por debajo del cierre anterior.

## En una estrategia

```
uses pro.balanceOfPower
setup:
  balanceOfPower()
```

`balanceOfPower()` registra `bop`. No tiene formas con parámetros. En Java la clase es `BalanceOfPowerRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.momentum.pro`, y un grupo la recibe con `indicators.add("bop", new BalanceOfPowerRTIndicator())`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee barras completas, así que va en una estrategia `kline`.

## Relacionado

- [Índice de vigor relativo](/docs/indicators/oscillators/relativeVigorIndex): el mismo cuerpo frente al rango, ponderado sobre cuatro barras y suavizado.
- [Flujo de dinero de Chaikin](/docs/indicators/volume/cmf): dónde está el cierre en el rango, ponderado por el volumen.
- [%R de Williams](/docs/indicators/oscillators/williamsR): dónde está el cierre en el rango de las últimas barras.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
