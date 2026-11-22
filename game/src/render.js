// render.js — every pixel of The Amber Vault, drawn on one canvas.
// The HUD (top 64px) always shows the level name, loot, the alarm meter,
// tools and timer, so one frame holds the whole heist: room, thief, guards
// with cones, cameras, loot target and alarm meter together.

import { VIEW_W, VIEW_H, HUD_H, PALETTE } from './config.js';
import { alarmColour } from './alarm.js';
import { exitOpen } from './thief.js';

export const SMOKE_BUTTON = { x: 740, y: 8, w: 92, h: 22 };
export const JAMMER_BUTTON = { x: 842, y: 8, w: 104, h: 22 };

function conePath(ctx, x, y, facing, range, halfFov) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfFov, facing + halfFov);
  ctx.closePath();
}

function drawCone(ctx, x, y, facing, range, halfFov, fill, edge) {
  conePath(ctx, x, y, facing, range, halfFov);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawFloor(ctx, level) {
  const y0 = HUD_H;
  for (let ty = 0; ty < 9; ty++) {
    for (let tx = 0; tx < 15; tx++) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(tx * 64, y0 + ty * 64, 64, 64);
    }
  }
  ctx.strokeStyle = PALETTE.floorLine;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 15; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 64, y0);
    ctx.lineTo(i * 64, y0 + 576);
    ctx.stroke();
  }
  for (let i = 0; i <= 9; i++) {
    ctx.beginPath();
    ctx.moveTo(0, y0 + i * 64);
    ctx.lineTo(960, y0 + i * 64);
    ctx.stroke();
  }
  // A faded vault seal in the middle of the floor, pure decoration.
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.10)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(480, y0 + 288, 90, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(480, y0 + 288, 62, 0, Math.PI * 2);
  ctx.stroke();
}

function drawShadows(ctx, level) {
  for (const s of level.shadows) {
    ctx.fillStyle = PALETTE.shadow;
    ctx.fillRect(s.x, HUD_H + s.y, s.w, s.h);
    ctx.strokeStyle = 'rgba(46, 160, 110, 0.45)';
    ctx.setLineDash([6, 5]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(s.x, HUD_H + s.y, s.w, s.h);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(120, 220, 170, 0.75)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHADOW — hard to spot here', s.x + s.w / 2, HUD_H + s.y + 16);
  }
}

function drawWallsAndCover(ctx, level) {
  for (const w of level.walls) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(w.x, HUD_H + w.y, w.w, w.h);
    ctx.strokeStyle = PALETTE.wallTrim;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w.x, HUD_H + w.y, w.w, w.h);
  }
  for (const c of level.cover) {
    ctx.fillStyle = PALETTE.cover;
    ctx.fillRect(c.x, HUD_H + c.y, c.w, c.h);
    ctx.strokeStyle = PALETTE.coverEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, HUD_H + c.y, c.w, c.h);
    ctx.strokeStyle = 'rgba(47, 125, 91, 0.6)';
    ctx.beginPath();
    ctx.moveTo(c.x, HUD_H + c.y);
    ctx.lineTo(c.x + c.w, HUD_H + c.y + c.h);
    ctx.moveTo(c.x + c.w, HUD_H + c.y);
    ctx.lineTo(c.x, HUD_H + c.y + c.h);
    ctx.stroke();
  }
}

function drawLoot(ctx, level, taken, time) {
  const bob = Math.sin(time * 3) * 2;
  level.loot.forEach((item, i) => {
    if (taken.has(i)) return;
    const x = item.x;
    const y = HUD_H + item.y + bob;
    ctx.save();
    ctx.shadowColor = PALETTE.lootGlow;
    ctx.shadowBlur = 14;
    if (item.kind === 'bar') {
      ctx.fillStyle = PALETTE.loot;
      ctx.fillRect(x - 9, y - 5, 18, 10);
      ctx.fillStyle = '#ffe08a';
      ctx.fillRect(x - 9, y - 5, 18, 3);
    } else if (item.kind === 'gem') {
      ctx.fillStyle = PALETTE.gem;
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x + 8, y);
      ctx.lineTo(x, y + 10);
      ctx.lineTo(x - 8, y);
      ctx.closePath();
      ctx.fill();
    } else if (item.kind === 'painting') {
      ctx.fillStyle = '#7a5a2e';
      ctx.fillRect(x - 12, y - 9, 24, 18);
      ctx.fillStyle = '#c96f4a';
      ctx.fillRect(x - 9, y - 6, 18, 12);
      ctx.fillStyle = '#ffe08a';
      ctx.fillRect(x - 9, y - 6, 18, 3);
    } else if (item.kind === 'diamond') {
      ctx.fillStyle = '#dff6ff';
      ctx.beginPath();
      ctx.moveTo(x, y - 14);
      ctx.lineTo(x + 12, y);
      ctx.lineTo(x, y + 14);
      ctx.lineTo(x - 12, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#4dd8ff';
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x + 5, y);
      ctx.lineTo(x, y + 6);
      ctx.lineTo(x - 5, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(255, 224, 138, 0.9)';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$' + item.value, x, HUD_H + item.y + 24);
  });
}

