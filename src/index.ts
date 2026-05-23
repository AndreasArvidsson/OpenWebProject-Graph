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
import type { OptionsInput } from "./Options.type.js";
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

export type { OptionsInput as Options };

/**
 * The Graph class is a 2D graph plotter.
 * Built with performance and customizability in mind. Supports multiple data
 * sets and all data sets are available as typed arrays.
 */
// oxlint-disable-next-line import/no-default-export
export default class Graph {
    public static getDefaultOptions = getDefaultOptions;

    public readonly axes: { x: Axis; y: Axis };
    public readonly canvas: GraphCanvases;
    public readonly container: HTMLElement;
    private hasCalculatedGraphSize = false;
    private readonly interaction: Interaction;
    public readonly options: Options;
    private spinner: Spinner | null = null;
    private spinnerDiv: HTMLDivElement | null = null;

    public constructor(
        container: HTMLElement | string,
        options?: OptionsInput,
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

        if (options) {
            this.setOptions(options);
        } else {
            console.warn("owp.graph WARNING: No options set. Uses default.");
            this.setOptions({});
        }
    }

    /**
     * Get options instance.
     */
    public getOptions(): Options {
        return this.options;
    }

    /**
     * Sets all options to their default values.
     */
    public setDefaultOptions(): void {
        this.options.setDefault();
    }

    /**
     * Set new options.
     */
    public setOptions(options: OptionsInput): void {
        this.options.set(options);
        this.hasCalculatedGraphSize = false;
        if (this.options.isOk()) {
            this.axes.x.zoom(this.options.zoom.xMin, this.options.zoom.xMax);
            this.axes.y.zoom(this.options.zoom.yMin, this.options.zoom.yMax);
            this.axes.x.calculateBounds();
            this.axes.y.calculateBounds();
            this.interaction.updateOptions();
            this.canvas.graph.setBorder(
                this.options.border.style,
                this.options.border.color,
                this.options.border.width,
            );
            this._initLegend();
            this._plot();
        } else {
            console.error("owp.graph ERROR: Can't plot: Invalid options.");
        }
    }

    /* ********** PRIVATE ********** */

    /**
     * Create legend canvas and attach to parent dom.
     */
    private _initLegend(): void {
        const location = this.options.legend.location;
        if (location && this.options.interaction.trackMouse) {
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
                    this.canvas.legend.setSize(
                        "100%",
                        this.options.legend.size,
                    );
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
     */
    public _renderLegend(values?: GraphValues): void {
        if (!this.canvas.legend || this.options.graph.dataY.length === 0) {
            return;
        }

        const settings = this.options.legend;
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
            ? this.options.legend.offsetX + this.options.legend.padding
            : canvas.getWidth() - this.options.legend.offsetX;

        // OffsetY is disabled for top location.
        let y = isTop ? 0 : this.options.legend.offsetY;

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
                this.options.graph.colors[0],
                this.options.getName(0),
                values ? this.axes.x.formatLegendValue(values[0]) : undefined,
            );
        };

        const printY = (i: number): void => {
            printValue(
                this.options.graph.colors[i],
                this.options.getName(i),
                values ? this.axes.y.formatLegendValue(values[i]) : undefined,
            );
        };

        if (alignLeft || newLine) {
            printX();
            for (let i = 1; i <= this.options.graph.dataY.length; ++i) {
                printY(i);
            }
        } else {
            for (let i = this.options.graph.dataY.length; i >= 1; --i) {
                printY(i);
            }
            printX();
        }
    }

    /**
     * Plots/draws the graph.
     */
    public _plot(): void {
        if (this.options.debug) {
            console.time("owp.graph DEBUG: Plot time");
        }

        // If graph size has not yet been calculated. Do it.
        if (!this.hasCalculatedGraphSize) {
            this._calculateGraphSize();
        }

        // Clear plot.
        this.canvas.background.clear();
        this.canvas.graph.clear();
        this.canvas.highlight.clear();
        this.interaction.clear();

        // Render non data related features.
        this._renderTitle();
        this._renderAxesLabels();
        this._renderSpin();

        // Has bounds. Render bounds related features.
        if (this.axes.x.hasBounds() && this.axes.y.hasBounds()) {
            this._renderXAxis();
            this._renderYAxis();
            this._renderHighlight();

            // Has graph data. Render graph data.
            if (this.options.graph.dataY.length > 0) {
                this._renderLegend();
                this._renderGraph();
                this.interaction.render();
            } else if (this.options.debug) {
                console.debug(
                    "owp.graph DEBUG: No data set available. Plotting available features.",
                );
            }
        }
        // Has neither bounds or data.
        else if (this.options.debug) {
            console.debug(
                "owp.graph DEBUG: No bounds or data set available. Plotting available features.",
            );
        }

        if (this.options.debug) {
            console.timeEnd("owp.graph DEBUG: Plot time");
        }
    }

