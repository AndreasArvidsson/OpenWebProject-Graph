import { objectEntries } from "./util/objectUtil.js";

type InputAttributes = Partial<
    Record<keyof HTMLInputElement, string | number | boolean>
>;

export function createInput(attr?: InputAttributes): HTMLInputElement {
    const input = document.createElement("input");

    if (attr != null) {
        for (const [key, value] of objectEntries(attr)) {
            input.setAttribute(key, String(value));
        }
    }

    const callback = (): void => {
        const value = Number.parseInt(input.value, 10);
        if (Number.isNaN(value) || value < 0) {
            input.value = "0";
        }
        // Trigger custom enter event.
        input.dispatchEvent(new Event("done"));
    };

    // Loose focus or enter fires the format callback.
    input.addEventListener("change", callback);

    // Enter key pressed.
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            callback();
        }
    });

    return input;
}
