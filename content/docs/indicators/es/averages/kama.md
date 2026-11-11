---
title: "Media móvil adaptativa de Kaufman (KAMA)"
description: "Cómo la media móvil adaptativa de Kaufman sigue al precio deprisa cuando se mueve en una dirección y despacio cuando zigzaguea, qué fijan sus tres periodos y cómo usarla en una estrategia de QTSurfer."
order: 1.7
---

La **media móvil adaptativa de Kaufman** (KAMA, por sus siglas en inglés), de Perry Kaufman, cambia lo rápido que sigue al precio: deprisa cuando el precio se mueve en una dirección, despacio cuando zigzaguea.

Pruébala en una serie. Cambia el periodo de eficiencia y los periodos rápido y lento; el rápido se mantiene por debajo del lento.

<div data-indicator-chart="kama"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
ER   = |precio − precio de hace N| / (|cambio₁| + … + |cambioₙ|)       el ratio de eficiencia, de 0 a 1
SC   = (ER × (rápida − lenta) + lenta)²       rápida = 2 / (periodo rápido + 1), lenta = 2 / (periodo lento + 1)
KAMA = KAMA anterior + SC × (precio − KAMA anterior)
```

`N` es el periodo de eficiencia, 10 por defecto; los periodos rápido y lento son 2 y 30. El ratio de eficiencia vale 1 cuando el precio se ha movido en línea recta y 0 cuando no ha ido a ninguna parte. Con los valores por defecto la media cierra `(2/3)² ≈ 44 %` de la distancia al precio en cada actualización sobre una recta, y `(2/31)² ≈ 0,4 %` sobre un zigzag. Los primeros `N` precios pasan sin cambios, y el motor empieza la fórmula, y da la media por lista, en el siguiente.

## Cómo leerla

- **Se adapta al tipo de movimiento.** En un movimiento recto se pega al precio, y en uno lateral casi se queda quieta.
- **Los tres periodos tienen tres tareas.** El periodo de eficiencia es hasta dónde mira atrás para juzgar la dirección, y los periodos rápido y lento son los límites de su suavizado.

## En una estrategia

```
setup:
  kama()
```

`kama()` registra `kama10_2_30`, con los tres periodos 10, 2 y 30. `kama(10, 2, 30)` los dice, y `kama("name", 10, 2, 30)` pone nombre a la línea. En Java, `.kama()` en el builder.

Los tres periodos son parámetros, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlos, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil exponencial](/docs/indicators/averages/ema): la media exponencial, con un suavizado que no se adapta.
- [Media móvil simple](/docs/indicators/averages/sma): la media simple.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
