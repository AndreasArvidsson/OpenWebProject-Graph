import { getCalculateValueCallback, getDataCallback } from "./Callbacks.js";
import type Graph from "./index.js";
import { createInput } from "./Input.js";
import type { FullOptions } from "./Options.type.js";
import { binarySearch } from "./util/binarySearch.js";

interface MouseTrackingCallbacks {
    mousemove: (e: MouseEvent) => void;
    mouseout: () => void;
}

interface ZoomCallbacks {
    mousedown: (e: MouseEvent) => void;
    mousemove: (e: MouseEvent) => void;
    mouseup: (e: MouseEvent) => void;
    dblclick: (e: MouseEvent) => void;
    mouseout: (e: MouseEvent & { toElement?: EventTarget | null }) => void;
}

interface InteractionData {
    moveTo(x: number, y: number): void;
}

/**
 * Interaction is a class that handles the user interaction for the Graph class.
 */
export class Interaction {
    private readonly graph: Graph;
    private interactionData: InteractionData[] = [];
    private mouseTrackingCallbacks?: MouseTrackingCallbacks;
    private resizeCallback?: () => void;
    private resizeTimeout?: ReturnType<typeof setTimeout>;
    private smoothingCallback?: () => void;
    private smoothingInput?: HTMLInputElement;
    private zoomCallbacks?: ZoomCallbacks;
    private resizing = false;
    private mouseDown = false;

    /**
     * Create a new Interaction.
     */
    public constructor(graph: Graph) {
        this.graph = graph;
    }

    /**
     * Dispose of all interaction event listeners and elements.
     */
    public dispose(): void {
        this.removeResizeEvent();
        this.removeMouseTrackingEvents();
        this.removeZoomEvents();
        this.removeSmoothingEvent();
        this.interactionData = [];
    }

    /**
     * Update(add/remove) interaction events.
     */
    public updateOptions(): void {
        // Resizing.
        if (this.options().interaction.resize && this.resizeCallback == null) {
            this.resizeCallback = this.addResizeEvent();
        } else if (
            !this.options().interaction.resize &&
            this.resizeCallback != null
        ) {
            this.removeResizeEvent();
        }

        // Mouse tracking.
        if (
            this.options().interaction.trackMouse &&
            this.mouseTrackingCallbacks == null
        ) {
            this.mouseTrackingCallbacks = this.addMouseTrackingEvents();
        } else if (
            !this.options().interaction.trackMouse &&
            this.mouseTrackingCallbacks != null
        ) {
            this.removeMouseTrackingEvents();
        }

        // Zooming.
        if (this.options().interaction.zoom && this.zoomCallbacks == null) {
            this.zoomCallbacks = this.addZoomEvents();
        } else if (
            !this.options().interaction.zoom &&
            this.zoomCallbacks != null
        ) {
            this.removeZoomEvents();
        }

        // Smooth option.
        if (
            this.options().interaction.smoothing &&
            this.smoothingCallback == null
        ) {
            this.smoothingCallback = this.addSmoothingEvent();
        } else if (
            !this.options().interaction.smoothing &&
            this.smoothingCallback != null
        ) {
            this.removeSmoothingEvent();
        }

        // Every time options are updated. Update smoothing value if available.
        if (this.smoothingInput != null) {
            this.smoothingInput.value = String(this.options().graph.smoothing);
        }

        this.createInteractionData();
    }

    /**
     * Clear interaction data.
     */
    public clear(): void {
        this.graph.canvas.interaction.clear();
        if (this.smoothingInput != null) {
            this.smoothingInput.style.display = "none";
        }
    }

    /**
     * Render interaction data.
     */
    public render(): void {
        if (this.smoothingInput != null) {
            this.smoothingInput.style.display = "block";
        }
    }

    /**
     * Inform the activity class that the graph has changed size and/or position.
     */
    public graphChangedSize(
        x: number,
        y: number,
        width: number,
        height: number,
    ): void {
        if (this.smoothingInput != null) {
            this.smoothingInput.style.top = `${y + height - 21}px`;
            this.smoothingInput.style.left = `${x}px`;
            this.smoothingInput.style.display = "block";
        }
    }

    private options(): FullOptions {
        return this.graph.options.options;
    }

