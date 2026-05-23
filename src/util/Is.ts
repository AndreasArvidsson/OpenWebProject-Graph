/**
 * Check if the given object is a DOM element.
 */
type CompareCallback = (obj: unknown) => boolean;

export function isDOM(obj: unknown): obj is HTMLElement {
    return obj instanceof HTMLElement;
}

/**
 * Check of the given object is null or undefined.
 */
function isNull(obj: unknown): obj is null | undefined {
    return obj == null;
}

/**
 * Check of the given object is a plain js object.
 */
export function isObject(obj: unknown): obj is Record<string, unknown> {
    return (
        obj != null &&
        typeof obj === "object" &&
        Object.getPrototypeOf(obj) === Object.prototype
    );
}

/**
 * Check of the given object is a function.
 */
// oxlint-disable-next-line typescript/ban-types, typescript/no-unsafe-function-type
export function isFunction(obj: unknown): obj is Function {
    return typeof obj === "function";
}

/**
 * Check of the given object is a bool.
 */
export function isBool(obj: unknown): obj is boolean {
    return typeof obj === "boolean";
}

/**
 * Check of the given object is a number.
 */
export function isNumber(obj: unknown): obj is number {
    return typeof obj === "number";
}

/**
 * Check of the given object is an integer.
 */
export function isInt(obj: unknown): obj is number {
    return typeof obj === "number" && obj % 1 === 0;
}

/**
 * Check of the given object is an unsigned integer.
 */
export function isUint(obj: unknown): obj is number {
    return typeof obj === "number" && obj >= 0 && obj % 1 === 0;
}

/**
 * Check of the given object is a string.
 */
export function isString(obj: unknown): obj is string {
    return typeof obj === "string";
}

/**
 * Check of the given object is an Array.
 */
function isArray(obj: unknown): obj is unknown[] {
    return Array.isArray(obj);
}

/**
 * Check of the given object is a typed array.
 */
export function isTypedArray(obj: unknown): obj is ArrayBufferView {
    return (
        obj instanceof Int8Array ||
        obj instanceof Uint8Array ||
        obj instanceof Uint8ClampedArray ||
        obj instanceof Int16Array ||
        obj instanceof Uint16Array ||
        obj instanceof Int32Array ||
        obj instanceof Uint32Array ||
        obj instanceof Float32Array ||
        obj instanceof Float64Array
    );
}

/**
 * Check of the given object is an array or a typed array.
 */
export function isAnyArray(obj: unknown): obj is unknown[] | ArrayBufferView {
    return isArray(obj) || isTypedArray(obj);
}

/**
 * Check of the given object is a color.
 */
export function isColor(obj: unknown): boolean {
    if (!isString(obj)) {
        return false;
    }
    const div = document.createElement("div");
    div.style.borderColor = "";
    div.style.borderColor = obj;
    return div.style.borderColor !== "";
}

/**
 * Check of the given object is a size.
 */
export function isSize(obj: unknown): boolean {
    if (!isString(obj)) {
        return false;
    }
    const div = document.createElement("div");
    div.style.width = "";
    div.style.width = obj;
    return div.style.width !== "";
}

/**
 * Check of the given object is an alignment.
 */
export function isAlignment(obj: unknown, noCenter?: boolean): boolean {
    if (!isString(obj)) {
        return false;
    }
    obj = obj.toLowerCase();
    if (noCenter) {
        return obj === "left" || obj === "right";
    }
    return obj === "left" || obj === "center" || obj === "right";
}

/**
 * Check of the given object is a font.
 */
export function isFont(obj: unknown): boolean {
    if (!isString(obj)) {
        return false;
    }
    const div = document.createElement("div");
    div.style.fontFamily = "";
    div.style.fontFamily = obj;
    return div.style.fontFamily !== "";
}

/**
 * Check of the given object is an composite operation.
 */
