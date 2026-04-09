let words = ["CAP", "MAP", "TAP"];
let mode = 0; // 0 = normal, 1 = shake, 2 = swap, 3 = drift
let baseSize = 80;

function setup() {
  createCanvas(600, 400);
  textAlign(CENTER, CENTER);
  textSize(baseSize);
}

function draw() {
  background(0);
  fill(255);

  for (let i = 0; i < words.length; i++) {
    let y = height / 4 + i * 100;
    drawWord(words[i], width / 2, y);
  }
}

function drawWord(word, x, y) {
  let spacing = textWidth("A") + 10;
  let startX = x - spacing;

  for (let i = 0; i < word.length; i++) {
    let letter = word[i];
    let lx = startX + i * spacing;
    let ly = y;

    // subtle mouse distortion (always active)
    let d = dist(mouseX, mouseY, lx, ly);
    let influence = map(constrain(d, 0, 120), 0, 120, 5, 0);
    ly += random(-influence, influence);

    // MODE 1: SHAKE (X)
    if (mode === 1) {
      lx += random(-5, 5);
      ly += random(-5, 5);
    }

    // MODE 2: SWAP LETTERS (Y)
    if (mode === 2) {
      letter = random(["C", "M", "T"]) + "AP";
      text(letter, x, y);
      return; // draw whole swapped word
    }

    // MODE 3: DRIFT APART (Z)
    if (mode === 3) {
      lx += sin(frameCount * 0.05 + i) * 40;
    }

    text(letter, lx, ly);
  }
}

function keyPressed() {
  if (key === "x" || key === "X") mode = 1;
  if (key === "y" || key === "Y") mode = 2;
  if (key === "z" || key === "Z") mode = 3;
  if (key === "0") mode = 0; // reset
}
