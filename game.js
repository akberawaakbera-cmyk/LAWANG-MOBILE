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
  x: 600,
  y: 450,
  radius: 18,
  speed: 3.2,
  runSpeed: 5.5,
  hp: 100,
  running: false,
  crouching: false,
  direction: 0
};

// =====================================================
// GAME STATE
// =====================================================

let score = 0;
let weapon = "Pistol";
let ammo = 12;
let maxAmmo = 12;
let reloading = false;
let gameMessage = "";

// =====================================================
// MAP
// =====================================================

const map = {
  width: 1800,
  height: 1200
};

// Roads
const roads = [
  { x: 0, y: 390, width: 1800, height: 150 },
  { x: 760, y: 0, width: 160, height: 1200 }
];

// Buildings
const buildings = [
  {
    x: 180,
    y: 120,
    width: 300,
    height: 210,
    name: "HOUSE 1",
    color: "#795548"
  },
  {
    x: 1050,
    y: 120,
    width: 350,
    height: 220,
    name: "HOUSE 2",
    color: "#6d4c41"
  },
  {
    x: 150,
    y: 700,
    width: 330,
    height: 230,
    name: "HOUSE 3",
    color: "#8d6e63"
  },
  {
    x: 1050,
    y: 720,
    width: 400,
    height: 250,
    name: "BUILDING",
    color: "#546e7a"
  }
];

// Gardens
const gardens = [
  {
    x: 520,
    y: 120,
    width: 180,
    height: 210
  },
  {
    x: 950,
    y: 720,
    width: 80,
    height: 250
  },
  {
    x: 500,
    y: 700,
    width: 250,
    height: 220
  }
];

// Walls
const walls = [
  { x: 80, y: 80, width: 20, height: 1000 },
  { x: 1650, y: 80, width: 20, height: 1000 },
  { x: 80, y: 80, width: 1590, height: 20 },
  { x: 80, y: 1060, width: 1590, height: 20 }
];

// =====================================================
// ENEMIES
// =====================================================

const enemies = [
  {
    x: 300,
    y: 470,
    radius: 18,
    hp: 100,
    alive: true,
    speed: 1
  },
  {
    x: 1200,
    y: 470,
    radius: 18,
    hp: 100,
    alive: true,
    speed: 1
  },
  {
    x: 1350,
    y: 650,
    radius: 18,
    hp: 100,
    alive: true,
    speed: 1
  },
  {
    x: 650,
    y: 850,
    radius: 18,
    hp: 100,
    alive: true,
    speed: 1
  }
];

// =====================================================
// CAMERA
// =====================================================

const camera = {
  x: 0,
  y: 0
};

function updateCamera() {
  camera.x =
    player.x -
    canvas.width / 2;

  camera.y =
    player.y -
    canvas.height / 2;

  camera.x = Math.max(
    0,
    Math.min(
      map.width - canvas.width,
      camera.x
    )
  );

  camera.y = Math.max(
    0,
    Math.min(
      map.height - canvas.height,
      camera.y
    )
  );
}

// =====================================================
// INPUT
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
      event.key.toLowerCase() === "r"
    ) {
      reload();
    }

    if (
      event.key.toLowerCase() === "q"
    ) {
      switchWeapon();
    }

    if (
      event.key.toLowerCase() === "shift"
    ) {
      player.running = true;
    }
  }
);

window.addEventListener(
  "keyup",
  event => {
    keys[event.key.toLowerCase()] = false;

    if (
      event.key.toLowerCase() === "shift"
    ) {
      player.running = false;
    }
  }
);

// =====================================================
// JOYSTICK
// =====================================================

function getJoystickInput() {
  const x =
    Number(window.joystickX || 0);

  const y =
    Number(window.joystickY || 0);

  if (
    Math.abs(x) < 0.05 &&
    Math.abs(y) < 0.05
  ) {
    return {
      x: 0,
      y: 0
    };
  }

  return {
    x,
    y
  };
}

// =====================================================
// COLLISION
// =====================================================

function circleRectCollision(
  cx,
  cy,
  radius,
  rect
) {
  const closestX =
    Math.max(
      rect.x,
      Math.min(
        cx,
        rect.x + rect.width
      )
    );

  const closestY =
    Math.max(
      rect.y,
      Math.min(
        cy,
        rect.y + rect.height
      )
    );

  const dx =
    cx - closestX;

  const dy =
    cy - closestY;

  return (
    dx * dx +
      dy * dy <
    radius * radius
  );
}

