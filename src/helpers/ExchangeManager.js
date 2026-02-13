/**
 * ExchangeManager - Manage exchange connections and API settings
 *
 * Features:
 * - Add/remove exchanges with API credentials
 * - Store settings in localStorage and config file
 * - Provide data loaders for each exchange
 * - Support multiple exchanges
 */

// Exchange configurations
const EXCHANGE_CONFIGS = {
    'binance': {
        name: 'Binance',
        type: 'crypto',
        baseUrl: 'https://api.binance.com',
        endpoints: {
            klines: '/api/v3/klines',
            exchangeInfo: '/api/v3/exchangeInfo'
        },
        requiresAuth: false,
        authType: 'api-key',
        supportsTimeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
        defaultTimeframe: '1h'
    },
    'binance-futures': {
        name: 'Binance Futures',
        type: 'crypto',
        baseUrl: 'https://fapi.binance.com',
        endpoints: {
            klines: '/fapi/v1/klines',
            exchangeInfo: '/fapi/v1/exchangeInfo'
        },
        requiresAuth: false,
        authType: 'api-key',
        supportsTimeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
        defaultTimeframe: '1h'
    },
    'bybit': {
        name: 'Bybit',
        type: 'crypto',
        baseUrl: 'https://api.bybit.com',
        endpoints: {
            klines: '/v5/market/kline',
            exchangeInfo: '/v5/market/instruments-info'
        },
        requiresAuth: false,
        authType: 'api-key',
        supportsTimeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '1w', '1M'],
        defaultTimeframe: '1h'
    },
    'okx': {
        name: 'OKX',
        type: 'crypto',
        baseUrl: 'https://www.okx.com',
        endpoints: {
            klines: '/api/v5/market/candles',
            exchangeInfo: '/api/v5/public/instruments'
        },
        requiresAuth: false,
        authType: 'api-key',
        supportsTimeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '1w', '1M'],
        defaultTimeframe: '1h'
    },
    'bitget': {
        name: 'Bitget',
        type: 'crypto',
        baseUrl: 'https://api.bitget.com',
        endpoints: {
            klines: '/api/v2/market/candles',
            exchangeInfo: '/api/v2/market/instruments'
        },
        requiresAuth: false,
        authType: 'api-key',
        supportsTimeframes: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
        defaultTimeframe: '1h'
    },
    'kucoin': {
        name: 'KuCoin',
        type: 'crypto',
        baseUrl: 'https://api.kucoin.com',
        endpoints: {
            klines: '/api/v1/market/candles',
            exchangeInfo: '/api/v1/symbols'
        },
        requiresAuth: false,
        authType: 'api-key',
        supportsTimeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '1w', '1M'],
        defaultTimeframe: '1h'
    }
}

// Timeframe conversion for different exchanges
const TF_CONVERSIONS = {
    'binance': {
        '1m': '1m', '3m': '3m', '5m': '5m', '15m': '15m', '30m': '30m',
        '1H': '1h', '2H': '2h', '4H': '4h', '6H': '6h', '8H': '8h', '12H': '12h',
        '1D': '1d', '3D': '3d', '1W': '1w', '1M': '1M'
    },
    'bybit': {
        '1m': '1', '3m': '3', '5m': '5', '15m': '15', '30m': '30',
        '1H': '60', '2H': '120', '4H': '240', '6H': '360', '12H': '720',
        '1D': 'D', '1W': 'W', '1M': 'M'
    },
    'okx': {
        '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
        '1H': '1H', '2H': '2H', '4H': '4H', '6H': '6H', '12H': '12H',
        '1D': '1D', '1W': '1W', '1M': '1M'
    }
}

export default class ExchangeManager {

    constructor() {
        // Active exchanges: id -> config
        this.exchanges = new Map()

        // Current selected exchange
        this.currentExchange = null

        // Storage key
        this.storageKey = 'tvjs_exchange_config'

        // Config file path (for Node.js environment)
        this.configFilePath = '/home/z/my-project/download/exchange_config.json'

        // Load saved config
        this.loadConfig()
    }

