// Shared constants and the palette for Midnight Vault Heist.
// Direction: quiet chrome, one amber accent, dark ink-blue night.
// Safe cover, danger and loot each read at a glance by colour and shape.
export const TILE = 40;
export const COLS = 32;
export const ROWS = 20;
export const HUD_H = 64;
export const VIEW_W = COLS * TILE; // 1280
export const VIEW_H = HUD_H + ROWS * TILE; // 864: HUD bar + the room

export const PALETTE = {
  floor: '#171d29',
  floorAlt: '#1a212f',
  carpet: '#2a1f26',
  shadowZone: '#101623',
  wall: '#39415a',
  wallTop: '#4d5878',
  crate: '#6b543a',
  crateEdge: '#8a6f4c',
  table: '#2e3a4f',
  tableEdge: '#46536e',
  player: '#e8f0f2',
  playerRing: '#7fd4c1',
  guard: '#d96a4f',
  guardAlert: '#e5484d',
  conePatrol: 'rgba(217, 164, 65, 0.20)',
  coneAlert: 'rgba(229, 72, 77, 0.28)',
  coneEdge: 'rgba(217, 164, 65, 0.55)',
  camera: '#c9ced6',
  cameraCone: 'rgba(120, 180, 255, 0.16)',
  lootGold: '#d9a441',
  lootDiamond: '#8fd8e8',
  lootPainting: '#c98a5a',
  exit: '#7fd4c1',
  exitLocked: '#8a8f98',
  smoke: 'rgba(200, 205, 215, 0.55)',
  text: '#e8e6df',
  textDim: '#9aa3b2',
  alarmLow: '#7fd4c1',
  alarmMid: '#d9a441',
  alarmHigh: '#e5484d',
  panel: '#12161f',
  panelEdge: '#2c3446',
};

export const TOOLS = {
  smoke: { key: '1', name: 'Smoke bomb', cost: 150, desc: 'Breaks every line of sight for 4s' },
  emp: { key: '2', name: 'EMP pulse', cost: 200, desc: 'Cameras blind for 8s' },
  coin: { key: 'click', name: 'Coin toss', cost: 1, desc: 'Click to throw; nearby guards investigate' },
};

export const PLAYER_SPEED = 195; // px per second, walking
export const SNEAK_SPEED = 115;
export const GUARD_PATROL_SPEED = 72;
export const GUARD_CHASE_SPEED = 158;
export const GUARD_FOV = (Math.PI * 70) / 180; // 70 degree vision cone
export const GUARD_RANGE = 235;
export const CAMERA_FOV = (Math.PI * 56) / 180;
export const CAMERA_RANGE = 270;
export const ALARM_MAX = 100;
export const ALARM_DECAY = 7; // per second while unseen
export const CHASE_ALARM = 55; // alarm above this: guards chase
export const SPOTTED_ALARM = 75; // alarm above this: siren + warning

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

// Deterministic PRNG so screenshot setups reproduce exactly.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
