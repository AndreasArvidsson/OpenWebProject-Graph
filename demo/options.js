import Graph from "../src/index";

const root = document.getElementById("root");

function init() {
    const options = Graph.getDefaultOptions();
    const json = JSON.stringify(options, null, 4);
    const code = document.createElement("pre");
    code.className = "code";
    code.innerText = json;
    root.appendChild(code);
}

export default { init };