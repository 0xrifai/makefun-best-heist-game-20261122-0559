// thief.js — Rook, the thief: movement, tools, loot and the getaway check.
// Movement is keyboard (WASD / arrows) plus click-to-move; walls and cover
// blocks slide the thief along instead of stopping her dead.

import { THIEF_SPEED, THIEF_RADIUS, SMOKE_SECONDS, JAM_SECONDS, TOOL_NOISE, SMOKE_RADIUS } from './config.js';
import { circleRectResolve, pointInRect } from './geometry.js';

export function makeThief(level) {
  return {
    x: level.start.x,
    y: level.start.y,
    radius: THIEF_RADIUS,
    facing: -Math.PI / 2,
    moveTarget: null, // {x, y} from a mouse click, or null
    smoke: 2, // charges this level
    jammer: 1,
    smokeClouds: [], // {x, y, t} active smoke, blocks vision
    jamTimer: 0, // cameras disabled while > 0
    loot: 0,
    lootCount: 0,
  };
}

// Move one step; returns nothing, mutates thief in place.
export function updateThief(thief, input, dt, level) {
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;

  if (mx !== 0 || my !== 0) {
    thief.moveTarget = null; // keyboard overrides a click target
    const len = Math.hypot(mx, my);
    mx /= len;
    my /= len;
  } else if (thief.moveTarget) {
    const dx = thief.moveTarget.x - thief.x;
    const dy = thief.moveTarget.y - thief.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) {
      thief.moveTarget = null;
    } else {
      mx = dx / d;
      my = dy / d;
    }
  }

  if (mx !== 0 || my !== 0) {
    thief.facing = Math.atan2(my, mx);
    thief.x += mx * THIEF_SPEED * dt;
    thief.y += my * THIEF_SPEED * dt;
  }

  // Resolve against every solid rectangle, one axis at a time so sliding works.
  const solids = level.walls.concat(level.cover);
  for (const s of solids) {
    const r = circleRectResolve(thief.x, thief.y, thief.radius, s);
    thief.x = r.x;
    thief.y = r.y;
  }
  thief.x = Math.max(14 + thief.radius, Math.min(946 - thief.radius, thief.x));
  thief.y = Math.max(14 + thief.radius, Math.min(562 - thief.radius, thief.y));

  thief.jamTimer = Math.max(0, thief.jamTimer - dt);
  for (const c of thief.smokeClouds) c.t -= dt;
  thief.smokeClouds = thief.smokeClouds.filter((c) => c.t > 0);
}

// Is the thief standing in a green shadow patch (detection is halved there)?
export function inShadow(thief, level) {
  return level.shadows.some((s) => pointInRect(thief.x, thief.y, s));
}

// Is the thief inside any smoke cloud (unseeable while inside one)?
export function inSmoke(thief) {
  return thief.smokeClouds.some(
    (c) => Math.hypot(thief.x - c.x, thief.y - c.y) < SMOKE_RADIUS,
  );
}

// Use a tool. Returns a message for the HUD log, or null when it cannot fire.
export function useTool(thief, which, alarm) {
  if (which === 'smoke') {
    if (thief.smoke <= 0) return null;
    thief.smoke -= 1;
    thief.smokeClouds.push({ x: thief.x, y: thief.y, t: SMOKE_SECONDS });
    alarm.value = Math.min(100, alarm.value + TOOL_NOISE);
    return 'Smoke out — the cloud hides you, but it made noise.';
  }
  if (which === 'jammer') {
    if (thief.jammer <= 0) return null;
    if (thief.jamTimer > 0) return null;
    thief.jammer -= 1;
    thief.jamTimer = JAM_SECONDS;
    alarm.value = Math.min(100, alarm.value + TOOL_NOISE);
    return 'Cameras jammed — 8 seconds of blind lenses.';
  }
  return null;
}

// Pick up any loot within reach. Returns the value collected this step.
export function collectLoot(thief, level, taken) {
  let gained = 0;
  level.loot.forEach((item, i) => {
    if (taken.has(i)) return;
    if (Math.hypot(thief.x - item.x, thief.y - item.y) < 26) {
      taken.add(i);
      thief.loot += item.value;
      thief.lootCount += 1;
      gained += item.value;
    }
  });
  return gained;
}

// The getaway door opens only once the loot goal is met.
export function exitOpen(thief, level) {
  return thief.loot >= level.lootGoal;
}

export function atExit(thief, level) {
  return exitOpen(thief, level) && pointInRect(thief.x, thief.y, level.exit);
}
