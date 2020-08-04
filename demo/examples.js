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

    Graph(div, options);

    const button = document.createElement("button");
    button.className = "btn btn-primary";
    button.innerText = "Show code";
    root.appendChild(button);

    let json;
    if (isFloat !== undefined) {
        options.graph.dataY = [];
        const dummyDataParams = isFloat ? dataYFloat[0].length + ', "float"' : dataYInt[0].length + ', "int"';
        json = JSON.stringify(options, null, 4);
        json = json.replace("[]", "Graph.createDummyData(" + dummyDataParams + ")");
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
}

export default { init };