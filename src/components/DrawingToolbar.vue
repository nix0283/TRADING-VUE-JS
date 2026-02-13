<template>
<!--
  DrawingToolbar.vue - Drawing tools panel (TradingView style)
  Includes: brush, pencil, marker, shapes, lines, text
-->
<div class="drawing-toolbar" :class="{ 'is-vertical': vertical }">
    <!-- Tools Groups -->
    <div class="tool-group" v-for="group in toolGroups" :key="group.name">
        <div class="group-title" v-if="showGroupTitles">{{ group.title }}</div>

        <div class="tools-row">
            <button
                v-for="tool in group.tools"
                :key="tool.type"
                class="tool-btn"
                :class="{
                    'is-active': activeTool === tool.type,
                    'is-selected': selectedToolId && activeTool === tool.type
                }"
                :title="tool.hint"
                @click="selectTool(tool)"
                @contextmenu.prevent="showMods($event, tool)"
            >
                <span class="tool-icon" v-html="tool.icon"></span>
                <span class="tool-arrow" v-if="tool.mods">▼</span>
            </button>
        </div>
    </div>

    <!-- Color Picker -->
    <div class="color-section" v-if="showColorPicker">
        <div class="group-title">Color</div>
        <div class="color-grid">
            <button
                v-for="color in colors"
                :key="color"
                class="color-btn"
                :class="{ 'is-active': currentColor === color }"
                :style="{ backgroundColor: color }"
                @click="setColor(color)"
            ></button>
        </div>
        <input
            type="color"
            class="custom-color"
            :value="currentColor"
            @input="setColor($event.target.value)"
        />
    </div>

    <!-- Line Width -->
    <div class="width-section" v-if="showWidthSlider">
        <div class="group-title">Width: {{ currentWidth }}px</div>
        <input
            type="range"
            min="1"
            max="20"
            :value="currentWidth"
            @input="setWidth($event.target.value)"
        />
    </div>

    <!-- Actions -->
    <div class="actions-section">
        <button class="action-btn" @click="$emit('undo')" title="Undo">
            ↶
        </button>
        <button class="action-btn" @click="$emit('redo')" title="Redo">
            ↷
        </button>
        <button class="action-btn" @click="$emit('clear-all')" title="Clear All">
            🗑
        </button>
    </div>

    <!-- Mods Dropdown -->
    <div
        class="mods-dropdown"
        v-if="showModsDropdown"
        :style="{ top: modsPosition.y + 'px', left: modsPosition.x + 'px' }"
    >
        <button
            v-for="(mod, name) in currentMods"
            :key="name"
            class="mod-btn"
            @click="selectMod(mod)"
        >
            <span class="mod-icon" v-html="mod.icon"></span>
            {{ name }}
        </button>
    </div>
</div>
</template>

