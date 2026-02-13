<script>
// ArrowTool - Arrow drawing tool

import Overlay from '../../mixins/overlay.js'
import Tool from '../../mixins/tool.js'
import Pin from '../primitives/pin.js'

export default {
    name: 'ArrowTool',
    mixins: [Overlay, Tool],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },

        tool() {
            return {
                group: 'Text',
                icon: '→',
                type: 'ArrowTool',
                hint: 'Arrow',
                data: [],
                settings: {},
                mods: {
                    'Double': {
                        icon: '↔',
                        settings: { double: true }
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

            const angle = Math.atan2(y2 - y1, x2 - x1)
            const headLen = this.head_length

            ctx.lineWidth = this.line_width
            ctx.strokeStyle = this.color
            ctx.lineCap = 'round'

            // Draw line
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()

            // Draw arrowhead at end
            ctx.beginPath()
            ctx.moveTo(x2, y2)
            ctx.lineTo(
                x2 - headLen * Math.cos(angle - Math.PI / 6),
                y2 - headLen * Math.sin(angle - Math.PI / 6)
            )
            ctx.moveTo(x2, y2)
            ctx.lineTo(
                x2 - headLen * Math.cos(angle + Math.PI / 6),
                y2 - headLen * Math.sin(angle + Math.PI / 6)
            )
            ctx.stroke()

            // Draw arrowhead at start if double
            if (this.double) {
                ctx.beginPath()
                ctx.moveTo(x1, y1)
                ctx.lineTo(
                    x1 + headLen * Math.cos(angle - Math.PI / 6),
                    y1 + headLen * Math.sin(angle - Math.PI / 6)
                )
                ctx.moveTo(x1, y1)
                ctx.lineTo(
                    x1 + headLen * Math.cos(angle + Math.PI / 6),
                    y1 + headLen * Math.sin(angle + Math.PI / 6)
                )
                ctx.stroke()
            }

            this.render_pins(ctx)
        },

        use_for() { return ['ArrowTool'] },
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
            return this.sett.lineWidth || 2
        },
        color() {
            return this.sett.color || '#2962ff'
        },
        head_length() {
            return this.sett.headLength || 15
        },
        double() {
            return this.sett.double || false
        }
    }
}
</script>
