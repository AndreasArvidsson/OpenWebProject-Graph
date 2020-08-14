const Simplify = {

    render: function (ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end, simplify, simplifyBy) {
        switch (simplifyBy) {
            case "avg":
                renderAvg(ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end, simplify);
                break;
            case "min":
                renderMin(ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end, simplify);
                break;
            case "max":
                renderMax(ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end, simplify);
                break;
            case "minMax":
                renderMinMax(ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end, simplify);
                break;
        }
    },

    calculateValue: function (index, length, getDataX, getDataY, valueToPixelX, simplify, simplifyBy) {
        switch (simplifyBy) {
            case "avg":
                return calculateAvgValue(index, length, getDataX, getDataY, valueToPixelX, simplify);
            case "min":
                return calculateMinValue(index, length, getDataX, getDataY, valueToPixelX, simplify);
            case "max":
                return calculateMaxValue(index, length, getDataX, getDataY, valueToPixelX, simplify);
            case "minMax":
                return calculateMinMaxValue(index, length, getDataX, getDataY, valueToPixelX, simplify);
        }
    }

};

export default Simplify;

function renderAvg(ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end, simplify) {
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

function renderMin(ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end, simplify) {
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

function renderMax(ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end, simplify) {
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

function renderMinMax(ctx, valueToPixelX, valueToPixelY, getDataX, getDataY, start, end, simplify) {
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

function calculateAvgValue(index, length, getDataX, getDataY, valueToPixelX, simplify) {
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

function calculateMinValue(index, length, getDataX, getDataY, valueToPixelX, simplify) {
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

function calculateMaxValue(index, length, getDataX, getDataY, valueToPixelX, simplify) {
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

function calculateMinMaxValue(index, length, getDataX, getDataY, valueToPixelX, simplify) {
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