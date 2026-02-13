<template>
<div class="demo-container">
    <!-- Drawing Toolbar (Left Side) -->
    <drawing-toolbar
        v-if="showDrawingTools"
        class="drawing-toolbar-container"
        :active-tool="activeTool"
        :current-color="drawingColor"
        :current-width="drawingWidth"
        :night="true"
        @tool-select="onToolSelect"
        @color-change="onColorChange"
        @width-change="onWidthChange"
        @undo="undoDrawing"
        @redo="redoDrawing"
        @clear-all="clearDrawings"
    />

    <trading-vue
        :data="chart"
        :width="chartWidth"
        :height="height"
        :toolbar="true"
        :timeframes="true"
        :timeframe="selectedTF"
        :timeframe-style="tfStyle"
        :timeframe-extended="true"
        :symbol="symbol"
        :auto-load-data="autoLoad"
        :auto-recalc-indicators="true"
        :data-loader="customLoader"
        :show-watchlist="showWatchlist"
        :watchlist-width="watchlistWidth"
        :watchlist-tickers="watchlistTickers"
        :exchange-name="currentExchangeName"
        :overlays="drawingOverlays"
        :color-back="colors.colorBack"
        :color-grid="colors.colorGrid"
        :color-text="colors.colorText"
        @timeframe-change="onTFChange"
        @loading-start="onLoadingStart"
        @loading-end="onLoadingEnd"
        @data-loaded="onDataLoaded"
        @ticker-select="onTickerSelect"
        ref="tradingVue">
    </trading-vue>

    <!-- Top Bar -->
    <div class="top-bar">
        <div class="exchange-selector" @click="showExchangePanel = !showExchangePanel">
            <span class="exchange-icon">{{ currentExchangeIcon }}</span>
            <span class="exchange-name">{{ currentExchangeName }}</span>
            <span class="dropdown-arrow">▼</span>
        </div>

        <div class="symbol-input">
            <input
                type="text"
                v-model="symbol"
                placeholder="BTC/USDT"
                @keyup.enter="changeSymbol"
            />
        </div>

        <div class="tf-style-select">
            <select v-model="tfStyle">
                <option value="dropdown">Dropdown</option>
                <option value="full">Full Bar</option>
            </select>
        </div>

        <!-- Drawing Tools Toggle -->
        <button class="drawing-toggle" @click="toggleDrawingTools" :class="{ active: showDrawingTools }">
            ✏ Tools
        </button>

        <!-- Watchlist Toggle -->
        <button class="watchlist-toggle" @click="toggleWatchlist" :class="{ active: showWatchlist }">
            ☰ Watchlist
        </button>

        <div class="status-info">
            <span class="tf-badge">{{ selectedTF }}</span>
            <span class="indicator-count">{{ indicatorCount }} indicators</span>
            <span v-if="isLoading" class="loading-indicator">Loading...</span>
        </div>
    </div>

    <!-- Exchange Panel (Dropdown) -->
    <div class="exchange-panel" v-if="showExchangePanel">
        <exchange-manager-component
            ref="exchangeManager"
            @exchange-changed="onExchangeChanged"
            @exchange-added="refreshExchange"
            @exchange-removed="refreshExchange"
        />
    </div>

    <!-- Indicator Settings Modal -->
    <indicator-settings
        :visible="showIndicatorSettings"
        :indicator="selectedIndicator"
        @close="showIndicatorSettings = false"
        @apply="applyIndicatorSettings"
        @remove="removeIndicator"
    />

    <!-- Bottom Control Panel -->
    <div class="control-panel">
        <div class="indicator-buttons">
            <button @click="addInd('EMA')" class="btn btn-ema" title="Exponential MA">EMA</button>
            <button @click="addInd('SMA')" class="btn btn-sma" title="Simple MA">SMA</button>
            <button @click="addInd('WMA')" class="btn btn-wma" title="Weighted MA">WMA</button>
            <button @click="addInd('BB')" class="btn btn-bb" title="Bollinger Bands">BB</button>
            <button @click="addInd('RSI')" class="btn btn-rsi" title="RSI">RSI</button>
            <button @click="addInd('MACD')" class="btn btn-macd" title="MACD">MACD</button>
            <button @click="addInd('ATR')" class="btn btn-atr" title="ATR">ATR</button>
            <button @click="addInd('Stoch')" class="btn btn-stoch" title="Stochastic">Stoch</button>
        </div>

        <button @click="clearAllIndicators" class="btn btn-clear">Clear All</button>
    </div>

    <!-- Active Indicators Panel -->
    <div class="indicators-panel" v-if="indicators.length > 0 && !showWatchlist">
        <h4>📊 Active Indicators</h4>
        <div class="ind-list">
            <div
                v-for="ind in indicators"
                :key="ind.id"
                class="ind-item"
                @click="openIndicatorSettings(ind)"
            >
                <div class="ind-color" :style="{ backgroundColor: ind.settings.color }"></div>
                <span class="ind-name">{{ ind.name }}</span>
                <span class="ind-type">{{ ind.position }}</span>
                <span class="ind-edit">⚙️</span>
            </div>
        </div>
        <p class="hint">Click indicator to edit settings</p>
    </div>

    <!-- Features Panel -->
    <div class="features-panel" v-if="!showWatchlist && !showDrawingTools">
        <h4>✨ Features</h4>
        <ul>
            <li>✅ Auto data loading</li>
            <li>✅ Auto indicator recalc</li>
            <li>🎨 Click indicators to edit</li>
            <li>🔗 Multiple exchanges</li>
            <li>💾 Config auto-save</li>
            <li>📋 Watchlist panel</li>
            <li>✏️ Drawing tools</li>
        </ul>
    </div>
