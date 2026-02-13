<script>
// TrendLineTool.vue - Trend line drawing tool
// Draws diagonal lines between two points

import Overlay from '../../mixins/overlay.js'
import Tool from '../../mixins/tool.js'
import Pin from '../primitives/pin.js'
import Seg from '../primitives/seg.js'

export default {
    name: 'TrendLineTool',
    mixins: [Overlay, Tool],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },
        tool() {
            return {
                group: 'Lines',
                icon: '📈',
                type: 'Trend Line',
                hint: 'Trend line between two points',
                data: [],
                settings: {
                    color: '#2962ff',
                    lineWidth: 1.5,
                    lineStyle: 'solid',
                    showAngle: false
                }
            }
        },
        init() {
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

            ctx.lineWidth = this.line_width
            ctx.strokeStyle = this.color

            if (this.sett.lineStyle === 'dashed') {
                ctx.setLineDash([8, 4])
            } else if (this.sett.lineStyle === 'dotted') {
                ctx.setLineDash([3, 3])
            } else {
                ctx.setLineDash([])
            }

            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
            ctx.setLineDash([])

            // Draw end points
            ctx.fillStyle = this.color
            ctx.beginPath()
            ctx.arc(x1, y1, 4, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(x2, y2, 4, 0, Math.PI * 2)
            ctx.fill()

            // Show angle
            if (this.sett.showAngle) {
                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
                const midX = (x1 + x2) / 2
                const midY = (y1 + y2) / 2

                ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif'
                ctx.fillStyle = this.color
                ctx.textAlign = 'center'
                ctx.fillText(`${angle.toFixed(1)}°`, midX, midY - 10)
            }

            this.render_pins(ctx)
        },
        use_for() { return ['TrendLineTool'] },
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
