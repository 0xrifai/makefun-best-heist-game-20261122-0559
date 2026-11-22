// shots.js — deterministic mid-game scenes for the screenshots.
// ?shot=start | play | end jumps the game into a scripted, frozen frame so a
// headless screenshot shows the real game at its best: the render is the
// game's own code, only the positions are staged. The frame is frozen
// (no updates run) so the screenshot is identical every time.

export function applyShot(s, name) {
  if (name === 'start') {
    // Room 1, mid-crossing: Rook between the crates, both patrols in view,
    // the camera sweeping the middle hall, loot glowing ahead, alarm at 22%.
    s.thief.x = 430;
    s.thief.y = 300;
    s.thief.facing = 0;
    s.alarm.value = 22;
    s.guards[0].x = 300;
    s.guards[0].y = 260;
    s.guards[0].facing = Math.PI / 2;
    s.guards[1].x = 760;
    s.guards[1].y = 300;
    s.guards[1].facing = -Math.PI / 2;
    s.cameras[0].angle = Math.PI / 2 + 0.4;
    s.time = 18;
  } else if (name === 'play') {
    // Room 2, the tense moment: Rook lifting a painting while a guard turns
    // toward her and the alarm climbs past half.
    s.levelIndex = 1;
    s.loadLevel(1);
    s.thief.x = 420;
    s.thief.y = 320;
    s.thief.facing = -Math.PI / 2;
    s.thief.loot = 350;
    s.taken.add(0);
    s.taken.add(1);
    s.alarm.value = 55;
    s.guards[0].x = 480;
    s.guards[0].y = 220;
    s.guards[0].facing = Math.PI / 2;
    s.guards[0].alert = true;
    s.guards[1].x = 830;
    s.guards[1].y = 260;
    s.guards[1].facing = Math.PI;
    s.cameras[0].angle = Math.PI / 2 - 0.5;
    s.cameras[1].angle = Math.PI - 0.3;
    s.time = 44;
  } else if (name === 'end') {
    // Room 3, the getaway: the Amber Diamond taken, the door open and green,
    // two guards converging and the alarm at 82% — the payoff frame.
    s.levelIndex = 2;
    s.loadLevel(2);
    s.thief.x = 800;
    s.thief.y = 120;
    s.thief.facing = Math.PI / 4;
    s.thief.loot = 1250;
    s.taken.add(0);
    s.taken.add(1);
    s.taken.add(3);
    s.taken.add(6);
    s.taken.add(7);
    s.alarm.value = 82;
    s.guards[0].x = 560;
    s.guards[0].y = 250;
    s.guards[0].facing = 0.6;
    s.guards[0].alert = true;
    s.guards[1].x = 760;
    s.guards[1].y = 320;
    s.guards[1].facing = -Math.PI / 2;
    s.guards[1].alert = true;
    s.guards[2].x = 480;
    s.guards[2].y = 480;
    s.guards[2].facing = Math.PI;
    s.cameras[0].angle = Math.PI / 2 + 0.5;
    s.cameras[2].angle = Math.PI + 0.2;
    s.thief.smokeClouds.push({ x: 640, y: 200, t: 4 });
    s.time = 91;
  } else {
    return false;
  }
  s.phase = 'playing';
  s.frozen = true;
  return true;
}
