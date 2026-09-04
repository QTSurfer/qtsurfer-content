---
title: API de estrategias
description: Compila, valida, inspecciona, recupera y elimina estrategias Java a través de la API REST.
order: 5.2
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: 848593e88be3b80078c6f98d7cb582f22fd87853
upstreamPath: docs/strategy.md
lastUpdated: '2026-09-04T00:00:00Z'
---

Compila una estrategia Java, comprueba que realmente funciona, lista/inspecciona/elimina lo que
has registrado, y recupera su código fuente.

Esta página documenta los recursos REST de estrategias. Para el código fuente Java en sí — clases
base, señales de ejecución e información, parámetros de orden avanzados y metadatos de gráfico —
consulta [Programar estrategias en Java](strategy_coding).

| Método | Ruta | Propósito |
|---|---|---|
| `POST` | `/strategy` | Compilar y registrar |
| `GET` | `/strategies` | Listar tus estrategias registradas |
| `GET` | `/strategy/{strategyId}` | Obtener una, incluido su estado de validación |
| `POST` | `/strategy/{strategyId}/validate` | Comprobar que realmente funciona |
| `GET` | `/strategy/{strategyId}/code` | Recuperar el código fuente registrado |
| `DELETE` | `/strategy/{strategyId}` | Liberarla |

## Compilar una estrategia

`POST /strategy` — el cuerpo es el código fuente Java en crudo, `Content-Type: text/plain`.

```bash
curl -X POST https://api.qtsurfer.net/v1/strategy \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: text/plain" \
  --data-binary @MyStrategy.java
```

```json
{
  "strategyId": "2ul144qe9tlwzu5anhwvc6",
  "declaredProperties": [
    {"name": "rsi.period", "description": "RSI period", "defaultValue": "14",
     "reflected": true, "min": 2, "max": 50, "step": 1},
    {"name": "enabled", "description": "Enabled", "reflected": true}
  ]
}
```

