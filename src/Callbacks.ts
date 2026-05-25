import type { Canvas } from "./Canvas.js";
import type { Options } from "./Options.js";
import type {
    GraphDataArray,
    FullOptions,
    SimplifyMode,
} from "./Options.type.js";
import { binarySearch } from "./util/binarySearch.js";

type ValueCallback = (index: number) => number;
type ValueToPixelCallback = (value: number) => number;

interface Axis {
    getValueToPixelCallback(): ValueToPixelCallback;
    getMin(): number;
    getMax(): number;
}

interface Axes {
    x: Axis;
    y: Axis;
}

type RenderFunction = (
    ctx: CanvasRenderingContext2D,
    valueToPixelX: ValueToPixelCallback,
    valueToPixelY: ValueToPixelCallback,
    getDataX: ValueCallback,
    getDataY: ValueCallback,
    start: number,
    end: number,
) => void;

export function getRenderCallback(
    options: Options,
    canvas: Canvas,
    axes: Axes,
): (channelIndex: number) => void {
    // Get value to pixel functions.
    const valueToPixelX = axes.x.getValueToPixelCallback();
    const valueToPixelY = axes.y.getValueToPixelCallback();
    // Value bounds.
    const min = axes.x.getMin();
    const max = axes.x.getMax();
    // Context
    const ctx = canvas.getContext();
    // Callbacks
    const renderCallback = getRenderFunction(options);
    const strokeCallback = getStrokeCallback(options, canvas);
    return (channelIndex: number) => {
        // Aquire callback for getting X-axis data values.
        const getDataX = getDataCallback(options.options, "x", channelIndex);
        // Find start and end indicies.
        const length = options.options.graph.dataY[channelIndex].length;
        const bsMin = binarySearch(getDataX, length, min);
        const bsMax = binarySearch(getDataX, length, max);
        const start = bsMin.found ?? bsMin.min;
        const end = bsMax.found ?? bsMax.max;
        // Aquire callback for getting Y-axis data values.
        const getDataY = getDataCallback(
            options.options,
            "y",
            channelIndex,
            start,
        );
        // Start path.
        ctx.beginPath();
        // Render points/lines.
        renderCallback(
            ctx,
            valueToPixelX,
            valueToPixelY,
            getDataX,
            getDataY,
            start,
            end,
        );
        // Stroke line.
        strokeCallback(ctx, channelIndex);
    };
}

export function getCalculateValueCallback(
    options: Options,
    axes: Axes,
    dataY: GraphDataArray,
    getDataX: ValueCallback,
    channelIndex: number,
    start: number,
): ValueCallback {
    const useSimplify =
        options.renderSimplify() &&
        (options.options.graph.simplify > 0.1 ||
            options.options.graph.simplifyBy !== "minMax");
    if (useSimplify) {
        const valueToPixelX = axes.x.getValueToPixelCallback();
        const getDataY = getDataCallback(
            options.options,
            "y",
            channelIndex,
            start,
        );
        return getCalculateSimplifyCallback(
            options.options.graph.simplifyBy,
        ).bind(
            null,
            dataY.length,
            getDataX,
            getDataY,
            valueToPixelX,
            options.options.graph.simplify,
        );
    } else if (options.options.graph.smoothing) {
        return calculateSmothingValue.bind(
            null,
            options.options.graph.smoothing,
            dataY,
        );
    }
    return (index: number) => dataY[index];
}

/* *************** RENDER CALLBACKS *************** */

function getRenderFunction(options: Options): RenderFunction {
    if (options.renderSimplify()) {
        const simplify = options.options.graph.simplify;
        switch (options.options.graph.simplifyBy) {
            case "avg":
                return renderAvg.bind(null, simplify);
            case "min":
                return renderMin.bind(null, simplify);
            case "max":
                return renderMax.bind(null, simplify);
            case "minMax":
                return renderMinMax.bind(null, simplify);
            // No default
        }
    }
    return renderFull.bind(
        null,
        Boolean(options.options.graph.lineWidth),
        options.renderMarkers(),
        options.options.graph.markerRadius,
    );
}

function renderAvg(
    simplify: number,
    ctx: CanvasRenderingContext2D,
    valueToPixelX: ValueToPixelCallback,
    valueToPixelY: ValueToPixelCallback,
    getDataX: ValueCallback,
    getDataY: ValueCallback,
    start: number,
    end: number,
): void {
    let oldX = valueToPixelX(getDataX(start));
    let sum = getDataY(start);
    let count = 1;
    // We have already counted first value;
    ++start;
    for (; start <= end; ++start) {
        const newX = valueToPixelX(getDataX(start));
        if (Math.abs(newX - oldX) < simplify) {
            sum += getDataY(start);
            ++count;
        } else {
            ctx.lineTo(oldX, valueToPixelY(sum / count));
            oldX = newX;
            sum = getDataY(start);
            count = 1;
        }
    }
    // Needed to add the last step.
    ctx.lineTo(oldX, valueToPixelY(sum / count));
}

