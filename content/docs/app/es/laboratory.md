---
title: Laboratorio
description: Un sandbox visual para iterar la lógica de una estrategia antes de que sea código.
order: 4
lastUpdated: '2026-08-18T18:44:33Z'
---

Laboratorio es donde experimentas antes de comprometerte con una estrategia escrita. En
vez de Java, construyes la lógica de forma visual en el editor **Strategy Studio**, ejecutándola
contra un fragmento real y específico de datos de mercado — no un feed en vivo, sino una
foto fija que eliges de antemano.

## Crear un laboratorio

Abre **Laboratorio → Nuevo**. Antes de que se abra el Studio, eliges contra qué va a
correr:

- **Exchange** e **instrumento** — el mercado del que viene la foto.
- **Tipo de datos** — tickers o klines.
- **Fecha y hora** — una ventana histórica específica. Solo se pueden seleccionar ventanas
  para las que QTSurfer ya tiene datos; usa **Cargar** para traer una nueva.
- **Configuración de ejecución** — ajustes de ejecución para el Studio (los valores por
  defecto vienen del exchange, y se pueden sobrescribir por laboratorio).

Una vez cargado, el Studio se abre con esos datos disponibles e iteras la lógica
directamente ahí adentro — sin un paso de guardado separado por cada cambio.

## Por qué usarlo en vez de escribir código directamente

Laboratorio cambia completitud por velocidad de iteración: trabajas con una ventana fija
de datos reales con feedback visual instantáneo, en vez de ir y volver por el paso de
compilación del asistente de estrategias en cada cambio. Es el lugar para responder "¿esta
idea tiene alguna señal?" antes de gastar una revisión en ella dentro de
[Estrategias](/docs/app/strategies).

## Guardar tu trabajo

Un laboratorio persiste su estado (la lógica visual, como un IR — representación
intermedia) bajo su propio título, independiente de cualquier estrategia. Editarlo después
reabre el Studio con ese mismo estado. No produce una revisión de estrategia por sí solo —
cuando una idea está lista, lleva lo que has aprendido a **Estrategias → Nueva** y genera o
escribe la estrategia real.