function blocked(x, y) {
  for (const building of buildings) {
    if (
      circleRectCollision(
        x,
        y,
        player.radius,
        building
      )
    ) {
      return true;
    }
  }

  for (const wall of walls) {
    if (
      circleRectCollision(
        x,
        y,
        player.radius,
        wall
      )
    ) {
      return true;
    }
  }

  return false;
}

// =====================================================
// PLAYER MOVEMENT
// =====================================================

function updatePlayer() {
  let dx = 0;
  let dy = 0;

  if (
    keys["w"] ||
    keys["arrowup"]
  ) {
    dy -= 1;
  }

  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {
    dy += 1;
  }

  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {
    dx -= 1;
  }

  if (
    keys["d"] ||
    keys["arrowright"]
  ) {
    dx += 1;
  }

  const joystick =
    getJoystickInput();

  if (joystick.x !== 0) {
    dx = joystick.x;
  }

  if (joystick.y !== 0) {
    dy = joystick.y;
  }

  const length =
    Math.sqrt(
      dx * dx +
      dy * dy
    );

  if (length > 0) {
    dx /= length;
    dy /= length;

    const speed =
      player.running
        ? player.runSpeed
        : player.speed;

    const newX =
      player.x +
      dx * speed;

    const newY =
      player.y +
      dy * speed;

    if (!blocked(newX, player.y)) {
      player.x = newX;
    }

    if (!blocked(player.x, newY)) {
      player.y = newY;
    }

    player.direction =
      Math.atan2(dy, dx);
  }

  player.x = Math.max(
    25,
    Math.min(
      map.width - 25,
      player.x
    )
  );

  player.y = Math.max(
    25,
    Math.min(
      map.height - 25,
      player.y
    )
  );
}

// =====================================================
// MAP DRAWING
// =====================================================

function drawMap() {
  ctx.fillStyle = "#263238";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );

  // Ground
  ctx.fillStyle = "#4b6350";

  ctx.fillRect(
    0,
    0,
    map.width,
    map.height
  );

  // Roads
  for (const road of roads) {
    ctx.fillStyle = "#343a40";

    ctx.fillRect(
      road.x,
      road.y,
      road.width,
      road.height
    );

    // Road lines
    ctx.strokeStyle = "#d6c45a";
    ctx.lineWidth = 4;

    if (
      road.width >
      road.height
    ) {
      for (
        let x = road.x + 20;
        x < road.x + road.width;
        x += 70
      ) {
        ctx.beginPath();

        ctx.moveTo(
          x,
          road.y +
            road.height / 2
        );

        ctx.lineTo(
          x + 35,
          road.y +
            road.height / 2
        );

        ctx.stroke();
      }
    } else {
      for (
        let y = road.y + 20;
        y < road.y + road.height;
        y += 70
      ) {
        ctx.beginPath();

        ctx.moveTo(
          road.x +
            road.width / 2,
          y
        );

        ctx.lineTo(
          road.x +
            road.width / 2,
          y + 35
        );

        ctx.stroke();
      }
    }
  }

  // Gardens
  for (const garden of gardens) {
    ctx.fillStyle = "#315d3c";

    ctx.fillRect(
      garden.x,
      garden.y,
      garden.width,
      garden.height
    );

    // Trees
    for (
      let x = garden.x + 25;
      x <
      garden.x +
        garden.width -
        15;
      x += 55
    ) {
      for (
        let y = garden.y + 30;
        y <
        garden.y +
          garden.height -
          15;
        y += 65
      ) {
        drawTree(x, y);
      }
    }
  }

  // Buildings
  for (const building of buildings) {
    // Shadow
    ctx.fillStyle =
      "rgba(0,0,0,0.3)";

    ctx.fillRect(
      building.x + 8,
      building.y + 8,
      building.width,
      building.height
    );

    // Building
    ctx.fillStyle =
      building.color;

    ctx.fillRect(
      building.x,
      building.y,
      building.width,
      building.height
    );

    // Roof
    ctx.fillStyle =
      "#3e2723";

    ctx.fillRect(
      building.x,
      building.y,
      building.width,
      28
    );

    // Door
    ctx.fillStyle =
      "#241812";

    ctx.fillRect(
      building.x +
        building.width / 2 -
        15,
      building.y +
        building.height -
        45,
      30,
      45
    );

    // Windows
    ctx.fillStyle =
      "#90caf9";

    ctx.fillRect(
      building.x + 35,
      building.y + 55,
      45,
      35
    );

    ctx.fillRect(
      building.x +
        building.width -
        80,
      building.y + 55,
      45,
      35
    );
  }

  // Walls
  for (const wall of walls) {
    ctx.fillStyle =
      "#777777";

    ctx.fillRect(
      wall.x,
      wall.y,
      wall.width,
      wall.height
    );
  }

  ctx.restore();
}

