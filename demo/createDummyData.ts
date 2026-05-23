export function createDummyData(size: number): [Float32Array, Float32Array] {
    let seed = 3;
    const random = (): number => {
        seed = Math.sin(seed) * 10_000;
        return seed - Math.floor(seed);
    };
    const data1 = new Float32Array(size);
    const data2 = new Float32Array(size);
    const mult = Math.PI / 100;
    for (let i = 0; i < size; ++i) {
        data1[i] = Math.sin(i * mult) * random();
        data2[i] = Math.cos(i * mult) * random();
    }
    return [data1, data2];
}
