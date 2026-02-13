
<template>
    <!-- Main component  -->
    <div class="trading-vue" v-bind:id="id"
        @mousedown="mousedown" @mouseleave="mouseleave"
         :style="{
            color: this.chart_props.colors.text,
            font: this.font_comp,
            width: totalWidth+'px',
            height: this.height+'px'}">
        <div class="tvjs-main-container" :style="{ width: chartWidth+'px' }">
            <toolbar v-if="toolbar"
                ref="toolbar"
                v-on:custom-event="custom_event"
                v-bind="chart_props"
                v-bind:config="chart_config">
            </toolbar>
            <widgets v-if="controllers.length"
                ref="widgets"
                :map="ws" :width="chartWidth" :height="height"
                :tv="this" :dc="data">
            </widgets>
            <chart :key="reset"
                ref="chart"
                v-bind="chart_props"
                v-bind:tv_id="id"
                v-bind:config="chart_config"
                v-on:custom-event="custom_event"
                v-on:range-changed="range_changed"
                v-on:legend-button-click="legend_button">
            </chart>
            <transition name="tvjs-drift">
                <the-tip :data="tip" v-if="tip"
                    @remove-me="tip = null"/>
            </transition>

            <!-- Built-in Timeframe Selector -->
            <tf-selector v-if="timeframes && timeframeStyle === 'full'"
                v-model="currentTF"
                :night="isDarkTheme"
                :extended="timeframeExtended"
                :show-seconds="showSecondsTF"
                @change="on_timeframe_change"
            />
            <tf-selector-dropdown v-if="timeframes && timeframeStyle === 'dropdown'"
                v-model="currentTF"
                :night="isDarkTheme"
                @change="on_timeframe_change"
            />
        </div>

        <!-- Watchlist Panel (Right Side) -->
        <watchlist-panel
            v-if="showWatchlist"
            ref="watchlist"
            :symbol="symbol"
            :exchange="exchangeName"
            :tickers="watchlistTickers"
            :exchanges="configuredExchanges"
            :night="isDarkTheme"
            :initial-width="watchlistWidth"
            :min-width="watchlistMinWidth"
            :max-width="watchlistMaxWidth"
            @ticker-select="on_ticker_select"
            @ticker-add="on_ticker_add"
            @ticker-remove="on_ticker_remove"
            @resize="on_watchlist_resize"
            @collapse="on_watchlist_collapse"
        />
    </div>
</template>

<script>

import Const from './stuff/constants.js'
import Chart from './components/Chart.vue'
import Toolbar from './components/Toolbar.vue'
import Widgets from './components/Widgets.vue'
import TheTip from './components/TheTip.vue'
import TFSelector from './components/TFSelector.vue'
import TFSelectorDropdown from './components/TFSelectorDropdown.vue'
import WatchlistPanel from './components/WatchlistPanel.vue'
import XControl from './mixins/xcontrol.js'
import DataCube from './helpers/datacube.js'
import DataProvider from './helpers/DataProvider.js'
import IndicatorManager from './helpers/IndicatorManager.js'

