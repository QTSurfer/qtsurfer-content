---
title: Arquitectura del motor
description: Cómo el motor de QTSurfer convierte datos de mercado en decisiones y resultados de estrategia — fuentes de datos, indicadores incrementales, window listeners, señales, pipelines de ejecución, propiedades y compilación.
order: 0.5
lastUpdated: '2026-09-05T10:47:57Z'
---

Toda estrategia de QTSurfer se ejecuta dentro del mismo motor, tanto si se está haciendo backtest
contra datos históricos como si la impulsa un flujo en vivo. Esta página describe las partes de
ese motor con las que interactúa quien escribe una estrategia, y el orden en que actúan sobre cada
evento de mercado. La referencia a nivel de clase es la [documentación de la API
Java](/docs/developers/java-api); las guías prácticas empiezan por [Estrategias en
Java](/docs/developers/java-strategies).

## Un evento cada vez

El motor está dirigido por eventos. Llega un evento de mercado, se actualizan los indicadores de
la estrategia para ese instrumento, se ejecuta la lógica de la estrategia, y las señales que emite
se entregan a un pipeline de ejecución. En un backtest los eventos vienen de una sesión histórica
preparada, en orden cronológico; en vivo, vienen de un flujo del exchange. El código de la
estrategia es el mismo en ambos casos, y nunca ve un evento antes de su marca de tiempo.

```text
market event (Ticker · Kline · FundingRate)
  → indicator group for that instrument updates (incremental)
  → window listeners fire when their window elapses
  → strategy logic reads indicators and state, emits signals
  → execution pipeline turns a Buy/Sell signal into an order
  → fills update balances and the yield metrics
```

## Fuentes de datos y clases base

Una estrategia extiende una clase base, elegida según los datos que consume. Las tres clases base
de una sola fuente comparten el mismo modelo — constructor de indicadores, window listeners,
`StateStore`, emisión de señales — y solo difieren en el payload que recibe su método
`update(...)`:

| Clase base | Evento | Notas |
|---|---|---|
| `AbstractTickerStrategy` | `Ticker` | La fuente más habitual: último precio, volumen, cotizaciones del mejor nivel del libro. |
| `AbstractKlineStrategy` | `Kline` | Velas del intervalo que declara la estrategia. Solo OHLCV. |
| `AbstractFundingRateStrategy` | `FundingRate` | Una actualización por cada cambio de la tasa de financiación en mercados perpetuos. |

Una única instancia de estrategia ve todos los instrumentos a los que está suscrita, cada uno con
su propio grupo de indicadores y estado, así que la lógica entre instrumentos lee los indicadores
de otros instrumentos en lugar de ejecutar una estrategia separada por instrumento.

## Indicadores

Los indicadores son **incrementales**: cada uno conserva el estado que necesita y se actualiza en
tiempo constante por evento, sea cual sea su ventana de cálculo. Una media de 200 periodos cuesta
lo mismo por tick que una de 10. Esto es lo que hace viables los backtests a nivel de tick sobre
ventanas largas, y también por qué los valores de un indicador solo tienen sentido una vez que ha
visto suficientes eventos como para estar listo — todo indicador informa de su estado de
calentamiento.

Los indicadores se componen por decoración. Cualquier indicador puede ser la entrada de otro, así
que un oscilador suavizado es una media móvil cuya entrada es el oscilador, y un valor normalizado
es una transformación cuya entrada es el valor crudo. La estrategia declara sus indicadores una
vez, por nombre, en un grupo por instrumento; el motor crea un grupo por instrumento y la
estrategia recupera los valores con los mismos nombres.

```java
@Override
protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
    indicators
        .addPrice()
        .ema("fast", 20)
        .ema("slow", 50)
        .window("fast", WindowTime.s1, new CrossListener(indicators));
}
```

El catálogo — medias, osciladores, medidas de distancia y volatilidad, operadores aritméticos y
condicionales, estadística — se describe en [Indicadores en
Java](/docs/developers/java-indicators).

## Window listeners y estado

Reaccionar a cada tick rara vez es lo que quiere una estrategia. Un **window listener** se
engancha a un indicador con una ventana de tiempo; se dispara una vez por ventana con el valor
anterior y el actual de ese indicador, lo que da a la estrategia una cadencia fija sobre la que
razonar y filtra el parpadeo dentro de la ventana. El listener tiene acceso a todo el grupo de
indicadores y al `StateStore` del instrumento.

