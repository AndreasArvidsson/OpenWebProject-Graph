import Graph from "../src/index.js";
import type {
    GraphDataArray,
    OptionsInput,
    SimplifyMode,
} from "../src/Options.type.js";
import { createDummyData } from "./createDummyData.js";

type DemoOptions = OptionsInput & {
    title: NonNullable<OptionsInput["title"]> & { label: string };
    axes: NonNullable<OptionsInput["axes"]> & {
        x: NonNullable<NonNullable<OptionsInput["axes"]>["x"]>;
        y: NonNullable<NonNullable<OptionsInput["axes"]>["y"]>;
    };
    graph: NonNullable<OptionsInput["graph"]> & {
        names: string[];
        dataX?: GraphDataArray[];
        dataY?: GraphDataArray[];
    };
};

const root = document.getElementById("root");
const dataSize = 200;
const dataY = createDummyData(dataSize);
const simpleDataX: GraphDataArray[] = [[100, 200, 400]];
const simpleDataY: GraphDataArray[] = [
    [1, 4, 2],
    [2, 3, 0.5],
];

export function initExamples(): void {
    let options = getOptions("Simple example");
    options.graph.dataX = simpleDataX;
    options.graph.dataY = simpleDataY;
    addGraph(options, true);

    options = getOptions("Standard line plot with two data sets");
    addGraph(options);

    options = getOptions("Smoothing enabled");
    options.graph.smoothing = 5;
    options.interaction = { smoothing: true };
    addGraph(options);

    options = getOptions("Fill enabled");
    options.graph.fill = true;
    addGraph(options);

    options = getOptions("Dashed line");
    options.graph.dashed = [[1], true];
    addGraph(options);

    options = getOptions("Markers");
    delete options.graph.dataY;
    options.graph.dataY = simpleDataY;
    options.graph.lineWidth = 1;
    options.graph.markerRadius = 5;
    options.graph.dashed = [false, [1]];
    addGraph(options);

    options = getOptions("Legend right");
    options.offset = "5px 0px 5px 5px";
    options.legend = {
        location: "right",
        align: "left",
    };
    addGraph(options);

    options = getOptions("External legend");
    const legendId = "legendId";
    options.legend = {
        location: legendId,
        align: "left",
    };
    addGraph(options, false, legendId);

    options = getOptions("Logarithmic graph");
    options.axes.x.log = true;
    addGraph(options, false);

    const bounds = {
        xMin: 50,
        xMax: 150,
        yMin: -0.7,
        yMax: 0.2,
    };

    options = getOptions("Highlighting enabled");
    options.highlight = bounds;
    addGraph(options);

    options = getOptions("Zoom enabled");
    options.zoom = bounds;
    addGraph(options);

    options = getOptions("Bounds set");
    options.axes.x.bounds = {
        min: bounds.xMin,
        max: bounds.xMax,
    };
    options.axes.y.bounds = {
        min: bounds.yMin,
        max: bounds.yMax,
    };
    addGraph(options);

    options = getOptions("Spinner enabled");
    options.spinner = {
        show: true,
    };
    addGraph(options);

    options = getOptions("Custom formatters enabled");
    options.axes.x.legendValueFormatter = (value: number): string =>
        `${value}s`;
    options.axes.x.tickerValuePreFormatter = (value: number): number =>
        value * 2;
    options.axes.x.tickerValuePostFormatter = (value: number): number =>
        value / 2;
    options.axes.x.tickerLabelFormatter = (value: number): string =>
        `${value}s`;
    options.axes.y.legendValueFormatter = (value: number): string =>
        `${value}dB`;
    options.axes.y.tickerValuePreFormatter = (value: number): number =>
        value * 2;
    options.axes.y.tickerValuePostFormatter = (value: number): number =>
        value / 2;
    options.axes.y.tickerLabelFormatter = (value: number): string =>
        `${value}dB`;
    addGraph(options);

    renderSimplify();
}

function renderSimplify(): void {
    const options = getOptions("Simplify 0.1 minMax");
    options.axes.x.log = true;
    options.graph.dataY = createDummyData(2 ** 15);
    const graph = addGraph(options);
    const levels = [0.1, 0.5, 1];
    const types: SimplifyMode[] = ["minMax", "avg", "min", "max"];
    let i = 0;
    let j = 0;
    const upd = (): void => {
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
    };
    setTimeout(upd, 2000);
}

function getOptions(title: string): DemoOptions {
    return {
        offset: "5px 20px 5px 5px",
        title: {
            label: title,
        },
        axes: {
            x: {
                label: "Frequency (Hz)",
            },
            y: {
                label: "Amplitude (dB)",
            },
        },
        graph: {
            names: ["x", "Left", "Right"],
            dataY,
        },
    };
}

function addGraph(
    options: OptionsInput,
    keepData?: boolean,
    legendId?: string,
): Graph {
    if (legendId != null) {
        const legendDiv = document.createElement("div");
        legendDiv.className = "legendDiv";
        legendDiv.id = legendId;
        root?.append(legendDiv);
    }

    const div = document.createElement("div");
    div.className = "graph-divs";
    root?.append(div);

    const res = new Graph(div, options);

    const button = document.createElement("button");
    button.className = "btn btn-primary";
    button.textContent = "Show code";
    root?.append(button);

    let json;
    if (keepData) {
        json = JSON.stringify(options, null, 4);
    } else if (options.graph?.dataY != null) {
        const storedDataY = options.graph.dataY;
        options.graph.dataY = [];
        json = JSON.stringify(options, null, 4);
        json = json.replace(
            "[]",
            `/* random demo data */ createDummyData(${dataSize})`,
        );
        options.graph.dataY = storedDataY;
    }

    const code = document.createElement("pre");
    code.className = "code";
    code.style.display = "none";
    code.textContent = json ?? "";
    root?.append(code);

    button.addEventListener("click", () => {
        if (code.style.display === "none") {
            code.style.display = "block";
            button.textContent = "Hide code";
        } else {
            code.style.display = "none";
            button.textContent = "Show code";
        }
    });

    return res;
}
