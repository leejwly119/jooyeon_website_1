let fontA;
let word = "DECODE"
let fontSize = 90;
let sample = 0.12;

// let ptsTop = [];
// let ptsMid = [];
// let ptsBot = [];
let topParticles = [];
let midParticles = [];
let botParticles = [];


function preload() {
  fontA = loadFont("Amaranth-Bold.otf"); 
}

function setup() {
  createCanvas(600, 600);
  textFont(fontA);
  // textAlign(CENTER, CENTER);
  // textSize(80);
  
  // buildAllPoints();
  
  topParticles = makeParticlesForLine(height * 0.25);
  midParticles = makeParticlesForLine(height * 0.50);
  botParticles = makeParticlesForLine(height * 0.75);
}

function draw() {
  background(0);
  fill(220);
  noStroke();

  // text("DECODE", width/2, height * 0.25);
  // text("DECODE", width/2, height * 0.50);
  // text("DECODE", width/2, height * 0.75);
  
  // drawPoints(ptsTop);
  // drawPoints(ptsMid);
  // drawPoints(ptsBot);
  
  let effort;

  if (mouseIsPressed) {
    effort = 0.25;
  } else {
    effort = 1.0;
  }
  for (let p of topParticles) {
    p.updateDrift(effort);
    p.show();
  }
  
//   Middle
  for (let p of midParticles) {
    p.updateCrowd();
    p.show();
  }
//   Botton
  for (let p of botParticles) {
    p.updateMirror();
    p.show();
  }
}

// function drawPoints(arr) {
//   for (let p of arr) circle(p.x, p.y, 3);
// }

// function buildLinePoints(yCenter) {
//   let b = fontA.textBounds(word, 0, 0, fontSize);
//   let x = (width - b.w)/2 - b.x;
//   let y = yCenter - (b.h/2) - b.y;
  
//   // let halfTextHeight = b.h / 2;
//   // let centeredY = yCenter - halfTextHeight;
//   // let y = centeredY - b.y;

//   return fontA.textToPoints(word, x, y, fontSize, {
//     sampleFactor: sample,
//     simplifyThreshold: 0
//   });
// }

// function buildAllPoints() {
//   ptsTop = buildLinePoints(height * 0.25);
//   ptsMid = buildLinePoints(height * 0.50);
//   ptsBot = buildLinePoints(height * 0.75);
// }

function makeParticlesForLine(yCenter) {
  let pts = linePoints(yCenter);
  let arr = [];
  for (let i=0; i<pts.length;i++){
    arr.push(new Particle(pts[i].x, pts[i].y, yCenter));
  }
  return arr;
}

function linePoints(yCenter) {
  let b = fontA.textBounds(word, 0, 0, fontSize);
  let x = (width - b.w) / 2 - b.x;
  let y = yCenter - (b.h / 2) - b.y;
  
  return fontA.textToPoints(word, x, y, fontSize, {
    sampleFactor: sample,
    simplifyThreshold: 0
  });
}

class Particle {
  constructor(x,y, lineY) {
    this.tx = x; //target
    this.ty = y;
    this.x = x; // current
    this.y = y;
    
    this.nx = random(1000);
    this.ny = random(2000);
    
    this.lineY = lineY;
  }
  
  show() {
    noStroke();
    fill(255, 200);
    circle(this.x, this.y, 3);
  }
  
//   Top
  updateDrift(effort) {
    let t = frameCount * 0.01;
    let drift = 14 * effort;

    let dx = map(noise(this.nx + t), 0, 1, -drift, drift);
    let dy = map(noise(this.ny + t), 0, 1, -drift, drift);

    this.x = lerp(this.x, this.tx + dx, 0.12);
    this.y = lerp(this.y, this.ty + dy, 0.12);
  }
  
// Middle
  updateCrowd(){
    let centerX = width /2;
    let crowdAmt = map(mouseX, 0, width, 0, 0.6);
    let newX = lerp(this.tx, centerX, crowdAmt);

    this.x = newX;
    this.y = this.ty; // keep vertical stable
  }

// Bottom
  updateMirror() {
    let centerX = width / 2;

    let flipAmount = mouseX / width;

    // mirrored across center
    let mirroredX = centerX - (this.tx - centerX);

    let newX = this.tx + (mirroredX - this.tx) * flipAmount;

    this.x = newX;
    this.y = this.ty;
  }
}