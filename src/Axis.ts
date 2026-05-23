import type { Canvas } from "./Canvas.js";
import type { Options } from "./Options.js";
import type { AxisXOptions, AxisYOptions, Tick } from "./Options.type.js";
import { getTextWidth } from "./util/getTextWidth.js";
import { round } from "./util/round.js";

interface Bounds {
    min: number;
    max: number;
}

type ValueToPixelCallback = (value: number) => number;

interface AxisTickList extends Array<Tick> {
    markers?: {
        offset: number;
        length: number;
        width: number;
        color: string;
    };
    labels?: {
        offset: number;
        padding: number;
        size: number;
        color: string;
        font: string;
        width: number[];
        maxWidth: number;
    };
    grid?: {
        width: number;
        color: string;
    };
}

/**
 * The Axis class is a single axis to the Graph class.
 */
export class Axis {
    private readonly getRatio: () => number;
    private readonly getSize: () => number;
    private readonly isX: boolean;
    private readonly options: Options;
    private max?: number;
    private min?: number;
    private overrideMax?: number | null;
    private overrideMin?: number | null;
    private ticks?: AxisTickList;

    public constructor(options: Options, graphCanvas: Canvas, isX: boolean) {
        this.options = options;
        this.isX = isX;
        this.getSize = isX
            ? graphCanvas.getContentWidth.bind(graphCanvas)
            : graphCanvas.getContentHeight.bind(graphCanvas);
        this.getRatio = graphCanvas.getRatio.bind(graphCanvas);
    }

    private get axis(): AxisXOptions | AxisYOptions {
        return this.isX
            ? this.options.options.axes.x
            : this.options.options.axes.y;
    }

    /**
     * Returns true if all bounds are set.
     */
    public hasBounds(): boolean {
        return this.min != null && this.max != null;
    }

    /**
     * True of this axis is logarithmic.
     */
    public isLog(): boolean {
        return this.axis.log;
    }

    /**
     * True of this axis is inverted.
     */
    public isInverted(): boolean {
        return this.axis.inverted;
    }

    /**
     * Get min bounds.
     */
    public getMin(): number {
        // Always prioritize override bounds.
        const value = this.overrideMin ?? this.min;
        if (value == null) {
            throw new Error(
                `owp.graph ERROR: Axis ${this.isX ? "X" : "Y"}. Min bound is not set.`,
            );
        }
        return value;
    }

    /**
     * Get max bounds.
     */
    public getMax(): number {
        // Always prioritize override bounds.
        const value = this.overrideMax ?? this.max;
        if (value == null) {
            throw new Error(
                `owp.graph ERROR: Axis ${this.isX ? "X" : "Y"}. Max bound is not set.`,
            );
        }
        return value;
    }

    /**
     * Get the axis label. Uses the options value formatter if set.
     */
    public getAxisLabel(): string {
        return this.axis.label;
    }

    /**
     * Get the font(family and size) for the tick labels.
     */
    public getTickLabelsFont(): string {
        return `${this.options.options.axes.tickLabels.size}px ${
            this.options.options.axes.tickLabels.font
        }`;
    }

    /**
     * Get the font(family and size) for the axes labels.
     */
    public getAxisLabelFont(): string {
        return `${this.options.options.axes.labels.size}px ${
            this.options.options.axes.labels.font
        }`;
    }

    /**
     * Get max width for labels.
     */
    public getLabelWidth(): number {
        return this.ticks?.labels?.maxWidth ?? 0;
    }

    public getBoundLabelWidth(
        bound: "min" | "max",
        includePadding?: boolean,
    ): number {
        if (!this.ticks?.labels || this.ticks.length === 0) {
            return 0;
        }
        const index = bound === "min" ? 0 : this.ticks.length - 1;
        const padding = includePadding
            ? this.ticks.labels.offset + this.ticks.labels.padding
            : 0;
        return (this.ticks.labels.width[index] ?? 0) + padding;
    }

    /**
     * Get the ticks array.
     */
    public getTicks(): AxisTickList {
        return this.ticks ?? [];
    }

    /**
     * Return true if this axis has overridden bounds.
     */
    public hasZoom(): boolean {
        return this.overrideMin != null || this.overrideMax != null;
    }

