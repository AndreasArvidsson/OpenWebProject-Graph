import type {
    AxesOptions,
    BorderOptions,
    GraphOptions,
    HighlightOptions,
    InteractionOptions,
    LegendOptions,
    Offset,
    OptionsInput,
    OptionsObject,
    SpinnerOptions,
    TitleOptions,
    ZoomOptions,
} from "./Options.type.js";
import { evalOptions } from "./OptionsEval.js";
import { calculateOffset } from "./util/calculateOffset.js";
import { getDefaultOptions } from "./util/getDefaultOptions.js";
import { objectDeepAssign } from "./util/objectDeepAssign.js";

/**
 * The Options class is the options and associated functions for the Graph class.
 * See setDefault() for a desciption of the possible option parameters.
 */
export class Options implements OptionsObject {
    declare private _border: Offset;
    declare private _isOk: boolean;
    declare private _offset: Offset;
    declare public axes: AxesOptions;
    declare public border: BorderOptions;
    declare public debug: boolean;
    declare public graph: GraphOptions;
    declare public highlight: HighlightOptions;
    declare public interaction: InteractionOptions;
    declare public legend: LegendOptions;
    declare public offset: number | string;
    declare public spinner: SpinnerOptions;
    declare public title: TitleOptions;
    declare public zoom: ZoomOptions;

    public constructor(options?: OptionsInput) {
        this.setDefault();
        if (options != null) {
            this.set(options);
        }
    }

    /**
     * Check if the options are ok / valid.
     */
    public isOk(): boolean {
        return this._isOk;
    }

    /**
     * Get color for a data set.  Index = 0 is X axis.
     */
    public getColor(index: number): string {
        return this.graph.colors[index] ?? "#000000";
    }

    /**
     * Get name for a data set. Index = 0 is X axis.
     */
    public getName(index: number): string {
        if (index < this.graph.names.length) {
            return this.graph.names[index];
        }
        if (index === 0) {
            return "X";
        }
        return `DATA: ${index}`;
    }

    /**
     * Get the font(family and size) for the legend label.
     */
    public getLegendFont(): string {
        return `${this.legend.size}px ${this.legend.font}`;
    }

    public set(options: OptionsInput): void {
        objectDeepAssign(this, options);

        this._isOk = evalOptions(this);
        this._offset = calculateOffset(this.offset);
        this._border = calculateOffset(this.border.width);
    }

    /**
     * Sets all options to their default values.
     */
    public setDefault(): void {
        Object.assign(this, getDefaultOptions());
        this._isOk = true;
    }

    /**
     * Returns true if markers are to be rendered.
     */
    public renderMarkers(): boolean {
        // Can't combine markers with filled lines.
        return (
            this.graph.markerRadius > 0 &&
            (!this.graph.fill || this.graph.lineWidth === 0)
        );
    }

    /**
     * Returns true if simplify algorithm is to be used.
     */
    public renderSimplify(): boolean {
        // Can't combined simplified rendering with markers.
        return this.graph.simplify > 0 && !this.renderMarkers();
    }

    /**
     * Returns object with all 4 side offsets
     */
    public getOffset(): Offset {
        return this._offset;
    }

    /**
     * Returns object with all 4 side borders
     */
    public getBorder(): Offset {
        return this._border;
    }
}
