import Static from "./Static";
import Is from "./Is";

/** 
 * The Options class is the options and associated functions for the Graph class.
 * See setDefault() for a desciption of the possible option parameters.
 */

/**
 * Create new Graph options.
 * @public
 * @constructor
 * @param {OPTIONS_OBJECT} options - Options to customize the graph.
 * @returns {Options}
 */
function Options(options) {
    this._isOk = true;
    this._createMembers();
    this.set(Options.getDefault());
    if (options) {
        this.set(options);
    }
}

/**
 * Check if the options are ok / valid.
 * @public
 * @returns {bool} - True if the options are ok.
 */
Options.prototype.isOk = function () {
    return this._isOk;
};

/**
 * Get color for a data set.  Index = 0 is X axis.
 * @public
 * @param {int} index - Index of the data set.
 * @returns {string} - CSS color string.
 */
Options.prototype.getColor = function (index) {
    return this.graph.colors[index] ? this.graph.colors[index] : "#000000";
};

/**
 * Get name for a data set. Index = 0 is X axis.
 * @public
 * @param {int} index - Index of the data set.
 * @returns {string}
 */
Options.prototype.getName = function (index) {
    if (this.graph.names[index] !== undefined) {
        return this.graph.names[index];
    } 
    else if (index > 0) {
        return "DATA" + (index);
    } 
    else {
        return "X";
    }
};

/**
 * Get the font(family and size) for the legend label.
 * @public
 * @returns {string}
 */
Options.prototype.getLegendFont = function () {
    return this.legend.size + "px " + this.legend.font;
};

/**
 * Get the default options object.
 * @public
 * @returns {OPTIONS_OBJECT}
 */
Options.getDefault = function () {
    return {
        debug: false,
        interaction: {
            resize: true,
            trackMouse: true,
            zoom: true,
            smoothing: false
        },
        title: {
            label: "",
            bold: false,
            size: 20,
            offsetX: 0,
            offsetY: 0,
            padding: 5,
            font: "verdana",
            color: "black",
            align: "center"
        },
        legend: {
            location: "top",
            font: "Arial",
            size: 15,
            offsetX: 10,
            offsetY: 2,
            align: "right",
            newLine: false
        },
        graph: {
            dataX: [],
            dataY: [],
            colors: ["#000000", "#0000FF", "#FF0000", "#800080", "#00FF00", "#8080FF", "#FF8080", "#FF00FF", "#00FFFF"],
            names: [],
            lineWidth: 1,
            smoothing: 0,
            simplify: 0.1,
            fill: false,
            compositeOperation: "source-over"
        },
        axes: {
            tickMarkers: {
                show: true,
                length: 5,
                width: 1,
                offset: 0,
                color: "#BEBEBE"
            },
            tickLabels: {
                show: true,
                color: "black",
                font: "Arial",
                size: 12,
                width: 40,
                offset: 2
            },
            labels: {
                color: "black",
                font: "verdana",
                size: 15,
                offset: 3,
                padding: 0
            },
            x: {
                show: true,
                inverted: false,
                log: false,
                height: 0,
                label: "",
                legendValueFormatter: null,
                tickerValuePreFormatter: null,
                tickerValuePostFormatter: null,
                tickerLabelFormatter: null,
                ticker: null,
                grid: {
                    width: 1,
                    color: "#BEBEBE"
                },
                bounds: {
                    min: null,
                    max: null
                }
            },
            y: {
                show: true,
                inverted: false,
                log: false,
                width: 0,
                label: "",
                legendValueFormatter: null,
                tickerValuePreFormatter: null,
                tickerValuePostFormatter: null,
                tickerLabelFormatter: null,
                ticker: null,
                grid: {
                    width: 1,
                    color: "#BEBEBE"
                },
                bounds: {
                    min: null,
                    max: null
                }
            }
        },
        border: {
            style: "solid",
            color: "black",
            width: "0 0 1px 1px"
        },
        spinner: {//Options regarding the spinner.
            show: true, //Automatically show spinner when plotting data. Can always be activated manually.
            lines: 13, //The number of lines to draw.
            length: 30, //The length of each line.
            width: 10, //The line thickness.
            radius: 30, //The radius of the inner circle.
            corners: 1, //Corner roundness (0..1).
            rotate: 0, //The rotation offset.
            direction: 1, //1: clockwise, -1: counterclockwise
            color: "black", //#rgb or #rrggbb or array of colors
            speed: 1, //Revolutions per second
            trail: 50, //Afterglow percentage
            shadow: false, //If true a shadow is rendered.
            hwaccel: true, //If true hardware acceleration is used.
            position: 'relative', //Position type.
            top: "50%", //CenterY position relative to parent
            left: "50%"         //CenterX position relative to parent
        }
    };
};

