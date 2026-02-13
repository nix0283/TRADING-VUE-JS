<template>
<!--
  ExchangeSettings.vue - Modal dialog for exchange configuration
-->
<div class="tvjs-modal-overlay" v-if="visible" @click.self="close">
    <div class="tvjs-modal tvjs-exchange-modal">
        <div class="modal-header">
            <h3>{{ editMode ? 'Edit Exchange' : 'Add Exchange' }}</h3>
            <button class="btn-close" @click="close">×</button>
        </div>

        <div class="modal-body">
            <!-- Exchange Selection -->
            <div class="form-group" v-if="!editMode">
                <label>Select Exchange</label>
                <select v-model="selectedExchange">
                    <option value="" disabled>-- Choose Exchange --</option>
                    <option
                        v-for="ex in availableExchanges"
                        :key="ex.id"
                        :value="ex.id"
                        :disabled="configuredIds.includes(ex.id)"
                    >
                        {{ ex.name }}
                        {{ configuredIds.includes(ex.id) ? '(configured)' : '' }}
                    </option>
                </select>
            </div>

            <!-- Exchange Info -->
            <div class="exchange-info" v-if="exchangeConfig">
                <div class="info-badge">
                    <span class="badge-type">{{ exchangeConfig.type }}</span>
                </div>
                <div class="supported-tfs">
                    <span class="label">Supported TFs:</span>
                    {{ supportedTimeframes }}...
                </div>
            </div>

            <!-- API Credentials -->
            <div class="form-section" v-if="selectedExchange || editMode">
                <h4>API Credentials</h4>

                <div class="form-group">
                    <label>API Key</label>
                    <input
                        type="text"
                        v-model="formData.apiKey"
                        placeholder="Enter your API key"
                    />
                    <span class="hint">Optional for public data</span>
                </div>

                <div class="form-group">
                    <label>API Secret</label>
                    <div class="secret-input">
                        <input
                            :type="showSecret ? 'text' : 'password'"
                            v-model="formData.apiSecret"
                            placeholder="Enter your API secret"
                        />
                        <button class="btn-toggle" @click="showSecret = !showSecret">
                            {{ showSecret ? '🙈' : '👁' }}
                        </button>
                    </div>
                </div>

                <!-- Passphrase for OKX -->
                <div class="form-group" v-if="needsPassphrase">
                    <label>Passphrase</label>
                    <input
                        type="password"
                        v-model="formData.passphrase"
                        placeholder="Enter passphrase"
                    />
                </div>
            </div>

            <!-- Options -->
            <div class="form-section" v-if="selectedExchange || editMode">
                <h4>Options</h4>

                <div class="form-group checkbox-group">
                    <label>
                        <input type="checkbox" v-model="formData.enabled" />
                        Enable this exchange
                    </label>
                </div>

                <div class="form-group checkbox-group">
                    <label>
                        <input type="checkbox" v-model="formData.setDefault" />
                        Set as default exchange
                    </label>
                </div>
            </div>

            <!-- Security Notice -->
            <div class="security-notice">
                <span class="notice-icon">🔒</span>
                <div class="notice-text">
                    <strong>Security Notice:</strong>
                    API keys are stored locally and never sent to third parties.
                    For trading, use API keys with restricted permissions.
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <button class="btn btn-secondary" @click="testConnection" :disabled="testing">
                {{ testing ? 'Testing...' : 'Test Connection' }}
            </button>
            <button class="btn btn-secondary" @click="close">Cancel</button>
            <button class="btn btn-primary" @click="save" :disabled="!canSave">
                {{ editMode ? 'Update' : 'Add Exchange' }}
            </button>
        </div>
    </div>
</div>
</template>

<script>
import ExchangeManager, { EXCHANGE_CONFIGS } from '../helpers/ExchangeManager.js'

