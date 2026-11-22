// Line of sight and vision-cone tests for Midnight Vault Heist.
// Walls, crates, tables and locked doors block sight; everything else
// (carpet, shadow, floor) does not. The grid is built once per level
// from the level data, then every sight test is a grid walk.
import { TILE, COLS, ROWS } from './config.js';

export function buildGrid(level) {
  const solid = new Uint8Array(COLS * ROWS);
  const blocksSight = new Uint8Array(COLS * ROWS);
  const mark = (x, y, w, h) => {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        if (i < 0 || j < 0 || i >= COLS || j >= ROWS) continue;
        solid[j * COLS + i] = 1;
        blocksSight[j * COLS + i] = 1;
      }
    }
  };
  // Border walls.
  for (let i = 0; i < COLS; i++) {
    mark(i, 0, 1, 1);
    mark(i, ROWS - 1, 1, 1);
  }
  for (let j = 0; j < ROWS; j++) {
    mark(0, j, 1, 1);
    mark(COLS - 1, j, 1, 1);
  }
  for (const w of level.walls || []) mark(w.x, w.y, w.w, w.h);
  for (const c of level.crates || []) mark(c.x, c.y, 1, 1);
  for (const t of level.tables || []) mark(t.x, t.y, t.w, t.h);
  for (const d of level.lockedDoors || []) mark(d.x, d.y, d.w, d.h);
  return { solid, blocksSight, lockedDoors: (level.lockedDoors || []).slice() };
}

export function isSolid(grid, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
  return grid.solid[ty * COLS + tx] === 1;
}

// Circle (radius r, in px) against the solid grid; used for movement.
export function circleHitsSolid(grid, px, py, r) {
  const x0 = Math.floor((px - r) / TILE);
  const x1 = Math.floor((px + r) / TILE);
  const y0 = Math.floor((py - r) / TILE);
  const y1 = Math.floor((py + r) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (!isSolid(grid, tx, ty)) continue;
      const cx = Math.max(tx * TILE, Math.min(px, tx * TILE + TILE));
      const cy = Math.max(ty * TILE, Math.min(py, ty * TILE + TILE));
      if ((px - cx) * (px - cx) + (py - cy) * (py - cy) < r * r) return true;
    }
  }
  return false;
}

// Grid DDA walk: true when nothing blocks sight between two points.
export function hasLineOfSight(grid, x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / (TILE / 3));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const tx = Math.floor((x0 + dx * t) / TILE);
    const ty = Math.floor((y0 + dy * t) / TILE);
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return false;
    if (grid.blocksSight[ty * COLS + tx] === 1) return false;
  }
  return true;
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Is the target inside the watcher's cone (range + half-angle + sight)?
export function inVisionCone(grid, watcher, range, halfAngle, tx, ty) {
  const dx = tx - watcher.x;
  const dy = ty - watcher.y;
  const d = Math.hypot(dx, dy);
  if (d > range) return { seen: false, d };
  if (d < 14) return { seen: true, d }; // right on top of the watcher
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, watcher.angle)) > halfAngle) return { seen: false, d };
  if (!hasLineOfSight(grid, watcher.x, watcher.y, tx, ty)) return { seen: false, d };
  return { seen: true, d };
}

export function tileCenter(t) {
  return t * TILE + TILE / 2;
}

// Breadth-first reachability over open tiles; the play-test uses it to
// prove every loot piece and the exit can be reached from the start.
export function reachableTiles(grid, sx, sy) {
  const seen = new Uint8Array(COLS * ROWS);
  const queue = [[sx, sy]];
  seen[sy * COLS + sx] = 1;
  while (queue.length) {
    const [x, y] = queue.shift();
    for (const [nx, ny] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      if (seen[ny * COLS + nx] || isSolid(grid, nx, ny)) continue;
      seen[ny * COLS + nx] = 1;
      queue.push([nx, ny]);
    }
  }
  return seen;
}