    /**
     * Override bounds. Temporary override user given bounds.
     */
    public zoom(min?: number | null, max?: number | null): void {
        this.overrideMin = min;
        this.overrideMax = max;
        if (this.hasBounds()) {
            this.calculateTicks();
        }
    }

    /**
     * Remove overridden bounds.
     */
    public clearZoom(): void {
        this.zoom();
    }

    /**
     * Calculates bounds. Uses user given option bounds first and calculates mising from data set.
     */
    public calculateBounds(): void {
        let newMin: number | undefined;
        let newMax: number | undefined;

        // Prioritize user given bounds.
        if (this.axis.bounds.min != null) {
            newMin = this.axis.bounds.min;
        }
        if (this.axis.bounds.max != null) {
            newMax = this.axis.bounds.max;
        }

        // Both bounds are not set by the user. Calculate missing.
        if (newMin == null || newMax == null) {
            const calcBounds = this.isX
                ? this.calculateXBounds()
                : this.calculateYBounds();

            if (calcBounds) {
                // Use both calculated bounds.
                if (newMin == null && newMax == null) {
                    newMin = calcBounds.min;
                    newMax = calcBounds.max;
                    // Both values are calculated. Move both.
                    if (newMin === newMax) {
                        console.warn(
                            `owp.graph WARNING: Axis ${this.isX ? "X" : "Y"}. bounds.min and bounds.max are equal. Move both.`,
                        );
                        --newMin;
                        ++newMax;
                    }
                }
                // Use only calculated min.
                else if (newMin == null && newMax != null) {
                    newMin = calcBounds.min;
                    // Only move the calculated value.
                    if (newMin >= newMax) {
                        console.warn(
                            `owp.graph WARNING: Axis ${this.isX ? "X" : "Y"}. bounds.min and bounds.max are equal. Move min.`,
                        );
                        newMin = newMax - 1;
                    }
                }
                // Use only calculated max.
                else if (newMax == null && newMin != null) {
                    newMax = calcBounds.max;
                    if (newMin >= newMax) {
                        console.warn(
                            `owp.graph WARNING: Axis ${this.isX ? "X" : "Y"}. bounds.min and bounds.max are equal. Move max.`,
                        );
                        newMax = newMin + 1;
                    }
                }
            }
        }

        if (newMin != null && newMax != null) {
            if (this.axis.log && newMin <= 0) {
                console.error(
                    `owp.graph ERROR: Axis ${this.isX ? "X" : "Y"}. When axis is logarithmic all bounds must be greater than zero.`,
                );
                return;
            }
            this.min = newMin;
            this.max = newMax;
        }
    }

    /**
     * Calculate graph axes ticks.
     */
    public calculateTicks(size?: number): void {
        const opts = this.options.options;
        size ??= this.getSize();

        const labelSize = this.isX
            ? opts.axes.tickLabels.width
            : opts.axes.tickLabels.size;
        // Create ticks with user given options ticker.
        const ticks = (
            this.axis.ticker != null
                ? this.axis.ticker(
                      this.axis.log,
                      this.getMin(),
                      this.getMax(),
                      size,
                      labelSize,
                  )
                : this.getDefaultTicks(
                      this.axis.log,
                      this.getMin(),
                      this.getMax(),
                      size,
                      labelSize,
                  )
        ) as AxisTickList;

        if (ticks.length === 0) {
            console.warn(
                `owp.graph WARNING: Axis ${
                    this.isX ? "X" : "Y"
                }. Ticks list is empty.`,
            );
        }

        // Update ticks with pixel coordinates.
        for (const tick of ticks) {
            tick.coordinate = this.valueToPixel(tick.value, size);
        }
        // Show tick markers.
        if (opts.axes.tickMarkers.show) {
            ticks.markers = {
                offset: opts.axes.tickMarkers.offset,
                length: opts.axes.tickMarkers.length,
                width: opts.axes.tickMarkers.width,
                color: opts.axes.tickMarkers.color,
            };
        }
        // Show tick labels.
        if (opts.axes.tickLabels.show) {
            ticks.labels = {
                offset: opts.axes.tickLabels.offset,
                padding: opts.axes.tickLabels.padding,
                size: opts.axes.tickLabels.size,
                color: opts.axes.tickLabels.color,
                font: this.getTickLabelsFont(),
                width: [],
                maxWidth: 0,
            };
            for (let i = 0; i < ticks.length; ++i) {
                const width = getTextWidth(
                    ticks[i].label ?? "",
                    this.getTickLabelsFont(),
                );
                ticks.labels.width[i] = width;
                ticks.labels.maxWidth = Math.max(ticks.labels.maxWidth, width);
            }
        }
        // Show grid.
        if (this.axis.grid.width) {
            ticks.grid = {
                width: this.axis.grid.width,
                color: this.axis.grid.color,
            };
        }
        this.ticks = ticks;
    }

