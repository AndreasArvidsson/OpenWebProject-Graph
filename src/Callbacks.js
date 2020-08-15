import Static from "./Static";

const Callbacks = {};

Callbacks.getRenderCallback = function (options, canvas, axes) {
    //Get value to pixel functions.
    const valueToPixelX = axes.x.getValueToPixelCallback();
    const valueToPixelY = axes.y.getValueToPixelCallback();
    //Value bounds.    
    const min = axes.x.getMin();
    const max = axes.x.getMax();
    //Context
    const ctx = canvas.getContext();
    //Callbacks
    const renderCallback = getRenderCallback(options);
    const strokeCallback = getStrokeCallback(options, canvas);
    return channelIndex => {
        //Aquire callback for getting X-axis data values.
        const getDataX = getDataCallback(options, "x", channelIndex);
        //Find start and end indicies.
        const length = options.graph.dataY[channelIndex].length;
        const bsMin = Static.binarySearch(getDataX, length, min);
        const bsMax = Static.binarySearch(getDataX, length, max);
        let start = bsMin.found !== undefined ? bsMin.found : bsMin.min;
        let end = bsMax.found !== undefined ? bsMax.found : bsMax.max;
        //Aquire callback for getting Y-axis data values.
        const getDataY = getDataCallback(options, "y", channelIndex, start);
        //Start path.    
        ctx.beginPath();
        //Render points/lines.
        renderCallback(ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end);
        //Stroke line.
        strokeCallback(ctx, channelIndex);
    }
};

Callbacks.getCalculateValueCallback = function (options, axes, dataY, getDataX, channelIndex, start) {
    const useSimplify = options.renderSimplify() && (options.graph.simplify > 0.1 || options.graph.simplifyBy !== "minMax");
    if (useSimplify) {
        const valueToPixelX = axes.x.getValueToPixelCallback();
        const getDataY = getDataCallback(options, "y", channelIndex, start);
        return getCalculateSimplifyCallback(options.graph.simplifyBy)
            .bind(null, dataY.length, getDataX, getDataY, valueToPixelX, options.graph.simplify);
    }
    else if (options.graph.smoothing) {
        return calculateSmothingValue.bind(null, options.graph.smoothing, dataY);
    }
    return index => dataY[index];
}


/* *************** RENDER CALLBACKS *************** */

function getRenderCallback(options) {
    if (options.renderSimplify()) {
        const simplify = options.graph.simplify;
        switch (options.graph.simplifyBy) {
            case "avg":
                return renderAvg.bind(null, simplify);
            case "min":
                return renderMin.bind(null, simplify);
            case "max":
                return renderMax.bind(null, simplify);
            case "minMax":
                return renderMinMax.bind(null, simplify);
        }
    }
    return renderFull.bind(
        null,
        !!options.graph.lineWidth,
        options.renderMarkers(),
        options.graph.markerRadius
    );
}

function renderAvg(simplify, ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end) {
    const abs = Math.abs;
    let oldX = valueToPixelX(getDataX(start));
    let sum = getDataY(start);
    let count = 1;
    //We have already counted first value;
    ++start;
    for (; start <= end; ++start) {
        const newX = valueToPixelX(getDataX(start));
        if (abs(newX - oldX) < simplify) {
            sum += getDataY(start);
            ++count;
        }
        else {
            ctx.lineTo(oldX, valueToPixelY(sum / count));
            oldX = newX;
            sum = getDataY(start);
            count = 1;
        }
    }
    //Needed to add the last step.
    ctx.lineTo(oldX, valueToPixelY(sum / count));
}

function renderMin(simplify, ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end) {
    const abs = Math.abs;
    const min = Math.min;
    let oldX = valueToPixelX(getDataX(start));
    let minVal = getDataY(start);
    //We have already counted first value;
    ++start;
    for (; start <= end; ++start) {
        const newX = valueToPixelX(getDataX(start));
        if (abs(newX - oldX) < simplify) {
            minVal = min(minVal, getDataY(start));
        }
        else {
            ctx.lineTo(oldX, valueToPixelY(minVal));
            oldX = newX;
            minVal = getDataY(start);
        }
    }
    //Needed to add the last step.
    ctx.lineTo(oldX, valueToPixelY(minVal));
}

function renderMax(simplify, ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end) {
    const abs = Math.abs;
    const max = Math.max;
    let oldX = valueToPixelX(getDataX(start));
    let maxVal = getDataY(start);
    //We have already counted first value;
    ++start;
    for (; start <= end; ++start) {
        const newX = valueToPixelX(getDataX(start));
        if (abs(newX - oldX) < simplify) {
            maxVal = max(maxVal, getDataY(start));
        }
        else {
            ctx.lineTo(oldX, valueToPixelY(maxVal));
            oldX = newX;
            maxVal = getDataY(start);
        }
    }
    //Needed to add the last step.
    ctx.lineTo(oldX, valueToPixelY(maxVal));
}

