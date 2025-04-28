import { renderCanvasAvatar } from "./canvas";
import { validatePub } from "./pub";
import { renderSVGAvatar } from "./svg";

import { fromB64, decodeUrlSafeBase64, toB64 } from "./utils";

const cache = {};

export function gunAvatar(options = {}) {
  const {
    pub,
    size = 200,
    dark = false,
    draw = "circles",
    reflect = true,
    round = true,
    embed = true,
    svg = false,
    p3 = true,
  } = options
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  if (!validatePub(pub)) return '';
  if (svg || !isBrowser) return renderSVGAvatar(options);

  const key = JSON.stringify(arguments[0])
  if (cache?.[key]) return cache[key]

  const image = renderCanvasAvatar(options);
  cache[key] = image;
  return image;
}

