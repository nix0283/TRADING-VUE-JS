
const SECOND = 1000
const MINUTE = SECOND * 60
const MINUTE3 = MINUTE * 3
const MINUTE5 = MINUTE * 5
const MINUTE15 = MINUTE * 15
const MINUTE30 = MINUTE * 30
const HOUR = MINUTE * 60
const HOUR4 = HOUR * 4
const HOUR12 = HOUR * 12
const DAY = HOUR * 24
const WEEK = DAY * 7
const MONTH = WEEK * 4
const YEAR = DAY * 365

const MONTHMAP = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun","Jul", "Aug",
    "Sep", "Oct","Nov", "Dec"
]

// Grid time steps
const TIMESCALES = [
    YEAR * 10, YEAR * 5, YEAR * 3, YEAR * 2, YEAR,
    MONTH * 6, MONTH * 4, MONTH * 3, MONTH * 2, MONTH,
    DAY * 15, DAY * 10, DAY * 7, DAY * 5, DAY * 3, DAY * 2, DAY,
    HOUR * 12, HOUR * 6, HOUR * 3, HOUR * 1.5, HOUR,
    MINUTE30, MINUTE15, MINUTE * 10, MINUTE5, MINUTE * 2, MINUTE
]

// Grid $ steps
const $SCALES = [0.05, 0.1, 0.2, 0.25, 0.5, 0.8, 1, 2, 5]

const ChartConfig = {
    SBMIN: 60,       // Minimal sidebar px
    SBMAX: Infinity, // Max sidebar, px
    TOOLBAR: 57,     // Toolbar width px
    TB_ICON: 25,     // Toolbar icon size px
    TB_ITEM_M: 6,    // Toolbar item margin px
    TB_ICON_BRI: 1,  // Toolbar icon brightness
    TB_ICON_HOLD: 420, // ms, wait to expand
    TB_BORDER: 1,    // Toolbar border px
    TB_B_STYLE: 'dotted', // Toolbar border style
    TOOL_COLL: 7,    // Tool collision threshold
    EXPAND: 0.15,    // %/100 of range
    CANDLEW: 0.6,    // %/100 of step
    GRIDX: 100,      // px
    GRIDY: 47,       // px
    BOTBAR: 28,      // px
    PANHEIGHT: 22,   // px
    DEFAULT_LEN: 50, // candles
    MINIMUM_LEN: 5,  // candles,
    MIN_ZOOM: 25,    // candles
    MAX_ZOOM: 1000,  // candles,
    VOLSCALE: 0.15,  // %/100 of height
    UX_OPACITY: 0.9, // Ux background opacity
    ZOOM_MODE: 'tv', // 'tv' or 'tl'
    L_BTN_SIZE: 21,  // Legend Button size, px
    L_BTN_MARGIN: '-6px 0 -6px 0', // css margin
    SCROLL_WHEEL: 'prevent', // 'pass', 'click'
}

ChartConfig.FONT =
    `11px -apple-system,BlinkMacSystemFont,
    Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,
    Fira Sans,Droid Sans,Helvetica Neue,
    sans-serif`

const IB_TF_WARN =
    `When using IB mode you should specify ` +
    `timeframe ('tf' filed in 'chart' object),` +
    `otherwise you can get an unexpected behaviour`

// Full timeframe mapping (TradingView compatible)
const MAP_UNIT = {
    // Seconds
    "1s": SECOND,
    "5s": SECOND * 5,
    "15s": SECOND * 15,
    "30s": SECOND * 30,

    // Minutes (can use both '1' or '1m' format)
    "1": MINUTE,
    "1m": MINUTE,
    "2": MINUTE * 2,
    "2m": MINUTE * 2,
    "3": MINUTE3,
    "3m": MINUTE3,
    "5": MINUTE5,
    "5m": MINUTE5,
    "10": MINUTE * 10,
    "10m": MINUTE * 10,
    "15": MINUTE15,
    "15m": MINUTE15,
    "20": MINUTE * 20,
    "20m": MINUTE * 20,
    "30": MINUTE30,
    "30m": MINUTE30,
    "45": MINUTE * 45,
    "45m": MINUTE * 45,

    // Hours
    "60": HOUR,
    "1H": HOUR,
    "120": HOUR * 2,
    "2H": HOUR * 2,
    "180": HOUR * 3,
    "3H": HOUR * 3,
    "240": HOUR4,
    "4H": HOUR4,
    "360": HOUR * 6,
    "6H": HOUR * 6,
    "480": HOUR * 8,
    "8H": HOUR * 8,
    "720": HOUR12,
    "12H": HOUR12,

    // Days
    "1D": DAY,
    "2D": DAY * 2,
    "3D": DAY * 3,

    // Weeks
    "1W": WEEK,
    "2W": WEEK * 2,

    // Months
    "1M": MONTH,
    "3M": MONTH * 3,
    "6M": MONTH * 6,
    "12M": MONTH * 12,

    // Year
    "1Y": YEAR
}

// Timeframe groups for UI components
const TIMEFRAME_GROUPS = {
    seconds: {
        label: 'Seconds',
        timeframes: ['1s', '5s', '15s', '30s']
    },
    minutes: {
        label: 'Minutes',
        timeframes: ['1', '2', '3', '5', '10', '15', '20', '30', '45']
    },
    hours: {
        label: 'Hours',
        timeframes: ['1H', '2H', '3H', '4H', '6H', '8H', '12H']
    },
    days: {
        label: 'Days',
        timeframes: ['1D', '2D', '3D']
    },
    weeks: {
        label: 'Weeks',
        timeframes: ['1W', '2W']
    },
    months: {
        label: 'Months',
        timeframes: ['1M', '3M', '6M', '12M', '1Y']
    }
}

export default {
    SECOND: SECOND,
    MINUTE: MINUTE,
    MINUTE5: MINUTE5,
    MINUTE15: MINUTE15,
    MINUTE30: MINUTE30,
    HOUR: HOUR,
    HOUR4: HOUR4,
    DAY: DAY,
    WEEK: WEEK,
    MONTH: MONTH,
    YEAR: YEAR,
    MONTHMAP: MONTHMAP,
    TIMESCALES: TIMESCALES,
    $SCALES: $SCALES,
    ChartConfig: ChartConfig,
    map_unit: MAP_UNIT,
    TIMEFRAME_GROUPS: TIMEFRAME_GROUPS,
    IB_TF_WARN
}
