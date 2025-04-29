# Avatar generator for GUN SEA public keys

Gun-Avatar takes a public key `string` 88 symbols long and creates a `base64` encoded picture to be set as a source for an `<img>` tag.

- Very few dependencies
- < 30 Kb filesize
- ES6 modules and web-components
- PNG canvas images with SVG fallback
- Data embedding

<a href="https://www.npmjs.com/package/gun-avatar" target="_blank"><img src="https://img.shields.io/npm/v/gun-avatar?color=E23C92&logo=npm&style=for-the-badge" alt="NPM version"></a>

![Gun-avatar](https://gun-avatar.js.org/avatars-l.jpg)

## How does it work?

SEA public key consists of 87 symbols including a dot in the middle, so we can consider it as `(7*4+1)*2`. So the steps to generate a unique picture for the key are like that:

1. We split the public key in two halves by the dot `.`.
2. We cut one digit from each part of the key. It gives us a pair of numbers, that we use to generate a grayscale vertical background gradient (light or dark)
3. Then we break the remaining 42 characters of each part into 4 groups of 7 numbers. Each group describes a circle: it's coordinates (x,y), it's radius (r) and 4 color parameters in the RGBA model (r,g,b,a). We place these circles on one side of a square canvas.
4. Circles from the first part of the key are bigger and are placed with normal composite mode. Circles from the second part are smaller and placed with 'lighten' composite mode.
5. Then half of the canvas gets reflected to create a nice symmetric 'portrait' to be used as an avatar of a SEA public key.

## How to use Gun-Avatar?

There are multiple ways to convert you keys into visual representations. The easiest and most cross-platform is to mount a custom element and

### 1. Custom HTML element

After you add the script to the page you get a custom element `<gun-avatar />` for ease of use. The attributes are reactive to changes. Set `dark` attribute if you need a dark version of the avatar. Set `round` attribute to get a rounded image. Also `size` in pixels is available.

```html
<html>
	<script type="module">
		import { mountElement } from "https://cdn.skypack.dev/gun-avatar";
		mountElement();
	</script>
	<body>
		<gun-avatar
			pub="0000000kw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8"
			size="300"
			round
			dark
			reflect
			draw="circles"
		/>
	</body>
</html>
```

You can set up a custom element name with `mountElement('avatar')`

### 2. HTML img tag with `data-pub` attribute

Add the script to the page and then add `gun-avatar` class to an img tag along with add `data-pub` attribute with the pub key. `gun-avatar` automatically finds them on page and fills with corresponding base64 picture data. You can set `data-size` in px and style the avatar with css as you want. Also there's `data-dark` option to generate a dark version of the same avatar. You can add `.gun-avatar {border-radius: 100%}` to tour css to make it round.

```html
<html>
	<script type="module">
		import { mountClass } from "https://cdn.skypack.dev/gun-avatar";
		mountClass();
	</script>
	<body>
		<img
			class="gun-avatar"
			data-size="200"
			data-draw="squares"
			data-reflect="false"
			data-pub="YZOBPSkw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8"
		/>
	</body>
</html>
```

You can set up a custom class name with `mountClass('avatar')`

### 3. JS function

Install the NPM script from with a tool of your choice. Then you can `import {gunAvatar} from 'gun-avatar'` and use the function to render the avatar. Or simply `import 'gun-avatar'` for custom element use.

```shell
pnpm i gun-avatar
```

Import the `gunAvatar` function from 'gun-avatar'. Then you can use it to generate the base64 string to place into the src attribute with your favourite library or vanilla js. Function gets an object with options: `pub` , `size` in px, `draw` mode, `dark` of not, `reflect` or not.

```html
<html>
	<script type="module">
		import { gunAvatar } from "https://cdn.skypack.dev/gun-avatar";

		const pub =
			"YZOBPSkw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8";

		document.addEventListener("DOMContentLoaded", () => {
			document.getElementById("avatar").src = gunAvatar({ pub, size: 200 });
		});
	</script>
	<body>
		<img id="avatar" />
	</body>
</html>
```

## Full function options

With graceful defaults

```js
const imageBase64 =  gunAvatar({
    pub, // 88 symbols standard SEA public key
    size = 200, // square side size in pixels
    draw = "circles", // or 'squares'
    reflect = true, // vertical symmetry for more life-like look
    round = true, // applies circular tranparency mask
	dark = false, // global gradient can be darker
    embed = true, // or any string data to embed into the PNG or SVG file, can be extracted later. Very convenient place for storing encrypted keys right in the avatar file.
    svg = true, // or true or 'interactive'
    p3 = true, // disable P3 color space to get back to  rgb color values
  })
```

### Draw modes

1. **Circles** - the default mode. Suitable for generating personal avatars. Assumes `reflect = true`.

2. **Squares** - gradient squares over blurred ones. Useful for rooms backgrounds. Assumes `reflect = false`.

![rooms](https://raw.githubusercontent.com/DeFUCC/gun-avatar/master/rooms.gif)

```html
<gun-avatar
	pub="0000000kw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8"
	size="300"
	reflect="false"
	draw="squares"
></gun-avatar>
```

### P3 colors

With v.2.2.0 we switched to high dynamic range P3 colors that are now widely supported by modern device screens. Almost everyone will notice the vivid and captivating new color combinations. For fallback we still provide an RGB color option - good for older devices and export file compatibility.

### SVG format

Vector format output format. Infinite resolution, pure geometry, server side generation compatible, smaller in size. Optimal solution, became default with v.2.2.0. And also now we can attach encrypted metadata to SVG images as well.

### Interactive SVG

```vue
<object
	class="shadow-2xl rounded-full z-2 w-full"
	type="image/svg+xml"
	:key="state.pub"
	:data="
		gunAvatar({
			pub: state.pub,
			svg: 'interactive',
			size: 1000,
			dark: state.options.dark,
		})
	"
></object>
```

From version 2.2.0+ we now have full roadmap complete with amazing smooth animated reactions of both circles and squares backgrounds. Set `svg: 'interactive'` and embed the output in an `<object>` tag to add those subtle reactive movements to your avatars and rooms.

### PNG format

Heavier and more prone to strange overlay artifacts and there is certain beauty to it! Especially given the control you have on the size. Generate just enough pixel as get minimal memory footprint where needed. And may be you would enjoy some of those really beautiful ones rendered as high resolution wallpapers. Needs HTML Canvas to generate pictures and thus works only in browsers.

### Data embedding

You can embed any arbitrary string into both SVG and PNG images - very useful for an storing encrypted keypair right in the user's avatar. Just drop the image to the auth form and you're logged in. Data is stored in JSON format. Data is stored as plain text and has to be encrypted/decrypted by yourself.

```json
{
	"pub": "0000000kw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8",
	"content": "your data provided to the embed"
}
```

An async `extractFromFile()` function is provided to get the embedded content back from both image formats. For SVG we use simple metadata tags, for PNG we use tEXT chunks created for that purpose.

```js
import { extractFromFile } from "https://cdn.skypack.dev/gun-avatar";

document.getElementById("input").addEventListener("change", async (event) => {
	let content = await extractFromFile(event.target.files[0]);
	console.log(content);
});
```

![avatars](https://gun-avatar.js.org/avatars.jpg)
