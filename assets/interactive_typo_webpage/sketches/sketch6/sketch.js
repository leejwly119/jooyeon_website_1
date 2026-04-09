// p5.js — Semantic Fluency (Beginner-friendly)
// Simple sorting game: drag words into the right category.
// Categories: FRUIT, ANIMAL, WEATHER
// Design: black background, white text, simple boxes + smooth animation.
//
// How to play:
// 1) Drag a word.
// 2) Drop it into a category box.
// 3) If correct, it snaps in and stays.
//    If wrong, it wiggles and returns.
//
// Tip: Press [R] to reset.

let categories = [
  { name: "FRUIT",   x: 60,  y: 90,  w: 160, h: 160 },
  { name: "ANIMAL",  x: 220, y: 90,  w: 160, h: 160 },
  { name: "WEATHER", x: 380, y: 90,  w: 160, h: 160 }
];

let wordsData = [
  // FRUIT
  { text: "mango",  cat: "FRUIT" },
  { text: "apple",  cat: "FRUIT" },
  { text: "banana", cat: "FRUIT" },
  { text: "grape",  cat: "FRUIT" },

  // ANIMAL
  { text: "dog",    cat: "ANIMAL" },
  { text: "cat",    cat: "ANIMAL" },
  { text: "horse",  cat: "ANIMAL" },
  { text: "bird",   cat: "ANIMAL" },

  // WEATHER
  { text: "rain",   cat: "WEATHER" },
  { text: "snow",   cat: "WEATHER" },
  { text: "wind",   cat: "WEATHER" },
  { text: "cloud",  cat: "WEATHER" }
];

let tiles = [];
let grabbed = null;
let grabOffX = 0;
let grabOffY = 0;

