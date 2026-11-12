---
title: "Ratio de Calmar"
description: "Cómo el ratio de Calmar divide el rendimiento anualizado de las últimas barras por su mayor caída, por qué su factor por defecto solo sirve para barras diarias, y cómo usarlo en una estrategia de QTSurfer."
order: 8.04
---

El **ratio de Calmar**, de Terry Young, divide el rendimiento anualizado de las últimas `N` barras por su mayor caída: cuánto rendimiento por cuán profunda caída.

Pruébalo en una serie y cambia el periodo.

<div data-indicator-chart="calmarRatio"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
r      = ln(precio / precio anterior)                          el rendimiento de cada barra
cum_k  = Σ r hasta el k-ésimo de los últimos N rendimientos     el rendimiento logarítmico acumulado, desde 0 al inicio de la ventana
DD     = mayor (máximo de cum hasta ahora − cum_k)              la mayor caída de la ventana
Calmar = media(r) × 252 / DD                                    252 por defecto
```

La caída se mide sobre el rendimiento logarítmico acumulado, así que está en unidades logarítmicas, el logaritmo del máximo sobre el valor, y no es un porcentaje del máximo. El 252 es el factor de anualización para barras diarias; multiplica el rendimiento medio y es un parámetro (las formas de QTScript con un número extra lo pasan, consulta el catálogo). Una ventana sin caída lee 0. Necesita al menos 2 periodos. `N` rendimientos necesitan `N + 1` precios, así que el primer valor llega en la actualización `N + 1`, y la línea lee 0 antes.

## Cómo leerlo

- **El factor por defecto es para barras diarias.** En las series horaria y de 15 minutos del gráfico multiplica un rendimiento mucho menor por el mismo 252, así que las cifras no son anuales. Da el factor de la serie, el número de sus barras en un año.
- **En una ventana que solo cae lee `−252 / N`**: −12,6 con periodo 20, que es el valor más bajo en las tres series reales del gráfico.
- **Puede ser enorme en una ventana corta**, porque la caída puede ser minúscula: en las series reales del gráfico, con periodo 20, llega a 86,6 en la diaria BTC/USDT, 108,7 en la horaria y 110,3 en la de 15 minutos ETH/USDT.
- **Una ventana sin caída lee 0**, así que un precio que sube un 1 % cada barra lee 0, y también uno que no se mueve. Tiene el signo del rendimiento medio.

## En una estrategia

```
uses pro.calmarRatio
setup:
  calmarRatio(20)
```

`calmarRatio(20)` registra `calmar20`. En Java la clase es `CalmarRatioRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.statistics.pro.ratios`, y un grupo la recibe con `indicators.add("calmar20", new CalmarRatioRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Caída máxima](/docs/indicators/risk/maxDrawdown): la mayor caída desde el inicio, como fracción del máximo.
- [Ratio de Sharpe](/docs/indicators/risk/sharpeRatio): rendimiento por unidad de dispersión, por barra.
- [Índice de úlcera](/docs/indicators/risk/ulcerIndex): la profundidad y la duración de las caídas de la ventana.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
