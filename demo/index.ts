import { initExamples } from "./examples.js";
import { initOptions } from "./options.js";
import { initTry } from "./try.js";
import "spin.js/spin.css";
import "./style.css";

type MenuId = "menu-examples" | "menu-try" | "menu-options";

const root = document.getElementById("root");
let current: MenuId = "menu-examples";

declare global {
    interface Window {
        menuClick: (addId: MenuId) => void;
    }
}

window.menuClick = (addId: MenuId): void => {
    if (current === addId) {
        return;
    }

    if (root == null) {
        throw new Error("Root element not found");
    }

    const removeNode = document.getElementById(current);

    if (removeNode == null) {
        throw new Error("Current menu element not found");
    }

    removeNode.className = removeNode.className.replace(" active", "");
    const addNode = document.getElementById(addId);

    if (addNode == null) {
        throw new Error("Menu element to add not found");
    }

    addNode.className += " active";

    root.innerHTML = "";

    switchTab(addId);
};

function switchTab(id: MenuId): void {
    current = id;
    switch (id) {
        case "menu-examples":
            initExamples();
            break;
        case "menu-try":
            initTry();
            break;
        case "menu-options":
            initOptions();
            break;
        default:
            throw new Error("Unknown tab");
    }
}

switchTab(current);
