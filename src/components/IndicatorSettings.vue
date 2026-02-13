<template>
<!--
  IndicatorSettings.vue - Modal dialog for indicator settings
  TradingView-style indicator configuration
-->
<div class="tvjs-modal-overlay" v-if="visible" @click.self="close">
    <div class="tvjs-modal tvjs-settings-modal">
        <div class="modal-header">
            <h3>{{ indicatorName }}</h3>
            <button class="btn-close" @click="close">×</button>
        </div>

        <div class="modal-body">
            <!-- Parameters Section -->
            <div class="settings-section" v-if="hasParams">
                <h4>Parameters</h4>
                <div class="param-row" v-for="(value, key) in localParams" :key="key">
                    <label>{{ formatLabel(key) }}</label>
                    <input
                        type="number"
                        v-model.number="localParams[key]"
                        :min="getParamMin(key)"
                        :max="getParamMax(key)"
                        :step="getParamStep(key)"
                    />
                </div>
            </div>

            <!-- Style Section -->
            <div class="settings-section">
                <h4>Style</h4>

                <!-- Line Color -->
                <div class="param-row">
                    <label>Line Color</label>
                    <div class="color-input-wrapper">
                        <div
                            class="color-preview"
                            :style="{ backgroundColor: localSettings.color }"
                            @click="showColorPicker = !showColorPicker"
                        ></div>
                        <input
                            type="text"
                            v-model="localSettings.color"
                            class="color-text-input"
                        />
                    </div>
                </div>

                <!-- Color Picker Dropdown -->
                <div class="color-picker-dropdown" v-if="showColorPicker">
                    <div class="preset-colors">
                        <div
                            v-for="color in presetColors"
                            :key="color"
                            class="preset-color"
                            :style="{ backgroundColor: color }"
                            @click="selectColor(color)"
                        ></div>
                    </div>
                    <div class="custom-color">
                        <input
                            type="color"
                            v-model="localSettings.color"
                            @input="showColorPicker = false"
                        />
                        <span>Custom</span>
                    </div>
                </div>

                <!-- Line Width -->
                <div class="param-row" v-if="isOnChart">
                    <label>Line Width</label>
                    <input
                        type="range"
                        v-model.number="localSettings.width"
                        min="1"
                        max="5"
                    />
                    <span class="range-value">{{ localSettings.width || 1 }}</span>
                </div>

                <!-- Line Style -->
                <div class="param-row" v-if="isOnChart">
                    <label>Line Style</label>
                    <select v-model="localSettings.lineStyle">
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                    </select>
                </div>

                <!-- Opacity -->
                <div class="param-row">
                    <label>Opacity</label>
                    <input
                        type="range"
                        v-model.number="localSettings.opacity"
                        min="0"
                        max="100"
                    />
                    <span class="range-value">{{ localSettings.opacity || 100 }}%</span>
                </div>
            </div>

            <!-- Visibility Section -->
            <div class="settings-section">
                <h4>Visibility</h4>
                <div class="param-row checkbox-row">
                    <label>
                        <input type="checkbox" v-model="localSettings.visible" />
                        Show Indicator
                    </label>
                </div>
                <div class="param-row checkbox-row" v-if="isOffChart">
                    <label>
                        <input type="checkbox" v-model="localSettings.showLegend" />
                        Show in Legend
                    </label>
                </div>
            </div>

            <!-- Levels (for RSI, Stoch, etc.) -->
            <div class="settings-section" v-if="hasLevels">
                <h4>Levels</h4>
                <div class="param-row">
                    <label>Upper Level</label>
                    <input type="number" v-model.number="localSettings.upper" />
                </div>
                <div class="param-row">
                    <label>Lower Level</label>
                    <input type="number" v-model.number="localSettings.lower" />
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <button class="btn btn-secondary" @click="reset">Reset</button>
            <button class="btn btn-secondary" @click="remove">
                <span class="remove-icon">🗑</span> Remove
            </button>
            <button class="btn btn-primary" @click="apply">Apply</button>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'IndicatorSettings',

    props: {
        visible: {
            type: Boolean,
            default: false
        },
        indicator: {
            type: Object,
            default: null
        }
    },

    data() {
        return {
            localParams: {},
            localSettings: {},
            showColorPicker: false,

            // Preset colors (TradingView style)
            presetColors: [
                '#2962ff', '#ff6d00', '#00c853', '#aa00ff',
                '#00b8d4', '#ff1744', '#ffd600', '#76ff03',
                '#e040fb', '#18ffff', '#ff6e40', '#69f0ae',
                '#40c4ff', '#ff4081', '#eeff41', '#b2ff59'
            ]
        }
    },

    computed: {
        indicatorName() {
            return (this.indicator && this.indicator.name) || 'Indicator Settings'
        },

        hasParams() {
            return this.indicator && this.indicator.params
        },

        isOnChart() {
            return this.indicator && this.indicator.position === 'onchart'
        },

        isOffChart() {
            return this.indicator && this.indicator.position === 'offchart'
        },

        hasLevels() {
            if (!this.indicator) return false
            const types = ['RSI', 'Stoch', 'CCI', 'MFI', 'WPR']
            return types.includes(this.indicator.type)
        }
    },

    watch: {
        indicator: {
            immediate: true,
            deep: true,
            handler(newVal) {
                if (newVal) {
                    this.localParams = { ...newVal.params }
                    this.localSettings = { ...newVal.settings }
                }
            }
        }
    },

    methods: {
        formatLabel(key) {
            const labels = {
                length: 'Length',
                period: 'Period',
                fast: 'Fast Length',
                slow: 'Slow Length',
                signal: 'Signal Length',
                mult: 'Multiplier',
                k: '%K Length',
                d: '%D Length',
                smooth: 'Smooth'
            }
            return labels[key] || key.charAt(0).toUpperCase() + key.slice(1)
        },

        getParamMin(key) {
            const mins = { length: 1, period: 1, fast: 1, slow: 1, signal: 1, mult: 0.1, k: 1, d: 1 }
            return mins[key] || 1
        },

        getParamMax(key) {
            const maxs = { length: 500, period: 500, fast: 200, slow: 200, signal: 100, mult: 5, k: 100, d: 50 }
            return maxs[key] || 500
        },

        getParamStep(key) {
            return key === 'mult' ? 0.1 : 1
        },

        selectColor(color) {
            this.localSettings.color = color
            this.showColorPicker = false
        },

        apply() {
            this.$emit('apply', {
                id: this.indicator.id,
                params: { ...this.localParams },
                settings: { ...this.localSettings }
            })
            this.close()
        },

        reset() {
            if (this.indicator && this.indicator._config) {
                this.localParams = { ...this.indicator._config.params }
                this.localSettings = { ...this.indicator._config.defaultSettings }
            }
        },

        remove() {
            this.$emit('remove', this.indicator.id)
            this.close()
        },

        close() {
            this.showColorPicker = false
            this.$emit('close')
        }
    }
}
</script>

