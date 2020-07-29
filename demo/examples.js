import Graph from "../src/index";

const root = document.getElementById("root");
const intSize = 200;
const floatSize = 200;
const dataYInt = Graph.createDummyData(intSize, "int");
const dataYFloat = Graph.createDummyData(floatSize, "float");

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
    let options, tmp;


    options = getOptions("Simple example");
    delete options.graph.dataY;
    options.graph.dataX = [
        [100, 200, 400]
    ];
    options.graph.dataY = [
        [1, 4, 2],
        [2, 3, 0.5]
    ];
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

    options = getOptions("Bounds set");
    options.axes.x.bounds = {
        min: 100,
        max: 150
    };
    options.axes.y.bounds = {
        min: -0.5,
        max: 0.5
    };
    addGraph(options, true);

    options = getOptions("Zoom enabled");
    tmp = addGraph(options, true);
    tmp.graph.zoom(100, -0.5, 150, 0.5);
    tmp.code.innerText = "graph.zoom(100, -10, 400, 10);";

    options = getOptions("Highlighting enabled");
    tmp = addGraph(options, true);
    tmp.graph.highlight(50, -10, 150, 0);
    tmp.code.innerText = "graph.highlight(50, -10, 150, 0);";

    options = getOptions("Spinner enabled");
    tmp = addGraph(options, true);
    tmp.graph.spin(true);
    tmp.code.innerText = "graph.spin(true);";
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

    const graph = Graph(div, options);

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

    return { graph, code };
}

export default { init };