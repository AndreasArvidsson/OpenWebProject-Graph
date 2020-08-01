import Static from "./Static";
import Is from "./Is";

if (!Math.log10) {
    Math.log10 = Static.log10;
}

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
    }
    else if (axis.toLowerCase() === "y") {
        this._isX = false;
        this._axis = options.axes.y;
        this._getSize = graphCanvas.getContentHeight.bind(graphCanvas);
    }
    else {
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
    return !Is.isNull(this.getMin()) && !Is.isNull(this.getMax());
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
    if (!Is.isNull(this._overrideMin)) {
        return this._overrideMin;
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
    if (!Is.isNull(this._overrideMax)) {
        return this._overrideMax;
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
        bound = Static.round(bound + 0.111111111111111, 3);
    }
    return Static.getTextWidth(bound, this.getTickLabelsFont());
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
Axis.prototype.hasZoom = function () {
    return !Is.isNull(this._overrideMin) || !Is.isNull(this._overrideMax);
};

/**
 * Override bounds. Temporary override user given bounds. 
 * @public
 */
Axis.prototype.zoom = function (min, max) {
    this._overrideMin = min;
    this._overrideMax = max;
    if (!Is.isNull(this.getMin()) || !Is.isNull(this.getMax())) {
        this.calculateTicks();
    }
};

/**
 * Remove overridden bounds.
 * @public
 */
Axis.prototype.clearZoom = function () {
    this.zoom();
};

/**
 * Calculates bounds. Uses user given option bounds first and calculates mising from data set.
 * @public
 */
Axis.prototype.calculateBounds = function () {
    let newMin, newMax;

    //Prioritize user given bounds.
    if (!Is.isNull(this._axis.bounds.min)) {
        newMin = this._axis.bounds.min;
    }
    if (!Is.isNull(this._axis.bounds.max)) {
        newMax = this._axis.bounds.max;
    }

    //Both bounds are not set by the user. Calculate missing.
    if (Is.isNull(newMin) || Is.isNull(newMax)) {
        let calcBounds;
        if (this._isX) {
            calcBounds = this._calculateXBounds();
        }
        else {
            calcBounds = this._calculateYBounds();
        }

        if (calcBounds) {
            //Use both calculated bounds.
            if (Is.isNull(newMin) && Is.isNull(newMax)) {
                newMin = calcBounds.min;
                newMax = calcBounds.max;
                //Both values are calculated. Move both.
                if (newMin === newMax) {
                    console.warn("owp.graph WARNING: Axis " + (this._isX ? "X" : "Y") + ". bounds.min and bounds.max are equal. Move both.");
                    --newMin;
                    ++newMax;
                }
            }
            //Use only calculated min.
            else if (Is.isNull(newMin)) {
                newMin = calcBounds.min;
                //Only move the calculated value.
                if (newMin >= newMax) {
                    console.warn("owp.graph WARNING: Axis " + (this._isX ? "X" : "Y") + ". bounds.min and bounds.max are equal. Move min.");
                    newMin = newMax - 1;
                }
            }
            //use only calculated max.
            else if (Is.isNull(newMax)) {
                newMax = calcBounds.max;
                if (newMin >= newMax) {
                    console.warn("owp.graph WARNING: Axis " + (this._isX ? "X" : "Y") + ". bounds.min and bounds.max are equal. Move max.");
                    newMax = newMin + 1;
                }
            }
        }
    }

    if (!Is.isNull(newMin) && !Is.isNull(newMax)) {
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
    const labelSize = this._isX ? this._options.axes.tickLabels.width : this._options.axes.tickLabels.size;
    //Create ticks with user given options ticker.
    if (this._axis.ticker) {
        ticks = this._axis.ticker(this._axis.log, this.getMin(), this.getMax(), this._getSize(), labelSize);
    }
    //Create ticks with the default ticker.
    else {
        ticks = this._getDefaultTicks(this._axis.log, this.getMin(), this.getMax(), this._getSize(), labelSize);
    }

    if (!ticks.length) {
        console.warn("owp.graph WARNING: Axis " + (this._isX ? "X" : "Y") + ". Ticks list is empty.");
    }

    //Update ticks with pixel coordinates.
    for (let i = 0; i < ticks.length; ++i) {
        ticks[i].coordinate = this.valueToPixel(ticks[i].value);
    }
    //Show tick markers.
    if (this._options.axes.tickMarkers.show) {
        ticks.markers = {
            offset: this._options.axes.tickMarkers.offset,
            length: this._options.axes.tickMarkers.length,
            width: this._options.axes.tickMarkers.width,
            color: this._options.axes.tickMarkers.color
        };
    }
    //Show tick labels.
    if (this._options.axes.tickLabels.show) {
        ticks.labels = {
            offset: this._options.axes.tickLabels.offset,
            size: this._options.axes.tickLabels.size,
            color: this._options.axes.tickLabels.color,
            font: this.getTickLabelsFont(),
            width: []
        };
        for (let i = 0; i < ticks.length; ++i) {
            ticks.labels.width[i] = Static.getTextWidth(ticks[i].label, this.getTickLabelsFont());
        }
    }
    //Show grid.
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
        }
        //Logarithmic normal orientation.
        else {
            return Math.pow(10, pixel / this._getSize() * log10(this.getMax() / this.getMin()) + log10(this.getMin()));
        }
    }
    //Linear
    else {
        //Linear inverted orientation.
        if (this._isX ? this._axis.inverted : !this._axis.inverted) {
            return pixel / this._getSize() * (this.getMin() - this.getMax()) + this.getMax();
        }
        //Linear normal orientation.
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
        }
        //Logarithmic normal orientation.
        else {
            return log10(value / this.getMin()) / log10(this.getMax() / this.getMin()) * this._getSize();
        }
    }
    //Linear
    else {
        //Linear inverted orientation.
        if (this._isX ? this._axis.inverted : !this._axis.inverted) {
            return (value - this.getMax()) / (this.getMin() - this.getMax()) * this._getSize();
        }
        //Linear normal orientation.
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
    }
    //Use default value formatter.
    else {
        return Static.round(value, 5);
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
    const size = this._getSize() * this._getRatio();

    //Inverted X or normal Y.
    if (this._isX ? this._axis.inverted : !this._axis.inverted) {
        numVar = this.getMax();
        denom = this._axis.log ? log10(this.getMin() / this.getMax()) : this.getMin() - this.getMax();
    }
    //Normal X or inverted Y.
    else {
        numVar = this.getMin();
        denom = this._axis.log ? log10(this.getMax() / this.getMin()) : this.getMax() - this.getMin();
    }

    //Axis is logarithmic.
    if (this._axis.log) {
        numOp = "/";
        logFunc = "Math.log10";
    }
    //Axis is linear.
    else {
        numOp = "-";
        logFunc = "";
    }

    //Only do the numerator operation on the numerator if the variable is not zero.
    if (numVar) {
        num = logFunc + "(value " + numOp + " " + numVar + ")";
    }
    else {
        num = logFunc + "(value)";
    }

    //Only do the fraction if the denominator is not 1.
    if (denom !== 1) {
        denom = "/ " + denom;
    }
    else {
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
        return { min: min, max: max };
    }
    //Calculate X-axis bounds from dataY length.
    else if (this._options.graph.dataY.length) {
        if (this._options.debug) {
            console.log("owp.graph DEBUG: X-bounds and X-data not set, but Y-data is. Calculate X-bounds from Y-data length.");
        }
        let max = 0;
        for (let i = 0; i < this._options.graph.dataY.length; ++i) {
            max = Math.max(max, this._options.graph.dataY[i].length);
        }
        return { min: 1, max };
    }
    else if (this._options.debug) {
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
        return min !== null
            ? { min, max }
            : null;
    }
    else if (this._options.debug) {
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

    let ticks;

    //If the range is to small even a log axis will get linear values.
    if (isLog && maxValue - minValue >= 4 * minValue) {
        ticks = getDefaultLogTicks(minValue, maxValue);
    }
    else {
        ticks = getDefaultLinTicks(minValue, maxValue, graphSize, labelSize);
    }

    //Post-format ticker values.
    if (this._axis.tickerValuePostFormatter) {
        for (let i = 0; i < ticks.length; ++i) {
            ticks[i].value = this._axis.tickerValuePostFormatter(ticks[i].value);
        }
    }

    //Add user formatted labels.
    if (this._axis.tickerLabelFormatter) {
        for (let i = 0; i < ticks.length; ++i) {
            ticks[i].label = this._axis.tickerLabelFormatter(ticks[i].value);
        }
    }
    //Add default formatted labels.
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
        ranges = [
            { divider: 1e24, suffix: 'Y' },
            { divider: 1e21, suffix: 'Z' },
            { divider: 1e18, suffix: 'E' },
            { divider: 1e15, suffix: 'P' },
            { divider: 1e12, suffix: 'T' },
            { divider: 1e9, suffix: 'G' },
            { divider: 1e6, suffix: 'M' },
            { divider: 1e3, suffix: 'k' }
        ];
    }
    else if (value < 1e-2) {
        ranges = [
            { divider: 1e-3, suffix: 'm' },
            { divider: 1e-6, suffix: 'µ' },
            { divider: 1e-9, suffix: 'n' },
            { divider: 1e-12, suffix: 'p' },
            { divider: 1e-15, suffix: 'f' },
            { divider: 1e-18, suffix: 'a' },
            { divider: 1e-21, suffix: 'z' },
            { divider: 1e-24, suffix: 'y' }
        ];
    }
    for (let i = 0; i < ranges.length; i++) {
        if (value >= ranges[i].divider) {
            return Static.round(value / ranges[i].divider, 3).toString() + ranges[i].suffix;
        }
    }
    return value.toString();
}

//For a given value calculate the best step value.
function getStepValue(isLog, value) {
    const mult = isLog ? [1, 10] : [1, 2, 5, 10];
    const exp = Math.floor(log10(value));
    for (let i = 0; i < mult.length; ++i) {
        const newValue = Math.pow(10, exp) * mult[i];
        if (newValue >= value) {
            return newValue;
        }
    }
}

//Get linear ticks.
function getDefaultLinTicks(minValue, maxValue, graphSize, labelSize) {
    //Max number of labels.
    const maxNumLabels = graphSize / (labelSize * 1.5);
    //Value range
    const range = maxValue - minValue;
    //Get ticker value step.
    const step = getStepValue(false, range / maxNumLabels);

    //Calculate start pos.
    let start = minValue;
    //Make sure start is on a step position.
    const diff = modf(start, step);
    if (diff > 0) {
        start += step - diff;
    }
    if (diff < 0) {
        start -= diff;
    }

    //Start and end value is the same. Just return the one value.
    if (secureFloat(start) === secureFloat(maxValue)) {
        return [{ value: secureFloat(start) }];
    }

    const ticks = [];
    for (; start <= maxValue; start += step) {
        const value = secureFloat(start);
        ticks.push({ value });
        //Reached infinite loop.
        if (start === value + step) {
            break;
        }
        start = value;
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
}

//Get logarithmic ticks.
function getDefaultLogTicks(minValue, maxValue) {
    const ticks = [];
    let step = getStepValue(true, minValue);
    for (; ;) {
        for (let i = 1; i < 10; ++i) {
            let value = i * step;
            if (value > maxValue) {
                return ticks;
            }
            ticks.push({ value: secureFloat(value) });
        }
        step *= 10;
    }
}

export default Axis;

/**
 * Secure float precision.
 * @public
 * @param {number} val
 * @returns {number}
 */
function secureFloat(val) {
    return parseFloat(val.toPrecision(15));
}

const log10 = Static.log10;