<template>
    <div class="app">
        <!-- Header -->
        <div class="header">
            <h1>📈 BTC/USDT Real Data Demo</h1>
            <div class="header-info">
                <span class="date-range">{{ dateRange }}</span>
                <span class="data-source">Data: Binance 2017-2026</span>
            </div>
        </div>

        <!-- Top Toolbar -->
        <div class="toolbar">
            <!-- Timeframe Selector -->
            <div class="tf-group">
                <span class="label">Timeframe:</span>
                <div class="tf-buttons">
                    <button
                        v-for="tf in timeframes"
                        :key="tf.value"
                        :class="['tf-btn', { active: currentTF === tf.value }]"
                        @click="changeTimeframe(tf.value)"
                    >
                        {{ tf.label }}
                    </button>
                </div>
            </div>

            <!-- Indicator Controls -->
            <div class="indicator-group">
                <span class="label">Indicators:</span>
                <label class="checkbox-label">
                    <input type="checkbox" v-model="showBB"> BB (20, 2)
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" v-model="showEMA20"> EMA 20
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" v-model="showEMA50"> EMA 50
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" v-model="showVolume"> Volume
                </label>
            </div>

            <!-- Screenshot Button -->
            <button class="screenshot-btn" @click="takeScreenshot" :disabled="screenshotLoading">
                📷 {{ screenshotLoading ? 'Saving...' : 'Screenshot' }}
            </button>

            <!-- Data Info -->
            <div class="data-info">
                <span class="candles-count">{{ candlesCount }} candles</span>
                <span class="price-info" v-if="lastPrice">
                    Last: ${{ lastPrice.toFixed(2) }}
                </span>
            </div>
        </div>

        <!-- Main Chart Area -->
        <div class="chart-container" ref="chartContainer">
            <trading-vue
                ref="chart"
                :titleTxt="chartTitle"
                :data="chartData"
                :width="chartWidth"
                :height="chartHeight"
                :colorBack="colors.back"
                :colorGrid="colors.grid"
                :colorText="colors.text"
                :colorCross="colors.cross"
                :colorCandleUp="colors.candleUp"
                :colorCandleDw="colors.candleDw"
                :colorWickUp="colors.candleUp"
                :colorWickDw="colors.candleDw"
                :font="font"
                :overlays="overlays"
                :legendButtons="true"
                @range-changed="onRangeChange"
            ></trading-vue>
        </div>

        <!-- Status Bar -->
        <div class="status-bar">
            <div class="status-left">
                <span>📊 {{ currentTF }}</span>
                <span v-if="rangeInfo">
                    | Visible: {{ rangeInfo.start }} - {{ rangeInfo.end }}
                </span>
                <span v-if="screenshotPath" class="screenshot-path">
                    | 📷 Saved: {{ screenshotPath }}
                </span>
            </div>
            <div class="status-right">
                <span>Loading: {{ loading ? '...' : 'Ready' }}</span>
            </div>
        </div>

        <!-- Loading Overlay -->
        <div class="loading-overlay" v-if="loading">
            <div class="spinner"></div>
            <span>Loading {{ currentTF }} data...</span>
        </div>

        <!-- Hidden canvas for screenshot -->
        <canvas ref="screenshotCanvas" style="display: none;"></canvas>
    </div>
</template>

<script>
import TradingVue from '../../src/TradingVue.vue'
import DataCube from '../../src/helpers/datacube.js'

// Import data files
import data1m from '../data/data_btc_usdt_1m.json'
import data5m from '../data/data_btc_usdt_5m.json'
import data15m from '../data/data_btc_usdt_15m.json'
import data1h from '../data/data_btc_usdt_1h.json'
import data4h from '../data/data_btc_usdt_4h.json'
import data1d from '../data/data_btc_usdt_1d.json'

