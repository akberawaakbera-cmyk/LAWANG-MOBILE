const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const player = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  width: 36,
  height: 50,
  speed: 4,
  hp: 100,
  direction: 0,
  moving: false,
  running: false,
  crouching: false,
  jumping: false,
  jumpTimer: 0,
  animation: 0
};
let score = 0;
let weapon = "Pistol";
let firing = false;
let reloading = false;
const weaponData = {
  Pistol: {
    damage: 25,
    maxAmmo: 12,
    fireRate: 250,
    bulletSpeed: 12
  },
  Rifle: {
    damage: 15,
    maxAmmo: 30,
    fireRate: 110,
    bulletSpeed: 15
  },
  Shotgun: {
    damage: 12,
    maxAmmo: 6,
    fireRate: 500,
    bulletSpeed: 10
  }
};
let ammo = weaponData[weapon].maxAmmo;
const bullets = [];
const enemies = [
  { x: 180, y: 180, hp: 100, maxHp: 100, hitEffect: 0 },
  { x: 500, y: 250, hp: 100, maxHp: 100, hitEffect: 0 },
  { x: 700, y: 450, hp: 100, maxHp: 100, hitEffect: 0 }
];
let muzzleFlash = 0;
let weaponAnimation = 0;
let screenFlash = 0;
/* =========================
   RESIZE
========================= */
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  player.x = Math.max(
    25,
    Math.min(canvas.width - 25, player.x)
  );
  player.y = Math.max(
    35,
    Math.min(canvas.height - 35, player.y)
  );
}
window.addEventListener("resize", resizeCanvas);
/* =========================
   AUDIO
========================= */
const sounds = {
  fire: new Audio("assets/fire.mp3"),
  hit: new Audio("assets/hit.mp3"),
  switch: new Audio("assets/switch.mp3"),
  reload: new Audio("assets/reload.mp3"),
  jump: new Audio("assets/jump.mp3"),
  music: new Audio("assets/music.mp3")
};
sounds.music.loop = true;
sounds.music.volume = 0.15;
let audioStarted = false;
function startAudio() {
  if (audioStarted) return;
  audioStarted = true;
  sounds.music.play().catch(() => {});
}
function playSound(name) {
  const sound = sounds[name];
  if (!sound) return;
  try {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  } catch (error) {}
}
/* =========================
   KEYBOARD
========================= */
const keys = {};
window.addEventListener("keydown", event => {
  keys[event.key.toLowerCase()] = true;
  if (event.key === " ") {
    event.preventDefault();
    jump();
  }
  if (event.key.toLowerCase() === "f") {
    fire();
  }
  if (event.key.toLowerCase() === "r") {
    reload();
  }
  if (event.key.toLowerCase() === "q") {
    switchWeapon();
  }
});
window.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});
/* =========================
   JOYSTICK
========================= */
function joystickX() {
  return Number(window.joystickX || 0);
}
function joystickY() {
  return Number(window.joystickY || 0);
}
/* =========================
   PLAYER MOVEMENT
========================= */
function updatePlayer() {
  player.moving = false;
  let moveX = 0;
  let moveY = 0;
  if (keys["a"] || keys["arrowleft"]) {
    moveX -= 1;
  }
  if (keys["d"] || keys["arrowright"]) {
    moveX += 1;
  }
  if (keys["w"] || keys["arrowup"]) {
    moveY -= 1;
  }
  if (keys["s"] || keys["arrowdown"]) {
    moveY += 1;
  }
  const jx = joystickX();
  const jy = joystickY();
  if (
    Math.abs(jx) > 0.05 ||
    Math.abs(jy) > 0.05
  ) {
    moveX = jx;
    moveY = jy;
  }
  if (
    Math.abs(moveX) > 0.05 ||
    Math.abs(moveY) > 0.05
  ) {
    player.direction = Math.atan2(moveY, moveX);
    player.moving = true;
  }
  player.running = window.runPressed === true;
  let speed = player.speed;
  if (player.running) {
    speed *= 1.7;
  }
  if (player.crouching) {
    speed *= 0.55;
  }
  player.x += moveX * speed;
  player.y += moveY * speed;
  if (player.moving) {
    player.animation += 0.2;
  }
  if (player.jumping) {
    player.jumpTimer--;
    if (player.jumpTimer <= 0) {
      player.jumping = false;
    }
  }
  player.x = Math.max(
    25,
    Math.min(canvas.width - 25, player.x)
  );
  player.y = Math.max(
    35,
    Math.min(canvas.height - 35, player.y)
  );
}
/* =========================
   AIM
========================= */
function aimAt(x, y) {
  const dx = x - player.x;
  const dy = y - player.y;
  if (Math.abs(dx) + Math.abs(dy) > 5) {
    player.direction = Math.atan2(dy, dx);
  }
}
const aimArea = document.getElementById("aimArea");
if (aimArea) {
  aimArea.addEventListener(
    "touchmove",
    event => {
      const touch = event.touches[0];
      aimAt(
        touch.clientX,
        touch.clientY
      );
    },
    { passive: true }
  );
}
/* =========================
   JUMP
========================= */
function jump() {
  if (player.jumping) return;
  startAudio();
  player.jumping = true;
  player.jumpTimer = 25;
  playSound("jump");
}
/* =========================
   CROUCH
========================= */
function toggleCrouch() {
  player.crouching = !player.crouching;
}
/* =========================
   RUN
========================= */
function setRun(state) {
  window.runPressed = state;
}
/* =========================
   WEAPON SWITCH
========================= */
function switchWeapon() {
  startAudio();
  if (weapon === "Pistol") {
    weapon = "Rifle";
  } else if (weapon === "Rifle") {
    weapon = "Shotgun";
  } else {
    weapon = "Pistol";
  }
  ammo = weaponData[weapon].maxAmmo;
  weaponAnimation = 12;
  playSound("switch");
  updateHUD();
}
/* =========================
   RELOAD
========================= */
function reload() {
  if (reloading) return;
  if (
    ammo >= weaponData[weapon].maxAmmo
  ) {
    return;
  }
  startAudio();
  reloading = true;
  playSound("reload");
  setTimeout(() => {
    ammo = weaponData[weapon].maxAmmo;
    reloading = false;
    updateHUD();
  }, 1200);
}
/* =========================
   CREATE BULLET
========================= */
function createBullet(angle, damage) {
  bullets.push({
    x: player.x,
    y: player.y,
    vx: Math.cos(angle) * weaponData[weapon].bulletSpeed,
    vy: Math.sin(angle) * weaponData[weapon].bulletSpeed,
    damage: damage,
    life: 70,
    size: weapon === "Shotgun" ? 4 : 3
  });
}
/* =========================
   FIRE
========================= */
function fire() {
  if (firing) return;
  if (reloading) return;
  if (ammo <= 0) {
    reload();
    return;
  }
  startAudio();
  firing = true;
  ammo--;
  playSound("fire");
  muzzleFlash = 8;
  weaponAnimation = 8;
  const data = weaponData[weapon];
  if (weapon === "Shotgun") {
    for (let i = -2; i <= 2; i++) {
      const spread =
        player.direction + i * 0.08;
      createBullet(
        spread,
        data.damage
      );
    }
  } else {
    createBullet(
      player.direction,
      data.damage
    );
  }
  updateHUD();
  setTimeout(() => {
    firing = false;
  }, data.fireRate);
}
/* =========================
   BULLET UPDATE
========================= */
function updateBullets() {
  for (
    let i = bullets.length - 1;
    i >= 0;
    i--
  ) {
    const bullet = bullets[i];
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    bullet.life--;
    let removeBullet = false;
    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height ||
      bullet.life <= 0
    ) {
      removeBullet = true;
    }
    for (
      const enemy of enemies
    ) {
      if (enemy.hp <= 0) continue;
      const dx =
        bullet.x - enemy.x;
      const dy =
        bullet.y - enemy.y;
      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );
      if (distance < 25) {
        enemy.hp -= bullet.damage;
        enemy.hitEffect = 8;
        screenFlash = 4;
        playSound("hit");
        removeBullet = true;
        if (enemy.hp <= 0) {
          enemy.hp = 0;
          score += 100;
        }
        break;
      }
    }
    if (removeBullet) {
      bullets.splice(i, 1);
    }
  }
}
/* =========================
   DRAW BULLETS
========================= */
function drawBullets() {
  for (const bullet of bullets) {
    ctx.beginPath();
    ctx.fillStyle = "#ffd34d";
    ctx.arc(
      bullet.x,
      bullet.y,
      bullet.size,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}
/* =========================
   MAP
========================= */
function drawMap() {
  ctx.fillStyle = "#101820";
  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.strokeStyle = "#1d3038";
  ctx.lineWidth = 1;
  for (
    let x = 0;
    x < canvas.width;
    x += 50
  ) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(
      x,
      canvas.height
    );
    ctx.stroke();
  }
  for (
    let y = 0;
    y < canvas.height;
    y += 50
  ) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(
      canvas.width,
      y
    );
    ctx.stroke();
  }
}
/* =========================
   PLAYER GRAPHIC
========================= */
function drawPlayer() {
  ctx.save();
  ctx.translate(
    player.x,
    player.y
  );
  let bob = 0;
  if (player.moving) {
    bob =
      Math.sin(
        player.animation
      ) * 3;
  }
  if (player.jumping) {
    bob -= 18;
  }
  ctx.fillStyle =
    player.crouching
      ? "#1764bb"
      : "#2388ff";
  ctx.fillRect(
    -player.width / 2,
    -player.height / 2 + bob,
    player.width,
    player.height
  );
  ctx.fillStyle = "#f0b48a";
  ctx.beginPath();
  ctx.arc(
    0,
    -32 + bob,
    13,
    0,
    Math.PI * 2
  );
  ctx.fill();
  let weaponOffset = 0;
  if (weaponAnimation > 0) {
    weaponOffset = 5;
  }
  ctx.strokeStyle = "#dddddd";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(
    0,
    -5
  );
  ctx.lineTo(
    Math.cos(
      player.direction
    ) *
      (35 + weaponOffset),
    Math.sin(
      player.direction
    ) *
      (35 + weaponOffset) -
      5
  );
  ctx.stroke();
  ctx.restore();
}
/* =========================
   MUZZLE FLASH
========================= */
function drawShootEffect() {
  if (muzzleFlash <= 0) return;
  ctx.save();
  ctx.translate(
    player.x,
    player.y
  );
  const length = 50;
  ctx.fillStyle = "#ffd34d";
  ctx.beginPath();
  ctx.moveTo(
    Math.cos(
      player.direction
    ) * length,
    Math.sin(
      player.direction
    ) * length - 5
  );
  ctx.lineTo(
    Math.cos(
      player.direction + 0.35
    ) * 20,
    Math.sin(
      player.direction + 0.35
    ) * 20 - 5
  );
  ctx.lineTo(
    Math.cos(
      player.direction - 0.35
    ) * 20,
    Math.sin(
      player.direction - 0.35
    ) * 20 - 5
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
/* =========================
   ENEMIES
========================= */
function drawEnemies() {
  for (
    const enemy of enemies
  ) {
    if (enemy.hp <= 0) continue;
    ctx.fillStyle =
      enemy.hitEffect > 0
        ? "#ffffff"
        : "#e83b3b";
    ctx.beginPath();
    ctx.arc(
      enemy.x,
      enemy.y,
      24,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.fillRect(
      enemy.x - 30,
      enemy.y - 38,
      60,
      7
    );
    ctx.fillStyle = "#36df62";
    ctx.fillRect(
      enemy.x - 30,
      enemy.y - 38,
      60 *
        (enemy.hp /
          enemy.maxHp),
      7
    );
  }
}
/* =========================
   EFFECTS
========================= */
function updateEffects() {
  if (muzzleFlash > 0) {
    muzzleFlash--;
  }
  if (weaponAnimation > 0) {
    weaponAnimation--;
  }
  if (screenFlash > 0) {
    screenFlash--;
  }
  for (
    const enemy of enemies
  ) {
    if (enemy.hitEffect > 0) {
      enemy.hitEffect--;
    }
  }
}
/* =========================
   HUD
========================= */
function updateHUD() {
  const hp =
    document.getElementById("hp");
  const weaponElement =
    document.getElementById("weapon");
  const scoreElement =
    document.getElementById("score");
  if (hp) {
    hp.textContent =
      player.hp;
  }
  if (weaponElement) {
    weaponElement.textContent =
      `${weapon.toUpperCase()} ${ammo}/${weaponData[weapon].maxAmmo}`;
  }
  if (scoreElement) {
    scoreElement.textContent =
      score;
  }
}
function drawHUD() {
  const cx =
    canvas.width / 2;
  const cy =
    canvas.height / 2;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(
    cx - 12,
    cy
  );
  ctx.lineTo(
    cx - 4,
    cy
  );
  ctx.moveTo(
    cx + 4,
    cy
  );
  ctx.lineTo(
    cx + 12,
    cy
  );
  ctx.moveTo(
    cx,
    cy - 12
  );
  ctx.lineTo(
    cx,
    cy - 4
  );
  ctx.moveTo(
    cx,
    cy + 4
  );
  ctx.lineTo(
    cx,
    cy + 12
  );
  ctx.stroke();
  if (screenFlash > 0) {
    ctx.fillStyle =
      "rgba(255,255,255,0.08)";
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }
}
/* =========================
   BUTTON CONNECTION
========================= */
function getButton(...ids) {
  for (const id of ids) {
    const element =
      document.getElementById(id);
    if (element) {
      return element;
    }
  }
  return null;
}
function bindTouch(
  element,
  start,
  end
) {
  if (!element) return;
  element.addEventListener(
    "touchstart",
    event => {
      event.preventDefault();
      startAudio();
      if (start) start();
    },
    { passive: false }
  );
  element.addEventListener(
    "touchend",
    event => {
      event.preventDefault();
      if (end) end();
    },
    { passive: false }
  );
  element.addEventListener(
    "mousedown",
    event => {
      event.preventDefault();
      startAudio();
      if (start) start();
    }
  );
  element.addEventListener(
    "mouseup",
    event => {
      event.preventDefault();
      if (end) end();
    }
  );
}
/* =========================
   FIRE
========================= */
bindTouch(
  getButton(
    "fireButton",
    "fire"
  ),
  fire
);
/* =========================
   JUMP
========================= */
bindTouch(
  getButton(
    "jumpButton",
    "jump"
  ),
  jump
);
/* =========================
   RELOAD
========================= */
bindTouch(
  getButton(
    "reloadButton",
    "reload"
  ),
  reload
);
/* =========================
   GUN
========================= */
bindTouch(
  getButton(
    "gunButton",
    "switch",
    "weaponButton"
  ),
  switchWeapon
);
/* =========================
   RUN
========================= */
bindTouch(
  getButton(
    "runButton",
    "run"
  ),
  () => setRun(true),
  () => setRun(false)
);
/* =========================
   CROUCH
========================= */
bindTouch(
  getButton(
    "crouchButton",
    "crouch"
  ),
  toggleCrouch
);
/* =========================
   GAME LOOP
========================= */
function gameLoop() {
  updatePlayer();
  updateBullets();
  updateEffects();
  drawMap();
  drawBullets();
  drawEnemies();
  drawPlayer();
  drawShootEffect();
  drawHUD();
  updateHUD();
  requestAnimationFrame(
    gameLoop
  );
}
/* =========================
   START
========================= */
resizeCanvas();
updateHUD();
gameLoop();