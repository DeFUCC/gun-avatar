import { embedInImage } from "./embed";
import { fromB64, decodeUrlSafeBase64, toB64 } from "./utils";

const cache = {};

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
}) {
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  if (!validatePub(pub)) return '';
  if (!isBrowser) return createFallbackSVG({ pub, size, dark, embed });

  const key = JSON.stringify(arguments[0])
  if (cache?.[key]) return cache[key]

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  const { decoded, finals } = parsePub(pub)

  drawGradient({ ctx, top: finals[0], bottom: finals[1], size, dark });

  if (draw == "squares") {
    ctx.filter = "blur(20px)";
    drawSquares(decoded[0], ctx, size);
    ctx.filter = "blur(0px)";
    ctx.globalCompositeOperation = "color-burn";
    drawSquares(decoded[1], ctx, size);
  } else {
    drawCircles(decoded[0], ctx, size, 0.42 * size);
    ctx.globalCompositeOperation = "multiply";
    drawCircles(decoded[1], ctx, size, 0.125 * size);
  }

  if (reflect) {
    ctx.globalCompositeOperation = "source-over";
    ctx.scale(-1, 1);
    ctx.translate(-size / 2, 0);
    ctx.drawImage(canvas, size / 2, 0, size, size, 0, 0, size, size);
    // Reset transformation matrix after reflection
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  if (round) {
    // Store the current canvas content
    const imageData = ctx.getImageData(0, 0, size, size);
    ctx.clearRect(0, 0, size, size);

    // Fill with background color first
    ctx.fillStyle = dark ? '#cccccc' : '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw original image back
    ctx.putImageData(imageData, 0, 0);

    // Create circular mask
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  let image = canvas.toDataURL("image/png")

  if (embed) {
    const embedData = {
      pub,
      content: embed
    }
    const embedBuffer = embedInImage(canvas, embedData)
    if (embedBuffer) {
      const blob = new Blob([embedBuffer], { type: 'image/png' })
      image = URL.createObjectURL(blob)
    }
  }

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

function drawGradient({ ctx, top = 0, bottom = 150, size = 200, dark = false }) {
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  const offset = dark ? 0 : 70;
  gradient.addColorStop(0, `hsla(0,0%,${offset + top * 30}%)`);
  gradient.addColorStop(1, `hsla(0,0%,${offset + bottom * 30}%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}

function drawSquares(data, ctx, size) {
  chunkIt(data, 14).forEach(chunk => {
    if (chunk.length === 14) {
      let [x, y, rRaw, h1, s1, l1, a1, x1, h2, s2, l2, a2, x2, angle] = chunk;
      let r = size / 8 + rRaw * size * (7 / 8);
      const gradient = ctx.createLinearGradient(
        x * size + r * x1, 0,
        x * size + r * x2, size
      );
      gradient.addColorStop(0, `hsla(${h1 * 360},${s1 * 100}%,${l1 * 100}%,${a1})`);
      gradient.addColorStop(1, `hsla(${h2 * 360},${s2 * 100}%,${l2 * 100}%,${a2})`);
      ctx.fillStyle = gradient;
      ctx.translate(x * size, y * size);
      ctx.rotate(angle * Math.PI);
      ctx.fillRect(-r / 2, -r / 2, r, r);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  });
}

function drawCircles(data, ctx, size, radius) {
  chunkIt(data, 7).forEach(chunk => {
    if (chunk.length === 7) {
      let [x, y, r, h, s, l, a] = chunk;
      ctx.beginPath();
      ctx.arc(
        size / 2 + (x * size) / 2,
        y * size,
        r * radius,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = `hsla(${h * 360},${s * 100}%,${l * 100}%,${a})`;
      ctx.closePath();
      ctx.fill();
    }
  });
}

// ====
//  Fallback SVG for SSR
// ====

function createFallbackSVG({ pub, size = 200, dark = false, embed = true } = {}) {
  const { decoded, finals } = parsePub(pub)
  const bgColor = dark ? '#333' : '#eee';

  // Create gradient background
  const bgGradient = `
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsla(0,0%,${(dark ? 0 : 70) + finals[0] * 30}%)"/>
      <stop offset="100%" stop-color="hsla(0,0%,${(dark ? 0 : 70) + finals[1] * 30}%)"/>
    </linearGradient>
  `;

  // Generate circles for both layers
  const createCircles = (data, radius, isSecond = false) => {
    return chunkIt(data, 7).map(chunk => {
      if (chunk.length !== 7) return '';
      const [x, y, r, h, s, l, a] = chunk;
      const cx = size / 2 + (x * size) / 2;
      const cy = y * size;
      const rad = r * radius;
      return `
        <circle 
          cx="${cx}" cy="${cy}" r="${rad}"
          fill="hsla(${h * 360},${s * 100}%,${l * 100}%,${a})"
          style="${isSecond ? 'mix-blend-mode:multiply;' : ''}"
        />
        <circle 
          cx="${size - cx}" cy="${cy}" r="${rad}"
          fill="hsla(${h * 360},${s * 100}%,${l * 100}%,${a})"
          style="${isSecond ? 'mix-blend-mode:multiply;' : ''}"
        />
      `;
    }).join('');
  };

  let svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>${bgGradient}</defs>
      <rect width="${size}" height="${size}" fill="url(#bg)"/>
      ${createCircles(decoded[0], 0.42 * size)}
      ${createCircles(decoded[1], 0.125 * size, true)}
    </svg>
  `;
  if (embed) {
    const embedData = { pub, }
    if (embed && embed == true) { embedData.content = embed }
    svg = embedInImage(svg, embedData, 'svg')
  }

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}