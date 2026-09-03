---
title: Cruce de EMA
description: Aprende cómo funciona una estrategia de cruce de medias móviles exponenciales, por qué se retrasa y genera señales falsas, qué parámetros importan y cómo implementarla y barrerla en QTSurfer.
order: 11
kind: concept
author: QTSurfer
datePublished: "2026-09-03"
lastUpdated: '2026-09-03T20:33:24Z'
---

Una estrategia de **cruce de EMA** mantiene una posición cuando una media móvil exponencial rápida está
por encima de una lenta y sale, o se da la vuelta, cuando cae por debajo. Es la regla de seguimiento
de tendencia más simple que puede escribirse por completo, y por eso es la primera estrategia
estándar: dos parámetros, una señal, ninguna discrecionalidad y todos los modos de fallo del
seguimiento de tendencia visibles en miniatura.

No es una estrategia que nadie espere que sea rentable tal cual. Es el punto de referencia contra el
que se miden filtros, salidas y reglas de tamaño.

## La media móvil exponencial

Una media móvil simple pondera por igual los últimos `N` precios. Una media móvil exponencial pondera
más los precios recientes, con pesos que decaen geométricamente:

```text
α       = 2 / (N + 1)
EMA_t   = α · price_t + (1 − α) · EMA_(t−1)
```

`N` es el periodo nominal. Una EMA con `N = 20` da al último precio un peso de aproximadamente un
9,5 % y nunca olvida por completo ningún precio anterior, lo que la hace más suave que una SMA de 20
periodos con la misma capacidad de respuesta, y más barata de calcular: cada actualización solo
necesita el valor anterior.

La EMA se retrasa respecto al precio por construcción. Suavizar es eliminar información reciente, y
cuanto más lenta es la media, más tarde reacciona.

## La regla del cruce

```text
fast = EMA(price, N_fast)
slow = EMA(price, N_slow)          with N_fast < N_slow

enter long   when fast crosses above slow
exit         when fast crosses below slow
```

Pares habituales son `9/21`, `12/26`, `20/50` y `50/200`, este último conocido como cruce dorado y
cruce de la muerte en gráficos diarios. Los números son convenciones, no hallazgos.

### Comportamiento en tendencias y en rangos

En una tendencia sostenida la media rápida se mantiene a un lado de la lenta, la posición se conserva
y la estrategia captura la mayor parte del movimiento menos el retardo en la entrada y en la salida.
En un mercado lateral las medias se cruzan repetidamente una alrededor de la otra, y cada cruce es un
viaje de ida y vuelta que paga costes por un movimiento pequeño o negativo. Es la **señal falsa**
(*whipsaw*), y es el coste dominante de toda estrategia de cruce.

La elección de parámetros intercambia una cosa por la otra: periodos más cortos entran antes en las
tendencias y generan más señales falsas; periodos más largos generan menos señales falsas y devuelven
más de cada tendencia en los giros.

## Ejemplo resuelto

Precios a lo largo de diez actualizaciones, `N_fast = 3` y `N_slow = 5`, ambas medias inicializadas
con el primer precio:

```text
t   price   fast(3)   slow(5)   state
1   100.0   100.00    100.00    —
2   101.0   100.50    100.33    fast > slow
3   103.0   101.75    101.22    long
4   102.0   101.88    101.48    long
5   100.0   100.94    100.99    fast < slow → exit
6    99.0    99.97    100.33    flat
7   101.0   100.48    100.55    flat
8   104.0   102.24    101.70    fast > slow → long
9   105.0   103.62    102.80    long
10  104.0   103.81    103.20    long
```

La primera entrada en `t = 2` atrapa una pequeña subida, sale en `t = 5` tras el retroceso con una
pérdida una vez incluidos los costes, y vuelve a entrar en `t = 8` en el movimiento mayor. Ese es todo
el carácter de la regla en diez filas: paga el arranque en falso para estar presente en el de verdad.

## Hacerla utilizable

- **Filtro de tendencia.** Tomar largos solo cuando el precio, o la media lenta, está por encima de
  una referencia mucho más lenta. Elimina muchas de las señales falsas en rango a cambio de entradas
  tardías.
- **Separación mínima.** Exigir que las medias estén separadas por un umbral, en porcentaje o en
  unidades de volatilidad, antes de actuar. Un cruce que apenas se produce es ruido.
