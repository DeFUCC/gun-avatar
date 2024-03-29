const cache = {}; // stores already generated avatars

export interface AvatarOptions {
  pub: string
  size?: number
  dark?: boolean
  draw?: 'circles' | 'squares'
  reflect?: boolean
}

// actual generator function, returns the base64 string

export function gunAvatar({
  pub,
  size = 200,
  dark = false,
  draw = "circles",
  reflect = true
}: AvatarOptions): string {

  if (!validatePub(pub)) return ''
  if (!document) return ''

  const key = JSON.stringify(arguments[0])
  if (cache?.[key]) {
    return cache[key]
  }

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
  }

  cache[key] = canvas.toDataURL();
  return cache[key];
}

// FUNCTIONS

export function validatePub(pub: string): boolean {
  if (
    pub
    && typeof pub == 'string'
    && pub.length == 87
    && pub.split('.').length == 2
  ) {
    return true
  } else {
    return false
  }
}

export function parsePub(pub: string) {
  const split = pub.split(".");
  const decoded = split.map((single) => decodeUrlSafeBase64(single));
  const finals = decoded.map(d => d[42])
  const averages = decoded.map(e => e.reduce((acc, d) => acc + d) / e.length)
  const angles = split.map(part => fromB64(part) % 360)
  const colors = split.map((s, i) => `hsl(${angles[i]} ${finals[i] * 100}% ${averages[i] * 100}%)`)
  return {
    finals,
    decoded,
    angles,
    averages,
    colors,
  }
}

// https://datatracker.ietf.org/doc/html/rfc4648#section-5
const symbols =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export function toB64(x: number): string { return x.toString(2).split(/(?=(?:.{6})+(?!.))/g).map(v => symbols[parseInt(v, 2)]).join("") }

export function fromB64(x: string): number { return x.split("").reduce((s, v) => s * 64 + symbols.indexOf(v), 0) }

export function decodeUrlSafeBase64(st: string): number[] {
  const symbolArray = symbols.split("");
  let arr = [];
  let i = 0;
  for (let letter of st) {
    arr[i++] = symbolArray.indexOf(letter) / 64;
  }
  return arr;
}

export function chunkIt(list: number[], chunkSize = 3) {
  return [...Array(Math.ceil(list.length / chunkSize))].map(() =>
    list.splice(0, chunkSize)
  );
}

function drawGradient(
  {
    ctx,
    top = 0,
    bottom = 150,
    size = 200,
    dark = false,
  }: {
    ctx: CanvasRenderingContext2D,
    top: number,
    bottom: number,
    size: number,
    dark?: boolean
  }) {
  var gradient = ctx.createLinearGradient(0, 0, 0, size);
  let offset = 70;
  if (dark) offset = 0;
  gradient.addColorStop(0, `hsla(0,0%,${offset + top * 30}%)`);
  gradient.addColorStop(1, `hsla(0,0%,${offset + bottom * 30}%)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}

function drawSquares(data: number[], ctx: CanvasRenderingContext2D, size: number,) {
  const chunks = chunkIt(data, 14);
  chunks.forEach((chunk) => {
    if (chunk.length == 14) {
      let x = chunk[0] * size;
      let y = chunk[1] * size;
      let r = size / 8 + chunk[2] * size * (7 / 8);
      let angle = chunk[13] * Math.PI;
      let h1 = chunk[3] * 360;
      let s1 = chunk[4] * 100;
      let l1 = chunk[5] * 100;
      let a1 = chunk[6];
      let x1 = chunk[7];
      let h2 = chunk[8] * 360;
      let s2 = chunk[9] * 100;
      let l2 = chunk[10] * 100;
      let a2 = chunk[11];
      let x2 = chunk[12];
      const gradient = ctx.createLinearGradient(
        x + r * x1,
        0,
        x + r * x2,
        size
      );
      gradient.addColorStop(0, `hsla(${h1},${s1}%,${l1}%,${a1})`);
      gradient.addColorStop(1, `hsla(${h2},${s2}%,${l2}%,${a2})`);
      ctx.fillStyle = gradient;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillRect(-r / 2, -r / 2, r, r);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  });
}

function drawCircles(data: number[], ctx: CanvasRenderingContext2D, size: number, radius: number) {

  const chunks = chunkIt(data, 7);
  chunks.forEach((chunk) => {
    if (chunk.length == 7) {
      let x = size / 2 + (chunk[0] * size) / 2;
      let y = chunk[1] * size;
      let r = chunk[2] * radius;
      let h = chunk[3] * 360;
      let s = chunk[4] * 100;
      let l = chunk[5] * 100;
      let a = chunk[6];

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      ctx.fillStyle = `hsla(${h},${s}%,${l}%,${a})`;
      ctx.closePath();
      ctx.fill();
    }
  });
}