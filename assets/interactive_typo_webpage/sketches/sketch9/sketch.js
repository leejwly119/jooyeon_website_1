let words = ["jold", "hile", "sheem", "plone", "drisk", "mave"];
let currentWord = 0;

let wordLayer;
let slices = 10;

function setup() {
  // createCanvas(500, 500);
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont("Arial");
  makeWordLayer();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function draw() {
  background(0);

  fill(255);
  // textSize(18);
  // textStyle(NORMAL);
  // text("NONWORD READING", width / 2, 40);

  let panelW = 320;
  let panelH = 320;
  let panelX = width / 2 - panelW / 2;
  let panelY = height / 2 - panelH / 2 + 20;

  noFill();
  stroke(255, 40);
  rect(panelX, panelY, panelW, panelH);

  // fracture amount depends on mouse position
  let fractureAmount = map(mouseX, 0, width, 0, 60);

  // draw fractured text in slices
  let sliceH = wordLayer.height / slices;

  for (let i = 0; i < slices; i++) {
    let y = i * sliceH;

    // alternate directions, with some irregularity
    let offsetX = sin(frameCount * 0.03 + i * 0.8) * fractureAmount;
    if (i % 2 === 0) {
      offsetX *= -1;
    }

    let jitterY = map(noise(i * 0.3, frameCount * 0.01), 0, 1, -6, 6);

    image(
      wordLayer,
      panelX + offsetX,
      panelY + y + jitterY,
      panelW,
      sliceH,
      0,
      y,
      wordLayer.width,
      sliceH
    );
  }

  // vertical cut lines for poster-like fractured feeling
  stroke(255, 25);
  for (let x = panelX + 40; x < panelX + panelW; x += 55) {
    line(x, panelY, x, panelY + panelH);
  }

  // noStroke();
  // fill(255, 120);
  // textSize(12);
  // text("move mouse to distort • click to change word", width / 2, height - 25);
}

function makeWordLayer() {
  wordLayer = createGraphics(320, 320);
  wordLayer.pixelDensity(1);
  wordLayer.background(0, 0);
  wordLayer.fill(255);
  wordLayer.noStroke();
  wordLayer.textAlign(CENTER, CENTER);
  wordLayer.textFont("Arial");
  wordLayer.textStyle(BOLD);

  let w = words[currentWord];

  // break word visually into unstable chunks
  let parts = splitWordIntoChunks(w);

  wordLayer.textSize(64);

  // draw central large fractured composition
  let centerY = 160;
  for (let i = 0; i < parts.length; i++) {
    let xShift = random(-35, 35);
    let yShift = (i - (parts.length - 1) / 2) * 55 + random(-8, 8);
    wordLayer.text(parts[i], 160 + xShift, centerY + yShift);
  }

  // add ghost duplicates for tension / reading interference
  wordLayer.fill(255, 90);
  wordLayer.textSize(58);
  for (let i = 0; i < parts.length; i++) {
    let xShift = random(-70, 70);
    let yShift = (i - (parts.length - 1) / 2) * 55 + random(-20, 20);
    wordLayer.text(parts[i], 160 + xShift, centerY + yShift);
  }

  // add some isolated letters around like broken fragments
  wordLayer.fill(255);
  wordLayer.textSize(34);
  let letters = w.split("");
  for (let i = 0; i < letters.length; i++) {
    wordLayer.text(
      letters[i],
      random(25, 295),
      random(35, 285)
    );
  }
}

function splitWordIntoChunks(word) {
  let chunks = [];

  if (word.length <= 4) {
    for (let i = 0; i < word.length; i += 2) {
      chunks.push(word.substring(i, i + 2));
    }
  } else if (word.length <= 6) {
    chunks.push(word.substring(0, 2));
    chunks.push(word.substring(2, 4));
    chunks.push(word.substring(4));
  } else {
    chunks.push(word.substring(0, 2));
    chunks.push(word.substring(2, 5));
    chunks.push(word.substring(5));
  }

  return chunks;
}

function mousePressed() {
  currentWord = (currentWord + 1) % words.length;
  makeWordLayer();
}