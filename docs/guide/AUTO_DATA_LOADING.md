# 🚀 Auto Data Loading & Indicator Recalculation

## Overview

TradingVue.js теперь поддерживает **автоматическую загрузку данных** и **пересчёт индикаторов** при смене таймфрейма!

```
┌────────────────────────────────────────────────────────────────┐
│                     User clicks new TF                         │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│   1. DataProvider loads OHLCV data for new timeframe           │
│      - Checks cache first                                      │
│      - Uses custom loader if provided                          │
│      - Generates demo data if no loader                        │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│   2. Chart updates with new data                               │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│   3. IndicatorManager recalculates ALL active indicators       │
│      - EMA, SMA, RSI, MACD, BB, ATR, Stoch, etc.               │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│   4. Chart re-renders                                          │
└────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

```vue
<template>
  <trading-vue
    :data="chart"
    :timeframes="true"
    :auto-load-data="true"
    :auto-recalc-indicators="true"
    symbol="BTC/USDT"
    @timeframe-change="onTFChange"
    @data-loaded="onDataLoaded"
  />
</template>

<script>
import TradingVue from 'trading-vue-js'
import DataCube from 'trading-vue-js/src/helpers/datacube.js'

export default {
  components: { TradingVue },
  data() {
    return {
      chart: new DataCube({
        chart: { type: 'Candles', data: [] },
        onchart: [],
        offchart: []
      })
    }
  },
  mounted() {
    // Add some indicators
    this.$refs.tv.addIndicator('EMA', { length: 20 })
    this.$refs.tv.addIndicator('RSI', { length: 14 })
    this.$refs.tv.addIndicator('MACD')
  },
  methods: {
    onTFChange(tf) {
      console.log('TF changed to:', tf)
    },
    onDataLoaded({ tf, data }) {
      console.log('Loaded:', data.length, 'candles')
    }
  }
}
</script>
```

---

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `timeframes` | Boolean | `false` | Enable TF selector |
| `timeframe` | String | `'1D'` | Current TF (v-model) |
| `timeframe-style` | String | `'dropdown'` | `'dropdown'` or `'full'` |
| `auto-load-data` | Boolean | `true` | Auto load data on TF change |
| `auto-recalc-indicators` | Boolean | `true` | Auto recalculate indicators |
| `data-loader` | Function | `null` | Custom data loader |
| `symbol` | String | `'BTC/USDT'` | Trading symbol |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `timeframe-change` | `tf: string` | TF changed |
| `loading-start` | `tf: string` | Data loading started |
| `loading-end` | `tf: string` | Data loading finished |
| `data-loaded` | `{ tf, data }` | Data loaded successfully |
| `loading-error` | `{ tf, error }` | Loading failed |

### Methods

| Method | Arguments | Returns | Description |
|--------|-----------|---------|-------------|
| `addIndicator(type, params, settings)` | string, object, object | string (id) | Add indicator |
| `removeIndicator(id)` | string | boolean | Remove indicator |
| `clearIndicators()` | - | void | Remove all indicators |
| `getIndicators()` | - | array | Get active indicators |
| `setDataLoader(loader)` | function | void | Set custom loader |

---

## Built-in Indicators

| Type | Params | Position | Description |
|------|--------|----------|-------------|
| `EMA` | `length: 20` | onchart | Exponential Moving Average |
| `SMA` | `length: 50` | onchart | Simple Moving Average |
| `WMA` | `length: 20` | onchart | Weighted Moving Average |
| `BB` | `length: 20, mult: 2` | onchart | Bollinger Bands |
| `RSI` | `length: 14` | offchart | Relative Strength Index |
| `MACD` | `fast: 12, slow: 26, signal: 9` | offchart | MACD |
| `ATR` | `length: 14` | offchart | Average True Range |
| `Stoch` | `k: 14, d: 3, smooth: 3` | offchart | Stochastic |
| `VolMA` | `length: 20` | offchart | Volume MA |

---

## Custom Data Loader

Connect to your API or exchange:

```javascript
<template>
  <trading-vue
    :data="chart"
    :data-loader="loadData"
    symbol="BTC/USDT"
    :timeframes="true"
  />
</template>

