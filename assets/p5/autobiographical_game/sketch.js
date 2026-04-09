const COLORS = {
  OYSTER:   "#F9F4EA",
  SAND:     "#CDAD85",
  TERRACOT: "#C47457",
  SAGE:     "#9C9E80",
  TRUFFLE:  "#605F4B",
  COPPER:   "#B68036"
};

let scene = 0;


let hits = 0;       
let baseY;            
let slope;            
let cartT = 0.05;     
let cartSpeed = 0.004;
let triggerX;        
let spawnerArmed = false;

// phone
let phoneOn = false;
let phoneX, phoneY;
let phoneVX, phoneVY;
let spawnGap = 18;    
let lastSpawnFrame = 0;

// boom shards
let shards = [];     

let fragments = [];                   // broken pieces
let safeCircle = { x: 350, y: 225, r: 80 };
let draggingFrag = null;              // the fragment we drag
let dragOffsetX = 0;
let dragOffsetY = 0;


let lampX, lampY;                     
let beamLength = 560;
let beamHalfAngle = 0.35;             
let eyeX, eyeY;                      
let eyeSeenFrames = 0;
let eyeNeedFrames = 60;


const GAP = { a1:{x:80,y:140}, b1:{x:540,y:280}, width:26 };
let leftDots = [];
let rightDots = [];
let stitches = [];                    // pairs {L, R}
let draggingStitch = null;            // {side:"L"/"R", index}

let ripples = [];                     // {x,y,r,alpha,speed}
let choice = null;                    // "top" or "bottom"
let slowRipples = false;
let signTop;
let signBottom;

// ================== p5 SETUP ==================
function setup(){
  createCanvas(700, 450);
  textFont('monospace');
  textSize(14);

  // scene 0
  baseY = height - 100;
  slope = radians(18);
  triggerX = width * 0.62;

  // scene 2 
  lampX = width / 2;
  lampY = height - 40;
  eyeX = width * 0.62;
  eyeY = height * 0.42;

  // scene 3 
  setupStitching();

  // scene 4 
  setupSigns();
}

function draw(){
  background(COLORS.OYSTER);

  if (scene === 0){
    drawScene0();
  } else if (scene === 1){
    drawScene1();
  } else if (scene === 2){
    drawScene2();
  } else if (scene === 3){
    drawScene3();
  } else if (scene === 4){
    drawScene4();
  } else if (scene === 5){
    drawScene5();
  }
}

function drawScene0(){
  drawRail();

 
  if (keyIsDown(RIGHT_ARROW)){
    cartT = min(1, cartT + cartSpeed);
  }
  if (keyIsDown(LEFT_ARROW)){
    cartT = max(0, cartT - cartSpeed);
  }

  const cartX = constrain(lerp(60, width - 60, cartT), 60, width - 60);
  const cartY = railY(cartX);
  const headX = cartX;
  const headY = cartY - 28;

  drawCharacter(cartX, cartY);
  drawCart(cartX, cartY);
  drawTrigger(triggerX, railY(triggerX));


  if (!spawnerArmed && cartX >= triggerX){
    spawnerArmed = true;
    lastSpawnFrame = frameCount - spawnGap;  // spawn soon
  }

  // launch phone every few frames
  if (spawnerArmed && !phoneOn && frameCount - lastSpawnFrame >= spawnGap){
    launchPhone(headX, headY);
    lastSpawnFrame = frameCount;
  }

  if (phoneOn){
    phoneX += phoneVX;
    phoneY += phoneVY;
    phoneVY += 0.35;    // gravity

    drawPhone(phoneX, phoneY);

    // detect hit with head
    const dx = headX - phoneX;
    const dy = headY - phoneY;
    const d  = sqrt(dx*dx + dy*dy);

    if (d < 24){
      phoneOn = false;
      makeShards(headX, headY);
      hits++;

      // after 2 hits → go to fragment scene
      if (hits >= 2){
        spawnerArmed = false;
        setupFragments();
        scene = 1;
      }
    }

    // leaves the screen, turn off
    if (phoneX < -60 || phoneX > width + 60 || phoneY > height + 60){
      phoneOn = false;
    }
  }

  // draw shards if any
  if (shards.length > 0){
    updateShards();
  }

  // UI text
  noStroke();
  fill(COLORS.TRUFFLE);
  textAlign(LEFT, TOP);
  text("Scene 0 — Move with <-/-> • hits: " + hits + "/2", 14, 14);
}

