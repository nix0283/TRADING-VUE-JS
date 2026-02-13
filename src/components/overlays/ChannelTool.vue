<script>
// ChannelTool.vue - Price channel drawing tool
// Draws parallel lines forming a channel

import Overlay from '../../mixins/overlay.js'
import Tool from '../../mixins/tool.js'
import Pin from '../primitives/pin.js'

export default {
    name: 'ChannelTool',
    mixins: [Overlay, Tool],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },
        tool() {
            return {
                group: 'Shapes',
                icon: '║',
                type: 'Channel',
                hint: 'Price channel',
                data: [],
                settings: {
                    color: '#2962ff',
                    lineWidth: 1.5,
                    fill: true,
                    fillColor: '#2962ff10',
                    lineStyle: 'solid'
                }
            }
        },
        init() {
            // First line points
            this.pins.push(new Pin(this, 'p1'))
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

            // Calculate channel width (vertical distance from line)
            const channelWidth = this.sett.channelWidth || Math.abs(y2 - y1) * 0.3

            ctx.lineWidth = this.line_width
            ctx.strokeStyle = this.color

            if (this.sett.lineStyle === 'dashed') {
                ctx.setLineDash([8, 4])
            } else if (this.sett.lineStyle === 'dotted') {
                ctx.setLineDash([3, 3])
            } else {
                ctx.setLineDash([])
            }

            // Fill area between lines
            if (this.sett.fill) {
                ctx.fillStyle = this.sett.fillColor || '#2962ff10'
                ctx.beginPath()
                ctx.moveTo(x1, y1 - channelWidth)
                ctx.lineTo(x2, y2 - channelWidth)
                ctx.lineTo(x2, y2 + channelWidth)
                ctx.lineTo(x1, y1 + channelWidth)
                ctx.closePath()
                ctx.fill()
            }

            // Upper line
            ctx.beginPath()
            ctx.moveTo(x1, y1 - channelWidth)
            ctx.lineTo(x2, y2 - channelWidth)
            ctx.stroke()

            // Lower line
            ctx.beginPath()
            ctx.moveTo(x1, y1 + channelWidth)
            ctx.lineTo(x2, y2 + channelWidth)
            ctx.stroke()

            ctx.setLineDash([])

            // Center line (dashed)
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
            ctx.setLineDash([])

            this.render_pins(ctx)
        },
        use_for() { return ['ChannelTool'] },
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
        }
    },
    data() {
        return {}
    }
}
</script>
