// All drawing for Midnight Vault Heist, one canvas, no images.
// The room reads at a glance: dark floor, pale walls, amber cones for
// danger, gold shapes for loot, teal for the exit and the thief. The
// HUD sits in a quiet top bar: mission, alarm meter, loot and timer.
import { TILE, COLS, ROWS, VIEW_W, VIEW_H, HUD_H, PALETTE } from './config.js';
import { tileCenter } from './vision.js';
import { conePolygon, GUARD_STATE } from './guards.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCone(ctx, grid, x, y, angle, halfAngle, range, fill, edge) {
  const pts = conePolygon(x, y, angle, halfAngle, range, grid);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawLoot(ctx, it) {
  const { x, y } = it;
  if (it.kind === 'painting') {
    ctx.fillStyle = '#3a2c1e';
    ctx.fillRect(x - 13, y - 10, 26, 20);
    ctx.fillStyle = PALETTE.lootPainting;
    ctx.fillRect(x - 10, y - 7, 20, 14);
    ctx.fillStyle = '#7a5a34';
    ctx.fillRect(x - 10, y - 7, 20, 4);
    ctx.fillStyle = '#e8d9b0';
    ctx.fillRect(x - 3, y - 1, 6, 6);
  } else if (it.kind === 'gold') {
    ctx.fillStyle = '#8a6a1f';
    ctx.fillRect(x - 11, y - 5, 22, 10);
    ctx.fillStyle = PALETTE.lootGold;
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 4);
    ctx.lineTo(x + 8, y - 4);
    ctx.lineTo(x + 5, y + 4);
    ctx.lineTo(x - 5, y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x - 6, y - 3, 12, 2);
  } else if (it.kind === 'diamond') {
    ctx.fillStyle = PALETTE.lootDiamond;
    ctx.beginPath();
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x + 10, y - 2);
    ctx.lineTo(x, y + 11);
    ctx.lineTo(x - 10, y - 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e8fbff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 2);
    ctx.lineTo(x + 10, y - 2);
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x, y + 11);
    ctx.stroke();
  } else if (it.kind === 'vault') {
    // A floor safe: steel door with a dial, cracked open while E is held.
    ctx.fillStyle = '#232a38';
    ctx.fillRect(x - 14, y - 14, 28, 28);
    ctx.fillStyle = it.crack > 0 ? '#3d4a63' : '#2e3748';
    ctx.fillRect(x - 11, y - 11, 22, 22);
    ctx.strokeStyle = PALETTE.lootGold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.lootGold;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
    if (it.crack > 0 && it.crack < it.crackNeeded) {
      ctx.strokeStyle = PALETTE.lootGold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 17, -Math.PI / 2, -Math.PI / 2 + (it.crack / it.crackNeeded) * Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawGuard(ctx, g) {
  const alerted = g.state !== GUARD_STATE.PATROL;
  // Body: a circle with a facing tick and a small cap brim.
  ctx.fillStyle = alerted ? PALETTE.guardAlert : PALETTE.guard;
  ctx.beginPath();
  ctx.arc(g.x, g.y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a1210';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f2e8d8';
  ctx.beginPath();
  ctx.arc(g.x, g.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = alerted ? PALETTE.guardAlert : PALETTE.guard;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(g.x + Math.cos(g.angle) * 8, g.y + Math.sin(g.angle) * 8);
  ctx.lineTo(g.x + Math.cos(g.angle) * 18, g.y + Math.sin(g.angle) * 18);
  ctx.stroke();
  // "!" when the guard is on to you.
  if (alerted) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', g.x, g.y - 20);
  }
}

function drawCamera(ctx, cam, disabled) {
  ctx.fillStyle = disabled ? '#5a6272' : PALETTE.camera;
  ctx.beginPath();
  ctx.arc(cam.x, cam.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a1210';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = disabled ? '#5a6272' : PALETTE.camera;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cam.x, cam.y);
  ctx.lineTo(cam.x + Math.cos(cam.angle) * 14, cam.y + Math.sin(cam.angle) * 14);
  ctx.stroke();
  if (!disabled) {
    ctx.fillStyle = '#e5484d';
    ctx.beginPath();
    ctx.arc(cam.x + Math.cos(cam.angle) * 15, cam.y + Math.sin(cam.angle) * 15, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(ctx, p, sneaking) {
  ctx.fillStyle = 'rgba(127, 212, 193, 0.25)';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.player;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.playerRing;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Facing tick.
  ctx.strokeStyle = '#12312b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x + Math.cos(p.angle) * 6, p.y + Math.sin(p.angle) * 6);
  ctx.lineTo(p.x + Math.cos(p.angle) * 15, p.y + Math.sin(p.angle) * 15);
  ctx.stroke();
  if (sneaking) {
    ctx.fillStyle = PALETTE.textDim;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('sneaking', p.x, p.y + 28);
  }
}

function drawHud(ctx, s) {
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = PALETTE.panelEdge;
  ctx.fillRect(0, HUD_H - 1, VIEW_W, 1);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PALETTE.text;
  ctx.font = '600 15px sans-serif';
  ctx.fillText(s.level.name, 16, 26);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '12px sans-serif';
  const objective = s.loot.effectiveValue() >= s.level.target
    ? 'Target met — reach the teal exit'
    : `Take $${s.level.target.toLocaleString()} to open the exit`;
  ctx.fillText(objective, 16, 46);

  // Alarm meter, centre.
  const ax = 470;
  const aw = 340;
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '12px sans-serif';
  ctx.fillText('ALARM', ax, 26);
  const alarmColor = s.alarm < 40 ? PALETTE.alarmLow : s.alarm < 75 ? PALETTE.alarmMid : PALETTE.alarmHigh;
  ctx.fillStyle = '#232a38';
  roundRect(ctx, ax + 52, 14, aw, 16, 4);
  ctx.fill();
  ctx.fillStyle = alarmColor;
  if (s.alarm > 0.5) {
    roundRect(ctx, ax + 52, 14, (aw * s.alarm) / 100, 16, 4);
    ctx.fill();
  }
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 1;
  roundRect(ctx, ax + 52, 14, aw, 16, 4);
  ctx.stroke();
  ctx.fillStyle = alarmColor;
  ctx.font = '600 12px sans-serif';
  ctx.fillText(
    s.alarm >= 75 ? 'SPOTTED' : s.alarm >= 40 ? 'Suspicious' : 'Quiet',
    ax + 52 + aw + 10,
    27,
  );
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '12px sans-serif';
  ctx.fillText('Guards and cameras raise it. Break line of sight to cool it down.', ax, 48);

  // Loot, timer and tools, right.
  const rx = VIEW_W - 16;
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.lootGold;
  ctx.font = '600 17px sans-serif';
  ctx.fillText(
    `$${s.loot.effectiveValue().toLocaleString()} / $${s.level.target.toLocaleString()}`,
    rx,
    26,
  );
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '12px sans-serif';
  const mins = Math.floor(s.time / 60);
  const secs = Math.floor(s.time % 60);
  ctx.fillText(
    `${mins}:${String(secs).padStart(2, '0')}  ·  Smoke ${s.tools.smoke}  ·  EMP ${s.tools.emp}  ·  Coins ${s.tools.coins}`,
    rx,
    46,
  );
}

function drawWorld(ctx, s) {
  const { grid, level } = s;
  ctx.save();
  ctx.translate(0, HUD_H);
  const H = VIEW_H - HUD_H;

  // Floor.
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 0, VIEW_W, H);
  ctx.fillStyle = PALETTE.floorAlt;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
  }
  // Carpet and shadow zones.
  for (const z of level.carpet || []) {
    ctx.fillStyle = PALETTE.carpet;
    ctx.fillRect(z.x * TILE, z.y * TILE, z.w * TILE, z.h * TILE);
  }
  for (const z of level.shadow || []) {
    ctx.fillStyle = PALETTE.shadowZone;
    ctx.fillRect(z.x * TILE, z.y * TILE, z.w * TILE, z.h * TILE);
    ctx.strokeStyle = 'rgba(127, 212, 193, 0.35)';
    ctx.setLineDash([4, 5]);
    ctx.lineWidth = 1;
    ctx.strokeRect(z.x * TILE + 1, z.y * TILE + 1, z.w * TILE - 2, z.h * TILE - 2);
    ctx.setLineDash([]);
  }

  // Exit door.
  const ex = tileCenter(level.exit.x);
  const ey = tileCenter(level.exit.y);
  const exitOpen = s.loot.effectiveValue() >= level.target;
  ctx.fillStyle = exitOpen ? PALETTE.exit : PALETTE.exitLocked;
  ctx.fillRect(ex - 16, ey - 16, 32, 32);
  ctx.strokeStyle = '#0f1f1b';
  ctx.lineWidth = 2;
  ctx.strokeRect(ex - 16, ey - 16, 32, 32);
  ctx.fillStyle = '#0f1f1b';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(exitOpen ? 'EXIT' : 'LOCK', ex, ey + 4);

  // Locked doors.
  for (const d of level.lockedDoors || []) {
    ctx.fillStyle = d.open ? '#3a2c1e' : '#6b4a1f';
    ctx.fillRect(d.x * TILE, d.y * TILE, d.w * TILE, d.h * TILE);
    ctx.strokeStyle = PALETTE.lootGold;
    ctx.lineWidth = 2;
    ctx.strokeRect(d.x * TILE + 3, d.y * TILE + 3, d.w * TILE - 6, d.h * TILE - 6);
    if (!d.open) {
      ctx.fillStyle = PALETTE.lootGold;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOCKED', d.x * TILE + (d.w * TILE) / 2, d.y * TILE + (d.h * TILE) / 2 + 3);
    }
  }

  // Walls, crates, tables.
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!grid.solid[y * COLS + x]) continue;
      const px = x * TILE;
      const py = y * TILE;
      ctx.fillStyle = PALETTE.wall;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = PALETTE.wallTop;
      ctx.fillRect(px, py, TILE, 4);
    }
  }
  for (const c of level.crates || []) {
    const px = c.x * TILE;
    const py = c.y * TILE;
    ctx.fillStyle = PALETTE.crate;
    ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
    ctx.strokeStyle = PALETTE.crateEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 3, py + 3, TILE - 6, TILE - 6);
    ctx.beginPath();
    ctx.moveTo(px + 3, py + 3);
    ctx.lineTo(px + TILE - 3, py + TILE - 3);
    ctx.moveTo(px + TILE - 3, py + 3);
    ctx.lineTo(px + 3, py + TILE - 3);
    ctx.stroke();
  }
  for (const t of level.tables || []) {
    ctx.fillStyle = PALETTE.table;
    ctx.fillRect(t.x * TILE + 2, t.y * TILE + 2, t.w * TILE - 4, t.h * TILE - 4);
    ctx.strokeStyle = PALETTE.tableEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(t.x * TILE + 2, t.y * TILE + 2, t.w * TILE - 4, t.h * TILE - 4);
  }

  // Vision cones under the actors.
  for (const cam of s.cameras) {
    if (s.time < cam.disabledUntil) continue;
    drawCone(ctx, grid, cam.x, cam.y, cam.angle, (56 * Math.PI) / 360, 270, PALETTE.cameraCone, 'rgba(120,180,255,0.35)');
  }
  for (const g of s.guards) {
    const alerted = g.state !== GUARD_STATE.PATROL;
    drawCone(
      ctx,
      grid,
      g.x,
      g.y,
      g.angle,
      (70 * Math.PI) / 360,
      235,
      alerted ? PALETTE.coneAlert : PALETTE.conePatrol,
      alerted ? 'rgba(229,72,77,0.6)' : PALETTE.coneEdge,
    );
  }

  // Loot, coin, actors.
  for (const it of s.loot.items) if (!it.taken) drawLoot(ctx, it);
  if (s.tools.coin) {
    ctx.fillStyle = PALETTE.lootGold;
    ctx.beginPath();
    ctx.arc(s.tools.coin.x, s.tools.coin.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a6a1f';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  for (const cam of s.cameras) drawCamera(ctx, cam, s.time < cam.disabledUntil);
  for (const g of s.guards) drawGuard(ctx, g);
  drawPlayer(ctx, s.player, s.sneaking);

  // Smoke.
  if (s.time < s.tools.smokeUntil) {
    ctx.fillStyle = PALETTE.smoke;
    ctx.beginPath();
    ctx.arc(s.player.x, s.player.y, 130, 0, Math.PI * 2);
    ctx.fill();
  }

  // Red edge flash while the alarm is critical.
  if (s.alarm >= 75) {
    ctx.strokeStyle = `rgba(229, 72, 77, ${0.25 + 0.2 * Math.sin(s.time * 6)})`;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, VIEW_W - 6, H - 6);
  }

  ctx.restore();
}

function overlay(ctx, title, lines, hint) {
  ctx.fillStyle = 'rgba(10, 13, 20, 0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.text;
  ctx.font = '600 34px sans-serif';
  ctx.fillText(title, VIEW_W / 2, VIEW_H / 2 - 70);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '15px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW_W / 2, VIEW_H / 2 - 28 + i * 24);
  });
  if (hint) {
    ctx.fillStyle = PALETTE.lootGold;
    ctx.font = '600 14px sans-serif';
    ctx.fillText(hint, VIEW_W / 2, VIEW_H / 2 + 30 + lines.length * 24);
  }
}