    /**
     * Get value from given pixel coordinate.
     */
    public pixelToValue(pixel: number): number {
        // Logarithmic
        if (this.axis.log) {
            // Logarithmic inverted orientation.
            if (this.isX ? this.axis.inverted : !this.axis.inverted) {
                return (
                    10 **
                    ((pixel / this.getSize()) *
                        Math.log10(this.getMin() / this.getMax()) +
                        Math.log10(this.getMax()))
                );
            }
            // Logarithmic normal orientation.
            return (
                10 **
                ((pixel / this.getSize()) *
                    Math.log10(this.getMax() / this.getMin()) +
                    Math.log10(this.getMin()))
            );
        }
        // Linear inverted orientation.
        if (this.isX ? this.axis.inverted : !this.axis.inverted) {
            return (
                (pixel / this.getSize()) * (this.getMin() - this.getMax()) +
                this.getMax()
            );
        }
        // Linear normal orientation.
        return (
            (pixel / this.getSize()) * (this.getMax() - this.getMin()) +
            this.getMin()
        );
    }

    /**
     * Get pixel coordinate from given value.
     */
    public valueToPixel(value: number, size?: number): number {
        const pixelSize = size ?? this.getSize();
        // Logarithmic
        if (this.axis.log) {
            // Logarithmic inverted orientation.
            if (this.isX ? this.axis.inverted : !this.axis.inverted) {
                return (
                    (Math.log10(value / this.getMax()) /
                        Math.log10(this.getMin() / this.getMax())) *
                    pixelSize
                );
            }
            // Logarithmic normal orientation.
            return (
                (Math.log10(value / this.getMin()) /
                    Math.log10(this.getMax() / this.getMin())) *
                pixelSize
            );
        }
        // Linear inverted orientation.
        if (this.isX ? this.axis.inverted : !this.axis.inverted) {
            return (
                ((value - this.getMax()) / (this.getMin() - this.getMax())) *
                pixelSize
            );
        }
        // Linear normal orientation.
        return (
            ((value - this.getMin()) / (this.getMax() - this.getMin())) *
            pixelSize
        );
    }

    /**
     * Format the given value. Uses value formatter in options if available.
     */
    public formatLegendValue(value: number): string | number {
        // Use user given formatter.
        if (this.axis.legendValueFormatter) {
            return this.axis.legendValueFormatter(
                value,
                defaultLegendValueFormatter,
            );
        }
        // Use default value formatter.
        return defaultLegendValueFormatter(value);
    }

    /**
     * Get a callback to calculate the pixel coordinate for a given value.
     * Used by the graph render function to improve performance.
     */
    public getValueToPixelCallback(): ValueToPixelCallback {
        let num;
        let denom: number | string;
        let numVar;
        let numOp;
        let logFunc;
        const size = this.getSize() * this.getRatio();

        // Inverted X or normal Y.
        if (this.isX ? this.axis.inverted : !this.axis.inverted) {
            numVar = this.getMax();
            denom = this.axis.log
                ? Math.log10(this.getMin() / this.getMax())
                : this.getMin() - this.getMax();
        }
        // Normal X or inverted Y.
        else {
            numVar = this.getMin();
            denom = this.axis.log
                ? Math.log10(this.getMax() / this.getMin())
                : this.getMax() - this.getMin();
        }

        // Axis is logarithmic.
        if (this.axis.log) {
            numOp = "/";
            logFunc = "Math.log10";
        }
        // Axis is linear.
        else {
            numOp = "-";
            logFunc = "";
        }

        // Only do the numerator operation on the numerator if the variable is not zero.
        if (numVar !== 0) {
            num = `${logFunc}(value ${numOp} ${numVar})`;
        } else {
            num = `${logFunc}(value)`;
        }

        // Only do the fraction if the denominator is not 1.
        if (denom !== 1) {
            denom = `/ ${denom}`;
        } else {
            denom = "";
        }

        // oxlint-disable-next-line no-new-func, typescript/no-implied-eval, typescript/no-unsafe-type-assertion
        return new Function(
            "value",
            `return ${num} ${denom} * ${size}`,
        ) as ValueToPixelCallback;
    }

