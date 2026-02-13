<template>
<!--
  WatchlistPanel.vue - Right side panel with favorite tickers
  TradingView-style resizable watchlist
-->
<div
    class="tvjs-watchlist-panel"
    :class="{ 'is-collapsed': collapsed }"
    :style="panelStyle"
>
    <!-- Resize Handle -->
    <div
        class="resize-handle"
        @mousedown="startResize"
        v-if="!collapsed"
    ></div>

    <!-- Collapse Toggle -->
    <button
        class="collapse-toggle"
        @click="toggleCollapse"
        :title="collapsed ? 'Expand panel' : 'Collapse panel'"
    >
        {{ collapsed ? '◀' : '▶' }}
    </button>

    <!-- Panel Content -->
    <div class="panel-content" v-if="!collapsed">
        <!-- Header -->
        <div class="panel-header">
            <h3>⭐ Watchlist</h3>
            <div class="header-actions">
                <button class="btn-icon" @click="showAddModal = true" title="Add ticker">
                    ➕
                </button>
                <button class="btn-icon" @click="toggleSearch" title="Search">
                    🔍
                </button>
            </div>
        </div>

        <!-- Search -->
        <div class="search-container" v-if="showSearchInput">
            <input
                ref="searchInput"
                type="text"
                v-model="searchQuery"
                placeholder="Search ticker..."
                @keyup.esc="closeSearch"
            />
            <button class="btn-clear" @click="closeSearch">×</button>
        </div>

        <!-- Exchange Filter -->
        <div class="exchange-filter" v-if="exchanges.length > 1">
            <select v-model="selectedExchange">
                <option value="">All Exchanges</option>
                <option
                    v-for="ex in exchanges"
                    :key="ex.id"
                    :value="ex.id"
                >
                    {{ ex.name }}
                </option>
            </select>
        </div>

        <!-- Ticker List -->
        <div class="ticker-list" ref="tickerList">
            <div
                v-for="ticker in filteredTickers"
                :key="ticker.symbol + (ticker.exchange || '')"
                class="ticker-item"
                :class="{
                    'is-active': isActiveTicker(ticker),
                    'is-up': ticker.change > 0,
                    'is-down': ticker.change < 0
                }"
                @click="selectTicker(ticker)"
                @contextmenu.prevent="showContextMenu($event, ticker)"
            >
                <!-- Star/Favorite -->
                <button
                    class="btn-star"
                    :class="{ 'is-favorite': ticker.favorite }"
                    @click.stop="toggleFavorite(ticker)"
                >
                    {{ ticker.favorite ? '★' : '☆' }}
                </button>

                <!-- Symbol Info -->
                <div class="ticker-info">
                    <div class="ticker-symbol">{{ ticker.symbol }}</div>
                    <div class="ticker-exchange" v-if="ticker.exchange">
                        {{ ticker.exchange }}
                    </div>
                </div>

                <!-- Price -->
                <div class="ticker-price">
                    <div class="price-value">{{ formatPrice(ticker.price) }}</div>
                    <div class="price-change" :class="changeClass(ticker)">
                        {{ formatChange(ticker.change) }}
                    </div>
                </div>

                <!-- Mini Chart Sparkline -->
                <div class="ticker-sparkline" v-if="ticker.sparkline">
                    <svg viewBox="0 0 60 20" preserveAspectRatio="none">
                        <polyline
                            :points="ticker.sparkline"
                            fill="none"
                            :stroke="sparklineColor(ticker)"
                            stroke-width="1.5"
                        />
                    </svg>
                </div>
            </div>

            <!-- Empty State -->
            <div class="empty-state" v-if="filteredTickers.length === 0">
                <div class="empty-icon">📋</div>
                <p>No tickers in watchlist</p>
                <button class="btn-add-first" @click="showAddModal = true">
                    + Add Ticker
                </button>
            </div>
        </div>

        <!-- Footer Stats -->
        <div class="panel-footer">
            <span class="ticker-count">{{ filteredTickers.length }} tickers</span>
            <span class="gainers" v-if="gainersCount > 0">
                ▲ {{ gainersCount }}
            </span>
            <span class="losers" v-if="losersCount > 0">
                ▼ {{ losersCount }}
            </span>
        </div>
    </div>

    <!-- Add Ticker Modal -->
    <div class="tvjs-modal-overlay" v-if="showAddModal" @click.self="closeAddModal">
        <div class="tvjs-modal add-ticker-modal">
            <div class="modal-header">
                <h3>Add to Watchlist</h3>
                <button class="btn-close" @click="closeAddModal">×</button>
            </div>

            <div class="modal-body">
                <!-- Search Input -->
                <div class="form-group">
                    <input
                        type="text"
                        v-model="newTickerSymbol"
                        placeholder="Enter symbol (e.g., BTC/USDT)"
                        @keyup.enter="addTicker"
                        ref="addTickerInput"
                    />
                </div>

                <!-- Exchange Select -->
                <div class="form-group">
                    <label>Exchange</label>
                    <select v-model="newTickerExchange">
                        <option
                            v-for="ex in availableExchanges"
                            :key="ex.id"
                            :value="ex.id"
                        >
                            {{ ex.name }}
                        </option>
                    </select>
                </div>

                <!-- Quick Add Suggestions -->
                <div class="quick-add">
                    <h4>Popular</h4>
                    <div class="suggestions">
                        <button
                            v-for="suggestion in popularSymbols"
                            :key="suggestion"
                            class="btn-suggestion"
                            @click="quickAdd(suggestion)"
                        >
                            {{ suggestion }}
                        </button>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeAddModal">Cancel</button>
                <button class="btn btn-primary" @click="addTicker" :disabled="!newTickerSymbol">
                    Add
                </button>
            </div>
        </div>
    </div>

    <!-- Context Menu -->
    <div
        class="context-menu"
        v-if="contextMenu.show"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
    >
        <button @click="removeTicker(contextMenu.ticker)">🗑 Remove</button>
        <button @click="toggleFavorite(contextMenu.ticker)">
            {{ contextMenuTickerFavorite ? '☆ Unfavorite' : '★ Favorite' }}
        </button>
        <button @click="editTicker(contextMenu.ticker)">✏ Edit</button>
    </div>
