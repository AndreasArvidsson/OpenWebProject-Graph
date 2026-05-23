/*
 * @author Andreas Arvidsson
 * https://github.com/AndreasArvidsson/OpenWebProject-graph
 */

import { Spinner } from "spin.js";
import { Axis } from "./Axis.js";
import { getRenderCallback } from "./Callbacks.js";
import { Canvas } from "./Canvas.js";
import { Interaction } from "./Interaction.js";
import { Options } from "./Options.js";
import type { PartialOptions, FullOptions } from "./Options.type.js";
import { getDefaultOptions } from "./util/getDefaultOptions.js";

type GraphValues = number[];
type OffsetSide = "top" | "bottom" | "left" | "right";

interface GraphCanvases {
    background: Canvas;
    graph: Canvas;
    highlight: Canvas;
    interaction: Canvas;
    legend?: Canvas;
}

export { getDefaultOptions };
export type { PartialOptions, FullOptions };

/**
 * The Graph class is a 2D graph plotter.
 * Built with performance and customizability in mind. Supports multiple data
 * sets and all data sets are available as typed arrays.
 */
// oxlint-disable-next-line import/no-default-export
export default class Graph {
    /** @internal */
    public readonly axes: { x: Axis; y: Axis };
    /** @internal */
    public readonly canvas: GraphCanvases;
    /** @internal */
    public readonly options: Options;
    /** @internal */
    public readonly container: HTMLElement;
    /** @internal */
    private readonly interaction: Interaction;
    /** @internal */
    private disposed = false;
    /** @internal */
    private hasCalculatedGraphSize = false;
    /** @internal */
    private spinner?: Spinner;
    /** @internal */
    private spinnerDiv?: HTMLDivElement;

    public constructor(
        container: HTMLElement | string,
        options?: PartialOptions,
    ) {
        const element: HTMLElement | null =
            typeof container === "string"
                ? document.getElementById(container)
                : container;

        if (element == null) {
            throw new Error("owp.graph ERROR: Element dom is undefined.");
        }

        element.style.position = "relative";

        this.container = element;
        this.options = new Options();

        this.canvas = {
            background: new Canvas(element, "background"),
            graph: new Canvas(element, "graph", true),
            highlight: new Canvas(element, "highlight"),
            interaction: new Canvas(element, "interaction"),
        };

        this.canvas.background.setZIndex(0);
        this.canvas.graph.setZIndex(1);
        this.canvas.highlight.setZIndex(2);
        // Spinner uses zIndex 3.
        this.canvas.interaction.setZIndex(4);
        // Smoothing input used zIndex 5.

        this.axes = {
            x: new Axis(this.options, this.canvas.graph, true),
            y: new Axis(this.options, this.canvas.graph, false),
        };

        this.interaction = new Interaction(this);

        if (options == null) {
            console.warn("owp.graph WARNING: No options set. Uses default.");
        }

        this.setOptions(options);
    }

    /**
     * Dispose of the graph and remove all event listeners.
     */
    public dispose(): void {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        this.interaction.dispose();
        if (this.spinner != null) {
            this.spinner.stop();
            this.spinner = undefined;
        }
        if (this.spinnerDiv != null) {
            this.spinnerDiv.remove();
            this.spinnerDiv = undefined;
        }
        if (this.canvas.legend != null) {
            this.canvas.legend.dispose();
            this.canvas.legend = undefined;
        }
        this.canvas.background.dispose();
        this.canvas.graph.dispose();
        this.canvas.highlight.dispose();
        this.canvas.interaction.dispose();
    }

    /**
     * Get options instance.
     */
    public getOptions(): FullOptions {
        return this.options.options;
    }

    /**
     * Set new options.
     */
    public setOptions(options?: PartialOptions): void {
        if (this.disposed) {
            throw new Error(
                "owp.graph ERROR: Can't set options: Graph is disposed.",
            );
        }
        this.options.set(options);
        this.hasCalculatedGraphSize = false;
        if (this.options.isOk()) {
            const opts = this.options.options;
            this.axes.x.zoom(opts.zoom.xMin, opts.zoom.xMax);
            this.axes.y.zoom(opts.zoom.yMin, opts.zoom.yMax);
            this.axes.x.calculateBounds();
            this.axes.y.calculateBounds();
            this.interaction.updateOptions();
            this.canvas.graph.setBorder(
                opts.border.style,
                opts.border.color,
                opts.border.width,
            );
            this.initLegend();
            this.plot();
        } else {
            console.error("owp.graph ERROR: Can't plot: Invalid options.");
        }
    }

