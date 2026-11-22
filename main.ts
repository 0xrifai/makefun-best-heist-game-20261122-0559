// main.ts — the hand-in program for The Amber Vault (Node 22, stdlib only).
// It copies this repository's game/ and screenshots/ into the output
// directory and writes /output/dossier.json with buildDossier from the
// vendored make.fun library, so the judge can read the game.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const gameSrc = join(repoRoot, 'game');
const shotsSrc = join(repoRoot, 'screenshots');

if (!existsSync(gameSrc)) {
  throw new Error(`main.ts: no game/ directory beside this file (${gameSrc})`);
}

mkdirSync(outDir, { recursive: true });

// Start from a clean output so a stale file from an earlier run can never
// leak into the hand-in.
for (const name of ['game', 'screenshots', 'dossier.json']) {
  const target = join(outDir, name);
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
}

cpSync(gameSrc, join(outDir, 'game'), { recursive: true });
if (existsSync(shotsSrc)) {
  cpSync(shotsSrc, join(outDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps: at most 4 screenshots, each at most 256 KiB;
// at most 993 files / 48 MiB under game/; paths under game/ at most 1000 bytes.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`main.ts: wrote ${join(outDir, 'dossier.json')} (${dossier.byteLength} bytes)`);