function drawRail(){
  // main rail
  stroke(COLORS.SAND);
  strokeWeight(14);
  line(0, railY(0), width, railY(width));

  // sleepers
  stroke(COLORS.COPPER);
  strokeWeight(6);
  for (let x = 0; x <= width; x += 46){
    const y = railY(x);
    push();
    translate(x, y);
    rotate(-slope * 7);
    line(-12, 0, 12, 0);
    pop();
  }
}

// line equation
function railY(x){
  return baseY - Math.tan(slope) * x;
}

function drawCart(x, y){
  push();
  translate(x, y);
  rotate(-slope);
  noStroke();
  fill(COLORS.TERRACOT);
  rectMode(CENTER);
  rect(0, 0, 90, 28, 4);
  fill(COLORS.SAND);
  ellipse(-28, 16, 14, 14);
  ellipse( 28, 16, 14, 14);
  pop();
}

function drawCharacter(x, y){
  push();
  translate(x, y);
  rotate(-slope);
  stroke(COLORS.TRUFFLE);
  strokeWeight(10);
  line(0, -12, 0, -24);
  noStroke();
  fill(COLORS.TRUFFLE);
  circle(0, -34, 16);
  pop();
}

function drawTrigger(x, y){
  noStroke();
  fill(COLORS.COPPER);
  circle(x, y, 22);
}

function drawPhone(x, y){
  push();
  translate(x, y);
  noStroke();
  fill(COLORS.SAGE);
  rectMode(CENTER);
  rect(0, 0, 30, 18, 4);
  stroke(COLORS.TRUFFLE);
  strokeWeight(2);
  line(-6, -4, 6, -4);  
  pop();
}

function launchPhone(targetX, targetY){
  phoneX = width + 60;
  phoneY = 80;

  // aim toward the character's head
  phoneVX = (targetX - phoneX) * 0.02;
  phoneVY = (targetY - phoneY) * 0.02 - 6;

  // clamp speeds
  phoneVX = constrain(phoneVX, -10, -3);
  phoneVY = constrain(phoneVY, -12, -2);

  phoneOn = true;
}

function makeShards(x, y){
  shards = [];
  for (let i = 0; i < 20; i++){
    const angle = random(TWO_PI);
    const speed = random(2, 7);
    shards.push({
      x: x,
      y: y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      rot: random(TWO_PI),
      r: random(5, 14),
      life: 30
    });
  }
}

function updateShards(){
  noStroke();
  fill(182, 128, 54);  

  for (let i = shards.length - 1; i >= 0; i--){
    let p = shards[i];

    push();
    translate(p.x, p.y);
    rotate(p.rot);
    for (let k = 0; k < 3; k++){
      const s = p.r * (1 + k * 0.35);
      triangle(-s, s * 0.6, 0, -s, s, s * 0.6);
    }
    pop();


    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;    // gravity
    p.rot += 0.05;
    p.life--;

    if (p.life <= 0){
      shards.splice(i, 1);
    }
  }
}

function setupFragments(){
  fragments = [];
  const count = 8;

  for (let i = 0; i < count; i++){
    fragments.push({
      x: random(50, 650),
      y: random(50, 400),
      r: random(12, 22),
      placed: false
    });
  }

  draggingFrag = null;
}

function drawScene1(){
  background(COLORS.OYSTER);

  // bowl / center circle
  noStroke();
  fill("#d9ccb6");
  circle(safeCircle.x, safeCircle.y, safeCircle.r * 2);

  fill(COLORS.TRUFFLE);
  textAlign(CENTER, TOP);
  text("Scene 1 — Drag the fragments into the circle", width / 2, 24);

  //  fragments
  for (let i = 0; i < fragments.length; i++){
    let f = fragments[i];
    if (f.placed){
      fill(COLORS.COPPER);
      stroke(COLORS.TRUFFLE);
      strokeWeight(1.2);
    } else {
      noStroke();
      fill(COLORS.TERRACOT);
    }
    circle(f.x, f.y, f.r * 2);
  }

  // check if all placed
  let allPlaced = true;
  for (let i = 0; i < fragments.length; i++){
    if (!fragments[i].placed){
      allPlaced = false;
      break;
    }
  }

  if (allPlaced){
    // go to flashlight scene
    scene = 2;
  }
}

