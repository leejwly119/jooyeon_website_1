let rows = [
  { letter: "P", word: "help" },
  { letter: "Q", word: "book" },
  { letter: "S", word: "nose" }
];

function setup() {
  // createCanvas(600, 600);
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
  textAlign(LEFT, CENTER);
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  fill(255);

  let strength = map(mouseX, 0, width, 0.0, 1.0);
  let crowd = map(mouseY, 0, height, 0.2, 1.0);

  let baseX = 140;
  let baseY = 180;
  let rowGap = 110;
  let colGap = lerp(210, 140, crowd);

  for (let i = 0; i < rows.length; i++) {
    let y = baseY + i * rowGap;
    drawRow(rows[i], baseX, y, colGap, strength, crowd, i);
  }
}

function drawRow(item, x, y, colGap, strength, crowd, index) {
  let shownLetter = item.letter;

  // P / Q confusion
  let p = 0.02 + 0.18 * strength;
  if (random() < p) {
    if (shownLetter === "P") shownLetter = "Q";
    else if (shownLetter === "Q") shownLetter = "P";
  }

  let jitterAmt = 10 * strength;
  let jx = (noise(index * 100 + frameCount * 0.05) - 0.5) * jitterAmt;
  let jy = (noise(index * 1000 + frameCount * 0.05) - 0.5) * jitterAmt;

  let crowdPush = 1.0 - crowd;
  let wordX = x + colGap - 40 * crowdPush;

  push();
  translate(jx, jy);

  let drift = sin(frameCount * 0.03 + index) * 8 * strength;
  let letterY = y + drift;

  textSize(56);
  fill(255);
  noStroke();

  let ghost = 10 * strength;
  if (strength > 0.05) {
    fill(255, 100);
    text(shownLetter, x + random(-ghost, ghost), letterY + random(-ghost, ghost));
    fill(255);
  }

  text(shownLetter, x, letterY);
  pop();

  drawWobblyWord(item.word, wordX, y, strength, crowd, index);
}

function drawWobblyWord(word, x, y, strength, crowd, index) {
  textSize(44);
  fill(255);
  noStroke();

  let baseSpacing = lerp(28, 20, crowd);
  let t = frameCount * 0.05;

  let cx = x;

  for (let i = 0; i < word.length; i++) {
    let ch = word[i];

    let wx = (noise(index * 200 + i * 20 + t) - 0.5) * 18 * strength;
    let wy = (noise(index * 400 + i * 20 + 99 + t) - 0.5) * 18 * strength;

    if (random() < 0.03 * strength) {
      wx += random(-25, 25);
    }

    text(ch, cx + wx, y + wy);

    cx += baseSpacing;
    cx -= (noise(i * 50 + frameCount * 0.02) - 0.5) * 10 * strength * crowd;
  }
}