import { decodeUrlSafeBase64, fromB64 } from "./utils";

export function validatePub(pub) {
    return pub && typeof pub === 'string' && pub.length === 87 && pub.split('.').length === 2;
}

export function parsePub(pub) {
    const split = pub.split(".");
    const decoded = split.map(single => decodeUrlSafeBase64(single));
    const finals = decoded.map(d => d[42])
    const averages = decoded.map(e => e.reduce((acc, d) => acc + d) / e.length)
    const angles = split.map(part => fromB64(part) % 360)
    const colors = split.map((s, i) => `hsl(${angles[i]} ${finals[i] * 100}% ${averages[i] * 100}%)`)
    return { finals, decoded, angles, averages, colors }
}

export function chunkIt(list, chunkSize = 3) {
    return [...Array(Math.ceil(list.length / chunkSize))].map(() =>
        list.splice(0, chunkSize)
    );
}