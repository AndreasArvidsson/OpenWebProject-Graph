/*
* @author Andreas Arvidsson
 * https://github.com/AndreasArvidsson/OpenWebProject-graph
 */

if (!window.HTMLCanvasElement || !window.CanvasRenderingContext2D) {
    throw Error("owp.graph ERROR: Your browser does not support the HTML5 Canvas.");
}

import Spinner from "./lib/spin.min";
import Canvas from "./Canvas";
import Axis from "./Axis";
import Interaction from "./Interaction";
import Static from "./Static";
import Options from "./Options";
import Is from "./Is";

/** 
 * The Graph class is a 2D graph plotter.
 * Built with performance and customizability in mind. Supports multiple data
 * sets and all data sets are available as typed arrays.
 */

/**
 * Create new graph.
 * @public
 * @constructor
 * @param {dom} parent - Parent div.  DOM or ID string. Graph will fill this div.
 * @param {OPTIONS_OBJECT} options - Options to customize the graph.
 * @returns {Graph}
 */
function Graph(parent, options) {
    if (this instanceof Graph) {
        this._init(parent, options);
    }
    //The new keyword was omitted.
    else {
        return new Graph(parent, options);
    }
}

/**
 * Implementation of the constructor.
 * @private
 * @param {dom} parent - Parent div. DOM or ID string. Graph will fill this div.
 * @param {OPTIONS} options - Options to customize the graph.
 */
Graph.prototype._init = function (parent, options) {
    if (!parent) {
        console.error("owp.graph ERROR: Parent dom is null");
        return;
    }

    parent.style.position = "relative";

    this._parent = parent;
    this._options = new Options();

    this._highlights = [];

    this._canvas = {
        background: new Canvas(parent, "background"),
        graph: new Canvas(parent, "graph", true),
        highlight: new Canvas(parent, "highlight"),
        interaction: new Canvas(parent, "interaction")
    };

    this._canvas.background.setZIndex(0);
    this._canvas.graph.setZIndex(1);
    this._canvas.highlight.setZIndex(2);
    //Spinner uses zIndex 3.
    this._canvas.interaction.setZIndex(4);
    //Smoothing input used zIndex 5.

    this._axes = {
        x: new Axis(this._options, this._canvas.graph, "x"),
        y: new Axis(this._options, this._canvas.graph, "y")
    };

    this._interaction = new Interaction(this);

    if (options) {
        this.setOptions(options);
    }
    else {
        console.warn("owp.graph WARNING: No options set. Uses default.");
        this.setOptions({});
    }
};

/**
 * Create legend canvas and attach to parent dom.
 * @private
 */
Graph.prototype._initLegend = function () {
    const location = this._options.legend.location;
    if (location && this._options.interaction.trackMouse) {
        //DIV id.
        if (location.toLowerCase() !== "top" && location.toLowerCase() !== "right") {
            const legendDiv = document.getElementById(location);
            if (legendDiv) {
                legendDiv.style.position = "relative";
                //Reuse existing canvas.
                if (this._canvas.legend) {
                    this._canvas.legend.setParent(legendDiv);
                }
                //Create new canvas.
                else {
                    this._canvas.legend = new Canvas(legendDiv);
                }
            }
            else {
                console.warn("owp.graph WARNING: Legend location: \"" + location + "\" not found.");
            }
        }
        else {
            //Set same parent for legend as rest of graph.
            if (this._canvas.legend) {
                this._canvas.legend.setParent(this._parent);
            }
            else {
                this._canvas.legend = new Canvas(this._parent);
                this._canvas.legend.disableMouseInteraction();
            }
            if (location.toLowerCase() === "top") {
                this._canvas.legend.setSize("100%", this._options.legend.size);
            }
            else if (location.toLowerCase() === "right") {
                this._canvas.legend.setPosition(0, 0, true);
                this._canvas.legend.setSize(200, "100%");
            }
        }
    }
    //Remove old legend.
    else if (this._canvas.legend) {
        this._canvas.legend.setParent();
        this._canvas.legend = undefined;
    }
};

/**
 * Renders the legend on the background canvas.
 * @private
 */
