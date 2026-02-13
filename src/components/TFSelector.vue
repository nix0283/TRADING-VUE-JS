<template>
<!--
  TradingVue.js Timeframe Selector
  Full set of TradingView timeframes with visual buttons
-->
<div class="tvjs-tf-selector" :class="{ 'tvjs-tf-night': night }">
    <div class="tf-group" v-for="group in timeframeGroups" :key="group.name">
        <div class="tf-group-label">{{ group.label }}</div>
        <div class="tf-buttons">
            <button
                v-for="tf in group.timeframes"
                :key="tf.value"
                class="tf-btn"
                :class="{
                    'tf-btn-active': selectedTF === tf.value,
                    'tf-btn-hot': tf.hotkey
                }"
                @click="selectTF(tf.value)"
                :title="tf.hotkey ? `${tf.label} (${tf.hotkey})` : tf.label"
            >
                {{ tf.label }}
            </button>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'TFSelector',
    props: {
        // Current selected timeframe
        value: {
            type: String,
            default: '1D'
        },
        // Night mode
        night: {
            type: Boolean,
            default: true
        },
        // Show seconds timeframes
        showSeconds: {
            type: Boolean,
            default: false
        },
        // Show extended timeframes
        extended: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            selectedTF: this.value
        }
    },
    computed: {
        timeframeGroups() {
            const groups = []

            // Seconds (rarely used, hidden by default)
            if (this.$props.showSeconds) {
                groups.push({
                    name: 'seconds',
                    label: 'Секунды',
                    timeframes: [
                        { value: '1s', label: '1s' },
                        { value: '5s', label: '5s' },
                        { value: '15s', label: '15s' },
                        { value: '30s', label: '30s' }
                    ]
                })
            }

            // Minutes
            const minuteTFs = [
                { value: '1', label: '1', hotkey: '1' },
                { value: '3', label: '3', hotkey: '3' },
                { value: '5', label: '5', hotkey: '5' },
                { value: '15', label: '15', hotkey: '15' },
                { value: '30', label: '30', hotkey: '30' },
                { value: '45', label: '45' }
            ]
            if (this.$props.extended) {
                minuteTFs.push(
                    { value: '2', label: '2' },
                    { value: '10', label: '10' },
                    { value: '20', label: '20' },
                    { value: '60', label: '60' },
                    { value: '90', label: '90' },
                    { value: '120', label: '120' }
                )
            }
            groups.push({
                name: 'minutes',
                label: 'Минуты',
                timeframes: minuteTFs.sort((a, b) => parseInt(a.value) - parseInt(b.value))
            })

            // Hours
            const hourTFs = [
                { value: '60', label: '1H', hotkey: 'H' },
                { value: '120', label: '2H' },
                { value: '180', label: '3H' },
                { value: '240', label: '4H', hotkey: '4' },
                { value: '360', label: '6H' },
                { value: '720', label: '12H' }
            ]
            if (this.$props.extended) {
                hourTFs.push(
                    { value: '480', label: '8H' }
                )
            }
            groups.push({
                name: 'hours',
                label: 'Часы',
                timeframes: hourTFs.sort((a, b) => parseInt(a.value) - parseInt(b.value))
            })

            // Days
            groups.push({
                name: 'days',
                label: 'Дни',
                timeframes: [
                    { value: '1D', label: 'D', hotkey: 'D' },
                    { value: '2D', label: '2D' },
                    { value: '3D', label: '3D' },
                    { value: '1W', label: 'W', hotkey: 'W' },
                    { value: '1M', label: 'M', hotkey: 'M' }
                ]
            })

            // Months & Years (extended)
            if (this.$props.extended) {
                groups.push({
                    name: 'months',
                    label: 'Месяцы/Годы',
                    timeframes: [
                        { value: '3M', label: '3M' },
                        { value: '6M', label: '6M' },
                        { value: '12M', label: '12M' },
                        { value: '1Y', label: '1Y' }
                    ]
                })
            }

            return groups
        }
    },
    methods: {
        selectTF(tf) {
            this.selectedTF = tf
            this.$emit('input', tf)
            this.$emit('change', tf)
        },
        // Keyboard shortcuts support
        handleKeydown(e) {
            const hotkeys = {
                '1': '1',
                '3': '3',
                '5': '5',
                'Digit1': '1',
                'Digit3': '3',
                'Digit5': '5',
                'h': '60',
                'H': '60',
                '4': '240',
                'Digit4': '240',
                'd': '1D',
                'D': '1D',
                'w': '1W',
                'W': '1W',
                'm': '1M',
                'M': '1M'
            }

            // Check for modifier keys
            if (e.altKey || e.ctrlKey || e.metaKey) return

            const tf = hotkeys[e.key] || hotkeys[e.code]
            if (tf) {
                this.selectTF(tf)
            }
        }
    },
    mounted() {
        window.addEventListener('keydown', this.handleKeydown)
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeydown)
    },
    watch: {
        value(newVal) {
            this.selectedTF = newVal
        }
    }
}
</script>

<style scoped>
.tvjs-tf-selector {
    position: absolute;
    top: 10px;
    right: 60px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 12px;
    background: #1e2224;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    font-size: 12px;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tvjs-tf-night {
    background: #1e2224;
    color: #d1d4dc;
}

.tvjs-tf-selector:not(.tvjs-tf-night) {
    background: #ffffff;
    color: #131722;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
}

.tf-group {
    display: flex;
    align-items: center;
    gap: 4px;
}

.tf-group-label {
    color: #787b86;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-right: 4px;
    user-select: none;
}

.tf-buttons {
    display: flex;
    gap: 2px;
}

.tf-btn {
    min-width: 28px;
    height: 26px;
    padding: 0 8px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #d1d4dc;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
}

.tvjs-tf-night .tf-btn {
    color: #d1d4dc;
}

.tvjs-tf-selector:not(.tvjs-tf-night) .tf-btn {
    color: #131722;
}

.tf-btn:hover {
    background: #2a2e39;
    color: #ffffff;
}

.tvjs-tf-selector:not(.tvjs-tf-night) .tf-btn:hover {
    background: #f0f3fa;
    color: #131722;
}

.tf-btn-active {
    background: #2962ff !important;
    color: #ffffff !important;
}

.tf-btn-active:hover {
    background: #1e53e4 !important;
}

.tf-btn-hot {
    position: relative;
}

/* Hotkey indicator (small dot) */
.tf-btn-hot::after {
    content: '';
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 3px;
    height: 3px;
    background: #787b86;
    border-radius: 50%;
}

.tf-btn-active.tf-btn-hot::after {
    background: rgba(255, 255, 255, 0.5);
}

/* Mobile responsive */
@media only screen and (max-width: 768px) {
    .tvjs-tf-selector {
        top: 50px;
        right: 10px;
        left: 10px;
        justify-content: center;
        padding: 6px 8px;
    }

    .tf-group-label {
        display: none;
    }

    .tf-btn {
        min-width: 32px;
        height: 28px;
        font-size: 11px;
    }
}

@media only screen and (max-width: 480px) {
    .tvjs-tf-selector {
        flex-wrap: wrap;
        gap: 4px;
    }

    .tf-group {
        flex-wrap: wrap;
    }

    .tf-buttons {
        flex-wrap: wrap;
    }
}
</style>
