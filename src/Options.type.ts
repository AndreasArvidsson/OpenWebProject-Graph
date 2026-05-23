import type { SpinnerOptions as SpinJSSpinnerOptions } from "spin.js";

export type GraphDataArray =
    | number[]
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array;

export type FormatterCallback = (
    value: number,
    defaultFormatter?: (value: number) => string | number,
) => string | number;
export type TickerValueFormatter = (value: number) => number;
export type TickerCallback = (
    isLog: boolean,
    minValue: number,
    maxValue: number,
    graphSize: number,
    labelSize: number,
) => Tick[];

export type TitleAlignment = "left" | "center" | "right";
export type LegendAlignment = "left" | "right";
export type SimplifyMode = "avg" | "min" | "max" | "minMax";

export interface Offset {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface Tick {
    value: number;
    label?: string;
    coordinate?: number;
}

export interface InteractionOptions {
    resize: boolean;
    trackMouse: boolean;
    zoom: boolean;
    smoothing: boolean;
}

export interface TitleOptions {
    label: string;
    bold: boolean;
    size: number;
    offsetX: number;
    offsetY: number;
    padding: number;
    font: string;
    color: string;
    align: TitleAlignment;
}

export interface LegendOptions {
    location: string;
    font: string;
    size: number;
    offsetX: number;
    offsetY: number;
    padding: number;
    align: LegendAlignment;
    newLine: boolean;
}

export interface ValueRange {
    min: number | null;
    max: number | null;
}

export interface HighlightOptions {
    xMin: number | null;
    xMax: number | null;
    yMin: number | null;
    yMax: number | null;
    color: string;
}

export interface ZoomOptions {
    xMin: number | null;
    xMax: number | null;
    yMin: number | null;
    yMax: number | null;
}

export interface GraphOptions {
    dataX: GraphDataArray[];
    dataY: GraphDataArray[];
    colors: string[];
    names: string[];
    dashed: (boolean | number[])[];
    lineWidth: number;
    markerRadius: number;
    smoothing: number;
    simplify: number;
    simplifyBy: SimplifyMode;
    fill: boolean;
    compositeOperation: GlobalCompositeOperation;
}

export interface TickMarkerOptions {
    show: boolean;
    length: number;
    width: number;
    offset: number;
    color: string;
}

export interface TickLabelOptions {
    show: boolean;
    color: string;
    font: string;
    size: number;
    width: number;
    offset: number;
    padding: number;
}

export interface AxisLabelOptions {
    color: string;
    font: string;
    size: number;
    offset: number;
    padding: number;
}

export interface GridOptions {
    width: number;
    color: string;
}

export interface AxisOptionsBase {
    show: boolean;
    inverted: boolean;
    log: boolean;
    label: string;
    numTicks: number;
    legendValueFormatter: FormatterCallback | null;
    tickerValuePreFormatter: TickerValueFormatter | null;
    tickerValuePostFormatter: TickerValueFormatter | null;
    tickerLabelFormatter: FormatterCallback | null;
    ticker: TickerCallback | null;
    grid: GridOptions;
    bounds: ValueRange;
}

export interface AxisXOptions extends AxisOptionsBase {
    height: number;
}

export interface AxisYOptions extends AxisOptionsBase {
    width: number;
}

export interface AxesOptions {
    tickMarkers: TickMarkerOptions;
    tickLabels: TickLabelOptions;
    labels: AxisLabelOptions;
    x: AxisXOptions;
    y: AxisYOptions;
}

export interface BorderOptions {
    style: string;
    color: string;
    width: string;
}

export interface SpinnerOptions extends Required<SpinJSSpinnerOptions> {
    show: boolean;
}

export interface FullOptions {
    debug: boolean;
    offset: number | string;
    interaction: InteractionOptions;
    title: TitleOptions;
    legend: LegendOptions;
    highlight: HighlightOptions;
    zoom: ZoomOptions;
    graph: GraphOptions;
    axes: AxesOptions;
    border: BorderOptions;
    spinner: SpinnerOptions;
}

export type PartialOptions = DeepPartial<FullOptions>;

type DeepPartial<T> = T extends (...args: unknown[]) => unknown
    ? T
    : T extends GraphDataArray
      ? T
      : T extends (infer U)[]
        ? DeepPartial<U>[]
        : T extends object
          ? { [P in keyof T]?: DeepPartial<T[P]> }
          : T;
