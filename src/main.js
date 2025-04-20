import { renderCanvasAvatar } from "./canvas";
import { renderSVGAvatar } from "./svg";

import { fromB64, decodeUrlSafeBase64, toB64 } from "./utils";

const cache = {};

//TODO: <object> rendering for 'interactive' option

/**
 * Generate avatar from public key
 */
export function gunAvatar({
  pub,
  size = 200,
  dark = false,
  draw = "circles",
  reflect = true,
  round = true,
  embed = true,
  svg = true,
} = {}) {
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  if (!validatePub(pub)) return '';
  if (svg || !isBrowser) return renderSVGAvatar({ pub, size, dark, draw, reflect, round, embed });

  const key = JSON.stringify(arguments[0])
  if (cache?.[key]) return cache[key]

  const image = renderCanvasAvatar({ pub, size, dark, draw, reflect, round, embed });
  cache[key] = image;
  return image;
}

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