    /**
     * Add a resize event.
     */
    private addResizeEvent(): () => void {
        const graph = this.graph;

        // Re-plots the graph on resize end.
        const resizeEnd = (): void => {
            graph.canvas.background.resize();
            graph.calculateGraphSize();
            graph.plot();
            this.resizeTimeout = undefined;
            this.resizing = false;
        };

        // Clear graph, hightlight and spinner features on resize start.
        const resizeStart = (): void => {
            this.resizing = true;
            graph.canvas.graph.clear();
            graph.canvas.highlight.clear();
            graph.canvas.interaction.clear();
            graph.renderLegend();
        };

        let lastWidth = this.graph.canvas.background.getWidth();
        let lastHeight = this.graph.canvas.background.getHeight();
        let lastPixelRatio = window.devicePixelRatio;

        const callback = (): void => {
            // Make sure that the size actually have changed.
            if (
                lastWidth !== graph.canvas.background.getWidth() ||
                lastHeight !== graph.canvas.background.getHeight() ||
                lastPixelRatio !== window.devicePixelRatio
            ) {
                lastWidth = graph.canvas.background.getWidth();
                lastHeight = graph.canvas.background.getHeight();
                lastPixelRatio = window.devicePixelRatio;
                // First time the function is called for this resize event.
                if (this.resizeTimeout == null) {
                    resizeStart();
                }
                // Reset timer each time so that the resizeEnd function doesnt run until the user has stopped resizing.
                if (this.resizeTimeout != null) {
                    clearTimeout(this.resizeTimeout);
                }
                this.resizeTimeout = setTimeout(resizeEnd, 500);
            }
        };

        window.addEventListener("resize", callback);
        return callback;
    }

    private removeResizeEvent(): void {
        if (this.resizeCallback != null) {
            window.removeEventListener("resize", this.resizeCallback);
            this.resizeCallback = undefined;
        }
        if (this.resizeTimeout != null) {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = undefined;
        }
        this.resizing = false;
    }

    private removeMouseTrackingEvents(): void {
        if (this.mouseTrackingCallbacks == null) {
            return;
        }
        const canvas = this.graph.canvas.interaction.getCanvas();
        canvas.removeEventListener(
            "mousemove",
            this.mouseTrackingCallbacks.mousemove,
        );
        canvas.removeEventListener(
            "mouseout",
            this.mouseTrackingCallbacks.mouseout,
        );
        this.mouseTrackingCallbacks = undefined;
    }

    private removeZoomEvents(): void {
        if (this.zoomCallbacks == null) {
            return;
        }
        let canvas = this.graph.canvas.interaction.getCanvas();
        canvas.removeEventListener("mousedown", this.zoomCallbacks.mousedown);
        canvas.removeEventListener("mousemove", this.zoomCallbacks.mousemove);
        canvas.removeEventListener("mouseup", this.zoomCallbacks.mouseup);
        canvas.removeEventListener("dblclick", this.zoomCallbacks.dblclick);
        canvas = this.graph.canvas.background.getCanvas();
        canvas.removeEventListener("mouseup", this.zoomCallbacks.mouseup);
        canvas.removeEventListener("mouseleave", this.zoomCallbacks.mouseout);
        this.zoomCallbacks = undefined;
        this.mouseDown = false;
    }

    private removeSmoothingEvent(): void {
        const smoothingInput = this.smoothingInput;
        if (smoothingInput != null && this.smoothingCallback != null) {
            smoothingInput.removeEventListener("done", this.smoothingCallback);
        }
        this.smoothingCallback = undefined;
        smoothingInput?.remove();
        this.smoothingInput = undefined;
    }

