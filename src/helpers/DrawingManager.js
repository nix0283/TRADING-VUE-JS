/**
 * DrawingManager.js
 * Manages drawing tools and overlays on the chart
 * Provides undo/redo, save/load, and tool management
 */

export default class DrawingManager {
    constructor(dataCube, options = {}) {
        this.dc = dataCube
        this.tools = []
        this.undoStack = []
        this.redoStack = []
        this.currentTool = null
        this.settings = {}
        this.storageKey = options.storageKey || 'tvjs_drawings'

        // Register available tools
        this.registeredTools = new Map([
            ['BrushTool', { name: 'Brush', group: 'Drawing' }],
            ['PencilTool', { name: 'Pencil', group: 'Drawing' }],
            ['MarkerTool', { name: 'Marker', group: 'Drawing' }],
            ['HighlighterTool', { name: 'Highlighter', group: 'Drawing' }],
            ['RectangleTool', { name: 'Rectangle', group: 'Shapes' }],
            ['CircleTool', { name: 'Circle', group: 'Shapes' }],
            ['TriangleTool', { name: 'Triangle', group: 'Shapes' }],
            ['ChannelTool', { name: 'Channel', group: 'Shapes' }],
            ['TrendLineTool', { name: 'Trend Line', group: 'Lines' }],
            ['HorizontalLineTool', { name: 'Horizontal Line', group: 'Lines' }],
            ['VerticalLineTool', { name: 'Vertical Line', group: 'Lines' }],
            ['RayLineTool', { name: 'Ray', group: 'Lines' }],
            ['TextTool', { name: 'Text', group: 'Annotation' }],
            ['ArrowTool', { name: 'Arrow', group: 'Annotation' }],
        ])
    }

    /**
     * Set current tool
     */
    setTool(toolType, settings = {}) {
        this.currentTool = toolType
        this.settings = { ...settings }
    }

    /**
     * Clear current tool selection
     */
    clearTool() {
        this.currentTool = null
    }

    /**
     * Get current tool
     */
    getTool() {
        return this.currentTool
    }