</div>
</template>

<script>
export default {
    name: 'WatchlistPanel',

    props: {
        // Current active symbol
        symbol: {
            type: String,
            default: ''
        },
        // Current exchange
        exchange: {
            type: String,
            default: ''
        },
        // Initial tickers
        tickers: {
            type: Array,
            default: () => []
        },
        // Available exchanges
        exchanges: {
            type: Array,
            default: () => [{ id: 'default', name: 'Default' }]
        },
        // Night mode
        night: {
            type: Boolean,
            default: true
        },
        // Initial width
        initialWidth: {
            type: Number,
            default: 250
        },
        // Min width
        minWidth: {
            type: Number,
            default: 200
        },
        // Max width
        maxWidth: {
            type: Number,
            default: 400
        },
        // Storage key for persistence
        storageKey: {
            type: String,
            default: 'tvjs_watchlist'
        }
    },

    data() {
        return {
            width: this.initialWidth,
            collapsed: false,
            showSearchInput: false,
            searchQuery: '',
            selectedExchange: '',
            showAddModal: false,
            newTickerSymbol: '',
            newTickerExchange: '',
            contextMenu: {
                show: false,
                x: 0,
                y: 0,
                ticker: null
            },
            localTickers: [],
            resizing: false,
            popularSymbols: [
                'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT',
                'ADA/USDT', 'DOGE/USDT', 'SOL/USDT', 'DOT/USDT'
            ]
        }
    },

    computed: {
        panelStyle() {
            return {
                width: this.collapsed ? '36px' : this.width + 'px',
                backgroundColor: this.night ? '#1e2224' : '#ffffff',
                color: this.night ? '#d1d4dc' : '#131722',
                borderColor: this.night ? '#363a45' : '#e1e4e8'
            }
        },

        availableExchanges() {
            return this.exchanges.length > 0 ? this.exchanges : [{ id: 'default', name: 'Default' }]
        },

        filteredTickers() {
            let tickers = this.localTickers

            // Filter by exchange
            if (this.selectedExchange) {
                tickers = tickers.filter(t => t.exchange === this.selectedExchange)
            }

            // Filter by search query
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase()
                tickers = tickers.filter(t =>
                    t.symbol.toLowerCase().includes(query)
                )
            }

            // Sort: favorites first, then alphabetically
            tickers = [...tickers].sort((a, b) => {
                if (a.favorite && !b.favorite) return -1
                if (!a.favorite && b.favorite) return 1
                return a.symbol.localeCompare(b.symbol)
            })

            return tickers
        },

        gainersCount() {
            return this.localTickers.filter(t => t.change > 0).length
        },

        losersCount() {
            return this.localTickers.filter(t => t.change < 0).length
        },

        contextMenuTickerFavorite() {
            return this.contextMenu.ticker && this.contextMenu.ticker.favorite
        }
    },

    watch: {
        tickers: {
            immediate: true,
            deep: true,
            handler(newVal) {
                this.localTickers = newVal.map(t => ({
                    ...t,
                    favorite: t.favorite !== undefined ? t.favorite : false
                }))
            }
        }
    },

    mounted() {
        this.loadFromStorage()
        this.setupClickOutside()
    },

    beforeDestroy() {
        document.removeEventListener('click', this.handleClickOutside)
        document.removeEventListener('mousemove', this.handleResize)
        document.removeEventListener('mouseup', this.stopResize)
    },

    methods: {
        // ==================== Panel Resize ====================

        startResize(e) {
            this.resizing = true
            this.startX = e.clientX
            this.startWidth = this.width

            document.addEventListener('mousemove', this.handleResize)
            document.addEventListener('mouseup', this.stopResize)
            e.preventDefault()
        },

        handleResize(e) {
            if (!this.resizing) return

            const diff = this.startX - e.clientX
            let newWidth = this.startWidth + diff

            // Clamp width
            newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, newWidth))
            this.width = newWidth

            this.$emit('resize', this.width)
        },

        stopResize() {
            this.resizing = false
            document.removeEventListener('mousemove', this.handleResize)
            document.removeEventListener('mouseup', this.stopResize)
            this.saveToStorage()
        },

        toggleCollapse() {
            this.collapsed = !this.collapsed
            this.$emit('collapse', this.collapsed)
            this.saveToStorage()
        },

        // ==================== Ticker Management ====================

        selectTicker(ticker) {
            this.$emit('ticker-select', {
                symbol: ticker.symbol,
                exchange: ticker.exchange
            })
        },

        isActiveTicker(ticker) {
            return ticker.symbol === this.symbol &&
                   (ticker.exchange === this.exchange || !ticker.exchange)
        },

        toggleFavorite(ticker) {
            const idx = this.localTickers.findIndex(t =>
                t.symbol === ticker.symbol && t.exchange === ticker.exchange
            )
            if (idx !== -1) {
                this.localTickers[idx].favorite = !this.localTickers[idx].favorite
                this.saveToStorage()
                this.$emit('update:tickers', this.localTickers)
            }
            this.closeContextMenu()
        },

        removeTicker(ticker) {
            const idx = this.localTickers.findIndex(t =>
                t.symbol === ticker.symbol && t.exchange === ticker.exchange
            )
            if (idx !== -1) {
                this.localTickers.splice(idx, 1)
                this.saveToStorage()
                this.$emit('update:tickers', this.localTickers)
                this.$emit('ticker-remove', ticker)
            }
            this.closeContextMenu()
        },

        editTicker(ticker) {
            // TODO: Implement edit modal
            this.closeContextMenu()
        },

        addTicker() {
            if (!this.newTickerSymbol) return

            const symbol = this.newTickerSymbol.toUpperCase()
            const exchange = this.newTickerExchange || this.exchange

            // Check if already exists
            const exists = this.localTickers.some(t =>
                t.symbol === symbol && t.exchange === exchange
            )

            if (exists) {
                alert(`${symbol} already in watchlist`)
                return
            }

            const newTicker = {
                symbol,
                exchange,
                price: 0,
                change: 0,
                favorite: false,
                sparkline: ''
            }

            this.localTickers.push(newTicker)
            this.saveToStorage()
            this.$emit('update:tickers', this.localTickers)
            this.$emit('ticker-add', newTicker)

            this.closeAddModal()
        },

        quickAdd(symbol) {
            this.newTickerSymbol = symbol
            this.addTicker()
        },

        closeAddModal() {
            this.showAddModal = false
            this.newTickerSymbol = ''
        },

        // ==================== Search ====================

        toggleSearch() {
            this.showSearchInput = !this.showSearchInput
            if (this.showSearchInput) {
                this.$nextTick(() => {
                    this.$refs.searchInput?.focus()
                })
            }
        },

        closeSearch() {
            this.showSearchInput = false
            this.searchQuery = ''
        },

        // ==================== Context Menu ====================

        showContextMenu(e, ticker) {
            this.contextMenu = {
                show: true,
                x: e.clientX,
                y: e.clientY,
                ticker
            }
        },

        closeContextMenu() {
            this.contextMenu.show = false
            this.contextMenu.ticker = null
        },

        setupClickOutside() {
            document.addEventListener('click', this.handleClickOutside)
        },

        handleClickOutside(e) {
            // Close context menu
            if (this.contextMenu.show && !e.target.closest('.context-menu')) {
                this.closeContextMenu()
            }
        },

        // ==================== Formatting ====================

        formatPrice(price) {
            if (!price || price === 0) return '—'
            if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 })
            if (price >= 1) return price.toFixed(4)
            if (price >= 0.0001) return price.toFixed(6)
            return price.toFixed(8)
        },

        formatChange(change) {
            if (!change) return '0.00%'
            const sign = change >= 0 ? '+' : ''
            return `${sign}${change.toFixed(2)}%`
        },

        changeClass(ticker) {
            if (ticker.change > 0) return 'positive'
            if (ticker.change < 0) return 'negative'
            return 'neutral'
        },

        sparklineColor(ticker) {
            if (ticker.change > 0) return '#23a776'
            if (ticker.change < 0) return '#e54150'
            return '#787b86'
        },

        // ==================== Storage ====================

        saveToStorage() {
            if (typeof localStorage === 'undefined') return

            const data = {
                width: this.width,
                collapsed: this.collapsed,
                tickers: this.localTickers
            }

            try {
                localStorage.setItem(this.storageKey, JSON.stringify(data))
            } catch (e) {
                console.warn('Failed to save watchlist:', e)
            }
        },

        loadFromStorage() {
            if (typeof localStorage === 'undefined') return

            try {
                const data = localStorage.getItem(this.storageKey)
                if (data) {
                    const parsed = JSON.parse(data)
                    if (parsed.width) this.width = parsed.width
                    if (parsed.collapsed !== undefined) this.collapsed = parsed.collapsed
                    if (parsed.tickers && parsed.tickers.length > 0) {
                        this.localTickers = parsed.tickers
                        this.$emit('update:tickers', this.localTickers)
                    }
                }
            } catch (e) {
                console.warn('Failed to load watchlist:', e)
            }
        },

        // ==================== Public API ====================

        /**
         * Update ticker price
         */
        updatePrice(symbol, exchange, price, change) {
            const ticker = this.localTickers.find(t =>
                t.symbol === symbol && t.exchange === exchange
            )
            if (ticker) {
                ticker.price = price
                ticker.change = change
            }
        },

        /**
         * Update ticker sparkline data
         */
        updateSparkline(symbol, exchange, sparkline) {
            const ticker = this.localTickers.find(t =>
                t.symbol === symbol && t.exchange === exchange
            )
            if (ticker) {
                ticker.sparkline = sparkline
            }
        },

        /**
         * Get all tickers
         */
        getTickers() {
            return this.localTickers
        },

        /**
         * Set tickers
         */
        setTickers(tickers) {
            this.localTickers = tickers
            this.saveToStorage()
            this.$emit('update:tickers', this.localTickers)
        }
    }
}
</script>

