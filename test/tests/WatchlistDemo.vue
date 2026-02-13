<template>
    <div class="watchlist-demo">
        <div class="demo-header">
            <h1>TradingVue - Watchlist Panel Demo</h1>
            <div class="controls">
                <label>
                    <input type="checkbox" v-model="showWatchlist" />
                    Показать панель избранного
                </label>
                <label>
                    <input type="checkbox" v-model="nightMode" />
                    Тёмная тема
                </label>
            </div>
        </div>

        <div class="chart-container" :style="{ height: chartHeight + 'px' }">
            <trading-vue
                ref="tv"
                :data="dc"
                :width="chartWidth"
                :height="chartHeight"
                :title-txt="currentSymbol"
                :timeframes="true"
                :timeframe="currentTimeframe"
                :timeframe-style="'dropdown'"
                :symbol="currentSymbol"
                :show-watchlist="showWatchlist"
                :watchlist-width="watchlistWidth"
                :watchlist-tickers="watchlistTickers"
                :exchange-name="exchangeName"
                :popular-tickers="popularTickers"
                :night="nightMode"
                :colors="colors"
                @ticker-select="onTickerSelect"
                @ticker-add="onTickerAdd"
                @ticker-remove="onTickerRemove"
                @timeframe-change="onTimeframeChange"
            ></trading-vue>
        </div>

        <div class="demo-info">
            <div class="info-section">
                <h3>Функции панели:</h3>
                <ul>
                    <li>Изменение ширины перетаскиванием левого края</li>
                    <li>Добавление тикеров через модальное окно</li>
                    <li>Удаление через контекстное меню (правый клик)</li>
                    <li>Переключение активного тикера кликом</li>
                    <li>Поиск по тикерам</li>
                    <li>Сворачивание/разворачивание панели</li>
                </ul>
            </div>
            <div class="info-section">
                <h3>Активный символ: {{ currentSymbol }}</h3>
                <p>Таймфрейм: {{ currentTimeframe }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import TradingVue from '../../src/TradingVue.vue'
import DataCube from '../../src/helpers/datacube.js'

// Generate demo OHLCV data
function generateData(symbol, tf = '1D', points = 500) {
    const tfMs = {
        '1m': 60000,
        '5m': 300000,
        '15m': 900000,
        '1H': 3600000,
        '4H': 14400000,
        '1D': 86400000,
        '1W': 604800000,
    }
    const interval = tfMs[tf] || tfMs['1D']
    const now = Date.now()
    const data = []

    // Different base prices for different symbols
    const basePrices = {
        'BTC/USDT': 45000,
        'ETH/USDT': 3200,
        'BNB/USDT': 420,
        'XRP/USDT': 0.85,
        'SOL/USDT': 150,
        'ADA/USDT': 1.2,
        'DOGE/USDT': 0.12,
        'DOT/USDT': 25,
        'MATIC/USDT': 1.5,
        'LINK/USDT': 18,
    }

    let price = basePrices[symbol] || 100
    const volatility = price * 0.02

    for (let i = points; i >= 0; i--) {
        const timestamp = now - i * interval
        const change = (Math.random() - 0.5) * volatility
        const open = price
        price = price + change
        const close = price
        const high = Math.max(open, close) + Math.random() * volatility * 0.5
        const low = Math.min(open, close) - Math.random() * volatility * 0.5
        const volume = Math.random() * 1000000 + 500000

        data.push([
            timestamp,
            parseFloat(open.toFixed(8)),
            parseFloat(high.toFixed(8)),
            parseFloat(low.toFixed(8)),
            parseFloat(close.toFixed(8)),
            Math.floor(volume)
        ])
    }

    return data
}

// Generate ticker price data
function generateTickerData() {
    const tickers = [
        { symbol: 'BTC/USDT', name: 'Bitcoin', basePrice: 45000 },
        { symbol: 'ETH/USDT', name: 'Ethereum', basePrice: 3200 },
        { symbol: 'BNB/USDT', name: 'Binance Coin', basePrice: 420 },
        { symbol: 'XRP/USDT', name: 'Ripple', basePrice: 0.85 },
        { symbol: 'SOL/USDT', name: 'Solana', basePrice: 150 },
        { symbol: 'ADA/USDT', name: 'Cardano', basePrice: 1.2 },
        { symbol: 'DOGE/USDT', name: 'Dogecoin', basePrice: 0.12 },
        { symbol: 'DOT/USDT', name: 'Polkadot', basePrice: 25 },
        { symbol: 'MATIC/USDT', name: 'Polygon', basePrice: 1.5 },
        { symbol: 'LINK/USDT', name: 'Chainlink', basePrice: 18 },
    ]

    return tickers.map(t => {
        const change = (Math.random() - 0.5) * 10
        const price = t.basePrice * (1 + change / 100)
        return {
            symbol: t.symbol,
            name: t.name,
            price: price,
            change: change
        }
    })
}

export default {
    name: 'WatchlistDemo',
    components: { TradingVue },
    data() {
        return {
            dc: null,
            currentSymbol: 'BTC/USDT',
            currentTimeframe: '1D',
            showWatchlist: true,
            nightMode: true,
            chartWidth: 800,
            chartHeight: 500,
            watchlistWidth: 280,
            exchangeName: 'Binance',
            popularTickers: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT'],
            watchlistTickers: [],
            updateInterval: null
        }
    },
    computed: {
        colors() {
            return this.nightMode ? {
                back: '#121826',
                grid: '#2f3240',
                text: '#dedddd',
                textHL: '#fff',
                scale: '#838383',
                cross: '#8091a0',
                candleUp: '#23a776',
                candleDw: '#e54150',
                wickUp: '#23a77688',
                wickDw: '#e5415088',
                volUp: '#79999e42',
                volDw: '#ef535042',
                panel: '#565c68'
            } : {
                back: '#ffffff',
                grid: '#e0e0e0',
                text: '#333',
                textHL: '#000',
                scale: '#888',
                cross: '#ccc',
                candleUp: '#23a776',
                candleDw: '#e54150',
                wickUp: '#23a77688',
                wickDw: '#e5415088',
                volUp: '#79999e42',
                volDw: '#ef535042',
                panel: '#f0f0f0'
            }
        }
    },
    created() {
        // Initialize data
        this.loadData()
        this.watchlistTickers = generateTickerData()

        // Update prices periodically
        this.updateInterval = setInterval(() => {
            this.updatePrices()
        }, 5000)
    },
    mounted() {
        // Adjust chart width on window resize
        this.updateChartWidth()
        window.addEventListener('resize', this.updateChartWidth)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.updateChartWidth)
        if (this.updateInterval) {
            clearInterval(this.updateInterval)
        }
    },
    methods: {
        loadData() {
            const data = generateData(this.currentSymbol, this.currentTimeframe)
            this.dc = new DataCube({
                ohlcv: data,
                onchart: [],
                offchart: []
            })
        },
        updateChartWidth() {
            const containerWidth = window.innerWidth - 40
            this.chartWidth = this.showWatchlist
                ? containerWidth - this.watchlistWidth
                : containerWidth
        },
        updatePrices() {
            // Simulate price updates
            this.watchlistTickers = this.watchlistTickers.map(t => {
                const priceChange = (Math.random() - 0.5) * 0.002
                const newPrice = t.price * (1 + priceChange)
                const changeAdjust = (Math.random() - 0.5) * 0.1
                return {
                    ...t,
                    price: newPrice,
                    change: t.change + changeAdjust
                }
            })
        },
        onTickerSelect(ticker) {
            console.log('Selected ticker:', ticker.symbol)
            this.currentSymbol = ticker.symbol
            this.loadData()
        },
        onTickerAdd(symbol) {
            console.log('Add ticker:', symbol)
            // Check if already exists
            if (this.watchlistTickers.some(t => t.symbol === symbol)) {
                return
            }
            // Add new ticker with simulated data
            const basePrices = {
                'BTC/USDT': 45000,
                'ETH/USDT': 3200,
                'BNB/USDT': 420,
                'XRP/USDT': 0.85,
                'SOL/USDT': 150,
            }
            const basePrice = basePrices[symbol] || 100
            const change = (Math.random() - 0.5) * 10
            this.watchlistTickers.push({
                symbol,
                name: symbol.split('/')[0],
                price: basePrice * (1 + change / 100),
                change
            })
        },
        onTickerRemove(ticker, index) {
            console.log('Remove ticker:', ticker.symbol)
            this.watchlistTickers.splice(index, 1)
        },
        onTimeframeChange(tf) {
            console.log('Timeframe changed:', tf)
            this.currentTimeframe = tf
            this.loadData()
        }
    },
    watch: {
        showWatchlist() {
            this.$nextTick(() => {
                this.updateChartWidth()
            })
        }
    }
}
</script>

<style scoped>
.watchlist-demo {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 20px;
    background: #0d1117;
    min-height: 100vh;
}

.demo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #21262d;
}

.demo-header h1 {
    color: #58a6ff;
    margin: 0;
    font-size: 20px;
}

.controls {
    display: flex;
    gap: 20px;
}

.controls label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #8b949e;
    cursor: pointer;
}

.controls input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.chart-container {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.demo-info {
    display: flex;
    gap: 40px;
    margin-top: 20px;
    padding: 20px;
    background: #161b22;
    border-radius: 8px;
    border: 1px solid #21262d;
}

.info-section {
    flex: 1;
}

.info-section h3 {
    color: #58a6ff;
    margin: 0 0 10px;
    font-size: 14px;
}

.info-section ul {
    margin: 0;
    padding-left: 20px;
    color: #8b949e;
    font-size: 13px;
    line-height: 1.6;
}

.info-section p {
    color: #8b949e;
    margin: 5px 0;
    font-size: 13px;
}
</style>
