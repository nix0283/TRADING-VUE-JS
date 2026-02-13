/**
 * IndicatorManager - Automatic indicator management and recalculation
 *
 * Features:
 * - Register indicators with calculation functions
 * - Auto-recalculate when timeframe/data changes
 * - Support for onchart and offchart indicators
 * - Preset indicator configurations
 * - Auto color assignment for duplicate indicators
 * - Settings update support
 */

export default class IndicatorManager {

    constructor(dataCube, dataProvider) {
        this.dc = dataCube
        this.dp = dataProvider

        // Registered indicators: type -> config
        this.indicators = new Map()

        // Active indicators: id -> config
        this.active = new Map()

        // Counter for unique IDs
        this.counter = 0

        // Color palette for auto-assignment
        this.colorPalette = [
            '#2962ff', '#ff6d00', '#00c853', '#aa00ff',
            '#00b8d4', '#ff1744', '#ffd600', '#76ff03',
            '#e040fb', '#18ffff', '#ff6e40', '#69f0ae',
            '#40c4ff', '#ff4081', '#eeff41', '#b2ff59'
        ]

        // Track color usage per type
        this.colorUsage = new Map()  // type -> [used colors]

        // Register built-in indicators
        this.registerBuiltins()
    }

    /**
     * Register built-in indicators
     */
    registerBuiltins() {
        // EMA - Exponential Moving Average
        this.register('EMA', {
            name: 'EMA',
            params: { length: 20 },
            position: 'onchart',
            calc: (data, params) => this.calcEMA(data, params.length),
            defaultSettings: { width: 2, lineStyle: 'solid', opacity: 100, visible: true }
        })

        // SMA - Simple Moving Average
        this.register('SMA', {
            name: 'SMA',
            params: { length: 50 },
            position: 'onchart',
            calc: (data, params) => this.calcSMA(data, params.length),
            defaultSettings: { width: 2, lineStyle: 'solid', opacity: 100, visible: true }
        })

        // WMA - Weighted Moving Average
        this.register('WMA', {
            name: 'WMA',
            params: { length: 20 },
            position: 'onchart',
            calc: (data, params) => this.calcWMA(data, params.length),
            defaultSettings: { width: 2, lineStyle: 'solid', opacity: 100, visible: true }
        })

        // BB - Bollinger Bands
        this.register('BB', {
            name: 'Bollinger Bands',
            params: { length: 20, mult: 2 },
            position: 'onchart',
            calc: (data, params) => this.calcBB(data, params.length, params.mult),
            defaultSettings: { width: 1, lineStyle: 'solid', opacity: 80, visible: true },
            renderer: 'Channel'
        })

        // RSI - Relative Strength Index
        this.register('RSI', {
            name: 'RSI',
            params: { length: 14 },
            position: 'offchart',
            calc: (data, params) => this.calcRSI(data, params.length),
            defaultSettings: { width: 2, upper: 70, lower: 30, opacity: 100, visible: true, showLegend: true }
        })

        // MACD
        this.register('MACD', {
            name: 'MACD',
            params: { fast: 12, slow: 26, signal: 9 },
            position: 'offchart',
            calc: (data, params) => this.calcMACD(data, params.fast, params.slow, params.signal),
            defaultSettings: { opacity: 100, visible: true, showLegend: true }
        })

        // ATR - Average True Range
        this.register('ATR', {
            name: 'ATR',
            params: { length: 14 },
            position: 'offchart',
            calc: (data, params) => this.calcATR(data, params.length),
            defaultSettings: { width: 2, opacity: 100, visible: true, showLegend: true }
        })

        // Volume MA
        this.register('VolMA', {
            name: 'Volume MA',
            params: { length: 20 },
            position: 'offchart',
            calc: (data, params) => this.calcVolMA(data, params.length),
            defaultSettings: { width: 2, opacity: 100, visible: true, showLegend: true }
        })

        // Stochastic
        this.register('Stoch', {
            name: 'Stochastic',
            params: { k: 14, d: 3, smooth: 3 },
            position: 'offchart',
            calc: (data, params) => this.calcStoch(data, params.k, params.d, params.smooth),
            defaultSettings: { width: 2, upper: 80, lower: 20, opacity: 100, visible: true, showLegend: true }
        })
    }

