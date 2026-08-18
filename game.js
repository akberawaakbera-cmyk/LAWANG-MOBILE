const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hpText = document.getElementById("hp");
const weaponText = document.getElementById("weapon");
const scoreText = document.getElementById("score");
let W = 0;
let H = 0;
const player = {
  x: 0,
  y: 0,
  radius: 18,
  speed: 4,
  hp: 100,
  maxHp: 100
};
const weapons = [
  {
    name: "PISTOL",
    damage: 25,
    fireRate: 350,
    ammo: 12,
    maxAmmo: 12
  },
  {
    name: "RIFLE",
    damage: 10,
    fireRate: 100,
    ammo: 30,
    maxAmmo: 30
  },
  {
    name: "SHOTGUN",
    damage: 40,
    fireRate: 700,
    ammo: 6,
    maxAmmo: 6
  }
];
let weaponIndex = 0;
let lastShot = 0;
let score = 0;
const enemy = {
  x: 0,
  y: 0,
  radius: 26,
  hp: 100,
  maxHp: 100,
  speed: 1.2,
  direction: 1
};
const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  player.x = Math.min(
    Math.max(player.x, player.radius),
    W - player.radius
  );
  player.y = Math.min(
    Math.max(player.y, player.radius),
    H - player.radius
  );
}
window.addEventListener("resize", resize);
function currentWeapon() {
  return weapons[weaponIndex];
}
function updateHUD() {
  const weapon = currentWeapon();
  hpText.textContent = Math.max(
    0,
    Math.round(player.hp)
  );
  weaponText.textContent =
    `${weapon.name} ${weapon.ammo}/${weapon.maxAmmo}`;
  scoreText.textContent = score;
}
function movePlayer() {
  if (keys.up) player.y -= player.speed;
  if (keys.down) player.y += player.speed;
  if (keys.left) player.x -= player.speed;
  if (keys.right) player.x += player.speed;
  player.x = Math.max(
    player.radius,
    Math.min(W - player.radius, player.x)
  );
  player.y = Math.max(
    player.radius,
    Math.min(H - player.radius, player.y)
  );
}
function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(
    dx * dx + dy * dy
  );
}
function shoot() {
  const weapon = currentWeapon();
  const now = Date.now();
  if (
    now - lastShot <
    weapon.fireRate
  ) {
    return;
  }
  if (weapon.ammo <= 0) {
    return;
  }
  lastShot = now;
  weapon.ammo--;
  const d = distance(
    player,
    enemy
  );
  if (d < 350) {
    enemy.hp -= weapon.damage;
    if (enemy.hp <= 0) {
      score++;
      respawnEnemy();
    }
  }
  updateHUD();
}
function switchWeapon() {
  weaponIndex++;
  if (
    weaponIndex >=
    weapons.length
  ) {
    weaponIndex = 0;
  }
  updateHUD();
}
function respawnEnemy() {
  enemy.hp = enemy.maxHp;
  enemy.x =
    100 +
    Math.random() *
    Math.max(100, W - 200);
  enemy.y =
    120 +
    Math.random() *
    Math.max(100, H - 220);
}
function updateEnemy() {
  enemy.x +=
    enemy.speed *
    enemy.direction;
  if (
    enemy.x >
    W - enemy.radius
  ) {
    enemy.direction = -1;
  }
  if (
    enemy.x <
    enemy.radius
  ) {
    enemy.direction = 1;
  }
  if (
    distance(player, enemy) <
    55
  ) {
    player.hp -= 0.08;
    if (player.hp <= 0) {
      player.hp = player.maxHp;
      player.x = W / 2;
      player.y = H / 2;
    }
  }
  updateHUD();
}
function drawBackground() {
  ctx.fillStyle = "#18212b";
  ctx.fillRect(
    0,
    0,
    W,
    H
  );
  ctx.strokeStyle =
    "rgba(255,255,255,0.06)";
  const grid = 50;
  for (
    let x = 0;
    x < W;
    x += grid
  ) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (
    let y = 0;
    y < H;
    y += grid
  ) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}
