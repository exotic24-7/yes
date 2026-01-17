const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { pack, unpack } = require('msgpackr');

const SAVE_FILE = path.join(__dirname, '..', 'save.json');

const app = express();

// Serve the client build from /client (clear client/server separation)
app.use(express.static(path.join(__dirname, '..', 'client')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let hasPlayer = false;
let playerSocket = null;
let playerUser = null; // { id, name, isGuest, createdAt }

// Simple authoritative game state
const state = {
  player: { x: 200, y: 200, vx: 0, vy: 0, hp: 100, input: {} },
  enemies: [],
  projectiles: [],
  petals: [], // world petal entities
  timeAlive: 0,
  biome: 'default',
};
// initialize inventory fields on player
state.player.inventory = [];
state.player.petals = [];

// Load save database (per-user saves)
let saveDb = {};
try {
  if (fs.existsSync(SAVE_FILE)) {
    const raw = fs.readFileSync(SAVE_FILE, 'utf8');
    saveDb = JSON.parse(raw || '{}');
    console.log('Loaded save.json');
  }
} catch (e) {
  console.warn('Failed to load save.json', e);
}

function saveToDisk() {
  try {
    fs.writeFileSync(SAVE_FILE, JSON.stringify(saveDb, null, 2));
  } catch (e) {
    console.warn('Failed to write save.json', e);
  }
}

function spawnEnemyAroundPlayer() {
  const angle = Math.random() * Math.PI * 2;
  const dist = 300 + Math.random() * 200;
  const x = state.player.x + Math.cos(angle) * dist;
  const y = state.player.y + Math.sin(angle) * dist;
  state.enemies.push({ id: Date.now() + Math.random(), x, y, hp: 10, speed: 30 + Math.random() * 20 });
}

function update(dt) {
  state.timeAlive += dt;

  // Apply player input immediately
  const inp = state.player.input || {};
  const speed = 150;
  state.player.vx = (inp.moveX || 0) * speed;
  state.player.vy = (inp.moveY || 0) * speed;
  state.player.x += state.player.vx * dt;
  state.player.y += state.player.vy * dt;

  // Simple combat: if player has an attack action, damage nearby enemies
  const actions = inp.actions || {};
  const attackDamage = 40; // DPS when attacking
  const attackRange = 40;

  // Update enemies: move toward player
  for (let e of state.enemies) {
    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    e.x += (dx / dist) * e.speed * dt;
    e.y += (dy / dist) * e.speed * dt;
    // simple collision
    if (dist < 20) {
      state.player.hp -= 10 * dt; // damage over time
    }

    // player attack damage (server authoritative)
    if (actions.attack && dist < attackRange) {
      e.hp -= attackDamage * dt;
    }
  }

  // Spawn rules (simple)
  const difficulty = Math.floor(state.timeAlive / 30);
  const maxEnemies = 20 + difficulty * 2;
  if (state.enemies.length < maxEnemies && Math.random() < 0.02 + difficulty * 0.001) {
    spawnEnemyAroundPlayer();
  }

  // Handle enemy deaths and spawn petals (do not immediately remove)
  for (let e of state.enemies) {
    if (!e.dead && e.hp <= 0) {
      e.dead = true;
      handleEnemyDeath(e);
    }
  }
  // Remove enemies flagged dead
  state.enemies = state.enemies.filter(e => !e.dead && e.hp > 0);

  // Handle petal pickups (server-authoritative)
  const PICKUP_RADIUS = 30;
  for (let p of state.petals) {
    if (p.collected) continue;
    const dx = state.player.x - p.x;
    const dy = state.player.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < PICKUP_RADIUS) {
      collectPetal(p);
    }
  }

  // Remove collected petals
  state.petals = state.petals.filter(p => !p.collected);

  // Death handling
  if (state.player.hp <= 0) {
    // reset world
    state.enemies = [];
    state.petals = [];
    state.player.hp = 100;
    state.player.x = 200;
    state.player.y = 200;
    state.timeAlive = 0;
    // notify client with a gameOver flag in next snapshot
    state.gameOver = true;
    setTimeout(() => { state.gameOver = false; }, 2000);
    // persist save on death (keep inventory)
    persistPlayerSave();
  }
}

function uuid() {
  return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,9);
}