    /**
     * Get available exchange types
     */
    getAvailableExchanges() {
        return Object.entries(EXCHANGE_CONFIGS).map(([id, config]) => ({
            id,
            name: config.name,
            type: config.type,
            requiresAuth: config.requiresAuth
        }))
    }

    /**
     * Add or update exchange
     */
    addExchange(id, config) {
        const baseConfig = EXCHANGE_CONFIGS[id]
        if (!baseConfig) {
            console.error(`Unknown exchange: ${id}`)
            return false
        }

        const exchange = {
            id,
            name: config.name || baseConfig.name,
            apiKey: config.apiKey || '',
            apiSecret: config.apiSecret || '',
            passphrase: config.passphrase || '',  // For OKX
            enabled: config.enabled !== false,
            ...baseConfig
        }

        this.exchanges.set(id, exchange)

        if (!this.currentExchange) {
            this.currentExchange = id
        }

        this.saveConfig()
        console.log(`[ExchangeManager] Added exchange: ${exchange.name}`)

        return true
    }

    /**
     * Remove exchange
     */
    removeExchange(id) {
        if (this.exchanges.has(id)) {
            this.exchanges.delete(id)

            if (this.currentExchange === id) {
                this.currentExchange = this.exchanges.keys().next().value || null
            }

            this.saveConfig()
            console.log(`[ExchangeManager] Removed exchange: ${id}`)
            return true
        }
        return false
    }

    /**
     * Get exchange config
     */
    getExchange(id) {
        return this.exchanges.get(id)
    }

    /**
     * Get all configured exchanges
     */
    getAllExchanges() {
        return Array.from(this.exchanges.values())
    }

    /**
     * Set current exchange
     */
    setCurrentExchange(id) {
        if (this.exchanges.has(id)) {
            this.currentExchange = id
            this.saveConfig()
            return true
        }
        return false
    }

    /**
     * Get current exchange
     */
    getCurrentExchange() {
        return this.exchanges.get(this.currentExchange)
    }

    /**
     * Convert timeframe to exchange format
     */
    convertTimeframe(tf, exchangeId = this.currentExchange) {
        const exchange = this.exchanges.get(exchangeId)
        if (!exchange) return tf

        const conversions = TF_CONVERSIONS[exchangeId] || {}
        return conversions[tf] || tf.toLowerCase()
    }

    /**
     * Create data loader for exchange
     */
    createDataLoader(exchangeId = this.currentExchange) {
        const exchange = this.exchanges.get(exchangeId)
        if (!exchange) return null

        return async (symbol, tf) => {
            return this.fetchKlines(exchangeId, symbol, tf)
        }
    }

    /**
     * Fetch klines from exchange
     */
    async fetchKlines(exchangeId, symbol, tf, limit = 500) {
        const exchange = this.exchanges.get(exchangeId)
        if (!exchange) {
            throw new Error(`Exchange not configured: ${exchangeId}`)
        }

        const convertedTf = this.convertTimeframe(tf, exchangeId)
        const formattedSymbol = this.formatSymbol(symbol, exchangeId)

        console.log(`[ExchangeManager] Fetching ${formattedSymbol} ${convertedTf} from ${exchange.name}`)

        try {
            switch (exchangeId) {
                case 'binance':
                case 'binance-futures':
                    return await this.fetchBinanceKlines(exchange, formattedSymbol, convertedTf, limit)
                case 'bybit':
                    return await this.fetchBybitKlines(exchange, formattedSymbol, convertedTf, limit)
                case 'okx':
                    return await this.fetchOkxKlines(exchange, formattedSymbol, convertedTf, limit)
                case 'bitget':
                    return await this.fetchBitgetKlines(exchange, formattedSymbol, convertedTf, limit)
                case 'kucoin':
                    return await this.fetchKucoinKlines(exchange, formattedSymbol, convertedTf, limit)
                default:
                    throw new Error(`Unsupported exchange: ${exchangeId}`)
            }
        } catch (error) {
            console.error(`[ExchangeManager] Error fetching data:`, error)
            throw error
        }
    }

