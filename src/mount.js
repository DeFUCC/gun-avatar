import { gunAvatar } from './main'

/**
 * Mounts gun-avatar functionality to existing img elements with a specified class
 * @param {string} [elClass="gun-avatar"] - Class name to look for
 */
export function mountClass(elClass = "gun-avatar") {
  document.addEventListener("DOMContentLoaded", () => {
    /** @type {HTMLCollectionOf<HTMLImageElement>} */
    let avatars = document.getElementsByClassName(elClass);
    for (let i in avatars) {
      const img = avatars[i];
      if (img.dataset.round !== "false") {
        img.style.borderRadius = "100%";
      }
      img.src = gunAvatar({
        pub: img.dataset.pub,
        size: Number(img.dataset.size),
        dark: Boolean(img.dataset.dark),
        draw: img.dataset.draw,
        reflect: img.dataset.reflect !== "false",
      });
    }
  });
}

/**
 * Mounts a custom gun-avatar web component
 * @param {string} [elName="gun-avatar"] - Name for the custom element
 */
export function mountElement(elName = "gun-avatar") {
  let initiated = false;
  if (initiated) return;

  /**
   * Gun Avatar Custom Element
   * @customElement gun-avatar
   */
  class Avatar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      /** @type {HTMLImageElement} */
      this.img = document.createElement("img");
      this.shadowRoot.append(this.img);
    }

    /**
     * Renders the avatar based on current attributes
     */
    render() {
      this.pub = this.hasAttribute("pub")
        ? this.getAttribute("pub")
        : "1234123455Ute2tFhdjDQgzR-1234lfSlZxgEZKuquI.2F-j1234434U1234Asj-5lxnECG5TDyuPD8gEiuI123";
      this.size = this.hasAttribute("size") ? Number(this.getAttribute("size")) : 400;
      this.draw = this.hasAttribute("draw")
        ? this.getAttribute("draw")
        : "circles";
      this.reflect = this.hasAttribute("reflect")
        ? this.getAttribute("reflect") !== "false"
        : true;
      this.round = this.hasAttribute("round") || this.getAttribute("round") === "";

      this.img.style.borderRadius = this.round ? "100%" : "0%";
      this.dark = this.hasAttribute("dark") || this.getAttribute("dark") === "";

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

    /**
     * @returns {string[]} List of observed attributes
     */
    static get observedAttributes() {
      return ["pub", "round", "size", "dark", "draw", "reflect"];
    }

    attributeChangedCallback() {
      this.render();
    }
  }

  customElements.define(elName, Avatar);
  initiated = true;
}