function setup() {
  // createCanvas(600, 600);
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
  textAlign(CENTER, CENTER);

  resetGame();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function draw() {
  background(0);

  drawTitle();
  drawCategories();

  // update & draw tiles
  for (let t of tiles) {
    t.update();
    t.draw();
  }

  drawHint();
}

function drawTitle() {
  fill(255);
  textSize(20);
  text("SEMANTIC FLUENCY — Sort the words", width / 2, 35);

  textSize(13);
  fill(180);
  text("Drag each word into FRUIT / ANIMAL / WEATHER", width / 2, 60);
}

function drawCategories() {
  for (let c of categories) {
    // box
    noFill();
    stroke(255);
    strokeWeight(2);
    rect(c.x, c.y, c.w, c.h, 12);

    // label
    noStroke();
    fill(255);
    textSize(16);
    text(c.name, c.x + c.w / 2, c.y + 22);
  }
}

function drawHint() {
  fill(160);
  noStroke();
  textSize(12);
  text("Tip: Press R to reset", width / 2, height - 24);
}

// --------------------
// Interaction
// --------------------
function mousePressed() {
  // pick the top-most tile under mouse
  for (let i = tiles.length - 1; i >= 0; i--) {
    if (tiles[i].isMouseOver()) {
      grabbed = tiles[i];
      grabbed.dragging = true;

      grabOffX = mouseX - grabbed.x;
      grabOffY = mouseY - grabbed.y;

      // bring grabbed to top (draw last)
      tiles.splice(i, 1);
      tiles.push(grabbed);
      break;
    }
  }
}

function mouseDragged() {
  if (grabbed) {
    grabbed.tx = mouseX - grabOffX;
    grabbed.ty = mouseY - grabOffY;
  }
}

function mouseReleased() {
  if (!grabbed) return;

  grabbed.dragging = false;

  // check if dropped inside a category box
  let dropCat = categoryUnderPoint(grabbed.x + grabbed.w / 2, grabbed.y + grabbed.h / 2);

  if (dropCat) {
    if (dropCat.name === grabbed.correctCat) {
      // correct: snap into the box (stack inside)
      snapTileIntoCategory(grabbed, dropCat);
      grabbed.locked = true;
      grabbed.feedback = "good";
    } else {
      // wrong: return to home + wiggle
      grabbed.goHome();
      grabbed.feedback = "bad";
      grabbed.wiggleTimer = 18;
    }
  } else {
    // not dropped on a box: just float back to wherever you released (no lock)
    // (or send home if you want stricter behavior)
  }

  grabbed = null;
}

function keyPressed() {
  if (key === "r" || key === "R") resetGame();
}

// --------------------
// Helpers
// --------------------
function categoryUnderPoint(px, py) {
  for (let c of categories) {
    if (px > c.x && px < c.x + c.w && py > c.y && py < c.y + c.h) return c;
  }
  return null;
}

function snapTileIntoCategory(tile, cat) {
  // Count how many locked tiles are already in this category
  let count = 0;
  for (let t of tiles) {
    if (t.locked && t.placedCat === cat.name) count++;
  }

  // simple stacking positions
  let padX = 20;
  let padTop = 52;
  let lineH = 28;

  tile.placedCat = cat.name;
  tile.tx = cat.x + padX;
  tile.ty = cat.y + padTop + count * lineH;
}

function resetGame() {
  tiles = [];

  // place tiles at bottom area, mixed order
  let shuffled = shuffleArray(wordsData);

  let startX = 70;
  let startY = 320;
  let colGap = 130;
  let rowGap = 60;

  for (let i = 0; i < shuffled.length; i++) {
    let col = i % 4;
    let row = floor(i / 4);

    let x = startX + col * colGap;
    let y = startY + row * rowGap;

    tiles.push(new WordTile(shuffled[i].text, shuffled[i].cat, x, y));
  }

  grabbed = null;
}

function shuffleArray(arr) {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --------------------
// WordTile class
// --------------------
class WordTile {
  constructor(text, correctCat, x, y) {
    this.text = text;
    this.correctCat = correctCat;

    // position (x,y) + target (tx,ty) for smooth animation
    this.x = x;
    this.y = y;
    this.tx = x;
    this.ty = y;

    // home position
    this.homeX = x;
    this.homeY = y;

    // size
    this.w = 110;
    this.h = 36;

    this.dragging = false;
    this.locked = false;

    this.placedCat = null;

    // feedback
    this.feedback = "none"; // "good" / "bad"
    this.wiggleTimer = 0;
  }

  update() {
    // smooth movement toward target (simple easing)
    if (!this.dragging) {
      this.x = lerp(this.x, this.tx, 0.18);
      this.y = lerp(this.y, this.ty, 0.18);
    } else {
      // if dragging, x/y are controlled via tx/ty in mouseDragged,
      // and we follow quickly:
      this.x = lerp(this.x, this.tx, 0.35);
      this.y = lerp(this.y, this.ty, 0.35);
    }

    if (this.wiggleTimer > 0) this.wiggleTimer--;
  }

  draw() {
    // tile look
    let ox = 0;
    if (this.wiggleTimer > 0) {
      ox = sin(frameCount * 0.8) * 6; // wiggle
    }

    // outline only (simple)
    noFill();
    stroke(255);
    strokeWeight(2);
    rect(this.x + ox, this.y, this.w, this.h, 10);

    // text
    noStroke();
    fill(255);
    textSize(16);
    text(this.text, this.x + ox + this.w / 2, this.y + this.h / 2);

    // tiny feedback dot
    if (this.feedback === "good") {
      fill(255);
      circle(this.x + ox + this.w - 10, this.y + 10, 6);
    } else if (this.feedback === "bad") {
      noFill();
      stroke(255);
      strokeWeight(2);
      line(this.x + ox + this.w - 14, this.y + 6, this.x + ox + this.w - 6, this.y + 14);
      line(this.x + ox + this.w - 6, this.y + 6, this.x + ox + this.w - 14, this.y + 14);
    }
  }

  isMouseOver() {
    return (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    );
  }

  goHome() {
    if (this.locked) return;
    this.tx = this.homeX;
    this.ty = this.homeY;
    this.placedCat = null;
  }
}
