// levels.js — the three rooms of the Meridian Vault job.
// Each level is one room that fits on screen: walls, green cover blocks,
// guard patrols, sweeping cameras, loot, and the getaway door.
// Coordinates are in play-area space: x 0..960, y 0..576 (below the HUD).
// Every level offers at least two routes: a fast open lane through the cones
// and a slow covered lane behind crates and shadow.

export const LEVELS = [
  {
    id: 1,
    name: 'Room 1 — The Lobby',
    briefing:
      'Cross the lobby, lift $500 of amber, and slip out the green door. ' +
      'Stay out of the red cones. Crates and green shadow break line of sight.',
    lootGoal: 500,
    parSeconds: 75,
    start: { x: 60, y: 500 },
    exit: { x: 880, y: 40, w: 56, h: 64 },
    walls: [
      { x: 0, y: 0, w: 960, h: 14 },
      { x: 0, y: 562, w: 960, h: 14 },
      { x: 0, y: 0, w: 14, h: 576 },
      { x: 946, y: 0, w: 14, h: 576 },
      { x: 300, y: 150, w: 16, h: 180 },
      { x: 620, y: 250, w: 16, h: 180 },
    ],
    cover: [
      { x: 150, y: 90, w: 90, h: 60 },
      { x: 430, y: 420, w: 110, h: 60 },
      { x: 700, y: 110, w: 90, h: 60 },
    ],
    shadows: [
      { x: 120, y: 330, w: 150, h: 130 },
      { x: 660, y: 350, w: 170, h: 130 },
    ],
    guards: [
      {
        path: [
          [220, 260],
          [520, 260],
        ],
        speed: 55,
        range: 150,
        fov: 0.62,
        pause: 1.2,
      },
      {
        path: [
          [760, 430],
          [760, 180],
        ],
        speed: 60,
        range: 150,
        fov: 0.62,
        pause: 1.0,
      },
    ],
    cameras: [
      { x: 480, y: 14, base: Math.PI / 2, sweep: 0.7, speed: 0.55, range: 170, fov: 0.5 },
    ],
    loot: [
      { x: 200, y: 200, kind: 'bar', value: 100 },
      { x: 480, y: 120, kind: 'bar', value: 100 },
      { x: 360, y: 480, kind: 'bar', value: 100 },
      { x: 840, y: 480, kind: 'gem', value: 250 },
      { x: 560, y: 330, kind: 'bar', value: 100 },
    ],
  },
  {
    id: 2,
    name: 'Room 2 — The Gallery',
    briefing:
      'The gallery hangs paintings worth a fortune — and two cameras watch the ' +
      'middle hall. Use the north crates or the south shadow lane, never both at once.',
    lootGoal: 900,
    parSeconds: 100,
    start: { x: 60, y: 500 },
    exit: { x: 880, y: 40, w: 56, h: 64 },
    walls: [
      { x: 0, y: 0, w: 960, h: 14 },
      { x: 0, y: 562, w: 960, h: 14 },
      { x: 0, y: 0, w: 14, h: 576 },
      { x: 946, y: 0, w: 14, h: 576 },
      { x: 250, y: 0, w: 16, h: 150 },
      { x: 250, y: 300, w: 16, h: 276 },
      { x: 680, y: 120, w: 16, h: 200 },
      { x: 480, y: 420, w: 200, h: 16 },
    ],
    cover: [
      { x: 120, y: 200, w: 90, h: 60 },
      { x: 340, y: 90, w: 110, h: 60 },
      { x: 560, y: 200, w: 90, h: 60 },
      { x: 760, y: 420, w: 100, h: 60 },
    ],
    shadows: [
      { x: 90, y: 380, w: 160, h: 130 },
      { x: 520, y: 40, w: 150, h: 90 },
    ],
    guards: [
      {
        path: [
          [330, 220],
          [620, 220],
          [620, 380],
          [330, 380],
        ],
        speed: 70,
        range: 160,
        fov: 0.62,
        pause: 0.8,
      },
      {
        path: [
          [830, 150],
          [830, 450],
        ],
        speed: 75,
        range: 160,
        fov: 0.62,
        pause: 0.9,
      },
      {
        path: [
          [130, 300],
          [200, 300],
        ],
        speed: 45,
        range: 140,
        fov: 0.6,
        pause: 1.4,
      },
    ],
    cameras: [
      { x: 480, y: 14, base: Math.PI / 2, sweep: 0.8, speed: 0.7, range: 175, fov: 0.5 },
      { x: 946, y: 280, base: Math.PI, sweep: 0.6, speed: 0.6, range: 170, fov: 0.5 },
    ],
    loot: [
      { x: 170, y: 100, kind: 'bar', value: 100 },
      { x: 420, y: 320, kind: 'painting', value: 150 },
      { x: 600, y: 100, kind: 'bar', value: 100 },
      { x: 760, y: 300, kind: 'painting', value: 150 },
      { x: 880, y: 500, kind: 'gem', value: 250 },
      { x: 300, y: 500, kind: 'bar', value: 100 },
      { x: 540, y: 480, kind: 'painting', value: 150 },
    ],
  },
  {
    id: 3,
    name: 'Room 3 — The Vault',
    briefing:
      'The vault itself. Three guards, three cameras, and the Amber Diamond. ' +
      'Smoke the middle patrol, jam the cameras, take the diamond, and run.',
    lootGoal: 1100,
    parSeconds: 120,
    start: { x: 60, y: 500 },
    exit: { x: 880, y: 40, w: 56, h: 64 },
    walls: [
      { x: 0, y: 0, w: 960, h: 14 },
      { x: 0, y: 562, w: 960, h: 14 },
      { x: 0, y: 0, w: 14, h: 576 },
      { x: 946, y: 0, w: 14, h: 576 },
      { x: 300, y: 100, w: 16, h: 200 },
      { x: 300, y: 400, w: 16, h: 162 },
      { x: 640, y: 0, w: 16, h: 180 },
      { x: 640, y: 330, w: 16, h: 232 },
      { x: 430, y: 260, w: 120, h: 16 },
    ],
    cover: [
      { x: 130, y: 120, w: 100, h: 60 },
      { x: 360, y: 450, w: 110, h: 60 },
      { x: 700, y: 220, w: 100, h: 60 },
      { x: 820, y: 440, w: 90, h: 60 },
    ],
    shadows: [
      { x: 90, y: 330, w: 160, h: 140 },
      { x: 470, y: 60, w: 140, h: 100 },
      { x: 700, y: 380, w: 130, h: 120 },
    ],
    guards: [
      {
        path: [
          [200, 250],
          [560, 250],
        ],
        speed: 85,
        range: 165,
        fov: 0.62,
        pause: 0.6,
      },
      {
        path: [
          [760, 120],
          [760, 500],
        ],
        speed: 90,
        range: 165,
        fov: 0.62,
        pause: 0.6,
      },
      {
        path: [
          [380, 480],
          [580, 480],
          [580, 340],
          [380, 340],
        ],
        speed: 80,
        range: 160,
        fov: 0.62,
        pause: 0.7,
      },
    ],
    cameras: [
      { x: 480, y: 14, base: Math.PI / 2, sweep: 0.85, speed: 0.85, range: 180, fov: 0.5 },
      { x: 14, y: 280, base: 0, sweep: 0.6, speed: 0.7, range: 170, fov: 0.5 },
      { x: 946, y: 300, base: Math.PI, sweep: 0.7, speed: 0.75, range: 175, fov: 0.5 },
    ],
    loot: [
      { x: 180, y: 90, kind: 'bar', value: 100 },
      { x: 480, y: 180, kind: 'painting', value: 150 },
      { x: 480, y: 500, kind: 'bar', value: 100 },
      { x: 760, y: 300, kind: 'painting', value: 150 },
      { x: 880, y: 500, kind: 'bar', value: 100 },
      { x: 250, y: 500, kind: 'bar', value: 100 },
      { x: 480, y: 330, kind: 'diamond', value: 400 },
      { x: 600, y: 90, kind: 'gem', value: 250 },
    ],
  },
];