<style scoped>
.tvjs-watchlist-panel {
    position: relative;
    height: 100%;
    border-left: 1px solid;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    transition: width 0.2s ease;
    overflow: hidden;
}

.resize-handle {
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    cursor: ew-resize;
    background: transparent;
    transition: background 0.15s;
    z-index: 10;
}

.resize-handle:hover {
    background: #2962ff;
}

.collapse-toggle {
    position: absolute;
    left: 4px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 48px;
    background: transparent;
    border: none;
    color: #787b86;
    cursor: pointer;
    font-size: 10px;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s;
}

.collapse-toggle:hover {
    color: #fff;
}

.is-collapsed .collapse-toggle {
    left: 6px;
}

.panel-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding-left: 8px;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px 12px 8px;
    border-bottom: 1px solid;
    border-color: inherit;
}

.panel-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
}

.header-actions {
    display: flex;
    gap: 4px;
}

.btn-icon {
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.15s;
}

.btn-icon:hover {
    background: rgba(255, 255, 255, 0.1);
}

.search-container {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid;
    border-color: inherit;
}

.search-container input {
    flex: 1;
    padding: 8px 12px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 4px;
    color: inherit;
    font-size: 13px;
}

.btn-clear {
    width: 24px;
    height: 24px;
    margin-left: 8px;
    background: transparent;
    border: none;
    color: #787b86;
    cursor: pointer;
    font-size: 16px;
}

