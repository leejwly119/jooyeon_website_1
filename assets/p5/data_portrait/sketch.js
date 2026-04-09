let table;
let events = []; // {d: Date, type, who}
let TYPES = ["are_you_dating", "why_no_app", "want_to_marry"];
let LABEL = {
  are_you_dating: "Are you dating?",
  why_no_app: "Why not using dating app?",
  want_to_marry: "Do you want to marry?"
};
let palette = {
  are_you_dating: "#C5D1EB",
  why_no_app: "#92AFD7",
  want_to_marry: "#395B50"
};

let cx, cy;
let finger;
let bands = []; // RingBand array
let hoverInfo = null;

let tMin, tMax;

const SCALE = 1.5;

function preload() {
  table = loadTable(
    "dating_comments.csv",
    "csv",
    "header",
    () => console.log("✅ CSV loaded"),
    (err) => console.error("❌ CSV failed to load:", err)
  );
}

function setup(){
  createCanvas(document.body.clientWidth, document.body.clientHeight);
  textFont("monospace");
  textSize(12);
  
  cx = width/2;
  cy = height / 2 + min(120, height * 0.15);
  
  for(let r = 0; r < table.getRowCount(); r++){
    const dt = table.getString(r, "date");
    const tp = table.getString(r, "type");
    const who = table.getString(r, "who");
    if(!TYPES.includes(tp)) continue;
    const parts = dt.trim().split("-");
    if (parts.length !== 3) continue;
    const d = new Date(int(parts[0]),int(parts[1])-1, int(parts[2])); //0 (0=January, 11=December). That’s why it uses parts[1] - 1.
    events.push({d, type: tp, who});
  }
  events.sort((a,b) => a.d - b.d);

 
  
  if (events.length>0) {
    tMin = events[0].d;
    tMax = events[events.length -1].d;
    if (tMin.getTime() === tMax.getTime()) {
      tMax = new Date(tMin.getTime()+ 24*3600*1000); //24 hours × 3600 seconds × 1000 ms; tMin.getTime() + 24*3600*1000 = the same time, plus one day.
    }
  }
  
  //Hand
  finger = ringFingerGeometry();
  finger.x *= SCALE; finger.y *= SCALE; finger.length *=SCALE; finger.width *= SCALE;
  
  const baseRX = 32 * SCALE; // ring ellipse radius X
  const gap = 18 * SCALE; // distance between bands
  for(let i=0; i < TYPES.length; i++){
    const type = TYPES[i];
    const rx = baseRX + i * gap;
    const ry = rx * 0.58;
    const speed = 0.003 + i * 0.0012;
    bands.push(new RingBand(type,rx,ry,speed));
  }
}

function windowResized() {
  const w = document.body.clientWidth;
  const h = document.body.clientHeight;
  resizeCanvas(w, h);
}

function draw(){
  background(28);
  
  hoverInfo = null; //the intentional absence of any object value, Falsy Value
  
  push();
  translate(cx, cy);
  drawHand();
  
  push();
  translate(finger.x, finger.y);
  rotate(finger.angle)
  
  for (let b of bands){
    b.update();
    b.display();
  }
  pop();
  pop();
  
  drawTooltip();
}

function dateToAngle(d){
  const startA =PI;
  const endA = PI + TWO_PI;
  const k = (d.getTime()- tMin.getTime()) / (tMax.getTime()- tMin.getTime());
  return lerp(startA, endA, constrain(k,0,1));
  //tMin.getTime() = earliest event.tMax.getTime() = latest event.(Subtracting then dividing = normalizing into a 0 → 1 scale.k = 0 → earliest date.k = 1 → latest date.k = 0.5 → halfway between.)
  //constrain(k,0,1) = makes sure k stays between 0 and 1 in case of weird data.
}

function drawHand(){
  drawFinger(-110*SCALE, -120*SCALE, -0.18, 140*SCALE, 26*SCALE); // pinky
  drawFinger( -70*SCALE, -138*SCALE, -0.08, 165*SCALE, 28*SCALE); // ring
  drawFinger( -25*SCALE, -146*SCALE,  0.02, 175*SCALE, 30*SCALE); // middle
  drawFinger(  20*SCALE, -130*SCALE,  0.12, 155*SCALE, 27*SCALE); // index
  drawFinger( 50*SCALE,  -40*SCALE, 0.55, 120*SCALE, 34*SCALE); // thumb
}