function drawScene2(){
  background("#0b0f12");

  // angle from lamp to mouse
  let angle = atan2(mouseY - lampY, mouseX - lampX);

  // draw flashlight beam using a triangle
  noStroke();
  for (let i = 0; i < 18; i++){
    let t = i / 17.0;
    let alpha = lerp(210, 0, t);     // fade
    fill(182, 128, 54, alpha);       // COPPER-like with alpha

    let leftAngle = angle - beamHalfAngle;
    let rightAngle = angle + beamHalfAngle;

    let leftX = lampX + cos(leftAngle) * beamLength;
    let leftY = lampY + sin(leftAngle) * beamLength;
    let rightX = lampX + cos(rightAngle) * beamLength;
    let rightY = lampY + sin(rightAngle) * beamLength;

    beginShape();
    vertex(lampX, lampY);
    vertex(leftX, leftY);
    vertex(rightX, rightY);
    endShape(CLOSE);
  }

  // lamp
  fill(230);
  circle(lampX, lampY, 16);

  // check if eye is in beam
  let dx = eyeX - lampX;
  let dy = eyeY - lampY;
  let distToEye = sqrt(dx*dx + dy*dy);
  let angleToEye = atan2(dy, dx);
  let diff = angleDifference(angle, angleToEye);

  let inside = (abs(diff) < beamHalfAngle) && (distToEye < beamLength);

  if (inside){
    eyeSeenFrames++;
    drawEye(eyeX, eyeY);
  } else {
    eyeSeenFrames = max(0, eyeSeenFrames - 1);
  }

  fill(COLORS.OYSTER);
  noStroke();
  textAlign(CENTER, TOP);
  text("Scene 2 — Move the light to find the eye", width / 2, 24);

  // if eye has been visible long enough → go to stitching
  if (eyeSeenFrames > eyeNeedFrames){
    scene = 3;
  }
}

// keep angle difference between -PI and PI
function angleDifference(a, b){
  let d = a - b;
  while (d > PI)  d -= TWO_PI;
  while (d < -PI) d += TWO_PI;
  return d;
}

function drawEye(x, y){
  push();
  translate(x, y);
  noStroke();
  fill(255);
  ellipse(0, 0, 60, 36);
  fill("#2b6b6b");
  circle(6, 2, 18);
  fill(0);
  circle(6, 2, 8);
  fill(COLORS.TERRACOT);     
  rect(-2, 16, 6, 22, 3);
  ellipse(1, 38, 10, 6);
  pop();
}

function setupStitching(){
  
  const vx = GAP.b1.x - GAP.a1.x;
  const vy = GAP.b1.y - GAP.a1.y;
  const len = sqrt(vx*vx + vy*vy);
  const nx = (-vy / len) * GAP.width;
  const ny = ( vx / len) * GAP.width;

  GAP.a2 = { x: GAP.a1.x + nx, y: GAP.a1.y + ny };
  GAP.b2 = { x: GAP.b1.x + nx, y: GAP.b1.y + ny };

  // create dots on both edges
  leftDots = [];
  rightDots = [];
  const N = 9;
  for (let i = 0; i < N; i++){
    const u = i / (N - 1);
    leftDots.push({
      x: lerp(GAP.a1.x, GAP.b1.x, u),
      y: lerp(GAP.a1.y, GAP.b1.y, u),
      used: false
    });
    rightDots.push({
      x: lerp(GAP.a2.x, GAP.b2.x, u),
      y: lerp(GAP.a2.y, GAP.b2.y, u),
      used: false
    });
  }

  stitches = [];
  draggingStitch = null;
}

