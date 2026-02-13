<script>
// BrushTool.vue - Freehand drawing brush tool
// Allows drawing freeform paths on the chart

import Overlay from '../../mixins/overlay.js'
import Tool from '../../mixins/tool.js'
import Pin from '../primitives/pin.js'

export default {
    name: 'BrushTool',
    mixins: [Overlay, Tool],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },
        tool() {
            return {
                group: 'Drawing',
                icon: '🖌',
                type: 'Brush',
                hint: 'Freehand brush drawing',
                data: [],
                settings: {
                    color: '#2962ff',
                    lineWidth: 3,
                    lineStyle: 'solid'
                }
            }
        },
        init() {
            // Create initial pin at mouse position
            this.pins.push(new Pin(this, 'p1', {
                state: 'tracking'
            }))

            // Initialize points array if not exists
            if (!this.sett.points) {
                this.sett.points = []
            }

            // Track mouse movement for drawing
            this.mouse.on('mousemove', (e) => {
                if (this.state === 'tracking' || this.state === 'drawing') {
                    this.addPoint()
                }
            })

            // Settle on click
            this.pins[0].on('settled', () => {
                this.set_state('finished')
                this.$emit('drawing-mode-off')
            })
        },
        addPoint() {
            const cursor = this.$props.cursor
            if (cursor && cursor.t !== undefined && cursor.y$ !== undefined) {
                if (!this.sett.points) this.sett.points = []

                // Only add point if it's different from last
                const lastPoint = this.sett.points[this.sett.points.length - 1]
                const newPoint = [cursor.t, cursor.y$]

                if (!lastPoint ||
                    Math.abs(lastPoint[0] - newPoint[0]) > 0.001 ||
                    Math.abs(lastPoint[1] - newPoint[1]) > 0.0001) {
                    this.sett.points.push(newPoint)
                    this.pins[0].re_init()
                }
            }
        },
        draw(ctx) {
            const points = this.sett.points || []
            if (points.length < 2) return

            ctx.lineWidth = this.line_width
            ctx.strokeStyle = this.color
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'

            // Set line style
            if (this.sett.lineStyle === 'dashed') {
                ctx.setLineDash([10, 5])
            } else if (this.sett.lineStyle === 'dotted') {
                ctx.setLineDash([3, 3])
            } else {
                ctx.setLineDash([])
            }

            ctx.beginPath()

            // Draw smooth path through all points
            const layout = this.$props.layout
            let firstPoint = true

            for (const point of points) {
                const x = layout.t2screen(point[0])
                const y = layout.$2screen(point[1])

                if (firstPoint) {
                    ctx.moveTo(x, y)
                    firstPoint = false
                } else {
                    ctx.lineTo(x, y)
                }
            }

            ctx.stroke()
            ctx.setLineDash([])

            this.render_pins(ctx)
        },
        use_for() { return ['BrushTool'] },
        data_colors() { return [this.color] }
    },
    computed: {
        sett() {
            return this.$props.settings
        },
        p1() {
            return this.$props.settings.p1
        },
        line_width() {
            return this.sett.lineWidth || 3
        },
        color() {
            return this.sett.color || '#2962ff'
        }
    },
    data() {
        return {}
    }
}
</script>