Graph.prototype._renderLegend = function (values) {
    if (!this._canvas.legend || !this._options.graph.dataY.length) {
        return;
    }

    const settings = this._options.legend;
    const canvas = this._canvas.legend;
    canvas.clear();
    canvas.set("font", this._options.getLegendFont());
    canvas.set("textBaseline", "top");
    canvas.set("textAlign", settings.align);

    const isTop = settings.location.toLowerCase() === "top";
    const alignLeft = settings.align.toLowerCase() === "left";
    //newLine is disabled for top location.
    const newLine = settings.newLine && !isTop || settings.location.toLowerCase() === "right";
    let x = alignLeft ? this._options.legend.offsetX : canvas.getWidth() - this._options.legend.offsetX;
    //OffsetY is disabled for top location.
    let y = isTop ? 0 : this._options.legend.offsetY;

    function printValue(color, name, value) {
        const str = name + ": " + (value !== undefined ? value : "\u2014");
        canvas.text(str, x, y, null, color);
        if (newLine) {
            y += settings.size;
        }
        else {
            x += (canvas.getTextWidth(str) + 10) * (alignLeft ? 1 : -1);
        }
    }

    if (alignLeft || newLine) {
        for (let i = 0; i <= this._options.graph.dataY.length; ++i) {
            printValue(
                this._options.graph.colors[i],
                this._options.getName(i),
                values && values[i] !== undefined
                    ? this._axes.y.formatLegendValue(values[i])
                    : undefined
            );
        }
    }
    else {
        for (let i = this._options.graph.dataY.length; i >= 0; --i) {
            printValue(
                this._options.graph.colors[i],
                this._options.getName(i),
                values && values[i] !== undefined
                    ? this._axes.y.formatLegendValue(values[i])
                    : undefined
            );
        }
    }
};


/**
 * Get options instance.
 * @public
 * @returns {Options}
 */
Graph.prototype.getOptions = function () {
    return this._options;
};

/**
 * Sets all options to their default values.
 * @public
 */
Graph.prototype.setDefaultOptions = function () {
    this.setOptions(Options.getDefault());
};

/**
 * Set new options.
 * @public
 * @param {OPTIONS_OBJECT} options - Options to customize the graph.
 */
Graph.prototype.setOptions = function (options) {
    this._options.set(options);
    this._hasCalculatedGraphSize = false;
    if (this._options.isOk()) {
        this._axes.x.calculateBounds();
        this._axes.y.calculateBounds();
        this._interaction.updateOptions();
        this._canvas.graph.setBorder(this._options.border.style, this._options.border.color, this._options.border.width);
        this._initLegend();
        this._plot();
    }
};

/**
 * Set new data.
 * @public
 */
Graph.prototype.setData = function (dataX, dataY) {
    const options = { graph: {} };
    if (dataX) {
        options.graph.dataX = dataX;
    }
    if (dataY) {
        options.graph.dataY = dataY;
    }
    this.setOptions(options);
};

/**
 * 
 * @param {number} x1 - Min X value.
 * @param {number} y1 - Min Y value.
 * @param {number} x2 - Max X-value.
 * @param {number} y2 - Max Y-value.
 * @returns {undefined}
 */
Graph.prototype.zoom = function (x1, y1, x2, y2) {
    this._axes.x.overrideBounds({ min: x1, max: x2 });
    this._axes.y.overrideBounds({ min: y1, max: y2 });
    this._plot();
};

/**
 * Reset zoom level to zero.
 * @returns {undefined}
 */
Graph.prototype.resetZoom = function () {
    this._axes.x.clearOverridenBounds();
    this._axes.y.clearOverridenBounds();
    this._plot();
};

/**
 * Clears/removes current highlight.
 * @public
 */
Graph.prototype.clearHighlight = function () {
    this._canvas.highlight.clear();
    this._highlights = [];
};

/**
 * Highlight the given are of the graph.
 * @public
 * @param {number} x1 - First x-axis value.
 * @param {number} y1 - First y-axis value.
 * @param {number} x2 - Second x-axis value.
 * @param {number} y2 - Second y-axis value.
 * @param {string} color - Color of the selected area.
 */
Graph.prototype.highlight = function (x1, y1, x2, y2, color) {
    this._highlights.push({
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        color: color ? color : "rgba(0, 0, 255, 0.2)"
    });
    if (this._axes.x.hasBounds() && this._axes.y.hasBounds()) {
        this._renderHighlight();
    }
};

/**
 * Manually start or stop spinner.
 * @public
 * @param {bool} doSpin - If true the spinner will start.
 */