function drawScene3(){
  drawGap();

  // title
  noStroke();
  fill(COLORS.TRUFFLE);
  textAlign(LEFT, TOP);
  text("Scene 3 — Drag between dots to stitch", 60, 24);

  // draw existing stitch lines
  stroke(COLORS.COPPER);
  strokeWeight(3);
  for (let i = 0; i < stitches.length; i++){
    const s = stitches[i];
    const L = leftDots[s.L];
    const R = rightDots[s.R];
    line(L.x, L.y, R.x, R.y);
  }

  // draw dots
  noStroke();
  for (let i = 0; i < leftDots.length; i++){
    let ld = leftDots[i];
    let rd = rightDots[i];

    // left
    if (ld.used){
      fill('#c6b39b');
    } else {
      fill(COLORS.COPPER);
    }
    circle(ld.x, ld.y, 12);

    // right
    if (rd.used){
      fill('#c6b39b');
    } else {
      fill(COLORS.COPPER);
    }
    circle(rd.x, rd.y, 12);
  }

  // line while dragging
  if (draggingStitch !== null){
    let from;
    if (draggingStitch.side === "L"){
      from = leftDots[draggingStitch.index];
    } else {
      from = rightDots[draggingStitch.index];
    }
    stroke(COLORS.TRUFFLE);
    strokeWeight(2);
    line(from.x, from.y, mouseX, mouseY);
  }

  // check if all dots are used
  let allUsed = true;
  for (let i = 0; i < leftDots.length; i++){
    if (!leftDots[i].used || !rightDots[i].used){
      allUsed = false;
      break;
    }
  }

  if (allUsed){
    scene = 4;
  }
}

function drawGap(){
  stroke(COLORS.SAND);
  strokeWeight(20);
  strokeCap(ROUND);
  line(GAP.a1.x, GAP.a1.y, GAP.b1.x, GAP.b1.y);
  line(GAP.a2.x, GAP.a2.y, GAP.b2.x, GAP.b2.y);

  stroke(COLORS.TRUFFLE);
  strokeWeight(1.5);
  line(GAP.a1.x, GAP.a1.y, GAP.b1.x, GAP.b1.y);
  line(GAP.a2.x, GAP.a2.y, GAP.b2.x, GAP.b2.y);
}


function mousePressed(){
  // ---------- Scene 1: pick up fragment ----------
  if (scene === 1){
    for (let i = 0; i < fragments.length; i++){
      let f = fragments[i];
      let d = dist(mouseX, mouseY, f.x, f.y);
      if (!f.placed && d < f.r){
        draggingFrag = f;
        dragOffsetX = mouseX - f.x;
        dragOffsetY = mouseY - f.y;
        break;
      }
    }
  }

  // ---------- Scene 3: start stitch drag ----------
  if (scene === 3){
    // function to pick index from an array of dots
    function pickDot(arr){
      for (let i = 0; i < arr.length; i++){
        let d = dist(mouseX, mouseY, arr[i].x, arr[i].y);
        if (!arr[i].used && d < 12) return i;
      }
      return -1;
    }

    let li = pickDot(leftDots);
    let ri = pickDot(rightDots);

    if (li !== -1){
      draggingStitch = { side: "L", index: li };
    } else if (ri !== -1){
      draggingStitch = { side: "R", index: ri };
    }
  }


  if (scene === 4){
    ripples.push({
      x: mouseX,
      y: mouseY,
      r: 0,
      alpha: 200,
      speed: 3
    });

    if (overBox(signTop)){
      choice = "top";
      slowRipples = true;
      
      setTimeout(() => {
        scene = 5;
      }, 1200);   

    } else if (overBox(signBottom)){
      choice = "bottom";
      slowRipples = true;

      setTimeout(() => {
        scene = 5;
      }, 1200);
    }
  }
}

function mouseDragged(){
  if (scene === 1 && draggingFrag !== null){
    draggingFrag.x = mouseX - dragOffsetX;
    draggingFrag.y = mouseY - dragOffsetY;
  }
}