function drawExit(ctx, level, thief) {
  const open = exitOpen(thief, level);
  const e = level.exit;
  const x = e.x;
  const y = HUD_H + e.y;
  ctx.save();
  if (open) {
    ctx.shadowColor = PALETTE.exit;
    ctx.shadowBlur = 18;
  }
  ctx.fillStyle = open ? PALETTE.exit : PALETTE.exitLocked;
  ctx.fillRect(x, y, e.w, e.h);
  ctx.restore();
  ctx.strokeStyle = '#0b1220';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, e.w, e.h);
  ctx.fillStyle = '#0b1220';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'GETAWAY' : 'LOCKED', x + e.w / 2, y + e.h / 2 - 4);
  ctx.font = '10px sans-serif';
  ctx.fillText(open ? 'GO!' : 'need $' + level.lootGoal, x + e.w / 2, y + e.h / 2 + 12);
}

function drawGuard(ctx, guard) {
  const x = guard.x;
  const y = HUD_H + guard.y;
  drawCone(ctx, x, y, guard.facing, guard.range, guard.fov, PALETTE.cone, PALETTE.coneEdge);
  ctx.fillStyle = guard.alert ? '#ff5a5a' : PALETTE.guard;
  ctx.strokeStyle = PALETTE.guardDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Facing tick: a little torch nose so the patrol direction reads at a glance.
  ctx.strokeStyle = '#ffd9d9';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(guard.facing) * 17, y + Math.sin(guard.facing) * 17);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + Math.cos(guard.facing) * 5, y + Math.sin(guard.facing) * 5, 2.5, 0, Math.PI * 2);
  ctx.fill();
  if (guard.alert) {
    ctx.fillStyle = '#ff2222';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', x, y - 20);
  }
}

function drawCamera(ctx, camera) {
  const x = camera.x;
  const y = HUD_H + camera.y;
  if (!camera.jammed) {
    drawCone(ctx, x, y, camera.angle, camera.range, camera.fov, PALETTE.cameraCone, 'rgba(255, 110, 60, 0.5)');
  }
  ctx.fillStyle = camera.jammed ? '#5a6b7a' : '#ff6e3c';
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0b1220';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, 2.5, 0, Math.PI * 2);
  ctx.fill();
  if (camera.jammed) {
    ctx.fillStyle = '#9fb2c8';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JAMMED', x, y - 14);
  }
}

