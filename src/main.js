import { renderCanvasAvatar } from "./canvas";
import { validatePub } from "./pub";
import { renderSVGAvatar } from "./svg";

import { fromB64, decodeUrlSafeBase64, toB64 } from "./utils";

const cache = {};

export function gunAvatar({
  pub, // public key of a user
  size = 200, // square pixel dimensions
  dark = false, // Light mode, enable to have more dim backgrounds
  draw = "circles", // useful for people and agents avatars. Also "squares" - for backgrounds and document covers.
  reflect = true, // used for avatars symmetry. Disable for squares.
  round = true, // Cut the image with round transparency mask. Disable to get raw square image.
  embed = true, // Embed the "pub" key into the image (both PNG and SVG). You can put any serializable content here - an encrypted keypair is a nice example of use for this
  svg = true, // Scalabe vector graphics format. Disable to get Canvas PNG render available only in browsers.
  p3 = true, // Extended P3 color palette utilizes full capacity of modern displays. Disable to have more backwards compatible RGBA color palette.
} = {}) {

  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  if (!validatePub(pub)) return '';

  if (svg || !isBrowser) return renderSVGAvatar({ pub, size, dark, draw, reflect, round, embed, svg, p3 });

  const key = JSON.stringify(arguments[0])
  if (cache?.[key]) return cache[key]

  const image = renderCanvasAvatar({ pub, size, dark, draw, reflect, round, embed, svg, p3 });

  cache[key] = image;
  return image;
}

