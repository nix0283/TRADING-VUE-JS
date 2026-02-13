<script>
// TextTool.vue - Text annotation tool
// Places text labels on the chart

import Overlay from '../../mixins/overlay.js'
import Tool from '../../mixins/tool.js'
import Pin from '../primitives/pin.js'

export default {
    name: 'TextTool',
    mixins: [Overlay, Tool],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },
        tool() {
            return {
                group: 'Annotation',
                icon: 'T',
                type: 'Text',
                hint: 'Text annotation',
                data: [],
                settings: {
                    color: '#ffffff',
                    fontSize: 14,
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    text: 'Text',
                    backgroundColor: 'transparent',
                    bold: false
                }
            }
        },
        init() {
            this.pins.push(new Pin(this, 'p1', {
                state: 'tracking'
            }))

            this.pins[0].on('settled', () => {
                // Prompt for text
                const text = prompt('Enter text:', this.sett.text || 'Text')
                if (text) {
                    this.sett.text = text
                }
                this.set_state('finished')
                this.$emit('drawing-mode-off')
            })
        },
        draw(ctx) {
            if (!this.p1) return

            const layout = this.$props.layout
            const x = layout.t2screen(this.p1[0])
            const y = layout.$2screen(this.p1[1])

            const text = this.sett.text || 'Text'
            const fontSize = this.sett.fontSize || 14
            const fontWeight = this.sett.bold ? 'bold' : 'normal'

            ctx.font = `${fontWeight} ${fontSize}px ${this.sett.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif'}`
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'

            const metrics = ctx.measureText(text)
            const textWidth = metrics.width
            const textHeight = fontSize

            // Background
            if (this.sett.backgroundColor && this.sett.backgroundColor !== 'transparent') {
                ctx.fillStyle = this.sett.backgroundColor
                ctx.fillRect(x - 4, y - textHeight / 2 - 2, textWidth + 8, textHeight + 4)
            }

            // Text
            ctx.fillStyle = this.color
            ctx.fillText(text, x, y)

            // Collision area
            this.collisions.push((x, y) => {
                return x >= x && x <= x + textWidth &&
                       y >= y - textHeight / 2 && y <= y + textHeight / 2
            })

            this.render_pins(ctx)
        },
        use_for() { return ['TextTool'] },
        data_colors() { return [this.color] }
    },
    computed: {
        sett() {
            return this.$props.settings
        },
        p1() {
            return this.$props.settings.p1
        },
        color() {
            return this.sett.color || '#ffffff'
        }
    },
    data() {
        return {}
    }
}
</script>