function drawFinger(x,y,angle,length, width){
  push(); 
  translate (x,y);
  rotate(angle);
  noStroke();
  fill(200,225,235,40);
  
    beginShape();
  let rt = width * 0.45, rb = width * 0.65;
  // top arc
  for (let t = PI; t <= TWO_PI; t += 0.22){
    vertex(cos(t) * rt, -length + sin(t) * rt);
  }
  // bottom arc
  for (let t = 0; t <= PI; t += 0.22){
    vertex(cos(t) * rb, sin(t) * rb);
  }
  endShape(CLOSE);
  pop();
}

function ringFingerGeometry(){
  return{ x:-70, y:-138, angle:-0.08, length:165, width:28 };
  //x:Where the ring finger is positioned relative to the center of the hand.Negative values = moved left/up from the hand’s center.
}

class RingBand{
  constructor(type, rx,ry,speed){
    this.type = type;
    this.rx = rx;
    this.ry = ry;
    this.speed = speed;
    this.roll = random(TWO_PI);
    this.dots = events.filter(e => e.type === type).map(e => ({
      date: e.d,
      who: e.who,
      baseAngle: dateToAngle(e.d)
    }));
    //for each e (event object) in events, check if its type matches this band’s type
    //.map() transforms each event into a simpler object containing only the properties this visualization needs
  }
  
  update(){
    this.roll = (this.roll + this.speed) % TWO_PI;
  }
  
  display(){
    noFill();
    stroke(255, 30);
    strokeWeight(1.5);
    ellipse(0, 0, this.rx*2, this.ry*2);
    
    // rolling facet (bright arc to imply rotation)
    // strokeWeight(7);
    // stroke(hexWithAlpha(palette[this.type], 200));
    // const seg = PI * 0.45;
    // arc(0, 0, this.rx*2, this.ry*2, this.roll - seg/2, this.roll + seg/2);

    //events
    noStroke();
    for(let i=0; i<this.dots.length; i++){
      const a = this.roll + (this.dots[i].baseAngle - PI);
      //finger’s local space
      const px = cos(a) * this.rx;
      const py = sin(a) * this.ry;
      
      const screen = toScreen(px, py);
      //The finger is tilted and offset on the hand, so (px, py) isn’t yet in canvas coordinates.toScreen() applies rotation + translation so the stone appears at the right spot on the actual canvas.
      
      const near = dist(mouseX, mouseY, screen.x, screen.y) < 9;
      //Checkmouse is near
      
       if (near && !hoverInfo){
        hoverInfo = {
          type: this.type,
          date: this.dots[i].date,
          who:  this.dots[i].who,
          x: screen.x,
          y: screen.y
        };
    }
      
       fill(hexWithAlpha(palette[this.type], near ? 255 : 170));
       circle(px, py, near ? 9 : 6);

       if (near){
        noFill();
        stroke(hexWithAlpha(palette[this.type], 160));
        strokeWeight(1.2);
        circle(px, py, 18);
        noStroke();
       }
    }
  }
}
    
function hexWithAlpha(hex, alpha){
  const c = color(hex);
  c.setAlpha(alpha);
  return c;
}

function toScreen(localX, localY){
  // Convert finger-local coords to screen space (manual transform)
  // Apply finger rotation + translation, then global hand translation.
  const rot = finger.angle;
  const xr = localX * cos(rot) - localY * sin(rot);
  const yr = localX * sin(rot) + localY * cos(rot);
  const fx = finger.x;
  const fy = finger.y;
  return { x: cx + fx + xr, y: cy + fy + yr };
}

function drawTooltip(){
  const angle = PI;
  const r = 210;
  const x = cx + r * cos(angle);
  const y = cy + r * sin(angle);

  stroke(255);
  strokeWeight(0.5);
  line(x,y,cx,cy);
  
  noStroke();
  fill(255);
  let label = "Data Portrait";
  if (hoverInfo){
    label = `${fmtDate(hoverInfo.date)} — ${LABEL[hoverInfo.type]} — ${hoverInfo.who}`;
    stroke(255,180); strokeWeight(0.8);
    line(x, y - 16, hoverInfo.x, hoverInfo.y); 
    noStroke();
  }
  text(label, x, y - 8);
}

function fmtDate(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const da = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${da}`;
}
