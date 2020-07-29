(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Axis.js":
/*!*********************!*\
  !*** ./src/Axis.js ***!
  \*********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Static__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Static */ "./src/Static.js");
/* harmony import */ var _Is__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Is */ "./src/Is.js");


/** 
 * The Axis class is a single axis to the Graph class.
 */

/**
 * Create new graph axis.
 * @public
 * @constructor
 * @param {Options} options - GraphOptions object.
 * @param {Canvas} graphCanvas - Canvas instance for the graph.
 * @param {string} orientation - X or Y axis.
 * @returns {Axis}
 */

function Axis(options, graphCanvas, axis) {
  if (axis.toLowerCase() === "x") {
    this._isX = true;
    this._axis = options.axes.x;
    this._getSize = graphCanvas.getContentWidth.bind(graphCanvas);
  } else if (axis.toLowerCase() === "y") {
    this._isX = false;
    this._axis = options.axes.y;
    this._getSize = graphCanvas.getContentHeight.bind(graphCanvas);
  } else {
    console.error("owp.graph ERROR: Axis: \"" + axis + "\" is neither X or Y.");
    return;
  }

  this._options = options;
  this._getRatio = graphCanvas.getRatio.bind(graphCanvas);
}
/**
 * Returns true if all bounds are set.
 * @public
 * @returns {bool}
 */


Axis.prototype.hasBounds = function () {
  return !_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(this.getMin()) && !_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(this.getMax());
};
/**
 * True of this axis is logarithmic.
 * @public
 * @returns {bool}
 */


Axis.prototype.isLog = function () {
  return this._axis.log;
};
/**
 * True of this axis is inverted.
 * @public
 * @returns {bool}
 */


Axis.prototype.isInverted = function () {
  return this._axis.inverted;
};
/**
 * Get min bounds.
 * @public
 * @returns {number}
 */


Axis.prototype.getMin = function () {
  //Always prioritize override bounds.
  if (this._overrideBounds) {
    return this._overrideBounds.min;
  }

  return this._min;
};
/**
 * Get max bounds.
 * @public
 * @returns {number}
 */


Axis.prototype.getMax = function () {
  //Always prioritize override bounds.
  if (this._overrideBounds) {
    return this._overrideBounds.max;
  }

  return this._max;
};
/**
 * Get the axis label. Uses the options value formatter if set.
 * @public
 * @returns {string}
 */


Axis.prototype.getAxisLabel = function () {
  return this._axis.label;
};
/**
 * Get the font(family and size) for the tick labels.
 * @public
 * @returns {string}
 */


Axis.prototype.getTickLabelsFont = function () {
  return this._options.axes.tickLabels.size + "px " + this._options.axes.tickLabels.font;
};
/**
 * Get the font(family and size) for the axes labels.
 * @public
 * @returns {string}
 */


Axis.prototype.getAxisLabelFont = function () {
  return this._options.axes.labels.size + "px " + this._options.axes.labels.font;
};
/**
 * Get bounds label width in pixels. Uses the options value formatter if set.
 * @public
 * @returns {int}
 */


Axis.prototype.getBoundLabelWidth = function (minOrMax, pad) {
  let bound = minOrMax === "min" ? this.getMin() : this.getMax();

  if (pad) {
    bound = _Static__WEBPACK_IMPORTED_MODULE_0__["default"].round(bound + 0.111111111111111, 3);
  }

  return _Static__WEBPACK_IMPORTED_MODULE_0__["default"].getTextWidth(bound, this.getTickLabelsFont());
};
/**
 * Get the ticks array.
 * @public
 * @returns {array}
 */


Axis.prototype.getTicks = function () {
  return this._ticks;
};
/**
 * Return true if this axis has overridden bounds.
 * @public
 */


Axis.prototype.hasOverridenBounds = function () {
  return this._overrideBounds !== undefined;
};
/**
 * Override bounds. Temporary override user given bounds. 
 * @public
 */


Axis.prototype.overrideBounds = function (bounds) {
  this._overrideBounds = bounds;
  this.calculateTicks();
};
/**
 * Remove overridden bounds.
 * @public
 */


Axis.prototype.clearOverridenBounds = function () {
  this.overrideBounds();
};
/**
 * Calculates bounds. Uses user given option bounds first and calculates mising from data set.
 * @public
 */


Axis.prototype.calculateBounds = function () {
  let newMin, newMax; //Prioritize user given bounds.

  if (!_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(this._axis.bounds.min)) {
    newMin = this._axis.bounds.min;
  }

  if (!_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(this._axis.bounds.max)) {
    newMax = this._axis.bounds.max;
  } //Both bounds are not set by the user. Calculate missing.


  if (_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(newMin) || _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(newMax)) {
    let calcBounds;

    if (this._isX) {
      calcBounds = this._calculateXBounds();
    } else {
      calcBounds = this._calculateYBounds();
    }

    if (calcBounds) {
      //Use both calculated bounds.
      if (_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(newMin) && _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(newMax)) {
        newMin = calcBounds.min;
        newMax = calcBounds.max; //Both values are calculated. Move both.

        if (newMin === newMax) {
          console.warn("owp.graph WARNING: Axis " + (this._isX ? "X" : "Y") + ". bounds.min and bounds.max are equal. Move both.");
          --newMin;
          ++newMax;
        }
      } //Use only calculated min.
      else if (_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(newMin)) {
          newMin = calcBounds.min; //Only move the calculated value.

          if (newMin >= newMax) {
            console.warn("owp.graph WARNING: Axis " + (this._isX ? "X" : "Y") + ". bounds.min and bounds.max are equal. Move min.");
            newMin = newMax - 1;
          }
        } //use only calculated max.
        else if (_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(newMax)) {
            newMax = calcBounds.max;

            if (newMin >= newMax) {
              console.warn("owp.graph WARNING: Axis " + (this._isX ? "X" : "Y") + ". bounds.min and bounds.max are equal. Move max.");
              newMax = newMin + 1;
            }
          }
    }
  }

  if (!_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(newMin) && !_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(newMax)) {
    if (this._axis.log && newMin <= 0) {
      console.error("owp.graph ERROR: Axis " + (this._isX ? "X" : "Y") + ". When axis is logarithmic all bounds must be greater than zero.");
      newMin = newMax = undefined;
    }
  }

  this._min = newMin;
  this._max = newMax;
};
/**
 * Calculate graph axes ticks.
 * @public
 */


Axis.prototype.calculateTicks = function () {
  let ticks;
  const labelSize = this._isX ? this._options.axes.tickLabels.width : this._options.axes.tickLabels.size; //Create ticks with user given options ticker.

  if (this._axis.ticker) {
    ticks = this._axis.ticker(this._axis.log, this.getMin(), this.getMax(), this._getSize(), labelSize);
  } //Create ticks with the default ticker.
  else {
      ticks = this._getDefaultTicks(this._axis.log, this.getMin(), this.getMax(), this._getSize(), labelSize);
    }

  if (!ticks.length) {
    console.warn("owp.graph WARNING: Axis " + (this._isX ? "X" : "Y") + ". Ticks list is empty.");
  } //Update ticks with pixel coordinates.


  for (let i = 0; i < ticks.length; ++i) {
    ticks[i].coordinate = this.valueToPixel(ticks[i].value);
  } //Show tick markers.


  if (this._options.axes.tickMarkers.show) {
    ticks.markers = {
      offset: this._options.axes.tickMarkers.offset,
      length: this._options.axes.tickMarkers.length,
      width: this._options.axes.tickMarkers.width,
      color: this._options.axes.tickMarkers.color
    };
  } //Show tick labels.


  if (this._options.axes.tickLabels.show) {
    ticks.labels = {
      offset: this._options.axes.tickLabels.offset,
      size: this._options.axes.tickLabels.size,
      color: this._options.axes.tickLabels.color,
      font: this.getTickLabelsFont(),
      width: []
    };

    for (let i = 0; i < ticks.length; ++i) {
      ticks.labels.width[i] = _Static__WEBPACK_IMPORTED_MODULE_0__["default"].getTextWidth(ticks[i].label, this.getTickLabelsFont());
    }
  } //Show grid.


  if (this._axis.grid.width) {
    ticks.grid = {
      width: this._axis.grid.width,
      color: this._axis.grid.color
    };
  }

  this._ticks = ticks;
};
/**
 * Get value from given pixel coordinate.
 * @public
 * @returns {number}
 */


Axis.prototype.pixelToValue = function (pixel) {
  //Logarithmic
  if (this._axis.log) {
    //Logarithmic inverted orientation.
    if (this._isX ? this._axis.inverted : !this._axis.inverted) {
      return Math.pow(10, pixel / this._getSize() * log10(this.getMin() / this.getMax()) + log10(this.getMax()));
    } //Logarithmic normal orientation.
    else {
        return Math.pow(10, pixel / this._getSize() * log10(this.getMax() / this.getMin()) + log10(this.getMin()));
      }
  } //Linear
  else {
      //Linear inverted orientation.
      if (this._isX ? this._axis.inverted : !this._axis.inverted) {
        return pixel / this._getSize() * (this.getMin() - this.getMax()) + this.getMax();
      } //Linear normal orientation.
      else {
          return pixel / this._getSize() * (this.getMax() - this.getMin()) + this.getMin();
        }
    }
};
/**
 * Get pixel coordinate from given value.
 * @public
 * @returns {number}
 */


Axis.prototype.valueToPixel = function (value) {
  //Logarithmic
  if (this._axis.log) {
    //Logarithmic inverted orientation.
    if (this._isX ? this._axis.inverted : !this._axis.inverted) {
      return log10(value / this.getMax()) / log10(this.getMin() / this.getMax()) * this._getSize();
    } //Logarithmic normal orientation.
    else {
        return log10(value / this.getMin()) / log10(this.getMax() / this.getMin()) * this._getSize();
      }
  } //Linear
  else {
      //Linear inverted orientation.
      if (this._isX ? this._axis.inverted : !this._axis.inverted) {
        return (value - this.getMax()) / (this.getMin() - this.getMax()) * this._getSize();
      } //Linear normal orientation.
      else {
          return (value - this.getMin()) / (this.getMax() - this.getMin()) * this._getSize();
        }
    }
};
/**
 * Format the given value. Uses value formatter in options if available.
 * @public
 * @param {number} value
 * @returns {string}
 */


Axis.prototype.formatLegendValue = function (value) {
  //Use user given formatter.
  if (this._axis.legendValueFormatter) {
    return this._axis.legendValueFormatter(value);
  } //Use default value formatter.
  else {
      return _Static__WEBPACK_IMPORTED_MODULE_0__["default"].round(value, 5);
    }
};
/**
 * Callback function for getting pixel coordinate from a given value.
 * Much faster than asking this class valueToPixel function for each value.
 * Needs to be required if window changes size or new bounds are set.
 * Safest to aquire for each render pass.
 * Calculates scaling ratio into the pixel coordinate. i.e. scaling needs to be disabled on the canvas.
 * @callback Axis~valueToPixelCallback
 * @param {int} index
 * @returns {number}
 */

/**
 * Get a callback to calculate the pixel coordinate for a given value.
 * Used by the graph render function to improve performance.
 * @public
 * @returns {Axis~valueToPixelCallback}
 */


Axis.prototype.getValueToPixelCallback = function () {
  let num, denom, numVar, numOp, logFunc;

  const size = this._getSize() * this._getRatio(); //Inverted X or normal Y.


  if (this._isX ? this._axis.inverted : !this._axis.inverted) {
    numVar = this.getMax();
    denom = this._axis.log ? log10(this.getMin() / this.getMax()) : this.getMin() - this.getMax();
  } //Normal X or inverted Y.
  else {
      numVar = this.getMin();
      denom = this._axis.log ? log10(this.getMax() / this.getMin()) : this.getMax() - this.getMin();
    } //Axis is logarithmic.


  if (this._axis.log) {
    numOp = "/";
    logFunc = "Math.log10";
  } //Axis is linear.
  else {
      numOp = "-";
      logFunc = "";
    } //Only do the numerator operation on the numerator if the variable is not zero.


  if (numVar) {
    num = logFunc + "(value " + numOp + " " + numVar + ")";
  } else {
    num = logFunc + "(value)";
  } //Only do the fraction if the denominator is not 1.


  if (denom !== 1) {
    denom = "/ " + denom;
  } else {
    denom = "";
  }

  return new Function("value", "return " + num + " " + denom + " * " + size);
};
/**
 * Calculate X-axis bounds.
 * @private
 * @returns {object} {int min, int max}
 */


Axis.prototype._calculateXBounds = function () {
  //Calculate missing X-axis bounds from dataX values.
  if (this._options.graph.dataX.length) {
    if (this._options.debug) {
      console.log("owp.graph DEBUG: X-bounds not set, but X-data is. Calculate X-bounds from X-data values.");
    }

    let min = 4294967296;
    let max = -4294967296;

    for (let i = 0; i < this._options.graph.dataX.length; ++i) {
      const data = this._options.graph.dataX[i];
      min = Math.min(min, data[0], data[data.length - 1]);
      max = Math.max(max, data[0], data[data.length - 1]);
    }

    return {
      min: min,
      max: max
    };
  } //Calculate X-axis bounds from dataY length.
  else if (this._options.graph.dataY.length) {
      if (this._options.debug) {
        console.log("owp.graph DEBUG: X-bounds and X-data not set, but Y-data is. Calculate X-bounds from Y-data length.");
      }

      let max = 0;

      for (let i = 0; i < this._options.graph.dataY.length; ++i) {
        max = Math.max(max, this._options.graph.dataY[i].length);
      }

      return {
        min: 1,
        max
      };
    } else if (this._options.debug) {
      console.log("owp.graph DEBUG: X-bounds, X-data and Y-data not set. Can't calculate X-bounds.");
      return;
    }
};
/**
 * Calculate Y-axis bounds.
 * @private
 * @returns {object} {int min, int max}
 */


Axis.prototype._calculateYBounds = function () {
  //Calculate Y-axis bounds from dataY values.
  if (this._options.graph.dataY.length) {
    if (this._options.debug) {
      console.log("owp.graph DEBUG: Y-bounds not set, but Y-data is. Calculate Y-bounds from Y-data values.");
    }

    let min = null;
    let max = null;

    for (let i = 0; i < this._options.graph.dataY.length; ++i) {
      const data = this._options.graph.dataY[i];

      if (data.length && min === null) {
        min = 4294967296;
        max = -4294967296;
      }

      for (let j = 0; j < data.length; ++j) {
        min = Math.min(min, data[j]);
        max = Math.max(max, data[j]);
      }
    }

    return min !== null ? {
      min,
      max
    } : null;
  } else if (this._options.debug) {
    console.log("owp.graph DEBUG: Y-bounds and Y-data not set. Can't calculate Y-bounds.");
    return;
  }
};
/**
 * Default get ticks funciton. Used when no ticker is set in options.
 * @private
 * @param {bool} isLog - True if the values are going to be logarithmically distributed.
 * @param {number} minValue - Min/lower bounds value.
 * @param {number} maxValue - Max/upper bounds value.
 * @param {int} graphSize - Size(width or height) of graph in pixels.
 * @param {int} labelSize - Size(width or height) of tick labels in pixels.
 * @returns {array<{number, string}>}
 */