    /* ********** PRIVATE ********** */

    /**
     * Create legend canvas and attach to parent dom.
     *
     * @internal
     */
    private initLegend(): void {
        const opts = this.options.options;
        const location = opts.legend.location;
        if (location !== "" && opts.interaction.trackMouse) {
            // DIV id.
            if (
                location.toLowerCase() !== "top" &&
                location.toLowerCase() !== "right"
            ) {
                const legendDiv = document.getElementById(location);
                if (legendDiv) {
                    legendDiv.style.position = "relative";
                    // Reuse existing canvas.
                    if (this.canvas.legend) {
                        this.canvas.legend.setParent(legendDiv);
                    }
                    // Create new canvas.
                    else {
                        this.canvas.legend = new Canvas(legendDiv);
                    }
                } else {
                    console.warn(
                        `owp.graph WARNING: Legend location: "${
                            location
                        }" not found.`,
                    );
                }
            } else {
                // Set same parent for legend as rest of graph.
                if (this.canvas.legend) {
                    this.canvas.legend.setParent(this.container);
                } else {
                    this.canvas.legend = new Canvas(this.container);
                    this.canvas.legend.disableMouseInteraction();
                }
                if (location.toLowerCase() === "top") {
                    this.canvas.legend.setSize("100%", opts.legend.size);
                } else if (location.toLowerCase() === "right") {
                    this.canvas.legend.setPosition(0, 0, true);
                    this.canvas.legend.setSize(200, "100%");
                }
            }
        }
        // Remove old legend.
        else if (this.canvas.legend) {
            this.canvas.legend.setParent();
            this.canvas.legend = undefined;
        }
    }

    /**
     * Renders the legend on the background canvas.
     *
     * @internal
     */
    public renderLegend(values?: GraphValues): void {
        const opts = this.options.options;

        if (!this.canvas.legend || opts.graph.dataY.length === 0) {
            return;
        }

        const settings = opts.legend;
        const canvas = this.canvas.legend;
        canvas.clear();
        canvas.set("font", this.options.getLegendFont());
        canvas.set("textBaseline", "top");
        canvas.set("textAlign", settings.align);

        const isTop = settings.location.toLowerCase() === "top";
        const alignLeft = settings.align.toLowerCase() === "left";
        // NewLine is disabled for top location.
        const newLine =
            (settings.newLine && !isTop) ||
            settings.location.toLowerCase() === "right";

        let x = alignLeft
            ? opts.legend.offsetX + opts.legend.padding
            : canvas.getWidth() - opts.legend.offsetX;

        // OffsetY is disabled for top location.
        let y = isTop ? 0 : opts.legend.offsetY;

        function printValue(
            color: string,
            name: string,
            value: string | number | undefined,
        ): void {
            const str = `${name}: ${value ?? "\u2014"}`;
            canvas.text(str, x, y, null, color);
            if (newLine) {
                y += settings.size;
            } else {
                x += (canvas.getTextWidth(str) + 10) * (alignLeft ? 1 : -1);
            }
        }

        const printX = (): void => {
            printValue(
                opts.graph.colors[0],
                this.options.getName(0),
                values ? this.axes.x.formatLegendValue(values[0]) : undefined,
            );
        };

        const printY = (i: number): void => {
            printValue(
                opts.graph.colors[i],
                this.options.getName(i),
                values ? this.axes.y.formatLegendValue(values[i]) : undefined,
            );
        };

        if (alignLeft || newLine) {
            printX();
            for (let i = 1; i <= opts.graph.dataY.length; ++i) {
                printY(i);
            }
        } else {
            for (let i = opts.graph.dataY.length; i >= 1; --i) {
                printY(i);
            }
            printX();
        }
    }

