<script>
// BollingerBands.vue - Bollinger Bands indicator overlay
// Shows upper band, middle band (SMA), and lower band with fill

import Overlay from '../../mixins/overlay.js'

export default {
    name: 'BollingerBands',
    mixins: [Overlay],
    methods: {
        meta_info() {
            return { author: 'TradingVue', version: '1.0.0' }
        },
        draw(ctx) {
            const data = this.$props.data
            if (!data || data.length === 0) return

            const layout = this.$props.layout
            const upper = []
            const middle = []
            const lower = []

            // Extract band data
            for (const point of data) {
                if (point && point.length >= 4) {
                    const x = layout.t2screen(point[0])
                    upper.push({ x, y: layout.$2screen(point[1]) })
                    middle.push({ x, y: layout.$2screen(point[2]) })
                    lower.push({ x, y: layout.$2screen(point[3]) })
                }
            }

            if (upper.length === 0) return

            // Fill between bands
            ctx.fillStyle = this.fill_color
            ctx.beginPath()
            ctx.moveTo(upper[0].x, upper[0].y)
            for (let i = 1; i < upper.length; i++) {
                ctx.lineTo(upper[i].x, upper[i].y)
            }
            // Go back along lower band
            for (let i = lower.length - 1; i >= 0; i--) {
                ctx.lineTo(lower[i].x, lower[i].y)
            }
            ctx.closePath()
            ctx.fill()

            // Draw upper band
            ctx.strokeStyle = this.upper_color
            ctx.lineWidth = this.line_width
            ctx.beginPath()
            ctx.moveTo(upper[0].x, upper[0].y)
            for (let i = 1; i < upper.length; i++) {
                ctx.lineTo(upper[i].x, upper[i].y)
            }
            ctx.stroke()

            // Draw middle band (SMA)
            ctx.strokeStyle = this.middle_color
            ctx.lineWidth = this.line_width
            ctx.beginPath()
            ctx.moveTo(middle[0].x, middle[0].y)
            for (let i = 1; i < middle.length; i++) {
                ctx.lineTo(middle[i].x, middle[i].y)
            }
            ctx.stroke()

            // Draw lower band
            ctx.strokeStyle = this.lower_color
            ctx.lineWidth = this.line_width
            ctx.beginPath()
            ctx.moveTo(lower[0].x, lower[0].y)
            for (let i = 1; i < lower.length; i++) {
                ctx.lineTo(lower[i].x, lower[i].y)
            }
            ctx.stroke()
        },
        use_for() { return ['BollingerBands', 'BB', 'BOLL'] },
        data_colors() { return [this.upper_color, this.middle_color, this.lower_color] }
    },
    computed: {
        sett() {
            return this.$props.settings || {}
        },
        line_width() {
            return this.sett.lineWidth || 1
        },
        upper_color() {
            return this.sett.upperColor || '#2962ff'
        },
        middle_color() {
            return this.sett.middleColor || '#2962ff'
        },
        lower_color() {
            return this.sett.lowerColor || '#2962ff'
        },
        fill_color() {
            return this.sett.fillColor || 'rgba(41, 98, 255, 0.1)'
        }
    },
    data() {
        return {}
    }
}
</script>