.exchange-filter {
    padding: 8px 12px;
    border-bottom: 1px solid;
    border-color: inherit;
}

.exchange-filter select {
    width: 100%;
    padding: 6px 10px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 4px;
    color: inherit;
    font-size: 12px;
}

.ticker-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
}

.ticker-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background 0.1s;
    gap: 8px;
}

.ticker-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.ticker-item.is-active {
    background: rgba(41, 98, 255, 0.15);
}

.btn-star {
    width: 20px;
    height: 20px;
    background: transparent;
    border: none;
    color: #787b86;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    transition: color 0.15s;
}

.btn-star:hover,
.btn-star.is-favorite {
    color: #ffd600;
}

.ticker-info {
    flex: 1;
    min-width: 0;
}

.ticker-symbol {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ticker-exchange {
    font-size: 10px;
    color: #787b86;
    margin-top: 2px;
}

.ticker-price {
    text-align: right;
    min-width: 70px;
}

.price-value {
    font-size: 13px;
    font-weight: 500;
    font-family: monospace;
}

.price-change {
    font-size: 11px;
    font-family: monospace;
    margin-top: 2px;
}

.price-change.positive {
    color: #23a776;
}

.price-change.negative {
    color: #e54150;
}

.ticker-sparkline {
    width: 60px;
    height: 20px;
    margin-left: 8px;
}

.ticker-sparkline svg {
    width: 100%;
    height: 100%;
}

.empty-state {
    padding: 40px 20px;
    text-align: center;
    color: #787b86;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
}

.empty-state p {
    margin: 0 0 16px;
    font-size: 13px;
}

.btn-add-first {
    padding: 10px 20px;
    background: #2962ff;
    border: none;
    border-radius: 4px;
    color: #fff;
    font-size: 13px;
    cursor: pointer;
}

.panel-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-top: 1px solid;
    border-color: inherit;
    font-size: 11px;
    color: #787b86;
}