/**
 * Set new options.
 * @public
 * @param {OPTIONS_OBJECT} options - The options to set.
 */
Options.prototype.set = function (options) {
    function setMembers(oldObj, newObj, path) {
        for (let i in newObj) {
            if (!Array.isArray(oldObj) && !Object.prototype.hasOwnProperty.call(oldObj, i)) {
                //            if (!Array.isArray(oldObj) && !oldObj.hasOwnProperty(i)) { TODO
                console.warn("owp.graph WARNING: Can't set unexisting option: " + path + (path.length ? "." + i : i));
                continue;
            }
            //Member is a new object. Call function recursivly.
            if (Is.isObject(newObj[i])) {
                setMembers(oldObj[i], newObj[i], path + (path.length ? "." : "") + i);
            }
            //Member is null or a base type. Set it.
            else {
                oldObj[i] = newObj[i];
            }
        }
    }
    setMembers(this, options, "");

    this._evalOptions();
};

/**
 * Callback function for getting data value for a given index.
 * Used instead of dataX[index] and dataY[index].
 * Has built in functionality for averaging. Implicit X-values and more.
 * @callback Options~getDataCallback
 * @param {int} index
 * @returns {number}
 */

/**
 * Get a callback used to get correct X and X value data.
 * Used by the graph render function to improve performance.
 * @public
 * @param {string} axis - X or Y axis.
 * @param {int} dataIndex - The index in the data set.
 * @returns {function}
 */
Options.prototype.getDataCallback = function (axis, dataIndex, start) {
    let data;
    //X-axis.
    if (axis.toLowerCase() === "x") {
        //Has no dataX. Return index + 1.
        if (this.graph.dataX.length === 0) {
            return function (index) {
                return index + 1;
            };
        }
        //Have one dataX for all dataY. 
        if (this.graph.dataX.length === 1) {
            data = this.graph.dataX[0];
        }
        //Have one dataX for each dataY. 
        else {
            data = this.graph.dataX[dataIndex];
        }
    }
    //Y-axis.
    else if (axis.toLowerCase() === "y") {
        data = this.graph.dataY[dataIndex];
        //Use smoothing.
        if (this.graph.smoothing) {
            return this._getDataCallbackSmoothing(start, data);
        }
    }
    else {
        console.error("owp.graph ERROR: Unknown axis: " + axis);
    }
    //Default
    return function (index) {
        return data[index];
    };
};

/**
 * Return getDataCallback for smoothing
 * @private
 */
