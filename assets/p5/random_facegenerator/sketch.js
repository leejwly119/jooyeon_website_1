let faceType;
let faceColor, blushColor, accessoryColor;
let eyeWidth, eyeHeight;
let go = false;

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
  background(255);
  
  if (go) {
    randomizeFace();
  } 
  
  if (faceType === 0) {
    drawAngelDevilFace();
  } else if (faceType === 1) {
    drawUmbrellaFace();
  } else if (faceType === 2) {
    drawFoxFace();
  }
  
  push();
  fill('black');
  circle(mouseX,mouseY,5);
  text(mouseX + "," + mouseY, mouseX+5,mouseY-5)
  pop();
  
  text("Press 'c'!", 280,385)
}

function randomizeFace() {
  faceType = int(random(3));
  faceColor = color(random(150,255), random(150,255), random(150,255) )
  blushColor = color(random(220, 255), random(100, 180), random(100,180))
  accessoryColor = color(random(220,255), random(200,220), random(80, 255))
  
  eyeWidth = random(5, 20);
  eyeHeight = random(5, 20);
}
        
// function keyPressed() {
//   randomizeFace();
// }
function keyPressed() {
  if (key === 'c') {
    go = true;
  }
}

function keyReleased() {
  if (key === 'c') {
    go = false;
  }
}

function drawAngelDevilFace() {
  noStroke();
  fill(faceColor);
  ellipse(200,220,140,140);
  
  fill(40);
  triangle(164, 140, 150, 165, 180, 150);
  triangle(240, 140, 250, 165, 220, 150);
  
  stroke(accessoryColor);
  strokeWeight(4);
  noFill();
  ellipse(200, 115, 70, 25);
  strokeWeight(1);
  
// Eyes, Mouth
  fill(30);
  ellipse(180, 220, eyeWidth, eyeHeight);
  ellipse(220, 220, eyeWidth, eyeHeight);
  
  push();
  // noFill();
  // stroke(10);
  // beginShape();
  // vertex(187,245);
  // vertex(195,250);
  // vertex(202,240);
  // vertex(210,250);
  // vertex(220,245);
  // endShape();
  noFill();
  stroke(5);
  strokeWeight(4);
  arc(190,250, 20,20, 0, PI);
  arc(210,250, 20,20, 0, PI);
  pop();
  
  noStroke();
  fill(blushColor);
  ellipse(160, 235, 30,15);
  ellipse(240, 235, 30,15);
}

function drawUmbrellaFace() {
  fill(faceColor);
  ellipse(200, 230, 150, 120);
  ellipse(150, 190, 50);
  ellipse(250, 190, 50);
  
  fill(blushColor);
  ellipse(140,222, 30,18);
  ellipse(260,222, 30,18);
  
//   Eyes, Mouth
  noStroke();
  fill(40);
  ellipse(150, 190, eyeWidth, eyeHeight);
  ellipse(250, 190, eyeWidth, eyeHeight);
  
  push();
  noFill();
  stroke(5);
  strokeWeight(4);
  arc(200,245, 50,50, 0, PI);
  pop();
  
   // Umbrella
  // stroke(0);
  // line(200, 180, 200, 130);
  // fill(accessoryColor);
  // arc(200, 130, 60, 32, PI, 2*PI, OPEN);
  // noStroke();
}

function drawFoxFace() {
  noStroke();
  fill(faceColor);
  ellipse(200, 220, 150, 120);
  
// Ears
  fill(faceColor);
  triangle(145,180, 140, 110, 185, 170);
  triangle(255, 180, 260, 110, 215, 170);
  fill(30);
  triangle(150, 170, 150, 130, 170, 160);
  triangle(250, 170, 250, 130, 230, 160);
  
// Eyes, nose, mouth
  fill(40);
  ellipse(180, 215, eyeWidth, eyeHeight);
  ellipse(220, 215, eyeWidth, eyeHeight);
  
  ellipse(200,230, 10,5);
  
  fill(255,128,0);
  arc(200, 238, 13, 55, 0, PI, OPEN);
  
  push();
  noFill();
  stroke(5);
  strokeWeight(4);
  arc(190,232, 18,18, 0, PI);
  arc(210,232, 18,18, 0, PI);
  pop();
  
  fill(blushColor);
  ellipse(150, 235, 20, 15);
  ellipse(250, 235, 20, 15);
  

}

