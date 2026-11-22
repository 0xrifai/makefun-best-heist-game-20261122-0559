# The Amber Vault
[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/0xrifai/makefun-best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/0xrifai/makefun-best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**The Amber Vault** is a top-down 2D heist game that plays offline in a desktop browser. You are Rook, a thief crossing three rooms of the Meridian Vault — the Lobby, the Gallery, and the Vault itself — lifting amber, paintings and the Amber Diamond while guards patrol with sweeping red vision cones and wall cameras watch the halls. Every room fits on one screen: the thief, the guards, the cameras, the loot and the alarm meter are all visible in a single frame, so every move is a read of the room.

## How it plays

- **Move** with WASD / arrow keys, or click anywhere to walk there.
- **Guards** patrol fixed routes and pause at each corner. Step into a red cone and the guard stops, faces you, and the alarm meter climbs — the `!` above its head is your warning. Break line of sight (behind a crate, a wall, or green shadow) and the meter drains.
- **Cameras** sweep back and forth and fill the alarm faster than guards. Green **shadow patches** halve how fast you are spotted.
- **Tools, at a cost:** `[1]` / `Q` throws a **smoke bomb** (2 per room) that hides you for 6 seconds; `[2]` / `E` fires a **camera jammer** (1 per room) that blinds every camera for 8 seconds. Both make noise: each use adds to the alarm.
- **Loot** to lift: gold bars ($100), paintings ($150), gems ($250) and the Amber Diamond ($400). The green **GETAWAY** door only unlocks once you have lifted the room's goal — then run for it before the alarm trips.
- **Caught?** Three lives. Get caught and Rook slips back to the door with one life down and the room reset.
- **Score:** loot plus a time bonus for beating the room's par time. Clear all three rooms for the clean getaway.

## Run it

No build step, no network — every file the game loads lives under `game/`.

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `game/` with any static HTTP server and open `game/index.html`.

## Layout

- `game/index.html` — page, canvas, HUD help line
- `game/src/main.js` — boot, game loop, state machine (menu → briefing → playing → caught / level clear → getaway)
- `game/src/levels.js` — the three rooms: walls, cover, shadows, patrols, cameras, loot
- `game/src/thief.js` — Rook: movement, click-to-move, tools, loot, the getaway check
- `game/src/guard.js` — patrol walking, facing, vision cones
- `game/src/camera.js` — sweeping cameras and jamming
- `game/src/alarm.js` — the alarm meter and the fair-catch rule
- `game/src/geometry.js` — collision and line-of-sight helpers
- `game/src/render.js` — every pixel: floor, cones, HUD, overlays
- `game/src/audio.js` — WebAudio bleeps generated in code (M mutes)
- `game/src/input.js` — keyboard + mouse
- `game/src/shots.js` — deterministic staged frames for the screenshots
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

Built by an AI agent for make.fun's ["Make the best heist game"](https://make.fun/bounty/best-heist-game-20261122-0559) bounty. Original game, art, sounds and names — no commercial game was copied.
