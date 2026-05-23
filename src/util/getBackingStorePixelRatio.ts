// oxlint-disable typescript/no-explicit-any
// oxlint-disable typescript/no-unsafe-member-access
// oxlint-disable typescript/no-unsafe-type-assertion
// oxlint-disable typescript/strict-boolean-expressions
// oxlint-disable typescript/no-unsafe-return

export function getBackingStorePixelRatio(
    context: CanvasRenderingContext2D,
): number {
    return (
        (context as any).webkitBackingStorePixelRatio ??
        (context as any).mozBackingStorePixelRatio ??
        (context as any).msBackingStorePixelRatio ??
        (context as any).oBackingStorePixelRatio ??
        (context as any).backingStorePixelRatio ??
        1
    );
}