function renderMin(
    simplify: number,
    ctx: CanvasRenderingContext2D,
    valueToPixelX: ValueToPixelCallback,
    valueToPixelY: ValueToPixelCallback,
    getDataX: ValueCallback,
    getDataY: ValueCallback,
    start: number,
    end: number,
): void {
    let oldX = valueToPixelX(getDataX(start));
    let minVal = getDataY(start);
    // We have already counted first value;
    ++start;
    for (; start <= end; ++start) {
        const newX = valueToPixelX(getDataX(start));
        if (Math.abs(newX - oldX) < simplify) {
            minVal = Math.min(minVal, getDataY(start));
        } else {
            ctx.lineTo(oldX, valueToPixelY(minVal));
            oldX = newX;
            minVal = getDataY(start);
        }
    }
    // Needed to add the last step.
    ctx.lineTo(oldX, valueToPixelY(minVal));
}

function renderMax(
    simplify: number,
    ctx: CanvasRenderingContext2D,
    valueToPixelX: ValueToPixelCallback,
    valueToPixelY: ValueToPixelCallback,
    getDataX: ValueCallback,
    getDataY: ValueCallback,
    start: number,
    end: number,
): void {
    let oldX = valueToPixelX(getDataX(start));
    let maxVal = getDataY(start);
    // We have already counted first value;
    ++start;
    for (; start <= end; ++start) {
        const newX = valueToPixelX(getDataX(start));
        if (Math.abs(newX - oldX) < simplify) {
            maxVal = Math.max(maxVal, getDataY(start));
        } else {
            ctx.lineTo(oldX, valueToPixelY(maxVal));
            oldX = newX;
            maxVal = getDataY(start);
        }
    }
    // Needed to add the last step.
    ctx.lineTo(oldX, valueToPixelY(maxVal));
}

function renderMinMax(
    simplify: number,
    ctx: CanvasRenderingContext2D,
    valueToPixelX: ValueToPixelCallback,
    valueToPixelY: ValueToPixelCallback,
    getDataX: ValueCallback,
    getDataY: ValueCallback,
    start: number,
    end: number,
): void {
    let oldX = valueToPixelX(getDataX(start));
    let minVal = getDataY(start);
    let maxVal = minVal;
    // We have already counted first value;
    ++start;
    for (; start <= end; ++start) {
        const newX = valueToPixelX(getDataX(start));
        if (Math.abs(newX - oldX) < simplify) {
            const valueY = getDataY(start);
            minVal = Math.min(minVal, valueY);
            maxVal = Math.max(maxVal, valueY);
        } else {
            ctx.lineTo(oldX, valueToPixelY(minVal));
            // Only add the second point if it differs from the first.
            if (minVal !== maxVal) {
                ctx.lineTo(oldX, valueToPixelY(maxVal));
            }
            oldX = newX;
            minVal = getDataY(start);
            maxVal = minVal;
        }
    }
    // Needed to add the last step.
    ctx.lineTo(oldX, valueToPixelY(minVal));
    if (minVal !== maxVal) {
        ctx.lineTo(oldX, valueToPixelY(maxVal));
    }
}

function renderFull(
    renderLine: boolean,
    renderMarkers: boolean,
    markerRadius: number,
    ctx: CanvasRenderingContext2D,
    valueToPixelX: ValueToPixelCallback,
    valueToPixelY: ValueToPixelCallback,
    getDataX: ValueCallback,
    getDataY: ValueCallback,
    start: number,
    end: number,
): void {
    const circleAngle = 2 * Math.PI;
    // Render line and markers
    if (renderLine && renderMarkers) {
        for (; start <= end; ++start) {
            const x = valueToPixelX(getDataX(start));
            const y = valueToPixelY(getDataY(start));
            ctx.lineTo(x, y);
            ctx.moveTo(x + markerRadius, y);
            ctx.arc(x, y, markerRadius, 0, circleAngle);
            ctx.moveTo(x, y);
        }
    }
    // Render only line
    else if (renderLine) {
        for (; start <= end; ++start) {
            ctx.lineTo(
                valueToPixelX(getDataX(start)),
                valueToPixelY(getDataY(start)),
            );
        }
    }
    // Render only markers
    else if (renderMarkers) {
        for (; start <= end; ++start) {
            const x = valueToPixelX(getDataX(start));
            const y = valueToPixelY(getDataY(start));
            ctx.moveTo(x + markerRadius, y);
            ctx.arc(x, y, markerRadius, 0, circleAngle);
        }
    }
}

