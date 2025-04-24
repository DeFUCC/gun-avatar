// https://datatracker.ietf.org/doc/html/rfc4648#section-5
const symbols =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export function toB64(x) { return x.toString(2).split(/(?=(?:.{6})+(?!.))/g).map(v => symbols[parseInt(v, 2)]).join("") }

export function fromB64(x) { return x.split("").reduce((s, v) => s * 64 + symbols.indexOf(v), 0) }

export function decodeUrlSafeBase64(st) {
  const symbolArray = symbols.split("");
  let arr = [];
  let i = 0;
  for (let letter of st) {
    arr[i++] = symbolArray.indexOf(letter) / 64;
  }
  return arr;
}

export function encodeUrlSafeBase64(arr) {
  return arr.map(num => symbols[Math.floor(num * 64)]).join("");
}