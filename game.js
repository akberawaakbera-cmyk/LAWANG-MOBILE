const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// =====================================================
// PLAYER
// =====================================================

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  speed: 3.5,
  hp: 100,
  direction: 0,
  moving: false,
  running: false,
  crouching: false,
  jumping: false,
  jumpTimer: 0
};

// =====================================================
// GAME
// =====================================================

let score = 0;
let weapon = "PISTOL";
let ammo = 12;
let maxAmmo = 12;
let reloading = false;

let mission = {
  totalEnemies: 5,
  killed: 0,
  completed: false
};

// =====================================================
// ENEMIES
// =====================================================

const enemies = [
  { x: 500, y: 180, hp: 100, alive: true },
  { x: 760, y: 260, hp: 100, alive: true },
  { x: 350, y: 500, hp: 100, alive: true },
  { x: 850, y: 520, hp: 100, alive: true },
  { x: 600, y: 650, hp: 100, alive: true }
];

// =====================================================
// MAP
// =====================================================

const buildings = [
  { x: 80, y: 100, w: 180, h: 120 },
  { x: 350, y: 80, w: 170, h: 130 },
  { x: 720, y: 100, w: 190, h: 140 },

  { x: 80, y: 430, w: 180, h: 130 },
  { x: 350, y: 620, w: 190, h: 120 },
  { x: 760, y: 620, w: 170, h: 120 }
];

const roads = [
  { x: 0, y: 300, w: canvas.width, h: 110 },
  { x: 280, y: 0, w: 100, h: canvas.height },
  { x: 650, y: 0, w: 100, h: canvas.height }
];

const gardens = [
  { x: 560, y: 330, w: 90, h: 100 },
  { x: 270, y: 450, w: 70, h: 100 }
];

// =====================================================
// KEYBOARD
// =====================================================

const keys = {};