function mouseReleased(){
  // ---------- Scene 1: drop fragment ----------
  if (scene === 1 && draggingFrag !== null){
    let d = dist(draggingFrag.x, draggingFrag.y, safeCircle.x, safeCircle.y);
    if (d < safeCircle.r){
      draggingFrag.placed = true;
      draggingFrag.x = safeCircle.x + random(-20, 20);
      draggingFrag.y = safeCircle.y + random(-20, 20);
    }
    draggingFrag = null;
  }

  if (scene === 3 && draggingStitch !== null){
    let otherArray;
    if (draggingStitch.side === "L"){
      otherArray = rightDots;
    } else {
      otherArray = leftDots;
    }

    let best = -1;
    let bestDist = 9999;

    for (let i = 0; i < otherArray.length; i++){
      if (otherArray[i].used) continue;
      let d = dist(mouseX, mouseY, otherArray[i].x, otherArray[i].y);
      if (d < bestDist){
        bestDist = d;
        best = i;
      }
    }

    if (best !== -1 && bestDist < 18){
      if (draggingStitch.side === "L"){
        stitches.push({ L: draggingStitch.index, R: best });
        leftDots[draggingStitch.index].used = true;
        rightDots[best].used = true;
      } else {
        stitches.push({ L: best, R: draggingStitch.index });
        rightDots[draggingStitch.index].used = true;
        leftDots[best].used = true;
      }
    }

    draggingStitch = null;
  }
}

function setupSigns(){
  const w = 460;
  const h = 76;
  const gap = 14;
  const x = width / 2 - w / 2;
  const y = height / 2 - h - gap / 2;

  signTop = {
    x: x,
    y: y,
    w: w,
    h: h,
    label: "RESENTMENT",
    arrow: "right"
  };

  signBottom = {
    x: x,
    y: y + h + gap,
    w: w,
    h: h,
    label: "RESILIENCE",
    arrow: "left"
  };
}

function drawScene4(){
  background("#0b0f12");

  // update and draw ripples
  noFill();
  for (let i = ripples.length - 1; i >= 0; i--){
    let r = ripples[i];

    if (slowRipples){
      r.speed = lerp(r.speed, 0.7, 0.02);
    }

    r.r += r.speed;
    r.alpha -= 0.8;

    stroke(182, 128, 54, r.alpha);
    strokeWeight(2);
    circle(r.x, r.y, r.r * 2);

    if (r.alpha <= 0){
      ripples.splice(i, 1);
    }
  }

  // draw signs
  drawSign(signTop, choice === "top");
  drawSign(signBottom, choice === "bottom");

  noStroke();
  fill(COLORS.OYSTER);
  textAlign(CENTER, TOP);
  text("Scene 4 — Click one of the signs", width / 2, 24);
}

function drawSign(box, selected){
  push();
  stroke(selected ? COLORS.COPPER : COLORS.OYSTER);
  strokeWeight(selected ? 3 : 2);
  fill(COLORS.TRUFFLE);
  rect(box.x, box.y, box.w, box.h, 6);

  fill(COLORS.OYSTER);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(18);
  const pad = 18;
  text(box.label, box.x + pad, box.y + box.h / 2);

  // arrow
  stroke(COLORS.OYSTER);
  strokeWeight(3);
  const L = box.x + box.w - pad - 46;
  const R = box.x + box.w - pad;
  const Y = box.y + box.h / 2;

  if (box.arrow === "right"){
    line(L, Y, R, Y);
    line(R - 14, Y - 10, R, Y);
    line(R - 14, Y + 10, R, Y);
  } else {
    line(L, Y, R, Y);
    line(L + 14, Y - 10, L, Y);
    line(L + 14, Y + 10, L, Y);
  }

  if (selected){
    noFill();
    stroke(182, 128, 54, 40);
    strokeWeight(10);
    rect(box.x - 4, box.y - 4, box.w + 8, box.h + 8, 8);
  }
  pop();
}

function overBox(box){
  return (
    mouseX >= box.x &&
    mouseX <= box.x + box.w &&
    mouseY >= box.y &&
    mouseY <= box.y + box.h
  );
}

function drawScene5(){
  background(COLORS.OYSTER);
  noStroke();
  fill(COLORS.TRUFFLE);
  textAlign(LEFT, TOP);
  textSize(16);

  const message =
    "Whatever you chose, hope it was good for you;\n" +
    "enough to carry you gently\n" +
    "into what comes next.";

  text(message, 40, height / 2 - 40);
}
