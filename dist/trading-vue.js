/*!
 * TradingVue.JS - v1.0.2 - Thu Feb 12 2026
 *     https://github.com/tvjsx/trading-vue-js
 *     Copyright (c) 2019 C451 Code's All Right;
 *     Licensed under the MIT license
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["TradingVueJs"] = factory();
	else
		root["TradingVueJs"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 7757:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(5666);


/***/ }),

/***/ 7546:
/***/ ((module) => {

/**
 * Utility compare functions
 */

module.exports = {

    /**
     * Compare two numbers.
     *
     * @param {Number} a
     * @param {Number} b
     * @returns {Number} 1 if a > b, 0 if a = b, -1 if a < b
     */
    numcmp: function (a, b) {
        return a - b;
    },

    /**
     * Compare two strings.
     *
     * @param {Number|String} a
     * @param {Number|String} b
     * @returns {Number} 1 if a > b, 0 if a = b, -1 if a < b
     */
    strcmp: function (a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

};


/***/ }),

/***/ 9678:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Indexed Array Binary Search module
 */

/**
 * Dependencies
 */
var util = __webpack_require__(9500),
    cmp = __webpack_require__(7546),
    bin = __webpack_require__(8101);

/**
 * Module interface definition
 */
module.exports = IndexedArray;

/**
 * Indexed Array constructor
 *
 * It loads the array data, defines the index field and the comparison function
 * to be used.
 *
 * @param {Array} data is an array of objects
 * @param {String} index is the object's property used to search the array
 */
function IndexedArray(data, index) {

    // is data sortable array or array-like object?
    if (!util.isSortableArrayLike(data))
        throw new Error("Invalid data");

    // is index a valid property?
    if (!index || data.length > 0 && !(index in data[0]))
        throw new Error("Invalid index");

    // data array
    this.data = data;

    // name of the index property
    this.index = index;

    // set index boundary values
    this.setBoundaries();

    // default comparison function
    this.compare = typeof this.minv === "number" ? cmp.numcmp : cmp.strcmp;

    // default search function
    this.search = bin.search;

    // cache of index values to array positions
    // each value stores an object as { found: true|false, index: array-index }
    this.valpos = {};

    // cursor and adjacent positions
    this.cursor = null;
    this.nextlow = null;
    this.nexthigh = null;
}

/**
 * Set the comparison function
 *
 * @param {Function} fn to compare index values that returnes 1, 0, -1
 */
IndexedArray.prototype.setCompare = function (fn) {
    if (typeof fn !== "function")
        throw new Error("Invalid argument");

    this.compare = fn;
    return this;
};

/**
 * Set the search function
 *
 * @param {Function} fn to search index values in the array of objects
 */
IndexedArray.prototype.setSearch = function (fn) {
    if (typeof fn !== "function")
        throw new Error("Invalid argument");

    this.search = fn;
    return this;
};

/**
 * Sort the data array by its index property
 */
IndexedArray.prototype.sort = function () {
    var self = this,
        index = this.index;

    // sort the array
    this.data.sort(function (a, b) {
        return self.compare(a[index], b[index]);
    });

    // recalculate boundary values
    this.setBoundaries();

    return this;
};

/**
 * Inspect and set the boundaries of the internal data array
 */
IndexedArray.prototype.setBoundaries = function () {
    var data = this.data,
        index = this.index;

    this.minv = data.length && data[0][index];
    this.maxv = data.length && data[data.length - 1][index];

    return this;
};

/**
 * Get the position of the object corresponding to the given index
 *
 * @param {Number|String} index is the id of the requested object
 * @returns {Number} the position of the object in the array
 */
IndexedArray.prototype.fetch = function (value) {
    // check data has objects
    if (this.data.length === 0) {
        this.cursor = null;
        this.nextlow = null;
        this.nexthigh = null;
        return this;
    }

    // check the request is within range
    if (this.compare(value, this.minv) === -1) {
        this.cursor = null;
        this.nextlow = null;
        this.nexthigh = 0;
        return this;
    }
    if (this.compare(value, this.maxv) === 1) {
        this.cursor = null;
        this.nextlow = this.data.length - 1;
        this.nexthigh = null;
        return this;
    }

    var valpos = this.valpos,
        pos = valpos[value];

    // if the request is memorized, just give it back
    if (pos) {
        if (pos.found) {
            this.cursor = pos.index;
            this.nextlow = null;
            this.nexthigh = null;
        } else {
            this.cursor = null;
            this.nextlow = pos.prev;
            this.nexthigh = pos.next;
        }
        return this;
    }

    // if not, do the search
    var result = this.search.call(this, value);
    this.cursor = result.index;
    this.nextlow = result.prev;
    this.nexthigh = result.next;
    return this;
};

/**
 * Get the object corresponding to the given index
 *
 * When no value is given, the function will default to the last fetched item.
 *
 * @param {Number|String} [optional] index is the id of the requested object
 * @returns {Object} the found object or null
 */
IndexedArray.prototype.get = function (value) {
    if (value)
        this.fetch(value);

    var pos = this.cursor;
    return pos !== null ? this.data[pos] : null;
};

/**
 * Get an slice of the data array
 *
 * Boundaries have to be in order.
 *
 * @param {Number|String} begin index is the id of the requested object
 * @param {Number|String} end index is the id of the requested object
 * @returns {Object} the slice of data array or []
 */
IndexedArray.prototype.getRange = function (begin, end) {
    // check if boundaries are in order
    if (this.compare(begin, end) === 1) {
        return [];
    }

    // fetch start and default to the next index above
    this.fetch(begin);
    var start = this.cursor || this.nexthigh;

    // fetch finish and default to the next index below
    this.fetch(end);
    var finish = this.cursor || this.nextlow;

    // if any boundary is not set, return no range
    if (start === null || finish === null) {
        return [];
    }

    // return range
    return this.data.slice(start, finish + 1);
};


/***/ }),

/***/ 8101:
/***/ ((module) => {

/**
 * Binary search implementation
 */

/**
 * Main search recursive function
 */
function loop(data, min, max, index, valpos) {

    // set current position as the middle point between min and max
    var curr = (max + min) >>> 1;

    // compare current index value with the one we are looking for
    var diff = this.compare(data[curr][this.index], index);

    // found?
    if (!diff) {
        return valpos[index] = {
            "found": true,
            "index": curr,
            "prev": null,
            "next": null
        };
    }

    // no more positions available?
    if (min >= max) {
        return valpos[index] = {
            "found": false,
            "index": null,
            "prev": (diff < 0) ? max : max - 1,
            "next": (diff < 0) ? max + 1 : max
        };
    }

    // continue looking for index in one of the remaining array halves
    // current position can be skept as index is not there...
    if (diff > 0)
        return loop.call(this, data, min, curr - 1, index, valpos);
    else
        return loop.call(this, data, curr + 1, max, index, valpos);
}

/**
 * Search bootstrap
 * The function has to be executed in the context of the IndexedArray object
 */
function search(index) {
    var data = this.data;
    return loop.call(this, data, 0, data.length - 1, index, this.valpos);
}

/**
 * Export search function
 */
module.exports.search = search;


/***/ }),

/***/ 9500:
/***/ ((module) => {

/**
 * Utils module
 */

/**
 * Check if an object is an array-like object
 *
 * @credit Javascript: The Definitive Guide, O'Reilly, 2011
 */
function isArrayLike(o) {
    if (o &&                                 // o is not null, undefined, etc.
        typeof o === "object" &&             // o is an object
        isFinite(o.length) &&                // o.length is a finite number
        o.length >= 0 &&                     // o.length is non-negative
        o.length === Math.floor(o.length) && // o.length is an integer
        o.length < 4294967296)               // o.length < 2^32
        return true;                         // Then o is array-like
    else
        return false;                        // Otherwise it is not
}

/**
 * Check for the existence of the sort function in the object
 */
function isSortable(o) {
    if (o &&                                 // o is not null, undefined, etc.
        typeof o === "object" &&             // o is an object
        typeof o.sort === "function")        // o.sort is a function
        return true;                         // Then o is array-like
    else
        return false;                        // Otherwise it is not
}

/**
 * Check for sortable-array-like objects
 */
module.exports.isSortableArrayLike = function (o) {
    return isArrayLike(o) && isSortable(o);
};


/***/ }),

/***/ 5648:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "ArrowTool": () => (/* reexport */ ArrowTool),
  "BrushTool": () => (/* reexport */ BrushTool),
  "CalloutTool": () => (/* reexport */ CalloutTool),
  "Candle": () => (/* reexport */ CandleExt),
  "CircleTool": () => (/* reexport */ CircleTool),
  "Constants": () => (/* reexport */ constants),
  "DataCube": () => (/* reexport */ DataCube),
  "DataProvider": () => (/* reexport */ DataProvider),
  "DrawingToolbar": () => (/* reexport */ DrawingToolbar),
  "ExchangeManager": () => (/* reexport */ ExchangeManager),
  "ExchangeManagerComponent": () => (/* reexport */ components_ExchangeManager),
  "ExchangeSettings": () => (/* reexport */ ExchangeSettings),
  "HorizontalLine": () => (/* reexport */ HorizontalLine),
  "IndicatorManager": () => (/* reexport */ IndicatorManager),
  "IndicatorSettings": () => (/* reexport */ IndicatorSettings),
  "Interface": () => (/* reexport */ mixins_interface),
  "Overlay": () => (/* reexport */ overlay),
  "RectangleTool": () => (/* reexport */ RectangleTool),
  "TFSelector": () => (/* reexport */ TFSelector),
  "TFSelectorDropdown": () => (/* reexport */ TFSelectorDropdown),
  "TextTool": () => (/* reexport */ TextTool),
  "Tool": () => (/* reexport */ tool),
  "TradingVue": () => (/* reexport */ TradingVue),
  "TriangleTool": () => (/* reexport */ TriangleTool),
  "Utils": () => (/* reexport */ utils),
  "VerticalLine": () => (/* reexport */ VerticalLine),
  "Volbar": () => (/* reexport */ VolbarExt),
  "WatchlistPanel": () => (/* reexport */ WatchlistPanel),
  "default": () => (/* binding */ src),
  "layout_cnv": () => (/* reexport */ layout_cnv),
  "layout_vol": () => (/* reexport */ layout_vol),
  "primitives": () => (/* binding */ primitives)
});

;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js
function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js




function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=template&id=235c0ade&
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "trading-vue",
      style: {
        color: this.chart_props.colors.text,
        font: this.font_comp,
        width: _vm.totalWidth + "px",
        height: this.height + "px"
      },
      attrs: { id: _vm.id },
      on: { mousedown: _vm.mousedown, mouseleave: _vm.mouseleave }
    },
    [
      _c(
        "div",
        {
          staticClass: "tvjs-main-container",
          style: { width: _vm.chartWidth + "px" }
        },
        [
          _vm.toolbar
            ? _c(
                "toolbar",
                _vm._b(
                  {
                    ref: "toolbar",
                    attrs: { config: _vm.chart_config },
                    on: { "custom-event": _vm.custom_event }
                  },
                  "toolbar",
                  _vm.chart_props,
                  false
                )
              )
            : _vm._e(),
          _vm._v(" "),
          _vm.controllers.length
            ? _c("widgets", {
                ref: "widgets",
                attrs: {
                  map: _vm.ws,
                  width: _vm.chartWidth,
                  height: _vm.height,
                  tv: this,
                  dc: _vm.data
                }
              })
            : _vm._e(),
          _vm._v(" "),
          _c(
            "chart",
            _vm._b(
              {
                key: _vm.reset,
                ref: "chart",
                attrs: { tv_id: _vm.id, config: _vm.chart_config },
                on: {
                  "custom-event": _vm.custom_event,
                  "range-changed": _vm.range_changed,
                  "legend-button-click": _vm.legend_button
                }
              },
              "chart",
              _vm.chart_props,
              false
            )
          ),
          _vm._v(" "),
          _c(
            "transition",
            { attrs: { name: "tvjs-drift" } },
            [
              _vm.tip
                ? _c("the-tip", {
                    attrs: { data: _vm.tip },
                    on: {
                      "remove-me": function($event) {
                        _vm.tip = null
                      }
                    }
                  })
                : _vm._e()
            ],
            1
          ),
          _vm._v(" "),
          _vm.timeframes && _vm.timeframeStyle === "full"
            ? _c("tf-selector", {
                attrs: {
                  night: _vm.isDarkTheme,
                  extended: _vm.timeframeExtended,
                  "show-seconds": _vm.showSecondsTF
                },
                on: { change: _vm.on_timeframe_change },
                model: {
                  value: _vm.currentTF,
                  callback: function($$v) {
                    _vm.currentTF = $$v
                  },
                  expression: "currentTF"
                }
              })
            : _vm._e(),
          _vm._v(" "),
          _vm.timeframes && _vm.timeframeStyle === "dropdown"
            ? _c("tf-selector-dropdown", {
                attrs: { night: _vm.isDarkTheme },
                on: { change: _vm.on_timeframe_change },
                model: {
                  value: _vm.currentTF,
                  callback: function($$v) {
                    _vm.currentTF = $$v
                  },
                  expression: "currentTF"
                }
              })
            : _vm._e()
        ],
        1
      ),
      _vm._v(" "),
      _vm.showWatchlist
        ? _c("watchlist-panel", {
            ref: "watchlist",
            attrs: {
              symbol: _vm.symbol,
              exchange: _vm.exchangeName,
              tickers: _vm.watchlistTickers,
              exchanges: _vm.configuredExchanges,
              night: _vm.isDarkTheme,
              "initial-width": _vm.watchlistWidth,
              "min-width": _vm.watchlistMinWidth,
              "max-width": _vm.watchlistMaxWidth
            },
            on: {
              "ticker-select": _vm.on_ticker_select,
              "ticker-add": _vm.on_ticker_add,
              "ticker-remove": _vm.on_ticker_remove,
              resize: _vm.on_watchlist_resize,
              collapse: _vm.on_watchlist_collapse
            }
          })
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true


;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=template&id=235c0ade&

;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/defineProperty.js
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js




function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
// EXTERNAL MODULE: ./node_modules/@babel/runtime/regenerator/index.js
var regenerator = __webpack_require__(7757);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);
;// CONCATENATED MODULE: ./src/stuff/constants.js
var SECOND = 1000;
var MINUTE = SECOND * 60;
var MINUTE3 = MINUTE * 3;
var MINUTE5 = MINUTE * 5;
var MINUTE15 = MINUTE * 15;
var MINUTE30 = MINUTE * 30;
var HOUR = MINUTE * 60;
var HOUR4 = HOUR * 4;
var HOUR12 = HOUR * 12;
var DAY = HOUR * 24;
var WEEK = DAY * 7;
var MONTH = WEEK * 4;
var YEAR = DAY * 365;
var MONTHMAP = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; // Grid time steps

var TIMESCALES = [YEAR * 10, YEAR * 5, YEAR * 3, YEAR * 2, YEAR, MONTH * 6, MONTH * 4, MONTH * 3, MONTH * 2, MONTH, DAY * 15, DAY * 10, DAY * 7, DAY * 5, DAY * 3, DAY * 2, DAY, HOUR * 12, HOUR * 6, HOUR * 3, HOUR * 1.5, HOUR, MINUTE30, MINUTE15, MINUTE * 10, MINUTE5, MINUTE * 2, MINUTE]; // Grid $ steps

var $SCALES = [0.05, 0.1, 0.2, 0.25, 0.5, 0.8, 1, 2, 5];
var ChartConfig = {
  SBMIN: 60,
  // Minimal sidebar px
  SBMAX: Infinity,
  // Max sidebar, px
  TOOLBAR: 57,
  // Toolbar width px
  TB_ICON: 25,
  // Toolbar icon size px
  TB_ITEM_M: 6,
  // Toolbar item margin px
  TB_ICON_BRI: 1,
  // Toolbar icon brightness
  TB_ICON_HOLD: 420,
  // ms, wait to expand
  TB_BORDER: 1,
  // Toolbar border px
  TB_B_STYLE: 'dotted',
  // Toolbar border style
  TOOL_COLL: 7,
  // Tool collision threshold
  EXPAND: 0.15,
  // %/100 of range
  CANDLEW: 0.6,
  // %/100 of step
  GRIDX: 100,
  // px
  GRIDY: 47,
  // px
  BOTBAR: 28,
  // px
  PANHEIGHT: 22,
  // px
  DEFAULT_LEN: 50,
  // candles
  MINIMUM_LEN: 5,
  // candles,
  MIN_ZOOM: 25,
  // candles
  MAX_ZOOM: 1000,
  // candles,
  VOLSCALE: 0.15,
  // %/100 of height
  UX_OPACITY: 0.9,
  // Ux background opacity
  ZOOM_MODE: 'tv',
  // 'tv' or 'tl'
  L_BTN_SIZE: 21,
  // Legend Button size, px
  L_BTN_MARGIN: '-6px 0 -6px 0',
  // css margin
  SCROLL_WHEEL: 'prevent' // 'pass', 'click'

};
ChartConfig.FONT = "11px -apple-system,BlinkMacSystemFont,\n    Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,\n    Fira Sans,Droid Sans,Helvetica Neue,\n    sans-serif";
var IB_TF_WARN = "When using IB mode you should specify " + "timeframe ('tf' filed in 'chart' object)," + "otherwise you can get an unexpected behaviour"; // Full timeframe mapping (TradingView compatible)

var MAP_UNIT = {
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
}; // Timeframe groups for UI components

var TIMEFRAME_GROUPS = {
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
};
/* harmony default export */ const constants = ({
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
  IB_TF_WARN: IB_TF_WARN
});
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Chart.vue?vue&type=template&id=4d06a4de&
var Chartvue_type_template_id_4d06a4de_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "trading-vue-chart", style: _vm.styles },
    [
      _c("keyboard", { ref: "keyboard" }),
      _vm._v(" "),
      _vm._l(this._layout.grids, function(grid, i) {
        return _c("grid-section", {
          key: grid.id,
          ref: "sec",
          refInFor: true,
          attrs: { common: _vm.section_props(i), grid_id: i },
          on: {
            "register-kb-listener": _vm.register_kb,
            "remove-kb-listener": _vm.remove_kb,
            "range-changed": _vm.range_changed,
            "cursor-changed": _vm.cursor_changed,
            "cursor-locked": _vm.cursor_locked,
            "sidebar-transform": _vm.set_ytransform,
            "layer-meta-props": _vm.layer_meta_props,
            "custom-event": _vm.emit_custom_event,
            "legend-button-click": _vm.legend_button_click
          }
        })
      }),
      _vm._v(" "),
      _c(
        "botbar",
        _vm._b(
          { attrs: { shaders: _vm.shaders, timezone: _vm.timezone } },
          "botbar",
          _vm.botbar_props,
          false
        )
      )
    ],
    2
  )
}
var Chartvue_type_template_id_4d06a4de_staticRenderFns = []
Chartvue_type_template_id_4d06a4de_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/Chart.vue?vue&type=template&id=4d06a4de&

;// CONCATENATED MODULE: ./src/stuff/context.js
// Canvas context for text measurments
function Context($p) {
  var el = document.createElement('canvas');
  var ctx = el.getContext("2d");
  ctx.font = $p.font;
  return ctx;
}

/* harmony default export */ const context = (Context);
// EXTERNAL MODULE: ./node_modules/arrayslicer/lib/index.js
var lib = __webpack_require__(9678);
var lib_default = /*#__PURE__*/__webpack_require__.n(lib);
;// CONCATENATED MODULE: ./src/stuff/utils.js



/* harmony default export */ const utils = ({
  clamp: function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  },
  add_zero: function add_zero(i) {
    if (i < 10) {
      i = "0" + i;
    }

    return i;
  },
  // Start of the day (zero millisecond)
  day_start: function day_start(t) {
    var start = new Date(t);
    return start.setUTCHours(0, 0, 0, 0);
  },
  // Start of the month
  month_start: function month_start(t) {
    var date = new Date(t);
    return Date.UTC(date.getFullYear(), date.getMonth(), 1);
  },
  // Start of the year
  year_start: function year_start(t) {
    return Date.UTC(new Date(t).getFullYear());
  },
  get_year: function get_year(t) {
    if (!t) return undefined;
    return new Date(t).getUTCFullYear();
  },
  get_month: function get_month(t) {
    if (!t) return undefined;
    return new Date(t).getUTCMonth();
  },
  // Nearest in array
  nearest_a: function nearest_a(x, array) {
    var dist = Infinity;
    var val = null;
    var index = -1;

    for (var i = 0; i < array.length; i++) {
      var xi = array[i];

      if (Math.abs(xi - x) < dist) {
        dist = Math.abs(xi - x);
        val = xi;
        index = i;
      }
    }

    return [index, val];
  },
  round: function round(num, decimals) {
    if (decimals === void 0) {
      decimals = 8;
    }

    return parseFloat(num.toFixed(decimals));
  },
  // Strip? No, it's ugly floats in js
  strip: function strip(number) {
    return parseFloat(parseFloat(number).toPrecision(12));
  },
  get_day: function get_day(t) {
    return t ? new Date(t).getDate() : null;
  },
  // Update array keeping the same reference
  overwrite: function overwrite(arr, new_arr) {
    arr.splice.apply(arr, [0, arr.length].concat(_toConsumableArray(new_arr)));
  },
  // Copy layout in reactive way
  copy_layout: function copy_layout(obj, new_obj) {
    for (var k in obj) {
      if (Array.isArray(obj[k])) {
        // (some offchart indicators are added/removed)
        // we need to update layout in a reactive way
        if (obj[k].length !== new_obj[k].length) {
          this.overwrite(obj[k], new_obj[k]);
          continue;
        }

        for (var m in obj[k]) {
          Object.assign(obj[k][m], new_obj[k][m]);
        }
      } else {
        Object.assign(obj[k], new_obj[k]);
      }
    }
  },
  // Detects candles interval
  detect_interval: function detect_interval(ohlcv) {
    var len = Math.min(ohlcv.length - 1, 99);
    var min = Infinity;
    ohlcv.slice(0, len).forEach(function (x, i) {
      var d = ohlcv[i + 1][0] - x[0];
      if (d === d && d < min) min = d;
    }); // This saves monthly chart from being awkward

    if (min >= constants.MONTH && min <= constants.DAY * 30) {
      return constants.DAY * 31;
    }

    return min;
  },
  // Gets numberic part of overlay id (e.g 'EMA_1' = > 1)
  get_num_id: function get_num_id(id) {
    return parseInt(id.split('_').pop());
  },
  // Fast filter. Really fast, like 10X
  fast_filter: function fast_filter(arr, t1, t2) {
    if (!arr.length) return [arr, undefined];

    try {
      var ia = new (lib_default())(arr, "0");
      var res = ia.getRange(t1, t2);
      var i0 = ia.valpos[t1].next;
      return [res, i0];
    } catch (e) {
      // Something wrong with fancy slice lib
      // Fast fix: fallback to filter
      return [arr.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      }), 0];
    }
  },
  // Fast filter (index-based)
  fast_filter_i: function fast_filter_i(arr, t1, t2) {
    if (!arr.length) return [arr, undefined];
    var i1 = Math.floor(t1);
    if (i1 < 0) i1 = 0;
    var i2 = Math.floor(t2 + 1);
    var res = arr.slice(i1, i2);
    return [res, i1];
  },
  // Nearest indexes (left and right)
  fast_nearest: function fast_nearest(arr, t1) {
    var ia = new (lib_default())(arr, "0");
    ia.fetch(t1);
    return [ia.nextlow, ia.nexthigh];
  },
  now: function now() {
    return new Date().getTime();
  },
  pause: function pause(delay) {
    return new Promise(function (rs, rj) {
      return setTimeout(rs, delay);
    });
  },
  // Limit crazy wheel delta values
  smart_wheel: function smart_wheel(delta) {
    var abs = Math.abs(delta);

    if (abs > 500) {
      return (200 + Math.log(abs)) * Math.sign(delta);
    }

    return delta;
  },
  // Parse the original mouse event to find deltaX
  get_deltaX: function get_deltaX(event) {
    return event.originalEvent.deltaX / 12;
  },
  // Parse the original mouse event to find deltaY
  get_deltaY: function get_deltaY(event) {
    return event.originalEvent.deltaY / 12;
  },
  // Apply opacity to a hex color
  apply_opacity: function apply_opacity(c, op) {
    if (c.length === 7) {
      var n = Math.floor(op * 255);
      n = this.clamp(n, 0, 255);
      c += n.toString(16);
    }

    return c;
  },
  // Parse timeframe or return value in ms
  parse_tf: function parse_tf(smth) {
    if (typeof smth === 'string') {
      return constants.map_unit[smth];
    } else {
      return smth;
    }
  },
  // Detect index shift between the main data sub
  // and the overlay's sub (for IB-mode)
  index_shift: function index_shift(sub, data) {
    // Find the second timestamp (by value)
    if (!data.length) return 0;
    var first = data[0][0];
    var second;

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] !== first) {
        second = data[i][0];
        break;
      }
    }

    for (var j = 0; j < sub.length; j++) {
      if (sub[j][0] === second) {
        return j - i;
      }
    }

    return 0;
  },
  // Fallback fix for Brave browser
  // https://github.com/brave/brave-browser/issues/1738
  measureText: function measureText(ctx, text, tv_id) {
    var m = ctx.measureTextOrg(text);

    if (m.width === 0) {
      var doc = document;
      var id = 'tvjs-measure-text';
      var el = doc.getElementById(id);

      if (!el) {
        var base = doc.getElementById(tv_id);
        el = doc.createElement("div");
        el.id = id;
        el.style.position = 'absolute';
        el.style.top = '-1000px';
        base.appendChild(el);
      }

      if (ctx.font) el.style.font = ctx.font;
      el.innerText = text.replace(/ /g, '.');
      return {
        width: el.offsetWidth
      };
    } else {
      return m;
    }
  },
  uuid: function uuid(temp) {
    if (temp === void 0) {
      temp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    }

    return temp.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  },
  uuid2: function uuid2() {
    return this.uuid('xxxxxxxxxxxx');
  },
  // Delayed warning, f = condition lambda fn
  warn: function warn(f, text, delay) {
    if (delay === void 0) {
      delay = 0;
    }

    setTimeout(function () {
      if (f()) console.warn(text);
    }, delay);
  },
  // Checks if script props updated
  // (and not style settings or something else)
  is_scr_props_upd: function is_scr_props_upd(n, prev) {
    var p = prev.find(function (x) {
      return x.v.$uuid === n.v.$uuid;
    });
    if (!p) return false;
    var props = n.p.settings.$props;
    if (!props) return false;
    return props.some(function (x) {
      return n.v[x] !== p.v[x];
    });
  },
  // Checks if it's time to make a script update
  // (based on execInterval in ms)
  delayed_exec: function delayed_exec(v) {
    if (!v.script || !v.script.execInterval) return true;
    var t = this.now();
    var dt = v.script.execInterval;

    if (!v.settings.$last_exec || t > v.settings.$last_exec + dt) {
      v.settings.$last_exec = t;
      return true;
    }

    return false;
  },
  // Format names such 'RSI, $length', where
  // length - is one of the settings
  format_name: function format_name(ov) {
    if (!ov.name) return undefined;
    var name = ov.name;

    for (var k in ov.settings || {}) {
      var val = ov.settings[k];
      var reg = new RegExp("\\$".concat(k), 'g');
      name = name.replace(reg, val);
    }

    return name;
  },
  // Default cursor mode
  xmode: function xmode() {
    return this.is_mobile ? 'explore' : 'default';
  },
  default_prevented: function default_prevented(event) {
    if (event.original) {
      return event.original.defaultPrevented;
    }

    return event.defaultPrevented;
  },
  // WTF with modern web development
  is_mobile: function (w) {
    return 'onorientationchange' in w && (!!navigator.maxTouchPoints || !!navigator.msMaxTouchPoints || 'ontouchstart' in w || w.DocumentTouch && document instanceof w.DocumentTouch);
  }(typeof window !== 'undefined' ? window : {})
});
;// CONCATENATED MODULE: ./src/stuff/math.js
// Math/Geometry
/* harmony default export */ const math = ({
  // Distance from point to line
  // p1 = point, (p2, p3) = line
  point2line: function point2line(p1, p2, p3) {
    var _this$tri = this.tri(p1, p2, p3),
        area = _this$tri.area,
        base = _this$tri.base;

    return Math.abs(this.tri_h(area, base));
  },
  // Distance from point to segment
  // p1 = point, (p2, p3) = segment
  point2seg: function point2seg(p1, p2, p3) {
    var _this$tri2 = this.tri(p1, p2, p3),
        area = _this$tri2.area,
        base = _this$tri2.base; // Vector projection


    var proj = this.dot_prod(p1, p2, p3) / base; // Distance from left pin

    var l1 = Math.max(-proj, 0); // Distance from right pin

    var l2 = Math.max(proj - base, 0); // Normal

    var h = Math.abs(this.tri_h(area, base));
    return Math.max(h, l1, l2);
  },
  // Distance from point to ray
  // p1 = point, (p2, p3) = ray
  point2ray: function point2ray(p1, p2, p3) {
    var _this$tri3 = this.tri(p1, p2, p3),
        area = _this$tri3.area,
        base = _this$tri3.base; // Vector projection


    var proj = this.dot_prod(p1, p2, p3) / base; // Distance from left pin

    var l1 = Math.max(-proj, 0); // Normal

    var h = Math.abs(this.tri_h(area, base));
    return Math.max(h, l1);
  },
  tri: function tri(p1, p2, p3) {
    var area = this.area(p1, p2, p3);
    var dx = p3[0] - p2[0];
    var dy = p3[1] - p2[1];
    var base = Math.sqrt(dx * dx + dy * dy);
    return {
      area: area,
      base: base
    };
  },

  /* Area of triangle:
          p1
        /    \
      p2  _  p3
  */
  area: function area(p1, p2, p3) {
    return p1[0] * (p2[1] - p3[1]) + p2[0] * (p3[1] - p1[1]) + p3[0] * (p1[1] - p2[1]);
  },
  // Triangle height
  tri_h: function tri_h(area, base) {
    return area / base;
  },
  // Dot product of (p2, p3) and (p2, p1)
  dot_prod: function dot_prod(p1, p2, p3) {
    var v1 = [p3[0] - p2[0], p3[1] - p2[1]];
    var v2 = [p1[0] - p2[0], p1[1] - p2[1]];
    return v1[0] * v2[0] + v1[1] * v2[1];
  },
  // Symmetrical log
  log: function log(x) {
    // TODO: log for small values
    return Math.sign(x) * Math.log(Math.abs(x) + 1);
  },
  // Symmetrical exp
  exp: function exp(x) {
    return Math.sign(x) * (Math.exp(Math.abs(x)) - 1);
  },
  // Middle line on log scale based on range & px height
  log_mid: function log_mid(r, h) {
    var log_hi = this.log(r[0]);
    var log_lo = this.log(r[1]);
    var px = h / 2;
    var gx = log_hi - px * (log_hi - log_lo) / h;
    return this.exp(gx);
  },
  // Return new adjusted range, based on the previous
  // range, new $_hi, target middle line
  re_range: function re_range(r1, hi2, mid) {
    var log_hi1 = this.log(r1[0]);
    var log_lo1 = this.log(r1[1]);
    var log_hi2 = this.log(hi2);
    var log_$ = this.log(mid);
    var W = (log_hi2 - log_$) * (log_hi1 - log_lo1) / (log_hi1 - log_$);
    return this.exp(log_hi2 - W);
  } // Return new adjusted range, based on the previous
  // range, new $_hi, target middle line + dy (shift)
  // WASTE

  /*range_shift(r1, hi2, mid, dy, h) {
      let log_hi1 = this.log(r1[0])
      let log_lo1 = this.log(r1[1])
      let log_hi2 = this.log(hi2)
      let log_$ = this.log(mid)
       let W = h * (log_hi2 - log_$) /
              (h * (log_hi1 - log_$) / (log_hi1 - log_lo1) + dy)
       return this.exp(log_hi2 - W)
   }*/

});
;// CONCATENATED MODULE: ./src/components/js/layout_fn.js
// Layout functional interface


/* harmony default export */ function layout_fn(self, range) {
  var ib = self.ti_map.ib;
  var dt = range[1] - range[0];
  var r = self.spacex / dt;
  var ls = self.grid.logScale || false;
  Object.assign(self, {
    // Time to screen coordinates
    t2screen: function t2screen(t) {
      if (ib) t = self.ti_map.smth2i(t);
      return Math.floor((t - range[0]) * r) - 0.5;
    },
    // $ to screen coordinates
    $2screen: function $2screen(y) {
      if (ls) y = math.log(y);
      return Math.floor(y * self.A + self.B) - 0.5;
    },
    // Time-axis nearest step
    t_magnet: function t_magnet(t) {
      if (ib) t = self.ti_map.smth2i(t);
      var cn = self.candles || self.master_grid.candles;
      var arr = cn.map(function (x) {
        return x.raw[0];
      });
      var i = utils.nearest_a(t, arr)[0];
      if (!cn[i]) return;
      return Math.floor(cn[i].x) - 0.5;
    },
    // Screen-Y to dollar value (or whatever)
    screen2$: function screen2$(y) {
      if (ls) return math.exp((y - self.B) / self.A);
      return (y - self.B) / self.A;
    },
    // Screen-X to timestamp
    screen2t: function screen2t(x) {
      // TODO: most likely Math.floor not needed
      // return Math.floor(range[0] + x / r)
      return range[0] + x / r;
    },
    // $-axis nearest step
    $_magnet: function $_magnet(price) {},
    // Nearest candlestick
    c_magnet: function c_magnet(t) {
      var cn = self.candles || self.master_grid.candles;
      var arr = cn.map(function (x) {
        return x.raw[0];
      });
      var i = utils.nearest_a(t, arr)[0];
      return cn[i];
    },
    // Nearest data points
    data_magnet: function data_magnet(t) {
      /* TODO: implement */
    }
  });
  return self;
}
;// CONCATENATED MODULE: ./src/components/js/log_scale.js
// Log-scale mode helpers
// TODO: all-negative numbers (sometimes wrong scaling)

/* harmony default export */ const log_scale = ({
  candle: function candle(self, mid, p, $p) {
    return {
      x: mid,
      w: self.px_step * $p.config.CANDLEW,
      o: Math.floor(math.log(p[1]) * self.A + self.B),
      h: Math.floor(math.log(p[2]) * self.A + self.B),
      l: Math.floor(math.log(p[3]) * self.A + self.B),
      c: Math.floor(math.log(p[4]) * self.A + self.B),
      raw: p
    };
  },
  expand: function expand(self, height) {
    // expand log scale
    var A = -height / (math.log(self.$_hi) - math.log(self.$_lo));
    var B = -math.log(self.$_hi) * A;
    var top = -height * 0.1;
    var bot = height * 1.1;
    self.$_hi = math.exp((top - B) / A);
    self.$_lo = math.exp((bot - B) / A);
  }
});
;// CONCATENATED MODULE: ./src/components/js/grid_maker.js






var grid_maker_TIMESCALES = constants.TIMESCALES,
    grid_maker_$SCALES = constants.$SCALES,
    grid_maker_WEEK = constants.WEEK,
    grid_maker_MONTH = constants.MONTH,
    grid_maker_YEAR = constants.YEAR,
    grid_maker_HOUR = constants.HOUR,
    grid_maker_DAY = constants.DAY;
var MAX_INT = Number.MAX_SAFE_INTEGER; // master_grid - ref to the master grid

function GridMaker(id, params, master_grid) {
  if (master_grid === void 0) {
    master_grid = null;
  }

  var sub = params.sub,
      interval = params.interval,
      range = params.range,
      ctx = params.ctx,
      $p = params.$p,
      layers_meta = params.layers_meta,
      height = params.height,
      y_t = params.y_t,
      ti_map = params.ti_map,
      grid = params.grid,
      timezone = params.timezone;
  var self = {
    ti_map: ti_map
  };
  var lm = layers_meta[id];
  var y_range_fn = null;
  var ls = grid.logScale;

  if (lm && Object.keys(lm).length) {
    // Gets last y_range fn()
    var yrs = Object.values(lm).filter(function (x) {
      return x.y_range;
    }); // The first y_range() determines the range

    if (yrs.length) y_range_fn = yrs[0].y_range;
  } // Calc vertical ($/₿) range


  function calc_$range() {
    if (!master_grid) {
      // $ candlestick range
      if (y_range_fn) {
        var _y_range_fn = y_range_fn(hi, lo),
            _y_range_fn2 = _slicedToArray(_y_range_fn, 2),
            hi = _y_range_fn2[0],
            lo = _y_range_fn2[1];
      } else {
        hi = -Infinity, lo = Infinity;

        for (var i = 0, n = sub.length; i < n; i++) {
          var x = sub[i];
          if (x[2] > hi) hi = x[2];
          if (x[3] < lo) lo = x[3];
        }
      }
    } else {
      // Offchart indicator range
      hi = -Infinity, lo = Infinity;

      for (var i = 0; i < sub.length; i++) {
        for (var j = 1; j < sub[i].length; j++) {
          var v = sub[i][j];
          if (v > hi) hi = v;
          if (v < lo) lo = v;
        }
      }

      if (y_range_fn) {
        var _y_range_fn3 = y_range_fn(hi, lo),
            _y_range_fn4 = _slicedToArray(_y_range_fn3, 3),
            hi = _y_range_fn4[0],
            lo = _y_range_fn4[1],
            exp = _y_range_fn4[2];
      }
    } // Fixed y-range in non-auto mode


    if (y_t && !y_t.auto && y_t.range) {
      self.$_hi = y_t.range[0];
      self.$_lo = y_t.range[1];
    } else {
      if (!ls) {
        exp = exp === false ? 0 : 1;
        self.$_hi = hi + (hi - lo) * $p.config.EXPAND * exp;
        self.$_lo = lo - (hi - lo) * $p.config.EXPAND * exp;
      } else {
        self.$_hi = hi;
        self.$_lo = lo;
        log_scale.expand(self, height);
      }

      if (self.$_hi === self.$_lo) {
        if (!ls) {
          self.$_hi *= 1.05; // Expand if height range === 0

          self.$_lo *= 0.95;
        } else {
          log_scale.expand(self, height);
        }
      }
    }
  }

  function calc_sidebar() {
    if (sub.length < 2) {
      self.prec = 0;
      self.sb = $p.config.SBMIN;
      return;
    } // TODO: improve sidebar width calculation
    // at transition point, when one precision is
    // replaced with another
    // Gets formated levels (their lengths),
    // calculates max and measures the sidebar length
    // from it:
    // TODO: add custom formatter f()


    self.prec = calc_precision(sub);
    var lens = [];
    lens.push(self.$_hi.toFixed(self.prec).length);
    lens.push(self.$_lo.toFixed(self.prec).length);
    var str = '0'.repeat(Math.max.apply(Math, lens)) + '    ';
    self.sb = ctx.measureText(str).width;
    self.sb = Math.max(Math.floor(self.sb), $p.config.SBMIN);
    self.sb = Math.min(self.sb, $p.config.SBMAX);
  } // Calculate $ precision for the Y-axis


  function calc_precision(data) {
    var max_r = 0,
        max_l = 0;
    var min = Infinity;
    var max = -Infinity; // Speed UP

    for (var i = 0, n = data.length; i < n; i++) {
      var x = data[i];
      if (x[1] > max) max = x[1];else if (x[1] < min) min = x[1];
    } // Get max lengths of integer and fractional parts


    [min, max].forEach(function (x) {
      // Fix undefined bug
      var str = x != null ? x.toString() : '';

      if (x < 0.000001) {
        // Parsing the exponential form. Gosh this
        // smells trickily
        var _str$split = str.split('e-'),
            _str$split2 = _slicedToArray(_str$split, 2),
            ls = _str$split2[0],
            rs = _str$split2[1];

        var _ls$split = ls.split('.'),
            _ls$split2 = _slicedToArray(_ls$split, 2),
            l = _ls$split2[0],
            r = _ls$split2[1];

        if (!r) r = '';
        r = {
          length: r.length + parseInt(rs) || 0
        };
      } else {
        var _str$split3 = str.split('.'),
            _str$split4 = _slicedToArray(_str$split3, 2),
            l = _str$split4[0],
            r = _str$split4[1];
      }

      if (r && r.length > max_r) {
        max_r = r.length;
      }

      if (l && l.length > max_l) {
        max_l = l.length;
      }
    }); // Select precision scheme depending
    // on the left and right part lengths
    //

    var even = max_r - max_r % 2 + 2;

    if (max_l === 1) {
      return Math.min(8, Math.max(2, even));
    }

    if (max_l <= 2) {
      return Math.min(4, Math.max(2, even));
    }

    return 2;
  }

  function calc_positions() {
    if (sub.length < 2) return;
    var dt = range[1] - range[0]; // A pixel space available to draw on (x-axis)

    self.spacex = $p.width - self.sb; // Candle capacity

    var capacity = dt / interval;
    self.px_step = self.spacex / capacity; // px / time ratio

    var r = self.spacex / dt;
    self.startx = (sub[0][0] - range[0]) * r; // Candle Y-transform: (A = scale, B = shift)

    if (!grid.logScale) {
      self.A = -height / (self.$_hi - self.$_lo);
      self.B = -self.$_hi * self.A;
    } else {
      self.A = -height / (math.log(self.$_hi) - math.log(self.$_lo));
      self.B = -math.log(self.$_hi) * self.A;
    }
  } // Select nearest good-loking t step (m is target scale)


  function time_step() {
    var k = ti_map.ib ? 60000 : 1;
    var xrange = (range[1] - range[0]) * k;
    var m = xrange * ($p.config.GRIDX / $p.width);
    var s = grid_maker_TIMESCALES;
    return utils.nearest_a(m, s)[1] / k;
  } // Select nearest good-loking $ step (m is target scale)


  function dollar_step() {
    var yrange = self.$_hi - self.$_lo;
    var m = yrange * ($p.config.GRIDY / height);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    var d = Math.pow(10, p);
    var s = grid_maker_$SCALES.map(function (x) {
      return x * d;
    }); // TODO: center the range (look at RSI for example,
    // it looks ugly when "80" is near the top)

    return utils.strip(utils.nearest_a(m, s)[1]);
  }

  function dollar_mult() {
    var mult_hi = dollar_mult_hi();
    var mult_lo = dollar_mult_lo();
    return Math.max(mult_hi, mult_lo);
  } // Price step multiplier (for the log-scale mode)


  function dollar_mult_hi() {
    var h = Math.min(self.B, height);
    if (h < $p.config.GRIDY) return 1;
    var n = h / $p.config.GRIDY; // target grid N

    var yrange = self.$_hi;

    if (self.$_lo > 0) {
      var yratio = self.$_hi / self.$_lo;
    } else {
      yratio = self.$_hi / 1; // TODO: small values
    }

    var m = yrange * ($p.config.GRIDY / h);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    return Math.pow(yratio, 1 / n);
  }

  function dollar_mult_lo() {
    var h = Math.min(height - self.B, height);
    if (h < $p.config.GRIDY) return 1;
    var n = h / $p.config.GRIDY; // target grid N

    var yrange = Math.abs(self.$_lo);

    if (self.$_hi < 0 && self.$_lo < 0) {
      var yratio = Math.abs(self.$_lo / self.$_hi);
    } else {
      yratio = Math.abs(self.$_lo) / 1;
    }

    var m = yrange * ($p.config.GRIDY / h);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    return Math.pow(yratio, 1 / n);
  }

  function grid_x() {
    // If this is a subgrid, no need to calc a timeline,
    // we just borrow it from the master_grid
    if (!master_grid) {
      self.t_step = time_step();
      self.xs = [];
      var dt = range[1] - range[0];
      var r = self.spacex / dt;
      /* TODO: remove the left-side glitch
       let year_0 = Utils.get_year(sub[0][0])
      for (var t0 = year_0; t0 < range[0]; t0 += self.t_step) {}
       let m0 = Utils.get_month(t0)*/

      for (var i = 0; i < sub.length; i++) {
        var p = sub[i];
        var prev = sub[i - 1] || [];
        var prev_xs = self.xs[self.xs.length - 1] || [0, []];
        var x = Math.floor((p[0] - range[0]) * r);
        insert_line(prev, p, x); // Filtering lines that are too near

        var xs = self.xs[self.xs.length - 1] || [0, []];
        if (prev_xs === xs) continue;

        if (xs[1][0] - prev_xs[1][0] < self.t_step * 0.8) {
          // prev_xs is a higher "rank" label
          if (xs[2] <= prev_xs[2]) {
            self.xs.pop();
          } else {
            // Otherwise
            self.xs.splice(self.xs.length - 2, 1);
          }
        }
      } // TODO: fix grid extension for bigger timeframes


      if (interval < grid_maker_WEEK && r > 0) {
        extend_left(dt, r);
        extend_right(dt, r);
      }
    } else {
      self.t_step = master_grid.t_step;
      self.px_step = master_grid.px_step;
      self.startx = master_grid.startx;
      self.xs = master_grid.xs;
    }
  }

  function insert_line(prev, p, x, m0) {
    var prev_t = ti_map.ib ? ti_map.i2t(prev[0]) : prev[0];
    var p_t = ti_map.ib ? ti_map.i2t(p[0]) : p[0];

    if (ti_map.tf < grid_maker_DAY) {
      prev_t += timezone * grid_maker_HOUR;
      p_t += timezone * grid_maker_HOUR;
    }

    var d = timezone * grid_maker_HOUR; // TODO: take this block =========> (see below)

    if ((prev[0] || interval === grid_maker_YEAR) && utils.get_year(p_t) !== utils.get_year(prev_t)) {
      self.xs.push([x, p, grid_maker_YEAR]); // [px, [...], rank]
    } else if (prev[0] && utils.get_month(p_t) !== utils.get_month(prev_t)) {
      self.xs.push([x, p, grid_maker_MONTH]);
    } // TODO: should be added if this day !== prev day
    // And the same for 'botbar.js', TODO(*)
    else if (utils.day_start(p_t) === p_t) {
        self.xs.push([x, p, grid_maker_DAY]);
      } else if (p[0] % self.t_step === 0) {
        self.xs.push([x, p, interval]);
      }
  }

  function extend_left(dt, r) {
    if (!self.xs.length || !isFinite(r)) return;
    var t = self.xs[0][1][0];

    while (true) {
      t -= self.t_step;
      var x = Math.floor((t - range[0]) * r);
      if (x < 0) break; // TODO: ==========> And insert it here somehow

      if (t % interval === 0) {
        self.xs.unshift([x, [t], interval]);
      }
    }
  }

  function extend_right(dt, r) {
    if (!self.xs.length || !isFinite(r)) return;
    var t = self.xs[self.xs.length - 1][1][0];

    while (true) {
      t += self.t_step;
      var x = Math.floor((t - range[0]) * r);
      if (x > self.spacex) break;

      if (t % interval === 0) {
        self.xs.push([x, [t], interval]);
      }
    }
  }

  function grid_y() {
    // Prevent duplicate levels
    var m = Math.pow(10, -self.prec);
    self.$_step = Math.max(m, dollar_step());
    self.ys = [];
    var y1 = self.$_lo - self.$_lo % self.$_step;

    for (var y$ = y1; y$ <= self.$_hi; y$ += self.$_step) {
      var y = Math.floor(y$ * self.A + self.B);
      if (y > height) continue;
      self.ys.push([y, utils.strip(y$)]);
    }
  }

  function grid_y_log() {
    // TODO: Prevent duplicate levels, is this even
    // a problem here ?
    self.$_mult = dollar_mult();
    self.ys = [];
    if (!sub.length) return;
    var v = Math.abs(sub[sub.length - 1][1] || 1);
    var y1 = search_start_pos(v);
    var y2 = search_start_neg(-v);
    var yp = -Infinity; // Previous y value

    var n = height / $p.config.GRIDY; // target grid N

    var q = 1 + (self.$_mult - 1) / 2; // Over 0

    for (var y$ = y1; y$ > 0; y$ /= self.$_mult) {
      y$ = log_rounder(y$, q);
      var y = Math.floor(math.log(y$) * self.A + self.B);
      self.ys.push([y, utils.strip(y$)]);
      if (y > height) break;
      if (y - yp < $p.config.GRIDY * 0.7) break;
      if (self.ys.length > n + 1) break;
      yp = y;
    } // Under 0


    yp = Infinity;

    for (var y$ = y2; y$ < 0; y$ /= self.$_mult) {
      y$ = log_rounder(y$, q);

      var _y = Math.floor(math.log(y$) * self.A + self.B);

      if (yp - _y < $p.config.GRIDY * 0.7) break;
      self.ys.push([_y, utils.strip(y$)]);
      if (_y < 0) break;
      if (self.ys.length > n * 3 + 1) break;
      yp = _y;
    } // TODO: remove lines near to 0

  } // Search a start for the top grid so that
  // the fixed value always included


  function search_start_pos(value) {
    var N = height / $p.config.GRIDY; // target grid N

    var y = Infinity,
        y$ = value,
        count = 0;

    while (y > 0) {
      y = Math.floor(math.log(y$) * self.A + self.B);
      y$ *= self.$_mult;
      if (count++ > N * 3) return 0; // Prevents deadloops
    }

    return y$;
  }

  function search_start_neg(value) {
    var N = height / $p.config.GRIDY; // target grid N

    var y = -Infinity,
        y$ = value,
        count = 0;

    while (y < height) {
      y = Math.floor(math.log(y$) * self.A + self.B);
      y$ *= self.$_mult;
      if (count++ > N * 3) break; // Prevents deadloops
    }

    return y$;
  } // Make log scale levels look great again


  function log_rounder(x, quality) {
    var s = Math.sign(x);
    x = Math.abs(x);

    if (x > 10) {
      for (var div = 10; div < MAX_INT; div *= 10) {
        var nice = Math.floor(x / div) * div;

        if (x / nice > quality) {
          // More than 10% off
          break;
        }
      }

      div /= 10;
      return s * Math.floor(x / div) * div;
    } else if (x < 1) {
      for (var ro = 10; ro >= 1; ro--) {
        var _nice = utils.round(x, ro);

        if (x / _nice > quality) {
          // More than 10% off
          break;
        }
      }

      return s * utils.round(x, ro + 1);
    } else {
      return s * Math.floor(x);
    }
  }

  function apply_sizes() {
    self.width = $p.width - self.sb;
    self.height = height;
  }

  calc_$range();
  calc_sidebar();
  return {
    // First we need to calculate max sidebar width
    // (among all grids). Then we can actually make
    // them
    create: function create() {
      calc_positions();
      grid_x();

      if (grid.logScale) {
        grid_y_log();
      } else {
        grid_y();
      }

      apply_sizes(); // Link to the master grid (candlesticks)

      if (master_grid) {
        self.master_grid = master_grid;
      }

      self.grid = grid; // Grid params
      // Here we add some helpful functions for
      // plugin creators

      return layout_fn(self, range);
    },
    get_layout: function get_layout() {
      return self;
    },
    set_sidebar: function set_sidebar(v) {
      return self.sb = v;
    },
    get_sidebar: function get_sidebar() {
      return self.sb;
    }
  };
}

/* harmony default export */ const grid_maker = (GridMaker);
;// CONCATENATED MODULE: ./src/components/js/layout.js



function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = layout_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function layout_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return layout_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return layout_arrayLikeToArray(o, minLen); }

function layout_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// Calculates all necessary s*it to build the chart
// Heights, widths, transforms, ... = everything
// Why such a mess you ask? Well, that's because
// one components size can depend on other component
// data formatting (e.g. grid width depends on sidebar precision)
// So it's better to calc all in one place.





function Layout(params) {
  var chart = params.chart,
      sub = params.sub,
      offsub = params.offsub,
      interval = params.interval,
      range = params.range,
      ctx = params.ctx,
      layers_meta = params.layers_meta,
      ti_map = params.ti_map,
      $p = params.$props,
      y_ts = params.y_transforms;
  var mgrid = chart.grid || {};
  offsub = offsub.filter(function (x, i) {
    // Skip offchart overlays with custom grid id,
    // because they will be mergred with the existing grids
    return !(x.grid && x.grid.id);
  }); // Splits space between main chart
  // and offchart indicator grids

  function grid_hs() {
    var height = $p.height - $p.config.BOTBAR; // When at least one height defined (default = 1),
    // Pxs calculated as: (sum of weights) / number

    if (mgrid.height || offsub.find(function (x) {
      return x.grid.height;
    })) {
      return weighted_hs(mgrid, height);
    }

    var n = offsub.length;
    var off_h = 2 * Math.sqrt(n) / 7 / (n || 1); // Offchart grid height

    var px = Math.floor(height * off_h); // Main grid height

    var m = height - px * n;
    return [m].concat(Array(n).fill(px));
  }

  function weighted_hs(grid, height) {
    var hs = [{
      grid: grid
    }].concat(_toConsumableArray(offsub)).map(function (x) {
      return x.grid.height || 1;
    });
    var sum = hs.reduce(function (a, b) {
      return a + b;
    }, 0);
    hs = hs.map(function (x) {
      return Math.floor(x / sum * height);
    }); // Refine the height if Math.floor decreased px sum

    sum = hs.reduce(function (a, b) {
      return a + b;
    }, 0);

    for (var i = 0; i < height - sum; i++) {
      hs[i % hs.length]++;
    }

    return hs;
  }

  function candles_n_vol() {
    self.candles = [];
    self.volume = [];
    var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
      return x[5];
    })));
    var vs = $p.config.VOLSCALE * $p.height / maxv;
    var x1,
        x2,
        mid,
        prev = undefined;
    var splitter = self.px_step > 5 ? 1 : 0;
    var hf_px_step = self.px_step * 0.5;

    for (var i = 0; i < sub.length; i++) {
      var p = sub[i];
      mid = self.t2screen(p[0]) + 0.5;
      self.candles.push(mgrid.logScale ? log_scale.candle(self, mid, p, $p) : {
        x: mid,
        w: self.px_step * $p.config.CANDLEW,
        o: Math.floor(p[1] * self.A + self.B),
        h: Math.floor(p[2] * self.A + self.B),
        l: Math.floor(p[3] * self.A + self.B),
        c: Math.floor(p[4] * self.A + self.B),
        raw: p
      }); // Clear volume bar if there is a time gap

      if (sub[i - 1] && p[0] - sub[i - 1][0] > interval) {
        prev = null;
      }

      x1 = prev || Math.floor(mid - hf_px_step);
      x2 = Math.floor(mid + hf_px_step) - 0.5;
      self.volume.push({
        x1: x1,
        x2: x2,
        h: p[5] * vs,
        green: p[4] >= p[1],
        raw: p
      });
      prev = x2 + splitter;
    }
  } // Main grid


  var hs = grid_hs();
  var specs = {
    sub: sub,
    interval: interval,
    range: range,
    ctx: ctx,
    $p: $p,
    layers_meta: layers_meta,
    ti_map: ti_map,
    height: hs[0],
    y_t: y_ts[0],
    grid: mgrid,
    timezone: $p.timezone
  };
  var gms = [new grid_maker(0, specs)]; // Sub grids

  var _iterator = _createForOfIteratorHelper(offsub.entries()),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
          i = _step$value[0],
          _step$value$ = _step$value[1],
          data = _step$value$.data,
          grid = _step$value$.grid;

      specs.sub = data;
      specs.height = hs[i + 1];
      specs.y_t = y_ts[i + 1];
      specs.grid = grid || {};
      gms.push(new grid_maker(i + 1, specs, gms[0].get_layout()));
    } // Max sidebar among all grinds

  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var sb = Math.max.apply(Math, _toConsumableArray(gms.map(function (x) {
    return x.get_sidebar();
  })));
  var grids = [],
      offset = 0;

  for (i = 0; i < gms.length; i++) {
    gms[i].set_sidebar(sb);
    grids.push(gms[i].create());
    grids[i].id = i;
    grids[i].offset = offset;
    offset += grids[i].height;
  }

  var self = grids[0];
  candles_n_vol();
  return {
    grids: grids,
    botbar: {
      width: $p.width,
      height: $p.config.BOTBAR,
      offset: offset,
      xs: grids[0] ? grids[0].xs : []
    }
  };
}

/* harmony default export */ const layout = (Layout);
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js
function classCallCheck_classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/createClass.js
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function createClass_createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}
;// CONCATENATED MODULE: ./src/components/js/updater.js




function updater_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = updater_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function updater_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return updater_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return updater_arrayLikeToArray(o, minLen); }

function updater_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// Cursor updater: calculates current values for
// OHLCV and all other indicators


var CursorUpdater = /*#__PURE__*/function () {
  function CursorUpdater(comp) {
    classCallCheck_classCallCheck(this, CursorUpdater);

    this.comp = comp, this.grids = comp._layout.grids, this.cursor = comp.cursor;
  }

  createClass_createClass(CursorUpdater, [{
    key: "sync",
    value: function sync(e) {
      // TODO: values not displaying if a custom grid id is set:
      // grid: { id: N }
      this.cursor.grid_id = e.grid_id;
      var once = true;

      var _iterator = updater_createForOfIteratorHelper(this.grids),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var grid = _step.value;
          var c = this.cursor_data(grid, e);

          if (!this.cursor.locked) {
            // TODO: find a better fix to invisible cursor prob
            if (once) {
              this.cursor.t = this.cursor_time(grid, e, c);
              if (this.cursor.t) once = false;
            }

            if (c.values) {
              this.comp.$set(this.cursor.values, grid.id, c.values);
            }
          }

          if (grid.id !== e.grid_id) continue;
          this.cursor.x = grid.t2screen(this.cursor.t);
          this.cursor.y = c.y;
          this.cursor.y$ = c.y$;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "overlay_data",
    value: function overlay_data(grid, e) {
      var s = grid.id === 0 ? 'main_section' : 'sub_section';
      var data = this.comp[s].data; // Split offchart data between offchart grids

      if (grid.id > 0) {
        // Sequential grids
        var _d = data.filter(function (x) {
          return x.grid.id === undefined;
        }); // grids with custom ids (for merging)


        var m = data.filter(function (x) {
          return x.grid.id === grid.id;
        });
        data = [_d[grid.id - 1]].concat(_toConsumableArray(m));
      }

      var t = grid.screen2t(e.x);
      var ids = {},
          res = {};

      var _iterator2 = updater_createForOfIteratorHelper(data),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var d = _step2.value;
          var ts = d.data.map(function (x) {
            return x[0];
          });
          var i = utils.nearest_a(t, ts)[0];
          d.type in ids ? ids[d.type]++ : ids[d.type] = 0;
          res["".concat(d.type, "_").concat(ids[d.type])] = d.data[i];
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return res;
    } // Nearest datapoints

  }, {
    key: "cursor_data",
    value: function cursor_data(grid, e) {
      var data = this.comp.main_section.sub;
      var xs = data.map(function (x) {
        return grid.t2screen(x[0]) + 0.5;
      });
      var i = utils.nearest_a(e.x, xs)[0];
      if (!xs[i]) return {};
      return {
        x: Math.floor(xs[i]) - 0.5,
        y: Math.floor(e.y - 2) - 0.5 - grid.offset,
        y$: grid.screen2$(e.y - 2 - grid.offset),
        t: (data[i] || [])[0],
        values: Object.assign({
          ohlcv: grid.id === 0 ? data[i] : undefined
        }, this.overlay_data(grid, e))
      };
    } // Get cursor t-position (extended)

  }, {
    key: "cursor_time",
    value: function cursor_time(grid, mouse, candle) {
      var t = grid.screen2t(mouse.x);
      var r = Math.abs((t - candle.t) / this.comp.interval);
      var sign = Math.sign(t - candle.t);

      if (r >= 0.5) {
        // Outside the data range
        var n = Math.round(r);
        return candle.t + n * this.comp.interval * sign;
      } // Inside the data range


      return candle.t;
    }
  }]);

  return CursorUpdater;
}();

/* harmony default export */ const updater = (CursorUpdater);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=template&id=8fbe9336&
var Sectionvue_type_template_id_8fbe9336_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "trading-vue-section" },
    [
      _c("chart-legend", {
        ref: "legend",
        attrs: {
          values: _vm.section_values,
          grid_id: _vm.grid_id,
          common: _vm.legend_props,
          meta_props: _vm.get_meta_props
        },
        on: { "legend-button-click": _vm.button_click }
      }),
      _vm._v(" "),
      _c(
        "grid",
        _vm._b(
          {
            ref: "grid",
            attrs: { grid_id: _vm.grid_id },
            on: {
              "register-kb-listener": _vm.register_kb,
              "remove-kb-listener": _vm.remove_kb,
              "range-changed": _vm.range_changed,
              "cursor-changed": _vm.cursor_changed,
              "cursor-locked": _vm.cursor_locked,
              "layer-meta-props": _vm.emit_meta_props,
              "custom-event": _vm.emit_custom_event,
              "sidebar-transform": _vm.sidebar_transform,
              "rezoom-range": _vm.rezoom_range
            }
          },
          "grid",
          _vm.grid_props,
          false
        )
      ),
      _vm._v(" "),
      _c(
        "sidebar",
        _vm._b(
          {
            ref: "sb-" + _vm.grid_id,
            attrs: { grid_id: _vm.grid_id, rerender: _vm.rerender },
            on: { "sidebar-transform": _vm.sidebar_transform }
          },
          "sidebar",
          _vm.sidebar_props,
          false
        )
      )
    ],
    1
  )
}
var Sectionvue_type_template_id_8fbe9336_staticRenderFns = []
Sectionvue_type_template_id_8fbe9336_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=template&id=8fbe9336&

;// CONCATENATED MODULE: ./src/stuff/frame.js


// Annimation frame with a fallback for
// slower devices


var FrameAnimation = /*#__PURE__*/function () {
  function FrameAnimation(cb) {
    var _this = this;

    classCallCheck_classCallCheck(this, FrameAnimation);

    this.t0 = this.t = utils.now();
    this.id = setInterval(function () {
      // The prev frame took too long
      if (utils.now() - _this.t > 100) return;

      if (utils.now() - _this.t0 > 1200) {
        _this.stop();
      }

      if (_this.id) cb(_this);
      _this.t = utils.now();
    }, 16);
  }

  createClass_createClass(FrameAnimation, [{
    key: "stop",
    value: function stop() {
      clearInterval(this.id);
      this.id = null;
    }
  }]);

  return FrameAnimation;
}();


// EXTERNAL MODULE: ./node_modules/hammerjs/hammer.js
var hammer = __webpack_require__(840);
// EXTERNAL MODULE: ./node_modules/hamsterjs/hamster.js
var hamster = __webpack_require__(8981);
var hamster_default = /*#__PURE__*/__webpack_require__.n(hamster);
;// CONCATENATED MODULE: ./src/components/js/grid.js





function grid_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = grid_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function grid_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return grid_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return grid_arrayLikeToArray(o, minLen); }

function grid_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// Grid.js listens to various user-generated events,
// emits Vue-events if something has changed (e.g. range)
// Think of it as an I/O system for Grid.vue




 // Grid is good.

var Grid = /*#__PURE__*/function () {
  function Grid(canvas, comp) {
    classCallCheck_classCallCheck(this, Grid);

    this.MIN_ZOOM = comp.config.MIN_ZOOM;
    this.MAX_ZOOM = comp.config.MAX_ZOOM;
    if (utils.is_mobile) this.MIN_ZOOM *= 0.5;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.id = this.$p.grid_id;
    this.layout = this.$p.layout.grids[this.id];
    this.interval = this.$p.interval;
    this.cursor = comp.$props.cursor;
    this.offset_x = 0;
    this.offset_y = 0;
    this.deltas = 0; // Wheel delta events

    this.wmode = this.$p.config.SCROLL_WHEEL;
    this.listeners();
    this.overlays = [];
  }

  createClass_createClass(Grid, [{
    key: "listeners",
    value: function listeners() {
      var _this = this;

      this.hm = hamster_default()(this.canvas);
      this.hm.wheel(function (event, delta) {
        return _this.mousezoom(-delta * 50, event);
      });
      var mc = this.mc = new hammer.Manager(this.canvas);
      var T = utils.is_mobile ? 10 : 0;
      mc.add(new hammer.Pan({
        threshold: T
      }));
      mc.add(new hammer.Tap());
      mc.add(new hammer.Pinch({
        threshold: 0
      }));
      mc.get('pinch').set({
        enable: true
      });
      if (utils.is_mobile) mc.add(new hammer.Press());
      mc.on('panstart', function (event) {
        if (_this.cursor.scroll_lock) return;

        if (_this.cursor.mode === 'aim') {
          return _this.emit_cursor_coord(event);
        }

        var tfrm = _this.$p.y_transform;
        _this.drug = {
          x: event.center.x + _this.offset_x,
          y: event.center.y + _this.offset_y,
          r: _this.range.slice(),
          t: _this.range[1] - _this.range[0],
          o: tfrm ? tfrm.offset || 0 : 0,
          y_r: tfrm && tfrm.range ? tfrm.range.slice() : undefined,
          B: _this.layout.B,
          t0: utils.now()
        };

        _this.comp.$emit('cursor-changed', {
          grid_id: _this.id,
          x: event.center.x + _this.offset_x,
          y: event.center.y + _this.offset_y
        });

        _this.comp.$emit('cursor-locked', true);
      });
      mc.on('panmove', function (event) {
        if (utils.is_mobile) {
          _this.calc_offset();

          _this.propagate('mousemove', _this.touch2mouse(event));
        }

        if (_this.drug) {
          _this.mousedrag(_this.drug.x + event.deltaX, _this.drug.y + event.deltaY);

          _this.comp.$emit('cursor-changed', {
            grid_id: _this.id,
            x: event.center.x + _this.offset_x,
            y: event.center.y + _this.offset_y
          });
        } else if (_this.cursor.mode === 'aim') {
          _this.emit_cursor_coord(event);
        }
      });
      mc.on('panend', function (event) {
        if (utils.is_mobile && _this.drug) {
          _this.pan_fade(event);
        }

        _this.drug = null;

        _this.comp.$emit('cursor-locked', false);
      });
      mc.on('tap', function (event) {
        if (!utils.is_mobile) return;

        _this.sim_mousedown(event);

        if (_this.fade) _this.fade.stop();

        _this.comp.$emit('cursor-changed', {});

        _this.comp.$emit('cursor-changed', {
          /*grid_id: this.id,
          x: undefined,//event.center.x + this.offset_x,
          y: undefined,//event.center.y + this.offset_y,*/
          mode: 'explore'
        });

        _this.update();
      });
      mc.on('pinchstart', function () {
        _this.drug = null;
        _this.pinch = {
          t: _this.range[1] - _this.range[0],
          r: _this.range.slice()
        };
      });
      mc.on('pinchend', function () {
        _this.pinch = null;
      });
      mc.on('pinch', function (event) {
        if (_this.pinch) _this.pinchzoom(event.scale);
      });
      mc.on('press', function (event) {
        if (!utils.is_mobile) return;
        if (_this.fade) _this.fade.stop();

        _this.calc_offset();

        _this.emit_cursor_coord(event, {
          mode: 'aim'
        });

        setTimeout(function () {
          return _this.update();
        });

        _this.sim_mousedown(event);
      });
      var add = addEventListener;
      add("gesturestart", this.gesturestart);
      add("gesturechange", this.gesturechange);
      add("gestureend", this.gestureend);
    }
  }, {
    key: "gesturestart",
    value: function gesturestart(event) {
      event.preventDefault();
    }
  }, {
    key: "gesturechange",
    value: function gesturechange(event) {
      event.preventDefault();
    }
  }, {
    key: "gestureend",
    value: function gestureend(event) {
      event.preventDefault();
    }
  }, {
    key: "mousemove",
    value: function mousemove(event) {
      if (utils.is_mobile) return;
      this.comp.$emit('cursor-changed', {
        grid_id: this.id,
        x: event.layerX,
        y: event.layerY + this.layout.offset
      });
      this.calc_offset();
      this.propagate('mousemove', event);
    }
  }, {
    key: "mouseout",
    value: function mouseout(event) {
      if (utils.is_mobile) return;
      this.comp.$emit('cursor-changed', {});
      this.propagate('mouseout', event);
    }
  }, {
    key: "mouseup",
    value: function mouseup(event) {
      this.drug = null;
      this.comp.$emit('cursor-locked', false);
      this.propagate('mouseup', event);
    }
  }, {
    key: "mousedown",
    value: function mousedown(event) {
      if (utils.is_mobile) return;
      this.propagate('mousedown', event);
      this.comp.$emit('cursor-locked', true);
      if (event.defaultPrevented) return;
      this.comp.$emit('custom-event', {
        event: 'grid-mousedown',
        args: [this.id, event]
      });
    } // Simulated mousedown (for mobile)

  }, {
    key: "sim_mousedown",
    value: function sim_mousedown(event) {
      var _this2 = this;

      if (event.srcEvent.defaultPrevented) return;
      this.comp.$emit('custom-event', {
        event: 'grid-mousedown',
        args: [this.id, event]
      });
      this.propagate('mousemove', this.touch2mouse(event));
      this.update();
      this.propagate('mousedown', this.touch2mouse(event));
      setTimeout(function () {
        _this2.propagate('click', _this2.touch2mouse(event));
      });
    } // Convert touch to "mouse" event

  }, {
    key: "touch2mouse",
    value: function touch2mouse(e) {
      this.calc_offset();
      return {
        original: e.srcEvent,
        layerX: e.center.x + this.offset_x,
        layerY: e.center.y + this.offset_y,
        preventDefault: function preventDefault() {
          this.original.preventDefault();
        }
      };
    }
  }, {
    key: "click",
    value: function click(event) {
      this.propagate('click', event);
    }
  }, {
    key: "emit_cursor_coord",
    value: function emit_cursor_coord(event, add) {
      if (add === void 0) {
        add = {};
      }

      this.comp.$emit('cursor-changed', Object.assign({
        grid_id: this.id,
        x: event.center.x + this.offset_x,
        y: event.center.y + this.offset_y + this.layout.offset
      }, add));
    }
  }, {
    key: "pan_fade",
    value: function pan_fade(event) {
      var _this3 = this;

      var dt = utils.now() - this.drug.t0;
      var dx = this.range[1] - this.drug.r[1];
      var v = 42 * dx / dt;
      var v0 = Math.abs(v * 0.01);
      if (dt > 500) return;
      if (this.fade) this.fade.stop();
      this.fade = new FrameAnimation(function (self) {
        v *= 0.85;

        if (Math.abs(v) < v0) {
          self.stop();
        }

        _this3.range[0] += v;
        _this3.range[1] += v;

        _this3.change_range();
      });
    }
  }, {
    key: "calc_offset",
    value: function calc_offset() {
      var rect = this.canvas.getBoundingClientRect();
      this.offset_x = -rect.x;
      this.offset_y = -rect.y;
    }
  }, {
    key: "new_layer",
    value: function new_layer(layer) {
      if (layer.name === 'crosshair') {
        this.crosshair = layer;
      } else {
        this.overlays.push(layer);
      }

      this.update();
    }
  }, {
    key: "del_layer",
    value: function del_layer(id) {
      this.overlays = this.overlays.filter(function (x) {
        return x.id !== id;
      });
      this.update();
    }
  }, {
    key: "show_hide_layer",
    value: function show_hide_layer(event) {
      var l = this.overlays.filter(function (x) {
        return x.id === event.id;
      });
      if (l.length) l[0].display = event.display;
    }
  }, {
    key: "update",
    value: function update() {
      var _this4 = this;

      // Update reference to the grid
      // TODO: check what happens if data changes interval
      this.layout = this.$p.layout.grids[this.id];
      this.interval = this.$p.interval;
      if (!this.layout) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.$p.shaders.length) this.apply_shaders();
      this.grid();
      var overlays = [];
      overlays.push.apply(overlays, _toConsumableArray(this.overlays)); // z-index sorting

      overlays.sort(function (l1, l2) {
        return l1.z - l2.z;
      });
      overlays.forEach(function (l) {
        if (!l.display) return;

        _this4.ctx.save();

        var r = l.renderer;
        if (r.pre_draw) r.pre_draw(_this4.ctx);
        r.draw(_this4.ctx);
        if (r.post_draw) r.post_draw(_this4.ctx);

        _this4.ctx.restore();
      });

      if (this.crosshair) {
        this.crosshair.renderer.draw(this.ctx);
      }
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      var layout = this.$p.layout.grids[this.id];
      var props = {
        layout: layout,
        range: this.range,
        interval: this.interval,
        tf: layout.ti_map.tf,
        cursor: this.cursor,
        colors: this.$p.colors,
        sub: this.data,
        font: this.$p.font,
        config: this.$p.config,
        meta: this.$p.meta
      };

      var _iterator = grid_createForOfIteratorHelper(this.$p.shaders),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var s = _step.value;
          this.ctx.save();
          s.draw(this.ctx, props);
          this.ctx.restore();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    } // Actually draws the grid (for real)

  }, {
    key: "grid",
    value: function grid() {
      this.ctx.strokeStyle = this.$p.colors.grid;
      this.ctx.beginPath();
      var ymax = this.layout.height;

      var _iterator2 = grid_createForOfIteratorHelper(this.layout.xs),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
              x = _step2$value[0],
              p = _step2$value[1];

          this.ctx.moveTo(x - 0.5, 0);
          this.ctx.lineTo(x - 0.5, ymax);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var _iterator3 = grid_createForOfIteratorHelper(this.layout.ys),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _step3$value = _slicedToArray(_step3.value, 2),
              y = _step3$value[0],
              y$ = _step3$value[1];

          this.ctx.moveTo(0, y - 0.5);
          this.ctx.lineTo(this.layout.width, y - 0.5);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      this.ctx.stroke();
      if (this.$p.grid_id) this.upper_border();
    }
  }, {
    key: "upper_border",
    value: function upper_border() {
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(this.layout.width, 0.5);
      this.ctx.stroke();
    }
  }, {
    key: "mousezoom",
    value: function mousezoom(delta, event) {
      // TODO: for mobile
      if (this.wmode !== 'pass') {
        if (this.wmode === 'click' && !this.$p.meta.activated) {
          return;
        }

        event.originalEvent.preventDefault();
        event.preventDefault();
      }

      event.deltaX = event.deltaX || utils.get_deltaX(event);
      event.deltaY = event.deltaY || utils.get_deltaY(event);

      if (Math.abs(event.deltaX) > 0) {
        this.trackpad = true;

        if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
          delta *= 0.1;
        }

        this.trackpad_scroll(event);
      }

      if (this.trackpad) delta *= 0.032;
      delta = utils.smart_wheel(delta); // TODO: mouse zooming is a little jerky,
      // needs to follow f(mouse_wheel_speed) and
      // if speed is low, scroll shoud be slower

      if (delta < 0 && this.data.length <= this.MIN_ZOOM) return;
      if (delta > 0 && this.data.length > this.MAX_ZOOM) return;
      var k = this.interval / 1000;
      var diff = delta * k * this.data.length;
      var tl = this.comp.config.ZOOM_MODE === 'tl';

      if (event.originalEvent.ctrlKey || tl) {
        var offset = event.originalEvent.offsetX;
        var diff1 = offset / (this.canvas.width - 1) * diff;
        var diff2 = diff - diff1;
        this.range[0] -= diff1;
        this.range[1] += diff2;
      } else {
        this.range[0] -= diff;
      }

      if (tl) {
        var _offset = event.originalEvent.offsetY;

        var _diff = _offset / (this.canvas.height - 1) * 2;

        var _diff2 = 2 - _diff;

        var z = diff / (this.range[1] - this.range[0]); //rezoom_range(z, diff_x, diff_y)

        this.comp.$emit('rezoom-range', {
          grid_id: this.id,
          z: z,
          diff1: _diff,
          diff2: _diff2
        });
      }

      this.change_range();
    }
  }, {
    key: "mousedrag",
    value: function mousedrag(x, y) {
      var dt = this.drug.t * (this.drug.x - x) / this.layout.width;
      var d$ = this.layout.$_hi - this.layout.$_lo;
      d$ *= (this.drug.y - y) / this.layout.height;
      var offset = this.drug.o + d$;
      var ls = this.layout.grid.logScale;

      if (ls && this.drug.y_r) {
        var dy = this.drug.y - y;
        var range = this.drug.y_r.slice();
        range[0] = math.exp((0 - this.drug.B + dy) / this.layout.A);
        range[1] = math.exp((this.layout.height - this.drug.B + dy) / this.layout.A);
      }

      if (this.drug.y_r && this.$p.y_transform && !this.$p.y_transform.auto) {
        this.comp.$emit('sidebar-transform', {
          grid_id: this.id,
          range: ls ? range || this.drug.y_r : [this.drug.y_r[0] - offset, this.drug.y_r[1] - offset]
        });
      }

      this.range[0] = this.drug.r[0] + dt;
      this.range[1] = this.drug.r[1] + dt;
      this.change_range();
    }
  }, {
    key: "pinchzoom",
    value: function pinchzoom(scale) {
      if (scale > 1 && this.data.length <= this.MIN_ZOOM) return;
      if (scale < 1 && this.data.length > this.MAX_ZOOM) return;
      var t = this.pinch.t;
      var nt = t * 1 / scale;
      this.range[0] = this.pinch.r[0] - (nt - t) * 0.5;
      this.range[1] = this.pinch.r[1] + (nt - t) * 0.5;
      this.change_range();
    }
  }, {
    key: "trackpad_scroll",
    value: function trackpad_scroll(event) {
      var dt = this.range[1] - this.range[0];
      this.range[0] += event.deltaX * dt * 0.011;
      this.range[1] += event.deltaX * dt * 0.011;
      this.change_range();
    }
  }, {
    key: "change_range",
    value: function change_range() {
      // TODO: better way to limit the view. Problem:
      // when you are at the dead end of the data,
      // and keep scrolling,
      // the chart continues to scale down a little.
      // Solution: I don't know yet
      if (!this.range.length || this.data.length < 2) return;
      var l = this.data.length - 1;
      var data = this.data;
      var range = this.range;
      range[0] = utils.clamp(range[0], -Infinity, data[l][0] - this.interval * 5.5);
      range[1] = utils.clamp(range[1], data[0][0] + this.interval * 5.5, Infinity); // TODO: IMPORTANT scrolling is jerky The Problem caused
      // by the long round trip of 'range-changed' event.
      // First it propagates up to update layout in Chart.vue,
      // then it moves back as watch() update. It takes 1-5 ms.
      // And because the delay is different each time we see
      // the lag. No smooth movement and it's annoying.
      // Solution: we could try to calc the layout immediatly
      // somewhere here. Still will hurt the sidebar & bottombar

      this.comp.$emit('range-changed', range);
    } // Propagate mouse event to overlays

  }, {
    key: "propagate",
    value: function propagate(name, event) {
      var _iterator4 = grid_createForOfIteratorHelper(this.overlays),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var layer = _step4.value;

          if (layer.renderer[name]) {
            layer.renderer[name](event);
          }

          var mouse = layer.renderer.mouse;
          var keys = layer.renderer.keys;

          if (mouse.listeners) {
            mouse.emit(name, event);
          }

          if (keys && keys.listeners) {
            keys.emit(name, event);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var rm = removeEventListener;
      rm("gesturestart", this.gesturestart);
      rm("gesturechange", this.gesturechange);
      rm("gestureend", this.gestureend);
      if (this.mc) this.mc.destroy();
      if (this.hm) this.hm.unwheel();
    }
  }]);

  return Grid;
}();


;// CONCATENATED MODULE: ./src/mixins/canvas.js
// Interactive canvas-based component
// Should implement: mousemove, mouseout, mouseup, mousedown, click

/* harmony default export */ const canvas = ({
  methods: {
    setup: function setup() {
      var _this = this;

      var id = "".concat(this.$props.tv_id, "-").concat(this._id, "-canvas");
      var canvas = document.getElementById(id);
      var dpr = window.devicePixelRatio || 1;
      canvas.style.width = "".concat(this._attrs.width, "px");
      canvas.style.height = "".concat(this._attrs.height, "px");
      if (dpr < 1) dpr = 1; // Realy ? That's it? Issue #63

      this.$nextTick(function () {
        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        var ctx = canvas.getContext('2d', {// TODO: test the boost:
          //alpha: false,
          //desynchronized: true,
          //preserveDrawingBuffer: false
        });
        ctx.scale(dpr, dpr);

        _this.redraw(); // Fallback fix for Brave browser
        // https://github.com/brave/brave-browser/issues/1738


        if (!ctx.measureTextOrg) {
          ctx.measureTextOrg = ctx.measureText;
        }

        ctx.measureText = function (text) {
          return utils.measureText(ctx, text, _this.$props.tv_id);
        };
      });
    },
    create_canvas: function create_canvas(h, id, props) {
      var _this2 = this;

      this._id = id;
      this._attrs = props.attrs;
      return h('div', {
        "class": "trading-vue-".concat(id),
        style: {
          left: props.position.x + 'px',
          top: props.position.y + 'px',
          position: 'absolute'
        }
      }, [h('canvas', {
        on: {
          mousemove: function mousemove(e) {
            return _this2.renderer.mousemove(e);
          },
          mouseout: function mouseout(e) {
            return _this2.renderer.mouseout(e);
          },
          mouseup: function mouseup(e) {
            return _this2.renderer.mouseup(e);
          },
          mousedown: function mousedown(e) {
            return _this2.renderer.mousedown(e);
          }
        },
        attrs: Object.assign({
          id: "".concat(this.$props.tv_id, "-").concat(id, "-canvas")
        }, props.attrs),
        ref: 'canvas',
        style: props.style
      })].concat(props.hs || []));
    },
    redraw: function redraw() {
      if (!this.renderer) return;
      this.renderer.update();
    }
  },
  watch: {
    width: function width(val) {
      this._attrs.width = val;
      this.setup();
    },
    height: function height(val) {
      this._attrs.height = val;
      this.setup();
    }
  }
});
;// CONCATENATED MODULE: ./src/mixins/uxlist.js
// Manager for Inteerface objects
/* harmony default export */ const uxlist = ({
  methods: {
    on_ux_event: function on_ux_event(d, target) {
      if (d.event === 'new-interface') {
        if (d.args[0].target === target) {
          d.args[0].vars = d.args[0].vars || {};
          d.args[0].grid_id = d.args[1];
          d.args[0].overlay_id = d.args[2];
          this.uxs.push(d.args[0]); // this.rerender++
        }
      } else if (d.event === 'close-interface') {
        this.uxs = this.uxs.filter(function (x) {
          return x.uuid !== d.args[0];
        });
      } else if (d.event === 'modify-interface') {
        var ux = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });

        if (ux.length) {
          this.modify(ux[0], d.args[1]);
        }
      } else if (d.event === 'hide-interface') {
        var _ux = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });

        if (_ux.length) {
          _ux[0].hidden = true;
          this.modify(_ux[0], {
            hidden: true
          });
        }
      } else if (d.event === 'show-interface') {
        var _ux2 = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });

        if (_ux2.length) {
          this.modify(_ux2[0], {
            hidden: false
          });
        }
      } else {
        return d;
      }
    },
    modify: function modify(ux, obj) {
      if (obj === void 0) {
        obj = {};
      }

      for (var k in obj) {
        if (k in ux) {
          this.$set(ux, k, obj[k]);
        }
      }
    },
    // Remove all UXs for a given overlay id
    remove_all_ux: function remove_all_ux(id) {
      this.uxs = this.uxs.filter(function (x) {
        return x.overlay.id !== id;
      });
    }
  },
  data: function data() {
    return {
      uxs: []
    };
  }
});
;// CONCATENATED MODULE: ./src/components/js/crosshair.js



var Crosshair = /*#__PURE__*/function () {
  function Crosshair(comp) {
    classCallCheck_classCallCheck(this, Crosshair);

    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this._visible = false;
    this.locked = false;
    this.layout = this.$p.layout;
  }

  createClass_createClass(Crosshair, [{
    key: "draw",
    value: function draw(ctx) {
      // Update reference to the grid
      this.layout = this.$p.layout;
      var cursor = this.comp.$props.cursor;
      if (!this.visible && cursor.mode === 'explore') return;
      this.x = this.$p.cursor.x;
      this.y = this.$p.cursor.y;
      ctx.save();
      ctx.strokeStyle = this.$p.colors.cross;
      ctx.beginPath();
      ctx.setLineDash([5]); // H

      if (this.$p.cursor.grid_id === this.layout.id) {
        ctx.moveTo(0, this.y);
        ctx.lineTo(this.layout.width - 0.5, this.y);
      } // V


      ctx.moveTo(this.x, 0);
      ctx.lineTo(this.x, this.layout.height);
      ctx.stroke();
      ctx.restore();
    }
  }, {
    key: "hide",
    value: function hide() {
      this.visible = false;
      this.x = undefined;
      this.y = undefined;
    }
  }, {
    key: "visible",
    get: function get() {
      return this._visible;
    },
    set: function set(val) {
      this._visible = val;
    }
  }]);

  return Crosshair;
}();


;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Crosshair.vue?vue&type=script&lang=js&


/* harmony default export */ const Crosshairvue_type_script_lang_js_ = ({
  name: 'Crosshair',
  props: ['cursor', 'colors', 'layout', 'sub'],
  methods: {
    create: function create() {
      this.ch = new Crosshair(this); // New grid overlay-renderer descriptor.
      // Should implement draw() (see Spline.vue)

      this.$emit('new-grid-layer', {
        name: 'crosshair',
        renderer: this.ch
      });
    }
  },
  watch: {
    cursor: {
      handler: function handler() {
        if (!this.ch) this.create(); // Explore = default mode on mobile

        var cursor = this.$props.cursor;
        var explore = cursor.mode === 'explore';

        if (!cursor.x || !cursor.y) {
          this.ch.hide();
          this.$emit('redraw-grid');
          return;
        }

        this.ch.visible = !explore;
      },
      deep: true
    }
  },
  render: function render(h) {
    return h();
  }
});
;// CONCATENATED MODULE: ./src/components/Crosshair.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Crosshairvue_type_script_lang_js_ = (Crosshairvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
        injectStyles.call(
          this,
          (options.functional ? this.parent : this).$root.$options.shadowRoot
        )
      }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}

;// CONCATENATED MODULE: ./src/components/Crosshair.vue
var Crosshair_render, Crosshair_staticRenderFns
;



/* normalize component */
;
var component = normalizeComponent(
  components_Crosshairvue_type_script_lang_js_,
  Crosshair_render,
  Crosshair_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/components/Crosshair.vue"
/* harmony default export */ const components_Crosshair = (component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/KeyboardListener.vue?vue&type=script&lang=js&
//
//
//
//
/* harmony default export */ const KeyboardListenervue_type_script_lang_js_ = ({
  name: 'KeyboardListener',
  render: function render(h) {
    return h();
  },
  created: function created() {
    this.$emit('register-kb-listener', {
      id: this._uid,
      keydown: this.keydown,
      keyup: this.keyup,
      keypress: this.keypress
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.$emit('remove-kb-listener', {
      id: this._uid
    });
  },
  methods: {
    keydown: function keydown(event) {
      this.$emit('keydown', event);
    },
    keyup: function keyup(event) {
      this.$emit('keyup', event);
    },
    keypress: function keypress(event) {
      this.$emit('keypress', event);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/KeyboardListener.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_KeyboardListenervue_type_script_lang_js_ = (KeyboardListenervue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/KeyboardListener.vue
var KeyboardListener_render, KeyboardListener_staticRenderFns
;



/* normalize component */
;
var KeyboardListener_component = normalizeComponent(
  components_KeyboardListenervue_type_script_lang_js_,
  KeyboardListener_render,
  KeyboardListener_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var KeyboardListener_api; }
KeyboardListener_component.options.__file = "src/components/KeyboardListener.vue"
/* harmony default export */ const KeyboardListener = (KeyboardListener_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxLayer.vue?vue&type=template&id=390ccf6e&
var UxLayervue_type_template_id_390ccf6e_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "span",
    { class: "trading-vue-grid-ux-" + _vm.id, style: _vm.style },
    _vm._l(_vm.uxs, function(ux) {
      return _c("ux-wrapper", {
        key: ux.uuid,
        attrs: {
          ux: ux,
          updater: _vm.updater,
          colors: _vm.colors,
          config: _vm.config
        },
        on: { "custom-event": _vm.on_custom_event }
      })
    }),
    1
  )
}
var UxLayervue_type_template_id_390ccf6e_staticRenderFns = []
UxLayervue_type_template_id_390ccf6e_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/UxLayer.vue?vue&type=template&id=390ccf6e&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=template&id=4bc32070&
var UxWrappervue_type_template_id_4bc32070_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm.visible
    ? _c(
        "div",
        {
          staticClass: "trading-vue-ux-wrapper",
          style: _vm.style,
          attrs: { id: "tvjs-ux-wrapper-" + _vm.ux.uuid }
        },
        [
          _c(_vm.ux.component, {
            tag: "component",
            attrs: {
              ux: _vm.ux,
              updater: _vm.updater,
              wrapper: _vm.wrapper,
              colors: _vm.colors
            },
            on: { "custom-event": _vm.on_custom_event }
          }),
          _vm._v(" "),
          _vm.ux.show_pin
            ? _c("div", {
                staticClass: "tvjs-ux-wrapper-pin",
                style: _vm.pin_style
              })
            : _vm._e(),
          _vm._v(" "),
          _vm.ux.win_header !== false
            ? _c("div", { staticClass: "tvjs-ux-wrapper-head" }, [
                _c(
                  "div",
                  {
                    staticClass: "tvjs-ux-wrapper-close",
                    style: _vm.btn_style,
                    on: { click: _vm.close }
                  },
                  [_vm._v("×")]
                )
              ])
            : _vm._e()
        ],
        1
      )
    : _vm._e()
}
var UxWrappervue_type_template_id_4bc32070_staticRenderFns = []
UxWrappervue_type_template_id_4bc32070_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=template&id=4bc32070&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ const UxWrappervue_type_script_lang_js_ = ({
  name: 'UxWrapper',
  props: ['ux', 'updater', 'colors', 'config'],
  mounted: function mounted() {
    this.self = document.getElementById(this.uuid);
    this.w = this.self.offsetWidth; // TODO: => width: "content"

    this.h = this.self.offsetHeight; // TODO: => height: "content"

    this.update_position();
  },
  created: function created() {
    this.mouse.on('mousemove', this.mousemove);
    this.mouse.on('mouseout', this.mouseout);
  },
  beforeDestroy: function beforeDestroy() {
    this.mouse.off('mousemove', this.mousemove);
    this.mouse.off('mouseout', this.mouseout);
  },
  methods: {
    update_position: function update_position() {
      if (this.uxr.hidden) return;
      var lw = this.layout.width;
      var lh = this.layout.height;
      var pin = this.uxr.pin;

      switch (pin[0]) {
        case 'cursor':
          var x = this.uxr.overlay.cursor.x;
          break;

        case 'mouse':
          x = this.mouse.x;
          break;

        default:
          if (typeof pin[0] === 'string') {
            x = this.parse_coord(pin[0], lw);
          } else {
            x = this.layout.t2screen(pin[0]);
          }

      }

      switch (pin[1]) {
        case 'cursor':
          var y = this.uxr.overlay.cursor.y;
          break;

        case 'mouse':
          y = this.mouse.y;
          break;

        default:
          if (typeof pin[1] === 'string') {
            y = this.parse_coord(pin[1], lh);
          } else {
            y = this.layout.$2screen(pin[1]);
          }

      }

      this.x = x + this.ox;
      this.y = y + this.oy;
    },
    parse_coord: function parse_coord(str, scale) {
      str = str.trim();
      if (str === '0' || str === '') return 0;
      var plus = str.split('+');

      if (plus.length === 2) {
        return this.parse_coord(plus[0], scale) + this.parse_coord(plus[1], scale);
      }

      var minus = str.split('-');

      if (minus.length === 2) {
        return this.parse_coord(minus[0], scale) - this.parse_coord(minus[1], scale);
      }

      var per = str.split('%');

      if (per.length === 2) {
        return scale * parseInt(per[0]) / 100;
      }

      var px = str.split('px');

      if (px.length === 2) {
        return parseInt(px[0]);
      }

      return undefined;
    },
    mousemove: function mousemove() {
      this.update_position();
      this.visible = true;
    },
    mouseout: function mouseout() {
      if (this.uxr.pin.includes('cursor') || this.uxr.pin.includes('mouse')) this.visible = false;
    },
    on_custom_event: function on_custom_event(event) {
      this.$emit('custom-event', event);

      if (event.event === 'modify-interface') {
        if (this.self) {
          this.w = this.self.offsetWidth;
          this.h = this.self.offsetHeight;
        }

        this.update_position();
      }
    },
    close: function close() {
      this.$emit('custom-event', {
        event: 'close-interface',
        args: [this.$props.ux.uuid]
      });
    }
  },
  computed: {
    uxr: function uxr() {
      return this.$props.ux; // just a ref
    },
    layout: function layout() {
      return this.$props.ux.overlay.layout;
    },
    settings: function settings() {
      return this.$props.ux.overlay.settings;
    },
    uuid: function uuid() {
      return "tvjs-ux-wrapper-".concat(this.uxr.uuid);
    },
    mouse: function mouse() {
      return this.uxr.overlay.mouse;
    },
    style: function style() {
      var st = {
        'display': this.uxr.hidden ? 'none' : undefined,
        'left': "".concat(this.x, "px"),
        'top': "".concat(this.y, "px"),
        'pointer-events': this.uxr.pointer_events || 'all',
        'z-index': this.z_index
      };
      if (this.uxr.win_styling !== false) st = Object.assign(st, {
        'border': "1px solid ".concat(this.$props.colors.grid),
        'border-radius': '3px',
        'background': "".concat(this.background)
      });
      return st;
    },
    pin_style: function pin_style() {
      return {
        'left': "".concat(-this.ox, "px"),
        'top': "".concat(-this.oy, "px"),
        'background-color': this.uxr.pin_color
      };
    },
    btn_style: function btn_style() {
      return {
        'background': "".concat(this.inactive_btn_color),
        'color': "".concat(this.inactive_btn_color)
      };
    },
    pin_pos: function pin_pos() {
      return this.uxr.pin_position ? this.uxr.pin_position.split(',') : ['0', '0'];
    },
    // Offset x
    ox: function ox() {
      if (this.pin_pos.length !== 2) return undefined;
      var x = this.parse_coord(this.pin_pos[0], this.w);
      return -x;
    },
    // Offset y
    oy: function oy() {
      if (this.pin_pos.length !== 2) return undefined;
      var y = this.parse_coord(this.pin_pos[1], this.h);
      return -y;
    },
    z_index: function z_index() {
      var base_index = this.settings['z-index'] || this.settings['zIndex'] || 0;
      var ux_index = this.uxr['z_index'] || 0;
      return base_index + ux_index;
    },
    background: function background() {
      var c = this.uxr.background || this.$props.colors.back;
      return utils.apply_opacity(c, this.uxr.background_opacity || this.$props.config.UX_OPACITY);
    },
    inactive_btn_color: function inactive_btn_color() {
      return this.uxr.inactive_btn_color || this.$props.colors.grid;
    },
    wrapper: function wrapper() {
      return {
        x: this.x,
        y: this.y,
        pin_x: this.x - this.ox,
        pin_y: this.y - this.oy
      };
    }
  },
  watch: {
    updater: function updater() {
      this.update_position();
    }
  },
  data: function data() {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      visible: true
    };
  }
});
;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_UxWrappervue_type_script_lang_js_ = (UxWrappervue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=style&index=0&lang=css&
var UxWrappervue_type_style_index_0_lang_css_ = __webpack_require__(565);
;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/UxWrapper.vue



;


/* normalize component */

var UxWrapper_component = normalizeComponent(
  components_UxWrappervue_type_script_lang_js_,
  UxWrappervue_type_template_id_4bc32070_render,
  UxWrappervue_type_template_id_4bc32070_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var UxWrapper_api; }
UxWrapper_component.options.__file = "src/components/UxWrapper.vue"
/* harmony default export */ const UxWrapper = (UxWrapper_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxLayer.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ const UxLayervue_type_script_lang_js_ = ({
  name: 'UxLayer',
  props: ['tv_id', 'id', 'uxs', 'updater', 'colors', 'config'],
  components: {
    UxWrapper: UxWrapper
  },
  created: function created() {},
  mounted: function mounted() {},
  beforeDestroy: function beforeDestroy() {},
  methods: {
    on_custom_event: function on_custom_event(event) {
      this.$emit('custom-event', event);
    }
  },
  computed: {
    style: function style() {
      return {
        'top': this.$props.id !== 0 ? '1px' : 0,
        'left': 0,
        'width': '100%',
        'height': 'calc(100% - 2px)',
        'position': 'absolute',
        'z-index': '1',
        'pointer-events': 'none',
        'overflow': 'hidden'
      };
    }
  }
});
;// CONCATENATED MODULE: ./src/components/UxLayer.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_UxLayervue_type_script_lang_js_ = (UxLayervue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/UxLayer.vue





/* normalize component */
;
var UxLayer_component = normalizeComponent(
  components_UxLayervue_type_script_lang_js_,
  UxLayervue_type_template_id_390ccf6e_render,
  UxLayervue_type_template_id_390ccf6e_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var UxLayer_api; }
UxLayer_component.options.__file = "src/components/UxLayer.vue"
/* harmony default export */ const UxLayer = (UxLayer_component.exports);
;// CONCATENATED MODULE: ./src/stuff/mouse.js



function mouse_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = mouse_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function mouse_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return mouse_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return mouse_arrayLikeToArray(o, minLen); }

function mouse_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// Mouse event handler for overlay
var Mouse = /*#__PURE__*/function () {
  function Mouse(comp) {
    classCallCheck_classCallCheck(this, Mouse);

    this.comp = comp;
    this.map = {};
    this.listeners = 0;
    this.pressed = false;
    this.x = comp.$props.cursor.x;
    this.y = comp.$props.cursor.y;
    this.t = comp.$props.cursor.t;
    this.y$ = comp.$props.cursor.y$;
  } // You can choose where to place the handler
  // (beginning or end of the queue)


  createClass_createClass(Mouse, [{
    key: "on",
    value: function on(name, handler, dir) {
      if (dir === void 0) {
        dir = "unshift";
      }

      if (!handler) return;
      this.map[name] = this.map[name] || [];
      this.map[name][dir](handler);
      this.listeners++;
    }
  }, {
    key: "off",
    value: function off(name, handler) {
      if (!this.map[name]) return;
      var i = this.map[name].indexOf(handler);
      if (i < 0) return;
      this.map[name].splice(i, 1);
      this.listeners--;
    } // Called by grid.js

  }, {
    key: "emit",
    value: function emit(name, event) {
      var l = this.comp.layout;

      if (name in this.map) {
        var _iterator = mouse_createForOfIteratorHelper(this.map[name]),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var f = _step.value;
            f(event);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      if (name === 'mousemove') {
        this.x = event.layerX;
        this.y = event.layerY;
        this.t = l.screen2t(this.x);
        this.y$ = l.screen2$(this.y);
      }

      if (name === 'mousedown') {
        this.pressed = true;
      }

      if (name === 'mouseup') {
        this.pressed = false;
      }
    }
  }]);

  return Mouse;
}();


;// CONCATENATED MODULE: ./src/mixins/overlay.js
// Usuful stuff for creating overlays. Include as mixin

/* harmony default export */ const overlay = ({
  props: ['id', 'num', 'interval', 'cursor', 'colors', 'layout', 'sub', 'data', 'settings', 'grid_id', 'font', 'config', 'meta', 'tf', 'i0', 'last'],
  mounted: function mounted() {
    // TODO(1): when hot reloading, dynamicaly changed mixins
    // dissapear (cuz it's a hack), the only way for now
    // is to reload the browser
    if (!this.draw) {
      this.draw = function (ctx) {
        var text = 'EARLY ADOPTER BUG: reload the browser & enjoy';
        console.warn(text);
      };
    } // Main chart?


    var main = this.$props.sub === this.$props.data;
    this.meta_info(); // TODO(1): quick fix for vue2, in vue3 we use 3rd party emit

    try {
      new Function('return ' + this.$emit)();
      this._$emit = this.$emit;
      this.$emit = this.custom_event;
    } catch (e) {
      return;
    }

    this._$emit('new-grid-layer', {
      name: this.$options.name,
      id: this.$props.id,
      renderer: this,
      display: 'display' in this.$props.settings ? this.$props.settings['display'] : true,
      z: this.$props.settings['z-index'] || this.$props.settings['zIndex'] || (main ? 0 : -1)
    }); // Overlay meta-props (adjusting behaviour)


    this._$emit('layer-meta-props', {
      grid_id: this.$props.grid_id,
      layer_id: this.$props.id,
      legend: this.legend,
      data_colors: this.data_colors,
      y_range: this.y_range
    });

    this.exec_script();
    this.mouse = new Mouse(this);
    if (this.init_tool) this.init_tool();
    if (this.init) this.init();
  },
  beforeDestroy: function beforeDestroy() {
    if (this.destroy) this.destroy();

    this._$emit('delete-grid-layer', this.$props.id);
  },
  methods: {
    use_for: function use_for() {
      /* override it (mandatory) */
      console.warn('use_for() should be implemented');
      console.warn("Format: use_for() {\n                  return ['type1', 'type2', ...]\n            }");
    },
    meta_info: function meta_info() {
      /* override it (optional) */
      var id = this.$props.id;
      console.warn("".concat(id, " meta_info() is req. for publishing"));
      console.warn("Format: meta_info() {\n                author: 'Satoshi Smith',\n                version: '1.0.0',\n                contact (opt) '<email>'\n                github: (opt) '<GitHub Page>',\n            }");
    },
    custom_event: function custom_event(event) {
      if (event.split(':')[0] === 'hook') return;

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (event === 'change-settings' || event === 'object-selected' || event === 'new-shader' || event === 'new-interface' || event === 'remove-tool') {
        args.push(this.grid_id, this.id);

        if (this.$props.settings.$uuid) {
          args.push(this.$props.settings.$uuid);
        }
      }

      if (event === 'new-interface') {
        args[0].overlay = this;
        args[0].uuid = this.last_ux_id = "".concat(this.grid_id, "-").concat(this.id, "-").concat(this.uxs_count++);
      } // TODO: add a namespace to the event name
      // TODO(2): this prevents call overflow, but
      // the root of evil is in (1)


      if (event === 'custom-event') return;

      this._$emit('custom-event', {
        event: event,
        args: args
      });
    },
    // TODO: the event is not firing when the same
    // overlay type is added to the offchart[]
    exec_script: function exec_script() {
      if (this.calc) this.$emit('exec-script', {
        grid_id: this.$props.grid_id,
        layer_id: this.$props.id,
        src: this.calc(),
        use_for: this.use_for()
      });
    }
  },
  watch: {
    settings: {
      handler: function handler(n, p) {
        if (this.watch_uuid) this.watch_uuid(n, p);

        this._$emit('show-grid-layer', {
          id: this.$props.id,
          display: 'display' in this.$props.settings ? this.$props.settings['display'] : true
        });
      },
      deep: true
    }
  },
  data: function data() {
    return {
      uxs_count: 0,
      last_ux_id: null
    };
  },
  render: function render(h) {
    return h();
  }
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Spline.vue?vue&type=script&lang=js&
// Spline renderer. (SMAs, EMAs, TEMAs...
// you know what I mean)
// TODO: make a real spline, not a bunch of lines...
// Adds all necessary stuff for you.

/* harmony default export */ const Splinevue_type_script_lang_js_ = ({
  name: 'Spline',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.2'
      };
    },
    // Here goes your code. You are provided with:
    // { All stuff is reactive }
    // $props.layout -> positions of all chart elements +
    //  some helper functions (see layout_fn.js)
    // $props.interval -> candlestick time interval
    // $props.sub -> current subset of candlestick data
    // $props.data -> your indicator's data subset.
    //  Comes "as is", should have the following format:
    //  [[<timestamp>, ... ], ... ]
    // $props.colors -> colors (see TradingVue.vue)
    // $props.cursor -> current position of crosshair
    // $props.settings -> indicator's custom settings
    //  E.g. colors, line thickness, etc. You define it.
    // $props.num -> indicator's layer number (of All
    // layers in the current grid)
    // $props.id -> indicator's id (e.g. EMA_0)
    // ~
    // Finally, let's make the canvas dirty!
    draw: function draw(ctx) {
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      var layout = this.$props.layout;
      var i = this.data_index;
      var data = this.$props.data;

      if (!this.skip_nan) {
        for (var k = 0, n = data.length; k < n; k++) {
          var p = data[k];
          var x = layout.t2screen(p[0]);
          var y = layout.$2screen(p[i]);
          ctx.lineTo(x, y);
        }
      } else {
        var skip = false;

        for (var k = 0, n = data.length; k < n; k++) {
          var _p = data[k];

          var _x = layout.t2screen(_p[0]);

          var _y = layout.$2screen(_p[i]);

          if (_p[i] == null || _y !== _y) {
            skip = true;
          } else {
            if (skip) ctx.moveTo(_x, _y);
            ctx.lineTo(_x, _y);
            skip = false;
          }
        }
      }

      ctx.stroke();
    },
    // For all data with these types overlay will be
    // added to the renderer list. And '$props.data'
    // will have the corresponding values. If you want to
    // redefine the default behviour for a prticular
    // indicator (let's say EMA),
    // just create a new overlay with the same type:
    // e.g. use_for() { return ['EMA'] }.
    use_for: function use_for() {
      return ['Spline', 'EMA', 'SMA'];
    },
    // Colors for the legend, should have the
    // same dimention as a data point (excl. timestamp)
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    },
    data_index: function data_index() {
      return this.sett.dataIndex || 1;
    },
    // Don't connect separate parts if true
    skip_nan: function skip_nan() {
      return this.sett.skipNaN;
    }
  },
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Spline.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Splinevue_type_script_lang_js_ = (Splinevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Spline.vue
var Spline_render, Spline_staticRenderFns
;



/* normalize component */
;
var Spline_component = normalizeComponent(
  overlays_Splinevue_type_script_lang_js_,
  Spline_render,
  Spline_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Spline_api; }
Spline_component.options.__file = "src/components/overlays/Spline.vue"
/* harmony default export */ const Spline = (Spline_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Splines.vue?vue&type=script&lang=js&
// Channel renderer. (Keltner, Bollinger)

/* harmony default export */ const Splinesvue_type_script_lang_js_ = ({
  name: 'Splines',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    draw: function draw(ctx) {
      for (var i = 0; i < this.lines_num; i++) {
        var _i = i % this.clrx.length;

        ctx.strokeStyle = this.clrx[_i];
        ctx.lineWidth = this.widths[i] || this.line_width;
        ctx.beginPath();
        this.draw_spline(ctx, i);
        ctx.stroke();
      }
    },
    draw_spline: function draw_spline(ctx, i) {
      var layout = this.$props.layout;
      var data = this.$props.data;

      if (!this.skip_nan) {
        for (var k = 0, n = data.length; k < n; k++) {
          var p = data[k];
          var x = layout.t2screen(p[0]);
          var y = layout.$2screen(p[i + 1]);
          ctx.lineTo(x, y);
        }
      } else {
        var skip = false;

        for (var k = 0, n = data.length; k < n; k++) {
          var _p = data[k];

          var _x = layout.t2screen(_p[0]);

          var _y = layout.$2screen(_p[i + 1]);

          if (_p[i + 1] == null || _y !== _y) {
            skip = true;
          } else {
            if (skip) ctx.moveTo(_x, _y);
            ctx.lineTo(_x, _y);
            skip = false;
          }
        }
      }
    },
    use_for: function use_for() {
      return ['Splines', 'DMI'];
    },
    data_colors: function data_colors() {
      return this.clrx;
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    widths: function widths() {
      return this.sett.lineWidths || [];
    },
    clrx: function clrx() {
      var colors = this.sett.colors || [];
      var n = this.$props.num;

      if (!colors.length) {
        for (var i = 0; i < this.lines_num; i++) {
          colors.push(this.COLORS[(n + i) % 5]);
        }
      }

      return colors;
    },
    lines_num: function lines_num() {
      if (!this.$props.data[0]) return 0;
      return this.$props.data[0].length - 1;
    },
    // Don't connect separate parts if true
    skip_nan: function skip_nan() {
      return this.sett.skipNaN;
    }
  },
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Splines.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Splinesvue_type_script_lang_js_ = (Splinesvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Splines.vue
var Splines_render, Splines_staticRenderFns
;



/* normalize component */
;
var Splines_component = normalizeComponent(
  overlays_Splinesvue_type_script_lang_js_,
  Splines_render,
  Splines_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Splines_api; }
Splines_component.options.__file = "src/components/overlays/Splines.vue"
/* harmony default export */ const Splines = (Splines_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Range.vue?vue&type=script&lang=js&
// R S I . Because we love it
// Adds all necessary stuff for you.

/* harmony default export */ const Rangevue_type_script_lang_js_ = ({
  name: 'Range',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    // Here goes your code. You are provided with:
    // { All stuff is reactive }
    // $props.layout -> positions of all chart elements +
    //  some helper functions (see layout_fn.js)
    // $props.interval -> candlestick time interval
    // $props.sub -> current subset of candlestick data
    // $props.data -> your indicator's data subset.
    //  Comes "as is", should have the following format:
    //  [[<timestamp>, ... ], ... ]
    // $props.colors -> colors (see TradingVue.vue)
    // $props.cursor -> current position of crosshair
    // $props.settings -> indicator's custom settings
    //  E.g. colors, line thickness, etc. You define it.
    // $props.num -> indicator's layer number (of All
    // layers in the current grid)
    // $props.id -> indicator's id (e.g. EMA_0)
    // ~
    // Finally, let's make the canvas dirty!
    draw: function draw(ctx) {
      var layout = this.$props.layout;
      var upper = layout.$2screen(this.sett.upper || 70);
      var lower = layout.$2screen(this.sett.lower || 30);
      var data = this.$props.data; // RSI values

      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();

      for (var k = 0, n = data.length; k < n; k++) {
        var p = data[k];
        var x = layout.t2screen(p[0]);
        var y = layout.$2screen(p[1]);
        ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.strokeStyle = this.band_color;
      ctx.setLineDash([5]); // Will be removed after draw()

      ctx.beginPath(); // Fill the area between the bands

      ctx.fillStyle = this.back_color;
      ctx.fillRect(0, upper, layout.width, lower - upper); // Upper band

      ctx.moveTo(0, upper);
      ctx.lineTo(layout.width, upper); // Lower band

      ctx.moveTo(0, lower);
      ctx.lineTo(layout.width, lower);
      ctx.stroke();
    },
    // For all data with these types overlay will be
    // added to the renderer list. And '$props.data'
    // will have the corresponding values. If you want to
    // redefine the default behviour for a prticular
    // indicator (let's say EMA),
    // just create a new overlay with the same type:
    // e.g. use_for() { return ['EMA'] }.
    use_for: function use_for() {
      return ['Range', 'RSI'];
    },
    // Colors for the legend, should have the
    // same dimention as a data point (excl. timestamp)
    data_colors: function data_colors() {
      return [this.color];
    },
    // Y-Range tansform. For example you need a fixed
    // Y-range for an indicator, you can do it here!
    // Gets estimated range, @return you favorite range
    y_range: function y_range(hi, lo) {
      return [Math.max(hi, this.sett.upper || 70), Math.min(lo, this.sett.lower || 30)];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      return this.sett.color || '#ec206e';
    },
    band_color: function band_color() {
      return this.sett.bandColor || '#ddd';
    },
    back_color: function back_color() {
      return this.sett.backColor || '#381e9c16';
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Range.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Rangevue_type_script_lang_js_ = (Rangevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Range.vue
var Range_render, Range_staticRenderFns
;



/* normalize component */
;
var Range_component = normalizeComponent(
  overlays_Rangevue_type_script_lang_js_,
  Range_render,
  Range_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Range_api; }
Range_component.options.__file = "src/components/overlays/Range.vue"
/* harmony default export */ const Range = (Range_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Trades.vue?vue&type=script&lang=js&

/* harmony default export */ const Tradesvue_type_script_lang_js_ = ({
  name: 'Trades',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.2'
      };
    },
    draw: function draw(ctx) {
      var layout = this.$props.layout;
      var data = this.$props.data;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'black';

      for (var k = 0, n = data.length; k < n; k++) {
        var p = data[k];
        ctx.fillStyle = p[1] ? this.buy_color : this.sell_color;
        ctx.beginPath();
        var x = layout.t2screen(p[0]); // x - Mapping

        var y = layout.$2screen(p[2]); // y - Mapping

        ctx.arc(x, y, this.marker_size + 0.5, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();

        if (this.show_label && p[3]) {
          this.draw_label(ctx, x, y, p);
        }
      }
    },
    draw_label: function draw_label(ctx, x, y, p) {
      ctx.fillStyle = this.label_color;
      ctx.font = this.new_font;
      ctx.textAlign = 'center';
      ctx.fillText(p[3], x, y - 25);
    },
    use_for: function use_for() {
      return ['Trades'];
    },
    // Defines legend format (values & colors)
    legend: function legend(values) {
      switch (values[1]) {
        case 0:
          var pos = 'Sell';
          break;

        case 1:
          pos = 'Buy';
          break;

        default:
          pos = 'Unknown';
      }

      return [{
        value: pos
      }, {
        value: values[2].toFixed(4),
        color: this.$props.colors.text
      }].concat(values[3] ? [{
        value: values[3]
      }] : []);
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    default_font: function default_font() {
      return '12px ' + this.$props.font.split('px').pop();
    },
    buy_color: function buy_color() {
      return this.sett.buyColor || '#63df89';
    },
    sell_color: function sell_color() {
      return this.sett.sellColor || '#ec4662';
    },
    label_color: function label_color() {
      return this.sett.labelColor || '#999';
    },
    marker_size: function marker_size() {
      return this.sett.markerSize || 5;
    },
    show_label: function show_label() {
      return this.sett.showLabel !== false;
    },
    new_font: function new_font() {
      return this.sett.font || this.default_font;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Trades.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Tradesvue_type_script_lang_js_ = (Tradesvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Trades.vue
var Trades_render, Trades_staticRenderFns
;



/* normalize component */
;
var Trades_component = normalizeComponent(
  overlays_Tradesvue_type_script_lang_js_,
  Trades_render,
  Trades_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Trades_api; }
Trades_component.options.__file = "src/components/overlays/Trades.vue"
/* harmony default export */ const Trades = (Trades_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Channel.vue?vue&type=script&lang=js&
// Channel renderer. (Keltner, Bollinger)
// TODO: allow color transparency
// TODO: improve performance: draw in one solid chunk

/* harmony default export */ const Channelvue_type_script_lang_js_ = ({
  name: 'Channel',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },

    /*draw(ctx) {
        ctx.lineWidth = this.line_width
        ctx.strokeStyle = this.color
        ctx.fillStyle = this.back_color
         for (var i = 0; i < this.$props.data.length - 1; i++) {
              let p1 = this.mapp(this.$props.data[i])
            let p2 = this.mapp(this.$props.data[i+1])
             if (!p2) continue
            if (p1.y1 !== p1.y1) continue // Fix NaN
             // Background
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y1)
            ctx.lineTo(p2.x + 0.1, p2.y1)
            ctx.lineTo(p2.x + 0.1, p2.y3)
            ctx.lineTo(p1.x, p1.y3)
            ctx.fill()
             // Lines
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y1)
            ctx.lineTo(p2.x, p2.y1)
            if (this.show_mid) {
                ctx.moveTo(p1.x, p1.y2)
                ctx.lineTo(p2.x, p2.y2)
            }
            ctx.moveTo(p1.x, p1.y3)
            ctx.lineTo(p2.x, p2.y3)
            ctx.stroke()
         }
    },*/
    draw: function draw(ctx) {
      // Background
      var data = this.data;
      var layout = this.layout;
      ctx.beginPath();
      ctx.fillStyle = this.back_color;

      for (var i = 0; i < data.length; i++) {
        var p = data[i];
        var x = layout.t2screen(p[0]);
        var y = layout.$2screen(p[1] || undefined);
        ctx.lineTo(x, y);
      }

      for (var i = data.length - 1; i >= 0; i--) {
        var _p = data[i];

        var _x = layout.t2screen(_p[0]);

        var _y = layout.$2screen(_p[3] || undefined);

        ctx.lineTo(_x, _y);
      }

      ctx.fill(); // Lines

      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color; // Top line

      ctx.beginPath();

      for (var i = 0; i < data.length; i++) {
        var _p2 = data[i];

        var _x2 = layout.t2screen(_p2[0]);

        var _y2 = layout.$2screen(_p2[1] || undefined);

        ctx.lineTo(_x2, _y2);
      }

      ctx.stroke(); // Bottom line

      ctx.beginPath();

      for (var i = 0; i < data.length; i++) {
        var _p3 = data[i];

        var _x3 = layout.t2screen(_p3[0]);

        var _y3 = layout.$2screen(_p3[3] || undefined);

        ctx.lineTo(_x3, _y3);
      }

      ctx.stroke(); // Middle line

      if (!this.show_mid) return;
      ctx.beginPath();

      for (var i = 0; i < data.length; i++) {
        var _p4 = data[i];

        var _x4 = layout.t2screen(_p4[0]);

        var _y4 = layout.$2screen(_p4[2] || undefined);

        ctx.lineTo(_x4, _y4);
      }

      ctx.stroke();
    },
    mapp: function mapp(p) {
      var layout = this.$props.layout;
      return p && {
        x: layout.t2screen(p[0]),
        y1: layout.$2screen(p[1]),
        y2: layout.$2screen(p[2]),
        y3: layout.$2screen(p[3])
      };
    },
    use_for: function use_for() {
      return ['Channel', 'KC', 'BB'];
    },
    data_colors: function data_colors() {
      return [this.color, this.color, this.color];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    },
    show_mid: function show_mid() {
      return 'showMid' in this.sett ? this.sett.showMid : true;
    },
    back_color: function back_color() {
      return this.sett.backColor || this.color + '11';
    }
  },
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Channel.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Channelvue_type_script_lang_js_ = (Channelvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Channel.vue
var Channel_render, Channel_staticRenderFns
;



/* normalize component */
;
var Channel_component = normalizeComponent(
  overlays_Channelvue_type_script_lang_js_,
  Channel_render,
  Channel_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Channel_api; }
Channel_component.options.__file = "src/components/overlays/Channel.vue"
/* harmony default export */ const Channel = (Channel_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Segment.vue?vue&type=script&lang=js&
// Segment renderer.

/* harmony default export */ const Segmentvue_type_script_lang_js_ = ({
  name: 'Segment',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.0'
      };
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      var layout = this.$props.layout;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      ctx.moveTo(x1, y1);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
    use_for: function use_for() {
      return ['Segment'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    }
  },
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Segment.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Segmentvue_type_script_lang_js_ = (Segmentvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Segment.vue
var Segment_render, Segment_staticRenderFns
;



/* normalize component */
;
var Segment_component = normalizeComponent(
  overlays_Segmentvue_type_script_lang_js_,
  Segment_render,
  Segment_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Segment_api; }
Segment_component.options.__file = "src/components/overlays/Segment.vue"
/* harmony default export */ const Segment = (Segment_component.exports);
;// CONCATENATED MODULE: ./src/components/js/layout_cnv.js


// Claculates postions and sizes for candlestick
// and volume bars for the given subset of data

function layout_cnv(self) {
  var $p = self.$props;
  var sub = $p.data;
  var t2screen = $p.layout.t2screen;
  var layout = $p.layout;
  var candles = [];
  var volume = []; // The volume bar height is determined as a percentage of
  // the chart's height (VOLSCALE)

  var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
    return x[5];
  })));
  var vs = $p.config.VOLSCALE * layout.height / maxv;
  var x1,
      x2,
      w,
      avg_w,
      mid,
      prev = undefined; // Subset interval against main interval

  var _new_interval = new_interval(layout, $p, sub),
      _new_interval2 = _slicedToArray(_new_interval, 2),
      interval2 = _new_interval2[0],
      ratio = _new_interval2[1];

  var px_step2 = layout.px_step * ratio;
  var splitter = px_step2 > 5 ? 1 : 0; // A & B are current chart tranformations:
  // A === scale,  B === Y-axis shift

  for (var i = 0; i < sub.length; i++) {
    var p = sub[i];
    mid = t2screen(p[0]) + 1; // Clear volume bar if there is a time gap

    if (sub[i - 1] && p[0] - sub[i - 1][0] > interval2) {
      prev = null;
    }

    x1 = prev || Math.floor(mid - px_step2 * 0.5);
    x2 = Math.floor(mid + px_step2 * 0.5) - 0.5; // TODO: add log scale support

    candles.push({
      x: mid,
      w: layout.px_step * $p.config.CANDLEW * ratio,
      o: Math.floor(p[1] * layout.A + layout.B),
      h: Math.floor(p[2] * layout.A + layout.B),
      l: Math.floor(p[3] * layout.A + layout.B),
      c: Math.floor(p[4] * layout.A + layout.B),
      raw: p
    });
    volume.push({
      x1: x1,
      x2: x2,
      h: p[5] * vs,
      green: p[4] >= p[1],
      raw: p
    });
    prev = x2 + splitter;
  }

  return {
    candles: candles,
    volume: volume
  };
}
function layout_vol(self) {
  var $p = self.$props;
  var sub = $p.data;
  var t2screen = $p.layout.t2screen;
  var layout = $p.layout;
  var volume = []; // Detect data second dimention size:

  var dim = sub[0] ? sub[0].length : 0; // Support special volume data (see API book), or OHLCV
  // Data indices:

  self._i1 = dim < 6 ? 1 : 5;
  self._i2 = dim < 6 ? function (p) {
    return p[2];
  } : function (p) {
    return p[4] >= p[1];
  };
  var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
    return x[self._i1];
  })));
  var volscale = self.volscale || $p.config.VOLSCALE;
  var vs = volscale * layout.height / maxv;
  var x1,
      x2,
      mid,
      prev = undefined; // Subset interval against main interval

  var _new_interval3 = new_interval(layout, $p, sub),
      _new_interval4 = _slicedToArray(_new_interval3, 2),
      interval2 = _new_interval4[0],
      ratio = _new_interval4[1];

  var px_step2 = layout.px_step * ratio;
  var splitter = px_step2 > 5 ? 1 : 0; // A & B are current chart tranformations:
  // A === scale,  B === Y-axis shift

  for (var i = 0; i < sub.length; i++) {
    var p = sub[i];
    mid = t2screen(p[0]) + 1; // Clear volume bar if there is a time gap

    if (sub[i - 1] && p[0] - sub[i - 1][0] > interval2) {
      prev = null;
    }

    x1 = prev || Math.floor(mid - px_step2 * 0.5);
    x2 = Math.floor(mid + px_step2 * 0.5) - 0.5;
    volume.push({
      x1: x1,
      x2: x2,
      h: p[self._i1] * vs,
      green: self._i2(p),
      raw: p
    });
    prev = x2 + splitter;
  }

  return volume;
}

function new_interval(layout, $p, sub) {
  // Subset interval against main interval
  if (!layout.ti_map.ib) {
    var interval2 = $p.tf || utils.detect_interval(sub);
    var ratio = interval2 / $p.interval;
  } else {
    if ($p.tf) {
      var ratio = $p.tf / layout.ti_map.tf;
      var interval2 = ratio;
    } else {
      var interval2 = utils.detect_interval(sub);
      var ratio = interval2 / $p.interval;
    }
  }

  return [interval2, ratio];
}
;// CONCATENATED MODULE: ./src/components/primitives/candle.js



// Candle object for Candles overlay
var CandleExt = /*#__PURE__*/function () {
  function CandleExt(overlay, ctx, data) {
    classCallCheck_classCallCheck(this, CandleExt);

    this.ctx = ctx;
    this.self = overlay;
    this.style = data.raw[6] || this.self;
    this.draw(data);
  }

  createClass_createClass(CandleExt, [{
    key: "draw",
    value: function draw(data) {
      var green = data.raw[4] >= data.raw[1];
      var body_color = green ? this.style.colorCandleUp : this.style.colorCandleDw;
      var wick_color = green ? this.style.colorWickUp : this.style.colorWickDw;
      var w = Math.max(data.w, 1);
      var hw = Math.max(Math.floor(w * 0.5), 1);
      var h = Math.abs(data.o - data.c);
      var max_h = data.c === data.o ? 1 : 2;
      var x05 = Math.floor(data.x) - 0.5;
      this.ctx.strokeStyle = wick_color;
      this.ctx.beginPath();
      this.ctx.moveTo(x05, Math.floor(data.h));
      this.ctx.lineTo(x05, Math.floor(data.l));
      this.ctx.stroke();

      if (data.w > 1.5) {
        this.ctx.fillStyle = body_color; // TODO: Move common calculations to layout.js

        var s = green ? 1 : -1;
        this.ctx.fillRect(Math.floor(data.x - hw - 1), data.c, Math.floor(hw * 2 + 1), s * Math.max(h, max_h));
      } else {
        this.ctx.strokeStyle = body_color;
        this.ctx.beginPath();
        this.ctx.moveTo(x05, Math.floor(Math.min(data.o, data.c)));
        this.ctx.lineTo(x05, Math.floor(Math.max(data.o, data.c)) + (data.o === data.c ? 1 : 0));
        this.ctx.stroke();
      }
    }
  }]);

  return CandleExt;
}();


;// CONCATENATED MODULE: ./src/components/primitives/volbar.js



var VolbarExt = /*#__PURE__*/function () {
  function VolbarExt(overlay, ctx, data) {
    classCallCheck_classCallCheck(this, VolbarExt);

    this.ctx = ctx;
    this.$p = overlay.$props;
    this.self = overlay;
    this.style = data.raw[6] || this.self;
    this.draw(data);
  }

  createClass_createClass(VolbarExt, [{
    key: "draw",
    value: function draw(data) {
      var y0 = this.$p.layout.height;
      var w = data.x2 - data.x1;
      var h = Math.floor(data.h);
      this.ctx.fillStyle = data.green ? this.style.colorVolUp : this.style.colorVolDw;
      this.ctx.fillRect(Math.floor(data.x1), Math.floor(y0 - h - 0.5), Math.floor(w), Math.floor(h + 1));
    }
  }]);

  return VolbarExt;
}();


;// CONCATENATED MODULE: ./src/components/primitives/price.js



// Price bar & price line (shader)
var Price = /*#__PURE__*/function () {
  function Price(comp) {
    classCallCheck_classCallCheck(this, Price);

    this.comp = comp;
  } // Defines an inline shader (has access to both
  // target & overlay's contexts)


  createClass_createClass(Price, [{
    key: "init_shader",
    value: function init_shader() {
      var _this = this;

      var layout = this.comp.$props.layout;
      var config = this.comp.$props.config;
      var comp = this.comp;

      var last_bar = function last_bar() {
        return _this.last_bar();
      };

      this.comp.$emit('new-shader', {
        target: 'sidebar',
        draw: function draw(ctx) {
          var bar = last_bar();
          if (!bar) return;
          var w = ctx.canvas.width;
          var h = config.PANHEIGHT;
          var lbl = bar.price.toFixed(layout.prec);
          ctx.fillStyle = bar.color;
          var x = -0.5;
          var y = bar.y - h * 0.5 - 0.5;
          var a = 7;
          ctx.fillRect(x - 0.5, y, w + 1, h);
          ctx.fillStyle = comp.$props.colors.textHL;
          ctx.textAlign = 'left';
          ctx.fillText(lbl, a, y + 15);
        }
      });
      this.shader = true;
    } // Regular draw call for overaly

  }, {
    key: "draw",
    value: function draw(ctx) {
      if (!this.comp.$props.meta.last) return;
      if (!this.shader) this.init_shader();
      var layout = this.comp.$props.layout;
      var last = this.comp.$props.last;
      var dir = last[4] >= last[1];
      var color = dir ? this.green() : this.red();
      var y = layout.$2screen(last[4]) + (dir ? 1 : 0);
      ctx.strokeStyle = color;
      ctx.setLineDash([1, 1]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(layout.width, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, {
    key: "last_bar",
    value: function last_bar() {
      if (!this.comp.data.length) return undefined;
      var layout = this.comp.$props.layout;
      var last = this.comp.data[this.comp.data.length - 1];
      var y = layout.$2screen(last[4]); //let cndl = layout.c_magnet(last[0])

      return {
        y: y,
        //Math.floor(cndl.c) - 0.5,
        price: last[4],
        color: last[4] >= last[1] ? this.green() : this.red()
      };
    }
  }, {
    key: "last_price",
    value: function last_price() {
      return this.comp.$props.meta.last ? this.comp.$props.meta.last[4] : undefined;
    }
  }, {
    key: "green",
    value: function green() {
      return this.comp.colorCandleUp;
    }
  }, {
    key: "red",
    value: function red() {
      return this.comp.colorCandleDw;
    }
  }]);

  return Price;
}();


;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Candles.vue?vue&type=script&lang=js&
// Renedrer for candlesticks + volume (optional)
// It can be used as the main chart or an indicator





/* harmony default export */ const Candlesvue_type_script_lang_js_ = ({
  name: 'Candles',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.2.1'
      };
    },
    init: function init() {
      this.price = new Price(this);
    },
    draw: function draw(ctx) {
      // If data === main candlestick data
      // render as main chart:
      if (this.$props.sub === this.$props.data) {
        var cnv = {
          candles: this.$props.layout.candles,
          volume: this.$props.layout.volume
        }; // Else, as offchart / onchart indicator:
      } else {
        cnv = layout_cnv(this);
      }

      if (this.show_volume) {
        var cv = cnv.volume;

        for (var i = 0, n = cv.length; i < n; i++) {
          new VolbarExt(this, ctx, cv[i]);
        }
      }

      var cc = cnv.candles;

      for (var i = 0, n = cc.length; i < n; i++) {
        new CandleExt(this, ctx, cc[i]);
      }

      if (this.price_line) this.price.draw(ctx);
    },
    use_for: function use_for() {
      return ['Candles'];
    },
    // In case it's added as offchart overlay
    y_range: function y_range() {
      var hi = -Infinity,
          lo = Infinity;

      for (var i = 0, n = this.sub.length; i < n; i++) {
        var x = this.sub[i];
        if (x[2] > hi) hi = x[2];
        if (x[3] < lo) lo = x[3];
      }

      return [hi, lo];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    show_volume: function show_volume() {
      return 'showVolume' in this.sett ? this.sett.showVolume : true;
    },
    price_line: function price_line() {
      return 'priceLine' in this.sett ? this.sett.priceLine : true;
    },
    colorCandleUp: function colorCandleUp() {
      return this.sett.colorCandleUp || this.$props.colors.candleUp;
    },
    colorCandleDw: function colorCandleDw() {
      return this.sett.colorCandleDw || this.$props.colors.candleDw;
    },
    colorWickUp: function colorWickUp() {
      return this.sett.colorWickUp || this.$props.colors.wickUp;
    },
    colorWickDw: function colorWickDw() {
      return this.sett.colorWickDw || this.$props.colors.wickDw;
    },
    colorWickSm: function colorWickSm() {
      return this.sett.colorWickSm || this.$props.colors.wickSm;
    },
    colorVolUp: function colorVolUp() {
      return this.sett.colorVolUp || this.$props.colors.volUp;
    },
    colorVolDw: function colorVolDw() {
      return this.sett.colorVolDw || this.$props.colors.volDw;
    }
  },
  data: function data() {
    return {
      price: {}
    };
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Candles.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Candlesvue_type_script_lang_js_ = (Candlesvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Candles.vue
var Candles_render, Candles_staticRenderFns
;



/* normalize component */
;
var Candles_component = normalizeComponent(
  overlays_Candlesvue_type_script_lang_js_,
  Candles_render,
  Candles_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Candles_api; }
Candles_component.options.__file = "src/components/overlays/Candles.vue"
/* harmony default export */ const Candles = (Candles_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Volume.vue?vue&type=script&lang=js&


function Volumevue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = Volumevue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function Volumevue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Volumevue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Volumevue_type_script_lang_js_arrayLikeToArray(o, minLen); }

function Volumevue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// Standalone renedrer for the volume



/* harmony default export */ const Volumevue_type_script_lang_js_ = ({
  name: 'Volume',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    draw: function draw(ctx) {
      // TODO: volume average
      // TODO: Y-axis scaling
      var _iterator = Volumevue_type_script_lang_js_createForOfIteratorHelper(layout_vol(this)),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var v = _step.value;
          new VolbarExt(this, ctx, v);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    use_for: function use_for() {
      return ['Volume'];
    },
    // Defines legend format (values & colors)
    // _i2 - detetected data index (see layout_cnv)
    legend: function legend(values) {
      var flag = this._i2 ? this._i2(values) : values[2];
      var color = flag ? this.colorVolUpLegend : this.colorVolDwLegend;
      return [{
        value: values[this._i1 || 1],
        color: color
      }];
    },
    // When added as offchart overlay
    // If data is OHLCV => recalc y-range
    // _i1 - detetected data index (see layout_cnv)
    y_range: function y_range(hi, lo) {
      var _this = this;

      if (this._i1 === 5) {
        var sub = this.$props.sub;
        return [Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
          return x[_this._i1];
        }))), Math.min.apply(Math, _toConsumableArray(sub.map(function (x) {
          return x[_this._i1];
        })))];
      } else {
        return [hi, lo];
      }
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    colorVolUp: function colorVolUp() {
      return this.sett.colorVolUp || this.$props.colors.volUp;
    },
    colorVolDw: function colorVolDw() {
      return this.sett.colorVolDw || this.$props.colors.volDw;
    },
    colorVolUpLegend: function colorVolUpLegend() {
      return this.sett.colorVolUpLegend || this.$props.colors.candleUp;
    },
    colorVolDwLegend: function colorVolDwLegend() {
      return this.sett.colorVolDwLegend || this.$props.colors.candleDw;
    },
    volscale: function volscale() {
      return this.sett.volscale || this.$props.grid_id > 0 ? 0.85 : this.$props.config.VOLSCALE;
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Volume.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Volumevue_type_script_lang_js_ = (Volumevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Volume.vue
var Volume_render, Volume_staticRenderFns
;



/* normalize component */
;
var Volume_component = normalizeComponent(
  overlays_Volumevue_type_script_lang_js_,
  Volume_render,
  Volume_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Volume_api; }
Volume_component.options.__file = "src/components/overlays/Volume.vue"
/* harmony default export */ const Volume = (Volume_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Splitters.vue?vue&type=script&lang=js&
// Data section splitters (with labels)

/* harmony default export */ const Splittersvue_type_script_lang_js_ = ({
  name: 'Splitters',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    draw: function draw(ctx) {
      var _this = this;

      var layout = this.$props.layout;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.line_color;
      this.$props.data.forEach(function (p, i) {
        ctx.beginPath();
        var x = layout.t2screen(p[0]); // x - Mapping

        ctx.setLineDash([10, 10]);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, _this.layout.height);
        ctx.stroke();
        if (p[1]) _this.draw_label(ctx, x, p);
      });
    },
    draw_label: function draw_label(ctx, x, p) {
      var side = p[2] ? 1 : -1;
      x += 2.5 * side;
      ctx.font = this.new_font;
      var pos = p[4] || this.y_position;
      var w = ctx.measureText(p[1]).width + 10;
      var y = this.layout.height * (1.0 - pos);
      y = Math.floor(y);
      ctx.fillStyle = p[3] || this.flag_color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10 * side, y - 10 * side);
      ctx.lineTo(x + (w + 10) * side, y - 10 * side);
      ctx.lineTo(x + (w + 10) * side, y + 10 * side);
      ctx.lineTo(x + 10 * side, y + 10 * side);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = this.label_color;
      ctx.textAlign = side < 0 ? 'right' : 'left';
      ctx.fillText(p[1], x + 15 * side, y + 4);
    },
    use_for: function use_for() {
      return ['Splitters'];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    new_font: function new_font() {
      return this.sett.font || '12px ' + this.$props.font.split('px').pop();
    },
    flag_color: function flag_color() {
      return this.sett.flagColor || '#4285f4';
    },
    label_color: function label_color() {
      return this.sett.labelColor || '#fff';
    },
    line_color: function line_color() {
      return this.sett.lineColor || '#4285f4';
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 1.0;
    },
    y_position: function y_position() {
      return this.sett.yPosition || 0.9;
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Splitters.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Splittersvue_type_script_lang_js_ = (Splittersvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Splitters.vue
var Splitters_render, Splitters_staticRenderFns
;



/* normalize component */
;
var Splitters_component = normalizeComponent(
  overlays_Splittersvue_type_script_lang_js_,
  Splitters_render,
  Splitters_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Splitters_api; }
Splitters_component.options.__file = "src/components/overlays/Splitters.vue"
/* harmony default export */ const Splitters = (Splitters_component.exports);
;// CONCATENATED MODULE: ./src/stuff/keys.js



function keys_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = keys_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function keys_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return keys_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return keys_arrayLikeToArray(o, minLen); }

function keys_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// Keyboard event handler for overlay
var Keys = /*#__PURE__*/function () {
  function Keys(comp) {
    classCallCheck_classCallCheck(this, Keys);

    this.comp = comp;
    this.map = {};
    this.listeners = 0;
    this.keymap = {};
  }

  createClass_createClass(Keys, [{
    key: "on",
    value: function on(name, handler) {
      if (!handler) return;
      this.map[name] = this.map[name] || [];
      this.map[name].push(handler);
      this.listeners++;
    } // Called by grid.js

  }, {
    key: "emit",
    value: function emit(name, event) {
      if (name in this.map) {
        var _iterator = keys_createForOfIteratorHelper(this.map[name]),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var f = _step.value;
            f(event);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      if (name === 'keydown') {
        if (!this.keymap[event.key]) {
          this.emit(event.key);
        }

        this.keymap[event.key] = true;
      }

      if (name === 'keyup') {
        this.keymap[event.key] = false;
      }
    }
  }, {
    key: "pressed",
    value: function pressed(key) {
      return this.keymap[key];
    }
  }]);

  return Keys;
}();


;// CONCATENATED MODULE: ./src/mixins/tool.js
function tool_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = tool_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function tool_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return tool_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return tool_arrayLikeToArray(o, minLen); }

function tool_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// Usuful stuff for creating tools. Include as mixin


/* harmony default export */ const tool = ({
  methods: {
    init_tool: function init_tool() {
      var _this = this;

      // Collision functions (float, float) => bool,
      this.collisions = [];
      this.pins = [];
      this.mouse.on('mousemove', function (e) {
        if (_this.collisions.some(function (f) {
          return f(_this.mouse.x, _this.mouse.y);
        })) {
          _this.show_pins = true;
        } else {
          _this.show_pins = false;
        }

        if (_this.drag) _this.drag_update();
      });
      this.mouse.on('mousedown', function (e) {
        if (utils.default_prevented(e)) return;

        if (_this.collisions.some(function (f) {
          return f(_this.mouse.x, _this.mouse.y);
        })) {
          if (!_this.selected) {
            _this.$emit('object-selected');
          }

          _this.start_drag();

          e.preventDefault();

          _this.pins.forEach(function (x) {
            return x.mousedown(e, true);
          });
        }
      });
      this.mouse.on('mouseup', function (e) {
        _this.drag = null;

        _this.$emit('scroll-lock', false);
      });
      this.keys = new Keys(this);
      this.keys.on('Delete', this.remove_tool);
      this.keys.on('Backspace', this.remove_tool);
      this.show_pins = false;
      this.drag = null;
    },
    render_pins: function render_pins(ctx) {
      if (this.selected || this.show_pins) {
        this.pins.forEach(function (x) {
          return x.draw(ctx);
        });
      }
    },
    set_state: function set_state(name) {
      this.$emit('change-settings', {
        $state: name
      });
    },
    watch_uuid: function watch_uuid(n, p) {
      // If layer $uuid is changed, then re-init
      // pins & collisions
      if (n.$uuid !== p.$uuid) {
        var _iterator = tool_createForOfIteratorHelper(this.pins),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var p = _step.value;
            p.re_init();
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        this.collisions = [];
        this.show_pins = false;
        this.drag = null;
      }
    },
    pre_draw: function pre_draw() {
      // Delete all collision functions before
      // the draw() call and let primitives set
      // them again
      this.collisions = [];
    },
    remove_tool: function remove_tool() {
      if (this.selected) this.$emit('remove-tool');
    },
    start_drag: function start_drag() {
      this.$emit('scroll-lock', true);
      var cursor = this.$props.cursor;
      this.drag = {
        t: cursor.t,
        y$: cursor.y$
      };
      this.pins.forEach(function (x) {
        return x.rec_position();
      });
    },
    drag_update: function drag_update() {
      var dt = this.$props.cursor.t - this.drag.t;
      var dy = this.$props.cursor.y$ - this.drag.y$;
      this.pins.forEach(function (x) {
        return x.update_from([x.t1 + dt, x.y$1 + dy], true);
      });
    }
  },
  computed: {
    // Settings starting with $ are reserved
    selected: function selected() {
      return this.$props.settings.$selected;
    },
    state: function state() {
      return this.$props.settings.$state;
    }
  }
});
;// CONCATENATED MODULE: ./src/stuff/icons.json
const icons_namespaceObject = JSON.parse('{"extended.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAANElEQVR4nGNggABGEMEEIlhABAeI+AASF0AlHmAqA4kzKAAx8wGQuAMKwd6AoYzBAWonAwAcLwTgNfJ3RQAAAABJRU5ErkJggg==","ray.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAMklEQVR4nGNgQAJMIIIFRHCACAEQoQAiHICYvQEkjkrwYypjAIkzwk2zAREuqIQFzD4AE3kE4BEmGggAAAAASUVORK5CYII=","segment.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAgMAAAC5h23wAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAATU1NJCQkCxcHIQAAAAN0Uk5TAP8SmutI5AAAACxJREFUeJxjYMACGAMgNAsLdpoVKi8AVe8A1QblQlWRKt0AoULw2w1zGxoAABdiAviQhF/mAAAAAElFTkSuQmCC","add.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAH5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKBgYGGxsbKioqPz8/Pj4+BQUFCQkJAQEBZGRkh4eHAgICEBAQNjY2g4ODgYGBAAAAAwMDeXl5d3d3GBgYERERgICAgICANDQ0PDw8Y2NjCAgIhYWFGhoaJycnOjo6YWFhgICAdXV14Y16sQAAACp0Uk5TAAILDxIKESEnJiYoKCgTKSkpKCAnKSkFKCkpJiDl/ycpKSA2JyYpKSkpOkQ+xgAAARdJREFUeJzllNt2gyAQRTWiRsHLoDU0GpPYmMv//2BMS+sgl6Z9bM8bi73gnJkBz/sn8lcBIUHofwtG8TpJKUuTLI6cYF7QEqRKynP71VX9AkhNXVlsbMQrLLQVGyPZLsGHWgPrCxMJwHUPlXa79NBp2et5d9f3u3m1XxatQNn7SagOXCUjCjYUDuqxcWlHj4MSfw12FDJchFViRN8+1qcQoUH6lR1L1mEMEErofB6WzEUwylzomfzOQGiOJdXiWH7mQoUyMa4WXJQWOBvLFvPCGxt6FSr5kyH0qi0YddNG2/pgCsOjff4ZTizXPNwKIzl56OoGg9d9Z/+5cs6On+CFCfevFQ3ZaTycx1YMbvDdRvjkp/lHdAcPXzokxcwfDwAAAABJRU5ErkJggg==","cursor.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAgMAAAC5h23wAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAxQTFRFAAAATU1NTU1NTU1NwlMHHwAAAAR0Uk5TAOvhxbpPrUkAAAAkSURBVHicY2BgYHBggAByabxg1WoGBq2pRCk9AKUbcND43AEAufYHlSuusE4AAAAASUVORK5CYII=","display_off.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAU1QTFRFAAAAh4eHh4eHAAAAAAAAAAAAAwMDAAAAAAAAhoaGGBgYgYGBAAAAPz8/AgICg4ODCQkJhISEh4eHh4eHPj4+NjY2gYGBg4ODgYGBgYGBgoKCAQEBJycngoKChYWFEBAQg4ODCAgIKioqZGRkCgoKBQUFERERd3d3gYGBGxsbNDQ0hISEgYGBPDw8gYGBgYGBh4eHh4eHhYWFh4eHgoKChYWFgYGBgYGBg4ODhoaGg4ODYWFhgoKCBgYGdXV1goKCg4ODgYGBgICAgYGBAAAAg4ODhYWFhISEh4eHgoKChYWFOjo6goKCGhoah4eHh4eHh4eHgoKCh4eHeXl5hoaGgoKChISEgYGBgYGBgoKCY2NjgYGBgoKCh4eHgoKCgYGBhoaGg4ODhoaGhYWFh4eHgYGBhoaGhoaGhoaGg4ODgoKChISEgoKChYWFh4eHfKktUwAAAG90Uk5TACn/AhEFKA8SLCbxCigoVBNKUTYoJ/lh3PyAKSaTNiBtICYpISggKSkmJ0LEKef3lGxA8rn//+pcMSkpnCcptHPJKe0LUjnx5LzKKaMnX73hl64pLnhkzNSgKeLv17LQ+liIzaLe7PfTw5tFpz3K1fXR/gAAAgBJREFUeJzllNdXwjAUxknB0lIoCKVsGTIFQRAZ7r333nuv///R3LZ4mlDQZ/0ekp7b37n5bnITk+mfyDxv5Tir3fwjaElO5BIOKZFLJS1dQVfI0Y809TtEV+elo95RpFPWG+1go4fdQ5QybI8haaNBkM2ANbM09bnrwaPY7iFKrz7EMBdu7CHdVruXIt0M1hb+GKA3LTRKkp5lTA6Dg6xIkhaHhvQ1IlW/UCouQdJNJTRIpk1qO7+wUpcfpl537oBc7VNip3Gi/AmVPBAC1UrL6HXtSGVT+k2Yz0Focad07OMRf3P5BEbd63PFQx7HN+w61JoAm+uBlV48O/0jkLSMmtPCmQ8HwlYdykFV4/LJPp7e3hVyFdapHNehLk6PSjhSkBvwu/cFyJGIYvOyhoc1jjYQFGbygD4CWjoAMla/og3YoSw+KPhjPNoFcim4iFD+pFYA8zZ9WeYU5OBjZ3ORWyCfG03E+47kKpCIJTpGO4KP8XMgtw990xG/PBNTgmPEEXwf7P42oOdFIRAoBCtqTKL6Rcwq4Xsgh5xYC/mmSs6yJKk1YbnVeTq1NaEpmlHbmVn2EORkW2trF2ZzmHGTSUMGl1a9hp4ySRpdQ8yKGURpMmRIYg9pb1YPzg6kO79cLlE6bYFjEtv91bLEUxvhwbWwjY13BxUb9l8+mn9EX8x3Nki8ff5wAAAAAElFTkSuQmCC","display_on.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAR1QTFRFAAAAh4eHgYGBAAAAAAAAgYGBAAAAAwMDAAAAAAAAgYGBg4ODGBgYgYGBhISEAAAAPz8/AgIChoaGCQkJhYWFPj4+NjY2goKCgYGBAQEBJycngYGBgoKCEBAQCAgIhISEKioqZGRkCgoKBQUFERERd3d3gYGBg4ODgYGBGxsbNDQ0hISEgoKCgoKChYWFPDw8gYGBgYGBhoaGgoKCg4ODgoKCgYGBgoKCgoKCgoKCg4ODgoKChoaGgoKCgYGBhoaGg4ODYWFhBgYGdXV1gYGBg4ODgoKCgICAg4ODg4ODhISEAAAAg4ODOjo6gYGBGhoaeXl5goKCgYGBgoKChYWFgoKChISEgoKCY2NjgYGBg4ODgYGBgYGBg4ODgYGBo8n54AAAAF90Uk5TACn/AhH3BSgPEuhUJvFACigoLBM2KCeA6ykm+pMgIEkmKSEoICn9XCkmJ0u6nDop4sUypGuEzLZ6vmCYLZ/dLykpJynUYa8pcllCC1Ip2ycpisl1PadFsintbsPQZdi/bTW7AAAB4UlEQVR4nOWUZ1fCMBSGSSGWFiq0UDbIkr2XbBwMxS0b1P//M0xK9XSiftX7oel585zkvfcmMRj+SRhvzRRlthm/BU3Ry3TYzofTsajpIOjw2iNAjIiddehvHXSdA0mkXEEdG0fkE1DEKXmkSVqVIA6rBmsktUgAWLWHoGp30UNclbtLmwQgoyya91wPTbFy0mQXJ5zJQO6BgXRjfH0iSkX5stHIXr5r0bB/lu8syjR8rzsFbR2SpX+5J2eMP3csLtYsEY2K8BeTFuE2jaVCBw7bHOBuxq16AXmpbui3LtIfbRLUHMY2q4lcFo2WB4KA1SUAlWumNEKCzyxBKZxVHvYGaFguCBx1vM/x0IPzoqQoj5SdP4mns2cCGhBsrgj0uaeUBtzMyxQN8w4mYROTW8+r0oANp8W5mf6WQw5aCYJ2o7ymPaKMi2uVpmWM4TW6tdImgGo1bT4nK6DbbsCc0AZSdmLEFszzHrh6riVvRrNA3/9SE8QLWQu+Gjto9+gE9NBMwr9zi83gFeeFTe11zpm1CHE3HeyVCSknf3MIDcFTbfJKdbR1L4xX49L+/BoillV5uPJqkshD3JWSgpNMXP/lcrD8+hO84MnDr5YpFHv0Fe99VjJ0GBRs2H74aP6R+ACr+TFvZNAQ1wAAAABJRU5ErkJggg==","down.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAKVQTFRFAAAAg4ODgICAAAAAAAAAAAAACAgIAAAAAAAAAAAAAAAAOTk5hYWFEBAQfHx8ODg4dnZ2NDQ0XV1dGxsbKCgogICAFBQUIiIiZGRkgICAgICAFRUVAAAAgICAgICAgICAf39/Li4ugICAcHBwgoKCgICAgoKCgICAg4ODgYGBPj4+goKCgICAhISEgYGBgICAgoKCgICAgYGBgYGBf39/gICAgICAIdPQHAAAADd0Uk5TACn/KAIRIBMFDwooKyApKSknKSYmzCcmKfL7JRCUi2L3J7IpcLUrr0VbKXntNEnkMbxrUcG56CMpi50AAAFZSURBVHic5ZRpf4MgDIeFKFatWm/tfW091u7evv9Hm1Acoujm2y0vFPH5Jf+EEE37J6bblmlatv4jaBCI4rMfR0CMXtAEJ0fccgfM7tAkQHXzArdDxggmqGETGCnJWROkNlOwOqhIhKCtgbSicw1uK/dATSK0aRatIzytA8ik4XSiyJnLSm+VPxULgeyLI3uHRJH+qcB4WZGrKb4c20WwI7b3iUt74OS6XD+xZWrXUCtme0uKTvfcJ65CZFa9VOebqwXmft+oT8yF+/VymT4XeGB+Xx8L+j4gBcoFIDT+oMz6Qp93Y74pCeBpUXaLuW0rUk6r1iv3nP322ewYkgv2nZIvgpSPQDrY5wTjRJDNg9XAE/+uSXIVX812GdKEmtvR2rtWaw+5MAOuofJy79SXu9TgBl4d9DZdI0NjgyiswNCB/qk1J5Bmvp+lQOa9IJNhW4bxm6H5R+wLQYMSQXZNzbcAAAAASUVORK5CYII=","price_range.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAIUlEQVR4nGNggAPm/w9gTA4QIQMitECEJ1yMEgLNDiAAADfgBMRu78GgAAAAAElFTkSuQmCC","price_time.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAOklEQVR4nGNggAPm/w9gTA4QIQPEClpMQMITRHCACScQoQQihBgY9P//grKgYk5wdTACYhQHFjuAAABZFAlc4e1fcQAAAABJRU5ErkJggg==","remove.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAK5QTFRFAAAAh4eHgICAAAAAAAAAh4eHAAAAAwMDAAAAAAAAgICAGBgYAAAAPz8/AgICgICACQkJhoaGhoaGgICAPj4+NjY2gYGBg4ODgYGBAQEBJycngoKCEBAQgICAgICACAgIKioqZGRkCgoKBQUFERERd3d3gYGBGxsbNDQ0gICAPDw8YWFhBgYGdXV1gICAg4ODgICAAAAAOjo6GhoaeXl5gICAhYWFY2NjhYWFgICA9O0oCgAAADp0Uk5TACn/AhErBSgPEvEmCigowxMuMcgoJ7hWrCkmdCD6vSAmKSEoICkpJie6KSknKSkp0wspJynCMik11rrLte8AAAFwSURBVHic5ZTXkoIwFIZNAAPSpKkoRQV7Wcva3v/FFiRmEwise7t7bs7MP98k/ylJq/VPQjjKiiJrwo+gON0uxro7XiRTsRHs+voE4JjoRrf+6sD7AFTMvaDGRht9glLMUJtLqmUwD5XDCohHAmBUPQSV27GHtFK7xycBWJab5uPaR+Hlmue7GfZxHwyWFHVMQghXFgD2A8IOZtfssdNJIXcyFEaSfchzp9BuMVP+Fhvr5Qh0nGfqYTGhm3BcYFUaQBKOhMWzRqHyGFRY03ppQ5lCFZ30RloVZGQTaa3QqEt0OyrQnkSkk8I1YJkvAwPCMgY0UpbzXRZhVbosIWGbZTLNQszGMCM42FJEjWDDjIAMtp+xj6x2K+/DqNDc0r4Yc8yGl3uer2aIyT1iyd8sYSuY8cldZbVrH4zPebTvP8OMNSoedj6XzDyk3pwG98u0/ufqGu7tBW5c1PxriXFyHq5PQxXFzeDThvbmp/lH4gt6WxfZ03H8DwAAAABJRU5ErkJggg==","settings.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAW5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKBgYGGxsbKioqQEBAPj4+BQUFCAgIAQEBPz8/ZWVlh4eHZGRkAgICCQkJDw8PNjY2g4ODgoKCNTU1EBAQAAAAAwMDeXl5d3d3AAAAGBgYAAAAERERioqKgoKCgoKCgoKCgYGBgoKChISEhoaGNDQ0g4ODgICAgICAgICAgYGBgYGBhYWFgICAgICAPT09AAAAgYGBgICAgICAgICAgICAY2NjCAgIgICAgICAhYWFhYWFgYGBHBwcgICAhYWFGhoagYGBgYGBg4ODhoaGJycnAAAAhISEgICAg4ODPDw8AAAAgoKCgICAhISEOjo6h4eHgoKCgYGBgICAf39/gYGBgoKCgICAGBgYgYGBg4ODg4ODgICACwsLgYGBgICAgYGBgYGBgYGBgICAgYGBYWFhf39/g4ODPj4+gYGBg4ODgICAhYWFgoKCgYGBgICAgYGBgoKCdXV1T0kC9QAAAHp0Uk5TAAILDxMKESEnJiYpKSgTKSgpKSkoEyAnKSknIAYoKSkFJQEgKl94jYVvVC4nU9f/+K8pOu71KBCi3NPq/ikg0e01Nokm1UUnsZVqQSYOT9lrKRJz5lIpK12jyu+sesgnhGVLxCG55a6Um+GaKfJCKKRgKUt8ocergymDQ9knAAABsElEQVR4nOWUV1vCMBSGg1AQpBZrcVdE3KJxo4LgnuCoe4F7orjHv7doTk3bgF7rd5OnX94nZ+SkCP0TWQqsNpuVs/wI2h2FTleR2+XkHfa8YLHgKRGJSj2SN3fosvIKkVJlVXWONGrkWtEgn1zHJP1GMCs/g7XILFIUpXoTWmaKTnIImGovh72Gxqbmlta2dvgOGpsmQO0dnfhTXd3E6JH0pN1DNnr7MFE/HDsQ0qEO6Pxg9sCh4XDkGx2J6sovBD+G8eiYuo5PxLTKeLoJBZNgT2EcnjY0YYajUKsL7Fk1gcjU3PwChcYTFGorAnsRqlpa1tAVhUbdmr+6RtjIOlgbCjMBUdzc2t7ZzbJ7zAQ4p6GSfRVNwkeKLsvCg31w2JBdjlT0GDxZNzEnpcQ+xWfnFxeXVyp6Tay07gq+L/YUOoBvbomV0V8skiq//DutWfeEfJD1JPLCED4+Pb8kX986tApNQ4iqfSJT76bRzvlgBPODQXW/foYqK5lyeBeYJEL1gaoeGnwIBhjRoQ9SZgTAdEbO/9cKRfmZ+MpGPCVHQ3nBzzS4hKIkuNyh/5g+ALiAXSSas9hwAAAAAElFTkSuQmCC","time_range.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAJElEQVR4nGNgwAsUGJhQCScQoQQihBgY9P//grKgYk4YOvACACOpBKG6Svj+AAAAAElFTkSuQmCC","trash.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAALUlEQVR4nGNgAIN6ENHQACX4//9gYBBgYIESYC4LkA0lPEkmGFAI5v8PILYCAHygDJxlK0RUAAAAAElFTkSuQmCC","up.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAMZQTFRFAAAAh4eHgICAAAAAAAAAAAAAAwMDAAAAAAAAGBgYAAAAPz8/AgICCQkJgICAh4eHPj4+NjY2AQEBJycnEBAQgICAgICACAgIKioqZGRkCgoKBQUFgYGBERERd3d3gYGBGxsbNDQ0gICAgYGBPDw8gYGBh4eHgICAYWFhBgYGgYGBdXV1goKCg4ODhYWFgICAgoKCAAAAhISEOjo6gICAGhoagYGBeXl5hoaGgICAY2Njg4ODgoKCgoKCgYGBgoKCg4ODgoKC64uw1gAAAEJ0Uk5TACn/AhEFKA8SJgooKBP7KignKSYg9c0gJikhKLQgKSkmJ7ywKY8s5SknlClxKTMpXwtFKe0neiku8ClKWmSbbFFjM5GHSgAAAW5JREFUeJzllGd/gjAQxk3AMFWWOHDvVa2rVbu//5cqhJWQQO3b9nkVjv/v7rnLKJX+iYS9JMuSKvwIiu3loKkZzYHXFgvBiqW1QKSWplfySzvmAyDUN50cG2X0DDLqoTKXVLJgIIXDCohHAqCzHhymeuShy/Ru8kkAhtmhWUTvW9fdEnPQaVLU0n8XF0L3kn5P6LTtZPKgNoK+RrUkcGtQ7S9TsgOxxinrkUPYD+LwLCIh7CTsWSVQqRmTuPqpitlZFLQlApXjrsYBc335wOw47ksmUSMMrgKi/gnAE/awCqNHmTUwDf5X34LlBuedsgbUsK15kPMxTIXzzvFSIdsSPBw7nGD1K+7bL3F9xStEnZhoCw71TbpL71GBBbUF1MZmZWTOi97PI3eIJn9zCEtOj0+umaOde2EszqW9/xr6rM54WFtc0vfQNak57Ibd/Jerohu3GFwYqPjVEhve2Z4cbQU1ikFsQ73z0fwj+ga3VBezGuggFQAAAABJRU5ErkJggg=="}');
;// CONCATENATED MODULE: ./src/components/primitives/pin.js



// Semi-automatic pin object. For stretching things.


var Pin = /*#__PURE__*/function () {
  // (Comp reference, a name in overlay settings,
  // pin parameters)
  function Pin(comp, name, params) {
    var _this = this;

    if (params === void 0) {
      params = {};
    }

    classCallCheck_classCallCheck(this, Pin);

    this.RADIUS = comp.$props.config.PIN_RADIUS || 5.5;
    this.RADIUS_SQ = Math.pow(this.RADIUS + 7, 2);

    if (utils.is_mobile) {
      this.RADIUS += 2;
      this.RADIUS_SQ *= 2.5;
    }

    this.COLOR_BACK = comp.$props.colors.back;
    this.COLOR_BR = comp.$props.colors.text;
    this.comp = comp;
    this.layout = comp.layout;
    this.mouse = comp.mouse;
    this.name = name;
    this.state = params.state || 'settled';
    this.hidden = params.hidden || false;
    this.mouse.on('mousemove', function (e) {
      return _this.mousemove(e);
    });
    this.mouse.on('mousedown', function (e) {
      return _this.mousedown(e);
    });
    this.mouse.on('mouseup', function (e) {
      return _this.mouseup(e);
    });

    if (comp.state === 'finished') {
      this.state = 'settled';
      this.update_from(comp.$props.settings[name]);
    } else {
      this.update();
    }

    if (this.state !== 'settled') {
      this.comp.$emit('scroll-lock', true);
    }
  }

  createClass_createClass(Pin, [{
    key: "re_init",
    value: function re_init() {
      this.update_from(this.comp.$props.settings[this.name]);
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      if (this.hidden) return;

      switch (this.state) {
        case 'tracking':
          break;

        case 'dragging':
          if (!this.moved) this.draw_circle(ctx);
          break;

        case 'settled':
          this.draw_circle(ctx);
          break;
      }
    }
  }, {
    key: "draw_circle",
    value: function draw_circle(ctx) {
      this.layout = this.comp.layout;

      if (this.comp.selected) {
        var r = this.RADIUS,
            lw = 1.5;
      } else {
        var r = this.RADIUS * 0.95,
            lw = 1;
      }

      ctx.lineWidth = lw;
      ctx.strokeStyle = this.COLOR_BR;
      ctx.fillStyle = this.COLOR_BACK;
      ctx.beginPath();
      ctx.arc(this.x = this.layout.t2screen(this.t), this.y = this.layout.$2screen(this.y$), r + 0.5, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.stroke();
    }
  }, {
    key: "update",
    value: function update() {
      this.y$ = this.comp.$props.cursor.y$;
      this.y = this.comp.$props.cursor.y;
      this.t = this.comp.$props.cursor.t;
      this.x = this.comp.$props.cursor.x; // Save pin as time in IB mode
      //if (this.layout.ti_map.ib) {
      //    this.t = this.layout.ti_map.i2t(this.t )
      //}
      // Reset the settings attahed to the pin (position)

      this.comp.$emit('change-settings', _defineProperty({}, this.name, [this.t, this.y$]));
    }
  }, {
    key: "update_from",
    value: function update_from(data, emit) {
      if (emit === void 0) {
        emit = false;
      }

      if (!data) return;
      this.layout = this.comp.layout;
      this.y$ = data[1];
      this.y = this.layout.$2screen(this.y$);
      this.t = data[0];
      this.x = this.layout.t2screen(this.t); // TODO: Save pin as time in IB mode
      //if (this.layout.ti_map.ib) {
      //    this.t = this.layout.ti_map.i2t(this.t )
      //}

      if (emit) this.comp.$emit('change-settings', _defineProperty({}, this.name, [this.t, this.y$]));
    }
  }, {
    key: "rec_position",
    value: function rec_position() {
      this.t1 = this.t;
      this.y$1 = this.y$;
    }
  }, {
    key: "mousemove",
    value: function mousemove(event) {
      switch (this.state) {
        case 'tracking':
        case 'dragging':
          this.moved = true;
          this.update();
          break;
      }
    }
  }, {
    key: "mousedown",
    value: function mousedown(event, force) {
      if (force === void 0) {
        force = false;
      }

      if (utils.default_prevented(event) && !force) return;

      switch (this.state) {
        case 'tracking':
          this.state = 'settled';
          if (this.on_settled) this.on_settled();
          this.comp.$emit('scroll-lock', false);
          break;

        case 'settled':
          if (this.hidden) return;

          if (this.hover()) {
            this.state = 'dragging';
            this.moved = false;
            this.comp.$emit('scroll-lock', true);
            this.comp.$emit('object-selected');
          }

          break;
      }

      if (this.hover()) {
        event.preventDefault();
      }
    }
  }, {
    key: "mouseup",
    value: function mouseup(event) {
      switch (this.state) {
        case 'dragging':
          this.state = 'settled';
          if (this.on_settled) this.on_settled();
          this.comp.$emit('scroll-lock', false);
          break;
      }
    }
  }, {
    key: "on",
    value: function on(name, handler) {
      switch (name) {
        case 'settled':
          this.on_settled = handler;
          break;
      }
    }
  }, {
    key: "hover",
    value: function hover() {
      var x = this.x;
      var y = this.y;
      return (x - this.mouse.x) * (x - this.mouse.x) + (y - this.mouse.y) * (y - this.mouse.y) < this.RADIUS_SQ;
    }
  }]);

  return Pin;
}();


;// CONCATENATED MODULE: ./src/components/primitives/seg.js


// Draws a segment, adds corresponding collision f-n



var Seg = /*#__PURE__*/function () {
  // Overlay ref, canvas ctx
  function Seg(overlay, ctx) {
    classCallCheck_classCallCheck(this, Seg);

    this.ctx = ctx;
    this.comp = overlay;
    this.T = overlay.$props.config.TOOL_COLL;
    if (utils.is_mobile) this.T *= 2;
  } // p1[t, $], p2[t, $] (time-price coordinates)


  createClass_createClass(Seg, [{
    key: "draw",
    value: function draw(p1, p2) {
      var layout = this.comp.$props.layout;
      var x1 = layout.t2screen(p1[0]);
      var y1 = layout.$2screen(p1[1]);
      var x2 = layout.t2screen(p2[0]);
      var y2 = layout.$2screen(p2[1]);
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.comp.collisions.push(this.make([x1, y1], [x2, y2]));
    } // Collision function. x, y - mouse coord.

  }, {
    key: "make",
    value: function make(p1, p2) {
      var _this = this;

      return function (x, y) {
        return math.point2seg([x, y], p1, p2) < _this.T;
      };
    }
  }]);

  return Seg;
}();


;// CONCATENATED MODULE: ./src/components/primitives/line.js


// Draws a line, adds corresponding collision f-n



var Line = /*#__PURE__*/function () {
  // Overlay ref, canvas ctx
  function Line(overlay, ctx) {
    classCallCheck_classCallCheck(this, Line);

    this.ctx = ctx;
    this.comp = overlay;
    this.T = overlay.$props.config.TOOL_COLL;
    if (utils.is_mobile) this.T *= 2;
  } // p1[t, $], p2[t, $] (time-price coordinates)


  createClass_createClass(Line, [{
    key: "draw",
    value: function draw(p1, p2) {
      var layout = this.comp.$props.layout;
      var x1 = layout.t2screen(p1[0]);
      var y1 = layout.$2screen(p1[1]);
      var x2 = layout.t2screen(p2[0]);
      var y2 = layout.$2screen(p2[1]);
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      var w = layout.width;
      var h = layout.height; // TODO: transform k (angle) to screen ratio
      // (this requires a new a2screen function)

      var k = (y2 - y1) / (x2 - x1);
      var s = Math.sign(x2 - x1 || y2 - y1);
      var dx = w * s * 2;
      var dy = w * k * s * 2;

      if (dy === Infinity) {
        dx = 0, dy = h * s;
      }

      this.ctx.moveTo(x2, y2);
      this.ctx.lineTo(x2 + dx, y2 + dy);

      if (!this.ray) {
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x1 - dx, y1 - dy);
      }

      this.comp.collisions.push(this.make([x1, y1], [x2, y2]));
    } // Collision function. x, y - mouse coord.

  }, {
    key: "make",
    value: function make(p1, p2) {
      var _this = this;

      var f = this.ray ? math.point2ray.bind(math) : math.point2line.bind(math);
      return function (x, y) {
        return f([x, y], p1, p2) < _this.T;
      };
    }
  }]);

  return Line;
}();


;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/inherits.js

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/typeof.js
function typeof_typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    typeof_typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    typeof_typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return typeof_typeof(obj);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js


function _possibleConstructorReturn(self, call) {
  if (call && (typeof_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}
;// CONCATENATED MODULE: ./src/components/primitives/ray.js





function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

// Draws a ray, adds corresponding collision f-n


var Ray = /*#__PURE__*/function (_Line) {
  _inherits(Ray, _Line);

  var _super = _createSuper(Ray);

  function Ray(overlay, ctx) {
    var _this;

    classCallCheck_classCallCheck(this, Ray);

    _this = _super.call(this, overlay, ctx);
    _this.ray = true;
    return _this;
  }

  return Ray;
}(Line);


;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/LineTool.vue?vue&type=script&lang=js&
// Line drawing tool
// TODO: make an angle-snap when "Shift" is pressed







/* harmony default export */ const LineToolvue_type_script_lang_js_ = ({
  name: 'LineTool',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    tool: function tool() {
      return {
        // Descriptor for the tool
        group: 'Lines',
        icon: icons_namespaceObject["segment.png"],
        type: 'Segment',
        hint: 'This hint will be shown on hover',
        data: [],
        // Default data
        settings: {},
        // Default settings
        // Modifications
        mods: {
          'Extended': {
            // Rewrites the default setting fields
            settings: {
              extended: true
            },
            icon: icons_namespaceObject["extended.png"]
          },
          'Ray': {
            // Rewrites the default setting fields
            settings: {
              ray: true
            },
            icon: icons_namespaceObject["ray.png"]
          }
        }
      };
    },
    // Called after overlay mounted
    init: function init() {
      var _this = this;

      // First pin is settled at the mouse position
      this.pins.push(new Pin(this, 'p1')); // Second one is following mouse until it clicks

      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking'
      }));
      this.pins[1].on('settled', function () {
        // Call when current tool drawing is finished
        // (Optionally) reset the mode back to 'Cursor'
        _this.set_state('finished');

        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();

      if (this.sett.ray) {
        new Ray(this, ctx).draw(this.p1, this.p2);
      } else if (this.sett.extended) {
        new Line(this, ctx).draw(this.p1, this.p2);
      } else {
        new Seg(this, ctx).draw(this.p1, this.p2);
      }

      ctx.stroke();
      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['LineTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      return this.sett.color || '#42b28a';
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/LineTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_LineToolvue_type_script_lang_js_ = (LineToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/LineTool.vue
var LineTool_render, LineTool_staticRenderFns
;



/* normalize component */
;
var LineTool_component = normalizeComponent(
  overlays_LineToolvue_type_script_lang_js_,
  LineTool_render,
  LineTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var LineTool_api; }
LineTool_component.options.__file = "src/components/overlays/LineTool.vue"
/* harmony default export */ const LineTool = (LineTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/RangeTool.vue?vue&type=script&lang=js&

// Price/Time measurment tool





/* harmony default export */ const RangeToolvue_type_script_lang_js_ = ({
  name: 'RangeTool',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '2.0.1'
      };
    },
    tool: function tool() {
      return {
        // Descriptor for the tool
        group: 'Measurements',
        icon: icons_namespaceObject["price_range.png"],
        type: 'Price',
        hint: 'Price Range',
        data: [],
        // Default data
        settings: {},
        // Default settings
        mods: {
          'Time': {
            // Rewrites the default setting fields
            icon: icons_namespaceObject["time_range.png"],
            settings: {
              price: false,
              time: true
            }
          },
          'PriceTime': {
            // Rewrites the default setting fields
            icon: icons_namespaceObject["price_time.png"],
            settings: {
              price: true,
              time: true
            }
          },
          'ShiftMode': {
            // Rewrites the default setting fields
            settings: {
              price: true,
              time: true,
              shiftMode: true
            },
            hidden: true
          }
        }
      };
    },
    // Called after overlay mounted
    init: function init() {
      var _this = this;

      // First pin is settled at the mouse position
      this.pins.push(new Pin(this, 'p1', {
        hidden: this.shift
      })); // Second one is following mouse until it clicks

      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking',
        hidden: this.shift
      }));
      this.pins[1].on('settled', function () {
        // Call when current tool drawing is finished
        // (Optionally) reset the mode back to 'Cursor'
        _this.set_state('finished');

        _this.$emit('drawing-mode-off'); // Deselect the tool in shiftMode


        if (_this.shift) _this._$emit('custom-event', {
          event: 'object-selected',
          args: []
        });
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      var dir = Math.sign(this.p2[1] - this.p1[1]);
      var layout = this.$props.layout;
      var xm = layout.t2screen((this.p1[0] + this.p2[0]) * 0.5);
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color; // Background

      ctx.fillStyle = this.back_color;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]);
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      if (this.price) this.vertical(ctx, x1, y1, x2, y2, xm);
      if (this.time) this.horizontal(ctx, x1, y1, x2, y2, xm);
      this.draw_value(ctx, dir, xm, y2);
      this.render_pins(ctx);
    },
    vertical: function vertical(ctx, x1, y1, x2, y2, xm) {
      var layout = this.$props.layout;
      var dir = Math.sign(this.p2[1] - this.p1[1]);
      ctx.beginPath();

      if (!this.shift) {
        // Top
        new Seg(this, ctx).draw([this.p1[0], this.p2[1]], [this.p2[0], this.p2[1]]); // Bottom

        new Seg(this, ctx).draw([this.p1[0], this.p1[1]], [this.p2[0], this.p1[1]]);
      } // Vertical Arrow


      ctx.moveTo(xm - 4, y2 + 5 * dir);
      ctx.lineTo(xm, y2);
      ctx.lineTo(xm + 4, y2 + 5 * dir);
      ctx.stroke(); // Vertical Line

      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      new Seg(this, ctx).draw([(this.p1[0] + this.p2[0]) * 0.5, this.p2[1]], [(this.p1[0] + this.p2[0]) * 0.5, this.p1[1]]);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    horizontal: function horizontal(ctx, x1, y1, x2, y2, xm) {
      var layout = this.$props.layout;
      var xdir = Math.sign(this.p2[0] - this.p1[0]);
      var ym = (layout.$2screen(this.p1[1]) + layout.$2screen(this.p2[1])) / 2;
      ctx.beginPath();

      if (!this.shift) {
        // Left
        new Seg(this, ctx).draw([this.p1[0], this.p1[1]], [this.p1[0], this.p2[1]]); // Right

        new Seg(this, ctx).draw([this.p2[0], this.p1[1]], [this.p2[0], this.p2[1]]);
      } // Horizontal Arrow


      ctx.moveTo(x2 - 5 * xdir, ym - 4);
      ctx.lineTo(x2, ym);
      ctx.lineTo(x2 - 5 * xdir, ym + 4);
      ctx.stroke(); // Horizontal Line

      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(x1, ym);
      ctx.lineTo(x2, ym);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    // WTF? I know dude, a lot of shitty code here
    draw_value: function draw_value(ctx, dir, xm, y) {
      var _this2 = this;

      ctx.font = this.new_font; // Price delta (anf percent)

      var d$ = (this.p2[1] - this.p1[1]).toFixed(this.prec);
      var p = (100 * (this.p2[1] / this.p1[1] - 1)).toFixed(this.prec); // Map interval to the actual tf (in ms)

      var f = function f(t) {
        return _this2.layout.ti_map.smth2t(t);
      };

      var dt = f(this.p2[0]) - f(this.p1[0]);
      var tf = this.layout.ti_map.tf; // Bars count (through the candle index)

      var f2 = function f2(t) {
        var c = _this2.layout.c_magnet(t);

        var cn = _this2.layout.candles || _this2.layout.master_grid.candles;
        return cn.indexOf(c);
      }; // Bars count (and handling the negative values)


      var b = f2(this.p2[0]) - f2(this.p1[0]); // Format time delta
      // Format time delta

      var dtstr = this.t2str(dt);
      var text = [];
      if (this.price) text.push("".concat(d$, "  (").concat(p, "%)"));
      if (this.time) text.push("".concat(b, " bars, ").concat(dtstr));
      text = text.join('\n'); // "Multiple" fillText

      var lines = text.split('\n');
      var w = Math.max.apply(Math, _toConsumableArray(lines.map(function (x) {
        return ctx.measureText(x).width + 20;
      })).concat([100]));
      var n = lines.length;
      var h = 20 * n;
      ctx.fillStyle = this.value_back;
      ctx.fillRect(xm - w * 0.5, y - (10 + h) * dir, w, h * dir);
      ctx.fillStyle = this.value_color;
      ctx.textAlign = 'center';
      lines.forEach(function (l, i) {
        ctx.fillText(l, xm, y + (dir > 0 ? 20 * i - 20 * n + 5 : 20 * i + 25));
      });
    },
    // Formats time from ms to `1D 12h` for example
    t2str: function t2str(t) {
      var sign = Math.sign(t);
      var abs = Math.abs(t);
      var tfs = [[1000, 's', 60], [60000, 'm', 60], [3600000, 'h', 24], [86400000, 'D', 7], [604800000, 'W', 4], [2592000000, 'M', 12], [31536000000, 'Y', Infinity], [Infinity, 'Eternity', Infinity]];

      for (var i = 0; i < tfs.length; i++) {
        tfs[i][0] = Math.floor(abs / tfs[i][0]);

        if (tfs[i][0] === 0) {
          var p1 = tfs[i - 1];
          var p2 = tfs[i - 2];
          var txt = sign < 0 ? '-' : '';

          if (p1) {
            txt += p1.slice(0, 2).join('');
          }

          var n2 = p2 ? p2[0] - p1[0] * p2[2] : 0;

          if (p2 && n2) {
            txt += ' ';
            txt += "".concat(n2).concat(p2[1]);
          }

          return txt;
        }
      }
    },
    use_for: function use_for() {
      return ['RangeTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      return this.sett.color || this.$props.colors.cross;
    },
    back_color: function back_color() {
      return this.sett.backColor || '#9b9ba316';
    },
    value_back: function value_back() {
      return this.sett.valueBack || '#9b9ba316';
    },
    value_color: function value_color() {
      return this.sett.valueColor || this.$props.colors.text;
    },
    prec: function prec() {
      return this.sett.precision || 2;
    },
    new_font: function new_font() {
      return '12px ' + this.$props.font.split('px').pop();
    },
    price: function price() {
      return 'price' in this.sett ? this.sett.price : true;
    },
    time: function time() {
      return 'time' in this.sett ? this.sett.time : false;
    },
    shift: function shift() {
      return this.sett.shiftMode;
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/RangeTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_RangeToolvue_type_script_lang_js_ = (RangeToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/RangeTool.vue
var RangeTool_render, RangeTool_staticRenderFns
;



/* normalize component */
;
var RangeTool_component = normalizeComponent(
  overlays_RangeToolvue_type_script_lang_js_,
  RangeTool_render,
  RangeTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var RangeTool_api; }
RangeTool_component.options.__file = "src/components/overlays/RangeTool.vue"
/* harmony default export */ const RangeTool = (RangeTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Grid.vue?vue&type=script&lang=js&
function Gridvue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = Gridvue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function Gridvue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Gridvue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Gridvue_type_script_lang_js_arrayLikeToArray(o, minLen); }

function Gridvue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// Sets up all layers/overlays for the grid with 'grid_id'

















/* harmony default export */ const Gridvue_type_script_lang_js_ = ({
  name: 'Grid',
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'overlays', 'width', 'height', 'data', 'grid_id', 'y_transform', 'font', 'tv_id', 'config', 'meta', 'shaders'],
  mixins: [canvas, uxlist],
  components: {
    Crosshair: components_Crosshair,
    KeyboardListener: KeyboardListener
  },
  created: function created() {
    var _this = this;

    // List of all possible overlays (builtin + custom)
    this._list = [Spline, Splines, Range, Trades, Channel, Segment, Candles, Volume, Splitters, LineTool, RangeTool].concat(this.$props.overlays);
    this._registry = {}; // We need to know which components we will use.
    // Custom overlay components overwrite built-ins:

    var tools = [];

    this._list.forEach(function (x, i) {
      var use_for = x.methods.use_for();
      if (x.methods.tool) tools.push({
        use_for: use_for,
        info: x.methods.tool()
      });
      use_for.forEach(function (indicator) {
        _this._registry[indicator] = i;
      });
    });

    this.$emit('custom-event', {
      event: 'register-tools',
      args: tools
    });
    this.$on('custom-event', function (e) {
      return _this.on_ux_event(e, 'grid');
    });
  },
  beforeDestroy: function beforeDestroy() {
    if (this.renderer) this.renderer.destroy();
  },
  mounted: function mounted() {
    var _this2 = this;

    var el = this.$refs['canvas'];
    this.renderer = new Grid(el, this);
    this.setup();
    this.$nextTick(function () {
      return _this2.redraw();
    });
  },
  render: function render(h) {
    var id = this.$props.grid_id;
    var layout = this.$props.layout.grids[id];
    return this.create_canvas(h, "grid-".concat(id), {
      position: {
        x: 0,
        y: layout.offset || 0
      },
      attrs: {
        width: layout.width,
        height: layout.height,
        overflow: 'hidden'
      },
      style: {
        backgroundColor: this.$props.colors.back
      },
      hs: [h(components_Crosshair, {
        props: this.common_props(),
        on: this.layer_events
      }), h(KeyboardListener, {
        on: this.keyboard_events
      }), h(UxLayer, {
        props: {
          id: id,
          tv_id: this.$props.tv_id,
          uxs: this.uxs,
          colors: this.$props.colors,
          config: this.$props.config,
          updater: Math.random()
        },
        on: {
          'custom-event': this.emit_ux_event
        }
      })].concat(this.get_overlays(h))
    });
  },
  methods: {
    new_layer: function new_layer(layer) {
      var _this3 = this;

      this.$nextTick(function () {
        return _this3.renderer.new_layer(layer);
      });
    },
    del_layer: function del_layer(layer) {
      var _this4 = this;

      this.$nextTick(function () {
        return _this4.renderer.del_layer(layer);
      });
      var grid_id = this.$props.grid_id;
      this.$emit('custom-event', {
        event: 'remove-shaders',
        args: [grid_id, layer]
      }); // TODO: close all interfaces

      this.$emit('custom-event', {
        event: 'remove-layer-meta',
        args: [grid_id, layer]
      });
      this.remove_all_ux(layer);
    },
    get_overlays: function get_overlays(h) {
      var _this5 = this;

      // Distributes overlay data & settings according
      // to this._registry; returns compo list
      var comp_list = [],
          count = {};

      var _iterator = Gridvue_type_script_lang_js_createForOfIteratorHelper(this.$props.data),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var d = _step.value;
          var comp = this._list[this._registry[d.type]];

          if (comp) {
            if (comp.methods.calc) {
              comp = this.inject_renderer(comp);
            }

            comp_list.push({
              cls: comp,
              type: d.type,
              data: d.data,
              settings: d.settings,
              i0: d.i0,
              tf: d.tf,
              last: d.last
            });
            count[d.type] = 0;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return comp_list.map(function (x, i) {
        return h(x.cls, {
          on: _this5.layer_events,
          attrs: Object.assign(_this5.common_props(), {
            id: "".concat(x.type, "_").concat(count[x.type]++),
            type: x.type,
            data: x.data,
            settings: x.settings,
            i0: x.i0,
            tf: x.tf,
            num: i,
            grid_id: _this5.$props.grid_id,
            meta: _this5.$props.meta,
            last: x.last
          })
        });
      });
    },
    common_props: function common_props() {
      return {
        cursor: this.$props.cursor,
        colors: this.$props.colors,
        layout: this.$props.layout.grids[this.$props.grid_id],
        interval: this.$props.interval,
        sub: this.$props.sub,
        font: this.$props.font,
        config: this.$props.config
      };
    },
    emit_ux_event: function emit_ux_event(e) {
      var e_pass = this.on_ux_event(e, 'grid');
      if (e_pass) this.$emit('custom-event', e);
    },
    // Replace the current comp with 'renderer'
    inject_renderer: function inject_renderer(comp) {
      var src = comp.methods.calc();

      if (!src.conf || !src.conf.renderer || comp.__renderer__) {
        return comp;
      } // Search for an overlay with the target 'name'


      var f = this._list.find(function (x) {
        return x.name === src.conf.renderer;
      });

      if (!f) return comp;
      comp.mixins.push(f);
      comp.__renderer__ = src.conf.renderer;
      return comp;
    }
  },
  computed: {
    is_active: function is_active() {
      return this.$props.cursor.t !== undefined && this.$props.cursor.grid_id === this.$props.grid_id;
    }
  },
  watch: {
    range: {
      handler: function handler() {
        var _this6 = this;

        // TODO: Left-side render lag fix:
        // Overlay data is updated one tick later than
        // the main sub. Fast fix is to delay redraw()
        // call. It will be a solution until a better
        // one comes by.
        this.$nextTick(function () {
          return _this6.redraw();
        });
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        if (!this.$props.cursor.locked) this.redraw();
      },
      deep: true
    },
    overlays: {
      // Track changes in calc() functions
      handler: function handler(ovs) {
        var _iterator2 = Gridvue_type_script_lang_js_createForOfIteratorHelper(ovs),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var ov = _step2.value;

            var _iterator3 = Gridvue_type_script_lang_js_createForOfIteratorHelper(this.$children),
                _step3;

            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var comp = _step3.value;
                if (typeof comp.id !== 'string') continue;
                var tuple = comp.id.split('_');
                tuple.pop();

                if (tuple.join('_') === ov.name) {
                  comp.calc = ov.methods.calc;
                  if (!comp.calc) continue;
                  var calc = comp.calc.toString();

                  if (calc !== ov.__prevscript__) {
                    comp.exec_script();
                  }

                  ov.__prevscript__ = calc;
                }
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      },
      deep: true
    },
    // Redraw on the shader list change
    shaders: function shaders(n, p) {
      this.redraw();
    }
  },
  data: function data() {
    var _this7 = this;

    return {
      layer_events: {
        'new-grid-layer': this.new_layer,
        'delete-grid-layer': this.del_layer,
        'show-grid-layer': function showGridLayer(d) {
          _this7.renderer.show_hide_layer(d);

          _this7.redraw();
        },
        'redraw-grid': this.redraw,
        'layer-meta-props': function layerMetaProps(d) {
          return _this7.$emit('layer-meta-props', d);
        },
        'custom-event': function customEvent(d) {
          return _this7.$emit('custom-event', d);
        }
      },
      keyboard_events: {
        'register-kb-listener': function registerKbListener(event) {
          _this7.$emit('register-kb-listener', event);
        },
        'remove-kb-listener': function removeKbListener(event) {
          _this7.$emit('remove-kb-listener', event);
        },
        'keyup': function keyup(event) {
          if (!_this7.is_active) return;

          _this7.renderer.propagate('keyup', event);
        },
        'keydown': function keydown(event) {
          if (!_this7.is_active) return; // TODO: is this neeeded?

          _this7.renderer.propagate('keydown', event);
        },
        'keypress': function keypress(event) {
          if (!_this7.is_active) return;

          _this7.renderer.propagate('keypress', event);
        }
      }
    };
  }
});
;// CONCATENATED MODULE: ./src/components/Grid.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Gridvue_type_script_lang_js_ = (Gridvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Grid.vue
var Grid_render, Grid_staticRenderFns
;



/* normalize component */
;
var Grid_component = normalizeComponent(
  components_Gridvue_type_script_lang_js_,
  Grid_render,
  Grid_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Grid_api; }
Grid_component.options.__file = "src/components/Grid.vue"
/* harmony default export */ const components_Grid = (Grid_component.exports);
;// CONCATENATED MODULE: ./src/components/js/sidebar.js



function sidebar_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = sidebar_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function sidebar_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return sidebar_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return sidebar_arrayLikeToArray(o, minLen); }

function sidebar_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }




var PANHEIGHT;

var Sidebar = /*#__PURE__*/function () {
  function Sidebar(canvas, comp, side) {
    if (side === void 0) {
      side = 'right';
    }

    classCallCheck_classCallCheck(this, Sidebar);

    PANHEIGHT = comp.config.PANHEIGHT;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.id = this.$p.grid_id;
    this.layout = this.$p.layout.grids[this.id];
    this.side = side;
    this.listeners();
  }

  createClass_createClass(Sidebar, [{
    key: "listeners",
    value: function listeners() {
      var _this = this;

      var mc = this.mc = new hammer.Manager(this.canvas);
      mc.add(new hammer.Pan({
        direction: hammer.DIRECTION_VERTICAL,
        threshold: 0
      }));
      mc.add(new hammer.Tap({
        event: 'doubletap',
        taps: 2,
        posThreshold: 50
      }));
      mc.on('panstart', function (event) {
        if (_this.$p.y_transform) {
          _this.zoom = _this.$p.y_transform.zoom;
        } else {
          _this.zoom = 1.0;
        }

        _this.y_range = [_this.layout.$_hi, _this.layout.$_lo];
        _this.drug = {
          y: event.center.y,
          z: _this.zoom,
          mid: math.log_mid(_this.y_range, _this.layout.height),
          A: _this.layout.A,
          B: _this.layout.B
        };
      });
      mc.on('panmove', function (event) {
        if (_this.drug) {
          _this.zoom = _this.calc_zoom(event);

          _this.comp.$emit('sidebar-transform', {
            grid_id: _this.id,
            zoom: _this.zoom,
            auto: false,
            range: _this.calc_range(),
            drugging: true
          });

          _this.update();
        }
      });
      mc.on('panend', function () {
        _this.drug = null;

        _this.comp.$emit('sidebar-transform', {
          grid_id: _this.id,
          drugging: false
        });
      });
      mc.on('doubletap', function () {
        _this.comp.$emit('sidebar-transform', {
          grid_id: _this.id,
          zoom: 1.0,
          auto: true
        });

        _this.zoom = 1.0;

        _this.update();
      }); // TODO: Do later for mobile version
    }
  }, {
    key: "update",
    value: function update() {
      // Update reference to the grid
      this.layout = this.$p.layout.grids[this.id];
      var points = this.layout.ys;
      var x,
          y,
          w,
          h,
          side = this.side;
      var sb = this.layout.sb; //this.ctx.fillStyle = this.$p.colors.back

      this.ctx.font = this.$p.font;

      switch (side) {
        case 'left':
          x = 0;
          y = 0;
          w = Math.floor(sb);
          h = this.layout.height; //this.ctx.fillRect(x, y, w, h)

          this.ctx.clearRect(x, y, w, h);
          this.ctx.strokeStyle = this.$p.colors.scale;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 0.5, 0);
          this.ctx.lineTo(x + 0.5, h);
          this.ctx.stroke();
          break;

        case 'right':
          x = 0;
          y = 0;
          w = Math.floor(sb);
          h = this.layout.height; //this.ctx.fillRect(x, y, w, h)

          this.ctx.clearRect(x, y, w, h);
          this.ctx.strokeStyle = this.$p.colors.scale;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 0.5, 0);
          this.ctx.lineTo(x + 0.5, h);
          this.ctx.stroke();
          break;
      }

      this.ctx.fillStyle = this.$p.colors.text;
      this.ctx.beginPath();

      var _iterator = sidebar_createForOfIteratorHelper(points),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var p = _step.value;
          if (p[0] > this.layout.height) continue;
          var x1 = side === 'left' ? w - 0.5 : x - 0.5;
          var x2 = side === 'left' ? x1 - 4.5 : x1 + 4.5;
          this.ctx.moveTo(x1, p[0] - 0.5);
          this.ctx.lineTo(x2, p[0] - 0.5);
          var offst = side === 'left' ? -10 : 10;
          this.ctx.textAlign = side === 'left' ? 'end' : 'start';
          var d = this.layout.prec;
          this.ctx.fillText(p[1].toFixed(d), x1 + offst, p[0] + 4);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.ctx.stroke();
      if (this.$p.grid_id) this.upper_border();
      this.apply_shaders();
      if (this.$p.cursor.y && this.$p.cursor.y$) this.panel();
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      var layout = this.$p.layout.grids[this.id];
      var props = {
        layout: layout,
        cursor: this.$p.cursor
      };

      var _iterator2 = sidebar_createForOfIteratorHelper(this.$p.shaders),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var s = _step2.value;
          this.ctx.save();
          s.draw(this.ctx, props);
          this.ctx.restore();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "upper_border",
    value: function upper_border() {
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(this.layout.width, 0.5);
      this.ctx.stroke();
    } // A gray bar behind the current price

  }, {
    key: "panel",
    value: function panel() {
      if (this.$p.cursor.grid_id !== this.layout.id) {
        return;
      }

      var lbl = this.$p.cursor.y$.toFixed(this.layout.prec);
      this.ctx.fillStyle = this.$p.colors.panel;
      var panwidth = this.layout.sb + 1;
      var x = -0.5;
      var y = this.$p.cursor.y - PANHEIGHT * 0.5 - 0.5;
      var a = 7;
      this.ctx.fillRect(x - 0.5, y, panwidth, PANHEIGHT);
      this.ctx.fillStyle = this.$p.colors.textHL;
      this.ctx.textAlign = 'left';
      this.ctx.fillText(lbl, a, y + 15);
    }
  }, {
    key: "calc_zoom",
    value: function calc_zoom(event) {
      var d = this.drug.y - event.center.y;
      var speed = d > 0 ? 3 : 1;
      var k = 1 + speed * d / this.layout.height;
      return utils.clamp(this.drug.z * k, 0.005, 100);
    } // Not the best place to calculate y-range but
    // this is the simplest solution I found up to
    // date

  }, {
    key: "calc_range",
    value: function calc_range(diff1, diff2) {
      var _this2 = this;

      if (diff1 === void 0) {
        diff1 = 1;
      }

      if (diff2 === void 0) {
        diff2 = 1;
      }

      var z = this.zoom / this.drug.z;
      var zk = (1 / z - 1) / 2;
      var range = this.y_range.slice();
      var delta = range[0] - range[1];

      if (!this.layout.grid.logScale) {
        range[0] = range[0] + delta * zk * diff1;
        range[1] = range[1] - delta * zk * diff2;
      } else {
        var px_mid = this.layout.height / 2;
        var new_hi = px_mid - px_mid * (1 / z);
        var new_lo = px_mid + px_mid * (1 / z); // Use old mapping to get a new range

        var f = function f(y) {
          return math.exp((y - _this2.drug.B) / _this2.drug.A);
        };

        var copy = range.slice();
        range[0] = f(new_hi);
        range[1] = f(new_lo);
      }

      return range;
    }
  }, {
    key: "rezoom_range",
    value: function rezoom_range(delta, diff1, diff2) {
      if (!this.$p.y_transform || this.$p.y_transform.auto) return;
      this.zoom = 1.0; // TODO: further work (improve scaling ratio)

      if (delta < 0) delta /= 3.75; // Btw, idk why 3.75, but it works

      delta *= 0.25;
      this.y_range = [this.layout.$_hi, this.layout.$_lo];
      this.drug = {
        y: 0,
        z: this.zoom,
        mid: math.log_mid(this.y_range, this.layout.height),
        A: this.layout.A,
        B: this.layout.B
      };
      this.zoom = this.calc_zoom({
        center: {
          y: delta * this.layout.height
        }
      });
      this.comp.$emit('sidebar-transform', {
        grid_id: this.id,
        zoom: this.zoom,
        auto: false,
        range: this.calc_range(diff1, diff2),
        drugging: true
      });
      this.drug = null;
      this.comp.$emit('sidebar-transform', {
        grid_id: this.id,
        drugging: false
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.mc) this.mc.destroy();
    }
  }, {
    key: "mousemove",
    value: function mousemove() {}
  }, {
    key: "mouseout",
    value: function mouseout() {}
  }, {
    key: "mouseup",
    value: function mouseup() {}
  }, {
    key: "mousedown",
    value: function mousedown() {}
  }]);

  return Sidebar;
}();


;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Sidebar.vue?vue&type=script&lang=js&
// The side bar (yep, that thing with a bunch of $$$)


/* harmony default export */ const Sidebarvue_type_script_lang_js_ = ({
  name: 'Sidebar',
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'font', 'width', 'height', 'grid_id', 'rerender', 'y_transform', 'tv_id', 'config', 'shaders'],
  mixins: [canvas],
  mounted: function mounted() {
    var el = this.$refs['canvas'];
    this.renderer = new Sidebar(el, this);
    this.setup();
    this.redraw();
  },
  render: function render(h) {
    var id = this.$props.grid_id;
    var layout = this.$props.layout.grids[id];
    return this.create_canvas(h, "sidebar-".concat(id), {
      position: {
        x: layout.width,
        y: layout.offset || 0
      },
      attrs: {
        rerender: this.$props.rerender,
        width: this.$props.width,
        height: layout.height
      },
      style: {
        backgroundColor: this.$props.colors.back
      }
    });
  },
  watch: {
    range: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    rerender: function rerender() {
      var _this = this;

      this.$nextTick(function () {
        return _this.redraw();
      });
    }
  },
  beforeDestroy: function beforeDestroy() {
    if (this.renderer) this.renderer.destroy();
  }
});
;// CONCATENATED MODULE: ./src/components/Sidebar.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Sidebarvue_type_script_lang_js_ = (Sidebarvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Sidebar.vue
var Sidebar_render, Sidebar_staticRenderFns
;



/* normalize component */
;
var Sidebar_component = normalizeComponent(
  components_Sidebarvue_type_script_lang_js_,
  Sidebar_render,
  Sidebar_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Sidebar_api; }
Sidebar_component.options.__file = "src/components/Sidebar.vue"
/* harmony default export */ const components_Sidebar = (Sidebar_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=template&id=34724886&
var Legendvue_type_template_id_34724886_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "trading-vue-legend", style: _vm.calc_style },
    [
      _vm.grid_id === 0
        ? _c(
            "div",
            {
              staticClass: "trading-vue-ohlcv",
              style: { "max-width": _vm.common.width + "px" }
            },
            [
              _c(
                "span",
                {
                  staticClass: "t-vue-title",
                  style: { color: _vm.common.colors.title }
                },
                [
                  _vm._v(
                    "\n              " +
                      _vm._s(_vm.common.title_txt) +
                      "\n        "
                  )
                ]
              ),
              _vm._v(" "),
              _vm.show_values
                ? _c("span", [
                    _vm._v("\n            O"),
                    _c("span", { staticClass: "t-vue-lspan" }, [
                      _vm._v(_vm._s(_vm.ohlcv[0]))
                    ]),
                    _vm._v("\n            H"),
                    _c("span", { staticClass: "t-vue-lspan" }, [
                      _vm._v(_vm._s(_vm.ohlcv[1]))
                    ]),
                    _vm._v("\n            L"),
                    _c("span", { staticClass: "t-vue-lspan" }, [
                      _vm._v(_vm._s(_vm.ohlcv[2]))
                    ]),
                    _vm._v("\n            C"),
                    _c("span", { staticClass: "t-vue-lspan" }, [
                      _vm._v(_vm._s(_vm.ohlcv[3]))
                    ]),
                    _vm._v("\n            V"),
                    _c("span", { staticClass: "t-vue-lspan" }, [
                      _vm._v(_vm._s(_vm.ohlcv[4]))
                    ])
                  ])
                : _vm._e(),
              _vm._v(" "),
              !_vm.show_values
                ? _c(
                    "span",
                    {
                      staticClass: "t-vue-lspan",
                      style: { color: _vm.common.colors.text }
                    },
                    [
                      _vm._v(
                        "\n            " +
                          _vm._s((_vm.common.meta.last || [])[4]) +
                          "\n        "
                      )
                    ]
                  )
                : _vm._e()
            ]
          )
        : _vm._e(),
      _vm._v(" "),
      _vm._l(this.indicators, function(ind) {
        return _c(
          "div",
          { staticClass: "t-vue-ind" },
          [
            _c("span", { staticClass: "t-vue-iname" }, [
              _vm._v(_vm._s(ind.name))
            ]),
            _vm._v(" "),
            _c("button-group", {
              attrs: {
                buttons: _vm.common.buttons,
                config: _vm.common.config,
                ov_id: ind.id,
                grid_id: _vm.grid_id,
                index: ind.index,
                tv_id: _vm.common.tv_id,
                display: ind.v
              },
              on: { "legend-button-click": _vm.button_click }
            }),
            _vm._v(" "),
            ind.v
              ? _c(
                  "span",
                  { staticClass: "t-vue-ivalues" },
                  _vm._l(ind.values, function(v) {
                    return _vm.show_values
                      ? _c(
                          "span",
                          {
                            staticClass: "t-vue-lspan t-vue-ivalue",
                            style: { color: v.color }
                          },
                          [
                            _vm._v(
                              "\n                " +
                                _vm._s(v.value) +
                                "\n            "
                            )
                          ]
                        )
                      : _vm._e()
                  }),
                  0
                )
              : _vm._e(),
            _vm._v(" "),
            ind.unk
              ? _c("span", { staticClass: "t-vue-unknown" }, [
                  _vm._v("\n            (Unknown type)\n        ")
                ])
              : _vm._e(),
            _vm._v(" "),
            _c(
              "transition",
              { attrs: { name: "tvjs-appear" } },
              [
                ind.loading
                  ? _c("spinner", { attrs: { colors: _vm.common.colors } })
                  : _vm._e()
              ],
              1
            )
          ],
          1
        )
      })
    ],
    2
  )
}
var Legendvue_type_template_id_34724886_staticRenderFns = []
Legendvue_type_template_id_34724886_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=template&id=34724886&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=template&id=6f826426&
var ButtonGroupvue_type_template_id_6f826426_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "span",
    { staticClass: "t-vue-lbtn-grp" },
    _vm._l(_vm.buttons, function(b, i) {
      return _c("legend-button", {
        key: i,
        attrs: {
          id: b.name || b,
          tv_id: _vm.tv_id,
          ov_id: _vm.ov_id,
          grid_id: _vm.grid_id,
          index: _vm.index,
          display: _vm.display,
          icon: b.icon,
          config: _vm.config
        },
        on: { "legend-button-click": _vm.button_click }
      })
    }),
    1
  )
}
var ButtonGroupvue_type_template_id_6f826426_staticRenderFns = []
ButtonGroupvue_type_template_id_6f826426_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=template&id=6f826426&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=template&id=1ad87362&
var LegendButtonvue_type_template_id_1ad87362_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("img", {
    staticClass: "t-vue-lbtn",
    style: {
      width: _vm.config.L_BTN_SIZE + "px",
      height: _vm.config.L_BTN_SIZE + "px",
      margin: _vm.config.L_BTN_MARGIN
    },
    attrs: { src: _vm.base64, id: _vm.uuid },
    on: { click: _vm.onclick }
  })
}
var LegendButtonvue_type_template_id_1ad87362_staticRenderFns = []
LegendButtonvue_type_template_id_1ad87362_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=template&id=1ad87362&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//

/* harmony default export */ const LegendButtonvue_type_script_lang_js_ = ({
  name: 'LegendButton',
  props: ['id', 'tv_id', 'grid_id', 'ov_id', 'index', 'display', 'icon', 'config'],
  mounted: function mounted() {},
  computed: {
    base64: function base64() {
      return this.icon || icons_namespaceObject[this.file_name];
    },
    file_name: function file_name() {
      var id = this.$props.id;

      if (this.$props.id === 'display') {
        id = this.$props.display ? 'display_on' : 'display_off';
      }

      return id + '.png';
    },
    uuid: function uuid() {
      var tv = this.$props.tv_id;
      var gr = this.$props.grid_id;
      var ov = this.$props.ov_id;
      return "".concat(tv, "-btn-g").concat(gr, "-").concat(ov);
    },
    data_type: function data_type() {
      return this.$props.grid_id === 0 ? "onchart" : "offchart";
    },
    data_index: function data_index() {
      return this.$props.index;
    }
  },
  methods: {
    onclick: function onclick() {
      this.$emit('legend-button-click', {
        button: this.$props.id,
        type: this.data_type,
        dataIndex: this.data_index,
        grid: this.$props.grid_id,
        overlay: this.$props.ov_id
      });
    }
  }
});
;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_LegendButtonvue_type_script_lang_js_ = (LegendButtonvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=style&index=0&lang=css&
var LegendButtonvue_type_style_index_0_lang_css_ = __webpack_require__(5169);
;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/LegendButton.vue



;


/* normalize component */

var LegendButton_component = normalizeComponent(
  components_LegendButtonvue_type_script_lang_js_,
  LegendButtonvue_type_template_id_1ad87362_render,
  LegendButtonvue_type_template_id_1ad87362_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var LegendButton_api; }
LegendButton_component.options.__file = "src/components/LegendButton.vue"
/* harmony default export */ const LegendButton = (LegendButton_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ const ButtonGroupvue_type_script_lang_js_ = ({
  name: 'ButtonGroup',
  props: ['buttons', 'tv_id', 'ov_id', 'grid_id', 'index', 'display', 'config'],
  components: {
    LegendButton: LegendButton
  },
  methods: {
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_ButtonGroupvue_type_script_lang_js_ = (ButtonGroupvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=style&index=0&lang=css&
var ButtonGroupvue_type_style_index_0_lang_css_ = __webpack_require__(1886);
;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue



;


/* normalize component */

var ButtonGroup_component = normalizeComponent(
  components_ButtonGroupvue_type_script_lang_js_,
  ButtonGroupvue_type_template_id_6f826426_render,
  ButtonGroupvue_type_template_id_6f826426_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var ButtonGroup_api; }
ButtonGroup_component.options.__file = "src/components/ButtonGroup.vue"
/* harmony default export */ const ButtonGroup = (ButtonGroup_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=template&id=39432f99&
var Spinnervue_type_template_id_39432f99_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "tvjs-spinner" },
    _vm._l(4, function(i) {
      return _c("div", { key: i, style: { background: _vm.colors.text } })
    }),
    0
  )
}
var Spinnervue_type_template_id_39432f99_staticRenderFns = []
Spinnervue_type_template_id_39432f99_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=template&id=39432f99&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=script&lang=js&
//
//
//
//
//
//
/* harmony default export */ const Spinnervue_type_script_lang_js_ = ({
  name: 'Spinner',
  props: ['colors']
});
;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Spinnervue_type_script_lang_js_ = (Spinnervue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=style&index=0&lang=css&
var Spinnervue_type_style_index_0_lang_css_ = __webpack_require__(3372);
;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/Spinner.vue



;


/* normalize component */

var Spinner_component = normalizeComponent(
  components_Spinnervue_type_script_lang_js_,
  Spinnervue_type_template_id_39432f99_render,
  Spinnervue_type_template_id_39432f99_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Spinner_api; }
Spinner_component.options.__file = "src/components/Spinner.vue"
/* harmony default export */ const Spinner = (Spinner_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ const Legendvue_type_script_lang_js_ = ({
  name: 'ChartLegend',
  props: ['common', 'values', 'grid_id', 'meta_props'],
  components: {
    ButtonGroup: ButtonGroup,
    Spinner: Spinner
  },
  computed: {
    ohlcv: function ohlcv() {
      if (!this.$props.values || !this.$props.values.ohlcv) {
        return Array(6).fill('n/a');
      }

      var prec = this.layout.prec; // TODO: main the main legend more customizable

      var id = this.main_type + '_0';
      var meta = this.$props.meta_props[id] || {};

      if (meta.legend) {
        return (meta.legend() || []).map(function (x) {
          return x.value;
        });
      }

      return [this.$props.values.ohlcv[1].toFixed(prec), this.$props.values.ohlcv[2].toFixed(prec), this.$props.values.ohlcv[3].toFixed(prec), this.$props.values.ohlcv[4].toFixed(prec), this.$props.values.ohlcv[5] ? this.$props.values.ohlcv[5].toFixed(2) : 'n/a'];
    },
    // TODO: add support for { grid: { id : N }}
    indicators: function indicators() {
      var _this = this;

      var values = this.$props.values;
      var f = this.format;
      var types = {};
      return this.json_data.filter(function (x) {
        return x.settings.legend !== false && !x.main;
      }).map(function (x) {
        if (!(x.type in types)) types[x.type] = 0;
        var id = x.type + "_".concat(types[x.type]++);
        return {
          v: 'display' in x.settings ? x.settings.display : true,
          name: x.name || id,
          index: (_this.off_data || _this.json_data).indexOf(x),
          id: id,
          values: values ? f(id, values) : _this.n_a(1),
          unk: !(id in (_this.$props.meta_props || {})),
          loading: x.loading
        };
      });
    },
    calc_style: function calc_style() {
      var top = this.layout.height > 150 ? 10 : 5;
      var grids = this.$props.common.layout.grids;
      var w = grids[0] ? grids[0].width : undefined;
      return {
        top: "".concat(this.layout.offset + top, "px"),
        width: "".concat(w - 20, "px")
      };
    },
    layout: function layout() {
      var id = this.$props.grid_id;
      return this.$props.common.layout.grids[id];
    },
    json_data: function json_data() {
      return this.$props.common.data;
    },
    off_data: function off_data() {
      return this.$props.common.offchart;
    },
    main_type: function main_type() {
      var f = this.common.data.find(function (x) {
        return x.main;
      });
      return f ? f.type : undefined;
    },
    show_values: function show_values() {
      return this.common.cursor.mode !== 'explore';
    }
  },
  methods: {
    format: function format(id, values) {
      var meta = this.$props.meta_props[id] || {}; // Matches Overlay.data_colors with the data values
      // (see Spline.vue)

      if (!values[id]) return this.n_a(1); // Custom formatter

      if (meta.legend) return meta.legend(values[id]);
      return values[id].slice(1).map(function (x, i) {
        var cs = meta.data_colors ? meta.data_colors() : [];

        if (typeof x == 'number') {
          // Show 8 digits for small values
          x = x.toFixed(Math.abs(x) > 0.001 ? 4 : 8);
        }

        return {
          value: x,
          color: cs ? cs[i % cs.length] : undefined
        };
      });
    },
    n_a: function n_a(len) {
      return Array(len).fill({
        value: 'n/a'
      });
    },
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Legendvue_type_script_lang_js_ = (Legendvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=style&index=0&lang=css&
var Legendvue_type_style_index_0_lang_css_ = __webpack_require__(1600);
;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/Legend.vue



;


/* normalize component */

var Legend_component = normalizeComponent(
  components_Legendvue_type_script_lang_js_,
  Legendvue_type_template_id_34724886_render,
  Legendvue_type_template_id_34724886_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Legend_api; }
Legend_component.options.__file = "src/components/Legend.vue"
/* harmony default export */ const Legend = (Legend_component.exports);
;// CONCATENATED MODULE: ./src/mixins/shaders.js
function shaders_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = shaders_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function shaders_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return shaders_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return shaders_arrayLikeToArray(o, minLen); }

function shaders_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// Parser for shader events
/* harmony default export */ const shaders = ({
  methods: {
    // Init shaders from extensions
    init_shaders: function init_shaders(skin, prev) {
      if (skin !== prev) {
        if (prev) this.shaders = this.shaders.filter(function (x) {
          return x.owner !== prev.id;
        });

        var _iterator = shaders_createForOfIteratorHelper(skin.shaders),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var Shader = _step.value;
            var shader = new Shader();
            shader.owner = skin.id;
            this.shaders.push(shader);
          } // TODO: Sort by zIndex

        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    },
    on_shader_event: function on_shader_event(d, target) {
      if (d.event === 'new-shader') {
        if (d.args[0].target === target) {
          d.args[0].id = "".concat(d.args[1], "-").concat(d.args[2]);
          this.shaders.push(d.args[0]);
          this.rerender++;
        }
      }

      if (d.event === 'remove-shaders') {
        var id = d.args.join('-');
        this.shaders = this.shaders.filter(function (x) {
          return x.id !== id;
        });
      }
    }
  },
  watch: {
    skin: function skin(n, p) {
      this.init_shaders(n, p);
    }
  },
  data: function data() {
    return {
      shaders: []
    };
  }
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=script&lang=js&

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ const Sectionvue_type_script_lang_js_ = ({
  name: 'GridSection',
  props: ['common', 'grid_id'],
  mixins: [shaders],
  components: {
    Grid: components_Grid,
    Sidebar: components_Sidebar,
    ChartLegend: Legend
  },
  mounted: function mounted() {
    this.init_shaders(this.$props.common.skin);
  },
  methods: {
    range_changed: function range_changed(r) {
      this.$emit('range-changed', r);
    },
    cursor_changed: function cursor_changed(c) {
      c.grid_id = this.$props.grid_id;
      this.$emit('cursor-changed', c);
    },
    cursor_locked: function cursor_locked(state) {
      this.$emit('cursor-locked', state);
    },
    sidebar_transform: function sidebar_transform(s) {
      this.$emit('sidebar-transform', s);
    },
    emit_meta_props: function emit_meta_props(d) {
      this.$set(this.meta_props, d.layer_id, d);
      this.$emit('layer-meta-props', d);
    },
    emit_custom_event: function emit_custom_event(d) {
      this.on_shader_event(d, 'sidebar');
      this.$emit('custom-event', d);
    },
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    },
    register_kb: function register_kb(event) {
      this.$emit('register-kb-listener', event);
    },
    remove_kb: function remove_kb(event) {
      this.$emit('remove-kb-listener', event);
    },
    rezoom_range: function rezoom_range(event) {
      var id = 'sb-' + event.grid_id;

      if (this.$refs[id]) {
        this.$refs[id].renderer.rezoom_range(event.z, event.diff1, event.diff2);
      }
    },
    ghash: function ghash(val) {
      // Measures grid heights configuration
      var hs = val.layout.grids.map(function (x) {
        return x.height;
      });
      return hs.reduce(function (a, b) {
        return a + b;
      }, '');
    }
  },
  computed: {
    // Component-specific props subsets:
    grid_props: function grid_props() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common); // Split offchart data between offchart grids

      if (id > 0) {
        var _p$data;

        var all = p.data;
        p.data = [p.data[id - 1]]; // Merge offchart overlays with custom ids with
        // the existing onse (by comparing the grid ids)

        (_p$data = p.data).push.apply(_p$data, _toConsumableArray(all.filter(function (x) {
          return x.grid && x.grid.id === id;
        })));
      }

      p.width = p.layout.grids[id].width;
      p.height = p.layout.grids[id].height;
      p.y_transform = p.y_ts[id];
      p.shaders = this.grid_shaders;
      return p;
    },
    sidebar_props: function sidebar_props() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);
      p.width = p.layout.grids[id].sb;
      p.height = p.layout.grids[id].height;
      p.y_transform = p.y_ts[id];
      p.shaders = this.sb_shaders;
      return p;
    },
    section_values: function section_values() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);
      p.width = p.layout.grids[id].width;
      return p.cursor.values[id];
    },
    legend_props: function legend_props() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common); // Split offchart data between offchart grids

      if (id > 0) {
        var _p$data2;

        var all = p.data;
        p.offchart = all;
        p.data = [p.data[id - 1]];

        (_p$data2 = p.data).push.apply(_p$data2, _toConsumableArray(all.filter(function (x) {
          return x.grid && x.grid.id === id;
        })));
      }

      return p;
    },
    get_meta_props: function get_meta_props() {
      return this.meta_props;
    },
    grid_shaders: function grid_shaders() {
      return this.shaders.filter(function (x) {
        return x.target === 'grid';
      });
    },
    sb_shaders: function sb_shaders() {
      return this.shaders.filter(function (x) {
        return x.target === 'sidebar';
      });
    }
  },
  watch: {
    common: {
      handler: function handler(val, old_val) {
        var newhash = this.ghash(val);

        if (newhash !== this.last_ghash) {
          this.rerender++;
        }

        if (val.data.length !== old_val.data.length) {
          // Look at this nasty trick!
          this.rerender++;
        }

        this.last_ghash = newhash;
      },
      deep: true
    }
  },
  data: function data() {
    return {
      meta_props: {},
      rerender: 0,
      last_ghash: ''
    };
  }
});
;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Sectionvue_type_script_lang_js_ = (Sectionvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=style&index=0&lang=css&
var Sectionvue_type_style_index_0_lang_css_ = __webpack_require__(8011);
;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/Section.vue



;


/* normalize component */

var Section_component = normalizeComponent(
  components_Sectionvue_type_script_lang_js_,
  Sectionvue_type_template_id_8fbe9336_render,
  Sectionvue_type_template_id_8fbe9336_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Section_api; }
Section_component.options.__file = "src/components/Section.vue"
/* harmony default export */ const Section = (Section_component.exports);
;// CONCATENATED MODULE: ./src/components/js/botbar.js



function botbar_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = botbar_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function botbar_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return botbar_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return botbar_arrayLikeToArray(o, minLen); }

function botbar_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }



var botbar_MINUTE15 = constants.MINUTE15,
    botbar_MINUTE = constants.MINUTE,
    botbar_HOUR = constants.HOUR,
    botbar_DAY = constants.DAY,
    botbar_WEEK = constants.WEEK,
    botbar_MONTH = constants.MONTH,
    botbar_YEAR = constants.YEAR,
    botbar_MONTHMAP = constants.MONTHMAP;

var Botbar = /*#__PURE__*/function () {
  function Botbar(canvas, comp) {
    classCallCheck_classCallCheck(this, Botbar);

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.layout = this.$p.layout;
  }

  createClass_createClass(Botbar, [{
    key: "update",
    value: function update() {
      this.grid_0 = this.layout.grids[0];
      var width = this.layout.botbar.width;
      var height = this.layout.botbar.height;
      var sb = this.layout.grids[0].sb; //this.ctx.fillStyle = this.$p.colors.back

      this.ctx.font = this.$p.font; //this.ctx.fillRect(0, 0, width, height)

      this.ctx.clearRect(0, 0, width, height);
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(Math.floor(width + 1), 0.5);
      this.ctx.stroke();
      this.ctx.fillStyle = this.$p.colors.text;
      this.ctx.beginPath();

      var _iterator = botbar_createForOfIteratorHelper(this.layout.botbar.xs),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var p = _step.value;
          var lbl = this.format_date(p);
          if (p[0] > width - sb) continue;
          this.ctx.moveTo(p[0] - 0.5, 0);
          this.ctx.lineTo(p[0] - 0.5, 4.5);

          if (!this.lbl_highlight(p[1][0])) {
            this.ctx.globalAlpha = 0.85;
          }

          this.ctx.textAlign = 'center';
          this.ctx.fillText(lbl, p[0], 18);
          this.ctx.globalAlpha = 1;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.ctx.stroke();
      this.apply_shaders();
      if (this.$p.cursor.x && this.$p.cursor.t !== undefined) this.panel();
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      var layout = this.layout.grids[0];
      var props = {
        layout: layout,
        cursor: this.$p.cursor
      };

      var _iterator2 = botbar_createForOfIteratorHelper(this.comp.bot_shaders),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var s = _step2.value;
          this.ctx.save();
          s.draw(this.ctx, props);
          this.ctx.restore();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "panel",
    value: function panel() {
      var lbl = this.format_cursor_x();
      this.ctx.fillStyle = this.$p.colors.panel;
      var measure = this.ctx.measureText(lbl + '    ');
      var panwidth = Math.floor(measure.width);
      var cursor = this.$p.cursor.x;
      var x = Math.floor(cursor - panwidth * 0.5);
      var y = -0.5;
      var panheight = this.comp.config.PANHEIGHT;
      this.ctx.fillRect(x, y, panwidth, panheight + 0.5);
      this.ctx.fillStyle = this.$p.colors.textHL;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(lbl, cursor, y + 16);
    }
  }, {
    key: "format_date",
    value: function format_date(p) {
      var t = p[1][0];
      t = this.grid_0.ti_map.i2t(t);
      var ti = this.$p.layout.grids[0].ti_map.tf; // Enable timezones only for tf < 1D

      var k = ti < botbar_DAY ? 1 : 0;
      var tZ = t + k * this.$p.timezone * botbar_HOUR; //t += new Date(t).getTimezoneOffset() * MINUTE

      var d = new Date(tZ);

      if (p[2] === botbar_YEAR || utils.year_start(t) === t) {
        return d.getUTCFullYear();
      }

      if (p[2] === botbar_MONTH || utils.month_start(t) === t) {
        return botbar_MONTHMAP[d.getUTCMonth()];
      } // TODO(*) see grid_maker.js


      if (utils.day_start(tZ) === tZ) return d.getUTCDate();
      var h = utils.add_zero(d.getUTCHours());
      var m = utils.add_zero(d.getUTCMinutes());
      return h + ":" + m;
    }
  }, {
    key: "format_cursor_x",
    value: function format_cursor_x() {
      var t = this.$p.cursor.t;
      t = this.grid_0.ti_map.i2t(t); //let ti = this.$p.interval

      var ti = this.$p.layout.grids[0].ti_map.tf; // Enable timezones only for tf < 1D

      var k = ti < botbar_DAY ? 1 : 0; //t += new Date(t).getTimezoneOffset() * MINUTE

      var d = new Date(t + k * this.$p.timezone * botbar_HOUR);

      if (ti === botbar_YEAR) {
        return d.getUTCFullYear();
      }

      if (ti < botbar_YEAR) {
        var yr = '`' + "".concat(d.getUTCFullYear()).slice(-2);
        var mo = botbar_MONTHMAP[d.getUTCMonth()];
        var dd = '01';
      }

      if (ti <= botbar_WEEK) dd = d.getUTCDate();
      var date = "".concat(dd, " ").concat(mo, " ").concat(yr);
      var time = '';

      if (ti < botbar_DAY) {
        var h = utils.add_zero(d.getUTCHours());
        var m = utils.add_zero(d.getUTCMinutes());
        time = h + ":" + m;
      }

      return "".concat(date, "  ").concat(time);
    } // Highlights the begining of a time interval
    // TODO: improve. Problem: let's say we have a new month,
    // but if there is no grid line in place, there
    // will be no month name on t-axis. Sad.
    // Solution: manipulate the grid, skew it, you know

  }, {
    key: "lbl_highlight",
    value: function lbl_highlight(t) {
      var ti = this.$p.interval;
      if (t === 0) return true;
      if (utils.month_start(t) === t) return true;
      if (utils.day_start(t) === t) return true;
      if (ti <= botbar_MINUTE15 && t % botbar_HOUR === 0) return true;
      return false;
    }
  }, {
    key: "mousemove",
    value: function mousemove() {}
  }, {
    key: "mouseout",
    value: function mouseout() {}
  }, {
    key: "mouseup",
    value: function mouseup() {}
  }, {
    key: "mousedown",
    value: function mousedown() {}
  }]);

  return Botbar;
}();


;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Botbar.vue?vue&type=script&lang=js&
// The bottom bar (yep, that thing with a bunch of dates)


/* harmony default export */ const Botbarvue_type_script_lang_js_ = ({
  name: 'Botbar',
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'font', 'width', 'height', 'rerender', 'tv_id', 'config', 'shaders', 'timezone'],
  mixins: [canvas],
  mounted: function mounted() {
    var el = this.$refs['canvas'];
    this.renderer = new Botbar(el, this);
    this.setup();
    this.redraw();
  },
  render: function render(h) {
    var sett = this.$props.layout.botbar;
    return this.create_canvas(h, 'botbar', {
      position: {
        x: 0,
        y: sett.offset || 0
      },
      attrs: {
        rerender: this.$props.rerender,
        width: sett.width,
        height: sett.height
      },
      style: {
        backgroundColor: this.$props.colors.back
      }
    });
  },
  computed: {
    bot_shaders: function bot_shaders() {
      return this.$props.shaders.filter(function (x) {
        return x.target === 'botbar';
      });
    }
  },
  watch: {
    range: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    rerender: function rerender() {
      var _this = this;

      this.$nextTick(function () {
        return _this.redraw();
      });
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Botbar.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Botbarvue_type_script_lang_js_ = (Botbarvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Botbar.vue?vue&type=style&index=0&lang=css&
var Botbarvue_type_style_index_0_lang_css_ = __webpack_require__(7124);
;// CONCATENATED MODULE: ./src/components/Botbar.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/Botbar.vue
var Botbar_render, Botbar_staticRenderFns
;

;


/* normalize component */

var Botbar_component = normalizeComponent(
  components_Botbarvue_type_script_lang_js_,
  Botbar_render,
  Botbar_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Botbar_api; }
Botbar_component.options.__file = "src/components/Botbar.vue"
/* harmony default export */ const components_Botbar = (Botbar_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Keyboard.vue?vue&type=script&lang=js&
//
//
//
//
/* harmony default export */ const Keyboardvue_type_script_lang_js_ = ({
  name: 'Keyboard',
  created: function created() {
    window.addEventListener('keydown', this.keydown);
    window.addEventListener('keyup', this.keyup);
    window.addEventListener('keypress', this.keypress);
    this._listeners = {};
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('keydown', this.keydown);
    window.removeEventListener('keyup', this.keyup);
    window.removeEventListener('keypress', this.keypress);
  },
  render: function render(h) {
    return h();
  },
  methods: {
    keydown: function keydown(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];

        if (l && l.keydown) {
          l.keydown(event);
        } else {
          console.warn("No 'keydown' listener for ".concat(id));
        }
      }
    },
    keyup: function keyup(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];

        if (l && l.keyup) {
          l.keyup(event);
        } else {
          console.warn("No 'keyup' listener for ".concat(id));
        }
      }
    },
    keypress: function keypress(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];

        if (l && l.keypress) {
          l.keypress(event);
        } else {
          console.warn("No 'keypress' listener for ".concat(id));
        }
      }
    },
    register: function register(listener) {
      this._listeners[listener.id] = listener;
    },
    remove: function remove(listener) {
      delete this._listeners[listener.id];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Keyboard.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Keyboardvue_type_script_lang_js_ = (Keyboardvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Keyboard.vue
var Keyboard_render, Keyboard_staticRenderFns
;



/* normalize component */
;
var Keyboard_component = normalizeComponent(
  components_Keyboardvue_type_script_lang_js_,
  Keyboard_render,
  Keyboard_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Keyboard_api; }
Keyboard_component.options.__file = "src/components/Keyboard.vue"
/* harmony default export */ const Keyboard = (Keyboard_component.exports);
;// CONCATENATED MODULE: ./src/mixins/datatrack.js
// Data tracker/watcher

/* harmony default export */ const datatrack = ({
  methods: {
    data_changed: function data_changed() {
      var n = this.ohlcv;
      var changed = false;

      if (this._data_n0 !== n[0] && this._data_len !== n.length) {
        changed = true;
      }

      this.check_all_data(changed);

      if (this.ti_map.ib) {
        this.reindex_delta(n[0], this._data_n0);
      }

      this._data_n0 = n[0];
      this._data_len = n.length;
      this.save_data_t();
      return changed;
    },
    check_all_data: function check_all_data(changed) {
      // If length of data in the Structure changed by > 1 point
      // emit a special event for DC to recalc the scripts
      // TODO: check overlays data too
      var len = this._data_len || 0;

      if (Math.abs(this.ohlcv.length - len) > 1 || this._data_n0 !== this.ohlcv[0]) {
        this.$emit('custom-event', {
          event: 'data-len-changed',
          args: []
        });
      }
    },
    reindex_delta: function reindex_delta(n, p) {
      n = n || [[0]];
      p = p || [[0]];
      var dt = n[0] - p[0];

      if (dt !== 0 && this._data_t) {
        // Convert t back to index
        try {
          // More precise method first
          var nt = this._data_t + 0.01; // fix for the filter lib

          var res = utils.fast_nearest(this.ohlcv, nt);
          var cndl = this.ohlcv[res[0]];
          var off = (nt - cndl[0]) / this.interval_ms;
          this["goto"](res[0] + off);
        } catch (e) {
          this["goto"](this.ti_map.t2i(this._data_t));
        }
      }
    },
    save_data_t: function save_data_t() {
      this._data_t = this.ti_map.i2t(this.range[1]); // save as t
    }
  },
  data: function data() {
    return {
      _data_n0: null,
      _data_len: 0,
      _data_t: 0
    };
  }
});
;// CONCATENATED MODULE: ./src/components/js/ti_mapping.js




// Time-index mapping (for non-linear t-axis)

var MAX_ARR = Math.pow(2, 32); // 3 MODES of index calculation for overlays/subcharts:
// ::: indexSrc :::
// * "map"      -> use TI mapping functions to detect index
//                 (slowest, for stocks only. DEFAULT)
//
// * "calc"     -> calculate shift between sub & data
//                 (faster, but overlay data should be perfectly
//                  align with the main chart,
//                  1-1 candle/data point. Supports Renko)
//
// * "data"     -> overlay data should come with candle index
//                 (fastest, supports Renko)

var TI = /*#__PURE__*/function () {
  function TI() {
    classCallCheck_classCallCheck(this, TI);

    this.ib = false;
  }

  createClass_createClass(TI, [{
    key: "init",
    value: function init(params, res) {
      var sub = params.sub,
          interval = params.interval,
          meta = params.meta,
          $p = params.$props,
          interval_ms = params.interval_ms,
          sub_start = params.sub_start,
          ib = params.ib;
      this.ti_map = [];
      this.it_map = [];
      this.sub_i = [];
      this.ib = ib;
      this.sub = res;
      this.ss = sub_start;
      this.tf = interval_ms;
      var start = meta.sub_start; // Skip mapping for the regular mode

      if (this.ib) {
        this.map_sub(res);
      }
    } // Make maps for the main subset

  }, {
    key: "map_sub",
    value: function map_sub(res) {
      for (var i = 0; i < res.length; i++) {
        var t = res[i][0];

        var _i = this.ss + i;

        this.ti_map[t] = _i;
        this.it_map[_i] = t; // Overwrite t with i

        var copy = _toConsumableArray(res[i]);

        copy[0] = _i;
        this.sub_i.push(copy);
      }
    } // Map overlay data
    // TODO: parse() called 3 times instead of 2 for 'spx_sample.json'

  }, {
    key: "parse",
    value: function parse(data, mode) {
      if (!this.ib || !this.sub[0] || mode === 'data') return data;
      var res = [];
      var k = 0; // Candlestick index

      if (mode === 'calc') {
        var shift = utils.index_shift(this.sub, data);

        for (var i = 0; i < data.length; i++) {
          var _i = this.ss + i;

          var copy = _toConsumableArray(data[i]);

          copy[0] = _i + shift;
          res.push(copy);
        }

        return res;
      } // If indicator data starts after ohlcv, calc the first index


      if (data.length) {
        try {
          var k1 = utils.fast_nearest(this.sub, data[0][0])[0];
          if (k1 !== null && k1 >= 0) k = k1;
        } catch (e) {}
      }

      var t0 = this.sub[0][0];
      var tN = this.sub[this.sub.length - 1][0];

      for (var i = 0; i < data.length; i++) {
        var _copy = _toConsumableArray(data[i]);

        var tk = this.sub[k][0];
        var t = data[i][0];
        var index = this.ti_map[t];

        if (index === undefined) {
          // Linear extrapolation
          if (t < t0 || t > tN) {
            index = this.ss + k - (tk - t) / this.tf;
            t = data[i + 1] ? data[i + 1][0] : undefined;
          } // Linear interpolation
          else {
              var tk2 = this.sub[k + 1][0];
              index = tk === tk2 ? this.ss + k : this.ss + k + (t - tk) / (tk2 - tk);
              t = data[i + 1] ? data[i + 1][0] : undefined;
            }
        } // Race of data points & sub points (ohlcv)
        // (like turn based increments)


        while (k + 1 < this.sub.length - 1 && t > this.sub[k + 1][0]) {
          k++;
          tk = this.sub[k][0];
        }

        _copy[0] = index;
        res.push(_copy);
      }

      return res;
    } // index => time

  }, {
    key: "i2t",
    value: function i2t(i) {
      if (!this.ib || !this.sub.length) return i; // Regular mode
      // Discrete mapping

      var res = this.it_map[i];
      if (res !== undefined) return res; // Linear extrapolation
      else if (i >= this.ss + this.sub_i.length) {
          var di = i - (this.ss + this.sub_i.length) + 1;
          var last = this.sub[this.sub.length - 1];
          return last[0] + di * this.tf;
        } else if (i < this.ss) {
          var _di = i - this.ss;

          return this.sub[0][0] + _di * this.tf;
        } // Linear Interpolation

      var i1 = Math.floor(i) - this.ss;
      var i2 = i1 + 1;
      var len = this.sub.length;
      if (i2 >= len) i2 = len - 1;
      var sub1 = this.sub[i1];
      var sub2 = this.sub[i2];

      if (sub1 && sub2) {
        var t1 = sub1[0];
        var t2 = sub2[0];
        return t1 + (t2 - t1) * (i - i1 - this.ss);
      }

      return undefined;
    } // Map or bypass depending on the mode

  }, {
    key: "i2t_mode",
    value: function i2t_mode(i, mode) {
      return mode === 'data' ? i : this.i2t(i);
    } // time => index
    // TODO: when switch from IB mode to regular tools
    // disappear (bc there is no more mapping)

  }, {
    key: "t2i",
    value: function t2i(t) {
      if (!this.sub.length) return undefined; // Discrete mapping

      var res = this.ti_map[t];
      if (res !== undefined) return res;
      var t0 = this.sub[0][0];
      var tN = this.sub[this.sub.length - 1][0]; // Linear extrapolation

      if (t < t0) {
        return this.ss - (t0 - t) / this.tf;
      } else if (t > tN) {
        var k = this.sub.length - 1;
        return this.ss + k - (tN - t) / this.tf;
      }

      try {
        // Linear Interpolation
        var i = utils.fast_nearest(this.sub, t);
        var tk = this.sub[i[0]][0];
        var tk2 = this.sub[i[1]][0];

        var _k = (t - tk) / (tk2 - tk);

        return this.ss + i[0] + _k * (i[1] - i[0]);
      } catch (e) {}

      return undefined;
    } // Auto detect: is it time or index?
    // Assuming that index-based mode is ON

  }, {
    key: "smth2i",
    value: function smth2i(smth) {
      if (smth > MAX_ARR) {
        return this.t2i(smth); // it was time
      } else {
          return smth; // it was an index
        }
    }
  }, {
    key: "smth2t",
    value: function smth2t(smth) {
      if (smth < MAX_ARR) {
        return this.i2t(smth); // it was an index
      } else {
          return smth; // it was time
        }
    } // Global Time => Index (uses all data, approx. method)
    // Used by tv.goto()

  }, {
    key: "gt2i",
    value: function gt2i(smth, ohlcv) {
      if (smth > MAX_ARR) {
        var E = 0.1; // Fixes the arrayslicer bug

        var _Utils$fast_nearest = utils.fast_nearest(ohlcv, smth + E),
            _Utils$fast_nearest2 = _slicedToArray(_Utils$fast_nearest, 2),
            i1 = _Utils$fast_nearest2[0],
            i2 = _Utils$fast_nearest2[1];

        if (typeof i1 === 'number') {
          return i1;
        } else {
          return this.t2i(smth); // fallback
        }
      } else {
          return smth; // it was an index
        }
    }
  }]);

  return TI;
}();


;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Chart.vue?vue&type=script&lang=js&


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//











/* harmony default export */ const Chartvue_type_script_lang_js_ = ({
  name: 'Chart',
  props: ['title_txt', 'data', 'width', 'height', 'font', 'colors', 'overlays', 'tv_id', 'config', 'buttons', 'toolbar', 'ib', 'skin', 'timezone'],
  mixins: [shaders, datatrack],
  components: {
    GridSection: Section,
    Botbar: components_Botbar,
    Keyboard: Keyboard
  },
  created: function created() {
    // Context for text measurements
    this.ctx = new context(this.$props); // Initial layout (All measurments for the chart)

    this.init_range();
    this.sub = this.subset();
    utils.overwrite(this.range, this.range); // Fix for IB mode

    this._layout = new layout(this); // Updates current cursor values

    this.updater = new updater(this);
    this.update_last_values();
    this.init_shaders(this.skin);
  },
  methods: {
    range_changed: function range_changed(r) {
      // Overwite & keep the original references
      // Quick fix for IB mode (switch 2 next lines)
      // TODO: wtf?
      var sub = this.subset(r);
      utils.overwrite(this.range, r);
      utils.overwrite(this.sub, sub);
      this.update_layout();
      this.$emit('range-changed', r);
      if (this.$props.ib) this.save_data_t();
    },
    "goto": function goto(t) {
      var dt = this.range[1] - this.range[0];
      this.range_changed([t - dt, t]);
    },
    setRange: function setRange(t1, t2) {
      this.range_changed([t1, t2]);
    },
    cursor_changed: function cursor_changed(e) {
      if (e.mode) this.cursor.mode = e.mode;

      if (this.cursor.mode !== 'explore') {
        this.updater.sync(e);
      }

      if (this._hook_xchanged) this.ce('?x-changed', e);
    },
    cursor_locked: function cursor_locked(state) {
      if (this.cursor.scroll_lock && state) return;
      this.cursor.locked = state;
      if (this._hook_xlocked) this.ce('?x-locked', state);
    },
    calc_interval: function calc_interval() {
      var _this = this;

      var tf = utils.parse_tf(this.forced_tf);
      if (this.ohlcv.length < 2 && !tf) return;
      this.interval_ms = tf || utils.detect_interval(this.ohlcv);
      this.interval = this.$props.ib ? 1 : this.interval_ms;
      utils.warn(function () {
        return _this.$props.ib && !_this.chart.tf;
      }, constants.IB_TF_WARN, constants.SECOND);
    },
    set_ytransform: function set_ytransform(s) {
      var obj = this.y_transforms[s.grid_id] || {};
      Object.assign(obj, s);
      this.$set(this.y_transforms, s.grid_id, obj);
      this.update_layout();
      utils.overwrite(this.range, this.range);
    },
    default_range: function default_range() {
      var dl = this.$props.config.DEFAULT_LEN;
      var ml = this.$props.config.MINIMUM_LEN + 0.5;
      var l = this.ohlcv.length - 1;
      if (this.ohlcv.length < 2) return;

      if (this.ohlcv.length <= dl) {
        var s = 0,
            d = ml;
      } else {
        s = l - dl, d = 0.5;
      }

      if (!this.$props.ib) {
        utils.overwrite(this.range, [this.ohlcv[s][0] - this.interval * d, this.ohlcv[l][0] + this.interval * ml]);
      } else {
        utils.overwrite(this.range, [s - this.interval * d, l + this.interval * ml]);
      }
    },
    subset: function subset(range) {
      if (range === void 0) {
        range = this.range;
      }

      var _this$filter = this.filter(this.ohlcv, range[0] - this.interval, range[1]),
          _this$filter2 = _slicedToArray(_this$filter, 2),
          res = _this$filter2[0],
          index = _this$filter2[1];

      this.ti_map = new TI();

      if (res) {
        this.sub_start = index;
        this.ti_map.init(this, res);
        if (!this.$props.ib) return res || [];
        return this.ti_map.sub_i;
      }

      return [];
    },
    common_props: function common_props() {
      return {
        title_txt: this.chart.name || this.$props.title_txt,
        layout: this._layout,
        sub: this.sub,
        range: this.range,
        interval: this.interval,
        cursor: this.cursor,
        colors: this.$props.colors,
        font: this.$props.font,
        y_ts: this.y_transforms,
        tv_id: this.$props.tv_id,
        config: this.$props.config,
        buttons: this.$props.buttons,
        meta: this.meta,
        skin: this.$props.skin
      };
    },
    overlay_subset: function overlay_subset(source, side) {
      var _this2 = this;

      return source.map(function (d, i) {
        var res = utils.fast_filter(d.data, _this2.ti_map.i2t_mode(_this2.range[0] - _this2.interval, d.indexSrc), _this2.ti_map.i2t_mode(_this2.range[1], d.indexSrc));
        return {
          type: d.type,
          name: utils.format_name(d),
          data: _this2.ti_map.parse(res[0] || [], d.indexSrc || 'map'),
          settings: d.settings || _this2.settings_ov,
          grid: d.grid || {},
          tf: utils.parse_tf(d.tf),
          i0: res[1],
          loading: d.loading,
          last: (_this2.last_values[side] || [])[i]
        };
      });
    },
    section_props: function section_props(i) {
      return i === 0 ? this.main_section : this.sub_section;
    },
    init_range: function init_range() {
      this.calc_interval();
      this.default_range();
    },
    layer_meta_props: function layer_meta_props(d) {
      // TODO: check reactivity when layout is changed
      if (!(d.grid_id in this.layers_meta)) {
        this.$set(this.layers_meta, d.grid_id, {});
      }

      this.$set(this.layers_meta[d.grid_id], d.layer_id, d); // Rerender

      this.update_layout();
    },
    remove_meta_props: function remove_meta_props(grid_id, layer_id) {
      if (grid_id in this.layers_meta) {
        this.$delete(this.layers_meta[grid_id], layer_id);
      }
    },
    emit_custom_event: function emit_custom_event(d) {
      this.on_shader_event(d, 'botbar');
      this.$emit('custom-event', d);

      if (d.event === 'remove-layer-meta') {
        this.remove_meta_props.apply(this, _toConsumableArray(d.args));
      }
    },
    update_layout: function update_layout(clac_tf) {
      if (clac_tf) this.calc_interval();
      var lay = new layout(this);
      utils.copy_layout(this._layout, lay);
      if (this._hook_update) this.ce('?chart-update', lay);
    },
    legend_button_click: function legend_button_click(event) {
      this.$emit('legend-button-click', event);
    },
    register_kb: function register_kb(event) {
      if (!this.$refs.keyboard) return;
      this.$refs.keyboard.register(event);
    },
    remove_kb: function remove_kb(event) {
      if (!this.$refs.keyboard) return;
      this.$refs.keyboard.remove(event);
    },
    update_last_values: function update_last_values() {
      var _this3 = this;

      this.last_candle = this.ohlcv ? this.ohlcv[this.ohlcv.length - 1] : undefined;
      this.last_values = {
        onchart: [],
        offchart: []
      };
      this.onchart.forEach(function (x, i) {
        var d = x.data || [];
        _this3.last_values.onchart[i] = d[d.length - 1];
      });
      this.offchart.forEach(function (x, i) {
        var d = x.data || [];
        _this3.last_values.offchart[i] = d[d.length - 1];
      });
    },
    // Hook events for extensions
    ce: function ce(event) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      this.emit_custom_event({
        event: event,
        args: args
      });
    },
    // Set hooks list (called from an extension)
    hooks: function hooks() {
      var _this4 = this;

      for (var _len2 = arguments.length, list = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        list[_key2] = arguments[_key2];
      }

      list.forEach(function (x) {
        return _this4["_hook_".concat(x)] = true;
      });
    }
  },
  computed: {
    // Component-specific props subsets:
    main_section: function main_section() {
      var p = Object.assign({}, this.common_props());
      p.data = this.overlay_subset(this.onchart, 'onchart');
      p.data.push({
        type: this.chart.type || 'Candles',
        main: true,
        data: this.sub,
        i0: this.sub_start,
        settings: this.chart.settings || this.settings_ohlcv,
        grid: this.chart.grid || {},
        last: this.last_candle
      });
      p.overlays = this.$props.overlays;
      return p;
    },
    sub_section: function sub_section() {
      var p = Object.assign({}, this.common_props());
      p.data = this.overlay_subset(this.offchart, 'offchart');
      p.overlays = this.$props.overlays;
      return p;
    },
    botbar_props: function botbar_props() {
      var p = Object.assign({}, this.common_props());
      p.width = p.layout.botbar.width;
      p.height = p.layout.botbar.height;
      p.rerender = this.rerender;
      return p;
    },
    offsub: function offsub() {
      return this.overlay_subset(this.offchart, 'offchart');
    },
    // Datasets: candles, onchart, offchart indicators
    ohlcv: function ohlcv() {
      return this.$props.data.ohlcv || this.chart.data || [];
    },
    chart: function chart() {
      return this.$props.data.chart || {
        grid: {}
      };
    },
    onchart: function onchart() {
      return this.$props.data.onchart || [];
    },
    offchart: function offchart() {
      return this.$props.data.offchart || [];
    },
    filter: function filter() {
      return this.$props.ib ? utils.fast_filter_i : utils.fast_filter;
    },
    styles: function styles() {
      var w = this.$props.toolbar ? this.$props.config.TOOLBAR : 0;
      return {
        'margin-left': "".concat(w, "px")
      };
    },
    meta: function meta() {
      return {
        last: this.last_candle,
        sub_start: this.sub_start,
        activated: this.activated
      };
    },
    forced_tf: function forced_tf() {
      return this.chart.tf;
    }
  },
  data: function data() {
    return {
      // Current data slice
      sub: [],
      // Time range
      range: [],
      // Candlestick interval
      interval: 0,
      // Crosshair states
      cursor: {
        x: null,
        y: null,
        t: null,
        y$: null,
        grid_id: null,
        locked: false,
        values: {},
        scroll_lock: false,
        mode: utils.xmode()
      },
      // A trick to re-render botbar
      rerender: 0,
      // Layers meta-props (changing behaviour)
      layers_meta: {},
      // Y-transforms (for y-zoom and -shift)
      y_transforms: {},
      // Default OHLCV settings (when using DataStructure v1.0)
      settings_ohlcv: {},
      // Default overlay settings
      settings_ov: {},
      // Meta data
      last_candle: [],
      last_values: {},
      sub_start: undefined,
      activated: false
    };
  },
  watch: {
    width: function width() {
      this.update_layout();
      if (this._hook_resize) this.ce('?chart-resize');
    },
    height: function height() {
      this.update_layout();
      if (this._hook_resize) this.ce('?chart-resize');
    },
    ib: function ib(nw) {
      if (!nw) {
        // Change range index => time
        var t1 = this.ti_map.i2t(this.range[0]);
        var t2 = this.ti_map.i2t(this.range[1]);
        utils.overwrite(this.range, [t1, t2]);
        this.interval = this.interval_ms;
      } else {
        this.init_range(); // TODO: calc index range instead

        utils.overwrite(this.range, this.range);
        this.interval = 1;
      }

      var sub = this.subset();
      utils.overwrite(this.sub, sub);
      this.update_layout();
    },
    timezone: function timezone() {
      this.update_layout();
    },
    colors: function colors() {
      utils.overwrite(this.range, this.range);
    },
    forced_tf: function forced_tf(n, p) {
      this.update_layout(true);
      this.ce('exec-all-scripts');
    },
    data: {
      handler: function handler(n, p) {
        if (!this.sub.length) this.init_range();
        var sub = this.subset(); // Fixes Infinite loop warn, when the subset is empty
        // TODO: Consider removing 'sub' from data entirely

        if (this.sub.length || sub.length) {
          utils.overwrite(this.sub, sub);
        }

        var nw = this.data_changed();
        this.update_layout(nw);
        utils.overwrite(this.range, this.range);
        this.cursor.scroll_lock = !!n.scrollLock;

        if (n.scrollLock && this.cursor.locked) {
          this.cursor.locked = false;
        }

        if (this._hook_data) this.ce('?chart-data', nw);
        this.update_last_values(); // TODO: update legend values for overalys

        this.rerender++;
      },
      deep: true
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Chart.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Chartvue_type_script_lang_js_ = (Chartvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Chart.vue





/* normalize component */
;
var Chart_component = normalizeComponent(
  components_Chartvue_type_script_lang_js_,
  Chartvue_type_template_id_4d06a4de_render,
  Chartvue_type_template_id_4d06a4de_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Chart_api; }
Chart_component.options.__file = "src/components/Chart.vue"
/* harmony default export */ const Chart = (Chart_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=template&id=021887fb&
var Toolbarvue_type_template_id_021887fb_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      key: _vm.tool_count,
      staticClass: "trading-vue-toolbar",
      style: _vm.styles
    },
    _vm._l(_vm.groups, function(tool, i) {
      return tool.icon && !tool.hidden
        ? _c("toolbar-item", {
            key: i,
            attrs: {
              data: tool,
              subs: _vm.sub_map,
              dc: _vm.data,
              config: _vm.config,
              colors: _vm.colors,
              selected: _vm.is_selected(tool)
            },
            on: { "item-selected": _vm.selected }
          })
        : _vm._e()
    }),
    1
  )
}
var Toolbarvue_type_template_id_021887fb_staticRenderFns = []
Toolbarvue_type_template_id_021887fb_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=template&id=021887fb&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=template&id=227b3c2e&
var ToolbarItemvue_type_template_id_227b3c2e_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      class: ["trading-vue-tbitem", _vm.selected ? "selected-item" : ""],
      style: _vm.item_style,
      on: {
        click: function($event) {
          return _vm.emit_selected("click")
        },
        mousedown: _vm.mousedown,
        touchstart: _vm.mousedown,
        touchend: function($event) {
          return _vm.emit_selected("touch")
        }
      }
    },
    [
      _c("div", {
        staticClass: "trading-vue-tbicon tvjs-pixelated",
        style: _vm.icon_style
      }),
      _vm._v(" "),
      _vm.data.group
        ? _c(
            "div",
            {
              staticClass: "trading-vue-tbitem-exp",
              style: _vm.exp_style,
              on: {
                click: _vm.exp_click,
                mousedown: _vm.expmousedown,
                mouseover: _vm.expmouseover,
                mouseleave: _vm.expmouseleave
              }
            },
            [_vm._v("\n        ᐳ\n    ")]
          )
        : _vm._e(),
      _vm._v(" "),
      _vm.show_exp_list
        ? _c("item-list", {
            attrs: {
              config: _vm.config,
              items: _vm.data.items,
              colors: _vm.colors,
              dc: _vm.dc
            },
            on: {
              "close-list": _vm.close_list,
              "item-selected": _vm.emit_selected_sub
            }
          })
        : _vm._e()
    ],
    1
  )
}
var ToolbarItemvue_type_template_id_227b3c2e_staticRenderFns = []
ToolbarItemvue_type_template_id_227b3c2e_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=template&id=227b3c2e&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=template&id=c50b23fe&
var ItemListvue_type_template_id_c50b23fe_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "tvjs-item-list",
      style: _vm.list_style(),
      on: { mousedown: _vm.thismousedown }
    },
    _vm._l(_vm.items, function(item) {
      return !item.hidden
        ? _c(
            "div",
            {
              class: _vm.item_class(item),
              style: _vm.item_style(item),
              on: {
                click: function(e) {
                  return _vm.item_click(e, item)
                }
              }
            },
            [
              _c("div", {
                staticClass: "trading-vue-tbicon tvjs-pixelated",
                style: _vm.icon_style(item)
              }),
              _vm._v(" "),
              _c("div", [_vm._v(_vm._s(item.type))])
            ]
          )
        : _vm._e()
    }),
    0
  )
}
var ItemListvue_type_template_id_c50b23fe_staticRenderFns = []
ItemListvue_type_template_id_c50b23fe_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=template&id=c50b23fe&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ const ItemListvue_type_script_lang_js_ = ({
  name: 'ItemList',
  props: ['config', 'items', 'colors', 'dc'],
  mounted: function mounted() {
    window.addEventListener('mousedown', this.onmousedown);
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('mousedown', this.onmousedown);
  },
  methods: {
    list_style: function list_style() {
      var conf = this.$props.config;
      var w = conf.TOOLBAR;
      var brd = this.colors.tbListBorder || this.colors.grid;
      var bstl = "1px solid ".concat(brd);
      return {
        left: "".concat(w, "px"),
        background: this.colors.back,
        borderTop: bstl,
        borderRight: bstl,
        borderBottom: bstl
      };
    },
    item_class: function item_class(item) {
      if (this.dc.tool === item.type) {
        return "tvjs-item-list-item selected-item";
      }

      return "tvjs-item-list-item";
    },
    item_style: function item_style(item) {
      var conf = this.$props.config;
      var h = conf.TB_ICON + conf.TB_ITEM_M * 2 + 8;
      var sel = this.dc.tool === item.type;
      return {
        height: "".concat(h, "px"),
        color: sel ? undefined : "#888888"
      };
    },
    icon_style: function icon_style(data) {
      var conf = this.$props.config;
      var br = conf.TB_ICON_BRI;
      var im = conf.TB_ITEM_M;
      return {
        'background-image': "url(".concat(data.icon, ")"),
        'width': '25px',
        'height': '25px',
        'margin': "".concat(im, "px"),
        'filter': "brightness(".concat(br, ")")
      };
    },
    item_click: function item_click(e, item) {
      e.cancelBubble = true;
      this.$emit('item-selected', item);
      this.$emit('close-list');
    },
    onmousedown: function onmousedown() {
      this.$emit('close-list');
    },
    thismousedown: function thismousedown(e) {
      e.stopPropagation();
    }
  },
  computed: {},
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_ItemListvue_type_script_lang_js_ = (ItemListvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=style&index=0&lang=css&
var ItemListvue_type_style_index_0_lang_css_ = __webpack_require__(3807);
;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/ItemList.vue



;


/* normalize component */

var ItemList_component = normalizeComponent(
  components_ItemListvue_type_script_lang_js_,
  ItemListvue_type_template_id_c50b23fe_render,
  ItemListvue_type_template_id_c50b23fe_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var ItemList_api; }
ItemList_component.options.__file = "src/components/ItemList.vue"
/* harmony default export */ const ItemList = (ItemList_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ const ToolbarItemvue_type_script_lang_js_ = ({
  name: 'ToolbarItem',
  props: ['data', 'selected', 'colors', 'tv_id', 'config', 'dc', 'subs'],
  components: {
    ItemList: ItemList
  },
  mounted: function mounted() {
    if (this.data.group) {
      var type = this.subs[this.data.group];
      var item = this.data.items.find(function (x) {
        return x.type === type;
      });
      if (item) this.sub_item = item;
    }
  },
  methods: {
    mousedown: function mousedown(e) {
      var _this = this;

      this.click_start = utils.now();
      this.click_id = setTimeout(function () {
        _this.show_exp_list = true;
      }, this.config.TB_ICON_HOLD);
    },
    expmouseover: function expmouseover() {
      this.exp_hover = true;
    },
    expmouseleave: function expmouseleave() {
      this.exp_hover = false;
    },
    expmousedown: function expmousedown(e) {
      if (this.show_exp_list) e.stopPropagation();
    },
    emit_selected: function emit_selected(src) {
      if (utils.now() - this.click_start > this.config.TB_ICON_HOLD) return;
      clearTimeout(this.click_id); //if (Utils.is_mobile && src === 'click') return
      // TODO: double firing

      if (!this.data.group) {
        this.$emit('item-selected', this.data);
      } else {
        var item = this.sub_item || this.data.items[0];
        this.$emit('item-selected', item);
      }
    },
    emit_selected_sub: function emit_selected_sub(item) {
      this.$emit('item-selected', item);
      this.sub_item = item;
    },
    exp_click: function exp_click(e) {
      if (!this.data.group) return;
      e.cancelBubble = true;
      this.show_exp_list = !this.show_exp_list;
    },
    close_list: function close_list() {
      this.show_exp_list = false;
    }
  },
  computed: {
    item_style: function item_style() {
      if (this.$props.data.type === 'System:Splitter') {
        return this.splitter;
      }

      var conf = this.$props.config;
      var im = conf.TB_ITEM_M;
      var m = (conf.TOOLBAR - conf.TB_ICON) * 0.5 - im;
      var s = conf.TB_ICON + im * 2;
      var b = this.exp_hover ? 0 : 3;
      return {
        'width': "".concat(s, "px"),
        'height': "".concat(s, "px"),
        'margin': "8px ".concat(m, "px 0px ").concat(m, "px"),
        'border-radius': "3px ".concat(b, "px ").concat(b, "px 3px")
      };
    },
    icon_style: function icon_style() {
      if (this.$props.data.type === 'System:Splitter') {
        return {};
      }

      var conf = this.$props.config;
      var br = conf.TB_ICON_BRI;
      var sz = conf.TB_ICON;
      var im = conf.TB_ITEM_M;
      var ic = this.sub_item ? this.sub_item.icon : this.$props.data.icon;
      return {
        'background-image': "url(".concat(ic, ")"),
        'width': "".concat(sz, "px"),
        'height': "".concat(sz, "px"),
        'margin': "".concat(im, "px"),
        'filter': "brightness(".concat(br, ")")
      };
    },
    exp_style: function exp_style() {
      var conf = this.$props.config;
      var im = conf.TB_ITEM_M;
      var s = conf.TB_ICON * 0.5 + im;
      var p = (conf.TOOLBAR - s * 2) / 4;
      return {
        padding: "".concat(s, "px ").concat(p, "px"),
        transform: this.show_exp_list ? "scale(-0.6, 1)" : "scaleX(0.6)"
      };
    },
    splitter: function splitter() {
      var conf = this.$props.config;
      var colors = this.$props.colors;
      var c = colors.grid;
      var im = conf.TB_ITEM_M;
      var m = (conf.TOOLBAR - conf.TB_ICON) * 0.5 - im;
      var s = conf.TB_ICON + im * 2;
      return {
        'width': "".concat(s, "px"),
        'height': '1px',
        'margin': "8px ".concat(m, "px 8px ").concat(m, "px"),
        'background-color': c
      };
    }
  },
  data: function data() {
    return {
      exp_hover: false,
      show_exp_list: false,
      sub_item: null
    };
  }
});
;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_ToolbarItemvue_type_script_lang_js_ = (ToolbarItemvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=style&index=0&lang=css&
var ToolbarItemvue_type_style_index_0_lang_css_ = __webpack_require__(3501);
;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue



;


/* normalize component */

var ToolbarItem_component = normalizeComponent(
  components_ToolbarItemvue_type_script_lang_js_,
  ToolbarItemvue_type_template_id_227b3c2e_render,
  ToolbarItemvue_type_template_id_227b3c2e_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var ToolbarItem_api; }
ToolbarItem_component.options.__file = "src/components/ToolbarItem.vue"
/* harmony default export */ const ToolbarItem = (ToolbarItem_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=script&lang=js&
function Toolbarvue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = Toolbarvue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function Toolbarvue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Toolbarvue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Toolbarvue_type_script_lang_js_arrayLikeToArray(o, minLen); }

function Toolbarvue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ const Toolbarvue_type_script_lang_js_ = ({
  name: 'Toolbar',
  props: ['data', 'height', 'colors', 'tv_id', 'config'],
  components: {
    ToolbarItem: ToolbarItem
  },
  mounted: function mounted() {},
  methods: {
    selected: function selected(tool) {
      this.$emit('custom-event', {
        event: 'tool-selected',
        args: [tool.type]
      });

      if (tool.group) {
        // TODO: emit the sub map to DC (save)
        this.sub_map[tool.group] = tool.type;
      }
    },
    is_selected: function is_selected(tool) {
      var _this = this;

      if (tool.group) {
        return !!tool.items.find(function (x) {
          return x.type === _this.data.tool;
        });
      }

      return tool.type === this.data.tool;
    }
  },
  computed: {
    styles: function styles() {
      var colors = this.$props.colors;
      var b = this.$props.config.TB_BORDER;
      var w = this.$props.config.TOOLBAR - b;
      var c = colors.grid;
      var cb = colors.tbBack || colors.back;
      var brd = colors.tbBorder || colors.scale;
      var st = this.$props.config.TB_B_STYLE;
      return {
        'width': "".concat(w, "px"),
        'height': "".concat(this.$props.height - 3, "px"),
        'background-color': cb,
        'border-right': "".concat(b, "px ").concat(st, " ").concat(brd)
      };
    },
    groups: function groups() {
      var arr = [];

      var _iterator = Toolbarvue_type_script_lang_js_createForOfIteratorHelper(this.data.tools || []),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var tool = _step.value;

          if (!tool.group) {
            arr.push(tool);
            continue;
          }

          var g = arr.find(function (x) {
            return x.group === tool.group;
          });

          if (!g) {
            arr.push({
              group: tool.group,
              icon: tool.icon,
              items: [tool]
            });
          } else {
            g.items.push(tool);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return arr;
    }
  },
  watch: {
    data: {
      handler: function handler(n) {
        // For some reason Vue.js doesn't want to
        // update 'tools' automatically when new item
        // is pushed/removed. Yo, Vue, I herd you
        // you want more dirty tricks?
        if (n.tools) this.tool_count = n.tools.length;
      },
      deep: true
    }
  },
  data: function data() {
    return {
      tool_count: 0,
      sub_map: {}
    };
  }
});
;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Toolbarvue_type_script_lang_js_ = (Toolbarvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=style&index=0&lang=css&
var Toolbarvue_type_style_index_0_lang_css_ = __webpack_require__(3153);
;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/Toolbar.vue



;


/* normalize component */

var Toolbar_component = normalizeComponent(
  components_Toolbarvue_type_script_lang_js_,
  Toolbarvue_type_template_id_021887fb_render,
  Toolbarvue_type_template_id_021887fb_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Toolbar_api; }
Toolbar_component.options.__file = "src/components/Toolbar.vue"
/* harmony default export */ const Toolbar = (Toolbar_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=template&id=5fe4312f&
var Widgetsvue_type_template_id_5fe4312f_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "tvjs-widgets",
      style: { width: _vm.width + "px", height: _vm.height + "px" }
    },
    _vm._l(Object.keys(_vm.map), function(id) {
      return _c(_vm.initw(id), {
        key: id,
        tag: "component",
        attrs: {
          id: id,
          main: _vm.map[id].ctrl,
          data: _vm.map[id].data,
          tv: _vm.tv,
          dc: _vm.dc
        }
      })
    }),
    1
  )
}
var Widgetsvue_type_template_id_5fe4312f_staticRenderFns = []
Widgetsvue_type_template_id_5fe4312f_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=template&id=5fe4312f&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ const Widgetsvue_type_script_lang_js_ = ({
  name: 'Widgets',
  props: ['width', 'height', 'map', 'tv', 'dc'],
  methods: {
    initw: function initw(id) {
      return this.$props.map[id].cls;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Widgetsvue_type_script_lang_js_ = (Widgetsvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=style&index=0&lang=css&
var Widgetsvue_type_style_index_0_lang_css_ = __webpack_require__(8005);
;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/Widgets.vue



;


/* normalize component */

var Widgets_component = normalizeComponent(
  components_Widgetsvue_type_script_lang_js_,
  Widgetsvue_type_template_id_5fe4312f_render,
  Widgetsvue_type_template_id_5fe4312f_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Widgets_api; }
Widgets_component.options.__file = "src/components/Widgets.vue"
/* harmony default export */ const Widgets = (Widgets_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=template&id=2c1770cc&
var TheTipvue_type_template_id_2c1770cc_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", {
    staticClass: "tvjs-the-tip",
    style: _vm.style,
    domProps: { innerHTML: _vm._s(_vm.data.text) },
    on: {
      mousedown: function($event) {
        return _vm.$emit("remove-me")
      }
    }
  })
}
var TheTipvue_type_template_id_2c1770cc_staticRenderFns = []
TheTipvue_type_template_id_2c1770cc_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=template&id=2c1770cc&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=script&lang=js&
//
//
//
//
//
//
/* harmony default export */ const TheTipvue_type_script_lang_js_ = ({
  name: 'TheTip',
  props: ['data'],
  mounted: function mounted() {
    var _this = this;

    setTimeout(function () {
      return _this.$emit('remove-me');
    }, 3000);
  },
  computed: {
    style: function style() {
      return {
        background: this.data.color
      };
    }
  }
});
;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_TheTipvue_type_script_lang_js_ = (TheTipvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=style&index=0&lang=css&
var TheTipvue_type_style_index_0_lang_css_ = __webpack_require__(7477);
;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/TheTip.vue



;


/* normalize component */

var TheTip_component = normalizeComponent(
  components_TheTipvue_type_script_lang_js_,
  TheTipvue_type_template_id_2c1770cc_render,
  TheTipvue_type_template_id_2c1770cc_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var TheTip_api; }
TheTip_component.options.__file = "src/components/TheTip.vue"
/* harmony default export */ const TheTip = (TheTip_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TFSelector.vue?vue&type=template&id=0ee703fe&scoped=true&
var TFSelectorvue_type_template_id_0ee703fe_scoped_true_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "tvjs-tf-selector", class: { "tvjs-tf-night": _vm.night } },
    _vm._l(_vm.timeframeGroups, function(group) {
      return _c("div", { key: group.name, staticClass: "tf-group" }, [
        _c("div", { staticClass: "tf-group-label" }, [
          _vm._v(_vm._s(group.label))
        ]),
        _vm._v(" "),
        _c(
          "div",
          { staticClass: "tf-buttons" },
          _vm._l(group.timeframes, function(tf) {
            return _c(
              "button",
              {
                key: tf.value,
                staticClass: "tf-btn",
                class: {
                  "tf-btn-active": _vm.selectedTF === tf.value,
                  "tf-btn-hot": tf.hotkey
                },
                attrs: {
                  title: tf.hotkey
                    ? tf.label + " (" + tf.hotkey + ")"
                    : tf.label
                },
                on: {
                  click: function($event) {
                    return _vm.selectTF(tf.value)
                  }
                }
              },
              [
                _vm._v(
                  "\n                " + _vm._s(tf.label) + "\n            "
                )
              ]
            )
          }),
          0
        )
      ])
    }),
    0
  )
}
var TFSelectorvue_type_template_id_0ee703fe_scoped_true_staticRenderFns = []
TFSelectorvue_type_template_id_0ee703fe_scoped_true_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/TFSelector.vue?vue&type=template&id=0ee703fe&scoped=true&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TFSelector.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ const TFSelectorvue_type_script_lang_js_ = ({
  name: 'TFSelector',
  props: {
    // Current selected timeframe
    value: {
      type: String,
      "default": '1D'
    },
    // Night mode
    night: {
      type: Boolean,
      "default": true
    },
    // Show seconds timeframes
    showSeconds: {
      type: Boolean,
      "default": false
    },
    // Show extended timeframes
    extended: {
      type: Boolean,
      "default": false
    }
  },
  data: function data() {
    return {
      selectedTF: this.value
    };
  },
  computed: {
    timeframeGroups: function timeframeGroups() {
      var groups = []; // Seconds (rarely used, hidden by default)

      if (this.$props.showSeconds) {
        groups.push({
          name: 'seconds',
          label: 'Секунды',
          timeframes: [{
            value: '1s',
            label: '1s'
          }, {
            value: '5s',
            label: '5s'
          }, {
            value: '15s',
            label: '15s'
          }, {
            value: '30s',
            label: '30s'
          }]
        });
      } // Minutes


      var minuteTFs = [{
        value: '1',
        label: '1',
        hotkey: '1'
      }, {
        value: '3',
        label: '3',
        hotkey: '3'
      }, {
        value: '5',
        label: '5',
        hotkey: '5'
      }, {
        value: '15',
        label: '15',
        hotkey: '15'
      }, {
        value: '30',
        label: '30',
        hotkey: '30'
      }, {
        value: '45',
        label: '45'
      }];

      if (this.$props.extended) {
        minuteTFs.push({
          value: '2',
          label: '2'
        }, {
          value: '10',
          label: '10'
        }, {
          value: '20',
          label: '20'
        }, {
          value: '60',
          label: '60'
        }, {
          value: '90',
          label: '90'
        }, {
          value: '120',
          label: '120'
        });
      }

      groups.push({
        name: 'minutes',
        label: 'Минуты',
        timeframes: minuteTFs.sort(function (a, b) {
          return parseInt(a.value) - parseInt(b.value);
        })
      }); // Hours

      var hourTFs = [{
        value: '60',
        label: '1H',
        hotkey: 'H'
      }, {
        value: '120',
        label: '2H'
      }, {
        value: '180',
        label: '3H'
      }, {
        value: '240',
        label: '4H',
        hotkey: '4'
      }, {
        value: '360',
        label: '6H'
      }, {
        value: '720',
        label: '12H'
      }];

      if (this.$props.extended) {
        hourTFs.push({
          value: '480',
          label: '8H'
        });
      }

      groups.push({
        name: 'hours',
        label: 'Часы',
        timeframes: hourTFs.sort(function (a, b) {
          return parseInt(a.value) - parseInt(b.value);
        })
      }); // Days

      groups.push({
        name: 'days',
        label: 'Дни',
        timeframes: [{
          value: '1D',
          label: 'D',
          hotkey: 'D'
        }, {
          value: '2D',
          label: '2D'
        }, {
          value: '3D',
          label: '3D'
        }, {
          value: '1W',
          label: 'W',
          hotkey: 'W'
        }, {
          value: '1M',
          label: 'M',
          hotkey: 'M'
        }]
      }); // Months & Years (extended)

      if (this.$props.extended) {
        groups.push({
          name: 'months',
          label: 'Месяцы/Годы',
          timeframes: [{
            value: '3M',
            label: '3M'
          }, {
            value: '6M',
            label: '6M'
          }, {
            value: '12M',
            label: '12M'
          }, {
            value: '1Y',
            label: '1Y'
          }]
        });
      }

      return groups;
    }
  },
  methods: {
    selectTF: function selectTF(tf) {
      this.selectedTF = tf;
      this.$emit('input', tf);
      this.$emit('change', tf);
    },
    // Keyboard shortcuts support
    handleKeydown: function handleKeydown(e) {
      var hotkeys = {
        '1': '1',
        '3': '3',
        '5': '5',
        'Digit1': '1',
        'Digit3': '3',
        'Digit5': '5',
        'h': '60',
        'H': '60',
        '4': '240',
        'Digit4': '240',
        'd': '1D',
        'D': '1D',
        'w': '1W',
        'W': '1W',
        'm': '1M',
        'M': '1M'
      }; // Check for modifier keys

      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var tf = hotkeys[e.key] || hotkeys[e.code];

      if (tf) {
        this.selectTF(tf);
      }
    }
  },
  mounted: function mounted() {
    window.addEventListener('keydown', this.handleKeydown);
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeydown);
  },
  watch: {
    value: function value(newVal) {
      this.selectedTF = newVal;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/TFSelector.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_TFSelectorvue_type_script_lang_js_ = (TFSelectorvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TFSelector.vue?vue&type=style&index=0&id=0ee703fe&scoped=true&lang=css&
var TFSelectorvue_type_style_index_0_id_0ee703fe_scoped_true_lang_css_ = __webpack_require__(3611);
;// CONCATENATED MODULE: ./src/components/TFSelector.vue?vue&type=style&index=0&id=0ee703fe&scoped=true&lang=css&

;// CONCATENATED MODULE: ./src/components/TFSelector.vue



;


/* normalize component */

var TFSelector_component = normalizeComponent(
  components_TFSelectorvue_type_script_lang_js_,
  TFSelectorvue_type_template_id_0ee703fe_scoped_true_render,
  TFSelectorvue_type_template_id_0ee703fe_scoped_true_staticRenderFns,
  false,
  null,
  "0ee703fe",
  null
  
)

/* hot reload */
if (false) { var TFSelector_api; }
TFSelector_component.options.__file = "src/components/TFSelector.vue"
/* harmony default export */ const TFSelector = (TFSelector_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TFSelectorDropdown.vue?vue&type=template&id=3f5b2cb2&scoped=true&
var TFSelectorDropdownvue_type_template_id_3f5b2cb2_scoped_true_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "tvjs-tf-dropdown", class: { "tvjs-tf-night": _vm.night } },
    [
      _c(
        "button",
        {
          staticClass: "tf-dropdown-toggle",
          class: { "tf-dropdown-open": _vm.isOpen },
          on: { click: _vm.toggleDropdown }
        },
        [
          _c("span", { staticClass: "tf-current-label" }, [
            _vm._v(_vm._s(_vm.currentLabel))
          ]),
          _vm._v(" "),
          _c(
            "svg",
            {
              staticClass: "tf-arrow",
              class: { "tf-arrow-up": _vm.isOpen },
              attrs: { width: "10", height: "6", viewBox: "0 0 10 6" }
            },
            [
              _c("path", {
                attrs: {
                  d: "M1 1L5 5L9 1",
                  stroke: "currentColor",
                  "stroke-width": "1.5",
                  fill: "none"
                }
              })
            ]
          )
        ]
      ),
      _vm._v(" "),
      _c("transition", { attrs: { name: "tf-dropdown" } }, [
        _vm.isOpen
          ? _c(
              "div",
              {
                staticClass: "tf-dropdown-menu",
                on: {
                  click: function($event) {
                    $event.stopPropagation()
                  }
                }
              },
              [
                _c(
                  "div",
                  { staticClass: "tf-quick-row" },
                  _vm._l(_vm.quickTimeframes, function(tf) {
                    return _c(
                      "button",
                      {
                        key: tf.value,
                        staticClass: "tf-quick-btn",
                        class: { "tf-btn-active": _vm.selectedTF === tf.value },
                        on: {
                          click: function($event) {
                            return _vm.selectTF(tf.value)
                          }
                        }
                      },
                      [
                        _vm._v(
                          "\n                    " +
                            _vm._s(tf.label) +
                            "\n                "
                        )
                      ]
                    )
                  }),
                  0
                ),
                _vm._v(" "),
                _c("div", { staticClass: "tf-divider" }),
                _vm._v(" "),
                _vm._l(_vm.timeframeSections, function(section) {
                  return _c(
                    "div",
                    { key: section.name, staticClass: "tf-section" },
                    [
                      _c("div", { staticClass: "tf-section-header" }, [
                        _vm._v(_vm._s(section.label))
                      ]),
                      _vm._v(" "),
                      _c(
                        "div",
                        { staticClass: "tf-section-grid" },
                        _vm._l(section.timeframes, function(tf) {
                          return _c(
                            "button",
                            {
                              key: tf.value,
                              staticClass: "tf-menu-btn",
                              class: {
                                "tf-btn-active": _vm.selectedTF === tf.value
                              },
                              attrs: { title: tf.description || "" },
                              on: {
                                click: function($event) {
                                  return _vm.selectTF(tf.value)
                                }
                              }
                            },
                            [
                              _vm._v(
                                "\n                        " +
                                  _vm._s(tf.label) +
                                  "\n                    "
                              )
                            ]
                          )
                        }),
                        0
                      )
                    ]
                  )
                }),
                _vm._v(" "),
                _c("div", { staticClass: "tf-divider" }),
                _vm._v(" "),
                _c("div", { staticClass: "tf-custom" }, [
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.customTF,
                        expression: "customTF"
                      }
                    ],
                    staticClass: "tf-custom-input",
                    attrs: {
                      type: "text",
                      placeholder: "Свой период (напр. 45m, 2h)"
                    },
                    domProps: { value: _vm.customTF },
                    on: {
                      keyup: function($event) {
                        if (
                          !$event.type.indexOf("key") &&
                          _vm._k(
                            $event.keyCode,
                            "enter",
                            13,
                            $event.key,
                            "Enter"
                          )
                        ) {
                          return null
                        }
                        return _vm.applyCustomTF($event)
                      },
                      input: function($event) {
                        if ($event.target.composing) {
                          return
                        }
                        _vm.customTF = $event.target.value
                      }
                    }
                  }),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass: "tf-custom-apply",
                      on: { click: _vm.applyCustomTF }
                    },
                    [_vm._v("OK")]
                  )
                ])
              ],
              2
            )
          : _vm._e()
      ])
    ],
    1
  )
}
var TFSelectorDropdownvue_type_template_id_3f5b2cb2_scoped_true_staticRenderFns = []
TFSelectorDropdownvue_type_template_id_3f5b2cb2_scoped_true_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/TFSelectorDropdown.vue?vue&type=template&id=3f5b2cb2&scoped=true&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TFSelectorDropdown.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ const TFSelectorDropdownvue_type_script_lang_js_ = ({
  name: 'TFSelectorDropdown',
  props: {
    value: {
      type: String,
      "default": '1D'
    },
    night: {
      type: Boolean,
      "default": true
    }
  },
  data: function data() {
    return {
      selectedTF: this.value,
      isOpen: false,
      customTF: ''
    };
  },
  computed: {
    currentLabel: function currentLabel() {
      var _this = this;

      var allTFs = this.allTimeframes;
      var found = allTFs.find(function (tf) {
        return tf.value === _this.selectedTF;
      });
      if (found) return found.label;
      return this.selectedTF;
    },
    quickTimeframes: function quickTimeframes() {
      return [{
        value: '1',
        label: '1m'
      }, {
        value: '5',
        label: '5m'
      }, {
        value: '15',
        label: '15m'
      }, {
        value: '60',
        label: '1H'
      }, {
        value: '240',
        label: '4H'
      }, {
        value: '1D',
        label: 'D'
      }, {
        value: '1W',
        label: 'W'
      }, {
        value: '1M',
        label: 'M'
      }];
    },
    timeframeSections: function timeframeSections() {
      return [{
        name: 'seconds',
        label: 'Секунды',
        timeframes: [{
          value: '1s',
          label: '1s',
          description: '1 секунда'
        }, {
          value: '5s',
          label: '5s',
          description: '5 секунд'
        }, {
          value: '15s',
          label: '15s',
          description: '15 секунд'
        }, {
          value: '30s',
          label: '30s',
          description: '30 секунд'
        }]
      }, {
        name: 'minutes',
        label: 'Минуты',
        timeframes: [{
          value: '1',
          label: '1m',
          description: '1 минута'
        }, {
          value: '2',
          label: '2m',
          description: '2 минуты'
        }, {
          value: '3',
          label: '3m',
          description: '3 минуты'
        }, {
          value: '5',
          label: '5m',
          description: '5 минут'
        }, {
          value: '10',
          label: '10m',
          description: '10 минут'
        }, {
          value: '15',
          label: '15m',
          description: '15 минут'
        }, {
          value: '20',
          label: '20m',
          description: '20 минут'
        }, {
          value: '30',
          label: '30m',
          description: '30 минут'
        }, {
          value: '45',
          label: '45m',
          description: '45 минут'
        }]
      }, {
        name: 'hours',
        label: 'Часы',
        timeframes: [{
          value: '60',
          label: '1H',
          description: '1 час'
        }, {
          value: '120',
          label: '2H',
          description: '2 часа'
        }, {
          value: '180',
          label: '3H',
          description: '3 часа'
        }, {
          value: '240',
          label: '4H',
          description: '4 часа'
        }, {
          value: '360',
          label: '6H',
          description: '6 часов'
        }, {
          value: '480',
          label: '8H',
          description: '8 часов'
        }, {
          value: '720',
          label: '12H',
          description: '12 часов'
        }]
      }, {
        name: 'days',
        label: 'Дни',
        timeframes: [{
          value: '1D',
          label: 'D',
          description: '1 день'
        }, {
          value: '2D',
          label: '2D',
          description: '2 дня'
        }, {
          value: '3D',
          label: '3D',
          description: '3 дня'
        }, {
          value: '1W',
          label: 'W',
          description: '1 неделя'
        }, {
          value: '2W',
          label: '2W',
          description: '2 недели'
        }]
      }, {
        name: 'months',
        label: 'Месяцы',
        timeframes: [{
          value: '1M',
          label: 'M',
          description: '1 месяц'
        }, {
          value: '3M',
          label: '3M',
          description: '3 месяца'
        }, {
          value: '6M',
          label: '6M',
          description: '6 месяцев'
        }, {
          value: '12M',
          label: '12M',
          description: '12 месяцев'
        }, {
          value: '1Y',
          label: 'Y',
          description: '1 год'
        }]
      }];
    },
    allTimeframes: function allTimeframes() {
      return this.timeframeSections.reduce(function (acc, section) {
        return acc.concat(section.timeframes);
      }, this.quickTimeframes);
    }
  },
  methods: {
    toggleDropdown: function toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    closeDropdown: function closeDropdown() {
      this.isOpen = false;
    },
    selectTF: function selectTF(tf) {
      this.selectedTF = tf;
      this.$emit('input', tf);
      this.$emit('change', tf);
      this.closeDropdown();
    },
    applyCustomTF: function applyCustomTF() {
      if (this.customTF.trim()) {
        // Parse custom timeframe (e.g., "45m", "2h", "3D")
        var parsed = this.parseTimeframe(this.customTF.trim());

        if (parsed) {
          this.selectTF(parsed);
          this.customTF = '';
        }
      }
    },
    parseTimeframe: function parseTimeframe(input) {
      // Match patterns like "45m", "2h", "3D", "1W"
      var match = input.match(/^(\d+)(s|m|h|D|W|M|Y)$/i);

      if (match) {
        var num = parseInt(match[1]);
        var unit = match[2].toUpperCase(); // Convert to standard format

        switch (unit) {
          case 'S':
            return "".concat(num, "s");

          case 'M':
            return num === 1 ? '1M' : "".concat(num * 30);
          // Approximate for months

          case 'H':
            return "".concat(num * 60);

          case 'D':
            return num === 1 ? '1D' : "".concat(num, "D");

          case 'W':
            return num === 1 ? '1W' : "".concat(num, "W");

          case 'Y':
            return '1Y';

          default:
            return input;
        }
      } // Plain number = minutes


      if (/^\d+$/.test(input)) {
        return input;
      }

      return input;
    },
    handleClickOutside: function handleClickOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.closeDropdown();
      }
    }
  },
  mounted: function mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy: function beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  watch: {
    value: function value(newVal) {
      this.selectedTF = newVal;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/TFSelectorDropdown.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_TFSelectorDropdownvue_type_script_lang_js_ = (TFSelectorDropdownvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TFSelectorDropdown.vue?vue&type=style&index=0&id=3f5b2cb2&scoped=true&lang=css&
var TFSelectorDropdownvue_type_style_index_0_id_3f5b2cb2_scoped_true_lang_css_ = __webpack_require__(6270);
;// CONCATENATED MODULE: ./src/components/TFSelectorDropdown.vue?vue&type=style&index=0&id=3f5b2cb2&scoped=true&lang=css&

;// CONCATENATED MODULE: ./src/components/TFSelectorDropdown.vue



;


/* normalize component */

var TFSelectorDropdown_component = normalizeComponent(
  components_TFSelectorDropdownvue_type_script_lang_js_,
  TFSelectorDropdownvue_type_template_id_3f5b2cb2_scoped_true_render,
  TFSelectorDropdownvue_type_template_id_3f5b2cb2_scoped_true_staticRenderFns,
  false,
  null,
  "3f5b2cb2",
  null
  
)

/* hot reload */
if (false) { var TFSelectorDropdown_api; }
TFSelectorDropdown_component.options.__file = "src/components/TFSelectorDropdown.vue"
/* harmony default export */ const TFSelectorDropdown = (TFSelectorDropdown_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/WatchlistPanel.vue?vue&type=template&id=e5180a72&scoped=true&
var WatchlistPanelvue_type_template_id_e5180a72_scoped_true_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "tvjs-watchlist-panel",
      class: { "is-collapsed": _vm.collapsed },
      style: _vm.panelStyle
    },
    [
      !_vm.collapsed
        ? _c("div", {
            staticClass: "resize-handle",
            on: { mousedown: _vm.startResize }
          })
        : _vm._e(),
      _vm._v(" "),
      _c(
        "button",
        {
          staticClass: "collapse-toggle",
          attrs: { title: _vm.collapsed ? "Expand panel" : "Collapse panel" },
          on: { click: _vm.toggleCollapse }
        },
        [_vm._v("\n        " + _vm._s(_vm.collapsed ? "◀" : "▶") + "\n    ")]
      ),
      _vm._v(" "),
      !_vm.collapsed
        ? _c("div", { staticClass: "panel-content" }, [
            _c("div", { staticClass: "panel-header" }, [
              _c("h3", [_vm._v("⭐ Watchlist")]),
              _vm._v(" "),
              _c("div", { staticClass: "header-actions" }, [
                _c(
                  "button",
                  {
                    staticClass: "btn-icon",
                    attrs: { title: "Add ticker" },
                    on: {
                      click: function($event) {
                        _vm.showAddModal = true
                      }
                    }
                  },
                  [_vm._v("\n                    ➕\n                ")]
                ),
                _vm._v(" "),
                _c(
                  "button",
                  {
                    staticClass: "btn-icon",
                    attrs: { title: "Search" },
                    on: { click: _vm.toggleSearch }
                  },
                  [_vm._v("\n                    🔍\n                ")]
                )
              ])
            ]),
            _vm._v(" "),
            _vm.showSearchInput
              ? _c("div", { staticClass: "search-container" }, [
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.searchQuery,
                        expression: "searchQuery"
                      }
                    ],
                    ref: "searchInput",
                    attrs: { type: "text", placeholder: "Search ticker..." },
                    domProps: { value: _vm.searchQuery },
                    on: {
                      keyup: function($event) {
                        if (
                          !$event.type.indexOf("key") &&
                          _vm._k($event.keyCode, "esc", 27, $event.key, [
                            "Esc",
                            "Escape"
                          ])
                        ) {
                          return null
                        }
                        return _vm.closeSearch($event)
                      },
                      input: function($event) {
                        if ($event.target.composing) {
                          return
                        }
                        _vm.searchQuery = $event.target.value
                      }
                    }
                  }),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass: "btn-clear",
                      on: { click: _vm.closeSearch }
                    },
                    [_vm._v("×")]
                  )
                ])
              : _vm._e(),
            _vm._v(" "),
            _vm.exchanges.length > 1
              ? _c("div", { staticClass: "exchange-filter" }, [
                  _c(
                    "select",
                    {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.selectedExchange,
                          expression: "selectedExchange"
                        }
                      ],
                      on: {
                        change: function($event) {
                          var $$selectedVal = Array.prototype.filter
                            .call($event.target.options, function(o) {
                              return o.selected
                            })
                            .map(function(o) {
                              var val = "_value" in o ? o._value : o.value
                              return val
                            })
                          _vm.selectedExchange = $event.target.multiple
                            ? $$selectedVal
                            : $$selectedVal[0]
                        }
                      }
                    },
                    [
                      _c("option", { attrs: { value: "" } }, [
                        _vm._v("All Exchanges")
                      ]),
                      _vm._v(" "),
                      _vm._l(_vm.exchanges, function(ex) {
                        return _c(
                          "option",
                          { key: ex.id, domProps: { value: ex.id } },
                          [
                            _vm._v(
                              "\n                    " +
                                _vm._s(ex.name) +
                                "\n                "
                            )
                          ]
                        )
                      })
                    ],
                    2
                  )
                ])
              : _vm._e(),
            _vm._v(" "),
            _c(
              "div",
              { ref: "tickerList", staticClass: "ticker-list" },
              [
                _vm._l(_vm.filteredTickers, function(ticker) {
                  return _c(
                    "div",
                    {
                      key: ticker.symbol + (ticker.exchange || ""),
                      staticClass: "ticker-item",
                      class: {
                        "is-active": _vm.isActiveTicker(ticker),
                        "is-up": ticker.change > 0,
                        "is-down": ticker.change < 0
                      },
                      on: {
                        click: function($event) {
                          return _vm.selectTicker(ticker)
                        },
                        contextmenu: function($event) {
                          $event.preventDefault()
                          return _vm.showContextMenu($event, ticker)
                        }
                      }
                    },
                    [
                      _c(
                        "button",
                        {
                          staticClass: "btn-star",
                          class: { "is-favorite": ticker.favorite },
                          on: {
                            click: function($event) {
                              $event.stopPropagation()
                              return _vm.toggleFavorite(ticker)
                            }
                          }
                        },
                        [
                          _vm._v(
                            "\n                    " +
                              _vm._s(ticker.favorite ? "★" : "☆") +
                              "\n                "
                          )
                        ]
                      ),
                      _vm._v(" "),
                      _c("div", { staticClass: "ticker-info" }, [
                        _c("div", { staticClass: "ticker-symbol" }, [
                          _vm._v(_vm._s(ticker.symbol))
                        ]),
                        _vm._v(" "),
                        ticker.exchange
                          ? _c("div", { staticClass: "ticker-exchange" }, [
                              _vm._v(
                                "\n                        " +
                                  _vm._s(ticker.exchange) +
                                  "\n                    "
                              )
                            ])
                          : _vm._e()
                      ]),
                      _vm._v(" "),
                      _c("div", { staticClass: "ticker-price" }, [
                        _c("div", { staticClass: "price-value" }, [
                          _vm._v(_vm._s(_vm.formatPrice(ticker.price)))
                        ]),
                        _vm._v(" "),
                        _c(
                          "div",
                          {
                            staticClass: "price-change",
                            class: _vm.changeClass(ticker)
                          },
                          [
                            _vm._v(
                              "\n                        " +
                                _vm._s(_vm.formatChange(ticker.change)) +
                                "\n                    "
                            )
                          ]
                        )
                      ]),
                      _vm._v(" "),
                      ticker.sparkline
                        ? _c("div", { staticClass: "ticker-sparkline" }, [
                            _c(
                              "svg",
                              {
                                attrs: {
                                  viewBox: "0 0 60 20",
                                  preserveAspectRatio: "none"
                                }
                              },
                              [
                                _c("polyline", {
                                  attrs: {
                                    points: ticker.sparkline,
                                    fill: "none",
                                    stroke: _vm.sparklineColor(ticker),
                                    "stroke-width": "1.5"
                                  }
                                })
                              ]
                            )
                          ])
                        : _vm._e()
                    ]
                  )
                }),
                _vm._v(" "),
                _vm.filteredTickers.length === 0
                  ? _c("div", { staticClass: "empty-state" }, [
                      _c("div", { staticClass: "empty-icon" }, [_vm._v("📋")]),
                      _vm._v(" "),
                      _c("p", [_vm._v("No tickers in watchlist")]),
                      _vm._v(" "),
                      _c(
                        "button",
                        {
                          staticClass: "btn-add-first",
                          on: {
                            click: function($event) {
                              _vm.showAddModal = true
                            }
                          }
                        },
                        [
                          _vm._v(
                            "\n                    + Add Ticker\n                "
                          )
                        ]
                      )
                    ])
                  : _vm._e()
              ],
              2
            ),
            _vm._v(" "),
            _c("div", { staticClass: "panel-footer" }, [
              _c("span", { staticClass: "ticker-count" }, [
                _vm._v(_vm._s(_vm.filteredTickers.length) + " tickers")
              ]),
              _vm._v(" "),
              _vm.gainersCount > 0
                ? _c("span", { staticClass: "gainers" }, [
                    _vm._v(
                      "\n                ▲ " +
                        _vm._s(_vm.gainersCount) +
                        "\n            "
                    )
                  ])
                : _vm._e(),
              _vm._v(" "),
              _vm.losersCount > 0
                ? _c("span", { staticClass: "losers" }, [
                    _vm._v(
                      "\n                ▼ " +
                        _vm._s(_vm.losersCount) +
                        "\n            "
                    )
                  ])
                : _vm._e()
            ])
          ])
        : _vm._e(),
      _vm._v(" "),
      _vm.showAddModal
        ? _c(
            "div",
            {
              staticClass: "tvjs-modal-overlay",
              on: {
                click: function($event) {
                  if ($event.target !== $event.currentTarget) {
                    return null
                  }
                  return _vm.closeAddModal($event)
                }
              }
            },
            [
              _c("div", { staticClass: "tvjs-modal add-ticker-modal" }, [
                _c("div", { staticClass: "modal-header" }, [
                  _c("h3", [_vm._v("Add to Watchlist")]),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass: "btn-close",
                      on: { click: _vm.closeAddModal }
                    },
                    [_vm._v("×")]
                  )
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "modal-body" }, [
                  _c("div", { staticClass: "form-group" }, [
                    _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.newTickerSymbol,
                          expression: "newTickerSymbol"
                        }
                      ],
                      ref: "addTickerInput",
                      attrs: {
                        type: "text",
                        placeholder: "Enter symbol (e.g., BTC/USDT)"
                      },
                      domProps: { value: _vm.newTickerSymbol },
                      on: {
                        keyup: function($event) {
                          if (
                            !$event.type.indexOf("key") &&
                            _vm._k(
                              $event.keyCode,
                              "enter",
                              13,
                              $event.key,
                              "Enter"
                            )
                          ) {
                            return null
                          }
                          return _vm.addTicker($event)
                        },
                        input: function($event) {
                          if ($event.target.composing) {
                            return
                          }
                          _vm.newTickerSymbol = $event.target.value
                        }
                      }
                    })
                  ]),
                  _vm._v(" "),
                  _c("div", { staticClass: "form-group" }, [
                    _c("label", [_vm._v("Exchange")]),
                    _vm._v(" "),
                    _c(
                      "select",
                      {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model",
                            value: _vm.newTickerExchange,
                            expression: "newTickerExchange"
                          }
                        ],
                        on: {
                          change: function($event) {
                            var $$selectedVal = Array.prototype.filter
                              .call($event.target.options, function(o) {
                                return o.selected
                              })
                              .map(function(o) {
                                var val = "_value" in o ? o._value : o.value
                                return val
                              })
                            _vm.newTickerExchange = $event.target.multiple
                              ? $$selectedVal
                              : $$selectedVal[0]
                          }
                        }
                      },
                      _vm._l(_vm.availableExchanges, function(ex) {
                        return _c(
                          "option",
                          { key: ex.id, domProps: { value: ex.id } },
                          [
                            _vm._v(
                              "\n                            " +
                                _vm._s(ex.name) +
                                "\n                        "
                            )
                          ]
                        )
                      }),
                      0
                    )
                  ]),
                  _vm._v(" "),
                  _c("div", { staticClass: "quick-add" }, [
                    _c("h4", [_vm._v("Popular")]),
                    _vm._v(" "),
                    _c(
                      "div",
                      { staticClass: "suggestions" },
                      _vm._l(_vm.popularSymbols, function(suggestion) {
                        return _c(
                          "button",
                          {
                            key: suggestion,
                            staticClass: "btn-suggestion",
                            on: {
                              click: function($event) {
                                return _vm.quickAdd(suggestion)
                              }
                            }
                          },
                          [
                            _vm._v(
                              "\n                            " +
                                _vm._s(suggestion) +
                                "\n                        "
                            )
                          ]
                        )
                      }),
                      0
                    )
                  ])
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "modal-footer" }, [
                  _c(
                    "button",
                    {
                      staticClass: "btn btn-secondary",
                      on: { click: _vm.closeAddModal }
                    },
                    [_vm._v("Cancel")]
                  ),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass: "btn btn-primary",
                      attrs: { disabled: !_vm.newTickerSymbol },
                      on: { click: _vm.addTicker }
                    },
                    [_vm._v("\n                    Add\n                ")]
                  )
                ])
              ])
            ]
          )
        : _vm._e(),
      _vm._v(" "),
      _vm.contextMenu.show
        ? _c(
            "div",
            {
              staticClass: "context-menu",
              style: {
                top: _vm.contextMenu.y + "px",
                left: _vm.contextMenu.x + "px"
              }
            },
            [
              _c(
                "button",
                {
                  on: {
                    click: function($event) {
                      return _vm.removeTicker(_vm.contextMenu.ticker)
                    }
                  }
                },
                [_vm._v("🗑 Remove")]
              ),
              _vm._v(" "),
              _c(
                "button",
                {
                  on: {
                    click: function($event) {
                      return _vm.toggleFavorite(_vm.contextMenu.ticker)
                    }
                  }
                },
                [
                  _vm._v(
                    "\n            " +
                      _vm._s(
                        _vm.contextMenuTickerFavorite
                          ? "☆ Unfavorite"
                          : "★ Favorite"
                      ) +
                      "\n        "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "button",
                {
                  on: {
                    click: function($event) {
                      return _vm.editTicker(_vm.contextMenu.ticker)
                    }
                  }
                },
                [_vm._v("✏ Edit")]
              )
            ]
          )
        : _vm._e()
    ]
  )
}
var WatchlistPanelvue_type_template_id_e5180a72_scoped_true_staticRenderFns = []
WatchlistPanelvue_type_template_id_e5180a72_scoped_true_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/WatchlistPanel.vue?vue&type=template&id=e5180a72&scoped=true&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/WatchlistPanel.vue?vue&type=script&lang=js&



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ const WatchlistPanelvue_type_script_lang_js_ = ({
  name: 'WatchlistPanel',
  props: {
    // Current active symbol
    symbol: {
      type: String,
      "default": ''
    },
    // Current exchange
    exchange: {
      type: String,
      "default": ''
    },
    // Initial tickers
    tickers: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    // Available exchanges
    exchanges: {
      type: Array,
      "default": function _default() {
        return [{
          id: 'default',
          name: 'Default'
        }];
      }
    },
    // Night mode
    night: {
      type: Boolean,
      "default": true
    },
    // Initial width
    initialWidth: {
      type: Number,
      "default": 250
    },
    // Min width
    minWidth: {
      type: Number,
      "default": 200
    },
    // Max width
    maxWidth: {
      type: Number,
      "default": 400
    },
    // Storage key for persistence
    storageKey: {
      type: String,
      "default": 'tvjs_watchlist'
    }
  },
  data: function data() {
    return {
      width: this.initialWidth,
      collapsed: false,
      showSearchInput: false,
      searchQuery: '',
      selectedExchange: '',
      showAddModal: false,
      newTickerSymbol: '',
      newTickerExchange: '',
      contextMenu: {
        show: false,
        x: 0,
        y: 0,
        ticker: null
      },
      localTickers: [],
      resizing: false,
      popularSymbols: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'DOGE/USDT', 'SOL/USDT', 'DOT/USDT']
    };
  },
  computed: {
    panelStyle: function panelStyle() {
      return {
        width: this.collapsed ? '36px' : this.width + 'px',
        backgroundColor: this.night ? '#1e2224' : '#ffffff',
        color: this.night ? '#d1d4dc' : '#131722',
        borderColor: this.night ? '#363a45' : '#e1e4e8'
      };
    },
    availableExchanges: function availableExchanges() {
      return this.exchanges.length > 0 ? this.exchanges : [{
        id: 'default',
        name: 'Default'
      }];
    },
    filteredTickers: function filteredTickers() {
      var _this = this;

      var tickers = this.localTickers; // Filter by exchange

      if (this.selectedExchange) {
        tickers = tickers.filter(function (t) {
          return t.exchange === _this.selectedExchange;
        });
      } // Filter by search query


      if (this.searchQuery) {
        var query = this.searchQuery.toLowerCase();
        tickers = tickers.filter(function (t) {
          return t.symbol.toLowerCase().includes(query);
        });
      } // Sort: favorites first, then alphabetically


      tickers = _toConsumableArray(tickers).sort(function (a, b) {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return a.symbol.localeCompare(b.symbol);
      });
      return tickers;
    },
    gainersCount: function gainersCount() {
      return this.localTickers.filter(function (t) {
        return t.change > 0;
      }).length;
    },
    losersCount: function losersCount() {
      return this.localTickers.filter(function (t) {
        return t.change < 0;
      }).length;
    },
    contextMenuTickerFavorite: function contextMenuTickerFavorite() {
      return this.contextMenu.ticker && this.contextMenu.ticker.favorite;
    }
  },
  watch: {
    tickers: {
      immediate: true,
      deep: true,
      handler: function handler(newVal) {
        this.localTickers = newVal.map(function (t) {
          return _objectSpread(_objectSpread({}, t), {}, {
            favorite: t.favorite !== undefined ? t.favorite : false
          });
        });
      }
    }
  },
  mounted: function mounted() {
    this.loadFromStorage();
    this.setupClickOutside();
  },
  beforeDestroy: function beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('mousemove', this.handleResize);
    document.removeEventListener('mouseup', this.stopResize);
  },
  methods: {
    // ==================== Panel Resize ====================
    startResize: function startResize(e) {
      this.resizing = true;
      this.startX = e.clientX;
      this.startWidth = this.width;
      document.addEventListener('mousemove', this.handleResize);
      document.addEventListener('mouseup', this.stopResize);
      e.preventDefault();
    },
    handleResize: function handleResize(e) {
      if (!this.resizing) return;
      var diff = this.startX - e.clientX;
      var newWidth = this.startWidth + diff; // Clamp width

      newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, newWidth));
      this.width = newWidth;
      this.$emit('resize', this.width);
    },
    stopResize: function stopResize() {
      this.resizing = false;
      document.removeEventListener('mousemove', this.handleResize);
      document.removeEventListener('mouseup', this.stopResize);
      this.saveToStorage();
    },
    toggleCollapse: function toggleCollapse() {
      this.collapsed = !this.collapsed;
      this.$emit('collapse', this.collapsed);
      this.saveToStorage();
    },
    // ==================== Ticker Management ====================
    selectTicker: function selectTicker(ticker) {
      this.$emit('ticker-select', {
        symbol: ticker.symbol,
        exchange: ticker.exchange
      });
    },
    isActiveTicker: function isActiveTicker(ticker) {
      return ticker.symbol === this.symbol && (ticker.exchange === this.exchange || !ticker.exchange);
    },
    toggleFavorite: function toggleFavorite(ticker) {
      var idx = this.localTickers.findIndex(function (t) {
        return t.symbol === ticker.symbol && t.exchange === ticker.exchange;
      });

      if (idx !== -1) {
        this.localTickers[idx].favorite = !this.localTickers[idx].favorite;
        this.saveToStorage();
        this.$emit('update:tickers', this.localTickers);
      }

      this.closeContextMenu();
    },
    removeTicker: function removeTicker(ticker) {
      var idx = this.localTickers.findIndex(function (t) {
        return t.symbol === ticker.symbol && t.exchange === ticker.exchange;
      });

      if (idx !== -1) {
        this.localTickers.splice(idx, 1);
        this.saveToStorage();
        this.$emit('update:tickers', this.localTickers);
        this.$emit('ticker-remove', ticker);
      }

      this.closeContextMenu();
    },
    editTicker: function editTicker(ticker) {
      // TODO: Implement edit modal
      this.closeContextMenu();
    },
    addTicker: function addTicker() {
      if (!this.newTickerSymbol) return;
      var symbol = this.newTickerSymbol.toUpperCase();
      var exchange = this.newTickerExchange || this.exchange; // Check if already exists

      var exists = this.localTickers.some(function (t) {
        return t.symbol === symbol && t.exchange === exchange;
      });

      if (exists) {
        alert("".concat(symbol, " already in watchlist"));
        return;
      }

      var newTicker = {
        symbol: symbol,
        exchange: exchange,
        price: 0,
        change: 0,
        favorite: false,
        sparkline: ''
      };
      this.localTickers.push(newTicker);
      this.saveToStorage();
      this.$emit('update:tickers', this.localTickers);
      this.$emit('ticker-add', newTicker);
      this.closeAddModal();
    },
    quickAdd: function quickAdd(symbol) {
      this.newTickerSymbol = symbol;
      this.addTicker();
    },
    closeAddModal: function closeAddModal() {
      this.showAddModal = false;
      this.newTickerSymbol = '';
    },
    // ==================== Search ====================
    toggleSearch: function toggleSearch() {
      var _this2 = this;

      this.showSearchInput = !this.showSearchInput;

      if (this.showSearchInput) {
        this.$nextTick(function () {
          var _this2$$refs$searchIn;

          (_this2$$refs$searchIn = _this2.$refs.searchInput) === null || _this2$$refs$searchIn === void 0 ? void 0 : _this2$$refs$searchIn.focus();
        });
      }
    },
    closeSearch: function closeSearch() {
      this.showSearchInput = false;
      this.searchQuery = '';
    },
    // ==================== Context Menu ====================
    showContextMenu: function showContextMenu(e, ticker) {
      this.contextMenu = {
        show: true,
        x: e.clientX,
        y: e.clientY,
        ticker: ticker
      };
    },
    closeContextMenu: function closeContextMenu() {
      this.contextMenu.show = false;
      this.contextMenu.ticker = null;
    },
    setupClickOutside: function setupClickOutside() {
      document.addEventListener('click', this.handleClickOutside);
    },
    handleClickOutside: function handleClickOutside(e) {
      // Close context menu
      if (this.contextMenu.show && !e.target.closest('.context-menu')) {
        this.closeContextMenu();
      }
    },
    // ==================== Formatting ====================
    formatPrice: function formatPrice(price) {
      if (!price || price === 0) return '—';
      if (price >= 1000) return price.toLocaleString(undefined, {
        maximumFractionDigits: 2
      });
      if (price >= 1) return price.toFixed(4);
      if (price >= 0.0001) return price.toFixed(6);
      return price.toFixed(8);
    },
    formatChange: function formatChange(change) {
      if (!change) return '0.00%';
      var sign = change >= 0 ? '+' : '';
      return "".concat(sign).concat(change.toFixed(2), "%");
    },
    changeClass: function changeClass(ticker) {
      if (ticker.change > 0) return 'positive';
      if (ticker.change < 0) return 'negative';
      return 'neutral';
    },
    sparklineColor: function sparklineColor(ticker) {
      if (ticker.change > 0) return '#23a776';
      if (ticker.change < 0) return '#e54150';
      return '#787b86';
    },
    // ==================== Storage ====================
    saveToStorage: function saveToStorage() {
      if (typeof localStorage === 'undefined') return;
      var data = {
        width: this.width,
        collapsed: this.collapsed,
        tickers: this.localTickers
      };

      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to save watchlist:', e);
      }
    },
    loadFromStorage: function loadFromStorage() {
      if (typeof localStorage === 'undefined') return;

      try {
        var data = localStorage.getItem(this.storageKey);

        if (data) {
          var parsed = JSON.parse(data);
          if (parsed.width) this.width = parsed.width;
          if (parsed.collapsed !== undefined) this.collapsed = parsed.collapsed;

          if (parsed.tickers && parsed.tickers.length > 0) {
            this.localTickers = parsed.tickers;
            this.$emit('update:tickers', this.localTickers);
          }
        }
      } catch (e) {
        console.warn('Failed to load watchlist:', e);
      }
    },
    // ==================== Public API ====================

    /**
     * Update ticker price
     */
    updatePrice: function updatePrice(symbol, exchange, price, change) {
      var ticker = this.localTickers.find(function (t) {
        return t.symbol === symbol && t.exchange === exchange;
      });

      if (ticker) {
        ticker.price = price;
        ticker.change = change;
      }
    },

    /**
     * Update ticker sparkline data
     */
    updateSparkline: function updateSparkline(symbol, exchange, sparkline) {
      var ticker = this.localTickers.find(function (t) {
        return t.symbol === symbol && t.exchange === exchange;
      });

      if (ticker) {
        ticker.sparkline = sparkline;
      }
    },

    /**
     * Get all tickers
     */
    getTickers: function getTickers() {
      return this.localTickers;
    },

    /**
     * Set tickers
     */
    setTickers: function setTickers(tickers) {
      this.localTickers = tickers;
      this.saveToStorage();
      this.$emit('update:tickers', this.localTickers);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/WatchlistPanel.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_WatchlistPanelvue_type_script_lang_js_ = (WatchlistPanelvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/WatchlistPanel.vue?vue&type=style&index=0&id=e5180a72&scoped=true&lang=css&
var WatchlistPanelvue_type_style_index_0_id_e5180a72_scoped_true_lang_css_ = __webpack_require__(5411);
;// CONCATENATED MODULE: ./src/components/WatchlistPanel.vue?vue&type=style&index=0&id=e5180a72&scoped=true&lang=css&

;// CONCATENATED MODULE: ./src/components/WatchlistPanel.vue



;


/* normalize component */

var WatchlistPanel_component = normalizeComponent(
  components_WatchlistPanelvue_type_script_lang_js_,
  WatchlistPanelvue_type_template_id_e5180a72_scoped_true_render,
  WatchlistPanelvue_type_template_id_e5180a72_scoped_true_staticRenderFns,
  false,
  null,
  "e5180a72",
  null
  
)

/* hot reload */
if (false) { var WatchlistPanel_api; }
WatchlistPanel_component.options.__file = "src/components/WatchlistPanel.vue"
/* harmony default export */ const WatchlistPanel = (WatchlistPanel_component.exports);
;// CONCATENATED MODULE: ./src/mixins/xcontrol.js
function xcontrol_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = xcontrol_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function xcontrol_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return xcontrol_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return xcontrol_arrayLikeToArray(o, minLen); }

function xcontrol_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// extensions control
/* harmony default export */ const xcontrol = ({
  mounted: function mounted() {
    this.ctrllist();
    this.skin_styles();
  },
  methods: {
    // Build / rebuild component list
    ctrllist: function ctrllist() {
      this.ctrl_destroy();
      this.controllers = [];

      var _iterator = xcontrol_createForOfIteratorHelper(this.$props.extensions),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var x = _step.value;
          var name = x.Main.__name__;

          if (!this.xSettings[name]) {
            this.$set(this.xSettings, name, {});
          }

          var nc = new x.Main(this, // tv inst
          this.data, // dc
          this.xSettings[name] // settings
          );
          nc.name = name;
          this.controllers.push(nc);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return this.controllers;
    },
    // TODO: preventDefault
    pre_dc: function pre_dc(e) {
      var _iterator2 = xcontrol_createForOfIteratorHelper(this.controllers),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ctrl = _step2.value;

          if (ctrl.update) {
            ctrl.update(e);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    },
    post_dc: function post_dc(e) {
      var _iterator3 = xcontrol_createForOfIteratorHelper(this.controllers),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var ctrl = _step3.value;

          if (ctrl.post_update) {
            ctrl.post_update(e);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    },
    ctrl_destroy: function ctrl_destroy() {
      var _iterator4 = xcontrol_createForOfIteratorHelper(this.controllers),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var ctrl = _step4.value;
          if (ctrl.destroy) ctrl.destroy();
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    },
    skin_styles: function skin_styles() {
      var id = 'tvjs-skin-styles';
      var stbr = document.getElementById(id);

      if (stbr) {
        var parent = stbr.parentNode;
        parent.removeChild(stbr);
      }

      if (this.skin_proto && this.skin_proto.styles) {
        var sheet = document.createElement('style');
        sheet.setAttribute("id", id);
        sheet.innerHTML = this.skin_proto.styles;
        this.$el.appendChild(sheet);
      }
    }
  },
  computed: {
    ws: function ws() {
      var ws = {};

      var _iterator5 = xcontrol_createForOfIteratorHelper(this.controllers),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var ctrl = _step5.value;

          if (ctrl.widgets) {
            for (var id in ctrl.widgets) {
              ws[id] = ctrl.widgets[id];
              ws[id].ctrl = ctrl;
            }
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      return ws;
    },
    skins: function skins() {
      var sks = {};

      var _iterator6 = xcontrol_createForOfIteratorHelper(this.$props.extensions),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var x = _step6.value;

          for (var id in x.skins || {}) {
            sks[id] = x.skins[id];
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      return sks;
    },
    skin_proto: function skin_proto() {
      return this.skins[this.$props.skin];
    },
    colorpack: function colorpack() {
      var sel = this.skins[this.$props.skin];
      return sel ? sel.colors : undefined;
    }
  },
  watch: {
    // TODO: This is fast & dirty fix, need
    // to fix the actual reactivity problem
    skin: function skin(n, p) {
      if (n !== p) this.resetChart();
      this.skin_styles();
    },
    extensions: function extensions() {
      this.ctrllist();
    },
    xSettings: {
      handler: function handler(n, p) {
        var _iterator7 = xcontrol_createForOfIteratorHelper(this.controllers),
            _step7;

        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var ctrl = _step7.value;

            if (ctrl.onsettings) {
              ctrl.onsettings(n, p);
            }
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }
      },
      deep: true
    }
  },
  data: function data() {
    return {
      controllers: []
    };
  }
});
;// CONCATENATED MODULE: ./src/helpers/tmp/ww$$$.json
const ww$$$_namespaceObject = JSON.parse('["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"]');
// EXTERNAL MODULE: ./node_modules/lz-string/libs/lz-string.js
var lz_string = __webpack_require__(6961);
var lz_string_default = /*#__PURE__*/__webpack_require__.n(lz_string);
;// CONCATENATED MODULE: ./src/helpers/script_ww_api.js




// Webworker interface
// Compiled webworker (see webpack/ww_plugin.js)



 // For webworker-loader to find the ww

var WebWork = /*#__PURE__*/function () {
  function WebWork(dc) {
    classCallCheck_classCallCheck(this, WebWork);

    this.dc = dc;
    this.tasks = {};

    this.onevent = function () {};

    this.start();
  }

  createClass_createClass(WebWork, [{
    key: "start",
    value: function start() {
      var _this = this;

      if (this.worker) this.worker.terminate(); // URL.createObjectURL

      window.URL = window.URL || window.webkitURL;
      var data = lz_string_default().decompressFromBase64(ww$$$_namespaceObject[0]);
      var blob;

      try {
        blob = new Blob([data], {
          type: 'application/javascript'
        });
      } catch (e) {
        // Backwards-compatibility
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        blob = new BlobBuilder();
        blob.append(data);
        blob = blob.getBlob();
      }

      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.onmessage = function (e) {
        return _this.onmessage(e);
      };
    }
  }, {
    key: "start_socket",
    value: function start_socket() {
      var _this2 = this;

      if (!this.dc.sett.node_url) return;
      this.socket = new WebSocket(this.dc.sett.node_url);
      this.socket.addEventListener('message', function (e) {
        _this2.onmessage({
          data: JSON.parse(e.data)
        });
      });
      this.msg_queue = [];
    }
  }, {
    key: "send",
    value: function send(msg, tx_keys) {
      if (this.dc.sett.node_url) {
        return this.send_node(msg, tx_keys);
      }

      if (tx_keys) {
        var tx_objs = tx_keys.map(function (k) {
          return msg.data[k];
        });
        this.worker.postMessage(msg, tx_objs);
      } else {
        this.worker.postMessage(msg);
      }
    } // Send to node.js via websocket

  }, {
    key: "send_node",
    value: function send_node(msg, tx_keys) {
      if (!this.socket) this.start_socket();

      if (this.socket && this.socket.readyState) {
        // Send the old messages first
        while (this.msg_queue.length) {
          var m = this.msg_queue.shift();
          this.socket.send(JSON.stringify(m));
        }

        this.socket.send(JSON.stringify(msg));
      } else {
        this.msg_queue.push(msg);
      }
    }
  }, {
    key: "onmessage",
    value: function onmessage(e) {
      if (e.data.id in this.tasks) {
        this.tasks[e.data.id](e.data.data);
        delete this.tasks[e.data.id];
      } else {
        this.onevent(e);
      }
    } // Execute a task

  }, {
    key: "exec",
    value: function () {
      var _exec = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(type, data, tx_keys) {
        var _this3 = this;

        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (rs, rj) {
                  var id = utils.uuid();

                  _this3.send({
                    type: type,
                    id: id,
                    data: data
                  }, tx_keys);

                  _this3.tasks[id] = function (res) {
                    rs(res);
                  };
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function exec(_x, _x2, _x3) {
        return _exec.apply(this, arguments);
      }

      return exec;
    }() // Execute a task, but just fucking do it,
    // do not wait for the result

  }, {
    key: "just",
    value: function just(type, data, tx_keys) {
      var id = utils.uuid();
      this.send({
        type: type,
        id: id,
        data: data
      }, tx_keys);
    } // Relay an event from iframe postMessage
    // (for the future)

  }, {
    key: "relay",
    value: function () {
      var _relay = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee2(event, just) {
        var _this4 = this;

        return regenerator_default().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (just === void 0) {
                  just = false;
                }

                return _context2.abrupt("return", new Promise(function (rs, rj) {
                  _this4.send(event, event.tx_keys);

                  if (!just) {
                    _this4.tasks[event.id] = function (res) {
                      rs(res);
                    };
                  }
                }));

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function relay(_x4, _x5) {
        return _relay.apply(this, arguments);
      }

      return relay;
    }()
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.worker) this.worker.terminate();
    }
  }]);

  return WebWork;
}();

/* harmony default export */ const script_ww_api = (WebWork);
;// CONCATENATED MODULE: ./src/helpers/script_utils.js


var FDEFS = /(function |)([$A-Z_][0-9A-Z_$\.]*)[\s]*?\((.*?)\)/gmi;
var SBRACKETS = /([$A-Z_][0-9A-Z_$\.]*)[\s]*?\[([^"^\[^\]]+?)\]/gmi;
var TFSTR = /(\d+)(\w*)/gm;
var BUF_INC = 5;
var tf_cache = {};
function f_args(src) {
  FDEFS.lastIndex = 0;
  var m = FDEFS.exec(src);

  if (m) {
    var fkeyword = m[1].trim();
    var fname = m[2].trim();
    var fargs = m[3].trim();
    return fargs.split(',').map(function (x) {
      return x.trim();
    });
  }

  return [];
}
function f_body(src) {
  return src.slice(src.indexOf("{") + 1, src.lastIndexOf("}"));
}
function wrap_idxs(src, pre) {
  if (pre === void 0) {
    pre = '';
  }

  SBRACKETS.lastIndex = 0;
  var changed = false;

  do {
    var m = SBRACKETS.exec(src);

    if (m) {
      var vname = m[1].trim();
      var vindex = m[2].trim();

      if (vindex === '0' || parseInt(vindex) < BUF_INC) {
        continue;
      }

      switch (vname) {
        case 'let':
        case 'var':
        case 'return':
          continue;
      } //let wrap = `${pre}_v(${vname}, ${vindex})[${vindex}]`


      var wrap = "".concat(vname, "[").concat(pre, "_i(").concat(vindex, ", ").concat(vname, ")]");
      src = src.replace(m[0], wrap);
      changed = true;
    }
  } while (m);

  return changed ? src : src;
} // Get all module helper classes

function make_module_lib(mod) {
  var lib = {};

  for (var k in mod) {
    if (k === 'main' || k === 'id') continue;
    var a = f_args(mod[k]);
    lib[k] = new Function(a, f_body(mod[k]));
  }

  return lib;
}
function get_raw_src(f) {
  if (typeof f === 'string') return f;
  var src = f.toString();
  return src.slice(src.indexOf("{") + 1, src.lastIndexOf("}"));
} // Get tf in ms from pairs such (`15`, `m`)

function tf_from_pair(num, pf) {
  var mult = 1;

  switch (pf) {
    case 's':
      mult = Const.SECOND;
      break;

    case 'm':
      mult = Const.MINUTE;
      break;

    case 'H':
      mult = Const.HOUR;
      break;

    case 'D':
      mult = Const.DAY;
      break;

    case 'W':
      mult = Const.WEEK;
      break;

    case 'M':
      mult = Const.MONTH;
      break;

    case 'Y':
      mult = Const.YEAR;
      break;
  }

  return parseInt(num) * mult;
}
function tf_from_str(str) {
  if (typeof str === 'number') return str;
  if (tf_cache[str]) return tf_cache[str];
  TFSTR.lastIndex = 0;
  var m = TFSTR.exec(str);

  if (m) {
    tf_cache[str] = tf_from_pair(m[1], m[2]);
    return tf_cache[str];
  }

  return undefined;
}
function get_fn_id(pre, id) {
  return pre + '-' + id.split('<-').pop();
} // Apply filter for all new overlays

function ovf(obj, f) {
  var nw = {};

  for (var id in obj) {
    nw[id] = {};

    for (var k in obj[id]) {
      if (k === 'data') continue;
      nw[id][k] = obj[id][k];
    }

    nw[id].data = f(obj[id].data);
  }

  return nw;
} // Return index of the next element in
// dataset (since t). Impl: simple binary search
// TODO: optimize (remember the penultimate
// iteration and start from there)

function nextt(data, t, ti) {
  if (ti === void 0) {
    ti = 0;
  }

  var i0 = 0;
  var iN = data.length - 1;

  while (i0 <= iN) {
    var mid = Math.floor((i0 + iN) / 2);

    if (data[mid][ti] === t) {
      return mid;
    } else if (data[mid][ti] < t) {
      i0 = mid + 1;
    } else {
      iN = mid - 1;
    }
  }

  return t < data[mid][ti] ? mid : mid + 1;
} // Estimated size of datasets

function size_of_dss(data) {
  var bytes = 0;

  for (var id in data) {
    if (data[id].data && data[id].data[0]) {
      var s0 = size_of(data[id].data[0]);
      bytes += s0 * data[id].data.length;
    }
  }

  return bytes;
} // Used to measure the size of dataset

function size_of(object) {
  var list = [],
      stack = [object],
      bytes = 0;

  while (stack.length) {
    var value = stack.pop();

    var type = _typeof(value);

    if (type === 'boolean') {
      bytes += 4;
    } else if (type === 'string') {
      bytes += value.length * 2;
    } else if (type === 'number') {
      bytes += 8;
    } else if (type === 'object' && list.indexOf(value) === -1) {
      list.push(value);

      for (var i in value) {
        stack.push(value[i]);
      }
    }
  }

  return bytes;
} // Update onchart/offchart

function update(data, val) {
  var i = data.length - 1;
  var last = data[i];

  if (!last || val[0] > last[0]) {
    data.push(val);
  } else {
    data[i] = val;
  }
}
function script_utils_now() {
  return new Date().getTime();
}
;// CONCATENATED MODULE: ./src/helpers/dataset.js





function dataset_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = dataset_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function dataset_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dataset_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dataset_arrayLikeToArray(o, minLen); }

function dataset_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }


// Dataset proxy between vuejs & WebWorker


var Dataset = /*#__PURE__*/function () {
  function Dataset(dc, desc) {
    classCallCheck_classCallCheck(this, Dataset);

    // TODO: dataset url arrow fn tells WW
    // to load the ds directly from web
    this.type = desc.type;
    this.id = desc.id;
    this.dc = dc; // Send the data to WW

    if (desc.data) {
      this.dc.ww.just('upload-data', _defineProperty({}, this.id, desc)); // Remove the data from the descriptor

      delete desc.data;
    }

    var proto = Object.getPrototypeOf(this);
    Object.setPrototypeOf(desc, proto);
    Object.defineProperty(desc, 'dc', {
      get: function get() {
        return dc;
      }
    });
  } // Watch for the changes of descriptors


  createClass_createClass(Dataset, [{
    key: "set",
    value: // Set data (overwrite the whole dataset)
    function set(data, exec) {
      if (exec === void 0) {
        exec = true;
      }

      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'set',
        data: data,
        exec: exec
      });
    } // Update with new data (array of data points)

  }, {
    key: "update",
    value: function update(arr) {
      this.dc.ww.just('update-data', _defineProperty({}, this.id, arr));
    } // Send WW a chunk to merge. The merge algo
    // here is simpler than in DC. It just adds
    // data at the beginning or/and the end of ds

  }, {
    key: "merge",
    value: function merge(data, exec) {
      if (exec === void 0) {
        exec = true;
      }

      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'mrg',
        data: data,
        exec: exec
      });
    } // Remove the ds from WW

  }, {
    key: "remove",
    value: function remove(exec) {
      if (exec === void 0) {
        exec = true;
      }

      this.dc.del("datasets.".concat(this.id));
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'del',
        exec: exec
      });
      delete this.dc.dss[this.id];
    } // Fetch data from WW

  }, {
    key: "data",
    value: function () {
      var _data = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee() {
        var ds;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.dc.ww.exec('get-dataset', this.id);

              case 2:
                ds = _context.sent;

                if (ds) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return");

              case 5:
                return _context.abrupt("return", ds.data);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function data() {
        return _data.apply(this, arguments);
      }

      return data;
    }()
  }], [{
    key: "watcher",
    value: function watcher(n, p) {
      var nids = n.map(function (x) {
        return x.id;
      });
      var pids = p.map(function (x) {
        return x.id;
      });

      var _iterator = dataset_createForOfIteratorHelper(nids),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var id = _step.value;

          if (!pids.includes(id)) {
            var ds = n.filter(function (x) {
              return x.id === id;
            })[0];
            this.dss[id] = new Dataset(this, ds);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var _iterator2 = dataset_createForOfIteratorHelper(pids),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var id = _step2.value;

          if (!nids.includes(id) && this.dss[id]) {
            this.dss[id].remove();
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    } // Make an object for data transfer

  }, {
    key: "make_tx",
    value: function make_tx(dc, types) {
      var main = dc.data.chart.data;
      var base = {};

      if (types.find(function (x) {
        return x.type === 'OHLCV';
      })) {
        base = {
          ohlcv: main
        };
      } // TODO: add more sophisticated search
      // (using 'script.datasets' paramerter)

      /*for (var req of types) {
          let ds = Object.values(dc.dss || {})
              .find(x => x.type === req.type)
          if (ds && ds.data) {
              base[ds.id] = {
                  id: ds.id,
                  type: ds.type,
                  data: ds.data
              }
          }
      }*/
      // TODO: Data request callback ?


      return base;
    }
  }]);

  return Dataset;
}(); // Dataset reciever (created on WW)



var DatasetWW = /*#__PURE__*/(/* unused pure expression or super */ null && (function () {
  function DatasetWW(id, data) {
    _classCallCheck(this, DatasetWW);

    this.last_upd = now();
    this.id = id;

    if (Array.isArray(data)) {
      // Regular array
      this.data = data;
      if (id === 'ohlcv') this.type = 'OHLCV';
    } else {
      // Dataset descriptor
      this.data = data.data;
      this.type = data.type;
    }
  } // Update from 'update-data' event
  // TODO: ds size limit (in MB / data points)


  _createClass(DatasetWW, [{
    key: "merge",
    value: function merge(data) {
      var len = this.data.length;

      if (!len) {
        this.data = data;
        return;
      }

      var t0 = this.data[0][0];
      var tN = this.data[len - 1][0];
      var l = data.filter(function (x) {
        return x[0] < t0;
      });
      var r = data.filter(function (x) {
        return x[0] > tN;
      });
      this.data = l.concat(this.data, r);
    } // On dataset operation

  }, {
    key: "op",
    value: function op(se, _op) {
      this.last_upd = now();

      switch (_op.type) {
        case 'set':
          this.data = _op.data;
          se.recalc_size();
          break;

        case 'del':
          delete se.data[this.id];
          se.recalc_size();
          break;

        case 'mrg':
          this.merge(_op.data);
          se.recalc_size();
          break;
      }
    }
  }], [{
    key: "update_all",
    value: function update_all(se, data) {
      for (var k in data) {
        if (k === 'ohlcv') continue;
        var id = k.split('.')[1] || k;
        if (!se.data[id]) continue;
        var arr = se.data[id].data;
        var iN = arr.length - 1;
        var last = arr[iN];

        var _iterator3 = dataset_createForOfIteratorHelper(data[k]),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var dp = _step3.value;

            if (!last || dp[0] > last[0]) {
              arr.push(dp);
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        se.data[id].last_upd = now();
      }
    }
  }]);

  return DatasetWW;
}()));
;// CONCATENATED MODULE: ./src/helpers/dc_events.js





function dc_events_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = dc_events_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function dc_events_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dc_events_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dc_events_arrayLikeToArray(o, minLen); }

function dc_events_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// DataCube event handlers





var DCEvents = /*#__PURE__*/function () {
  function DCEvents() {
    var _this = this;

    classCallCheck_classCallCheck(this, DCEvents);

    this.ww = new script_ww_api(this); // Listen to the web-worker events

    this.ww.onevent = function (e) {
      var _iterator = dc_events_createForOfIteratorHelper(_this.tv.controllers),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ctrl = _step.value;
          if (ctrl.ww) ctrl.ww(e.data);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      switch (e.data.type) {
        case 'request-data':
          // TODO: DataTunnel class for smarter data transfer
          if (_this.ww._data_uploading) break;
          var data = Dataset.make_tx(_this, e.data.data);

          _this.send_meta_2_ww();

          _this.ww.just('upload-data', data);

          _this.ww._data_uploading = true;
          break;

        case 'overlay-data':
          _this.on_overlay_data(e.data.data);

          break;

        case 'overlay-update':
          _this.on_overlay_update(e.data.data);

          break;

        case 'data-uploaded':
          _this.ww._data_uploading = false;
          break;

        case 'engine-state':
          _this.se_state = Object.assign(_this.se_state || {}, e.data.data);
          break;

        case 'modify-overlay':
          _this.modify_overlay(e.data.data);

          break;

        case 'script-signal':
          _this.tv.$emit('signal', e.data.data);

          break;
      }

      var _iterator2 = dc_events_createForOfIteratorHelper(_this.tv.controllers),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ctrl = _step2.value;
          if (ctrl.post_ww) ctrl.post_ww(e.data);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    };
  } // Called when overalay/tv emits 'custom-event'


  createClass_createClass(DCEvents, [{
    key: "on_custom_event",
    value: function on_custom_event(event, args) {
      switch (event) {
        case 'register-tools':
          this.register_tools(args);
          break;

        case 'exec-script':
          this.exec_script(args);
          break;

        case 'exec-all-scripts':
          this.exec_all_scripts();
          break;

        case 'data-len-changed':
          this.data_changed(args);
          break;

        case 'tool-selected':
          if (!args[0]) break; // TODO: Quick fix, investigate

          if (args[0].split(':')[0] === 'System') {
            this.system_tool(args[0].split(':')[1]);
            break;
          }

          this.tv.$set(this.data, 'tool', args[0]);

          if (args[0] === 'Cursor') {
            this.drawing_mode_off();
          }

          break;

        case 'grid-mousedown':
          this.grid_mousedown(args);
          break;

        case 'drawing-mode-off':
          this.drawing_mode_off();
          break;

        case 'change-settings':
          this.change_settings(args);
          break;

        case 'range-changed':
          this.scripts_onrange.apply(this, _toConsumableArray(args));
          break;

        case 'scroll-lock':
          this.on_scroll_lock(args[0]);
          break;

        case 'object-selected':
          this.object_selected(args);
          break;

        case 'remove-tool':
          this.system_tool('Remove');
          break;

        case 'before-destroy':
          this.before_destroy();
          break;
      }
    } // Triggered when one or multiple settings are changed
    // We select only the changed ones & re-exec them on the
    // web worker

  }, {
    key: "on_settings",
    value: function on_settings(values, prev) {
      var _this2 = this;

      if (!this.sett.scripts) return;
      var delta = {};
      var changed = false;

      var _loop = function _loop() {
        var n = values[i];
        var arr = prev.filter(function (x) {
          return x.v === n.v;
        });

        if (!arr.length && n.p.settings.$props) {
          var id = n.p.settings.$uuid;

          if (utils.is_scr_props_upd(n, prev) && utils.delayed_exec(n.p)) {
            delta[id] = n.v;
            changed = true;

            _this2.tv.$set(n.p, 'loading', true);
          }
        }
      };

      for (var i = 0; i < values.length; i++) {
        _loop();
      }

      if (changed && Object.keys(delta).length) {
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        this.ww.just('update-ov-settings', {
          delta: delta,
          tf: tf,
          range: range
        });
      }
    } // When the set of $uuids is changed

  }, {
    key: "on_ids_changed",
    value: function on_ids_changed(values, prev) {
      var rem = prev.filter(function (x) {
        return x !== undefined && !values.includes(x);
      });

      if (rem.length) {
        this.ww.just('remove-scripts', rem);
      }
    } // Combine all tools and their mods

  }, {
    key: "register_tools",
    value: function register_tools(tools) {
      var preset = {};

      var _iterator3 = dc_events_createForOfIteratorHelper(this.data.tools || []),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var tool = _step3.value;
          preset[tool.type] = tool;
          delete tool.type;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      this.tv.$set(this.data, 'tools', []);
      var list = [{
        type: 'Cursor',
        icon: icons_namespaceObject["cursor.png"]
      }];

      var _iterator4 = dc_events_createForOfIteratorHelper(tools),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var tool = _step4.value;
          var proto = Object.assign({}, tool.info);
          var type = tool.info.type || 'Default';
          proto.type = "".concat(tool.use_for, ":").concat(type);
          this.merge_presets(proto, preset[tool.use_for]);
          this.merge_presets(proto, preset[proto.type]);
          delete proto.mods;
          list.push(proto);

          for (var mod in tool.info.mods) {
            var mp = Object.assign({}, proto);
            mp = Object.assign(mp, tool.info.mods[mod]);
            mp.type = "".concat(tool.use_for, ":").concat(mod);
            this.merge_presets(mp, preset[tool.use_for]);
            this.merge_presets(mp, preset[mp.type]);
            list.push(mp);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      this.tv.$set(this.data, 'tools', list);
      this.tv.$set(this.data, 'tool', 'Cursor');
    }
  }, {
    key: "exec_script",
    value: function exec_script(args) {
      if (args.length && this.sett.scripts) {
        var obj = this.get_overlay(args[0]);
        if (!obj || obj.scripts === false) return;

        if (obj.script && obj.script.src) {
          args[0].src = obj.script.src; // opt, override the src
        } // Parse script props & get the values from the ov
        // TODO: remove unnecessary script initializations


        var s = obj.settings;
        var props = args[0].src.props || {};
        if (!s.$uuid) s.$uuid = "".concat(obj.type, "-").concat(utils.uuid2());
        args[0].uuid = s.$uuid;
        args[0].sett = s;

        for (var k in props || {}) {
          var proto = props[k];

          if (s[k] !== undefined) {
            proto.val = s[k]; // use the existing val

            continue;
          }

          if (proto.def === undefined) {
            // TODO: add support of info / errors to the legend
            console.error("Overlay ".concat(obj.id, ": script prop '").concat(k, "' ") + "doesn't have a default value");
            return;
          }

          s[k] = proto.val = proto.def; // set the default
        } // Remove old props (dropped by the current exec)


        if (s.$props) {
          for (var k in s) {
            if (s.$props.includes(k) && !(k in props)) {
              delete s[k];
            }
          }
        }

        s.$props = Object.keys(args[0].src.props || {});
        this.tv.$set(obj, 'loading', true);
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();

        if (obj.script && obj.script.output != null) {
          args[0].output = obj.script.output;
        }

        this.ww.just('exec-script', {
          s: args[0],
          tf: tf,
          range: range
        });
      }
    }
  }, {
    key: "exec_all_scripts",
    value: function exec_all_scripts() {
      if (!this.sett.scripts) return;
      this.set_loading(true);
      var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
      var range = this.tv.getRange();
      this.ww.just('exec-all-scripts', {
        tf: tf,
        range: range
      });
    }
  }, {
    key: "scripts_onrange",
    value: function scripts_onrange(r) {
      if (!this.sett.scripts) return;
      var delta = {};
      this.get('.').forEach(function (v) {
        if (v.script && v.script.execOnRange && v.settings.$uuid) {
          // TODO: execInterrupt flag?
          if (utils.delayed_exec(v)) {
            delta[v.settings.$uuid] = v.settings;
          }
        }
      });

      if (Object.keys(delta).length) {
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        this.ww.just('update-ov-settings', {
          delta: delta,
          tf: tf,
          range: range
        });
      }
    } // Overlay modification from WW

  }, {
    key: "modify_overlay",
    value: function modify_overlay(upd) {
      var obj = this.get_overlay(upd);

      if (obj) {
        for (var k in upd.fields || {}) {
          if (typeof_typeof(obj[k]) === 'object') {
            this.merge("".concat(upd.uuid, ".").concat(k), upd.fields[k]);
          } else {
            this.tv.$set(obj, k, upd.fields[k]);
          }
        }
      }
    }
  }, {
    key: "data_changed",
    value: function data_changed(args) {
      if (!this.sett.scripts) return;
      if (this.sett.data_change_exec === false) return;
      var main = this.data.chart.data;
      if (this.ww._data_uploading) return;
      if (!this.se_state.scripts) return;
      this.send_meta_2_ww();
      this.ww.just('upload-data', {
        ohlcv: main
      });
      this.ww._data_uploading = true;
      this.set_loading(true);
    }
  }, {
    key: "set_loading",
    value: function set_loading(flag) {
      var skrr = this.get('.').filter(function (x) {
        return x.settings.$props;
      });

      var _iterator5 = dc_events_createForOfIteratorHelper(skrr),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var s = _step5.value;
          this.merge("".concat(s.id), {
            loading: flag
          });
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
  }, {
    key: "send_meta_2_ww",
    value: function send_meta_2_ww() {
      var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
      var range = this.tv.getRange();
      this.ww.just('send-meta-info', {
        tf: tf,
        range: range
      });
    }
  }, {
    key: "merge_presets",
    value: function merge_presets(proto, preset) {
      if (!preset) return;

      for (var k in preset) {
        if (k === 'settings') {
          Object.assign(proto[k], preset[k]);
        } else {
          proto[k] = preset[k];
        }
      }
    }
  }, {
    key: "grid_mousedown",
    value: function grid_mousedown(args) {
      var _this3 = this;

      // TODO: tool state finished?
      this.object_selected([]); // Remove the previous RangeTool

      var rem = function rem() {
        return _this3.get('RangeTool').filter(function (x) {
          return x.settings.shiftMode;
        }).forEach(function (x) {
          return _this3.del(x.id);
        });
      };

      if (this.data.tool && this.data.tool !== 'Cursor' && !this.data.drawingMode) {
        // Prevent from "null" tools (tool created with HODL)
        if (args[1].type !== 'tap') {
          this.tv.$set(this.data, 'drawingMode', true);
          this.build_tool(args[0]);
        } else {
          this.tv.showTheTip("<b>Hodl</b>+<b>Drug</b> to create, " + "<b>Tap</b> to finish a tool");
        }
      } else if (this.sett.shift_measure && args[1].shiftKey) {
        rem();
        this.tv.$nextTick(function () {
          return _this3.build_tool(args[0], 'RangeTool:ShiftMode');
        });
      } else {
        rem();
      }
    }
  }, {
    key: "drawing_mode_off",
    value: function drawing_mode_off() {
      this.tv.$set(this.data, 'drawingMode', false);
      this.tv.$set(this.data, 'tool', 'Cursor');
    } // Place a new tool

  }, {
    key: "build_tool",
    value: function build_tool(grid_id, type) {
      var list = this.data.tools;
      type = type || this.data.tool;
      var proto = list.find(function (x) {
        return x.type === type;
      });
      if (!proto) return;
      var sett = Object.assign({}, proto.settings || {});
      var data = (proto.data || []).slice();
      if (!('legend' in sett)) sett.legend = false;
      if (!('z-index' in sett)) sett['z-index'] = 100;
      sett.$selected = true;
      sett.$state = 'wip';
      var side = grid_id ? 'offchart' : 'onchart';
      var id = this.add(side, {
        name: proto.name,
        type: type.split(':')[0],
        settings: sett,
        data: data,
        grid: {
          id: grid_id
        }
      });
      sett.$uuid = "".concat(id, "-").concat(utils.now());
      this.tv.$set(this.data, 'selected', sett.$uuid);
      this.add_trash_icon();
    } // Remove selected / Remove all, etc

  }, {
    key: "system_tool",
    value: function system_tool(type) {
      switch (type) {
        case 'Remove':
          if (this.data.selected) {
            this.del(this.data.selected);
            this.remove_trash_icon();
            this.drawing_mode_off();
            this.on_scroll_lock(false);
          }

          break;
      }
    } // Apply new overlay settings

  }, {
    key: "change_settings",
    value: function change_settings(args) {
      var settings = args[0];
      delete settings.id;
      var grid_id = args[1];
      this.merge("".concat(args[3], ".settings"), settings);
    } // Lock the scrolling mechanism

  }, {
    key: "on_scroll_lock",
    value: function on_scroll_lock(flag) {
      this.tv.$set(this.data, 'scrollLock', flag);
    } // When new object is selected / unselected

  }, {
    key: "object_selected",
    value: function object_selected(args) {
      var q = this.data.selected;

      if (q) {
        // Check if current drawing is finished
        //let res = this.get_one(`${q}.settings`)
        //if (res && res.$state !== 'finished') return
        this.merge("".concat(q, ".settings"), {
          $selected: false
        });
        this.remove_trash_icon();
      }

      this.tv.$set(this.data, 'selected', null);
      if (!args.length) return;
      this.tv.$set(this.data, 'selected', args[2]);
      this.merge("".concat(args[2], ".settings"), {
        $selected: true
      });
      this.add_trash_icon();
    }
  }, {
    key: "add_trash_icon",
    value: function add_trash_icon() {
      var type = 'System:Remove';

      if (this.data.tools.find(function (x) {
        return x.type === type;
      })) {
        return;
      }

      this.data.tools.push({
        type: type,
        icon: icons_namespaceObject["trash.png"]
      });
    }
  }, {
    key: "remove_trash_icon",
    value: function remove_trash_icon() {
      // TODO: Does not call Toolbar render (distr version)
      var type = 'System:Remove';
      utils.overwrite(this.data.tools, this.data.tools.filter(function (x) {
        return x.type !== type;
      }));
    } // Set overlay data from the web-worker

  }, {
    key: "on_overlay_data",
    value: function on_overlay_data(data) {
      var _this4 = this;

      this.get('.').forEach(function (x) {
        if (x.settings.$synth) _this4.del("".concat(x.id));
      });

      var _iterator6 = dc_events_createForOfIteratorHelper(data),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var ov = _step6.value;
          var obj = this.get_one("".concat(ov.id));

          if (obj) {
            this.tv.$set(obj, 'loading', false);
            if (!ov.data) continue;
            obj.data = ov.data;
          }

          if (!ov.new_ovs) continue;

          for (var id in ov.new_ovs.onchart) {
            if (!this.get_one("onchart.".concat(id))) {
              this.add('onchart', ov.new_ovs.onchart[id]);
            }
          }

          for (var id in ov.new_ovs.offchart) {
            if (!this.get_one("offchart.".concat(id))) {
              this.add('offchart', ov.new_ovs.offchart[id]);
            }
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
    } // Push overlay updates from the web-worker

  }, {
    key: "on_overlay_update",
    value: function on_overlay_update(data) {
      var _iterator7 = dc_events_createForOfIteratorHelper(data),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var ov = _step7.value;
          if (!ov.data) continue;
          var obj = this.get_one("".concat(ov.id));

          if (obj) {
            this.fast_merge(obj.data, ov.data, false);
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    } // Clean-up unfinished business (tools)

  }, {
    key: "before_destroy",
    value: function before_destroy() {
      var f = function f(x) {
        return !x.settings.$state || x.settings.$state === 'finished';
      };

      this.data.onchart = this.data.onchart.filter(f);
      this.data.offchart = this.data.offchart.filter(f);
      this.drawing_mode_off();
      this.on_scroll_lock(false);
      this.object_selected([]);
      this.ww.destroy();
    } // Get overlay by grid-layer id

  }, {
    key: "get_overlay",
    value: function get_overlay(obj) {
      var id = obj.id || "g".concat(obj.grid_id, "_").concat(obj.layer_id);
      var dcid = obj.uuid || this.gldc[id];
      return this.get_one("".concat(dcid));
    }
  }]);

  return DCEvents;
}();


;// CONCATENATED MODULE: ./src/helpers/dc_core.js









function dc_core_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = dc_core_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function dc_core_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dc_core_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dc_core_arrayLikeToArray(o, minLen); }

function dc_core_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function dc_core_createSuper(Derived) { var hasNativeReflectConstruct = dc_core_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function dc_core_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

// DataCube "private" methods




var DCCore = /*#__PURE__*/function (_DCEvents) {
  _inherits(DCCore, _DCEvents);

  var _super = dc_core_createSuper(DCCore);

  function DCCore() {
    classCallCheck_classCallCheck(this, DCCore);

    return _super.apply(this, arguments);
  }

  createClass_createClass(DCCore, [{
    key: "init_tvjs",
    value: // Set TV instance (once). Called by TradingVue itself
    function init_tvjs($root) {
      var _this = this;

      if (!this.tv) {
        this.tv = $root;
        this.init_data();
        this.update_ids(); // Listen to all setting changes
        // TODO: works only with merge()

        this.tv.$watch(function () {
          return _this.get_by_query('.settings');
        }, function (n, p) {
          return _this.on_settings(n, p);
        }); // Listen to all indices changes

        this.tv.$watch(function () {
          return _this.get('.').map(function (x) {
            return x.settings.$uuid;
          });
        }, function (n, p) {
          return _this.on_ids_changed(n, p);
        }); // Watch for all 'datasets' changes

        this.tv.$watch(function () {
          return _this.get('datasets');
        }, Dataset.watcher.bind(this));
      }
    } // Init Data Structure v1.1

  }, {
    key: "init_data",
    value: function init_data($root) {
      if (!('chart' in this.data)) {
        this.tv.$set(this.data, 'chart', {
          type: 'Candles',
          data: this.data.ohlcv || []
        });
      }

      if (!('onchart' in this.data)) {
        this.tv.$set(this.data, 'onchart', []);
      }

      if (!('offchart' in this.data)) {
        this.tv.$set(this.data, 'offchart', []);
      }

      if (!this.data.chart.settings) {
        this.tv.$set(this.data.chart, 'settings', {});
      } // Remove ohlcv cuz we have Data v1.1^


      delete this.data.ohlcv;

      if (!('datasets' in this.data)) {
        this.tv.$set(this.data, 'datasets', []);
      } // Init dataset proxies


      var _iterator = dc_core_createForOfIteratorHelper(this.data.datasets),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ds = _step.value;
          if (!this.dss) this.dss = {};
          this.dss[ds.id] = new Dataset(this, ds);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    } // Range change callback (called by TradingVue)
    // TODO: improve (reliablity + chunk with limited size)

  }, {
    key: "range_changed",
    value: function () {
      var _range_changed = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(range, tf, check) {
        var _this2 = this;

        var first, prom;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (check === void 0) {
                  check = false;
                }

                if (this.loader) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return");

              case 3:
                if (this.loading) {
                  _context.next = 19;
                  break;
                }

                first = this.data.chart.data[0][0];

                if (!(range[0] < first)) {
                  _context.next = 19;
                  break;
                }

                this.loading = true;
                _context.next = 9;
                return utils.pause(250);

              case 9:
                // Load bigger chunks
                range = range.slice(); // copy

                range[0] = Math.floor(range[0]);
                range[1] = Math.floor(first);
                prom = this.loader(range, tf, function (d) {
                  // Callback way
                  _this2.chunk_loaded(d);
                });

                if (!(prom && prom.then)) {
                  _context.next = 19;
                  break;
                }

                _context.t0 = this;
                _context.next = 17;
                return prom;

              case 17:
                _context.t1 = _context.sent;

                _context.t0.chunk_loaded.call(_context.t0, _context.t1);

              case 19:
                if (!check) this.last_chunk = [range, tf];

              case 20:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function range_changed(_x, _x2, _x3) {
        return _range_changed.apply(this, arguments);
      }

      return range_changed;
    }() // A new chunk of data is loaded
    // TODO: bulletproof fetch

  }, {
    key: "chunk_loaded",
    value: function chunk_loaded(data) {
      // Updates only candlestick data, or
      if (Array.isArray(data)) {
        this.merge('chart.data', data);
      } else {
        // Bunch of overlays, including chart.data
        for (var k in data) {
          this.merge(k, data[k]);
        }
      }

      this.loading = false;

      if (this.last_chunk) {
        this.range_changed.apply(this, _toConsumableArray(this.last_chunk).concat([true]));
        this.last_chunk = null;
      }
    } // Update ids for all overlays

  }, {
    key: "update_ids",
    value: function update_ids() {
      this.data.chart.id = "chart.".concat(this.data.chart.type);
      var count = {}; // grid_id,layer_id => DC id mapping

      this.gldc = {}, this.dcgl = {};

      var _iterator2 = dc_core_createForOfIteratorHelper(this.data.onchart),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ov = _step2.value;

          if (count[ov.type] === undefined) {
            count[ov.type] = 0;
          }

          var i = count[ov.type]++;
          ov.id = "onchart.".concat(ov.type).concat(i);
          if (!ov.name) ov.name = ov.type + " ".concat(i);
          if (!ov.settings) this.tv.$set(ov, 'settings', {}); // grid_id,layer_id => DC id mapping

          this.gldc["g0_".concat(ov.type, "_").concat(i)] = ov.id;
          this.dcgl[ov.id] = "g0_".concat(ov.type, "_").concat(i);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      count = {};
      var grids = [{}];
      var gid = 0;

      var _iterator3 = dc_core_createForOfIteratorHelper(this.data.offchart),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var ov = _step3.value;

          if (count[ov.type] === undefined) {
            count[ov.type] = 0;
          }

          var _i = count[ov.type]++;

          ov.id = "offchart.".concat(ov.type).concat(_i);
          if (!ov.name) ov.name = ov.type + " ".concat(_i);
          if (!ov.settings) this.tv.$set(ov, 'settings', {}); // grid_id,layer_id => DC id mapping

          gid++;
          var rgid = (ov.grid || {}).id || gid; // real grid_id
          // When we merge grid, skip ++

          if ((ov.grid || {}).id) gid--;
          if (!grids[rgid]) grids[rgid] = {};

          if (grids[rgid][ov.type] === undefined) {
            grids[rgid][ov.type] = 0;
          }

          var ri = grids[rgid][ov.type]++;
          this.gldc["g".concat(rgid, "_").concat(ov.type, "_").concat(ri)] = ov.id;
          this.dcgl[ov.id] = "g".concat(rgid, "_").concat(ov.type, "_").concat(ri);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    } // TODO: chart refine (from the exchange chart)

  }, {
    key: "update_candle",
    value: function update_candle(data) {
      var ohlcv = this.data.chart.data;
      var last = ohlcv[ohlcv.length - 1];
      var candle = data['candle'];
      var tf = this.tv.$refs.chart.interval_ms;
      var t_next = last[0] + tf;
      var now = data.t || utils.now();
      var t = now >= t_next ? now - now % tf : last[0]; // Update the entire candle

      if (candle.length >= 6) {
        t = candle[0];
      } else {
        candle = [t].concat(_toConsumableArray(candle));
      }

      this.agg.push('ohlcv', candle);
      this.update_overlays(data, t, tf);
      return t >= t_next;
    }
  }, {
    key: "update_tick",
    value: function update_tick(data) {
      var ohlcv = this.data.chart.data;
      var last = ohlcv[ohlcv.length - 1];
      var tick = data['price'];
      var volume = data['volume'] || 0;
      var tf = this.tv.$refs.chart.interval_ms;

      if (!tf) {
        return console.warn('Define the main timeframe');
      }

      var now = data.t || utils.now();
      if (!last) last = [now - now % tf];
      var t_next = last[0] + tf;
      var t = now >= t_next ? now - now % tf : last[0];

      if ((t >= t_next || !ohlcv.length) && tick !== undefined) {
        // And new zero-height candle
        var nc = [t, tick, tick, tick, tick, volume];
        this.agg.push('ohlcv', nc, tf);
        ohlcv.push(nc);
        this.scroll_to(t);
      } else if (tick !== undefined) {
        // Update an existing one
        // TODO: make a separate class Sampler
        last[2] = Math.max(tick, last[2]);
        last[3] = Math.min(tick, last[3]);
        last[4] = tick;
        last[5] += volume;
        this.agg.push('ohlcv', last, tf);
      }

      this.update_overlays(data, t, tf);
      return t >= t_next;
    } // Updates all overlays with given values.

  }, {
    key: "update_overlays",
    value: function update_overlays(data, t, tf) {
      for (var k in data) {
        if (k === 'price' || k === 'volume' || k === 'candle' || k === 't') {
          continue;
        }

        if (k.includes('datasets.')) {
          this.agg.push(k, data[k], tf);
          continue;
        }

        if (!Array.isArray(data[k])) {
          var val = [data[k]];
        } else {
          val = data[k];
        }

        if (!k.includes('.data')) k += '.data';
        this.agg.push(k, [t].concat(_toConsumableArray(val)), tf);
      }
    } // Returns array of objects matching query.
    // Object contains { parent, index, value }
    // TODO: query caching

  }, {
    key: "get_by_query",
    value: function get_by_query(query, chuck) {
      var tuple = query.split('.');

      switch (tuple[0]) {
        case 'chart':
          var result = this.chart_as_piv(tuple);
          break;

        case 'onchart':
        case 'offchart':
          result = this.query_search(query, tuple);
          break;

        case 'datasets':
          result = this.query_search(query, tuple);

          var _iterator4 = dc_core_createForOfIteratorHelper(result),
              _step4;

          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var r = _step4.value;

              if (r.i === 'data') {
                r.v = this.dss[r.p.id].data();
              }
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }

          break;

        default:
          /* Should get('.') return also the chart? */

          /*let ch = this.chart_as_query([
              'chart',
              tuple[1]
          ])*/
          var on = this.query_search(query, ['onchart', tuple[0], tuple[1]]);
          var off = this.query_search(query, ['offchart', tuple[0], tuple[1]]);
          result = [].concat(_toConsumableArray(on), _toConsumableArray(off));
          break;
      }

      return result.filter(function (x) {
        return !(x.v || {}).locked || chuck;
      });
    }
  }, {
    key: "chart_as_piv",
    value: function chart_as_piv(tuple) {
      var field = tuple[1];
      if (field) return [{
        p: this.data.chart,
        i: field,
        v: this.data.chart[field]
      }];else return [{
        p: this.data,
        i: 'chart',
        v: this.data.chart
      }];
    }
  }, {
    key: "query_search",
    value: function query_search(query, tuple) {
      var _this3 = this;

      var side = tuple[0];
      var path = tuple[1] || '';
      var field = tuple[2];
      var arr = this.data[side].filter(function (x) {
        return x.id === query || x.id && x.id.includes(path) || x.name === query || x.name && x.name.includes(path) || query.includes((x.settings || {}).$uuid);
      });

      if (field) {
        return arr.map(function (x) {
          return {
            p: x,
            i: field,
            v: x[field]
          };
        });
      }

      return arr.map(function (x, i) {
        return {
          p: _this3.data[side],
          i: _this3.data[side].indexOf(x),
          v: x
        };
      });
    }
  }, {
    key: "merge_objects",
    value: function merge_objects(obj, data, new_obj) {
      if (new_obj === void 0) {
        new_obj = {};
      }

      // The only way to get Vue to update all stuff
      // reactively is to create a brand new object.
      // TODO: Is there a simpler approach?
      Object.assign(new_obj, obj.v);
      Object.assign(new_obj, data);
      this.tv.$set(obj.p, obj.i, new_obj);
    } // Merge overlapping time series

  }, {
    key: "merge_ts",
    value: function merge_ts(obj, data) {
      // Assume that both arrays are pre-sorted
      if (!data.length) return obj.v;
      var r1 = [obj.v[0][0], obj.v[obj.v.length - 1][0]];
      var r2 = [data[0][0], data[data.length - 1][0]]; // Overlap

      var o = [Math.max(r1[0], r2[0]), Math.min(r1[1], r2[1])];

      if (o[1] >= o[0]) {
        var _obj$v, _data;

        var _this$ts_overlap = this.ts_overlap(obj.v, data, o),
            od = _this$ts_overlap.od,
            d1 = _this$ts_overlap.d1,
            d2 = _this$ts_overlap.d2;

        (_obj$v = obj.v).splice.apply(_obj$v, _toConsumableArray(d1));

        (_data = data).splice.apply(_data, _toConsumableArray(d2)); // Dst === Overlap === Src


        if (!obj.v.length && !data.length) {
          this.tv.$set(obj.p, obj.i, od);
          return obj.v;
        } // If src is totally contained in dst


        if (!data.length) {
          data = obj.v.splice(d1[0]);
        } // If dst is totally contained in src


        if (!obj.v.length) {
          obj.v = data.splice(d2[0]);
        }

        this.tv.$set(obj.p, obj.i, this.combine(obj.v, od, data));
      } else {
        this.tv.$set(obj.p, obj.i, this.combine(obj.v, [], data));
      }

      return obj.v;
    } // TODO: review performance, move to worker

  }, {
    key: "ts_overlap",
    value: function ts_overlap(arr1, arr2, range) {
      var t1 = range[0];
      var t2 = range[1];
      var ts = {}; // timestamp map

      var a1 = arr1.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      });
      var a2 = arr2.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      }); // Indices of segments

      var id11 = arr1.indexOf(a1[0]);
      var id12 = arr1.indexOf(a1[a1.length - 1]);
      var id21 = arr2.indexOf(a2[0]);
      var id22 = arr2.indexOf(a2[a2.length - 1]);

      for (var i = 0; i < a1.length; i++) {
        ts[a1[i][0]] = a1[i];
      }

      for (var i = 0; i < a2.length; i++) {
        ts[a2[i][0]] = a2[i];
      }

      var ts_sorted = Object.keys(ts).sort();
      return {
        od: ts_sorted.map(function (x) {
          return ts[x];
        }),
        d1: [id11, id12 - id11 + 1],
        d2: [id21, id22 - id21 + 1]
      };
    } // Combine parts together:
    // (destination, overlap, source)

  }, {
    key: "combine",
    value: function combine(dst, o, src) {
      function last(arr) {
        return arr[arr.length - 1][0];
      }

      if (!dst.length) {
        dst = o;
        o = [];
      }

      if (!src.length) {
        src = o;
        o = [];
      } // The overlap right in the middle


      if (src[0][0] >= dst[0][0] && last(src) <= last(dst)) {
        return Object.assign(dst, o); // The overlap is on the right
      } else if (last(src) > last(dst)) {
        // Psh(...) is faster but can overflow the stack
        if (o.length < 100000 && src.length < 100000) {
          var _dst;

          (_dst = dst).push.apply(_dst, _toConsumableArray(o).concat(_toConsumableArray(src)));

          return dst;
        } else {
          return dst.concat(o, src);
        } // The overlap is on the left

      } else if (src[0][0] < dst[0][0]) {
        // Push(...) is faster but can overflow the stack
        if (o.length < 100000 && src.length < 100000) {
          var _src;

          (_src = src).push.apply(_src, _toConsumableArray(o).concat(_toConsumableArray(dst)));

          return src;
        } else {
          return src.concat(o, dst);
        }
      } else {
        return [];
      }
    } // Simple data-point merge (faster)

  }, {
    key: "fast_merge",
    value: function fast_merge(data, point, main) {
      if (main === void 0) {
        main = true;
      }

      if (!data) return;
      var last_t = (data[data.length - 1] || [])[0];
      var upd_t = point[0];

      if (!data.length || upd_t > last_t) {
        data.push(point);

        if (main && this.sett.auto_scroll) {
          this.scroll_to(upd_t);
        }
      } else if (upd_t === last_t) {
        if (main) {
          this.tv.$set(data, data.length - 1, point);
        } else {
          data[data.length - 1] = point;
        }
      }
    }
  }, {
    key: "scroll_to",
    value: function scroll_to(t) {
      if (this.tv.$refs.chart.cursor.locked) return;
      var last = this.tv.$refs.chart.last_candle;
      if (!last) return;
      var tl = last[0];
      var d = this.tv.getRange()[1] - tl;
      if (d > 0) this.tv["goto"](t + d);
    }
  }]);

  return DCCore;
}(DCEvents);


;// CONCATENATED MODULE: ./src/helpers/sett_proxy.js
// Sends all dc.sett changes to the web-worker
/* harmony default export */ function sett_proxy(sett, ww) {
  var h = {
    get: function get(sett, k) {
      return sett[k];
    },
    set: function set(sett, k, v) {
      sett[k] = v;
      ww.just('update-dc-settings', sett);
      return true;
    }
  };
  ww.just('update-dc-settings', sett);
  return new Proxy(sett, h);
}
;// CONCATENATED MODULE: ./src/helpers/agg_tool.js


// Tick aggregation


var AggTool = /*#__PURE__*/function () {
  function AggTool(dc, _int) {
    if (_int === void 0) {
      _int = 100;
    }

    classCallCheck_classCallCheck(this, AggTool);

    this.symbols = {};
    this["int"] = _int; // Itarval in ms

    this.dc = dc;
    this.st_id = null;
    this.data_changed = false;
  }

  createClass_createClass(AggTool, [{
    key: "push",
    value: function push(sym, upd, tf) {
      var _this = this;

      // Start auto updates
      if (!this.st_id) {
        this.st_id = setTimeout(function () {
          return _this.update();
        });
      }

      tf = parseInt(tf);
      var old = this.symbols[sym];
      var t = utils.now();
      var isds = sym.includes('datasets.');
      this.data_changed = true;

      if (!old) {
        this.symbols[sym] = {
          upd: upd,
          t: t,
          data: []
        };
      } else if (upd[0] >= old.upd[0] + tf && !isds) {
        // Refine the previous data point
        this.refine(sym, old.upd.slice());
        this.symbols[sym] = {
          upd: upd,
          t: t,
          data: []
        };
      } else {
        // Tick updates the current
        this.symbols[sym].upd = upd;
        this.symbols[sym].t = t;
      }

      if (isds) {
        this.symbols[sym].data.push(upd);
      }
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;

      var out = {};

      for (var sym in this.symbols) {
        var upd = this.symbols[sym].upd;

        switch (sym) {
          case 'ohlcv':
            var data = this.dc.data.chart.data;
            this.dc.fast_merge(data, upd);
            out.ohlcv = data.slice(-2);
            break;

          default:
            if (sym.includes('datasets.')) {
              this.update_ds(sym, out);
              continue;
            }

            var data = this.dc.get_one("".concat(sym));
            if (!data) continue;
            this.dc.fast_merge(data, upd, false);
            break;
        }
      } // TODO: fill gaps


      if (this.data_changed) {
        this.dc.ww.just('update-data', out);
        this.data_changed = false;
      }

      setTimeout(function () {
        return _this2.update();
      }, this["int"]);
    }
  }, {
    key: "refine",
    value: function refine(sym, upd) {
      if (sym === 'ohlcv') {
        var data = this.dc.data.chart.data;
        this.dc.fast_merge(data, upd);
      } else {
        var data = this.dc.get_one("".concat(sym));
        if (!data) return;
        this.dc.fast_merge(data, upd, false);
      }
    }
  }, {
    key: "update_ds",
    value: function update_ds(sym, out) {
      var data = this.symbols[sym].data;

      if (data.length) {
        out[sym] = data;
        this.symbols[sym].data = [];
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.symbols = {};
    }
  }]);

  return AggTool;
}();


;// CONCATENATED MODULE: ./src/helpers/datacube.js








function datacube_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = datacube_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function datacube_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return datacube_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return datacube_arrayLikeToArray(o, minLen); }

function datacube_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function datacube_createSuper(Derived) { var hasNativeReflectConstruct = datacube_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function datacube_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

// Main DataHelper class. A container for data,
// which works as a proxy and CRUD interface



 // Interface methods. Private methods in dc_core.js

var DataCube = /*#__PURE__*/function (_DCCore) {
  _inherits(DataCube, _DCCore);

  var _super = datacube_createSuper(DataCube);

  function DataCube(data, sett) {
    var _this;

    if (data === void 0) {
      data = {};
    }

    if (sett === void 0) {
      sett = {};
    }

    classCallCheck_classCallCheck(this, DataCube);

    var def_sett = {
      aggregation: 100,
      // Update aggregation interval
      script_depth: 0,
      // 0 === Exec on all data
      auto_scroll: true,
      // Auto scroll to a new candle
      scripts: true,
      // Enable overlays scripts,
      ww_ram_limit: 0,
      // WebWorker RAM limit (MB)
      node_url: null,
      // Use node.js instead of WW
      shift_measure: true // Draw measurment shift+click

    };
    sett = Object.assign(def_sett, sett);
    _this = _super.call(this);
    _this.sett = sett;
    _this.data = data;
    _this.sett = sett_proxy(sett, _this.ww);
    _this.agg = new AggTool(_assertThisInitialized(_this), sett.aggregation);
    _this.se_state = {}; //this.agg.update = this.agg_update.bind(this)

    return _this;
  } // Add new overlay


  createClass_createClass(DataCube, [{
    key: "add",
    value: function add(side, overlay) {
      if (side !== 'onchart' && side !== 'offchart' && side !== 'datasets') {
        return;
      }

      this.data[side].push(overlay);
      this.update_ids();
      return overlay.id;
    } // Get all objects matching the query

  }, {
    key: "get",
    value: function get(query) {
      return this.get_by_query(query).map(function (x) {
        return x.v;
      });
    } // Get first object matching the query

  }, {
    key: "get_one",
    value: function get_one(query) {
      return this.get_by_query(query).map(function (x) {
        return x.v;
      })[0];
    } // Set data (reactively)

  }, {
    key: "set",
    value: function set(query, data) {
      var objects = this.get_by_query(query);

      var _iterator = datacube_createForOfIteratorHelper(objects),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var obj = _step.value;
          var i = obj.i !== undefined ? obj.i : obj.p.indexOf(obj.v);

          if (i !== -1) {
            this.tv.$set(obj.p, i, data);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.update_ids();
    } // Merge object or array (reactively)

  }, {
    key: "merge",
    value: function merge(query, data) {
      var objects = this.get_by_query(query);

      var _iterator2 = datacube_createForOfIteratorHelper(objects),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var obj = _step2.value;

          if (Array.isArray(obj.v)) {
            if (!Array.isArray(data)) continue; // If array is a timeseries, merge it by timestamp
            // else merge by item index

            if (obj.v[0] && obj.v[0].length >= 2) {
              this.merge_ts(obj, data);
            } else {
              this.merge_objects(obj, data, []);
            }
          } else if (typeof_typeof(obj.v) === 'object') {
            this.merge_objects(obj, data);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      this.update_ids();
    } // Remove an overlay by query (id/type/name/...)

  }, {
    key: "del",
    value: function del(query) {
      var objects = this.get_by_query(query);

      var _iterator3 = datacube_createForOfIteratorHelper(objects),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var obj = _step3.value;
          // Find current index of the field (if not defined)
          var i = typeof obj.i !== 'number' ? obj.i : obj.p.indexOf(obj.v);

          if (i !== -1) {
            this.tv.$delete(obj.p, i);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      this.update_ids();
    } // Update/append data point, depending on timestamp

  }, {
    key: "update",
    value: function update(data) {
      if (data['candle']) {
        return this.update_candle(data);
      } else {
        return this.update_tick(data);
      }
    } // Lock overlays from being pulled by query_search
    // TODO: subject to review

  }, {
    key: "lock",
    value: function lock(query) {
      var objects = this.get_by_query(query);
      objects.forEach(function (x) {
        if (x.v && x.v.id && x.v.type) {
          x.v.locked = true;
        }
      });
    } // Unlock overlays from being pulled by query_search
    //

  }, {
    key: "unlock",
    value: function unlock(query) {
      var objects = this.get_by_query(query, true);
      objects.forEach(function (x) {
        if (x.v && x.v.id && x.v.type) {
          x.v.locked = false;
        }
      });
    } // Show indicator

  }, {
    key: "show",
    value: function show(query) {
      if (query === 'offchart' || query === 'onchart') {
        query += '.';
      } else if (query === '.') {
        query = '';
      }

      this.merge(query + '.settings', {
        display: true
      });
    } // Hide indicator

  }, {
    key: "hide",
    value: function hide(query) {
      if (query === 'offchart' || query === 'onchart') {
        query += '.';
      } else if (query === '.') {
        query = '';
      }

      this.merge(query + '.settings', {
        display: false
      });
    } // Set data loader callback

  }, {
    key: "onrange",
    value: function onrange(callback) {
      var _this2 = this;

      this.loader = callback;
      setTimeout(function () {
        return _this2.tv.set_loader(callback ? _this2 : null);
      }, 0);
    }
  }]);

  return DataCube;
}(DCCore);


;// CONCATENATED MODULE: ./src/helpers/DataProvider.js






function DataProvider_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function DataProvider_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { DataProvider_ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { DataProvider_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * DataProvider - Automatic data loading for different timeframes
 *
 * Provides:
 * - Auto-loading OHLCV data when timeframe changes
 * - Caching loaded data
 * - Custom data loader callback support
 * - Simulated data generation for demo
 */
var DataProvider = /*#__PURE__*/function () {
  function DataProvider(options) {
    if (options === void 0) {
      options = {};
    }

    classCallCheck_classCallCheck(this, DataProvider);

    // Configuration
    this.options = DataProvider_objectSpread({
      // Custom data loader: async (symbol, tf) => ohlcv[]
      loader: null,
      // Symbol to load
      symbol: options.symbol || 'BTC/USDT',
      // Cache enabled
      cache: options.cache !== false,
      // Max cache size (per symbol)
      maxCacheSize: options.maxCacheSize || 10,
      // Generate demo data if no loader provided
      generateDemo: options.generateDemo !== false
    }, options); // Data cache: symbol -> tf -> ohlcv[]

    this.cache = new Map(); // TF to minutes mapping

    this.tfMinutes = {
      '1s': 1 / 60,
      '5s': 5 / 60,
      '15s': 15 / 60,
      '30s': 30 / 60,
      '1': 1,
      '2': 2,
      '3': 3,
      '5': 5,
      '10': 10,
      '15': 15,
      '20': 20,
      '30': 30,
      '45': 45,
      '60': 60,
      '120': 120,
      '180': 180,
      '240': 240,
      '360': 360,
      '480': 480,
      '720': 720,
      '1D': 1440,
      '2D': 2880,
      '3D': 4320,
      '1W': 10080,
      '2W': 20160,
      '1M': 43200,
      '3M': 129600,
      '6M': 259200,
      '12M': 518400,
      '1Y': 525600
    }; // Default candle counts per TF

    this.defaultCounts = {
      '1s': 1000,
      '5s': 800,
      '15s': 600,
      '30s': 500,
      '1': 500,
      '3': 400,
      '5': 400,
      '15': 300,
      '30': 250,
      '60': 200,
      '240': 150,
      '720': 100,
      '1D': 100,
      '1W': 52,
      '1M': 24
    };
  }
  /**
   * Get data for timeframe
   * @param {string} tf - Timeframe
   * @param {string} symbol - Trading pair (optional)
   * @returns {Promise<Array>} OHLCV data
   */


  createClass_createClass(DataProvider, [{
    key: "getData",
    value: function () {
      var _getData = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(tf, symbol) {
        var cached, data;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (symbol === void 0) {
                  symbol = this.options.symbol;
                }

                if (!this.options.cache) {
                  _context.next = 6;
                  break;
                }

                cached = this.getCached(symbol, tf);

                if (!cached) {
                  _context.next = 6;
                  break;
                }

                console.log("[DataProvider] Using cached data for ".concat(symbol, " ").concat(tf));
                return _context.abrupt("return", cached);

              case 6:
                if (!this.options.loader) {
                  _context.next = 13;
                  break;
                }

                // Use custom loader
                console.log("[DataProvider] Loading ".concat(symbol, " ").concat(tf, " via custom loader..."));
                _context.next = 10;
                return this.options.loader(symbol, tf);

              case 10:
                data = _context.sent;
                _context.next = 19;
                break;

              case 13:
                if (!this.options.generateDemo) {
                  _context.next = 18;
                  break;
                }

                // Generate demo data
                console.log("[DataProvider] Generating demo data for ".concat(symbol, " ").concat(tf, "..."));
                data = this.generateDemoData(tf);
                _context.next = 19;
                break;

              case 18:
                throw new Error("No data loader configured and demo generation disabled");

              case 19:
                // Cache the result
                if (this.options.cache && data) {
                  this.setCached(symbol, tf, data);
                }

                return _context.abrupt("return", data);

              case 21:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getData(_x, _x2) {
        return _getData.apply(this, arguments);
      }

      return getData;
    }()
    /**
     * Sync version for immediate use (uses cache or generates demo)
     */

  }, {
    key: "getDataSync",
    value: function getDataSync(tf, symbol) {
      if (symbol === void 0) {
        symbol = this.options.symbol;
      }

      // Check cache
      var cached = this.getCached(symbol, tf);
      if (cached) return cached; // Generate demo if enabled

      if (this.options.generateDemo) {
        var data = this.generateDemoData(tf);

        if (this.options.cache) {
          this.setCached(symbol, tf, data);
        }

        return data;
      }

      return null;
    }
    /**
     * Get cached data
     */

  }, {
    key: "getCached",
    value: function getCached(symbol, tf) {
      if (!this.cache.has(symbol)) return null;
      return this.cache.get(symbol).get(tf) || null;
    }
    /**
     * Set cached data
     */

  }, {
    key: "setCached",
    value: function setCached(symbol, tf, data) {
      if (!this.cache.has(symbol)) {
        this.cache.set(symbol, new Map());
      }

      var symbolCache = this.cache.get(symbol); // Limit cache size (LRU-style)

      if (symbolCache.size >= this.options.maxCacheSize) {
        var firstKey = symbolCache.keys().next().value;
        symbolCache["delete"](firstKey);
      }

      symbolCache.set(tf, data);
    }
    /**
     * Clear cache
     */

  }, {
    key: "clearCache",
    value: function clearCache(symbol) {
      if (symbol === void 0) {
        symbol = null;
      }

      if (symbol) {
        this.cache["delete"](symbol);
      } else {
        this.cache.clear();
      }
    }
    /**
     * Convert TF string to minutes
     */

  }, {
    key: "tfToMinutes",
    value: function tfToMinutes(tf) {
      // Handle numeric strings (minutes)
      if (/^\d+$/.test(tf)) {
        return parseInt(tf);
      } // Handle format like "1H", "4H", "1D"


      var match = tf.match(/^(\d+)(s|m|h|D|W|M|Y)$/i);

      if (match) {
        var num = parseInt(match[1]);
        var unit = match[2].toUpperCase();

        switch (unit) {
          case 'S':
            return num / 60;

          case 'M':
            return num * 43200;
          // Approximate

          case 'H':
            return num * 60;

          case 'D':
            return num * 1440;

          case 'W':
            return num * 10080;

          case 'Y':
            return num * 525600;
        }
      }

      return this.tfMinutes[tf] || 1440; // Default to 1D
    }
    /**
     * Generate demo OHLCV data
     */

  }, {
    key: "generateDemoData",
    value: function generateDemoData(tf, count) {
      if (count === void 0) {
        count = null;
      }

      var minutes = this.tfToMinutes(tf);
      var candleCount = count || this.defaultCounts[tf] || 200;
      var data = [];
      var now = Date.now();
      var interval = minutes * 60000;
      var price = 100 + Math.random() * 900; // Starting price 100-1000

      var trend = Math.random() > 0.5 ? 1 : -1;
      var trendStrength = Math.random() * 0.02;
      var volatility = 0.02 + Math.random() * 0.03;

      for (var i = 0; i < candleCount; i++) {
        var ts = now - (candleCount - i) * interval; // Trend following with random noise

        if (Math.random() < 0.05) {
          trend *= -1; // Occasional trend reversal

          trendStrength = Math.random() * 0.02;
        }

        var open = price;
        var trendMove = trend * trendStrength * price;
        var noise = (Math.random() - 0.5) * volatility * price;
        var close = open + trendMove + noise;
        var high = Math.max(open, close) + Math.random() * volatility * price * 0.5;
        var low = Math.min(open, close) - Math.random() * volatility * price * 0.5;
        var volume = Math.floor(100000 + Math.random() * 900000);
        data.push([Math.floor(ts), this.roundPrice(open), this.roundPrice(high), this.roundPrice(low), this.roundPrice(close), volume]);
        price = close;
      }

      return data;
    }
    /**
     * Round price to reasonable precision
     */

  }, {
    key: "roundPrice",
    value: function roundPrice(price) {
      if (price > 1000) return Math.round(price * 100) / 100;
      if (price > 1) return Math.round(price * 10000) / 10000;
      return Math.round(price * 1000000) / 1000000;
    }
    /**
     * Set custom data loader
     * @param {Function} loader - async (symbol, tf) => ohlcv[]
     */

  }, {
    key: "setLoader",
    value: function setLoader(loader) {
      this.options.loader = loader;
    }
    /**
     * Set symbol
     */

  }, {
    key: "setSymbol",
    value: function setSymbol(symbol) {
      this.options.symbol = symbol;
    }
  }]);

  return DataProvider;
}();


;// CONCATENATED MODULE: ./src/helpers/IndicatorManager.js





function IndicatorManager_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function IndicatorManager_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { IndicatorManager_ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { IndicatorManager_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function IndicatorManager_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = IndicatorManager_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function IndicatorManager_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return IndicatorManager_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return IndicatorManager_arrayLikeToArray(o, minLen); }

function IndicatorManager_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * IndicatorManager - Automatic indicator management and recalculation
 *
 * Features:
 * - Register indicators with calculation functions
 * - Auto-recalculate when timeframe/data changes
 * - Support for onchart and offchart indicators
 * - Preset indicator configurations
 * - Auto color assignment for duplicate indicators
 * - Settings update support
 */
var IndicatorManager = /*#__PURE__*/function () {
  function IndicatorManager(dataCube, dataProvider) {
    classCallCheck_classCallCheck(this, IndicatorManager);

    this.dc = dataCube;
    this.dp = dataProvider; // Registered indicators: type -> config

    this.indicators = new Map(); // Active indicators: id -> config

    this.active = new Map(); // Counter for unique IDs

    this.counter = 0; // Color palette for auto-assignment

    this.colorPalette = ['#2962ff', '#ff6d00', '#00c853', '#aa00ff', '#00b8d4', '#ff1744', '#ffd600', '#76ff03', '#e040fb', '#18ffff', '#ff6e40', '#69f0ae', '#40c4ff', '#ff4081', '#eeff41', '#b2ff59']; // Track color usage per type

    this.colorUsage = new Map(); // type -> [used colors]
    // Register built-in indicators

    this.registerBuiltins();
  }
  /**
   * Register built-in indicators
   */


  createClass_createClass(IndicatorManager, [{
    key: "registerBuiltins",
    value: function registerBuiltins() {
      var _this = this;

      // EMA - Exponential Moving Average
      this.register('EMA', {
        name: 'EMA',
        params: {
          length: 20
        },
        position: 'onchart',
        calc: function calc(data, params) {
          return _this.calcEMA(data, params.length);
        },
        defaultSettings: {
          width: 2,
          lineStyle: 'solid',
          opacity: 100,
          visible: true
        }
      }); // SMA - Simple Moving Average

      this.register('SMA', {
        name: 'SMA',
        params: {
          length: 50
        },
        position: 'onchart',
        calc: function calc(data, params) {
          return _this.calcSMA(data, params.length);
        },
        defaultSettings: {
          width: 2,
          lineStyle: 'solid',
          opacity: 100,
          visible: true
        }
      }); // WMA - Weighted Moving Average

      this.register('WMA', {
        name: 'WMA',
        params: {
          length: 20
        },
        position: 'onchart',
        calc: function calc(data, params) {
          return _this.calcWMA(data, params.length);
        },
        defaultSettings: {
          width: 2,
          lineStyle: 'solid',
          opacity: 100,
          visible: true
        }
      }); // BB - Bollinger Bands

      this.register('BB', {
        name: 'Bollinger Bands',
        params: {
          length: 20,
          mult: 2
        },
        position: 'onchart',
        calc: function calc(data, params) {
          return _this.calcBB(data, params.length, params.mult);
        },
        defaultSettings: {
          width: 1,
          lineStyle: 'solid',
          opacity: 80,
          visible: true
        },
        renderer: 'Channel'
      }); // RSI - Relative Strength Index

      this.register('RSI', {
        name: 'RSI',
        params: {
          length: 14
        },
        position: 'offchart',
        calc: function calc(data, params) {
          return _this.calcRSI(data, params.length);
        },
        defaultSettings: {
          width: 2,
          upper: 70,
          lower: 30,
          opacity: 100,
          visible: true,
          showLegend: true
        }
      }); // MACD

      this.register('MACD', {
        name: 'MACD',
        params: {
          fast: 12,
          slow: 26,
          signal: 9
        },
        position: 'offchart',
        calc: function calc(data, params) {
          return _this.calcMACD(data, params.fast, params.slow, params.signal);
        },
        defaultSettings: {
          opacity: 100,
          visible: true,
          showLegend: true
        }
      }); // ATR - Average True Range

      this.register('ATR', {
        name: 'ATR',
        params: {
          length: 14
        },
        position: 'offchart',
        calc: function calc(data, params) {
          return _this.calcATR(data, params.length);
        },
        defaultSettings: {
          width: 2,
          opacity: 100,
          visible: true,
          showLegend: true
        }
      }); // Volume MA

      this.register('VolMA', {
        name: 'Volume MA',
        params: {
          length: 20
        },
        position: 'offchart',
        calc: function calc(data, params) {
          return _this.calcVolMA(data, params.length);
        },
        defaultSettings: {
          width: 2,
          opacity: 100,
          visible: true,
          showLegend: true
        }
      }); // Stochastic

      this.register('Stoch', {
        name: 'Stochastic',
        params: {
          k: 14,
          d: 3,
          smooth: 3
        },
        position: 'offchart',
        calc: function calc(data, params) {
          return _this.calcStoch(data, params.k, params.d, params.smooth);
        },
        defaultSettings: {
          width: 2,
          upper: 80,
          lower: 20,
          opacity: 100,
          visible: true,
          showLegend: true
        }
      });
    }
    /**
     * Get next available color for indicator type
     */

  }, {
    key: "getNextColor",
    value: function getNextColor(type) {
      // Get used colors for this type
      if (!this.colorUsage.has(type)) {
        this.colorUsage.set(type, []);
      }

      var usedColors = this.colorUsage.get(type); // Find first unused color

      var _iterator = IndicatorManager_createForOfIteratorHelper(this.colorPalette),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var color = _step.value;

          if (!usedColors.includes(color)) {
            usedColors.push(color);
            return color;
          }
        } // All colors used, generate a variation

      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var baseColor = this.colorPalette[usedColors.length % this.colorPalette.length];
      return this.lightenColor(baseColor, (usedColors.length - this.colorPalette.length) * 0.1);
    }
    /**
     * Lighten a color
     */

  }, {
    key: "lightenColor",
    value: function lightenColor(hex, factor) {
      var r = parseInt(hex.slice(1, 3), 16);
      var g = parseInt(hex.slice(3, 5), 16);
      var b = parseInt(hex.slice(5, 7), 16);
      var newR = Math.min(255, Math.floor(r + (255 - r) * factor));
      var newG = Math.min(255, Math.floor(g + (255 - g) * factor));
      var newB = Math.min(255, Math.floor(b + (255 - b) * factor));
      return "#".concat(newR.toString(16).padStart(2, '0')).concat(newG.toString(16).padStart(2, '0')).concat(newB.toString(16).padStart(2, '0'));
    }
    /**
     * Release color when indicator is removed
     */

  }, {
    key: "releaseColor",
    value: function releaseColor(type, color) {
      if (this.colorUsage.has(type)) {
        var usedColors = this.colorUsage.get(type);
        var index = usedColors.indexOf(color);

        if (index > -1) {
          usedColors.splice(index, 1);
        }
      }
    }
    /**
     * Register custom indicator
     */

  }, {
    key: "register",
    value: function register(type, config) {
      this.indicators.set(type, config);
    }
    /**
     * Add indicator to chart
     * @param {string} type - Indicator type (EMA, RSI, etc.)
     * @param {object} params - Parameters
     * @param {object} settings - Display settings
     * @returns {string} Indicator ID
     */

  }, {
    key: "add",
    value: function add(type, params, settings) {
      var _this$dc$data$chart;

      if (params === void 0) {
        params = {};
      }

      if (settings === void 0) {
        settings = {};
      }

      var config = this.indicators.get(type);

      if (!config) {
        console.error("Unknown indicator type: ".concat(type));
        return null;
      }

      this.counter++;
      var id = "".concat(type, "_").concat(this.counter); // Merge params

      var finalParams = IndicatorManager_objectSpread(IndicatorManager_objectSpread({}, config.params), params); // Get auto color if not specified


      var color = settings.color;

      if (!color) {
        color = this.getNextColor(type);
      } // Merge settings


      var finalSettings = IndicatorManager_objectSpread(IndicatorManager_objectSpread({}, config.defaultSettings), {}, {
        color: color
      }, settings); // Get current OHLCV data


      var ohlcv = ((_this$dc$data$chart = this.dc.data.chart) === null || _this$dc$data$chart === void 0 ? void 0 : _this$dc$data$chart.data) || []; // Calculate indicator values

      var indicatorData = config.calc(ohlcv, finalParams); // Create display name with params

      var displayName = this.formatDisplayName(type, finalParams, this.counter); // Create indicator object

      var indicator = {
        id: id,
        type: type,
        name: displayName,
        data: indicatorData,
        settings: finalSettings,
        params: finalParams,
        _config: config // Store config for recalculation

      }; // Add to DataCube

      this.dc.add(config.position, indicator);
      this.active.set(id, indicator);
      console.log("[IndicatorManager] Added ".concat(displayName, " (").concat(id, ") with color ").concat(color));
      return id;
    }
    /**
     * Format display name with auto-numbering
     */

  }, {
    key: "formatDisplayName",
    value: function formatDisplayName(type, params, count) {
      // Count existing indicators of same type
      var sameTypeCount = 0;

      var _iterator2 = IndicatorManager_createForOfIteratorHelper(this.active),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
              ind = _step2$value[1];

          if (ind.type === type) sameTypeCount++;
        } // Build param string

      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var paramStr = Object.values(params).join(', '); // Add number if multiple of same type

      if (sameTypeCount > 0 || count > 1) {
        return "".concat(type, "(").concat(paramStr, ") #").concat(sameTypeCount + 1);
      }

      return "".concat(type, "(").concat(paramStr, ")");
    }
    /**
     * Update indicator settings
     */

  }, {
    key: "update",
    value: function update(id, updates) {
      if (updates === void 0) {
        updates = {};
      }

      var indicator = this.active.get(id);
      if (!indicator) return false; // Update params if provided

      if (updates.params) {
        var _this$dc$data$chart2;

        indicator.params = IndicatorManager_objectSpread(IndicatorManager_objectSpread({}, indicator.params), updates.params); // Recalculate data with new params

        var ohlcv = ((_this$dc$data$chart2 = this.dc.data.chart) === null || _this$dc$data$chart2 === void 0 ? void 0 : _this$dc$data$chart2.data) || [];
        indicator.data = indicator._config.calc(ohlcv, indicator.params); // Update name

        indicator.name = this.formatDisplayName(indicator.type, indicator.params, parseInt(id.split('_')[1]));
      } // Update settings if provided


      if (updates.settings) {
        // If color changed, update color usage
        if (updates.settings.color && updates.settings.color !== indicator.settings.color) {
          this.releaseColor(indicator.type, indicator.settings.color);
          var usedColors = this.colorUsage.get(indicator.type) || [];
          usedColors.push(updates.settings.color);
        }

        indicator.settings = IndicatorManager_objectSpread(IndicatorManager_objectSpread({}, indicator.settings), updates.settings);
      } // Update in DataCube


      var position = indicator._config.position;
      var list = this.dc.data[position];
      var index = list.findIndex(function (i) {
        return i.id === id;
      });

      if (index !== -1) {
        // Vue reactivity
        this.dc.tv.$set(list, index, IndicatorManager_objectSpread({}, indicator));
      }

      console.log("[IndicatorManager] Updated ".concat(id));
      return true;
    }
    /**
     * Remove indicator
     */

  }, {
    key: "remove",
    value: function remove(id) {
      var indicator = this.active.get(id);
      if (!indicator) return false; // Release color

      this.releaseColor(indicator.type, indicator.settings.color);
      var config = indicator._config;
      var list = this.dc.data[config.position];
      var index = list.findIndex(function (i) {
        return i.id === id;
      });

      if (index !== -1) {
        list.splice(index, 1);
        this.active["delete"](id);
        console.log("[IndicatorManager] Removed ".concat(id));
        return true;
      }

      return false;
    }
    /**
     * Get indicator by ID
     */

  }, {
    key: "get",
    value: function get(id) {
      return this.active.get(id);
    }
    /**
     * Recalculate all active indicators
     * Called when timeframe/data changes
     */

  }, {
    key: "recalculateAll",
    value: function recalculateAll(ohlcv) {
      var _this$dc$data$chart3;

      if (ohlcv === void 0) {
        ohlcv = null;
      }

      var data = ohlcv || ((_this$dc$data$chart3 = this.dc.data.chart) === null || _this$dc$data$chart3 === void 0 ? void 0 : _this$dc$data$chart3.data) || [];
      console.log("[IndicatorManager] Recalculating ".concat(this.active.size, " indicators..."));

      var _iterator3 = IndicatorManager_createForOfIteratorHelper(this.active),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _step3$value = _slicedToArray(_step3.value, 2),
              id = _step3$value[0],
              indicator = _step3$value[1];

          var config = indicator._config; // Recalculate data

          indicator.data = config.calc(data, indicator.params); // Update in DataCube

          this.dc.merge("".concat(config.position, ".").concat(id, ".data"), indicator.data);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
    /**
     * Clear all indicators
     */

  }, {
    key: "clear",
    value: function clear() {
      // Remove all onchart indicators
      var onchart = this.dc.data.onchart || [];

      while (onchart.length > 0) {
        onchart.pop();
      } // Remove all offchart indicators


      var offchart = this.dc.data.offchart || [];

      while (offchart.length > 0) {
        offchart.pop();
      } // Clear color usage


      this.colorUsage.clear();
      this.active.clear();
      console.log("[IndicatorManager] Cleared all indicators");
    }
    /**
     * Get active indicators count
     */

  }, {
    key: "count",
    get: function get() {
      return this.active.size;
    }
    /**
     * Get list of active indicators
     */

  }, {
    key: "list",
    get: function get() {
      return Array.from(this.active.values()).map(function (i) {
        return {
          id: i.id,
          type: i.type,
          name: i.name,
          position: i._config.position,
          params: IndicatorManager_objectSpread({}, i.params),
          settings: IndicatorManager_objectSpread({}, i.settings)
        };
      });
    } // ==================== Indicator Calculations ====================

    /**
     * EMA - Exponential Moving Average
     */

  }, {
    key: "calcEMA",
    value: function calcEMA(data, period) {
      var result = [];
      if (data.length === 0) return result;
      var k = 2 / (period + 1);
      var ema = data[0][4];

      for (var i = 0; i < data.length; i++) {
        var close = data[i][4];
        ema = i === 0 ? close : close * k + ema * (1 - k);
        result.push([data[i][0], ema]);
      }

      return result;
    }
    /**
     * SMA - Simple Moving Average
     */

  }, {
    key: "calcSMA",
    value: function calcSMA(data, period) {
      var result = [];

      for (var i = 0; i < data.length; i++) {
        if (i < period - 1) {
          result.push([data[i][0], null]);
        } else {
          var sum = 0;

          for (var j = 0; j < period; j++) {
            sum += data[i - j][4];
          }

          result.push([data[i][0], sum / period]);
        }
      }

      return result;
    }
    /**
     * WMA - Weighted Moving Average
     */

  }, {
    key: "calcWMA",
    value: function calcWMA(data, period) {
      var result = [];
      var weightSum = period * (period + 1) / 2;

      for (var i = 0; i < data.length; i++) {
        if (i < period - 1) {
          result.push([data[i][0], null]);
        } else {
          var sum = 0;

          for (var j = 0; j < period; j++) {
            sum += data[i - j][4] * (period - j);
          }

          result.push([data[i][0], sum / weightSum]);
        }
      }

      return result;
    }
    /**
     * Bollinger Bands
     */

  }, {
    key: "calcBB",
    value: function calcBB(data, period, mult) {
      var result = [];

      for (var i = 0; i < data.length; i++) {
        if (i < period - 1) {
          result.push([data[i][0], null, null, null]);
        } else {
          var sum = 0;

          for (var j = 0; j < period; j++) {
            sum += data[i - j][4];
          }

          var sma = sum / period;
          var sqSum = 0;

          for (var _j = 0; _j < period; _j++) {
            sqSum += Math.pow(data[i - _j][4] - sma, 2);
          }

          var std = Math.sqrt(sqSum / period);
          result.push([data[i][0], sma, sma + mult * std, sma - mult * std]);
        }
      }

      return result;
    }
    /**
     * RSI - Relative Strength Index
     */

  }, {
    key: "calcRSI",
    value: function calcRSI(data, period) {
      var result = [];
      var gains = [];
      var losses = [];

      for (var i = 0; i < data.length; i++) {
        if (i === 0) {
          result.push([data[i][0], 50]);
          continue;
        }

        var change = data[i][4] - data[i - 1][4];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);

        if (gains.length < period) {
          result.push([data[i][0], 50]);
          continue;
        }

        var avgGain = gains.slice(-period).reduce(function (a, b) {
          return a + b;
        }, 0) / period;
        var avgLoss = losses.slice(-period).reduce(function (a, b) {
          return a + b;
        }, 0) / period;
        var rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        var rsi = 100 - 100 / (1 + rs);
        result.push([data[i][0], Math.min(100, Math.max(0, rsi))]);
      }

      return result;
    }
    /**
     * MACD
     */

  }, {
    key: "calcMACD",
    value: function calcMACD(data, fast, slow, signal) {
      var _data$, _data$2;

      var result = [];
      var kFast = 2 / (fast + 1);
      var kSlow = 2 / (slow + 1);
      var kSignal = 2 / (signal + 1);
      var emaFast = ((_data$ = data[0]) === null || _data$ === void 0 ? void 0 : _data$[4]) || 0;
      var emaSlow = ((_data$2 = data[0]) === null || _data$2 === void 0 ? void 0 : _data$2[4]) || 0;
      var sig = 0;

      for (var i = 0; i < data.length; i++) {
        var close = data[i][4];
        emaFast = close * kFast + emaFast * (1 - kFast);
        emaSlow = close * kSlow + emaSlow * (1 - kSlow);
        var macd = emaFast - emaSlow;
        sig = macd * kSignal + sig * (1 - kSignal);
        var hist = macd - sig;
        result.push([data[i][0], macd, sig, hist]);
      }

      return result;
    }
    /**
     * ATR - Average True Range
     */

  }, {
    key: "calcATR",
    value: function calcATR(data, period) {
      var result = [];
      var trValues = [];

      for (var i = 0; i < data.length; i++) {
        var tr = void 0;

        if (i === 0) {
          tr = data[i][2] - data[i][3];
        } else {
          var high = data[i][2];
          var low = data[i][3];
          var prevClose = data[i - 1][4];
          tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
        }

        trValues.push(tr);

        if (trValues.length < period) {
          result.push([data[i][0], null]);
        } else {
          var atr = trValues.slice(-period).reduce(function (a, b) {
            return a + b;
          }, 0) / period;
          result.push([data[i][0], atr]);
        }
      }

      return result;
    }
    /**
     * Volume MA
     */

  }, {
    key: "calcVolMA",
    value: function calcVolMA(data, period) {
      var result = [];

      for (var i = 0; i < data.length; i++) {
        var vol = data[i][5];

        if (i < period - 1) {
          result.push([data[i][0], vol, null]);
        } else {
          var sum = 0;

          for (var j = 0; j < period; j++) {
            sum += data[i - j][5];
          }

          var avg = sum / period;
          result.push([data[i][0], vol, avg]);
        }
      }

      return result;
    }
    /**
     * Stochastic
     */

  }, {
    key: "calcStoch",
    value: function calcStoch(data, kPeriod, dPeriod, smooth) {
      var result = [];
      var kValues = [];

      for (var i = 0; i < data.length; i++) {
        if (i < kPeriod - 1) {
          result.push([data[i][0], null, null]);
          continue;
        }

        var highestHigh = -Infinity;
        var lowestLow = Infinity;

        for (var j = 0; j < kPeriod; j++) {
          highestHigh = Math.max(highestHigh, data[i - j][2]);
          lowestLow = Math.min(lowestLow, data[i - j][3]);
        }

        var close = data[i][4];
        var range = highestHigh - lowestLow;
        var k = range === 0 ? 50 : (close - lowestLow) / range * 100;
        kValues.push(k);
        var smoothK = k;

        if (kValues.length >= smooth) {
          smoothK = kValues.slice(-smooth).reduce(function (a, b) {
            return a + b;
          }, 0) / smooth;
        }

        var d = smoothK;

        if (kValues.length >= smooth + dPeriod - 1) {
          var smoothedValues = [];

          for (var _j2 = 0; _j2 < dPeriod; _j2++) {
            var start = kValues.length - smooth - dPeriod + 1 + _j2;
            var slice = kValues.slice(start, start + smooth);
            smoothedValues.push(slice.reduce(function (a, b) {
              return a + b;
            }, 0) / smooth);
          }

          d = smoothedValues.reduce(function (a, b) {
            return a + b;
          }, 0) / dPeriod;
        }

        result.push([data[i][0], smoothK, d]);
      }

      return result;
    }
  }]);

  return IndicatorManager;
}();


;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=script&lang=js&




function TradingVuevue_type_script_lang_js_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function TradingVuevue_type_script_lang_js_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { TradingVuevue_type_script_lang_js_ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { TradingVuevue_type_script_lang_js_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }



function TradingVuevue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = TradingVuevue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function TradingVuevue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return TradingVuevue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return TradingVuevue_type_script_lang_js_arrayLikeToArray(o, minLen); }

function TradingVuevue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//












/* harmony default export */ const TradingVuevue_type_script_lang_js_ = ({
  name: 'TradingVue',
  components: {
    Chart: Chart,
    Toolbar: Toolbar,
    Widgets: Widgets,
    TheTip: TheTip,
    TFSelector: TFSelector,
    TFSelectorDropdown: TFSelectorDropdown,
    WatchlistPanel: WatchlistPanel
  },
  mixins: [xcontrol],
  props: {
    titleTxt: {
      type: String,
      "default": 'TradingVue.js'
    },
    id: {
      type: String,
      "default": 'trading-vue-js'
    },
    width: {
      type: Number,
      "default": 800
    },
    height: {
      type: Number,
      "default": 421
    },
    colorTitle: {
      type: String,
      "default": '#42b883'
    },
    colorBack: {
      type: String,
      "default": '#121826'
    },
    colorGrid: {
      type: String,
      "default": '#2f3240'
    },
    colorText: {
      type: String,
      "default": '#dedddd'
    },
    colorTextHL: {
      type: String,
      "default": '#fff'
    },
    colorScale: {
      type: String,
      "default": '#838383'
    },
    colorCross: {
      type: String,
      "default": '#8091a0'
    },
    colorCandleUp: {
      type: String,
      "default": '#23a776'
    },
    colorCandleDw: {
      type: String,
      "default": '#e54150'
    },
    colorWickUp: {
      type: String,
      "default": '#23a77688'
    },
    colorWickDw: {
      type: String,
      "default": '#e5415088'
    },
    colorWickSm: {
      type: String,
      "default": 'transparent' // deprecated

    },
    colorVolUp: {
      type: String,
      "default": '#79999e42'
    },
    colorVolDw: {
      type: String,
      "default": '#ef535042'
    },
    colorPanel: {
      type: String,
      "default": '#565c68'
    },
    colorTbBack: {
      type: String
    },
    colorTbBorder: {
      type: String,
      "default": '#8282827d'
    },
    colors: {
      type: Object
    },
    font: {
      type: String,
      "default": constants.ChartConfig.FONT
    },
    toolbar: {
      type: Boolean,
      "default": false
    },
    data: {
      type: Object,
      required: true
    },
    // Your overlay classes here
    overlays: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    // Overwrites ChartConfig values,
    // see constants.js
    chartConfig: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    legendButtons: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    indexBased: {
      type: Boolean,
      "default": false
    },
    extensions: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    xSettings: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    skin: {
      type: String // Skin Name

    },
    timezone: {
      type: Number,
      "default": 0
    },
    // Timeframe selector options
    timeframes: {
      type: Boolean,
      "default": false
    },
    timeframe: {
      type: String,
      "default": '1D'
    },
    timeframeStyle: {
      type: String,
      "default": 'dropdown' // 'full' or 'dropdown'

    },
    timeframeExtended: {
      type: Boolean,
      "default": false
    },
    showSecondsTF: {
      type: Boolean,
      "default": false
    },
    // Auto data loading options
    autoLoadData: {
      type: Boolean,
      "default": true
    },
    // Custom data loader: async (symbol, tf) => ohlcv[]
    dataLoader: {
      type: Function,
      "default": null
    },
    // Trading symbol
    symbol: {
      type: String,
      "default": 'BTC/USDT'
    },
    // Auto recalculate indicators on TF change
    autoRecalcIndicators: {
      type: Boolean,
      "default": true
    },
    // Watchlist Panel options
    showWatchlist: {
      type: Boolean,
      "default": false
    },
    watchlistWidth: {
      type: Number,
      "default": 250
    },
    watchlistMinWidth: {
      type: Number,
      "default": 150
    },
    watchlistMaxWidth: {
      type: Number,
      "default": 500
    },
    watchlistTitle: {
      type: String,
      "default": 'Избранное'
    },
    exchangeName: {
      type: String,
      "default": ''
    },
    watchlistTickers: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    popularTickers: {
      type: Array,
      "default": function _default() {
        return ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'SOL/USDT'];
      }
    },
    watchlistSearch: {
      type: Boolean,
      "default": true
    }
  },
  computed: {
    // Copy a subset of TradingVue props
    chart_props: function chart_props() {
      var offset = this.$props.toolbar ? this.chart_config.TOOLBAR : 0;
      var chart_props = {
        title_txt: this.$props.titleTxt,
        overlays: this.$props.overlays.concat(this.mod_ovs),
        data: this.decubed,
        width: this.$props.width - offset,
        height: this.$props.height,
        font: this.font_comp,
        buttons: this.$props.legendButtons,
        toolbar: this.$props.toolbar,
        ib: this.$props.indexBased || this.index_based || false,
        colors: Object.assign({}, this.$props.colors || this.colorpack),
        skin: this.skin_proto,
        timezone: this.$props.timezone
      };
      this.parse_colors(chart_props.colors);
      return chart_props;
    },
    chart_config: function chart_config() {
      return Object.assign({}, constants.ChartConfig, this.$props.chartConfig);
    },
    decubed: function decubed() {
      var data = this.$props.data;

      if (data.data !== undefined) {
        // DataCube detected
        data.init_tvjs(this);
        return data.data;
      } else {
        return data;
      }
    },
    index_based: function index_based() {
      var base = this.$props.data;

      if (base.chart) {
        return base.chart.indexBased;
      } else if (base.data) {
        return base.data.chart.indexBased;
      }

      return false;
    },
    mod_ovs: function mod_ovs() {
      var arr = [];

      var _iterator = TradingVuevue_type_script_lang_js_createForOfIteratorHelper(this.$props.extensions),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var x = _step.value;
          arr.push.apply(arr, _toConsumableArray(Object.values(x.overlays)));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return arr;
    },
    font_comp: function font_comp() {
      return this.skin_proto && this.skin_proto.font ? this.skin_proto.font : this.font;
    },
    isDarkTheme: function isDarkTheme() {
      var _this$$props$colors;

      var back = ((_this$$props$colors = this.$props.colors) === null || _this$$props$colors === void 0 ? void 0 : _this$$props$colors.back) || this.$props.colorBack; // Simple check: if background is dark (low lightness)

      return back && back !== '#fff' && back !== '#ffffff';
    },
    // Calculate total width including watchlist
    totalWidth: function totalWidth() {
      if (this.$props.showWatchlist) {
        return this.$props.width + this.currentWatchlistWidth;
      }

      return this.$props.width;
    },
    // Calculate chart width (excluding watchlist)
    chartWidth: function chartWidth() {
      return this.$props.width;
    }
  },
  data: function data() {
    return {
      reset: 0,
      tip: null,
      currentTF: this.$props.timeframe,
      // DataProvider instance
      dataProvider: null,
      // IndicatorManager instance
      indicatorManager: null,
      // Loading state
      isLoading: false,
      // Configured exchanges for watchlist
      configuredExchanges: [{
        id: 'default',
        name: 'Default'
      }],
      // Current watchlist width (for tracking resize)
      currentWatchlistWidth: this.$props.watchlistWidth
    };
  },
  beforeDestroy: function beforeDestroy() {
    this.custom_event({
      event: 'before-destroy'
    });
    this.ctrl_destroy();
  },
  methods: {
    // TODO: reset extensions?
    resetChart: function resetChart(resetRange) {
      var _this = this;

      if (resetRange === void 0) {
        resetRange = true;
      }

      this.reset++;
      var range = this.getRange();

      if (!resetRange && range[0] && range[1]) {
        this.$nextTick(function () {
          return _this.setRange.apply(_this, _toConsumableArray(range));
        });
      }

      this.$nextTick(function () {
        return _this.custom_event({
          event: 'chart-reset',
          args: []
        });
      });
    },
    "goto": function goto(t) {
      // TODO: limit goto & setRange (out of data error)
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        t = ti_map.gt2i(t, this.$refs.chart.ohlcv);
      }

      this.$refs.chart["goto"](t);
    },
    setRange: function setRange(t1, t2) {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        var ohlcv = this.$refs.chart.ohlcv;
        t1 = ti_map.gt2i(t1, ohlcv);
        t2 = ti_map.gt2i(t2, ohlcv);
      }

      this.$refs.chart.setRange(t1, t2);
    },
    getRange: function getRange() {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map; // Time range => index range

        return this.$refs.chart.range.map(function (x) {
          return ti_map.i2t(x);
        });
      }

      return this.$refs.chart.range;
    },
    getCursor: function getCursor() {
      var cursor = this.$refs.chart.cursor;

      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        var copy = Object.assign({}, cursor);
        copy.i = copy.t;
        copy.t = ti_map.i2t(copy.t);
        return copy;
      }

      return cursor;
    },
    showTheTip: function showTheTip(text, color) {
      if (color === void 0) {
        color = "orange";
      }

      this.tip = {
        text: text,
        color: color
      };
    },
    legend_button: function legend_button(event) {
      this.custom_event({
        event: 'legend-button-click',
        args: [event]
      });
    },
    custom_event: function custom_event(d) {
      if ('args' in d) {
        this.$emit.apply(this, [d.event].concat(_toConsumableArray(d.args)));
      } else {
        this.$emit(d.event);
      }

      var data = this.$props.data;
      var ctrl = this.controllers.length !== 0;
      if (ctrl) this.pre_dc(d);

      if (data.tv) {
        // If the data object is DataCube
        data.on_custom_event(d.event, d.args);
      }

      if (ctrl) this.post_dc(d);
    },
    range_changed: function range_changed(r) {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        r = r.map(function (x) {
          return ti_map.i2t(x);
        });
      }

      this.$emit('range-changed', r);
      this.custom_event({
        event: 'range-changed',
        args: [r]
      });
      if (this.onrange) this.onrange(r);
    },
    set_loader: function set_loader(dc) {
      var _this2 = this;

      this.onrange = function (r) {
        var pf = _this2.chart_props.ib ? '_ms' : '';
        var tf = _this2.$refs.chart['interval' + pf];
        dc.range_changed(r, tf);
      };
    },
    parse_colors: function parse_colors(colors) {
      for (var k in this.$props) {
        if (k.indexOf('color') === 0 && k !== 'colors') {
          var k2 = k.replace('color', '');
          k2 = k2[0].toLowerCase() + k2.slice(1);
          if (colors[k2]) continue;
          colors[k2] = this.$props[k];
        }
      }
    },
    mousedown: function mousedown() {
      this.$refs.chart.activated = true;
    },
    mouseleave: function mouseleave() {
      this.$refs.chart.activated = false;
    },
    // ==================== Timeframe & Data Management ====================

    /**
     * Initialize DataProvider and IndicatorManager
     */
    initDataServices: function initDataServices() {
      // Check if data is a DataCube
      var dc = this.$props.data;

      if (!dc || !dc.data) {
        console.warn('[TradingVue] DataCube not detected, auto-load disabled');
        return;
      } // Initialize DataProvider


      this.dataProvider = new DataProvider({
        symbol: this.$props.symbol,
        loader: this.$props.dataLoader,
        generateDemo: true,
        cache: true
      }); // Initialize IndicatorManager

      this.indicatorManager = new IndicatorManager(dc, this.dataProvider); // Expose to window for debugging

      if (typeof window !== 'undefined') {
        window.tvDataProvider = this.dataProvider;
        window.tvIndicatorManager = this.indicatorManager;
      }

      console.log('[TradingVue] Data services initialized');
    },

    /**
     * Handle timeframe change
     * Auto-loads data and recalculates indicators
     */
    on_timeframe_change: function on_timeframe_change(tf) {
      var _this3 = this;

      return _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee() {
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log("[TradingVue] Timeframe changed to: ".concat(tf));
                _this3.currentTF = tf; // Emit events

                _this3.$emit('timeframe-change', tf);

                _this3.$emit('update:timeframe', tf); // Auto load data if enabled


                if (!(_this3.$props.autoLoadData && _this3.dataProvider)) {
                  _context.next = 7;
                  break;
                }

                _context.next = 7;
                return _this3.loadTimeframeData(tf);

              case 7:
                // Auto recalculate indicators if enabled
                if (_this3.$props.autoRecalcIndicators && _this3.indicatorManager) {
                  _this3.recalculateIndicators();
                } // Reset chart


                _this3.resetChart();

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },

    /**
     * Load data for timeframe
     */
    loadTimeframeData: function loadTimeframeData(tf) {
      var _this4 = this;

      return _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee2() {
        var data;
        return regenerator_default().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _this4.isLoading = true;

                _this4.$emit('loading-start', tf);

                _context2.prev = 2;
                _context2.next = 5;
                return _this4.dataProvider.getData(tf, _this4.$props.symbol);

              case 5:
                data = _context2.sent;

                // Update chart data
                if (_this4.$props.data && _this4.$props.data.set) {
                  _this4.$props.data.set('chart.data', data);

                  console.log("[TradingVue] Loaded ".concat(data.length, " candles for ").concat(tf));

                  _this4.$emit('data-loaded', {
                    tf: tf,
                    data: data
                  });
                }

                _context2.next = 13;
                break;

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](2);
                console.error('[TradingVue] Error loading data:', _context2.t0);

                _this4.$emit('loading-error', {
                  tf: tf,
                  error: _context2.t0
                });

              case 13:
                _context2.prev = 13;
                _this4.isLoading = false;

                _this4.$emit('loading-end', tf);

                return _context2.finish(13);

              case 17:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[2, 9, 13, 17]]);
      }))();
    },

    /**
     * Recalculate all indicators
     */
    recalculateIndicators: function recalculateIndicators() {
      var _this$$props$data, _this$$props$data$cha;

      if (!this.indicatorManager) return;
      var ohlcv = ((_this$$props$data = this.$props.data) === null || _this$$props$data === void 0 ? void 0 : (_this$$props$data$cha = _this$$props$data.chart) === null || _this$$props$data$cha === void 0 ? void 0 : _this$$props$data$cha.data) || [];
      this.indicatorManager.recalculateAll(ohlcv);
    },
    // ==================== Public API ====================

    /**
     * Add indicator
     * @param {string} type - EMA, SMA, RSI, MACD, etc.
     * @param {object} params - Indicator parameters
     * @param {object} settings - Display settings
     * @returns {string} Indicator ID
     */
    addIndicator: function addIndicator(type, params, settings) {
      if (params === void 0) {
        params = {};
      }

      if (settings === void 0) {
        settings = {};
      }

      if (!this.indicatorManager) {
        console.warn('[TradingVue] IndicatorManager not initialized');
        return null;
      }

      return this.indicatorManager.add(type, params, settings);
    },

    /**
     * Remove indicator
     */
    removeIndicator: function removeIndicator(id) {
      if (!this.indicatorManager) return false;
      return this.indicatorManager.remove(id);
    },

    /**
     * Clear all indicators
     */
    clearIndicators: function clearIndicators() {
      if (!this.indicatorManager) return;
      this.indicatorManager.clear();
      this.resetChart();
    },

    /**
     * Get active indicators list
     */
    getIndicators: function getIndicators() {
      if (!this.indicatorManager) return [];
      return this.indicatorManager.list;
    },

    /**
     * Set custom data loader
     * @param {Function} loader - async (symbol, tf) => ohlcv[]
     */
    setDataLoader: function setDataLoader(loader) {
      if (this.dataProvider) {
        this.dataProvider.setLoader(loader);
      }
    },

    /**
     * Get DataProvider instance
     */
    getDataProvider: function getDataProvider() {
      return this.dataProvider;
    },

    /**
     * Get IndicatorManager instance
     */
    getIndicatorManager: function getIndicatorManager() {
      return this.indicatorManager;
    },
    // ==================== Watchlist Methods ====================

    /**
     * Handle ticker selection
     */
    on_ticker_select: function on_ticker_select(ticker) {
      this.$emit('ticker-select', ticker);
      this.$emit('update:symbol', ticker.symbol);
    },

    /**
     * Handle ticker add
     */
    on_ticker_add: function on_ticker_add(ticker) {
      this.$emit('ticker-add', ticker);
    },

    /**
     * Handle ticker remove
     */
    on_ticker_remove: function on_ticker_remove(ticker) {
      this.$emit('ticker-remove', ticker);
    },

    /**
     * Handle watchlist resize
     */
    on_watchlist_resize: function on_watchlist_resize(width) {
      this.currentWatchlistWidth = width;
      this.$emit('watchlist-resize', width);
    },

    /**
     * Handle watchlist collapse
     */
    on_watchlist_collapse: function on_watchlist_collapse(collapsed) {
      this.$emit('watchlist-collapse', collapsed);
    },

    /**
     * Update watchlist ticker data
     */
    updateWatchlistTicker: function updateWatchlistTicker(symbol, data) {
      if (this.$refs.watchlist) {
        var tickers = _toConsumableArray(this.$props.watchlistTickers);

        var index = tickers.findIndex(function (t) {
          return t.symbol === symbol;
        });

        if (index !== -1) {
          tickers[index] = TradingVuevue_type_script_lang_js_objectSpread(TradingVuevue_type_script_lang_js_objectSpread({}, tickers[index]), data);
          this.$emit('update:watchlistTickers', tickers);
        }
      }
    },

    /**
     * Set configured exchanges
     */
    setConfiguredExchanges: function setConfiguredExchanges(exchanges) {
      this.configuredExchanges = exchanges;
    }
  },
  watch: {
    timeframe: function timeframe(newVal) {
      this.currentTF = newVal;
    },
    symbol: function symbol(newVal) {
      if (this.dataProvider) {
        this.dataProvider.setSymbol(newVal);
      }
    },
    dataLoader: function dataLoader(newVal) {
      if (this.dataProvider) {
        this.dataProvider.setLoader(newVal);
      }
    }
  },
  mounted: function mounted() {
    var _this5 = this;

    // Initialize data services
    this.$nextTick(function () {
      _this5.initDataServices();
    });
  }
});
;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=script&lang=js&
 /* harmony default export */ const src_TradingVuevue_type_script_lang_js_ = (TradingVuevue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=style&index=0&lang=css&
var TradingVuevue_type_style_index_0_lang_css_ = __webpack_require__(863);
;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/TradingVue.vue



;


/* normalize component */

var TradingVue_component = normalizeComponent(
  src_TradingVuevue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var TradingVue_api; }
TradingVue_component.options.__file = "src/TradingVue.vue"
/* harmony default export */ const TradingVue = (TradingVue_component.exports);
;// CONCATENATED MODULE: ./src/helpers/ExchangeManager.js







function ExchangeManager_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function ExchangeManager_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ExchangeManager_ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ExchangeManager_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * ExchangeManager - Manage exchange connections and API settings
 *
 * Features:
 * - Add/remove exchanges with API credentials
 * - Store settings in localStorage and config file
 * - Provide data loaders for each exchange
 * - Support multiple exchanges
 */
// Exchange configurations
var EXCHANGE_CONFIGS = {
  'binance': {
    name: 'Binance',
    type: 'crypto',
    baseUrl: 'https://api.binance.com',
    endpoints: {
      klines: '/api/v3/klines',
      exchangeInfo: '/api/v3/exchangeInfo'
    },
    requiresAuth: false,
    authType: 'api-key',
    supportsTimeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
    defaultTimeframe: '1h'
  },
  'binance-futures': {
    name: 'Binance Futures',
    type: 'crypto',
    baseUrl: 'https://fapi.binance.com',
    endpoints: {
      klines: '/fapi/v1/klines',
      exchangeInfo: '/fapi/v1/exchangeInfo'
    },
    requiresAuth: false,
    authType: 'api-key',
    supportsTimeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
    defaultTimeframe: '1h'
  },
  'bybit': {
    name: 'Bybit',
    type: 'crypto',
    baseUrl: 'https://api.bybit.com',
    endpoints: {
      klines: '/v5/market/kline',
      exchangeInfo: '/v5/market/instruments-info'
    },
    requiresAuth: false,
    authType: 'api-key',
    supportsTimeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '1w', '1M'],
    defaultTimeframe: '1h'
  },
  'okx': {
    name: 'OKX',
    type: 'crypto',
    baseUrl: 'https://www.okx.com',
    endpoints: {
      klines: '/api/v5/market/candles',
      exchangeInfo: '/api/v5/public/instruments'
    },
    requiresAuth: false,
    authType: 'api-key',
    supportsTimeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '1w', '1M'],
    defaultTimeframe: '1h'
  },
  'bitget': {
    name: 'Bitget',
    type: 'crypto',
    baseUrl: 'https://api.bitget.com',
    endpoints: {
      klines: '/api/v2/market/candles',
      exchangeInfo: '/api/v2/market/instruments'
    },
    requiresAuth: false,
    authType: 'api-key',
    supportsTimeframes: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
    defaultTimeframe: '1h'
  },
  'kucoin': {
    name: 'KuCoin',
    type: 'crypto',
    baseUrl: 'https://api.kucoin.com',
    endpoints: {
      klines: '/api/v1/market/candles',
      exchangeInfo: '/api/v1/symbols'
    },
    requiresAuth: false,
    authType: 'api-key',
    supportsTimeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '1w', '1M'],
    defaultTimeframe: '1h'
  }
}; // Timeframe conversion for different exchanges

var TF_CONVERSIONS = {
  'binance': {
    '1m': '1m',
    '3m': '3m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1H': '1h',
    '2H': '2h',
    '4H': '4h',
    '6H': '6h',
    '8H': '8h',
    '12H': '12h',
    '1D': '1d',
    '3D': '3d',
    '1W': '1w',
    '1M': '1M'
  },
  'bybit': {
    '1m': '1',
    '3m': '3',
    '5m': '5',
    '15m': '15',
    '30m': '30',
    '1H': '60',
    '2H': '120',
    '4H': '240',
    '6H': '360',
    '12H': '720',
    '1D': 'D',
    '1W': 'W',
    '1M': 'M'
  },
  'okx': {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1H': '1H',
    '2H': '2H',
    '4H': '4H',
    '6H': '6H',
    '12H': '12H',
    '1D': '1D',
    '1W': '1W',
    '1M': '1M'
  }
};

var ExchangeManager = /*#__PURE__*/function () {
  function ExchangeManager() {
    classCallCheck_classCallCheck(this, ExchangeManager);

    // Active exchanges: id -> config
    this.exchanges = new Map(); // Current selected exchange

    this.currentExchange = null; // Storage key

    this.storageKey = 'tvjs_exchange_config'; // Config file path (for Node.js environment)

    this.configFilePath = '/home/z/my-project/download/exchange_config.json'; // Load saved config

    this.loadConfig();
  }
  /**
   * Get available exchange types
   */


  createClass_createClass(ExchangeManager, [{
    key: "getAvailableExchanges",
    value: function getAvailableExchanges() {
      return Object.entries(EXCHANGE_CONFIGS).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            id = _ref2[0],
            config = _ref2[1];

        return {
          id: id,
          name: config.name,
          type: config.type,
          requiresAuth: config.requiresAuth
        };
      });
    }
    /**
     * Add or update exchange
     */

  }, {
    key: "addExchange",
    value: function addExchange(id, config) {
      var baseConfig = EXCHANGE_CONFIGS[id];

      if (!baseConfig) {
        console.error("Unknown exchange: ".concat(id));
        return false;
      }

      var exchange = ExchangeManager_objectSpread({
        id: id,
        name: config.name || baseConfig.name,
        apiKey: config.apiKey || '',
        apiSecret: config.apiSecret || '',
        passphrase: config.passphrase || '',
        // For OKX
        enabled: config.enabled !== false
      }, baseConfig);

      this.exchanges.set(id, exchange);

      if (!this.currentExchange) {
        this.currentExchange = id;
      }

      this.saveConfig();
      console.log("[ExchangeManager] Added exchange: ".concat(exchange.name));
      return true;
    }
    /**
     * Remove exchange
     */

  }, {
    key: "removeExchange",
    value: function removeExchange(id) {
      if (this.exchanges.has(id)) {
        this.exchanges["delete"](id);

        if (this.currentExchange === id) {
          this.currentExchange = this.exchanges.keys().next().value || null;
        }

        this.saveConfig();
        console.log("[ExchangeManager] Removed exchange: ".concat(id));
        return true;
      }

      return false;
    }
    /**
     * Get exchange config
     */

  }, {
    key: "getExchange",
    value: function getExchange(id) {
      return this.exchanges.get(id);
    }
    /**
     * Get all configured exchanges
     */

  }, {
    key: "getAllExchanges",
    value: function getAllExchanges() {
      return Array.from(this.exchanges.values());
    }
    /**
     * Set current exchange
     */

  }, {
    key: "setCurrentExchange",
    value: function setCurrentExchange(id) {
      if (this.exchanges.has(id)) {
        this.currentExchange = id;
        this.saveConfig();
        return true;
      }

      return false;
    }
    /**
     * Get current exchange
     */

  }, {
    key: "getCurrentExchange",
    value: function getCurrentExchange() {
      return this.exchanges.get(this.currentExchange);
    }
    /**
     * Convert timeframe to exchange format
     */

  }, {
    key: "convertTimeframe",
    value: function convertTimeframe(tf, exchangeId) {
      if (exchangeId === void 0) {
        exchangeId = this.currentExchange;
      }

      var exchange = this.exchanges.get(exchangeId);
      if (!exchange) return tf;
      var conversions = TF_CONVERSIONS[exchangeId] || {};
      return conversions[tf] || tf.toLowerCase();
    }
    /**
     * Create data loader for exchange
     */

  }, {
    key: "createDataLoader",
    value: function createDataLoader(exchangeId) {
      var _this = this;

      if (exchangeId === void 0) {
        exchangeId = this.currentExchange;
      }

      var exchange = this.exchanges.get(exchangeId);
      if (!exchange) return null;
      return /*#__PURE__*/function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(symbol, tf) {
          return regenerator_default().wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", _this.fetchKlines(exchangeId, symbol, tf));

                case 1:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x, _x2) {
          return _ref3.apply(this, arguments);
        };
      }();
    }
    /**
     * Fetch klines from exchange
     */

  }, {
    key: "fetchKlines",
    value: function () {
      var _fetchKlines = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee2(exchangeId, symbol, tf, limit) {
        var exchange, convertedTf, formattedSymbol;
        return regenerator_default().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (limit === void 0) {
                  limit = 500;
                }

                exchange = this.exchanges.get(exchangeId);

                if (exchange) {
                  _context2.next = 4;
                  break;
                }

                throw new Error("Exchange not configured: ".concat(exchangeId));

              case 4:
                convertedTf = this.convertTimeframe(tf, exchangeId);
                formattedSymbol = this.formatSymbol(symbol, exchangeId);
                console.log("[ExchangeManager] Fetching ".concat(formattedSymbol, " ").concat(convertedTf, " from ").concat(exchange.name));
                _context2.prev = 7;
                _context2.t0 = exchangeId;
                _context2.next = _context2.t0 === 'binance' ? 11 : _context2.t0 === 'binance-futures' ? 11 : _context2.t0 === 'bybit' ? 14 : _context2.t0 === 'okx' ? 17 : _context2.t0 === 'bitget' ? 20 : _context2.t0 === 'kucoin' ? 23 : 26;
                break;

              case 11:
                _context2.next = 13;
                return this.fetchBinanceKlines(exchange, formattedSymbol, convertedTf, limit);

              case 13:
                return _context2.abrupt("return", _context2.sent);

              case 14:
                _context2.next = 16;
                return this.fetchBybitKlines(exchange, formattedSymbol, convertedTf, limit);

              case 16:
                return _context2.abrupt("return", _context2.sent);

              case 17:
                _context2.next = 19;
                return this.fetchOkxKlines(exchange, formattedSymbol, convertedTf, limit);

              case 19:
                return _context2.abrupt("return", _context2.sent);

              case 20:
                _context2.next = 22;
                return this.fetchBitgetKlines(exchange, formattedSymbol, convertedTf, limit);

              case 22:
                return _context2.abrupt("return", _context2.sent);

              case 23:
                _context2.next = 25;
                return this.fetchKucoinKlines(exchange, formattedSymbol, convertedTf, limit);

              case 25:
                return _context2.abrupt("return", _context2.sent);

              case 26:
                throw new Error("Unsupported exchange: ".concat(exchangeId));

              case 27:
                _context2.next = 33;
                break;

              case 29:
                _context2.prev = 29;
                _context2.t1 = _context2["catch"](7);
                console.error("[ExchangeManager] Error fetching data:", _context2.t1);
                throw _context2.t1;

              case 33:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[7, 29]]);
      }));

      function fetchKlines(_x3, _x4, _x5, _x6) {
        return _fetchKlines.apply(this, arguments);
      }

      return fetchKlines;
    }()
    /**
     * Format symbol for exchange
     */

  }, {
    key: "formatSymbol",
    value: function formatSymbol(symbol, exchangeId) {
      // Remove slash: BTC/USDT -> BTCUSDT
      var base = symbol.replace('/', '');

      switch (exchangeId) {
        case 'okx':
          // OKX uses lowercase with dash: BTC-USDT
          return symbol.replace('/', '-').toUpperCase();

        case 'bitget':
          return symbol.replace('/', '').toUpperCase();

        case 'kucoin':
          return symbol.replace('/', '-').toUpperCase();

        default:
          return base.toUpperCase();
      }
    } // ==================== Exchange-specific fetchers ====================

  }, {
    key: "fetchBinanceKlines",
    value: function () {
      var _fetchBinanceKlines = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee3(exchange, symbol, tf, limit) {
        var url, headers, response, data;
        return regenerator_default().wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                url = "".concat(exchange.baseUrl).concat(exchange.endpoints.klines, "?symbol=").concat(symbol, "&interval=").concat(tf, "&limit=").concat(limit);
                headers = {};

                if (exchange.apiKey) {
                  headers['X-MBX-APIKEY'] = exchange.apiKey;
                }

                _context3.next = 5;
                return fetch(url, {
                  headers: headers
                });

              case 5:
                response = _context3.sent;
                _context3.next = 8;
                return response.json();

              case 8:
                data = _context3.sent;

                if (!data.code) {
                  _context3.next = 11;
                  break;
                }

                throw new Error("Binance API error: ".concat(data.msg));

              case 11:
                return _context3.abrupt("return", data.map(function (candle) {
                  return [candle[0], // timestamp
                  parseFloat(candle[1]), // open
                  parseFloat(candle[2]), // high
                  parseFloat(candle[3]), // low
                  parseFloat(candle[4]), // close
                  parseFloat(candle[5]) // volume
                  ];
                }));

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function fetchBinanceKlines(_x7, _x8, _x9, _x10) {
        return _fetchBinanceKlines.apply(this, arguments);
      }

      return fetchBinanceKlines;
    }()
  }, {
    key: "fetchBybitKlines",
    value: function () {
      var _fetchBybitKlines = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee4(exchange, symbol, tf, limit) {
        var category, url, response, data;
        return regenerator_default().wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                category = 'linear'; // For USDT pairs

                url = "".concat(exchange.baseUrl).concat(exchange.endpoints.klines, "?category=").concat(category, "&symbol=").concat(symbol, "&interval=").concat(tf, "&limit=").concat(limit);
                _context4.next = 4;
                return fetch(url);

              case 4:
                response = _context4.sent;
                _context4.next = 7;
                return response.json();

              case 7:
                data = _context4.sent;

                if (!(data.retCode !== 0)) {
                  _context4.next = 10;
                  break;
                }

                throw new Error("Bybit API error: ".concat(data.retMsg));

              case 10:
                return _context4.abrupt("return", data.result.list.map(function (candle) {
                  return [parseInt(candle[0]), // timestamp
                  parseFloat(candle[1]), // open
                  parseFloat(candle[2]), // high
                  parseFloat(candle[3]), // low
                  parseFloat(candle[4]), // close
                  parseFloat(candle[5]) // volume
                  ];
                }).reverse());

              case 11:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function fetchBybitKlines(_x11, _x12, _x13, _x14) {
        return _fetchBybitKlines.apply(this, arguments);
      }

      return fetchBybitKlines;
    }()
  }, {
    key: "fetchOkxKlines",
    value: function () {
      var _fetchOkxKlines = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee5(exchange, symbol, tf, limit) {
        var url, headers, response, data;
        return regenerator_default().wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                url = "".concat(exchange.baseUrl).concat(exchange.endpoints.klines, "?instId=").concat(symbol, "&bar=").concat(tf, "&limit=").concat(limit);
                headers = {};

                if (exchange.apiKey) {
                  headers['OK-ACCESS-KEY'] = exchange.apiKey;
                }

                _context5.next = 5;
                return fetch(url, {
                  headers: headers
                });

              case 5:
                response = _context5.sent;
                _context5.next = 8;
                return response.json();

              case 8:
                data = _context5.sent;

                if (!(data.code !== '0')) {
                  _context5.next = 11;
                  break;
                }

                throw new Error("OKX API error: ".concat(data.msg));

              case 11:
                return _context5.abrupt("return", data.data.map(function (candle) {
                  return [parseInt(candle[0]), // timestamp
                  parseFloat(candle[1]), // open
                  parseFloat(candle[2]), // high
                  parseFloat(candle[3]), // low
                  parseFloat(candle[4]), // close
                  parseFloat(candle[5]) // volume
                  ];
                }).reverse());

              case 12:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function fetchOkxKlines(_x15, _x16, _x17, _x18) {
        return _fetchOkxKlines.apply(this, arguments);
      }

      return fetchOkxKlines;
    }()
  }, {
    key: "fetchBitgetKlines",
    value: function () {
      var _fetchBitgetKlines = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee6(exchange, symbol, tf, limit) {
        var url, response, data;
        return regenerator_default().wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                url = "".concat(exchange.baseUrl).concat(exchange.endpoints.klines, "?productType=USDT-FUTURES&symbol=").concat(symbol, "&granularity=").concat(tf, "&limit=").concat(limit);
                _context6.next = 3;
                return fetch(url);

              case 3:
                response = _context6.sent;
                _context6.next = 6;
                return response.json();

              case 6:
                data = _context6.sent;

                if (!(data.code !== '00000')) {
                  _context6.next = 9;
                  break;
                }

                throw new Error("Bitget API error: ".concat(data.msg));

              case 9:
                return _context6.abrupt("return", data.data.map(function (candle) {
                  return [parseInt(candle[0]), // timestamp
                  parseFloat(candle[1]), // open
                  parseFloat(candle[2]), // high
                  parseFloat(candle[3]), // low
                  parseFloat(candle[4]), // close
                  parseFloat(candle[5]) // volume
                  ];
                }));

              case 10:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function fetchBitgetKlines(_x19, _x20, _x21, _x22) {
        return _fetchBitgetKlines.apply(this, arguments);
      }

      return fetchBitgetKlines;
    }()
  }, {
    key: "fetchKucoinKlines",
    value: function () {
      var _fetchKucoinKlines = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee7(exchange, symbol, tf, limit) {
        var url, response, data;
        return regenerator_default().wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                url = "".concat(exchange.baseUrl).concat(exchange.endpoints.klines, "?symbol=").concat(symbol, "&type=").concat(tf, "&limit=").concat(limit);
                _context7.next = 3;
                return fetch(url);

              case 3:
                response = _context7.sent;
                _context7.next = 6;
                return response.json();

              case 6:
                data = _context7.sent;

                if (!(data.code !== '200000')) {
                  _context7.next = 9;
                  break;
                }

                throw new Error("KuCoin API error: ".concat(data.msg));

              case 9:
                return _context7.abrupt("return", data.data.map(function (candle) {
                  return [parseInt(candle[0]), // timestamp
                  parseFloat(candle[1]), // open
                  parseFloat(candle[2]), // high
                  parseFloat(candle[3]), // low
                  parseFloat(candle[4]), // close
                  parseFloat(candle[5]) // volume
                  ];
                }));

              case 10:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function fetchKucoinKlines(_x23, _x24, _x25, _x26) {
        return _fetchKucoinKlines.apply(this, arguments);
      }

      return fetchKucoinKlines;
    }() // ==================== Config Persistence ====================

    /**
     * Save config to localStorage and file
     */

  }, {
    key: "saveConfig",
    value: function saveConfig() {
      var config = {
        exchanges: Array.from(this.exchanges.entries()).map(function (_ref4) {
          var _ref5 = _slicedToArray(_ref4, 2),
              id = _ref5[0],
              ex = _ref5[1];

          return {
            id: id,
            apiKey: ex.apiKey,
            apiSecret: ex.apiSecret ? '***' : '',
            // Don't save secret to localStorage
            passphrase: ex.passphrase ? '***' : '',
            enabled: ex.enabled
          };
        }),
        currentExchange: this.currentExchange,
        savedAt: new Date().toISOString()
      }; // Save to localStorage

      try {
        localStorage.setItem(this.storageKey, JSON.stringify(config));
        console.log('[ExchangeManager] Config saved to localStorage');
      } catch (e) {
        console.warn('[ExchangeManager] Could not save to localStorage:', e);
      } // Save to file (for full credentials)


      this.saveToFile(config);
    }
    /**
     * Save config to file
     */

  }, {
    key: "saveToFile",
    value: function () {
      var _saveToFile = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee8(config) {
        var fullConfig, response;
        return regenerator_default().wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.prev = 0;
                // Include full secrets for file
                fullConfig = {
                  exchanges: Array.from(this.exchanges.entries()).map(function (_ref6) {
                    var _ref7 = _slicedToArray(_ref6, 2),
                        id = _ref7[0],
                        ex = _ref7[1];

                    return {
                      id: id,
                      name: ex.name,
                      apiKey: ex.apiKey,
                      apiSecret: ex.apiSecret,
                      passphrase: ex.passphrase,
                      enabled: ex.enabled
                    };
                  }),
                  currentExchange: this.currentExchange,
                  savedAt: new Date().toISOString()
                }; // Try to save via API if available

                if (!(typeof window !== 'undefined')) {
                  _context8.next = 7;
                  break;
                }

                _context8.next = 5;
                return fetch('/api/exchange-config', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(fullConfig)
                });

              case 5:
                response = _context8.sent;

                if (response.ok) {
                  console.log('[ExchangeManager] Config saved to file');
                }

              case 7:
                _context8.next = 12;
                break;

              case 9:
                _context8.prev = 9;
                _context8.t0 = _context8["catch"](0);
                // File save failed, but localStorage succeeded
                console.warn('[ExchangeManager] Could not save to file:', _context8.t0);

              case 12:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[0, 9]]);
      }));

      function saveToFile(_x27) {
        return _saveToFile.apply(this, arguments);
      }

      return saveToFile;
    }()
    /**
     * Load config from storage
     */

  }, {
    key: "loadConfig",
    value: function loadConfig() {
      var _this2 = this;

      try {
        var saved = localStorage.getItem(this.storageKey);

        if (saved) {
          var config = JSON.parse(saved);
          config.exchanges.forEach(function (ex) {
            var baseConfig = EXCHANGE_CONFIGS[ex.id];

            if (baseConfig) {
              _this2.exchanges.set(ex.id, ExchangeManager_objectSpread(ExchangeManager_objectSpread({}, baseConfig), ex));
            }
          });
          this.currentExchange = config.currentExchange;
          console.log("[ExchangeManager] Loaded ".concat(this.exchanges.size, " exchanges from storage"));
        }
      } catch (e) {
        console.warn('[ExchangeManager] Could not load config:', e);
      } // Add default exchange if none configured


      if (this.exchanges.size === 0) {
        this.addExchange('binance', {
          enabled: true
        });
      }
    }
    /**
     * Export config for download
     */

  }, {
    key: "exportConfig",
    value: function exportConfig() {
      var config = {
        exchanges: Array.from(this.exchanges.entries()).map(function (_ref8) {
          var _ref9 = _slicedToArray(_ref8, 2),
              id = _ref9[0],
              ex = _ref9[1];

          return {
            id: id,
            name: ex.name,
            apiKey: ex.apiKey,
            apiSecret: ex.apiSecret,
            passphrase: ex.passphrase,
            enabled: ex.enabled
          };
        }),
        currentExchange: this.currentExchange,
        exportedAt: new Date().toISOString()
      };
      return JSON.stringify(config, null, 2);
    }
    /**
     * Import config
     */

  }, {
    key: "importConfig",
    value: function importConfig(jsonString) {
      var _this3 = this;

      try {
        var config = JSON.parse(jsonString);
        config.exchanges.forEach(function (ex) {
          _this3.addExchange(ex.id, ex);
        });

        if (config.currentExchange) {
          this.currentExchange = config.currentExchange;
        }

        this.saveConfig();
        return true;
      } catch (e) {
        console.error('[ExchangeManager] Failed to import config:', e);
        return false;
      }
    }
    /**
     * Clear all config
     */

  }, {
    key: "clearConfig",
    value: function clearConfig() {
      this.exchanges.clear();
      this.currentExchange = null;
      localStorage.removeItem(this.storageKey);
      console.log('[ExchangeManager] Config cleared');
    }
  }]);

  return ExchangeManager;
}(); // Export exchange configs for UI




;// CONCATENATED MODULE: ./src/mixins/interface.js
// Html interface, shown on top of the grid.
// Can be static (a tooltip) or interactive,
// e.g. a control panel.
/* harmony default export */ const mixins_interface = ({
  props: ['ux', 'updater', 'colors', 'wrapper'],
  mounted: function mounted() {
    this._$emit = this.$emit;
    this.$emit = this.custom_event;
    if (this.init) this.init();
  },
  methods: {
    close: function close() {
      this.$emit('custom-event', {
        event: 'close-interface',
        args: [this.$props.ux.uuid]
      });
    },
    // TODO: emit all the way to the uxlist
    // add apply the changes there
    modify: function modify(obj) {
      this.$emit('custom-event', {
        event: 'modify-interface',
        args: [this.$props.ux.uuid, obj]
      });
    },
    custom_event: function custom_event(event) {
      if (event.split(':')[0] === 'hook') return;

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      this._$emit('custom-event', {
        event: event,
        args: args
      });
    }
  },
  computed: {
    overlay: function overlay() {
      return this.$props.ux.overlay;
    },
    layout: function layout() {
      return this.overlay.layout;
    },
    uxr: function uxr() {
      return this.$props.ux;
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/IndicatorSettings.vue?vue&type=template&id=61af135c&scoped=true&
var IndicatorSettingsvue_type_template_id_61af135c_scoped_true_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm.visible
    ? _c(
        "div",
        {
          staticClass: "tvjs-modal-overlay",
          on: {
            click: function($event) {
              if ($event.target !== $event.currentTarget) {
                return null
              }
              return _vm.close($event)
            }
          }
        },
        [
          _c("div", { staticClass: "tvjs-modal tvjs-settings-modal" }, [
            _c("div", { staticClass: "modal-header" }, [
              _c("h3", [_vm._v(_vm._s(_vm.indicatorName))]),
              _vm._v(" "),
              _c(
                "button",
                { staticClass: "btn-close", on: { click: _vm.close } },
                [_vm._v("×")]
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "modal-body" }, [
              _vm.hasParams
                ? _c(
                    "div",
                    { staticClass: "settings-section" },
                    [
                      _c("h4", [_vm._v("Parameters")]),
                      _vm._v(" "),
                      _vm._l(_vm.localParams, function(value, key) {
                        return _c(
                          "div",
                          { key: key, staticClass: "param-row" },
                          [
                            _c("label", [_vm._v(_vm._s(_vm.formatLabel(key)))]),
                            _vm._v(" "),
                            _c("input", {
                              directives: [
                                {
                                  name: "model",
                                  rawName: "v-model.number",
                                  value: _vm.localParams[key],
                                  expression: "localParams[key]",
                                  modifiers: { number: true }
                                }
                              ],
                              attrs: {
                                type: "number",
                                min: _vm.getParamMin(key),
                                max: _vm.getParamMax(key),
                                step: _vm.getParamStep(key)
                              },
                              domProps: { value: _vm.localParams[key] },
                              on: {
                                input: function($event) {
                                  if ($event.target.composing) {
                                    return
                                  }
                                  _vm.$set(
                                    _vm.localParams,
                                    key,
                                    _vm._n($event.target.value)
                                  )
                                },
                                blur: function($event) {
                                  return _vm.$forceUpdate()
                                }
                              }
                            })
                          ]
                        )
                      })
                    ],
                    2
                  )
                : _vm._e(),
              _vm._v(" "),
              _c("div", { staticClass: "settings-section" }, [
                _c("h4", [_vm._v("Style")]),
                _vm._v(" "),
                _c("div", { staticClass: "param-row" }, [
                  _c("label", [_vm._v("Line Color")]),
                  _vm._v(" "),
                  _c("div", { staticClass: "color-input-wrapper" }, [
                    _c("div", {
                      staticClass: "color-preview",
                      style: { backgroundColor: _vm.localSettings.color },
                      on: {
                        click: function($event) {
                          _vm.showColorPicker = !_vm.showColorPicker
                        }
                      }
                    }),
                    _vm._v(" "),
                    _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.localSettings.color,
                          expression: "localSettings.color"
                        }
                      ],
                      staticClass: "color-text-input",
                      attrs: { type: "text" },
                      domProps: { value: _vm.localSettings.color },
                      on: {
                        input: function($event) {
                          if ($event.target.composing) {
                            return
                          }
                          _vm.$set(
                            _vm.localSettings,
                            "color",
                            $event.target.value
                          )
                        }
                      }
                    })
                  ])
                ]),
                _vm._v(" "),
                _vm.showColorPicker
                  ? _c("div", { staticClass: "color-picker-dropdown" }, [
                      _c(
                        "div",
                        { staticClass: "preset-colors" },
                        _vm._l(_vm.presetColors, function(color) {
                          return _c("div", {
                            key: color,
                            staticClass: "preset-color",
                            style: { backgroundColor: color },
                            on: {
                              click: function($event) {
                                return _vm.selectColor(color)
                              }
                            }
                          })
                        }),
                        0
                      ),
                      _vm._v(" "),
                      _c("div", { staticClass: "custom-color" }, [
                        _c("input", {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.localSettings.color,
                              expression: "localSettings.color"
                            }
                          ],
                          attrs: { type: "color" },
                          domProps: { value: _vm.localSettings.color },
                          on: {
                            input: [
                              function($event) {
                                if ($event.target.composing) {
                                  return
                                }
                                _vm.$set(
                                  _vm.localSettings,
                                  "color",
                                  $event.target.value
                                )
                              },
                              function($event) {
                                _vm.showColorPicker = false
                              }
                            ]
                          }
                        }),
                        _vm._v(" "),
                        _c("span", [_vm._v("Custom")])
                      ])
                    ])
                  : _vm._e(),
                _vm._v(" "),
                _vm.isOnChart
                  ? _c("div", { staticClass: "param-row" }, [
                      _c("label", [_vm._v("Line Width")]),
                      _vm._v(" "),
                      _c("input", {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model.number",
                            value: _vm.localSettings.width,
                            expression: "localSettings.width",
                            modifiers: { number: true }
                          }
                        ],
                        attrs: { type: "range", min: "1", max: "5" },
                        domProps: { value: _vm.localSettings.width },
                        on: {
                          __r: function($event) {
                            _vm.$set(
                              _vm.localSettings,
                              "width",
                              _vm._n($event.target.value)
                            )
                          },
                          blur: function($event) {
                            return _vm.$forceUpdate()
                          }
                        }
                      }),
                      _vm._v(" "),
                      _c("span", { staticClass: "range-value" }, [
                        _vm._v(_vm._s(_vm.localSettings.width || 1))
                      ])
                    ])
                  : _vm._e(),
                _vm._v(" "),
                _vm.isOnChart
                  ? _c("div", { staticClass: "param-row" }, [
                      _c("label", [_vm._v("Line Style")]),
                      _vm._v(" "),
                      _c(
                        "select",
                        {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.localSettings.lineStyle,
                              expression: "localSettings.lineStyle"
                            }
                          ],
                          on: {
                            change: function($event) {
                              var $$selectedVal = Array.prototype.filter
                                .call($event.target.options, function(o) {
                                  return o.selected
                                })
                                .map(function(o) {
                                  var val = "_value" in o ? o._value : o.value
                                  return val
                                })
                              _vm.$set(
                                _vm.localSettings,
                                "lineStyle",
                                $event.target.multiple
                                  ? $$selectedVal
                                  : $$selectedVal[0]
                              )
                            }
                          }
                        },
                        [
                          _c("option", { attrs: { value: "solid" } }, [
                            _vm._v("Solid")
                          ]),
                          _vm._v(" "),
                          _c("option", { attrs: { value: "dashed" } }, [
                            _vm._v("Dashed")
                          ]),
                          _vm._v(" "),
                          _c("option", { attrs: { value: "dotted" } }, [
                            _vm._v("Dotted")
                          ])
                        ]
                      )
                    ])
                  : _vm._e(),
                _vm._v(" "),
                _c("div", { staticClass: "param-row" }, [
                  _c("label", [_vm._v("Opacity")]),
                  _vm._v(" "),
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model.number",
                        value: _vm.localSettings.opacity,
                        expression: "localSettings.opacity",
                        modifiers: { number: true }
                      }
                    ],
                    attrs: { type: "range", min: "0", max: "100" },
                    domProps: { value: _vm.localSettings.opacity },
                    on: {
                      __r: function($event) {
                        _vm.$set(
                          _vm.localSettings,
                          "opacity",
                          _vm._n($event.target.value)
                        )
                      },
                      blur: function($event) {
                        return _vm.$forceUpdate()
                      }
                    }
                  }),
                  _vm._v(" "),
                  _c("span", { staticClass: "range-value" }, [
                    _vm._v(_vm._s(_vm.localSettings.opacity || 100) + "%")
                  ])
                ])
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "settings-section" }, [
                _c("h4", [_vm._v("Visibility")]),
                _vm._v(" "),
                _c("div", { staticClass: "param-row checkbox-row" }, [
                  _c("label", [
                    _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.localSettings.visible,
                          expression: "localSettings.visible"
                        }
                      ],
                      attrs: { type: "checkbox" },
                      domProps: {
                        checked: Array.isArray(_vm.localSettings.visible)
                          ? _vm._i(_vm.localSettings.visible, null) > -1
                          : _vm.localSettings.visible
                      },
                      on: {
                        change: function($event) {
                          var $$a = _vm.localSettings.visible,
                            $$el = $event.target,
                            $$c = $$el.checked ? true : false
                          if (Array.isArray($$a)) {
                            var $$v = null,
                              $$i = _vm._i($$a, $$v)
                            if ($$el.checked) {
                              $$i < 0 &&
                                _vm.$set(
                                  _vm.localSettings,
                                  "visible",
                                  $$a.concat([$$v])
                                )
                            } else {
                              $$i > -1 &&
                                _vm.$set(
                                  _vm.localSettings,
                                  "visible",
                                  $$a.slice(0, $$i).concat($$a.slice($$i + 1))
                                )
                            }
                          } else {
                            _vm.$set(_vm.localSettings, "visible", $$c)
                          }
                        }
                      }
                    }),
                    _vm._v(
                      "\n                        Show Indicator\n                    "
                    )
                  ])
                ]),
                _vm._v(" "),
                _vm.isOffChart
                  ? _c("div", { staticClass: "param-row checkbox-row" }, [
                      _c("label", [
                        _c("input", {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.localSettings.showLegend,
                              expression: "localSettings.showLegend"
                            }
                          ],
                          attrs: { type: "checkbox" },
                          domProps: {
                            checked: Array.isArray(_vm.localSettings.showLegend)
                              ? _vm._i(_vm.localSettings.showLegend, null) > -1
                              : _vm.localSettings.showLegend
                          },
                          on: {
                            change: function($event) {
                              var $$a = _vm.localSettings.showLegend,
                                $$el = $event.target,
                                $$c = $$el.checked ? true : false
                              if (Array.isArray($$a)) {
                                var $$v = null,
                                  $$i = _vm._i($$a, $$v)
                                if ($$el.checked) {
                                  $$i < 0 &&
                                    _vm.$set(
                                      _vm.localSettings,
                                      "showLegend",
                                      $$a.concat([$$v])
                                    )
                                } else {
                                  $$i > -1 &&
                                    _vm.$set(
                                      _vm.localSettings,
                                      "showLegend",
                                      $$a
                                        .slice(0, $$i)
                                        .concat($$a.slice($$i + 1))
                                    )
                                }
                              } else {
                                _vm.$set(_vm.localSettings, "showLegend", $$c)
                              }
                            }
                          }
                        }),
                        _vm._v(
                          "\n                        Show in Legend\n                    "
                        )
                      ])
                    ])
                  : _vm._e()
              ]),
              _vm._v(" "),
              _vm.hasLevels
                ? _c("div", { staticClass: "settings-section" }, [
                    _c("h4", [_vm._v("Levels")]),
                    _vm._v(" "),
                    _c("div", { staticClass: "param-row" }, [
                      _c("label", [_vm._v("Upper Level")]),
                      _vm._v(" "),
                      _c("input", {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model.number",
                            value: _vm.localSettings.upper,
                            expression: "localSettings.upper",
                            modifiers: { number: true }
                          }
                        ],
                        attrs: { type: "number" },
                        domProps: { value: _vm.localSettings.upper },
                        on: {
                          input: function($event) {
                            if ($event.target.composing) {
                              return
                            }
                            _vm.$set(
                              _vm.localSettings,
                              "upper",
                              _vm._n($event.target.value)
                            )
                          },
                          blur: function($event) {
                            return _vm.$forceUpdate()
                          }
                        }
                      })
                    ]),
                    _vm._v(" "),
                    _c("div", { staticClass: "param-row" }, [
                      _c("label", [_vm._v("Lower Level")]),
                      _vm._v(" "),
                      _c("input", {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model.number",
                            value: _vm.localSettings.lower,
                            expression: "localSettings.lower",
                            modifiers: { number: true }
                          }
                        ],
                        attrs: { type: "number" },
                        domProps: { value: _vm.localSettings.lower },
                        on: {
                          input: function($event) {
                            if ($event.target.composing) {
                              return
                            }
                            _vm.$set(
                              _vm.localSettings,
                              "lower",
                              _vm._n($event.target.value)
                            )
                          },
                          blur: function($event) {
                            return _vm.$forceUpdate()
                          }
                        }
                      })
                    ])
                  ])
                : _vm._e()
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "modal-footer" }, [
              _c(
                "button",
                { staticClass: "btn btn-secondary", on: { click: _vm.reset } },
                [_vm._v("Reset")]
              ),
              _vm._v(" "),
              _c(
                "button",
                { staticClass: "btn btn-secondary", on: { click: _vm.remove } },
                [
                  _c("span", { staticClass: "remove-icon" }, [_vm._v("🗑")]),
                  _vm._v(" Remove\n            ")
                ]
              ),
              _vm._v(" "),
              _c(
                "button",
                { staticClass: "btn btn-primary", on: { click: _vm.apply } },
                [_vm._v("Apply")]
              )
            ])
          ])
        ]
      )
    : _vm._e()
}
var IndicatorSettingsvue_type_template_id_61af135c_scoped_true_staticRenderFns = []
IndicatorSettingsvue_type_template_id_61af135c_scoped_true_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/IndicatorSettings.vue?vue&type=template&id=61af135c&scoped=true&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/IndicatorSettings.vue?vue&type=script&lang=js&


function IndicatorSettingsvue_type_script_lang_js_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function IndicatorSettingsvue_type_script_lang_js_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { IndicatorSettingsvue_type_script_lang_js_ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { IndicatorSettingsvue_type_script_lang_js_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ const IndicatorSettingsvue_type_script_lang_js_ = ({
  name: 'IndicatorSettings',
  props: {
    visible: {
      type: Boolean,
      "default": false
    },
    indicator: {
      type: Object,
      "default": null
    }
  },
  data: function data() {
    return {
      localParams: {},
      localSettings: {},
      showColorPicker: false,
      // Preset colors (TradingView style)
      presetColors: ['#2962ff', '#ff6d00', '#00c853', '#aa00ff', '#00b8d4', '#ff1744', '#ffd600', '#76ff03', '#e040fb', '#18ffff', '#ff6e40', '#69f0ae', '#40c4ff', '#ff4081', '#eeff41', '#b2ff59']
    };
  },
  computed: {
    indicatorName: function indicatorName() {
      return this.indicator && this.indicator.name || 'Indicator Settings';
    },
    hasParams: function hasParams() {
      return this.indicator && this.indicator.params;
    },
    isOnChart: function isOnChart() {
      return this.indicator && this.indicator.position === 'onchart';
    },
    isOffChart: function isOffChart() {
      return this.indicator && this.indicator.position === 'offchart';
    },
    hasLevels: function hasLevels() {
      if (!this.indicator) return false;
      var types = ['RSI', 'Stoch', 'CCI', 'MFI', 'WPR'];
      return types.includes(this.indicator.type);
    }
  },
  watch: {
    indicator: {
      immediate: true,
      deep: true,
      handler: function handler(newVal) {
        if (newVal) {
          this.localParams = IndicatorSettingsvue_type_script_lang_js_objectSpread({}, newVal.params);
          this.localSettings = IndicatorSettingsvue_type_script_lang_js_objectSpread({}, newVal.settings);
        }
      }
    }
  },
  methods: {
    formatLabel: function formatLabel(key) {
      var labels = {
        length: 'Length',
        period: 'Period',
        fast: 'Fast Length',
        slow: 'Slow Length',
        signal: 'Signal Length',
        mult: 'Multiplier',
        k: '%K Length',
        d: '%D Length',
        smooth: 'Smooth'
      };
      return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
    },
    getParamMin: function getParamMin(key) {
      var mins = {
        length: 1,
        period: 1,
        fast: 1,
        slow: 1,
        signal: 1,
        mult: 0.1,
        k: 1,
        d: 1
      };
      return mins[key] || 1;
    },
    getParamMax: function getParamMax(key) {
      var maxs = {
        length: 500,
        period: 500,
        fast: 200,
        slow: 200,
        signal: 100,
        mult: 5,
        k: 100,
        d: 50
      };
      return maxs[key] || 500;
    },
    getParamStep: function getParamStep(key) {
      return key === 'mult' ? 0.1 : 1;
    },
    selectColor: function selectColor(color) {
      this.localSettings.color = color;
      this.showColorPicker = false;
    },
    apply: function apply() {
      this.$emit('apply', {
        id: this.indicator.id,
        params: IndicatorSettingsvue_type_script_lang_js_objectSpread({}, this.localParams),
        settings: IndicatorSettingsvue_type_script_lang_js_objectSpread({}, this.localSettings)
      });
      this.close();
    },
    reset: function reset() {
      if (this.indicator && this.indicator._config) {
        this.localParams = IndicatorSettingsvue_type_script_lang_js_objectSpread({}, this.indicator._config.params);
        this.localSettings = IndicatorSettingsvue_type_script_lang_js_objectSpread({}, this.indicator._config.defaultSettings);
      }
    },
    remove: function remove() {
      this.$emit('remove', this.indicator.id);
      this.close();
    },
    close: function close() {
      this.showColorPicker = false;
      this.$emit('close');
    }
  }
});
;// CONCATENATED MODULE: ./src/components/IndicatorSettings.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_IndicatorSettingsvue_type_script_lang_js_ = (IndicatorSettingsvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/IndicatorSettings.vue?vue&type=style&index=0&id=61af135c&scoped=true&lang=css&
var IndicatorSettingsvue_type_style_index_0_id_61af135c_scoped_true_lang_css_ = __webpack_require__(1187);
;// CONCATENATED MODULE: ./src/components/IndicatorSettings.vue?vue&type=style&index=0&id=61af135c&scoped=true&lang=css&

;// CONCATENATED MODULE: ./src/components/IndicatorSettings.vue



;


/* normalize component */

var IndicatorSettings_component = normalizeComponent(
  components_IndicatorSettingsvue_type_script_lang_js_,
  IndicatorSettingsvue_type_template_id_61af135c_scoped_true_render,
  IndicatorSettingsvue_type_template_id_61af135c_scoped_true_staticRenderFns,
  false,
  null,
  "61af135c",
  null
  
)

/* hot reload */
if (false) { var IndicatorSettings_api; }
IndicatorSettings_component.options.__file = "src/components/IndicatorSettings.vue"
/* harmony default export */ const IndicatorSettings = (IndicatorSettings_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ExchangeSettings.vue?vue&type=template&id=a20e7ed4&scoped=true&
var ExchangeSettingsvue_type_template_id_a20e7ed4_scoped_true_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm.visible
    ? _c(
        "div",
        {
          staticClass: "tvjs-modal-overlay",
          on: {
            click: function($event) {
              if ($event.target !== $event.currentTarget) {
                return null
              }
              return _vm.close($event)
            }
          }
        },
        [
          _c("div", { staticClass: "tvjs-modal tvjs-exchange-modal" }, [
            _c("div", { staticClass: "modal-header" }, [
              _c("h3", [
                _vm._v(_vm._s(_vm.editMode ? "Edit Exchange" : "Add Exchange"))
              ]),
              _vm._v(" "),
              _c(
                "button",
                { staticClass: "btn-close", on: { click: _vm.close } },
                [_vm._v("×")]
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "modal-body" }, [
              !_vm.editMode
                ? _c("div", { staticClass: "form-group" }, [
                    _c("label", [_vm._v("Select Exchange")]),
                    _vm._v(" "),
                    _c(
                      "select",
                      {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model",
                            value: _vm.selectedExchange,
                            expression: "selectedExchange"
                          }
                        ],
                        on: {
                          change: function($event) {
                            var $$selectedVal = Array.prototype.filter
                              .call($event.target.options, function(o) {
                                return o.selected
                              })
                              .map(function(o) {
                                var val = "_value" in o ? o._value : o.value
                                return val
                              })
                            _vm.selectedExchange = $event.target.multiple
                              ? $$selectedVal
                              : $$selectedVal[0]
                          }
                        }
                      },
                      [
                        _c("option", { attrs: { value: "", disabled: "" } }, [
                          _vm._v("-- Choose Exchange --")
                        ]),
                        _vm._v(" "),
                        _vm._l(_vm.availableExchanges, function(ex) {
                          return _c(
                            "option",
                            {
                              key: ex.id,
                              attrs: {
                                disabled: _vm.configuredIds.includes(ex.id)
                              },
                              domProps: { value: ex.id }
                            },
                            [
                              _vm._v(
                                "\n                        " +
                                  _vm._s(ex.name) +
                                  "\n                        " +
                                  _vm._s(
                                    _vm.configuredIds.includes(ex.id)
                                      ? "(configured)"
                                      : ""
                                  ) +
                                  "\n                    "
                              )
                            ]
                          )
                        })
                      ],
                      2
                    )
                  ])
                : _vm._e(),
              _vm._v(" "),
              _vm.exchangeConfig
                ? _c("div", { staticClass: "exchange-info" }, [
                    _c("div", { staticClass: "info-badge" }, [
                      _c("span", { staticClass: "badge-type" }, [
                        _vm._v(_vm._s(_vm.exchangeConfig.type))
                      ])
                    ]),
                    _vm._v(" "),
                    _c("div", { staticClass: "supported-tfs" }, [
                      _c("span", { staticClass: "label" }, [
                        _vm._v("Supported TFs:")
                      ]),
                      _vm._v(
                        "\n                    " +
                          _vm._s(_vm.supportedTimeframes) +
                          "...\n                "
                      )
                    ])
                  ])
                : _vm._e(),
              _vm._v(" "),
              _vm.selectedExchange || _vm.editMode
                ? _c("div", { staticClass: "form-section" }, [
                    _c("h4", [_vm._v("API Credentials")]),
                    _vm._v(" "),
                    _c("div", { staticClass: "form-group" }, [
                      _c("label", [_vm._v("API Key")]),
                      _vm._v(" "),
                      _c("input", {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model",
                            value: _vm.formData.apiKey,
                            expression: "formData.apiKey"
                          }
                        ],
                        attrs: {
                          type: "text",
                          placeholder: "Enter your API key"
                        },
                        domProps: { value: _vm.formData.apiKey },
                        on: {
                          input: function($event) {
                            if ($event.target.composing) {
                              return
                            }
                            _vm.$set(
                              _vm.formData,
                              "apiKey",
                              $event.target.value
                            )
                          }
                        }
                      }),
                      _vm._v(" "),
                      _c("span", { staticClass: "hint" }, [
                        _vm._v("Optional for public data")
                      ])
                    ]),
                    _vm._v(" "),
                    _c("div", { staticClass: "form-group" }, [
                      _c("label", [_vm._v("API Secret")]),
                      _vm._v(" "),
                      _c("div", { staticClass: "secret-input" }, [
                        (_vm.showSecret ? "text" : "password") === "checkbox"
                          ? _c("input", {
                              directives: [
                                {
                                  name: "model",
                                  rawName: "v-model",
                                  value: _vm.formData.apiSecret,
                                  expression: "formData.apiSecret"
                                }
                              ],
                              attrs: {
                                placeholder: "Enter your API secret",
                                type: "checkbox"
                              },
                              domProps: {
                                checked: Array.isArray(_vm.formData.apiSecret)
                                  ? _vm._i(_vm.formData.apiSecret, null) > -1
                                  : _vm.formData.apiSecret
                              },
                              on: {
                                change: function($event) {
                                  var $$a = _vm.formData.apiSecret,
                                    $$el = $event.target,
                                    $$c = $$el.checked ? true : false
                                  if (Array.isArray($$a)) {
                                    var $$v = null,
                                      $$i = _vm._i($$a, $$v)
                                    if ($$el.checked) {
                                      $$i < 0 &&
                                        _vm.$set(
                                          _vm.formData,
                                          "apiSecret",
                                          $$a.concat([$$v])
                                        )
                                    } else {
                                      $$i > -1 &&
                                        _vm.$set(
                                          _vm.formData,
                                          "apiSecret",
                                          $$a
                                            .slice(0, $$i)
                                            .concat($$a.slice($$i + 1))
                                        )
                                    }
                                  } else {
                                    _vm.$set(_vm.formData, "apiSecret", $$c)
                                  }
                                }
                              }
                            })
                          : (_vm.showSecret ? "text" : "password") === "radio"
                          ? _c("input", {
                              directives: [
                                {
                                  name: "model",
                                  rawName: "v-model",
                                  value: _vm.formData.apiSecret,
                                  expression: "formData.apiSecret"
                                }
                              ],
                              attrs: {
                                placeholder: "Enter your API secret",
                                type: "radio"
                              },
                              domProps: {
                                checked: _vm._q(_vm.formData.apiSecret, null)
                              },
                              on: {
                                change: function($event) {
                                  return _vm.$set(
                                    _vm.formData,
                                    "apiSecret",
                                    null
                                  )
                                }
                              }
                            })
                          : _c("input", {
                              directives: [
                                {
                                  name: "model",
                                  rawName: "v-model",
                                  value: _vm.formData.apiSecret,
                                  expression: "formData.apiSecret"
                                }
                              ],
                              attrs: {
                                placeholder: "Enter your API secret",
                                type: _vm.showSecret ? "text" : "password"
                              },
                              domProps: { value: _vm.formData.apiSecret },
                              on: {
                                input: function($event) {
                                  if ($event.target.composing) {
                                    return
                                  }
                                  _vm.$set(
                                    _vm.formData,
                                    "apiSecret",
                                    $event.target.value
                                  )
                                }
                              }
                            }),
                        _vm._v(" "),
                        _c(
                          "button",
                          {
                            staticClass: "btn-toggle",
                            on: {
                              click: function($event) {
                                _vm.showSecret = !_vm.showSecret
                              }
                            }
                          },
                          [
                            _vm._v(
                              "\n                            " +
                                _vm._s(_vm.showSecret ? "🙈" : "👁") +
                                "\n                        "
                            )
                          ]
                        )
                      ])
                    ]),
                    _vm._v(" "),
                    _vm.needsPassphrase
                      ? _c("div", { staticClass: "form-group" }, [
                          _c("label", [_vm._v("Passphrase")]),
                          _vm._v(" "),
                          _c("input", {
                            directives: [
                              {
                                name: "model",
                                rawName: "v-model",
                                value: _vm.formData.passphrase,
                                expression: "formData.passphrase"
                              }
                            ],
                            attrs: {
                              type: "password",
                              placeholder: "Enter passphrase"
                            },
                            domProps: { value: _vm.formData.passphrase },
                            on: {
                              input: function($event) {
                                if ($event.target.composing) {
                                  return
                                }
                                _vm.$set(
                                  _vm.formData,
                                  "passphrase",
                                  $event.target.value
                                )
                              }
                            }
                          })
                        ])
                      : _vm._e()
                  ])
                : _vm._e(),
              _vm._v(" "),
              _vm.selectedExchange || _vm.editMode
                ? _c("div", { staticClass: "form-section" }, [
                    _c("h4", [_vm._v("Options")]),
                    _vm._v(" "),
                    _c("div", { staticClass: "form-group checkbox-group" }, [
                      _c("label", [
                        _c("input", {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.formData.enabled,
                              expression: "formData.enabled"
                            }
                          ],
                          attrs: { type: "checkbox" },
                          domProps: {
                            checked: Array.isArray(_vm.formData.enabled)
                              ? _vm._i(_vm.formData.enabled, null) > -1
                              : _vm.formData.enabled
                          },
                          on: {
                            change: function($event) {
                              var $$a = _vm.formData.enabled,
                                $$el = $event.target,
                                $$c = $$el.checked ? true : false
                              if (Array.isArray($$a)) {
                                var $$v = null,
                                  $$i = _vm._i($$a, $$v)
                                if ($$el.checked) {
                                  $$i < 0 &&
                                    _vm.$set(
                                      _vm.formData,
                                      "enabled",
                                      $$a.concat([$$v])
                                    )
                                } else {
                                  $$i > -1 &&
                                    _vm.$set(
                                      _vm.formData,
                                      "enabled",
                                      $$a
                                        .slice(0, $$i)
                                        .concat($$a.slice($$i + 1))
                                    )
                                }
                              } else {
                                _vm.$set(_vm.formData, "enabled", $$c)
                              }
                            }
                          }
                        }),
                        _vm._v(
                          "\n                        Enable this exchange\n                    "
                        )
                      ])
                    ]),
                    _vm._v(" "),
                    _c("div", { staticClass: "form-group checkbox-group" }, [
                      _c("label", [
                        _c("input", {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.formData.setDefault,
                              expression: "formData.setDefault"
                            }
                          ],
                          attrs: { type: "checkbox" },
                          domProps: {
                            checked: Array.isArray(_vm.formData.setDefault)
                              ? _vm._i(_vm.formData.setDefault, null) > -1
                              : _vm.formData.setDefault
                          },
                          on: {
                            change: function($event) {
                              var $$a = _vm.formData.setDefault,
                                $$el = $event.target,
                                $$c = $$el.checked ? true : false
                              if (Array.isArray($$a)) {
                                var $$v = null,
                                  $$i = _vm._i($$a, $$v)
                                if ($$el.checked) {
                                  $$i < 0 &&
                                    _vm.$set(
                                      _vm.formData,
                                      "setDefault",
                                      $$a.concat([$$v])
                                    )
                                } else {
                                  $$i > -1 &&
                                    _vm.$set(
                                      _vm.formData,
                                      "setDefault",
                                      $$a
                                        .slice(0, $$i)
                                        .concat($$a.slice($$i + 1))
                                    )
                                }
                              } else {
                                _vm.$set(_vm.formData, "setDefault", $$c)
                              }
                            }
                          }
                        }),
                        _vm._v(
                          "\n                        Set as default exchange\n                    "
                        )
                      ])
                    ])
                  ])
                : _vm._e(),
              _vm._v(" "),
              _vm._m(0)
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "modal-footer" }, [
              _c(
                "button",
                {
                  staticClass: "btn btn-secondary",
                  attrs: { disabled: _vm.testing },
                  on: { click: _vm.testConnection }
                },
                [
                  _vm._v(
                    "\n                " +
                      _vm._s(_vm.testing ? "Testing..." : "Test Connection") +
                      "\n            "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "button",
                { staticClass: "btn btn-secondary", on: { click: _vm.close } },
                [_vm._v("Cancel")]
              ),
              _vm._v(" "),
              _c(
                "button",
                {
                  staticClass: "btn btn-primary",
                  attrs: { disabled: !_vm.canSave },
                  on: { click: _vm.save }
                },
                [
                  _vm._v(
                    "\n                " +
                      _vm._s(_vm.editMode ? "Update" : "Add Exchange") +
                      "\n            "
                  )
                ]
              )
            ])
          ])
        ]
      )
    : _vm._e()
}
var ExchangeSettingsvue_type_template_id_a20e7ed4_scoped_true_staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "security-notice" }, [
      _c("span", { staticClass: "notice-icon" }, [_vm._v("🔒")]),
      _vm._v(" "),
      _c("div", { staticClass: "notice-text" }, [
        _c("strong", [_vm._v("Security Notice:")]),
        _vm._v(
          "\n                    API keys are stored locally and never sent to third parties.\n                    For trading, use API keys with restricted permissions.\n                "
        )
      ])
    ])
  }
]
ExchangeSettingsvue_type_template_id_a20e7ed4_scoped_true_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/ExchangeSettings.vue?vue&type=template&id=a20e7ed4&scoped=true&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ExchangeSettings.vue?vue&type=script&lang=js&





function ExchangeSettingsvue_type_script_lang_js_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function ExchangeSettingsvue_type_script_lang_js_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ExchangeSettingsvue_type_script_lang_js_ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ExchangeSettingsvue_type_script_lang_js_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ const ExchangeSettingsvue_type_script_lang_js_ = ({
  name: 'ExchangeSettings',
  props: {
    visible: {
      type: Boolean,
      "default": false
    },
    editExchangeId: {
      type: String,
      "default": null
    },
    configuredExchanges: {
      type: Array,
      "default": function _default() {
        return [];
      }
    }
  },
  data: function data() {
    return {
      selectedExchange: '',
      formData: {
        apiKey: '',
        apiSecret: '',
        passphrase: '',
        enabled: true,
        setDefault: false
      },
      showSecret: false,
      testing: false
    };
  },
  computed: {
    editMode: function editMode() {
      return !!this.editExchangeId;
    },
    availableExchanges: function availableExchanges() {
      return Object.entries(EXCHANGE_CONFIGS).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            id = _ref2[0],
            config = _ref2[1];

        return {
          id: id,
          name: config.name,
          type: config.type,
          requiresAuth: config.requiresAuth
        };
      });
    },
    configuredIds: function configuredIds() {
      return this.configuredExchanges.map(function (ex) {
        return ex.id;
      });
    },
    exchangeConfig: function exchangeConfig() {
      var id = this.editMode ? this.editExchangeId : this.selectedExchange;
      return EXCHANGE_CONFIGS[id] || null;
    },
    needsPassphrase: function needsPassphrase() {
      return this.selectedExchange === 'okx' || this.editExchangeId === 'okx';
    },
    canSave: function canSave() {
      return this.editMode || this.selectedExchange;
    },
    supportedTimeframes: function supportedTimeframes() {
      if (!this.exchangeConfig || !this.exchangeConfig.supportsTimeframes) {
        return '';
      }

      return this.exchangeConfig.supportsTimeframes.slice(0, 6).join(', ');
    }
  },
  watch: {
    visible: function visible(val) {
      if (val && this.editMode) {
        this.loadExchangeData();
      }
    },
    editExchangeId: function editExchangeId() {
      if (this.editMode) {
        this.loadExchangeData();
      }
    }
  },
  methods: {
    loadExchangeData: function loadExchangeData() {
      var _this = this;

      var exchange = this.configuredExchanges.find(function (ex) {
        return ex.id === _this.editExchangeId;
      });

      if (exchange) {
        this.formData = {
          apiKey: exchange.apiKey || '',
          apiSecret: exchange.apiSecret || '',
          passphrase: exchange.passphrase || '',
          enabled: exchange.enabled !== false,
          setDefault: false
        };
      }
    },
    testConnection: function testConnection() {
      var _this2 = this;

      return _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee() {
        var id, manager;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this2.testing = true;
                _context.prev = 1;
                id = _this2.editMode ? _this2.editExchangeId : _this2.selectedExchange;
                manager = new ExchangeManager(); // Temporarily add exchange

                manager.addExchange(id, ExchangeSettingsvue_type_script_lang_js_objectSpread(ExchangeSettingsvue_type_script_lang_js_objectSpread({}, _this2.formData), {}, {
                  enabled: true
                })); // Try to fetch data

                _context.next = 7;
                return manager.fetchKlines(id, 'BTC/USDT', '1h', 1);

              case 7:
                _this2.$emit('test-success', id);

                alert('✅ Connection successful!');
                _context.next = 15;
                break;

              case 11:
                _context.prev = 11;
                _context.t0 = _context["catch"](1);
                console.error('Connection test failed:', _context.t0);
                alert("\u274C Connection failed: ".concat(_context.t0.message));

              case 15:
                _context.prev = 15;
                _this2.testing = false;
                return _context.finish(15);

              case 18:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[1, 11, 15, 18]]);
      }))();
    },
    save: function save() {
      var id = this.editMode ? this.editExchangeId : this.selectedExchange;
      this.$emit('save', {
        id: id,
        config: ExchangeSettingsvue_type_script_lang_js_objectSpread({}, this.formData)
      });
      this.reset();
      this.close();
    },
    close: function close() {
      this.$emit('close');
    },
    reset: function reset() {
      this.selectedExchange = '';
      this.formData = {
        apiKey: '',
        apiSecret: '',
        passphrase: '',
        enabled: true,
        setDefault: false
      };
      this.showSecret = false;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/ExchangeSettings.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_ExchangeSettingsvue_type_script_lang_js_ = (ExchangeSettingsvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ExchangeSettings.vue?vue&type=style&index=0&id=a20e7ed4&scoped=true&lang=css&
var ExchangeSettingsvue_type_style_index_0_id_a20e7ed4_scoped_true_lang_css_ = __webpack_require__(291);
;// CONCATENATED MODULE: ./src/components/ExchangeSettings.vue?vue&type=style&index=0&id=a20e7ed4&scoped=true&lang=css&

;// CONCATENATED MODULE: ./src/components/ExchangeSettings.vue



;


/* normalize component */

var ExchangeSettings_component = normalizeComponent(
  components_ExchangeSettingsvue_type_script_lang_js_,
  ExchangeSettingsvue_type_template_id_a20e7ed4_scoped_true_render,
  ExchangeSettingsvue_type_template_id_a20e7ed4_scoped_true_staticRenderFns,
  false,
  null,
  "a20e7ed4",
  null
  
)

/* hot reload */
if (false) { var ExchangeSettings_api; }
ExchangeSettings_component.options.__file = "src/components/ExchangeSettings.vue"
/* harmony default export */ const ExchangeSettings = (ExchangeSettings_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ExchangeManager.vue?vue&type=template&id=d9709dec&scoped=true&
var ExchangeManagervue_type_template_id_d9709dec_scoped_true_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "tvjs-exchange-manager" },
    [
      _c("div", { staticClass: "manager-header" }, [
        _c("h3", [_vm._v("🔗 Exchanges")]),
        _vm._v(" "),
        _c(
          "button",
          {
            staticClass: "btn-add",
            on: {
              click: function($event) {
                _vm.showAddModal = true
              }
            }
          },
          [_vm._v("+ Add Exchange")]
        )
      ]),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "exchange-list" },
        [
          _vm._l(_vm.exchanges, function(exchange) {
            return _c(
              "div",
              {
                key: exchange.id,
                staticClass: "exchange-item",
                class: { "is-default": exchange.id === _vm.defaultExchange }
              },
              [
                _c("div", { staticClass: "exchange-main" }, [
                  _c("div", { staticClass: "exchange-icon" }, [
                    _vm._v(
                      "\n                    " +
                        _vm._s(_vm.getExchangeIcon(exchange.id)) +
                        "\n                "
                    )
                  ]),
                  _vm._v(" "),
                  _c("div", { staticClass: "exchange-info" }, [
                    _c("div", { staticClass: "exchange-name" }, [
                      _vm._v(
                        "\n                        " +
                          _vm._s(exchange.name) +
                          "\n                        "
                      ),
                      exchange.id === _vm.defaultExchange
                        ? _c("span", { staticClass: "default-badge" }, [
                            _vm._v("DEFAULT")
                          ])
                        : _vm._e()
                    ]),
                    _vm._v(" "),
                    _c("div", { staticClass: "exchange-status" }, [
                      _c(
                        "span",
                        {
                          class: exchange.enabled
                            ? "status-enabled"
                            : "status-disabled"
                        },
                        [
                          _vm._v(
                            "\n                            " +
                              _vm._s(
                                exchange.enabled ? "● Enabled" : "○ Disabled"
                              ) +
                              "\n                        "
                          )
                        ]
                      ),
                      _vm._v(" "),
                      exchange.apiKey
                        ? _c("span", { staticClass: "has-key" }, [
                            _vm._v("🔑 API Key")
                          ])
                        : _vm._e()
                    ])
                  ])
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "exchange-actions" }, [
                  exchange.id !== _vm.defaultExchange
                    ? _c(
                        "button",
                        {
                          staticClass: "btn-action",
                          attrs: { title: "Set as default" },
                          on: {
                            click: function($event) {
                              return _vm.setDefault(exchange.id)
                            }
                          }
                        },
                        [_vm._v("\n                    ⭐\n                ")]
                      )
                    : _vm._e(),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass: "btn-action",
                      attrs: { title: "Edit" },
                      on: {
                        click: function($event) {
                          return _vm.editExchange(exchange.id)
                        }
                      }
                    },
                    [_vm._v("\n                    ⚙️\n                ")]
                  ),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass: "btn-action btn-remove",
                      attrs: { title: "Remove" },
                      on: {
                        click: function($event) {
                          return _vm.removeExchange(exchange.id)
                        }
                      }
                    },
                    [_vm._v("\n                    🗑️\n                ")]
                  )
                ])
              ]
            )
          }),
          _vm._v(" "),
          _vm.exchanges.length === 0
            ? _c("div", { staticClass: "no-exchanges" }, [
                _vm._v(
                  '\n            No exchanges configured. Click "Add Exchange" to get started.\n        '
                )
              ])
            : _vm._e()
        ],
        2
      ),
      _vm._v(" "),
      _c("div", { staticClass: "manager-actions" }, [
        _c(
          "button",
          { staticClass: "btn-secondary", on: { click: _vm.exportConfig } },
          [_vm._v("\n            📥 Export Config\n        ")]
        ),
        _vm._v(" "),
        _c(
          "button",
          { staticClass: "btn-secondary", on: { click: _vm.triggerImport } },
          [_vm._v("\n            📤 Import Config\n        ")]
        ),
        _vm._v(" "),
        _c("input", {
          ref: "fileInput",
          staticStyle: { display: "none" },
          attrs: { type: "file", accept: ".json" },
          on: { change: _vm.importConfig }
        })
      ]),
      _vm._v(" "),
      _c("exchange-settings", {
        attrs: {
          visible: _vm.showAddModal || _vm.editingExchange !== null,
          "edit-exchange-id": _vm.editingExchange,
          "configured-exchanges": _vm.exchanges
        },
        on: {
          close: _vm.closeModal,
          save: _vm.saveExchange,
          "test-success": _vm.onTestSuccess
        }
      })
    ],
    1
  )
}
var ExchangeManagervue_type_template_id_d9709dec_scoped_true_staticRenderFns = []
ExchangeManagervue_type_template_id_d9709dec_scoped_true_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/ExchangeManager.vue?vue&type=template&id=d9709dec&scoped=true&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ExchangeManager.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ const ExchangeManagervue_type_script_lang_js_ = ({
  name: 'ExchangeManagerComponent',
  components: {
    ExchangeSettings: ExchangeSettings
  },
  data: function data() {
    return {
      manager: null,
      exchanges: [],
      defaultExchange: null,
      showAddModal: false,
      editingExchange: null
    };
  },
  mounted: function mounted() {
    this.manager = new ExchangeManager();
    this.refreshExchanges();
  },
  methods: {
    refreshExchanges: function refreshExchanges() {
      this.exchanges = this.manager.getAllExchanges();
      this.defaultExchange = this.manager.currentExchange;
    },
    getExchangeIcon: function getExchangeIcon(id) {
      var icons = {
        'binance': '🟡',
        'binance-futures': '🟡',
        'bybit': '🟠',
        'okx': '⚫',
        'bitget': '🔵',
        'kucoin': '🟢'
      };
      return icons[id] || '🔶';
    },
    setDefault: function setDefault(id) {
      this.manager.setCurrentExchange(id);
      this.defaultExchange = id;
      this.$emit('exchange-changed', id);
    },
    editExchange: function editExchange(id) {
      this.editingExchange = id;
    },
    removeExchange: function removeExchange(id) {
      var _this$manager$getExch;

      if (confirm("Remove ".concat((_this$manager$getExch = this.manager.getExchange(id)) === null || _this$manager$getExch === void 0 ? void 0 : _this$manager$getExch.name, "?"))) {
        this.manager.removeExchange(id);
        this.refreshExchanges();
        this.$emit('exchange-removed', id);
      }
    },
    closeModal: function closeModal() {
      this.showAddModal = false;
      this.editingExchange = null;
    },
    saveExchange: function saveExchange(_ref) {
      var id = _ref.id,
          config = _ref.config;
      this.manager.addExchange(id, config);

      if (config.setDefault) {
        this.manager.setCurrentExchange(id);
      }

      this.refreshExchanges();
      this.closeModal();
      this.$emit('exchange-added', id);
    },
    onTestSuccess: function onTestSuccess(id) {
      console.log("Connection test passed for ".concat(id));
    },
    exportConfig: function exportConfig() {
      var config = this.manager.exportConfig();
      var blob = new Blob([config], {
        type: 'application/json'
      });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'tradingvue_exchanges.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    triggerImport: function triggerImport() {
      this.$refs.fileInput.click();
    },
    importConfig: function importConfig(event) {
      var _this = this;

      var file = event.target.files[0];
      if (!file) return;
      var reader = new FileReader();

      reader.onload = function (e) {
        if (_this.manager.importConfig(e.target.result)) {
          _this.refreshExchanges();

          _this.$emit('config-imported');

          alert('Configuration imported successfully!');
        } else {
          alert('Failed to import configuration');
        }
      };

      reader.readAsText(file); // Reset input

      event.target.value = '';
    },
    // Get current exchange info
    getCurrentExchange: function getCurrentExchange() {
      return this.manager.getCurrentExchange();
    },
    // Create data loader for current exchange
    createDataLoader: function createDataLoader() {
      return this.manager.createDataLoader();
    }
  }
});
;// CONCATENATED MODULE: ./src/components/ExchangeManager.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_ExchangeManagervue_type_script_lang_js_ = (ExchangeManagervue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ExchangeManager.vue?vue&type=style&index=0&id=d9709dec&scoped=true&lang=css&
var ExchangeManagervue_type_style_index_0_id_d9709dec_scoped_true_lang_css_ = __webpack_require__(2590);
;// CONCATENATED MODULE: ./src/components/ExchangeManager.vue?vue&type=style&index=0&id=d9709dec&scoped=true&lang=css&

;// CONCATENATED MODULE: ./src/components/ExchangeManager.vue



;


/* normalize component */

var ExchangeManager_component = normalizeComponent(
  components_ExchangeManagervue_type_script_lang_js_,
  ExchangeManagervue_type_template_id_d9709dec_scoped_true_render,
  ExchangeManagervue_type_template_id_d9709dec_scoped_true_staticRenderFns,
  false,
  null,
  "d9709dec",
  null
  
)

/* hot reload */
if (false) { var ExchangeManager_api; }
ExchangeManager_component.options.__file = "src/components/ExchangeManager.vue"
/* harmony default export */ const components_ExchangeManager = (ExchangeManager_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/DrawingToolbar.vue?vue&type=template&id=6545392d&scoped=true&
var DrawingToolbarvue_type_template_id_6545392d_scoped_true_render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "drawing-toolbar", class: { "is-vertical": _vm.vertical } },
    [
      _vm._l(_vm.toolGroups, function(group) {
        return _c("div", { key: group.name, staticClass: "tool-group" }, [
          _vm.showGroupTitles
            ? _c("div", { staticClass: "group-title" }, [
                _vm._v(_vm._s(group.title))
              ])
            : _vm._e(),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "tools-row" },
            _vm._l(group.tools, function(tool) {
              return _c(
                "button",
                {
                  key: tool.type,
                  staticClass: "tool-btn",
                  class: {
                    "is-active": _vm.activeTool === tool.type,
                    "is-selected":
                      _vm.selectedToolId && _vm.activeTool === tool.type
                  },
                  attrs: { title: tool.hint },
                  on: {
                    click: function($event) {
                      return _vm.selectTool(tool)
                    },
                    contextmenu: function($event) {
                      $event.preventDefault()
                      return _vm.showMods($event, tool)
                    }
                  }
                },
                [
                  _c("span", {
                    staticClass: "tool-icon",
                    domProps: { innerHTML: _vm._s(tool.icon) }
                  }),
                  _vm._v(" "),
                  tool.mods
                    ? _c("span", { staticClass: "tool-arrow" }, [_vm._v("▼")])
                    : _vm._e()
                ]
              )
            }),
            0
          )
        ])
      }),
      _vm._v(" "),
      _vm.showColorPicker
        ? _c("div", { staticClass: "color-section" }, [
            _c("div", { staticClass: "group-title" }, [_vm._v("Color")]),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "color-grid" },
              _vm._l(_vm.colors, function(color) {
                return _c("button", {
                  key: color,
                  staticClass: "color-btn",
                  class: { "is-active": _vm.currentColor === color },
                  style: { backgroundColor: color },
                  on: {
                    click: function($event) {
                      return _vm.setColor(color)
                    }
                  }
                })
              }),
              0
            ),
            _vm._v(" "),
            _c("input", {
              staticClass: "custom-color",
              attrs: { type: "color" },
              domProps: { value: _vm.currentColor },
              on: {
                input: function($event) {
                  return _vm.setColor($event.target.value)
                }
              }
            })
          ])
        : _vm._e(),
      _vm._v(" "),
      _vm.showWidthSlider
        ? _c("div", { staticClass: "width-section" }, [
            _c("div", { staticClass: "group-title" }, [
              _vm._v("Width: " + _vm._s(_vm.currentWidth) + "px")
            ]),
            _vm._v(" "),
            _c("input", {
              attrs: { type: "range", min: "1", max: "20" },
              domProps: { value: _vm.currentWidth },
              on: {
                input: function($event) {
                  return _vm.setWidth($event.target.value)
                }
              }
            })
          ])
        : _vm._e(),
      _vm._v(" "),
      _c("div", { staticClass: "actions-section" }, [
        _c(
          "button",
          {
            staticClass: "action-btn",
            attrs: { title: "Undo" },
            on: {
              click: function($event) {
                return _vm.$emit("undo")
              }
            }
          },
          [_vm._v("\n            ↶\n        ")]
        ),
        _vm._v(" "),
        _c(
          "button",
          {
            staticClass: "action-btn",
            attrs: { title: "Redo" },
            on: {
              click: function($event) {
                return _vm.$emit("redo")
              }
            }
          },
          [_vm._v("\n            ↷\n        ")]
        ),
        _vm._v(" "),
        _c(
          "button",
          {
            staticClass: "action-btn",
            attrs: { title: "Clear All" },
            on: {
              click: function($event) {
                return _vm.$emit("clear-all")
              }
            }
          },
          [_vm._v("\n            🗑\n        ")]
        )
      ]),
      _vm._v(" "),
      _vm.showModsDropdown
        ? _c(
            "div",
            {
              staticClass: "mods-dropdown",
              style: {
                top: _vm.modsPosition.y + "px",
                left: _vm.modsPosition.x + "px"
              }
            },
            _vm._l(_vm.currentMods, function(mod, name) {
              return _c(
                "button",
                {
                  key: name,
                  staticClass: "mod-btn",
                  on: {
                    click: function($event) {
                      return _vm.selectMod(mod)
                    }
                  }
                },
                [
                  _c("span", {
                    staticClass: "mod-icon",
                    domProps: { innerHTML: _vm._s(mod.icon) }
                  }),
                  _vm._v("\n            " + _vm._s(name) + "\n        ")
                ]
              )
            }),
            0
          )
        : _vm._e()
    ],
    2
  )
}
var DrawingToolbarvue_type_template_id_6545392d_scoped_true_staticRenderFns = []
DrawingToolbarvue_type_template_id_6545392d_scoped_true_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/DrawingToolbar.vue?vue&type=template&id=6545392d&scoped=true&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/DrawingToolbar.vue?vue&type=script&lang=js&


function DrawingToolbarvue_type_script_lang_js_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function DrawingToolbarvue_type_script_lang_js_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { DrawingToolbarvue_type_script_lang_js_ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { DrawingToolbarvue_type_script_lang_js_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ const DrawingToolbarvue_type_script_lang_js_ = ({
  name: 'DrawingToolbar',
  props: {
    // Active tool type
    activeTool: {
      type: String,
      "default": 'cursor'
    },
    // Selected tool instance id
    selectedToolId: {
      type: String,
      "default": null
    },
    // Current color
    currentColor: {
      type: String,
      "default": '#2962ff'
    },
    // Current line width
    currentWidth: {
      type: Number,
      "default": 2
    },
    // Layout
    vertical: {
      type: Boolean,
      "default": true
    },
    showGroupTitles: {
      type: Boolean,
      "default": false
    },
    showColorPicker: {
      type: Boolean,
      "default": true
    },
    showWidthSlider: {
      type: Boolean,
      "default": true
    },
    night: {
      type: Boolean,
      "default": true
    }
  },
  data: function data() {
    return {
      showModsDropdown: false,
      modsPosition: {
        x: 0,
        y: 0
      },
      currentMods: {},
      currentToolForMods: null,
      colors: ['#2962ff', '#ff1744', '#00c853', '#ffea00', '#aa00ff', '#00b8d4', '#ff6d00', '#f50057', '#64dd17', '#00e5ff', '#d500f9', '#ffffff'],
      toolGroups: [{
        name: 'cursor',
        title: 'Select',
        tools: [{
          type: 'cursor',
          icon: '⟹',
          hint: 'Cursor (Select/Move)'
        }]
      }, {
        name: 'lines',
        title: 'Lines',
        tools: [{
          type: 'SegmentTool',
          icon: '╱',
          hint: 'Trend Line',
          mods: {
            'Ray': {
              icon: '→',
              settings: {
                ray: true
              }
            },
            'Extended': {
              icon: '⟷',
              settings: {
                extended: true
              }
            }
          }
        }, {
          type: 'HorizontalLine',
          icon: '─',
          hint: 'Horizontal Line'
        }, {
          type: 'VerticalLine',
          icon: '│',
          hint: 'Vertical Line'
        }]
      }, {
        name: 'brush',
        title: 'Drawing',
        tools: [{
          type: 'BrushTool',
          icon: '✎',
          hint: 'Brush',
          settings: {
            mode: 'brush'
          },
          mods: {
            'Pencil': {
              icon: '✏',
              settings: {
                mode: 'pencil'
              }
            },
            'Marker': {
              icon: '🖊',
              settings: {
                mode: 'marker'
              }
            },
            'Highlighter': {
              icon: '◈',
              settings: {
                mode: 'highlighter'
              }
            }
          }
        }]
      }, {
        name: 'shapes',
        title: 'Shapes',
        tools: [{
          type: 'RectangleTool',
          icon: '▢',
          hint: 'Rectangle',
          mods: {
            'Filled': {
              icon: '▮',
              settings: {
                filled: true
              }
            },
            'With Text': {
              icon: '▣',
              settings: {
                withText: true
              }
            }
          }
        }, {
          type: 'CircleTool',
          icon: '○',
          hint: 'Circle/Ellipse',
          mods: {
            'Filled': {
              icon: '●',
              settings: {
                filled: true
              }
            },
            'With Text': {
              icon: '◉',
              settings: {
                withText: true
              }
            }
          }
        }, {
          type: 'TriangleTool',
          icon: '△',
          hint: 'Triangle',
          mods: {
            'Filled': {
              icon: '▲',
              settings: {
                filled: true
              }
            }
          }
        }, {
          type: 'PolygonTool',
          icon: '⬡',
          hint: 'Polygon'
        }]
      }, {
        name: 'text',
        title: 'Text',
        tools: [{
          type: 'TextTool',
          icon: 'T',
          hint: 'Text Label',
          mods: {
            'Large': {
              icon: 'T',
              settings: {
                fontSize: 20
              }
            },
            'Small': {
              icon: 't',
              settings: {
                fontSize: 12
              }
            }
          }
        }, {
          type: 'ArrowTool',
          icon: '→',
          hint: 'Arrow',
          mods: {
            'Double': {
              icon: '↔',
              settings: {
                "double": true
              }
            }
          }
        }, {
          type: 'CalloutTool',
          icon: '💬',
          hint: 'Callout/Note'
        }]
      }, {
        name: 'measure',
        title: 'Measure',
        tools: [{
          type: 'RangeTool',
          icon: '▭',
          hint: 'Price/Time Range'
        }]
      }]
    };
  },
  computed: {
    toolbarStyle: function toolbarStyle() {
      return {
        backgroundColor: this.night ? '#1e2224' : '#ffffff',
        borderColor: this.night ? '#363a45' : '#e1e4e8',
        color: this.night ? '#d1d4dc' : '#131722'
      };
    }
  },
  mounted: function mounted() {
    document.addEventListener('click', this.closeModsDropdown);
  },
  beforeDestroy: function beforeDestroy() {
    document.removeEventListener('click', this.closeModsDropdown);
  },
  methods: {
    selectTool: function selectTool(tool) {
      this.$emit('tool-select', {
        type: tool.type,
        settings: tool.settings || {}
      });
    },
    showMods: function showMods(e, tool) {
      if (!tool.mods) return;
      e.stopPropagation();
      this.currentMods = tool.mods;
      this.currentToolForMods = tool;
      this.showModsDropdown = true; // Position dropdown

      var rect = e.target.getBoundingClientRect();
      this.modsPosition = {
        x: rect.right + 5,
        y: rect.top
      };
    },
    selectMod: function selectMod(mod) {
      var tool = this.currentToolForMods;
      this.$emit('tool-select', {
        type: tool.type,
        settings: DrawingToolbarvue_type_script_lang_js_objectSpread(DrawingToolbarvue_type_script_lang_js_objectSpread({}, tool.settings), mod.settings)
      });
      this.showModsDropdown = false;
    },
    closeModsDropdown: function closeModsDropdown(e) {
      if (!e.target.closest('.mods-dropdown') && !e.target.closest('.tool-arrow')) {
        this.showModsDropdown = false;
      }
    },
    setColor: function setColor(color) {
      this.$emit('color-change', color);
    },
    setWidth: function setWidth(width) {
      this.$emit('width-change', parseInt(width));
    }
  }
});
;// CONCATENATED MODULE: ./src/components/DrawingToolbar.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_DrawingToolbarvue_type_script_lang_js_ = (DrawingToolbarvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/DrawingToolbar.vue?vue&type=style&index=0&id=6545392d&scoped=true&lang=css&
var DrawingToolbarvue_type_style_index_0_id_6545392d_scoped_true_lang_css_ = __webpack_require__(2670);
;// CONCATENATED MODULE: ./src/components/DrawingToolbar.vue?vue&type=style&index=0&id=6545392d&scoped=true&lang=css&

;// CONCATENATED MODULE: ./src/components/DrawingToolbar.vue



;


/* normalize component */

var DrawingToolbar_component = normalizeComponent(
  components_DrawingToolbarvue_type_script_lang_js_,
  DrawingToolbarvue_type_template_id_6545392d_scoped_true_render,
  DrawingToolbarvue_type_template_id_6545392d_scoped_true_staticRenderFns,
  false,
  null,
  "6545392d",
  null
  
)

/* hot reload */
if (false) { var DrawingToolbar_api; }
DrawingToolbar_component.options.__file = "src/components/DrawingToolbar.vue"
/* harmony default export */ const DrawingToolbar = (DrawingToolbar_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/BrushTool.vue?vue&type=script&lang=js&
function BrushToolvue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = BrushToolvue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function BrushToolvue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return BrushToolvue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return BrushToolvue_type_script_lang_js_arrayLikeToArray(o, minLen); }

function BrushToolvue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// BrushTool.vue - Freehand drawing brush tool
// Allows drawing freeform paths on the chart



/* harmony default export */ const BrushToolvue_type_script_lang_js_ = ({
  name: 'BrushTool',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'TradingVue',
        version: '1.0.0'
      };
    },
    tool: function tool() {
      return {
        group: 'Drawing',
        icon: '🖌',
        type: 'Brush',
        hint: 'Freehand brush drawing',
        data: [],
        settings: {
          color: '#2962ff',
          lineWidth: 3,
          lineStyle: 'solid'
        }
      };
    },
    init: function init() {
      var _this = this;

      // Create initial pin at mouse position
      this.pins.push(new Pin(this, 'p1', {
        state: 'tracking'
      })); // Initialize points array if not exists

      if (!this.sett.points) {
        this.sett.points = [];
      } // Track mouse movement for drawing


      this.mouse.on('mousemove', function (e) {
        if (_this.state === 'tracking' || _this.state === 'drawing') {
          _this.addPoint();
        }
      }); // Settle on click

      this.pins[0].on('settled', function () {
        _this.set_state('finished');

        _this.$emit('drawing-mode-off');
      });
    },
    addPoint: function addPoint() {
      var cursor = this.$props.cursor;

      if (cursor && cursor.t !== undefined && cursor.y$ !== undefined) {
        if (!this.sett.points) this.sett.points = []; // Only add point if it's different from last

        var lastPoint = this.sett.points[this.sett.points.length - 1];
        var newPoint = [cursor.t, cursor.y$];

        if (!lastPoint || Math.abs(lastPoint[0] - newPoint[0]) > 0.001 || Math.abs(lastPoint[1] - newPoint[1]) > 0.0001) {
          this.sett.points.push(newPoint);
          this.pins[0].re_init();
        }
      }
    },
    draw: function draw(ctx) {
      var points = this.sett.points || [];
      if (points.length < 2) return;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round'; // Set line style

      if (this.sett.lineStyle === 'dashed') {
        ctx.setLineDash([10, 5]);
      } else if (this.sett.lineStyle === 'dotted') {
        ctx.setLineDash([3, 3]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.beginPath(); // Draw smooth path through all points

      var layout = this.$props.layout;
      var firstPoint = true;

      var _iterator = BrushToolvue_type_script_lang_js_createForOfIteratorHelper(points),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var point = _step.value;
          var x = layout.t2screen(point[0]);
          var y = layout.$2screen(point[1]);

          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      ctx.stroke();
      ctx.setLineDash([]);
      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['BrushTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 3;
    },
    color: function color() {
      return this.sett.color || '#2962ff';
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/BrushTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_BrushToolvue_type_script_lang_js_ = (BrushToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/BrushTool.vue
var BrushTool_render, BrushTool_staticRenderFns
;



/* normalize component */
;
var BrushTool_component = normalizeComponent(
  overlays_BrushToolvue_type_script_lang_js_,
  BrushTool_render,
  BrushTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var BrushTool_api; }
BrushTool_component.options.__file = "src/components/overlays/BrushTool.vue"
/* harmony default export */ const BrushTool = (BrushTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/HorizontalLine.vue?vue&type=script&lang=js&
// HorizontalLine - Horizontal line tool



/* harmony default export */ const HorizontalLinevue_type_script_lang_js_ = ({
  name: 'HorizontalLine',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'TradingVue',
        version: '1.0.0'
      };
    },
    tool: function tool() {
      return {
        group: 'Lines',
        icon: '─',
        type: 'HorizontalLine',
        hint: 'Horizontal Line',
        data: [],
        settings: {}
      };
    },
    init: function init() {
      var _this = this;

      this.pins.push(new Pin(this, 'p1', {
        state: 'tracking'
      }));
      this.pins[0].on('settled', function () {
        _this.set_state('finished');

        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1) return;
      var layout = this.$props.layout;
      var y = layout.$2screen(this.p1[1]);
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.setLineDash(this.dashed ? [5, 5] : []);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(layout.width, y);
      ctx.stroke();
      ctx.setLineDash([]); // Draw price label

      var price = this.p1[1].toFixed(this.prec);
      ctx.fillStyle = this.color;
      ctx.font = '11px ' + this.$props.font.split('px').pop();
      var textWidth = ctx.measureText(price).width + 10;
      ctx.fillRect(layout.width - textWidth, y - 10, textWidth, 20);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'right';
      ctx.fillText(price, layout.width - 5, y + 4);
      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['HorizontalLine'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 1.5;
    },
    color: function color() {
      return this.sett.color || '#2962ff';
    },
    dashed: function dashed() {
      return this.sett.dashed || false;
    },
    prec: function prec() {
      return this.sett.precision || 2;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/HorizontalLine.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_HorizontalLinevue_type_script_lang_js_ = (HorizontalLinevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/HorizontalLine.vue
var HorizontalLine_render, HorizontalLine_staticRenderFns
;



/* normalize component */
;
var HorizontalLine_component = normalizeComponent(
  overlays_HorizontalLinevue_type_script_lang_js_,
  HorizontalLine_render,
  HorizontalLine_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var HorizontalLine_api; }
HorizontalLine_component.options.__file = "src/components/overlays/HorizontalLine.vue"
/* harmony default export */ const HorizontalLine = (HorizontalLine_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/VerticalLine.vue?vue&type=script&lang=js&
// VerticalLine - Vertical line tool



/* harmony default export */ const VerticalLinevue_type_script_lang_js_ = ({
  name: 'VerticalLine',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'TradingVue',
        version: '1.0.0'
      };
    },
    tool: function tool() {
      return {
        group: 'Lines',
        icon: '│',
        type: 'VerticalLine',
        hint: 'Vertical Line',
        data: [],
        settings: {}
      };
    },
    init: function init() {
      var _this = this;

      this.pins.push(new Pin(this, 'p1', {
        state: 'tracking'
      }));
      this.pins[0].on('settled', function () {
        _this.set_state('finished');

        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1) return;
      var layout = this.$props.layout;
      var x = layout.t2screen(this.p1[0]);
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.setLineDash(this.dashed ? [5, 5] : []);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, layout.height);
      ctx.stroke();
      ctx.setLineDash([]); // Draw time label

      var time = this.formatTime(this.p1[0]);
      ctx.fillStyle = this.color;
      ctx.font = '10px ' + this.$props.font.split('px').pop();
      ctx.save();
      ctx.translate(x, layout.height - 5);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(time, 0, 0);
      ctx.restore();
      this.render_pins(ctx);
    },
    formatTime: function formatTime(t) {
      var date = new Date(t);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    use_for: function use_for() {
      return ['VerticalLine'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 1.5;
    },
    color: function color() {
      return this.sett.color || '#2962ff';
    },
    dashed: function dashed() {
      return this.sett.dashed || false;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/VerticalLine.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_VerticalLinevue_type_script_lang_js_ = (VerticalLinevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/VerticalLine.vue
var VerticalLine_render, VerticalLine_staticRenderFns
;



/* normalize component */
;
var VerticalLine_component = normalizeComponent(
  overlays_VerticalLinevue_type_script_lang_js_,
  VerticalLine_render,
  VerticalLine_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var VerticalLine_api; }
VerticalLine_component.options.__file = "src/components/overlays/VerticalLine.vue"
/* harmony default export */ const VerticalLine = (VerticalLine_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/RectangleTool.vue?vue&type=script&lang=js&
// RectangleTool - Rectangle shape tool



/* harmony default export */ const RectangleToolvue_type_script_lang_js_ = ({
  name: 'RectangleTool',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'TradingVue',
        version: '1.0.0'
      };
    },
    tool: function tool() {
      return {
        group: 'Shapes',
        icon: '▢',
        type: 'RectangleTool',
        hint: 'Rectangle',
        data: [],
        settings: {},
        mods: {
          'Filled': {
            icon: '▮',
            settings: {
              filled: true
            }
          },
          'With Text': {
            icon: '▣',
            settings: {
              withText: true
            }
          }
        }
      };
    },
    init: function init() {
      var _this = this;

      this.pins.push(new Pin(this, 'p1', {
        state: 'settled'
      }));
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking'
      }));
      this.pins[1].on('settled', function () {
        _this.set_state('finished');

        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      var layout = this.$props.layout;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]);
      var left = Math.min(x1, x2);
      var top = Math.min(y1, y2);
      var width = Math.abs(x2 - x1);
      var height = Math.abs(y2 - y1);
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color; // Fill or stroke

      if (this.filled) {
        ctx.fillStyle = this.fill_color;
        ctx.fillRect(left, top, width, height);
      }

      ctx.strokeRect(left, top, width, height); // Draw text if enabled

      if (this.withText && this.text) {
        ctx.fillStyle = this.color;
        ctx.font = "".concat(this.font_size, "px ").concat(this.$props.font.split('px').pop());
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, left + width / 2, top + height / 2);
      }

      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['RectangleTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 1.5;
    },
    color: function color() {
      return this.sett.color || '#2962ff';
    },
    filled: function filled() {
      return this.sett.filled || false;
    },
    fill_color: function fill_color() {
      return this.sett.fillColor || this.color + '33';
    },
    withText: function withText() {
      return this.sett.withText || false;
    },
    text: function text() {
      return this.sett.text || '';
    },
    font_size: function font_size() {
      return this.sett.fontSize || 14;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/RectangleTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_RectangleToolvue_type_script_lang_js_ = (RectangleToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/RectangleTool.vue
var RectangleTool_render, RectangleTool_staticRenderFns
;



/* normalize component */
;
var RectangleTool_component = normalizeComponent(
  overlays_RectangleToolvue_type_script_lang_js_,
  RectangleTool_render,
  RectangleTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var RectangleTool_api; }
RectangleTool_component.options.__file = "src/components/overlays/RectangleTool.vue"
/* harmony default export */ const RectangleTool = (RectangleTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/CircleTool.vue?vue&type=script&lang=js&
// CircleTool - Circle/Ellipse shape tool



/* harmony default export */ const CircleToolvue_type_script_lang_js_ = ({
  name: 'CircleTool',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'TradingVue',
        version: '1.0.0'
      };
    },
    tool: function tool() {
      return {
        group: 'Shapes',
        icon: '○',
        type: 'CircleTool',
        hint: 'Circle/Ellipse',
        data: [],
        settings: {},
        mods: {
          'Filled': {
            icon: '●',
            settings: {
              filled: true
            }
          },
          'With Text': {
            icon: '◉',
            settings: {
              withText: true
            }
          }
        }
      };
    },
    init: function init() {
      var _this = this;

      this.pins.push(new Pin(this, 'p1', {
        state: 'settled'
      }));
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking'
      }));
      this.pins[1].on('settled', function () {
        _this.set_state('finished');

        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      var layout = this.$props.layout;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]); // Center and radius

      var cx = (x1 + x2) / 2;
      var cy = (y1 + y2) / 2;
      var rx = Math.abs(x2 - x1) / 2;
      var ry = Math.abs(y2 - y1) / 2;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); // Fill or stroke

      if (this.filled) {
        ctx.fillStyle = this.fill_color;
        ctx.fill();
      }

      ctx.stroke(); // Draw text if enabled

      if (this.withText && this.text) {
        ctx.fillStyle = this.color;
        ctx.font = "".concat(this.font_size, "px ").concat(this.$props.font.split('px').pop());
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, cx, cy);
      }

      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['CircleTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 1.5;
    },
    color: function color() {
      return this.sett.color || '#2962ff';
    },
    filled: function filled() {
      return this.sett.filled || false;
    },
    fill_color: function fill_color() {
      return this.sett.fillColor || this.color + '33';
    },
    withText: function withText() {
      return this.sett.withText || false;
    },
    text: function text() {
      return this.sett.text || '';
    },
    font_size: function font_size() {
      return this.sett.fontSize || 14;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/CircleTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_CircleToolvue_type_script_lang_js_ = (CircleToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/CircleTool.vue
var CircleTool_render, CircleTool_staticRenderFns
;



/* normalize component */
;
var CircleTool_component = normalizeComponent(
  overlays_CircleToolvue_type_script_lang_js_,
  CircleTool_render,
  CircleTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var CircleTool_api; }
CircleTool_component.options.__file = "src/components/overlays/CircleTool.vue"
/* harmony default export */ const CircleTool = (CircleTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/TriangleTool.vue?vue&type=script&lang=js&
// TriangleTool - Triangle shape tool



/* harmony default export */ const TriangleToolvue_type_script_lang_js_ = ({
  name: 'TriangleTool',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'TradingVue',
        version: '1.0.0'
      };
    },
    tool: function tool() {
      return {
        group: 'Shapes',
        icon: '△',
        type: 'TriangleTool',
        hint: 'Triangle',
        data: [],
        settings: {},
        mods: {
          'Filled': {
            icon: '▲',
            settings: {
              filled: true
            }
          }
        }
      };
    },
    init: function init() {
      var _this = this;

      this.pins.push(new Pin(this, 'p1', {
        state: 'settled'
      }));
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking'
      }));
      this.pins[1].on('settled', function () {
        _this.set_state('finished');

        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      var layout = this.$props.layout;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]); // Calculate triangle vertices

      var midX = (x1 + x2) / 2;
      var minY = Math.min(y1, y2);
      var maxY = Math.max(y1, y2); // Top, bottom-left, bottom-right

      var points = [[midX, minY], [x1, maxY], [x2, maxY]];
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      ctx.lineTo(points[1][0], points[1][1]);
      ctx.lineTo(points[2][0], points[2][1]);
      ctx.closePath();

      if (this.filled) {
        ctx.fillStyle = this.fill_color;
        ctx.fill();
      }

      ctx.stroke();
      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['TriangleTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 1.5;
    },
    color: function color() {
      return this.sett.color || '#2962ff';
    },
    filled: function filled() {
      return this.sett.filled || false;
    },
    fill_color: function fill_color() {
      return this.sett.fillColor || this.color + '33';
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/TriangleTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_TriangleToolvue_type_script_lang_js_ = (TriangleToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/TriangleTool.vue
var TriangleTool_render, TriangleTool_staticRenderFns
;



/* normalize component */
;
var TriangleTool_component = normalizeComponent(
  overlays_TriangleToolvue_type_script_lang_js_,
  TriangleTool_render,
  TriangleTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var TriangleTool_api; }
TriangleTool_component.options.__file = "src/components/overlays/TriangleTool.vue"
/* harmony default export */ const TriangleTool = (TriangleTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/TextTool.vue?vue&type=script&lang=js&
// TextTool.vue - Text annotation tool
// Places text labels on the chart



/* harmony default export */ const TextToolvue_type_script_lang_js_ = ({
  name: 'TextTool',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'TradingVue',
        version: '1.0.0'
      };
    },
    tool: function tool() {
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
      };
    },
    init: function init() {
      var _this = this;

      this.pins.push(new Pin(this, 'p1', {
        state: 'tracking'
      }));
      this.pins[0].on('settled', function () {
        // Prompt for text
        var text = prompt('Enter text:', _this.sett.text || 'Text');

        if (text) {
          _this.sett.text = text;
        }

        _this.set_state('finished');

        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1) return;
      var layout = this.$props.layout;
      var x = layout.t2screen(this.p1[0]);
      var y = layout.$2screen(this.p1[1]);
      var text = this.sett.text || 'Text';
      var fontSize = this.sett.fontSize || 14;
      var fontWeight = this.sett.bold ? 'bold' : 'normal';
      ctx.font = "".concat(fontWeight, " ").concat(fontSize, "px ").concat(this.sett.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif');
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      var metrics = ctx.measureText(text);
      var textWidth = metrics.width;
      var textHeight = fontSize; // Background

      if (this.sett.backgroundColor && this.sett.backgroundColor !== 'transparent') {
        ctx.fillStyle = this.sett.backgroundColor;
        ctx.fillRect(x - 4, y - textHeight / 2 - 2, textWidth + 8, textHeight + 4);
      } // Text


      ctx.fillStyle = this.color;
      ctx.fillText(text, x, y); // Collision area

      this.collisions.push(function (x, y) {
        return x >= x && x <= x + textWidth && y >= y - textHeight / 2 && y <= y + textHeight / 2;
      });
      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['TextTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    color: function color() {
      return this.sett.color || '#ffffff';
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/TextTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_TextToolvue_type_script_lang_js_ = (TextToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/TextTool.vue
var TextTool_render, TextTool_staticRenderFns
;



/* normalize component */
;
var TextTool_component = normalizeComponent(
  overlays_TextToolvue_type_script_lang_js_,
  TextTool_render,
  TextTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var TextTool_api; }
TextTool_component.options.__file = "src/components/overlays/TextTool.vue"
/* harmony default export */ const TextTool = (TextTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/ArrowTool.vue?vue&type=script&lang=js&
// ArrowTool - Arrow drawing tool



/* harmony default export */ const ArrowToolvue_type_script_lang_js_ = ({
  name: 'ArrowTool',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'TradingVue',
        version: '1.0.0'
      };
    },
    tool: function tool() {
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
            settings: {
              "double": true
            }
          }
        }
      };
    },
    init: function init() {
      var _this = this;

      this.pins.push(new Pin(this, 'p1', {
        state: 'settled'
      }));
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking'
      }));
      this.pins[1].on('settled', function () {
        _this.set_state('finished');

        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      var layout = this.$props.layout;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]);
      var angle = Math.atan2(y2 - y1, x2 - x1);
      var headLen = this.head_length;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.lineCap = 'round'; // Draw line

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke(); // Draw arrowhead at end

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
      ctx.stroke(); // Draw arrowhead at start if double

      if (this["double"]) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + headLen * Math.cos(angle - Math.PI / 6), y1 + headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + headLen * Math.cos(angle + Math.PI / 6), y1 + headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }

      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['ArrowTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 2;
    },
    color: function color() {
      return this.sett.color || '#2962ff';
    },
    head_length: function head_length() {
      return this.sett.headLength || 15;
    },
    "double": function double() {
      return this.sett["double"] || false;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/ArrowTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_ArrowToolvue_type_script_lang_js_ = (ArrowToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/ArrowTool.vue
var ArrowTool_render, ArrowTool_staticRenderFns
;



/* normalize component */
;
var ArrowTool_component = normalizeComponent(
  overlays_ArrowToolvue_type_script_lang_js_,
  ArrowTool_render,
  ArrowTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var ArrowTool_api; }
ArrowTool_component.options.__file = "src/components/overlays/ArrowTool.vue"
/* harmony default export */ const ArrowTool = (ArrowTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/CalloutTool.vue?vue&type=script&lang=js&
// CalloutTool - Callout/Note tool with speech bubble



/* harmony default export */ const CalloutToolvue_type_script_lang_js_ = ({
  name: 'CalloutTool',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'TradingVue',
        version: '1.0.0'
      };
    },
    tool: function tool() {
      return {
        group: 'Text',
        icon: '💬',
        type: 'CalloutTool',
        hint: 'Callout/Note',
        data: [],
        settings: {
          text: 'Note'
        }
      };
    },
    init: function init() {
      var _this = this;

      this.pins.push(new Pin(this, 'p1', {
        state: 'settled'
      }));
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking'
      }));
      this.pins[1].on('settled', function () {
        // Prompt for text
        var text = prompt('Enter note:', _this.text || 'Note');

        if (text) {
          _this.$emit('change-settings', {
            text: text
          });
        }

        _this.set_state('finished');

        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      var layout = this.$props.layout;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]); // Calculate bubble position

      var bubbleX = x2;
      var bubbleY = y2;
      var bubbleWidth = Math.max(80, this.text_width + 20);
      var bubbleHeight = 40; // Draw connecting line

      ctx.lineWidth = 1;
      ctx.strokeStyle = this.color;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(bubbleX, bubbleY);
      ctx.stroke();
      ctx.setLineDash([]); // Draw bubble

      ctx.fillStyle = this.bg_color;
      ctx.strokeStyle = this.color;
      var bx = bubbleX - bubbleWidth / 2;
      var by = bubbleY - bubbleHeight / 2;
      var radius = 8;
      ctx.beginPath();
      ctx.moveTo(bx + radius, by);
      ctx.lineTo(bx + bubbleWidth - radius, by);
      ctx.quadraticCurveTo(bx + bubbleWidth, by, bx + bubbleWidth, by + radius);
      ctx.lineTo(bx + bubbleWidth, by + bubbleHeight - radius);
      ctx.quadraticCurveTo(bx + bubbleWidth, by + bubbleHeight, bx + bubbleWidth - radius, by + bubbleHeight);
      ctx.lineTo(bx + radius, by + bubbleHeight);
      ctx.quadraticCurveTo(bx, by + bubbleHeight, bx, by + bubbleHeight - radius);
      ctx.lineTo(bx, by + radius);
      ctx.quadraticCurveTo(bx, by, bx + radius, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke(); // Draw text

      ctx.fillStyle = this.color;
      ctx.font = "".concat(this.font_size, "px ").concat(this.$props.font.split('px').pop());
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.text, bubbleX, bubbleY);
      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['CalloutTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    color: function color() {
      return this.sett.color || '#ffd600';
    },
    text: function text() {
      return this.sett.text || 'Note';
    },
    font_size: function font_size() {
      return this.sett.fontSize || 12;
    },
    bg_color: function bg_color() {
      return this.sett.bgColor || '#1e2224';
    },
    text_width: function text_width() {
      // Estimate text width
      return this.text.length * this.font_size * 0.6;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/CalloutTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_CalloutToolvue_type_script_lang_js_ = (CalloutToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/CalloutTool.vue
var CalloutTool_render, CalloutTool_staticRenderFns
;



/* normalize component */
;
var CalloutTool_component = normalizeComponent(
  overlays_CalloutToolvue_type_script_lang_js_,
  CalloutTool_render,
  CalloutTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var CalloutTool_api; }
CalloutTool_component.options.__file = "src/components/overlays/CalloutTool.vue"
/* harmony default export */ const CalloutTool = (CalloutTool_component.exports);
;// CONCATENATED MODULE: ./src/index.js
























 // Drawing Tools











var primitives = {
  Candle: CandleExt,
  Volbar: VolbarExt,
  Line: Line,
  Pin: Pin,
  Price: Price,
  Ray: Ray,
  Seg: Seg
};
var drawingTools = {
  BrushTool: BrushTool,
  HorizontalLine: HorizontalLine,
  VerticalLine: VerticalLine,
  RectangleTool: RectangleTool,
  CircleTool: CircleTool,
  TriangleTool: TriangleTool,
  TextTool: TextTool,
  ArrowTool: ArrowTool,
  CalloutTool: CalloutTool
};

TradingVue.install = function (Vue) {
  Vue.component(TradingVue.name, TradingVue);
  Vue.component('TFSelector', TFSelector);
  Vue.component('TFSelectorDropdown', TFSelectorDropdown);
  Vue.component('IndicatorSettings', IndicatorSettings);
  Vue.component('ExchangeSettings', ExchangeSettings);
  Vue.component('ExchangeManager', components_ExchangeManager);
  Vue.component('WatchlistPanel', WatchlistPanel);
  Vue.component('DrawingToolbar', DrawingToolbar); // Register drawing tools

  Object.entries(drawingTools).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        name = _ref2[0],
        component = _ref2[1];

    Vue.component(name, component);
  });
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(TradingVue);
  window.TradingVueLib = {
    TradingVue: TradingVue,
    Overlay: overlay,
    Utils: utils,
    Constants: constants,
    Candle: CandleExt,
    Volbar: VolbarExt,
    layout_cnv: layout_cnv,
    layout_vol: layout_vol,
    DataCube: DataCube,
    Tool: tool,
    Interface: mixins_interface,
    primitives: primitives,
    TFSelector: TFSelector,
    TFSelectorDropdown: TFSelectorDropdown,
    DataProvider: DataProvider,
    IndicatorManager: IndicatorManager,
    ExchangeManager: ExchangeManager,
    IndicatorSettings: IndicatorSettings,
    ExchangeSettings: ExchangeSettings,
    ExchangeManagerComponent: components_ExchangeManager,
    WatchlistPanel: WatchlistPanel,
    DrawingToolbar: DrawingToolbar,
    drawingTools: drawingTools
  };
}

/* harmony default export */ const src = (TradingVue);


/***/ }),

/***/ 6418:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n/* Anit-boostrap tactix */\n.trading-vue *, ::after, ::before {\n    box-sizing: content-box;\n}\n.trading-vue img {\n    vertical-align: initial;\n}\n/* Main container layout */\n.trading-vue {\n    display: flex;\n}\n.tvjs-main-container {\n    position: relative;\n    flex-shrink: 0;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 3976:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-botbar {\n    position: relative !important;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 2449:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn-grp {\n    margin-left: 0.5em;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 7775:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.drawing-toolbar[data-v-6545392d] {\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n    padding: 8px;\n    background: #1e2224;\n    border: 1px solid #363a45;\n    border-radius: 6px;\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n    font-size: 12px;\n}\n.drawing-toolbar.is-vertical[data-v-6545392d] {\n    flex-direction: column;\n}\n.tool-group[data-v-6545392d] {\n    display: flex;\n    flex-direction: column;\n    gap: 4px;\n}\n.group-title[data-v-6545392d] {\n    color: #787b86;\n    font-size: 10px;\n    text-transform: uppercase;\n    padding: 4px 8px;\n}\n.tools-row[data-v-6545392d] {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 2px;\n}\n.tool-btn[data-v-6545392d] {\n    position: relative;\n    width: 32px;\n    height: 32px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: transparent;\n    border: 1px solid transparent;\n    border-radius: 4px;\n    color: #d1d4dc;\n    cursor: pointer;\n    transition: all 0.15s;\n}\n.tool-btn[data-v-6545392d]:hover {\n    background: #2a2e39;\n}\n.tool-btn.is-active[data-v-6545392d] {\n    background: #2962ff;\n    color: #fff;\n}\n.tool-btn.is-selected[data-v-6545392d] {\n    border-color: #ffd600;\n}\n.tool-icon[data-v-6545392d] {\n    font-size: 16px;\n    line-height: 1;\n}\n.tool-arrow[data-v-6545392d] {\n    position: absolute;\n    bottom: 2px;\n    right: 2px;\n    font-size: 8px;\n    color: #787b86;\n}\n.color-section[data-v-6545392d] {\n    padding-top: 8px;\n    border-top: 1px solid #363a45;\n}\n.color-grid[data-v-6545392d] {\n    display: grid;\n    grid-template-columns: repeat(6, 1fr);\n    gap: 2px;\n    padding: 4px;\n}\n.color-btn[data-v-6545392d] {\n    width: 20px;\n    height: 20px;\n    border: 2px solid transparent;\n    border-radius: 4px;\n    cursor: pointer;\n    transition: transform 0.15s;\n}\n.color-btn[data-v-6545392d]:hover {\n    transform: scale(1.1);\n}\n.color-btn.is-active[data-v-6545392d] {\n    border-color: #fff;\n}\n.custom-color[data-v-6545392d] {\n    width: 100%;\n    height: 24px;\n    margin-top: 4px;\n    border: 1px solid #363a45;\n    border-radius: 4px;\n    cursor: pointer;\n}\n.width-section[data-v-6545392d] {\n    padding-top: 8px;\n    border-top: 1px solid #363a45;\n}\n.width-section input[type=\"range\"][data-v-6545392d] {\n    width: 100%;\n    accent-color: #2962ff;\n}\n.actions-section[data-v-6545392d] {\n    display: flex;\n    gap: 4px;\n    padding-top: 8px;\n    border-top: 1px solid #363a45;\n}\n.action-btn[data-v-6545392d] {\n    flex: 1;\n    height: 28px;\n    background: #2a2e39;\n    border: 1px solid #363a45;\n    border-radius: 4px;\n    color: #d1d4dc;\n    cursor: pointer;\n    transition: all 0.15s;\n}\n.action-btn[data-v-6545392d]:hover {\n    background: #363a45;\n}\n.mods-dropdown[data-v-6545392d] {\n    position: fixed;\n    background: #1e2224;\n    border: 1px solid #363a45;\n    border-radius: 6px;\n    padding: 4px;\n    min-width: 120px;\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n    z-index: 10000;\n}\n.mod-btn[data-v-6545392d] {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    width: 100%;\n    padding: 8px 12px;\n    background: transparent;\n    border: none;\n    border-radius: 4px;\n    color: #d1d4dc;\n    cursor: pointer;\n    text-align: left;\n}\n.mod-btn[data-v-6545392d]:hover {\n    background: #2a2e39;\n}\n.mod-icon[data-v-6545392d] {\n    font-size: 14px;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 1524:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-exchange-manager[data-v-d9709dec] {\n    background: #1e2224;\n    border-radius: 8px;\n    padding: 16px;\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n    color: #d1d4dc;\n}\n.manager-header[data-v-d9709dec] {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 16px;\n}\n.manager-header h3[data-v-d9709dec] {\n    margin: 0;\n    font-size: 16px;\n    font-weight: 500;\n}\n.btn-add[data-v-d9709dec] {\n    padding: 8px 16px;\n    background: #2962ff;\n    border: none;\n    border-radius: 4px;\n    color: #fff;\n    font-size: 13px;\n    font-weight: 500;\n    cursor: pointer;\n    transition: background 0.15s;\n}\n.btn-add[data-v-d9709dec]:hover {\n    background: #1e53e4;\n}\n.exchange-list[data-v-d9709dec] {\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n}\n.exchange-item[data-v-d9709dec] {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 12px;\n    background: #2a2e39;\n    border-radius: 6px;\n    border: 1px solid transparent;\n    transition: border-color 0.15s;\n}\n.exchange-item.is-default[data-v-d9709dec] {\n    border-color: #2962ff;\n}\n.exchange-main[data-v-d9709dec] {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n}\n.exchange-icon[data-v-d9709dec] {\n    width: 36px;\n    height: 36px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: #1e2224;\n    border-radius: 50%;\n    font-size: 18px;\n}\n.exchange-info[data-v-d9709dec] {\n    display: flex;\n    flex-direction: column;\n    gap: 4px;\n}\n.exchange-name[data-v-d9709dec] {\n    font-size: 14px;\n    font-weight: 500;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n}\n.default-badge[data-v-d9709dec] {\n    padding: 2px 6px;\n    background: #2962ff;\n    border-radius: 3px;\n    font-size: 9px;\n    font-weight: 600;\n    letter-spacing: 0.5px;\n}\n.exchange-status[data-v-d9709dec] {\n    display: flex;\n    gap: 12px;\n    font-size: 11px;\n}\n.status-enabled[data-v-d9709dec] {\n    color: #00c853;\n}\n.status-disabled[data-v-d9709dec] {\n    color: #787b86;\n}\n.has-key[data-v-d9709dec] {\n    color: #ffd600;\n}\n.exchange-actions[data-v-d9709dec] {\n    display: flex;\n    gap: 4px;\n}\n.btn-action[data-v-d9709dec] {\n    width: 32px;\n    height: 32px;\n    background: transparent;\n    border: none;\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 14px;\n    transition: background 0.15s;\n}\n.btn-action[data-v-d9709dec]:hover {\n    background: #363a45;\n}\n.btn-action.btn-remove[data-v-d9709dec]:hover {\n    background: rgba(255, 82, 82, 0.2);\n}\n.no-exchanges[data-v-d9709dec] {\n    padding: 24px;\n    text-align: center;\n    color: #787b86;\n    font-size: 13px;\n}\n.manager-actions[data-v-d9709dec] {\n    display: flex;\n    gap: 8px;\n    margin-top: 16px;\n    padding-top: 16px;\n    border-top: 1px solid #363a45;\n}\n.btn-secondary[data-v-d9709dec] {\n    flex: 1;\n    padding: 10px;\n    background: #2a2e39;\n    border: 1px solid #363a45;\n    border-radius: 4px;\n    color: #d1d4dc;\n    font-size: 12px;\n    cursor: pointer;\n    transition: all 0.15s;\n}\n.btn-secondary[data-v-d9709dec]:hover {\n    background: #363a45;\n    border-color: #4c525e;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 6046:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-modal-overlay[data-v-a20e7ed4] {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background: rgba(0, 0, 0, 0.5);\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    z-index: 10000;\n}\n.tvjs-modal[data-v-a20e7ed4] {\n    background: #1e2224;\n    border-radius: 8px;\n    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n    color: #d1d4dc;\n    min-width: 400px;\n    max-width: 500px;\n}\n.modal-header[data-v-a20e7ed4] {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 16px 20px;\n    border-bottom: 1px solid #363a45;\n}\n.modal-header h3[data-v-a20e7ed4] {\n    margin: 0;\n    font-size: 16px;\n    font-weight: 500;\n}\n.btn-close[data-v-a20e7ed4] {\n    background: transparent;\n    border: none;\n    color: #787b86;\n    font-size: 24px;\n    cursor: pointer;\n    padding: 0;\n    line-height: 1;\n}\n.btn-close[data-v-a20e7ed4]:hover {\n    color: #fff;\n}\n.modal-body[data-v-a20e7ed4] {\n    padding: 20px;\n}\n.form-section[data-v-a20e7ed4] {\n    margin-top: 20px;\n    padding-top: 20px;\n    border-top: 1px solid #363a45;\n}\n.form-section h4[data-v-a20e7ed4] {\n    margin: 0 0 16px 0;\n    font-size: 12px;\n    font-weight: 600;\n    color: #787b86;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n}\n.form-group[data-v-a20e7ed4] {\n    margin-bottom: 16px;\n}\n.form-group label[data-v-a20e7ed4] {\n    display: block;\n    margin-bottom: 6px;\n    font-size: 13px;\n    color: #d1d4dc;\n}\n.form-group input[type=\"text\"][data-v-a20e7ed4],\n.form-group input[type=\"password\"][data-v-a20e7ed4],\n.form-group select[data-v-a20e7ed4] {\n    width: 100%;\n    padding: 10px 12px;\n    background: #2a2e39;\n    border: 1px solid #363a45;\n    border-radius: 4px;\n    color: #d1d4dc;\n    font-size: 13px;\n    box-sizing: border-box;\n}\n.form-group input[data-v-a20e7ed4]:focus,\n.form-group select[data-v-a20e7ed4]:focus {\n    border-color: #2962ff;\n    outline: none;\n}\n.form-group select option[data-v-a20e7ed4] {\n    background: #1e2224;\n}\n.hint[data-v-a20e7ed4] {\n    display: block;\n    margin-top: 4px;\n    font-size: 11px;\n    color: #787b86;\n}\n.secret-input[data-v-a20e7ed4] {\n    display: flex;\n    gap: 8px;\n}\n.secret-input input[data-v-a20e7ed4] {\n    flex: 1;\n}\n.btn-toggle[data-v-a20e7ed4] {\n    padding: 8px 12px;\n    background: #363a45;\n    border: none;\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 14px;\n}\n.checkbox-group label[data-v-a20e7ed4] {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    cursor: pointer;\n}\n.checkbox-group input[type=\"checkbox\"][data-v-a20e7ed4] {\n    width: 16px;\n    height: 16px;\n    cursor: pointer;\n}\n.exchange-info[data-v-a20e7ed4] {\n    padding: 12px;\n    background: #2a2e39;\n    border-radius: 6px;\n    margin-bottom: 16px;\n}\n.info-badge[data-v-a20e7ed4] {\n    margin-bottom: 8px;\n}\n.badge-type[data-v-a20e7ed4] {\n    padding: 4px 8px;\n    background: #2962ff;\n    border-radius: 4px;\n    font-size: 11px;\n    font-weight: 500;\n    text-transform: uppercase;\n}\n.supported-tfs[data-v-a20e7ed4] {\n    font-size: 12px;\n    color: #787b86;\n}\n.supported-tfs .label[data-v-a20e7ed4] {\n    color: #d1d4dc;\n}\n.security-notice[data-v-a20e7ed4] {\n    display: flex;\n    gap: 12px;\n    padding: 12px;\n    background: rgba(255, 152, 0, 0.1);\n    border: 1px solid rgba(255, 152, 0, 0.3);\n    border-radius: 6px;\n    margin-top: 20px;\n}\n.notice-icon[data-v-a20e7ed4] {\n    font-size: 20px;\n}\n.notice-text[data-v-a20e7ed4] {\n    font-size: 12px;\n    color: #ffcc80;\n}\n.notice-text strong[data-v-a20e7ed4] {\n    color: #fff;\n}\n.modal-footer[data-v-a20e7ed4] {\n    display: flex;\n    gap: 10px;\n    justify-content: flex-end;\n    padding: 16px 20px;\n    border-top: 1px solid #363a45;\n}\n.btn[data-v-a20e7ed4] {\n    padding: 10px 20px;\n    border: none;\n    border-radius: 4px;\n    font-size: 13px;\n    font-weight: 500;\n    cursor: pointer;\n    transition: all 0.15s;\n}\n.btn[data-v-a20e7ed4]:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n}\n.btn-primary[data-v-a20e7ed4] {\n    background: #2962ff;\n    color: #fff;\n}\n.btn-primary[data-v-a20e7ed4]:hover:not(:disabled) {\n    background: #1e53e4;\n}\n.btn-secondary[data-v-a20e7ed4] {\n    background: #363a45;\n    color: #d1d4dc;\n}\n.btn-secondary[data-v-a20e7ed4]:hover:not(:disabled) {\n    background: #4c525e;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 1760:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-modal-overlay[data-v-61af135c] {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background: rgba(0, 0, 0, 0.5);\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    z-index: 10000;\n}\n.tvjs-modal[data-v-61af135c] {\n    background: #1e2224;\n    border-radius: 8px;\n    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n    color: #d1d4dc;\n    min-width: 320px;\n    max-width: 400px;\n}\n.modal-header[data-v-61af135c] {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 16px 20px;\n    border-bottom: 1px solid #363a45;\n}\n.modal-header h3[data-v-61af135c] {\n    margin: 0;\n    font-size: 16px;\n    font-weight: 500;\n}\n.btn-close[data-v-61af135c] {\n    background: transparent;\n    border: none;\n    color: #787b86;\n    font-size: 24px;\n    cursor: pointer;\n    padding: 0;\n    line-height: 1;\n}\n.btn-close[data-v-61af135c]:hover {\n    color: #fff;\n}\n.modal-body[data-v-61af135c] {\n    padding: 16px 20px;\n    max-height: 400px;\n    overflow-y: auto;\n}\n.settings-section[data-v-61af135c] {\n    margin-bottom: 20px;\n}\n.settings-section h4[data-v-61af135c] {\n    margin: 0 0 12px 0;\n    font-size: 12px;\n    font-weight: 600;\n    color: #787b86;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n}\n.param-row[data-v-61af135c] {\n    display: flex;\n    align-items: center;\n    margin-bottom: 12px;\n}\n.param-row label[data-v-61af135c] {\n    flex: 1;\n    font-size: 13px;\n    color: #d1d4dc;\n}\n.param-row input[type=\"number\"][data-v-61af135c],\n.param-row select[data-v-61af135c] {\n    width: 100px;\n    padding: 6px 10px;\n    background: #2a2e39;\n    border: 1px solid #363a45;\n    border-radius: 4px;\n    color: #d1d4dc;\n    font-size: 13px;\n}\n.param-row input[type=\"number\"][data-v-61af135c]:focus,\n.param-row select[data-v-61af135c]:focus {\n    border-color: #2962ff;\n    outline: none;\n}\n.param-row input[type=\"range\"][data-v-61af135c] {\n    width: 100px;\n    margin-right: 10px;\n}\n.range-value[data-v-61af135c] {\n    width: 40px;\n    text-align: right;\n    font-size: 12px;\n    color: #787b86;\n}\n.checkbox-row label[data-v-61af135c] {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    cursor: pointer;\n}\n.checkbox-row input[type=\"checkbox\"][data-v-61af135c] {\n    width: 16px;\n    height: 16px;\n    cursor: pointer;\n}\n.color-input-wrapper[data-v-61af135c] {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n}\n.color-preview[data-v-61af135c] {\n    width: 28px;\n    height: 28px;\n    border-radius: 4px;\n    cursor: pointer;\n    border: 2px solid #363a45;\n}\n.color-text-input[data-v-61af135c] {\n    width: 80px;\n    padding: 6px 10px;\n    background: #2a2e39;\n    border: 1px solid #363a45;\n    border-radius: 4px;\n    color: #d1d4dc;\n    font-size: 13px;\n    font-family: monospace;\n}\n.color-picker-dropdown[data-v-61af135c] {\n    position: absolute;\n    right: 20px;\n    background: #2a2e39;\n    border: 1px solid #363a45;\n    border-radius: 8px;\n    padding: 12px;\n    z-index: 100;\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n}\n.preset-colors[data-v-61af135c] {\n    display: grid;\n    grid-template-columns: repeat(4, 1fr);\n    gap: 6px;\n    margin-bottom: 10px;\n}\n.preset-color[data-v-61af135c] {\n    width: 28px;\n    height: 28px;\n    border-radius: 4px;\n    cursor: pointer;\n    transition: transform 0.1s;\n}\n.preset-color[data-v-61af135c]:hover {\n    transform: scale(1.1);\n}\n.custom-color[data-v-61af135c] {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    padding-top: 10px;\n    border-top: 1px solid #363a45;\n}\n.custom-color input[type=\"color\"][data-v-61af135c] {\n    width: 40px;\n    height: 28px;\n    border: none;\n    border-radius: 4px;\n    cursor: pointer;\n}\n.modal-footer[data-v-61af135c] {\n    display: flex;\n    gap: 10px;\n    justify-content: flex-end;\n    padding: 16px 20px;\n    border-top: 1px solid #363a45;\n}\n.btn[data-v-61af135c] {\n    padding: 8px 16px;\n    border: none;\n    border-radius: 4px;\n    font-size: 13px;\n    font-weight: 500;\n    cursor: pointer;\n    transition: all 0.15s;\n}\n.btn-primary[data-v-61af135c] {\n    background: #2962ff;\n    color: #fff;\n}\n.btn-primary[data-v-61af135c]:hover {\n    background: #1e53e4;\n}\n.btn-secondary[data-v-61af135c] {\n    background: #363a45;\n    color: #d1d4dc;\n}\n.btn-secondary[data-v-61af135c]:hover {\n    background: #4c525e;\n}\n.remove-icon[data-v-61af135c] {\n    margin-right: 4px;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 6108:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-item-list {\n    position: absolute;\n    user-select: none;\n    margin-top: -5px;\n}\n.tvjs-item-list-item {\n    display: flex;\n    align-items: center;\n    padding-right: 20px;\n    font-size: 1.15em;\n    letter-spacing: 0.05em;\n}\n.tvjs-item-list-item:hover {\n    background-color: #76878319;\n}\n.tvjs-item-list-item * {\n    position: relative !important;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 7988:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-legend {\n    position: relative;\n    z-index: 100;\n    font-size: 1.25em;\n    margin-left: 10px;\n    pointer-events: none;\n    text-align: left;\n    user-select: none;\n    font-weight: 300;\n}\n@media (min-resolution: 2x) {\n.trading-vue-legend {\n        font-weight: 400;\n}\n}\n.trading-vue-ohlcv {\n    pointer-events: none;\n    margin-bottom: 0.5em;\n}\n.t-vue-lspan {\n    font-variant-numeric: tabular-nums;\n    font-size: 0.95em;\n    color: #999999; /* TODO: move => params */\n    margin-left: 0.1em;\n    margin-right: 0.2em;\n}\n.t-vue-title {\n    margin-right: 0.25em;\n    font-size: 1.45em;\n}\n.t-vue-ind {\n    margin-left: 0.2em;\n    margin-bottom: 0.5em;\n    font-size: 1.0em;\n    margin-top: 0.3em;\n}\n.t-vue-ivalue {\n    margin-left: 0.5em;\n}\n.t-vue-unknown {\n    color: #999999; /* TODO: move => params */\n}\n.tvjs-appear-enter-active,\n.tvjs-appear-leave-active\n{\n    transition: all .25s ease;\n}\n.tvjs-appear-enter, .tvjs-appear-leave-to\n{\n    opacity: 0;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 8423:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn {\n    z-index: 100;\n    pointer-events: all;\n    cursor: pointer;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 661:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-section {\n    height: 0;\n    position: absolute;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 9168:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-spinner {\n    display: inline-block;\n    position: relative;\n    width: 20px;\n    height: 16px;\n    margin: -4px 0px -1px 0px;\n    opacity: 0.7;\n}\n.tvjs-spinner div {\n    position: absolute;\n    top: 8px;\n    width: 4px;\n    height: 4px;\n    border-radius: 50%;\n    animation-timing-function: cubic-bezier(1, 1, 1, 1);\n}\n.tvjs-spinner div:nth-child(1) {\n    left: 2px;\n    animation: tvjs-spinner1 0.6s infinite;\n    opacity: 0.9;\n}\n.tvjs-spinner div:nth-child(2) {\n    left: 2px;\n    animation: tvjs-spinner2 0.6s infinite;\n}\n.tvjs-spinner div:nth-child(3) {\n    left: 9px;\n    animation: tvjs-spinner2 0.6s infinite;\n}\n.tvjs-spinner div:nth-child(4) {\n    left: 16px;\n    animation: tvjs-spinner3 0.6s infinite;\n    opacity: 0.9;\n}\n@keyframes tvjs-spinner1 {\n0% {\n        transform: scale(0);\n}\n100% {\n        transform: scale(1);\n}\n}\n@keyframes tvjs-spinner3 {\n0% {\n        transform: scale(1);\n}\n100% {\n        transform: scale(0);\n}\n}\n@keyframes tvjs-spinner2 {\n0% {\n        transform: translate(0, 0);\n}\n100% {\n        transform: translate(7px, 0);\n}\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 8356:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-tf-selector[data-v-0ee703fe] {\n    position: absolute;\n    top: 10px;\n    right: 60px;\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px;\n    padding: 8px 12px;\n    background: #1e2224;\n    border-radius: 6px;\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;\n    font-size: 12px;\n    z-index: 100;\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n}\n.tvjs-tf-night[data-v-0ee703fe] {\n    background: #1e2224;\n    color: #d1d4dc;\n}\n.tvjs-tf-selector[data-v-0ee703fe]:not(.tvjs-tf-night) {\n    background: #ffffff;\n    color: #131722;\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n    border: 1px solid #e0e0e0;\n}\n.tf-group[data-v-0ee703fe] {\n    display: flex;\n    align-items: center;\n    gap: 4px;\n}\n.tf-group-label[data-v-0ee703fe] {\n    color: #787b86;\n    font-size: 10px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    margin-right: 4px;\n    user-select: none;\n}\n.tf-buttons[data-v-0ee703fe] {\n    display: flex;\n    gap: 2px;\n}\n.tf-btn[data-v-0ee703fe] {\n    min-width: 28px;\n    height: 26px;\n    padding: 0 8px;\n    border: none;\n    border-radius: 4px;\n    background: transparent;\n    color: #d1d4dc;\n    font-size: 12px;\n    font-weight: 500;\n    cursor: pointer;\n    transition: all 0.15s ease;\n    user-select: none;\n}\n.tvjs-tf-night .tf-btn[data-v-0ee703fe] {\n    color: #d1d4dc;\n}\n.tvjs-tf-selector:not(.tvjs-tf-night) .tf-btn[data-v-0ee703fe] {\n    color: #131722;\n}\n.tf-btn[data-v-0ee703fe]:hover {\n    background: #2a2e39;\n    color: #ffffff;\n}\n.tvjs-tf-selector:not(.tvjs-tf-night) .tf-btn[data-v-0ee703fe]:hover {\n    background: #f0f3fa;\n    color: #131722;\n}\n.tf-btn-active[data-v-0ee703fe] {\n    background: #2962ff !important;\n    color: #ffffff !important;\n}\n.tf-btn-active[data-v-0ee703fe]:hover {\n    background: #1e53e4 !important;\n}\n.tf-btn-hot[data-v-0ee703fe] {\n    position: relative;\n}\n\n/* Hotkey indicator (small dot) */\n.tf-btn-hot[data-v-0ee703fe]::after {\n    content: '';\n    position: absolute;\n    bottom: 2px;\n    right: 2px;\n    width: 3px;\n    height: 3px;\n    background: #787b86;\n    border-radius: 50%;\n}\n.tf-btn-active.tf-btn-hot[data-v-0ee703fe]::after {\n    background: rgba(255, 255, 255, 0.5);\n}\n\n/* Mobile responsive */\n@media only screen and (max-width: 768px) {\n.tvjs-tf-selector[data-v-0ee703fe] {\n        top: 50px;\n        right: 10px;\n        left: 10px;\n        justify-content: center;\n        padding: 6px 8px;\n}\n.tf-group-label[data-v-0ee703fe] {\n        display: none;\n}\n.tf-btn[data-v-0ee703fe] {\n        min-width: 32px;\n        height: 28px;\n        font-size: 11px;\n}\n}\n@media only screen and (max-width: 480px) {\n.tvjs-tf-selector[data-v-0ee703fe] {\n        flex-wrap: wrap;\n        gap: 4px;\n}\n.tf-group[data-v-0ee703fe] {\n        flex-wrap: wrap;\n}\n.tf-buttons[data-v-0ee703fe] {\n        flex-wrap: wrap;\n}\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 5764:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-tf-dropdown[data-v-3f5b2cb2] {\n    position: absolute;\n    top: 10px;\n    right: 60px;\n    z-index: 1000;\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;\n}\n.tf-dropdown-toggle[data-v-3f5b2cb2] {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    padding: 6px 12px;\n    background: #1e2224;\n    border: 1px solid #363a45;\n    border-radius: 4px;\n    color: #d1d4dc;\n    font-size: 13px;\n    font-weight: 500;\n    cursor: pointer;\n    transition: all 0.15s ease;\n}\n.tvjs-tf-night .tf-dropdown-toggle[data-v-3f5b2cb2] {\n    background: #1e2224;\n    border-color: #363a45;\n    color: #d1d4dc;\n}\n.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-dropdown-toggle[data-v-3f5b2cb2] {\n    background: #ffffff;\n    border-color: #e0e0e0;\n    color: #131722;\n}\n.tf-dropdown-toggle[data-v-3f5b2cb2]:hover {\n    border-color: #4c525e;\n}\n.tf-dropdown-open[data-v-3f5b2cb2] {\n    border-color: #2962ff !important;\n}\n.tf-current-label[data-v-3f5b2cb2] {\n    font-weight: 600;\n}\n.tf-arrow[data-v-3f5b2cb2] {\n    color: #787b86;\n    transition: transform 0.15s ease;\n}\n.tf-arrow-up[data-v-3f5b2cb2] {\n    transform: rotate(180deg);\n}\n.tf-dropdown-menu[data-v-3f5b2cb2] {\n    position: absolute;\n    top: calc(100% + 4px);\n    right: 0;\n    min-width: 320px;\n    padding: 12px;\n    background: #1e2224;\n    border: 1px solid #363a45;\n    border-radius: 6px;\n    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);\n}\n.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-dropdown-menu[data-v-3f5b2cb2] {\n    background: #ffffff;\n    border-color: #e0e0e0;\n    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);\n}\n\n/* Quick access row */\n.tf-quick-row[data-v-3f5b2cb2] {\n    display: flex;\n    gap: 4px;\n    flex-wrap: wrap;\n}\n.tf-quick-btn[data-v-3f5b2cb2] {\n    min-width: 36px;\n    height: 28px;\n    padding: 0 10px;\n    border: none;\n    border-radius: 4px;\n    background: #2a2e39;\n    color: #d1d4dc;\n    font-size: 12px;\n    font-weight: 500;\n    cursor: pointer;\n    transition: all 0.15s ease;\n}\n.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-quick-btn[data-v-3f5b2cb2] {\n    background: #f0f3fa;\n    color: #131722;\n}\n.tf-quick-btn[data-v-3f5b2cb2]:hover {\n    background: #363a45;\n    color: #ffffff;\n}\n.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-quick-btn[data-v-3f5b2cb2]:hover {\n    background: #e0e3eb;\n}\n.tf-btn-active[data-v-3f5b2cb2] {\n    background: #2962ff !important;\n    color: #ffffff !important;\n}\n.tf-btn-active[data-v-3f5b2cb2]:hover {\n    background: #1e53e4 !important;\n}\n\n/* Divider */\n.tf-divider[data-v-3f5b2cb2] {\n    height: 1px;\n    background: #363a45;\n    margin: 10px 0;\n}\n.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-divider[data-v-3f5b2cb2] {\n    background: #e0e0e0;\n}\n\n/* Section */\n.tf-section[data-v-3f5b2cb2] {\n    margin-bottom: 8px;\n}\n.tf-section-header[data-v-3f5b2cb2] {\n    font-size: 10px;\n    font-weight: 600;\n    color: #787b86;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    margin-bottom: 6px;\n}\n.tf-section-grid[data-v-3f5b2cb2] {\n    display: flex;\n    gap: 4px;\n    flex-wrap: wrap;\n}\n.tf-menu-btn[data-v-3f5b2cb2] {\n    min-width: 40px;\n    height: 26px;\n    padding: 0 8px;\n    border: none;\n    border-radius: 4px;\n    background: transparent;\n    color: #d1d4dc;\n    font-size: 12px;\n    font-weight: 500;\n    cursor: pointer;\n    transition: all 0.15s ease;\n}\n.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-menu-btn[data-v-3f5b2cb2] {\n    color: #131722;\n}\n.tf-menu-btn[data-v-3f5b2cb2]:hover {\n    background: #2a2e39;\n    color: #ffffff;\n}\n.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-menu-btn[data-v-3f5b2cb2]:hover {\n    background: #f0f3fa;\n}\n\n/* Custom input */\n.tf-custom[data-v-3f5b2cb2] {\n    display: flex;\n    gap: 6px;\n}\n.tf-custom-input[data-v-3f5b2cb2] {\n    flex: 1;\n    height: 28px;\n    padding: 0 10px;\n    background: #2a2e39;\n    border: 1px solid #363a45;\n    border-radius: 4px;\n    color: #d1d4dc;\n    font-size: 12px;\n    outline: none;\n    transition: border-color 0.15s ease;\n}\n.tvjs-tf-dropdown:not(.tvjs-tf-night) .tf-custom-input[data-v-3f5b2cb2] {\n    background: #f0f3fa;\n    border-color: #e0e0e0;\n    color: #131722;\n}\n.tf-custom-input[data-v-3f5b2cb2]::placeholder {\n    color: #787b86;\n}\n.tf-custom-input[data-v-3f5b2cb2]:focus {\n    border-color: #2962ff;\n}\n.tf-custom-apply[data-v-3f5b2cb2] {\n    height: 28px;\n    padding: 0 12px;\n    background: #2962ff;\n    border: none;\n    border-radius: 4px;\n    color: #ffffff;\n    font-size: 12px;\n    font-weight: 600;\n    cursor: pointer;\n    transition: background 0.15s ease;\n}\n.tf-custom-apply[data-v-3f5b2cb2]:hover {\n    background: #1e53e4;\n}\n\n/* Transitions */\n.tf-dropdown-enter-active[data-v-3f5b2cb2],\n.tf-dropdown-leave-active[data-v-3f5b2cb2] {\n    transition: all 0.15s ease;\n}\n.tf-dropdown-enter[data-v-3f5b2cb2],\n.tf-dropdown-leave-to[data-v-3f5b2cb2] {\n    opacity: 0;\n    transform: translateY(-8px);\n}\n\n/* Mobile */\n@media only screen and (max-width: 480px) {\n.tf-dropdown-menu[data-v-3f5b2cb2] {\n        position: fixed;\n        top: auto;\n        bottom: 0;\n        left: 0;\n        right: 0;\n        min-width: auto;\n        border-radius: 12px 12px 0 0;\n        max-height: 70vh;\n        overflow-y: auto;\n}\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 1029:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-drift-enter-active {\n    transition: all .3s ease;\n}\n.tvjs-drift-leave-active {\n    transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);\n}\n.tvjs-drift-enter, .tvjs-drift-leave-to\n{\n    transform: translateX(10px);\n    opacity: 0;\n}\n.tvjs-the-tip {\n    position: absolute;\n    width: 200px;\n    text-align: center;\n    z-index: 10001;\n    color: #ffffff;\n    font-size: 1.5em;\n    line-height: 1.15em;\n    padding: 10px;\n    border-radius: 3px;\n    right: 70px;\n    top: 10px;\n    text-shadow: 1px 1px black;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 3935:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-toolbar {\n    position: absolute;\n    border-right: 1px solid black;\n    z-index: 101;\n    padding-top: 3px;\n    user-select: none;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 5379:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-tbitem {\n}\n.trading-vue-tbitem:hover {\n    background-color: #76878319;\n}\n.trading-vue-tbitem-exp {\n    position: absolute;\n    right: -3px;\n    padding: 18.5px 5px;\n    font-stretch: extra-condensed;\n    transform: scaleX(0.6);\n    font-size: 0.6em;\n    opacity: 0.0;\n    user-select: none;\n    line-height: 0;\n}\n.trading-vue-tbitem:hover\n.trading-vue-tbitem-exp {\n    opacity: 0.5;\n}\n.trading-vue-tbitem-exp:hover {\n    background-color: #76878330;\n    opacity: 0.9 !important;\n}\n.trading-vue-tbicon {\n    position: absolute;\n}\n.trading-vue-tbitem.selected-item > .trading-vue-tbicon,\n.tvjs-item-list-item.selected-item > .trading-vue-tbicon {\n     filter: brightness(1.45) sepia(1) hue-rotate(90deg) saturate(4.5) !important;\n}\n.tvjs-pixelated {\n    -ms-interpolation-mode: nearest-neighbor;\n    image-rendering: -webkit-optimize-contrast;\n    image-rendering: -webkit-crisp-edges;\n    image-rendering: -moz-crisp-edges;\n    image-rendering: -o-crisp-edges;\n    image-rendering: pixelated;\n}\n\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 6072:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-ux-wrapper {\n    position: absolute;\n    display: flex;\n}\n.tvjs-ux-wrapper-pin {\n    position: absolute;\n    width: 9px;\n    height: 9px;\n    z-index: 100;\n    background-color: #23a776;\n    border-radius: 10px;\n    margin-left: -6px;\n    margin-top: -6px;\n    pointer-events: none;\n}\n.tvjs-ux-wrapper-head {\n    position: absolute;\n    height: 23px;\n    width: 100%;\n}\n.tvjs-ux-wrapper-close {\n    position: absolute;\n    width: 11px;\n    height: 11px;\n    font-size: 1.5em;\n    line-height: 0.5em;\n    padding: 1px 1px 1px 1px;\n    border-radius: 10px;\n    right: 5px;\n    top: 5px;\n    user-select: none;\n    text-align: center;\n    z-index: 100;\n}\n.tvjs-ux-wrapper-close-hb {\n}\n.tvjs-ux-wrapper-close:hover {\n    background-color: #FF605C !important;\n    color: #692324 !important;\n}\n.tvjs-ux-wrapper-full {\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 7655:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-watchlist-panel[data-v-e5180a72] {\n    position: relative;\n    height: 100%;\n    border-left: 1px solid;\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n    display: flex;\n    transition: width 0.2s ease;\n    overflow: hidden;\n}\n.resize-handle[data-v-e5180a72] {\n    position: absolute;\n    left: 0;\n    top: 0;\n    width: 4px;\n    height: 100%;\n    cursor: ew-resize;\n    background: transparent;\n    transition: background 0.15s;\n    z-index: 10;\n}\n.resize-handle[data-v-e5180a72]:hover {\n    background: #2962ff;\n}\n.collapse-toggle[data-v-e5180a72] {\n    position: absolute;\n    left: 4px;\n    top: 50%;\n    transform: translateY(-50%);\n    width: 24px;\n    height: 48px;\n    background: transparent;\n    border: none;\n    color: #787b86;\n    cursor: pointer;\n    font-size: 10px;\n    z-index: 5;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    transition: color 0.15s;\n}\n.collapse-toggle[data-v-e5180a72]:hover {\n    color: #fff;\n}\n.is-collapsed .collapse-toggle[data-v-e5180a72] {\n    left: 6px;\n}\n.panel-content[data-v-e5180a72] {\n    flex: 1;\n    display: flex;\n    flex-direction: column;\n    min-width: 0;\n    padding-left: 8px;\n}\n.panel-header[data-v-e5180a72] {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 12px 16px 12px 8px;\n    border-bottom: 1px solid;\n    border-color: inherit;\n}\n.panel-header h3[data-v-e5180a72] {\n    margin: 0;\n    font-size: 14px;\n    font-weight: 600;\n}\n.header-actions[data-v-e5180a72] {\n    display: flex;\n    gap: 4px;\n}\n.btn-icon[data-v-e5180a72] {\n    width: 28px;\n    height: 28px;\n    background: transparent;\n    border: none;\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 14px;\n    transition: background 0.15s;\n}\n.btn-icon[data-v-e5180a72]:hover {\n    background: rgba(255, 255, 255, 0.1);\n}\n.search-container[data-v-e5180a72] {\n    display: flex;\n    align-items: center;\n    padding: 8px 12px;\n    border-bottom: 1px solid;\n    border-color: inherit;\n}\n.search-container input[data-v-e5180a72] {\n    flex: 1;\n    padding: 8px 12px;\n    background: #2a2e39;\n    border: 1px solid #363a45;\n    border-radius: 4px;\n    color: inherit;\n    font-size: 13px;\n}\n.btn-clear[data-v-e5180a72] {\n    width: 24px;\n    height: 24px;\n    margin-left: 8px;\n    background: transparent;\n    border: none;\n    color: #787b86;\n    cursor: pointer;\n    font-size: 16px;\n}\n.exchange-filter[data-v-e5180a72] {\n    padding: 8px 12px;\n    border-bottom: 1px solid;\n    border-color: inherit;\n}\n.exchange-filter select[data-v-e5180a72] {\n    width: 100%;\n    padding: 6px 10px;\n    background: #2a2e39;\n    border: 1px solid #363a45;\n    border-radius: 4px;\n    color: inherit;\n    font-size: 12px;\n}\n.ticker-list[data-v-e5180a72] {\n    flex: 1;\n    overflow-y: auto;\n    padding: 4px 0;\n}\n.ticker-item[data-v-e5180a72] {\n    display: flex;\n    align-items: center;\n    padding: 8px 12px;\n    cursor: pointer;\n    transition: background 0.1s;\n    gap: 8px;\n}\n.ticker-item[data-v-e5180a72]:hover {\n    background: rgba(255, 255, 255, 0.05);\n}\n.ticker-item.is-active[data-v-e5180a72] {\n    background: rgba(41, 98, 255, 0.15);\n}\n.btn-star[data-v-e5180a72] {\n    width: 20px;\n    height: 20px;\n    background: transparent;\n    border: none;\n    color: #787b86;\n    cursor: pointer;\n    font-size: 14px;\n    padding: 0;\n    transition: color 0.15s;\n}\n.btn-star[data-v-e5180a72]:hover,\n.btn-star.is-favorite[data-v-e5180a72] {\n    color: #ffd600;\n}\n.ticker-info[data-v-e5180a72] {\n    flex: 1;\n    min-width: 0;\n}\n.ticker-symbol[data-v-e5180a72] {\n    font-size: 13px;\n    font-weight: 500;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n}\n.ticker-exchange[data-v-e5180a72] {\n    font-size: 10px;\n    color: #787b86;\n    margin-top: 2px;\n}\n.ticker-price[data-v-e5180a72] {\n    text-align: right;\n    min-width: 70px;\n}\n.price-value[data-v-e5180a72] {\n    font-size: 13px;\n    font-weight: 500;\n    font-family: monospace;\n}\n.price-change[data-v-e5180a72] {\n    font-size: 11px;\n    font-family: monospace;\n    margin-top: 2px;\n}\n.price-change.positive[data-v-e5180a72] {\n    color: #23a776;\n}\n.price-change.negative[data-v-e5180a72] {\n    color: #e54150;\n}\n.ticker-sparkline[data-v-e5180a72] {\n    width: 60px;\n    height: 20px;\n    margin-left: 8px;\n}\n.ticker-sparkline svg[data-v-e5180a72] {\n    width: 100%;\n    height: 100%;\n}\n.empty-state[data-v-e5180a72] {\n    padding: 40px 20px;\n    text-align: center;\n    color: #787b86;\n}\n.empty-icon[data-v-e5180a72] {\n    font-size: 48px;\n    margin-bottom: 12px;\n}\n.empty-state p[data-v-e5180a72] {\n    margin: 0 0 16px;\n    font-size: 13px;\n}\n.btn-add-first[data-v-e5180a72] {\n    padding: 10px 20px;\n    background: #2962ff;\n    border: none;\n    border-radius: 4px;\n    color: #fff;\n    font-size: 13px;\n    cursor: pointer;\n}\n.panel-footer[data-v-e5180a72] {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    padding: 8px 12px;\n    border-top: 1px solid;\n    border-color: inherit;\n    font-size: 11px;\n    color: #787b86;\n}\n.gainers[data-v-e5180a72] {\n    color: #23a776;\n}\n.losers[data-v-e5180a72] {\n    color: #e54150;\n}\n\n/* Modal Styles */\n.tvjs-modal-overlay[data-v-e5180a72] {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background: rgba(0, 0, 0, 0.5);\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    z-index: 10000;\n}\n.tvjs-modal[data-v-e5180a72] {\n    background: #1e2224;\n    border-radius: 8px;\n    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);\n    min-width: 320px;\n    max-width: 400px;\n}\n.add-ticker-modal .modal-header[data-v-e5180a72] {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 16px 20px;\n    border-bottom: 1px solid #363a45;\n}\n.add-ticker-modal .modal-header h3[data-v-e5180a72] {\n    margin: 0;\n    font-size: 16px;\n    font-weight: 500;\n}\n.btn-close[data-v-e5180a72] {\n    background: transparent;\n    border: none;\n    color: #787b86;\n    font-size: 24px;\n    cursor: pointer;\n    padding: 0;\n    line-height: 1;\n}\n.btn-close[data-v-e5180a72]:hover {\n    color: #fff;\n}\n.modal-body[data-v-e5180a72] {\n    padding: 20px;\n}\n.form-group[data-v-e5180a72] {\n    margin-bottom: 16px;\n}\n.form-group label[data-v-e5180a72] {\n    display: block;\n    margin-bottom: 6px;\n    font-size: 12px;\n    color: #787b86;\n    text-transform: uppercase;\n}\n.form-group input[data-v-e5180a72],\n.form-group select[data-v-e5180a72] {\n    width: 100%;\n    padding: 10px 12px;\n    background: #2a2e39;\n    border: 1px solid #363a45;\n    border-radius: 4px;\n    color: #d1d4dc;\n    font-size: 13px;\n    box-sizing: border-box;\n}\n.form-group input[data-v-e5180a72]:focus,\n.form-group select[data-v-e5180a72]:focus {\n    border-color: #2962ff;\n    outline: none;\n}\n.quick-add[data-v-e5180a72] {\n    margin-top: 16px;\n}\n.quick-add h4[data-v-e5180a72] {\n    margin: 0 0 10px;\n    font-size: 11px;\n    color: #787b86;\n    text-transform: uppercase;\n}\n.suggestions[data-v-e5180a72] {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 6px;\n}\n.btn-suggestion[data-v-e5180a72] {\n    padding: 6px 12px;\n    background: #2a2e39;\n    border: 1px solid #363a45;\n    border-radius: 4px;\n    color: #d1d4dc;\n    font-size: 12px;\n    cursor: pointer;\n    transition: all 0.15s;\n}\n.btn-suggestion[data-v-e5180a72]:hover {\n    background: #363a45;\n    border-color: #2962ff;\n}\n.modal-footer[data-v-e5180a72] {\n    display: flex;\n    gap: 10px;\n    justify-content: flex-end;\n    padding: 16px 20px;\n    border-top: 1px solid #363a45;\n}\n.btn[data-v-e5180a72] {\n    padding: 10px 20px;\n    border: none;\n    border-radius: 4px;\n    font-size: 13px;\n    font-weight: 500;\n    cursor: pointer;\n    transition: all 0.15s;\n}\n.btn[data-v-e5180a72]:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n}\n.btn-primary[data-v-e5180a72] {\n    background: #2962ff;\n    color: #fff;\n}\n.btn-primary[data-v-e5180a72]:hover:not(:disabled) {\n    background: #1e53e4;\n}\n.btn-secondary[data-v-e5180a72] {\n    background: #363a45;\n    color: #d1d4dc;\n}\n.btn-secondary[data-v-e5180a72]:hover {\n    background: #4c525e;\n}\n\n/* Context Menu */\n.context-menu[data-v-e5180a72] {\n    position: fixed;\n    background: #1e2224;\n    border: 1px solid #363a45;\n    border-radius: 6px;\n    padding: 4px 0;\n    min-width: 140px;\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n    z-index: 10001;\n}\n.context-menu button[data-v-e5180a72] {\n    display: block;\n    width: 100%;\n    padding: 8px 12px;\n    background: transparent;\n    border: none;\n    color: #d1d4dc;\n    font-size: 13px;\n    text-align: left;\n    cursor: pointer;\n}\n.context-menu button[data-v-e5180a72]:hover {\n    background: #2a2e39;\n}\n\n/* Scrollbar */\n.ticker-list[data-v-e5180a72]::-webkit-scrollbar {\n    width: 6px;\n}\n.ticker-list[data-v-e5180a72]::-webkit-scrollbar-track {\n    background: transparent;\n}\n.ticker-list[data-v-e5180a72]::-webkit-scrollbar-thumb {\n    background: #363a45;\n    border-radius: 3px;\n}\n.ticker-list[data-v-e5180a72]::-webkit-scrollbar-thumb:hover {\n    background: #4c525e;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 983:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(3645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-widgets {\n    position: absolute;\n    z-index: 1000;\n    pointer-events: none;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 3645:
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ 840:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
        return Hammer;
    }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}

})(window, document, 'Hammer');


/***/ }),

/***/ 8981:
/***/ ((module) => {

/*
 * Hamster.js v1.1.2
 * (c) 2013 Monospaced http://monospaced.com
 * License: MIT
 */

(function(window, document){
'use strict';

/**
 * Hamster
 * use this to create instances
 * @returns {Hamster.Instance}
 * @constructor
 */
var Hamster = function(element) {
  return new Hamster.Instance(element);
};

// default event name
Hamster.SUPPORT = 'wheel';

// default DOM methods
Hamster.ADD_EVENT = 'addEventListener';
Hamster.REMOVE_EVENT = 'removeEventListener';
Hamster.PREFIX = '';

// until browser inconsistencies have been fixed...
Hamster.READY = false;

Hamster.Instance = function(element){
  if (!Hamster.READY) {
    // fix browser inconsistencies
    Hamster.normalise.browser();

    // Hamster is ready...!
    Hamster.READY = true;
  }

  this.element = element;

  // store attached event handlers
  this.handlers = [];

  // return instance
  return this;
};

/**
 * create new hamster instance
 * all methods should return the instance itself, so it is chainable.
 * @param   {HTMLElement}       element
 * @returns {Hamster.Instance}
 * @constructor
 */
Hamster.Instance.prototype = {
  /**
   * bind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  wheel: function onEvent(handler, useCapture){
    Hamster.event.add(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.add(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  },

  /**
   * unbind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  unwheel: function offEvent(handler, useCapture){
    // if no handler argument,
    // unbind the last bound handler (if exists)
    if (handler === undefined && (handler = this.handlers.slice(-1)[0])) {
      handler = handler.original;
    }

    Hamster.event.remove(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.remove(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  }
};

Hamster.event = {
  /**
   * cross-browser 'addWheelListener'
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  add: function add(hamster, eventName, handler, useCapture){
    // store the original handler
    var originalHandler = handler;

    // redefine the handler
    handler = function(originalEvent){

      if (!originalEvent) {
        originalEvent = window.event;
      }

      // create a normalised event object,
      // and normalise "deltas" of the mouse wheel
      var event = Hamster.normalise.event(originalEvent),
          delta = Hamster.normalise.delta(originalEvent);

      // fire the original handler with normalised arguments
      return originalHandler(event, delta[0], delta[1], delta[2]);

    };

    // cross-browser addEventListener
    hamster.element[Hamster.ADD_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // store original and normalised handlers on the instance
    hamster.handlers.push({
      original: originalHandler,
      normalised: handler
    });
  },

  /**
   * removeWheelListener
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  remove: function remove(hamster, eventName, handler, useCapture){
    // find the normalised handler on the instance
    var originalHandler = handler,
        lookup = {},
        handlers;
    for (var i = 0, len = hamster.handlers.length; i < len; ++i) {
      lookup[hamster.handlers[i].original] = hamster.handlers[i];
    }
    handlers = lookup[originalHandler];
    handler = handlers.normalised;

    // cross-browser removeEventListener
    hamster.element[Hamster.REMOVE_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // remove original and normalised handlers from the instance
    for (var h in hamster.handlers) {
      if (hamster.handlers[h] == handlers) {
        hamster.handlers.splice(h, 1);
        break;
      }
    }
  }
};

/**
 * these hold the lowest deltas,
 * used to normalise the delta values
 * @type {Number}
 */
var lowestDelta,
    lowestDeltaXY;

Hamster.normalise = {
  /**
   * fix browser inconsistencies
   */
  browser: function normaliseBrowser(){
    // detect deprecated wheel events
    if (!('onwheel' in document || document.documentMode >= 9)) {
      Hamster.SUPPORT = document.onmousewheel !== undefined ?
                        'mousewheel' : // webkit and IE < 9 support at least "mousewheel"
                        'DOMMouseScroll'; // assume remaining browsers are older Firefox
    }

    // detect deprecated event model
    if (!window.addEventListener) {
      // assume IE < 9
      Hamster.ADD_EVENT = 'attachEvent';
      Hamster.REMOVE_EVENT = 'detachEvent';
      Hamster.PREFIX = 'on';
    }

  },

  /**
   * create a normalised event object
   * @param   {Function}    originalEvent
   * @returns {Object}      event
   */
   event: function normaliseEvent(originalEvent){
    var event = {
          // keep a reference to the original event object
          originalEvent: originalEvent,
          target: originalEvent.target || originalEvent.srcElement,
          type: 'wheel',
          deltaMode: originalEvent.type === 'MozMousePixelScroll' ? 0 : 1,
          deltaX: 0,
          deltaZ: 0,
          preventDefault: function(){
            if (originalEvent.preventDefault) {
              originalEvent.preventDefault();
            } else {
              originalEvent.returnValue = false;
            }
          },
          stopPropagation: function(){
            if (originalEvent.stopPropagation) {
              originalEvent.stopPropagation();
            } else {
              originalEvent.cancelBubble = false;
            }
          }
        };

    // calculate deltaY (and deltaX) according to the event

    // 'mousewheel'
    if (originalEvent.wheelDelta) {
      event.deltaY = - 1/40 * originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaX) {
      event.deltaX = - 1/40 * originalEvent.wheelDeltaX;
    }

    // 'DomMouseScroll'
    if (originalEvent.detail) {
      event.deltaY = originalEvent.detail;
    }

    return event;
  },

  /**
   * normalise 'deltas' of the mouse wheel
   * @param   {Function}    originalEvent
   * @returns {Array}       deltas
   */
  delta: function normaliseDelta(originalEvent){
    var delta = 0,
      deltaX = 0,
      deltaY = 0,
      absDelta = 0,
      absDeltaXY = 0,
      fn;

    // normalise deltas according to the event

    // 'wheel' event
    if (originalEvent.deltaY) {
      deltaY = originalEvent.deltaY * -1;
      delta  = deltaY;
    }
    if (originalEvent.deltaX) {
      deltaX = originalEvent.deltaX;
      delta  = deltaX * -1;
    }

    // 'mousewheel' event
    if (originalEvent.wheelDelta) {
      delta = originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaY) {
      deltaY = originalEvent.wheelDeltaY;
    }
    if (originalEvent.wheelDeltaX) {
      deltaX = originalEvent.wheelDeltaX * -1;
    }

    // 'DomMouseScroll' event
    if (originalEvent.detail) {
      delta = originalEvent.detail * -1;
    }

    // Don't return NaN
    if (delta === 0) {
      return [0, 0, 0];
    }

    // look for lowest delta to normalize the delta values
    absDelta = Math.abs(delta);
    if (!lowestDelta || absDelta < lowestDelta) {
      lowestDelta = absDelta;
    }
    absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
    if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) {
      lowestDeltaXY = absDeltaXY;
    }

    // convert deltas to whole numbers
    fn = delta > 0 ? 'floor' : 'ceil';
    delta  = Math[fn](delta / lowestDelta);
    deltaX = Math[fn](deltaX / lowestDeltaXY);
    deltaY = Math[fn](deltaY / lowestDeltaXY);

    return [delta, deltaX, deltaY];
  }
};

if (typeof window.define === 'function' && window.define.amd) {
  // AMD
  window.define('hamster', [], function(){
    return Hamster;
  });
} else if (true) {
  // CommonJS
  module.exports = Hamster;
} else {}

})(window, window.document);


/***/ }),

/***/ 6961:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
var LZString = (function() {

// private property
var f = String.fromCharCode;
var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
var baseReverseDic = {};

function getBaseValue(alphabet, character) {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (var i=0 ; i<alphabet.length ; i++) {
      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

var LZString = {
  compressToBase64 : function (input) {
    if (input == null) return "";
    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
    switch (res.length % 4) { // To produce valid Base64
    default: // When could this happen ?
    case 0 : return res;
    case 1 : return res+"===";
    case 2 : return res+"==";
    case 3 : return res+"=";
    }
  },

  decompressFromBase64 : function (input) {
    if (input == null) return "";
    if (input == "") return null;
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
  },

  compressToUTF16 : function (input) {
    if (input == null) return "";
    return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
  },

  decompressFromUTF16: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
  },

  //compress into uint8array (UCS-2 big endian format)
  compressToUint8Array: function (uncompressed) {
    var compressed = LZString.compress(uncompressed);
    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character

    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
      var current_value = compressed.charCodeAt(i);
      buf[i*2] = current_value >>> 8;
      buf[i*2+1] = current_value % 256;
    }
    return buf;
  },

  //decompress from uint8array (UCS-2 big endian format)
  decompressFromUint8Array:function (compressed) {
    if (compressed===null || compressed===undefined){
        return LZString.decompress(compressed);
    } else {
        var buf=new Array(compressed.length/2); // 2 bytes per character
        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
          buf[i]=compressed[i*2]*256+compressed[i*2+1];
        }

        var result = [];
        buf.forEach(function (c) {
          result.push(f(c));
        });
        return LZString.decompress(result.join(''));

    }

  },


  //compress into a string that is already URI encoded
  compressToEncodedURIComponent: function (input) {
    if (input == null) return "";
    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
  },

  //decompress from an output of compressToEncodedURIComponent
  decompressFromEncodedURIComponent:function (input) {
    if (input == null) return "";
    if (input == "") return null;
    input = input.replace(/ /g, "+");
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
  },

  compress: function (uncompressed) {
    return LZString._compress(uncompressed, 16, function(a){return f(a);});
  },
  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    var i, value,
        context_dictionary= {},
        context_dictionaryToCreate= {},
        context_c="",
        context_wc="",
        context_w="",
        context_enlargeIn= 2, // Compensate for the first entry which should not count
        context_dictSize= 3,
        context_numBits= 2,
        context_data=[],
        context_data_val=0,
        context_data_position=0,
        ii;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position ==bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }


        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        // Add wc to the dictionary.
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    // Output the code for w.
    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<8 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<16 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0 ; i<context_numBits ; i++) {
          context_data_val = (context_data_val << 1) | (value&1);
          if (context_data_position == bitsPerChar-1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }


      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    // Mark the end of the stream
    value = 2;
    for (i=0 ; i<context_numBits ; i++) {
      context_data_val = (context_data_val << 1) | (value&1);
      if (context_data_position == bitsPerChar-1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar-1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      }
      else context_data_position++;
    }
    return context_data.join('');
  },

  decompress: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
  },

  _decompress: function (length, resetValue, getNextValue) {
    var dictionary = [],
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = [],
        i,
        w,
        bits, resb, maxpower, power,
        c,
        data = {val:getNextValue(0), position:resetValue, index:1};

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2,2);
    power=1;
    while (power!=maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb>0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (next = bits) {
      case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    w = c;
    result.push(c);
    while (true) {
      if (data.index > length) {
        return "";
      }

      bits = 0;
      maxpower = Math.pow(2,numBits);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 2:
          return result.join('');
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

    }
  }
};
  return LZString;
})();

if (true) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () { return LZString; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}


/***/ }),

/***/ 5666:
/***/ ((module) => {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}


/***/ }),

/***/ 863:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(6418);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("550b47ab", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 7124:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(3976);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("1b34bfeb", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 1886:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(2449);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("9895d3a6", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 2670:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(7775);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("e86fc1d8", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 2590:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(1524);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("54e6ab9f", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 291:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(6046);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("bb361240", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 1187:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(1760);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("60f13054", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 3807:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(6108);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("8139036a", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 1600:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(7988);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("1db01c0b", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 5169:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(8423);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("68f243ea", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 8011:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(661);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("12d2309d", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 3372:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(9168);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("5b620605", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 3611:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(8356);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("c0a0db36", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 6270:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(5764);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("a2287206", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 7477:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(1029);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("143dffab", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 3153:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(3935);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("f32fd36e", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 3501:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(5379);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("604bf5ef", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 565:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(6072);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("21fde573", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 5411:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(7655);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("9e74a7c2", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 8005:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(983);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(5346)/* .default */ .Z
var update = add("fd83689e", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 5346:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ addStylesClient)
});

;// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/listToStyles.js
/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}

;// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/addStylesClient.js
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/



var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

function addStylesClient (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module doesn't tell about it's top-level declarations so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(5648);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=trading-vue.js.map