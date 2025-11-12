// ==== p5.js version of the Processing maze game ====

// ---- sounds ----
let hitSound, winSound, bgMusic;

// ---- game objects ----
let ball;
let walls = [];
let goal;
let state = 0; // 0 = start, 1 = play, 2 = hit, 3 = win

// ---- colors (earth tones) ----
let soil, moss, wood, sky;

function preload() {
  hitSound = loadSound("hit.wav");
  winSound = loadSound("win.wav");
  bgMusic = loadSound("background.mp3");
}

function setup() {
  createCanvas(800, 600);

  soil = color(110, 80, 50);
  moss = color(90, 130, 90);
  wood = color(140, 100, 60);
  sky = color(100, 180, 255);
  ball = new Ball(100, 100);
  goal = createVector(random(150, width - 150), random(150, height - 150));
  makeMaze();

  if (!bgMusic.isPlaying()) {
    bgMusic.loop();
  }
}

function draw() {
  background(soil);
  textAlign(CENTER, CENTER);

  if (state === 0) {
    startScreen();
  } else if (state === 1) {
    playGame();
  } else if (state === 2) {
    endScreen("Oops, you hit something! Try again?", color(200, 80, 80));
  } else if (state === 3) {
    endScreen("Congrats! You found the diamond!!", color(80, 200, 120));
  }
}

// ---- Screens ----
function startScreen() {
  textSize(36);
  fill(240);
  text("Follow the Path", width / 2, height / 2 - 30);
  textSize(18);
  text("Click to start", width / 2, height / 2 + 20);
}

function playGame() {
  // Draw goal (diamond)
  push();
  translate(goal.x, goal.y);
  rotate(PI / 4);
  noStroke();
  fill(sky);
  rectMode(CENTER);
  rect(0, 0, 28, 28);
  pop();

  // Draw maze walls
  for (let w of walls) {
    w.display();
  }

  // Player
  ball.followMouse();
  ball.display();

  // Collisions
  for (let w of walls) {
    if (w.hit(ball.pos, ball.r)) {
      hitSound.play();
      state = 2;
    }
  }

  if (dist(ball.pos.x, ball.pos.y, goal.x, goal.y) < 20) {
    winSound.play();
    state = 3;
  }
}

function endScreen(msg, c) {
  textSize(30);
  fill(c);
  text(msg, width / 2, height / 2 - 10);
  textSize(18);
  fill(255);
  text("Press R to restart", width / 2, height / 2 + 30);
}

// ---- Interaction ----
function mousePressed() {
  if (state === 0) state = 1;
}

function keyPressed() {
  if (key === "r" || key === "R") {
    ball = new Ball(100, 100);
    walls = [];
    goal = createVector(random(150, width - 150), random(150, height - 150));
    makeMaze();
    state = 1;
  }
}

// ---- Ball ----
class Ball {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.r = 15;
  }
  followMouse() {
    this.pos.set(mouseX, mouseY);
  }
  display() {
    noStroke();
    fill(150, 220, 250);
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
  }
}

// ---- Wall ----
class Wall {
  constructor(x1, y1, x2, y2, c) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
    this.c = c;
  }
  display() {
    stroke(this.c);
    strokeWeight(14);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
  hit(p, r) {
    let ap = p5.Vector.sub(p, this.a);
    let ab = p5.Vector.sub(this.b, this.a);
    let t = constrain(ap.dot(ab) / ab.magSq(), 0, 1);
    let proj = p5.Vector.add(this.a, p5.Vector.mult(ab, t));
    return p5.Vector.dist(p, proj) < r;
  }
}

// ---- Maze Generation ----
function makeMaze() {
  let cols = 8;
  let rows = 6;
  let cellW = width / (cols + 2);
  let cellH = height / (rows + 2);
  let offsetX = cellW;
  let offsetY = cellH;
  let visited = Array(cols)
    .fill()
    .map(() => Array(rows).fill(false));

  generateMaze(0, 0, visited, cols, rows, cellW, cellH, offsetX, offsetY);
}

// Recursive depth-first maze generation
function generateMaze(cx, cy, visited, cols, rows, cw, ch, ox, oy) {
  visited[cx][cy] = true;

  let dirs = [0, 1, 2, 3];
  shuffleArray(dirs);

  for (let d of dirs) {
    let nx = cx;
    let ny = cy;
    if (d === 0) ny--;
    else if (d === 1) nx++;
    else if (d === 2) ny++;
    else if (d === 3) nx--;

    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited[nx][ny]) {
      let x1 = ox + cx * cw;
      let y1 = oy + cy * ch;
      let x2 = ox + nx * cw;
      let y2 = oy + ny * ch;

      let c = random(1) > 0.5 ? moss : wood;
      walls.push(new Wall(x1 + cw / 2, y1 + ch / 2, x2 + cw / 2, y2 + ch / 2, c));

      generateMaze(nx, ny, visited, cols, rows, cw, ch, ox, oy);
    }
  }
}

// Fisher–Yates shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = int(random(i + 1));
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}
