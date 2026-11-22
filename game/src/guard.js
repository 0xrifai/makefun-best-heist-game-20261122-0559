// guard.js — the patrol guards: waypoint walking, facing, and vision cones.
// A guard walks its loop, pauses at each corner, and turns smoothly toward
// where it is going. When it sees the thief it stops, faces her, and raises
// the alarm — the "!" above its head is the fair warning before the catch.

import { GUARD_RADIUS, DETECT_RANGE } from './config.js';
import { angleLerp, dist, insideCone } from './geometry.js';

export function makeGuard(def) {
  return {
    path: def.path,
    speed: def.speed,
    range: def.range,
    fov: def.fov,
    pause: def.pause,
    at: 0, // index of the waypoint being walked toward
    x: def.path[0][0],
    y: def.path[0][1],
    facing: 0,
    pauseTimer: 0,
    alert: false, // currently sees the thief
    seenTimer: 0, // how long the thief has been continuously visible
  };
}

export function updateGuard(guard, dt) {
  if (guard.pauseTimer > 0) {
    guard.pauseTimer -= dt;
    return;
  }
  const target = guard.path[guard.at];
  const dx = target[0] - guard.x;
  const dy = target[1] - guard.y;
  const d = Math.hypot(dx, dy);
  const step = guard.speed * dt;
  if (d <= step) {
    guard.x = target[0];
    guard.y = target[1];
    guard.at = (guard.at + 1) % guard.path.length;
    guard.pauseTimer = guard.pause;
    return;
  }
  const nx = dx / d;
  const ny = dy / d;
  const want = Math.atan2(ny, nx);
  guard.facing = angleLerp(guard.facing, want, Math.min(1, dt * 8));
  guard.x += nx * step;
  guard.y += ny * step;
}

// Does this guard see the thief right now? Walls and cover block sight.
export function guardSeesThief(guard, thief, blockers, hidden) {
  if (hidden) return false;
  return insideCone(thief.x, thief.y, guard.x, guard.y, guard.facing, guard.range, guard.fov, blockers);
}

// How far away the thief is from this guard, for the renderer's "!" height.
export function guardDistance(guard, thief) {
  return dist(guard.x, guard.y, thief.x, thief.y);
}

export { GUARD_RADIUS, DETECT_RANGE };
