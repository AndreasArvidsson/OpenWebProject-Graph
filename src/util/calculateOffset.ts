export interface Offset {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export function calculateOffset(offset: number | string): Offset {
    if (typeof offset === "number") {
        return {
            top: offset,
            right: offset,
            bottom: offset,
            left: offset,
        };
    }
    const div = document.createElement("div");
    div.style.margin = "";
    div.style.margin = offset;
    return {
        top: pxToNum(div.style.marginTop),
        right: pxToNum(div.style.marginRight),
        bottom: pxToNum(div.style.marginBottom),
        left: pxToNum(div.style.marginLeft),
    };
}

function pxToNum(str: string): number {
    return Number.parseInt(str.replace("px", ""), 10);
}