Axis.prototype._getDefaultTicks = function (isLog, minValue, maxValue, graphSize, labelSize) {
  //Pre-format ticker values.
  if (this._axis.tickerValuePreFormatter) {
    minValue = this._axis.tickerValuePreFormatter(minValue);
    maxValue = this._axis.tickerValuePreFormatter(maxValue);
  }

  let ticks; //If the range is to small even a log axis will get linear values.

  if (isLog && maxValue - minValue >= 4 * minValue) {
    ticks = getDefaultLogTicks(minValue, maxValue);
  } else {
    ticks = getDefaultLinTicks(minValue, maxValue, graphSize, labelSize);
  } //Post-format ticker values.


  if (this._axis.tickerValuePostFormatter) {
    for (let i = 0; i < ticks.length; ++i) {
      ticks[i].value = this._axis.tickerValuePostFormatter(ticks[i].value);
    }
  } //Add user formatted labels.


  if (this._axis.tickerLabelFormatter) {
    for (let i = 0; i < ticks.length; ++i) {
      ticks[i].label = this._axis.tickerLabelFormatter(ticks[i].value);
    }
  } //Add default formatted labels.
  else {
      for (let i = 0; i < ticks.length; ++i) {
        ticks[i].label = defaultTickerLabelFormatter(ticks[i].value);
      }
    }

  return ticks;
};

function defaultTickerLabelFormatter(value) {
  if (value < 0) {
    return '-' + defaultTickerLabelFormatter(-value);
  }

  let ranges = [];

  if (value >= 1e3) {
    ranges = [{
      divider: 1e24,
      suffix: 'Y'
    }, {
      divider: 1e21,
      suffix: 'Z'
    }, {
      divider: 1e18,
      suffix: 'E'
    }, {
      divider: 1e15,
      suffix: 'P'
    }, {
      divider: 1e12,
      suffix: 'T'
    }, {
      divider: 1e9,
      suffix: 'G'
    }, {
      divider: 1e6,
      suffix: 'M'
    }, {
      divider: 1e3,
      suffix: 'k'
    }];
  } else if (value < 1e-2) {
    ranges = [{
      divider: 1e-3,
      suffix: 'm'
    }, {
      divider: 1e-6,
      suffix: 'µ'
    }, {
      divider: 1e-9,
      suffix: 'n'
    }, {
      divider: 1e-12,
      suffix: 'p'
    }, {
      divider: 1e-15,
      suffix: 'f'
    }, {
      divider: 1e-18,
      suffix: 'a'
    }, {
      divider: 1e-21,
      suffix: 'z'
    }, {
      divider: 1e-24,
      suffix: 'y'
    }];
  }

  for (let i = 0; i < ranges.length; i++) {
    if (value >= ranges[i].divider) {
      return _Static__WEBPACK_IMPORTED_MODULE_0__["default"].round(value / ranges[i].divider, 3).toString() + ranges[i].suffix;
    }
  }

  return value.toString();
} //For a given value calculate the best step value.


function getStepValue(isLog, value) {
  const mult = isLog ? [1, 10] : [1, 2, 5, 10];
  const exp = Math.floor(log10(value));

  for (let i = 0; i < mult.length; ++i) {
    const newValue = Math.pow(10, exp) * mult[i];

    if (newValue >= value) {
      return newValue;
    }
  }
} //Get linear ticks.


function getDefaultLinTicks(minValue, maxValue, graphSize, labelSize) {
  //Max number of labels.
  const maxNumLabels = graphSize / (labelSize * 1.5); //Value range

  const range = maxValue - minValue; //Get ticker value step.

  const step = getStepValue(false, range / maxNumLabels); //Calculate start pos.

  let start = minValue; //Make sure start is on a step position.

  const diff = modf(start, step);

  if (diff > 0) {
    start += step - diff;
  }

  if (diff < 0) {
    start -= diff;
  }

  const ticks = [];

  for (; start <= maxValue; start += step) {
    start = secureFloat(start);
    ticks.push({
      value: start
    });
  }

  return ticks;
}
/**
 * Modulus for float.
 * @public
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */


function modf(a, b) {
  return a - Math.round(a / b) * b;
} //Get logarithmic ticks.


function getDefaultLogTicks(minValue, maxValue) {
  const ticks = [];
  let step = getStepValue(true, minValue);

  for (;;) {
    for (let i = 1; i < 10; ++i) {
      let value = i * step;

      if (value > maxValue) {
        return ticks;
      }

      value = secureFloat(value);
      ticks.push({
        value: value
      });
    }

    step *= 10;
  }
}

/* harmony default export */ __webpack_exports__["default"] = (Axis);
/**
 * Secure float precision.
 * @public
 * @param {number} val
 * @returns {number}
 */

function secureFloat(val) {
  return parseFloat(val.toPrecision(15));
}

const log10 = Math.log10;

/***/ }),

/***/ "./src/Canvas.js":
/*!***********************!*\
  !*** ./src/Canvas.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/** 
 * The Canvas class is a wrapper for the HTML5 canvas 2D context.
 * Used to automatically get pixel perfect canvas size 
 * and to make it easier to draw simple elements.
 */

/**
 * Create a new canvas. Canvas is automatically scaled to be pixel perfect with screen.
 * @public
 * @constructor
 * @param {parent} parent - Parent div.
 * @param {bool} dontScale - If True the scale transformation wont be set for this canvas. Scaling needs to be done manually.
 * @returns {Canvas}
 */
function Canvas(parent, id, dontScale) {
  this._parent = parent;
  this._canvas = document.createElement("canvas");

  if (id) {
    this._canvas.id = id;
  }

  parent.append(this._canvas);
  this._context = this._canvas.getContext("2d");
  this._dontScale = dontScale;
  this._canvas.style.position = "absolute";
  this._canvas.style.margin = 0;
  this._canvas.style.padding = 0;
  this._canvas.style["box-sizing"] = "border-box"; //Set default position.

  this.setPosition(0, 0); //Fill parent div is default size.

  this.setSize("100%", "100%");
}
/**
 * Set a new parent for the canvas. Leave empty to only remove current parent.
 * @public
 * @param {parent} div - Parent div.
 */


Canvas.prototype.setParent = function (parent) {
  this._canvas.remove();

  if (parent) {
    parent.append(this._canvas);
  }
};

Canvas.prototype.putImageData = function (data, x, y, offsetX, offsetY) {
  this._context.putImageData(data, x * this._ratio + offsetX, y * this._ratio + offsetY);
};
/**
 * Get the html5 canvas.
 * @public
 * @returns {canvas}
 */


Canvas.prototype.getCanvas = function () {
  return this._canvas;
};
/**
 * Get the html5 2D context. Used when performance and less function calls are needed.
 * @public
 * @returns {context}
 */


Canvas.prototype.getContext = function () {
  return this._context;
};
/**
 * Get the x-coordinate relative to the canvas parent.
 * @public
 * @returns {int} X-coordinate in pixels.
 */


Canvas.prototype.getX = function () {
  return this._x;
};
/**
 * Get the y-coordinate relative to the canvas parent.
 * @public
 * @returns {int} Y-coordinate in pixels.
 */


Canvas.prototype.getY = function () {
  return this._y;
};
/**
 * Get the content x-coordinate relative to the canvas parent.
 * @public
 * @returns {int} X-coordinate in pixels.
 */


Canvas.prototype.getContentX = function () {
  return this._contentX;
};
/**
 * Get the content y-coordinate relative to the canvas parent.
 * @public
 * @returns {int} Y-coordinate in pixels.
 */


Canvas.prototype.getContentY = function () {
  return this._contentY;
};
/**
 * Get the canvas width.
 * @public
 * @returns {int} - Width in pixels.
 */


Canvas.prototype.getWidth = function () {
  //return this._canvas.outerWidth(); TODO
  return this._canvas.offsetWidth;
};
/**
 * Get the canvas height.
 * @public
 * @returns {int} - Height in pixels.
 */


Canvas.prototype.getHeight = function () {
  //return this._canvas.outerHeight(); TODO
  return this._canvas.offsetHeight;
};
/**
 * Get the canvas content width.
 * @public
 * @returns {int} - Width in pixels.
 */


Canvas.prototype.getContentWidth = function () {
  //return this._canvas.width(); TODO
  return this._canvas.clientWidth;
};
/**
 * Get the canvas content height.
 * @public
 * @returns {int} - Height in pixels.
 */


Canvas.prototype.getContentHeight = function () {
  //return this._canvas.height(); TODO
  return this._canvas.clientHeight;
};
/**
 * Get the content X-axis offset from the canvas edge. Border, padding etc.
 * @returns {Canvas._contentOffsetX}
 */


Canvas.prototype.getContentOffsetX = function () {
  return this._contentOffsetX;
};
/**
 * Get the content Y-axis offset from the canvas edge. Border, padding etc.
 * @returns {Canvas._contentOffsetX}
 */


Canvas.prototype.getContentOffsetY = function () {
  return this._contentOffsetY;
};
/**
 * Get text with in pixels.
 * @public
 * @param {string} text - Text to measure.
 * @param {fontString} font - Font to use.
 * @returns {int} Width in pixels.
 */


Canvas.prototype.getTextWidth = function (text, font) {
  if (font) {
    this._context.font = font;
  }

  return this._context.measureText(text).width;
};
/**
 * Clear canvas.
 * @public
 */


Canvas.prototype.clear = function () {
  //Scaling is done automatically.
  if (!this._dontScale) {
    this._context.clearRect(0, 0, this.getContentWidth(), this.getContentHeight());
  } //Do scaling manually.
  else {
      this._context.clearRect(0, 0, this.getContentWidth() * this._ratio, this.getContentHeight() * this._ratio);
    }
};
/**
 * Clear area.
 * @public
 * @param {int} x - X-coordinate in pixels.
 * @param {int} y - Y-coordinate in pixels.
 * @param {int} width - Width in pixels.
 * @param {int} height - Height in pixels.
 */


Canvas.prototype.clearRectangle = function (x, y, width, height) {
  //Scaling is done automatically.
  if (!this._dontScale) {
    this._context.clearRect(x, y, width, height);
  } //Do scaling manually.
  else {
      this._context.clearRect(x * this._ratio, y * this._ratio, width * this._ratio, height * this._ratio);
    }
};
/**
 * Set z-index.
 * @public
 * @param {int} zIndex - The new Z-index.
 */


Canvas.prototype.setZIndex = function (zIndex) {
  this._canvas.style["z-index"] = zIndex;
};
/**
 * Set any context member.
 * @public
 * @param {string} member - Member name.
 * @param {type} value - Member value.
 */


Canvas.prototype.set = function (member, value) {
  this._context[member] = value;
};
/**
 * Set canvas border parameters.
 * @param {string} style
 * @param {string} color
 * @param {string} width
 */


Canvas.prototype.setBorder = function (style, color, width) {
  this._canvas.style.borderStyle = style;
  this._canvas.style.borderColor = color;
  this._canvas.style.borderWidth = width;

  this._calculateContentPosition();
};
/**
 * Get any context member.
 * @public
 * @param {string} member - Member name.
 * @returns {type}
 */


Canvas.prototype.get = function (member) {
  return this._context[member];
};
/**
 * Get scale ratio.
 * @public
 * @returns {number}
 */


Canvas.prototype.getRatio = function () {
  return this._ratio;
};
/**
 * Rotate the canvas.
 * @public
 * @param {number} rotateDegrees - Number of degrees to rotate. Positivenumbers = clockwise.
 */


Canvas.prototype.rotate = function (rotateDegrees) {
  this._context.rotate(rotateDegrees * Math.PI / 180);
};
/**
 * Set position of canvas relative to it's parent.
 * @public
 * @param {int} x - X-coordinate in pixels.
 * @param {int} y - Y-coordinate in pixels.
 */


Canvas.prototype.setPosition = function (x, y, alignRight, valignBottom) {
  this._x = x;
  this._y = y;

  if (alignRight) {
    this._canvas.style.left = "";
    this._canvas.style.right = x + "px";
  } else {
    this._canvas.style.left = x + "px";
    this._canvas.style.right = "";
  }

  if (valignBottom) {
    this._canvas.style.top = "";
    this._canvas.style.bottom = y + "px";
  } else {
    this._canvas.style.top = y + "px";
    this._canvas.style.bottom = "";
  }

  this._calculateContentPosition();
};
/**
 * Set size of canvas. 
 * @public
 * @param {int} width - Width in pixels. 
 * @param {int} height - Height in pixels.
 */


Canvas.prototype.setSize = function (width, height) {
  if (width !== undefined) {
    if (typeof width === "number") {
      width = width + "px";
    }

    this._canvas.style.width = width;
  }

  if (height !== undefined) {
    if (typeof height === "number") {
      height = height + "px";
    }

    this._canvas.style.height = height;
  }

  this.resize();
};
/**
 * Resize canvas to match the width and height. Automatically scales to be pixel perfect.
 * @public
 */


Canvas.prototype.resize = function () {
  //Calculate pixel ratio.
  const dpr = window.devicePixelRatio || 1;
  const bsr = this._context.webkitBackingStorePixelRatio || this._context.mozBackingStorePixelRatio || this._context.msBackingStorePixelRatio || this._context.oBackingStorePixelRatio || this._context.backingStorePixelRatio || 1;
  this._ratio = dpr / bsr; //Update canvas.

  this._canvas.width = this.getContentWidth() * this._ratio;
  this._canvas.height = this.getContentHeight() * this._ratio; //Check the dont scale parameter before scaling. Scaling is a time consuming process and might not be desired.

  if (!this._dontScale) {
    this._context.scale(this._ratio, this._ratio);
  }
};
/**
 * Draw a stroke/line rectangle.
 * @public
 * @param {int} x - X-coordinate in pixels.
 * @param {int} y - Y-coordinate in pixels.
 * @param {int} width - Width in pixels.
 * @param {int} height - Height in pixels.
 * @param {int} lineWidth - Stroked line width in pixels.
 * @param {string} color - Color of stroked line.
 */


Canvas.prototype.strokeRectangle = function (x, y, width, height, lineWidth, color) {
  if (lineWidth) {
    this._context.lineWidth = lineWidth;
  }

  if (color) {
    this._context.strokeStyle = color;
  } //Line width build in both direction. Compensate coordinates.


  x += this._context.lineWidth / 2;
  y += this._context.lineWidth / 2;
  width -= this._context.lineWidth;
  height -= this._context.lineWidth;

  this._context.strokeRect(x, y, width, height);
};
/**
 * Draw a filled rectangle using 1 coordinate.
 * @public
 * @param {int} x - X-coordinate in pixels.
 * @param {int} y - Y-coordinate in pixels.
 * @param {int} width - Width in pixels.
 * @param {int} height - Height in pixels.
 * @param {string} color - Color of filled rectangle.
 */


Canvas.prototype.fillRectangle = function (x, y, width, height, color) {
  if (color) {
    this._context.fillStyle = color;
  }

  this._context.fillRect(x, y, width, height);
};
/**
 * Draw a filled rectangle using 2 coordinates.
 * @public
 * @param {int} x1 - First X-axis pixel.
 * @param {int} y1 - First Y-axis pixel.
 * @param {int} x2 - Second X-axis pixel.
 * @param {int} y2 - Second Y-axis pixel.
 * @param {string} color - Color of filled rectangle.
 */


Canvas.prototype.fillRectangle2 = function (x1, y1, x2, y2, color) {
  if (color) {
    this._context.fillStyle = color;
  }

  this._context.fillRect(x1, y1, x2 - x1, y2 - y1);
};
/**
 * Draw a stroked circle.
 * @public
 * @param {int} x - X-coordinate in pixels.
 * @param {int} y - Y-coordinate in pixels.
 * @param {int} radius - Radius in pixels.
 * @param {string} color - Color of stroked line..
 * @param {int} width - Width of stroked line.
 */


Canvas.prototype.strokeCircle = function (x, y, radius, color, width) {
  if (color) {
    this._context.strokeStyle = color;
  }

  if (width) {
    this._context.lineWidth = width;
  }

  this._context.beginPath();

  this._context.arc(x, y, radius, 0, 2 * Math.PI, false);

  this._context.stroke();
};
/**
 * Draw a filled circle.
 * @public
 * @param {int} x - X-coordinate in pixels.
 * @param {int} y - Y-coordinate in pixels.
 * @param {int} radius - Radius in pixels.
 * @param {string} color - Color of stroked line..
 */


