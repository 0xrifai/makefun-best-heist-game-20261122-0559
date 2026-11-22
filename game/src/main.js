// main.js — The Amber Vault: boot, game loop and the state machine.
// Phases: menu → briefing → playing → (caught | levelDone) → … → won / gameOver.
// One frame always shows the whole room, so the thief, guards, cones,
// cameras, loot and alarm meter are visible together.

import { LEVELS } from './levels.js';
import { LIVES, HUD_H, VIEW_W, VIEW_H } from './config.js';
import { makeThief, updateThief, useTool, collectLoot, atExit, inShadow, inSmoke } from './thief.js';
import { makeGuard, updateGuard, guardSeesThief } from './guard.js';
import { makeCamera, updateCamera, cameraSeesThief } from './camera.js';
import { makeAlarm, updateAlarm } from './alarm.js';
import {
  makeAudio,
  sfxPickup,
  sfxSpotted,
  sfxCaught,
  sfxWin,
  sfxTool,
  sfxClick,
  alarmTone,
  toggleMute,
} from './audio.js';
import { makeInput, bindInput, wasPressed, endFrame } from './input.js';
import { drawGame, SMOKE_BUTTON, JAMMER_BUTTON } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = makeInput();
const audio = makeAudio();

const s = {
  phase: 'menu',
  levelIndex: 0,
  level: LEVELS[0],
  thief: null,
  guards: [],
  cameras: [],
  alarm: makeAlarm(),
  taken: new Set(),
  time: 0,
  lives: LIVES,
  score: 0,
  pendingBonus: 0,
  message: '',
  messageTimer: 0,
  frozen: false,
  loadLevel,
};

function loadLevel(i) {
  s.levelIndex = i;
  s.level = LEVELS[i];
  s.thief = makeThief(s.level);
  s.guards = s.level.guards.map(makeGuard);
  s.cameras = s.level.cameras.map(makeCamera);
  s.alarm = makeAlarm();
  s.taken = new Set();
  s.time = 0;
  s.message = '';
  s.messageTimer = 0;
}

function startGame() {
  s.score = 0;
  s.lives = LIVES;
  loadLevel(0);
  s.phase = 'briefing';
}

function confirm() {
  if (s.phase === 'menu') {
    sfxClick(audio);
    startGame();
  } else if (s.phase === 'briefing') {
    sfxClick(audio);
    s.phase = 'playing';
  } else if (s.phase === 'caught') {
    sfxClick(audio);
    loadLevel(s.levelIndex);
    s.phase = 'briefing';
  } else if (s.phase === 'levelDone') {
    sfxClick(audio);
    s.score += s.thief.loot + s.pendingBonus;
    if (s.levelIndex + 1 >= LEVELS.length) {
      s.phase = 'won';
    } else {
      loadLevel(s.levelIndex + 1);
      s.phase = 'briefing';
    }
  }
}

function onCaught() {
  s.lives -= 1;
  sfxCaught(audio);
  if (s.lives <= 0) {
    s.phase = 'gameOver';
  } else {
    s.phase = 'caught';
  }
}

function onLevelClear() {
  s.pendingBonus = Math.max(0, Math.round((s.level.parSeconds - s.time) * 5));
  if (s.levelIndex + 1 >= LEVELS.length) {
    s.score += s.thief.loot + s.pendingBonus;
    sfxWin(audio);
    s.phase = 'won';
  } else {
    sfxWin(audio);
    s.phase = 'levelDone';
  }
}

function fireTool(which) {
  const msg = useTool(s.thief, which, s.alarm);
  if (msg) {
    s.message = msg;
    s.messageTimer = 3;
    sfxTool(audio);
  }
}

function pointInButton(p, b) {
  return p && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
}

