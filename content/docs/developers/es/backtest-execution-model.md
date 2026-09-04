---
title: Modelo de ejecución de un backtest
description: El modelo mental detrás de la API de backtest — las tres identidades de las que depende una ejecución, qué garantiza cada etapa del ciclo de vida, cómo funcionan el sondeo y la idempotencia, y qué contiene un resultado.
order: 5.8
lastUpdated: '2026-09-04T10:18:11Z'
---

Las guías de la API documentan cada endpoint. Esta página describe el modelo que comparten esos
endpoints, para que la secuencia de llamadas tenga sentido en conjunto y las reglas de
idempotencia y sondeo dejen de sorprender. El detalle a nivel de endpoint está en [Ejecutar un
backtest](/docs/developers/api/backtest_execute), [Barridos de
parámetros](/docs/developers/api/backtest_sweep) y
[Conjuntos de datos](/docs/developers/api/datasets).

## Tres identidades

Todo resultado de backtest depende exactamente de tres cosas, y cada una tiene su propia
identidad:

| Identidad | Creada por | Identifica |
|---|---|---|
| `strategyId` | `POST /strategy` | El código compilado, por su significado. |
| `jobId` de preparación | `POST .../prepare` | Un instrumento, rango de fechas y cadencia de datos históricos — o una versión de conjunto de datos. |
| `jobId` de ejecución | `POST .../execute` | Una ejecución: una estrategia sobre una sesión preparada con una configuración dada de almacenamiento de señales y curva de equity. |

Las identidades se derivan del contenido de la petición, no se generan al azar. Enviar el mismo
fuente dos veces produce el mismo `strategyId`; preparar la misma ventana dos veces produce el
mismo job de preparación; ejecutar la misma estrategia sobre la misma sesión con las mismas
opciones produce el mismo job de ejecución. Por eso un reintento siempre es seguro: devuelve la
identidad existente en lugar de repetir el trabajo. El corolario es que un resultado *distinto*
necesita una entrada *distinta* — cambiar solo la transformación de la curva de equity en una
petición de ejecución crea una ejecución nueva, porque la transformación forma parte de la
identidad.

## Ciclo de vida

```text
compile ──► validate ──┐
                       ├──► execute ──► poll ──► result
prepare ──► poll ──────┘
```

1. **Compilar** convierte el código fuente Java en una estrategia registrada y devuelve sus
   propiedades declaradas. Responde a una sola pregunta: si esto es Java válido.
2. **Validar** instancia la clase compilada contra una serie sintética acotada y registra un
   veredicto. Es opcional pero barato, y atrapa fallos de cableado antes de que cuesten una
   ejecución real.
3. **Preparar** carga una ventana histórica en una sesión e informa de su **cobertura**: la
   proporción de horas esperadas que tienen datos, y un motivo para cada hora vacía. Una
   preparación de un solo instrumento siempre es terminal; la decisión de continuar se toma a
   partir del ratio de cobertura, no esperando a que lleguen más datos.
4. **Ejecutar** corre la estrategia sobre la sesión. El instrumento y las fechas se recuperan del
   job de preparación; no se vuelven a enviar.
5. **Sondear** hasta que el resultado sea legible.
6. **Resultado** lleva el estado del job, las métricas de rendimiento, la curva de equity, los
   avisos del motor y, si se solicitó, un puntero a las señales almacenadas.

Un barrido sustituye el paso 4 por muchas ejecuciones sobre la misma sesión preparada y añade su
propio sondeo y forma de resultado; todo lo anterior es idéntico.

## Estados de un job

El `state.status` de un job pasa por `New`, `Started`, y luego uno de `Completed`, `Aborted` o
`Failed`. Un job de ejecución simple también puede informar de `Partial` mientras sigue en
marcha. El contador `completed` es el número de eventos procesados hasta el momento, que es la
única señal de progreso que expone una ejecución simple.

En los barridos coexisten dos vocabularios: el propio `status` del barrido (`RUNNING`,
`COMPLETED`, `PARTIAL`, `CANCELLED`) y el `state.status` incrustado, con el vocabulario de job de
arriba. `PARTIAL` y `CANCELLED` se convierten ambos en `Aborted`, porque el `PARTIAL` de un
barrido es terminal, mientras que el `Partial` de un job no lo es.