Canvas.prototype.fillCircle = function (x, y, radius, color) {
  if (color) {
    this._context.fillStyle = color;
  }

  this._context.beginPath();

  this._context.arc(x, y, radius, 0, 2 * Math.PI, false);

  this._context.fill();
};
/**
 * Draw a line.
 * @public
 * @param {int} x1 - First x-coordinate in pixels.
 * @param {int} y1 - First y-coordinate in pixels.
 * @param {int} x2 - Second x-coordinate in pixels.
 * @param {int} y2 - Second y-coordinate in pixels.
 * @param {int} lineWidth - Stroked line width in pixels.
 * @param {string} color - Color of stroked line.
 */


Canvas.prototype.line = function (x1, y1, x2, y2, lineWidth, color) {
  if (lineWidth) {
    this._context.lineWidth = lineWidth;
  }

  if (color) {
    this._context.strokeStyle = color;
  }

  this._context.beginPath();

  this._context.moveTo(x1, y1);

  this._context.lineTo(x2, y2);

  this._context.stroke();
};
/**
 * Draw filled text.
 * @public
 * @param {string} text - Text to draw.
 * @param {int} x - X-coordinate in pixels.
 * @param {int} y - Y-coordinate in pixels.
 * @param {string} font - Font to use.
 * @param {string} color - Color to use.
 * @param {string} align - Alignment ot use.
 * @param {string} baseline - Baseline to use.
 * @param {number} rotate - Rotate text number of degrees.
 */


Canvas.prototype.text = function (text, x, y, font, color, align, baseline, rotate) {
  if (font) {
    this._context.font = font;
  }

  if (color) {
    this._context.fillStyle = color;
  }

  if (align) {
    this._context.textAlign = align;
  }

  if (baseline) {
    this._context.textBaseline = baseline;
  }

  if (rotate) {
    this._context.save();

    this._context.translate(x, y);

    this._context.rotate(rotate * Math.PI / 180);

    this._context.fillText(text, 0, 0);

    this._context.restore();
  } else {
    this._context.fillText(text, x, y);
  }
};
/**
 * Plot graph curve.
 * @public
 * @param {array} array - Input data. [[x, y], [x, y]]
 * @param {string} color - Color of stroked line.
 * @param {int} lineWidth - Width in pixels of stroked line.
 */


Canvas.prototype.graph = function (array, color, lineWidth) {
  if (color) {
    this._context.strokeStyle = color;
  }

  if (lineWidth) {
    this._context.lineWidth = lineWidth;
  }

  this._context.beginPath();

  this._context.moveTo(array[0][0], array[0][1]);

  for (let i = 1; i < array.length; ++i) {
    this._context.lineTo(array[i][0], array[0][1]);
  }

  this._context.stroke();
};
/**
 * Fill entire canvas with the given color.
 * @public
 * @param {string} color - Color to use.
 */


Canvas.prototype.fill = function (color) {
  this.fillRectangle(0, 0, this.getContentWidth(), this.getContentHeight(), color);
};

Canvas.prototype.disableMouseInteraction = function () {
  this._canvas.style["pointer-events"] = "none";
};
/**
 * Calculate content X and Y.
 * @private
 */


Canvas.prototype._calculateContentPosition = function () {
  const compStyle = getComputedStyle(this._canvas);
  const ratio = this._ratio !== undefined ? this._ratio : 1;
  this._contentOffsetX = Math.round(ratio * parseFloat(compStyle.getPropertyValue("border-left-width").match(/\d+/)));
  this._contentOffsetY = Math.round(ratio * parseFloat(compStyle.getPropertyValue("border-top-width").match(/\d+/)));
  this._contentX = this._x + this._contentOffsetX;
  this._contentY = this._y + this._contentOffsetY;
};

/* harmony default export */ __webpack_exports__["default"] = (Canvas);

/***/ }),

/***/ "./src/Input.js":
/*!**********************!*\
  !*** ./src/Input.js ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function Input(attr) {
  const input = document.createElement("input");

  if (attr) {
    for (let i in attr) {
      input.setAttribute(i, attr[i]);
    }
  }

  function callback() {
    const value = parseInt(input.value);

    if (isNaN(value) || value < 0) {
      input.value = 0;
    } //Trigger custom enter event.


    input.dispatchEvent(new Event("done"));
  } //Loose focus or enter fires the format callback.


  input.addEventListener("change", callback); //Enter key pressed.

  input.addEventListener("keypress", e => {
    if (e.which === 13) {
      callback();
    }
  });
  return input;
}

/* harmony default export */ __webpack_exports__["default"] = (Input);

/***/ }),

/***/ "./src/Interaction.js":
/*!****************************!*\
  !*** ./src/Interaction.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Static__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Static */ "./src/Static.js");
/* harmony import */ var _Input__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Input */ "./src/Input.js");


/** 
 * Interaction is a class that handles the user interaction for the Graph class.
 */

/**
 * Create a new Interaction.
 * @public
 * @constructor
 * @param {Graph} graph - Graph instance this interaction belongs to.
 * @returns {Interaction}
 */

function Interaction(graph) {
  this._graph = graph;
}
/**
 * Update(add/remove) interaction events.
 * @public
 */


Interaction.prototype.updateOptions = function () {
  //Resizing.
  if (this._graph._options.interaction.resize && !this._resizeCallback) {
    this._resizeCallback = this._addResizeEvent();
  } else if (!this._graph._options.interaction.resize && this._resizeCallback) {
    window.removeEventListener("resize", this._resizeCallback);
    this._resizeCallback = undefined;
  } //Mouse tracking.


  if (this._graph._options.interaction.trackMouse && !this._mouseTrackingCallbacks) {
    this._mouseTrackingCallbacks = this._addMouseTrackingEvents();
  } else if (!this._graph._options.interaction.trackMouse && this._mouseTrackingCallbacks) {
    const canvas = this._graph._canvas.interaction.getCanvas();

    canvas.removeEventListener("mousemove", this._mouseTrackingCallbacks.mousemove);
    canvas.removeEventListener("mouseout", this._mouseTrackingCallbacks.mouseout);
    this._mouseTrackingCallbacks = undefined;
  } //Zooming.


  if (this._graph._options.interaction.zoom && !this._zoomCallbacks) {
    this._zoomCallbacks = this._addZoomEvents();
  } else if (!this._graph._options.interaction.zoom && this._zoomCallbacks) {
    let canvas = this._graph._canvas.interaction.getCanvas();

    canvas.removeEventListener("mousedown", this._zoomCallbacks.mousedown);
    canvas.removeEventListener("mousemove", this._zoomCallbacks.mousemove);
    canvas.removeEventListener("mouseup", this._zoomCallbacks.mouseup);
    canvas.removeEventListener("dblclick", this._zoomCallbacks.dblclick);
    canvas = this._graph._canvas.graph.getCanvas();
    canvas.removeEventListener("mouseup", this._zoomCallbacks.mouseup);
    canvas = this._graph._canvas.background.getCanvas();
    canvas.removeEventListener("mouseup", this._zoomCallbacks.mouseup);
    canvas.removeEventListener("mouseout", this._zoomCallbacks.mouseout);
    this._zoomCallbacks = undefined;
  } //Smooth option.


  if (this._graph._options.interaction.smoothing && !this._smoothingCallback) {
    this._smoothingCallback = this._addSmoothingEvent();
  } else if (!this._graph._options.interaction.smoothing && this._smoothingCallback) {
    this._smoothingInput.removeEventListener("change", this._smoothingCallback);

    this._smoothingCallback = undefined;

    this._smoothingInput.remove();

    this._smoothingInput = undefined;
  } //Every time options are updated. Update smoothing value if available.


  if (this._smoothingInput) {
    this._smoothingInput.value = this._graph._options.graph.smoothing;
  }

  this._createInteractionData();
};
/**
 * Clear interaction data.
 * @public
 */


Interaction.prototype.clear = function () {
  this._graph._canvas.interaction.clear();

  if (this._smoothingInput) {
    this._smoothingInput.style.display = "none";
  }
};
/**
 * Render interaction data.
 * @public
 */


Interaction.prototype.render = function () {
  if (this._smoothingInput) {
    this._smoothingInput.style.display = "block";
  }
};
/**
 * Inform the activity class that the graph has changed size and/or position.
 * @param {int} x - X-coordinate in pixels.
 * @param {int} y - Y-coordinate in pixels.
 * @param {int} width - Width in pixels.
 * @param {int} height - Height in pixels.
 */


Interaction.prototype.graphChangedSize = function (x, y, width, height) {
  if (this._smoothingInput) {
    this._smoothingInput.style.top = y + height - 21 + "px";
    this._smoothingInput.style.left = x + "px";
    this._smoothingInput.style.display = "block";
  }
};
/**
 * Add a resize event.
 * @private
 * @returns {object} Object containing callbacks.
 */


Interaction.prototype._addResizeEvent = function () {
  const graph = this._graph;
  const self = this;
  let timeOutResize; //Re-plots the graph on resize end.

  function resizeEnd() {
    graph._canvas.background.resize();

    graph._calculateGraphSize();

    graph._plot();

    timeOutResize = undefined;
    self._resizing = false;
  } //Clear graph, hightlight and spinner features on resize start.


  function resizeStart() {
    self._resizing = true;

    graph._canvas.graph.clear();

    graph._canvas.highlight.clear();

    graph._canvas.interaction.clear();

    graph._renderLegend();
  }

  let lastWidth = this._graph._canvas.background.getWidth();

  let lastHeight = this._graph._canvas.background.getHeight();

  let lastPixelRatio = window.devicePixelRatio;

  function callback() {
    //Make sure that the size actually have changed.
    if (lastWidth !== graph._canvas.background.getWidth() || lastHeight !== graph._canvas.background.getHeight() || lastPixelRatio !== window.devicePixelRatio) {
      lastWidth = graph._canvas.background.getWidth();
      lastHeight = graph._canvas.background.getHeight();
      lastPixelRatio = window.devicePixelRatio; //First time the function is called for this resize event.

      if (!timeOutResize) {
        resizeStart();
      } //Reset timer each time so that the resizeEnd function doesnt run until the user has stopped resizing.


      clearTimeout(timeOutResize);
      timeOutResize = setTimeout(resizeEnd, 500);
    }
  }

  window.addEventListener("resize", callback);
  return callback;
};
/**
 * Add mouse tracking events.
 * @private
 * @returns {object} Object containing callbacks.
 */


Interaction.prototype._addMouseTrackingEvents = function () {
  const self = this;
  const graph = this._graph;

  function mouseMoveCallback(e) {
    if (self.mouseDown || self._resizing || !graph._axes.x.hasBounds() || e.offsetX < 0) {
      return;
    }

    const valueX = graph._axes.x.pixelToValue(e.offsetX);

    const values = [valueX];

    graph._canvas.interaction.clear();

    for (let i = 0; i < graph._options.graph.dataY.length; ++i) {
      const dataY = graph._options.graph.dataY[i]; //Cant track unexisting values.

      if (!dataY.length) {
        break;
      }

      const dataXCallback = graph._options.getDataCallback("x", i);

      const res = _Static__WEBPACK_IMPORTED_MODULE_0__["default"].binarySearch(dataXCallback, dataY.length, valueX);
      let valueY; //Found exaxt X-value.

      if (res.found !== undefined) {
        if (graph._options.graph.smoothing) {
          valueY = _Static__WEBPACK_IMPORTED_MODULE_0__["default"].calculateSmothingValue(res.found, graph._options.graph.smoothing, dataY);
        } else {
          valueY = dataY[res.found];
        }
      } //Calculate Y-value from min max coordinates.
      else {
          const valueXMin = dataXCallback(res.min);
          const valueXMax = dataXCallback(res.max);
          const span = valueXMax - valueXMin;
          const weightMin = 1 - (valueX - valueXMin) / span;
          const weightMax = 1 - (valueXMax - valueX) / span;
          let valueMin, valueMax;

          if (graph._options.graph.smoothing) {
            valueMin = _Static__WEBPACK_IMPORTED_MODULE_0__["default"].calculateSmothingValue(res.min, graph._options.graph.smoothing, dataY);
            valueMax = _Static__WEBPACK_IMPORTED_MODULE_0__["default"].calculateSmothingValue(res.max, graph._options.graph.smoothing, dataY);
          } else {
            valueMin = dataY[res.min];
            valueMax = dataY[res.max];
          }

          valueY = valueMin * weightMin + valueMax * weightMax;
        }

      const pixelY = graph._axes.y.valueToPixel(valueY);

      self._interactionData[i].moveTo(e.offsetX, pixelY);

      values[i + 1] = valueY;
    }

    graph._renderLegend(values);
  }

  function mouseOutCallback() {
    if (!self.mouseDown) {
      graph._canvas.interaction.clear();

      graph._renderLegend();
    }
  }

  const canvas = this._graph._canvas.interaction.getCanvas();

  canvas.addEventListener("mousemove", mouseMoveCallback);
  canvas.addEventListener("mouseout", mouseOutCallback);
  return {
    mousemove: mouseMoveCallback,
    mouseout: mouseOutCallback
  };
};
/**
 * Add zoom events.
 * @private
 * @returns {object} - object containing callbacks.
 */


Interaction.prototype._addZoomEvents = function () {
  const graph = this._graph;
  const self = this;
  this.mouseDown = false;
  const threshold = 0.1 * Math.min(graph._canvas.interaction.getContentWidth(), graph._canvas.interaction.getContentHeight());
  let startX, startY; //true = horizontal. false = vertical.

  let lastHorizontal;
  const color = "rgba(130, 130, 130, 0.2)";
  let lastX, lastY;

  function callbackMouseDown(e) {
    if (!graph._axes.x.hasBounds() || !graph._axes.y.hasBounds()) {
      return;
    }

    lastX = startX = e.offsetX;
    lastY = startY = e.offsetY;
    self.mouseDown = true;
    lastHorizontal = undefined;

    graph._renderLegend();
  }

  function callbackMouseMove(e) {
    if (self.mouseDown && (e.offsetX !== lastX || e.offsetX !== lastY)) {
      lastX = e.offsetX;
      lastY = e.offsetY;
      const diffX = Math.abs(startX - e.offsetX);
      const diffY = Math.abs(startY - e.offsetY);
      const newHorizontal = diffX > diffY;

      if (newHorizontal === undefined || newHorizontal !== lastHorizontal && (newHorizontal ? diffX : diffY) > threshold) {
        lastHorizontal = newHorizontal;
      }

      graph._canvas.interaction.clear(); //Mark horizontally.


      if (lastHorizontal) {
        graph._canvas.interaction.fillRectangle2(startX, 0, e.offsetX, graph._canvas.interaction.getContentHeight(), color);
      } //Mark vertically.
      else {
          graph._canvas.interaction.fillRectangle2(0, startY, graph._canvas.interaction.getContentWidth(), e.offsetY, color);
        }
    }
  }

  function callbackMouseUp(e) {
    if (self.mouseDown) {
      if (startX !== e.offsetX || startY !== e.offsetY) {
        graph._canvas.interaction.clear(); //X-axis.


        if (lastHorizontal) {
          const x = clamp(0, e.offsetX, graph._canvas.interaction.getContentWidth());

          const min = graph._axes.x.pixelToValue(Math.min(startX, x));

          const max = graph._axes.x.pixelToValue(Math.max(startX, x));

          graph._axes.x.overrideBounds({
            min: min,
            max: max
          });
        } //Y-axis.
        else {
            const y = clamp(0, e.offsetY, graph._canvas.interaction.getContentHeight());

            const min = graph._axes.y.pixelToValue(Math.max(startY, y));

            const max = graph._axes.y.pixelToValue(Math.min(startY, y));

            graph._axes.y.overrideBounds({
              min: min,
              max: max
            });
          }

        graph._plot();
      }

      self.mouseDown = false;
    }
  }

  function callbackDoubleClick(e) {
    //Prevents double click from selecting the div.
    //Firefox, Chrome, etc.
    if (e.preventDefault) {
      e.preventDefault();
    } //IE
    else {
        e.returnValue = false;
        e.cancelBubble = true;
      }

    if (graph._axes.x.hasOverridenBounds() || graph._axes.y.hasOverridenBounds()) {
      graph._axes.x.clearOverridenBounds();

      graph._axes.y.clearOverridenBounds();

      graph._plot();
    }
  }

  function callbackMouseOut(e) {
    //Make sure we are in a drag event and that we are moving outside of the graph. Not inwards.
    if (!self.mouseDown || e.toElement === graph._canvas.graph.getCanvas() || e.toElement === graph._canvas.interaction.getCanvas()) {
      return;
    }

    graph._canvas.interaction.clear();

    self.mouseDown = false;
  }

  let canvas = graph._canvas.interaction.getCanvas();

  canvas.addEventListener("mousedown", callbackMouseDown);
  canvas.addEventListener("mousemove", callbackMouseMove);
  canvas.addEventListener("mouseup", callbackMouseUp);
  canvas.addEventListener("dblclick", callbackDoubleClick);
  canvas = this._graph._canvas.graph.getCanvas();
  canvas.addEventListener("mouseup", callbackMouseUp);
  canvas = this._graph._canvas.background.getCanvas();
  canvas.addEventListener("mouseup", callbackMouseUp);
  canvas.addEventListener("mouseleave", callbackMouseOut);
  return {
    mousedown: callbackMouseDown,
    mousemove: callbackMouseMove,
    mouseup: callbackMouseUp,
    dblclick: callbackDoubleClick,
    mouseout: callbackMouseOut
  };
};
/**
 * Add smoothing input event.
 * @returns {object} Object containing callbacks.
 */