/* *************** STROKES CALLBACK *************** */

function getStrokeCallback(
    options: Options,
    canvas: Canvas,
): (ctx: CanvasRenderingContext2D, channelIndex: number) => void {
    // Fill graph
    if (options.options.graph.fill) {
        return renderFill.bind(null, options, canvas);
    }
    // Stroke line.
    return renderStroke.bind(null, options);
}

function renderFill(
    options: Options,
    canvas: Canvas,
    ctx: CanvasRenderingContext2D,
    channelIndex: number,
): void {
    // Render line
    if (options.options.graph.lineWidth) {
        if (options.options.axes.x.inverted) {
            ctx.lineTo(0, canvas.getContentHeight());
            ctx.lineTo(canvas.getContentWidth(), canvas.getContentHeight());
        } else {
            ctx.lineTo(
                canvas.getContentWidth() * canvas.getRatio(),
                canvas.getContentHeight() * canvas.getRatio(),
            );
            ctx.lineTo(0, canvas.getContentHeight() * canvas.getRatio());
        }
        ctx.closePath();
    }
    ctx.fillStyle = options.getColor(channelIndex + 1);
    ctx.fill();
}

function renderStroke(
    options: Options,
    ctx: CanvasRenderingContext2D,
    channelIndex: number,
): void {
    // Set dashed options
    // oxlint-disable-next-line typescript/strict-boolean-expressions
    if (options.options.graph.dashed[channelIndex]) {
        let pattern = options.options.graph.dashed[channelIndex];
        if (pattern === true) {
            pattern = [5, 8];
        }
        ctx.setLineDash(pattern);
    } else {
        ctx.setLineDash([]);
    }

    ctx.strokeStyle = options.getColor(channelIndex + 1);
    ctx.stroke();
}

/* *************** CALCULATE VALUES CALLBACKS *************** */

type SimplifyValueCallback = (
    length: number,
    getDataX: ValueCallback,
    getDataY: ValueCallback,
    valueToPixelX: ValueToPixelCallback,
    simplify: number,
    index: number,
) => number;

function getCalculateSimplifyCallback(
    simplifyBy: SimplifyMode,
): SimplifyValueCallback {
    switch (simplifyBy) {
        case "avg":
            return calculateAvgValue;
        case "min":
            return calculateMinValue;
        case "max":
            return calculateMaxValue;
        case "minMax":
            return calculateMinMaxValue;
        default: {
            const _exhaustiveCheck: never = simplifyBy;
            throw new Error("Unknown simplifyBy value");
        }
    }
}

function calculateAvgValue(
    length: number,
    getDataX: ValueCallback,
    getDataY: ValueCallback,
    valueToPixelX: ValueToPixelCallback,
    simplify: number,
    index: number,
): number {
    const oldX = valueToPixelX(getDataX(index));
    let sum = getDataY(index);
    let count = 1;
    for (let i = index + 1; i < length; ++i) {
        const newX = valueToPixelX(getDataX(i));
        if (Math.abs(newX - oldX) < simplify) {
            sum += getDataY(i);
            ++count;
        } else {
            break;
        }
    }
    for (let i = index - 1; i > -1; --i) {
        const newX = valueToPixelX(getDataX(i));
        if (Math.abs(newX - oldX) < simplify) {
            sum += getDataY(i);
            ++count;
        } else {
            break;
        }
    }
    return sum / count;
}

function calculateMinValue(
    length: number,
    getDataX: ValueCallback,
    getDataY: ValueCallback,
    valueToPixelX: ValueToPixelCallback,
    simplify: number,
    index: number,
): number {
    const oldX = valueToPixelX(getDataX(index));
    let minVal = getDataY(index);
    for (let i = index + 1; i < length; ++i) {
        const newX = valueToPixelX(getDataX(i));
        if (Math.abs(newX - oldX) < simplify) {
            minVal = Math.min(minVal, getDataY(i));
        } else {
            break;
        }
    }
    for (let i = index - 1; i > -1; --i) {
        const newX = valueToPixelX(getDataX(i));
        if (Math.abs(newX - oldX) < simplify) {
            minVal = Math.min(minVal, getDataY(i));
        } else {
            break;
        }
    }
    return minVal;
}

