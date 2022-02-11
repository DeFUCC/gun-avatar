import "./patch.js";

export function mountClass(elClass = "gun-avatar") {
  // add src base64 to every <img class="avatar" data-pub="YourUserPub">
  document.addEventListener("DOMContentLoaded", () => {
    let avatars = document.getElementsByClassName(elClass);
    for (let img of avatars) {
      if (img.dataset.round != "false") {
        img.style.borderRadius = "100%";
      }
      img.src = gunAvatar({
        pub: img.dataset.pub,
        size: img.dataset.size,
        dark: img.dataset.dark,
        draw: img.dataset.draw,
        reflect: img.dataset.reflect != "false",
      });
    }
  });
}

export function mountElement(elName = "gun-avatar") {
  let initiated = false;
  if (!document || initiated) return;

  // <gun-avatar pub="***" custom element
  class Avatar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.img = document.createElement("img");
      this.shadowRoot.append(this.img);
    }
    render() {
      this.pub = this.hasAttribute("pub")
        ? this.getAttribute("pub")
        : "1234123455Ute2tFhdjDQgzR-1234lfSlZxgEZKuquI.2F-j1234434U1234Asj-5lxnECG5TDyuPD8gEiuI123";
      this.size = this.hasAttribute("size") ? this.getAttribute("size") : 400;
      this.draw = this.hasAttribute("draw")
        ? this.getAttribute("draw")
        : "circles";
      this.reflect = this.hasAttribute("reflect")
        ? this.getAttribute("reflect") != "false"
        : true;
      this.round =
        this.hasAttribute("round") || this.getAttribute("round") == ""
          ? true
          : false;
      if (this.round) {
        this.img.style.borderRadius = "100%";
      } else {
        this.img.style.borderRadius = "0%";
      }
      this.dark =
        this.hasAttribute("dark") || this.getAttribute("dark") == ""
          ? true
          : false;
      this.img.src = gunAvatar({
        pub: this.pub,
        size: this.size,
        dark: this.dark,
        draw: this.draw,
        reflect: this.reflect,
      });
    }
    connectedCallback() {
      this.render();
    }
    static get observedAttributes() {
      return ["pub", "round", "size", "dark", "draw", "reflect"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      this.render();
    }
  }

  customElements.define(elName, Avatar);

  initiated = true;
}

const cache = {}; // stores already generated avatars

// actual generator function, returns the base64 string

export function gunAvatar({
  pub,
  size = 800,
  dark = false,
  draw = "circles",
  reflect = true,
} = {}) {
  if (!pub) return;
  if (cache?.[draw]?.[size]?.[pub])
    return cache[dark ? "dark" : "light"][draw][size][pub];

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  const split = pub.split(".");
  const decoded = split.map((single) => decodeUrlSafeBase64(single));

  drawGradient(ctx, decoded[0][42], decoded[1][42], size, dark);
  if (draw == "circles") {
    drawCircles(decoded[0], ctx, size, 0.42 * size);
    ctx.globalCompositeOperation = "multiply";
    drawCircles(decoded[1], ctx, size, 0.125 * size);
  }

  if (draw == "squares") {
    ctx.filter = "blur(20px)";
    drawSquares(decoded[0], ctx, size);
    ctx.filter = "blur(0px)";
    ctx.globalCompositeOperation = "color-burn";
    drawSquares(decoded[1], ctx, size);
  }
  if (reflect) {
    ctx.globalCompositeOperation = "source-over";
    ctx.scale(-1, 1);
    ctx.translate(-size / 2, 0);
    ctx.drawImage(canvas, size / 2, 0, size, size, 0, 0, size, size);
  }
  let mode = dark ? "dark" : "light";
  cache[mode] = cache[mode] || {};
  cache[mode][draw] = cache[mode][draw] || {};
  cache[mode][draw][size] = cache[mode][draw][size] || {};
  cache[mode][draw][size][pub] = canvas.toDataURL();
  return cache[mode][draw][size][pub];
}

// FUNCTIONS

function drawGradient(ctx, top, bottom, size, dark = false) {
  var gradient = ctx.createLinearGradient(0, 0, 0, size);
  let offset = 70;
  if (dark) offset = 0;
  gradient.addColorStop(0, `hsla(0,0%,${offset + top * 30}%)`);
  gradient.addColorStop(1, `hsla(0,0%,${offset + bottom * 30}%)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}

function drawSquares(data, ctx, size) {
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

function drawCircles(data, ctx, size, radius) {
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

function decodeUrlSafeBase64(st) {
  const symbols =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const symbolArray = symbols.split("");
  let arr = [];
  let i = 0;
  for (let letter of st) {
    arr[i++] = symbolArray.indexOf(letter) / 64;
  }
  return arr;
}

function chunkIt(list, chunkSize = 3) {
  return [...Array(Math.ceil(list.length / chunkSize))].map(() =>
    list.splice(0, chunkSize)
  );
}
