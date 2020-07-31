/** 
 * The Canvas class is a wrapper for the HTML5 canvas 2D context.
 * Used to automatically get pixel perfect canvas size 
 * and to make it easier to draw simple elements.
 */

/**
 * Create a new canvas. Canvas is automatically scaled to be pixel perfect with screen.
 * @public
 * @constructor
 * @param {dom} container - Container dom.
 * @param {bool} dontScale - If True the scale transformation wont be set for this canvas. Scaling needs to be done manually.
 * @returns {Canvas}
 */
function Canvas(container, id, dontScale) {
    this._canvas = document.createElement("canvas");
    if (id) {
        this._canvas.id = id;
    }
    container.append(this._canvas);
    this._context = this._canvas.getContext("2d");

    this._dontScale = dontScale;

    this._canvas.style.position = "absolute";
    this._canvas.style.margin = 0;
    this._canvas.style.padding = 0;
    this._canvas.style["box-sizing"] = "border-box";

    //Set default position.
    this.setPosition(0, 0);
    //Fill parent div is default size.
    this.setSize("100%", "100%");
}

/**
 * Set a new parent for the canvas. Leave empty to only remove current parent.
 * @public
 * @param {dom} container - Container dom.
 */
Canvas.prototype.setParent = function (container) {
    this._canvas.remove();
    if (container) {
        container.append(this._canvas);
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
    }
    //Do scaling manually.
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
    }
    //Do scaling manually.
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
    }
    else {
        this._canvas.style.left = x + "px";
        this._canvas.style.right = "";
    }
    if (valignBottom) {
        this._canvas.style.top = "";
        this._canvas.style.bottom = y + "px";
    }
    else {
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
    const bsr = this._context.webkitBackingStorePixelRatio ||
        this._context.mozBackingStorePixelRatio ||
        this._context.msBackingStorePixelRatio ||
        this._context.oBackingStorePixelRatio ||
        this._context.backingStorePixelRatio || 1;
    this._ratio = dpr / bsr;

    //Update canvas.
    this._canvas.width = this.getContentWidth() * this._ratio;
    this._canvas.height = this.getContentHeight() * this._ratio;

    //Check the dont scale parameter before scaling. Scaling is a time consuming process and might not be desired.
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
    }
    //Line width build in both direction. Compensate coordinates.
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
    }
    else {
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

export default Canvas;