    /**
     * Format symbol for exchange
     */
    formatSymbol(symbol, exchangeId) {
        // Remove slash: BTC/USDT -> BTCUSDT
        const base = symbol.replace('/', '')

        switch (exchangeId) {
            case 'okx':
                // OKX uses lowercase with dash: BTC-USDT
                return symbol.replace('/', '-').toUpperCase()
            case 'bitget':
                return symbol.replace('/', '').toUpperCase()
            case 'kucoin':
                return symbol.replace('/', '-').toUpperCase()
            default:
                return base.toUpperCase()
        }
    }

    // ==================== Exchange-specific fetchers ====================

    async fetchBinanceKlines(exchange, symbol, tf, limit) {
        const url = `${exchange.baseUrl}${exchange.endpoints.klines}?symbol=${symbol}&interval=${tf}&limit=${limit}`

        const headers = {}
        if (exchange.apiKey) {
            headers['X-MBX-APIKEY'] = exchange.apiKey
        }

        const response = await fetch(url, { headers })
        const data = await response.json()

        if (data.code) {
            throw new Error(`Binance API error: ${data.msg}`)
        }

        return data.map(candle => [
            candle[0],              // timestamp
            parseFloat(candle[1]),  // open
            parseFloat(candle[2]),  // high
            parseFloat(candle[3]),  // low
            parseFloat(candle[4]),  // close
            parseFloat(candle[5])   // volume
        ])
    }

    async fetchBybitKlines(exchange, symbol, tf, limit) {
        const category = 'linear'  // For USDT pairs
        const url = `${exchange.baseUrl}${exchange.endpoints.klines}?category=${category}&symbol=${symbol}&interval=${tf}&limit=${limit}`

        const response = await fetch(url)
        const data = await response.json()

        if (data.retCode !== 0) {
            throw new Error(`Bybit API error: ${data.retMsg}`)
        }

        return data.result.list.map(candle => [
            parseInt(candle[0]),    // timestamp
            parseFloat(candle[1]),  // open
            parseFloat(candle[2]),  // high
            parseFloat(candle[3]),  // low
            parseFloat(candle[4]),  // close
            parseFloat(candle[5])   // volume
        ]).reverse()  // Bybit returns newest first
    }

    async fetchOkxKlines(exchange, symbol, tf, limit) {
        const url = `${exchange.baseUrl}${exchange.endpoints.klines}?instId=${symbol}&bar=${tf}&limit=${limit}`

        const headers = {}
        if (exchange.apiKey) {
            headers['OK-ACCESS-KEY'] = exchange.apiKey
        }

        const response = await fetch(url, { headers })
        const data = await response.json()

        if (data.code !== '0') {
            throw new Error(`OKX API error: ${data.msg}`)
        }

        return data.data.map(candle => [
            parseInt(candle[0]),    // timestamp
            parseFloat(candle[1]),  // open
            parseFloat(candle[2]),  // high
            parseFloat(candle[3]),  // low
            parseFloat(candle[4]),  // close
            parseFloat(candle[5])   // volume
        ]).reverse()
    }

    async fetchBitgetKlines(exchange, symbol, tf, limit) {
        const url = `${exchange.baseUrl}${exchange.endpoints.klines}?productType=USDT-FUTURES&symbol=${symbol}&granularity=${tf}&limit=${limit}`

        const response = await fetch(url)
        const data = await response.json()

        if (data.code !== '00000') {
            throw new Error(`Bitget API error: ${data.msg}`)
        }

        return data.data.map(candle => [
            parseInt(candle[0]),    // timestamp
            parseFloat(candle[1]),  // open
            parseFloat(candle[2]),  // high
            parseFloat(candle[3]),  // low
            parseFloat(candle[4]),  // close
            parseFloat(candle[5])   // volume
        ])
    }

    async fetchKucoinKlines(exchange, symbol, tf, limit) {
        const url = `${exchange.baseUrl}${exchange.endpoints.klines}?symbol=${symbol}&type=${tf}&limit=${limit}`

        const response = await fetch(url)
        const data = await response.json()

        if (data.code !== '200000') {
            throw new Error(`KuCoin API error: ${data.msg}`)
        }

        return data.data.map(candle => [
            parseInt(candle[0]),    // timestamp
            parseFloat(candle[1]),  // open
            parseFloat(candle[2]),  // high
            parseFloat(candle[3]),  // low
            parseFloat(candle[4]),  // close
            parseFloat(candle[5])   // volume
        ])
    }