</div>
</template>

<script>
import TradingVue from '../../src/TradingVue.vue'
import DataCube from '../../src/helpers/datacube.js'
import IndicatorSettings from '../../src/components/IndicatorSettings.vue'
import ExchangeManagerComponent from '../../src/components/ExchangeManager.vue'
import DrawingToolbar from '../../src/components/DrawingToolbar.vue'
import ExchangeManager from '../../src/helpers/ExchangeManager.js'

// Import drawing tools
import BrushTool from '../../src/components/overlays/BrushTool.vue'
import HorizontalLine from '../../src/components/overlays/HorizontalLine.vue'
import VerticalLine from '../../src/components/overlays/VerticalLine.vue'
import RectangleTool from '../../src/components/overlays/RectangleTool.vue'
import CircleTool from '../../src/components/overlays/CircleTool.vue'
import TriangleTool from '../../src/components/overlays/TriangleTool.vue'
import TextTool from '../../src/components/overlays/TextTool.vue'
import ArrowTool from '../../src/components/overlays/ArrowTool.vue'
import CalloutTool from '../../src/components/overlays/CalloutTool.vue'


export default {
    name: 'TimeframesDemo',
    description: 'Full demo: Settings UI + Exchange management + Watchlist + Drawing Tools',

    props: ['night'],

    components: {
        TradingVue,
        IndicatorSettings,
        ExchangeManagerComponent,
        DrawingToolbar
    },

    data() {
        return {
            chart: null,
            width: window.innerWidth,
            height: window.innerHeight,
            selectedTF: '1D',
            tfStyle: 'dropdown',
            symbol: 'BTC/USDT',
            isLoading: false,
            indicators: [],
            autoLoad: true,

            // Drawing tools
            showDrawingTools: true,
            activeTool: 'cursor',
            drawingColor: '#2962ff',
            drawingWidth: 2,
            drawingOverlays: [
                BrushTool, HorizontalLine, VerticalLine,
                RectangleTool, CircleTool, TriangleTool,
                TextTool, ArrowTool, CalloutTool
            ],
            drawings: [],

            // Watchlist
            showWatchlist: false,
            watchlistWidth: 280,
            watchlistTickers: [
                { symbol: 'BTC/USDT', exchange: 'binance', price: 67500, change: 2.35, favorite: true },
                { symbol: 'ETH/USDT', exchange: 'binance', price: 3450, change: 1.82, favorite: true },
                { symbol: 'BNB/USDT', exchange: 'binance', price: 580, change: -0.54 },
                { symbol: 'SOL/USDT', exchange: 'binance', price: 145, change: 4.21 },
                { symbol: 'XRP/USDT', exchange: 'binance', price: 0.52, change: -1.15 },
                { symbol: 'ADA/USDT', exchange: 'binance', price: 0.45, change: 0.89 },
                { symbol: 'DOGE/USDT', exchange: 'binance', price: 0.12, change: -2.31 },
                { symbol: 'DOT/USDT', exchange: 'binance', price: 6.85, change: 1.45 },
                { symbol: 'MATIC/USDT', exchange: 'binance', price: 0.72, change: 3.12 },
                { symbol: 'LINK/USDT', exchange: 'binance', price: 14.25, change: -0.78 }
            ],

            // Indicator settings
            showIndicatorSettings: false,
            selectedIndicator: null,

            // Exchange management
            showExchangePanel: false,
            exchangeManager: null,
            currentExchangeName: 'Binance',
            currentExchangeIcon: '🟡',

            // Custom loader
            customLoader: null
        }
    },

    computed: {
        colors() {
            return this.$props.night ? {} : {
                colorBack: '#fff',
                colorGrid: '#eee',
                colorText: '#333'
            }
        },
        indicatorCount() {
            return this.indicators.length
        },
        chartWidth() {
            let width = this.width
            if (this.showWatchlist) width -= this.watchlistWidth
            if (this.showDrawingTools) width -= 60 // Drawing toolbar width
            return width
        }
    },

    methods: {
        onResize() {
            this.width = window.innerWidth
            this.height = window.innerHeight - 50
        },

        // ==================== Drawing Tools ====================

        toggleDrawingTools() {
            this.showDrawingTools = !this.showDrawingTools
        },

        onToolSelect(tool) {
            this.activeTool = tool.type
            console.log('[Demo] Tool selected:', tool)
            // Here you would activate the tool in the chart
        },

        onColorChange(color) {
            this.drawingColor = color
        },

        onWidthChange(width) {
            this.drawingWidth = width
        },

        undoDrawing() {
            console.log('[Demo] Undo drawing')
        },

        redoDrawing() {
            console.log('[Demo] Redo drawing')
        },

        clearDrawings() {
            this.drawings = []
            console.log('[Demo] Clear all drawings')
        },

        // ==================== Watchlist ====================

        toggleWatchlist() {
            this.showWatchlist = !this.showWatchlist
        },

        onTickerSelect(ticker) {
            console.log('[Demo] Ticker selected:', ticker)
            this.symbol = ticker.symbol
            if (ticker.exchange) {
                const exName = this.getExchangeName(ticker.exchange)
                if (exName !== this.currentExchangeName) {
                    this.currentExchangeName = exName
                    this.currentExchangeIcon = this.getExchangeIcon(ticker.exchange)
                }
            }
            this.$nextTick(() => {
                this.$refs.tradingVue?.loadTimeframeData?.(this.selectedTF)
            })
        },

        getExchangeName(id) {
            const names = {
                'binance': 'Binance',
                'binance-futures': 'Binance Futures',
                'bybit': 'Bybit',
                'okx': 'OKX',
                'bitget': 'Bitget',
                'kucoin': 'KuCoin'
            }
            return names[id] || id
        },

        // ==================== Exchange Management ====================

        initExchangeManager() {
            this.exchangeManager = new ExchangeManager()

            this.customLoader = async (symbol, tf) => {
                return this.exchangeManager.fetchKlines(
                    this.exchangeManager.currentExchange,
                    symbol,
                    tf
                )
            }

            this.refreshExchange()
        },

        refreshExchange() {
            const current = this.exchangeManager?.getCurrentExchange()
            if (current) {
                this.currentExchangeName = current.name
                this.currentExchangeIcon = this.getExchangeIcon(current.id)
            }
        },

        getExchangeIcon(id) {
            const icons = {
                'binance': '🟡',
                'binance-futures': '🟡',
                'bybit': '🟠',
                'okx': '⚫',
                'bitget': '🔵',
                'kucoin': '🟢'
            }
            return icons[id] || '🔶'
        },

        onExchangeChanged(id) {
            this.refreshExchange()
            this.showExchangePanel = false
            this.$refs.tradingVue?.loadTimeframeData?.(this.selectedTF)
        },

        changeSymbol() {
            this.$refs.tradingVue?.loadTimeframeData?.(this.selectedTF)
        },

        // ==================== Indicators ====================

        addInd(type) {
            const tv = this.$refs.tradingVue
            if (!tv) return

            const id = tv.addIndicator(type)
            if (id) {
                this.updateIndicatorsList()
            }
        },

        openIndicatorSettings(ind) {
            this.selectedIndicator = ind
            this.showIndicatorSettings = true
        },

        applyIndicatorSettings({ id, params, settings }) {
            const tv = this.$refs.tradingVue
            if (!tv) return

            const im = tv.getIndicatorManager()
            im?.update(id, { params, settings })

            this.updateIndicatorsList()
        },

        removeIndicator(id) {
            const tv = this.$refs.tradingVue
            if (!tv) return

            tv.removeIndicator(id)
            this.updateIndicatorsList()
            this.showIndicatorSettings = false
        },

        clearAllIndicators() {
            const tv = this.$refs.tradingVue
            if (!tv) return

            tv.clearIndicators()
            this.indicators = []
        },

        updateIndicatorsList() {
            const tv = this.$refs.tradingVue
            if (!tv) return

            this.indicators = tv.getIndicators()
        },

        // ==================== Events ====================

        onTFChange(tf) {
            this.selectedTF = tf
        },

        onLoadingStart(tf) {
            this.isLoading = true
        },

        onLoadingEnd(tf) {
            this.isLoading = false
        },

        onDataLoaded({ tf, data }) {
            console.log(`[Demo] Loaded ${data.length} candles for ${tf}`)
        },

        // ==================== Price Updates ====================

        startPriceUpdates() {
            this.priceUpdateInterval = setInterval(() => {
                this.watchlistTickers = this.watchlistTickers.map(ticker => {
                    const priceChange = (Math.random() - 0.5) * 0.002 * ticker.price
                    const newPrice = ticker.price + priceChange
                    const changeDelta = (Math.random() - 0.5) * 0.1
                    const newChange = Math.max(-10, Math.min(10, ticker.change + changeDelta))

                    return {
                        ...ticker,
                        price: parseFloat(newPrice.toFixed(ticker.price < 1 ? 6 : 2)),
                        change: parseFloat(newChange.toFixed(2))
                    }
                })
            }, 3000)
        }
    },

    mounted() {
        window.addEventListener('resize', this.onResize)
        this.onResize()

        // Initialize chart
        this.chart = new DataCube({
            chart: {
                type: 'Candles',
                name: this.symbol,
                data: []
            },
            onchart: [],
            offchart: []
        })

        // Initialize exchange manager
        this.$nextTick(() => {
            this.initExchangeManager()
        })

        // Start price updates
        this.startPriceUpdates()

        // Expose for debugging
        window.tv = this.$refs.tradingVue
        window.dc = this.chart
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.onResize)
        if (this.priceUpdateInterval) {
            clearInterval(this.priceUpdateInterval)
        }
    }
}
</script>