window.addEventListener("keydown", event => {

  keys[event.key.toLowerCase()] = true;

  if (event.key === " ") {
    jump();
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

// =====================================================
// MOBILE CONTROL CONNECTION
// =====================================================

function getJoystick() {
  return {
    x: window.joystickX || 0,
    y: window.joystickY || 0
  };
}

function controlPressed(id) {
  const element = document.getElementById(id);

  if (!element) return false;

  return element.dataset.pressed === "true";
}

// =====================================================
// PLAYER MOVEMENT
// =====================================================

function updatePlayer() {

  let dx = 0;
  let dy = 0;

  // Keyboard
  if (keys["w"] || keys["arrowup"]) dy -= 1;
  if (keys["s"] || keys["arrowdown"]) dy += 1;
  if (keys["a"] || keys["arrowleft"]) dx -= 1;
  if (keys["d"] || keys["arrowright"]) dx += 1;

  // Joystick
  const joystick = getJoystick();

  if (Math.abs(joystick.x) > 0.1) {
    dx = joystick.x;
  }

  if (Math.abs(joystick.y) > 0.1) {
    dy = joystick.y;
  }

  const moving =
    Math.abs(dx) > 0.05 ||
    Math.abs(dy) > 0.05;

  player.moving = moving;

  player.running =
    controlPressed("runButton");

  player.crouching =
    controlPressed("crouchButton");

  let speed = player.speed;

  if (player.running) {
    speed = 6;
  }

  if (player.crouching) {
    speed = 1.8;
  }

  if (moving) {

    const length =
      Math.sqrt(dx * dx + dy * dy);

    if (length > 0) {
      dx /= length;
      dy /= length;
    }

    player.x += dx * speed;
    player.y += dy * speed;

    player.direction =
      Math.atan2(dy, dx);
  }

  // Screen boundaries

  player.x = Math.max(
    25,
    Math.min(
      canvas.width - 25,
      player.x
    )
  );

  player.y = Math.max(
    40,
    Math.min(
      canvas.height - 40,
      player.y
    )
  );
}

// =====================================================
// JUMP
// =====================================================

function jump() {

  if (player.jumping) return;

  player.jumping = true;
  player.jumpTimer = 30;
}

function updateJump() {

  if (!player.jumping) return;

  player.jumpTimer--;

  if (player.jumpTimer <= 0) {
    player.jumping = false;
  }
}

// =====================================================
// DRAW MAP
// =====================================================

function drawMap() {

  // Ground

  ctx.fillStyle = "#3d6942";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Roads

  for (const road of roads) {

    ctx.fillStyle = "#353b42";

    ctx.fillRect(
      road.x,
      road.y,
      road.w,
      road.h
    );

    // Road markings

    ctx.strokeStyle = "#d8d36b";
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);

    if (road.w > road.h) {

      ctx.beginPath();

      ctx.moveTo(
        road.x,
        road.y + road.h / 2
      );

      ctx.lineTo(
        road.x + road.w,
        road.y + road.h / 2
      );

      ctx.stroke();

    } else {

      ctx.beginPath();

      ctx.moveTo(
        road.x + road.w / 2,
        road.y
      );

      ctx.lineTo(
        road.x + road.w / 2,
        road.y + road.h
      );

      ctx.stroke();
    }

    ctx.setLineDash([]);
  }

  // Buildings

  for (const building of buildings) {

    // Shadow

    ctx.fillStyle = "#222";

    ctx.fillRect(
      building.x + 8,
      building.y + 8,
      building.w,
      building.h
    );

    // Building

    ctx.fillStyle = "#b9b1a3";

    ctx.fillRect(
      building.x,
      building.y,
      building.w,
      building.h
    );

    // Roof

    ctx.fillStyle = "#725b50";

    ctx.fillRect(
      building.x,
      building.y,
      building.w,
      18
    );

    // Windows

    ctx.fillStyle = "#263d52";

    for (
      let x = building.x + 20;
      x < building.x + building.w - 15;
      x += 45
    ) {

      ctx.fillRect(
        x,
        building.y + 40,
        25,
        25
      );
    }

    // Door

    ctx.fillStyle = "#4c3325";

    ctx.fillRect(
      building.x +
        building.w / 2 -
        15,
      building.y +
        building.h -
        45,
      30,
      45
    );
  }

  // Gardens

  for (const garden of gardens) {

    ctx.fillStyle = "#28733b";

    ctx.fillRect(
      garden.x,
      garden.y,
      garden.w,
      garden.h
    );

    // Trees

    for (
      let x = garden.x + 20;
      x < garden.x + garden.w;
      x += 35
    ) {

      for (
        let y = garden.y + 25;
        y < garden.y + garden.h;
        y += 40
      ) {

        ctx.fillStyle = "#164f29";

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          12,
          0,
          Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#5d3b25";

        ctx.fillRect(
          x - 3,
          y + 8,
          6,
          15
        );
      }
    }
  }
}

// =====================================================
// HUMAN PLAYER
// =====================================================

function drawPlayer() {

  ctx.save();

  ctx.translate(
    player.x,
    player.y
  );

  // Jump shadow

  if (player.jumping) {

    ctx.fillStyle =
      "rgba(0,0,0,0.25)";

    ctx.beginPath();

    ctx.ellipse(
      0,
      28,
      22,
      8,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.translate(
      0,
      -25
    );
  }

  // Body

  ctx.fillStyle = "#245fa8";

  ctx.beginPath();

  ctx.roundRect(
    -15,
    -5,
    30,
    40,
    8
  );

  ctx.fill();

  // Neck

  ctx.fillStyle = "#c98d68";

  ctx.fillRect(
    -6,
    -16,
    12,
    12
  );

  // Head

  ctx.fillStyle = "#d59a72";

  ctx.beginPath();

  ctx.arc(
    0,
    -30,
    15,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // Hair

  ctx.fillStyle = "#241b18";

  ctx.beginPath();

  ctx.arc(
    0,
    -35,
    15,
    Math.PI,
    Math.PI * 2
  );

  ctx.fill();

  // Legs

  ctx.strokeStyle = "#1b2635";

  ctx.lineWidth = 9;

  ctx.beginPath();

  ctx.moveTo(
    -8,
    35
  );

  ctx.lineTo(
    -10,
    58
  );

  ctx.moveTo(
    8,
    35
  );

  ctx.lineTo(
    10,
    58
  );

  ctx.stroke();

  // Arms

  ctx.strokeStyle = "#d59a72";

  ctx.lineWidth = 7;

  ctx.beginPath();

  ctx.moveTo(
    -13,
    0
  );

  ctx.lineTo(
    -25,
    12
  );

  ctx.moveTo(
    13,
    0
  );

  ctx.lineTo(
    25,
    12
  );

  ctx.stroke();

  // Weapon

  ctx.save();

  ctx.rotate(
    player.direction
  );

  ctx.fillStyle = "#15191e";

  ctx.fillRect(
    12,
    -4,
    38,
    8
  );

  ctx.fillRect(
    28,
    4,
    8,
    12
  );

  ctx.restore();

  ctx.restore();
}

// =====================================================
// ENEMY HUMAN
// =====================================================

function drawEnemies() {

  for (const enemy of enemies) {

    if (!enemy.alive) continue;

    ctx.save();

    ctx.translate(
      enemy.x,
      enemy.y
    );

    // Body

    ctx.fillStyle = "#9d3030";

    ctx.fillRect(
      -14,
      -5,
      28,
      38
    );

    // Head

    ctx.fillStyle = "#c78968";

    ctx.beginPath();

    ctx.arc(
      0,
      -28,
      14,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Hair

    ctx.fillStyle = "#211817";

    ctx.beginPath();

    ctx.arc(
      0,
      -33,
      14,
      Math.PI,
      Math.PI * 2
    );

    ctx.fill();

    // Legs

    ctx.strokeStyle = "#252525";

    ctx.lineWidth = 8;

    ctx.beginPath();

    ctx.moveTo(
      -7,
      32
    );

    ctx.lineTo(
      -10,
      52
    );

    ctx.moveTo(
      7,
      32
    );

    ctx.lineTo(
      10,
      52
    );

    ctx.stroke();

    // Enemy gun

    ctx.strokeStyle = "#111";

    ctx.lineWidth = 7;

    ctx.beginPath();

    ctx.moveTo(
      8,
      5
    );

    ctx.lineTo(
      35,
      10
    );

    ctx.stroke();

    ctx.restore();

    // HP bar

    ctx.fillStyle = "#222";

    ctx.fillRect(
      enemy.x - 25,
      enemy.y - 50,
      50,
      6
    );

    ctx.fillStyle = "#35d65c";

    ctx.fillRect(
      enemy.x - 25,
      enemy.y - 50,
      50 *
        (enemy.hp / 100),
      6
    );
  }
}

// =====================================================
// SHOOTING
// =====================================================

function fire() {

  if (reloading) return;

  if (ammo <= 0) {

    reload();

    return;
  }

  ammo--;

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

    closest.hp -= 25;

    if (closest.hp <= 0) {

      closest.hp = 0;

      closest.alive = false;

      mission.killed++;

      score += 100;
    }
  }
}

// =====================================================
// RELOAD
// =====================================================

function reload() {

  if (reloading) return;

  if (ammo === maxAmmo) return;

  reloading = true;

  setTimeout(() => {

    ammo = maxAmmo;

    reloading = false;

  }, 1200);
}

// =====================================================
// WEAPON
// =====================================================

function switchWeapon() {

  if (weapon === "PISTOL") {

    weapon = "RIFLE";

  } else if (
    weapon === "RIFLE"
  ) {

    weapon = "SHOTGUN";

  } else {

    weapon = "PISTOL";
  }
}

// =====================================================
// MISSION
// =====================================================

function updateMission() {

  if (
    mission.killed >=
    mission.totalEnemies
  ) {

    mission.completed =
      true;
  }
}

// =====================================================
// HUD
// =====================================================

function drawHUD() {

  ctx.fillStyle = "white";

  ctx.font =
    "16px Arial";

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
    `Ammo: ${ammo}/${maxAmmo}`,
    20,
    80
  );

  ctx.fillText(
    `Score: ${score}`,
    20,
    105
  );

  ctx.fillText(
    `MISSION: ${mission.killed}/${mission.totalEnemies}`,
    20,
    130
  );

  if (
    mission.completed
  ) {

    ctx.fillStyle =
      "#52e66a";

    ctx.font =
      "bold 30px Arial";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "MISSION COMPLETE!",
      canvas.width / 2,
      100
    );

    ctx.textAlign =
      "left";
  }
}

// =====================================================
// MOBILE BUTTONS
// =====================================================

function setupButton(
  id,
  action
) {

  const button =
    document.getElementById(id);

  if (!button) return;

  button.dataset.pressed =
    "false";

  button.addEventListener(
    "touchstart",
    event => {

      event.preventDefault();

      button.dataset.pressed =
        "true";

      action();
    },
    {
      passive: false
    }
  );

  button.addEventListener(
    "touchend",
    event => {

      event.preventDefault();

      button.dataset.pressed =
        "false";
    },
    {
      passive: false
    }
  );

  button.addEventListener(
    "touchcancel",
    () => {

      button.dataset.pressed =
        "false";
    }
  );

  button.addEventListener(
    "click",
    action
  );
}

setupButton(
  "fireButton",
  fire
);

setupButton(
  "jumpButton",
  jump
);

setupButton(
  "reloadButton",
  reload
);

setupButton(
  "gunButton",
  switchWeapon
);

// =====================================================
// GAME LOOP
// =====================================================

function gameLoop() {

  updatePlayer();

  updateJump();

  updateMission();

  drawMap();

  drawEnemies();

  drawPlayer();

  drawHUD();

  requestAnimationFrame(
    gameLoop
  );
}

gameLoop();