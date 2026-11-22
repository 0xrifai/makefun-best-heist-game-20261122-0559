// config.js — the one place for every number and colour in The Amber Vault.
// The palette is deliberate: deep navy vault floor, warm amber loot, red danger
// (vision cones, cameras), green cover shadow, so a glance tells you what is safe.
export const VIEW_W = 960;
export const VIEW_H = 640;
export const HUD_H = 64;
export const PLAY_W = 960;
export const PLAY_H = 576;

export const PALETTE = {
  floorA: '#16233f',
  floorB: '#1b2a4a',
  floorLine: '#22345c',
  wall: '#0d1526',
  wallTrim: '#c9a227',
  cover: '#1e4d3a',
  coverEdge: '#2f7d5b',
  shadow: 'rgba(46, 160, 110, 0.20)',
  cone: 'rgba(224, 57, 57, 0.28)',
  coneEdge: 'rgba(224, 57, 57, 0.55)',
  cameraCone: 'rgba(255, 110, 60, 0.24)',
  loot: '#ffb62e',
  lootGlow: 'rgba(255, 182, 46, 0.35)',
  gem: '#4dd8ff',
  thief: '#e8e4d8',
  thiefCloak: '#3a2f5e',
  guard: '#d84a4a',
  guardDark: '#7a1f1f',
  exit: '#39d98a',
  exitLocked: '#5a6b7a',
  smoke: 'rgba(200, 205, 215, 0.55)',
  hudBg: '#0b1220',
  hudText: '#e8e4d8',
  hudDim: '#8fa3c8',
  alarmLow: '#39d98a',
  alarmMid: '#ffb62e',
  alarmHigh: '#e03939',
};

export const THIEF_SPEED = 150; // px per second
export const THIEF_RADIUS = 11;
export const GUARD_RADIUS = 12;
export const DETECT_RANGE = 150;
export const CAMERA_RANGE = 170;
export const ALARM_MAX = 100;
export const ALARM_DECAY = 9; // per second while unseen
export const GUARD_SEEN_RATE = 26; // alarm per second while a guard sees you
export const CAMERA_SEEN_RATE = 34; // alarm per second while a camera sees you
export const SPOT_GRACE = 0.9; // seconds of "!" warning before the alarm can trip a catch
export const SMOKE_RADIUS = 95;
export const SMOKE_SECONDS = 6;
export const JAM_SECONDS = 8;
export const TOOL_NOISE = 8; // alarm added by using any tool (it makes noise)
export const LIVES = 3;
