---
title: Lastra y herramientas abiertas
description: Lee los datos de mercado que sirve QTSurfer fuera de la plataforma — el formato columnar Lastra y sus lectores de código abierto para Python, DuckDB, TypeScript y Java, conversores a Parquet y CSV, y la biblioteca de streaming detrás del flujo de datos.
order: 7
lastUpdated: '2026-09-04T10:18:11Z'
---

Los segmentos horarios de datos de mercado que sirve QTSurfer son ficheros que puedes conservar,
consultar y convertir con herramientas de código abierto. El formato, los lectores y los
conversores se publican bajo la [organización QTSurfer en GitHub](https://github.com/QTSurfer) con
licencia Apache-2.0. Esta página muestra el camino más corto desde un segmento descargado hasta un
DataFrame, una consulta SQL, o un fichero Parquet.

## El formato Lastra

**Lastra** es un formato de fichero columnar para series temporales numéricas. Cada columna lleva
su propio códec, elegido según el tipo de datos que contiene:

| Tipo de columna | Códec | Tamaño típico |
|---|---|---|
| Marcas de tiempo a cadencia regular | Delta-varint | Aproximadamente un byte por valor |
| Precios y volúmenes decimales | ALP (punto flotante sin pérdida adaptativo) | Unos pocos bits por valor a dos decimales |
| Medidas volátiles | Gorilla XOR, o Pongo (Gorilla consciente de decimales) | |
| Cadenas, etiquetas, payloads JSON | Longitud variable, opcionalmente ZSTD o gzip | |

Un fichero contiene una sección de **series** — filas regulares que comparten una columna de marca
de tiempo — y una sección opcional de **eventos** para registros dispersos, con marca de tiempo
independiente, como las señales. Las columnas pueden llevar metadatos clave-valor, por ejemplo los
parámetros de un indicador. Cada columna tiene un CRC32 en el pie del fichero, así que una columna
corrupta falla de forma ruidosa al acceder a ella mientras las demás siguen siendo legibles. Los
ficheros más grandes se dividen en **grupos de filas** con rangos de marca de tiempo por grupo, lo
que permite a un lector saltarse los grupos fuera de una ventana de consulta — incluso mediante
peticiones HTTP por rangos contra un fichero remoto.

La compresión no tiene pérdida: los valores viajan de ida y vuelta bit a bit entre las
implementaciones Java, Python y TypeScript. El formato de transmisión está especificado en el
documento de formato de la implementación de referencia, [lastra-java](https://github.com/QTSurfer/lastra-java).

## Obtener un segmento

Las dos rutas horarias devuelven un fichero. `format=lastra` es el valor por defecto;
`format=parquet` convierte el mismo segmento al vuelo. Consulta [Datos de
mercado](/docs/developers/api/market_data) para las rutas y el parámetro `hour`.

```bash
curl --fail --remote-name \
  "https://api.qtsurfer.net/v1/exchange/binance/tickers/BTC/USDT?hour=2026-01-15T10" \
  -H "Authorization: Bearer $QTSURFER_JWT"
```

Las klines son mucho más pequeñas que los tickers; pide el segmento de klines cuando baste con
datos a nivel de barra.

## Python

[lastra-py](https://github.com/QTSurfer/lastra-py) está en PyPI como `lastra`. Las columnas se
decodifican bajo demanda en arrays de NumPy; las columnas que no lees no se descomprimen.

```python
from lastra import LastraReader

with open("binance_BTC-USDT_tickers_2026-01-15T10.lastra", "rb") as f:
    r = LastraReader.from_stream(f)
    ts = r.read_series_long("ts")          # numpy int64, epoch milliseconds
    close = r.read_series_double("close")  # numpy float64
```

Los nombres de las columnas dentro de un segmento vienen del propio fichero; lista
`r.series_columns` para verlos antes de leer. Los adaptadores de Pandas, Polars y Arrow están en
la hoja de ruta del proyecto; hasta entonces, construye un DataFrame a partir de los arrays.

## DuckDB

[duckdb-lastra](https://github.com/QTSurfer/duckdb-lastra) es una extensión de DuckDB que lee
ficheros `.lastra` como tablas, con pushdown de predicados sobre la marca de tiempo, de modo que
los grupos de filas fuera de un rango `WHERE` nunca se decodifican.

```sql
LOAD lastra;

SELECT ts, close
FROM 'binance_BTC-USDT_tickers_2026-01-15T10.lastra'
WHERE ts BETWEEN 1768471200000 AND 1768472100000
LIMIT 100;
```

`read_lastra('file.lastra')` es la función de tabla explícita detrás del *replacement scan*. Como
DuckDB puede leer por HTTP, la misma consulta funciona contra un fichero remoto con peticiones por
rangos.

## TypeScript

[lastra-ts](https://github.com/QTSurfer/lastra-ts) está en npm como `@qtsurfer/lastra`: un lector
para navegadores y Node.js con salida `Float64Array` sin copia e interoperabilidad con Apache
Arrow.

```typescript
import { LastraReader } from '@qtsurfer/lastra';

const buffer = await fetch('/data/btc-1h.lastra').then((r) => r.arrayBuffer());
const reader = new LastraReader(buffer);

const ts = reader.readSeriesLong('ts');
const close = reader.readSeriesDouble('close');
```

Convertirlo a una tabla Arrow pone los datos a disposición de DuckDB-WASM y de las bibliotecas
habituales de gráficos y análisis en el navegador.

## Java

[lastra-java](https://github.com/QTSurfer/lastra-java) es la implementación de referencia, con
escritor y lector, Java 11 en adelante, disponible a través de JitPack.

```java
LastraReader r = LastraReader.from(inputStream);
long[] ts = r.readSeriesLong("ts");
double[] close = r.readSeriesDouble("close");
```

Para consultas por rango, recorre los grupos de filas y sáltate aquellos cuyo `tsMin`/`tsMax`
caigan fuera de la ventana; solo se decodifican los grupos que se solapan.

## Convertir

[lastra-convert](https://github.com/QTSurfer/lastra-convert) es un conversor de línea de comandos
entre Lastra, Parquet y CSV, con el formato detectado a partir de la extensión del fichero. Se
distribuye como fat JAR y como binarios nativos para Linux, macOS y Windows en cada versión.

```bash
lastra-convert segment.lastra segment.parquet   # Lastra → Parquet, ZSTD, lossless
lastra-convert segment.lastra segment.csv       # Lastra → CSV
lastra-convert data.parquet --smart             # Parquet → Lastra, codecs chosen per column
```

[lastra-convert-py](https://github.com/QTSurfer/lastra-convert-py) es el port en Python, que añade
Arrow como origen y destino.

## El resto de la caja de herramientas

- [alp-java](https://github.com/QTSurfer/alp-java) y [alp-py](https://github.com/QTSurfer/alp-py)
  implementan el códec ALP por separado, bit a bit compatibles entre sí, para usarlo fuera de
  Lastra.
- [parquet-lite](https://github.com/QTSurfer/parquet-lite) lee y escribe Parquet desde Java sin
  dependencias de Hadoop. Es lo que hace ligera la conversión bajo demanda a `format=parquet` y
  los ficheros Parquet de señales almacenadas.
- [qtstreamx](https://github.com/QTSurfer/qtstreamx) es la biblioteca de streaming para la JVM que
  normaliza los flujos WebSocket de los exchanges en tickers, klines y tasas de financiación, con
  transportes y códecs conectables. Es la representación en la que se captura el dato de la
  plataforma, y por eso un segmento descargado tiene el aspecto que tiene.

## Páginas relacionadas

- [Datos de mercado](/docs/developers/api/market_data) — las rutas que devuelven segmentos.
- [Conjuntos de datos](/docs/developers/api/datasets) — subir tu propio histórico como CSV.
- Learn: [Datos históricos de mercado](/learn/articles/historical-market-data) — tickers frente a
  klines, cadencia, cobertura y huecos.