    // ==================== Config Persistence ====================

    /**
     * Save config to localStorage and file
     */
    saveConfig() {
        const config = {
            exchanges: Array.from(this.exchanges.entries()).map(([id, ex]) => ({
                id,
                apiKey: ex.apiKey,
                apiSecret: ex.apiSecret ? '***' : '',  // Don't save secret to localStorage
                passphrase: ex.passphrase ? '***' : '',
                enabled: ex.enabled
            })),
            currentExchange: this.currentExchange,
            savedAt: new Date().toISOString()
        }

        // Save to localStorage
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(config))
            console.log('[ExchangeManager] Config saved to localStorage')
        } catch (e) {
            console.warn('[ExchangeManager] Could not save to localStorage:', e)
        }

        // Save to file (for full credentials)
        this.saveToFile(config)
    }

    /**
     * Save config to file
     */
    async saveToFile(config) {
        // In browser environment, we can't write to file directly
        // But we can prepare the data for download or use a backend endpoint

        try {
            // Include full secrets for file
            const fullConfig = {
                exchanges: Array.from(this.exchanges.entries()).map(([id, ex]) => ({
                    id,
                    name: ex.name,
                    apiKey: ex.apiKey,
                    apiSecret: ex.apiSecret,
                    passphrase: ex.passphrase,
                    enabled: ex.enabled
                })),
                currentExchange: this.currentExchange,
                savedAt: new Date().toISOString()
            }

            // Try to save via API if available
            if (typeof window !== 'undefined') {
                const response = await fetch('/api/exchange-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fullConfig)
                })

                if (response.ok) {
                    console.log('[ExchangeManager] Config saved to file')
                }
            }
        } catch (e) {
            // File save failed, but localStorage succeeded
            console.warn('[ExchangeManager] Could not save to file:', e)
        }
    }

    /**
     * Load config from storage
     */
    loadConfig() {
        try {
            const saved = localStorage.getItem(this.storageKey)
            if (saved) {
                const config = JSON.parse(saved)

                config.exchanges.forEach(ex => {
                    const baseConfig = EXCHANGE_CONFIGS[ex.id]
                    if (baseConfig) {
                        this.exchanges.set(ex.id, {
                            ...baseConfig,
                            ...ex
                        })
                    }
                })

                this.currentExchange = config.currentExchange

                console.log(`[ExchangeManager] Loaded ${this.exchanges.size} exchanges from storage`)
            }
        } catch (e) {
            console.warn('[ExchangeManager] Could not load config:', e)
        }

        // Add default exchange if none configured
        if (this.exchanges.size === 0) {
            this.addExchange('binance', { enabled: true })
        }
    }

    /**
     * Export config for download
     */
    exportConfig() {
        const config = {
            exchanges: Array.from(this.exchanges.entries()).map(([id, ex]) => ({
                id,
                name: ex.name,
                apiKey: ex.apiKey,
                apiSecret: ex.apiSecret,
                passphrase: ex.passphrase,
                enabled: ex.enabled
            })),
            currentExchange: this.currentExchange,
            exportedAt: new Date().toISOString()
        }

        return JSON.stringify(config, null, 2)
    }

    /**
     * Import config
     */
    importConfig(jsonString) {
        try {
            const config = JSON.parse(jsonString)

            config.exchanges.forEach(ex => {
                this.addExchange(ex.id, ex)
            })

            if (config.currentExchange) {
                this.currentExchange = config.currentExchange
            }

            this.saveConfig()
            return true
        } catch (e) {
            console.error('[ExchangeManager] Failed to import config:', e)
            return false
        }
    }

    /**
     * Clear all config
     */
    clearConfig() {
        this.exchanges.clear()
        this.currentExchange = null
        localStorage.removeItem(this.storageKey)
        console.log('[ExchangeManager] Config cleared')
    }
}

// Export exchange configs for UI
export { EXCHANGE_CONFIGS }
