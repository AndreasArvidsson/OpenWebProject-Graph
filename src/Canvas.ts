import { getBackingStorePixelRatio } from "./util/getBackingStorePixelRatio.js";

export type GraphPoint = [number, number];

export class Canvas {
    private readonly canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private readonly dontScale?: boolean;
    private ratio = 1;
    private x = 0;
    private y = 0;
    private contentX = 0;
    private contentY = 0;
    private contentOffsetX = 0;
    private contentOffsetY = 0;

    public constructor(
        container: HTMLElement,
        id?: string,
        dontScale?: boolean,
    ) {
        this.canvas = document.createElement("canvas");
        const context = this.canvas.getContext("2d");
        if (context == null) {
            throw new Error("Failed to get 2D context for canvas element");
        }
        if (id != null) {
            this.canvas.id = id;
        }
        container.append(this.canvas);
        this.context = context;
        this.dontScale = dontScale;
        this.canvas.style.position = "absolute";
        this.canvas.style.margin = "0";
        this.canvas.style.padding = "0";
        this.canvas.style.boxSizing = "border-box";
        this.setPosition(0, 0);
        this.setSize("100%", "100%");
    }

    public setParent(container?: HTMLElement): void {
        this.canvas.remove();
        if (container) {
            container.append(this.canvas);
        }
    }

