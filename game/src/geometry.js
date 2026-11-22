// geometry.js — small collision and sight helpers shared by thief, guards and cameras.
// Everything here works in play-area coordinates (x 0..960, y 0..576).

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

// Push a circle (cx, cy, r) out of a rectangle; returns the corrected position.
export function circleRectResolve(cx, cy, r, rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w);
  const ny = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nx;
  const dy = cy - ny;
  const d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return { x: cx, y: cy, hit: false };
  if (d2 > 0.0001) {
    const d = Math.sqrt(d2);
    return { x: nx + (dx / d) * r, y: ny + (dy / d) * r, hit: true };
  }
  // Centre inside the rectangle: push out along the smallest penetration.
  const left = cx - rect.x;
  const right = rect.x + rect.w - cx;
  const top = cy - rect.y;
  const bottom = rect.y + rect.h - cy;
  const m = Math.min(left, right, top, bottom);
  if (m === left) return { x: rect.x - r, y: cy, hit: true };
  if (m === right) return { x: rect.x + rect.w + r, y: cy, hit: true };
  if (m === top) return { x: cx, y: rect.y - r, hit: true };
  return { x: cx, y: rect.y + rect.h + r, hit: true };
}

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

// Does segment (ax,ay)-(bx,by) cross the rectangle? Used for line of sight.
export function segmentHitsRect(ax, ay, bx, by, rect) {
  if (pointInRect(ax, ay, rect) || pointInRect(bx, by, rect)) return true;
  const edges = [
    [rect.x, rect.y, rect.x + rect.w, rect.y],
    [rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h],
    [rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h],
    [rect.x, rect.y + rect.h, rect.x, rect.y],
  ];
  for (const [cx, cy, dx, dy] of edges) {
    if (segmentsCross(ax, ay, bx, by, cx, cy, dx, dy)) return true;
  }
  return false;
}

function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
  const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
  const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

// True when nothing (wall or cover block) stands between the two points.
export function hasLineOfSight(ax, ay, bx, by, blockers) {
  for (const b of blockers) {
    if (segmentHitsRect(ax, ay, bx, by, b)) return false;
  }
  return true;
}

// Is the thief inside this watcher's vision cone? (distance, angle, sight line)
export function insideCone(tx, ty, wx, wy, facing, range, halfFov, blockers) {
  const d = dist(wx, wy, tx, ty);
  if (d > range) return false;
  if (d < 14) return hasLineOfSight(wx, wy, tx, ty, blockers);
  let ang = Math.atan2(ty - wy, tx - wx) - facing;
  while (ang > Math.PI) ang -= 2 * Math.PI;
  while (ang < -Math.PI) ang += 2 * Math.PI;
  if (Math.abs(ang) > halfFov) return false;
  return hasLineOfSight(wx, wy, tx, ty, blockers);
}

export function angleLerp(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return a + d * t;
}
