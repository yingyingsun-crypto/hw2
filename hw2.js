import processing.sound.*;
SoundFile hitSound, winSound, bgMusic;

Ball ball;
ArrayList<Wall> walls;
PVector goal;
int state = 0; // 0 = start, 1 = play, 2 = hit, 3 = win

// Earth tone palette
color soil = color(110, 80, 50);
color moss = color(90, 130, 90);
color wood = color(140, 100, 60);
color sky = color(100, 180, 255);

void setup() {
  size(800, 600);
  ball = new Ball(100, 100);
  walls = new ArrayList<Wall>();
  goal = new PVector(random(150, width-150), random(150, height-150));
  makeMaze();

  hitSound = new SoundFile(this, "hit.wav");
  winSound = new SoundFile(this, "win.wav");
  bgMusic = new SoundFile(this, "background.mp3");
  if (!bgMusic.isPlaying()) bgMusic.loop();
}

void draw() {
  background(soil);
  textAlign(CENTER);

  if (state == 0) startScreen();
  else if (state == 1) playGame();
  else if (state == 2) endScreen("Oops, you hit something! Try again?", color(200, 80, 80));
  else if (state == 3) endScreen("Congrats! You found the diamond!!", color(80, 200, 120));
}

void startScreen() {
  textSize(36);
  fill(240);
  text("Follow the Path", width/2, height/2 - 30);
  textSize(18);
  text("Click to start", width/2, height/2 + 20);
}

void playGame() {
  // Draw goal (diamond)
  pushMatrix();
  translate(goal.x, goal.y);
  rotate(PI/4);
  noStroke();
  fill(sky);
  rectMode(CENTER);
  rect(0, 0, 28, 28);
  popMatrix();

  // Draw maze walls
  for (Wall w : walls) w.display();

  // Player
  ball.followMouse();
  ball.display();

  // Collisions
  for (Wall w : walls) {
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

void endScreen(String msg, color c) {
  textSize(30);
  fill(c);
  text(msg, width/2, height/2 - 10);
  textSize(18);
  text("Press R to restart", width/2, height/2 + 30);
}

void mousePressed() {
  if (state == 0) state = 1;
}

void keyPressed() {
  if (key == 'r' || key == 'R') {
    ball = new Ball(100, 100);
    walls.clear();
    goal = new PVector(random(150, width-150), random(150, height-150));
    makeMaze();
    state = 1;
  }
}

// ---- Ball ----
class Ball {
  PVector pos;
  float r = 15;
  Ball(float x, float y) { pos = new PVector(x, y); }
  void followMouse() { pos.set(mouseX, mouseY); }
  void display() { noStroke(); fill(150, 220, 250); ellipse(pos.x, pos.y, r*2, r*2); }
}

// ---- Wall ----
class Wall {
  PVector a, b;
  color c;
  Wall(float x1, float y1, float x2, float y2, color c_) {
    a = new PVector(x1, y1);
    b = new PVector(x2, y2);
    c = c_;
  }
  void display() {
    stroke(c); strokeWeight(14); line(a.x, a.y, b.x, b.y);
  }
  boolean hit(PVector p, float r) {
    PVector ap = PVector.sub(p, a);
    PVector ab = PVector.sub(b, a);
    float t = constrain(ap.dot(ab)/ab.magSq(), 0, 1);
    PVector proj = PVector.add(a, PVector.mult(ab, t));
    return PVector.dist(p, proj) < r;
  }
}

// ---- Maze Generator ----
void makeMaze() {
  int cols = 8;
  int rows = 6;
  float cellW = width / (cols + 2);
  float cellH = height / (rows + 2);
  float offsetX = cellW;
  float offsetY = cellH;
  boolean[][] visited = new boolean[cols][rows];

  // Generate the maze
  generateMaze(0, 0, visited, cols, rows, cellW, cellH, offsetX, offsetY);
}

// Recursive maze generation (Depth-first search)
void generateMaze(int cx, int cy, boolean[][] visited, int cols, int rows, float cw, float ch, float ox, float oy) {
  visited[cx][cy] = true;

  int[] dirs = {0, 1, 2, 3};
  shuffleArray(dirs); // <-- fixed shuffle

  for (int d : dirs) {
    int nx = cx;
    int ny = cy;
    if (d == 0) ny--;
    else if (d == 1) nx++;
    else if (d == 2) ny++;
    else if (d == 3) nx--;

    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited[nx][ny]) {
      float x1 = ox + cx * cw;
      float y1 = oy + cy * ch;
      float x2 = ox + nx * cw;
      float y2 = oy + ny * ch;

      color c = (random(1) > 0.5) ? moss : wood;
      walls.add(new Wall(x1 + cw/2, y1 + ch/2, x2 + cw/2, y2 + ch/2, c));

      generateMaze(nx, ny, visited, cols, rows, cw, ch, ox, oy);
    }
  }
}

// Manual array shuffle (Fisher–Yates)
void shuffleArray(int[] array) {
  for (int i = array.length - 1; i > 0; i--) {
    int j = int(random(i + 1));
    int temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