    /**
     * Render the spinner
     */
    private _renderSpin(): void {
        // Can't update options so have to remove old spinner always.
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
        // Show spinner
        if (this.options.spinner.show) {
            // Spinner div does not exist. Create it.
            if (!this.spinnerDiv) {
                this.spinnerDiv = document.createElement("div");
                this.spinnerDiv.style.position = "absolute";
                this.spinnerDiv.style.zIndex = "3";
                this.container.append(this.spinnerDiv);
                this._updateSpinnerSize();
            }
            this.spinner = new Spinner(this.options.spinner);
            this.spinner.spin(this.spinnerDiv);
        }
        // Hide spinner. Remove old div.
        else if (this.spinnerDiv) {
            this.spinnerDiv.remove();
            this.spinnerDiv = null;
        }
    }

    /**
     * Updates the position and size of the spinner div based on the graph canvas.
     */
    private _updateSpinnerSize(): void {
        if (this.spinnerDiv) {
            this.spinnerDiv.style.left = `${this.canvas.graph.getContentX()}px`;
            this.spinnerDiv.style.top = `${this.canvas.graph.getContentY()}px`;
            this.spinnerDiv.style.width = `${this.canvas.graph.getContentWidth()}px`;
            this.spinnerDiv.style.height = `${this.canvas.graph.getContentHeight()}px`;
        }
    }

