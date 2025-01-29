const compress = (x: number, y: number) => {
    return (x<<6) | y;
}

const decompress = (k: number) => {
    return [k>>6, k & 0b111111];
}

export const coordCompress = (coords: [number, number] | [number, number][]) => {
    if (typeof coords[0] === 'number') {
        // @ts-ignore
        return compress(coords[0], coords[1]);
    } else {
        // @ts-ignore
        return coords.map(([x,y]) => compress(x, y));
    }
}

export const coordDecompress = (coords: number[]): any[] => {
    if (typeof coords === 'number') {
        return decompress(coords);
    } else {
        return coords.map(k => decompress(k));
    }
}