<script>
export default {
    name: 'DrawingToolbar',

    props: {
        // Active tool type
        activeTool: {
            type: String,
            default: 'cursor'
        },
        // Selected tool instance id
        selectedToolId: {
            type: String,
            default: null
        },
        // Current color
        currentColor: {
            type: String,
            default: '#2962ff'
        },
        // Current line width
        currentWidth: {
            type: Number,
            default: 2
        },
        // Layout
        vertical: {
            type: Boolean,
            default: true
        },
        showGroupTitles: {
            type: Boolean,
            default: false
        },
        showColorPicker: {
            type: Boolean,
            default: true
        },
        showWidthSlider: {
            type: Boolean,
            default: true
        },
        night: {
            type: Boolean,
            default: true
        }
    },

    data() {
        return {
            showModsDropdown: false,
            modsPosition: { x: 0, y: 0 },
            currentMods: {},
            currentToolForMods: null,

            colors: [
                '#2962ff', '#ff1744', '#00c853', '#ffea00',
                '#aa00ff', '#00b8d4', '#ff6d00', '#f50057',
                '#64dd17', '#00e5ff', '#d500f9', '#ffffff'
            ],

            toolGroups: [
                {
                    name: 'cursor',
                    title: 'Select',
                    tools: [
                        {
                            type: 'cursor',
                            icon: '⟹',
                            hint: 'Cursor (Select/Move)'
                        }
                    ]
                },
                {
                    name: 'lines',
                    title: 'Lines',
                    tools: [
                        {
                            type: 'SegmentTool',
                            icon: '╱',
                            hint: 'Trend Line',
                            mods: {
                                'Ray': {
                                    icon: '→',
                                    settings: { ray: true }
                                },
                                'Extended': {
                                    icon: '⟷',
                                    settings: { extended: true }
                                }
                            }
                        },
                        {
                            type: 'HorizontalLine',
                            icon: '─',
                            hint: 'Horizontal Line'
                        },
                        {
                            type: 'VerticalLine',
                            icon: '│',
                            hint: 'Vertical Line'
                        }
                    ]
                },
                {
                    name: 'brush',
                    title: 'Drawing',
                    tools: [
                        {
                            type: 'BrushTool',
                            icon: '✎',
                            hint: 'Brush',
                            settings: { mode: 'brush' },
                            mods: {
                                'Pencil': {
                                    icon: '✏',
                                    settings: { mode: 'pencil' }
                                },
                                'Marker': {
                                    icon: '🖊',
                                    settings: { mode: 'marker' }
                                },
                                'Highlighter': {
                                    icon: '◈',
                                    settings: { mode: 'highlighter' }
                                }
                            }
                        }
                    ]
                },
                {
                    name: 'shapes',
                    title: 'Shapes',
                    tools: [
                        {
                            type: 'RectangleTool',
                            icon: '▢',
                            hint: 'Rectangle',
                            mods: {
                                'Filled': {
                                    icon: '▮',
                                    settings: { filled: true }
                                },
                                'With Text': {
                                    icon: '▣',
                                    settings: { withText: true }
                                }
                            }
                        },
                        {
                            type: 'CircleTool',
                            icon: '○',
                            hint: 'Circle/Ellipse',
                            mods: {
                                'Filled': {
                                    icon: '●',
                                    settings: { filled: true }
                                },
                                'With Text': {
                                    icon: '◉',
                                    settings: { withText: true }
                                }
                            }
                        },
                        {
                            type: 'TriangleTool',
                            icon: '△',
                            hint: 'Triangle',
                            mods: {
                                'Filled': {
                                    icon: '▲',
                                    settings: { filled: true }
                                }
                            }
                        },
                        {
                            type: 'PolygonTool',
                            icon: '⬡',
                            hint: 'Polygon'
                        }
                    ]
                },
                {
                    name: 'text',
                    title: 'Text',
                    tools: [
                        {
                            type: 'TextTool',
                            icon: 'T',
                            hint: 'Text Label',
                            mods: {
                                'Large': {
                                    icon: 'T',
                                    settings: { fontSize: 20 }
                                },
                                'Small': {
                                    icon: 't',
                                    settings: { fontSize: 12 }
                                }
                            }
                        },
                        {
                            type: 'ArrowTool',
                            icon: '→',
                            hint: 'Arrow',
                            mods: {
                                'Double': {
                                    icon: '↔',
                                    settings: { double: true }
                                }
                            }
                        },
                        {
                            type: 'CalloutTool',
                            icon: '💬',
                            hint: 'Callout/Note'
                        }
                    ]
                },
                {
                    name: 'measure',
                    title: 'Measure',
                    tools: [
                        {
                            type: 'RangeTool',
                            icon: '▭',
                            hint: 'Price/Time Range'
                        }
                    ]
                }
            ]
        }
    },

    computed: {
        toolbarStyle() {
            return {
                backgroundColor: this.night ? '#1e2224' : '#ffffff',
                borderColor: this.night ? '#363a45' : '#e1e4e8',
                color: this.night ? '#d1d4dc' : '#131722'
            }
        }
    },

    mounted() {
        document.addEventListener('click', this.closeModsDropdown)
    },

    beforeDestroy() {
        document.removeEventListener('click', this.closeModsDropdown)
    },

    methods: {
        selectTool(tool) {
            this.$emit('tool-select', {
                type: tool.type,
                settings: tool.settings || {}
            })
        },

        showMods(e, tool) {
            if (!tool.mods) return
            e.stopPropagation()

            this.currentMods = tool.mods
            this.currentToolForMods = tool
            this.showModsDropdown = true

            // Position dropdown
            const rect = e.target.getBoundingClientRect()
            this.modsPosition = {
                x: rect.right + 5,
                y: rect.top
            }
        },

        selectMod(mod) {
            const tool = this.currentToolForMods
            this.$emit('tool-select', {
                type: tool.type,
                settings: { ...tool.settings, ...mod.settings }
            })
            this.showModsDropdown = false
        },

        closeModsDropdown(e) {
            if (!e.target.closest('.mods-dropdown') && !e.target.closest('.tool-arrow')) {
                this.showModsDropdown = false
            }
        },

        setColor(color) {
            this.$emit('color-change', color)
        },

        setWidth(width) {
            this.$emit('width-change', parseInt(width))
        }
    }
}
</script>

<style scoped>
.drawing-toolbar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    background: #1e2224;
    border: 1px solid #363a45;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
}

.drawing-toolbar.is-vertical {
    flex-direction: column;
}

.tool-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.group-title {
    color: #787b86;
    font-size: 10px;
    text-transform: uppercase;
    padding: 4px 8px;
}

.tools-row {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
}

.tool-btn {
    position: relative;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    color: #d1d4dc;
    cursor: pointer;
    transition: all 0.15s;
}

.tool-btn:hover {
    background: #2a2e39;
}

.tool-btn.is-active {
    background: #2962ff;
    color: #fff;
}

.tool-btn.is-selected {
    border-color: #ffd600;
}

.tool-icon {
    font-size: 16px;
    line-height: 1;
}

.tool-arrow {
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-size: 8px;
    color: #787b86;
}

.color-section {
    padding-top: 8px;
    border-top: 1px solid #363a45;
}

.color-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 2px;
    padding: 4px;
}

.color-btn {
    width: 20px;
    height: 20px;
    border: 2px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.15s;
}

.color-btn:hover {
    transform: scale(1.1);
}

.color-btn.is-active {
    border-color: #fff;
}

.custom-color {
    width: 100%;
    height: 24px;
    margin-top: 4px;
    border: 1px solid #363a45;
    border-radius: 4px;
    cursor: pointer;
}

.width-section {
    padding-top: 8px;
    border-top: 1px solid #363a45;
}

.width-section input[type="range"] {
    width: 100%;
    accent-color: #2962ff;
}

.actions-section {
    display: flex;
    gap: 4px;
    padding-top: 8px;
    border-top: 1px solid #363a45;
}

.action-btn {
    flex: 1;
    height: 28px;
    background: #2a2e39;
    border: 1px solid #363a45;
    border-radius: 4px;
    color: #d1d4dc;
    cursor: pointer;
    transition: all 0.15s;
}

.action-btn:hover {
    background: #363a45;
}

.mods-dropdown {
    position: fixed;
    background: #1e2224;
    border: 1px solid #363a45;
    border-radius: 6px;
    padding: 4px;
    min-width: 120px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
}

.mod-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #d1d4dc;
    cursor: pointer;
    text-align: left;
}

.mod-btn:hover {
    background: #2a2e39;
}

.mod-icon {
    font-size: 14px;
}
</style>
