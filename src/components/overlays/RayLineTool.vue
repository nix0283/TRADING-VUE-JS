<script>
// RayLineTool.vue - Ray line drawing tool
// Draws a line from a point extending infinitely in one direction

import Overlay from '../../mixins/overlay.js'
import Tool from '../../mixins/tool.js'
import Pin from '../primitives/pin.js'

export default {
    name: 'RayLineTool',
    mixins: [Overlay, Tool],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },
        tool() {
            return {
                group: 'Lines',
                icon: '→',
                type: 'Ray',
                hint: 'Ray line extending to the right',
                data: [],
                settings: {
                    color: '#2962ff',
                    lineWidth: 1.5,
                    lineStyle: 'solid'
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

            // Calculate ray direction
            const dx = x2 - x1
            const dy = y2 - y1

            // Extend to screen edges
            const len = Math.sqrt(dx * dx + dy * dy)
            const ux = dx / len
            const uy = dy / len

            // Extend to right edge
            let endX = layout.width
            let endY = y1 + (endX - x1) * uy / ux

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
            ctx.lineTo(endX, endY)
            ctx.stroke()
            ctx.setLineDash([])

            // Arrow head
            const arrowSize = 8
            const angle = Math.atan2(endY - y1, endX - x1)

            ctx.fillStyle = this.color
            ctx.beginPath()
            ctx.moveTo(endX, endY)
            ctx.lineTo(
                endX - arrowSize * Math.cos(angle - Math.PI / 6),
                endY - arrowSize * Math.sin(angle - Math.PI / 6)
            )
            ctx.lineTo(
                endX - arrowSize * Math.cos(angle + Math.PI / 6),
                endY - arrowSize * Math.sin(angle + Math.PI / 6)
            )
            ctx.closePath()
            ctx.fill()

            this.render_pins(ctx)
        },
        use_for() { return ['RayLineTool'] },
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
