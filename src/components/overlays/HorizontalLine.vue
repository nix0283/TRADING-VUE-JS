<script>
// HorizontalLine - Horizontal line tool

import Overlay from '../../mixins/overlay.js'
import Tool from '../../mixins/tool.js'
import Pin from '../primitives/pin.js'

export default {
    name: 'HorizontalLine',
    mixins: [Overlay, Tool],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },

        tool() {
            return {
                group: 'Lines',
                icon: '─',
                type: 'HorizontalLine',
                hint: 'Horizontal Line',
                data: [],
                settings: {}
            }
        },

        init() {
            this.pins.push(new Pin(this, 'p1', {
                state: 'tracking'
            }))

            this.pins[0].on('settled', () => {
                this.set_state('finished')
                this.$emit('drawing-mode-off')
            })
        },

        draw(ctx) {
            if (!this.p1) return

            const layout = this.$props.layout
            const y = layout.$2screen(this.p1[1])

            ctx.lineWidth = this.line_width
            ctx.strokeStyle = this.color
            ctx.setLineDash(this.dashed ? [5, 5] : [])

            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(layout.width, y)
            ctx.stroke()

            ctx.setLineDash([])

            // Draw price label
            const price = this.p1[1].toFixed(this.prec)
            ctx.fillStyle = this.color
            ctx.font = '11px ' + this.$props.font.split('px').pop()

            const textWidth = ctx.measureText(price).width + 10
            ctx.fillRect(layout.width - textWidth, y - 10, textWidth, 20)

            ctx.fillStyle = '#fff'
            ctx.textAlign = 'right'
            ctx.fillText(price, layout.width - 5, y + 4)

            this.render_pins(ctx)
        },

        use_for() { return ['HorizontalLine'] },
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
            return this.sett.lineWidth || 1.5
        },
        color() {
            return this.sett.color || '#2962ff'
        },
        dashed() {
            return this.sett.dashed || false
        },
        prec() {
            return this.sett.precision || 2
        }
    }
}
</script>