export function draw(ctx, s) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (s.screen === 'title') {
    // Title over a live look at the first room.
    drawWorld(ctx, s);
    overlay(
      ctx,
      'MIDNIGHT VAULT HEIST',
      [
        'Three jobs. One thief. No witnesses.',
        'Move with WASD or arrows. Hold Shift to sneak.',
        'E cracks the vault and the safe. 1 smoke, 2 EMP, click tosses a coin.',
        'Fill the loot target, then reach the teal exit before the alarm hits 100.',
      ],
      'Press Enter to start the first job',
    );
    return;
  }
  drawWorld(ctx, s);
  drawHud(ctx, s);
  if (s.screen === 'briefing') {
    overlay(ctx, s.level.name, [s.level.brief], 'Press Enter to begin');
  } else if (s.screen === 'paused') {
    overlay(ctx, 'Paused', ['The guards wait for no one. Well — right now they do.'], 'Press P to resume');
  } else if (s.screen === 'busted') {
    overlay(
      ctx,
      'BUSTED',
      [
        `The alarm hit 100 in ${s.level.name}.`,
        `Loot lifted: $${s.loot.effectiveValue().toLocaleString()} — the crew keeps none of it.`,
      ],
      'Press R to retry the mission',
    );
  } else if (s.screen === 'levelComplete') {
    const bonus = Math.max(0, s.level.parSeconds - Math.floor(s.time)) * 10;
    overlay(
      ctx,
      'CLEAN GETAWAY',
      [
        `${s.level.name} — take $${s.loot.effectiveValue().toLocaleString()}.`,
        `Time ${Math.floor(s.time / 60)}:${String(Math.floor(s.time % 60)).padStart(2, '0')} (par ${Math.floor(s.level.parSeconds / 60)}:${String(s.level.parSeconds % 60).padStart(2, '0')}) — speed bonus $${bonus}.`,
        `Running total: $${(s.totalLoot + s.loot.effectiveValue()).toLocaleString()}.`,
      ],
      s.levelIndex < 2 ? 'Press Enter for the next mission' : 'Press Enter to see the final take',
    );
  } else if (s.screen === 'heistComplete') {
    overlay(
      ctx,
      'THE HEIST IS DONE',
      [
        `All three jobs, one clean getaway after another.`,
        `Final take: $${s.totalLoot.toLocaleString()}. The crew retires. Probably.`,
      ],
      'Press Enter to run it back from Mission 1',
    );
  }
  // Controls reminder, bottom left, quiet.
  if (s.screen === 'play') {
    ctx.fillStyle = 'rgba(154, 163, 178, 0.75)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      'WASD move · Shift sneak · E crack · 1 smoke ($150) · 2 EMP ($200) · Click coin · P pause · M mute',
      12,
      VIEW_H - 10,
    );
  }
}