## Reglas de sondeo

- Un `202` con cuerpo vacío significa *aún no legible*. Se devuelve mientras el job sigue en
  marcha **y** cuando el resultado almacenado de un job terminado no se puede leer de vuelta, así
  que un bucle de sondeo debe fijarse en `200` más un `state.status` terminal, nunca en "ya no es
  202".
- El sondeo no está limitado por tasa por el propio resultado, pero un cliente debería moderarse:
  los resultados se escriben una sola vez, y el intervalo entre sondeos es la latencia que el
  cliente añade a su propia respuesta.
- La cancelación es asíncrona. `DELETE` devuelve `cancelling`; el job informa de `Aborted` una vez
  que el worker ha procesado la petición.

## Qué contiene un resultado

| Parte | Presente cuando | Notas |
|---|---|---|
| `state` | Siempre | Estado del job, progreso, marcas de tiempo. |
| Métricas de rendimiento | Se cerró al menos una operación | Unidades y definiciones en la [referencia de métricas](/docs/developers/metrics-reference). |
| `equityCurve` | Misma condición que las métricas | Un punto de anclaje más un punto por cada operación cerrada, en la transformación elegida al enviar. |
| `notices` | Se emitió algo | Diagnósticos con un nivel, un código y un mensaje. **Su ausencia significa que no se emitió nada** — el único campo donde el silencio es una respuesta. Una ejecución sin operaciones normalmente se explica sola aquí. |
| `signalsUrl` y campos relacionados | `storeSignals: true` | Un fichero Parquet con cada señal emitida: valores de indicadores y marcadores detrás de la curva agregada. |
| `hostName`, `iops` | Siempre | Dónde se ejecutó la corrida y su rendimiento en operaciones de instrumento por segundo. |

El `strategyId` dentro de un resultado es el id de contexto de ejecución, con la forma
`strategy:<user>:<strategyId>`; el segmento tras los últimos dos puntos es el id que se compiló.

## Datos gestionados y conjuntos de datos

Dos vías de datos llevan a la misma llamada de ejecución:

- **Exchange gestionado.** `exchangeId` nombra un exchange soportado, `instrument` un par que
  cubre el catálogo, y la cobertura se mide en horas con datos sobre horas esperadas.
- **Conjunto de datos.** `exchangeId` es el valor reservado `user`, y `datasetId` (opcionalmente
  fijado a un `datasetVersionId`) sustituye al instrumento. La cobertura se mide como filas sobre
  los pasos que implica la cadencia descubierta, y una preparación respaldada por un conjunto de
  datos no consume capacidad de worker, porque lee un fichero ya ingerido.

Una vez preparada, una sesión de conjunto de datos se comporta exactamente igual que una
gestionada: los mismos endpoints de execute, sweep y curva de equity, la misma forma de
resultado.

## Límites y errores que conviene planificar

- `400` en prepare: la ventana empieza antes de la retención que permite tu plan, termina en el
  futuro, solicita una cadencia más fina que la de origen, o nombra un conjunto de datos que aún
  se está ingiriendo.
- `404` en execute: el job de preparación expiró. Las sesiones preparadas no se conservan para
  siempre; vuelve a preparar.
- `429`: la cola global está al límite, o la cuenta tiene demasiadas ejecuciones activas.
  Modérate y reintenta; las identidades idempotentes hacen que el reintento sea gratis.
- Las cuadrículas de barrido que exceden el presupuesto de ejecuciones del servidor se rechazan al
  enviarlas, antes de que empiece ninguna ejecución.

## Páginas relacionadas

- [Arquitectura del motor](/docs/developers/engine-architecture) — qué ocurre dentro de una
  ejecución.
- [Referencia de métricas](/docs/developers/metrics-reference) — cada campo de un resultado.
- [Curvas de equity](/docs/developers/api/equity_curves) — formas, transformaciones y retención.
- [Clientes y SDKs](/docs/developers/clients-and-sdks) — bibliotecas que implementan este modelo
  por ti.