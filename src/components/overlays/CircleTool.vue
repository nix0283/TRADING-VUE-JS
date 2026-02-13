<script>
// CircleTool - Circle/Ellipse shape tool

import Overlay from '../../mixins/overlay.js'
import Tool from '../../mixins/tool.js'
import Pin from '../primitives/pin.js'

export default {
    name: 'CircleTool',
    mixins: [Overlay, Tool],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },

        tool() {
            return {
                group: 'Shapes',
                icon: '○',
                type: 'CircleTool',
                hint: 'Circle/Ellipse',
                data: [],
                settings: {},
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

            // Center and radius
            const cx = (x1 + x2) / 2
            const cy = (y1 + y2) / 2
            const rx = Math.abs(x2 - x1) / 2
            const ry = Math.abs(y2 - y1) / 2

            ctx.lineWidth = this.line_width
            ctx.strokeStyle = this.color

            ctx.beginPath()
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)

            // Fill or stroke
            if (this.filled) {
                ctx.fillStyle = this.fill_color
                ctx.fill()
            }

            ctx.stroke()

            // Draw text if enabled
            if (this.withText && this.text) {
                ctx.fillStyle = this.color
                ctx.font = `${this.font_size}px ${this.$props.font.split('px').pop()}`
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(this.text, cx, cy)
            }

            this.render_pins(ctx)
        },

        use_for() { return ['CircleTool'] },
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
        },
        withText() {
            return this.sett.withText || false
        },
        text() {
            return this.sett.text || ''
        },
        font_size() {
            return this.sett.fontSize || 14
        }
    }
}
</script>
