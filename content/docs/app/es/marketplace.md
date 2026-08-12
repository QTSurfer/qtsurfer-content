---
title: Mercado
description: Descubre estrategias compartidas por la comunidad y aprende a publicar la tuya.
order: 5
---

El Mercado es donde las estrategias se mueven entre cuentas: descubre lo que otros
usuarios han publicado, evalúa una publicación antes de utilizarla y reutilízala en tus propios
backtests, o publica una de tus estrategias para que otros la encuentren.

## Usar una estrategia del Mercado

1. Recorre el catálogo y abre una publicación para evaluarla.
2. **Publicaciones gratuitas** — haz clic en **Usar estrategia** para añadirla
   directamente a tu espacio de trabajo.
3. **Publicaciones premium** — requieren pago antes de que la estrategia se copie a tu
   espacio de trabajo y puedas ejecutar backtests con ella.
4. Una vez que está en tu espacio de trabajo, adapta parámetros, activos y fechas y ejecuta
   tu propio [backtest](/docs/app/backtesting) con ella, igual que con cualquier estrategia
   que hayas escrito tú.

Una estrategia que tomaste así es una **copia de referencia**: trae lo necesario para
hacer backtesting y copy-trading, pero no necesariamente el código fuente — poder leer o
editar el código depende de la **exposición** de la publicación (ver abajo).

## Publicar una estrategia

1. Primero, [crea la estrategia](/docs/app/strategies) — un título claro y el código
   generado y compilado a través del editor de estrategias.
2. Una vez que existe en tu espacio de trabajo, abre **Compartir** en la revisión que
   quieres publicar (desde el listado de estrategias o desde la estrategia misma).
3. En la pantalla de compartir, elige:
   - **Revisión** — exactamente cuál se publica; publicar una revisión posterior no cambia
     retroactivamente lo que recibieron compradores anteriores.
   - **Visibilidad** — pública o privada.
   - **Exposición** — si los compradores reciben el código fuente o solo una referencia
     compilada.
   - **Precio** — opcional; déjalo sin definir para una publicación gratuita.
4. Publica. `Strategy.shared` se activa en el momento en que al menos una revisión queda
   pública.

## Dónde entran los resultados

Un historial de resultados vende una estrategia mejor que una descripción — las mismas
cifras de [Sharpe ratio y PnL](/docs/app/backtesting) por las que el dashboard ordena
internamente son lo que hace que valga la pena tomar una publicación.