function calculateMaxValue(
    length: number,
    getDataX: ValueCallback,
    getDataY: ValueCallback,
    valueToPixelX: ValueToPixelCallback,
    simplify: number,
    index: number,
): number {
    const oldX = valueToPixelX(getDataX(index));
    let maxVal = getDataY(index);
    for (let i = index + 1; i < length; ++i) {
        const newX = valueToPixelX(getDataX(i));
        if (Math.abs(newX - oldX) < simplify) {
            maxVal = Math.max(maxVal, getDataY(i));
        } else {
            break;
        }
    }
    for (let i = index - 1; i > -1; --i) {
        const newX = valueToPixelX(getDataX(i));
        if (Math.abs(newX - oldX) < simplify) {
            maxVal = Math.max(maxVal, getDataY(i));
        } else {
            break;
        }
    }
    return maxVal;
}

function calculateMinMaxValue(
    length: number,
    getDataX: ValueCallback,
    getDataY: ValueCallback,
    valueToPixelX: ValueToPixelCallback,
    simplify: number,
    index: number,
): number {
    const oldX = valueToPixelX(getDataX(index));
    let minVal = getDataY(index);
    let maxVal = minVal;
    for (let i = index + 1; i < length; ++i) {
        const newX = valueToPixelX(getDataX(i));
        if (Math.abs(newX - oldX) < simplify) {
            const value = getDataY(i);
            minVal = Math.min(minVal, value);
            maxVal = Math.max(maxVal, value);
        } else {
            break;
        }
    }
    for (let i = index - 1; i > -1; --i) {
        const newX = valueToPixelX(getDataX(i));
        if (Math.abs(newX - oldX) < simplify) {
            const value = getDataY(i);
            minVal = Math.min(minVal, value);
            maxVal = Math.max(maxVal, value);
        } else {
            break;
        }
    }
    return Math.abs(minVal) > maxVal ? minVal : maxVal;
}

function calculateSmothingValue(
    smoothing: number,
    dataY: GraphDataArray,
    index: number,
): number {
    const window = getSmoothingWindow(index, smoothing, dataY.length);
    let sum = 0;
    while (window.low <= window.high) {
        sum += dataY[window.low++];
    }
    return sum / window.length;
}

/* *************** GET DATA CALLBACK *************** */

export function getDataCallback(
    options: FullOptions,
    axis: string,
    dataIndex: number,
    start = 0,
): ValueCallback {
    let data: GraphDataArray | null = null;
    // X-axis.
    if (axis.toLowerCase() === "x") {
        // Has no dataX. Return index + 1.
        if (options.graph.dataX.length === 0) {
            return (index: number) => index + 1;
        }
        // Have one dataX for all dataY.
        if (options.graph.dataX.length === 1) {
            data = options.graph.dataX[0];
        }
        // Have one dataX for each dataY.
        else {
            data = options.graph.dataX[dataIndex];
        }
    }
    // Y-axis.
    else if (axis.toLowerCase() === "y") {
        data = options.graph.dataY[dataIndex];
        // Use smoothing.
        if (options.graph.smoothing) {
            return getDataCallbackSmoothing(options, start, data);
        }
    } else {
        console.error(`owp.graph ERROR: Unknown axis: ${axis}`);
    }
    // Default = 0
    return (index: number) => (data == null ? 0 : data[index]);
}

function getDataCallbackSmoothing(
    options: FullOptions,
    start: number,
    data: GraphDataArray,
): ValueCallback {
    const centralIndex = Math.max(0, start - 1);
    const window = getSmoothingWindow(
        centralIndex,
        options.graph.smoothing,
        data.length,
    );
    let low = window.low;
    let high = window.high;
    let sum = 0;
    for (let i = low; i <= high; ++i) {
        sum += data[i];
    }
    const threshold = 2 * options.graph.smoothing;
    return (index: number) => {
        // Decrease window size.
        if (high === data.length - 1) {
            low = index + index - high;
            sum = 0;
            for (let i = low; i <= high; ++i) {
                sum += data[i];
            }
        }
        // Increase window size.
        else if (high < threshold) {
            high = index + index - low;
            sum = 0;
            for (let i = low; i <= high; ++i) {
                sum += data[i];
            }
        }
        // Move window.
        else {
            sum -= data[low];
            ++low;
            ++high;
            sum += data[high];
        }
        // Calculate average value.
        return sum / (high - low + 1);
    };
}

/* *************** MISC *************** */

function getSmoothingWindow(
    index: number,
    smoothing: number,
    length: number,
): { low: number; high: number; length: number } {
    // Distance to list start.
    const diffToMin = Math.max(0, index);
    // Distance to list end.
    const diffToMax = length - 1 - index;
    // Shortest distance of min, max and smoothing window.
    const diff = Math.min(diffToMin, diffToMax, smoothing);
    return {
        low: index - diff,
        high: index + diff,
        length: 2 * diff + 1,
    };
}
