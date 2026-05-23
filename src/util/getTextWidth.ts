const context = document.createElement("canvas").getContext("2d");

export function getTextWidth(text: string, font?: string): number {
    if (context == null) {
        throw new Error("Failed to create canvas context.");
    }
    if (font != null) {
        context.font = font;
    }
    return context.measureText(text).width;
}