// =====================================================
// TREE
// =====================================================

function drawTree(x, y) {
  ctx.fillStyle = "#5d4037";

  ctx.fillRect(
    x - 5,
    y,
    10,
    25
  );

  ctx.fillStyle = "#1b5e20";

  ctx.beginPath();

  ctx.arc(
    x,
    y - 5,
    23,
    0,
    Math.PI * 2
  );

  ctx.fill();
}

// =====================================================
// PLAYER
// =====================================================

function drawPlayer() {
  ctx.save();

  ctx.translate(
    player.x - camera.x,
    player.y - camera.y
  );

  // Shadow
  ctx.fillStyle =
    "rgba(0,0,0,0.35)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    18,
    20,
    8,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // Body
  ctx.fillStyle = "#2369a8";

  ctx.fillRect(
    -14,
    -8,
    28,
    35
  );

  // Head
  ctx.fillStyle = "#d79b78";

  ctx.beginPath();

  ctx.arc(
    0,
    -25,
    13,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // Hair
  ctx.fillStyle = "#202020";

  ctx.beginPath();

  ctx.arc(
    0,
    -30,
    13,
    Math.PI,
    Math.PI * 2
  );

  ctx.fill();

  // Legs
  ctx.strokeStyle =
    "#20252b";

  ctx.lineWidth = 8;

  ctx.beginPath();

  ctx.moveTo(
    -8,
    25
  );

  ctx.lineTo(
    -10,
    42
  );

  ctx.moveTo(
    8,
    25
  );

  ctx.lineTo(
    10,
    42
  );

  ctx.stroke();

  // Weapon direction
  ctx.strokeStyle =
    "#111111";

  ctx.lineWidth = 7;

  ctx.beginPath();

  ctx.moveTo(
    0,
    0
  );

  ctx.lineTo(
    Math.cos(
      player.direction
    ) * 38,
    Math.sin(
      player.direction
    ) * 38
  );

  ctx.stroke();

  ctx.restore();
}

// =====================================================
// ENEMIES
// =====================================================

function updateEnemies() {
  for (const enemy of enemies) {
    if (!enemy.alive) {
      continue;
    }

    const dx =
      player.x - enemy.x;

    const dy =
      player.y - enemy.y;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    // Enemy follows player
    if (
      distance > 45 &&
      distance < 450
    ) {
      const nx =
        dx / distance;

      const ny =
        dy / distance;

      const newX =
        enemy.x +
        nx * enemy.speed;

      const newY =
        enemy.y +
        ny * enemy.speed;

      if (
        !circleRectCollision(
          newX,
          newY,
          enemy.radius,
          buildings[0]
        )
      ) {
        enemy.x = newX;
        enemy.y = newY;
      }
    }
  }
}

function drawEnemies() {
  for (const enemy of enemies) {
    if (!enemy.alive) {
      continue;
    }

    const x =
      enemy.x - camera.x;

    const y =
      enemy.y - camera.y;

    // Shadow
    ctx.fillStyle =
      "rgba(0,0,0,0.35)";

    ctx.beginPath();

    ctx.ellipse(
      x,
      y + 18,
      20,
      7,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Body
    ctx.fillStyle =
      "#b71c1c";

    ctx.fillRect(
      x - 13,
      y - 5,
      26,
      32
    );

    // Head
    ctx.fillStyle =
      "#d79b78";

    ctx.beginPath();

    ctx.arc(
      x,
      y - 20,
      12,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // HP
    ctx.fillStyle =
      "#222";

    ctx.fillRect(
      x - 25,
      y - 42,
      50,
      6
    );

    ctx.fillStyle =
      "#32cd50";

    ctx.fillRect(
      x - 25,
      y - 42,
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
  if (reloading) {
    return;
  }

  if (ammo <= 0) {
    gameMessage =
      "RELOAD!";
    return;
  }

  ammo--;

  let closest = null;
  let closestDistance =
    Infinity;

  for (const enemy of enemies) {
    if (!enemy.alive) {
      continue;
    }

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
        closestDistance &&
      distance < 500
    ) {
      closestDistance =
        distance;

      closest = enemy;
    }
  }

  if (closest) {
    closest.hp -= 25;

    if (
      closest.hp <= 0
    ) {
      closest.hp = 0;
      closest.alive = false;

      score += 100;
    }
  }
}

// =====================================================
// RELOAD
// =====================================================

function reload() {
  if (reloading) {
    return;
  }

  if (ammo === maxAmmo) {
    return;
  }

  reloading = true;

  gameMessage =
    "RELOADING...";

  setTimeout(() => {
    ammo = maxAmmo;
    reloading = false;
    gameMessage = "";
  }, 1200);
}

// =====================================================
// WEAPON SWITCH
// =====================================================

function switchWeapon() {
  if (weapon === "Pistol") {
    weapon = "Rifle";
    maxAmmo = 30;
  } else if (
    weapon === "Rifle"
  ) {
    weapon = "Shotgun";
    maxAmmo = 6;
  } else {
    weapon = "Pistol";
    maxAmmo = 12;
  }

  ammo = maxAmmo;
}

// =====================================================
// JUMP
// =====================================================

window.jumpPlayer = function () {
  if (player.y > 40) {
    player.y -= 35;
  }
};

// =====================================================
// RUN
// =====================================================

window.setRunning =
  function (state) {
    player.running = state;
  };

// =====================================================
// CROUCH
// =====================================================

window.toggleCrouch =
  function () {
    player.crouching =
      !player.crouching;

    if (
      player.crouching
    ) {
      player.speed = 1.8;
    } else {
      player.speed = 3.2;
    }
  };

// =====================================================
// HUD
// =====================================================

function drawHUD() {
  const hp =
    document.getElementById("hp");

  const weaponText =
    document.getElementById(
      "weapon"
    );

  const scoreText =
    document.getElementById(
      "score"
    );

  if (hp) {
    hp.textContent =
      player.hp;
  }

  if (weaponText) {
    weaponText.textContent =
      weapon +
      " (" +
      ammo +
      "/" +
      maxAmmo +
      ")";
  }

  if (scoreText) {
    scoreText.textContent =
      score;
  }

  if (gameMessage) {
    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      "bold 24px Arial";

    ctx.textAlign =
      "center";

    ctx.fillText(
      gameMessage,
      canvas.width / 2,
      120
    );

    ctx.textAlign =
      "left";
  }
}

// =====================================================
// MOBILE BUTTON CONNECTION
// =====================================================

function connectButton(
  id,
  action
) {
  const button =
    document.getElementById(id);

  if (!button) {
    return;
  }

  button.addEventListener(
    "touchstart",
    event => {
      event.preventDefault();
      action();
    },
    {
      passive: false
    }
  );

  button.addEventListener(
    "click",
    event => {
      event.preventDefault();
      action();
    }
  );
}

connectButton(
  "fireButton",
  fire
);

connectButton(
  "reloadButton",
  reload
);

connectButton(
  "gunButton",
  switchWeapon
);

connectButton(
  "jumpButton",
  () => {
    window.jumpPlayer();
  }
);

connectButton(
  "crouchButton",
  () => {
    window.toggleCrouch();
  }
);

// RUN — hold button
const runButton =
  document.getElementById(
    "runButton"
  );

if (runButton) {
  runButton.addEventListener(
    "touchstart",
    event => {
      event.preventDefault();
      window.setRunning(true);
    },
    {
      passive: false
    }
  );

  runButton.addEventListener(
    "touchend",
    event => {
      event.preventDefault();
      window.setRunning(false);
    },
    {
      passive: false
    }
  );
}

// =====================================================
// GAME LOOP
// =====================================================

function gameLoop() {
  updatePlayer();
  updateEnemies();
  updateCamera();

  drawMap();
  drawEnemies();
  drawPlayer();
  drawHUD();

  requestAnimationFrame(
    gameLoop
  );
}

gameLoop();