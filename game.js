const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =====================================================
// CANVAS
// =====================================================

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (!player.initialized) {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.initialized = true;
  }
}

window.addEventListener("resize", resizeCanvas);

// =====================================================
// PLAYER
// =====================================================

const player = {
  x: 0,
  y: 0,
  width: 34,
  height: 48,

  baseSpeed: 3.2,
  runSpeed: 6,

  hp: 100,

  direction: 0,

  moving: false,
  running: false,
  crouching: false,
  jumping: false,

  jumpTimer: 0,
  animation: 0,

  initialized: false
};

// =====================================================
// GAME STATE
// =====================================================

let score = 0;

let weaponIndex = 0;

const weapons = [
  {
    name: "PISTOL",
    damage: 25,
    ammo: 12,
    maxAmmo: 12,
    fireRate: 350
  },
  {
    name: "RIFLE",
    damage: 15,
    ammo: 30,
    maxAmmo: 30,
    fireRate: 120
  },
  {
    name: "SHOTGUN",
    damage: 50,
    ammo: 6,
    maxAmmo: 6,
    fireRate: 600
  }
];

let lastShot = 0;
let reloading = false;

// =====================================================
// ENEMIES
// =====================================================

const enemies = [
  {
    x: 180,
    y: 180,
    hp: 100,
    maxHp: 100,
    hitEffect: 0,
    alive: true
  },

  {
    x: 500,
    y: 250,
    hp: 100,
    maxHp: 100,
    hitEffect: 0,
    alive: true
  },

  {
    x: 700,
    y: 450,
    hp: 100,
    maxHp: 100,
    hitEffect: 0,
    alive: true
  }
];

// =====================================================
// INPUT
// =====================================================

const keys = {};

window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  keys[key] = true;

  if (event.code === "Space") {
    event.preventDefault();
    jump();
  }

  if (key === "r") {
    reload();
  }

  if (key === "q") {
    switchWeapon();
  }

  if (key === "shift") {
    player.running = true;
  }

  if (key === "c") {
    player.crouching = true;
  }
});

window.addEventListener("keyup", event => {
  const key = event.key.toLowerCase();

  keys[key] = false;

  if (key === "shift") {
    player.running = false;
  }

  if (key === "c") {
    player.crouching = false;
  }
});

// =====================================================
// JOYSTICK INPUT
// =====================================================

function getJoystick() {
  const x = Number(window.joystickX || 0);
  const y = Number(window.joystickY || 0);

  return {
    x,
    y
  };
}

// =====================================================
// PLAYER MOVEMENT
// =====================================================

function updatePlayer() {
  const joystick = getJoystick();

  let moveX = 0;
  let moveY = 0;

  // Keyboard
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

  // Joystick overrides/adds movement
  if (Math.abs(joystick.x) > 0.05) {
    moveX = joystick.x;
  }

  if (Math.abs(joystick.y) > 0.05) {
    moveY = joystick.y;
  }

  const moving =
    Math.abs(moveX) > 0.05 ||
    Math.abs(moveY) > 0.05;

  player.moving = moving;

  if (moving) {
    const length =
      Math.sqrt(
        moveX * moveX +
        moveY * moveY
      );

    if (length > 1) {
      moveX /= length;
      moveY /= length;
    }

    let speed = player.baseSpeed;

    if (player.running && !player.crouching) {
      speed = player.runSpeed;
    }

    if (player.crouching) {
      speed = player.baseSpeed * 0.55;
    }

    player.x += moveX * speed;
    player.y += moveY * speed;

    // Direction
    player.direction =
      Math.atan2(moveY, moveX);

    player.animation += 0.22;
  }

  // Keep player inside screen
  const margin = 30;

  player.x = Math.max(
    margin,
    Math.min(
      canvas.width - margin,
      player.x
    )
  );

  player.y = Math.max(
    margin,
    Math.min(
      canvas.height - margin,
      player.y
    )
  );

  // Jump timer
  if (player.jumping) {
    player.jumpTimer--;

    if (player.jumpTimer <= 0) {
      player.jumping = false;
    }
  }
}

// =====================================================
// RUN
// =====================================================

function startRun() {
  player.running = true;
}

function stopRun() {
  player.running = false;
}

const runButton =
  document.getElementById("runButton");

if (runButton) {
  runButton.addEventListener(
    "touchstart",
    event => {
      event.preventDefault();
      startRun();
    },
    { passive: false }
  );

  runButton.addEventListener(
    "touchend",
    event => {
      event.preventDefault();
      stopRun();
    },
    { passive: false }
  );

  runButton.addEventListener(
    "touchcancel",
    stopRun
  );

  runButton.addEventListener(
    "mousedown",
    startRun
  );

  runButton.addEventListener(
    "mouseup",
    stopRun
  );
}

// =====================================================
// CROUCH
// =====================================================

function toggleCrouch() {
  player.crouching =
    !player.crouching;
}

const crouchButton =
  document.getElementById(
    "crouchButton"
  );

if (crouchButton) {
  crouchButton.addEventListener(
    "touchstart",
    event => {
      event.preventDefault();
      toggleCrouch();
    },
    { passive: false }
  );

  crouchButton.addEventListener(
    "click",
    toggleCrouch
  );
}

// =====================================================
// JUMP
// =====================================================

function jump() {
  if (player.jumping) return;

  player.jumping = true;

  player.jumpTimer = 25;
}

const jumpButton =
  document.getElementById(
    "jumpButton"
  );

if (jumpButton) {
  jumpButton.addEventListener(
    "touchstart",
    event => {
      event.preventDefault();
      jump();
    },
    { passive: false }
  );

  jumpButton.addEventListener(
    "click",
    jump
  );
}

// =====================================================
// WEAPON SWITCH
// =====================================================

