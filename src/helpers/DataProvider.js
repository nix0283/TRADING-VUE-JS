/**
 * DataProvider - Automatic data loading for different timeframes
 *
 * Provides:
 * - Auto-loading OHLCV data when timeframe changes
 * - Caching loaded data
 * - Custom data loader callback support
 * - Simulated data generation for demo
 */

export default class DataProvider {

    constructor(options = {}) {
        // Configuration
        this.options = {
            // Custom data loader: async (symbol, tf) => ohlcv[]
            loader: null,
            // Symbol to load
            symbol: options.symbol || 'BTC/USDT',
            // Cache enabled
            cache: options.cache !== false,
            // Max cache size (per symbol)
            maxCacheSize: options.maxCacheSize || 10,
            // Generate demo data if no loader provided
            generateDemo: options.generateDemo !== false,
            ...options
        }

        // Data cache: symbol -> tf -> ohlcv[]
        this.cache = new Map()

        // TF to minutes mapping
        this.tfMinutes = {
            '1s': 1/60, '5s': 5/60, '15s': 15/60, '30s': 30/60,
            '1': 1, '2': 2, '3': 3, '5': 5, '10': 10, '15': 15,
            '20': 20, '30': 30, '45': 45, '60': 60, '120': 120,
            '180': 180, '240': 240, '360': 360, '480': 480, '720': 720,
            '1D': 1440, '2D': 2880, '3D': 4320,
            '1W': 10080, '2W': 20160,
            '1M': 43200, '3M': 129600, '6M': 259200, '12M': 518400, '1Y': 525600
        }

        // Default candle counts per TF
        this.defaultCounts = {
            '1s': 1000, '5s': 800, '15s': 600, '30s': 500,
            '1': 500, '3': 400, '5': 400, '15': 300, '30': 250,
            '60': 200, '240': 150, '720': 100, '1D': 100, '1W': 52, '1M': 24
        }
    }

    /**
     * Get data for timeframe
     * @param {string} tf - Timeframe
     * @param {string} symbol - Trading pair (optional)
     * @returns {Promise<Array>} OHLCV data
     */
    async getData(tf, symbol = this.options.symbol) {
        // Check cache first
        if (this.options.cache) {
            const cached = this.getCached(symbol, tf)
            if (cached) {
                console.log(`[DataProvider] Using cached data for ${symbol} ${tf}`)
                return cached
            }
        }

        // Load data
        let data

        if (this.options.loader) {
            // Use custom loader
            console.log(`[DataProvider] Loading ${symbol} ${tf} via custom loader...`)
            data = await this.options.loader(symbol, tf)
        } else if (this.options.generateDemo) {
            // Generate demo data
            console.log(`[DataProvider] Generating demo data for ${symbol} ${tf}...`)
            data = this.generateDemoData(tf)
        } else {
            throw new Error(`No data loader configured and demo generation disabled`)
        }

        // Cache the result
        if (this.options.cache && data) {
            this.setCached(symbol, tf, data)
        }

        return data
    }

    /**
     * Sync version for immediate use (uses cache or generates demo)
     */
    getDataSync(tf, symbol = this.options.symbol) {
        // Check cache
        const cached = this.getCached(symbol, tf)
        if (cached) return cached

        // Generate demo if enabled
        if (this.options.generateDemo) {
            const data = this.generateDemoData(tf)
            if (this.options.cache) {
                this.setCached(symbol, tf, data)
            }
            return data
        }

        return null
    }

    /**
     * Get cached data
     */
    getCached(symbol, tf) {
        if (!this.cache.has(symbol)) return null
        return this.cache.get(symbol).get(tf) || null
    }

    /**
     * Set cached data
     */
    setCached(symbol, tf, data) {
        if (!this.cache.has(symbol)) {
            this.cache.set(symbol, new Map())
        }
        const symbolCache = this.cache.get(symbol)

        // Limit cache size (LRU-style)
        if (symbolCache.size >= this.options.maxCacheSize) {
            const firstKey = symbolCache.keys().next().value
            symbolCache.delete(firstKey)
        }

        symbolCache.set(tf, data)
    }

    /**
     * Clear cache
     */
    clearCache(symbol = null) {
        if (symbol) {
            this.cache.delete(symbol)
        } else {
            this.cache.clear()
        }
    }

    /**
     * Convert TF string to minutes
     */
    tfToMinutes(tf) {
        // Handle numeric strings (minutes)
        if (/^\d+$/.test(tf)) {
            return parseInt(tf)
        }

        // Handle format like "1H", "4H", "1D"
        const match = tf.match(/^(\d+)(s|m|h|D|W|M|Y)$/i)
        if (match) {
            const num = parseInt(match[1])
            const unit = match[2].toUpperCase()

            switch (unit) {
                case 'S': return num / 60
                case 'M': return num * 43200  // Approximate
                case 'H': return num * 60
                case 'D': return num * 1440
                case 'W': return num * 10080
                case 'Y': return num * 525600
            }
        }

        return this.tfMinutes[tf] || 1440  // Default to 1D
    }

    /**
     * Generate demo OHLCV data
     */
    generateDemoData(tf, count = null) {
        const minutes = this.tfToMinutes(tf)
        const candleCount = count || this.defaultCounts[tf] || 200

        const data = []
        const now = Date.now()
        const interval = minutes * 60000

        let price = 100 + Math.random() * 900  // Starting price 100-1000
        let trend = Math.random() > 0.5 ? 1 : -1
        let trendStrength = Math.random() * 0.02
        let volatility = 0.02 + Math.random() * 0.03

        for (let i = 0; i < candleCount; i++) {
            const ts = now - (candleCount - i) * interval

            // Trend following with random noise
            if (Math.random() < 0.05) {
                trend *= -1  // Occasional trend reversal
                trendStrength = Math.random() * 0.02
            }

            const open = price
            const trendMove = trend * trendStrength * price
            const noise = (Math.random() - 0.5) * volatility * price

            const close = open + trendMove + noise
            const high = Math.max(open, close) + Math.random() * volatility * price * 0.5
            const low = Math.min(open, close) - Math.random() * volatility * price * 0.5
            const volume = Math.floor(100000 + Math.random() * 900000)

            data.push([
                Math.floor(ts),
                this.roundPrice(open),
                this.roundPrice(high),
                this.roundPrice(low),
                this.roundPrice(close),
                volume
            ])

            price = close
        }

        return data
    }

    /**
     * Round price to reasonable precision
     */
    roundPrice(price) {
        if (price > 1000) return Math.round(price * 100) / 100
        if (price > 1) return Math.round(price * 10000) / 10000
        return Math.round(price * 1000000) / 1000000
    }

    /**
     * Set custom data loader
     * @param {Function} loader - async (symbol, tf) => ohlcv[]
     */
    setLoader(loader) {
        this.options.loader = loader
    }

    /**
     * Set symbol
     */
    setSymbol(symbol) {
        this.options.symbol = symbol
    }
}