export function isCompositeOperation(obj: unknown): boolean {
    if (!isString(obj)) {
        return false;
    }
    obj = obj.toLowerCase();
    return (
        obj === "source-over" ||
        obj === "source-in" ||
        obj === "source-out" ||
        obj === "source-atop" ||
        obj === "destination-over" ||
        obj === "destination-in" ||
        obj === "destination-out" ||
        obj === "destination-atop" ||
        obj === "lighter" ||
        obj === "copy" ||
        obj === "xor" ||
        obj === "multiply" ||
        obj === "screen" ||
        obj === "overlay" ||
        obj === "darken" ||
        obj === "lighten" ||
        obj === "color-dodge" ||
        obj === "color-burn" ||
        obj === "hard-light" ||
        obj === "soft-light" ||
        obj === "difference" ||
        obj === "exclusion" ||
        obj === "hue" ||
        obj === "saturation" ||
        obj === "color" ||
        obj === "luminosity"
    );
}

export function isBorderWidth(obj: unknown): boolean {
    if (!isString(obj)) {
        return false;
    }
    const div = document.createElement("div");
    div.style.borderWidth = "";
    div.style.borderWidth = obj;
    return div.style.borderWidth !== "";
}

export function isOffset(obj: unknown): boolean {
    if (!isString(obj)) {
        return false;
    }
    const div = document.createElement("div");
    div.style.margin = "";
    div.style.margin = obj;
    return div.style.margin !== "";
}

export function isBorderStyle(obj: unknown): boolean {
    if (!isString(obj)) {
        return false;
    }
    const div = document.createElement("div");
    div.style.borderStyle = "";
    div.style.borderStyle = obj;
    return div.style.borderStyle !== "";
}

type ValueType =
    | "number"
    | "int"
    | "string"
    | "font"
    | "bool"
    | "array"
    | "typedArray"
    | "anyArray"
    | "object"
    | "function"
    | "color"
    | "size"
    | "alignment"
    | "compositeOperation"
    | "borderStyle"
    | "borderWidth"
    | "dom"
    | "null"
    | "offset";

export type ValueTypes = ValueType | `${ValueType}|${ValueType}`;

/**
 * Get a callback to evaluate if the given data is of the specified type.
 */
export function getCompareCallback(type: ValueType): CompareCallback {
    switch (type) {
        case "number":
            return isNumber;
        case "int":
            return isInt;
        case "string":
            return isString;
        case "font":
            return isFont;
        case "bool":
            return isBool;
        case "array":
            return isArray;
        case "typedArray":
            return isTypedArray;
        case "anyArray":
            return isAnyArray;
        case "object":
            return isObject;
        case "function":
            return isFunction;
        case "color":
            return isColor;
        case "size":
            return isSize;
        case "alignment":
            return isAlignment;
        case "compositeOperation":
            return isCompositeOperation;
        case "borderStyle":
            return isBorderStyle;
        case "borderWidth":
            return isBorderWidth;
        case "dom":
            return isDOM;
        case "null":
            return isNull;
        case "offset":
            return isOffset;
        default: {
            const _exhaustiveCheck: never = type;
            throw new Error("Is.getCompareCallback: Unknown type");
        }
    }
}

/**
 * Get a list of callbacks to evaluate if the given data is of the specified type.
 */
function getCompareCallbacks(type: ValueTypes): CompareCallback[] {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const types = type.split("|") as ValueType[];
    if (types.length === 0) {
        throw new Error("Is.getCompareCallbacks: types is empty.");
    }
    return types.map(getCompareCallback);
}

/**
 * True if object is of type
 */
export function isOfType(obj: unknown, type: ValueTypes): boolean {
    const callbacks = getCompareCallbacks(type);
    for (const callback of callbacks) {
        if (callback(obj)) {
            return true;
        }
    }
    return false;
}

/**
 * Check if the array only contains items if the given type.
 */
export function isContent(array: unknown[], type: ValueTypes): boolean {
    const callbacks = getCompareCallbacks(type);
    return array.every((item) => isOfTypeInner(item, callbacks));
}

function isOfTypeInner(obj: unknown, callbacks: CompareCallback[]): boolean {
    for (const callback of callbacks) {
        if (callback(obj)) {
            return true;
        }
    }
    return false;
}
