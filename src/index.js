import TradingVue from './TradingVue.vue'
import DataCube from './helpers/datacube.js'
import DataProvider from './helpers/DataProvider.js'
import IndicatorManager from './helpers/IndicatorManager.js'
import ExchangeManager from './helpers/ExchangeManager.js'
import Overlay from './mixins/overlay.js'
import Tool from './mixins/tool.js'
import Interface from './mixins/interface.js'
import Utils from './stuff/utils.js'
import Constants from './stuff/constants.js'
import Candle from './components/primitives/candle.js'
import Volbar from './components/primitives/volbar.js'
import Line from './components/primitives/line.js'
import Pin from './components/primitives/pin.js'
import Price from './components/primitives/price.js'
import Ray from './components/primitives/ray.js'
import Seg from './components/primitives/seg.js'
import TFSelector from './components/TFSelector.vue'
import TFSelectorDropdown from './components/TFSelectorDropdown.vue'
import IndicatorSettings from './components/IndicatorSettings.vue'
import ExchangeSettings from './components/ExchangeSettings.vue'
import ExchangeManagerComponent from './components/ExchangeManager.vue'
import WatchlistPanel from './components/WatchlistPanel.vue'
import DrawingToolbar from './components/DrawingToolbar.vue'

// Drawing Tools
import BrushTool from './components/overlays/BrushTool.vue'
import HorizontalLine from './components/overlays/HorizontalLine.vue'
import VerticalLine from './components/overlays/VerticalLine.vue'
import RectangleTool from './components/overlays/RectangleTool.vue'
import CircleTool from './components/overlays/CircleTool.vue'
import TriangleTool from './components/overlays/TriangleTool.vue'
import TextTool from './components/overlays/TextTool.vue'
import ArrowTool from './components/overlays/ArrowTool.vue'
import CalloutTool from './components/overlays/CalloutTool.vue'

import { layout_cnv, layout_vol } from
    './components/js/layout_cnv.js'

const primitives = {
    Candle, Volbar, Line, Pin, Price, Ray, Seg
}

const drawingTools = {
    BrushTool, HorizontalLine, VerticalLine,
    RectangleTool, CircleTool, TriangleTool,
    TextTool, ArrowTool, CalloutTool
}

TradingVue.install = function (Vue) {
    Vue.component(TradingVue.name, TradingVue)
    Vue.component('TFSelector', TFSelector)
    Vue.component('TFSelectorDropdown', TFSelectorDropdown)
    Vue.component('IndicatorSettings', IndicatorSettings)
    Vue.component('ExchangeSettings', ExchangeSettings)
    Vue.component('ExchangeManager', ExchangeManagerComponent)
    Vue.component('WatchlistPanel', WatchlistPanel)
    Vue.component('DrawingToolbar', DrawingToolbar)

    // Register drawing tools
    Object.entries(drawingTools).forEach(([name, component]) => {
        Vue.component(name, component)
    })
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(TradingVue)
    window.TradingVueLib = {
        TradingVue, Overlay, Utils, Constants,
        Candle, Volbar, layout_cnv, layout_vol,
        DataCube, Tool, Interface, primitives,
        TFSelector, TFSelectorDropdown,
        DataProvider, IndicatorManager, ExchangeManager,
        IndicatorSettings, ExchangeSettings, ExchangeManagerComponent,
        WatchlistPanel, DrawingToolbar, drawingTools
    }
}

export default TradingVue

export {
    TradingVue, Overlay, Utils, Constants,
    Candle, Volbar, layout_cnv, layout_vol,
    DataCube, Tool, Interface, primitives,
    TFSelector, TFSelectorDropdown,
    DataProvider, IndicatorManager, ExchangeManager,
    IndicatorSettings, ExchangeSettings, ExchangeManagerComponent,
    WatchlistPanel, DrawingToolbar,
    BrushTool, HorizontalLine, VerticalLine,
    RectangleTool, CircleTool, TriangleTool,
    TextTool, ArrowTool, CalloutTool
}
