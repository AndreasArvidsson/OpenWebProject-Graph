export interface BinarySearchResult {
    found?: number;
    min: number;
    max: number;
}

export function binarySearch(
    dataCallback: (index: number) => number,
    size: number,
    value: number,
): BinarySearchResult {
    let min = 0;
    let max = size - 1;
    while (min <= max) {
        const mid = Math.floor((min + max) / 2);
        // Value is smaller than mid.
        if (value < dataCallback(mid)) {
            max = mid - 1;
        }
        // Value is larger than mid.
        else if (value > dataCallback(mid)) {
            min = mid + 1;
        }
        // Found value.
        else {
            return { found: mid, min: mid, max: mid };
        }
    }
    min = Math.min(min, max);
    max = Math.max(min, max, 0);
    // Value is larger than max index. Increment max.
    if (value > dataCallback(max)) {
        ++max;
    }
    // Value is smaller than min index. Decrement min.
    else if (value < dataCallback(min)) {
        --min;
    }
    return {
        min: Math.max(min, 0),
        max: Math.min(max, size - 1),
    };
}
