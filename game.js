const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// =========================
// PLAYER
// =========================

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 36,
  height: 50,
  speed: 4,
  hp: 100,
  direction: 0
};

// =========================
// GAME
// =========================

let score = 0;
let weapon = "Pistol";
let firing = false;

const enemies = [
  { x: 180, y: 180, hp: 100 },
  { x: 500, y: 250, hp: 100 },
  { x: 700, y: 450, hp: 100 }
];

// =========================
// KEYBOARD
// =========================

const keys = {};

window.addEventListener("keydown", event => {
  keys[event.key.toLowerCase()] = true;

  if (event.key === " ") {
    fire();
  }

  if (event.key.toLowerCase() === "q") {
    switchWeapon();
  }
});

window.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

// =========================
// PLAYER MOVEMENT
// =========================

function updatePlayer() {
  if (keys["w"] || keys["arrowup"]) {
    player.y -= player.speed;
    player.direction = -Math.PI / 2;
  }

  if (keys["s"] || keys["arrowdown"]) {
    player.y += player.speed;
    player.direction = Math.PI / 2;
  }

  if (keys["a"] || keys["arrowleft"]) {
    player.x -= player.speed;
    player.direction = Math.PI;
  }

  if (keys["d"] || keys["arrowright"]) {
    player.x += player.speed;
    player.direction = 0;
  }

  player.x = Math.max(25, Math.min(canvas.width - 25, player.x));
  player.y = Math.max(35, Math.min(canvas.height - 35, player.y));
}

// =========================
// BACKGROUND
// =========================

function drawMap() {
  ctx.fillStyle = "#101820";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#1d3038";
  ctx.lineWidth = 1;

  for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// =========================
// PLAYER GRAPHIC
// =========================

function drawPlayer() {
  ctx.save();

  ctx.translate(player.x, player.y);

  // Body
  ctx.fillStyle = "#2388ff";
  ctx.fillRect(
    -player.width / 2,
    -player.height / 2,
    player.width,
    player.height
  );

  // Head
  ctx.fillStyle = "#f0b48a";
  ctx.beginPath();
  ctx.arc(0, -32, 13, 0, Math.PI * 2);
  ctx.fill();

  // Weapon
  ctx.strokeStyle = "#dddddd";
  ctx.lineWidth = 7;

  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(
    Math.cos(player.direction) * 35,
    Math.sin(player.direction) * 35 - 5
  );
  ctx.stroke();

  ctx.restore();
}

// =========================
// ENEMIES
// =========================

function drawEnemies() {
  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;

    ctx.fillStyle = "#e83b3b";

    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, 24, 0, Math.PI * 2);
    ctx.fill();

    // HP background
    ctx.fillStyle = "#222";
    ctx.fillRect(enemy.x - 30, enemy.y - 38, 60, 7);

    // HP
    ctx.fillStyle = "#36df62";
    ctx.fillRect(
      enemy.x - 30,
      enemy.y - 38,
      60 * (enemy.hp / 100),
      7
    );
  }
}

// =========================
// SHOOTING
// =========================

function fire() {
  firing = true;

  let closest = null;
  let closestDistance = Infinity;

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;

    const distance = Math.sqrt(
      dx * dx + dy * dy
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = enemy;
    }
  }

  if (closest && closestDistance < 500) {
    closest.hp -= 25;

    if (closest.hp <= 0) {
      closest.hp = 0;
      score += 100;
    }
  }

  setTimeout(() => {
    firing = false;
  }, 100);
}

// =========================
// WEAPON
// =========================

function switchWeapon() {
  if (weapon === "Pistol") {
    weapon = "Rifle";
  } else if (weapon === "Rifle") {
    weapon = "Shotgun";
  } else {
    weapon = "Pistol";
  }
}

// =========================
// HUD
// =========================

function drawHUD() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "18px Arial";

  ctx.fillText(
    `HP: ${player.hp}`,
    20,
    30
  );

  ctx.fillText(
    `Weapon: ${weapon}`,
    20,
    55
  );

  ctx.fillText(
    `Score: ${score}`,
    20,
    80
  );

  // Crosshair
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.moveTo(cx - 12, cy);
  ctx.lineTo(cx - 4, cy);

  ctx.moveTo(cx + 4, cy);
  ctx.lineTo(cx + 12, cy);

  ctx.moveTo(cx, cy - 12);
  ctx.lineTo(cx, cy - 4);

  ctx.moveTo(cx, cy + 4);
  ctx.lineTo(cx, cy + 12);

  ctx.stroke();
}

// =========================
// MOBILE BUTTON
// =========================

function createButton(text, right, bottom, action) {
  const button = document.createElement("button");

  button.textContent = text;

  button.style.position = "fixed";
  button.style.right = right;
  button.style.bottom = bottom;

  button.style.width = "70px";
  button.style.height = "70px";

  button.style.borderRadius = "50%";
  button.style.border = "2px solid white";

  button.style.background =
    "rgba(255,255,255,0.15)";

  button.style.color = "white";
  button.style.fontSize = "15px";

  button.style.zIndex = "9999";

  button.addEventListener(
    "touchstart",
    event => {
      event.preventDefault();
      action();
    },
    { passive: false }
  );

  button.addEventListener("click", action);

  document.body.appendChild(button);
}

// FIRE
createButton(
  "FIRE",
  "25px",
  "80px",
  fire
);

// WEAPON
createButton(
  "GUN",
  "25px",
  "165px",
  switchWeapon
);

// UP
createButton(
  "▲",
  "120px",
  "150px",
  () => {
    player.y -= 25;
  }
);

// DOWN
createButton(
  "▼",
  "120px",
  "55px",
  () => {
    player.y += 25;
  }
);

// LEFT
createButton(
  "◀",
  "205px",
  "55px",
  () => {
    player.x -= 25;
  }
);

// RIGHT
createButton(
  "▶",
  "35px",
  "55px",
  () => {
    player.x += 25;
  }
);

// =========================
// GAME LOOP
// =========================

function gameLoop() {
  updatePlayer();

  drawMap();
  drawEnemies();
  drawPlayer();
  drawHUD();

  requestAnimationFrame(gameLoop);
}

gameLoop();