<script>
// VerticalLine - Vertical line tool

import Overlay from '../../mixins/overlay.js'
import Tool from '../../mixins/tool.js'
import Pin from '../primitives/pin.js'

export default {
    name: 'VerticalLine',
    mixins: [Overlay, Tool],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },

        tool() {
            return {
                group: 'Lines',
                icon: '│',
                type: 'VerticalLine',
                hint: 'Vertical Line',
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
            const x = layout.t2screen(this.p1[0])

            ctx.lineWidth = this.line_width
            ctx.strokeStyle = this.color
            ctx.setLineDash(this.dashed ? [5, 5] : [])

            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, layout.height)
            ctx.stroke()

            ctx.setLineDash([])

            // Draw time label
            const time = this.formatTime(this.p1[0])
            ctx.fillStyle = this.color
            ctx.font = '10px ' + this.$props.font.split('px').pop()

            ctx.save()
            ctx.translate(x, layout.height - 5)
            ctx.rotate(-Math.PI / 4)
            ctx.fillText(time, 0, 0)
            ctx.restore()

            this.render_pins(ctx)
        },

        formatTime(t) {
            const date = new Date(t)
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },

        use_for() { return ['VerticalLine'] },
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
        }
    }
}
</script>