Graph.prototype.spin = function (doSpin) {
    if (doSpin) {
        //Spinner does not exist. Create it.
        if (!this._spinner) {
            this._spinnerDiv = document.createElement("div");
            this._parent.append(this._spinnerDiv);
            this._spinnerDiv.style.position = "absolute";
            this._spinnerDiv.style["z-index"] = 3;
            this._updateSpinnerSize();
            this._spinner = new Spinner(this._options.spinner);
        }
        if (!this._spinner.isSpinning) {
            this._spinner.spin(this._spinnerDiv);
            this._spinner.isSpinning = true;
        }
    }
    else if (this._spinner) {
        this._spinner.stop();
        this._spinner.isSpinning = false;
    }
};

/**
 * Plots/draws the graph.
 * @private
 */
Graph.prototype._plot = function () {
    if (!this._options.isOk()) {
        console.error("owp.graph ERROR: Can't plot: Invalid options.");
        return;
    }

    if (this._options.debug) {
        console.time("owp.graph DEBUG: Plot time");
    }

    //If graph size has not yet been calculated. Do it.
    if (!this._hasCalculatedGraphSize) {
        this._calculateGraphSize();
    }

    //Clear plot.
    this._canvas.background.clear();
    this._canvas.graph.clear();
    this._canvas.highlight.clear();
    this._interaction.clear();

    //Render non data related features.
    this._renderTitle();
    this._renderAxesLabels();

    //Has bounds. Render bounds related features.
    if (this._axes.x.hasBounds() && this._axes.y.hasBounds()) {
        this._renderXAxis();
        this._renderYAxis();
        this._renderHighlight();

        //Has graph data. Render graph data.
        if (this._options.graph.dataY.length) {
            this._renderLegend();
            this._renderGraph();
            this._interaction.render();
        }
        else if (this._options.debug) {
            console.log("owp.graph DEBUG: No data set available. Plotting available features.");
        }
    }
    //Has neither bounds or data.
    else if (this._options.debug) {
        console.log("owp.graph DEBUG: No bounds or data set available. Plotting available features.");
    }

    if (this._options.debug) {
        console.timeEnd("owp.graph DEBUG: Plot time");
    }
};

/**
 * Updates the position and size of the spinner div based on the graph canvas.
 * @private
 */
Graph.prototype._updateSpinnerSize = function () {
    if (this._spinnerDiv) {
        this._spinnerDiv.style.left = this._canvas.graph.getContentX() + "px";
        this._spinnerDiv.style.top = this._canvas.graph.getContentY() + "px";
        this._spinnerDiv.style.width = this._canvas.graph.getContentWidth() + "px";
        this._spinnerDiv.style.height = this._canvas.graph.getContentHeight() + "px";
    }
};

/**
 * Calculate graph canvas position and size.
 * @private
 */
Graph.prototype._calculateGraphSize = function () {
    let x = this._getOffset(["left"]);
    let y = this._getOffset(["top"]);
    let width = this._canvas.background.getWidth() - this._getOffset(["left", "right"]);
    let height = this._canvas.background.getHeight() - this._getOffset(["top", "bottom"]);

    //Set graph canvas.
    this._canvas.graph.setPosition(x, y);
    this._canvas.graph.setSize(width, height);

    //Convert to content space.
    x = this._canvas.graph.getContentX();
    y = this._canvas.graph.getContentY();
    width = this._canvas.graph.getContentWidth();
    height = this._canvas.graph.getContentHeight();

    //Set highlight canvas.
    this._canvas.highlight.setPosition(x, y);
    this._canvas.highlight.setSize(width, height);
    //Set interaction canvas.
    this._canvas.interaction.setPosition(x, y);
    this._canvas.interaction.setSize(width, height);
    //Set legend canvas if available.
    if (this._canvas.legend) {
        if (this._options.legend.location.toLowerCase() === "top") {
            this._canvas.legend.setPosition(x, y - this._canvas.legend.getHeight() - this._options.legend.offsetY);
            this._canvas.legend.setSize(width, this._options.legend.size);
        }
        else if (this._options.legend.location.toLowerCase() === "right") {
            this._canvas.legend.setPosition(0, y, true);
            this._canvas.legend.setSize(200, height);
        }
    }

    //Update interaction instance.
    this._interaction.graphChangedSize(x, y, width, height);

    //Updates the spinner div size.
    this._updateSpinnerSize();

    //Calculate new ticks for the new size.
    if (this._axes.x.hasBounds() && this._axes.y.hasBounds()) {
        this._axes.x.calculateTicks();
        this._axes.y.calculateTicks();
    }
    this._hasCalculatedGraphSize = true;
};

/**
 * Renders the x-axis(ticks markers, tick labels, grid lines) on the background canvas.
 * @private
 */
