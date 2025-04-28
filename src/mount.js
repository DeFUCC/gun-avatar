import { gunAvatar } from './main'

export function mountClass(elClass = "gun-avatar") {
  document.addEventListener("DOMContentLoaded", () => {
    let avatars = document.getElementsByClassName(elClass);
    for (let i in avatars) {
      const img = avatars[i];
      if (img.dataset.round !== "false") {
        img.style.borderRadius = "100%";
      }

      let embed = img.dataset.embed;
      if (img.dataset.embed !== 'true') {
        try {
          embed = JSON.parse(img.dataset.embed);
        } catch (e) {
          console.warn('Invalid content JSON in data-embed attribute');
        }
      }

      img.src = gunAvatar({
        pub: img.dataset.pub,
        size: Number(img.dataset.size),
        dark: Boolean(img.dataset.dark),
        draw: img.dataset.draw,
        reflect: img.dataset.reflect !== "false",
        svg: img.dataset.svg,
        round: Boolean(img.dataset.round),
        embed: embed === "false" ? false : embed || true
      });
    }
  });
}

export function mountElement(elName = "gun-avatar") {
  let initiated = false;
  if (initiated) return;

  class Avatar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      /** @type {HTMLImageElement} */
      this.img = document.createElement("img");
      this.shadowRoot.append(this.img);
    }

    render() {
      this.pub = this.getAttribute("pub") || "1234123455Ute2tFhdjDQgzR-1234lfSlZxgEZKuquI.2F-j1234434U1234Asj-5lxnECG5TDyuPD8gEiuI123";
      this.size = this.hasAttribute("size") ? Number(this.getAttribute("size")) : 400;
      this.draw = this.getAttribute("draw") || "circles";
      this.reflect = this.hasAttribute("reflect") ? this.getAttribute("reflect") !== "false" : true;
      this.round = this.hasAttribute("round") || this.getAttribute("round") === "";
      this.dark = this.hasAttribute("dark") ? this.getAttribute("dark") != "" : false;
      this.embed = this.hasAttribute("embed") ? this.getAttribute("embed") !== "false" : true;

      this.svg = this.hasAttribute("dark") && this.getAttribute("dark");

      this.p3 = this.hasAttribute("p3") ? this.getAttribute("p3") !== "false" : true;

      let embed = this.getAttribute("embed");
      if (this.getAttribute("embed")) {
        try {
          embed = JSON.parse(this.getAttribute("embed"));
        } catch (e) {
          console.warn('Invalid content JSON in embed attribute');
        }
      }

      this.img.style.borderRadius = this.round ? "100%" : "0%";

      this.img.src = gunAvatar({
        pub: this.pub,
        size: this.size,
        dark: this.dark,
        draw: this.draw,
        reflect: this.reflect,
        round: this.round,
        svg: this.svg,
        embed: embed === "false" ? false : embed || true,
        p3: this.p3
      });
    }

    connectedCallback() {
      this.render();
    }

    static get observedAttributes() {
      return ["pub", "round", "size", "dark", "draw", "reflect", "embed", "p3"];
    }

    attributeChangedCallback() {
      this.render();
    }
  }

  customElements.define(elName, Avatar);
  initiated = true;
}
