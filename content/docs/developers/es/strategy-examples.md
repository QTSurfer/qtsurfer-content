---
title: Ejemplos de estrategias
description: Usa estrategias Java completas que muestran el ciclo de vida admitido.
order: 4
lastUpdated: '2026-09-26T17:41:32Z'
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: f19882e308b405b3bf2443d4e7f9eb81c3b826a1
upstreamPath: skills/qtsurfer-java-strategy/references/examples.md
---

## 1. Cruce de EMA (bucle de actualización)

Compra cuando la EMA rápida cruza por encima de la lenta; vende en el cruce contrario.

```java
import com.wualabs.qtsurfer.engine.core.instrument.Instrument;
import com.wualabs.qtsurfer.engine.core.Ticker;
import com.wualabs.qtsurfer.engine.indicators.helpers.group.InstrumentGroupRTIndicator;
import com.wualabs.qtsurfer.engine.strategy.AbstractTickerStrategy;

public class EmaCrossoverStrategy extends AbstractTickerStrategy {

    private Boolean rapidaSobreLenta;

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators.addPrice().ema("rapida", 9).ema("lenta", 21);
    }

    @Override
    public void update(Ticker ticker) {
        Instrument instr = ticker.instrument();
        updateInstrument(instr, ticker.timestamp());
        var ind = updateIndicators(instr, ticker);

        if (!ind.getExisting("lenta").isReady()) return;

        boolean rapidaSobreActual = ind.getValue("rapida") > ind.getValue("lenta");
        if (rapidaSobreLenta == null) { rapidaSobreLenta = rapidaSobreActual; return; }

        if (rapidaSobreActual && !rapidaSobreLenta)  emitBuy(instr, ticker.last());
        if (!rapidaSobreActual && rapidaSobreLenta)  emitSell(instr, ticker.last());
        rapidaSobreLenta = rapidaSobreActual;
    }
}
```

## 2. RSI de sobreventa/sobrecompra (window listener)

Entra en largo cuando el RSI cae por debajo de 30; sale cuando sube por encima de 70.
Se dispara una vez por ventana de 1 segundo, no en cada tick.

```java
import com.wualabs.qtsurfer.engine.indicators.helpers.group.InstrumentGroupRTIndicator;
import com.wualabs.qtsurfer.engine.indicators.helpers.WindowTimeRTIndicator.WindowTime;
import com.wualabs.qtsurfer.engine.strategy.AbstractWindowListener;
import com.wualabs.qtsurfer.engine.strategy.AbstractTickerStrategy;
import com.wualabs.qtsurfer.engine.core.state.StateStore;

public class RsiStrategy extends AbstractTickerStrategy {

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators
            .addPrice()
            .rsi(14)
            .window("rsi14", WindowTime.s1, new RsiListener(this, indicators));
    }

    private class RsiListener extends AbstractWindowListener {

        RsiListener(AbstractTickerStrategy s, InstrumentGroupRTIndicator ind) {
            super(s, ind);
        }

        @Override
        public void onChange(StateStore store, double prev, double actual) {
            if (actual < 30 && !store.is("enPosicion")) {
                emitBuy(indicators.getValue("price"));
                store.set("enPosicion");
            }
            if (actual > 70 && store.is("enPosicion")) {
                emitSell(indicators.getValue("price"));
                store.unset("enPosicion");
            }
        }
    }
}
```

## 3. Operación forzada (compra/venta periódica)

Estrategia sencilla de prueba de estrés: compra en el tick 60, vende en el tick 120, y repite.
Se usa en los tests de integración de CI — se sabe que compila y funciona correctamente.

```java
import com.wualabs.qtsurfer.engine.indicators.helpers.group.InstrumentGroupRTIndicator;
import com.wualabs.qtsurfer.engine.indicators.helpers.WindowTimeRTIndicator.WindowTime;
import com.wualabs.qtsurfer.engine.strategy.AbstractWindowListener;
import com.wualabs.qtsurfer.engine.strategy.AbstractTickerStrategy;
import com.wualabs.qtsurfer.engine.core.state.StateStore;

public class ForcedTradeStrategy extends AbstractTickerStrategy {

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators.addPrice().window("price", WindowTime.s1,
            new TradeListener(this, indicators));
    }

    private class TradeListener extends AbstractWindowListener {

        TradeListener(AbstractTickerStrategy s, InstrumentGroupRTIndicator ind) {
            super(s, ind);
        }

        @Override
        public void onChange(StateStore store, double prev, double actual) {
            long count = store.inc("count");
            if (count % 120 == 60) emitBuy(actual);
            else if (count % 120 == 0) emitSell(actual);
        }
    }
}
```