    /**
     * Update tool settings
     */
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings }
    }

    /**
     * Add a drawing to the chart
     */
    addDrawing(toolType, settings) {
        if (!this.dc) return null

        const id = `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const drawing = {
            id,
            type: toolType,
            name: this.registeredTools.get(toolType)?.name || toolType,
            group: this.registeredTools.get(toolType)?.group || 'Other',
            settings: { ...settings },
            created: Date.now()
        }

        // Add to DataCube as onchart overlay
        const overlay = {
            name: toolType,
            type: toolType,
            data: [],
            settings: drawing.settings,
            props: settings
        }

        try {
            // Add to onchart array
            const onchart = this.dc.data.onchart || []
            onchart.push(overlay)
            this.dc.set('onchart', onchart)

            this.tools.push(drawing)
            this.pushUndo({ action: 'add', drawing })

            return id
        } catch (e) {
            console.error('[DrawingManager] Error adding drawing:', e)
            return null
        }
    }

    /**
     * Remove a drawing
     */
    removeDrawing(id) {
        if (!this.dc) return false

        const index = this.tools.findIndex(t => t.id === id)
        if (index === -1) return false

        const drawing = this.tools[index]

        try {
            // Remove from onchart
            const onchart = this.dc.data.onchart || []
            const overlayIndex = onchart.findIndex(o =>
                o.settings && o.settings.id === id
            )
            if (overlayIndex !== -1) {
                onchart.splice(overlayIndex, 1)
                this.dc.set('onchart', onchart)
            }

            this.tools.splice(index, 1)
            this.pushUndo({ action: 'remove', drawing })

            return true
        } catch (e) {
            console.error('[DrawingManager] Error removing drawing:', e)
            return false
        }
    }

    /**
     * Update a drawing
     */
    updateDrawing(id, updates) {
        const drawing = this.tools.find(t => t.id === id)
        if (!drawing) return false

        const oldSettings = { ...drawing.settings }
        drawing.settings = { ...drawing.settings, ...updates }

        this.pushUndo({
            action: 'update',
            drawing,
            oldSettings
        })

        return true
    }

    /**
     * Clear all drawings
     */
    clearAll() {
        if (!this.dc) return

        const removed = [...this.tools]
        this.tools = []

        // Clear onchart overlays that are drawings
        const onchart = this.dc.data.onchart || []
        const filtered = onchart.filter(o => {
            return !this.registeredTools.has(o.type)
        })
        this.dc.set('onchart', filtered)

        this.pushUndo({ action: 'clear', drawings: removed })
    }

    /**
     * Get all drawings
     */
    getDrawings() {
        return this.tools
    }

    /**
     * Get drawings by group
     */
    getDrawingsByGroup(group) {
        return this.tools.filter(t => t.group === group)
    }

    /**
     * Push to undo stack
     */
    pushUndo(action) {
        this.undoStack.push(action)
        this.redoStack = [] // Clear redo on new action
    }

    /**
     * Undo last action
     */
    undo() {
        if (this.undoStack.length === 0) return null

        const action = this.undoStack.pop()
        this.redoStack.push(action)

        switch (action.action) {
            case 'add':
                // Remove the added drawing
                this.tools = this.tools.filter(t => t.id !== action.drawing.id)
                break
            case 'remove':
                // Re-add the removed drawing
                this.tools.push(action.drawing)
                break
            case 'update':
                // Restore old settings
                const drawing = this.tools.find(t => t.id === action.drawing.id)
                if (drawing) {
                    drawing.settings = action.oldSettings
                }
                break
            case 'clear':
                // Restore all drawings
                this.tools = action.drawings
                break
        }

        return action
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (this.redoStack.length === 0) return null

        const action = this.redoStack.pop()
        this.undoStack.push(action)

        switch (action.action) {
            case 'add':
                // Re-add the drawing
                this.tools.push(action.drawing)
                break
            case 'remove':
                // Re-remove the drawing
                this.tools = this.tools.filter(t => t.id !== action.drawing.id)
                break
            case 'update':
                // Re-apply settings
                const drawing = this.tools.find(t => t.id === action.drawing.id)
                if (drawing) {
                    drawing.settings = action.drawing.settings
                }
                break
            case 'clear':
                // Clear again
                this.tools = []
                break
        }

        return action
    }

    /**
     * Can undo?
     */
    canUndo() {
        return this.undoStack.length > 0
    }

    /**
     * Can redo?
     */
    canRedo() {
        return this.redoStack.length > 0
    }

    /**
     * Save drawings to localStorage
     */
    save() {
        if (typeof localStorage === 'undefined') return false

        try {
            const data = {
                tools: this.tools,
                timestamp: Date.now()
            }
            localStorage.setItem(this.storageKey, JSON.stringify(data))
            return true
        } catch (e) {
            console.error('[DrawingManager] Error saving:', e)
            return false
        }
    }

    /**
     * Load drawings from localStorage
     */
    load() {
        if (typeof localStorage === 'undefined') return false

        try {
            const data = localStorage.getItem(this.storageKey)
            if (!data) return false

            const parsed = JSON.parse(data)
            this.tools = parsed.tools || []
            return true
        } catch (e) {
            console.error('[DrawingManager] Error loading:', e)
            return false
        }
    }

    /**
     * Export drawings as JSON
     */
    exportJSON() {
        return JSON.stringify({
            version: '1.0',
            tools: this.tools,
            timestamp: Date.now()
        }, null, 2)
    }

    /**
     * Import drawings from JSON
     */
    importJSON(json) {
        try {
            const data = JSON.parse(json)
            if (data.tools && Array.isArray(data.tools)) {
                this.tools = data.tools
                return true
            }
            return false
        } catch (e) {
            console.error('[DrawingManager] Error importing:', e)
            return false
        }
    }
}