<style scoped>
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #d1d4dc;
    min-width: 320px;
    max-width: 400px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #363a45;
}

.modal-header h3 {
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
    padding: 16px 20px;
    max-height: 400px;
    overflow-y: auto;
}

.settings-section {
    margin-bottom: 20px;
}

.settings-section h4 {
    margin: 0 0 12px 0;
    font-size: 12px;
    font-weight: 600;
    color: #787b86;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.param-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.param-row label {
    flex: 1;
    font-size: 13px;
    color: #d1d4dc;
}

.param-row input[type="number"],
.param-row select {
    width: 100px;
    padding: 6px 10px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 4px;
    color: #d1d4dc;
    font-size: 13px;
}

.param-row input[type="number"]:focus,
.param-row select:focus {
    border-color: #2962ff;
    outline: none;
}

.param-row input[type="range"] {
    width: 100px;
    margin-right: 10px;
}

.range-value {
    width: 40px;
    text-align: right;
    font-size: 12px;
    color: #787b86;
}

.checkbox-row label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.checkbox-row input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.color-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.color-preview {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid #363a45;
}

.color-text-input {
    width: 80px;
    padding: 6px 10px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 4px;
    color: #d1d4dc;
    font-size: 13px;
    font-family: monospace;
}

.color-picker-dropdown {
    position: absolute;
    right: 20px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 8px;
    padding: 12px;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.preset-colors {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-bottom: 10px;
}

.preset-color {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.1s;
}

.preset-color:hover {
    transform: scale(1.1);
}

.custom-color {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid #363a45;
}

.custom-color input[type="color"] {
    width: 40px;
    height: 28px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.modal-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid #363a45;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}

.btn-primary {
    background: #2962ff;
    color: #fff;
}

.btn-primary:hover {
    background: #1e53e4;
}

.btn-secondary {
    background: #363a45;
    color: #d1d4dc;
}

.btn-secondary:hover {
    background: #4c525e;
}

.remove-icon {
    margin-right: 4px;
}
</style>