    /**
     * Calculate X-axis bounds.
     */
    private calculateXBounds(): Bounds | null {
        const opts = this.options.options;
        // Calculate missing X-axis bounds from dataX values.
        if (opts.graph.dataX.length > 0) {
            if (opts.debug) {
                console.debug(
                    "owp.graph DEBUG: X-bounds not set, but X-data is. Calculate X-bounds from X-data values.",
                );
            }
            let min = Number.MAX_SAFE_INTEGER;
            let max = Number.MIN_SAFE_INTEGER;
            for (const data of opts.graph.dataX) {
                min = Math.min(min, data[0], data[data.length - 1]);
                max = Math.max(max, data[0], data[data.length - 1]);
            }
            return { min, max };
        }
        // Calculate X-axis bounds from dataY length.
        if (opts.graph.dataY.length > 0) {
            if (opts.debug) {
                console.debug(
                    "owp.graph DEBUG: X-bounds and X-data not set, but Y-data is. Calculate X-bounds from Y-data length.",
                );
            }
            let max = 0;
            for (const data of opts.graph.dataY) {
                max = Math.max(max, data.length);
            }
            return { min: 1, max };
        }
        if (opts.debug) {
            console.debug(
                "owp.graph DEBUG: X-bounds, X-data and Y-data not set. Can't calculate X-bounds.",
            );
        }
        return null;
    }

    /**
     * Calculate Y-axis bounds.
     */
    private calculateYBounds(): Bounds | null {
        const opts = this.options.options;
        // Calculate Y-axis bounds from dataY values.
        if (opts.graph.dataY.length > 0) {
            if (opts.debug) {
                console.debug(
                    "owp.graph DEBUG: Y-bounds not set, but Y-data is. Calculate Y-bounds from Y-data values.",
                );
            }
            let min: number | null = null;
            let max: number | null = null;
            for (const data of opts.graph.dataY) {
                if (data.length === 0) {
                    continue;
                }
                if (min == null || max == null) {
                    min = Number.MAX_SAFE_INTEGER;
                    max = Number.MIN_SAFE_INTEGER;
                }
                for (const d of data) {
                    min = Math.min(min, d);
                    max = Math.max(max, d);
                }
            }
            return min != null && max != null ? { min, max } : null;
        }
        if (opts.debug) {
            console.debug(
                "owp.graph DEBUG: Y-bounds and Y-data not set. Can't calculate Y-bounds.",
            );
        }
        return null;
    }

    /**
     * Default get ticks funciton. Used when no ticker is set in options.
     */
    private getDefaultTicks(
        isLog: boolean,
        minValue: number,
        maxValue: number,
        graphSize: number,
        labelSize: number,
    ): Tick[] {
        // Pre-format ticker values.
        if (this.axis.tickerValuePreFormatter != null) {
            minValue = this.axis.tickerValuePreFormatter(minValue);
            maxValue = this.axis.tickerValuePreFormatter(maxValue);
        }

        let ticks: Tick[];

        // If the range is to small even a log axis will get linear values.
        if (isLog && maxValue - minValue >= 4 * minValue) {
            ticks = getDefaultLogTicks(minValue, maxValue);
        } else {
            // Max number of ticks.
            const numTicks =
                this.axis.numTicks || graphSize / (labelSize * 1.5);
            ticks = getDefaultLinTicks(minValue, maxValue, numTicks);
        }

        // Post-format ticker values.
        if (this.axis.tickerValuePostFormatter != null) {
            for (const tick of ticks) {
                tick.value = this.axis.tickerValuePostFormatter(tick.value);
            }
        }

        // Add user formatted labels.
        if (this.axis.tickerLabelFormatter != null) {
            for (const tick of ticks) {
                tick.label = this.axis
                    .tickerLabelFormatter(
                        tick.value,
                        defaultTickerLabelFormatter,
                    )
                    .toString();
            }
        }
        // Add default formatted labels.
        else {
            for (const tick of ticks) {
                tick.label = defaultTickerLabelFormatter(tick.value);
            }
        }

        return ticks;
    }
}