- **Confirmación.** Actuar sobre el cruce solo si se mantiene tras una ventana corta, en lugar de en
  el primer tick que cruza.
- **Puerta de volatilidad.** Operar solo cuando una medida de volatilidad está dentro de un rango;
  tanto los mercados muertos como los violentos son malos para la regla.
- **Salidas separadas.** Un stop dinámico o una salida por tiempo suelen superar a esperar el cruce
  contrario, que devuelve gran parte de cada tendencia.

Cada añadido es un parámetro, y cada parámetro es una forma de ajustarse a la muestra. Añade uno cada
vez y comprueba que mejora los resultados fuera de muestra, no solo en la ventana con la que se ajustó.

## Errores habituales

- **Optimizar los periodos con precisión.** La respuesta a `N_fast` y `N_slow` es suave; un barrido
  con pasos de `1` mide sobre todo ruido. Usa pasos gruesos y busca una meseta.
- **Ignorar los costes.** El cruce opera a menudo en rangos, y un backtest sin costes oculta por
  completo el precio de las señales falsas.
- **Probar sobre una única ventana con tendencia.** La regla queda excelente en cualquier tendencia
  fuerte. La prueba es cómo se comporta a través de regímenes.
- **Barrer combinaciones en las que el periodo rápido no es más corto.** Una cuadrícula sobre ambos
  periodos incluye puntos con `N_fast ≥ N_slow`, que son otra estrategia o ninguna. Protégete de ellos
  en el código o descártalos de los resultados.
- **Confundir el cruce contrario con una buena salida.** Es la salida que no requiere parámetros
  extra, no la que conserva más beneficio.

## El cruce de EMA en QTSurfer

El cruce es la estrategia de referencia en la documentación de QTSurfer, y allí se muestran sus dos
implementaciones naturales. Una estrategia guiada por tickers configura las dos medias una sola vez:

```java
@Override
protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
    indicators.addPrice().ema("fast", 9).ema("slow", 21);
}
```

Los indicadores son incrementales: cada actualización cuesta lo mismo sea cual sea el periodo, y los
valores se leen por nombre. El cruce puede detectarse en el bucle de actualización por tick,
comparando la relación actual con la anterior, o en un **window listener** que se ejecuta con una
cadencia fija con un `CrossDetector`, que es el patrón que evita reaccionar a cada parpadeo dentro del
segundo.

Para que los periodos puedan barrerse, decláralos como propiedades de la estrategia:

```java
@StrategyProperty(name = "ema.fast", description = "Fast EMA period", defaultValue = "9")
private int fastPeriod = 9;

@StrategyProperty(name = "ema.slow", description = "Slow EMA period", defaultValue = "21")
private int slowPeriod = 21;
```

Las propiedades se inyectan antes de configurar los indicadores, y compilar la estrategia las
devuelve como `declaredProperties`, de modo que un barrido puede escribirse contra claves conocidas:

```json
"params": {
  "ema.fast": {"from": 5,  "to": 20,  "step": 5},
  "ema.slow": {"from": 20, "to": 100, "step": 20}
}
```

Lee el resultado a través de la vista de sensibilidad antes que en la clasificación. Un cruce que solo
funciona con un par exacto de periodos ha encontrado una coincidencia; el resultado útil es una región
de la cuadrícula donde la puntuación de meseta se mantiene, y una ejecución walk-forward para ver si
la región ganadora se queda quieta de pliegue en pliegue.

Los ejemplos completos, incluidas las variantes con bucle de actualización y con window listener,
están en la guía para desarrolladores.

## Conceptos relacionados

- [Barrido de parámetros](parameter-sweep) — cómo explorar los dos periodos sin seleccionar ruido.
- [Slippage](slippage) — el coste que la señal falsa paga en cada arranque en falso.
- [Sobreajuste](overfitting) — por qué cada filtro añadido es también una forma de ajustarse a la
  muestra.
- Guías para desarrolladores: [Ejemplos de estrategias](/docs/developers/strategy-examples),
  [Indicadores Java](/docs/developers/java-indicators), [Patrones de
  estrategia](/docs/developers/strategy-patterns).
- Guía del producto: [Estrategias](/docs/app/strategies).
