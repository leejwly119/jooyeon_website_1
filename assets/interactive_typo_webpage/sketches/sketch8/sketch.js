
let sentences = [
  ["cat", "cut", "rope"],
  ["I", "eat", "mango"],
  ["dog", "chase", "ball"],
  ["birds", "see", "clouds"]
];

let sIndex = 0;

let baseOrder = [];     // correct order (S V O)
let currentOrder = [];  // animated, constantly changing order

// timing
let reorderEvery = 28;  // frames between swaps (smaller = faster)
let sentenceEvery = 280; // frames before switching to a new sentence
let lastReorder = 0;
let lastSentence = 0;

// animation positions
let targetPos = [];   // 3 target x positions
let tilePos = [];     // current x positions for each tile
let tileY = 320;

function setup() {
  // createCanvas(600, 600);
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
  textAlign(CENTER, CENTER);

  targetPos = [150, 300, 450];
  loadSentence(0);

  lastReorder = frameCount;
  lastSentence = frameCount;
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  // switch sentence after a while
  if (frameCount - lastSentence > sentenceEvery) {
    sIndex = (sIndex + 1) % sentences.length;
    loadSentence(sIndex);
    lastSentence = frameCount;
  }

  // keep reordering (swap two positions)
  if (frameCount - lastReorder > reorderEvery) {
    doRandomSwap();
    lastReorder = frameCount;
  }

  // draw title
  fill(255);
  // textSize(22);
  // text("VERBAL FLUENCY", width / 2, 70);
  // fill(180);
  // textSize(14);
  // text("Sentence order keeps shifting (S–V–O pressure)", width / 2, 100);

  // animate tiles toward their target slots
  updateTilePositions();
  drawTiles();

  // faint “correct order” ghost under it (optional cue)
  // drawGhostCorrectOrder();
}

// --------------------
// Sentence setup
// --------------------
function loadSentence(index) {
  baseOrder = sentences[index].slice();      // correct: [S, V, O]
  currentOrder = sentences[index].slice();   // start correct, then scramble

  // shuffle once to begin with instability
  currentOrder = shuffleArray(currentOrder);

  // init tile positions (start scattered)
  tilePos = [
    random(110, 190),
    random(260, 340),
    random(410, 490)
  ];
}

// --------------------
// Reordering logic
// --------------------
function doRandomSwap() {
  // swap two random indices (0,1,2)
  let a = floor(random(3));
  let b = floor(random(3));
  while (b === a) b = floor(random(3));

  let temp = currentOrder[a];
  currentOrder[a] = currentOrder[b];
  currentOrder[b] = temp;

  // occasionally "snap" briefly to correct order, then slip away again
  if (random() < 0.12) {
    currentOrder = baseOrder.slice();
  }
}

// --------------------
// Motion + drawing
// --------------------
function updateTilePositions() {
  // for each slot i, its target x is targetPos[i]
  // but we want each WORD to move smoothly when it changes slots.
  // We'll map each slot to an x, and lerp a per-slot x position.
  for (let i = 0; i < 3; i++) {
    tilePos[i] = lerp(tilePos[i], targetPos[i], 0.18);
  }
}

function drawTiles() {
  for (let i = 0; i < 3; i++) {
    let x = tilePos[i];
    let y = tileY;

    // tiny jitter (like instability)
    let jx = (noise(frameCount * 0.05 + i * 10) - 0.5) * 8;
    let jy = (noise(frameCount * 0.05 + 99 + i * 10) - 0.5) * 6;

    drawTile(x + jx, y + jy, currentOrder[i]);
  }
}

function drawTile(x, y, word) {
  // simple outlined tile
  rectMode(CENTER);
  noFill();
  stroke(255);
  strokeWeight(2);
  rect(x, y, 160, 74, 14);

  // text
  noStroke();
  fill(255);
  textSize(30);
  text(word, x, y + 2);
  rectMode(CORNER);
}

function drawGhostCorrectOrder() {
  // a faint reference line: correct S V O order underneath
  // (still minimal, but helps viewer “feel” the mismatch)
  let ghostY = 430;

  fill(255, 70);
  noStroke();
  textSize(18);
  text(baseOrder.join("  "), width / 2, ghostY);

  stroke(255, 40);
  strokeWeight(2);
  line(90, ghostY + 22, 510, ghostY + 22);
}

// --------------------
// Helper
// --------------------
function shuffleArray(arr) {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