El `StateStore` es un almacén clave-valor por instrumento con contadores tipados, acumuladores y
flags. Es cómo una estrategia recuerda si está en posición, cuántas entradas ha escalado, o qué
régimen observó por última vez, sin mantener campos mutables que se compartirían entre
instrumentos. [Patrones de estrategia](/docs/developers/strategy-patterns) muestra los usos
habituales.

## Señales

Una estrategia nunca coloca una orden directamente. Emite **señales**:

- `BuySignal` y `SellSignal` expresan una operación con su configuración de orden: a mercado por
  defecto, opcionalmente límite al precio de la señal, un número máximo de intentos, indicadores
  de orden, y un stop de protección — fijo o dinámico — que el motor arma tras ejecutarse la
  entrada.
- `InfoStrategySignal` registra valores de indicadores, diagnósticos y marcadores de gráfico.
  Nunca causa una operación, y es lo que hace explicable una decisión después de tomarla.

Las señales fluyen por el flujo de eventos del motor hasta un ejecutor que las dirige al pipeline
propietario de la posición de ese instrumento. Los detalles de cada tipo de señal y sus opciones
están en [Emisión de señales](/docs/developers/api/strategy_coding).

## Pipelines de ejecución

Un pipeline es una pequeña máquina de estados que posee una estructura de posición para un
instrumento y decide qué significa una señal dado el estado actual:

| Pipeline | Estructura de posición |
|---|---|
| Largo de entrada única | Compra una vez, vende una vez. Una compra estando en largo se ignora; una venta estando plano se ignora. |
| Corto de entrada única | Vende primero, compra para cerrar. |
| Largo escalonado | Varias compras acumulan una posición; una venta cierra parte o toda ella. |

Cada pipeline tiene una variante de backtest que simula ejecuciones contra el flujo histórico en
lugar de enviar órdenes a un exchange. Los stops de protección declarados en la señal de entrada
los gestiona el pipeline tras la ejecución. Cuando un ciclo de operación se completa, el pipeline
informa del resultado realizado a las métricas de rendimiento de la estrategia, que es de donde
salen el Sharpe, el Sortino, el CAGR, el drawdown y la curva de equity — consulta la [referencia
de métricas](/docs/developers/metrics-reference).

## Propiedades y parámetros

Los parámetros de estrategia se declaran como campos anotados:

```java
@StrategyProperty(name = "rsi.period", description = "RSI period", defaultValue = "14")
private int rsiPeriod;
```

El motor registra los campos anotados cuando se construye la estrategia y aplica el valor por
defecto declarado la primera vez que se usa la estrategia — después de que se ejecuten los
inicializadores de campo propios de la clase final, para que no puedan sobrescribirlo en
silencio. Un valor se inyecta directamente en el campo, o a través de un setter de JavaBean
cuando existe, que es donde corresponde la validación o el acotado. El campo no puede ser
`static`, ya que los ensayos de un barrido se ejecutan en paralelo y lo compartirían, ni `final`.

Las propiedades son lo que un backtest sobrescribe y sobre lo que itera un barrido. Compilar una
estrategia devuelve sus propiedades declaradas, con sus valores por defecto y los rangos
sugeridos, de modo que quien la llama puede construir un barrido contra claves conocidas —
consulta [Compilar una estrategia](/docs/developers/api/strategy).

## Compilación y validación

Las estrategias se envían como código fuente Java y se compilan en la plataforma, y los
diagnósticos del compilador vuelven literalmente cuando falla la compilación. La identidad de una
estrategia compilada se deriva de lo que significa el código, así que reformatearlo no crea una
estrategia nueva.

La validación va un paso más allá que la compilación: el motor instancia la clase y la hace pasar
por una serie sintética acotada, de modo que fallos de cableado como un listener que nunca se
dispara o un indicador leído antes de estar listo aparecen antes del primer backtest real. El
veredicto, junto con cualquier aviso que emitiera el motor, se registra contra esa compilación.

Una estrategia en ejecución puede leer la versión del motor sobre la que corre mediante
`getEngineVersion()` y sus accesores numéricos, que informan del motor cargado y no del que
estaba vigente cuando se compiló la estrategia, y que fallan cerrados cuando la versión no puede
determinarse.

## Por dónde seguir

- [Estrategias en Java](/docs/developers/java-strategies) — la plantilla mínima y el modelo de
  autoría.
- [Ejemplos de estrategias](/docs/developers/strategy-examples) — estrategias completas para cada
  patrón.
- [Modelo de ejecución de un backtest](/docs/developers/backtest-execution-model) — cómo una
  estrategia compilada se convierte en un resultado.
- [Documentación de la API Java](/docs/developers/java-api) — la referencia de clases versionada.