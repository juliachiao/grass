let seaweeds = [];
let fishes = [];
let bubbles = [];
let particles = []; // 背景光斑

const PALETTE = [
  [255, 183, 178], // 粉紅
  [255, 218, 193], // 淺橘
  [226, 240, 203], // 嫩綠
  [181, 234, 215], // 薄荷藍
  [199, 206, 234], // 薰衣草紫
  [255, 255, 186]  // 檸檬黃
];

function setup() {
  createCanvas(900, 600);
  
  // 初始化背景光斑
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(50, 150),
      alpha: random(50, 100)
    });
  }

  // 初始化不同顏色的葉片水草
  for (let i = 0; i < 12; i++) {
    let x = map(i, 0, 11, 50, width - 50) + random(-20, 20);
    seaweeds.push(new Seaweed(x, height, random(PALETTE)));
  }
  
  // 增加魚的數量 (共12條)
  for (let i = 0; i < 12; i++) {
    fishes.push(new Fish());
  }
}

function draw() {
  drawWaterBackground();
  
  // 繪製氣泡
  if (frameCount % 15 == 0) bubbles.push(new Bubble());
  for (let b of bubbles) {
    b.update();
    b.display();
  }
  bubbles = bubbles.filter(b => b.y > -20);

  // 繪製水草
  for (let sw of seaweeds) {
    sw.update();
    sw.display();
  }

  // 繪製魚
  for (let f of fishes) {
    f.update();
    f.display();
  }
}

function drawWaterBackground() {
  // 水體漸層
  noStroke();
  for (let i = 0; i < height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(235, 245, 255), color(200, 225, 255), inter);
    stroke(c);
    line(0, i, width, i);
  }

  // 繪製朦朧光斑
  noStroke();
  for (let p of particles) {
    fill(255, 255, 255, p.alpha);
    ellipse(p.x, p.y + sin(frameCount * 0.01) * 10, p.size);
  }
}

// --- 類別定義 ---

class Seaweed {
  constructor(x, y, col) {
    this.x = x;
    this.y = y;
    this.baseColor = col;
    this.segments = 8;
    this.segLen = random(40, 60);
    this.angleOff = random(1000);
  }

  update() {}

  display() {
    push();
    translate(this.x, this.y);
    noStroke();
    
    let lastX = 0;
    let lastY = 0;

    for (let i = 1; i <= this.segments; i++) {
      // 搖擺計算
      let noiseVal = noise(this.angleOff + i * 0.2 + frameCount * 0.01);
      let angle = map(noiseVal, 0, 1, -QUARTER_PI/2, QUARTER_PI/2);
      
      // 滑鼠互動：靠近時水草會向兩邊避開
      let worldX = this.x + lastX;
      let worldY = this.y + lastY;
      let d = dist(mouseX, mouseY, worldX, worldY);
      if (d < 120) {
        let pushAngle = map(mouseX - worldX, -120, 120, QUARTER_PI, -QUARTER_PI);
        angle += pushAngle * 0.5;
      }

      let nextX = lastX + sin(angle) * this.segLen;
      let nextY = lastY - cos(angle) * this.segLen;

      // 繪製葉片 (馬卡龍色)
      fill(this.baseColor[0], this.baseColor[1], this.baseColor[2], 200);
      push();
      translate(nextX, nextY);
      rotate(angle);
      // 畫左右兩片對稱的葉子
      ellipse(-10, 0, 25, 12); 
      ellipse(10, 0, 25, 12);
      pop();

      // 繪製莖
      stroke(this.baseColor[0]-20, this.baseColor[1]-20, this.baseColor[2]-20, 150);
      strokeWeight(4);
      line(lastX, lastY, nextX, nextY);
      
      lastX = nextX;
      lastY = nextY;
    }
    pop();
  }
}

class Fish {
  constructor() {
    this.pos = createVector(random(width), random(50, height - 100));
    this.vel = createVector(random(-2, 2), random(-0.5, 0.5));
    this.size = random(35, 55);
    this.color = random(PALETTE);
    this.maxSpeed = random(1.5, 3);
  }

  update() {
    // 滑鼠互動：魚會躲避滑鼠
    let mouse = createVector(mouseX, mouseY);
    let d = p5.Vector.dist(this.pos, mouse);
    if (d < 100) {
      let flee = p5.Vector.sub(this.pos, mouse);
      flee.setMag(0.5);
      this.vel.add(flee);
      this.vel.limit(this.maxSpeed * 2); // 驚嚇時跑比較快
    } else {
      this.vel.limit(this.maxSpeed);
    }

    this.pos.add(this.vel);
    
    // 邊界反彈
    if (this.pos.x > width + 50) this.pos.x = -50;
    if (this.pos.x < -50) this.pos.x = width + 50;
    if (this.pos.y < 20 || this.pos.y > height - 50) this.vel.y *= -1;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    if (this.vel.x < 0) scale(-1, 1);
    
    noStroke();
    // 魚身
    fill(this.color);
    ellipse(0, 0, this.size, this.size * 0.6);
    // 尾巴
    fill(this.color[0], this.color[1], this.color[2], 180);
    triangle(-this.size/2.5, 0, -this.size/1.2, -this.size/3, -this.size/1.2, this.size/3);
    // 眼睛
    fill(255);
    ellipse(this.size/4, -this.size/10, 10);
    fill(50);
    ellipse(this.size/3.5, -this.size/10, 5);
    pop();
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + 20;
    this.r = random(4, 12);
    this.speed = random(1, 3);
    this.wave = random(100);
  }

  update() {
    this.y -= this.speed;
    this.x += sin(frameCount * 0.05 + this.wave) * 0.5;
  }

  display() {
    stroke(255, 255, 255, 150);
    strokeWeight(1.5);
    noFill();
    circle(this.x, this.y, this.r * 2);
    // 氣泡高光
    noStroke();
    fill(255, 255, 255, 180);
    circle(this.x - this.r/3, this.y - this.r/3, this.r/2);
  }
}