    /**
     * Plots/draws the graph.
     *
     * @internal
     */
    public plot(): void {
        if (this.options.options.debug) {
            console.time("owp.graph DEBUG: Plot time");
        }

        // If graph size has not yet been calculated. Do it.
        if (!this.hasCalculatedGraphSize) {
            this.calculateGraphSize();
        }

        // Clear plot.
        this.canvas.background.clear();
        this.canvas.graph.clear();
        this.canvas.highlight.clear();
        this.interaction.clear();

        // Render non data related features.
        this.renderTitle();
        this.renderAxesLabels();
        this.renderSpin();

        // Has bounds. Render bounds related features.
        if (this.axes.x.hasBounds() && this.axes.y.hasBounds()) {
            this.renderXAxis();
            this.renderYAxis();
            this.renderHighlight();

            // Has graph data. Render graph data.
            if (this.options.options.graph.dataY.length > 0) {
                this.renderLegend();
                this.renderGraph();
                this.interaction.render();
            } else if (this.options.options.debug) {
                console.debug(
                    "owp.graph DEBUG: No data set available. Plotting available features.",
                );
            }
        }
        // Has neither bounds or data.
        else if (this.options.options.debug) {
            console.debug(
                "owp.graph DEBUG: No bounds or data set available. Plotting available features.",
            );
        }

        if (this.options.options.debug) {
            console.timeEnd("owp.graph DEBUG: Plot time");
        }
    }

    /**
     * Render the spinner
     *
     * @internal
     */
    private renderSpin(): void {
        // Can't update options so have to remove old spinner always.
        if (this.spinner != null) {
            this.spinner.stop();
            this.spinner = undefined;
        }
        // Show spinner
        if (this.options.options.spinner.show) {
            // Spinner div does not exist. Create it.
            if (this.spinnerDiv == null) {
                this.spinnerDiv = document.createElement("div");
                this.spinnerDiv.style.position = "absolute";
                this.spinnerDiv.style.zIndex = "3";
                this.container.append(this.spinnerDiv);
                this.updateSpinnerSize();
            }
            this.spinner = new Spinner(this.options.options.spinner);
            this.spinner.spin(this.spinnerDiv);
        }
        // Hide spinner. Remove old div.
        else if (this.spinnerDiv) {
            this.spinnerDiv.remove();
            this.spinnerDiv = undefined;
        }
    }

    /**
     * Updates the position and size of the spinner div based on the graph canvas.
     *
     * @internal
     */
    private updateSpinnerSize(): void {
        if (this.spinnerDiv != null) {
            this.spinnerDiv.style.left = `${this.canvas.graph.getContentX()}px`;
            this.spinnerDiv.style.top = `${this.canvas.graph.getContentY()}px`;
            this.spinnerDiv.style.width = `${this.canvas.graph.getContentWidth()}px`;
            this.spinnerDiv.style.height = `${this.canvas.graph.getContentHeight()}px`;
        }
    }

    /**
     * Calculate graph canvas position and size.
     *
     * @internal
     */
    public calculateGraphSize(): void {
        const border = this.options.getBorder();
        const offsetTop = this.getOffset("top");
        const offsetBottom = this.getOffset("bottom");
        let height =
            this.canvas.background.getHeight() - offsetTop - offsetBottom;

        // Calculate new ticks for the new size.
        if (this.axes.y.hasBounds()) {
            this.axes.y.calculateTicks(height - border.top - border.bottom);
        }

        const offsetLeft = this.getOffset("left");
        let x = offsetLeft;
        let y = offsetTop;
        let width =
            this.canvas.background.getWidth() -
            offsetLeft -
            this.getOffset("right");

        if (this.axes.x.hasBounds()) {
            this.axes.x.calculateTicks(width - border.left - border.right);
        }

        // Set graph canvas.
        this.canvas.graph.setPosition(x, y);
        this.canvas.graph.setSize(width, height);

        // Convert to content space.
        x = this.canvas.graph.getContentX();
        y = this.canvas.graph.getContentY();
        width = this.canvas.graph.getContentWidth();
        height = this.canvas.graph.getContentHeight();

        // Set highlight canvas.
        this.canvas.highlight.setPosition(x, y);
        this.canvas.highlight.setSize(width, height);
        // Set interaction canvas.
        this.canvas.interaction.setPosition(x, y);
        this.canvas.interaction.setSize(width, height);
        // Set legend canvas if available.
        if (this.canvas.legend) {
            if (this.options.options.legend.location.toLowerCase() === "top") {
                this.canvas.legend.setPosition(
                    x,
                    y -
                        this.canvas.legend.getHeight() -
                        this.options.options.legend.padding,
                );
                this.canvas.legend.setSize(
                    width,
                    this.options.options.legend.size,
                );
            } else if (
                this.options.options.legend.location.toLowerCase() === "right"
            ) {
                this.canvas.legend.setPosition(
                    this.options.getOffset().right,
                    y,
                    true,
                );
                this.canvas.legend.setSize(200, height);
            }
        }

        // Update interaction instance.
        this.interaction.graphChangedSize(x, y, width, height);

        // Updates the spinner div size.
        this.updateSpinnerSize();

        this.hasCalculatedGraphSize = true;
    }

