<template>
<div>
    <!-- TradingVue with built-in Timeframe Selector -->
    <trading-vue
        :data="chart"
        :width="width"
        :height="height"
        :toolbar="true"
        :timeframes="true"
        :timeframe="currentTimeframe"
        :timeframe-style="tfStyle"
        :timeframe-extended="true"
        :index-based="index_based"
        :color-back="colors.colorBack"
        :color-grid="colors.colorGrid"
        :color-text="colors.colorText"
        @timeframe-change="onTimeframeChange"
        ref="tradingVue">
    </trading-vue>

    <!-- Controls -->
    <div class="controls-panel">
        <div class="control-group">
            <label>Selector Style:</label>
            <select v-model="tfStyle">
                <option value="dropdown">Dropdown (Compact)</option>
                <option value="full">Full (All buttons)</option>
            </select>
        </div>

        <div class="control-group">
            <input type="checkbox" v-model="log_scale" id="logScale">
            <label for="logScale">Log Scale</label>
        </div>

        <div class="control-group">
            <input type="checkbox" v-model="index_based" id="indexBased">
            <label for="indexBased">Index Based</label>
        </div>
    </div>

    <div class="tf-status">
        Current Timeframe: <strong>{{ currentTimeframe }}</strong>
        <span v-if="loading" class="loading">Loading...</span>
    </div>
</div>
</template>

<script>
import TradingVue from '../../src/TradingVue.vue'
import DataCube from '../../src/helpers/datacube.js'
import Data from '../data/data_tf.json'

export default {
    name: 'TimeframesIntegrated',
    description: 'TradingVue with built-in Timeframe Selector',
    props: ['night'],
    components: {
        TradingVue
    },
    data() {
        return {
            chart: new DataCube({}),
            width: window.innerWidth,
            height: window.innerHeight - 50,
            log_scale: false,
            index_based: false,
            currentTimeframe: '1D',
            tfStyle: 'dropdown',
            loading: false,
            charts: Data
        }
    },
    methods: {
        onResize() {
            this.width = window.innerWidth
            this.height = window.innerHeight - 50
        },
        onTimeframeChange(tf) {
            console.log('Timeframe changed:', tf)
            this.loading = true

            // Simulate loading data for new timeframe
            setTimeout(() => {
                // In real app, you would fetch/load data for this timeframe
                if (this.charts[tf]) {
                    this.chart.set('chart.data', this.charts[tf])
                }
                this.$refs.tradingVue.resetChart()
                this.loading = false
            }, 300)
        }
    },
    computed: {
        colors() {
            return this.$props.night ? {} : {
                colorBack: '#fff',
                colorGrid: '#eee',
                colorText: '#333'
            }
        }
    },
    mounted() {
        window.addEventListener('resize', this.onResize)
        this.onResize()
        window.dc = this.chart
        window.tv = this.$refs.tradingVue
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize)
    },
    watch: {
        log_scale(value) {
            if (this.chart.data.chart) {
                this.$set(this.chart.data.chart, 'grid', {
                    logScale: value
                })
            }
        }
    }
}
</script>

<style>
.controls-panel {
    position: absolute;
    top: 60px;
    right: 80px;
    display: flex;
    gap: 15px;
    color: #888;
    font: 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.control-group {
    display: flex;
    align-items: center;
    gap: 5px;
}

.control-group select {
    background: #1e2224;
    border: 1px solid #363a45;
    color: #d1d4dc;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
}

.tf-status {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 8px 16px;
    border-radius: 4px;
    font: 12px -apple-system, BlinkMacSystemFont, sans-serif;
}

.loading {
    color: #2962ff;
    margin-left: 10px;
}

@media only screen and (max-width: 768px) {
    .controls-panel {
        flex-wrap: wrap;
        top: 55px;
        right: 10px;
        left: 10px;
        justify-content: center;
    }
}
</style>