<script>
export default {
  methods: {
    async loadData(symbol, tf) {
      // Example: Binance API
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol.replace('/', '')}&interval=${tf}&limit=500`
      )
      const data = await response.json()

      // Convert to OHLCV format
      return data.map(candle => [
        candle[0],   // timestamp
        parseFloat(candle[1]),  // open
        parseFloat(candle[2]),  // high
        parseFloat(candle[3]),  // low
        parseFloat(candle[4]),  // close
        parseFloat(candle[5])   // volume
      ])
    }
  }
}
</script>
```

---

## Custom Indicators

Register your own indicators:

```javascript
// Get IndicatorManager
const im = this.$refs.tv.getIndicatorManager()

// Register custom indicator
im.register('MyIndicator', {
  name: 'My Custom Indicator',
  params: { period: 14 },
  position: 'offchart',
  calc: (ohlcv, params) => {
    // Your calculation logic
    return ohlcv.map(candle => [candle[0], myValue])
  },
  defaultSettings: { color: '#ff0000' }
})

// Now you can use it
this.$refs.tv.addIndicator('MyIndicator', { period: 21 })
```

---

## Example: Complete Trading App

```vue
<template>
  <div class="app">
    <trading-vue
      ref="tv"
      :data="chart"
      :width="width"
      :height="height"
      :toolbar="true"
      :timeframes="true"
      :timeframe="currentTF"
      :symbol="symbol"
      :data-loader="fetchCandles"
      :auto-load-data="true"
      :auto-recalc-indicators="true"
      @timeframe-change="onTFChange"
      @data-loaded="onDataLoaded"
    />

    <div class="controls">
      <select v-model="symbol">
        <option>BTC/USDT</option>
        <option>ETH/USDT</option>
      </select>

      <button @click="addEMA">+ EMA</button>
      <button @click="addRSI">+ RSI</button>
      <button @click="clear">Clear</button>
    </div>
  </div>
</template>

<script>
import TradingVue from 'trading-vue-js'
import DataCube from 'trading-vue-js/src/helpers/datacube.js'

export default {
  components: { TradingVue },

  data() {
    return {
      chart: new DataCube({
        chart: { type: 'Candles', data: [] },
        onchart: [],
        offchart: []
      }),
      width: window.innerWidth,
      height: window.innerHeight,
      symbol: 'BTC/USDT',
      currentTF: '1D'
    }
  },

  methods: {
    async fetchCandles(symbol, tf) {
      // Your API call here
      const data = await fetchFromYourAPI(symbol, tf)
      return data
    },

    addEMA() {
      this.$refs.tv.addIndicator('EMA', { length: 20 })
    },

    addRSI() {
      this.$refs.tv.addIndicator('RSI', { length: 14 })
    },

    clear() {
      this.$refs.tv.clearIndicators()
    },

    onTFChange(tf) {
      this.currentTF = tf
    },

    onDataLoaded({ tf, data }) {
      console.log(`Loaded ${data.length} candles`)
    }
  }
}
</script>
```

---

## Architecture

```
src/
├── helpers/
│   ├── DataProvider.js      # Auto data loading
│   ├── IndicatorManager.js  # Indicator management
│   └── datacube.js          # Data container
├── components/
│   ├── TFSelector.vue       # Full TF selector
│   └── TFSelectorDropdown.vue
└── TradingVue.vue           # Main component (integrated)
```

---

## Performance Tips

1. **Cache is enabled by default** - data is cached per symbol/TF
2. **Limit indicators** - 5-10 for best performance
3. **Use WebWorker** for heavy calculations (built-in)
4. **Custom loader** should return reasonable data size (500-1000 candles)

---

## Testing

```bash
cd trading-vue-js
npm install
npm run test

# Select "TimeframesDemo" test
```

Console commands:
```javascript
// Get instances
window.tv               // TradingVue component
window.dc               // DataCube
window.tvDataProvider   // DataProvider
window.tvIndicatorManager  // IndicatorManager

// Add indicators
tv.addIndicator('EMA', { length: 20 })
tv.addIndicator('MACD')

// Get active indicators
tv.getIndicators()

// Clear all
tv.clearIndicators()
```
