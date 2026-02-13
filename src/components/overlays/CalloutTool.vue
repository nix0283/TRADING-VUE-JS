<script>
// CalloutTool - Callout/Note tool with speech bubble

import Overlay from '../../mixins/overlay.js'
import Tool from '../../mixins/tool.js'
import Pin from '../primitives/pin.js'

export default {
    name: 'CalloutTool',
    mixins: [Overlay, Tool],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },

        tool() {
            return {
                group: 'Text',
                icon: '💬',
                type: 'CalloutTool',
                hint: 'Callout/Note',
                data: [],
                settings: { text: 'Note' }
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
                // Prompt for text
                const text = prompt('Enter note:', this.text || 'Note')
                if (text) {
                    this.$emit('change-settings', { text })
                }
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

            // Calculate bubble position
            const bubbleX = x2
            const bubbleY = y2
            const bubbleWidth = Math.max(80, this.text_width + 20)
            const bubbleHeight = 40

            // Draw connecting line
            ctx.lineWidth = 1
            ctx.strokeStyle = this.color
            ctx.setLineDash([3, 3])
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(bubbleX, bubbleY)
            ctx.stroke()
            ctx.setLineDash([])

            // Draw bubble
            ctx.fillStyle = this.bg_color
            ctx.strokeStyle = this.color

            const bx = bubbleX - bubbleWidth / 2
            const by = bubbleY - bubbleHeight / 2
            const radius = 8

            ctx.beginPath()
            ctx.moveTo(bx + radius, by)
            ctx.lineTo(bx + bubbleWidth - radius, by)
            ctx.quadraticCurveTo(bx + bubbleWidth, by, bx + bubbleWidth, by + radius)
            ctx.lineTo(bx + bubbleWidth, by + bubbleHeight - radius)
            ctx.quadraticCurveTo(bx + bubbleWidth, by + bubbleHeight, bx + bubbleWidth - radius, by + bubbleHeight)
            ctx.lineTo(bx + radius, by + bubbleHeight)
            ctx.quadraticCurveTo(bx, by + bubbleHeight, bx, by + bubbleHeight - radius)
            ctx.lineTo(bx, by + radius)
            ctx.quadraticCurveTo(bx, by, bx + radius, by)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            // Draw text
            ctx.fillStyle = this.color
            ctx.font = `${this.font_size}px ${this.$props.font.split('px').pop()}`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(this.text, bubbleX, bubbleY)

            this.render_pins(ctx)
        },

        use_for() { return ['CalloutTool'] },
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
        color() {
            return this.sett.color || '#ffd600'
        },
        text() {
            return this.sett.text || 'Note'
        },
        font_size() {
            return this.sett.fontSize || 12
        },
        bg_color() {
            return this.sett.bgColor || '#1e2224'
        },
        text_width() {
            // Estimate text width
            return this.text.length * this.font_size * 0.6
        }
    }
}
</script>
