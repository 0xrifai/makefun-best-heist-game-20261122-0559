// camera.js — the wall-mounted security cameras: a slow sweep, a red cone,
// and a faster alarm rise than a guard's. A jammer freezes them blind.

import { CAMERA_RANGE } from './config.js';
import { insideCone } from './geometry.js';

export function makeCamera(def) {
  return {
    x: def.x,
    y: def.y,
    base: def.base,
    sweep: def.sweep,
    speed: def.speed,
    range: def.range,
    fov: def.fov,
    angle: def.base,
    t: Math.random() * 10,
    jammed: false,
  };
}

export function updateCamera(camera, dt, jammed) {
  camera.jammed = jammed;
  if (jammed) return; // a jammed camera holds its last angle, lens dark
  camera.t += dt;
  camera.angle = camera.base + Math.sin(camera.t * camera.speed) * camera.sweep;
}

export function cameraSeesThief(camera, thief, blockers, hidden) {
  if (camera.jammed || hidden) return false;
  return insideCone(
    thief.x,
    thief.y,
    camera.x,
    camera.y,
    camera.angle,
    camera.range,
    camera.fov,
    blockers,
  );
}

export { CAMERA_RANGE };
