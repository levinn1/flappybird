// variabel global
let gameScreen = 0; // 0: initial, 1: play, 2: game over
let ballX, ballY;
let ballSize = 20;
let ballColor;
let gravity = 1;
let ballSpeedVert = 0;
let airfriction = 0.0001;
let friction = 0.1;
let racketColor;
let racketWidth = 100;
let racketHeight = 10;
let racketBounceRate = 20;
let ballSpeedHorizon = 10;

let wallSpeed = 5;
let wallInterval = 1000;
let lastAddTime = 0;
let minGapHeight = 200;
let maxGapHeight = 300;
let wallWidth = 80;
let wallColors;

let walls = []; // ganti ArrayList jadi array biasa

let maxHealth = 100;
let health = 100;
let healthDecrease = 1;
let healthBarWidth = 60;

let score = 0;

function setup() {
  createCanvas(500, 500);
  ballColor = color(0);
  racketColor = color(0);
  wallColors = color(52, 152, 219);
  ballX = width / 4;
  ballY = height / 5;
}

function draw() {
  if (gameScreen === 0) initScreen();
  else if (gameScreen === 1) playScreen();
  else if (gameScreen === 2) gameOverScreen();
}

function initScreen() {
  background(0);
  textAlign(CENTER);
  fill(255);
  textSize(24);
  text("Klik untuk memulai", width / 2, height / 2);
}

function playScreen() {
  background(255);

  drawBall();
  drawRacket();

  applyGravity();
  keepInScreen();
  watchRacketBounce();
  applyHorizontalSpeed();

  wallAdder();
  wallHandler();

  drawHealthBar();
  printScore();
}

function gameOverScreen() {
  background(0);
  textAlign(CENTER);
  fill(255);
  textSize(30);
  text("Game Over", width / 2, height / 2 - 40);
  textSize(20);
  text("Score Akhir: " + score, width / 2, height / 2);
  textSize(15);
  text("Click to Restart", width / 2, height / 2 + 30);
}

// BALL
function drawBall() {
  fill(ballColor);
  ellipse(ballX, ballY, ballSize, ballSize);
}

function applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= ballSpeedVert * airfriction;
}

function makeBounceBottom(surface) {
  ballY = surface - ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function makeBounceTop(surface) {
  ballY = surface + ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function makeBounceLeft(surface) {
  ballX = surface + ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function makeBounceRight(surface) {
  ballX = surface - ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function keepInScreen() {
  if (ballX - ballSize / 2 < 0) makeBounceLeft(0);
  if (ballX + ballSize / 2 > width) makeBounceRight(width);
  if (ballY + ballSize / 2 > height) makeBounceBottom(height);
  if (ballY - ballSize / 2 < 0) makeBounceTop(0);
}

// RACKET
function drawRacket() {
  fill(racketColor);
  rectMode(CENTER);
  rect(mouseX, mouseY, racketWidth, racketHeight);
  rectMode(CORNER); // reset biar wall ga ikut center
}

function watchRacketBounce() {
  let overhead = mouseY - pmouseY;

  if (
    ballX + ballSize / 2 > mouseX - racketWidth / 2 &&
    ballX - ballSize / 2 < mouseX + racketWidth / 2
  ) {
    if (dist(ballX, ballY, ballX, mouseY) <= ballSize / 2 + abs(overhead)) {
      ballSpeedHorizon = (ballX - mouseX) / 5;
      makeBounceBottom(mouseY);

      if (overhead < 0) {
        ballY += overhead;
        ballSpeedVert += overhead;
      }
    }
  }
}

function applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= ballSpeedHorizon * airfriction;
}

// WALL SYSTEM
function wallAdder() {
  if (millis() - lastAddTime > wallInterval) {
    let randHeight = floor(random(minGapHeight, maxGapHeight));
    let randY = floor(random(0, height - randHeight));

    // [x, y, width, height, scoredFlag]
    walls.push([width, randY, wallWidth, randHeight, 0]);
    lastAddTime = millis();
  }
}

function wallHandler() {
  for (let i = walls.length - 1; i >= 0; i--) {
    wallMover(i);
    watchWallCollision(i);
    wallDrawer(i);
    wallRemover(i);
  }
}

function wallDrawer(i) {
  let [x, y, w, h] = walls[i];
  let radius = 20;
  fill(wallColors);
  rectMode(CORNER);

  // atas
  rect(x, 0, w, y, radius);
  // bawah
  rect(x, y + h, w, height - (y + h), radius);
}

function wallMover(i) {
  walls[i][0] -= wallSpeed;
}

function wallRemover(i) {
  if (walls[i][0] + walls[i][2] <= 0) {
    walls.splice(i, 1);
  }
}

function watchWallCollision(i) {
  let [x, y, w, h, scored] = walls[i];

  // top wall collision
  if (
    ballX + ballSize / 2 > x &&
    ballX - ballSize / 2 < x + w &&
    ballY + ballSize / 2 > 0 &&
    ballY - ballSize / 2 < y
  ) {
    decreaseHealth();
    makeBounceTop(y);
  }

  // bottom wall collision
  let bottomY = y + h;
  if (
    ballX + ballSize / 2 > x &&
    ballX - ballSize / 2 < x + w &&
    ballY + ballSize / 2 > bottomY &&
    ballY - ballSize / 2 < height
  ) {
    decreaseHealth();
    makeBounceBottom(bottomY);
  }

  // scoring
  if (ballX > x + w / 2 && scored === 0) {
    walls[i][4] = 1;
    increaseScore();
  }
}

// SCORE
function increaseScore() {
  score++;
}

function printScore() {
  textAlign(CENTER);
  fill(0);
  textSize(30);
  text(score, width - 40, 40);
}

// HEALTH
function drawHealthBar() {
  noStroke();
  fill(230);
  rect(ballX - healthBarWidth / 2, ballY - 30, healthBarWidth, 5);

  if (health > 60) fill(46, 204, 113);
  else if (health > 30) fill(230, 126, 34);
  else fill(231, 76, 60);

  rect(
    ballX - healthBarWidth / 2,
    ballY - 30,
    (health / maxHealth) * healthBarWidth,
    5
  );
}

function decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) gameOver();
}

// GAME CONTROL
function gameOver() {
  gameScreen = 2;
}

function restart() {
  score = 0;
  health = maxHealth;
  ballX = width / 4;
  ballY = height / 5;
  lastAddTime = 0;
  walls = [];
  ballSpeedVert = 0;
  ballSpeedHorizon = 10;
  gameScreen = 0;
}

function mousePressed() {
  if (gameScreen === 0) startGame();
  else if (gameScreen === 2) restart();
}

function startGame() {
  gameScreen = 1;
}
