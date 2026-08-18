---
title: Estrategias
description: Qué es una estrategia, cómo funcionan las revisiones y cómo crear la primera.
order: 2
lastUpdated: '2026-08-18T18:44:33Z'
---

Una estrategia es un fragmento de código **Java** que reacciona a datos de mercado y emite
señales de trading. Cada guardado crea una nueva **revisión** — las estrategias están
versionadas, y cada backtest apunta a exactamente una revisión, así que un resultado
siempre nombra el código exacto que lo produjo.

## Crear mi primera estrategia

Abre **Estrategias → Nueva** (o la acción "Nueva" de la tarjeta de Estrategias en el
dashboard). El flujo es un asistente de cuatro pasos y puedes volver a cualquier paso
anterior sin perder lo que ya ingresaste.

### 1. Idea

Ponle un título y una descripción a la estrategia. El título la identifica a través de
todas sus futuras revisiones — se permiten letras, números, espacios y
`. , _ / ( ) + & : -`. La descripción es texto libre: qué busca lograr la estrategia y la
idea general detrás de ella.

### 2. Generar

No hace falta escribir Java a mano. Este paso te entrega un prompt ya armado — construido
con el título y la descripción que acabas de introducir, más un enlace a la skill oficial de
estrategias de QTSurfer (la API del motor, el formato de señales y las convenciones de
escritura) — y tres formas de convertirlo en código:

- **Abrir Codex** o **Abrir Claude Code** — abre el asistente con el prompt ya copiado al
  portapapeles, o usa **Copiar prompt** para pegarlo tú mismo en cualquier asistente de IA.
- **Modo avanzado** — omite el asistente y escribes o pegas Java directamente.

La IA se ejecuta fuera de QTSurfer: genera el código ahí y vuelve para pegarlo en el
siguiente paso.

### 3. Pegar código

Pega el Java generado en el editor. **Cargar ejemplo** completa una pequeña estrategia de
referencia funcional si quieres ver primero la forma esperada: un cruce de medias EMA:

```java
public class EmaCrossStrategy extends AbstractTickerStrategy {

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators
                .addPrice()
                .ema("fast", 20)
                .ema("slow", 50)
                .window("fast", WindowTime.s1, new CrossListener(indicators));
    }

    private class CrossListener extends AbstractWindowListener {
        @Override
        public void onChange(StateStore store, double prev, double actual) {
            double fast = indicators.getValue("fast");
            double slow = indicators.getValue("slow");
            InfoStrategySignal signal = createInfoSignal();

            if (fast > slow && !store.is("bullish")) {
                store.set("bullish");
                signal.set("_m", "shape", "arrowUp", "text", "BUY", "color", "#16a34a");
                emitSignal(signal);
            } else if (fast < slow && store.is("bullish")) {
                store.unset("bullish");
                signal.set("_m", "shape", "arrowDown", "text", "SELL", "color", "#dc2626");
                emitSignal(signal);
            }
        }
    }
}
```

### 4. Revisar

La estrategia solo se guarda cuando el código **valida y compila**. Este paso lo envía al
compilador del backend; si falla, te quedas en este paso con el mensaje de error y la línea
correspondiente resaltada en el editor, así puedes corregir y reintentar sin perder tu
trabajo.

## Después de crearla

- **Revisiones** — volver a editar una estrategia produce una revisión nueva, nunca
  sobrescribe la anterior. Cada backtest y cada publicación en el Mercado apunta a una
  revisión específica.
- **Compartir** — desde tu listado de estrategias, **Compartir** abre el flujo de
  publicación de una revisión: visibilidad, modelo de acceso y precio opcional. Ver
  [Mercado](/docs/app/marketplace).
- **Copias de referencia** — una estrategia que tomaste del Mercado es una copia de
  referencia de solo lectura (sin código fuente, sin editar/clonar/nueva revisión) a menos
  que hayas comprado una publicación de tipo **CODE** — ver Mercado para la distinción.
