<template>
<!--
  TradingVue.js Compact Timeframe Selector
  Dropdown style selector for space-saving
-->
<div class="tvjs-tf-dropdown" :class="{ 'tvjs-tf-night': night }">
    <button
        class="tf-dropdown-toggle"
        @click="toggleDropdown"
        :class="{ 'tf-dropdown-open': isOpen }"
    >
        <span class="tf-current-label">{{ currentLabel }}</span>
        <svg class="tf-arrow" :class="{ 'tf-arrow-up': isOpen }" width="10" height="6" viewBox="0 0 10 6">
            <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
    </button>

    <transition name="tf-dropdown">
        <div class="tf-dropdown-menu" v-if="isOpen" @click.stop>
            <!-- Quick access row -->
            <div class="tf-quick-row">
                <button
                    v-for="tf in quickTimeframes"
                    :key="tf.value"
                    class="tf-quick-btn"
                    :class="{ 'tf-btn-active': selectedTF === tf.value }"
                    @click="selectTF(tf.value)"
                >
                    {{ tf.label }}
                </button>
            </div>

            <div class="tf-divider"></div>

            <!-- Full timeframe list -->
            <div class="tf-section" v-for="section in timeframeSections" :key="section.name">
                <div class="tf-section-header">{{ section.label }}</div>
                <div class="tf-section-grid">
                    <button
                        v-for="tf in section.timeframes"
                        :key="tf.value"
                        class="tf-menu-btn"
                        :class="{ 'tf-btn-active': selectedTF === tf.value }"
                        @click="selectTF(tf.value)"
                        :title="tf.description || ''"
                    >
                        {{ tf.label }}
                    </button>
                </div>
            </div>

            <!-- Custom timeframe input -->
            <div class="tf-divider"></div>
            <div class="tf-custom">
                <input
                    type="text"
                    v-model="customTF"
                    placeholder="Свой период (напр. 45m, 2h)"
                    class="tf-custom-input"
                    @keyup.enter="applyCustomTF"
                />
                <button class="tf-custom-apply" @click="applyCustomTF">OK</button>
            </div>
        </div>
    </transition>
</div>
</template>

<script>
export default {
    name: 'TFSelectorDropdown',
    props: {
        value: {
            type: String,
            default: '1D'
        },
        night: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            selectedTF: this.value,
            isOpen: false,
            customTF: ''
        }
    },
    computed: {
        currentLabel() {
            const allTFs = this.allTimeframes
            const found = allTFs.find(tf => tf.value === this.selectedTF)
            if (found) return found.label
            return this.selectedTF
        },
        quickTimeframes() {
            return [
                { value: '1', label: '1m' },
                { value: '5', label: '5m' },
                { value: '15', label: '15m' },
                { value: '60', label: '1H' },
                { value: '240', label: '4H' },
                { value: '1D', label: 'D' },
                { value: '1W', label: 'W' },
                { value: '1M', label: 'M' }
            ]
        },
        timeframeSections() {
            return [
                {
                    name: 'seconds',
                    label: 'Секунды',
                    timeframes: [
                        { value: '1s', label: '1s', description: '1 секунда' },
                        { value: '5s', label: '5s', description: '5 секунд' },
                        { value: '15s', label: '15s', description: '15 секунд' },
                        { value: '30s', label: '30s', description: '30 секунд' }
                    ]
                },
                {
                    name: 'minutes',
                    label: 'Минуты',
                    timeframes: [
                        { value: '1', label: '1m', description: '1 минута' },
                        { value: '2', label: '2m', description: '2 минуты' },
                        { value: '3', label: '3m', description: '3 минуты' },
                        { value: '5', label: '5m', description: '5 минут' },
                        { value: '10', label: '10m', description: '10 минут' },
                        { value: '15', label: '15m', description: '15 минут' },
                        { value: '20', label: '20m', description: '20 минут' },
                        { value: '30', label: '30m', description: '30 минут' },
                        { value: '45', label: '45m', description: '45 минут' }
                    ]
                },
                {
                    name: 'hours',
                    label: 'Часы',
                    timeframes: [
                        { value: '60', label: '1H', description: '1 час' },
                        { value: '120', label: '2H', description: '2 часа' },
                        { value: '180', label: '3H', description: '3 часа' },
                        { value: '240', label: '4H', description: '4 часа' },
                        { value: '360', label: '6H', description: '6 часов' },
                        { value: '480', label: '8H', description: '8 часов' },
                        { value: '720', label: '12H', description: '12 часов' }
                    ]
                },
                {
                    name: 'days',
                    label: 'Дни',
                    timeframes: [
                        { value: '1D', label: 'D', description: '1 день' },
                        { value: '2D', label: '2D', description: '2 дня' },
                        { value: '3D', label: '3D', description: '3 дня' },
                        { value: '1W', label: 'W', description: '1 неделя' },
                        { value: '2W', label: '2W', description: '2 недели' }
                    ]
                },
                {
                    name: 'months',
                    label: 'Месяцы',
                    timeframes: [
                        { value: '1M', label: 'M', description: '1 месяц' },
                        { value: '3M', label: '3M', description: '3 месяца' },
                        { value: '6M', label: '6M', description: '6 месяцев' },
                        { value: '12M', label: '12M', description: '12 месяцев' },
                        { value: '1Y', label: 'Y', description: '1 год' }
                    ]
                }
            ]
        },
        allTimeframes() {
            return this.timeframeSections.reduce((acc, section) => {
                return acc.concat(section.timeframes)
            }, this.quickTimeframes)
        }
    },
    methods: {
        toggleDropdown() {
            this.isOpen = !this.isOpen
        },
        closeDropdown() {
            this.isOpen = false
        },
        selectTF(tf) {
            this.selectedTF = tf
            this.$emit('input', tf)
            this.$emit('change', tf)
            this.closeDropdown()
        },
        applyCustomTF() {
            if (this.customTF.trim()) {
                // Parse custom timeframe (e.g., "45m", "2h", "3D")
                const parsed = this.parseTimeframe(this.customTF.trim())
                if (parsed) {
                    this.selectTF(parsed)
                    this.customTF = ''
                }
            }
        },
        parseTimeframe(input) {
            // Match patterns like "45m", "2h", "3D", "1W"
            const match = input.match(/^(\d+)(s|m|h|D|W|M|Y)$/i)
            if (match) {
                const num = parseInt(match[1])
                const unit = match[2].toUpperCase()

                // Convert to standard format
                switch (unit) {
                    case 'S': return `${num}s`
                    case 'M': return num === 1 ? '1M' : `${num * 30}` // Approximate for months
                    case 'H': return `${num * 60}`
                    case 'D': return num === 1 ? '1D' : `${num}D`
                    case 'W': return num === 1 ? '1W' : `${num}W`
                    case 'Y': return '1Y'
                    default: return input
                }
            }
            // Plain number = minutes
            if (/^\d+$/.test(input)) {
                return input
            }
            return input
        },
        handleClickOutside(e) {
            if (!this.$el.contains(e.target)) {
                this.closeDropdown()
            }
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside)
    },
    beforeDestroy() {
        document.removeEventListener('click', this.handleClickOutside)
    },
    watch: {
        value(newVal) {
            this.selectedTF = newVal
        }
    }
}
</script>