function drawThief(ctx, thief, time) {
  const x = thief.x;
  const y = HUD_H + thief.y;
  const bob = Math.sin(time * 8) * 1;
  // A cream ring so Rook always pops against the navy floor.
  ctx.strokeStyle = 'rgba(232, 228, 216, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y + bob, 15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.save();
  ctx.shadowColor = 'rgba(232, 228, 216, 0.5)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = PALETTE.thiefCloak;
  ctx.beginPath();
  ctx.arc(x, y + bob, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.arc(x, y + bob, 9, 0, Math.PI * 2);
  ctx.fill();
  // Hood point and eyes, facing the direction of travel.
  ctx.fillStyle = PALETTE.thiefCloak;
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(thief.facing) * 14, y + bob + Math.sin(thief.facing) * 14);
  ctx.lineTo(
    x + Math.cos(thief.facing + 2.5) * 8,
    y + bob + Math.sin(thief.facing + 2.5) * 8,
  );
  ctx.lineTo(
    x + Math.cos(thief.facing - 2.5) * 8,
    y + bob + Math.sin(thief.facing - 2.5) * 8,
  );
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0b1220';
  ctx.beginPath();
  ctx.arc(x + Math.cos(thief.facing) * 3 - Math.sin(thief.facing) * 3, y + bob + Math.sin(thief.facing) * 3 + Math.cos(thief.facing) * 3, 1.4, 0, Math.PI * 2);
  ctx.arc(x + Math.cos(thief.facing) * 3 + Math.sin(thief.facing) * 3, y + bob + Math.sin(thief.facing) * 3 - Math.cos(thief.facing) * 3, 1.4, 0, Math.PI * 2);
  ctx.fill();
  if (thief.moveTarget) {
    ctx.strokeStyle = 'rgba(232, 228, 216, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(thief.moveTarget.x, HUD_H + thief.moveTarget.y, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSmoke(ctx, thief) {
  for (const c of thief.smokeClouds) {
    const x = c.x;
    const y = HUD_H + c.y;
    const alpha = Math.min(1, c.t / 2) * 0.55;
    ctx.fillStyle = `rgba(200, 205, 215, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x - 30, y - 10, 42, 0, Math.PI * 2);
    ctx.arc(x + 25, y + 12, 48, 0, Math.PI * 2);
    ctx.arc(x, y, 55, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHud(ctx, s) {
  ctx.fillStyle = PALETTE.hudBg;
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, HUD_H - 2, VIEW_W, 2);

  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('THE AMBER VAULT — ' + s.level.name.toUpperCase(), 14, 22);
  ctx.fillStyle = PALETTE.hudDim;
  ctx.font = '12px sans-serif';
  ctx.fillText(
    `LOOT $${s.thief.loot} / $${s.level.lootGoal}   •   TIME ${formatTime(s.time)}   •   LIVES ${'◆'.repeat(s.lives)}${'◇'.repeat(Math.max(0, 3 - s.lives))}`,
    14,
    46,
  );

  // Alarm meter, top row, centre-right.
  ctx.fillStyle = PALETTE.hudDim;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ALARM', 470, 22);
  ctx.fillStyle = '#1b2a4a';
  ctx.fillRect(530, 10, 160, 16);
  ctx.fillStyle = alarmColour(s.alarm.value);
  ctx.fillRect(530, 10, (160 * s.alarm.value) / 100, 16);
  ctx.strokeStyle = '#8fa3c8';
  ctx.lineWidth = 1;
  ctx.strokeRect(530, 10, 160, 16);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(Math.round(s.alarm.value) + '%', 696, 22);

  drawToolButton(ctx, SMOKE_BUTTON, `SMOKE ×${s.thief.smoke}`, s.thief.smoke > 0);
  drawToolButton(ctx, JAMMER_BUTTON, `JAM ×${s.thief.jammer}`, s.thief.jammer > 0);

  // Second row, right side: a hint, or a warning when the alarm runs hot.
  ctx.fillStyle = s.alarm.value >= 70 ? '#ff6b6b' : PALETTE.hudDim;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(
    s.alarm.value >= 70 ? 'HIDE! The alarm is about to trip.' : 'WASD / arrows or click to move  •  [1] smoke  •  [2] jammer  •  M mute',
    VIEW_W - 14,
    46,
  );
}

function drawToolButton(ctx, rect, label, enabled) {
  ctx.fillStyle = enabled ? '#22345c' : '#141d33';
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = enabled ? PALETTE.wallTrim : '#3a4a68';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = enabled ? PALETTE.hudText : '#5a6b8a';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + 16);
}

function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function overlay(ctx, title, lines, hint) {
  ctx.fillStyle = 'rgba(5, 8, 16, 0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.loot;
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(title, VIEW_W / 2, 190);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '16px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW_W / 2, 240 + i * 28);
  });
  if (hint) {
    ctx.fillStyle = PALETTE.hudDim;
    ctx.font = '14px sans-serif';
    ctx.fillText(hint, VIEW_W / 2, 240 + lines.length * 28 + 30);
  }
}

// The full frame: HUD plus the room, in draw order (floor first, thief last).
export function drawGame(ctx, s) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = PALETTE.hudBg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawFloor(ctx, s.level);
  drawShadows(ctx, s.level);
  drawExit(ctx, s.level, s.thief);
  drawLoot(ctx, s.level, s.taken, s.time);
  for (const cam of s.cameras) drawCamera(ctx, cam);
  for (const g of s.guards) drawGuard(ctx, g);
  drawWallsAndCover(ctx, s.level);
  drawSmoke(ctx, s.thief);
  drawThief(ctx, s.thief, s.time);
  drawHud(ctx, s);

  if (s.phase === 'menu') {
    overlay(ctx, 'THE AMBER VAULT', [
      'A three-room heist. Cross each room, lift the loot,',
      'dodge the guards and cameras — then run for the green door.',
      '',
      'Move: WASD / arrows, or click to walk.  Tools: [1] smoke, [2] jammer.',
      'Green shadow hides you. A "!" means you have been seen — break away fast.',
    ], 'Press Enter or click to start the job');
  } else if (s.phase === 'briefing') {
    overlay(ctx, s.level.name.toUpperCase(), [
      s.level.briefing,
      '',
      `Lift at least $${s.level.lootGoal} to unlock the getaway door.`,
    ], 'Press Enter to go in');
  } else if (s.phase === 'paused') {
    overlay(ctx, 'PAUSED', ['Take a breath. The guards are waiting.'], 'Press P to keep going');
  } else if (s.phase === 'caught') {
    overlay(ctx, 'CAUGHT!', [
      'The alarm tripped. Rook slips back to the door —',
      `one life down, ${s.lives} left.`,
    ], 'Press Enter to try the room again');
  } else if (s.phase === 'levelDone') {
    const bonus = Math.max(0, Math.round((s.level.parSeconds - s.time) * 5));
    overlay(ctx, 'ROOM CLEAR', [
      `Loot lifted: $${s.thief.loot}.  Time bonus: $${bonus}.`,
      `Score so far: $${s.score + s.thief.loot + bonus}.`,
    ], 'Press Enter for the next room');
  } else if (s.phase === 'gameOver') {
    overlay(ctx, 'THE JOB FAILED', [
      `Rook was caught three times. Final score: $${s.score}.`,
      'The vault keeps its amber — this time.',
    ], 'Press R to run it back');
  } else if (s.phase === 'won') {
    overlay(ctx, 'CLEAN GETAWAY!', [
      'Three rooms, the Amber Diamond, and not a single siren that stuck.',
      `Final score: $${s.score}. Rook retires — for tonight.`,
    ], 'Press R to play again');
  }
}
