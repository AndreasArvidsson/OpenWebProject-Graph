import { getCalculateValueCallback, getDataCallback } from "./Callbacks.js";
import type Graph from "./index.js";
import { createInput } from "./Input.js";
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
    private readonly _graph: Graph;
    private _interactionData: InteractionData[] = [];
    private _mouseTrackingCallbacks?: MouseTrackingCallbacks;
    private _resizeCallback?: () => void;
    private _resizing = false;
    private _smoothingCallback?: () => void;
    private _smoothingInput?: HTMLInputElement;
    private _zoomCallbacks?: ZoomCallbacks;
    private mouseDown = false;

    /**
     * Create a new Interaction.
     */
    public constructor(graph: Graph) {
        this._graph = graph;
    }

    /**
     * Update(add/remove) interaction events.
     */
    public updateOptions(): void {
        // Resizing.
        if (this._graph.options.interaction.resize && !this._resizeCallback) {
            this._resizeCallback = this._addResizeEvent();
        } else if (
            !this._graph.options.interaction.resize &&
            this._resizeCallback
        ) {
            window.removeEventListener("resize", this._resizeCallback);
            this._resizeCallback = undefined;
        }

        // Mouse tracking.
        if (
            this._graph.options.interaction.trackMouse &&
            !this._mouseTrackingCallbacks
        ) {
            this._mouseTrackingCallbacks = this._addMouseTrackingEvents();
        } else if (
            !this._graph.options.interaction.trackMouse &&
            this._mouseTrackingCallbacks
        ) {
            const canvas = this._graph.canvas.interaction.getCanvas();
            canvas.removeEventListener(
                "mousemove",
                this._mouseTrackingCallbacks.mousemove,
            );
            canvas.removeEventListener(
                "mouseout",
                this._mouseTrackingCallbacks.mouseout,
            );
            this._mouseTrackingCallbacks = undefined;
        }

        // Zooming.
        if (this._graph.options.interaction.zoom && !this._zoomCallbacks) {
            this._zoomCallbacks = this._addZoomEvents();
        } else if (
            !this._graph.options.interaction.zoom &&
            this._zoomCallbacks
        ) {
            let canvas = this._graph.canvas.interaction.getCanvas();
            canvas.removeEventListener(
                "mousedown",
                this._zoomCallbacks.mousedown,
            );
            canvas.removeEventListener(
                "mousemove",
                this._zoomCallbacks.mousemove,
            );
            canvas.removeEventListener("mouseup", this._zoomCallbacks.mouseup);
            canvas.removeEventListener(
                "dblclick",
                this._zoomCallbacks.dblclick,
            );
            canvas = this._graph.canvas.background.getCanvas();
            canvas.removeEventListener("mouseup", this._zoomCallbacks.mouseup);
            canvas.removeEventListener(
                "mouseout",
                this._zoomCallbacks.mouseout,
            );
            this._zoomCallbacks = undefined;
        }

        // Smooth option.
        if (
            this._graph.options.interaction.smoothing &&
            this._smoothingCallback == null
        ) {
            this._smoothingCallback = this._addSmoothingEvent();
        } else if (
            !this._graph.options.interaction.smoothing &&
            this._smoothingCallback != null
        ) {
            const smoothingInput = this._smoothingInput;
            if (smoothingInput == null) {
                return;
            }
            smoothingInput.removeEventListener(
                "change",
                this._smoothingCallback,
            );
            this._smoothingCallback = undefined;
            smoothingInput.remove();
            this._smoothingInput = undefined;
        }

        // Every time options are updated. Update smoothing value if available.
        if (this._smoothingInput != null) {
            this._smoothingInput.value = String(
                this._graph.options.graph.smoothing,
            );
        }

        this._createInteractionData();
    }

    /**
     * Clear interaction data.
     */
    public clear(): void {
        this._graph.canvas.interaction.clear();
        if (this._smoothingInput != null) {
            this._smoothingInput.style.display = "none";
        }
    }

    /**
     * Render interaction data.
     */
    public render(): void {
        if (this._smoothingInput != null) {
            this._smoothingInput.style.display = "block";
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
        if (this._smoothingInput != null) {
            this._smoothingInput.style.top = `${y + height - 21}px`;
            this._smoothingInput.style.left = `${x}px`;
            this._smoothingInput.style.display = "block";
        }
    }

    /**
     * Add a resize event.
     */
    private _addResizeEvent(): () => void {
        const graph = this._graph;
        let timeOutResize: ReturnType<typeof setTimeout> | undefined;

        // Re-plots the graph on resize end.
        const resizeEnd = (): void => {
            graph.canvas.background.resize();
            graph._calculateGraphSize();
            graph._plot();
            timeOutResize = undefined;
            this._resizing = false;
        };

        // Clear graph, hightlight and spinner features on resize start.
        const resizeStart = (): void => {
            this._resizing = true;
            graph.canvas.graph.clear();
            graph.canvas.highlight.clear();
            graph.canvas.interaction.clear();
            graph._renderLegend();
        };

        let lastWidth = this._graph.canvas.background.getWidth();
        let lastHeight = this._graph.canvas.background.getHeight();
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
                if (timeOutResize == null) {
                    resizeStart();
                }
                // Reset timer each time so that the resizeEnd function doesnt run until the user has stopped resizing.
                clearTimeout(timeOutResize);
                timeOutResize = setTimeout(resizeEnd, 500);
            }
        };

        window.addEventListener("resize", callback);
        return callback;
    }

    private _addMouseTrackingEvents(): MouseTrackingCallbacks {
        const graph = this._graph;
        const mousemove = (e: MouseEvent): void => {
            if (
                this.mouseDown ||
                this._resizing ||
                !graph.axes.x.hasBounds() ||
                e.offsetX < 0
            ) {
                return;
            }
            const valueX = graph.axes.x.pixelToValue(e.offsetX);
            const values = [valueX];
            graph.canvas.interaction.clear();
            for (let i = 0; i < graph.options.graph.dataY.length; ++i) {
                const dataY = graph.options.graph.dataY[i];
                // Cant track unexisting values.
                if (dataY.length === 0) {
                    continue;
                }
                const getDataX = getDataCallback(graph.options, "x", i);
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
                if (res.found !== undefined) {
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
                    this._interactionData[i].moveTo(e.offsetX, pixelY);
                }
            }
            graph._renderLegend(values);
        };
        const mouseout = (): void => {
            if (!this.mouseDown) {
                graph.canvas.interaction.clear();
                graph._renderLegend();
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
    private _addZoomEvents(): ZoomCallbacks {
        const graph = this._graph;
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
                graph._renderLegend();
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
                    graph._plot();
                }
            }
        };
        const dblclick = (e: MouseEvent): void => {
            // Prevents double click from selecting the div.
            e.preventDefault();
            if (graph.axes.x.hasZoom() || graph.axes.y.hasZoom()) {
                graph.axes.x.clearZoom();
                graph.axes.y.clearZoom();
                graph._plot();
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

        canvas = this._graph.canvas.background.getCanvas();
        canvas.addEventListener("mouseup", mouseup);
        canvas.addEventListener("mouseleave", mouseout);

        return { mousedown, mousemove, mouseup, dblclick, mouseout };
    }

    /**
     * Add smoothing input event.
     */
    private _addSmoothingEvent(): () => void {
        this._smoothingInput = createInput({
            type: "number",
            tabIndex: -1,
            maxLength: 6,
            value: 0,
            min: 0,
        });
        this._smoothingInput.style.zIndex = "5";
        this._smoothingInput.style.position = "absolute";
        this._smoothingInput.style.width = "50px";
        this._smoothingInput.style.height = "21px";
        this._smoothingInput.style.backgroundColor = "white";
        this._smoothingInput.style.borderRadius = "0";
        this._smoothingInput.style.border = "1px solid #ccc";
        this._smoothingInput.style.color = "#555";
        this._smoothingInput.style.padding = "0 0 0 5px";
        this._smoothingInput.style.display = "none";
        this._smoothingInput.className =
            `${this._smoothingInput.className || ""} a-graph-smoothing-input`.trim();
        this._graph.container.append(this._smoothingInput);
        const callbackDone = (): void => {
            const smoothingInput = this._smoothingInput;
            if (!smoothingInput) {
                return;
            }
            let value = Number.parseInt(smoothingInput.value, 10);
            // Calculate min length for all data sets. Smoothing can't be greater than availalbe data points.
            let length = Number.MAX_SAFE_INTEGER;
            for (const data of this._graph.options.graph.dataY) {
                length = Math.min(length, data.length);
            }
            if (2 * value + 1 > length) {
                value = Math.floor((length - 1) / 2);
            }
            smoothingInput.value = value.toString();
            this._graph.options.graph.smoothing = value;
            this._graph._renderGraph();
        };
        this._smoothingInput.addEventListener("done", callbackDone);
        return callbackDone;
    }

    /**
     * Create interaction data.
     */
    private _createInteractionData(): void {
        const radius = 3;
        const ctx = document.createElement("canvas").getContext("2d");
        if (ctx == null) {
            throw new Error("Could not create 2D context");
        }
        this._interactionData = [];
        for (let i = 0; i < this._graph.options.graph.dataY.length; ++i) {
            // Clear area
            ctx.clearRect(0, 0, 2 * radius, 2 * radius);

            // Draw solid circle
            ctx.beginPath();
            ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
            ctx.fillStyle = this._graph.options.graph.colors[i + 1];
            ctx.fill();

            // If fill; draw black border to increase visibility.
            if (this._graph.options.graph.fill) {
                ctx.beginPath();
                ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = "#000000";
                ctx.stroke();
            }

            // Get image data from tmp context.
            const imageData = ctx.getImageData(0, 0, 2 * radius, 2 * radius);
            // Add member data.
            const canvas = this._graph.canvas.interaction;
            this._interactionData[i] = {
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