function rollRarity() {
  const r = Math.random();
  if (r < 0.7) return 'common';
  if (r < 0.9) return 'rare';
  return 'epic';
}

function randomOffset() {
  return (Math.random() - 0.5) * 40;
}

function handleEnemyDeath(enemy) {
  const dropCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < dropCount; i++) {
    state.petals.push({
      id: uuid(),
      type: enemy.type || 'default',
      rarity: rollRarity(),
      x: enemy.x + randomOffset(),
      y: enemy.y + randomOffset(),
      value: 1
    });
  }
}

function collectPetal(petal) {
  // add to player inventory
  state.player.inventory.push({ type: petal.type, rarity: petal.rarity, value: petal.value });
  petal.collected = true;
  // persist save immediately
  persistPlayerSave();
}

function persistPlayerSave() {
  if (!playerUser) return;
  const key = playerUser.isGuest ? `guest_${playerUser.id}` : `user_${playerUser.id}`;
  const saveObj = saveDb[key] || {};
  saveObj.inventory = state.player.inventory || [];
  saveObj.equippedPetals = state.player.petals || [];
  saveObj.progression = saveObj.progression || {};
  saveObj.highScore = Math.max(saveObj.highScore || 0, Math.floor(state.timeAlive));
  saveDb[key] = saveObj;
  saveToDisk();
}

function sendSnapshot() {
  if (!playerSocket || playerSocket.readyState !== WebSocket.OPEN) return;
  try {
    const snap = {
      player: { x: state.player.x, y: state.player.y, hp: state.player.hp },
      enemies: state.enemies.map(e => ({ id: e.id, x: e.x, y: e.y, hp: e.hp })),
      petals: state.petals.map(p => ({ id: p.id, type: p.type, rarity: p.rarity, x: p.x, y: p.y })),
      inventory: state.player.inventory || [],
      equipped: state.player.petals || [],
      projectiles: state.projectiles,
      timeAlive: state.timeAlive,
      biome: state.biome,
      gameOver: !!state.gameOver,
    };
    playerSocket.send(pack(snap));
  } catch (e) {
    console.warn('Failed to send snapshot', e);
  }
}

// Tick at 30fps
const TICK_RATE = 30;
let last = Date.now();
setInterval(() => {
  const now = Date.now();
  const dt = (now - last) / 1000;
  last = now;
  update(dt);
  sendSnapshot();
}, 1000 / TICK_RATE);

wss.on('connection', (ws, req) => {
  if (hasPlayer) {
    // refuse additional connections
    ws.close(1000, 'server full');
    return;
  }

  hasPlayer = true;
  playerSocket = ws;
  console.log('Player connected from', req.socket.remoteAddress);

  ws.on('message', (data) => {
    // Expect msgpackr-packed messages
    try {
      const msg = unpack(Buffer.from(data));
      if (msg.input) {
        // minimal sanity checks
        const { moveX, moveY, mouseAngle, actions } = msg.input;
        state.player.input = { moveX: Math.max(-1, Math.min(1, moveX || 0)), moveY: Math.max(-1, Math.min(1, moveY || 0)), mouseAngle, actions };
      } else if (msg.guestLogin) {
        // Accept guest login as first-class
        const id = msg.id || `guest_${Math.random().toString(36).slice(2,10)}`;
        const name = msg.name || 'Player';
        playerUser = { id, name, isGuest: true, createdAt: Date.now() };

        // load save for this guest if present
        const saveKey = `guest_${id}`;
        const saved = saveDb[saveKey] || {};
        state.save = saved;
        state.player.inventory = saved.inventory || [];
        state.player.petals = saved.equippedPetals || [];

        // send ready signal to client
        try {
          ws.send(pack({ gameReady: true }));
        } catch (e) {}
      }
    } catch (e) {
      // ignore
    }
  });

    ws.on('close', () => {
    console.log('Player disconnected');
    hasPlayer = false;
    playerSocket = null;
    // persist save for this guest if present
    if (playerUser) {
      persistPlayerSave();
    }
    playerUser = null;
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