// Bollinger Bands overlay component
const BollingerBandsOverlay = {
    name: 'BollingerBands',
    mixins: [require('../../src/mixins/overlay.js').default],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },
        draw(ctx) {
            const data = this.$props.data
            if (!data || data.length === 0) return

            const layout = this.$props.layout
            const upper = []
            const middle = []
            const lower = []

            for (const point of data) {
                if (point && point.length >= 4) {
                    const x = layout.t2screen(point[0])
                    upper.push({ x, y: layout.$2screen(point[1]) })
                    middle.push({ x, y: layout.$2screen(point[2]) })
                    lower.push({ x, y: layout.$2screen(point[3]) })
                }
            }

            if (upper.length === 0) return

            // Fill between bands
            ctx.fillStyle = this.fill_color
            ctx.beginPath()
            ctx.moveTo(upper[0].x, upper[0].y)
            for (let i = 1; i < upper.length; i++) {
                ctx.lineTo(upper[i].x, upper[i].y)
            }
            for (let i = lower.length - 1; i >= 0; i--) {
                ctx.lineTo(lower[i].x, lower[i].y)
            }
            ctx.closePath()
            ctx.fill()

            // Draw bands
            const colors = [this.upper_color, this.middle_color, this.lower_color]
            const lines = [upper, middle, lower]

            lines.forEach((line, idx) => {
                ctx.strokeStyle = colors[idx]
                ctx.lineWidth = this.line_width
                ctx.beginPath()
                ctx.moveTo(line[0].x, line[0].y)
                for (let i = 1; i < line.length; i++) {
                    ctx.lineTo(line[i].x, line[i].y)
                }
                ctx.stroke()
            })
        },
        use_for() { return ['BollingerBands', 'BB', 'BOLL'] },
        data_colors() { return [this.upper_color, this.middle_color, this.lower_color] }
    },
    computed: {
        sett() { return this.$props.settings || {} },
        line_width() { return this.sett.lineWidth || 1.5 },
        upper_color() { return this.sett.upperColor || '#2962ff' },
        middle_color() { return this.sett.middleColor || '#2962ff' },
        lower_color() { return this.sett.lowerColor || '#2962ff' },
        fill_color() { return this.sett.fillColor || 'rgba(41, 98, 255, 0.15)' }
    },
    data() { return {} }
}

