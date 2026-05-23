import type { Offset, PartialOptions, FullOptions } from "./Options.type.js";
import { evalOptions } from "./OptionsEval.js";
import { calculateOffset } from "./util/calculateOffset.js";
import { getDefaultOptions } from "./util/getDefaultOptions.js";
import { objectDeepAssign } from "./util/objectDeepAssign.js";

/**
 * The Options class is the options and associated functions for the Graph class.
 * See setDefault() for a desciption of the possible option parameters.
 */
export class Options {
    private border!: Offset;
    private isValid!: boolean;
    private offset!: Offset;
    public options!: FullOptions;

    public constructor(options?: PartialOptions) {
        this.set(options);
    }

    /**
     * Check if the options are ok / valid.
     */
    public isOk(): boolean {
        return this.isValid;
    }

    /**
     * Get color for a data set.  Index = 0 is X axis.
     */
    public getColor(index: number): string {
        return this.options.graph.colors[index] ?? "#000000";
    }

    /**
     * Get name for a data set. Index = 0 is X axis.
     */
    public getName(index: number): string {
        if (index < this.options.graph.names.length) {
            return this.options.graph.names[index];
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
        return `${this.options.legend.size}px ${this.options.legend.font}`;
    }

    public set(options?: PartialOptions): void {
        this.options = getDefaultOptions();
        this.isValid = true;
        if (options != null) {
            objectDeepAssign(this.options, options);
            this.isValid = evalOptions(this.options);
        }
        this.offset = calculateOffset(this.options.offset);
        this.border = calculateOffset(this.options.border.width);
    }

    /**
     * Returns true if markers are to be rendered.
     */
    public renderMarkers(): boolean {
        // Can't combine markers with filled lines.
        return (
            this.options.graph.markerRadius > 0 &&
            (!this.options.graph.fill || this.options.graph.lineWidth === 0)
        );
    }

    /**
     * Returns true if simplify algorithm is to be used.
     */
    public renderSimplify(): boolean {
        // Can't combined simplified rendering with markers.
        return this.options.graph.simplify > 0 && !this.renderMarkers();
    }

    /**
     * Returns object with all 4 side offsets
     */
    public getOffset(): Offset {
        return this.offset;
    }

    /**
     * Returns object with all 4 side borders
     */
    public getBorder(): Offset {
        return this.border;
    }
}