Interaction.prototype._addSmoothingEvent = function () {
  this._smoothingInput = Object(_Input__WEBPACK_IMPORTED_MODULE_1__["default"])({
    type: "number",
    tabIndex: -1,
    maxLength: 6,
    value: 0,
    min: 0
  });
  this._smoothingInput.style["z-index"] = 5;
  this._smoothingInput.style.position = "absolute";
  this._smoothingInput.style.width = "50px";
  this._smoothingInput.style.height = "21px";
  this._smoothingInput.style["background-color"] = "white";
  this._smoothingInput.style["border-radius"] = 0;
  this._smoothingInput.style.border = "1px solid #ccc";
  this._smoothingInput.style.color = "#555";
  this._smoothingInput.style.padding = "0 0 0 5px";
  this._smoothingInput.style.display = "none";
  this._smoothingInput.className = ((this._smoothingInput.className || "") + " a-graph-smoothing-input").trim();

  this._graph._parent.append(this._smoothingInput);

  const self = this;

  function callbackDone() {
    let value = parseInt(self._smoothingInput.value); //Calculate min length for all data sets. Smoothing can't be greater than availalbe data points.

    let length = 4294967296;

    for (let i = 0; i < self._graph._options.graph.dataY.length; ++i) {
      length = Math.min(length, self._graph._options.graph.dataY[i].length);
    }

    if (2 * value + 1 > length) {
      value = Math.floor((length - 1) / 2);
    }

    self._smoothingInput.value = value;
    self._graph._options.graph.smoothing = value;

    self._graph._renderGraph();
  }

  this._smoothingInput.addEventListener("done", callbackDone);

  return callbackDone;
};
/**
 * Create interaction data.
 * @private
 */


Interaction.prototype._createInteractionData = function () {
  const radius = 3;
  const ctx = document.createElement("canvas").getContext("2d");
  this._interactionData = [];

  for (let i = 0; i < this._graph._options.graph.dataY.length; ++i) {
    //Clear area
    ctx.clearRect(0, 0, 2 * radius, 2 * radius); //Draw solid circle

    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.fillStyle = this._graph._options.graph.colors[i + 1];
    ctx.fill(); //If fill; draw black border to increase visibility.

    if (this._graph._options.graph.fill) {
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#000000";
      ctx.stroke();
    } //Get image data from tmp context.


    const imageData = ctx.getImageData(0, 0, 2 * radius, 2 * radius); //Add member data.

    const canvas = this._graph._canvas.interaction;

    imageData.moveTo = function (x, y) {
      canvas.putImageData(this, x, y, -radius, -radius);
    };

    this._interactionData[i] = imageData;
  }
};

/* harmony default export */ __webpack_exports__["default"] = (Interaction);
/**
 * Clamp the given value to the given range.
 * @param {type} min - Min value.
 * @param {type} number - Value to clamp.
 * @param {type} max - Max value.
 * @returns {Number} - Clamped value.
 */

function clamp(min, number, max) {
  if (number < min) {
    return min;
  } else if (number > max) {
    return max;
  } else {
    return number;
  }
}

/***/ }),

/***/ "./src/Is.js":
/*!*******************!*\
  !*** ./src/Is.js ***!
  \*******************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const Is = {};
/**
 * Check if the given object is a DOM element.
 * @param {object} obj - Object to evaluate.
 * @returns {bool}
 */

Is.isDOM = function (obj) {
  return obj instanceof HTMLElement;
};
/**
 * Check of the given object is null or undefined.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isNull = function (obj) {
  return obj === undefined || obj === null;
};
/**
 * Check of the given object is a object.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isObject = function (obj) {
  return obj !== null && typeof obj === 'object' && !Is.isArray(obj);
};
/**
 * Check of the given object is a function.
 * @private
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isFunction = function (obj) {
  return typeof obj === "function";
};
/**
 * Check of the given object is a bool.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isBool = function (obj) {
  return typeof obj === "boolean";
};
/**
 * Check of the given object is a number.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isNumber = function (obj) {
  return typeof obj === "number";
};
/**
 * Check of the given object is an integer.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isInt = function (obj) {
  return typeof obj === "number" && obj % 1 === 0;
};
/**
 * Check of the given object is an unsigned integer.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isUint = function (obj) {
  return typeof obj === "number" && obj >= 0 && obj % 1 === 0;
};
/**
 * Check of the given object is a string.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isString = function (obj) {
  return typeof obj === "string";
};
/**
 * Check of the given object is an Array.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isArray = function (obj) {
  return obj instanceof Array;
};
/**
 * Check of the given object is an typed array.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isTypedArray = function (obj) {
  return obj instanceof Int8Array || obj instanceof Uint8Array || obj instanceof Uint8ClampedArray || obj instanceof Int16Array || obj instanceof Uint16Array || obj instanceof Int32Array || obj instanceof Uint32Array || obj instanceof Float32Array || obj instanceof Float64Array;
};
/**
 * Check of the given object is an array or a typed array.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isAnyArray = function (obj) {
  return Is.isArray(obj) || Is.isTypedArray(obj);
};
/**
 * Check of the given object is a color.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isColor = function (obj) {
  var div = document.createElement("div");
  div.style.borderColor = "";
  div.style.borderColor = obj;
  return div.style.borderColor !== "";
};
/**
 * Check of the given object is a size.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isSize = function (obj) {
  var div = document.createElement("div");
  div.style.width = "";
  div.style.width = obj;
  return div.style.width !== "";
};
/**
 * Check of the given object is an alignment.
 * @public
 * @param {string} obj - Object to evaluate.
 * @param {bool} noCenter - If true the center alignment is not valid.
 * @returns {bool}
 */


Is.isAlignment = function (obj, noCenter) {
  obj = obj.toLowerCase();

  if (noCenter) {
    return obj === "left" || obj === "right";
  } else {
    return obj === "left" || obj === "center" || obj === "right";
  }
};
/**
 * Check of the given object is an composite operation.
 * @public
 * @param {string} obj - Object to evaluate.
 * @returns {bool}
 */


Is.isCompositeOperation = function (obj) {
  obj = obj.toLowerCase();
  return obj === "source-over" || obj === "source-in" || obj === "source-out" || obj === "source-atop" || obj === "destination-over" || obj === "destination-in" || obj === "destination-out" || obj === "destination-atop" || obj === "lighter" || obj === "copy" || obj === "xor" || obj === "multiply" || obj === "screen" || obj === "overlay" || obj === "darken" || obj === "lighten" || obj === "color-dodge" || obj === "color-burn" || obj === "hard-light" || obj === "soft-light" || obj === "difference" || obj === "exclusion" || obj === "hue" || obj === "saturation" || obj === "color" || obj === "luminosity";
};

Is.isBorderWidth = function (obj) {
  var div = document.createElement("div");
  div.style.borderWidth = "";
  div.style.borderWidth = obj;
  return div.style.borderWidth !== "";
};

Is.isBorderStyle = function (obj) {
  var div = document.createElement("div");
  div.style.borderStyle = "";
  div.style.borderStyle = obj;
  return div.style.borderStyle !== "";
};
/**
 * Get a callback to evaluate if the given data is of the specified type.
 * @param {string} type
 * @returns {function]
 * }
 */


Is.getCompareCallback = function (type) {
  switch (type) {
    case "number":
      return Is.isNumber;

    case "int":
      return Is.isInt;

    case "string":
      return Is.isString;

    case "bool":
      return Is.isBool;

    case "array":
      return Is.isArray;

    case "typedArray":
      return Is.isTypedArray;

    case "anyArray":
      return Is.isAnyArray;

    case "object":
      return Is.isObject;

    case "function":
      return Is.isFunction;

    case "color":
      return Is.isColor;

    case "size":
      return Is.isSize;

    case 'alignment':
      return Is.isAlignment;

    case 'compositeOperation':
      return Is.isCompositeOperation;

    case 'borderStyle':
      return Is.isBorderStyle;

    case 'borderWidth':
      return Is.isBorderWidth;

    case 'dom':
      return Is.isDOM;

    default:
      throw new Error("Is.getCompareCallback: No compare typed found for: " + type);
  }
};
/**
 * Get a list of callbacks to evaluate if the given data is of the specified type.
 * @param {string} type. Separated by |
 * @returns {array<function>]}
 */


Is.getCompareCallbacks = function (type) {
  var callbacks = [];
  var types = type.split("|");

  if (!types.length) {
    throw new Error("Is.getCompareCallbacks: types is empty.");
  }

  for (var i = 0; i < types.length; ++i) {
    callbacks.push(Is.getCompareCallback(types[i]));
  }

  return callbacks;
};
/**
 * Check if the array only contains items if the given type.
 * @public
 * @param {array} array - Array to check.
 * @param {string} type - Type to compare itmes against.
 * @returns {bool} - True if the array only contains items if the given type.
 */


Is.isContent = function (array, type) {
  var compareCallback = Is.getCompareCallback(type);

  for (var i = 0; i < array.length; ++i) {
    if (!compareCallback(array[i])) {
      return false;
    }
  }

  return true;
};

Is.isInOptions = function (value, options) {
  for (var i = 0; i < options.length; ++i) {
    if (options[i] === value) {
      return true;
    }
  }

  return false;
};

/* harmony default export */ __webpack_exports__["default"] = (Is);

/***/ }),

/***/ "./src/Options.js":
/*!************************!*\
  !*** ./src/Options.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Static__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Static */ "./src/Static.js");
/* harmony import */ var _Is__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Is */ "./src/Is.js");


/** 
 * The Options class is the options and associated functions for the Graph class.
 * See setDefault() for a desciption of the possible option parameters.
 */

/**
 * Create new Graph options.
 * @public
 * @constructor
 * @param {OPTIONS_OBJECT} options - Options to customize the graph.
 * @returns {Options}
 */

function Options(options) {
  this._isOk = true;

  this._createMembers();

  this.set(Options.getDefault());

  if (options) {
    this.set(options);
  }
}
/**
 * Check if the options are ok / valid.
 * @public
 * @returns {bool} - True if the options are ok.
 */


Options.prototype.isOk = function () {
  return this._isOk;
};
/**
 * Get color for a data set.  Index = 0 is X axis.
 * @public
 * @param {int} index - Index of the data set.
 * @returns {string} - CSS color string.
 */


Options.prototype.getColor = function (index) {
  return this.graph.colors[index] ? this.graph.colors[index] : "#000000";
};
/**
 * Get name for a data set. Index = 0 is X axis.
 * @public
 * @param {int} index - Index of the data set.
 * @returns {string}
 */


Options.prototype.getName = function (index) {
  if (this.graph.names[index] !== undefined) {
    return this.graph.names[index];
  } else if (index > 0) {
    return "DATA" + index;
  } else {
    return "X";
  }
};
/**
 * Get the font(family and size) for the legend label.
 * @public
 * @returns {string}
 */


Options.prototype.getLegendFont = function () {
  return this.legend.size + "px " + this.legend.font;
};
/**
 * Get the default options object.
 * @public
 * @returns {OPTIONS_OBJECT}
 */


Options.getDefault = function () {
  return {
    debug: false,
    interaction: {
      resize: true,
      trackMouse: true,
      zoom: true,
      smoothing: false
    },
    title: {
      label: "",
      bold: false,
      size: 20,
      offsetX: 0,
      offsetY: 0,
      padding: 5,
      font: "verdana",
      color: "black",
      align: "center"
    },
    legend: {
      location: "top",
      font: "Arial",
      size: 15,
      offsetX: 10,
      offsetY: 2,
      align: "right",
      newLine: false
    },
    graph: {
      dataX: [],
      dataY: [],
      colors: ["#000000", "#0000FF", "#FF0000", "#800080", "#00FF00", "#8080FF", "#FF8080", "#FF00FF", "#00FFFF"],
      names: [],
      lineWidth: 1,
      smoothing: 0,
      simplify: 0.1,
      fill: false,
      compositeOperation: "source-over"
    },
    axes: {
      tickMarkers: {
        show: true,
        length: 5,
        width: 1,
        offset: 0,
        color: "#BEBEBE"
      },
      tickLabels: {
        show: true,
        color: "black",
        font: "Arial",
        size: 12,
        width: 40,
        offset: 2
      },
      labels: {
        color: "black",
        font: "verdana",
        size: 15,
        offset: 3,
        padding: 0
      },
      x: {
        show: true,
        inverted: false,
        log: false,
        height: 0,
        label: "",
        legendValueFormatter: null,
        tickerValuePreFormatter: null,
        tickerValuePostFormatter: null,
        tickerLabelFormatter: null,
        ticker: null,
        grid: {
          width: 1,
          color: "#BEBEBE"
        },
        bounds: {
          min: null,
          max: null
        }
      },
      y: {
        show: true,
        inverted: false,
        log: false,
        width: 0,
        label: "",
        legendValueFormatter: null,
        tickerValuePreFormatter: null,
        tickerValuePostFormatter: null,
        tickerLabelFormatter: null,
        ticker: null,
        grid: {
          width: 1,
          color: "#BEBEBE"
        },
        bounds: {
          min: null,
          max: null
        }
      }
    },
    border: {
      style: "solid",
      color: "black",
      width: "0 0 1px 1px"
    },
    spinner: {
      //Options regarding the spinner.
      show: true,
      //Automatically show spinner when plotting data. Can always be activated manually.
      lines: 13,
      //The number of lines to draw.
      length: 30,
      //The length of each line.
      width: 10,
      //The line thickness.
      radius: 30,
      //The radius of the inner circle.
      corners: 1,
      //Corner roundness (0..1).
      rotate: 0,
      //The rotation offset.
      direction: 1,
      //1: clockwise, -1: counterclockwise
      color: "black",
      //#rgb or #rrggbb or array of colors
      speed: 1,
      //Revolutions per second
      trail: 50,
      //Afterglow percentage
      shadow: false,
      //If true a shadow is rendered.
      hwaccel: true,
      //If true hardware acceleration is used.
      position: 'relative',
      //Position type.
      top: "50%",
      //CenterY position relative to parent
      left: "50%" //CenterX position relative to parent

    }
  };
};
/**
 * Set new options.
 * @public
 * @param {OPTIONS_OBJECT} options - The options to set.
 */


