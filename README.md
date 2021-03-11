# Avatar generator for GUN public keys

It takes a public key of 88 symbols and creates a base64 code to be set to an img tag. It converts key symbols to coordinates and colors (with alpha) for a couple of circles, that are placed on one side of a square canvas. Then the canvas gets reflected to create a nice symmetric 'face' to be used as an avatar for a gun user.

## Install

```
npm i gun-avatar
```

## Usage

### 1. HTML img tag with `data-pub` attribute

You can just add `avatar` class to an img tag and add `data-pub` attribute with the pub key. Then just adding the `import 'gun-avatar'` to your script will fill them all with base64 picture data. You can style the avatar as you want.

```html
<img class="gun-avatar" data-pub="YZOBPSkw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8">
```

### 2. JS function

just import the function and use it to generate the base64 string to place into the src attribute with your favourite library or vanilla js.

```javascript
import {gunAvatar} from 'gun-avatar'

const pub = 'YZOBPSkw75Ute2tFhdjDQgzR-GsGhlfSlZxgEZKuquI.2F-j9ItJY44U8vcRAsj-5lxnECG5TDyuPD8gEiuInp8'

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("avatar").src = gunAvatar(pub)
});  
```


### ROAD MAP

- [ ] make the mirroring canvas work in Safari - currently it's not doing it properly
- [ ] make adjustable canvas size with consistent result
- [ ] add more options to customize the view of the avatars
  - [ ] contrast, saturation
  - [ ] dark mode
- [ ] adjustable ouput size for smaller picture strings