    /**
     * Calculate graph canvas position and size.
     */
    public _calculateGraphSize(): void {
        const border = this.options.getBorder();
        const offsetTop = this._getOffset("top");
        const offsetBottom = this._getOffset("bottom");
        let height =
            this.canvas.background.getHeight() - offsetTop - offsetBottom;

        // Calculate new ticks for the new size.
        if (this.axes.y.hasBounds()) {
            this.axes.y.calculateTicks(height - border.top - border.bottom);
        }

        const offsetLeft = this._getOffset("left");
        let x = offsetLeft;
        let y = offsetTop;
        let width =
            this.canvas.background.getWidth() -
            offsetLeft -
            this._getOffset("right");

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
            if (this.options.legend.location.toLowerCase() === "top") {
                this.canvas.legend.setPosition(
                    x,
                    y -
                        this.canvas.legend.getHeight() -
                        this.options.legend.padding,
                );
                this.canvas.legend.setSize(width, this.options.legend.size);
            } else if (this.options.legend.location.toLowerCase() === "right") {
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
        this._updateSpinnerSize();

        this.hasCalculatedGraphSize = true;
    }

    /**
     * Renders the x-axis(ticks markers, tick labels, grid lines) on the background canvas.
     */
    private _renderXAxis(): void {
        if (!this.options.axes.x.show) {
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
     */
    private _renderYAxis(): void {
        if (!this.options.axes.y.show) {
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
     */
    private _renderAxesLabels(): void {
        // Draw X label.
        if (this.options.axes.x.show && this.options.axes.x.label.length > 0) {
            const x =
                this.canvas.graph.getContentX() +
                this.canvas.graph.getContentWidth() / 2;
            const y =
                this.canvas.background.getHeight() -
                this.options.axes.labels.offset -
                this.options.getOffset().bottom;
            this.canvas.background.text(
                this.axes.x.getAxisLabel(),
                x,
                y,
                this.axes.x.getAxisLabelFont(),
                this.options.axes.labels.color,
                "center",
                "bottom",
            );
        }
        // Draw Y label.
        if (this.options.axes.y.show && this.options.axes.y.label.length > 0) {
            const x =
                this.options.axes.labels.offset + this.options.getOffset().left;
            const y =
                this.canvas.graph.getContentY() +
                this.canvas.graph.getContentHeight() / 2;
            this.canvas.background.text(
                this.axes.y.getAxisLabel(),
                x,
                y,
                this.axes.y.getAxisLabelFont(),
                this.options.axes.labels.color,
                "center",
                "hanging",
                -90,
            );
        }
    }

    /**
     * Renders the graph title on the background canvas.
     */
    private _renderTitle(): void {
        if (this.options.title.label.length === 0) {
            return;
        }
        let x = 0;
        if (this.options.title.align.toLowerCase() === "left") {
            x =
                this.canvas.graph.getContentX() +
                this.options.title.offsetX +
                this.options.getOffset().left;
        } else if (this.options.title.align.toLowerCase() === "center") {
            x =
                this.canvas.graph.getContentX() +
                this.canvas.graph.getContentWidth() / 2 +
                this.options.title.offsetX;
        } else if (this.options.title.align.toLowerCase() === "right") {
            x =
                this.canvas.graph.getContentX() +
                this.canvas.graph.getContentWidth() -
                this.options.title.offsetX -
                this.options.getOffset().right;
        }
        const y = this.options.title.offsetY + this.options.getOffset().top;
        const font = `${
            (this.options.title.bold ? "bold " : "") + this.options.title.size
        }px ${this.options.title.font}`;
        this.canvas.background.text(
            this.options.title.label,
            x,
            y,
            font,
            this.options.title.color,
            this.options.title.align,
            "top",
        );
    }

    /**
     * Renders the highligted area on the highligh canvas.
     */
    private _renderHighlight(): void {
        this.canvas.highlight.clear();
        const h = this.options.highlight;
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
     */
    public _renderGraph(): void {
        if (this.options.debug && this.options.graph.smoothing > 1) {
            console.debug(
                `owp.graph DEBUG: Smoothed rendering: ${this.options.graph.smoothing}`,
            );
        }
        if (this.options.debug && this.options.renderSimplify()) {
            console.debug(
                `owp.graph DEBUG: Simplify rendering: ${this.options.graph.simplify} ${this.options.graph.simplifyBy}`,
            );
        }
        // Clear old data so we can draw new.
        this.canvas.graph.clear();
        // Get canvas and set properties.
        const ctx = this.canvas.graph.getContext();
        ctx.lineWidth = this.options.graph.lineWidth;
        ctx.globalCompositeOperation = this.options.graph.compositeOperation;
        // Get render callback based on options
        const renderCallback = getRenderCallback(
            this.options,
            this.canvas.graph,
            this.axes,
        );
        // Render each data set.
        for (let i = 0; i < this.options.graph.dataY.length; ++i) {
            renderCallback(i);
        }
    }

    /**
     * Get offset for the given paramters.
     */
    private _getOffset(side: OffsetSide): number {
        let offset = 0;
        switch (side) {
            case "top":
                if (this.options.title.label.length > 0) {
                    offset += this.options.title.size;
                    offset += this.options.title.offsetY;
                    offset += this.options.title.padding;
                }
                if (
                    this.canvas.legend &&
                    this.options.legend.location.toLowerCase() === "top"
                ) {
                    offset += this.canvas.legend.getHeight();
                    offset += this.options.legend.offsetY;
                    offset += this.options.legend.padding;
                } else if (
                    this.options.axes.y.show &&
                    this.options.axes.tickLabels.show
                ) {
                    offset += this.options.axes.tickLabels.size / 2;
                }
                offset += this.options.getOffset().top;
                break;
            case "bottom":
                if (this.options.axes.x.show) {
                    if (this.options.axes.x.label.length > 0) {
                        offset += this.options.axes.labels.size;
                        offset += this.options.axes.labels.offset;
                        offset += this.options.axes.labels.padding;
                    }
                    if (this.options.axes.x.height) {
                        offset += this.options.axes.x.height;
                    } else {
                        if (this.options.axes.tickLabels.show) {
                            offset += this.options.axes.tickLabels.size;
                            offset += this.options.axes.tickLabels.offset;
                            offset += this.options.axes.tickLabels.padding;
                        }
                        if (this.options.axes.tickMarkers.show) {
                            offset += this.options.axes.tickMarkers.length;
                            offset += this.options.axes.tickMarkers.offset;
                        }
                    }
                } else if (
                    this.options.axes.y.show &&
                    this.options.axes.tickLabels.show
                ) {
                    offset += this.options.axes.tickLabels.size / 2;
                }
                offset += this.options.getOffset().bottom;
                break;
            case "left":
                if (this.options.axes.y.show) {
                    if (this.options.axes.y.label.length > 0) {
                        offset += this.options.axes.labels.size;
                        offset += this.options.axes.labels.offset;
                        offset += this.options.axes.labels.padding;
                    }
                    if (this.options.axes.y.width) {
                        offset += this.options.axes.y.width;
                    } else {
                        if (this.options.axes.tickLabels.show) {
                            offset += this.axes.y.getLabelWidth();
                            offset += this.options.axes.tickLabels.offset;
                            offset += this.options.axes.tickLabels.padding;
                        }
                        if (this.options.axes.tickMarkers.show) {
                            offset += this.options.axes.tickMarkers.length;
                            offset += this.options.axes.tickMarkers.offset;
                        }
                    }
                } else if (
                    this.options.axes.x.show &&
                    this.options.axes.tickLabels.show
                ) {
                    offset += this.axes.x.getBoundLabelWidth("min", true);
                }
                offset += this.options.getOffset().left;
                break;
            case "right":
                if (
                    this.canvas.legend &&
                    this.options.legend.location.toLowerCase() === "right"
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