    public putImageData(
        data: ImageData,
        x: number,
        y: number,
        offsetX: number,
        offsetY: number,
    ): void {
        this.context.putImageData(
            data,
            x * this.ratio + offsetX,
            y * this.ratio + offsetY,
        );
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public getContext(): CanvasRenderingContext2D {
        return this.context;
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public getContentX(): number {
        return this.contentX;
    }

    public getContentY(): number {
        return this.contentY;
    }

    public getWidth(): number {
        return this.canvas.offsetWidth;
    }

    public getHeight(): number {
        return this.canvas.offsetHeight;
    }

    public getContentWidth(): number {
        return this.canvas.clientWidth;
    }

    public getContentHeight(): number {
        return this.canvas.clientHeight;
    }

    public getContentOffsetX(): number {
        return this.contentOffsetX;
    }

    public getContentOffsetY(): number {
        return this.contentOffsetY;
    }

    public getTextWidth(text: string, font?: string): number {
        if (font != null) {
            this.context.font = font;
        }
        return this.context.measureText(text).width;
    }

    public clear(): void {
        if (!this.dontScale) {
            this.context.clearRect(
                0,
                0,
                this.getContentWidth(),
                this.getContentHeight(),
            );
        } else {
            this.context.clearRect(
                0,
                0,
                this.getContentWidth() * this.ratio,
                this.getContentHeight() * this.ratio,
            );
        }
    }

    public clearRectangle(
        x: number,
        y: number,
        width: number,
        height: number,
    ): void {
        if (!this.dontScale) {
            this.context.clearRect(x, y, width, height);
        } else {
            this.context.clearRect(
                x * this.ratio,
                y * this.ratio,
                width * this.ratio,
                height * this.ratio,
            );
        }
    }

    public setZIndex(zIndex: number): void {
        this.canvas.style.zIndex = zIndex.toString();
    }

    public set<K extends keyof CanvasRenderingContext2D>(
        member: K,
        value: CanvasRenderingContext2D[K],
    ): void {
        this.context[member] = value;
    }

    public setBorder(style: string, color: string, width: string): void {
        this.canvas.style.borderStyle = style;
        this.canvas.style.borderColor = color;
        this.canvas.style.borderWidth = width;
        this._calculateContentPosition();
    }

    public get<K extends keyof CanvasRenderingContext2D>(
        member: K,
    ): CanvasRenderingContext2D[K] {
        return this.context[member];
    }

    public getRatio(): number {
        return this.ratio;
    }

    public rotate(rotateDegrees: number): void {
        this.context.rotate((rotateDegrees * Math.PI) / 180);
    }

    public setPosition(
        x: number,
        y: number,
        alignRight?: boolean,
        valignBottom?: boolean,
    ): void {
        this.x = x;
        this.y = y;
        if (alignRight) {
            this.canvas.style.left = "";
            this.canvas.style.right = `${x}px`;
        } else {
            this.canvas.style.left = `${x}px`;
            this.canvas.style.right = "";
        }
        if (valignBottom) {
            this.canvas.style.top = "";
            this.canvas.style.bottom = `${y}px`;
        } else {
            this.canvas.style.top = `${y}px`;
            this.canvas.style.bottom = "";
        }
        this._calculateContentPosition();
    }

    public setSize(width?: number | string, height?: number | string): void {
        if (width !== undefined) {
            this.canvas.style.width =
                typeof width === "number" ? `${width}px` : width;
        }
        if (height !== undefined) {
            this.canvas.style.height =
                typeof height === "number" ? `${height}px` : height;
        }
        this.resize();
    }

    public resize(): void {
        const bsr = getBackingStorePixelRatio(this.context);
        this.ratio = window.devicePixelRatio / bsr;
        this.canvas.width = this.getContentWidth() * this.ratio;
        this.canvas.height = this.getContentHeight() * this.ratio;
        if (!this.dontScale) {
            this.context.scale(this.ratio, this.ratio);
        }
    }

    public strokeRectangle(
        x: number,
        y: number,
        width: number,
        height: number,
        lineWidth?: number,
        color?: string,
    ): void {
        if (lineWidth != null) {
            this.context.lineWidth = lineWidth;
        }
        if (color != null) {
            this.context.strokeStyle = color;
        }
        x += this.context.lineWidth / 2;
        y += this.context.lineWidth / 2;
        width -= this.context.lineWidth;
        height -= this.context.lineWidth;
        this.context.strokeRect(x, y, width, height);
    }

    public fillRectangle(
        x: number,
        y: number,
        width: number,
        height: number,
        color?: string,
    ): void {
        if (color != null) {
            this.context.fillStyle = color;
        }
        this.context.fillRect(x, y, width, height);
    }

    public fillRectangle2(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color?: string,
    ): void {
        if (color != null) {
            this.context.fillStyle = color;
        }
        this.context.fillRect(x1, y1, x2 - x1, y2 - y1);
    }

    public strokeCircle(
        x: number,
        y: number,
        radius: number,
        color?: string,
        width?: number,
    ): void {
        if (color != null) {
            this.context.strokeStyle = color;
        }
        if (width != null) {
            this.context.lineWidth = width;
        }
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.context.stroke();
    }

    public fillCircle(
        x: number,
        y: number,
        radius: number,
        color?: string,
    ): void {
        if (color != null) {
            this.context.fillStyle = color;
        }
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.context.fill();
    }

    public line(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        lineWidth?: number,
        color?: string,
    ): void {
        if (lineWidth != null) {
            this.context.lineWidth = lineWidth;
        }
        if (color != null) {
            this.context.strokeStyle = color;
        }
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }

    public text(
        text: string | number,
        x: number,
        y: number,
        font?: string | null,
        color?: string,
        align?: CanvasTextAlign,
        baseline?: CanvasTextBaseline,
        rotate?: number,
    ): void {
        if (font != null) {
            this.context.font = font;
        }
        if (color != null) {
            this.context.fillStyle = color;
        }
        if (align != null) {
            this.context.textAlign = align;
        }
        if (baseline != null) {
            this.context.textBaseline = baseline;
        }
        if (rotate != null) {
            this.context.save();
            this.context.translate(x, y);
            this.context.rotate((rotate * Math.PI) / 180);
            this.context.fillText(text.toString(), 0, 0);
            this.context.restore();
        } else {
            this.context.fillText(text.toString(), x, y);
        }
    }

    public graph(
        array: GraphPoint[],
        color?: string,
        lineWidth?: number,
    ): void {
        if (color != null) {
            this.context.strokeStyle = color;
        }
        if (lineWidth != null) {
            this.context.lineWidth = lineWidth;
        }
        this.context.beginPath();
        this.context.moveTo(array[0][0], array[0][1]);
        for (let i = 1; i < array.length; ++i) {
            this.context.lineTo(array[i][0], array[0][1]);
        }
        this.context.stroke();
    }

    public fill(color: string): void {
        this.fillRectangle(
            0,
            0,
            this.getContentWidth(),
            this.getContentHeight(),
            color,
        );
    }

    public disableMouseInteraction(): void {
        this.canvas.style.pointerEvents = "none";
    }

    private _calculateContentPosition(): void {
        const compStyle = getComputedStyle(this.canvas);
        const borderLeft = Number.parseFloat(
            /\d+/u.exec(compStyle.getPropertyValue("border-left-width"))?.[0] ??
                "0",
        );
        const borderTop = Number.parseFloat(
            /\d+/u.exec(compStyle.getPropertyValue("border-top-width"))?.[0] ??
                "0",
        );
        this.contentOffsetX = Math.round(this.ratio * borderLeft);
        this.contentOffsetY = Math.round(this.ratio * borderTop);
        this.contentX = this.x + this.contentOffsetX;
        this.contentY = this.y + this.contentOffsetY;
    }
}