<style scoped>
.demo-container {
    position: relative;
    width: 100%;
    height: 100%;
}

/* Drawing Toolbar Container */
.drawing-toolbar-container {
    position: absolute;
    left: 50px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 150;
}

/* Top Bar */
.top-bar {
    position: absolute;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 10px 16px;
    background: rgba(30, 34, 36, 0.95);
    border-radius: 8px;
    font: 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.exchange-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: #2a2e39;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
}

.exchange-selector:hover {
    background: #363a45;
}

.exchange-icon {
    font-size: 16px;
}

.exchange-name {
    color: #d1d4dc;
    font-weight: 500;
}

.dropdown-arrow {
    color: #787b86;
    font-size: 10px;
}

.symbol-input input {
    width: 100px;
    padding: 6px 12px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 6px;
    color: #d1d4dc;
    font-size: 13px;
    font-weight: 500;
}

.symbol-input input:focus {
    border-color: #2962ff;
    outline: none;
}

.tf-style-select select {
    padding: 6px 12px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 6px;
    color: #d1d4dc;
    font-size: 12px;
}

.drawing-toggle {
    padding: 6px 12px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 6px;
    color: #787b86;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
}

.drawing-toggle:hover {
    background: #363a45;
    color: #d1d4dc;
}

.drawing-toggle.active {
    background: #aa00ff;
    border-color: #aa00ff;
    color: #fff;
}