function defaultLegendValueFormatter(value: number): number {
    return round(value, 5);
}

function defaultTickerLabelFormatter(value: number): string {
    if (value < 0) {
        return `-${defaultTickerLabelFormatter(-value)}`;
    }
    let ranges: { divider: number; suffix: string }[] = [];
    if (value >= 1e3) {
        ranges = [
            { divider: 1e24, suffix: "Y" },
            { divider: 1e21, suffix: "Z" },
            { divider: 1e18, suffix: "E" },
            { divider: 1e15, suffix: "P" },
            { divider: 1e12, suffix: "T" },
            { divider: 1e9, suffix: "G" },
            { divider: 1e6, suffix: "M" },
            { divider: 1e3, suffix: "k" },
        ];
    } else if (value < 1e-2) {
        ranges = [
            { divider: 1e-3, suffix: "m" },
            { divider: 1e-6, suffix: "µ" },
            { divider: 1e-9, suffix: "n" },
            { divider: 1e-12, suffix: "p" },
            { divider: 1e-15, suffix: "f" },
            { divider: 1e-18, suffix: "a" },
            { divider: 1e-21, suffix: "z" },
            { divider: 1e-24, suffix: "y" },
        ];
    }
    for (const range of ranges) {
        if (value >= range.divider) {
            return round(value / range.divider, 3).toString() + range.suffix;
        }
    }
    return round(value, 3).toString();
}

// Get linear ticks.
function getDefaultLinTicks(
    minValue: number,
    maxValue: number,
    numTicks: number,
): Tick[] {
    // Value range
    const range = maxValue - minValue;
    // Get ticker value step.
    const step = getStepValue(false, range / numTicks);

    // Calculate start pos.
    let start = minValue;
    // Make sure start is on a step position.
    const diff = modf(start, step);
    if (diff > 0) {
        start += step - diff;
    }
    if (diff < 0) {
        start -= diff;
    }

    // Start and end value is the same. Just return the one value.
    if (secureFloat(start) === secureFloat(maxValue)) {
        return [{ value: secureFloat(start) }];
    }

    const ticks = [];
    for (; start <= maxValue; start += step) {
        const value = secureFloat(start);
        ticks.push({ value });
        // Reached infinite loop.
        if (start === value + step) {
            break;
        }
        start = value;
    }
    return ticks;
}

// Get logarithmic ticks.
function getDefaultLogTicks(minValue: number, maxValue: number): Tick[] {
    const ticks: Tick[] = [];
    let step = getStepValue(true, minValue);
    // Make sure we always start at or before min value to get all the low end ticks.
    if (step > minValue) {
        step /= 10;
    }
    for (;;) {
        for (let i = 1; i < 10; ++i) {
            const value = i * step;
            if (value > maxValue) {
                return ticks;
            }
            if (value >= minValue) {
                ticks.push({ value: secureFloat(value) });
            }
        }
        step *= 10;
    }
}

// For a given value calculate the best step value.
function getStepValue(isLog: boolean, value: number): number {
    const multipliers = isLog ? [1, 10] : [1, 2, 5, 10];
    const exp = 10 ** Math.floor(Math.log10(value));
    for (const multiplier of multipliers) {
        const newValue = multiplier * exp;
        if (newValue >= value) {
            return newValue;
        }
    }
    return multipliers[multipliers.length - 1] * exp;
}

/**
 * Secure float precision.
 */
function secureFloat(val: number): number {
    return Number.parseFloat(val.toPrecision(15));
}

/**
 * Modulus for float.
 */
function modf(a: number, b: number): number {
    return a - Math.round(a / b) * b;
}
