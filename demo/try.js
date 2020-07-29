import Graph from "../src/index";

const root = document.getElementById("root");

function init() {
    root.innerHTML =
        `<h2>Example with configurable options</h2>
    Here you can try out the different options. Just update the options object in the text field and click the "update graph" button to see the result.
    <br>NOTE: If you remove an object/field from the options, the last set value will persist.;`

    const dataY = Graph.createDummyData(500, "float");
    let options = {
        title: {
            label: "Configurable graph"
        },
        axes: {
            x: {
                label: "Frequency (Hz)"
            },
            y: {
                label: "Amplitude (dB)"
            }
        },
        graph: {
            names: ["Left", "Right"]
        }
    };

    const div = document.createElement("div");
    div.className = "graph-divs";
    root.appendChild(div);
    const graph = Graph(div, {});

    const code = document.createElement("textarea");
    code.wrap = "off";
    code.className = "text-options";
    code.value = JSON.stringify(options, null, 4);
    root.appendChild(code);

    const button = document.createElement("button");
    button.className = "btn btn-primary";
    button.innerText = "Update graph";
    button.addEventListener("click", updateGraph);
    root.appendChild(button);

    function updateGraph() {
        let options = {};
        eval("options = " + code.value);
        if (!options.graph || !options.graph.dataY) {
            if (!options.graph) {
                options.graph = {};
            }
            options.graph.dataY = dataY;
        }
        graph.setOptions(options);
    }

    updateGraph();
}

export default { init };