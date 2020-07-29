import "./test";
import examples from "./examples";
import tryit from "./try";
import options from "./options";
import "bootstrap/dist/css/bootstrap.min.css";
import "./favicon.ico";
import "./style.css";

const root = document.getElementById("root");
let current = "menu-examples";

window.menuClick = (addId) => {
    if (current === addId) {
        return;
    }

    const removeNode = document.getElementById(current);
    removeNode.className = removeNode.className.replace(" active", "");
    const addNode = document.getElementById(addId);
    addNode.className = addNode.className + " active";

    root.innerHTML = "";

    switchTab(addId);
}

function switchTab(id) {
    current = id;
    switch (id) {
        case "menu-examples":
            examples.init();
            break;
        case "menu-try":
            tryit.init();
            break;
        case "menu-options":
            options.init();
            break;
    }
}

switchTab(current);