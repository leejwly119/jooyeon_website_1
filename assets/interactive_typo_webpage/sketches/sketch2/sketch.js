let fontA, fontB, fontC;
let word = "Dyslexia";

function preload() {
  fontA = loadFont("heavy.otf");
  fontB = loadFont("Heebo.ttf");
  fontC = loadFont("Anton-Regular.ttf");
}

function setup() {
  // createCanvas(600, 600);
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(80);
  noStroke();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  // Top
  textFont(fontA);
  fill(230);
  drawNormalLine(word, width / 2, height * 0.25);

  // Middle
  textFont(fontB);
  fill(230);
  drawFloatingLetters(word, width / 2, height * 0.50);

  //Bottom
  textFont(fontC);
  drawGlitchText(word, width / 2, height * 0.75);
}

function drawNormalLine(str, x, y) {
  text(str, x, y);
}

function drawFloatingLetters(str,x,y){
  let totalW = textWidth(str);
  let startX = x - totalW / 2; // start left
  
  let t = frameCount * 0.03;
  
  for (let i = 0; i < str.length; i++) {
    let ch = str[i];
    let chW = textWidth(ch);
    let cx = startX + chW/2;
    
    let floatX = sin(t + i * 0.7) * 10;
    let floatY = cos(t * 1.2 + i * 0.9) * 10;

   text(ch, cx + floatX, y + floatY);
    
   startX += chW;
  }
}

function drawGlitchText(str,x,y){
  let maxOffset = 10;
  let shake = 2;
  let ox1 = random(-maxOffset, maxOffset);
  let oy1 = random(-maxOffset, maxOffset);
  let ox2 = random(-maxOffset, maxOffset);
  let oy2 = random(-maxOffset, maxOffset);
  
  let flicker = random() < 0.55;
  let baseX = x + random(-shake, shake);
  if (flicker) {
    fill(255, 0, 0);   
    text(str, baseX + ox1, y + oy1);

    fill(0, 255, 0);   
    text(str, baseX + ox2, y + oy2);
  }
  fill(230);
  text(str, baseX, y);

}
