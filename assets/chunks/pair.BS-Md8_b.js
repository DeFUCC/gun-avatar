import{c as l,g as P}from"./theme.r3lTMTYy.js";function T(t,e){for(var r=0;r<e.length;r++){const n=e[r];if(typeof n!="string"&&!Array.isArray(n)){for(const a in n)if(a!=="default"&&!(a in t)){const o=Object.getOwnPropertyDescriptor(n,a);o&&Object.defineProperty(t,a,o.get?o:{enumerable:!0,get:()=>n[a]})}}}return Object.freeze(Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}))}var y={exports:{}};y.exports;var b;function v(){return b||(b=1,function(t){typeof self<"u"&&(t.window=self),typeof window<"u"&&(t.window=window);var e=t.window||t,r,n=e.SEA||{};(n.window=t.window)&&(n.window.SEA=n);try{r+""!=typeof MODULE&&(MODULE.exports=n)}catch{}t.exports=n}(y)),y.exports}function p(t){throw new Error('Could not dynamically require "'+t+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var A={},S;function C(){if(S)return A;S=1;var t;if(t+""==typeof btoa){if(t+""==typeof Buffer)try{l.Buffer=p("buffer",1).Buffer}catch{console.log("Please `npm install buffer` or add it to your package.json !")}l.btoa=function(e){return Buffer.from(e,"binary").toString("base64")},l.atob=function(e){return Buffer.from(e,"base64").toString("binary")}}return A}var g,x;function R(){if(x)return g;x=1,C();function t(){}return Object.assign(t,{from:Array.from}),t.prototype=Object.create(Array.prototype),t.prototype.toString=function(e,r,n){e=e||"utf8",r=r||0;const a=this.length;if(e==="hex"){const o=new Uint8Array(this);return[...Array((n&&n+1||a)-r).keys()].map(i=>o[i+r].toString(16).padStart(2,"0")).join("")}if(e==="utf8")return Array.from({length:(n||a)-r},(o,i)=>String.fromCharCode(this[i+r])).join("");if(e==="base64")return btoa(this)},g=t,g}var m,E;function U(){if(E)return m;E=1,C();var t=R();function e(...r){return console.warn("new SafeBuffer() is depreciated, please use SafeBuffer.from()"),e.from(...r)}return e.prototype=Object.create(Array.prototype),Object.assign(e,{from(){if(!Object.keys(arguments).length||arguments[0]==null)throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");const r=arguments[0];let n;if(typeof r=="string"){const o=arguments[1]||"utf8";if(o==="hex"){const i=r.match(/([\da-fA-F]{2})/g).map(s=>parseInt(s,16));if(!i||!i.length)throw new TypeError("Invalid first argument for type 'hex'.");n=t.from(i)}else if(o==="utf8"||o==="binary"){const i=r.length,s=new Uint16Array(i);Array.from({length:i},(f,u)=>s[u]=r.charCodeAt(u)),n=t.from(s)}else if(o==="base64"){const i=atob(r),s=i.length,f=new Uint8Array(s);Array.from({length:s},(u,c)=>f[c]=i.charCodeAt(c)),n=t.from(f)}else o==="binary"?n=t.from(r):console.info("SafeBuffer.from unknown encoding: "+o);return n}if(r.byteLength,r.byteLength?r.byteLength:r.length){let o;return r instanceof ArrayBuffer&&(o=new Uint8Array(r)),t.from(o||r)}},alloc(r,n=0){return t.from(new Uint8Array(Array.from({length:r},()=>n)))},allocUnsafe(r){return t.from(new Uint8Array(Array.from({length:r})))},concat(r){if(!Array.isArray(r))throw new TypeError("First argument must be Array containing ArrayBuffer or Uint8Array instances.");return t.from(r.reduce((n,a)=>n.concat(Array.from(a)),[]))}}),e.prototype.from=e.from,e.prototype.toString=t.prototype.toString,m=e,m}var w,k;function O(){if(k)return w;k=1;const t=v(),e={Buffer:U()};var r={},n;if(JSON.parseAsync=JSON.parseAsync||function(o,i,s){var f;try{i(f,JSON.parse(o,s))}catch(u){i(u)}},JSON.stringifyAsync=JSON.stringifyAsync||function(o,i,s,f){var u;try{i(u,JSON.stringify(o,s,f))}catch(c){i(c)}},e.parse=function(o,i){return new Promise(function(s,f){JSON.parseAsync(o,function(u,c){u?f(u):s(c)},i)})},e.stringify=function(o,i,s){return new Promise(function(f,u){JSON.stringifyAsync(o,function(c,D){c?u(c):f(D)},i,s)})},t.window&&(e.crypto=t.window.crypto||t.window.msCrypto,e.subtle=(e.crypto||r).subtle||(e.crypto||r).webkitSubtle,e.TextEncoder=t.window.TextEncoder,e.TextDecoder=t.window.TextDecoder,e.random=o=>e.Buffer.from(e.crypto.getRandomValues(new Uint8Array(e.Buffer.alloc(o))))),!e.TextDecoder){const{TextEncoder:o,TextDecoder:i}=p((n+""==typeof MODULE?".":"")+"./lib/text-encoding");e.TextDecoder=i,e.TextEncoder=o}if(!e.crypto)try{var a=p("crypto",1);Object.assign(e,{crypto:a,random:i=>e.Buffer.from(a.randomBytes(i))});const{Crypto:o}=p("@peculiar/webcrypto",1);e.ossl=e.subtle=new o({directory:"ossl"}).subtle}catch{console.log("Please `npm install @peculiar/webcrypto` or add it to your package.json !")}return w=e,w}var h,j;function K(){if(j)return h;j=1;var t=v(),e=O(),r={};return r.pbkdf2={hash:{name:"SHA-256"},iter:1e5,ks:64},r.ecdsa={pair:{name:"ECDSA",namedCurve:"P-256"},sign:{name:"ECDSA",hash:{name:"SHA-256"}}},r.ecdh={name:"ECDH",namedCurve:"P-256"},r.jwk=function(n,a){n=n.split(".");var o=n[0],i=n[1],s={kty:"EC",crv:"P-256",x:o,y:i,ext:!0};return s.key_ops=a?["sign"]:["verify"],a&&(s.d=a),s},r.keyToJwk=function(n){return{kty:"oct",k:n.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/\=/g,""),ext:!1,alg:"A256GCM"}},r.recall={validity:12*60*60,hook:function(n){return n}},r.check=function(n){return typeof n=="string"&&n.slice(0,4)==="SEA{"},r.parse=async function(a){try{var o=typeof a=="string";return o&&a.slice(0,4)==="SEA{"&&(a=a.slice(3)),o?await e.parse(a):a}catch{}return a},t.opt=r,h=r,h}var d,B;function _(){if(B)return d;B=1;var t=v(),e=O();return K(),t.name=t.name||(async(r,n)=>{try{if(r)try{r()}catch(a){console.log(a)}return}catch(a){if(console.log(a),t.err=a,t.throw)throw a;r&&r();return}}),t.pair=t.pair||(async(r,n)=>{try{var a=e.ossl||e.subtle,o=await e.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},!0,["sign","verify"]).then(async f=>{var u={};u.priv=(await e.subtle.exportKey("jwk",f.privateKey)).d;var c=await e.subtle.exportKey("jwk",f.publicKey);return u.pub=c.x+"."+c.y,u});try{var i=await a.generateKey({name:"ECDH",namedCurve:"P-256"},!0,["deriveKey"]).then(async f=>{var u={};u.epriv=(await a.exportKey("jwk",f.privateKey)).d;var c=await a.exportKey("jwk",f.publicKey);return u.epub=c.x+"."+c.y,u})}catch(f){if(t.window)throw f;if(f=="Error: ECDH is not a supported algorithm")console.log("Ignoring ECDH...");else throw f}i=i||{};var s={pub:o.pub,priv:o.priv,epub:i.epub,epriv:i.epriv};if(r)try{r(s)}catch(f){console.log(f)}return s}catch(f){if(console.log(f),t.err=f,t.throw)throw f;r&&r();return}}),d=t.pair,d}var q=_();const J=P(q),H=T({__proto__:null,default:J},[q]);export{H as p};