.watchlist-toggle {
    padding: 6px 12px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 6px;
    color: #787b86;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
}

.watchlist-toggle:hover {
    background: #363a45;
    color: #d1d4dc;
}

.watchlist-toggle.active {
    background: #2962ff;
    border-color: #2962ff;
    color: #fff;
}

.status-info {
    display: flex;
    gap: 10px;
    align-items: center;
}

.tf-badge {
    padding: 4px 10px;
    background: #2962ff;
    border-radius: 4px;
    font-weight: 600;
    color: #fff;
}

.indicator-count {
    color: #787b86;
}

.loading-indicator {
    padding: 4px 10px;
    background: #ff6d00;
    border-radius: 4px;
    font-weight: 500;
    color: #fff;
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Exchange Panel */
.exchange-panel {
    position: absolute;
    top: 110px;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    z-index: 200;
}

/* Control Panel */
.control-panel {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 16px;
    background: rgba(30, 34, 36, 0.95);
    border-radius: 8px;
    z-index: 100;
}

.indicator-buttons {
    display: flex;
    gap: 4px;
}

.btn {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.btn-ema { background: #2962ff; color: #fff; }
.btn-sma { background: #ff6d00; color: #fff; }
.btn-wma { background: #00c853; color: #fff; }
.btn-bb { background: #aa00ff; color: #fff; }
.btn-rsi { background: #00b8d4; color: #fff; }
.btn-macd { background: #ff1744; color: #fff; }
.btn-atr { background: #ffd600; color: #000; }
.btn-stoch { background: #76ff03; color: #000; }
.btn-clear { background: #565c68; color: #fff; }

.btn:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

/* Indicators Panel */
.indicators-panel {
    position: absolute;
    top: 110px;
    right: 10px;
    width: 220px;
    padding: 12px;
    background: rgba(30, 34, 36, 0.95);
    border-radius: 8px;
    z-index: 100;
}

.indicators-panel h4 {
    margin: 0 0 10px 0;
    font-size: 12px;
    color: #fff;
}

.ind-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 200px;
    overflow-y: auto;
}

.ind-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #2a2e39;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.15s;
}

.ind-item:hover {
    background: #363a45;
}

.ind-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.ind-name {
    flex: 1;
    font-size: 11px;
    color: #d1d4dc;
}

.ind-type {
    font-size: 9px;
    color: #787b86;
    text-transform: uppercase;
}

.ind-edit {
    opacity: 0;
    transition: opacity 0.15s;
}

.ind-item:hover .ind-edit {
    opacity: 1;
}

.hint {
    margin: 8px 0 0 0;
    font-size: 10px;
    color: #787b86;
    text-align: center;
}

/* Features Panel */
.features-panel {
    position: absolute;
    top: 110px;
    left: 10px;
    padding: 12px;
    background: rgba(30, 34, 36, 0.95);
    border-radius: 8px;
    z-index: 100;
}

.features-panel h4 {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: #fff;
}

.features-panel ul {
    margin: 0;
    padding-left: 16px;
    font-size: 11px;
    color: #a0a4aa;
}

.features-panel li {
    margin: 4px 0;
}

/* Responsive */
@media only screen and (max-width: 768px) {
    .top-bar {
        flex-wrap: wrap;
        justify-content: center;
        width: 90%;
        gap: 8px;
    }

    .control-panel {
        width: 90%;
        flex-wrap: wrap;
        justify-content: center;
    }

    .indicator-buttons {
        flex-wrap: wrap;
        justify-content: center;
    }

    .indicators-panel,
    .features-panel {
        display: none;
    }

    .drawing-toolbar-container {
        left: 10px;
        top: auto;
        bottom: 80px;
        transform: none;
    }

    .exchange-panel {
        width: 90%;
    }
}
</style>