Options.prototype.set = function (options) {
  function setMembers(oldObj, newObj, path) {
    for (let i in newObj) {
      if (!Array.isArray(oldObj) && !Object.prototype.hasOwnProperty.call(oldObj, i)) {
        //            if (!Array.isArray(oldObj) && !oldObj.hasOwnProperty(i)) { TODO
        console.warn("owp.graph WARNING: Can't set unexisting option: " + path + (path.length ? "." + i : i));
        continue;
      } //Member is a new object. Call function recursivly.


      if (_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isObject(newObj[i])) {
        setMembers(oldObj[i], newObj[i], path + (path.length ? "." : "") + i);
      } //Member is null or a base type. Set it.
      else {
          oldObj[i] = newObj[i];
        }
    }
  }

  setMembers(this, options, "");

  this._evalOptions();
};
/**
 * Callback function for getting data value for a given index.
 * Used instead of dataX[index] and dataY[index].
 * Has built in functionality for averaging. Implicit X-values and more.
 * @callback Options~getDataCallback
 * @param {int} index
 * @returns {number}
 */

/**
 * Get a callback used to get correct X and X value data.
 * Used by the graph render function to improve performance.
 * @public
 * @param {string} axis - X or Y axis.
 * @param {int} dataIndex - The index in the data set.
 * @returns {function}
 */


Options.prototype.getDataCallback = function (axis, dataIndex, start) {
  let data; //X-axis.

  if (axis.toLowerCase() === "x") {
    //Has no dataX. Return index + 1.
    if (this.graph.dataX.length === 0) {
      return function (index) {
        return index + 1;
      };
    } //Have one dataX for all dataY. 


    if (this.graph.dataX.length === 1) {
      data = this.graph.dataX[0];
    } //Have one dataX for each dataY. 
    else {
        data = this.graph.dataX[dataIndex];
      }
  } //Y-axis.
  else if (axis.toLowerCase() === "y") {
      data = this.graph.dataY[dataIndex]; //Use smoothing.

      if (this.graph.smoothing) {
        return this._getDataCallbackSmoothing(start, data);
      }
    } else {
      console.error("owp.graph ERROR: Unknown axis: " + axis);
    } //Default


  return function (index) {
    return data[index];
  };
};
/**
 * Return getDataCallback for smoothing
 * @private
 */


Options.prototype._getDataCallbackSmoothing = function (start, data) {
  const centralIndex = Math.max(0, start - 1);
  const window = _Static__WEBPACK_IMPORTED_MODULE_0__["default"].getSmoothingWindow(centralIndex, this.graph.smoothing, data.length);
  let low = window.low;
  let high = window.high;
  let sum = 0;

  for (let i = low; i <= high; ++i) {
    sum += data[i];
  }

  const threshold = 2 * this.graph.smoothing;
  return function (index) {
    //Decrease window size.
    if (high === data.length - 1) {
      low = index + index - high;
      sum = 0;

      for (let i = low; i <= high; ++i) {
        sum += data[i];
      }
    } //Increase window size.
    else if (high < threshold) {
        high = index + index - low;
        sum = 0;

        for (let i = low; i <= high; ++i) {
          sum += data[i];
        }
      } //Move window.
      else {
          sum -= data[low];
          ++low;
          ++high;
          sum += data[high];
        } //Calculate average value.


    return sum / (high - low + 1);
  };
};
/**
 * Evaluates the options and sets ok status flag.
 * @private
 */


Options.prototype._evalOptions = function () {
  var optionsOk = true;
  var obj, obj2, name, name2;
  var options = this;

  function set(path) {
    name = path;
    obj = options;
    var paths = path.split(".");

    for (var i = 0; i < paths.length; ++i) {
      obj = obj[paths[i]];
    }
  }

  function set2(path) {
    name2 = path;
    obj2 = options;
    var paths = path.split(".");

    for (var i = 0; i < paths.length; ++i) {
      obj2 = obj2[paths[i]];
    }
  }

  function error(msg) {
    console.error("owp.graph ERROR: invalid option. " + name + ": " + msg);
    optionsOk = false;
  }

  function evalObject() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isObject(obj);

    if (!res) {
      error("\"" + obj + "\" is not an object.");
    }

    return res;
  }

  function evalBool() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isBool(obj);

    if (!res) {
      error("\"" + obj + "\" is not a bool.");
    }

    return res;
  }

  function evalNumber() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNumber(obj);

    if (!res) {
      error("\"" + obj + "\" is not a number.");
    }

    return res;
  }

  function evalInt() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isInt(obj);

    if (!res) {
      error("\"" + obj + "\" is not an integer.");
    }

    return res;
  }

  function evalString() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isString(obj);

    if (!res) {
      error("\"" + obj + "\" is not a string.");
    }

    return res;
  }

  function evalArray() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isArray(obj);
    res = true;

    if (!res) {
      error("\"" + obj + "\" is not an array.");
    }

    return res;
  }

  function evalFunction() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isFunction(obj);

    if (!res) {
      error("\"" + obj + "\" is not a function.");
    }

    return res;
  }

  function evalAlign(noCenter) {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isAlignment(obj, noCenter);

    if (!res) {
      error("\"" + obj + "\" is not an valid alignment.");
    }

    return res;
  }

  function evalColor() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isColor(obj);

    if (!res) {
      error("\"" + obj + "\" is not a valid color.");
    }

    return res;
  }

  function evalFont() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isString(obj);

    if (!res) {
      error("\"" + obj + "\" is not a valid font.");
    }

    return res;
  }

  function evalSize() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isSize(obj);

    if (!res) {
      error("\"" + obj + "\" is not a valid size.");
    }

    return res;
  }

  function evalBorderStyle() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isBorderStyle(obj);

    if (!res) {
      error("\"" + obj + "\" is not a valid border style.");
    }

    return res;
  }

  function evalBorderWidth() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isBorderWidth(obj);

    if (!res) {
      error("\"" + obj + "\" is not a valid border width.");
    }

    return res;
  }

  function evalCompositeOperation() {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isCompositeOperation(obj);

    if (!res) {
      error("\"" + obj + "\" is not a composite operation.");
    }

    return res;
  }

  function evalArrayContains(type) {
    var res = _Is__WEBPACK_IMPORTED_MODULE_1__["default"].isContent(obj, type);

    if (!res) {
      error("\"[" + obj + "]\" contains object type other than: " + type + ".");
    }

    return res;
  }

  function evalCond(cond) {
    var res = eval(cond);

    if (!res) {
      cond = cond.replaceAll("obj2", name2).trim();
      cond = cond.replaceAll("obj.", "").trim();
      cond = cond.replaceAll("obj", "").trim();

      if (_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isArray(obj)) {
        error("Failed condition: " + cond);
      } else {
        error("\"" + obj + "\" failed condition: " + cond);
      }
    }

    return res;
  }

  set("debug");
  evalBool();
  set("interaction");

  if (evalObject()) {
    set("interaction.resize");
    evalBool();
    set("interaction.trackMouse");
    evalBool();
    set("interaction.zoom");
    evalBool();
    set("interaction.smoothing");
    evalBool();
  }

  set("title");

  if (evalObject()) {
    set("title.bold");
    evalBool();
    set("title.label");
    evalString();
    set("title.size");
    evalInt();
    evalCond("obj > 0");
    set("title.offsetX");
    evalInt();
    set("title.offsetY");
    evalInt();
    set("title.padding");
    evalInt();
    set("title.font");
    evalFont();
    set("title.color");
    evalColor();
    set("title.align");
    evalAlign();
  }

  set("legend");

  if (evalObject()) {
    set("legend.location");
    evalString();
    set("legend.font");
    evalFont();
    set("legend.size");

    if (evalInt()) {
      evalCond("obj > 0");
    }

    set("legend.offsetX");

    if (evalInt()) {
      evalCond("obj >= 0");
    }

    set("legend.offsetY");

    if (evalInt()) {
      evalCond("obj >= 0");
    }

    set("legend.align");
    evalAlign(true);
    set("legend.newLine");
    evalBool();
  }

  set("graph");

  if (evalObject()) {
    set("graph.dataX");

    if (evalArray()) {
      evalArrayContains("anyArray");
      set2("graph.dataY");

      if (evalCond("obj.length === 0 || obj.length === 1 || obj.length === obj2.length")) {
        evalCond("obj.length <= obj2.length");
      }
    }

    set("graph.dataY");

    if (evalArray()) {
      evalArrayContains("anyArray");
      set2("graph.dataX"); //Only one dataX(incl implicit). All dataY have to be of the same size.

      if (obj2.length === 0 || obj2.length === 1) {
        //Check so that all dataY are the same size.
        for (let i = 0; i < obj.length; ++i) {
          if (obj[i].length !== obj[0].length) {
            error("Not all arrays are of the same size.");
          }
        } //If dataX.length == 1. Check if same length as dataY.


        if (obj2.length === 1 && (!obj.length || obj2[0].length !== obj[0].length)) {
          error("Size does not match dataX.");
        }
      } //dataX.length == dataY.length. Check that each pair(x,y) are the same length.
      else if (obj.length === obj2.length) {
          for (let i = 0; i < obj.length; ++i) {
            if (obj[i].length !== obj2[i].length) {
              error("dataY[" + i + "].length != dataX[" + i + "].length");
            }
          }
        }
    }

    set("graph.colors");

    if (evalArray()) {
      evalArrayContains("color");
    }

    set("graph.names");

    if (evalArray()) {
      evalArrayContains("string");
    }

    set("graph.lineWidth");

    if (evalNumber()) {
      evalCond("obj >= 0");
    }

    set("graph.smoothing");

    if (evalInt()) {
      evalCond("obj >= 0");
    }

    set("graph.simplify");

    if (evalNumber()) {
      evalCond("obj >= 0 && obj <= 1");
    }

    set("graph.fill");
    evalBool();
    set("graph.compositeOperation");
    evalCompositeOperation();
  }

  set("axes");

  if (evalObject()) {
    set("axes.tickMarkers");

    if (evalObject()) {
      set("axes.tickMarkers.show");
      evalBool();
      set("axes.tickMarkers.length");

      if (evalInt()) {
        evalCond("obj > 0");
      }

      set("axes.tickMarkers.width");

      if (evalInt()) {
        evalCond("obj > 0");
      }

      set("axes.tickMarkers.offset");

      if (evalInt()) {
        evalCond("obj >= 0");
      }

      set("axes.tickMarkers.color");
      evalColor();
    }

    set("axes.tickLabels");

    if (evalObject()) {
      set("axes.tickLabels.show");
      evalBool();
      set("axes.tickLabels.color");
      evalColor();
      set("axes.tickLabels.font");
      evalFont();
      set("axes.tickLabels.size");

      if (evalInt()) {
        evalCond("obj > 0");
      }

      set("axes.tickLabels.width");

      if (evalInt()) {
        evalCond("obj > 0");
      }

      set("axes.tickLabels.offset");

      if (evalInt()) {
        evalCond("obj >= 0");
      }
    }

    set("axes.labels");

    if (evalObject()) {
      set("axes.labels.color");
      evalColor();
      set("axes.labels.font");
      evalFont();
      set("axes.labels.size");

      if (evalInt()) {
        evalCond("obj > 0");
      }

      set("axes.labels.offset");
      evalInt();
      set("axes.labels.padding");

      if (evalInt()) {
        evalCond("obj >= 0");
      }
    } //axes x and y


    var axes = ["axes.x", "axes.y"];

    for (var i = 0; i < axes.length; ++i) {
      set(axes[i]);

      if (evalObject()) {
        set(axes[i] + ".show");
        evalBool();
        set(axes[i] + ".inverted");
        evalBool();
        set(axes[i] + ".log");
        evalBool();
        set(axes[i] + "." + (axes[i] === "axes.x" ? "height" : "width"));
        evalInt();
        evalCond("obj >= 0");
        set(axes[i] + ".grid");

        if (evalObject()) {
          set(axes[i] + ".grid.width");
          evalInt();
          evalCond("obj >= 0");
          set(axes[i] + ".grid.color");
          evalColor();
        }

        set(axes[i] + ".label");
        evalString();
        set(axes[i] + ".bounds");

        if (evalObject()) {
          set(axes[i] + ".bounds.min");

          if (!_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(obj)) {
            evalNumber();
            set2(axes[i] + ".log");

            if (obj2 && obj <= 0) {
              error("\"[" + obj + "]\" When axis is logarithmic all bounds must be greather than 0.");
            }
          }

          set(axes[i] + ".bounds.max");

          if (!_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(obj)) {
            evalNumber();
            set2(axes[i] + ".log");

            if (obj2 && obj <= 0) {
              error("\"[" + obj + "]\" When axis is logarithmic all bounds must be greather than 0.");
            }
          }

          set(axes[i] + ".bounds.min");
          set2(axes[i] + ".bounds.max");

          if (!_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(obj) && !_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(obj2)) {
            evalCond("obj < obj2");
          }
        }

        set(axes[i] + ".legendValueFormatter");

        if (!_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(obj)) {
          evalFunction();
        }

        set(axes[i] + ".tickerValuePreFormatter");

        if (!_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(obj)) {
          evalFunction();
        }

        set(axes[i] + ".tickerValuePostFormatter");

        if (!_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(obj)) {
          evalFunction();
        }

        set(axes[i] + ".tickerLabelFormatter");

        if (!_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(obj)) {
          evalFunction();
        }

        set(axes[i] + ".ticker");

        if (!_Is__WEBPACK_IMPORTED_MODULE_1__["default"].isNull(obj)) {
          evalFunction();
        }
      }
    }
  }

  set("border");

  if (evalObject()) {
    set("border.style");
    evalBorderStyle();
    set("border.color");
    evalColor();
    set("border.width");
    evalBorderWidth();
  }

  set("spinner");

  if (evalObject()) {
    set("spinner.show");
    evalBool();
    set("spinner.lines");

    if (evalInt()) {
      evalCond("obj > 0");
    }

    set("spinner.length");

    if (evalInt()) {
      evalCond("obj > 0");
    }

    set("spinner.width");

    if (evalInt()) {
      evalCond("obj > 0");
    }

    set("spinner.radius");

    if (evalInt()) {
      evalCond("obj > 0");
    }

    set("spinner.corners");

    if (evalNumber()) {
      evalCond("obj >= 0 && obj <= 1");
    }

    set("spinner.rotate");

    if (evalInt()) {
      evalCond("obj >= 0");
    }

    set("spinner.direction");

    if (evalInt()) {
      evalCond("obj === -1 || obj === 1");
    }

    set("spinner.color");
    evalColor();
    set("spinner.speed");

    if (evalNumber()) {
      evalCond("obj > 0");
    }

    set("spinner.trail");

    if (evalInt()) {
      evalCond("obj >= 0");
    }

    set("spinner.shadow");
    evalBool();
    set("spinner.hwaccel");
    evalBool();
    set("spinner.position");

    if (evalString()) {
      evalCond("obj === 'relative' || obj === 'absolute'");
    }

    set("spinner.top");
    evalSize();
    set("spinner.left");
    evalSize();
  }

  this._isOk = optionsOk;
};
/**
 * Create all the members that contains the user given settings.
 * @private
 */


