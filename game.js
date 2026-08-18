const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 28,
  speed: 4,
  hp: 100,
  weapon: 1
};

const enemies = [
  { x: 180, y: 180, hp: 100, size: 26 },
  { x: 500, y: 300, hp: 100, size: 26 },
  { x: 700, y: 500, hp: 100, size: 26 }
];

const keys = {};

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

function movePlayer() {
  if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
  if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
  if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
  if (keys["d"] || keys["arrowright"]) player.x += player.speed;

  player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));
}

function drawBackground() {
  ctx.fillStyle = "#101820";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#1d303b";

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

function drawPlayer() {
  ctx.fillStyle = "#36a9ff";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawEnemies() {
  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;

    ctx.fillStyle = "#ff4040";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();

    // HP bar
    ctx.fillStyle = "#222";
    ctx.fillRect(enemy.x - 30, enemy.y - 42, 60, 7);

    ctx.fillStyle = "#40e060";
    ctx.fillRect(
      enemy.x - 30,
      enemy.y - 42,
      60 * (enemy.hp / 100),
      7
    );
  }
}

function drawHUD() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "18px Arial";
  ctx.fillText(`HP: ${player.hp}`, 20, 30);
  ctx.fillText(`Weapon: ${player.weapon}`, 20, 55);

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

function fire() {
  let closest = null;
  let distance = Infinity;

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < distance) {
      distance = d;
      closest = enemy;
    }
  }

  if (closest && distance < 500) {
    closest.hp -= 25;

    if (closest.hp < 0) {
      closest.hp = 0;
    }
  }
}

function switchWeapon() {
  player.weapon++;

  if (player.weapon > 3) {
    player.weapon = 1;
  }
}

function createButton(text, x, y, action) {
  const button = document.createElement("button");

  button.textContent = text;

  button.style.position = "fixed";
  button.style.left = x;
  button.style.bottom = y;
  button.style.width = "75px";
  button.style.height = "75px";
  button.style.borderRadius = "50%";
  button.style.border = "2px solid white";
  button.style.background = "rgba(255,255,255,0.15)";
  button.style.color = "white";
  button.style.fontSize = "16px";
  button.style.zIndex = "10";

  button.addEventListener("touchstart", e => {
    e.preventDefault();
    action();
  });

  button.addEventListener("click", action);

  document.body.appendChild(button);
}

createButton("FIRE", "calc(100% - 100px)", "80px", fire);

createButton("GUN", "calc(100% - 100px)", "170px", switchWeapon);

createButton("↑", "110px", "150px", () => {
  player.y -= 20;
});

createButton("↓", "110px", "60px", () => {
  player.y += 20;
});

createButton("←", "20px", "60px", () => {
  player.x -= 20;
});

createButton("→", "200px", "60px", () => {
  player.x += 20;
});

function gameLoop() {
  movePlayer();

  drawBackground();
  drawEnemies();
  drawPlayer();
  drawHUD();

  requestAnimationFrame(gameLoop);
}

gameLoop();