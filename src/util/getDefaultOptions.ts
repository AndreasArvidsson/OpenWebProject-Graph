import type { FullOptions } from "../Options.type.js";

export function getDefaultOptions(): FullOptions {
    return {
        debug: false,
        offset: "0 20px 0 0",
        interaction: {
            resize: true,
            trackMouse: true,
            zoom: true,
            smoothing: false,
        },
        title: {
            label: "",
            bold: false,
            size: 20,
            offsetX: 0,
            offsetY: 0,
            padding: 3,
            font: "verdana",
            color: "black",
            align: "center",
        },
        legend: {
            location: "top",
            font: "Arial",
            size: 15,
            offsetX: 0,
            offsetY: 0,
            padding: 2,
            align: "right",
            newLine: false,
        },
        highlight: {
            xMin: null,
            xMax: null,
            yMin: null,
            yMax: null,
            color: "rgba(0, 0, 255, 0.2)",
        },
        zoom: {
            xMin: null,
            xMax: null,
            yMin: null,
            yMax: null,
        },
        graph: {
            dataX: [],
            dataY: [],
            colors: [
                "#000000",
                "#0000FF",
                "#FF0000",
                "#800080",
                "#00FF00",
                "#8080FF",
                "#FF8080",
                "#FF00FF",
                "#00FFFF",
            ],
            names: [],
            dashed: [],
            lineWidth: 1,
            markerRadius: 0,
            smoothing: 0,
            simplify: 0.1,
            simplifyBy: "minMax",
            fill: false,
            compositeOperation: "source-over",
        },
        axes: {
            tickMarkers: {
                show: true,
                length: 5,
                width: 1,
                offset: 0,
                color: "#BEBEBE",
            },
            tickLabels: {
                show: true,
                color: "black",
                font: "Arial",
                size: 12,
                width: 40,
                offset: 3,
                padding: 2,
            },
            labels: {
                color: "black",
                font: "verdana",
                size: 15,
                offset: 0,
                padding: 0,
            },
            x: {
                show: true,
                inverted: false,
                log: false,
                height: 0,
                label: "",
                numTicks: 0,
                legendValueFormatter: null,
                tickerValuePreFormatter: null,
                tickerValuePostFormatter: null,
                tickerLabelFormatter: null,
                ticker: null,
                grid: {
                    width: 1,
                    color: "#BEBEBE",
                },
                bounds: {
                    min: null,
                    max: null,
                },
            },
            y: {
                show: true,
                inverted: false,
                log: false,
                width: 0,
                label: "",
                numTicks: 0,
                legendValueFormatter: null,
                tickerValuePreFormatter: null,
                tickerValuePostFormatter: null,
                tickerLabelFormatter: null,
                ticker: null,
                grid: {
                    width: 1,
                    color: "#BEBEBE",
                },
                bounds: {
                    min: null,
                    max: null,
                },
            },
        },
        border: {
            style: "solid",
            color: "black",
            width: "0 0 1px 1px",
        },
        spinner: {
            // Options regarding the spinner.
            show: false, // Automatically show spinner when plotting data. Can always be activated manually.
            lines: 13, // The number of lines to draw.
            length: 30, // The length of each line.
            width: 10, // The line thickness.
            radius: 30, // The radius of the inner circle.
            corners: 1, // Corner roundness (0..1).
            rotate: 0, // The rotation offset.
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: "black", // #rgb or #rrggbb or array of colors
            speed: 1, // Revolutions per second
            shadow: false, // If true a shadow is rendered.
            position: "relative", // Position type.
            top: "50%", // CenterY position relative to parent
            left: "50%", // CenterX position relative to parent,
            animation: "spinner-line-fade-default", // The CSS animation name for the lines. Defaults to 'spinner-line-fade-default'.
            scale: 1, // Scales overall size of the spinner. Can be used to shrink the spinner.
            zIndex: 2_000_000_000, // The z-index (defaults to 2e9)
            className: "", // The CSS class to assign to the spinner
            fadeColor: "transparent", // CSS color or array of colors to fade the lines to. Defaults to transparent.
        },
    };
}