function handleClick(p) {
  if (!p) return;
  if (s.phase === 'playing') {
    if (pointInButton(p, SMOKE_BUTTON)) return fireTool('smoke');
    if (pointInButton(p, JAMMER_BUTTON)) return fireTool('jammer');
    if (p.y > HUD_H) {
      s.thief.moveTarget = { x: p.x, y: p.y - HUD_H };
    }
    return;
  }
  // Any click on a menu screen works like Enter.
  if (['menu', 'briefing', 'caught', 'levelDone'].includes(s.phase)) confirm();
}

function update(dt) {
  if (s.phase !== 'playing' || s.frozen) return;
  s.time += dt;
  s.messageTimer = Math.max(0, s.messageTimer - dt);

  updateThief(s.thief, input, dt, s.level);
  for (const g of s.guards) updateGuard(g, dt);
  for (const c of s.cameras) updateCamera(c, dt, s.thief.jamTimer > 0);

  const blockers = s.level.walls.concat(s.level.cover);
  const hidden = inSmoke(s.thief);
  const shadow = inShadow(s.thief, s.level);

  let seenByGuard = false;
  let seenByCamera = false;
  for (const g of s.guards) {
    const sees = guardSeesThief(g, s.thief, blockers, hidden);
    if (sees && !g.alert) sfxSpotted(audio);
    g.alert = sees;
    if (sees) {
      seenByGuard = true;
      g.seenTimer += dt;
      // A guard that has you in its cone turns to face you.
      g.facing = Math.atan2(s.thief.y - g.y, s.thief.x - g.x);
    } else {
      g.seenTimer = 0;
    }
  }
  for (const c of s.cameras) {
    if (cameraSeesThief(c, s.thief, blockers, hidden)) seenByCamera = true;
  }

  if (updateAlarm(s.alarm, dt, seenByGuard, seenByCamera, shadow)) {
    onCaught();
    return;
  }
  alarmTone(audio, s.alarm.value);

  const gained = collectLoot(s.thief, s.level, s.taken);
  if (gained > 0) {
    sfxPickup(audio);
    s.message = `+$${gained} lifted.`;
    s.messageTimer = 1.5;
  }

  if (atExit(s.thief, s.level)) onLevelClear();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (wasPressed(input, 'Enter') || wasPressed(input, 'Space')) {
    if (s.phase === 'gameOver' || s.phase === 'won') {
      sfxClick(audio);
      startGame();
    } else {
      confirm();
    }
  }
  if (wasPressed(input, 'KeyR')) {
    if (s.phase === 'gameOver' || s.phase === 'won' || s.phase === 'playing') {
      sfxClick(audio);
      startGame();
    }
  }
  if (wasPressed(input, 'KeyP') && s.phase === 'playing') s.phase = 'paused';
  else if (wasPressed(input, 'KeyP') && s.phase === 'paused') s.phase = 'playing';
  if (wasPressed(input, 'KeyM')) {
    const muted = toggleMute(audio);
    s.message = muted ? 'Sound off.' : 'Sound on.';
    s.messageTimer = 1.5;
  }
  if (s.phase === 'playing') {
    if (wasPressed(input, 'Digit1') || wasPressed(input, 'KeyQ')) fireTool('smoke');
    if (wasPressed(input, 'Digit2') || wasPressed(input, 'KeyE')) fireTool('jammer');
  }
  handleClick(input.click);

  update(dt);
  drawGame(ctx, s);
  if (s.message && s.messageTimer > 0) {
    ctx.fillStyle = 'rgba(11, 18, 32, 0.85)';
    ctx.fillRect(VIEW_W / 2 - 220, VIEW_H - 40, 440, 26);
    ctx.fillStyle = '#e8e4d8';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.message, VIEW_W / 2, VIEW_H - 22);
  }
  endFrame(input);
  requestAnimationFrame(frame);
}

bindInput(input, canvas);

// Debug handle for automated play-testing (read-only state inspection).
window.__amber = s;

// Screenshot mode: ?shot=start|play|end stages a frozen mid-game frame.
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
loadLevel(0);
if (shot) {
  applyShot(s, shot);
}
requestAnimationFrame(frame);