    private addMouseTrackingEvents(): MouseTrackingCallbacks {
        const graph = this.graph;
        const mousemove = (e: MouseEvent): void => {
            if (
                this.mouseDown ||
                this.resizing ||
                !graph.axes.x.hasBounds() ||
                e.offsetX < 0
            ) {
                return;
            }
            const valueX = graph.axes.x.pixelToValue(e.offsetX);
            const values = [valueX];
            graph.canvas.interaction.clear();
            for (let i = 0; i < this.options().graph.dataY.length; ++i) {
                const dataY = this.options().graph.dataY[i];
                // Cant track unexisting values.
                if (dataY.length === 0) {
                    continue;
                }
                const getDataX = getDataCallback(graph.options.options, "x", i);
                const res = binarySearch(getDataX, dataY.length, valueX);
                const calculateValueCallback = getCalculateValueCallback(
                    graph.options,
                    graph.axes,
                    dataY,
                    getDataX,
                    i,
                    res.min,
                );
                let valueY, pixelY;
                // Found exaxt X-value.
                if (res.found != null) {
                    valueY = calculateValueCallback(res.found);
                    pixelY = graph.axes.y.valueToPixel(valueY);
                }
                // Binary search returned min and max at same value without a found.
                // There is no matching value. Just abort.
                else if (res.min === res.max) {
                    continue;
                }
                // Calculate Y-value from min max coordinates.
                else {
                    const x1 = graph.axes.x.valueToPixel(getDataX(res.min));
                    const x2 = graph.axes.x.valueToPixel(getDataX(res.max));
                    const y1 = graph.axes.y.valueToPixel(
                        calculateValueCallback(res.min),
                    );
                    const y2 = graph.axes.y.valueToPixel(
                        calculateValueCallback(res.max),
                    );
                    const k = (y2 - y1) / (x2 - x1);
                    const x = e.offsetX - x1;
                    const m = y1;
                    pixelY = k * x + m;
                    valueY = graph.axes.y.pixelToValue(pixelY);
                }
                // Store values to render on legend.
                values[i + 1] = valueY;
                // If value is missing don't plot it.
                if (Number.isFinite(pixelY)) {
                    this.interactionData[i].moveTo(e.offsetX, pixelY);
                }
            }
            graph.renderLegend(values);
        };
        const mouseout = (): void => {
            if (!this.mouseDown) {
                graph.canvas.interaction.clear();
                graph.renderLegend();
            }
        };
        const canvas = graph.canvas.interaction.getCanvas();
        canvas.addEventListener("mousemove", mousemove);
        canvas.addEventListener("mouseout", mouseout);
        return { mousemove, mouseout };
    }

    /**
     * Add zoom events.
     */
    private addZoomEvents(): ZoomCallbacks {
        const graph = this.graph;
        this.mouseDown = false;
        const threshold =
            0.1 *
            Math.min(
                graph.canvas.interaction.getContentWidth(),
                graph.canvas.interaction.getContentHeight(),
            );
        let startX = 0;
        let startY = 0;
        // True = horizontal. false = vertical.
        let lastHorizontal: boolean | undefined;
        const color = "rgba(130, 130, 130, 0.2)";
        let lastX = 0;
        let lastY = 0;

        const mousedown = (e: MouseEvent): void => {
            if (
                e.button === 0 &&
                graph.axes.x.hasBounds() &&
                graph.axes.y.hasBounds()
            ) {
                startX = e.offsetX;
                lastX = e.offsetX;
                startY = e.offsetY;
                lastY = e.offsetY;
                this.mouseDown = true;
                lastHorizontal = undefined;
                graph.renderLegend();
            }
        };
        const mousemove = (e: MouseEvent): void => {
            if (
                this.mouseDown &&
                (e.offsetX !== lastX || e.offsetX !== lastY)
            ) {
                lastX = e.offsetX;
                lastY = e.offsetY;
                const diffX = Math.abs(startX - e.offsetX);
                const diffY = Math.abs(startY - e.offsetY);
                const newHorizontal = diffX > diffY;
                if (
                    newHorizontal !== lastHorizontal &&
                    (newHorizontal ? diffX : diffY) > threshold
                ) {
                    lastHorizontal = newHorizontal;
                }
                graph.canvas.interaction.clear();
                // Mark horizontally.
                if (lastHorizontal) {
                    graph.canvas.interaction.fillRectangle2(
                        startX,
                        0,
                        e.offsetX,
                        graph.canvas.interaction.getContentHeight(),
                        color,
                    );
                }
                // Mark vertically.
                else {
                    graph.canvas.interaction.fillRectangle2(
                        0,
                        startY,
                        graph.canvas.interaction.getContentWidth(),
                        e.offsetY,
                        color,
                    );
                }
            }
        };
        const mouseup = (e: MouseEvent): void => {
            if (e.button === 0 && this.mouseDown) {
                this.mouseDown = false;
                if (startX !== e.offsetX || startY !== e.offsetY) {
                    graph.canvas.interaction.clear();
                    // X-axis.
                    if (lastHorizontal) {
                        const x = clamp(
                            0,
                            e.offsetX,
                            graph.canvas.interaction.getContentWidth(),
                        );
                        if (startX === x) {
                            return;
                        }
                        const min = graph.axes.x.pixelToValue(
                            Math.min(startX, x),
                        );
                        const max = graph.axes.x.pixelToValue(
                            Math.max(startX, x),
                        );
                        graph.axes.x.zoom(min, max);
                    }
                    // Y-axis.
                    else {
                        const y = clamp(
                            0,
                            e.offsetY,
                            graph.canvas.interaction.getContentHeight(),
                        );
                        if (startY === y) {
                            return;
                        }
                        const min = graph.axes.y.pixelToValue(
                            Math.max(startY, y),
                        );
                        const max = graph.axes.y.pixelToValue(
                            Math.min(startY, y),
                        );
                        graph.axes.y.zoom(min, max);
                    }
                    graph.plot();
                }
            }
        };
        const dblclick = (e: MouseEvent): void => {
            // Prevents double click from selecting the div.
            e.preventDefault();
            if (graph.axes.x.hasZoom() || graph.axes.y.hasZoom()) {
                graph.axes.x.clearZoom();
                graph.axes.y.clearZoom();
                graph.plot();
            }
        };
        const mouseout = (
            e: MouseEvent & { toElement?: EventTarget | null },
        ): void => {
            // Make sure we are in a drag event and that we are moving outside of the graph. Not inwards.
            if (
                !this.mouseDown ||
                e.toElement === graph.canvas.graph.getCanvas() ||
                e.toElement === graph.canvas.interaction.getCanvas()
            ) {
                return;
            }
            graph.canvas.interaction.clear();
            this.mouseDown = false;
        };

        let canvas = graph.canvas.interaction.getCanvas();
        canvas.addEventListener("mousedown", mousedown);
        canvas.addEventListener("mousemove", mousemove);
        canvas.addEventListener("mouseup", mouseup);
        canvas.addEventListener("dblclick", dblclick);

        canvas = this.graph.canvas.background.getCanvas();
        canvas.addEventListener("mouseup", mouseup);
        canvas.addEventListener("mouseleave", mouseout);

        return { mousedown, mousemove, mouseup, dblclick, mouseout };
    }

