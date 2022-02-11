# Avatar generator for GUN public keys

<a href="https://www.npmjs.com/package/gun-avatar" target="_blank"><img src="https://img.shields.io/npm/v/gun-avatar?color=E23C92&logo=npm&style=for-the-badge" alt="NPM version"></a>

[Try it on codepen](https://codepen.io/Davay/pen/eYGeGMZ)

![avatar](https://raw.githubusercontent.com/DeFUCC/gun-avatar/master/avatars.gif)

It takes a public key of 88 symbols and creates a base64 code to be set to an img tag. SEA public key consists of 87 symbols including a dot in the middle, so we can consider it as `(7*4+1)*2`.

So the steps to generate a unique picture for the key are like that:

1. We cut one digit from each part of the key. It gives us a pair of numbers, that we use to generate a grayscale vertical background gradient (light or dark)
2. Then we break the remaining 42 characters of each part into 4 groups of 7 numbers. Each group describes a circle: it's coordinates (x,y), it's radius (r) and 4 color parameters in the HSLA model (h,s,l,a). We place these circles on one side of a square canvas.
3. Circles from the first part of the key are bigger and are placed with normal composite mode. Circles from the second part are smaller and placed with 'lighten' composite mode.
4. Then half of the canvas gets reflected to create a nice symmetric 'portrait' to be used as an avatar of a SEA public key.

![avatars](https://raw.githubusercontent.com/DeFUCC/gun-avatar/master/avatar-list.png)

## How to install?

### npm / pnpm

Run `npm i gun-avatar` in a build environment. Then you can `import {gunAvatar} from 'gun-avatar'` and use the function to render the avatar. Or just `import 'gun-avatar'` for custom element use.

## How to use Gun-avatar?

### 1. Custom HTML element

After you add the script to the page you get a custom element `<gun-avatar />` for ease of use. The attributes are reactive to changes. Set `dark` attribute if you need a dark version of the avatar. Set `round` attribute to get a rounded image. Also `size` in pixels is available.

```html
<script type="module">
  import { mountElement } from "https://cdn.skypack.dev/gun-avatar";
  mountElement();
</script>
<gun-avatar
  pub="0000000kw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8"
  size="300"
  round
  dark
  reflect
  draw="circles"
/>
```

You can set up a custom element name with `mountElement('avatar')`

### 2. HTML img tag with `data-pub` attribute

Add the script to the page and then add `gun-avatar` class to an img tag along with add `data-pub` attribute with the pub key. `gun-avatar` automatically finds them on page and fills with corresponding base64 picture data. You can set `data-size` in px and style the avatar with css as you want. Also there's `data-dark` option to generate a dark version of the same avatar. You can add `.gun-avatar {border-radius: 100%}` to tour css to make it round.

```html
<script type="module">
  import { mountClass } from "https://cdn.skypack.dev/gun-avatar";
  mountClass();
</script>
<img
  class="gun-avatar"
  data-size="200"
  data-draw="squares"
  data-reflect="false"
  data-pub="YZOBPSkw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8"
/>
```

You can set up a custom class name with `mountClass('avatar')`

### 3. JS function

Install the `gun-avatar` package and import the `gunAvatar` function. Then you can use it to generate the base64 string to place into the src attribute with your favourite library or vanilla js. Function gets an object with options: `pub` , `size` in px, `draw` mode, `dark` of not, `reflect` or not.

```javascript
import { gunAvatar } from "https://cdn.skypack.dev/gun-avatar";

const pub =
  "YZOBPSkw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("avatar").src = gunAvatar({ pub, size: 200 });
});
```

### MODES

1. **Circles** - the default mode.

2. **Squares** - gradient squares over blurred ones (useful for rooms)

![rooms](https://raw.githubusercontent.com/DeFUCC/gun-avatar/master/rooms.gif)

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
- [x] add more options to customize the view of the avatars
- [x] custom element mount
- [x] dark mode
- [x] editable class and element to mount
- [x] add more draw modes
  - [x] `circles`
  - [x] `squares`
