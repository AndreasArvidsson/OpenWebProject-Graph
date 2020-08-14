import Graph from "../src/index";

const root = document.getElementById("root");
const intSize = 200;
const floatSize = 200;
const dataYInt = Graph.createDummyData(intSize, "int");
const dataYFloat = Graph.createDummyData(floatSize, "float");
const simpleDataX = [[100, 200, 400]];
const simpleDataY = [[1, 4, 2], [2, 3, 0.5]];

function getOptions(title) {
    return {
        title: {
            label: title
        },
        axes: {
            x: {
                label: "Frequency (Hz)",
            },
            y: {
                label: "Amplitude (dB)",
            }
        },
        graph: {
            names: ["x", "Left", "Right"],
            dataY: dataYFloat
        }
    };
}

function init() {
    let options;

    options = getOptions("Simple example");
    options.graph.dataX = simpleDataX;
    options.graph.dataY = simpleDataY;
    addGraph(options, undefined);

    options = getOptions("Standard line plot with two data sets");
    addGraph(options, true);

    options = getOptions("Smoothing enabled");
    options.graph.smoothing = 5;
    options.interaction = { smoothing: true };
    addGraph(options, true);

    options = getOptions("Fill enabled");
    options.graph.fill = true;
    addGraph(options, true);

    options = getOptions("Dashed line");
    options.graph.dashed = [[1], true];
    addGraph(options, true);

    options = getOptions("Markers");
    delete options.graph.dataY;
    options.graph.dataY = simpleDataY;
    options.graph.lineWidth = 1;
    options.graph.markerRadius = 5;
    options.graph.dashed = [false, [1]]
    addGraph(options, undefined);

    options = getOptions("Legend right");
    options.legend = {
        location: "right",
        align: "left"
    };
    addGraph(options, true);

    options = getOptions("External legend");
    const legendId = "legendId";
    options.legend = {
        location: legendId,
        align: "left"
    };
    addGraph(options, true, legendId);

    options = getOptions("Logarithmic integer graph");
    options.graph.dataY = dataYInt;
    options.axes.x.log = true;
    addGraph(options, false);

    const bounds = {
        xMin: 50,
        xMax: 150,
        yMin: -0.7,
        yMax: 0.2
    };

    options = getOptions("Highlighting enabled");
    options.highlight = bounds;
    addGraph(options, true);

    options = getOptions("Zoom enabled");
    options.zoom = bounds;
    addGraph(options, true);

    options = getOptions("Bounds set");
    options.axes.x.bounds = {
        min: bounds.xMin,
        max: bounds.xMax
    };
    options.axes.y.bounds = {
        min: bounds.yMin,
        max: bounds.yMax
    };
    addGraph(options, true);

    options = getOptions("Spinner enabled");
    options.spinner = {
        show: true
    };
    addGraph(options, true);

    options = getOptions("Custom formatters enabled");
    options.axes.x.legendValueFormatter = value => value + "s";
    options.axes.x.tickerValuePreFormatter = value => value * 2;
    options.axes.x.tickerValuePostFormatter = value => value * 2;
    options.axes.x.tickerLabelFormatter = value => value + "s";
    options.axes.y.legendValueFormatter = value => value + "dB";
    options.axes.y.tickerValuePreFormatter = value => value * 2;
    options.axes.y.tickerValuePostFormatter = value => value / 2;
    options.axes.y.tickerLabelFormatter = value => value + "dB";
    addGraph(options, true);

    renderSimplify();
}

function renderSimplify() {
    const options = getOptions("Simplify 0.1 minMax");
    options.axes.x.log = true;
    options.graph.dataY = Graph.createDummyData(2 ** 15, "float");
    const graph = addGraph(options, true);
    const levels = [0.1, 0.5, 1];
    const types = ["minMax", "avg", "min", "max"];
    let i = 0;
    let j = 0;
    function upd() {
        ++i;
        if (i === levels.length) {
            i = 0;
            ++j;
            if (j === types.length) {
                j = 0;
            }
        }
        options.graph.simplify = levels[i];
        options.graph.simplifyBy = types[j];
        options.title.label = `Simplify ${options.graph.simplify} ${options.graph.simplifyBy}`;
        graph.setOptions(options);
        setTimeout(upd, 2000);
    }
    setTimeout(upd, 2000);
}

function addGraph(options, isFloat, legendId) {
    if (legendId) {
        const legendDiv = document.createElement("div");
        legendDiv.className = "legendDiv";
        legendDiv.id = legendId;
        root.appendChild(legendDiv);
    }

    const div = document.createElement("div");
    div.className = "graph-divs";
    root.appendChild(div);

    const res = Graph(div, options);

    const button = document.createElement("button");
    button.className = "btn btn-primary";
    button.innerText = "Show code";
    root.appendChild(button);

    let json;
    if (isFloat !== undefined) {
        const dataY = options.graph.dataY;
        options.graph.dataY = [];
        const dummyDataParams = isFloat ? dataYFloat[0].length + ', "float"' : dataYInt[0].length + ', "int"';
        json = JSON.stringify(options, null, 4);
        json = json.replace("[]", "Graph.createDummyData(" + dummyDataParams + ")");
        options.graph.dataY = dataY;
    }
    else {
        json = JSON.stringify(options, null, 4);
    }

    const code = document.createElement("pre");
    code.className = "code";
    code.style.display = "none";
    code.innerText = json;
    root.appendChild(code);

    button.addEventListener("click", () => {
        if (code.style.display === "none") {
            code.style.display = "block";
            button.innerText = "Hide code";
        }
        else {
            code.style.display = "none";
            button.innerText = "Show code";
        }
    });

    return res;
}

export default { init };