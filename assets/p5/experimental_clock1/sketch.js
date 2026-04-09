// This experimental clock visualizes the tension between Apollonian order and Dionysian chaos. The concentric rings and radial grid still reflect Apollo’s rational clarity, but the counterclockwise motion of the minutes and seconds deliberately breaks the expectation of time’s usual direction. This inversion destabilizes the viewer’s sense of order, echoing Dionysian disruption. The roly-poly form amplifies this instability with chaotic tilts, restoring balance and showing how order and chaos continuously negotiate with one another.

let angle = 0;
let angVel = 0;
let prevSec = -1;
let particles = [];

function setup() {
  const container = document.body;

  const w = container.clientWidth;
  const h = container.clientHeight;

  const canvas = createCanvas(w, h);
  canvas.parent(container);
}

function windowResized() {
  const w = document.body.clientWidth;
  const h = document.body.clientHeight;
  resizeCanvas(w, h);
}

function draw() {
  background(252);

  // Get current time
  let now = new Date();
  let hr = ((now.getHours() + 11) % 12) + 1; 
  let min = now.getMinutes();
  let sec = now.getSeconds();
  let ms = now.getMilliseconds();

// grid and time arcs (Apollonian)
  push();
  translate(width / 2, height / 2);
  drawGrid(hr);                 // grid lines (for hours)
  drawTimeRings(hr, min, sec, ms);
  pop();

// weeble (Dionysian)

  let springK = 0.025 + 0.025 * cos(TWO_PI * (min / 60));
  let damping = 0.015;

// random kick each new second 
  if (sec !== prevSec) {
    let chaos = map(sec, 0, 59, 0.01, 0.05); // increase from previous smaller range
    angVel += random(-chaos, chaos);

    for (let i = 0; i < 3; i++) {
      particles.push(new Particle(width / 2, height / 2, angle));
    }
  }
  prevSec = sec;

  let torque = -springK * angle - damping * angVel;
  angVel += torque;
  angle += angVel;
  angVel *= 0.99;

//weeble (Dionysian)
  push();
  translate(width / 2, height / 2);
  drawWeeble(angle, sec);
  pop();

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].Done()) particles.splice(i, 1);
  }


}

function drawGrid(spokes) {
  stroke(0, 40);
  noFill();
  // Circles
  for (let r = 80; r <= 250; r += 40) {
    strokeWeight(1);
    circle(0, 0, r * 2);
  }
  // for hours
  strokeWeight(1);
  let count = spokes * 2;
  for (let i = 0; i < count; i++) {
    let a = map(i, 0, count, 0, TWO_PI);
    let x = cos(a) * 260;
    let y = sin(a) * 260;
    line(0, 0, x, y);
  }
}

function drawTimeRings(hr, min, sec, ms) {
  noFill();
  // Seconds - outer ring
  let sAngle = - HALF_PI - (sec + ms / 1000) / 60 * TWO_PI ;
  stroke(100, 140, 220);
  strokeWeight(4);
  arc(0, 0, 480, 480, -HALF_PI, sAngle);

  // Minutes - middle ring
  let mAngle = - HALF_PI - (min / 60) * TWO_PI ;
  stroke(120, 180, 120);
  strokeWeight(2.5);
  arc(0, 0, 420, 420, -HALF_PI, mAngle);

  // Hours - short 
  stroke(220, 140, 100);
  strokeWeight(2);
  for (let i = 0; i < 12; i++) {
    let a = -HALF_PI + i * TWO_PI / 12;
    let x1 = cos(a) * 170;
    let y1 = sin(a) * 170;
    let x2 = cos(a) * 185;
    let y2 = sin(a) * 185;
    line(x1, y1, x2, y2);
  }
  // Small inner circle
  stroke(0, 50);
  strokeWeight(1);
  circle(0, 0, 340);
}

function drawWeeble(theta, sec) {
  // Roly-poly body
  push();
  rotate(theta);

  stroke(0, 150);
  strokeWeight(1);
  fill(255);
  ellipse(0, 50, 120, 140); // body



  // Tilt line 
  stroke(0);
  strokeWeight(3);
  line(0, -40, 0, 65);

  // ring
  let pulse = map(sec + (frameCount % 60) / 60, 0, 60, 0.93, 1.08);
  noFill();
  stroke(0, 60);
  strokeWeight(2);
  ellipse(0, 50, 120 * pulse, 140 * pulse);
  pop();
}



class Particle {
  constructor(x, y, angle) {
    
    this.x = x;
    this.y = y;
    // Velocity with random angle and speed
    this.vx = cos(angle + random(-0.7, 0.7)) * random(4, 8);
    this.vy = sin(angle + random(-0.7, 0.7)) * random(4, 8);
  
    this.life = 1.0;
    
    this.rotation = random(TWO_PI);
    this.rotationSpeed = random(-0.05, 0.05);
   
    this.length = random(14, 28);
  }

  update() {
    // Move particle by velocity
    this.x += this.vx;
    this.y += this.vy;
    
    // Slow down velocity 
    this.vx *= 0.97;
    this.vy *= 0.97;
    // Rotate particle
    this.rotation += this.rotationSpeed;
    // fade away
    this.life *= 0.94;
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    stroke(0, 100 * this.life);
    strokeWeight(1.2);

    line(-this.length * 0.5, 0, this.length * 0.5, 0);
    pop();
  }

  Done() {
    return this.life < 0.06;
  }
}
