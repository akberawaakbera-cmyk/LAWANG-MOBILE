const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
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
   PLAYER
========================= */
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
/* =========================
   GAME
========================= */
let score = 0;
let weapon = "Pistol";
let firing = false;
let reloading = false;
let ammo = 12;
const maxAmmo = 12;
/* =========================
   ENEMIES
========================= */
const enemies = [
  {
    x: 180,
    y: 180,
    hp: 100,
    hitEffect: 0
  },
  {
    x: 500,
    y: 250,
    hp: 100,
    hitEffect: 0
  },
  {
    x: 700,
    y: 450,
    hp: 100,
    hitEffect: 0
  }
];
/* =========================
   EFFECTS
========================= */
let muzzleFlash = 0;
let weaponAnimation = 0;
let screenFlash = 0;
/* =========================
   AUDIO
========================= */
const sounds = {
  fire:
    new Audio("assets/fire.mp3"),
  hit:
    new Audio("assets/hit.mp3"),
  switch:
    new Audio("assets/switch.mp3"),
  reload:
    new Audio("assets/reload.mp3"),
  jump:
    new Audio("assets/jump.mp3"),
  music:
    new Audio("assets/music.mp3")
};
Object.values(sounds).forEach(
  sound => {
    sound.volume = 0.4;
  }
);
sounds.music.loop = true;
sounds.music.volume = 0.15;
let audioStarted = false;
function startAudio() {
  if (audioStarted) {
    return;
  }
  audioStarted = true;
  sounds.music.play().catch(() => {});
}
function playSound(name) {
  const sound = sounds[name];
  if (!sound) {
    return;
  }
  try {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  } catch (error) {
    console.log(
      "Audio error:",
      error
    );
  }
}
document.addEventListener(
  "touchstart",
  startAudio,
  {
    once: true
  }
);
document.addEventListener(
  "click",
  startAudio,
  {
    once: true
  }
);
/* =========================
   KEYBOARD
========================= */
const keys = {};
window.addEventListener(
  "keydown",
  event => {
    keys[
      event.key.toLowerCase()
    ] = true;
    if (event.key === " ") {
      event.preventDefault();
      jump();
    }
    if (
      event.key.toLowerCase() === "f"
    ) {
      fire();
    }
    if (
      event.key.toLowerCase() === "r"
    ) {
      reload();
    }
    if (
      event.key.toLowerCase() === "q"
    ) {
      switchWeapon();
    }
  }
);
window.addEventListener(
  "keyup",
  event => {
    keys[
      event.key.toLowerCase()
    ] = false;
  }
);
/* =========================
   JOYSTICK
========================= */
function getJoystickX() {
  return Number(
    window.joystickX || 0
  );
}
function getJoystickY() {
  return Number(
    window.joystickY || 0
  );
}
/* =========================
   PLAYER MOVEMENT
========================= */
function updatePlayer() {
  player.moving = false;
  let moveX = 0;
  let moveY = 0;
  /* Keyboard */
  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {
    moveX -= 1;
  }
  if (
    keys["d"] ||
    keys["arrowright"]
  ) {
    moveX += 1;
  }
  if (
    keys["w"] ||
    keys["arrowup"]
  ) {
    moveY -= 1;
  }
  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {
    moveY += 1;
  }
  /* Joystick */
  const joyX =
    getJoystickX();
  const joyY =
    getJoystickY();
  if (
    Math.abs(joyX) > 0.05 ||
    Math.abs(joyY) > 0.05
  ) {
    moveX = joyX;
    moveY = joyY;
  }
  /* Direction */
  if (
    Math.abs(moveX) > 0.05 ||
    Math.abs(moveY) > 0.05
  ) {
    player.direction =
      Math.atan2(
        moveY,
        moveX
      );
    player.moving = true;
  }
  /* Run */
  player.running =
    window.runPressed === true;
  let speed =
    player.speed;
  if (player.running) {
    speed *= 1.7;
  }
  if (player.crouching) {
    speed *= 0.55;
  }
  /* Movement */
  player.x +=
    moveX * speed;
  player.y +=
    moveY * speed;
  /* Animation */
  if (player.moving) {
    player.animation += 0.2;
  }
  /* Jump */
  if (player.jumping) {
    player.jumpTimer--;
    if (
      player.jumpTimer <= 0
    ) {
      player.jumping = false;
    }
  }
  /* Boundaries */
  player.x =
    Math.max(
      25,
      Math.min(
        canvas.width - 25,
        player.x
      )
    );
  player.y =
    Math.max(
      35,
      Math.min(
        canvas.height - 35,
        player.y
      )
    );
}
/* =========================
   JUMP
========================= */
function jump() {
  if (player.jumping) {
    return;
  }
  startAudio();
  player.jumping = true;
  player.jumpTimer = 25;
  playSound("jump");
}
/* =========================
   RUN
========================= */
function setRun(state) {
  window.runPressed =
    state;
}
/* =========================
   CROUCH
========================= */
function toggleCrouch() {
  player.crouching =
    !player.crouching;
}
/* =========================
   WEAPON
========================= */
function switchWeapon() {
  startAudio();
  if (
    weapon === "Pistol"
  ) {
    weapon = "Rifle";
  }
  else if (
    weapon === "Rifle"
  ) {
    weapon = "Shotgun";
  }
  else {
    weapon = "Pistol";
  }
  weaponAnimation = 12;
  playSound("switch");
  updateHUD();
}
/* =========================
   RELOAD
========================= */
function reload() {
  if (reloading) {
    return;
  }
  if (ammo >= maxAmmo) {
    return;
  }
  startAudio();
  reloading = true;
  playSound("reload");
  setTimeout(
    () => {
      ammo = maxAmmo;
      reloading = false;
      updateHUD();
    },
    1200
  );
}
/* =========================
   FIRE
========================= */
function fire() {
  if (firing) {
    return;
  }
  if (reloading) {
    return;
  }
  if (ammo <= 0) {
    reload();
    return;
  }
  firing = true;
  startAudio();
  playSound("fire");
  ammo--;
  muzzleFlash = 8;
  weaponAnimation = 8;
  let closest = null;
  let closestDistance =
    Infinity;
  for (
    const enemy of enemies
  ) {
    if (
      enemy.hp <= 0
    ) {
      continue;
    }
    const dx =
      enemy.x -
      player.x;
    const dy =
      enemy.y -
      player.y;
    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );
    if (
      distance <
      closestDistance
    ) {
      closestDistance =
        distance;
      closest =
        enemy;
    }
  }
  if (
    closest &&
    closestDistance < 500
  ) {
    closest.hp -= 25;
    closest.hitEffect = 8;
    screenFlash = 5;
    playSound("hit");
    if (
      closest.hp <= 0
    ) {
      closest.hp = 0;
      score += 100;
    }
  }
  updateHUD();
  setTimeout(
    () => {
      firing = false;
    },
    120
  );
}
/* =========================
   EFFECTS
========================= */
function updateEffects() {
  if (
    muzzleFlash > 0
  ) {
    muzzleFlash--;
  }
  if (
    weaponAnimation > 0
  ) {
    weaponAnimation--;
  }
  if (
    screenFlash > 0
  ) {
    screenFlash--;
  }
  for (
    const enemy of enemies
  ) {
    if (
      enemy.hitEffect > 0
    ) {
      enemy.hitEffect--;
    }
  }
}
/* =========================
   MAP
========================= */
function drawMap() {
  ctx.fillStyle =
    "#101820";
  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.strokeStyle =
    "#1d3038";
  ctx.lineWidth = 1;
  for (
    let x = 0;
    x < canvas.width;
    x += 50
  ) {
    ctx.beginPath();
    ctx.moveTo(
      x,
      0
    );
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
    ctx.moveTo(
      0,
      y
    );
    ctx.lineTo(
      canvas.width,
      y
    );
    ctx.stroke();
  }
}
/* =========================
   PLAYER
========================= */
function drawPlayer() {
  ctx.save();
  ctx.translate(
    player.x,
    player.y
  );
  let bob = 0;
  if (
    player.moving
  ) {
    bob =
      Math.sin(
        player.animation
      ) * 3;
  }
  if (
    player.jumping
  ) {
    bob -= 18;
  }
  /* Body */
  ctx.fillStyle =
    player.crouching
      ? "#1764bb"
      : "#2388ff";
  ctx.fillRect(
    -player.width / 2,
    -player.height / 2 +
      bob,
    player.width,
    player.height
  );
  /* Head */
  ctx.fillStyle =
    "#f0b48a";
  ctx.beginPath();
  ctx.arc(
    0,
    -32 + bob,
    13,
    0,
    Math.PI * 2
  );
  ctx.fill();
  /* Weapon */
  let weaponOffset = 0;
  if (
    weaponAnimation > 0
  ) {
    weaponOffset = 5;
  }
  ctx.strokeStyle =
    "#dddddd";
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
      (35 + weaponOffset)
      - 5
  );
  ctx.stroke();
  ctx.restore();
}
/* =========================
   MUZZLE FLASH
========================= */
function drawShootEffect() {
  if (
    muzzleFlash <= 0
  ) {
    return;
  }
  ctx.save();
  ctx.translate(
    player.x,
    player.y
  );
  const length = 50;
  ctx.fillStyle =
    "#ffd34d";
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
    if (
      enemy.hp <= 0
    ) {
      continue;
    }
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
    /* HP */
    ctx.fillStyle =
      "#222";
    ctx.fillRect(
      enemy.x - 30,
      enemy.y - 38,
      60,
      7
    );
    ctx.fillStyle =
      "#36df62";
    ctx.fillRect(
      enemy.x - 30,
      enemy.y - 38,
      60 *
        (enemy.hp / 100),
      7
    );
  }
}
/* =========================
   HUD
========================= */
function updateHUD() {
  const hp =
    document.getElementById(
      "hp"
    );
  const weaponElement =
    document.getElementById(
      "weapon"
    );
  const scoreElement =
    document.getElementById(
      "score"
    );
  if (hp) {
    hp.textContent =
      player.hp;
  }
  if (weaponElement) {
    weaponElement.textContent =
      weapon.toUpperCase();
  }
  if (scoreElement) {
    scoreElement.textContent =
      score;
  }
}
function drawHUD() {
  /* Crosshair */
  const cx =
    canvas.width / 2;
  const cy =
    canvas.height / 2;
  ctx.strokeStyle =
    "#ffffff";
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
  /* Screen flash */
  if (
    screenFlash > 0
  ) {
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
   BUTTON HELPERS
========================= */
function getButton(id) {
  return document.getElementById(
    id
  );
}
function bindTouch(
  element,
  start,
  end
) {
  if (!element) {
    return;
  }
  element.addEventListener(
    "touchstart",
    event => {
      event.preventDefault();
      startAudio();
      if (start) {
        start();
      }
    },
    {
      passive: false
    }
  );
  element.addEventListener(
    "touchend",
    event => {
      event.preventDefault();
      if (end) {
        end();
      }
    },
    {
      passive: false
    }
  );
  /* iPhone fallback */
  element.addEventListener(
    "mousedown",
    event => {
      event.preventDefault();
      startAudio();
      if (start) {
        start();
      }
    }
  );
  element.addEventListener(
    "mouseup",
    event => {
      event.preventDefault();
      if (end) {
        end();
      }
    }
  );
}
/* =========================
   FIRE BUTTON
========================= */
bindTouch(
  getButton(
    "fireButton"
  ),
  () => {
    fire();
  }
);
/* =========================
   JUMP BUTTON
========================= */
bindTouch(
  getButton(
    "jumpButton"
  ),
  () => {
    jump();
  }
);
/* =========================
   RELOAD BUTTON
========================= */
bindTouch(
  getButton(
    "reloadButton"
  ),
  () => {
    reload();
  }
);
/* =========================
   GUN BUTTON
========================= */
bindTouch(
  getButton(
    "gunButton"
  ),
  () => {
    switchWeapon();
  }
);
/* =========================
   RUN BUTTON
========================= */
bindTouch(
  getButton(
    "runButton"
  ),
  () => {
    setRun(true);
  },
  () => {
    setRun(false);
  }
);
/* =========================
   CROUCH BUTTON
========================= */
bindTouch(
  getButton(
    "crouchButton"
  ),
  () => {
    toggleCrouch();
  }
);
/* =========================
   AIM AREA
========================= */
const aimArea =
  document.getElementById(
    "aimArea"
  );
if (aimArea) {
  aimArea.addEventListener(
    "touchmove",
    event => {
      if (
        document.body.classList
          .contains("editMode")
      ) {
        return;
      }
      const touch =
        event.touches[0];
      const rect =
        aimArea.getBoundingClientRect();
      const x =
        touch.clientX -
        player.x;
      const y =
        touch.clientY -
        player.y;
      if (
        Math.abs(x) +
        Math.abs(y) >
        5
      ) {
        player.direction =
          Math.atan2(
            y,
            x
          );
      }
    },
    {
      passive: true
    }
  );
}
/* =========================
   GAME LOOP
========================= */
function gameLoop() {
  updatePlayer();
  updateEffects();
  drawMap();
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
gameLoop();