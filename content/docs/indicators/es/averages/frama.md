---
title: "Media móvil adaptativa fractal (FRAMA)"
description: "Cómo la media móvil adaptativa fractal fija su velocidad con la dimensión fractal de los últimos precios, corriendo en una recta y casi parándose en un rango, y cómo usarla en una estrategia de QTSurfer."
order: 1.73
---

La **media móvil adaptativa fractal** (FRAMA, por sus siglas en inglés), de John Ehlers, es una media exponencial cuya velocidad sigue la dimensión fractal de los últimos precios: corre a toda velocidad cuando el precio se mueve en línea recta y casi se para cuando divaga.

Pruébala en una serie y cambia el periodo.

<div data-indicator-chart="frama"></div>

Las series son muestras, sintéticas y reales de criptomonedas. Sirven para ver cómo se comporta el indicador, no para saber cuánto gana. La línea la calcula tu navegador con la propia clase del indicador del motor, así que es la línea que lee una estrategia.

## Qué calcula

```text
N1 = (máximo − mínimo de la mitad más antigua de los últimos N precios) / (N / 2)
N2 = (máximo − mínimo de la mitad más reciente) / (N / 2)
N3 = (máximo − mínimo de los N) / N
D  = (ln(N1 + N2) − ln(N3)) / ln 2        cerca de 1 en una recta, hasta 2 en ruido
α  = exp(−4,6 × (D − 1))                  acotada entre 0,01 y 1
FRAMA = α × precio + (1 − α) × FRAMA anterior
```

El motor lee un solo precio, no los máximos y mínimos de cada barra, y un periodo impar se toma como el par siguiente: `frama(21)` calcula como `frama(22)`. Mientras la ventana se llena, la línea es el propio precio; se da por lista en la actualización `N`, y el gráfico dibuja desde ahí. Una ventana sin rango da `D = 1`, y por tanto `α = 1`.

## Cómo leerla

- **En una recta es el precio.** `α` va a 1 y la línea lee el precio exacto, sin ningún retraso; un precio que no se mueve da lo mismo.
- **En un rango casi se para.** En las series reales del gráfico la `α` mediana está entre 0,14 y 0,19, `α` es menor que 0,1 en del 31 % al 42 % de las barras y vale 1 en aproximadamente una de cada diez, así que la línea se pega al precio cuando corre y se aplana cuando divaga.
- **Es la más cercana al precio de las medias de esta guía**, en las tres series reales del gráfico, con sus periodos por defecto. En la serie diaria BTC/USDT del gráfico, con periodo 20 su distancia media al cierre es el 1,7 % del precio, frente al 3,8 % de la EMA, y está entre las más nerviosas: su cambio medio de una barra a otra es el 0,70 % frente al 0,40 %.
- **Nunca rebasa.** Está siempre entre la línea anterior y el precio, así que un salto se sigue sin rebasamiento.

## En una estrategia

```
uses pro.frama
setup:
  frama(20)
```

`frama(20)` registra `frama20`; `frama(21)` registra `frama21` pero calcula con 22, porque el id conserva el número dado. En Java la clase es `FramaRTIndicator`, en `com.wualabs.qtsurfer.engine.indicators.averages.pro`, y un grupo la recibe con `indicators.add("frama20", new FramaRTIndicator(20))`.

Este es un indicador pro: viene con los planes Pro y Elite, y una estrategia lo trae con una línea `uses` (consulta [la guía de QTScript](/docs/strategies/qtscript#the-pro-indicators-uses)). Lee un solo precio, el último de un ticker o el cierre de una vela, así que sirve en los dos tipos de estrategia.

El periodo es un parámetro, así que un [barrido de parámetros](/learn/articles/parameter-sweep) puede explorarlo, y el [análisis walk-forward](/learn/articles/walk-forward-analysis) te dice si lo que encontró se sostiene fuera de la muestra, que es la defensa frente al [sobreajuste](/learn/articles/overfitting).

## Relacionado

- [Media móvil adaptativa de Kaufman](/docs/indicators/averages/kama): la media adaptativa de Kaufman, que también adapta su velocidad, según lo recto que se mueve el precio.
- [Media móvil exponencial](/docs/indicators/averages/ema): la media exponencial, con una velocidad que no cambia nunca.
- [ATR](/docs/indicators/volatility/atr): otra forma de distinguir un rango de un movimiento.
- [Indicadores de QTScript](/docs/strategies/qtscript/indicators) e [indicadores de Java](/docs/strategies/java/indicators): todos los indicadores que puede llamar una estrategia, con sus formas y los nombres que registran.
