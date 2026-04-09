
let scrollPx = 0;
const speedPxPerSec = 48;
let lastMillis = 0;
let triPath = [];
let triLen = 0;
let allLabels = [];

let paused = false;

function setup() {
  createCanvas(600, 600);
  textAlign(CENTER, CENTER);
  textSize(16);
  angleMode(RADIANS);
  noFill();

  //  triangle vertices
  const cx = width / 2;
  const cy = height / 2 + 10;
  const w = 420;
  const h = 320;

  //  3 corners 
  triPath = [
    createVector(cx + w / 2, cy),        // right middle
    createVector(cx - w / 2, cy + h / 2), // bottom left
    createVector(cx - w / 2, cy - h / 2)  // top left
  ];

  triLen = trianglePerimeter(triPath);
  lastMillis = millis();

  // time labels from 00:00 to 23:59
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m++) {
      allLabels.push(nf(h, 2) + ":" + nf(m, 2));
    }
  }
}


function mousePressed() {
  paused = !paused;
}


function drawTriangle(tri) {
  beginShape();
  for (let v of tri) {
    vertex(v.x, v.y);
  }
  endShape(CLOSE);
}

//  perimeter length of the triangle
function trianglePerimeter(tri) {
  return (
    p5.Vector.dist(tri[0], tri[1]) +
    p5.Vector.dist(tri[1], tri[2]) +
    p5.Vector.dist(tri[2], tri[0])
  );
}

// returns point and angle at distance s along the triangle perimeter
function pointAt(tri, s) {
  const L = triLen;
  s = ((s % L) + L) % L;
//moving negative remainders into positive space

  const d01 = p5.Vector.dist(tri[0], tri[1]);
  const d12 = p5.Vector.dist(tri[1], tri[2]);
  const d20 = p5.Vector.dist(tri[2], tri[0]);

  if (s <= d01) {
    let t = s / d01;
    let x = lerp(tri[0].x, tri[1].x, t);
    let y = lerp(tri[0].y, tri[1].y, t);
    let ang = atan2(tri[1].y - tri[0].y, tri[1].x - tri[0].x);
    return { x, y, ang };
  } else if (s <= d01 + d12) {
    let t = (s - d01) / d12;
    let x = lerp(tri[1].x, tri[2].x, t);
    let y = lerp(tri[1].y, tri[2].y, t);
    let ang = atan2(tri[2].y - tri[1].y, tri[2].x - tri[1].x);
    return { x, y, ang };
  } else {
    let t = (s - d01 - d12) / d20;
    let x = lerp(tri[2].x, tri[0].x, t);
    let y = lerp(tri[2].y, tri[0].y, t);
    let ang = atan2(tri[0].y - tri[2].y, tri[0].x - tri[2].x);
    return { x, y, ang };
  }
}


function drawTextOnTriangle(tri, L, labels, spacing, offset, color) {
  let s = offset;
  let idx = 0;
  let N = labels.length;
  let liveIdx = hour() * 60 + minute();

  while (s < L + offset) {
    let label = labels[idx % N];
    let pt = pointAt(tri, s);

    push();
    translate(pt.x, pt.y);
    rotate(pt.ang);
    translate(0, -10);
    noStroke();
    fill(color);

    if (idx % N === liveIdx) {
      textStyle(BOLD);
      textSize(26);
      text(label, 0, 0);
      textSize(16);
      textStyle(NORMAL);
    } else {
      text(label, 0, 0);
    }
    pop();

    s += spacing;
    idx++;
  }
}

function drawFlowArrow(tri, s, col) {
  let pt = pointAt(tri, s);
  push();
  translate(pt.x, pt.y);
  rotate(pt.ang);
  noStroke();
  fill(col);
  triangle(0, -4, 12, 0, 0, 4);
  pop();
}

function draw() {
  background(0);

  if (!paused) {
    let now = millis();
    let dt = (now - lastMillis) / 1000;
    scrollPx = (scrollPx + speedPxPerSec * dt) % triLen;
    lastMillis = now;
  } else {
    lastMillis = millis();
  }

  stroke(255);
  strokeWeight(3);
  drawTriangle(triPath);

  drawFlowArrow(triPath, scrollPx, 255);

  drawTextOnTriangle(triPath, triLen, allLabels, 36, scrollPx, 255);

  noStroke();
  fill(255);
  textFont('Helvetica');
  textSize(56);
  // text("Stop?", width / 2, height / 2 + 10);

  push();
  fill(255, 150);
  textSize(12);
  let liveLabel = nf(hour(), 2) + ":" + nf(minute(), 2);
  text("Live: " + liveLabel + "    Click = pause/resume", width / 2, 24);
  pop();
}