function drawPlayer() {
  ctx.beginPath();
  ctx.arc(
    player.x,
    player.y,
    player.radius,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "#42a5f5";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(
    player.x,
    player.y - player.radius
  );
  ctx.lineTo(
    player.x - 6,
    player.y -
      player.radius -
      12
  );
  ctx.lineTo(
    player.x + 6,
    player.y -
      player.radius -
      12
  );
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}
function drawEnemy() {
  ctx.beginPath();
  ctx.arc(
    enemy.x,
    enemy.y,
    enemy.radius,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "#e53935";
  ctx.fill();
  const width = 70;
  const height = 8;
  const x =
    enemy.x -
    width / 2;
  const y =
    enemy.y - 45;
  ctx.fillStyle = "#333";
  ctx.fillRect(
    x,
    y,
    width,
    height
  );
  ctx.fillStyle = "#4caf50";
  ctx.fillRect(
    x,
    y,
    width *
      (enemy.hp /
        enemy.maxHp),
    height
  );
}
function drawAimLine() {
  ctx.beginPath();
  ctx.moveTo(
    player.x,
    player.y
  );
  ctx.lineTo(
    enemy.x,
    enemy.y
  );
  ctx.strokeStyle =
    "rgba(255,255,255,0.12)";
  ctx.stroke();
}
function drawCrosshair() {
  const x = W / 2;
  const y = H / 2;
  ctx.beginPath();
  ctx.arc(
    x,
    y,
    12,
    0,
    Math.PI * 2
  );
  ctx.strokeStyle =
    "rgba(255,255,255,0.5)";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(
    x - 18,
    y
  );
  ctx.lineTo(
    x + 18,
    y
  );
  ctx.moveTo(
    x,
    y - 18
  );
  ctx.lineTo(
    x,
    y + 18
  );
  ctx.stroke();
}
function gameLoop() {
  movePlayer();
  updateEnemy();
  drawBackground();
  drawAimLine();
  drawEnemy();
  drawPlayer();
  drawCrosshair();
  requestAnimationFrame(
    gameLoop
  );
}
function bindButton(
  id,
  key
) {
  const button =
    document.getElementById(id);
  button.addEventListener(
    "touchstart",
    event => {
      event.preventDefault();
      keys[key] = true;
    },
    { passive: false }
  );
  button.addEventListener(
    "touchend",
    event => {
      event.preventDefault();
      keys[key] = false;
    },
    { passive: false }
  );
  button.addEventListener(
    "mousedown",
    event => {
      event.preventDefault();
      keys[key] = true;
    }
  );
  button.addEventListener(
    "mouseup",
    event => {
      event.preventDefault();
      keys[key] = false;
    }
  );
  button.addEventListener(
    "mouseleave",
    () => {
      keys[key] = false;
    }
  );
}
bindButton("up", "up");
bindButton("down", "down");
bindButton("left", "left");
bindButton("right", "right");
const fireButton =
  document.getElementById(
    "fire"
  );
fireButton.addEventListener(
  "touchstart",
  event => {
    event.preventDefault();
    shoot();
  },
  { passive: false }
);
fireButton.addEventListener(
  "mousedown",
  event => {
    event.preventDefault();
    shoot();
  }
);
const switchButton =
  document.getElementById(
    "switch"
  );
switchButton.addEventListener(
  "touchstart",
  event => {
    event.preventDefault();
    switchWeapon();
  },
  { passive: false }
);
switchButton.addEventListener(
  "mousedown",
  event => {
    event.preventDefault();
    switchWeapon();
  }
);
window.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "w" ||
      event.key === "ArrowUp"
    ) {
      keys.up = true;
    }
    if (
      event.key === "s" ||
      event.key === "ArrowDown"
    ) {
      keys.down = true;
    }
    if (
      event.key === "a" ||
      event.key === "ArrowLeft"
    ) {
      keys.left = true;
    }
    if (
      event.key === "d" ||
      event.key === "ArrowRight"
    ) {
      keys.right = true;
    }
    if (
      event.code === "Space"
    ) {
      shoot();
    }
    if (
      event.key === "q"
    ) {
      switchWeapon();
    }
  }
);
window.addEventListener(
  "keyup",
  event => {
    if (
      event.key === "w" ||
      event.key === "ArrowUp"
    ) {
      keys.up = false;
    }
    if (
      event.key === "s" ||
      event.key === "ArrowDown"
    ) {
      keys.down = false;
    }
    if (
      event.key === "a" ||
      event.key === "ArrowLeft"
    ) {
      keys.left = false;
    }
    if (
      event.key === "d" ||
      event.key === "ArrowRight"
    ) {
      keys.right = false;
    }
  }
);
resize();
player.x = W / 2;
player.y = H / 2;
enemy.x = W / 2 + 180;
enemy.y = H / 2;
updateHUD();
gameLoop();