Graph.prototype._renderXAxis = function () {
    if (!this._options.axes.x.show) {
        return;
    }
    const ticks = this._axes.x.getTicks();
    let oldX, oldWidth;
    for (let i = 0; i < ticks.length; ++i) {
        let x = this._canvas.graph.getContentX() + ticks[i].coordinate;
        let y = this._canvas.graph.getY() + this._canvas.graph.getHeight();
        //Draw tick markers.
        if (ticks.markers) {
            y += ticks.markers.offset;
            this._canvas.background.line(x, y, x, y + ticks.markers.length, ticks.markers.width, ticks.markers.color);
            y += ticks.markers.length;
        }
        //Draw grid line.
        if (ticks.grid && x > this._canvas.graph.getContentX() * 1.01 && x < (this._canvas.graph.getContentX() + this._canvas.graph.getContentWidth()) * 0.99) {
            this._canvas.background.line(x, this._canvas.graph.getContentY(), x, this._canvas.graph.getContentY() + this._canvas.graph.getContentHeight(), ticks.grid.width, ticks.grid.color);
        }
        //Draw tick label.
        if (ticks.labels && (!oldX || Math.abs(x - oldX) > oldWidth + ticks.labels.width[i] / 2)) {
            y += ticks.labels.offset;
            this._canvas.background.text(ticks[i].label, x, y, ticks.labels.font, ticks.labels.color, "center", "hanging");
            oldX = x;
            oldWidth = ticks.labels.width[i];
        }
    }
};

/**
 * Renders the y-axis(ticks markers, tick labels, grid lines) on the background canvas.
 * @private
 */
Graph.prototype._renderYAxis = function () {
    if (!this._options.axes.y.show) {
        return;
    }
    const ticks = this._axes.y.getTicks();
    let oldY;
    for (let i = 0; i < ticks.length; ++i) {
        let x = this._canvas.graph.getX();
        let y = this._canvas.graph.getContentY() + ticks[i].coordinate;
        //Draw tick markers.
        if (ticks.markers) {
            x -= ticks.markers.offset;
            this._canvas.background.line(x, y, x - ticks.markers.length, y, ticks.markers.width, ticks.markers.color);
            x -= ticks.markers.length;
        }
        //Draw grid line.
        if (ticks.grid && y > this._canvas.graph.getContentY() * 1.01 && y < (this._canvas.graph.getContentY() + this._canvas.graph.getContentHeight()) * 0.99) {
            this._canvas.background.line(this._canvas.graph.getContentX(), y, this._canvas.graph.getContentX() + this._canvas.graph.getContentWidth(), y, ticks.grid.width, ticks.grid.color);
        }
        //Draw tick label.
        if (ticks.labels && (!oldY || Math.abs(y - oldY) > ticks.labels.size)) {
            x -= ticks.labels.offset;
            this._canvas.background.text(ticks[i].label, x, y, ticks.labels.font, ticks.labels.color, "right", "middle");
            oldY = y;
        }
    }
};

/**
 * Renders the axes(x and y) labels on the background canvas.
 * @private
 */
Graph.prototype._renderAxesLabels = function () {
    //Draw X label.
    if (this._options.axes.x.show && this._options.axes.x.label.length) {
        const x = this._canvas.graph.getContentX() + this._canvas.graph.getContentWidth() / 2;
        const y = this._canvas.background.getHeight() - this._options.axes.labels.offset;
        this._canvas.background.text(this._axes.x.getAxisLabel(), x, y, this._axes.x.getAxisLabelFont(), this._options.axes.labels.color, "center", "bottom");
    }
    //Draw Y label.
    if (this._options.axes.y.show && this._options.axes.y.label.length) {
        const x = this._options.axes.labels.offset;
        const y = this._canvas.graph.getContentY() + this._canvas.graph.getContentHeight() / 2;
        this._canvas.background.text(this._axes.y.getAxisLabel(), x, y, this._axes.y.getAxisLabelFont(), this._options.axes.labels.color, "center", "hanging", -90);
    }
};

/**
 * Renders the graph title on the background canvas.
 * @private
 */
Graph.prototype._renderTitle = function () {
    if (!this._options.title.label.length) {
        return;
    }
    let x;
    if (this._options.title.align.toLowerCase() === "left") {
        x = this._canvas.graph.getContentX() + this._options.title.offsetX;
    }
    else if (this._options.title.align.toLowerCase() === "center") {
        x = this._canvas.graph.getContentX() + this._canvas.graph.getContentWidth() / 2 + this._options.title.offsetX;
    }
    else if (this._options.title.align.toLowerCase() === "right") {
        x = this._canvas.graph.getContentX() + this._canvas.graph.getContentWidth() - this._options.title.offsetX;
    }
    const y = this._options.title.offsetY;
    const font = (this._options.title.bold ? "bold " : "") + this._options.title.size + "px " + this._options.title.font;
    this._canvas.background.text(this._options.title.label, x, y, font, this._options.title.color, this._options.title.align, "top");
};

