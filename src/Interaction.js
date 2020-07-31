import Static from "./Static";
import Input from "./Input";

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
    }
    else if (!this._graph._options.interaction.resize && this._resizeCallback) {
        window.removeEventListener("resize", this._resizeCallback);
        this._resizeCallback = undefined;
    }

    //Mouse tracking.
    if (this._graph._options.interaction.trackMouse && !this._mouseTrackingCallbacks) {
        this._mouseTrackingCallbacks = this._addMouseTrackingEvents();
    }
    else if (!this._graph._options.interaction.trackMouse && this._mouseTrackingCallbacks) {
        const canvas = this._graph._canvas.interaction.getCanvas();
        canvas.removeEventListener("mousemove", this._mouseTrackingCallbacks.mousemove);
        canvas.removeEventListener("mouseout", this._mouseTrackingCallbacks.mouseout);
        this._mouseTrackingCallbacks = undefined;
    }

    //Zooming.
    if (this._graph._options.interaction.zoom && !this._zoomCallbacks) {
        this._zoomCallbacks = this._addZoomEvents();
    }
    else if (!this._graph._options.interaction.zoom && this._zoomCallbacks) {
        let canvas = this._graph._canvas.interaction.getCanvas();
        canvas.removeEventListener("mousedown", this._zoomCallbacks.mousedown);
        canvas.removeEventListener("mousemove", this._zoomCallbacks.mousemove);
        canvas.removeEventListener("mouseup", this._zoomCallbacks.mouseup);
        canvas.removeEventListener("dblclick", this._zoomCallbacks.dblclick);
        canvas.removeEventListener("contextmenu", contextmenu);
        canvas = this._graph._canvas.background.getCanvas();
        canvas.removeEventListener("mouseup", this._zoomCallbacks.mouseup);
        canvas.removeEventListener("mouseout", this._zoomCallbacks.mouseout);
        canvas.removeEventListener("contextmenu", contextmenu);
        this._zoomCallbacks = undefined;
    }

    //Smooth option.
    if (this._graph._options.interaction.smoothing && !this._smoothingCallback) {
        this._smoothingCallback = this._addSmoothingEvent();
    }
    else if (!this._graph._options.interaction.smoothing && this._smoothingCallback) {
        this._smoothingInput.removeEventListener("change", this._smoothingCallback);
        this._smoothingCallback = undefined;
        this._smoothingInput.remove();
        this._smoothingInput = undefined;
    }

    //Every time options are updated. Update smoothing value if available.
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
        this._smoothingInput.style.top = (y + height - 21) + "px";
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
    let timeOutResize;
    //Re-plots the graph on resize end.
    function resizeEnd() {
        graph._canvas.background.resize();
        graph._calculateGraphSize();
        graph._plot();
        timeOutResize = undefined;
        self._resizing = false;
    }
    //Clear graph, hightlight and spinner features on resize start.
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
            lastPixelRatio = window.devicePixelRatio;
            //First time the function is called for this resize event.
            if (!timeOutResize) {
                resizeStart();
            }
            //Reset timer each time so that the resizeEnd function doesnt run until the user has stopped resizing.
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
            const dataY = graph._options.graph.dataY[i];
            //Cant track unexisting values.
            if (!dataY.length) {
                break;
            }
            const dataXCallback = graph._options.getDataCallback("x", i);
            const res = Static.binarySearch(dataXCallback, dataY.length, valueX);
            let valueY;
            //Found exaxt X-value.
            if (res.found !== undefined) {
                if (graph._options.graph.smoothing) {
                    valueY = Static.calculateSmothingValue(res.found, graph._options.graph.smoothing, dataY);
                }
                else {
                    valueY = dataY[res.found];
                }
            }
            //Binary search returned min and max at same value without a found.
            //There is no matching value. Just abort.
            else if (res.min === res.max) {
                break;
            }
            //Calculate Y-value from min max coordinates.
            else {
                const valueXMin = dataXCallback(res.min);
                const valueXMax = dataXCallback(res.max);
                const span = valueXMax - valueXMin;
                const weightMin = 1 - (valueX - valueXMin) / span;
                const weightMax = 1 - (valueXMax - valueX) / span;
                let valueMin, valueMax;
                if (graph._options.graph.smoothing) {
                    valueMin = Static.calculateSmothingValue(res.min, graph._options.graph.smoothing, dataY);
                    valueMax = Static.calculateSmothingValue(res.max, graph._options.graph.smoothing, dataY);
                }
                else {
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
    return { mousemove: mouseMoveCallback, mouseout: mouseOutCallback };
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
    let startX, startY;
    //true = horizontal. false = vertical.
    let lastHorizontal;
    const color = "rgba(130, 130, 130, 0.2)";
    let lastX, lastY;

    function mousedown(e) {
        if (e.button !== 0 || !graph._axes.x.hasBounds() || !graph._axes.y.hasBounds()) {
            return;
        }
        lastX = startX = e.offsetX;
        lastY = startY = e.offsetY;
        self.mouseDown = true;
        lastHorizontal = undefined;
        graph._renderLegend();
    }
    function mousemove(e) {
        if (self.mouseDown && (e.offsetX !== lastX || e.offsetX !== lastY)) {
            lastX = e.offsetX;
            lastY = e.offsetY;
            const diffX = Math.abs(startX - e.offsetX);
            const diffY = Math.abs(startY - e.offsetY);
            const newHorizontal = diffX > diffY;
            if (newHorizontal === undefined || (newHorizontal !== lastHorizontal && (newHorizontal ? diffX : diffY) > threshold)) {
                lastHorizontal = newHorizontal;
            }
            graph._canvas.interaction.clear();
            //Mark horizontally.
            if (lastHorizontal) {
                graph._canvas.interaction.fillRectangle2(startX, 0, e.offsetX, graph._canvas.interaction.getContentHeight(), color);
            }
            //Mark vertically.
            else {
                graph._canvas.interaction.fillRectangle2(0, startY, graph._canvas.interaction.getContentWidth(), e.offsetY, color);
            }
        }
    }
    function mouseup(e) {
        if (e.button === 0 && self.mouseDown) {
            if (startX !== e.offsetX || startY !== e.offsetY) {
                graph._canvas.interaction.clear();
                //X-axis.
                if (lastHorizontal) {
                    const x = clamp(0, e.offsetX, graph._canvas.interaction.getContentWidth());
                    const min = graph._axes.x.pixelToValue(Math.min(startX, x));
                    const max = graph._axes.x.pixelToValue(Math.max(startX, x));
                    graph._axes.x.zoom(min, max);
                }
                //Y-axis.
                else {
                    const y = clamp(0, e.offsetY, graph._canvas.interaction.getContentHeight());
                    const min = graph._axes.y.pixelToValue(Math.max(startY, y));
                    const max = graph._axes.y.pixelToValue(Math.min(startY, y));
                    graph._axes.y.zoom(min, max);
                }
                graph._plot();
            }
            self.mouseDown = false;
        }
    }
    function dblclick(e) {
        //Prevents double click from selecting the div.
        preventDefault(e);
        if (graph._axes.x.hasZoom() || graph._axes.y.hasZoom()) {
            graph._axes.x.clearZoom();
            graph._axes.y.clearZoom();
            graph._plot();
        }
    }
    function mouseout(e) {
        //Make sure we are in a drag event and that we are moving outside of the graph. Not inwards.
        if (!self.mouseDown || e.toElement === graph._canvas.graph.getCanvas() || e.toElement === graph._canvas.interaction.getCanvas()) {
            return;
        }
        graph._canvas.interaction.clear();
        self.mouseDown = false;
    }
    const contextmenu = e => preventDefault(e);

    let canvas = graph._canvas.interaction.getCanvas();
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("dblclick", dblclick);
    canvas.addEventListener("contextmenu", contextmenu);

    canvas = this._graph._canvas.background.getCanvas();
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("mouseleave", mouseout);
    canvas.addEventListener("contextmenu", contextmenu);

    return { mousedown, mousemove, mouseup, dblclick, mouseout, contextmenu };
};

/**
 * Add smoothing input event.
 * @returns {object} Object containing callbacks.
 */
Interaction.prototype._addSmoothingEvent = function () {
    this._smoothingInput = Input({
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
    this._graph._container.append(this._smoothingInput);
    const self = this;
    function callbackDone() {
        let value = parseInt(self._smoothingInput.value);
        //Calculate min length for all data sets. Smoothing can't be greater than availalbe data points.
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
        ctx.clearRect(0, 0, 2 * radius, 2 * radius);

        //Draw solid circle
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
        ctx.fillStyle = this._graph._options.graph.colors[i + 1];
        ctx.fill();

        //If fill; draw black border to increase visibility.
        if (this._graph._options.graph.fill) {
            ctx.beginPath();
            ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = "#000000";
            ctx.stroke();
        }

        //Get image data from tmp context.
        const imageData = ctx.getImageData(0, 0, 2 * radius, 2 * radius);
        //Add member data.
        const canvas = this._graph._canvas.interaction;
        imageData.moveTo = function (x, y) {
            canvas.putImageData(this, x, y, -radius, -radius);
        };
        this._interactionData[i] = imageData;
    }
};

export default Interaction;

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

function preventDefault(e) {
    //Firefox, Chrome, etc.
    if (e.preventDefault) {
        e.preventDefault();
    }
    //IE
    else {
        e.returnValue = false;
        e.cancelBubble = true;
    }
}

