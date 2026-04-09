// p5.js — Picture Naming (Cheshire Cat fade: word appears/disappears)
// No instructions, no typing, no extra UI.
// Just: simple picture + matching word that fades in/out transparently.

let items = [
  { label: "clock", type: "clock" },
  { label: "cup", type: "cup" },
  { label: "house", type: "house" },
  { label: "fish", type: "fish" }
];

let idx = 0;
let holdFrames = 220;     // how long before switching to next picture
let startFrame = 0;

function setup() {
  // createCanvas(600, 600);
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
  textAlign(CENTER, CENTER);
  startFrame = frameCount;
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  // switch to next item every holdFrames
  if (frameCount - startFrame > holdFrames) {
    idx = (idx + 1) % items.length;
    startFrame = frameCount;
  }

  // draw picture
  push();
  translate(width / 2, height * 0.45);
  drawPicture(items[idx].type);
  pop();

  // word fades in/out like Cheshire Cat
  let a = cheshireAlpha(frameCount * 0.02); // 0..255
  fill(255, a);
  noStroke();
  textSize(56);
  text(items[idx].label, width / 2, height * 0.78);
}

// Smooth “appear → linger → disappear” alpha curve
function cheshireAlpha(t) {
  // t is time; make a repeating 0..1 phase
  let phase = (sin(t) + 1) * 0.5;      // 0..1
  // shape it: linger near full + linger near empty
  let shaped = smoothstep(0.15, 0.85, phase); // 0..1 with soft ends
  return shaped * 255;
}

function smoothstep(edge0, edge1, x) {
  x = constrain((x - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}

// --------------------
// Simple white line icons
// --------------------
function drawPicture(type) {
  stroke(255);
  strokeWeight(6);
  noFill();

  if (type === "clock") drawClockIcon();
  if (type === "cup") drawCupIcon();
  if (type === "house") drawHouseIcon();
  if (type === "fish") drawFishIcon();
}

function drawClockIcon() {
  ellipse(0, 0, 180, 180);

  // tick marks
  strokeWeight(3);
  for (let a = 0; a < 12; a++) {
    let ang = (TWO_PI / 12) * a - HALF_PI;
    let x1 = cos(ang) * 82;
    let y1 = sin(ang) * 82;
    let x2 = cos(ang) * 72;
    let y2 = sin(ang) * 72;
    line(x1, y1, x2, y2);
  }

  // hands
  strokeWeight(6);
  line(0, 0, 0, -55);
  line(0, 0, 45, 10);
}

function drawCupIcon() {
  // cup body
  rect(-70, -40, 140, 95, 18);

  // lip
  line(-55, -40, 55, -40);

  // handle
  noFill();
  beginShape();
  vertex(70, -20);
  bezierVertex(115, -40, 115, 55, 70, 35);
  endShape();
}

function drawHouseIcon() {
  triangle(-90, 20, 0, -85, 90, 20);
  rect(-80, 20, 160, 120, 12);
  rect(-22, 70, 44, 70, 10); // door
}

function drawFishIcon() {
  ellipse(-15, 0, 170, 90);
  triangle(70, 0, 135, -40, 135, 40);
  strokeWeight(8);
  point(-70, -10);
}