function switchWeapon() {
  if (reloading) return;

  weaponIndex++;

  if (
    weaponIndex >= weapons.length
  ) {
    weaponIndex = 0;
  }

  updateHUD();
}

const gunButton =
  document.getElementById(
    "gunButton"
  );

if (gunButton) {
  gunButton.addEventListener(
    "touchstart",
    event => {
      event.preventDefault();
      switchWeapon();
    },
    { passive: false }
  );

  gunButton.addEventListener(
    "click",
    switchWeapon
  );
}

// =====================================================
// RELOAD
// =====================================================

function reload() {
  if (reloading) return;

  const weapon =
    weapons[weaponIndex];

  if (
    weapon.ammo >= weapon.maxAmmo
  ) {
    return;
  }

  reloading = true;

  setTimeout(() => {
    weapon.ammo =
      weapon.maxAmmo;

    reloading = false;

    updateHUD();
  }, 900);
}

const reloadButton =
  document.getElementById(
    "reloadButton"
  );

if (reloadButton) {
  reloadButton.addEventListener(
    "touchstart",
    event => {
      event.preventDefault();
      reload();
    },
    { passive: false }
  );

  reloadButton.addEventListener(
    "click",
    reload
  );
}

// =====================================================
// SHOOTING
// =====================================================

function fire() {
  if (reloading) return;

  const weapon =
    weapons[weaponIndex];

  const now =
    performance.now();

  if (
    now - lastShot <
    weapon.fireRate
  ) {
    return;
  }

  if (weapon.ammo <= 0) {
    reload();
    return;
  }

  lastShot = now;

  weapon.ammo--;

  muzzleFlash = 8;

  let closest = null;

  let closestDistance =
    Infinity;

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const dx =
      enemy.x - player.x;

    const dy =
      enemy.y - player.y;

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

      closest = enemy;
    }
  }

  if (
    closest &&
    closestDistance < 500
  ) {
    closest.hp -=
      weapon.damage;

    closest.hitEffect = 8;

    if (closest.hp <= 0) {
      closest.hp = 0;
      closest.alive = false;

      score += 100;
    }
  }

  updateHUD();
}

const fireButton =
  document.getElementById(
    "fireButton"
  );

if (fireButton) {
  fireButton.addEventListener(
    "touchstart",
    event => {
      event.preventDefault();
      fire();
    },
    { passive: false }
  );

  fireButton.addEventListener(
    "click",
    fire
  );
}

// =====================================================
// EFFECTS
// =====================================================

let muzzleFlash = 0;

function updateEffects() {
  if (muzzleFlash > 0) {
    muzzleFlash--;
  }

  for (const enemy of enemies) {
    if (enemy.hitEffect > 0) {
      enemy.hitEffect--;
    }
  }
}

// =====================================================
// MAP
// =====================================================

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

// =====================================================
// PLAYER GRAPHIC
// =====================================================

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
    bob -= 15;
  }

  // Crouch
  const bodyHeight =
    player.crouching
      ? 30
      : player.height;

  // Body
  ctx.fillStyle =
    "#2388ff";

  ctx.fillRect(
    -player.width / 2,
    -bodyHeight / 2 + bob,
    player.width,
    bodyHeight
  );

  // Head
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

  // Weapon
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
    ) * 38,
    Math.sin(
      player.direction
    ) * 38 - 5
  );

  ctx.stroke();

  ctx.restore();
}

// =====================================================
// MUZZLE FLASH
// =====================================================

function drawMuzzleFlash() {
  if (muzzleFlash <= 0) {
    return;
  }

  ctx.save();

  ctx.translate(
    player.x,
    player.y
  );

  const length = 55;

  ctx.fillStyle =
    "#ffd34d";

  ctx.beginPath();

  ctx.moveTo(
    Math.cos(
      player.direction
    ) * length,
    Math.sin(
      player.direction
    ) * length
  );

  ctx.lineTo(
    Math.cos(
      player.direction + 0.35
    ) * 20,
    Math.sin(
      player.direction + 0.35
    ) * 20
  );

  ctx.lineTo(
    Math.cos(
      player.direction - 0.35
    ) * 20,
    Math.sin(
      player.direction - 0.35
    ) * 20
  );

  ctx.closePath();

  ctx.fill();

  ctx.restore();
}

// =====================================================
// ENEMIES
// =====================================================

function drawEnemies() {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    if (enemy.hitEffect > 0) {
      ctx.fillStyle =
        "#ffffff";
    } else {
      ctx.fillStyle =
        "#e83b3b";
    }

    ctx.beginPath();

    ctx.arc(
      enemy.x,
      enemy.y,
      24,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // HP background
    ctx.fillStyle =
      "#222";

    ctx.fillRect(
      enemy.x - 30,
      enemy.y - 38,
      60,
      7
    );

    // HP
    ctx.fillStyle =
      "#36df62";

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

// =====================================================
// CROSSHAIR
// =====================================================

function drawCrosshair() {
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
}

// =====================================================
// HUD
// =====================================================

function updateHUD() {
  const weapon =
    weapons[weaponIndex];

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
      weapon.name +
      " (" +
      weapon.ammo +
      "/" +
      weapon.maxAmmo +
      ")";
  }

  if (scoreElement) {
    scoreElement.textContent =
      score;
  }
}

// =====================================================
// GAME LOOP
// =====================================================

function gameLoop() {
  updatePlayer();

  updateEffects();

  drawMap();

  drawEnemies();

  drawPlayer();

  drawMuzzleFlash();

  drawCrosshair();

  updateHUD();

  requestAnimationFrame(
    gameLoop
  );
}

// =====================================================
// START
// =====================================================

resizeCanvas();

updateHUD();

gameLoop();