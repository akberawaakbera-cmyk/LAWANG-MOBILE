const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =====================================================
// CANVAS
// =====================================================

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

// =====================================================
// PLAYER
// =====================================================

const player = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,

  width: 36,
  height: 50,

  speed: 4,

  hp: 100,

  direction: 0,

  moving: false,

  animation: 0
};

// =====================================================
// GAME
// =====================================================

let score = 0;

let weapon = "Pistol";

let firing = false;

let muzzleFlash = 0;

let weaponAnimation = 0;

let screenFlash = 0;

// =====================================================
// ENEMIES
// =====================================================

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

// =====================================================
// SOUND SYSTEM
// =====================================================

const sounds = {
  fire: new Audio("assets/fire.mp3"),

  hit: new Audio("assets/hit.mp3"),

  switch: new Audio("assets/switch.mp3"),

  walk: new Audio("assets/walk.mp3"),

  music: new Audio("assets/music.mp3")
};

sounds.fire.preload = "auto";
sounds.hit.preload = "auto";
sounds.switch.preload = "auto";
sounds.walk.preload = "auto";
sounds.music.preload = "auto";

sounds.fire.volume = 0.5;
sounds.hit.volume = 0.5;
sounds.switch.volume = 0.4;
sounds.walk.volume = 0.25;
sounds.music.volume = 0.15;

sounds.music.loop = true;

sounds.walk.loop = true;

let audioStarted = false;

// =====================================================
// AUDIO UNLOCK
// =====================================================

function startAudio() {

  if (audioStarted) {
    return;
  }

  audioStarted = true;

  // iPhone / Safari audio unlock
  sounds.fire.muted = true;

  const promise = sounds.fire.play();

  if (promise) {

    promise
      .then(() => {

        sounds.fire.pause();

        sounds.fire.currentTime = 0;

        sounds.fire.muted = false;

      })
      .catch(() => {

        sounds.fire.muted = false;

      });

  }
}

// =====================================================
// PLAY SOUND
// =====================================================

function playSound(name) {

  const sound = sounds[name];

  if (!sound) {
    return;
  }

  try {

    sound.currentTime = 0;

    const promise = sound.play();

    if (promise) {

      promise.catch(() => {
        console.log(
          "Sound unavailable:",
          name
        );
      });

    }

  } catch (error) {

    console.log(
      "Audio error:",
      name
    );

  }
}

// =====================================================
// STOP SOUND
// =====================================================

function stopSound(name) {

  const sound = sounds[name];

  if (!sound) {
    return;
  }

  try {

    sound.pause();

    sound.currentTime = 0;

  } catch (error) {}

}

// =====================================================
// FIRST USER INTERACTION
// =====================================================

document.addEventListener(
  "touchstart",
  startAudio,
  {
    once: true,
    passive: true
  }
);

document.addEventListener(
  "click",
  startAudio,
  {
    once: true
  }
);

// =====================================================
// EFFECTS
// =====================================================

function createShootEffect() {

  muzzleFlash = 8;

  weaponAnimation = 8;
}

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

  for (const enemy of enemies) {

    if (enemy.hitEffect > 0) {

      enemy.hitEffect--;

    }

  }
}

// =====================================================
// KEYBOARD
// =====================================================

const keys = {};

window.addEventListener(
  "keydown",
  event => {

    keys[event.key.toLowerCase()] = true;

    if (event.key === " ") {

      event.preventDefault();

      fire();

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

    keys[event.key.toLowerCase()] = false;

  }
);

// =====================================================
// PLAYER MOVEMENT
// =====================================================

function updatePlayer() {

  player.moving = false;

  if (
    keys["w"] ||
    keys["arrowup"]
  ) {

    player.y -= player.speed;

    player.direction =
      -Math.PI / 2;

    player.moving = true;

  }

  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {

    player.y += player.speed;

    player.direction =
      Math.PI / 2;

    player.moving = true;

  }

  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {

    player.x -= player.speed;

    player.direction =
      Math.PI;

    player.moving = true;

  }

  if (
    keys["d"] ||
    keys["arrowright"]
  ) {

    player.x += player.speed;

    player.direction = 0;

    player.moving = true;

  }

  if (player.moving) {

    player.animation += 0.2;

  }

  // Walking sound
  if (
    player.moving &&
    audioStarted
  ) {

    if (
      sounds.walk &&
      sounds.walk.readyState >= 2
    ) {

      if (sounds.walk.paused) {

        sounds.walk
          .play()
          .catch(() => {});

      }

    }

  } else {

    stopSound("walk");

  }

  // Keep player inside screen

  player.x = Math.max(
    25,
    Math.min(
      canvas.width - 25,
      player.x
    )
  );

  player.y = Math.max(
    35,
    Math.min(
      canvas.height - 35,
      player.y
    )
  );
}

// =====================================================
// BACKGROUND
// =====================================================

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

  // Body

  ctx.fillStyle = "#2388ff";

  ctx.fillRect(
    -player.width / 2,

    -player.height / 2 + bob,

    player.width,

    player.height
  );

  // Head

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

  // Weapon animation

  let weaponOffset = 0;

  if (weaponAnimation > 0) {

    weaponOffset = 5;

  }

  // Weapon

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

// =====================================================
// MUZZLE FLASH
// =====================================================

function drawShootEffect() {

  if (muzzleFlash <= 0) {
    return;
  }

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
    ) *
      length -
      5
  );

  ctx.lineTo(
    Math.cos(
      player.direction + 0.35
    ) * 20,

    Math.sin(
      player.direction + 0.35
    ) *
      20 -
      5
  );

  ctx.lineTo(
    Math.cos(
      player.direction - 0.35
    ) * 20,

    Math.sin(
      player.direction - 0.35
    ) *
      20 -
      5
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

    if (enemy.hp <= 0) {
      continue;
    }

    if (enemy.hitEffect > 0) {

      ctx.fillStyle = "#ffffff";

    } else {

      ctx.fillStyle = "#e83b3b";

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

    ctx.fillStyle = "#222";

    ctx.fillRect(
      enemy.x - 30,
      enemy.y - 38,
      60,
      7
    );

    // HP

    ctx.fillStyle = "#36df62";

    ctx.fillRect(
      enemy.x - 30,
      enemy.y - 38,

      60 *
        (enemy.hp / 100),

      7
    );
  }
}