export default {
    name: 'BTCRealDataDemo',
    components: { TradingVue },

    // Test router metadata
    icon: '🚀',
    name: 'BTC Real Data',
    description: 'BTC/USDT historical data 2017-2026 with indicators',

    data() {
        return {
            // Chart dimensions
            chartWidth: 1200,
            chartHeight: 600,

            // Current state
            currentTF: '1D',
            loading: false,
            screenshotLoading: false,
            screenshotPath: '',

            // Data storage
            rawData: {
                '1m': data1m.data,
                '5m': data5m.data,
                '15m': data15m.data,
                '1h': data1h.data,
                '4h': data4h.data,
                '1D': data1d.data
            },

            // Chart data object
            chartData: new DataCube({
                chart: {
                    name: 'BTC/USDT',
                    type: 'Candles',
                    data: []
                },
                onchart: [],
                offchart: []
            }),

            // Timeframes
            timeframes: [
                { label: '1m', value: '1m' },
                { label: '5m', value: '5m' },
                { label: '15m', value: '15m' },
                { label: '1h', value: '1h' },
                { label: '4h', value: '4h' },
                { label: '1D', value: '1D' }
            ],

            // Indicator toggles
            showBB: true,
            showEMA20: false,
            showEMA50: false,
            showVolume: true,

            // Colors
            colors: {
                back: '#131722',
                grid: '#1e222d',
                text: '#d1d4dc',
                cross: '#758696',
                candleUp: '#089981',
                candleDw: '#f23645'
            },

            font: '12px -apple-system, BlinkMacSystemFont, sans-serif',

            // Range info
            rangeInfo: null,

            // Custom overlays
            overlays: [BollingerBandsOverlay]
        }
    },

    computed: {
        chartTitle() {
            return `BTC/USDT - ${this.currentTF}`
        },

        candlesCount() {
            const data = this.rawData[this.currentTF]
            return data ? data.length.toLocaleString() : 0
        },

        lastPrice() {
            const data = this.rawData[this.currentTF]
            if (data && data.length > 0) {
                return data[data.length - 1][4]
            }
            return null
        },

        dateRange() {
            const data = this.rawData['1D']
            if (data && data.length > 0) {
                const start = new Date(data[0][0]).getFullYear()
                const end = new Date(data[data.length - 1][0]).getFullYear()
                return `${start} - ${end}`
            }
            return ''
        }
    },

    watch: {
        showBB() { this.updateIndicators() },
        showEMA20() { this.updateIndicators() },
        showEMA50() { this.updateIndicators() },
        showVolume() { this.updateIndicators() }
    },

    mounted() {
        this.initChart()
        this.updateDimensions()
        window.addEventListener('resize', this.updateDimensions)
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.updateDimensions)
    },

    methods: {
        initChart() {
            this.loading = true

            setTimeout(() => {
                this.loadTimeframeData('1D')
                this.loading = false
            }, 100)
        },

        loadTimeframeData(tf) {
            const data = this.rawData[tf]
            if (!data || data.length === 0) return

            const dc = new DataCube({
                chart: {
                    name: 'BTC/USDT',
                    type: 'Candles',
                    data: data
                },
                onchart: [],
                offchart: []
            })

            this.chartData = dc
            this.currentTF = tf

            this.$nextTick(() => {
                this.updateIndicators()
            })
        },

        changeTimeframe(tf) {
            if (tf === this.currentTF) return
            this.loading = true

            setTimeout(() => {
                this.loadTimeframeData(tf)
                this.loading = false
            }, 50)
        },

        updateIndicators() {
            if (!this.chartData) return

            const onchart = []
            const offchart = []

            // Bollinger Bands (20, 2)
            if (this.showBB) {
                const bbData = this.calculateBollingerBands(20, 2)
                onchart.push({
                    name: 'BB (20, 2)',
                    type: 'BollingerBands',
                    data: bbData,
                    settings: {
                        upperColor: '#2962ff',
                        middleColor: '#2962ff',
                        lowerColor: '#2962ff',
                        fillColor: 'rgba(41, 98, 255, 0.15)',
                        lineWidth: 1.5
                    }
                })
            }

            // EMA 20
            if (this.showEMA20) {
                onchart.push({
                    name: 'EMA 20',
                    type: 'EMA',
                    data: this.calculateEMA(20),
                    settings: {
                        color: '#f7931a',
                        lineWidth: 2
                    }
                })
            }

            // EMA 50
            if (this.showEMA50) {
                onchart.push({
                    name: 'EMA 50',
                    type: 'EMA',
                    data: this.calculateEMA(50),
                    settings: {
                        color: '#ff6d00',
                        lineWidth: 2
                    }
                })
            }

            // Volume
            if (this.showVolume) {
                offchart.push({
                    name: 'Volume',
                    type: 'Volume',
                    data: this.rawData[this.currentTF],
                    settings: {
                        colorVolumeUp: 'rgba(8, 153, 129, 0.5)',
                        colorVolumeDw: 'rgba(242, 54, 69, 0.5)'
                    }
                })
            }

            this.chartData.set('onchart', onchart)
            this.chartData.set('offchart', offchart)
        },

        calculateBollingerBands(period, stdDev) {
            const data = this.rawData[this.currentTF]
            if (!data || data.length === 0) return []

            const closes = data.map(d => d[4])
            const bb = []

            for (let i = period - 1; i < closes.length; i++) {
                const slice = closes.slice(i - period + 1, i + 1)
                const sma = slice.reduce((a, b) => a + b, 0) / period
                const squaredDiffs = slice.map(val => Math.pow(val - sma, 2))
                const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period
                const std = Math.sqrt(variance)

                bb.push([
                    data[i][0],
                    sma + stdDev * std,  // Upper
                    sma,                  // Middle
                    sma - stdDev * std   // Lower
                ])
            }

            return bb
        },

        calculateEMA(period) {
            const data = this.rawData[this.currentTF]
            if (!data || data.length === 0) return []

            const closes = data.map(d => d[4])
            const k = 2 / (period + 1)
            const ema = []

            let sum = 0
            for (let i = 0; i < period && i < closes.length; i++) {
                sum += closes[i]
            }
            let prevEma = sum / period
            ema.push([data[period - 1][0], prevEma])

            for (let i = period; i < closes.length; i++) {
                const currentEma = closes[i] * k + prevEma * (1 - k)
                ema.push([data[i][0], currentEma])
                prevEma = currentEma
            }

            return ema
        },

        updateDimensions() {
            if (this.$refs.chartContainer) {
                const rect = this.$refs.chartContainer.getBoundingClientRect()
                this.chartWidth = rect.width
                this.chartHeight = window.innerHeight - 180
            }
        },

        onRangeChange(range) {
            if (range) {
                this.rangeInfo = {
                    start: new Date(range[0]).toLocaleDateString(),
                    end: new Date(range[1]).toLocaleDateString()
                }
            }
        },

        async takeScreenshot() {
            this.screenshotLoading = true
            this.screenshotPath = ''

            try {
                // Wait for chart to render
                await this.$nextTick()
                await new Promise(resolve => setTimeout(resolve, 100))

                // Find the canvas element in TradingVue
                const chartContainer = this.$refs.chartContainer
                const canvas = chartContainer.querySelector('canvas')

                if (!canvas) {
                    throw new Error('Canvas not found')
                }

                // Create a new canvas for screenshot with header
                const screenshotCanvas = this.$refs.screenshotCanvas
                const ctx = screenshotCanvas.getContext('2d')

                const padding = 20
                const headerHeight = 60
                const footerHeight = 40
                const width = canvas.width
                const height = canvas.height + headerHeight + footerHeight + padding * 2

                screenshotCanvas.width = width
                screenshotCanvas.height = height

                // Background
                ctx.fillStyle = '#131722'
                ctx.fillRect(0, 0, width, height)

                // Header
                ctx.fillStyle = '#1e222d'
                ctx.fillRect(0, 0, width, headerHeight + padding)

                // Title
                ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif'
                ctx.fillStyle = '#d1d4dc'
                ctx.fillText('BTC/USDT', padding, padding + 25)

                // Timeframe badge
                ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif'
                ctx.fillStyle = '#2962ff'
                ctx.fillRect(padding, padding + 38, 35, 20)
                ctx.fillStyle = '#fff'
                ctx.fillText(this.currentTF, padding + 8, padding + 52)

                // Price info
                if (this.lastPrice) {
                    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif'
                    ctx.fillStyle = this.colors.candleUp
                    ctx.fillText(`$${this.lastPrice.toLocaleString()}`, padding + 50, padding + 52)
                }

                // Date range
                ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif'
                ctx.fillStyle = '#787b86'
                ctx.fillText(`Binance | 2017-2026 | ${this.candlesCount} candles`, width - 250, padding + 25)

                // Draw indicators list
                const indicators = []
                if (this.showBB) indicators.push('BB(20,2)')
                if (this.showEMA20) indicators.push('EMA 20')
                if (this.showEMA50) indicators.push('EMA 50')
                if (this.showVolume) indicators.push('Volume')

                if (indicators.length > 0) {
                    ctx.fillText(`Indicators: ${indicators.join(', ')}`, width - 250, padding + 45)
                }

                // Draw chart canvas
                ctx.drawImage(canvas, 0, headerHeight + padding)

                // Footer with timestamp
                ctx.fillStyle = '#1e222d'
                ctx.fillRect(0, height - footerHeight, width, footerHeight)
                ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif'
                ctx.fillStyle = '#787b86'
                ctx.fillText(`TradingVue.js | Screenshot: ${new Date().toISOString()}`, padding, height - 15)

                // Watermark
                ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif'
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
                ctx.fillText('TradingVue.js', width - 130, height - 15)

                // Convert to blob and download
                const blob = await new Promise(resolve => {
                    screenshotCanvas.toBlob(resolve, 'image/png', 1.0)
                })

                // Create download link
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `BTC_USDT_${this.currentTF}_${Date.now()}.png`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                this.screenshotPath = link.download

            } catch (error) {
                console.error('Screenshot error:', error)
                alert('Screenshot failed: ' + error.message)
            } finally {
                this.screenshotLoading = false
            }
        }
    }
}
</script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #131722;
    color: #d1d4dc;
}