    /**
     * Renders the x-axis(ticks markers, tick labels, grid lines) on the background canvas.
     *
     * @internal
     */
    private renderXAxis(): void {
        if (!this.options.options.axes.x.show) {
            return;
        }
        const ticks = this.axes.x.getTicks();
        let oldX: number | undefined = undefined;
        let oldWidth = 0;

        for (let i = 0; i < ticks.length; ++i) {
            let x =
                this.canvas.graph.getContentX() + (ticks[i].coordinate ?? 0);
            let y = this.canvas.graph.getY() + this.canvas.graph.getHeight();

            // Draw tick markers.
            if (ticks.markers) {
                y += ticks.markers.offset;
                this.canvas.background.line(
                    x,
                    y,
                    x,
                    y + ticks.markers.length,
                    ticks.markers.width,
                    ticks.markers.color,
                );
                y += ticks.markers.length;
            }
            // Draw grid line.
            if (
                ticks.grid &&
                x > this.canvas.graph.getContentX() * 1.01 &&
                x <
                    (this.canvas.graph.getContentX() +
                        this.canvas.graph.getContentWidth()) *
                        0.99
            ) {
                this.canvas.background.line(
                    x,
                    this.canvas.graph.getContentY(),
                    x,
                    this.canvas.graph.getContentY() +
                        this.canvas.graph.getContentHeight(),
                    ticks.grid.width,
                    ticks.grid.color,
                );
            }

            // Move last tick label to the left to avoid collision with the right edge.
            if (ticks.labels != null && i === ticks.length - 1) {
                x = Math.min(
                    x,
                    this.canvas.background.getContentWidth() -
                        Math.ceil(ticks.labels.width[i] / 2) -
                        1,
                );
            }

            // Draw tick label.
            if (
                ticks.labels != null &&
                (oldX == null ||
                    Math.abs(x - oldX) > oldWidth + ticks.labels.width[i] / 2)
            ) {
                y += ticks.labels.padding;
                this.canvas.background.text(
                    ticks[i].label ?? "",
                    x,
                    y,
                    ticks.labels.font,
                    ticks.labels.color,
                    "center",
                    "hanging",
                );
                oldX = x;
                oldWidth = ticks.labels.width[i];
            }
        }
    }

    /**
     * Renders the y-axis(ticks markers, tick labels, grid lines) on the background canvas.
     *
     * @internal
     */
    private renderYAxis(): void {
        if (!this.options.options.axes.y.show) {
            return;
        }
        const ticks = this.axes.y.getTicks();
        let oldY: number | undefined = undefined;
        for (const tick of ticks) {
            let x = this.canvas.graph.getX();
            const y = this.canvas.graph.getContentY() + (tick.coordinate ?? 0);
            // Draw tick markers.
            if (ticks.markers) {
                x -= ticks.markers.offset;
                this.canvas.background.line(
                    x,
                    y,
                    x - ticks.markers.length,
                    y,
                    ticks.markers.width,
                    ticks.markers.color,
                );
                x -= ticks.markers.length;
            }
            // Draw grid line.
            if (
                ticks.grid &&
                y > this.canvas.graph.getContentY() * 1.01 &&
                y <
                    (this.canvas.graph.getContentY() +
                        this.canvas.graph.getContentHeight()) *
                        0.99
            ) {
                this.canvas.background.line(
                    this.canvas.graph.getContentX(),
                    y,
                    this.canvas.graph.getContentX() +
                        this.canvas.graph.getContentWidth(),
                    y,
                    ticks.grid.width,
                    ticks.grid.color,
                );
            }
            // Draw tick label.
            if (
                ticks.labels != null &&
                (oldY == null || Math.abs(y - oldY) > ticks.labels.size)
            ) {
                x -= ticks.labels.padding;
                this.canvas.background.text(
                    tick.label ?? "",
                    x,
                    y,
                    ticks.labels.font,
                    ticks.labels.color,
                    "right",
                    "middle",
                );
                oldY = y;
            }
        }
    }

