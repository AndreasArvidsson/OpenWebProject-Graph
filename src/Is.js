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
    return obj instanceof Int8Array
        || obj instanceof Uint8Array
        || obj instanceof Uint8ClampedArray
        || obj instanceof Int16Array
        || obj instanceof Uint16Array
        || obj instanceof Int32Array
        || obj instanceof Uint32Array
        || obj instanceof Float32Array
        || obj instanceof Float64Array;
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
    return obj === "source-over"
        || obj === "source-in"
        || obj === "source-out"
        || obj === "source-atop"
        || obj === "destination-over"
        || obj === "destination-in"
        || obj === "destination-out"
        || obj === "destination-atop"
        || obj === "lighter"
        || obj === "copy"
        || obj === "xor"
        || obj === "multiply"
        || obj === "screen"
        || obj === "overlay"
        || obj === "darken"
        || obj === "lighten"
        || obj === "color-dodge"
        || obj === "color-burn"
        || obj === "hard-light"
        || obj === "soft-light"
        || obj === "difference"
        || obj === "exclusion"
        || obj === "hue"
        || obj === "saturation"
        || obj === "color"
        || obj === "luminosity";
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

export default Is;