Options.prototype._createMembers = function () {
  this.debug = null;
  this.interaction = {
    resize: null,
    trackMouse: null,
    zoom: null,
    smoothing: null
  };
  this.title = {
    show: null,
    bold: null,
    label: null,
    size: null,
    offsetX: null,
    offsetY: null,
    padding: null,
    font: null,
    color: null,
    align: null
  };
  this.legend = {
    location: null,
    font: null,
    size: null,
    offsetX: null,
    offsetY: null,
    align: null,
    newLine: null
  };
  this.graph = {
    dataX: null,
    dataY: null,
    colors: null,
    names: null,
    lineWidth: null,
    smoothing: null,
    simplify: null,
    fill: null,
    compositeOperation: null
  };
  this.axes = {
    tickMarkers: {
      show: null,
      length: null,
      width: null,
      offset: null,
      color: null
    },
    tickLabels: {
      show: null,
      color: null,
      font: null,
      size: null,
      width: null,
      offset: null
    },
    labels: {
      show: null,
      color: null,
      font: null,
      size: null,
      offset: null,
      padding: null
    },
    x: {
      show: null,
      inverted: null,
      log: null,
      height: null,
      label: null,
      legendValueFormatter: null,
      tickerValuePreFormatter: null,
      tickerValuePostFormatter: null,
      tickerLabelFormatter: null,
      ticker: null,
      grid: {
        width: null,
        color: null
      },
      bounds: {
        min: null,
        max: null
      }
    },
    y: {
      show: null,
      inverted: null,
      log: null,
      width: null,
      label: null,
      legendValueFormatter: null,
      tickerValuePreFormatter: null,
      tickerValuePostFormatter: null,
      tickerLabelFormatter: null,
      ticker: null,
      grid: {
        width: null,
        color: null
      },
      bounds: {
        min: null,
        max: null
      }
    }
  };
  this.border = {
    style: null,
    color: null,
    width: null
  };
  this.spinner = {
    show: null,
    lines: null,
    length: null,
    width: null,
    radius: null,
    corners: null,
    rotate: null,
    direction: null,
    color: null,
    speed: null,
    trail: null,
    shadow: null,
    hwaccel: null,
    position: null,
    top: null,
    left: null
  };
};
/**
 @typedef OPTIONS_OBJECT
 @type {object}

 @property {bool} debug - If true debug info will be outputted to the console.

 @property {object} interaction - Options regarding user interaction with the graph.
 @property {bool} resize - If true the graph will be resized automatically.
 @property {bool} trackMouse - If true the mouse cursor will track the graph lines.
 @property {bool} zoom - If true zoom is enabled.
 @property {bool} smoothing - If true interactive smoothing input is enabled.

 @property {object} title - Options regarding the title.
 @property {string} title.label - The text of the label. Set to "" to hide the label.
 @property {bool} title.bold - If true the label font is bold.
 @property {int} title.size - Font height/size in pixels of the text.
 @property {int} title.offsetX - X-axis offset in pixels. Between title and graph vertical side.
 @property {int} title.offsetY - Y-axis offset in pixels. Between title and outer top edge.
 @property {int} title.padding - Padding in pixels. Between title and graph.
 @property {string} title.font - Font family of the text.
 @property {string} title.color - Color of the text.
 @property {string} title.align - Title alignment. ["left", "center", "right"]

 @property {object} legend - Options regarding the legend.
 @property {bool} legend.show - If true the legend is shown.
 @property {string} legend.font - Font family of the text.
 @property {int} legend.size - Font size/height in pixels.
 @property {int} legend.offsetX - Y-axis offset in pixels. Between legend and graph vertical side.
 @property {int} legend.offsetY - X-axis offset in pixels. Between legend and graph top.
 @property {int} legend.align -  The legend alignment. ["left", "right"]
 @property {int} legend.newLine -  If true a new line is made between each data set.

 @property {object} graph - Options regarding the graph curve.
 @property {array<array>} graph.dataX - List of data sets for the X-axis. Can contain typed arrays.
 @property {array<array>} graph.dataY - List of data sets for the Y-axis. Can contain typed arrays.
 @property {array<string>} graph.colors - List of colors for each dataY set.
 @property {array<string>} graph.names - List of names for each dataY set.
 @property {int} graph.lineWidth - Width in pixels of the stroked line.
 @property {int} graph.smoothing - Number of samples on each side of the central value for the central moving average algorithm. 0 = disabled.
 @property {int} graph.simplify - Pixel tolerance for the simplification algorithm. 0 = disabled.
 @property {bool} graph.fill - If true the area under the graph will be filled.
 @property {string} graph.compositeOperation - Context global composit operation.

 @property {object} axes - Options regarding the axes.

 @property {object} axes.tickMarkers - Options regarding the tick markers.
 @property {bool} axes.tickMarkers.show - If true the tick markers are shown.
 @property {int} axes.tickMarkers.length - Length in pixels of the markers.
 @property {int} axes.tickMarkers.width - Width in pixels of the markers.
 @property {int} axes.tickMarkers.offset - Offset in pixels. Between graph and markers.
 @property {string} axes.tickMarkers.color - Color of the tick markers.

 @property {object} axes.tickLabels - Options regarding the tick labels.
 @property {bool} axes.tickLabels.show - If true the tick labels are shown.
 @property {string} axes.tickLabels.color - Color of the text.
 @property {string} axes.tickLabels.font - Font family of the text.
 @property {int} axes.tickLabels.size - Font size/height in pixels of the text.
 @property {int} axes.tickLabels.width - Max width of the labels. Used to calculate ticks.
 @property {int} axes.tickLabels.offset - Offset in pixels. Between graph and markers.

 @property {object} axes.labels - Options regarding the axes labels.
 @property {string} axes.labels.color - Color of the text.
 @property {string} axes.labels.font - Font family of the text.
 @property {int} axes.labels.size - Font size/height in pixels of the text.
 @property {int} axes.labels.offset - Offset in pixels. Between outer edge and labels.
 @property {int} axes.labels.padding - Padding in pixels. Between label and graph.

 @property {object} axes.x - Options regarding the X-axis.
 @property {bool} axes.x.show - If true the X-axis is shown.
 @property {bool} axes.x.inverted - If true the axis direction is inverted.
 @property {bool} axes.x.log - If true the values on the axis are logarithmically distributed.
 @property {int} axes.x.height - Height in pixels of the axis. 0 = automatic size.
 @property {int} axes.x.label - Text of the axis label. Set to "" to hide the label.
 @property {formatterCallback} axes.x.valueFormatter - Callback that formats the values. Null = default callback.
 @property {tickerCallback} axes.x.ticker - Callback that creates the ticks. Null = default callback.
 @property {formatterCallback} axes.x.valueFormatter - Callback that formats the axis labels. Null = default callback.

 @property {object} axes.x.grid - Options regarding the X-axis grid.
 @property {int} axes.x.grid.width - Grid line width/thickness in pixels. 0 = no grid.
 @property {string} axes.x.grid.color - Color of the grid lines.

 @property {object} axes.x.bounds - Options regarding the X-axis bounds.
 @property {number} axes.x.bounds.min - Min/lower bounds value. Null = automatic value.
 @property {number} axes.x.bounds.max - Max/upper bounds value. Null = automatic value.

 @property {object} axes.y - Options regarding the Y-axis.
 @property {bool} axes.y.show - If true the X-axis is shown.
 @property {bool} axes.y.inverted - If true the axis direction is inverted.
 @property {bool} axes.y.log - If true the values on the axis are logarithmically distributed.
 @property {int} axes.y.width - Width in pixels of the axis. 0 = automatic size.
 @property {int} axes.y.label - Text of the axis label. Set to "" to hide the label.
 @property {formatterCallback} axes.y.valueFormatter - Callback that formats the values. Null = default callback.
 @property {tickerCallback} axes.y.ticker - Callback that creates the ticks. Null = default callback.
 @property {formatterCallback} axes.y.valueFormatter - Callback that formats the axis labels. Null = default callback.

 @property {object} axes.y.grid - Options regarding the Y-axis grid.
 @property {int} axes.y.grid.width - Grid line width/thickness in pixels. 0 = no grid.
 @property {string} axes.y.grid.color - Color of the grid lines.

 @property {object} axes.y.bounds - Options regarding the Y-axis bounds.
 @property {number} axes.y.bounds.min - Min/lower bounds value. Null = automatic value.
 @property {number} axes.y.bounds.max - Max/upper bounds value. Null = automatic value.

 @property {object} border - Options regarding the graph border.
 @property {string} border.style - Border style. solid, dotted...
 @property {string} border.color - Color of the border lines. red, #FF0000, rgb(255,0,0)
 @property {string} border.width - Width/thickness in pixels of the border. 1px, 1px 2px, 1px 2px 3px 4px.


 */

/**
 * Callback function for formatting values.
 * @callback formatterCallback
 * @param {number} value
 * @returns {string}
 */

/**
 * Callback function for creating ticks.
 * @callback tickerCallback
 * @param {bool} isLog - True if the values are going to be logarithmically distributed.
 * @param {number} minValue - Min/lower bounds value.
 * @param {number} maxValue - Max/upper bounds value.
 * @param {int} graphSize - Size(width or height) of graph in pixels.
 * @param {int} labelSize - Size(width or height) of tick labels in pixels.
 * @returns {array<{value:number}>}
 */


/* harmony default export */ __webpack_exports__["default"] = (Options);

/***/ }),

/***/ "./src/Static.js":
/*!***********************!*\
  !*** ./src/Static.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/** 
 * Static functions.
 */
const Static = {};
/**
 * Create dummy test data.
 * @public
 * @static
 * @param {int} size - Number of values to create.
 * @param {string} type - float or int.
 * @returns {array}
 */

Static.createDummyData = function (size, type) {
  let seed = 3;

  function random() {
    seed = Math.sin(seed) * 10000;
    return seed - Math.floor(seed);
  }

  const data = [];
  const buffer1 = new ArrayBuffer(size * 4);
  const buffer2 = new ArrayBuffer(size * 4);

  if (type && type.toLowerCase() === "int") {
    const intY = new Uint32Array(buffer1);

    for (let i = 0; i < size; ++i) {
      intY[i] = i + 1;
    }

    data.push(intY);
  } else if (type && type.toLowerCase() === "float") {
    const floatY1 = new Float32Array(buffer1);
    const floatY2 = new Float32Array(buffer2);
    const mult = Math.PI / 100;

    for (let i = 0; i < size; ++i) {
      floatY1[i] = Math.sin(i * mult) * random();
      floatY2[i] = Math.cos(i * mult) * random();
    }

    data.push(floatY1);
    data.push(floatY2);
  } else {
    console.warn("owp.graph WARNING: Can't create dummy data. Invalid type: \"" + type + "\"");
  }

  return data;
};
/**
 * Calculate the smoothed value for a given index.
 * @public
 * @param {array} data
 * @param {int} index
 * @param {int} smoothing
 * @returns {number}
 */


Static.calculateSmothingValue = function (index, smoothing, data) {
  const window = Static.getSmoothingWindow(index, smoothing, data.length);
  let sum = 0;

  while (window.low <= window.high) {
    sum += data[window.low++];
  }

  return sum / window.length;
};
/**
 * Get the smoothing window indices.
 * @param {int} index - Index for central value.
 * @param {int} smoothing - Smootrhing value. Number of samples on each side of central value.
 * @param {int} length - Length of data set.
 * @returns {undefined}
 */


Static.getSmoothingWindow = function (index, smoothing, length) {
  //Distance to list start.
  const diffToMin = Math.max(0, index); //Distance to list end.

  const diffToMax = length - 1 - index; //Shortest distance of min, max and smoothing window.

  const diff = Math.min(diffToMin, diffToMax, smoothing);
  return {
    low: index - diff,
    high: index + diff,
    length: 2 * diff + 1
  };
};
/**
 * Binary search. Get index for given value.
 * @private
 * @static
 * @param {callback} dataCallback - Callback to get value for given index.
 * @param {type} size - Size of data set.
 * @param {type} value - Value to find
 * @returns {object} If found: {found: n}. Else: {min, max} where min > value index < max.
 */


Static.binarySearch = function (dataCallback, size, value) {
  let min = 0;
  let max = size - 1;

  while (min <= max) {
    const mid = Math.floor((min + max) / 2); //Value is smaller than mid.

    if (value < dataCallback(mid)) {
      max = mid - 1;
    } //Value is larger than mid.
    else if (value > dataCallback(mid)) {
        min = mid + 1;
      } //Found value.
      else {
          return {
            found: mid
          };
        }
  }

  min = Math.min(min, max);
  max = Math.max(min, max, 0); //Value is larger than max index. Increment max.

  if (value > dataCallback(max)) {
    ++max;
  } //Value is smaller than min index. Decrement min.
  else if (value < dataCallback(min)) {
      --min;
    }

  return {
    min: Math.max(min, 0),
    max: Math.min(max, size - 1)
  };
};
/**
 * Get text width in pixels.
 * @public
 * @param {string} text - Text to meassure.
 * @param {string} font - Font to use.
 * @returns {int} - Width in pixels.
 */


const context = document.createElement("canvas").getContext("2d");

Static.getTextWidth = function (text, font) {
  if (font) {
    context.font = font;
  }

  return context.measureText(text).width;
};
/**
 * Round the given number to the given precision.
 * @public
 * @param {number} value
 * @param {int} decimals - Number of decimals.
 * @returns {number}
 */


Static.round = function (value, decimals) {
  if (!decimals) {
    return Math.round(value);
  } else {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }
};

/* harmony default export */ __webpack_exports__["default"] = (Static);

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_spin_min__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/spin.min */ "./src/lib/spin.min.js");
/* harmony import */ var _lib_spin_min__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_lib_spin_min__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Canvas__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Canvas */ "./src/Canvas.js");
/* harmony import */ var _Axis__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Axis */ "./src/Axis.js");
/* harmony import */ var _Interaction__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Interaction */ "./src/Interaction.js");
/* harmony import */ var _Static__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Static */ "./src/Static.js");
/* harmony import */ var _Options__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Options */ "./src/Options.js");
/* harmony import */ var _Is__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Is */ "./src/Is.js");
/*
* @author Andreas Arvidsson
 * https://github.com/AndreasArvidsson/OpenWebProject-graph
 */
if (!window.HTMLCanvasElement || !window.CanvasRenderingContext2D) {
  throw Error("owp.graph ERROR: Your browser does not support the HTML5 Canvas.");
}








/** 
 * The Graph class is a 2D graph plotter.
 * Built with performance and customizability in mind. Supports multiple data
 * sets and all data sets are available as typed arrays.
 */

/**
 * Create new graph.
 * @public
 * @constructor
 * @param {dom} parent - Parent div.  DOM or ID string. Graph will fill this div.
 * @param {OPTIONS_OBJECT} options - Options to customize the graph.
 * @returns {Graph}
 */

function Graph(parent, options) {
  if (this instanceof Graph) {
    this._init(parent, options);
  } //The new keyword was omitted.
  else {
      return new Graph(parent, options);
    }
}
/**
 * Implementation of the constructor.
 * @private
 * @param {dom} parent - Parent div. DOM or ID string. Graph will fill this div.
 * @param {OPTIONS} options - Options to customize the graph.
 */


Graph.prototype._init = function (parent, options) {
  if (!parent) {
    console.error("owp.graph ERROR: Parent dom is null");
    return;
  }

  parent.style.position = "relative";
  this._parent = parent;
  this._options = new _Options__WEBPACK_IMPORTED_MODULE_5__["default"]();
  this._highlights = [];
  this._canvas = {
    background: new _Canvas__WEBPACK_IMPORTED_MODULE_1__["default"](parent, "background"),
    graph: new _Canvas__WEBPACK_IMPORTED_MODULE_1__["default"](parent, "graph", true),
    highlight: new _Canvas__WEBPACK_IMPORTED_MODULE_1__["default"](parent, "highlight"),
    interaction: new _Canvas__WEBPACK_IMPORTED_MODULE_1__["default"](parent, "interaction")
  };

  this._canvas.background.setZIndex(0);

  this._canvas.graph.setZIndex(1);

  this._canvas.highlight.setZIndex(2); //Spinner uses zIndex 3.


  this._canvas.interaction.setZIndex(4); //Smoothing input used zIndex 5.


  this._axes = {
    x: new _Axis__WEBPACK_IMPORTED_MODULE_2__["default"](this._options, this._canvas.graph, "x"),
    y: new _Axis__WEBPACK_IMPORTED_MODULE_2__["default"](this._options, this._canvas.graph, "y")
  };
  this._interaction = new _Interaction__WEBPACK_IMPORTED_MODULE_3__["default"](this);

  if (options) {
    this.setOptions(options);
  } else {
    console.warn("owp.graph WARNING: No options set. Uses default.");
    this.setOptions({});
  }
};
/**
 * Create legend canvas and attach to parent dom.
 * @private
 */