    /**
     * Renders the axes(x and y) labels on the background canvas.
     *
     * @internal
     */
    private renderAxesLabels(): void {
        const opts = this.options.options;
        // Draw X label.
        if (opts.axes.x.show && opts.axes.x.label.length > 0) {
            const x =
                this.canvas.graph.getContentX() +
                this.canvas.graph.getContentWidth() / 2;
            const y =
                this.canvas.background.getHeight() -
                opts.axes.labels.offset -
                this.options.getOffset().bottom;
            this.canvas.background.text(
                this.axes.x.getAxisLabel(),
                x,
                y,
                this.axes.x.getAxisLabelFont(),
                opts.axes.labels.color,
                "center",
                "bottom",
            );
        }
        // Draw Y label.
        if (opts.axes.y.show && opts.axes.y.label.length > 0) {
            const x = opts.axes.labels.offset + this.options.getOffset().left;
            const y =
                this.canvas.graph.getContentY() +
                this.canvas.graph.getContentHeight() / 2;
            this.canvas.background.text(
                this.axes.y.getAxisLabel(),
                x,
                y,
                this.axes.y.getAxisLabelFont(),
                opts.axes.labels.color,
                "center",
                "hanging",
                -90,
            );
        }
    }

    /**
     * Renders the graph title on the background canvas.
     *
     * @internal
     */
    private renderTitle(): void {
        const opts = this.options.options;
        if (opts.title.label.length === 0) {
            return;
        }
        let x = 0;
        if (opts.title.align.toLowerCase() === "left") {
            x =
                this.canvas.graph.getContentX() +
                opts.title.offsetX +
                this.options.getOffset().left;
        } else if (opts.title.align.toLowerCase() === "center") {
            x =
                this.canvas.graph.getContentX() +
                this.canvas.graph.getContentWidth() / 2 +
                opts.title.offsetX;
        } else if (opts.title.align.toLowerCase() === "right") {
            x =
                this.canvas.graph.getContentX() +
                this.canvas.graph.getContentWidth() -
                opts.title.offsetX -
                this.options.getOffset().right;
        }
        const y = opts.title.offsetY + this.options.getOffset().top;
        const font = `${
            (opts.title.bold ? "bold " : "") + opts.title.size
        }px ${opts.title.font}`;
        this.canvas.background.text(
            opts.title.label,
            x,
            y,
            font,
            opts.title.color,
            opts.title.align,
            "top",
        );
    }

    /**
     * Renders the highligted area on the highligh canvas.
     *
     * @internal
     */
    private renderHighlight(): void {
        this.canvas.highlight.clear();
        const h = this.options.options.highlight;
        if (
            h.xMin == null &&
            h.xMax == null &&
            h.yMin == null &&
            h.yMax == null
        ) {
            return;
        }
        // Convert values to pixels.
        const x1 = this.axes.x.valueToPixel(h.xMin ?? this.axes.x.getMin());
        const x2 = this.axes.x.valueToPixel(h.xMax ?? this.axes.x.getMax());
        const y1 = this.axes.y.valueToPixel(h.yMin ?? this.axes.y.getMin());
        const y2 = this.axes.y.valueToPixel(h.yMax ?? this.axes.y.getMax());
        this.canvas.highlight.fillRectangle2(x1, y1, x2, y2, h.color);
    }