.app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    background: linear-gradient(135deg, #1e222d 0%, #2a2e39 100%);
    padding: 15px 20px;
    border-bottom: 1px solid #363a45;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    background: linear-gradient(90deg, #f7931a, #ffab40);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.header-info {
    display: flex;
    gap: 20px;
    font-size: 0.9rem;
    color: #787b86;
}

.toolbar {
    background: #1e222d;
    padding: 10px 20px;
    border-bottom: 1px solid #363a45;
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.tf-group, .indicator-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.label {
    color: #787b86;
    font-size: 0.85rem;
    margin-right: 5px;
}

.tf-buttons {
    display: flex;
    gap: 5px;
}

.tf-btn {
    background: #2a2e39;
    border: 1px solid #363a45;
    color: #d1d4dc;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.tf-btn:hover {
    background: #363a45;
    border-color: #4c525e;
}

.tf-btn.active {
    background: #2962ff;
    border-color: #2962ff;
    color: white;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    font-size: 0.85rem;
}

.checkbox-label input {
    accent-color: #2962ff;
}

.screenshot-btn {
    background: linear-gradient(135deg, #2962ff 0%, #1565c0 100%);
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 5px;
}

.screenshot-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #3d7bff 0%, #1e88e5 100%);
    transform: translateY(-1px);
}

.screenshot-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.data-info {
    margin-left: auto;
    display: flex;
    gap: 15px;
    font-size: 0.85rem;
}

.candles-count {
    color: #787b86;
}

.price-info {
    color: #089981;
    font-weight: 600;
}

.chart-container {
    flex: 1;
    position: relative;
    background: #131722;
}

.status-bar {
    background: #1e222d;
    padding: 8px 20px;
    border-top: 1px solid #363a45;
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #787b86;
}

.screenshot-path {
    color: #089981;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(19, 23, 34, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    gap: 15px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #363a45;
    border-top-color: #2962ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
    .toolbar {
        flex-direction: column;
        align-items: flex-start;
    }

    .data-info {
        margin-left: 0;
        width: 100%;
    }

    .header h1 {
        font-size: 1.2rem;
    }

    .screenshot-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