/**
 * Renders the highligted area on the highligh canvas.
 * @private
 */
Graph.prototype._renderHighlight = function () {
    this._canvas.highlight.clear();
    for (let i = 0; i < this._highlights.length; ++i) {
        let x1, y1, x2, y2;
        //Convert values to pixels.
        if (Is.isNull(this._highlights[i].x1)) {
            x1 = 0;
        }
        else {
            x1 = this._axes.x.valueToPixel(this._highlights[i].x1);
        }
        if (Is.isNull(this._highlights[i].y1)) {
            y1 = 0;
        }
        else {
            y1 = this._axes.y.valueToPixel(this._highlights[i].y1);
        }
        if (Is.isNull(this._highlights[i].x2)) {
            x2 = this._canvas.graph.getContentWidth();
        }
        else {
            x2 = this._axes.x.valueToPixel(this._highlights[i].x2);
        }
        if (Is.isNull(this._highlights[i].y2)) {
            y2 = this._canvas.graph.getContentHeight();
        }
        else {
            y2 = this._axes.y.valueToPixel(this._highlights[i].y2);
        }
        this._canvas.highlight.fillRectangle2(x1, y1, x2, y2, this._highlights[i].color);
    }
};

/**
 * Renders the graph curve on the graph canvas.
 * @private
 */
Graph.prototype._renderGraph = function () {
    if (this._options.debug && this._options.graph.smoothing > 1) {
        console.log("owp.graph DEBUG: Smoothed rendering: " + this._options.graph.smoothing);
    }

    if (this._options.debug && this._options.graph.simplify) {
        console.log("owp.graph DEBUG: Simplify rendering: " + this._options.graph.simplify);
    }

    this._canvas.graph.clear();

    //Get value to pixel functions.
    const valueToPixelX = this._axes.x.getValueToPixelCallback();
    const valueToPixelY = this._axes.y.getValueToPixelCallback();
    //Value bounds        
    const min = this._axes.x.getMin();
    const max = this._axes.x.getMax();
    //Get canvas context directly for increased performance.
    const context = this._canvas.graph.getContext();
    context.lineWidth = this._options.graph.lineWidth;
    context.globalCompositeOperation = this._options.graph.compositeOperation;
    for (let i = 0; i < this._options.graph.dataY.length; ++i) {
        //Aquire callback for getting X-axis data values.
        const getDataX = this._options.getDataCallback("x", i);

        //Find start and end indicies.
        const length = this._options.graph.dataY[i].length;
        const bsMin = Static.binarySearch(getDataX, length, min);
        const bsMax = Static.binarySearch(getDataX, length, max);
        let start = bsMin.found !== undefined ? bsMin.found : bsMin.min;
        let end = bsMax.found !== undefined ? bsMax.found : bsMax.max;

        //Aquire callback for getting Y-axis data values.
        const getDataY = this._options.getDataCallback("y", i, start);

        //Start path.
        context.beginPath();

        //Render simplified data set.
        if (this._options.graph.simplify) {
            const simplify = this._options.graph.simplify;
            let oldX = valueToPixelX(getDataX(start));
            let minVal = getDataY(start);
            let maxVal = minVal;
            let newX, y;
            ++start;
            for (; start <= end; ++start) {
                newX = valueToPixelX(getDataX(start));
                if (Math.abs(oldX - newX) <= simplify) {
                    y = getDataY(start);
                    minVal = Math.min(minVal, y);
                    maxVal = Math.max(maxVal, y);
                    continue;
                }
                context.lineTo(oldX, valueToPixelY(minVal));
                //Only add the second point if it differs from the first.
                if (minVal !== maxVal) {
                    context.lineTo(oldX, valueToPixelY(maxVal));
                }
                oldX = newX;
                minVal = getDataY(start);
                maxVal = minVal;
            }
            //Needed to add the last step.
            context.lineTo(oldX, valueToPixelY(minVal));
            if (minVal !== maxVal) {
                context.lineTo(oldX, valueToPixelY(maxVal));
            }
        }
        //Render full data set.
        else {
            for (; start <= end; ++start) {
                context.lineTo(valueToPixelX(getDataX(start)), valueToPixelY(getDataY(start)));
            }
        }

        //Fill under graph.
        if (this._options.graph.fill) {
            if (this._options.axes.x.inverted) {
                context.lineTo(0, this._canvas.graph.getContentHeight());
                context.lineTo(this._canvas.graph.getContentWidth(), this._canvas.graph.getContentHeight());
            } else {
                context.lineTo(this._canvas.graph.getContentWidth() * this._canvas.graph.getRatio(), this._canvas.graph.getContentHeight() * this._canvas.graph.getRatio());
                context.lineTo(0, this._canvas.graph.getContentHeight() * this._canvas.graph.getRatio());
            }
            context.closePath();
            context.fillStyle = this._options.getColor(i + 1);
            context.fill();
        }
        //Stroke line.
        else {
            context.strokeStyle = this._options.getColor(i + 1);
            context.stroke();
        }
    }
};

