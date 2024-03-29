import { gunAvatar } from './main'

export function mountClass(elClass = "gun-avatar") {
	// add src base64 to every <img class="avatar" data-pub="YourUserPub">
	document.addEventListener("DOMContentLoaded", () => {
		let avatars = document.getElementsByClassName(elClass) as HTMLCollectionOf<HTMLImageElement>;
		for (let i in avatars) {
			const img = avatars[i]
			if (img.dataset.round != "false") {
				img.style.borderRadius = "100%";
			}
			img.src = gunAvatar({
				pub: img.dataset.pub,
				size: Number(img.dataset.size),
				dark: Boolean(img.dataset.dark),
				draw: img.dataset.draw as 'circles' | 'squares',
				reflect: img.dataset.reflect != "false",
			});
		}
	});
}

export function mountElement(elName = "gun-avatar") {
	let initiated = false;
	if (initiated) return;



	// <gun-avatar pub="***" custom element
	class Avatar extends HTMLElement {
		img: HTMLImageElement
		pub: string
		size: number
		draw: "circles" | "squares"
		reflect: boolean
		dark: boolean
		round: boolean
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
			this.size = this.hasAttribute("size") ? Number(this.getAttribute("size")) : 400;
			this.draw = this.hasAttribute("draw")
				? this.getAttribute("draw") as "circles" | "squares"
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
		attributeChangedCallback() {
			this.render();
		}
	}

	customElements.define(elName, Avatar);

	initiated = true;
}