    /**
     * Add smoothing input event.
     */
    private addSmoothingEvent(): () => void {
        this.smoothingInput = createInput({
            type: "number",
            tabIndex: -1,
            maxLength: 6,
            value: 0,
            min: 0,
        });
        this.smoothingInput.style.zIndex = "5";
        this.smoothingInput.style.position = "absolute";
        this.smoothingInput.style.width = "50px";
        this.smoothingInput.style.height = "21px";
        this.smoothingInput.style.backgroundColor = "white";
        this.smoothingInput.style.borderRadius = "0";
        this.smoothingInput.style.border = "1px solid #ccc";
        this.smoothingInput.style.color = "#555";
        this.smoothingInput.style.padding = "0 0 0 5px";
        this.smoothingInput.style.display = "none";
        this.smoothingInput.className =
            `${this.smoothingInput.className || ""} a-graph-smoothing-input`.trim();
        this.graph.container.append(this.smoothingInput);
        const callbackDone = (): void => {
            const smoothingInput = this.smoothingInput;
            if (!smoothingInput) {
                return;
            }
            let value = Number.parseInt(smoothingInput.value, 10);
            // Calculate min length for all data sets. Smoothing can't be greater than availalbe data points.
            let length = Number.MAX_SAFE_INTEGER;
            for (const data of this.options().graph.dataY) {
                length = Math.min(length, data.length);
            }
            if (2 * value + 1 > length) {
                value = Math.floor((length - 1) / 2);
            }
            smoothingInput.value = value.toString();
            this.options().graph.smoothing = value;
            this.graph.renderGraph();
        };
        this.smoothingInput.addEventListener("done", callbackDone);
        return callbackDone;
    }

    /**
     * Create interaction data.
     */
    private createInteractionData(): void {
        const radius = 3;
        const ctx = document.createElement("canvas").getContext("2d");
        if (ctx == null) {
            throw new Error("Could not create 2D context");
        }
        this.interactionData = [];
        for (let i = 0; i < this.options().graph.dataY.length; ++i) {
            // Clear area
            ctx.clearRect(0, 0, 2 * radius, 2 * radius);

            // Draw solid circle
            ctx.beginPath();
            ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
            ctx.fillStyle = this.options().graph.colors[i + 1];
            ctx.fill();

            // If fill; draw black border to increase visibility.
            if (this.options().graph.fill) {
                ctx.beginPath();
                ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = "#000000";
                ctx.stroke();
            }

            // Get image data from tmp context.
            const imageData = ctx.getImageData(0, 0, 2 * radius, 2 * radius);
            // Add member data.
            const canvas = this.graph.canvas.interaction;
            this.interactionData[i] = {
                moveTo(x: number, y: number): void {
                    canvas.putImageData(imageData, x, y, -radius, -radius);
                },
            };
        }
    }
}

/**
 * Clamp the given value to the given range.
 */
function clamp(min: number, number: number, max: number): number {
    if (number < min) {
        return min;
    } else if (number > max) {
        return max;
    }
    return number;
}