    /**
     * Renders the graph curve on the graph canvas.
     *
     * @internal
     */
    public renderGraph(): void {
        const opts = this.options.options;
        if (opts.debug && opts.graph.smoothing > 1) {
            console.debug(
                `owp.graph DEBUG: Smoothed rendering: ${opts.graph.smoothing}`,
            );
        }
        if (opts.debug && this.options.renderSimplify()) {
            console.debug(
                `owp.graph DEBUG: Simplify rendering: ${opts.graph.simplify} ${opts.graph.simplifyBy}`,
            );
        }
        // Clear old data so we can draw new.
        this.canvas.graph.clear();
        // Get canvas and set properties.
        const ctx = this.canvas.graph.getContext();
        ctx.lineWidth = opts.graph.lineWidth;
        ctx.globalCompositeOperation = opts.graph.compositeOperation;
        // Get render callback based on options
        const renderCallback = getRenderCallback(
            this.options,
            this.canvas.graph,
            this.axes,
        );
        // Render each data set.
        for (let i = 0; i < opts.graph.dataY.length; ++i) {
            renderCallback(i);
        }
    }

    /**
     * Get offset for the given paramters.
     *
     * @internal
     */
    private getOffset(side: OffsetSide): number {
        const opts = this.options.options;
        let offset = 0;
        switch (side) {
            case "top":
                if (opts.title.label.length > 0) {
                    offset += opts.title.size;
                    offset += opts.title.offsetY;
                    offset += opts.title.padding;
                }
                if (
                    this.canvas.legend &&
                    opts.legend.location.toLowerCase() === "top"
                ) {
                    offset += this.canvas.legend.getHeight();
                    offset += opts.legend.offsetY;
                    offset += opts.legend.padding;
                } else if (opts.axes.y.show && opts.axes.tickLabels.show) {
                    offset += opts.axes.tickLabels.size / 2;
                }
                offset += this.options.getOffset().top;
                break;
            case "bottom":
                if (opts.axes.x.show) {
                    if (opts.axes.x.label.length > 0) {
                        offset += opts.axes.labels.size;
                        offset += opts.axes.labels.offset;
                        offset += opts.axes.labels.padding;
                    }
                    if (opts.axes.x.height) {
                        offset += opts.axes.x.height;
                    } else {
                        if (opts.axes.tickLabels.show) {
                            offset += opts.axes.tickLabels.size;
                            offset += opts.axes.tickLabels.offset;
                            offset += opts.axes.tickLabels.padding;
                        }
                        if (opts.axes.tickMarkers.show) {
                            offset += opts.axes.tickMarkers.length;
                            offset += opts.axes.tickMarkers.offset;
                        }
                    }
                } else if (opts.axes.y.show && opts.axes.tickLabels.show) {
                    offset += opts.axes.tickLabels.size / 2;
                }
                offset += this.options.getOffset().bottom;
                break;
            case "left":
                if (opts.axes.y.show) {
                    if (opts.axes.y.label.length > 0) {
                        offset += opts.axes.labels.size;
                        offset += opts.axes.labels.offset;
                        offset += opts.axes.labels.padding;
                    }
                    if (opts.axes.y.width) {
                        offset += opts.axes.y.width;
                    } else {
                        if (opts.axes.tickLabels.show) {
                            offset += this.axes.y.getLabelWidth();
                            offset += opts.axes.tickLabels.offset;
                            offset += opts.axes.tickLabels.padding;
                        }
                        if (opts.axes.tickMarkers.show) {
                            offset += opts.axes.tickMarkers.length;
                            offset += opts.axes.tickMarkers.offset;
                        }
                    }
                } else if (opts.axes.x.show && opts.axes.tickLabels.show) {
                    offset += this.axes.x.getBoundLabelWidth("min", true);
                }
                offset += this.options.getOffset().left;
                break;
            case "right":
                if (
                    this.canvas.legend &&
                    opts.legend.location.toLowerCase() === "right"
                ) {
                    offset += this.canvas.legend.getWidth();
                }
                offset += this.options.getOffset().right;
                break;
            default: {
                const _exhaustiveCheck: never = side;
            }
        }
        return Math.round(offset);
    }
}
