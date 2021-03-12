# Avatar generator for GUN public keys

![avatars](https://raw.githubusercontent.com/DeFUCC/gun-avatar/master/avatars.gif)

It takes a public key of 88 symbols and creates a base64 code to be set to an img tag. It converts key symbols to coordinates and colors (with alpha) for a couple of circles, that are placed on one side of a square canvas. Then the canvas gets reflected to create a nice symmetric 'face' to be used as an avatar for a gun user.

## Installation
### npm / pnpm
`npm i gun-avatar` in a build environment 

### browser
Add `<script src="https://unpkg.com/gun-avatar"></script>` to your html

## Usage

### 1. HTML img tag with `data-pub` attribute

Add the script to the page and then add `gun-avatar` class to an img tag along with add `data-pub` attribute with the pub key. `gun-avatar` automatically finds them on page and fills with corresponding base64 picture data. You can set `data-size` in px and style the avatar with css as you want.

```html
<script src="https://unpkg.com/gun-avatar"></script>
<img class="gun-avatar" data-size="200" data-pub="YZOBPSkw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8">
```

### 2. JS function

Install the `gun-avatar` package and import the `gunAvatar` function. Then you can use it to generate the base64 string to place into the src attribute with your favourite library or vanilla js. Function get two parameters: `pub` and `size` in px.

```javascript
import {gunAvatar} from 'gun-avatar'

const pub = 'YZOBPSkw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8'

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("avatar").src = gunAvatar(pub, 200)
});  
```


### ROAD MAP

- [ ] make the mirroring canvas work in Safari - currently it's not doing it properly
- [x] make adjustable canvas size with consistent result
- [ ] add more options to customize the view of the avatars
  - [ ] contrast, saturation
  - [ ] dark mode

