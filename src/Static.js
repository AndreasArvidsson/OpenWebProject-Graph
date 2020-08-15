/** 
 * Static functions.
 */

const Static = {};

/**
 * Create dummy test data.
 * @public
 * @static
 * @param {int} size - Number of values to create.
 * @returns {array}
 */
Static.createDummyData = function (size) {
    let seed = 3;
    function random() {
        seed = Math.sin(seed) * 10000;
        return seed - Math.floor(seed);
    }
    const data1 = new Float32Array(size);
    const data2 = new Float32Array(size);
    const mult = Math.PI / 100;
    for (let i = 0; i < size; ++i) {
        data1[i] = Math.sin(i * mult) * random();
        data2[i] = Math.cos(i * mult) * random();
    }
    return [data1, data2];
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