.gainers {
    color: #23a776;
}

.losers {
    color: #e54150;
}

/* Modal Styles */
.tvjs-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.tvjs-modal {
    background: #1e2224;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    min-width: 320px;
    max-width: 400px;
}

.add-ticker-modal .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #363a45;
}

.add-ticker-modal .modal-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
}

.btn-close {
    background: transparent;
    border: none;
    color: #787b86;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.btn-close:hover {
    color: #fff;
}

.modal-body {
    padding: 20px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    color: #787b86;
    text-transform: uppercase;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 10px 12px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 4px;
    color: #d1d4dc;
    font-size: 13px;
    box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
    border-color: #2962ff;
    outline: none;
}

.quick-add {
    margin-top: 16px;
}

.quick-add h4 {
    margin: 0 0 10px;
    font-size: 11px;
    color: #787b86;
    text-transform: uppercase;
}

.suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.btn-suggestion {
    padding: 6px 12px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 4px;
    color: #d1d4dc;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
}

.btn-suggestion:hover {
    background: #363a45;
    border-color: #2962ff;
}

.modal-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid #363a45;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background: #2962ff;
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    background: #1e53e4;
}

.btn-secondary {
    background: #363a45;
    color: #d1d4dc;
}

.btn-secondary:hover {
    background: #4c525e;
}

/* Context Menu */
.context-menu {
    position: fixed;
    background: #1e2224;
    border: 1px solid #363a45;
    border-radius: 6px;
    padding: 4px 0;
    min-width: 140px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10001;
}

.context-menu button {
    display: block;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: #d1d4dc;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
}

.context-menu button:hover {
    background: #2a2e39;
}

/* Scrollbar */
.ticker-list::-webkit-scrollbar {
    width: 6px;
}

.ticker-list::-webkit-scrollbar-track {
    background: transparent;
}

.ticker-list::-webkit-scrollbar-thumb {
    background: #363a45;
    border-radius: 3px;
}

.ticker-list::-webkit-scrollbar-thumb:hover {
    background: #4c525e;
}
</style>
