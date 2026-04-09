// p5.js — Simple Rhyme Words (black bg, white text)
// Uses the words from your image:
// Bug Jug Mug Hug
// Can Fan Man Pan
// Dad Bad Mad Had
// Nut But Hut Cut
//
// Effect:
// - Each word is drawn letter-by-letter
// - Letters gently "float"
// - The FIRST letter of each rhyme family slowly cycles (switches) between the related words
//   (so the rhyme ending stays stable, like _ug / _an / _ad / _ut)

let rhymeRows = [
  { rime: "ug", starters: ["B", "J", "M", "H"] },
  { rime: "an", starters: ["C", "F", "M", "P"] },
  { rime: "ad", starters: ["D", "B", "M", "H"] },
  { rime: "ut", starters: ["N", "B", "H", "C"] }
];

let cells = []; // each cell is one 3-letter word object

function setup() {
  // createCanvas(600, 600);
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
  textAlign(LEFT, CENTER);

  buildGrid();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  // draw every word cell
  for (let c of cells) {
    c.update();
    c.draw();
  }
}

// -------------------------
// Build word positions
// -------------------------
function buildGrid() {
  cells = [];

  let startX = 120;     // left margin
  let startY = 160;     // top margin
  let colGap = 120;     // space between columns
  let rowGap = 105;     // space between rows

  let size = 48;        // text size

  for (let r = 0; r < rhymeRows.length; r++) {
    let row = rhymeRows[r];

    for (let col = 0; col < row.starters.length; col++) {
      let x = startX + col * colGap;
      let y = startY + r * rowGap;

      // create one word-cell
      cells.push(new WordCell(row, col, x, y, size));
    }
  }
}

// -------------------------
// WordCell class (beginner-friendly)
// -------------------------
class WordCell {
  constructor(rowData, colIndex, x, y, size) {
    this.rowData = rowData;     // { rime:"ug", starters:[...] }
    this.colIndex = colIndex;   // which column (0..3)

    this.baseX = x;
    this.baseY = y;
    this.size = size;

    // Each letter has its own little floating offsets
    this.letterOffsets = [
      createVector(random(-6, 6), random(-6, 6)),
      createVector(random(-6, 6), random(-6, 6)),
      createVector(random(-6, 6), random(-6, 6))
    ];

    // Different speed per cell so they don’t all move the same
    this.speed = random(0.015, 0.03);

    // Switch timing (how often first letter cycles)
    this.switchSpeed = random(0.003, 0.008);
  }

  update() {
    // nothing permanent to store—motion is calculated in draw()
  }

  draw() {
    fill(255);
    noStroke();
    textSize(this.size);

    // --- 1) Decide what the first letter is *right now*
    // We "cycle" through the starters list over time.
    let t = frameCount * this.switchSpeed;
    let idx = floor(t) % this.rowData.starters.length;

    // optional: sometimes use the next one for a "flip" feeling
    let nextIdx = (idx + 1) % this.rowData.starters.length;
    let blend = t - floor(t); // 0..1

    // If blend is near the middle, briefly show the "next" letter (simple switch)
    let firstLetter = (blend > 0.55 && blend < 0.75) ? this.rowData.starters[nextIdx] : this.rowData.starters[idx];

    // The rhyme ending stays stable
    let word = firstLetter + this.rowData.rime; // ex: "B" + "ug" => "Bug"

    // --- 2) Draw letter-by-letter with floating offsets
    // letter spacing
    let gap = this.size * 0.55;

    // base float for the whole word (gentle drift)
    let driftX = sin(frameCount * this.speed + this.baseY * 0.01) * 8;
    let driftY = cos(frameCount * this.speed + this.baseX * 0.01) * 8;

    for (let i = 0; i < 3; i++) {
      let ch = word[i];

      // per-letter wobble (each letter "floats" a bit differently)s
      let wobbleX = sin(frameCount * (this.speed + i * 0.01) + i * 10) * 6;
      let wobbleY = cos(frameCount * (this.speed + i * 0.01) + i * 10) * 6;

      let ox = this.letterOffsets[i].x + wobbleX;
      let oy = this.letterOffsets[i].y + wobbleY;

      let lx = this.baseX + driftX + i * gap + ox;
      let ly = this.baseY + driftY + oy;

      text(ch, lx, ly);
    }
  }
}