Graph.prototype._initLegend = function () {
  const location = this._options.legend.location;

  if (location && this._options.interaction.trackMouse) {
    //DIV id.
    if (location.toLowerCase() !== "top" && location.toLowerCase() !== "right") {
      const legendDiv = document.getElementById(location);

      if (legendDiv) {
        legendDiv.style.position = "relative"; //Reuse existing canvas.

        if (this._canvas.legend) {
          this._canvas.legend.setParent(legendDiv);
        } //Create new canvas.
        else {
            this._canvas.legend = new _Canvas__WEBPACK_IMPORTED_MODULE_1__["default"](legendDiv);
          }
      } else {
        console.warn("owp.graph WARNING: Legend location: \"" + location + "\" not found.");
      }
    } else {
      //Set same parent for legend as rest of graph.
      if (this._canvas.legend) {
        this._canvas.legend.setParent(this._parent);
      } else {
        this._canvas.legend = new _Canvas__WEBPACK_IMPORTED_MODULE_1__["default"](this._parent);

        this._canvas.legend.disableMouseInteraction();
      }

      if (location.toLowerCase() === "top") {
        this._canvas.legend.setSize("100%", this._options.legend.size);
      } else if (location.toLowerCase() === "right") {
        this._canvas.legend.setPosition(0, 0, true);

        this._canvas.legend.setSize(200, "100%");
      }
    }
  } //Remove old legend.
  else if (this._canvas.legend) {
      this._canvas.legend.setParent();

      this._canvas.legend = undefined;
    }
};
/**
 * Renders the legend on the background canvas.
 * @private
 */


Graph.prototype._renderLegend = function (values) {
  if (!this._canvas.legend || !this._options.graph.dataY.length) {
    return;
  }

  const settings = this._options.legend;
  const canvas = this._canvas.legend;
  canvas.clear();
  canvas.set("font", this._options.getLegendFont());
  canvas.set("textBaseline", "top");
  canvas.set("textAlign", settings.align);
  const isTop = settings.location.toLowerCase() === "top";
  const alignLeft = settings.align.toLowerCase() === "left"; //newLine is disabled for top location.

  const newLine = settings.newLine && !isTop || settings.location.toLowerCase() === "right";
  let x = alignLeft ? this._options.legend.offsetX : canvas.getWidth() - this._options.legend.offsetX; //OffsetY is disabled for top location.

  let y = isTop ? 0 : this._options.legend.offsetY;

  function printValue(color, name, value) {
    const str = name + ": " + (value !== undefined ? value : "\u2014");
    canvas.text(str, x, y, null, color);

    if (newLine) {
      y += settings.size;
    } else {
      x += (canvas.getTextWidth(str) + 10) * (alignLeft ? 1 : -1);
    }
  }

  if (alignLeft || newLine) {
    for (let i = 0; i <= this._options.graph.dataY.length; ++i) {
      printValue(this._options.graph.colors[i], this._options.getName(i), values && values[i] !== undefined ? this._axes.y.formatLegendValue(values[i]) : undefined);
    }
  } else {
    for (let i = this._options.graph.dataY.length; i >= 0; --i) {
      printValue(this._options.graph.colors[i], this._options.getName(i), values && values[i] !== undefined ? this._axes.y.formatLegendValue(values[i]) : undefined);
    }
  }
};
/**
 * Get options instance.
 * @public
 * @returns {Options}
 */


Graph.prototype.getOptions = function () {
  return this._options;
};
/**
 * Sets all options to their default values.
 * @public
 */


Graph.prototype.setDefaultOptions = function () {
  this.setOptions(_Options__WEBPACK_IMPORTED_MODULE_5__["default"].getDefault());
};
/**
 * Set new options.
 * @public
 * @param {OPTIONS_OBJECT} options - Options to customize the graph.
 */


Graph.prototype.setOptions = function (options) {
  this._options.set(options);

  this._hasCalculatedGraphSize = false;

  if (this._options.isOk()) {
    this._axes.x.calculateBounds();

    this._axes.y.calculateBounds();

    this._interaction.updateOptions();

    this._canvas.graph.setBorder(this._options.border.style, this._options.border.color, this._options.border.width);

    this._initLegend();

    this._plot();
  }
};
/**
 * Set new data.
 * @public
 */


Graph.prototype.setData = function (dataX, dataY) {
  const options = {
    graph: {}
  };

  if (dataX) {
    options.graph.dataX = dataX;
  }

  if (dataY) {
    options.graph.dataY = dataY;
  }

  this.setOptions(options);
};
/**
 * 
 * @param {number} x1 - Min X value.
 * @param {number} y1 - Min Y value.
 * @param {number} x2 - Max X-value.
 * @param {number} y2 - Max Y-value.
 * @returns {undefined}
 */


Graph.prototype.zoom = function (x1, y1, x2, y2) {
  this._axes.x.overrideBounds({
    min: x1,
    max: x2
  });

  this._axes.y.overrideBounds({
    min: y1,
    max: y2
  });

  this._plot();
};
/**
 * Reset zoom level to zero.
 * @returns {undefined}
 */


Graph.prototype.resetZoom = function () {
  this._axes.x.clearOverridenBounds();

  this._axes.y.clearOverridenBounds();

  this._plot();
};
/**
 * Clears/removes current highlight.
 * @public
 */


Graph.prototype.clearHighlight = function () {
  this._canvas.highlight.clear();

  this._highlights = [];
};
/**
 * Highlight the given are of the graph.
 * @public
 * @param {number} x1 - First x-axis value.
 * @param {number} y1 - First y-axis value.
 * @param {number} x2 - Second x-axis value.
 * @param {number} y2 - Second y-axis value.
 * @param {string} color - Color of the selected area.
 */


Graph.prototype.highlight = function (x1, y1, x2, y2, color) {
  this._highlights.push({
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    color: color ? color : "rgba(0, 0, 255, 0.2)"
  });

  if (this._axes.x.hasBounds() && this._axes.y.hasBounds()) {
    this._renderHighlight();
  }
};
/**
 * Manually start or stop spinner.
 * @public
 * @param {bool} doSpin - If true the spinner will start.
 */


Graph.prototype.spin = function (doSpin) {
  if (doSpin) {
    //Spinner does not exist. Create it.
    if (!this._spinner) {
      this._spinnerDiv = document.createElement("div");

      this._parent.append(this._spinnerDiv);

      this._spinnerDiv.style.position = "absolute";
      this._spinnerDiv.style["z-index"] = 3;

      this._updateSpinnerSize();

      this._spinner = new _lib_spin_min__WEBPACK_IMPORTED_MODULE_0___default.a(this._options.spinner);
    }

    if (!this._spinner.isSpinning) {
      this._spinner.spin(this._spinnerDiv);

      this._spinner.isSpinning = true;
    }
  } else if (this._spinner) {
    this._spinner.stop();

    this._spinner.isSpinning = false;
  }
};
/**
 * Plots/draws the graph.
 * @private
 */


Graph.prototype._plot = function () {
  if (!this._options.isOk()) {
    console.error("owp.graph ERROR: Can't plot: Invalid options.");
    return;
  }

  if (this._options.debug) {
    console.time("owp.graph DEBUG: Plot time");
  } //If graph size has not yet been calculated. Do it.


  if (!this._hasCalculatedGraphSize) {
    this._calculateGraphSize();
  } //Clear plot.


  this._canvas.background.clear();

  this._canvas.graph.clear();

  this._canvas.highlight.clear();

  this._interaction.clear(); //Render non data related features.


  this._renderTitle();

  this._renderAxesLabels(); //Has bounds. Render bounds related features.


  if (this._axes.x.hasBounds() && this._axes.y.hasBounds()) {
    this._renderXAxis();

    this._renderYAxis();

    this._renderHighlight(); //Has graph data. Render graph data.


    if (this._options.graph.dataY.length) {
      this._renderLegend();

      this._renderGraph();

      this._interaction.render();
    } else if (this._options.debug) {
      console.log("owp.graph DEBUG: No data set available. Plotting available features.");
    }
  } //Has neither bounds or data.
  else if (this._options.debug) {
      console.log("owp.graph DEBUG: No bounds or data set available. Plotting available features.");
    }

  if (this._options.debug) {
    console.timeEnd("owp.graph DEBUG: Plot time");
  }
};
/**
 * Updates the position and size of the spinner div based on the graph canvas.
 * @private
 */


Graph.prototype._updateSpinnerSize = function () {
  if (this._spinnerDiv) {
    this._spinnerDiv.style.left = this._canvas.graph.getContentX() + "px";
    this._spinnerDiv.style.top = this._canvas.graph.getContentY() + "px";
    this._spinnerDiv.style.width = this._canvas.graph.getContentWidth() + "px";
    this._spinnerDiv.style.height = this._canvas.graph.getContentHeight() + "px";
  }
};
/**
 * Calculate graph canvas position and size.
 * @private
 */


Graph.prototype._calculateGraphSize = function () {
  let x = this._getOffset(["left"]);

  let y = this._getOffset(["top"]);

  let width = this._canvas.background.getWidth() - this._getOffset(["left", "right"]);

  let height = this._canvas.background.getHeight() - this._getOffset(["top", "bottom"]); //Set graph canvas.


  this._canvas.graph.setPosition(x, y);

  this._canvas.graph.setSize(width, height); //Convert to content space.


  x = this._canvas.graph.getContentX();
  y = this._canvas.graph.getContentY();
  width = this._canvas.graph.getContentWidth();
  height = this._canvas.graph.getContentHeight(); //Set highlight canvas.

  this._canvas.highlight.setPosition(x, y);

  this._canvas.highlight.setSize(width, height); //Set interaction canvas.


  this._canvas.interaction.setPosition(x, y);

  this._canvas.interaction.setSize(width, height); //Set legend canvas if available.


  if (this._canvas.legend) {
    if (this._options.legend.location.toLowerCase() === "top") {
      this._canvas.legend.setPosition(x, y - this._canvas.legend.getHeight() - this._options.legend.offsetY);

      this._canvas.legend.setSize(width, this._options.legend.size);
    } else if (this._options.legend.location.toLowerCase() === "right") {
      this._canvas.legend.setPosition(0, y, true);

      this._canvas.legend.setSize(200, height);
    }
  } //Update interaction instance.


  this._interaction.graphChangedSize(x, y, width, height); //Updates the spinner div size.


  this._updateSpinnerSize(); //Calculate new ticks for the new size.


  if (this._axes.x.hasBounds() && this._axes.y.hasBounds()) {
    this._axes.x.calculateTicks();

    this._axes.y.calculateTicks();
  }

  this._hasCalculatedGraphSize = true;
};
/**
 * Renders the x-axis(ticks markers, tick labels, grid lines) on the background canvas.
 * @private
 */


Graph.prototype._renderXAxis = function () {
  if (!this._options.axes.x.show) {
    return;
  }

  const ticks = this._axes.x.getTicks();

  let oldX, oldWidth;

  for (let i = 0; i < ticks.length; ++i) {
    let x = this._canvas.graph.getContentX() + ticks[i].coordinate;

    let y = this._canvas.graph.getY() + this._canvas.graph.getHeight(); //Draw tick markers.


    if (ticks.markers) {
      y += ticks.markers.offset;

      this._canvas.background.line(x, y, x, y + ticks.markers.length, ticks.markers.width, ticks.markers.color);

      y += ticks.markers.length;
    } //Draw grid line.


    if (ticks.grid && x > this._canvas.graph.getContentX() * 1.01 && x < (this._canvas.graph.getContentX() + this._canvas.graph.getContentWidth()) * 0.99) {
      this._canvas.background.line(x, this._canvas.graph.getContentY(), x, this._canvas.graph.getContentY() + this._canvas.graph.getContentHeight(), ticks.grid.width, ticks.grid.color);
    } //Draw tick label.


    if (ticks.labels && (!oldX || Math.abs(x - oldX) > oldWidth + ticks.labels.width[i] / 2)) {
      y += ticks.labels.offset;

      this._canvas.background.text(ticks[i].label, x, y, ticks.labels.font, ticks.labels.color, "center", "hanging");

      oldX = x;
      oldWidth = ticks.labels.width[i];
    }
  }
};
/**
 * Renders the y-axis(ticks markers, tick labels, grid lines) on the background canvas.
 * @private
 */


Graph.prototype._renderYAxis = function () {
  if (!this._options.axes.y.show) {
    return;
  }

  const ticks = this._axes.y.getTicks();

  let oldY;

  for (let i = 0; i < ticks.length; ++i) {
    let x = this._canvas.graph.getX();

    let y = this._canvas.graph.getContentY() + ticks[i].coordinate; //Draw tick markers.

    if (ticks.markers) {
      x -= ticks.markers.offset;

      this._canvas.background.line(x, y, x - ticks.markers.length, y, ticks.markers.width, ticks.markers.color);

      x -= ticks.markers.length;
    } //Draw grid line.


    if (ticks.grid && y > this._canvas.graph.getContentY() * 1.01 && y < (this._canvas.graph.getContentY() + this._canvas.graph.getContentHeight()) * 0.99) {
      this._canvas.background.line(this._canvas.graph.getContentX(), y, this._canvas.graph.getContentX() + this._canvas.graph.getContentWidth(), y, ticks.grid.width, ticks.grid.color);
    } //Draw tick label.


    if (ticks.labels && (!oldY || Math.abs(y - oldY) > ticks.labels.size)) {
      x -= ticks.labels.offset;

      this._canvas.background.text(ticks[i].label, x, y, ticks.labels.font, ticks.labels.color, "right", "middle");

      oldY = y;
    }
  }
};
/**
 * Renders the axes(x and y) labels on the background canvas.
 * @private
 */


Graph.prototype._renderAxesLabels = function () {
  //Draw X label.
  if (this._options.axes.x.show && this._options.axes.x.label.length) {
    const x = this._canvas.graph.getContentX() + this._canvas.graph.getContentWidth() / 2;

    const y = this._canvas.background.getHeight() - this._options.axes.labels.offset;

    this._canvas.background.text(this._axes.x.getAxisLabel(), x, y, this._axes.x.getAxisLabelFont(), this._options.axes.labels.color, "center", "bottom");
  } //Draw Y label.


  if (this._options.axes.y.show && this._options.axes.y.label.length) {
    const x = this._options.axes.labels.offset;
    const y = this._canvas.graph.getContentY() + this._canvas.graph.getContentHeight() / 2;

    this._canvas.background.text(this._axes.y.getAxisLabel(), x, y, this._axes.y.getAxisLabelFont(), this._options.axes.labels.color, "center", "hanging", -90);
  }
};
/**
 * Renders the graph title on the background canvas.
 * @private
 */


Graph.prototype._renderTitle = function () {
  if (!this._options.title.label.length) {
    return;
  }

  let x;

  if (this._options.title.align.toLowerCase() === "left") {
    x = this._canvas.graph.getContentX() + this._options.title.offsetX;
  } else if (this._options.title.align.toLowerCase() === "center") {
    x = this._canvas.graph.getContentX() + this._canvas.graph.getContentWidth() / 2 + this._options.title.offsetX;
  } else if (this._options.title.align.toLowerCase() === "right") {
    x = this._canvas.graph.getContentX() + this._canvas.graph.getContentWidth() - this._options.title.offsetX;
  }

  const y = this._options.title.offsetY;
  const font = (this._options.title.bold ? "bold " : "") + this._options.title.size + "px " + this._options.title.font;

  this._canvas.background.text(this._options.title.label, x, y, font, this._options.title.color, this._options.title.align, "top");
};
/**
 * Renders the highligted area on the highligh canvas.
 * @private
 */


