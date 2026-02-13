<script>
// TriangleTool - Triangle shape tool

import Overlay from '../../mixins/overlay.js'
import Tool from '../../mixins/tool.js'
import Pin from '../primitives/pin.js'

export default {
    name: 'TriangleTool',
    mixins: [Overlay, Tool],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },

        tool() {
            return {
                group: 'Shapes',
                icon: '△',
                type: 'TriangleTool',
                hint: 'Triangle',
                data: [],
                settings: {},
                mods: {
                    'Filled': {
                        icon: '▲',
                        settings: { filled: true }
                    }
                }
            }
        },

        init() {
            this.pins.push(new Pin(this, 'p1', {
                state: 'settled'
            }))
            this.pins.push(new Pin(this, 'p2', {
                state: 'tracking'
            }))

            this.pins[1].on('settled', () => {
                this.set_state('finished')
                this.$emit('drawing-mode-off')
            })
        },

        draw(ctx) {
            if (!this.p1 || !this.p2) return

            const layout = this.$props.layout
            const x1 = layout.t2screen(this.p1[0])
            const y1 = layout.$2screen(this.p1[1])
            const x2 = layout.t2screen(this.p2[0])
            const y2 = layout.$2screen(this.p2[1])

            // Calculate triangle vertices
            const midX = (x1 + x2) / 2
            const minY = Math.min(y1, y2)
            const maxY = Math.max(y1, y2)

            // Top, bottom-left, bottom-right
            const points = [
                [midX, minY],
                [x1, maxY],
                [x2, maxY]
            ]

            ctx.lineWidth = this.line_width
            ctx.strokeStyle = this.color

            ctx.beginPath()
            ctx.moveTo(points[0][0], points[0][1])
            ctx.lineTo(points[1][0], points[1][1])
            ctx.lineTo(points[2][0], points[2][1])
            ctx.closePath()

            if (this.filled) {
                ctx.fillStyle = this.fill_color
                ctx.fill()
            }

            ctx.stroke()

            this.render_pins(ctx)
        },

        use_for() { return ['TriangleTool'] },
        data_colors() { return [this.color] }
    },

    computed: {
        sett() {
            return this.$props.settings
        },
        p1() {
            return this.$props.settings.p1
        },
        p2() {
            return this.$props.settings.p2
        },
        line_width() {
            return this.sett.lineWidth || 1.5
        },
        color() {
            return this.sett.color || '#2962ff'
        },
        filled() {
            return this.sett.filled || false
        },
        fill_color() {
            return this.sett.fillColor || this.color + '33'
        }
    }
}
</script>