function renderMinMax(simplify, ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end) {
    const abs = Math.abs;
    const min = Math.min;
    const max = Math.max;
    let oldX = valueToPixelX(getDataX(start));
    let minVal = getDataY(start);
    let maxVal = minVal;
    //We have already counted first value;
    ++start;
    for (; start <= end; ++start) {
        const newX = valueToPixelX(getDataX(start));
        if (abs(newX - oldX) < simplify) {
            const valueY = getDataY(start);
            minVal = min(minVal, valueY);
            maxVal = max(maxVal, valueY);
        }
        else {
            ctx.lineTo(oldX, valueToPixelY(minVal));
            //Only add the second point if it differs from the first.
            if (minVal !== maxVal) {
                ctx.lineTo(oldX, valueToPixelY(maxVal));
            }
            oldX = newX;
            minVal = getDataY(start);
            maxVal = minVal;
        }
    }
    //Needed to add the last step.
    ctx.lineTo(oldX, valueToPixelY(minVal));
    if (minVal !== maxVal) {
        ctx.lineTo(oldX, valueToPixelY(maxVal));
    }
}

function renderFull(renderLine, renderMarkers, markerRadius, ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end) {
    const circleAngle = 2 * Math.PI;
    //Render line and markers
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
    //Render only line
    else if (renderLine) {
        for (; start <= end; ++start) {
            ctx.lineTo(
                valueToPixelX(getDataX(start)),
                valueToPixelY(getDataY(start))
            );
        }
    }
    //Render only markers
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

function getStrokeCallback(options, canvas) {
    //Fill graph
    if (options.graph.fill) {
        return renderFill.bind(null, options, canvas);
    }
    //Stroke line.
    return renderStroke.bind(null, options);
}

function renderFill(options, canvas, ctx, channelIndex) {
    //Render line
    if (options.graph.lineWidth) {
        if (options.axes.x.inverted) {
            ctx.lineTo(0, canvas.getContentHeight());
            ctx.lineTo(canvas.getContentWidth(), canvas.getContentHeight());
        }
        else {
            ctx.lineTo(canvas.getContentWidth() * canvas.getRatio(), canvas.getContentHeight() * canvas.getRatio());
            ctx.lineTo(0, canvas.getContentHeight() * canvas.getRatio());
        }
        ctx.closePath();
    }
    ctx.fillStyle = options.getColor(channelIndex + 1);
    ctx.fill();
}

function renderStroke(options, ctx, channelIndex) {
    //Set dashed options
    if (options.graph.dashed[channelIndex]) {
        let pattern = options.graph.dashed[channelIndex];
        if (pattern === true) {
            pattern = [5, 8];
        }
        ctx.setLineDash(pattern);
    }
    else {
        ctx.setLineDash([]);
    }

    ctx.strokeStyle = options.getColor(channelIndex + 1);
    ctx.stroke();
}


/* *************** CALCULATE VALUES CALLBACKS *************** */

function getCalculateSimplifyCallback(simplifyBy) {
    switch (simplifyBy) {
        case "avg":
            return calculateAvgValue;
        case "min":
            return calculateMinValue;
        case "max":
            return calculateMaxValue;
        case "minMax":
            return calculateMinMaxValue;
    }
}

function calculateAvgValue(length, getDataX, getDataY, valueToPixelX, simplify, index) {
    const abs = Math.abs;
    const oldX = valueToPixelX(getDataX(index));
    let sum = getDataY(index);
    let count = 1;
    for (let i = index + 1; i < length; ++i) {
        const newX = valueToPixelX(getDataX(i));
        if (abs(newX - oldX) < simplify) {
            sum += getDataY(i);
            ++count;
        }
        else {
            break;
        }
    }
    for (let i = index - 1; i > -1; --i) {
        const newX = valueToPixelX(getDataX(i));
        if (abs(newX - oldX) < simplify) {
            sum += getDataY(i);
            ++count;
        }
        else {
            break;
        }
    }
    return sum / count;
}

function calculateMinValue(length, getDataX, getDataY, valueToPixelX, simplify, index) {
    const abs = Math.abs;
    const min = Math.min;
    const oldX = valueToPixelX(getDataX(index));
    let minVal = getDataY(index);
    for (let i = index + 1; i < length; ++i) {
        const newX = valueToPixelX(getDataX(i));
        if (abs(newX - oldX) < simplify) {
            minVal = min(minVal, getDataY(i));
        }
        else {
            break;
        }
    }
    for (let i = index - 1; i > -1; --i) {
        const newX = valueToPixelX(getDataX(i));
        if (abs(newX - oldX) < simplify) {
            minVal = min(minVal, getDataY(i));
        }
        else {
            break;
        }
    }
    return minVal;
}

function calculateMaxValue(length, getDataX, getDataY, valueToPixelX, simplify, index) {
    const abs = Math.abs;
    const max = Math.max;
    const oldX = valueToPixelX(getDataX(index));
    let maxVal = getDataY(index);
    for (let i = index + 1; i < length; ++i) {
        const newX = valueToPixelX(getDataX(i));
        if (abs(newX - oldX) < simplify) {
            maxVal = max(maxVal, getDataY(i));
        }
        else {
            break;
        }
    }
    for (let i = index - 1; i > -1; --i) {
        const newX = valueToPixelX(getDataX(i));
        if (abs(newX - oldX) < simplify) {
            maxVal = max(maxVal, getDataY(i));
        }
        else {
            break;
        }
    }
    return maxVal;
}

function calculateMinMaxValue(length, getDataX, getDataY, valueToPixelX, simplify, index) {
    const abs = Math.abs;
    const min = Math.min;
    const max = Math.max;
    const oldX = valueToPixelX(getDataX(index));
    let minVal = getDataY(index);
    let maxVal = minVal;
    for (let i = index + 1; i < length; ++i) {
        const newX = valueToPixelX(getDataX(i));
        if (abs(newX - oldX) < simplify) {
            const value = getDataY(i);
            minVal = min(minVal, value);
            maxVal = max(maxVal, value);
        }
        else {
            break;
        }
    }
    for (let i = index - 1; i > -1; --i) {
        const newX = valueToPixelX(getDataX(i));
        if (abs(newX - oldX) < simplify) {
            const value = getDataY(i);
            minVal = min(minVal, value);
            maxVal = max(maxVal, value);
        }
        else {
            break;
        }
    }
    return abs(minVal) > maxVal ? minVal : maxVal;
}

function calculateSmothingValue(smoothing, dataY, index) {
    const window = getSmoothingWindow(index, smoothing, dataY.length);
    let sum = 0;
    while (window.low <= window.high) {
        sum += dataY[window.low++];
    }
    return sum / window.length;
}

/* *************** GET DATA CALLBACK *************** */

function getDataCallback(options, axis, dataIndex, start) {
    let data;
    //X-axis.
    if (axis.toLowerCase() === "x") {
        //Has no dataX. Return index + 1.
        if (options.graph.dataX.length === 0) {
            return index => index + 1;
        }
        //Have one dataX for all dataY. 
        if (options.graph.dataX.length === 1) {
            data = options.graph.dataX[0];
        }
        //Have one dataX for each dataY. 
        else {
            data = options.graph.dataX[dataIndex];
        }
    }
    //Y-axis.
    else if (axis.toLowerCase() === "y") {
        data = options.graph.dataY[dataIndex];
        //Use smoothing.
        if (options.graph.smoothing) {
            return getDataCallbackSmoothing(options, start, data);
        }
    }
    else {
        console.error("owp.graph ERROR: Unknown axis: " + axis);
    }
    //Default
    return function (index) {
        return data[index];
    };
}
Callbacks.getDataCallback = getDataCallback;

function getDataCallbackSmoothing(options, start, data) {
    const centralIndex = Math.max(0, start - 1);
    const window = getSmoothingWindow(centralIndex, options.graph.smoothing, data.length);
    let low = window.low;
    let high = window.high;
    let sum = 0;
    for (let i = low; i <= high; ++i) {
        sum += data[i];
    }
    const threshold = 2 * options.graph.smoothing;
    return index => {
        //Decrease window size.
        if (high === data.length - 1) {
            low = index + index - high;
            sum = 0;
            for (let i = low; i <= high; ++i) {
                sum += data[i];
            }
        }
        //Increase window size.
        else if (high < threshold) {
            high = index + index - low;
            sum = 0;
            for (let i = low; i <= high; ++i) {
                sum += data[i];
            }
        }
        //Move window.
        else {
            sum -= data[low];
            ++low;
            ++high;
            sum += data[high];
        }
        //Calculate average value.
        return sum / (high - low + 1);
    };
}


/* *************** MISC *************** */

function getSmoothingWindow(index, smoothing, length) {
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
}

export default Callbacks;