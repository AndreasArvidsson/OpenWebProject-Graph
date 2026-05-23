import { getDefaultOptions } from "../src/index.js";

const root = document.getElementById("root");

export function initOptions(): void {
    if (root == null) {
        throw new Error("Root element not found");
    }
    const options = getDefaultOptions();
    const json = JSON.stringify(options, null, 4);
    const code = document.createElement("pre");
    code.className = "code";
    code.textContent = json;
    root.append(code);
}
