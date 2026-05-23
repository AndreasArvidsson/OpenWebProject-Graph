import { isObject } from "./Is.js";

type UnknownRecord = Record<string, unknown>;

export function objectDeepAssign(target: object, source: object): void {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const targetRecord = target as UnknownRecord;

    for (const [key, value] of Object.entries(source)) {
        const current = targetRecord[key];

        if (isObject(current) && isObject(value)) {
            objectDeepAssign(current, value);
        } else {
            targetRecord[key] = value;
        }
    }
}