export default {
    name: 'TradingVue',
    components: {
        Chart, Toolbar, Widgets, TheTip,
        TFSelector, TFSelectorDropdown, WatchlistPanel
    },
    mixins: [ XControl ],
    props: {
        titleTxt: {
            type: String,
            default: 'TradingVue.js'
        },
        id: {
            type: String,
            default: 'trading-vue-js'
        },
        width: {
            type: Number,
            default: 800
        },
        height: {
            type: Number,
            default: 421
        },
        colorTitle: {
            type: String,
            default: '#42b883'
        },
        colorBack: {
            type: String,
            default: '#121826'
        },
        colorGrid: {
            type: String,
            default: '#2f3240'
        },
        colorText: {
            type: String,
            default: '#dedddd'
        },
        colorTextHL: {
            type: String,
            default: '#fff'
        },
        colorScale: {
            type: String,
            default: '#838383'
        },
        colorCross: {
            type: String,
            default: '#8091a0'
        },
        colorCandleUp: {
            type: String,
            default: '#23a776'
        },
        colorCandleDw: {
            type: String,
            default: '#e54150'
        },
        colorWickUp: {
            type: String,
            default: '#23a77688'
        },
        colorWickDw: {
            type: String,
            default: '#e5415088'
        },
        colorWickSm: {
            type: String,
            default: 'transparent' // deprecated
        },
        colorVolUp: {
            type: String,
            default: '#79999e42'
        },
        colorVolDw: {
            type: String,
            default: '#ef535042'
        },
        colorPanel: {
            type: String,
            default: '#565c68'
        },
        colorTbBack: {
            type: String
        },
        colorTbBorder: {
            type: String,
            default: '#8282827d'
        },
        colors: {
            type: Object
        },
        font: {
            type: String,
            default: Const.ChartConfig.FONT
        },
        toolbar: {
            type: Boolean,
            default: false
        },
        data: {
            type: Object,
            required: true
        },
        // Your overlay classes here
        overlays: {
            type: Array,
            default: function () { return [] }
        },
        // Overwrites ChartConfig values,
        // see constants.js
        chartConfig: {
            type: Object,
            default: function () { return {} }
        },
        legendButtons: {
            type: Array,
            default: function () { return [] }
        },
        indexBased: {
            type: Boolean,
            default: false
        },
        extensions: {
            type: Array,
            default: function () { return [] }
        },
        xSettings: {
            type: Object,
            default: function () { return {} }
        },
        skin: {
            type: String // Skin Name
        },
        timezone: {
            type: Number,
            default: 0
        },
        // Timeframe selector options
        timeframes: {
            type: Boolean,
            default: false
        },
        timeframe: {
            type: String,
            default: '1D'
        },
        timeframeStyle: {
            type: String,
            default: 'dropdown' // 'full' or 'dropdown'
        },
        timeframeExtended: {
            type: Boolean,
            default: false
        },
        showSecondsTF: {
            type: Boolean,
            default: false
        },
        // Auto data loading options
        autoLoadData: {
            type: Boolean,
            default: true
        },
        // Custom data loader: async (symbol, tf) => ohlcv[]
        dataLoader: {
            type: Function,
            default: null
        },
        // Trading symbol
        symbol: {
            type: String,
            default: 'BTC/USDT'
        },
        // Auto recalculate indicators on TF change
        autoRecalcIndicators: {
            type: Boolean,
            default: true
        },
        // Watchlist Panel options
        showWatchlist: {
            type: Boolean,
            default: false
        },
        watchlistWidth: {
            type: Number,
            default: 250
        },
        watchlistMinWidth: {
            type: Number,
            default: 150
        },
        watchlistMaxWidth: {
            type: Number,
            default: 500
        },
        watchlistTitle: {
            type: String,
            default: 'Избранное'
        },
        exchangeName: {
            type: String,
            default: ''
        },
        watchlistTickers: {
            type: Array,
            default: () => []
        },
        popularTickers: {
            type: Array,
            default: () => ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'SOL/USDT']
        },
        watchlistSearch: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        // Copy a subset of TradingVue props
        chart_props() {
            let offset = this.$props.toolbar ?
                this.chart_config.TOOLBAR : 0
            let chart_props = {
                title_txt: this.$props.titleTxt,
                overlays: this.$props.overlays.concat(this.mod_ovs),
                data: this.decubed,
                width: this.$props.width - offset,
                height: this.$props.height,
                font: this.font_comp,
                buttons: this.$props.legendButtons,
                toolbar: this.$props.toolbar,
                ib: this.$props.indexBased || this.index_based || false,
                colors: Object.assign({}, this.$props.colors ||
                    this.colorpack),
                skin: this.skin_proto,
                timezone: this.$props.timezone
            }

            this.parse_colors(chart_props.colors)
            return chart_props
        },
        chart_config() {
            return Object.assign({},
                Const.ChartConfig,
                this.$props.chartConfig,
            )
        },
        decubed() {
            let data = this.$props.data
            if (data.data !== undefined) {
                // DataCube detected
                data.init_tvjs(this)
                return data.data
            } else {
                return data
            }
        },
        index_based() {
            const base = this.$props.data
            if (base.chart) {
                return base.chart.indexBased
            }
            else if (base.data) {
                return base.data.chart.indexBased
            }
            return false
        },
        mod_ovs() {
            let arr = []
            for (var x of this.$props.extensions) {
                arr.push(...Object.values(x.overlays))
            }
            return arr
        },
        font_comp() {
            return this.skin_proto && this.skin_proto.font ?
                this.skin_proto.font : this.font
        },
        isDarkTheme() {
            const back = this.$props.colors?.back || this.$props.colorBack
            // Simple check: if background is dark (low lightness)
            return back && back !== '#fff' && back !== '#ffffff'
        },
        // Calculate total width including watchlist
        totalWidth() {
            if (this.$props.showWatchlist) {
                return this.$props.width + this.currentWatchlistWidth
            }
            return this.$props.width
        },
        // Calculate chart width (excluding watchlist)
        chartWidth() {
            return this.$props.width
        }
    },
    data() {
        return {
            reset: 0,
            tip: null,
            currentTF: this.$props.timeframe,
            // DataProvider instance
            dataProvider: null,
            // IndicatorManager instance
            indicatorManager: null,
            // Loading state
            isLoading: false,
            // Configured exchanges for watchlist
            configuredExchanges: [{ id: 'default', name: 'Default' }],
            // Current watchlist width (for tracking resize)
            currentWatchlistWidth: this.$props.watchlistWidth
        }
    },
    beforeDestroy() {
        this.custom_event({ event: 'before-destroy' })
        this.ctrl_destroy()
    },
    methods: {
        // TODO: reset extensions?
        resetChart(resetRange = true) {
            this.reset++
            let range = this.getRange()
            if (!resetRange && range[0] && range[1]) {
                this.$nextTick(() => this.setRange(...range))
            }
            this.$nextTick(() => this.custom_event({
                event: 'chart-reset', args: []
            }))
        },
        goto(t) {
            // TODO: limit goto & setRange (out of data error)
            if (this.chart_props.ib) {
                const ti_map = this.$refs.chart.ti_map
                t = ti_map.gt2i(t, this.$refs.chart.ohlcv)
            }
            this.$refs.chart.goto(t)
        },
        setRange(t1, t2) {
            if (this.chart_props.ib) {
                const ti_map = this.$refs.chart.ti_map
                const ohlcv = this.$refs.chart.ohlcv
                t1 = ti_map.gt2i(t1, ohlcv)
                t2 = ti_map.gt2i(t2, ohlcv)
            }
            this.$refs.chart.setRange(t1, t2)
        },
        getRange() {
            if (this.chart_props.ib) {
                const ti_map = this.$refs.chart.ti_map
                // Time range => index range
                return this.$refs.chart.range
                    .map(x => ti_map.i2t(x))
            }
            return this.$refs.chart.range
        },
        getCursor() {

            let cursor = this.$refs.chart.cursor
            if (this.chart_props.ib) {
                const ti_map = this.$refs.chart.ti_map
                let copy = Object.assign({}, cursor)
                copy.i = copy.t
                copy.t = ti_map.i2t(copy.t)
                return copy
            }
            return cursor
        },
        showTheTip(text, color = "orange") {
            this.tip = { text, color }
        },
        legend_button(event) {
            this.custom_event({
                event: 'legend-button-click', args: [event]
            })
        },
        custom_event(d) {
            if ('args' in d) {
                this.$emit(d.event, ...d.args)
            } else {
                this.$emit(d.event)
            }
            let data = this.$props.data
            let ctrl = this.controllers.length !== 0
            if (ctrl) this.pre_dc(d)
            if (data.tv) {
                // If the data object is DataCube
                data.on_custom_event(d.event, d.args)
            }
            if (ctrl) this.post_dc(d)
        },
        range_changed(r) {
            if (this.chart_props.ib) {
                const ti_map = this.$refs.chart.ti_map
                r = r.map(x => ti_map.i2t(x))
            }
            this.$emit('range-changed', r)
            this.custom_event(
                {event: 'range-changed', args: [r]}
            )
            if (this.onrange) this.onrange(r)
        },
        set_loader(dc) {
            this.onrange = r => {
                let pf = this.chart_props.ib ? '_ms' : ''
                let tf = this.$refs.chart['interval' + pf]
                dc.range_changed(r, tf)
            }
        },
        parse_colors(colors) {
            for (var k in this.$props) {
                if (k.indexOf('color') === 0 && k !== 'colors') {
                    let k2 = k.replace('color', '')
                    k2 = k2[0].toLowerCase() + k2.slice(1)
                    if (colors[k2]) continue
                    colors[k2] = this.$props[k]
                }
            }
        },
        mousedown() {
            this.$refs.chart.activated = true
        },
        mouseleave() {
            this.$refs.chart.activated = false
        },

        // ==================== Timeframe & Data Management ====================

        /**
         * Initialize DataProvider and IndicatorManager
         */
        initDataServices() {
            // Check if data is a DataCube
            const dc = this.$props.data
            if (!dc || !dc.data) {
                console.warn('[TradingVue] DataCube not detected, auto-load disabled')
                return
            }

            // Initialize DataProvider
            this.dataProvider = new DataProvider({
                symbol: this.$props.symbol,
                loader: this.$props.dataLoader,
                generateDemo: true,
                cache: true
            })

            // Initialize IndicatorManager
            this.indicatorManager = new IndicatorManager(dc, this.dataProvider)

            // Expose to window for debugging
            if (typeof window !== 'undefined') {
                window.tvDataProvider = this.dataProvider
                window.tvIndicatorManager = this.indicatorManager
            }

            console.log('[TradingVue] Data services initialized')
        },

        /**
         * Handle timeframe change
         * Auto-loads data and recalculates indicators
         */
        async on_timeframe_change(tf) {
            console.log(`[TradingVue] Timeframe changed to: ${tf}`)
            this.currentTF = tf

            // Emit events
            this.$emit('timeframe-change', tf)
            this.$emit('update:timeframe', tf)

            // Auto load data if enabled
            if (this.$props.autoLoadData && this.dataProvider) {
                await this.loadTimeframeData(tf)
            }

            // Auto recalculate indicators if enabled
            if (this.$props.autoRecalcIndicators && this.indicatorManager) {
                this.recalculateIndicators()
            }

            // Reset chart
            this.resetChart()
        },

        /**
         * Load data for timeframe
         */
        async loadTimeframeData(tf) {
            this.isLoading = true
            this.$emit('loading-start', tf)

            try {
                const data = await this.dataProvider.getData(tf, this.$props.symbol)

                // Update chart data
                if (this.$props.data && this.$props.data.set) {
                    this.$props.data.set('chart.data', data)
                    console.log(`[TradingVue] Loaded ${data.length} candles for ${tf}`)
                    this.$emit('data-loaded', { tf, data })
                }
            } catch (error) {
                console.error('[TradingVue] Error loading data:', error)
                this.$emit('loading-error', { tf, error })
            } finally {
                this.isLoading = false
                this.$emit('loading-end', tf)
            }
        },

        /**
         * Recalculate all indicators
         */
        recalculateIndicators() {
            if (!this.indicatorManager) return

            const ohlcv = this.$props.data?.chart?.data || []
            this.indicatorManager.recalculateAll(ohlcv)
        },

        // ==================== Public API ====================

        /**
         * Add indicator
         * @param {string} type - EMA, SMA, RSI, MACD, etc.
         * @param {object} params - Indicator parameters
         * @param {object} settings - Display settings
         * @returns {string} Indicator ID
         */
        addIndicator(type, params = {}, settings = {}) {
            if (!this.indicatorManager) {
                console.warn('[TradingVue] IndicatorManager not initialized')
                return null
            }
            return this.indicatorManager.add(type, params, settings)
        },

        /**
         * Remove indicator
         */
        removeIndicator(id) {
            if (!this.indicatorManager) return false
            return this.indicatorManager.remove(id)
        },

        /**
         * Clear all indicators
         */
        clearIndicators() {
            if (!this.indicatorManager) return
            this.indicatorManager.clear()
            this.resetChart()
        },

        /**
         * Get active indicators list
         */
        getIndicators() {
            if (!this.indicatorManager) return []
            return this.indicatorManager.list
        },

        /**
         * Set custom data loader
         * @param {Function} loader - async (symbol, tf) => ohlcv[]
         */
        setDataLoader(loader) {
            if (this.dataProvider) {
                this.dataProvider.setLoader(loader)
            }
        },

        /**
         * Get DataProvider instance
         */
        getDataProvider() {
            return this.dataProvider
        },

        /**
         * Get IndicatorManager instance
         */
        getIndicatorManager() {
            return this.indicatorManager
        },

        // ==================== Watchlist Methods ====================

        /**
         * Handle ticker selection
         */
        on_ticker_select(ticker) {
            this.$emit('ticker-select', ticker)
            this.$emit('update:symbol', ticker.symbol)
        },

        /**
         * Handle ticker add
         */
        on_ticker_add(ticker) {
            this.$emit('ticker-add', ticker)
        },

        /**
         * Handle ticker remove
         */
        on_ticker_remove(ticker) {
            this.$emit('ticker-remove', ticker)
        },

        /**
         * Handle watchlist resize
         */
        on_watchlist_resize(width) {
            this.currentWatchlistWidth = width
            this.$emit('watchlist-resize', width)
        },

        /**
         * Handle watchlist collapse
         */
        on_watchlist_collapse(collapsed) {
            this.$emit('watchlist-collapse', collapsed)
        },

        /**
         * Update watchlist ticker data
         */
        updateWatchlistTicker(symbol, data) {
            if (this.$refs.watchlist) {
                const tickers = [...this.$props.watchlistTickers]
                const index = tickers.findIndex(t => t.symbol === symbol)
                if (index !== -1) {
                    tickers[index] = { ...tickers[index], ...data }
                    this.$emit('update:watchlistTickers', tickers)
                }
            }
        },

        /**
         * Set configured exchanges
         */
        setConfiguredExchanges(exchanges) {
            this.configuredExchanges = exchanges
        }
    },
    watch: {
        timeframe(newVal) {
            this.currentTF = newVal
        },
        symbol(newVal) {
            if (this.dataProvider) {
                this.dataProvider.setSymbol(newVal)
            }
        },
        dataLoader(newVal) {
            if (this.dataProvider) {
                this.dataProvider.setLoader(newVal)
            }
        }
    },
    mounted() {
        // Initialize data services
        this.$nextTick(() => {
            this.initDataServices()
        })
    }
}
</script>
<style>
/* Anit-boostrap tactix */
.trading-vue *, ::after, ::before {
    box-sizing: content-box;
}
.trading-vue img {
    vertical-align: initial;
}
/* Main container layout */
.trading-vue {
    display: flex;
}
.tvjs-main-container {
    position: relative;
    flex-shrink: 0;
}
</style>