    /**
     * Get next available color for indicator type
     */
    getNextColor(type) {
        // Get used colors for this type
        if (!this.colorUsage.has(type)) {
            this.colorUsage.set(type, [])
        }

        const usedColors = this.colorUsage.get(type)

        // Find first unused color
        for (const color of this.colorPalette) {
            if (!usedColors.includes(color)) {
                usedColors.push(color)
                return color
            }
        }

        // All colors used, generate a variation
        const baseColor = this.colorPalette[usedColors.length % this.colorPalette.length]
        return this.lightenColor(baseColor, (usedColors.length - this.colorPalette.length) * 0.1)
    }

    /**
     * Lighten a color
     */
    lightenColor(hex, factor) {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)

        const newR = Math.min(255, Math.floor(r + (255 - r) * factor))
        const newG = Math.min(255, Math.floor(g + (255 - g) * factor))
        const newB = Math.min(255, Math.floor(b + (255 - b) * factor))

        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
    }

    /**
     * Release color when indicator is removed
     */
    releaseColor(type, color) {
        if (this.colorUsage.has(type)) {
            const usedColors = this.colorUsage.get(type)
            const index = usedColors.indexOf(color)
            if (index > -1) {
                usedColors.splice(index, 1)
            }
        }
    }

    /**
     * Register custom indicator
     */
    register(type, config) {
        this.indicators.set(type, config)
    }

    /**
     * Add indicator to chart
     * @param {string} type - Indicator type (EMA, RSI, etc.)
     * @param {object} params - Parameters
     * @param {object} settings - Display settings
     * @returns {string} Indicator ID
     */
    add(type, params = {}, settings = {}) {
        const config = this.indicators.get(type)
        if (!config) {
            console.error(`Unknown indicator type: ${type}`)
            return null
        }

        this.counter++
        const id = `${type}_${this.counter}`

        // Merge params
        const finalParams = { ...config.params, ...params }

        // Get auto color if not specified
        let color = settings.color
        if (!color) {
            color = this.getNextColor(type)
        }

        // Merge settings
        const finalSettings = {
            ...config.defaultSettings,
            color,
            ...settings
        }

        // Get current OHLCV data
        const ohlcv = this.dc.data.chart?.data || []

        // Calculate indicator values
        const indicatorData = config.calc(ohlcv, finalParams)

        // Create display name with params
        const displayName = this.formatDisplayName(type, finalParams, this.counter)

        // Create indicator object
        const indicator = {
            id,
            type,
            name: displayName,
            data: indicatorData,
            settings: finalSettings,
            params: finalParams,
            _config: config  // Store config for recalculation
        }

        // Add to DataCube
        this.dc.add(config.position, indicator)
        this.active.set(id, indicator)

        console.log(`[IndicatorManager] Added ${displayName} (${id}) with color ${color}`)

        return id
    }

    /**
     * Format display name with auto-numbering
     */
    formatDisplayName(type, params, count) {
        // Count existing indicators of same type
        let sameTypeCount = 0
        for (const [, ind] of this.active) {
            if (ind.type === type) sameTypeCount++
        }

        // Build param string
        const paramStr = Object.values(params).join(', ')

        // Add number if multiple of same type
        if (sameTypeCount > 0 || count > 1) {
            return `${type}(${paramStr}) #${sameTypeCount + 1}`
        }

        return `${type}(${paramStr})`
    }

    /**
     * Update indicator settings
     */
    update(id, updates = {}) {
        const indicator = this.active.get(id)
        if (!indicator) return false

        // Update params if provided
        if (updates.params) {
            indicator.params = { ...indicator.params, ...updates.params }

            // Recalculate data with new params
            const ohlcv = this.dc.data.chart?.data || []
            indicator.data = indicator._config.calc(ohlcv, indicator.params)

            // Update name
            indicator.name = this.formatDisplayName(
                indicator.type,
                indicator.params,
                parseInt(id.split('_')[1])
            )
        }

        // Update settings if provided
        if (updates.settings) {
            // If color changed, update color usage
            if (updates.settings.color && updates.settings.color !== indicator.settings.color) {
                this.releaseColor(indicator.type, indicator.settings.color)
                const usedColors = this.colorUsage.get(indicator.type) || []
                usedColors.push(updates.settings.color)
            }

            indicator.settings = { ...indicator.settings, ...updates.settings }
        }

        // Update in DataCube
        const position = indicator._config.position
        const list = this.dc.data[position]
        const index = list.findIndex(i => i.id === id)

        if (index !== -1) {
            // Vue reactivity
            this.dc.tv.$set(list, index, { ...indicator })
        }

        console.log(`[IndicatorManager] Updated ${id}`)
        return true
    }

    /**
     * Remove indicator
     */
    remove(id) {
        const indicator = this.active.get(id)
        if (!indicator) return false

        // Release color
        this.releaseColor(indicator.type, indicator.settings.color)

        const config = indicator._config
        const list = this.dc.data[config.position]
        const index = list.findIndex(i => i.id === id)

        if (index !== -1) {
            list.splice(index, 1)
            this.active.delete(id)
            console.log(`[IndicatorManager] Removed ${id}`)
            return true
        }

        return false
    }

    /**
     * Get indicator by ID
     */
    get(id) {
        return this.active.get(id)
    }

    /**
     * Recalculate all active indicators
     * Called when timeframe/data changes
     */
    recalculateAll(ohlcv = null) {
        const data = ohlcv || this.dc.data.chart?.data || []

        console.log(`[IndicatorManager] Recalculating ${this.active.size} indicators...`)

        for (const [id, indicator] of this.active) {
            const config = indicator._config

            // Recalculate data
            indicator.data = config.calc(data, indicator.params)

            // Update in DataCube
            this.dc.merge(`${config.position}.${id}.data`, indicator.data)
        }
    }

    /**
     * Clear all indicators
     */
    clear() {
        // Remove all onchart indicators
        const onchart = this.dc.data.onchart || []
        while (onchart.length > 0) {
            onchart.pop()
        }

        // Remove all offchart indicators
        const offchart = this.dc.data.offchart || []
        while (offchart.length > 0) {
            offchart.pop()
        }

        // Clear color usage
        this.colorUsage.clear()

        this.active.clear()
        console.log(`[IndicatorManager] Cleared all indicators`)
    }

    /**
     * Get active indicators count
     */
    get count() {
        return this.active.size
    }

    /**
     * Get list of active indicators
     */
    get list() {
        return Array.from(this.active.values()).map(i => ({
            id: i.id,
            type: i.type,
            name: i.name,
            position: i._config.position,
            params: { ...i.params },
            settings: { ...i.settings }
        }))
    }

    // ==================== Indicator Calculations ====================

    /**
     * EMA - Exponential Moving Average
     */
    calcEMA(data, period) {
        const result = []
        if (data.length === 0) return result

        const k = 2 / (period + 1)
        let ema = data[0][4]

        for (let i = 0; i < data.length; i++) {
            const close = data[i][4]
            ema = i === 0 ? close : close * k + ema * (1 - k)
            result.push([data[i][0], ema])
        }

        return result
    }

    /**
     * SMA - Simple Moving Average
     */
    calcSMA(data, period) {
        const result = []

        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push([data[i][0], null])
            } else {
                let sum = 0
                for (let j = 0; j < period; j++) {
                    sum += data[i - j][4]
                }
                result.push([data[i][0], sum / period])
            }
        }

        return result
    }

    /**
     * WMA - Weighted Moving Average
     */
    calcWMA(data, period) {
        const result = []
        const weightSum = period * (period + 1) / 2

        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push([data[i][0], null])
            } else {
                let sum = 0
                for (let j = 0; j < period; j++) {
                    sum += data[i - j][4] * (period - j)
                }
                result.push([data[i][0], sum / weightSum])
            }
        }

        return result
    }

    /**
     * Bollinger Bands
     */
    calcBB(data, period, mult) {
        const result = []

        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push([data[i][0], null, null, null])
            } else {
                let sum = 0
                for (let j = 0; j < period; j++) {
                    sum += data[i - j][4]
                }
                const sma = sum / period

                let sqSum = 0
                for (let j = 0; j < period; j++) {
                    sqSum += Math.pow(data[i - j][4] - sma, 2)
                }
                const std = Math.sqrt(sqSum / period)

                result.push([
                    data[i][0],
                    sma,
                    sma + mult * std,
                    sma - mult * std
                ])
            }
        }

        return result
    }

    /**
     * RSI - Relative Strength Index
     */
    calcRSI(data, period) {
        const result = []
        const gains = []
        const losses = []

        for (let i = 0; i < data.length; i++) {
            if (i === 0) {
                result.push([data[i][0], 50])
                continue
            }

            const change = data[i][4] - data[i - 1][4]
            gains.push(change > 0 ? change : 0)
            losses.push(change < 0 ? Math.abs(change) : 0)

            if (gains.length < period) {
                result.push([data[i][0], 50])
                continue
            }

            const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period
            const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period

            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
            const rsi = 100 - (100 / (1 + rs))

            result.push([data[i][0], Math.min(100, Math.max(0, rsi))])
        }

        return result
    }

    /**
     * MACD
     */
    calcMACD(data, fast, slow, signal) {
        const result = []

        const kFast = 2 / (fast + 1)
        const kSlow = 2 / (slow + 1)
        const kSignal = 2 / (signal + 1)

        let emaFast = data[0]?.[4] || 0
        let emaSlow = data[0]?.[4] || 0
        let sig = 0

        for (let i = 0; i < data.length; i++) {
            const close = data[i][4]

            emaFast = close * kFast + emaFast * (1 - kFast)
            emaSlow = close * kSlow + emaSlow * (1 - kSlow)

            const macd = emaFast - emaSlow
            sig = macd * kSignal + sig * (1 - kSignal)
            const hist = macd - sig

            result.push([data[i][0], macd, sig, hist])
        }

        return result
    }

    /**
     * ATR - Average True Range
     */
    calcATR(data, period) {
        const result = []
        const trValues = []

        for (let i = 0; i < data.length; i++) {
            let tr

            if (i === 0) {
                tr = data[i][2] - data[i][3]
            } else {
                const high = data[i][2]
                const low = data[i][3]
                const prevClose = data[i - 1][4]

                tr = Math.max(
                    high - low,
                    Math.abs(high - prevClose),
                    Math.abs(low - prevClose)
                )
            }

            trValues.push(tr)

            if (trValues.length < period) {
                result.push([data[i][0], null])
            } else {
                const atr = trValues.slice(-period).reduce((a, b) => a + b, 0) / period
                result.push([data[i][0], atr])
            }
        }

        return result
    }

    /**
     * Volume MA
     */
    calcVolMA(data, period) {
        const result = []

        for (let i = 0; i < data.length; i++) {
            const vol = data[i][5]

            if (i < period - 1) {
                result.push([data[i][0], vol, null])
            } else {
                let sum = 0
                for (let j = 0; j < period; j++) {
                    sum += data[i - j][5]
                }
                const avg = sum / period
                result.push([data[i][0], vol, avg])
            }
        }

        return result
    }

    /**
     * Stochastic
     */
    calcStoch(data, kPeriod, dPeriod, smooth) {
        const result = []
        const kValues = []

        for (let i = 0; i < data.length; i++) {
            if (i < kPeriod - 1) {
                result.push([data[i][0], null, null])
                continue
            }

            let highestHigh = -Infinity
            let lowestLow = Infinity

            for (let j = 0; j < kPeriod; j++) {
                highestHigh = Math.max(highestHigh, data[i - j][2])
                lowestLow = Math.min(lowestLow, data[i - j][3])
            }

            const close = data[i][4]
            const range = highestHigh - lowestLow
            const k = range === 0 ? 50 : ((close - lowestLow) / range) * 100

            kValues.push(k)

            let smoothK = k
            if (kValues.length >= smooth) {
                smoothK = kValues.slice(-smooth).reduce((a, b) => a + b, 0) / smooth
            }

            let d = smoothK
            if (kValues.length >= smooth + dPeriod - 1) {
                const smoothedValues = []
                for (let j = 0; j < dPeriod; j++) {
                    const start = kValues.length - smooth - dPeriod + 1 + j
                    const slice = kValues.slice(start, start + smooth)
                    smoothedValues.push(slice.reduce((a, b) => a + b, 0) / smooth)
                }
                d = smoothedValues.reduce((a, b) => a + b, 0) / dPeriod
            }

            result.push([data[i][0], smoothK, d])
        }

        return result
    }
}