Options.prototype._getDataCallbackSmoothing = function (start, data) {
    const centralIndex = Math.max(0, start - 1);
    const window = Static.getSmoothingWindow(centralIndex, this.graph.smoothing, data.length);
    let low = window.low;
    let high = window.high;
    let sum = 0;
    for (let i = low; i <= high; ++i) {
        sum += data[i];
    }
    const threshold = 2 * this.graph.smoothing;
    return function (index) {
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

/**
 * Evaluates the options and sets ok status flag.
 * @private
 */
Options.prototype._evalOptions = function () {
    var optionsOk = true;
    var obj, obj2, name, name2;
    var options = this;
    function set(path) {
        name = path;
        obj = options;
        var paths = path.split(".");
        for (var i = 0; i < paths.length; ++i) {
            obj = obj[paths[i]];
        }
    }
    function set2(path) {
        name2 = path;
        obj2 = options;
        var paths = path.split(".");
        for (var i = 0; i < paths.length; ++i) {
            obj2 = obj2[paths[i]];
        }
    }
    function error(msg) {
        console.error("owp.graph ERROR: invalid option. " + name + ": " + msg);
        optionsOk = false;
    }
    function evalObject() {
        var res = Is.isObject(obj);
        if (!res) {
            error("\"" + obj + "\" is not an object.");
        }
        return res;
    }
    function evalBool() {
        var res = Is.isBool(obj);
        if (!res) {
            error("\"" + obj + "\" is not a bool.");
        }
        return res;
    }
    function evalNumber() {
        var res = Is.isNumber(obj);
        if (!res) {
            error("\"" + obj + "\" is not a number.");
        }
        return res;
    }
    function evalInt() {
        var res = Is.isInt(obj);
        if (!res) {
            error("\"" + obj + "\" is not an integer.");
        }
        return res;
    }
    function evalString() {
        var res = Is.isString(obj);
        if (!res) {
            error("\"" + obj + "\" is not a string.");
        }
        return res;
    }
    function evalArray() {
        var res = Is.isArray(obj);
        res = true;
        if (!res) {
            error("\"" + obj + "\" is not an array.");
        }
        return res;
    }
    function evalFunction() {
        var res = Is.isFunction(obj);
        if (!res) {
            error("\"" + obj + "\" is not a function.");
        }
        return res;
    }
    function evalAlign(noCenter) {
        var res = Is.isAlignment(obj, noCenter);
        if (!res) {
            error("\"" + obj + "\" is not an valid alignment.");
        }
        return res;
    }
    function evalColor() {
        var res = Is.isColor(obj);
        if (!res) {
            error("\"" + obj + "\" is not a valid color.");
        }
        return res;
    }
    function evalFont() {
        var res = Is.isString(obj);
        if (!res) {
            error("\"" + obj + "\" is not a valid font.");
        }
        return res;
    }
    function evalSize() {
        var res = Is.isSize(obj);
        if (!res) {
            error("\"" + obj + "\" is not a valid size.");
        }
        return res;
    }
    function evalBorderStyle() {
        var res = Is.isBorderStyle(obj);
        if (!res) {
            error("\"" + obj + "\" is not a valid border style.");
        }
        return res;
    }
    function evalBorderWidth() {
        var res = Is.isBorderWidth(obj);
        if (!res) {
            error("\"" + obj + "\" is not a valid border width.");
        }
        return res;
    }
    function evalCompositeOperation() {
        var res = Is.isCompositeOperation(obj);
        if (!res) {
            error("\"" + obj + "\" is not a composite operation.");
        }
        return res;
    }
    function evalArrayContains(type) {
        var res = Is.isContent(obj, type);
        if (!res) {
            error("\"[" + obj + "]\" contains object type other than: " + type + ".");
        }
        return res;
    }
    function evalCond(cond) {
        var res = eval(cond);
        if (!res) {
            cond = cond.replaceAll("obj2", name2).trim();
            cond = cond.replaceAll("obj.", "").trim();
            cond = cond.replaceAll("obj", "").trim();
            if (Is.isArray(obj)) {
                error("Failed condition: " + cond);
            } 
            else {
                error("\"" + obj + "\" failed condition: " + cond);
            }
        }
        return res;
    }

    set("debug");
    evalBool();

    set("interaction");
    if (evalObject()) {
        set("interaction.resize");
        evalBool();

        set("interaction.trackMouse");
        evalBool();

        set("interaction.zoom");
        evalBool();

        set("interaction.smoothing");
        evalBool();
    }

    set("title");
    if (evalObject()) {
        set("title.bold");
        evalBool();

        set("title.label");
        evalString();

        set("title.size");
        evalInt();
        evalCond("obj > 0");

        set("title.offsetX");
        evalInt();

        set("title.offsetY");
        evalInt();

        set("title.padding");
        evalInt();

        set("title.font");
        evalFont();

        set("title.color");
        evalColor();

        set("title.align");
        evalAlign();
    }

    set("legend");
    if (evalObject()) {
        set("legend.location");
        evalString();

        set("legend.font");
        evalFont();

        set("legend.size");
        if (evalInt()) {
            evalCond("obj > 0");
        }

        set("legend.offsetX");
        if (evalInt()) {
            evalCond("obj >= 0");
        }

        set("legend.offsetY");
        if (evalInt()) {
            evalCond("obj >= 0");
        }

        set("legend.align");
        evalAlign(true);

        set("legend.newLine");
        evalBool();
    }

    set("graph");
    if (evalObject()) {
        set("graph.dataX");
        if (evalArray()) {
            evalArrayContains("anyArray");

            set2("graph.dataY");
            if (evalCond("obj.length === 0 || obj.length === 1 || obj.length === obj2.length")) {
                evalCond("obj.length <= obj2.length");
            }
        }

        set("graph.dataY");
        if (evalArray()) {
            evalArrayContains("anyArray");
            set2("graph.dataX");
            //Only one dataX(incl implicit). All dataY have to be of the same size.
            if (obj2.length === 0 || obj2.length === 1) {
                //Check so that all dataY are the same size.
                for (let i = 0; i < obj.length; ++i) {
                    if (obj[i].length !== obj[0].length) {
                        error("Not all arrays are of the same size.");
                    }
                }
                //If dataX.length == 1. Check if same length as dataY.
                if (obj2.length === 1 && (!obj.length || obj2[0].length !== obj[0].length)) {
                    error("Size does not match dataX.");
                }
            }
            //dataX.length == dataY.length. Check that each pair(x,y) are the same length.
            else if (obj.length === obj2.length) {
                for (let i = 0; i < obj.length; ++i) {
                    if (obj[i].length !== obj2[i].length) {
                        error("dataY[" + i + "].length != dataX[" + i + "].length");
                    }
                }
            }
        }

        set("graph.colors");
        if (evalArray()) {
            evalArrayContains("color");
        }

        set("graph.names");
        if (evalArray()) {
            evalArrayContains("string");
        }

        set("graph.lineWidth");
        if (evalNumber()) {
            evalCond("obj >= 0");
        }

        set("graph.smoothing");
        if (evalInt()) {
            evalCond("obj >= 0");
        }

        set("graph.simplify");
        if (evalNumber()) {
            evalCond("obj >= 0 && obj <= 1");
        }

        set("graph.fill");
        evalBool();

        set("graph.compositeOperation");
        evalCompositeOperation();
    }

    set("axes");
    if (evalObject()) {
        set("axes.tickMarkers");
        if (evalObject()) {
            set("axes.tickMarkers.show");
            evalBool();

            set("axes.tickMarkers.length");
            if (evalInt()) {
                evalCond("obj > 0");
            }

            set("axes.tickMarkers.width");
            if (evalInt()) {
                evalCond("obj > 0");
            }

            set("axes.tickMarkers.offset");
            if (evalInt()) {
                evalCond("obj >= 0");
            }

            set("axes.tickMarkers.color");
            evalColor();
        }

        set("axes.tickLabels");
        if (evalObject()) {
            set("axes.tickLabels.show");
            evalBool();

            set("axes.tickLabels.color");
            evalColor();

            set("axes.tickLabels.font");
            evalFont();

            set("axes.tickLabels.size");
            if (evalInt()) {
                evalCond("obj > 0");
            }

            set("axes.tickLabels.width");
            if (evalInt()) {
                evalCond("obj > 0");
            }

            set("axes.tickLabels.offset");
            if (evalInt()) {
                evalCond("obj >= 0");
            }
        }

        set("axes.labels");
        if (evalObject()) {
            set("axes.labels.color");
            evalColor();

            set("axes.labels.font");
            evalFont();

            set("axes.labels.size");
            if (evalInt()) {
                evalCond("obj > 0");
            }

            set("axes.labels.offset");
            evalInt();

            set("axes.labels.padding");
            if (evalInt()) {
                evalCond("obj >= 0");
            }
        }

        //axes x and y
        var axes = ["axes.x", "axes.y"];
        for (var i = 0; i < axes.length; ++i) {
            set(axes[i]);
            if (evalObject()) {
                set(axes[i] + ".show");
                evalBool();

                set(axes[i] + ".inverted");
                evalBool();

                set(axes[i] + ".log");
                evalBool();

                set(axes[i] + "." + (axes[i] === "axes.x" ? "height" : "width"));
                evalInt();
                evalCond("obj >= 0");

                set(axes[i] + ".grid");
                if (evalObject()) {
                    set(axes[i] + ".grid.width");
                    evalInt();
                    evalCond("obj >= 0");

                    set(axes[i] + ".grid.color");
                    evalColor();
                }

                set(axes[i] + ".label");
                evalString();

                set(axes[i] + ".bounds");
                if (evalObject()) {
                    set(axes[i] + ".bounds.min");
                    if (!Is.isNull(obj)) {
                        evalNumber();
                        set2(axes[i] + ".log");
                        if (obj2 && obj <= 0) {
                            error("\"[" + obj + "]\" When axis is logarithmic all bounds must be greather than 0.");
                        }
                    }

                    set(axes[i] + ".bounds.max");
                    if (!Is.isNull(obj)) {
                        evalNumber();
                        set2(axes[i] + ".log");
                        if (obj2 && obj <= 0) {
                            error("\"[" + obj + "]\" When axis is logarithmic all bounds must be greather than 0.");
                        }
                    }

                    set(axes[i] + ".bounds.min");
                    set2(axes[i] + ".bounds.max");
                    if (!Is.isNull(obj) && !Is.isNull(obj2)) {
                        evalCond("obj < obj2");
                    }
                }

                set(axes[i] + ".legendValueFormatter");
                if (!Is.isNull(obj)) {
                    evalFunction();
                }

                set(axes[i] + ".tickerValuePreFormatter");
                if (!Is.isNull(obj)) {
                    evalFunction();
                }

                set(axes[i] + ".tickerValuePostFormatter");
                if (!Is.isNull(obj)) {
                    evalFunction();
                }

                set(axes[i] + ".tickerLabelFormatter");
                if (!Is.isNull(obj)) {
                    evalFunction();
                }

                set(axes[i] + ".ticker");
                if (!Is.isNull(obj)) {
                    evalFunction();
                }
            }
        }
    }

    set("border");
    if (evalObject()) {
        set("border.style");
        evalBorderStyle();

        set("border.color");
        evalColor();

        set("border.width");
        evalBorderWidth();
    }

    set("spinner");
    if (evalObject()) {
        set("spinner.show");
        evalBool();

        set("spinner.lines");
        if (evalInt()) {
            evalCond("obj > 0");
        }

        set("spinner.length");
        if (evalInt()) {
            evalCond("obj > 0");
        }

        set("spinner.width");
        if (evalInt()) {
            evalCond("obj > 0");
        }

        set("spinner.radius");
        if (evalInt()) {
            evalCond("obj > 0");
        }

        set("spinner.corners");
        if (evalNumber()) {
            evalCond("obj >= 0 && obj <= 1");
        }

        set("spinner.rotate");
        if (evalInt()) {
            evalCond("obj >= 0");
        }

        set("spinner.direction");
        if (evalInt()) {
            evalCond("obj === -1 || obj === 1");
        }

        set("spinner.color");
        evalColor();

        set("spinner.speed");
        if (evalNumber()) {
            evalCond("obj > 0");
        }

        set("spinner.trail");
        if (evalInt()) {
            evalCond("obj >= 0");
        }

        set("spinner.shadow");
        evalBool();

        set("spinner.hwaccel");
        evalBool();

        set("spinner.position");
        if (evalString()) {
            evalCond("obj === 'relative' || obj === 'absolute'");
        }

        set("spinner.top");
        evalSize();

        set("spinner.left");
        evalSize();
    }

    this._isOk = optionsOk;
};

/**
 * Create all the members that contains the user given settings.
 * @private
 */
Options.prototype._createMembers = function () {
    this.debug = null;
    this.interaction = {
        resize: null,
        trackMouse: null,
        zoom: null,
        smoothing: null
    };
    this.title = {
        show: null,
        bold: null,
        label: null,
        size: null,
        offsetX: null,
        offsetY: null,
        padding: null,
        font: null,
        color: null,
        align: null
    };
    this.legend = {
        location: null,
        font: null,
        size: null,
        offsetX: null,
        offsetY: null,
        align: null,
        newLine: null
    };
    this.graph = {
        dataX: null,
        dataY: null,
        colors: null,
        names: null,
        lineWidth: null,
        smoothing: null,
        simplify: null,
        fill: null,
        compositeOperation: null
    };
    this.axes = {
        tickMarkers: {
            show: null,
            length: null,
            width: null,
            offset: null,
            color: null
        },
        tickLabels: {
            show: null,
            color: null,
            font: null,
            size: null,
            width: null,
            offset: null
        },
        labels: {
            show: null,
            color: null,
            font: null,
            size: null,
            offset: null,
            padding: null
        },
        x: {
            show: null,
            inverted: null,
            log: null,
            height: null,
            label: null,
            legendValueFormatter: null,
            tickerValuePreFormatter: null,
            tickerValuePostFormatter: null,
            tickerLabelFormatter: null,
            ticker: null,
            grid: {
                width: null,
                color: null
            },
            bounds: {
                min: null,
                max: null
            }
        },
        y: {
            show: null,
            inverted: null,
            log: null,
            width: null,
            label: null,
            legendValueFormatter: null,
            tickerValuePreFormatter: null,
            tickerValuePostFormatter: null,
            tickerLabelFormatter: null,
            ticker: null,
            grid: {
                width: null,
                color: null
            },
            bounds: {
                min: null,
                max: null
            }
        }
    };
    this.border = {
        style: null,
        color: null,
        width: null
    };
    this.spinner = {
        show: null,
        lines: null,
        length: null,
        width: null,
        radius: null,
        corners: null,
        rotate: null,
        direction: null,
        color: null,
        speed: null,
        trail: null,
        shadow: null,
        hwaccel: null,
        position: null,
        top: null,
        left: null
    };
};

/**
 @typedef OPTIONS_OBJECT
 @type {object}

 @property {bool} debug - If true debug info will be outputted to the console.

 @property {object} interaction - Options regarding user interaction with the graph.
 @property {bool} resize - If true the graph will be resized automatically.
 @property {bool} trackMouse - If true the mouse cursor will track the graph lines.
 @property {bool} zoom - If true zoom is enabled.
 @property {bool} smoothing - If true interactive smoothing input is enabled.

 @property {object} title - Options regarding the title.
 @property {string} title.label - The text of the label. Set to "" to hide the label.
 @property {bool} title.bold - If true the label font is bold.
 @property {int} title.size - Font height/size in pixels of the text.
 @property {int} title.offsetX - X-axis offset in pixels. Between title and graph vertical side.
 @property {int} title.offsetY - Y-axis offset in pixels. Between title and outer top edge.
 @property {int} title.padding - Padding in pixels. Between title and graph.
 @property {string} title.font - Font family of the text.
 @property {string} title.color - Color of the text.
 @property {string} title.align - Title alignment. ["left", "center", "right"]

 @property {object} legend - Options regarding the legend.
 @property {bool} legend.show - If true the legend is shown.
 @property {string} legend.font - Font family of the text.
 @property {int} legend.size - Font size/height in pixels.
 @property {int} legend.offsetX - Y-axis offset in pixels. Between legend and graph vertical side.
 @property {int} legend.offsetY - X-axis offset in pixels. Between legend and graph top.
 @property {int} legend.align -  The legend alignment. ["left", "right"]
 @property {int} legend.newLine -  If true a new line is made between each data set.

 @property {object} graph - Options regarding the graph curve.
 @property {array<array>} graph.dataX - List of data sets for the X-axis. Can contain typed arrays.
 @property {array<array>} graph.dataY - List of data sets for the Y-axis. Can contain typed arrays.
 @property {array<string>} graph.colors - List of colors for each dataY set.
 @property {array<string>} graph.names - List of names for each dataY set.
 @property {int} graph.lineWidth - Width in pixels of the stroked line.
 @property {int} graph.smoothing - Number of samples on each side of the central value for the central moving average algorithm. 0 = disabled.
 @property {int} graph.simplify - Pixel tolerance for the simplification algorithm. 0 = disabled.
 @property {bool} graph.fill - If true the area under the graph will be filled.
 @property {string} graph.compositeOperation - Context global composit operation.

 @property {object} axes - Options regarding the axes.

 @property {object} axes.tickMarkers - Options regarding the tick markers.
 @property {bool} axes.tickMarkers.show - If true the tick markers are shown.
 @property {int} axes.tickMarkers.length - Length in pixels of the markers.
 @property {int} axes.tickMarkers.width - Width in pixels of the markers.
 @property {int} axes.tickMarkers.offset - Offset in pixels. Between graph and markers.
 @property {string} axes.tickMarkers.color - Color of the tick markers.

 @property {object} axes.tickLabels - Options regarding the tick labels.
 @property {bool} axes.tickLabels.show - If true the tick labels are shown.
 @property {string} axes.tickLabels.color - Color of the text.
 @property {string} axes.tickLabels.font - Font family of the text.
 @property {int} axes.tickLabels.size - Font size/height in pixels of the text.
 @property {int} axes.tickLabels.width - Max width of the labels. Used to calculate ticks.
 @property {int} axes.tickLabels.offset - Offset in pixels. Between graph and markers.

 @property {object} axes.labels - Options regarding the axes labels.
 @property {string} axes.labels.color - Color of the text.
 @property {string} axes.labels.font - Font family of the text.
 @property {int} axes.labels.size - Font size/height in pixels of the text.
 @property {int} axes.labels.offset - Offset in pixels. Between outer edge and labels.
 @property {int} axes.labels.padding - Padding in pixels. Between label and graph.

 @property {object} axes.x - Options regarding the X-axis.
 @property {bool} axes.x.show - If true the X-axis is shown.
 @property {bool} axes.x.inverted - If true the axis direction is inverted.
 @property {bool} axes.x.log - If true the values on the axis are logarithmically distributed.
 @property {int} axes.x.height - Height in pixels of the axis. 0 = automatic size.
 @property {int} axes.x.label - Text of the axis label. Set to "" to hide the label.
 @property {formatterCallback} axes.x.valueFormatter - Callback that formats the values. Null = default callback.
 @property {tickerCallback} axes.x.ticker - Callback that creates the ticks. Null = default callback.
 @property {formatterCallback} axes.x.valueFormatter - Callback that formats the axis labels. Null = default callback.

 @property {object} axes.x.grid - Options regarding the X-axis grid.
 @property {int} axes.x.grid.width - Grid line width/thickness in pixels. 0 = no grid.
 @property {string} axes.x.grid.color - Color of the grid lines.

 @property {object} axes.x.bounds - Options regarding the X-axis bounds.
 @property {number} axes.x.bounds.min - Min/lower bounds value. Null = automatic value.
 @property {number} axes.x.bounds.max - Max/upper bounds value. Null = automatic value.

 @property {object} axes.y - Options regarding the Y-axis.
 @property {bool} axes.y.show - If true the X-axis is shown.
 @property {bool} axes.y.inverted - If true the axis direction is inverted.
 @property {bool} axes.y.log - If true the values on the axis are logarithmically distributed.
 @property {int} axes.y.width - Width in pixels of the axis. 0 = automatic size.
 @property {int} axes.y.label - Text of the axis label. Set to "" to hide the label.
 @property {formatterCallback} axes.y.valueFormatter - Callback that formats the values. Null = default callback.
 @property {tickerCallback} axes.y.ticker - Callback that creates the ticks. Null = default callback.
 @property {formatterCallback} axes.y.valueFormatter - Callback that formats the axis labels. Null = default callback.

 @property {object} axes.y.grid - Options regarding the Y-axis grid.
 @property {int} axes.y.grid.width - Grid line width/thickness in pixels. 0 = no grid.
 @property {string} axes.y.grid.color - Color of the grid lines.

 @property {object} axes.y.bounds - Options regarding the Y-axis bounds.
 @property {number} axes.y.bounds.min - Min/lower bounds value. Null = automatic value.
 @property {number} axes.y.bounds.max - Max/upper bounds value. Null = automatic value.

 @property {object} border - Options regarding the graph border.
 @property {string} border.style - Border style. solid, dotted...
 @property {string} border.color - Color of the border lines. red, #FF0000, rgb(255,0,0)
 @property {string} border.width - Width/thickness in pixels of the border. 1px, 1px 2px, 1px 2px 3px 4px.


 */

/**
 * Callback function for formatting values.
 * @callback formatterCallback
 * @param {number} value
 * @returns {string}
 */

/**
 * Callback function for creating ticks.
 * @callback tickerCallback
 * @param {bool} isLog - True if the values are going to be logarithmically distributed.
 * @param {number} minValue - Min/lower bounds value.
 * @param {number} maxValue - Max/upper bounds value.
 * @param {int} graphSize - Size(width or height) of graph in pixels.
 * @param {int} labelSize - Size(width or height) of tick labels in pixels.
 * @returns {array<{value:number}>}
 */

export default Options;