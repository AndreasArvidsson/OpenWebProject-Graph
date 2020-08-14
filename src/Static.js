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
    }
    else if (type && type.toLowerCase() === "float") {
        const floatY1 = new Float32Array(buffer1);
        const floatY2 = new Float32Array(buffer2);
        const mult = Math.PI / 100;
        for (let i = 0; i < size; ++i) {
            floatY1[i] = Math.sin(i * mult) * random();
            floatY2[i] = Math.cos(i * mult) * random();
        }
        data.push(floatY1);
        data.push(floatY2);
    }
    else {
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
 * @param {int} smoothing - Smoothing value. Number of samples on each side of central value.
 * @param {int} length - Length of data set.
 * @returns {undefined}
 */
Static.getSmoothingWindow = function (index, smoothing, length) {
    //Distance to list start.
    const diffToMin = Math.max(0, index);
    //Distance to list end.
    const diffToMax = length - 1 - index;
    //Shortest distance of min, max and smoothing window.
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
        const mid = Math.floor((min + max) / 2);
        //Value is smaller than mid.
        if (value < dataCallback(mid)) {
            max = mid - 1;
        }
        //Value is larger than mid.
        else if (value > dataCallback(mid)) {
            min = mid + 1;
        }
        //Found value.
        else {
            return { found: mid };
        }
    }
    min = Math.min(min, max);
    max = Math.max(min, max, 0);
    //Value is larger than max index. Increment max.
    if (value > dataCallback(max)) {
        ++max;
    }
    //Value is smaller than min index. Decrement min.
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
    }
    else {
        const multiplier = Math.pow(10, decimals);
        return (Math.round(value * multiplier) / multiplier);
    }
};

Static.log10 = (x) => Math.log(x) / Math.LN10;

export default Static;