/**
 * Get offset for the given paramters.
 * @private
 * @param {array} array - List of string parameters to get offset for.
 * @returns {int} - Offset in number of pixels.
 */
Graph.prototype._getOffset = function (array) {
    let offset = 0;
    for (let i = 0; i < array.length; ++i) {
        switch (array[i]) {
            case "top":
                if (this._options.title.label.length) {
                    offset += this._options.title.size;
                    offset += this._options.title.offsetY;
                    offset += this._options.title.padding;
                }
                if (this._canvas.legend && this._options.legend.location.toLowerCase() === "top") {
                    offset += this._canvas.legend.getHeight() + this._options.legend.offsetY;
                }
                else if (this._options.axes.y.show && this._options.axes.tickLabels.show) {
                    offset += this._options.axes.tickLabels.size / 2;
                }
                break;
            case "bottom":
                if (this._options.axes.x.show) {
                    if (this._options.axes.x.label.length) {
                        offset += this._options.axes.labels.size;
                        offset += this._options.axes.labels.offset;
                        offset += this._options.axes.labels.padding;
                    }
                    if (this._options.axes.x.height) {
                        offset += this._options.axes.x.height;
                    }
                    else {
                        if (this._options.axes.tickLabels.show) {
                            offset += this._options.axes.tickLabels.size;
                            offset += this._options.axes.tickLabels.offset;
                        }
                        if (this._options.axes.tickMarkers.show) {
                            offset += this._options.axes.tickMarkers.length;
                            offset += this._options.axes.tickMarkers.offset;
                        }
                    }
                }
                else if (this._options.axes.y.show && this._options.axes.tickLabels.show) {
                    offset += this._options.axes.tickLabels.size / 2;
                }
                break;
            case "left":
                if (this._options.axes.y.show) {
                    if (this._options.axes.y.label.length) {
                        offset += this._options.axes.labels.size;
                        offset += this._options.axes.labels.offset;
                        offset += this._options.axes.labels.padding;
                    }
                    if (this._options.axes.y.width) {
                        offset += this._options.axes.y.width;
                    }
                    else {
                        if (this._options.axes.tickLabels.show) {
                            const tickLabelMinSize = this._axes.y.getBoundLabelWidth("min", true);
                            const tickLabelMaxSize = this._axes.y.getBoundLabelWidth("max", true);
                            offset += Math.max(tickLabelMinSize, tickLabelMaxSize);
                            offset += this._options.axes.tickLabels.offset;
                        }
                        if (this._options.axes.tickMarkers.show) {
                            offset += this._options.axes.tickMarkers.length;
                            offset += this._options.axes.tickMarkers.offset;
                        }
                    }
                }
                else if (this._options.axes.x.show && this._options.axes.tickLabels.show) {
                    offset += this._axes.x.getBoundLabelWidth("min", true);
                }
                break;
            case "right":
                if (this._canvas.legend && this._options.legend.location.toLowerCase() === "right") {
                    offset += this._canvas.legend.getWidth();
                }
                else {
                    const defaultOffset = 20;
                    let boundOffset = 0;
                    if (this._options.axes.x.show && this._axes.x.hasBounds() && this._options.axes.tickLabels.show) {
                        boundOffset = this._axes.x.getBoundLabelWidth("max", true) / 2;
                    }
                    offset += Math.max(defaultOffset, boundOffset);
                }
                break;
        }
    }
    return Math.round(offset);
};

Graph.createDummyData = Static.createDummyData;
Graph.getDefaultOptions = Options.getDefault;

export default Graph;