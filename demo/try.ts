import Graph from "../src/index.js";
import type { OptionsInput } from "../src/Options.type.js";
import { createDummyData } from "./createDummyData.js";

const root = document.getElementById("root");

export function initTry(): void {
    if (root == null) {
        throw new Error("Root element not found");
    }
    root.innerHTML = `<h2>Example with configurable options</h2>
    Here you can try out the different options. Just update the options object in the text field and click the "update graph" button to see the result.
    <br>NOTE: If you remove an object/field from the options, the last set value will persist.`;

    const dataY = createDummyData(200);
    const options = {
        title: {
            label: "Configurable graph",
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
        },
    };

    const div = document.createElement("div");
    div.className = "graph-divs";
    root.append(div);
    const graph = new Graph(div, {});

    const code = document.createElement("textarea");
    code.wrap = "off";
    code.className = "text-options";
    code.value = JSON.stringify(options, null, 4);
    root.append(code);

    const button = document.createElement("button");
    button.className = "btn btn-primary";
    button.textContent = "Update graph";
    button.addEventListener("click", () => {
        updateGraph();
    });
    root.append(button);

    const updateGraph = (): void => {
        // oxlint-disable-next-line prefer-const
        let newOptions: OptionsInput = {};
        // oxlint-disable-next-line no-eval
        eval(`newOptions = ${code.value}`);
        if (newOptions.graph?.dataY == null) {
            newOptions.graph ??= {};
            newOptions.graph.dataY = dataY;
        }
        graph.setOptions(newOptions);
    };

    updateGraph();
}
