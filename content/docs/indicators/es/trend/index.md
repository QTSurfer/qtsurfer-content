---
title: "Tendencia"
description: "Indicadores de si el mercado tiene tendencia y hacia dónde: el índice direccional medio, el SuperTrend, la nube de Ichimoku y seis indicadores pro más."
order: 5
---

En los catálogos de QTSurfer, los indicadores de tendencia son `adx`, `superTrend`, `ichimoku`, `aroon`, `chandeKrollStop`, `chandelierExit`, `efficiencyRatio`, `parabolicSar` y `vortex`: dicen si el mercado tiene tendencia, con qué fuerza, y de qué lado está el precio. Todos son indicadores pro: vienen con los planes Pro y Elite, una estrategia los trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)), y leen barras completas, así que van en una estrategia `kline`; el ratio de eficiencia es la excepción y lee un solo precio.

- [ADX](/docs/indicators/trend/adx): lo fuerte que es la tendencia, vaya hacia donde vaya, con las dos líneas direccionales.
- [SuperTrend](/docs/indicators/trend/superTrend): una línea que sigue al precio a una distancia de un múltiplo del rango medio, y cambia de lado cuando el precio la cruza.
- [Nube de Ichimoku](/docs/indicators/trend/ichimoku): el precio frente a los puntos medios de sus propios máximos y mínimos de tres periodos.
- [Aroon](/docs/indicators/trend/aroon): cuánto hace que ocurrieron el máximo más alto y el mínimo más bajo, como dos líneas y su diferencia.
- [Vortex](/docs/indicators/trend/vortex): el movimiento al alza frente al movimiento a la baja, como dos líneas en torno a 1.
- [Ratio de eficiencia](/docs/indicators/trend/efficiencyRatio): el movimiento neto del precio frente a la suma de sus movimientos, de 0 a 1. Lee un solo precio.
- [SAR parabólico](/docs/indicators/trend/parabolicSar), [salida Chandelier](/docs/indicators/trend/chandelierExit) y [stop de Chande y Kroll](/docs/indicators/trend/chandeKrollStop): tres stops que siguen al precio y se invierten o se enganchan con la tendencia.

Los catálogos los tienen con sus formas: [indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators).
