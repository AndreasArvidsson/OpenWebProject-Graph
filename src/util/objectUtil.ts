type ObjectEntry<T> = {
    [K in keyof T]-?: [K, Required<T>[K]];
}[keyof T];

export function objectEntries<T extends object>(obj: T): ObjectEntry<T>[] {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return Object.entries(obj) as ObjectEntry<T>[];
}

export function objectKeys<T extends object>(obj: T): (keyof T)[] {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return Object.keys(obj) as (keyof T)[];
}
