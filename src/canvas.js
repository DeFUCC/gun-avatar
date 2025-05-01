import { chunkIt, parsePub } from "./pub";
import { embedInPNG } from "./embed";


export function renderCanvasAvatar({ pub, size, dark, draw, reflect, round, embed, p3 }) {


  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  const { decoded, finals } = parsePub(pub)

  drawGradient({ ctx, top: finals[0], bottom: finals[1], size, dark });

  if (draw == "squares") {
    ctx.filter = "blur(20px)";
    drawSquares(decoded[0], ctx, size, p3);
    ctx.filter = "blur(0px)";
    ctx.globalCompositeOperation = "color-burn";
    drawSquares(decoded[1], ctx, size, p3);
  } else {
    drawCircles(decoded[0], ctx, size, 0.42 * size, p3);
    ctx.globalCompositeOperation = "multiply";
    drawCircles(decoded[1], ctx, size, 0.125 * size, p3);
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
    const embedBuffer = embedInPNG(canvas, embedData)
    if (embedBuffer) {
      const blob = new Blob([embedBuffer], { type: 'image/png' })
      image = URL.createObjectURL(blob)
    }
  }

  return image;
}


function drawGradient({ ctx, top = 0, bottom = 150, size = 200, dark = false }) {
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  const offset = dark ? 0 : 70;
  gradient.addColorStop(0, `hsl(0,0%,${offset + top * 30}%)`);
  gradient.addColorStop(1, `hsl(0,0%,${offset + bottom * 30}%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}

function drawSquares(data, ctx, size, p3) {
  chunkIt(data, 14).forEach(chunk => {
    if (chunk.length === 14) {
      let [x, y, rRaw, h1, s1, l1, a1, x1, h2, s2, l2, a2, x2, angle] = chunk;
      let r = size / 8 + rRaw * size * (7 / 8);
      const gradient = ctx.createLinearGradient(
        x * size + r * x1, 0,
        x * size + r * x2, size
      );
      gradient.addColorStop(0, p3 ? `color(display-p3 ${h1} ${s1} ${l1} / ${a1})` : `rgba(${h1 * 255}, ${s1 * 255}, ${l1 * 255}, ${a1})`);
      gradient.addColorStop(1, p3 ? `color(display-p3 ${h2} ${s2} ${l2} / ${a2})` : `rgba(${h2 * 255}, ${s2 * 255}, ${l2 * 255}, ${a2})`);
      ctx.fillStyle = gradient;
      ctx.translate(x * size, y * size);
      ctx.rotate(angle * Math.PI);
      ctx.fillRect(-r / 2, -r / 2, r, r);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  });
}

function drawCircles(data, ctx, size, radius, p3) {
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
      ctx.fillStyle = p3 ? `color(display-p3 ${h} ${s} ${l} / ${a})` : `rgba(${h * 255}, ${s * 255}, ${l * 255}, ${a})`;
      ctx.closePath();
      ctx.fill();
    }
  });
}