import type { FullOptions } from "./Options.type.js";
import type { ValueTypes } from "./util/Is.js";
import { isAlignment, isContent, isOfType } from "./util/Is.js";

/**
 * Evaluates the options and sets ok status flag.
 */
export function evalOptions(options: FullOptions): boolean {
    let optionsOk = true;

    function error(path: string, msg: string, value?: unknown): void {
        const parts = [`owp.graph ERROR: invalid option. ${path}`];
        if (value != null) {
            parts.push(JSON.stringify(value));
        }
        parts.push(msg);
        console.error(parts.join(" | "));
        optionsOk = false;
    }

    function evalType(type: ValueTypes, path: string, value: unknown): boolean {
        const res = isOfType(value, type);
        if (!res) {
            error(path, `is not of type: ${type}`, value);
        }
        return res;
    }

    function evalEnum(values: string[], path: string, value: string): boolean {
        const res = values.includes(value);
        if (!res) {
            error(path, `is not of any type: [${values.join(", ")}].`, value);
        }
        return res;
    }

    function evalArrayContains(
        path: string,
        value: unknown[],
        type: ValueTypes,
    ): boolean {
        const res = isContent(value, type);
        if (!res) {
            error(path, `contains object type other than: ${type}.`, value);
        }
        return res;
    }

    function evalAlign(
        path: string,
        value: string,
        noCenter?: boolean,
    ): boolean {
        const res = isAlignment(value, noCenter);
        if (!res) {
            error(path, "is not an valid alignment.", value);
        }
        return res;
    }

    function evalCond(
        path: string,
        value: unknown,
        cond: string,
        res: boolean,
    ): boolean {
        if (!res) {
            error(path, `failed condition: ${cond}`, value);
        }
        return res;
    }

    evalType("bool", "debug", options.debug);
    evalType("int|offset", "offset", options.offset);

    if (evalType("object", "interaction", options.interaction)) {
        evalType("bool", "interaction.resize", options.interaction.resize);
        evalType(
            "bool",
            "interaction.trackMouse",
            options.interaction.trackMouse,
        );
        evalType("bool", "interaction.zoom", options.interaction.zoom);
        evalType(
            "bool",
            "interaction.smoothing",
            options.interaction.smoothing,
        );
    }

    if (evalType("object", "title", options.title)) {
        evalType("bool", "title.bold", options.title.bold);
        evalType("string", "title.label", options.title.label);
        if (evalType("int", "title.size", options.title.size)) {
            evalCond(
                "title.size",
                options.title.size,
                "> 0",
                options.title.size > 0,
            );
        }
        evalType("int", "title.offsetX", options.title.offsetX);
        evalType("int", "title.offsetY", options.title.offsetY);
        if (evalType("int", "title.padding", options.title.padding)) {
            evalCond(
                "title.padding",
                options.title.padding,
                ">= 0",
                options.title.padding >= 0,
            );
        }
        evalType("font", "title.font", options.title.font);
        evalType("color", "title.color", options.title.color);
        evalAlign("title.align", options.title.align);
    }

    if (evalType("object", "legend", options.legend)) {
        evalType("string", "legend.location", options.legend.location);
        evalType("font", "legend.font", options.legend.font);
        if (evalType("int", "legend.size", options.legend.size)) {
            evalCond(
                "legend.size",
                options.legend.size,
                "> 0",
                options.legend.size > 0,
            );
        }
        evalType("int", "legend.offsetX", options.legend.offsetX);
        evalType("int", "legend.offsetY", options.legend.offsetY);
        if (evalType("int", "legend.padding", options.legend.padding)) {
            evalCond(
                "legend.padding",
                options.legend.padding,
                ">= 0",
                options.legend.padding >= 0,
            );
        }
        evalAlign("legend.align", options.legend.align, true);
        evalType("bool", "legend.newLine", options.legend.newLine);
    }

    if (evalType("object", "highlight", options.highlight)) {
        evalType("number|null", "highlight.xMin", options.highlight.xMin);
        evalType("number|null", "highlight.xMax", options.highlight.xMax);
        evalType("number|null", "highlight.yMin", options.highlight.yMin);
        evalType("number|null", "highlight.yMax", options.highlight.yMax);
        evalType("color", "highlight.color", options.highlight.color);
    }

    if (evalType("object", "zoom", options.zoom)) {
        evalType("number|null", "zoom.xMin", options.zoom.xMin);
        evalType("number|null", "zoom.xMax", options.zoom.xMax);
        evalType("number|null", "zoom.yMin", options.zoom.yMin);
        evalType("number|null", "zoom.yMax", options.zoom.yMax);
    }

    if (evalType("object", "graph", options.graph)) {
        if (evalType("array", "graph.dataX", options.graph.dataX)) {
            evalArrayContains("graph.dataX", options.graph.dataX, "anyArray");
            if (
                evalCond(
                    "graph.dataX",
                    options.graph.dataX,
                    "length === 0 || length === 1 || length === graph.dataY.length",
                    options.graph.dataX.length === 0 ||
                        options.graph.dataX.length === 1 ||
                        options.graph.dataX.length ===
                            options.graph.dataY.length,
                )
            ) {
                evalCond(
                    "graph.dataX",
                    options.graph.dataX,
                    "length <= graph.dataY.length",
                    options.graph.dataX.length <= options.graph.dataY.length,
                );
            }
        }

        if (evalType("array", "graph.dataY", options.graph.dataY)) {
            evalArrayContains("graph.dataY", options.graph.dataY, "anyArray");
            if (
                options.graph.dataX.length === 0 ||
                options.graph.dataX.length === 1
            ) {
                for (const dataY of options.graph.dataY) {
                    if (dataY.length !== options.graph.dataY[0].length) {
                        error(
                            "graph.dataY",
                            "Not all arrays are of the same size.",
                        );
                    }
                }
                if (
                    options.graph.dataX.length === 1 &&
                    (options.graph.dataY.length === 0 ||
                        options.graph.dataX[0].length !==
                            options.graph.dataY[0].length)
                ) {
                    error("graph.dataY", "Size does not match dataX.");
                }
            } else if (
                options.graph.dataY.length === options.graph.dataX.length
            ) {
                for (let i = 0; i < options.graph.dataY.length; ++i) {
                    if (
                        options.graph.dataY[i].length !==
                        options.graph.dataX[i].length
                    ) {
                        error(
                            "graph.dataY",
                            `dataY[${i}].length != dataX[${i}].length`,
                        );
                    }
                }
            }
        }

        if (evalType("array", "graph.colors", options.graph.colors)) {
            evalArrayContains("graph.colors", options.graph.colors, "color");
        }
        if (evalType("array", "graph.names", options.graph.names)) {
            evalArrayContains("graph.names", options.graph.names, "string");
        }
        if (evalType("array", "graph.dashed", options.graph.dashed)) {
            evalArrayContains(
                "graph.dashed",
                options.graph.dashed,
                "bool|array",
            );
        }
        if (evalType("number", "graph.lineWidth", options.graph.lineWidth)) {
            evalCond(
                "graph.lineWidth",
                options.graph.lineWidth,
                ">= 0",
                options.graph.lineWidth >= 0,
            );
        }
        if (
            evalType("number", "graph.markerRadius", options.graph.markerRadius)
        ) {
            evalCond(
                "graph.markerRadius",
                options.graph.markerRadius,
                ">= 0",
                options.graph.markerRadius >= 0,
            );
        }
        if (evalType("int", "graph.smoothing", options.graph.smoothing)) {
            evalCond(
                "graph.smoothing",
                options.graph.smoothing,
                ">= 0",
                options.graph.smoothing >= 0,
            );
        }
        if (evalType("number", "graph.simplify", options.graph.simplify)) {
            evalCond(
                "graph.simplify",
                options.graph.simplify,
                ">= 0 && <= 1",
                options.graph.simplify >= 0 && options.graph.simplify <= 1,
            );
        }
        if (evalType("string", "graph.simplifyBy", options.graph.simplifyBy)) {
            evalEnum(
                ["avg", "min", "max", "minMax"],
                "graph.simplifyBy",
                options.graph.simplifyBy,
            );
        }
        evalType("bool", "graph.fill", options.graph.fill);
        evalType(
            "compositeOperation",
            "graph.compositeOperation",
            options.graph.compositeOperation,
        );
    }

    if (evalType("object", "axes", options.axes)) {
        if (evalType("object", "axes.tickMarkers", options.axes.tickMarkers)) {
            evalType(
                "bool",
                "axes.tickMarkers.show",
                options.axes.tickMarkers.show,
            );
            if (
                evalType(
                    "int",
                    "axes.tickMarkers.length",
                    options.axes.tickMarkers.length,
                )
            ) {
                evalCond(
                    "axes.tickMarkers.length",
                    options.axes.tickMarkers.length,
                    "> 0",
                    options.axes.tickMarkers.length > 0,
                );
            }
            if (
                evalType(
                    "int",
                    "axes.tickMarkers.width",
                    options.axes.tickMarkers.width,
                )
            ) {
                evalCond(
                    "axes.tickMarkers.width",
                    options.axes.tickMarkers.width,
                    "> 0",
                    options.axes.tickMarkers.width > 0,
                );
            }
            if (
                evalType(
                    "int",
                    "axes.tickMarkers.offset",
                    options.axes.tickMarkers.offset,
                )
            ) {
                evalCond(
                    "axes.tickMarkers.offset",
                    options.axes.tickMarkers.offset,
                    ">= 0",
                    options.axes.tickMarkers.offset >= 0,
                );
            }
            evalType(
                "color",
                "axes.tickMarkers.color",
                options.axes.tickMarkers.color,
            );
        }

        if (evalType("object", "axes.tickLabels", options.axes.tickLabels)) {
            evalType(
                "bool",
                "axes.tickLabels.show",
                options.axes.tickLabels.show,
            );
            evalType(
                "color",
                "axes.tickLabels.color",
                options.axes.tickLabels.color,
            );
            evalType(
                "font",
                "axes.tickLabels.font",
                options.axes.tickLabels.font,
            );
            if (
                evalType(
                    "int",
                    "axes.tickLabels.size",
                    options.axes.tickLabels.size,
                )
            ) {
                evalCond(
                    "axes.tickLabels.size",
                    options.axes.tickLabels.size,
                    "> 0",
                    options.axes.tickLabels.size > 0,
                );
            }
            if (
                evalType(
                    "int",
                    "axes.tickLabels.width",
                    options.axes.tickLabels.width,
                )
            ) {
                evalCond(
                    "axes.tickLabels.width",
                    options.axes.tickLabels.width,
                    "> 0",
                    options.axes.tickLabels.width > 0,
                );
            }
            if (
                evalType(
                    "int",
                    "axes.tickLabels.offset",
                    options.axes.tickLabels.offset,
                )
            ) {
                evalCond(
                    "axes.tickLabels.offset",
                    options.axes.tickLabels.offset,
                    ">= 0",
                    options.axes.tickLabels.offset >= 0,
                );
            }
            if (
                evalType(
                    "int",
                    "axes.tickLabels.padding",
                    options.axes.tickLabels.padding,
                )
            ) {
                evalCond(
                    "axes.tickLabels.padding",
                    options.axes.tickLabels.padding,
                    ">= 0",
                    options.axes.tickLabels.padding >= 0,
                );
            }
        }

        if (evalType("object", "axes.labels", options.axes.labels)) {
            evalType("color", "axes.labels.color", options.axes.labels.color);
            evalType("font", "axes.labels.font", options.axes.labels.font);
            if (evalType("int", "axes.labels.size", options.axes.labels.size)) {
                evalCond(
                    "axes.labels.size",
                    options.axes.labels.size,
                    "> 0",
                    options.axes.labels.size > 0,
                );
            }
            if (
                evalType(
                    "int",
                    "axes.labels.offset",
                    options.axes.labels.offset,
                )
            ) {
                evalCond(
                    "axes.labels.offset",
                    options.axes.labels.offset,
                    ">= 0",
                    options.axes.labels.offset >= 0,
                );
            }
            if (
                evalType(
                    "int",
                    "axes.labels.padding",
                    options.axes.labels.padding,
                )
            ) {
                evalCond(
                    "axes.labels.padding",
                    options.axes.labels.padding,
                    ">= 0",
                    options.axes.labels.padding >= 0,
                );
            }
        }

        const axes = [
            {
                path: "axes.x",
                axis: options.axes.x,
                sizePath: "height",
                size: options.axes.x.height,
            },
            {
                path: "axes.y",
                axis: options.axes.y,
                sizePath: "width",
                size: options.axes.y.width,
            },
        ];
        for (const { path, axis, sizePath, size } of axes) {
            if (evalType("object", path, axis)) {
                evalType("bool", `${path}.show`, axis.show);
                evalType("bool", `${path}.inverted`, axis.inverted);
                evalType("bool", `${path}.log`, axis.log);
                if (evalType("int", `${path}.${sizePath}`, size)) {
                    evalCond(`${path}.${sizePath}`, size, ">= 0", size >= 0);
                }

                if (evalType("object", `${path}.grid`, axis.grid)) {
                    if (
                        evalType("int", `${path}.grid.width`, axis.grid.width)
                    ) {
                        evalCond(
                            `${path}.grid.width`,
                            axis.grid.width,
                            ">= 0",
                            axis.grid.width >= 0,
                        );
                    }
                    evalType("color", `${path}.grid.color`, axis.grid.color);
                }

                evalType("string", `${path}.label`, axis.label);

                if (evalType("object", `${path}.bounds`, axis.bounds)) {
                    if (axis.bounds.min != null) {
                        evalType(
                            "number",
                            `${path}.bounds.min`,
                            axis.bounds.min,
                        );
                        if (axis.log && axis.bounds.min <= 0) {
                            error(
                                `${path}.bounds.min`,
                                `"[${axis.bounds.min}]" When axis is logarithmic all bounds must be greather than 0.`,
                            );
                        }
                    }

                    if (axis.bounds.max != null) {
                        evalType(
                            "number",
                            `${path}.bounds.max`,
                            axis.bounds.max,
                        );
                        if (axis.log && axis.bounds.max <= 0) {
                            error(
                                `${path}.bounds.max`,
                                `"[${axis.bounds.max}]" When axis is logarithmic all bounds must be greather than 0.`,
                            );
                        }
                    }

                    if (axis.bounds.min != null && axis.bounds.max != null) {
                        evalCond(
                            `${path}.bounds.min`,
                            axis.bounds.min,
                            `< ${path}.bounds.max`,
                            axis.bounds.min < axis.bounds.max,
                        );
                    }
                }

                if (evalType("int", `${path}.numTicks`, axis.numTicks)) {
                    evalCond(
                        `${path}.numTicks`,
                        axis.numTicks,
                        ">= 0",
                        axis.numTicks >= 0,
                    );
                }

                evalType(
                    "function|null",
                    `${path}.legendValueFormatter`,
                    axis.legendValueFormatter,
                );
                evalType(
                    "function|null",
                    `${path}.tickerValuePreFormatter`,
                    axis.tickerValuePreFormatter,
                );
                evalType(
                    "function|null",
                    `${path}.tickerValuePostFormatter`,
                    axis.tickerValuePostFormatter,
                );
                evalType(
                    "function|null",
                    `${path}.tickerLabelFormatter`,
                    axis.tickerLabelFormatter,
                );
                evalType("function|null", `${path}.ticker`, axis.ticker);
            }
        }
    }

    if (evalType("object", "border", options.border)) {
        evalType("borderStyle", "border.style", options.border.style);
        evalType("color", "border.color", options.border.color);
        evalType("borderWidth", "border.width", options.border.width);
    }

    if (evalType("object", "spinner", options.spinner)) {
        evalType("bool", "spinner.show", options.spinner.show);
        if (evalType("int", "spinner.lines", options.spinner.lines)) {
            evalCond(
                "spinner.lines",
                options.spinner.lines,
                "> 0",
                options.spinner.lines > 0,
            );
        }
        if (evalType("int", "spinner.length", options.spinner.length)) {
            evalCond(
                "spinner.length",
                options.spinner.length,
                "> 0",
                options.spinner.length > 0,
            );
        }
        if (evalType("int", "spinner.width", options.spinner.width)) {
            evalCond(
                "spinner.width",
                options.spinner.width,
                "> 0",
                options.spinner.width > 0,
            );
        }
        if (evalType("int", "spinner.radius", options.spinner.radius)) {
            evalCond(
                "spinner.radius",
                options.spinner.radius,
                "> 0",
                options.spinner.radius > 0,
            );
        }
        if (evalType("number", "spinner.corners", options.spinner.corners)) {
            evalCond(
                "spinner.corners",
                options.spinner.corners,
                ">= 0 && <= 1",
                options.spinner.corners >= 0 && options.spinner.corners <= 1,
            );
        }
        if (evalType("int", "spinner.rotate", options.spinner.rotate)) {
            evalCond(
                "spinner.rotate",
                options.spinner.rotate,
                ">= 0",
                options.spinner.rotate >= 0,
            );
        }
        if (evalType("int", "spinner.direction", options.spinner.direction)) {
            evalCond(
                "spinner.direction",
                options.spinner.direction,
                "=== -1 || === 1",
                options.spinner.direction === -1 ||
                    options.spinner.direction === 1,
            );
        }
        evalType("color", "spinner.color", options.spinner.color);
        if (evalType("number", "spinner.speed", options.spinner.speed)) {
            evalCond(
                "spinner.speed",
                options.spinner.speed,
                "> 0",
                options.spinner.speed > 0,
            );
        }
        if (evalType("int", "spinner.scale", options.spinner.scale)) {
            evalCond(
                "spinner.scale",
                options.spinner.scale,
                ">= 0",
                options.spinner.scale >= 0,
            );
        }
        if (evalType("int", "spinner.zIndex", options.spinner.zIndex)) {
            evalCond(
                "spinner.zIndex",
                options.spinner.zIndex,
                ">= 0",
                options.spinner.zIndex >= 0,
            );
        }
        evalType("bool", "spinner.shadow", options.spinner.shadow);
        evalType("string", "spinner.animation", options.spinner.animation);
        evalType("string", "spinner.className", options.spinner.className);
        evalType("string", "spinner.fadeColor", options.spinner.fadeColor);
        if (evalType("string", "spinner.position", options.spinner.position)) {
            evalCond(
                "spinner.position",
                options.spinner.position,
                '=== "relative" || === "absolute"',
                options.spinner.position === "relative" ||
                    options.spinner.position === "absolute",
            );
        }
        evalType("size", "spinner.top", options.spinner.top);
        evalType("size", "spinner.left", options.spinner.left);
    }

    return optionsOk;
}