// =====================================================
// SHOOTING
// =====================================================

function fire() {

  if (firing) {
    return;
  }

  firing = true;

  // Unlock audio first

  startAudio();

  // Fire sound

  playSound("fire");

  // Visual effect

  createShootEffect();

  let closest = null;

  let closestDistance =
    Infinity;

  for (const enemy of enemies) {

    if (enemy.hp <= 0) {
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

      closest = enemy;

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

    if (closest.hp <= 0) {

      closest.hp = 0;

      score += 100;

    }
  }

  updateUI();

  setTimeout(
    () => {

      firing = false;

    },
    100
  );
}

// =====================================================
// WEAPON SWITCH
// =====================================================

function switchWeapon() {

  startAudio();

  if (weapon === "Pistol") {

    weapon = "Rifle";

  } else if (
    weapon === "Rifle"
  ) {

    weapon = "Shotgun";

  } else {

    weapon = "Pistol";

  }

  weaponAnimation = 12;

  playSound("switch");

  updateUI();
}

// =====================================================
// UI UPDATE
// =====================================================

function updateUI() {

  const hpElement =
    document.getElementById("hp");

  const weaponElement =
    document.getElementById("weapon");

  const scoreElement =
    document.getElementById("score");

  if (hpElement) {

    hpElement.textContent =
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

// =====================================================
// HUD / CROSSHAIR
// =====================================================

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

// =====================================================
// MOBILE CONTROL SYSTEM
// =====================================================

// Prevent duplicate controls

const oldControls =
  document.querySelectorAll(
    ".lawang-control"
  );

oldControls.forEach(
  button => button.remove()
);

// -----------------------------------------------------
// Create button
// -----------------------------------------------------

function createButton(
  text,
  right,
  bottom,
  action,
  extraClass = ""
) {

  const button =
    document.createElement(
      "button"
    );

  button.className =
    "lawang-control " +
    extraClass;

  button.textContent =
    text;

  button.style.position =
    "fixed";

  button.style.right =
    right;

  button.style.bottom =
    bottom;

  button.style.width =
    "70px";

  button.style.height =
    "70px";

  button.style.borderRadius =
    "50%";

  button.style.border =
    "2px solid white";

  button.style.background =
    "rgba(255,255,255,0.15)";

  button.style.color =
    "white";

  button.style.fontSize =
    "15px";

  button.style.zIndex =
    "9999";

  button.style.touchAction =
    "none";

  button.style.userSelect =
    "none";

  let touched = false;

  // iPhone touch

  button.addEventListener(
    "touchstart",
    event => {

      event.preventDefault();

      touched = true;

      startAudio();

      action();

    },
    {
      passive: false
    }
  );

  // Normal browser click

  button.addEventListener(
    "click",
    event => {

      event.preventDefault();

      if (touched) {

        touched = false;

        return;

      }

      startAudio();

      action();

    }
  );

  document.body.appendChild(
    button
  );

  return button;
}

// =====================================================
// FIRE
// =====================================================

createButton(
  "FIRE",
  "25px",
  "80px",
  fire,
  "fire-button"
);

// =====================================================
// GUN
// =====================================================

createButton(
  "GUN",
  "25px",
  "165px",
  switchWeapon,
  "gun-button"
);

// =====================================================
// UP
// =====================================================

createButton(
  "▲",
  "120px",
  "150px",
  () => {

    player.y -= 25;

    player.direction =
      -Math.PI / 2;

  },
  "move-button"
);

// =====================================================
// DOWN
// =====================================================

createButton(
  "▼",
  "120px",
  "55px",
  () => {

    player.y += 25;

    player.direction =
      Math.PI / 2;

  },
  "move-button"
);

// =====================================================
// LEFT
// =====================================================

createButton(
  "◀",
  "205px",
  "55px",
  () => {

    player.x -= 25;

    player.direction =
      Math.PI;

  },
  "move-button"
);

// =====================================================
// RIGHT
// =====================================================

createButton(
  "▶",
  "35px",
  "55px",
  () => {

    player.x += 25;

    player.direction =
      0;

  },
  "move-button"
);

// =====================================================
// GAME LOOP
// =====================================================

function gameLoop() {

  updatePlayer();

  updateEffects();

  drawMap();

  drawEnemies();

  drawPlayer();

  drawShootEffect();

  drawHUD();

  requestAnimationFrame(
    gameLoop
  );
}

// =====================================================
// START
// =====================================================

resizeCanvas();

updateUI();

gameLoop();