## 4. Reversión a la media con Bandas de Bollinger

Compra cuando el precio toca la banda inferior; vende en la banda superior.

```java
import com.wualabs.qtsurfer.engine.indicators.helpers.group.InstrumentGroupRTIndicator;
import com.wualabs.qtsurfer.engine.indicators.helpers.WindowTimeRTIndicator.WindowTime;
import com.wualabs.qtsurfer.engine.strategy.AbstractWindowListener;
import com.wualabs.qtsurfer.engine.strategy.AbstractTickerStrategy;
import com.wualabs.qtsurfer.engine.core.state.StateStore;

public class BollingerReversionStrategy extends AbstractTickerStrategy {

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators
            .addPrice()
            .bollinger("bb", 20, 2.0)   // → "bb", "bbUpper", "bbLower"
            .window("price", WindowTime.s5, new BandListener(this, indicators));
    }

    private class BandListener extends AbstractWindowListener {

        BandListener(AbstractTickerStrategy s, InstrumentGroupRTIndicator ind) {
            super(s, ind);
        }

        @Override
        public void onChange(StateStore store, double prev, double actual) {
            if (!indicators.getExisting("bb").isReady()) return;

            double superior = indicators.getValue("bbUpper");
            double inferior = indicators.getValue("bbLower");

            if (actual <= inferior && !store.is("largo")) {
                emitBuy(actual);
                store.set("largo");
                store.unset("corto");
            } else if (actual >= superior && !store.is("corto")) {
                emitSell(actual);
                store.set("corto");
                store.unset("largo");
            }
        }
    }
}
```

## 5. Doble EMA configurable con propiedades

Parámetros de estrategia configurables en el momento del envío mediante `@StrategyProperty`.

```java
import com.wualabs.qtsurfer.engine.indicators.helpers.group.InstrumentGroupRTIndicator;
import com.wualabs.qtsurfer.engine.strategy.AbstractWindowListener;
import com.wualabs.qtsurfer.engine.strategy.AbstractTickerStrategy;
import com.wualabs.qtsurfer.engine.strategy.CrossDetector;
import com.wualabs.qtsurfer.engine.strategy.StrategyProperty;
import com.wualabs.qtsurfer.engine.core.state.StateStore;

import java.time.Duration;

public class ConfigurableEmaStrategy extends AbstractTickerStrategy {

    // La anotación es toda la declaración: sin accesores, y el valor por defecto escrito una
    // sola vez, en defaultValue en lugar de en un inicializador de campo que lo sobrescribiría.
    @StrategyProperty(name = "ema.rapida", description = "Periodo de la EMA rápida", defaultValue = "9")
    private int periodoRapido;

    @StrategyProperty(name = "ema.lenta", description = "Periodo de la EMA lenta", defaultValue = "21")
    private int periodoLento;

    @StrategyProperty(name = "ventana.segundos", description = "Ventana en segundos", defaultValue = "1")
    private int segundosVentana;

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators
            .addPrice()
            .ema("rapida", periodoRapido)
            .ema("lenta", periodoLento)
            .window("rapida", Duration.ofSeconds(segundosVentana),
                new CrossListener(this, indicators));
    }

    private class CrossListener extends AbstractWindowListener {
        private final CrossDetector cruce = new CrossDetector();

        CrossListener(AbstractTickerStrategy s, InstrumentGroupRTIndicator ind) {
            super(s, ind);
        }

        @Override
        public void onChange(StateStore store, double prev, double actual) {
            if (!indicators.getExisting("lenta").isReady()) return;
            double lenta = indicators.getValue("lenta");
            CrossDetector.Cross resultado = cruce.check(actual, lenta);
            if (resultado.above()) emitBuy(actual);
            if (resultado.below()) emitSell(actual);
        }
    }
}
```
