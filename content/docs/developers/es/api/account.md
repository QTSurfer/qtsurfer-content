---
title: Cuenta
description: Consulta los límites de tu plan y tu uso de almacenamiento en vivo frente a ellos.
order: 5.8
upstreamRepository: QTSurfer/qtsurfer-api
upstreamCommit: c76f4c7d47be2512bd9510800dce5bf6a74248a2
upstreamPath: docs/account.md
lastUpdated: '2026-09-12T18:22:07Z'
---

Todas las rutas de cuenta requieren un JWT tipo bearer obtenido mediante
[autenticación](https://github.com/QTSurfer/qtsurfer-api/blob/848593e88be3b80078c6f98d7cb582f22fd87853/README.md#api-quick-start).
Dividido en dos endpoints a propósito: tu plan y sus límites no cambian a mitad de sesión y no
cuesta nada consultarlos, mientras que el uso es una cifra en vivo que cambia con cada subida de
conjunto de datos o ejecución de estrategia.

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/account` | Tu identidad y los límites de tu plan |
| `GET` | `/account/usage` | Tu uso de almacenamiento en vivo frente a esos límites |

## Obtener tu plan y sus límites

`GET /account` — sin ninguna consulta a base de datos detrás, seguro de llamar en cada carga de
página.

```bash
curl https://api.qtsurfer.net/v1/account \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "userId": "76b90203-03c2-46f6-b366-9944f167e818",
  "tier": "free",
  "maxDatasets": 3,
  "maxDatasetBytes": 52428800,
  "maxTotalStorageBytes": 104857600,
  "_links": {
    "self": { "href": "/v1/account" },
    "usage": { "href": "/v1/account/usage" }
  }
}
```

| Campo | Notas |
|---|---|
| `userId` | tu id de cuenta — la claim `sub` del JWT |
| `tier` | tu plan de suscripción actual |
| `maxDatasets` | número máximo de [conjuntos de datos](datasets) activos que permite tu plan |
| `maxDatasetBytes` | tamaño máximo, en bytes, de una sola versión de un conjunto de datos |
| `maxTotalStorageBytes` | almacenamiento combinado máximo, en bytes, entre todos los conjuntos de datos, señales de ejecución de estrategia y estrategias registradas de tu cuenta — ver abajo |

## Obtener tu uso en vivo

`GET /account/usage` — cuánto de `maxTotalStorageBytes` estás usando ahora mismo. **Una sola bolsa
compartida, no un tope por tipo de recurso**: los conjuntos de datos, las señales de ejecución de
estrategia y las [estrategias](strategy) registradas cuentan todos contra el mismo total, ya que
compiten por el mismo almacenamiento subyacente. No garantizado en tiempo real — una subida o
ejecución de estrategia recién terminada puede tardar un instante en reflejarse aquí.

```bash
curl https://api.qtsurfer.net/v1/account/usage \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "datasetsUsed": 2,
  "datasetBytesUsed": 15728640,
  "signalsUsed": 1,
  "signalBytesUsed": 524288,
  "strategiesUsed": 4,
  "strategyBytesUsed": 40960,
  "storageBytesUsed": 16293888,
  "_links": {
    "self": { "href": "/v1/account/usage" },
    "account": { "href": "/v1/account" }
  }
}
```

| Campo | Notas |
|---|---|
| `datasetsUsed` / `datasetBytesUsed` | conjuntos de datos activos y sus bytes combinados de la versión actual — el mismo conjunto que limita `maxDatasets` |
| `signalsUsed` / `signalBytesUsed` | subidas de señales de ejecución de estrategia registradas y sus bytes combinados |
| `strategiesUsed` / `strategyBytesUsed` | estrategias registradas y los bytes combinados de la fuente de cada una más su bytecode compilado más reciente (las compilaciones sustituidas no cuentan) |
| `storageBytesUsed` | `datasetBytesUsed + signalBytesUsed + strategyBytesUsed` — el número que se compara con `maxTotalStorageBytes` de `GET /account` |

## Dónde se aplica el límite

`maxTotalStorageBytes` se comprueba cuando añades nuevos bytes de conjunto de datos —
`POST /datasets/{datasetId}/uploads/{uploadId}/finalize` y `POST /datasets/imports` devuelven
ambos `429` si tu cuenta ya está en el límite o por encima (consulta [Conjuntos de datos](datasets)
para el texto exacto). Las señales de ejecución de estrategia y las estrategias registradas se
reflejan en `storageBytesUsed` pero no disparan un `429` por sí mismas hoy — elimina un conjunto de
datos para liberar espacio si estás en tu límite.

## Guías relacionadas

- [Conjuntos de datos](datasets) — el recurso que cuenta hacia, y puede quedar bloqueado por,
  `maxTotalStorageBytes`.
- [Estrategias](strategy) — las estrategias registradas cuentan hacia `strategyBytesUsed`.