Graph.prototype._renderHighlight = function () {
  this._canvas.highlight.clear();

  for (let i = 0; i < this._highlights.length; ++i) {
    let x1, y1, x2, y2; //Convert values to pixels.

    if (_Is__WEBPACK_IMPORTED_MODULE_6__["default"].isNull(this._highlights[i].x1)) {
      x1 = 0;
    } else {
      x1 = this._axes.x.valueToPixel(this._highlights[i].x1);
    }

    if (_Is__WEBPACK_IMPORTED_MODULE_6__["default"].isNull(this._highlights[i].y1)) {
      y1 = 0;
    } else {
      y1 = this._axes.y.valueToPixel(this._highlights[i].y1);
    }

    if (_Is__WEBPACK_IMPORTED_MODULE_6__["default"].isNull(this._highlights[i].x2)) {
      x2 = this._canvas.graph.getContentWidth();
    } else {
      x2 = this._axes.x.valueToPixel(this._highlights[i].x2);
    }

    if (_Is__WEBPACK_IMPORTED_MODULE_6__["default"].isNull(this._highlights[i].y2)) {
      y2 = this._canvas.graph.getContentHeight();
    } else {
      y2 = this._axes.y.valueToPixel(this._highlights[i].y2);
    }

    this._canvas.highlight.fillRectangle2(x1, y1, x2, y2, this._highlights[i].color);
  }
};
/**
 * Renders the graph curve on the graph canvas.
 * @private
 */


Graph.prototype._renderGraph = function () {
  if (this._options.debug && this._options.graph.smoothing > 1) {
    console.log("owp.graph DEBUG: Smoothed rendering: " + this._options.graph.smoothing);
  }

  if (this._options.debug && this._options.graph.simplify) {
    console.log("owp.graph DEBUG: Simplify rendering: " + this._options.graph.simplify);
  }

  this._canvas.graph.clear(); //Get value to pixel functions.


  const valueToPixelX = this._axes.x.getValueToPixelCallback();

  const valueToPixelY = this._axes.y.getValueToPixelCallback(); //Value bounds        


  const min = this._axes.x.getMin();

  const max = this._axes.x.getMax(); //Get canvas context directly for increased performance.


  const context = this._canvas.graph.getContext();

  context.lineWidth = this._options.graph.lineWidth;
  context.globalCompositeOperation = this._options.graph.compositeOperation;

  for (let i = 0; i < this._options.graph.dataY.length; ++i) {
    //Aquire callback for getting X-axis data values.
    const getDataX = this._options.getDataCallback("x", i); //Find start and end indicies.


    const length = this._options.graph.dataY[i].length;
    const bsMin = _Static__WEBPACK_IMPORTED_MODULE_4__["default"].binarySearch(getDataX, length, min);
    const bsMax = _Static__WEBPACK_IMPORTED_MODULE_4__["default"].binarySearch(getDataX, length, max);
    let start = bsMin.found !== undefined ? bsMin.found : bsMin.min;
    let end = bsMax.found !== undefined ? bsMax.found : bsMax.max; //Aquire callback for getting Y-axis data values.

    const getDataY = this._options.getDataCallback("y", i, start); //Start path.


    context.beginPath(); //Render simplified data set.

    if (this._options.graph.simplify) {
      const simplify = this._options.graph.simplify;
      let oldX = valueToPixelX(getDataX(start));
      let minVal = getDataY(start);
      let maxVal = minVal;
      let newX, y;
      ++start;

      for (; start <= end; ++start) {
        newX = valueToPixelX(getDataX(start));

        if (Math.abs(oldX - newX) <= simplify) {
          y = getDataY(start);
          minVal = Math.min(minVal, y);
          maxVal = Math.max(maxVal, y);
          continue;
        }

        context.lineTo(oldX, valueToPixelY(minVal)); //Only add the second point if it differs from the first.

        if (minVal !== maxVal) {
          context.lineTo(oldX, valueToPixelY(maxVal));
        }

        oldX = newX;
        minVal = getDataY(start);
        maxVal = minVal;
      } //Needed to add the last step.


      context.lineTo(oldX, valueToPixelY(minVal));

      if (minVal !== maxVal) {
        context.lineTo(oldX, valueToPixelY(maxVal));
      }
    } //Render full data set.
    else {
        for (; start <= end; ++start) {
          context.lineTo(valueToPixelX(getDataX(start)), valueToPixelY(getDataY(start)));
        }
      } //Fill under graph.


    if (this._options.graph.fill) {
      if (this._options.axes.x.inverted) {
        context.lineTo(0, this._canvas.graph.getContentHeight());
        context.lineTo(this._canvas.graph.getContentWidth(), this._canvas.graph.getContentHeight());
      } else {
        context.lineTo(this._canvas.graph.getContentWidth() * this._canvas.graph.getRatio(), this._canvas.graph.getContentHeight() * this._canvas.graph.getRatio());
        context.lineTo(0, this._canvas.graph.getContentHeight() * this._canvas.graph.getRatio());
      }

      context.closePath();
      context.fillStyle = this._options.getColor(i + 1);
      context.fill();
    } //Stroke line.
    else {
        context.strokeStyle = this._options.getColor(i + 1);
        context.stroke();
      }
  }
};
/**
 * Get offset for the given paramters.
 * @private
 * @param {array} array - List of string parameters to get offset for.
 * @returns {int} - Offset in number of pixels.
 */


Graph.prototype._getOffset = function (array) {
  let offset = 0;

  for (let i = 0; i < array.length; ++i) {
    switch (array[i]) {
      case "top":
        if (this._options.title.label.length) {
          offset += this._options.title.size;
          offset += this._options.title.offsetY;
          offset += this._options.title.padding;
        }

        if (this._canvas.legend && this._options.legend.location.toLowerCase() === "top") {
          offset += this._canvas.legend.getHeight() + this._options.legend.offsetY;
        } else if (this._options.axes.y.show && this._options.axes.tickLabels.show) {
          offset += this._options.axes.tickLabels.size / 2;
        }

        break;

      case "bottom":
        if (this._options.axes.x.show) {
          if (this._options.axes.x.label.length) {
            offset += this._options.axes.labels.size;
            offset += this._options.axes.labels.offset;
            offset += this._options.axes.labels.padding;
          }

          if (this._options.axes.x.height) {
            offset += this._options.axes.x.height;
          } else {
            if (this._options.axes.tickLabels.show) {
              offset += this._options.axes.tickLabels.size;
              offset += this._options.axes.tickLabels.offset;
            }

            if (this._options.axes.tickMarkers.show) {
              offset += this._options.axes.tickMarkers.length;
              offset += this._options.axes.tickMarkers.offset;
            }
          }
        } else if (this._options.axes.y.show && this._options.axes.tickLabels.show) {
          offset += this._options.axes.tickLabels.size / 2;
        }

        break;

      case "left":
        if (this._options.axes.y.show) {
          if (this._options.axes.y.label.length) {
            offset += this._options.axes.labels.size;
            offset += this._options.axes.labels.offset;
            offset += this._options.axes.labels.padding;
          }

          if (this._options.axes.y.width) {
            offset += this._options.axes.y.width;
          } else {
            if (this._options.axes.tickLabels.show) {
              const tickLabelMinSize = this._axes.y.getBoundLabelWidth("min", true);

              const tickLabelMaxSize = this._axes.y.getBoundLabelWidth("max", true);

              offset += Math.max(tickLabelMinSize, tickLabelMaxSize);
              offset += this._options.axes.tickLabels.offset;
            }

            if (this._options.axes.tickMarkers.show) {
              offset += this._options.axes.tickMarkers.length;
              offset += this._options.axes.tickMarkers.offset;
            }
          }
        } else if (this._options.axes.x.show && this._options.axes.tickLabels.show) {
          offset += this._axes.x.getBoundLabelWidth("min", true);
        }

        break;

      case "right":
        if (this._canvas.legend && this._options.legend.location.toLowerCase() === "right") {
          offset += this._canvas.legend.getWidth();
        } else {
          const defaultOffset = 20;
          let boundOffset = 0;

          if (this._options.axes.x.show && this._axes.x.hasBounds() && this._options.axes.tickLabels.show) {
            boundOffset = this._axes.x.getBoundLabelWidth("max", true) / 2;
          }

          offset += Math.max(defaultOffset, boundOffset);
        }

        break;
    }
  }

  return Math.round(offset);
};

Graph.createDummyData = _Static__WEBPACK_IMPORTED_MODULE_4__["default"].createDummyData;
Graph.getDefaultOptions = _Options__WEBPACK_IMPORTED_MODULE_5__["default"].getDefault;
/* harmony default export */ __webpack_exports__["default"] = (Graph);

/***/ }),

/***/ "./src/lib/spin.min.js":
/*!*****************************!*\
  !*** ./src/lib/spin.min.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;// http://spin.js.org/#v2.3.2
!function (a, b) {
   true && module.exports ? module.exports = b() :  true ? !(__WEBPACK_AMD_DEFINE_FACTORY__ = (b),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : undefined;
}(this, function () {
  "use strict";

  function a(a, b) {
    var c,
        d = document.createElement(a || "div");

    for (c in b) d[c] = b[c];

    return d;
  }

  function b(a) {
    for (var b = 1, c = arguments.length; c > b; b++) a.appendChild(arguments[b]);

    return a;
  }

  function c(a, b, c, d) {
    var e = ["opacity", b, ~~(100 * a), c, d].join("-"),
        f = .01 + c / d * 100,
        g = Math.max(1 - (1 - a) / b * (100 - f), a),
        h = j.substring(0, j.indexOf("Animation")).toLowerCase(),
        i = h && "-" + h + "-" || "";
    return m[e] || (k.insertRule("@" + i + "keyframes " + e + "{0%{opacity:" + g + "}" + f + "%{opacity:" + a + "}" + (f + .01) + "%{opacity:1}" + (f + b) % 100 + "%{opacity:" + a + "}100%{opacity:" + g + "}}", k.cssRules.length), m[e] = 1), e;
  }

  function d(a, b) {
    var c,
        d,
        e = a.style;
    if (b = b.charAt(0).toUpperCase() + b.slice(1), void 0 !== e[b]) return b;

    for (d = 0; d < l.length; d++) if (c = l[d] + b, void 0 !== e[c]) return c;
  }

  function e(a, b) {
    for (var c in b) a.style[d(a, c) || c] = b[c];

    return a;
  }

  function f(a) {
    for (var b = 1; b < arguments.length; b++) {
      var c = arguments[b];

      for (var d in c) void 0 === a[d] && (a[d] = c[d]);
    }

    return a;
  }

  function g(a, b) {
    return "string" == typeof a ? a : a[b % a.length];
  }

  function h(a) {
    this.opts = f(a || {}, h.defaults, n);
  }

  function i() {
    function c(b, c) {
      return a("<" + b + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', c);
    }

    k.addRule(".spin-vml", "behavior:url(#default#VML)"), h.prototype.lines = function (a, d) {
      function f() {
        return e(c("group", {
          coordsize: k + " " + k,
          coordorigin: -j + " " + -j
        }), {
          width: k,
          height: k
        });
      }

      function h(a, h, i) {
        b(m, b(e(f(), {
          rotation: 360 / d.lines * a + "deg",
          left: ~~h
        }), b(e(c("roundrect", {
          arcsize: d.corners
        }), {
          width: j,
          height: d.scale * d.width,
          left: d.scale * d.radius,
          top: -d.scale * d.width >> 1,
          filter: i
        }), c("fill", {
          color: g(d.color, a),
          opacity: d.opacity
        }), c("stroke", {
          opacity: 0
        }))));
      }

      var i,
          j = d.scale * (d.length + d.width),
          k = 2 * d.scale * j,
          l = -(d.width + d.length) * d.scale * 2 + "px",
          m = e(f(), {
        position: "absolute",
        top: l,
        left: l
      });
      if (d.shadow) for (i = 1; i <= d.lines; i++) h(i, -2, "progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");

      for (i = 1; i <= d.lines; i++) h(i);

      return b(a, m);
    }, h.prototype.opacity = function (a, b, c, d) {
      var e = a.firstChild;
      d = d.shadow && d.lines || 0, e && b + d < e.childNodes.length && (e = e.childNodes[b + d], e = e && e.firstChild, e = e && e.firstChild, e && (e.opacity = c));
    };
  }

  var j,
      k,
      l = ["webkit", "Moz", "ms", "O"],
      m = {},
      n = {
    lines: 12,
    length: 7,
    width: 5,
    radius: 10,
    scale: 1,
    corners: 1,
    color: "#000",
    opacity: .25,
    rotate: 0,
    direction: 1,
    speed: 1,
    trail: 100,
    fps: 20,
    zIndex: 2e9,
    className: "spinner",
    top: "50%",
    left: "50%",
    shadow: !1,
    hwaccel: !1,
    position: "absolute"
  };

  if (h.defaults = {}, f(h.prototype, {
    spin: function (b) {
      this.stop();
      var c = this,
          d = c.opts,
          f = c.el = a(null, {
        className: d.className
      });

      if (e(f, {
        position: d.position,
        width: 0,
        zIndex: d.zIndex,
        left: d.left,
        top: d.top
      }), b && b.insertBefore(f, b.firstChild || null), f.setAttribute("role", "progressbar"), c.lines(f, c.opts), !j) {
        var g,
            h = 0,
            i = (d.lines - 1) * (1 - d.direction) / 2,
            k = d.fps,
            l = k / d.speed,
            m = (1 - d.opacity) / (l * d.trail / 100),
            n = l / d.lines;
        !function o() {
          h++;

          for (var a = 0; a < d.lines; a++) g = Math.max(1 - (h + (d.lines - a) * n) % l * m, d.opacity), c.opacity(f, a * d.direction + i, g, d);

          c.timeout = c.el && setTimeout(o, ~~(1e3 / k));
        }();
      }

      return c;
    },
    stop: function () {
      var a = this.el;
      return a && (clearTimeout(this.timeout), a.parentNode && a.parentNode.removeChild(a), this.el = void 0), this;
    },
    lines: function (d, f) {
      function h(b, c) {
        return e(a(), {
          position: "absolute",
          width: f.scale * (f.length + f.width) + "px",
          height: f.scale * f.width + "px",
          background: b,
          boxShadow: c,
          transformOrigin: "left",
          transform: "rotate(" + ~~(360 / f.lines * k + f.rotate) + "deg) translate(" + f.scale * f.radius + "px,0)",
          borderRadius: (f.corners * f.scale * f.width >> 1) + "px"
        });
      }

      for (var i, k = 0, l = (f.lines - 1) * (1 - f.direction) / 2; k < f.lines; k++) i = e(a(), {
        position: "absolute",
        top: 1 + ~(f.scale * f.width / 2) + "px",
        transform: f.hwaccel ? "translate3d(0,0,0)" : "",
        opacity: f.opacity,
        animation: j && c(f.opacity, f.trail, l + k * f.direction, f.lines) + " " + 1 / f.speed + "s linear infinite"
      }), f.shadow && b(i, e(h("#000", "0 0 4px #000"), {
        top: "2px"
      })), b(d, b(i, h(g(f.color, k), "0 0 1px rgba(0,0,0,.1)")));

      return d;
    },
    opacity: function (a, b, c) {
      b < a.childNodes.length && (a.childNodes[b].style.opacity = c);
    }
  }), "undefined" != typeof document) {
    k = function () {
      var c = a("style", {
        type: "text/css"
      });
      return b(document.getElementsByTagName("head")[0], c), c.sheet || c.styleSheet;
    }();

    var o = e(a("group"), {
      behavior: "url(#default#VML)"
    });
    !d(o, "transform") && o.adj ? i() : j = d(o, "animation");
  }

  return h;
});

/***/ })

/******/ });
});
//# sourceMappingURL=owp.graph.js.map