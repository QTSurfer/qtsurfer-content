---
title: Ejemplos de estrategias
description: Usa estrategias Java completas que muestran el ciclo de vida admitido.
order: 4
lastUpdated: '2026-09-04T10:18:11Z'
upstreamRepository: QTSurfer/strategy-skills
upstreamCommit: 47cc75d5b0a11695ac0f8b5e80513780a3f671b8
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

    private Boolean fastAboveSlow;

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators.addPrice().ema("fast", 9).ema("slow", 21);
    }

    @Override
    public void update(Ticker ticker) {
        Instrument inst = ticker.instrument();
        updateInstrument(inst, ticker.timestamp());
        var ind = updateIndicators(inst, ticker);

        if (!ind.getExisting("slow").isReady()) return;

        boolean currentFastAbove = ind.getValue("fast") > ind.getValue("slow");
        if (fastAboveSlow == null) { fastAboveSlow = currentFastAbove; return; }

        if (currentFastAbove && !fastAboveSlow)  emitBuy(inst, ticker.last());
        if (!currentFastAbove && fastAboveSlow)  emitSell(inst, ticker.last());
        fastAboveSlow = currentFastAbove;
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
            if (actual < 30 && !store.is("inPosition")) {
                emitBuy(indicators.getValue("price"));
                store.set("inPosition");
            }
            if (actual > 70 && store.is("inPosition")) {
                emitSell(indicators.getValue("price"));
                store.unset("inPosition");
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

            double upper = indicators.getValue("bbUpper");
            double lower = indicators.getValue("bbLower");

            if (actual <= lower && !store.is("long")) {
                emitBuy(actual);
                store.set("long");
                store.unset("short");
            } else if (actual >= upper && !store.is("short")) {
                emitSell(actual);
                store.set("short");
                store.unset("long");
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

    // The annotation is the whole declaration: no accessors, and the default written once, on
    // defaultValue rather than on a field initializer that would overwrite it.
    @StrategyProperty(name = "ema.fast", description = "Fast EMA period", defaultValue = "9")
    private int fastPeriod;

    @StrategyProperty(name = "ema.slow", description = "Slow EMA period", defaultValue = "21")
    private int slowPeriod;

    @StrategyProperty(name = "window.seconds", description = "Window in seconds", defaultValue = "1")
    private int windowSeconds;

    @Override
    protected void setupIndicators(InstrumentGroupRTIndicator indicators) {
        indicators
            .addPrice()
            .ema("fast", fastPeriod)
            .ema("slow", slowPeriod)
            .window("fast", Duration.ofSeconds(windowSeconds),
                new CrossListener(this, indicators));
    }

    private class CrossListener extends AbstractWindowListener {
        private final CrossDetector cross = new CrossDetector();

        CrossListener(AbstractTickerStrategy s, InstrumentGroupRTIndicator ind) {
            super(s, ind);
        }

        @Override
        public void onChange(StateStore store, double prev, double actual) {
            if (!indicators.getExisting("slow").isReady()) return;
            double slow = indicators.getValue("slow");
            CrossDetector.Cross result = cross.check(actual, slow);
            if (result.above()) emitBuy(actual);
            if (result.below()) emitSell(actual);
        }
    }
}
```
