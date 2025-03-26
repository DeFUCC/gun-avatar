---
title: Guide
---

# Avatar generator for GUN public keys

![avatar](/avatars.gif)

<a href="https://www.npmjs.com/package/gun-avatar" target="_blank"><img src="https://img.shields.io/npm/v/gun-avatar?color=E23C92&logo=npm&style=for-the-badge" alt="NPM version"></a>

Gun-Avatar takes a public key `string` 88 symbols long and creates a `base64` encoded picture to be set as a source for an `<img>` tag.

SEA public key consists of 87 symbols including a dot in the middle, so we can consider it as `(7*4+1)*2`. So the steps to generate a unique picture for the key are like that:

1. We cut one digit from each part of the key. It gives us a pair of numbers, that we use to generate a grayscale vertical background gradient (light or dark)
2. Then we break the remaining 42 characters of each part into 4 groups of 7 numbers. Each group describes a circle: it's coordinates (x,y), it's radius (r) and 4 color parameters in the HSLA model (h,s,l,a). We place these circles on one side of a square canvas.
3. Circles from the first part of the key are bigger and are placed with normal composite mode. Circles from the second part are smaller and placed with 'lighten' composite mode.
4. Then half of the canvas gets reflected to create a nice symmetric 'portrait' to be used as an avatar of a SEA public key.

![avatars](/avatar-list.png)

## How to install?

### npm / pnpm / yarn

Install the script from `npm` with a tool of your choice.

```shell
npm i gun-avatar
```

Then you can `import {gunAvatar} from 'gun-avatar'` and use the function to render the avatar. Or simply `import 'gun-avatar'` for custom element use.

## How to use?

### 1. Custom HTML element

After you add the script to the page you get a custom element `<gun-avatar />` for ease of use. The attributes are reactive to changes.

Available attributes:

- `pub` - GUN public key (required)
- `size` - size in pixels (default: 400)
- `dark` - enable dark mode
- `round` - make avatar circular
- `reflect` - enable symmetrical reflection (default: true)
- `draw` - rendering mode: "circles" or "squares" (default: "circles")
- `embed` - enable data embedding or provide data to embed (default: true)

```html
<gun-avatar pub="your-pub-key" embed='{"name":"John","role":"admin"}' />

<!-- Just embed the pub key -->
<gun-avatar pub="your-pub-key" embed />

<!-- Disable embedding -->
<gun-avatar pub="your-pub-key" embed="false" />
```

```html
<script type="module">
	import { mountElement } from "gun-avatar";
	mountElement();
</script>

<gun-avatar
	pub="0000000kw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8"
	size="300"
	embed='{"name":"John","role":"admin"}'
	round
	dark
/>
```

### 2. HTML img tag with class

Add the script and use the `gun-avatar` class with data attributes:

Available data attributes:

- `data-pub` - GUN public key (required)
- `data-size` - size in pixels
- `data-dark` - enable dark mode
- `data-round` - make avatar circular
- `data-reflect` - enable reflection
- `data-draw` - rendering mode
- `data-embed` - data embedding

```html
<script type="module">
	import { mountClass } from "gun-avatar";
	mountClass();
</script>

<img
	class="gun-avatar"
	data-size="200"
	data-draw="squares"
	data-embed='{"room":"lobby"}'
	data-pub="YZOBPSkw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8"
/>
```

### 3. JS function

The `gunAvatar` function accepts an options object:

```javascript
import { gunAvatar, extractFromFile } from "gun-avatar";

const options = {
	pub: "your-pub-key", // required
	size: 200, // default: 400
	dark: false, // default: false
	draw: "circles", // "circles" or "squares"
	reflect: true, // default: true
	round: true, // default: false
	embed: {
		// optional data to embed
		name: "John",
		role: "admin",
	},
};

const avatarSrc = gunAvatar(options);
```

### Data Embedding

Gun-Avatar supports embedding data within the generated images:

```javascript
// Embed just the pub key
const avatar1 = gunAvatar({
	pub: "your-pub-key",
	embed: true,
});

// Embed custom data
const avatar2 = gunAvatar({
	pub: "your-pub-key",
	embed: { name: "John", role: "admin" },
});

// No embedding
const avatar3 = gunAvatar({
	pub: "your-pub-key",
	embed: false,
});
```

1. Embedding during generation:

```javascript
const avatar = gunAvatar({
	pub: "your-pub-key",
	embed: { custom: "data" },
});
```

2. Extracting data from images:

```javascript
import { extractFromFile } from "gun-avatar";

// From File input
fileInput.addEventListener("change", async (e) => {
	const file = e.target.files[0];
	const data = await extractFromFile(file);
	console.log(data); // { pub: "...", content: { custom: "data" } }
});
```

### MODES

1. **Circles** - the default mode.

2. **Squares** - gradient squares over blurred ones (useful for rooms)

![rooms](/rooms.gif)

```html
<gun-avatar
	pub="0000000kw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8"
	size="300"
	reflect="false"
	draw="squares"
></gun-avatar>
```

### ROAD MAP

- [x] make the mirroring canvas work in Safari
- [x] make adjustable canvas size with consistent result
- [x] clipping mask rounding
- [x] add more options to customize the view of the avatars
- [x] custom element mount
- [x] dark mode
- [x] editable class and element to mount
- [x] add more draw modes
- [x] data embedding in PNG/SVG
- [ ] add more draw modes
- [ ] animation support
