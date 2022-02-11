import "virtual:windi.css";

import SEA from "gun/sea.js";

import { mountElement, mountClass } from "./main.js";
mountElement();
mountClass();

let avatar = document.getElementById("avatar");
let plus = document.getElementById("plus");
let small = document.getElementById("small");
let room = document.getElementById("room");
let plusRoom = document.getElementById("plusRoom");
let smallRoom = document.getElementById("smallRoom");

function newUser() {
  SEA.pair().then((p) => {
    avatar.setAttribute("pub", p.pub);
    let el = document.createElement("gun-avatar");
    el.setAttribute("pub", p.pub);
    el.setAttribute("size", 36);
    el.setAttribute("round", true);
    el.setAttribute("title", p.pub);
    small.parentNode.insertBefore(el, small.prevSibling);
  });
}

function newRoom() {
  SEA.pair().then((p) => {
    room.setAttribute("pub", p.pub);
    let el = document.createElement("gun-avatar");
    el.setAttribute("pub", p.pub);
    el.setAttribute("size", 60);
    el.setAttribute("draw", "squares");
    el.setAttribute("reflect", false);
    smallRoom.parentNode.insertBefore(el, small.prevSibling);
  });
}

let avatarInt = setInterval(() => newUser(), 2000);
let roomInt = setInterval(() => newRoom(), 4000);

avatar.addEventListener("click", () => {
  newUser();
});

plus.addEventListener("click", () => {
  newUser();
});

room.addEventListener("click", () => {
  newRoom();
});

plusRoom.addEventListener("click", () => {
  newRoom();
});