export default {
    name: 'ExchangeSettings',

    props: {
        visible: {
            type: Boolean,
            default: false
        },
        editExchangeId: {
            type: String,
            default: null
        },
        configuredExchanges: {
            type: Array,
            default: () => []
        }
    },

    data() {
        return {
            selectedExchange: '',
            formData: {
                apiKey: '',
                apiSecret: '',
                passphrase: '',
                enabled: true,
                setDefault: false
            },
            showSecret: false,
            testing: false
        }
    },

    computed: {
        editMode() {
            return !!this.editExchangeId
        },

        availableExchanges() {
            return Object.entries(EXCHANGE_CONFIGS).map(([id, config]) => ({
                id,
                name: config.name,
                type: config.type,
                requiresAuth: config.requiresAuth
            }))
        },

        configuredIds() {
            return this.configuredExchanges.map(ex => ex.id)
        },

        exchangeConfig() {
            const id = this.editMode ? this.editExchangeId : this.selectedExchange
            return EXCHANGE_CONFIGS[id] || null
        },

        needsPassphrase() {
            return this.selectedExchange === 'okx' || this.editExchangeId === 'okx'
        },

        canSave() {
            return this.editMode || this.selectedExchange
        },

        supportedTimeframes() {
            if (!this.exchangeConfig || !this.exchangeConfig.supportsTimeframes) {
                return ''
            }
            return this.exchangeConfig.supportsTimeframes.slice(0, 6).join(', ')
        }
    },

    watch: {
        visible(val) {
            if (val && this.editMode) {
                this.loadExchangeData()
            }
        },

        editExchangeId() {
            if (this.editMode) {
                this.loadExchangeData()
            }
        }
    },

    methods: {
        loadExchangeData() {
            const exchange = this.configuredExchanges.find(ex => ex.id === this.editExchangeId)
            if (exchange) {
                this.formData = {
                    apiKey: exchange.apiKey || '',
                    apiSecret: exchange.apiSecret || '',
                    passphrase: exchange.passphrase || '',
                    enabled: exchange.enabled !== false,
                    setDefault: false
                }
            }
        },

        async testConnection() {
            this.testing = true

            try {
                const id = this.editMode ? this.editExchangeId : this.selectedExchange
                const manager = new ExchangeManager()

                // Temporarily add exchange
                manager.addExchange(id, {
                    ...this.formData,
                    enabled: true
                })

                // Try to fetch data
                await manager.fetchKlines(id, 'BTC/USDT', '1h', 1)

                this.$emit('test-success', id)
                alert('✅ Connection successful!')
            } catch (error) {
                console.error('Connection test failed:', error)
                alert(`❌ Connection failed: ${error.message}`)
            } finally {
                this.testing = false
            }
        },

        save() {
            const id = this.editMode ? this.editExchangeId : this.selectedExchange

            this.$emit('save', {
                id,
                config: { ...this.formData }
            })

            this.reset()
            this.close()
        },

        close() {
            this.$emit('close')
        },

        reset() {
            this.selectedExchange = ''
            this.formData = {
                apiKey: '',
                apiSecret: '',
                passphrase: '',
                enabled: true,
                setDefault: false
            }
            this.showSecret = false
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
    min-width: 400px;
    max-width: 500px;
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
    padding: 20px;
}

.form-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #363a45;
}

.form-section h4 {
    margin: 0 0 16px 0;
    font-size: 12px;
    font-weight: 600;
    color: #787b86;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: #d1d4dc;
}

.form-group input[type="text"],
.form-group input[type="password"],
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

.form-group select option {
    background: #1e2224;
}

.hint {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #787b86;
}

.secret-input {
    display: flex;
    gap: 8px;
}

.secret-input input {
    flex: 1;
}

.btn-toggle {
    padding: 8px 12px;
    background: #363a45;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.checkbox-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.exchange-info {
    padding: 12px;
    background: #2a2e39;
    border-radius: 6px;
    margin-bottom: 16px;
}

.info-badge {
    margin-bottom: 8px;
}

.badge-type {
    padding: 4px 8px;
    background: #2962ff;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
}

.supported-tfs {
    font-size: 12px;
    color: #787b86;
}

.supported-tfs .label {
    color: #d1d4dc;
}

.security-notice {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 152, 0, 0.1);
    border: 1px solid rgba(255, 152, 0, 0.3);
    border-radius: 6px;
    margin-top: 20px;
}

.notice-icon {
    font-size: 20px;
}

.notice-text {
    font-size: 12px;
    color: #ffcc80;
}

.notice-text strong {
    color: #fff;
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

.btn-secondary:hover:not(:disabled) {
    background: #4c525e;
}
</style>
