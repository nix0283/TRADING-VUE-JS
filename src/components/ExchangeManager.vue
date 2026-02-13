<template>
<!--
  ExchangeManager.vue - Manage multiple exchanges
  List, add, edit, remove exchanges
-->
<div class="tvjs-exchange-manager">
    <!-- Header -->
    <div class="manager-header">
        <h3>🔗 Exchanges</h3>
        <button class="btn-add" @click="showAddModal = true">+ Add Exchange</button>
    </div>

    <!-- Exchange List -->
    <div class="exchange-list">
        <div
            v-for="exchange in exchanges"
            :key="exchange.id"
            class="exchange-item"
            :class="{ 'is-default': exchange.id === defaultExchange }"
        >
            <div class="exchange-main">
                <div class="exchange-icon">
                    {{ getExchangeIcon(exchange.id) }}
                </div>
                <div class="exchange-info">
                    <div class="exchange-name">
                        {{ exchange.name }}
                        <span v-if="exchange.id === defaultExchange" class="default-badge">DEFAULT</span>
                    </div>
                    <div class="exchange-status">
                        <span :class="exchange.enabled ? 'status-enabled' : 'status-disabled'">
                            {{ exchange.enabled ? '● Enabled' : '○ Disabled' }}
                        </span>
                        <span v-if="exchange.apiKey" class="has-key">🔑 API Key</span>
                    </div>
                </div>
            </div>

            <div class="exchange-actions">
                <button
                    v-if="exchange.id !== defaultExchange"
                    class="btn-action"
                    @click="setDefault(exchange.id)"
                    title="Set as default"
                >
                    ⭐
                </button>
                <button
                    class="btn-action"
                    @click="editExchange(exchange.id)"
                    title="Edit"
                >
                    ⚙️
                </button>
                <button
                    class="btn-action btn-remove"
                    @click="removeExchange(exchange.id)"
                    title="Remove"
                >
                    🗑️
                </button>
            </div>
        </div>

        <div v-if="exchanges.length === 0" class="no-exchanges">
            No exchanges configured. Click "Add Exchange" to get started.
        </div>
    </div>

    <!-- Actions -->
    <div class="manager-actions">
        <button class="btn-secondary" @click="exportConfig">
            📥 Export Config
        </button>
        <button class="btn-secondary" @click="triggerImport">
            📤 Import Config
        </button>
        <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="importConfig"
            style="display: none"
        />
    </div>

    <!-- Add/Edit Modal -->
    <exchange-settings
        :visible="showAddModal || editingExchange !== null"
        :edit-exchange-id="editingExchange"
        :configured-exchanges="exchanges"
        @close="closeModal"
        @save="saveExchange"
        @test-success="onTestSuccess"
    />
</div>
</template>

<script>
import ExchangeManager from '../helpers/ExchangeManager.js'
import ExchangeSettings from './ExchangeSettings.vue'

export default {
    name: 'ExchangeManagerComponent',

    components: {
        ExchangeSettings
    },

    data() {
        return {
            manager: null,
            exchanges: [],
            defaultExchange: null,
            showAddModal: false,
            editingExchange: null
        }
    },

    mounted() {
        this.manager = new ExchangeManager()
        this.refreshExchanges()
    },

    methods: {
        refreshExchanges() {
            this.exchanges = this.manager.getAllExchanges()
            this.defaultExchange = this.manager.currentExchange
        },

        getExchangeIcon(id) {
            const icons = {
                'binance': '🟡',
                'binance-futures': '🟡',
                'bybit': '🟠',
                'okx': '⚫',
                'bitget': '🔵',
                'kucoin': '🟢'
            }
            return icons[id] || '🔶'
        },

        setDefault(id) {
            this.manager.setCurrentExchange(id)
            this.defaultExchange = id
            this.$emit('exchange-changed', id)
        },

        editExchange(id) {
            this.editingExchange = id
        },

        removeExchange(id) {
            if (confirm(`Remove ${this.manager.getExchange(id)?.name}?`)) {
                this.manager.removeExchange(id)
                this.refreshExchanges()
                this.$emit('exchange-removed', id)
            }
        },

        closeModal() {
            this.showAddModal = false
            this.editingExchange = null
        },

        saveExchange({ id, config }) {
            this.manager.addExchange(id, config)

            if (config.setDefault) {
                this.manager.setCurrentExchange(id)
            }

            this.refreshExchanges()
            this.closeModal()
            this.$emit('exchange-added', id)
        },

        onTestSuccess(id) {
            console.log(`Connection test passed for ${id}`)
        },

        exportConfig() {
            const config = this.manager.exportConfig()
            const blob = new Blob([config], { type: 'application/json' })
            const url = URL.createObjectURL(blob)

            const a = document.createElement('a')
            a.href = url
            a.download = 'tradingvue_exchanges.json'
            a.click()

            URL.revokeObjectURL(url)
        },

        triggerImport() {
            this.$refs.fileInput.click()
        },

        importConfig(event) {
            const file = event.target.files[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = (e) => {
                if (this.manager.importConfig(e.target.result)) {
                    this.refreshExchanges()
                    this.$emit('config-imported')
                    alert('Configuration imported successfully!')
                } else {
                    alert('Failed to import configuration')
                }
            }
            reader.readAsText(file)

            // Reset input
            event.target.value = ''
        },

        // Get current exchange info
        getCurrentExchange() {
            return this.manager.getCurrentExchange()
        },

        // Create data loader for current exchange
        createDataLoader() {
            return this.manager.createDataLoader()
        }
    }
}
</script>

<style scoped>
.tvjs-exchange-manager {
    background: #1e2224;
    border-radius: 8px;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #d1d4dc;
}

.manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.manager-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
}

.btn-add {
    padding: 8px 16px;
    background: #2962ff;
    border: none;
    border-radius: 4px;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
}

.btn-add:hover {
    background: #1e53e4;
}

.exchange-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.exchange-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #2a2e39;
    border-radius: 6px;
    border: 1px solid transparent;
    transition: border-color 0.15s;
}

.exchange-item.is-default {
    border-color: #2962ff;
}

.exchange-main {
    display: flex;
    align-items: center;
    gap: 12px;
}

.exchange-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1e2224;
    border-radius: 50%;
    font-size: 18px;
}

.exchange-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.exchange-name {
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}

.default-badge {
    padding: 2px 6px;
    background: #2962ff;
    border-radius: 3px;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.exchange-status {
    display: flex;
    gap: 12px;
    font-size: 11px;
}

.status-enabled {
    color: #00c853;
}

.status-disabled {
    color: #787b86;
}

.has-key {
    color: #ffd600;
}

.exchange-actions {
    display: flex;
    gap: 4px;
}

.btn-action {
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.15s;
}

.btn-action:hover {
    background: #363a45;
}

.btn-action.btn-remove:hover {
    background: rgba(255, 82, 82, 0.2);
}

.no-exchanges {
    padding: 24px;
    text-align: center;
    color: #787b86;
    font-size: 13px;
}

.manager-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #363a45;
}

.btn-secondary {
    flex: 1;
    padding: 10px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 4px;
    color: #d1d4dc;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
}

.btn-secondary:hover {
    background: #363a45;
    border-color: #4c525e;
}
</style>