<style scoped>
.tvjs-tf-dropdown {
    position: absolute;
    top: 10px;
    right: 60px;
    z-index: 1000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.tf-dropdown-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #1e2224;
    border: 1px solid #363a45;
    border-radius: 4px;
    color: #d1d4dc;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
}

.tvjs-tf-night .tf-dropdown-toggle {
    background: #1e2224;
    border-color: #363a45;
    color: #d1d4dc;
}

.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-dropdown-toggle {
    background: #ffffff;
    border-color: #e0e0e0;
    color: #131722;
}

.tf-dropdown-toggle:hover {
    border-color: #4c525e;
}

.tf-dropdown-open {
    border-color: #2962ff !important;
}

.tf-current-label {
    font-weight: 600;
}

.tf-arrow {
    color: #787b86;
    transition: transform 0.15s ease;
}

.tf-arrow-up {
    transform: rotate(180deg);
}

.tf-dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 320px;
    padding: 12px;
    background: #1e2224;
    border: 1px solid #363a45;
    border-radius: 6px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-dropdown-menu {
    background: #ffffff;
    border-color: #e0e0e0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Quick access row */
.tf-quick-row {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.tf-quick-btn {
    min-width: 36px;
    height: 28px;
    padding: 0 10px;
    border: none;
    border-radius: 4px;
    background: #2a2e39;
    color: #d1d4dc;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
}

.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-quick-btn {
    background: #f0f3fa;
    color: #131722;
}

.tf-quick-btn:hover {
    background: #363a45;
    color: #ffffff;
}

.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-quick-btn:hover {
    background: #e0e3eb;
}

.tf-btn-active {
    background: #2962ff !important;
    color: #ffffff !important;
}

.tf-btn-active:hover {
    background: #1e53e4 !important;
}

/* Divider */
.tf-divider {
    height: 1px;
    background: #363a45;
    margin: 10px 0;
}

.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-divider {
    background: #e0e0e0;
}

/* Section */
.tf-section {
    margin-bottom: 8px;
}

.tf-section-header {
    font-size: 10px;
    font-weight: 600;
    color: #787b86;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
}

.tf-section-grid {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.tf-menu-btn {
    min-width: 40px;
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
}

.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-menu-btn {
    color: #131722;
}

.tf-menu-btn:hover {
    background: #2a2e39;
    color: #ffffff;
}

.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-menu-btn:hover {
    background: #f0f3fa;
}

/* Custom input */
.tf-custom {
    display: flex;
    gap: 6px;
}

.tf-custom-input {
    flex: 1;
    height: 28px;
    padding: 0 10px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 4px;
    color: #d1d4dc;
    font-size: 12px;
    outline: none;
    transition: border-color 0.15s ease;
}

.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-custom-input {
    background: #f0f3fa;
    border-color: #e0e0e0;
    color: #131722;
}

.tf-custom-input::placeholder {
    color: #787b86;
}

.tf-custom-input:focus {
    border-color: #2962ff;
}

.tf-custom-apply {
    height: 28px;
    padding: 0 12px;
    background: #2962ff;
    border: none;
    border-radius: 4px;
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease;
}

.tf-custom-apply:hover {
    background: #1e53e4;
}

/* Transitions */
.tf-dropdown-enter-active,
.tf-dropdown-leave-active {
    transition: all 0.15s ease;
}

.tf-dropdown-enter,
.tf-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

/* Mobile */
@media only screen and (max-width: 480px) {
    .tf-dropdown-menu {
        position: fixed;
        top: auto;
        bottom: 0;
        left: 0;
        right: 0;
        min-width: auto;
        border-radius: 12px 12px 0 0;
        max-height: 70vh;
        overflow-y: auto;
    }
}
</style>