**Esto responde a una única pregunta: si el fuente es Java válido.** Compila, registra y devuelve
el id — nada más. Si la clase realmente funciona se comprueba con
[`validate`](#comprobar-que-realmente-funciona); todo lo que se sabe de una estrategia, incluida su
validación, se lee de [`GET /strategy/{strategyId}`](#obtener-una-estrategia).

**El `strategyId` se deriva de lo que el código *significa*, no de cómo está escrito.** Un
comentario, una línea en blanco, reindentar, reordenar imports o mover un método de sitio devuelven
todos el **mismo** id — no has creado una segunda estrategia. Renombrar una variable, cambiar la
capitalización de un identificador o reordenar campos/sentencias devuelve uno **distinto**. Dos
consecuencias:

- reenviar una estrategia que solo has reformateado es gratis — recuperas el id que ya tenías,
  junto con cualquier validación ya registrada contra él;
- el id no dice nada sobre el *comportamiento*. Dos fuentes que calculan lo mismo por medios
  distintos son dos estrategias, ya que decidir lo contrario significaría decidir la equivalencia
  de programas.

### `declaredProperties` — `DeclaredProperty`

El vocabulario de claves de parámetro que un barrido o una ejecución pueden usar y que se sabe que
esta estrategia acepta — establecido sin construir la estrategia, de modo que quien la llama puede
detectar una clave mal escrita antes de enviar un barrido en lugar de descubrirlo solo por un
rechazo. **Best-effort, no exhaustivo**: una propiedad registrada de forma imperativa (por ejemplo,
a través de un `RiskConfig` adjunto) necesita una instancia viva para descubrirse y no aparecerá
aquí — un nombre ausente de esta lista puede seguir siendo válido.

| Campo | Notas |
|---|---|
| `name` | la clave que usa un mapa de parámetros de barrido o ejecución para esta propiedad |
| `description` | etiqueta legible, tal como se declaró |
| `defaultValue` | el valor por defecto declarado, como cadena. **Ausente, no `null`, cuando no se declaró ninguno** |
| `reflected` | `true` — un valor se inyecta en el campo de la estrategia; `false` — solo disponible a través del mapa de propiedades |
| `min`, `max`, `step` | límites de rango/barrido sugeridos, si se declararon. **Solo orientativos, nunca validados** |

Errores: `400` no es Java válido — el mensaje lleva los diagnósticos del compilador, no se
registra nada · `429` demasiadas compilaciones en curso, reintenta más tarde.

## Comprobar que realmente funciona

`POST /strategy/{strategyId}/validate`

Instancia la clase compilada y la hace pasar por una serie sintética acotada, de modo que un fallo
de cableado aparece aquí en lugar de en tu primer backtest real. El veredicto — superado o fallido,
más cualquier aviso del motor — se registra y se sirve desde `GET /strategy/{strategyId}`.

**Idempotente.** Si ya existe un veredicto para la compilación actual, vuelve directamente con
`200` y no se encola nada; en caso contrario, la comprobación se encola y esto devuelve `202`.
**El código de estado, no el cuerpo, es lo que distingue ambos casos** — un `200` también puede
llevar `validation: pending`, dejado por una comprobación que encoló una llamada anterior. `202`
significa *esta llamada inició una comprobación*; `pending` solo significa *hay una comprobación
pendiente*. Sondea `GET /strategy/{strategyId}` hasta que `validation` deje de ser `pending`.

Recompilar reemplaza un veredicto — la respuesta antigua describía un bytecode que ya no se
ejecutaría — que es lo que hace que esto se pueda volver a llamar tras una edición.

```bash
curl -X POST https://api.qtsurfer.net/v1/strategy/2ul144qe9tlwzu5anhwvc6/validate \
  -H "Authorization: Bearer $TOKEN"
# → 202 {"strategyId": "2ul144qe9tlwzu5anhwvc6", "validation": "pending"}
```

Errores: `404` no existe esa estrategia registrada para este usuario.

## Obtener una estrategia

`GET /strategy/{strategyId}` — la respuesta es `StrategyState`, la misma forma que devuelve el
`200` ya validado de `validate`.

**`validation: passed` no significa que la estrategia sea correcta.** Significa que la clase cargó
y sobrevivió al primer evento de una ejecución sintética corta — un suelo, no una garantía. Cuando
`dryRunIncomplete` es `true`, ese suelo es aún más bajo, porque la ejecución no llegó a terminar.

| Campo | Notas |
|---|---|
| `validation` | `not_validated` \| `pending` \| `passed` \| `failed` |
| `compiledAt` | cuándo se produjo la compilación en vivo |
| `requiredSources` | datos de mercado que necesita la estrategia (`Ticker`, `KLine`, `FundingRate`), leídos de la clase compilada. **Ausente no significa "no necesita nada"** — ausente significa que la plataforma no pudo determinar la respuesta sin construir la estrategia (una `MultiSourceStrategy`, una clase que sobrescribe `getMarketDataSource()`, o cualquier cosa registrada antes de que existiera este campo). Volver a registrar la fuente lo rellena |
| `validatedAt` | cuándo se registró el veredicto; ausente hasta que hay uno |
| `detail` | por qué falló la validación, o por qué una comprobación encolada no ha respondido. Presente en `failed`, y junto a `validationStalled` |
| `notices` | lo que reveló la ejecución. Una lista vacía o ausente **no** es un certificado de salud limpio cuando `dryRunIncomplete` es `true` |
| `noticesTruncated` | avisos descartados por encima del límite; ausente cuando no hubo ninguno |
| `dryRunIncomplete` | la comprobación no terminó su presupuesto — se acabó el tiempo, fue rechazada (demasiadas ejecuciones inacabables ya en curso), o encontró un fallo atribuible al instrumento sintético en lugar de a la estrategia. El veredicto vale hasta donde llegó |
| `validationStalled` | una comprobación encolada lleva mucho más tiempo del habitual sin reportar. No se ha refutado nada — la comprobación simplemente no se ha ejecutado. Deja de esperar y vuelve a pedirla más tarde |
| `_links.code` | presente en un cuerpo completo (`200` aquí, y el `200` ya validado de `validate`), ausente en el stub `202` de `validate`. Apunta a [`GET .../code`](#recuperar-el-código-fuente) — seguirlo puede seguir dando `404` para una estrategia sin fuente propio (ver más abajo) |

```json
{
  "strategyId": "6bsh31ikwkuivhtgcoa6s4",
  "validation": "passed",
  "compiledAt": "2026-08-04T16:23:04Z",
  "requiredSources": ["Ticker"],
  "validatedAt": "2026-08-04T16:24:11Z",
  "notices": [
    {"level": "WARN", "code": "indicator.bar-data-on-ticker-path",
     "message": "Indicator requires bar data but is on the ticker path",
     "provenance": "compile-dry-run"}
  ],
  "_links": {"code": {"href": "/v1/strategy/6bsh31ikwkuivhtgcoa6s4/code"}}
}
```

Errores: `404` no existe esa estrategia registrada para este usuario — nunca desfasado/expirado,
el registro y el veredicto se almacenan de forma duradera, no en caché.

## Listar tus estrategias

`GET /strategies` — todas las estrategias que has registrado y no has eliminado, las compiladas
más recientemente primero. **Nunca un `404`** — un array vacío si no tienes ninguna.

Cada entrada (`StrategySummary`) lleva la misma procedencia `compiledAt`/`requiredSources` que
`StrategyState`, pero **no** el estado de validación, de modo que listar sigue siendo barato sin
importar cuántas estrategias tengas. Comprueba la validación de una en concreto con
`GET /strategy/{strategyId}`.

```bash
curl https://api.qtsurfer.net/v1/strategies -H "Authorization: Bearer $TOKEN"
```

```json
{
  "strategies": [
    {"strategyId": "6bsh31ikwkuivhtgcoa6s4", "compiledAt": "2026-08-19T10:15:00Z", "requiredSources": ["Ticker"]},
    {"strategyId": "2ul144qe9tlwzu5anhwvc6", "compiledAt": "2026-08-12T09:02:11Z"}
  ]
}
```

## Recuperar el código fuente

`GET /strategy/{strategyId}/code` — el fuente exacto enviado por última vez para este id, con
espacios en blanco y comentarios incluidos: el mismo texto del que se derivó `strategyId`.

**"Si está disponible", no "siempre".** Una estrategia resuelta solo por referencia a través de un
listado compartido/del marketplace que copiaste no lleva fuente propio, y aquí devuelve `404` — lo
mismo que un `strategyId` que nunca registraste. Esa es la respuesta honesta en ambos casos: no hay
nada que devolver.

```bash
curl https://api.qtsurfer.net/v1/strategy/2ul144qe9tlwzu5anhwvc6/code \
  -H "Authorization: Bearer $TOKEN"
# → {"strategyId": "2ul144qe9tlwzu5anhwvc6", "code": "package strategy;\npublic class..."}
```

Errores: `404` no existe esa estrategia registrada para este usuario, o no hay nada que leer para
este id.

## Eliminar una estrategia

`DELETE /strategy/{strategyId}` — libera el hueco en un plan con un tope de número de estrategias.

La elimina de `GET /strategy/{strategyId}` y `GET /strategies`. **No** se deshace reenviando el
mismo fuente — eso registra una estrategia nueva, con un id nuevo. **Los backtests ya ejecutados
contra ella no se ven afectados**: eliminarla hace que deje de contar contra tu cuenta y evita que
la valides o vuelvas a ejecutar bajo este id, pero no borra lo que ya ocurrió. Solo elimina una
estrategia que hayas registrado tú mismo — eliminar tu copia de un listado compartido/del
marketplace nunca afecta al original.

```bash
curl -X DELETE https://api.qtsurfer.net/v1/strategy/2ul144qe9tlwzu5anhwvc6 \
  -H "Authorization: Bearer $TOKEN"
# → {"strategyId": "2ul144qe9tlwzu5anhwvc6", "deleted": true}
```

Errores: `404` no existe esa estrategia registrada para este usuario.