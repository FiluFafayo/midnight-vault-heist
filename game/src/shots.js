// Deterministic screenshot setups for Midnight Vault Heist.
// ?shot=cover | alarm | vault | getaway picks a frozen, staged moment
// of real gameplay so the screenshots are renders of the game's own
// code: the thief mid-room, guards with cones, cameras, loot and the
// alarm meter all in one frame. Positions are fixed, never random.
import { tileCenter } from './vision.js';

export function applyShot(game, name) {
  const g = game;
  if (name === 'cover') {
    g.startLevel(0);
    g.screen = 'play';
    g.time = 42;
    g.alarm = 34;
    g.player.x = tileCenter(12);
    g.player.y = tileCenter(10);
    g.player.angle = -Math.PI / 2;
    g.guards[0].x = tileCenter(6);
    g.guards[0].y = tileCenter(8);
    g.guards[0].angle = 0;
    g.guards[1].x = tileCenter(24);
    g.guards[1].y = tileCenter(8);
    g.guards[1].angle = Math.PI;
    g.cameras[0].angle = Math.PI / 2 + 0.7;
    g.loot.items.find((it) => it.kind === 'gold' && it.y === tileCenter(2)).taken = false;
  } else if (name === 'alarm') {
    g.startLevel(0);
    g.screen = 'play';
    g.time = 96;
    g.alarm = 82;
    g.player.x = tileCenter(14);
    g.player.y = tileCenter(8);
    g.player.angle = Math.PI;
    g.guards[0].x = tileCenter(11);
    g.guards[0].y = tileCenter(8);
    g.guards[0].angle = 0;
    g.guards[0].state = 'chase';
    g.guards[0].lastSeen = { x: g.player.x, y: g.player.y };
    g.guards[1].x = tileCenter(20);
    g.guards[1].y = tileCenter(8);
    g.guards[1].angle = Math.PI;
    g.guards[1].state = 'suspicious';
    g.guards[1].lastSeen = { x: g.player.x, y: g.player.y };
    g.cameras[0].angle = Math.PI / 2 - 0.5;
    g.loot.items[0].taken = true; // one painting already lifted
    g.sounds.startAlarm();
  } else if (name === 'vault') {
    g.startLevel(1);
    g.screen = 'play';
    g.time = 128;
    g.alarm = 18;
    g.player.x = tileCenter(23);
    g.player.y = tileCenter(5);
    g.player.angle = 0;
    g.guards[2].x = tileCenter(26);
    g.guards[2].y = tileCenter(3);
    g.guards[2].angle = Math.PI;
    g.guards[0].x = tileCenter(8);
    g.guards[0].y = tileCenter(8);
    g.guards[0].angle = 0;
    g.guards[1].x = tileCenter(21);
    g.guards[1].y = tileCenter(12);
    g.guards[1].angle = -Math.PI / 2;
    g.cameras[0].angle = Math.PI / 2 + 0.4;
    g.cameras[1].angle = -Math.PI / 2 + 0.6;
    g.loot.items.find((it) => it.kind === 'gold' && it.x === tileCenter(3)).taken = true;
    const vault = g.loot.items.find((it) => it.kind === 'vault');
    vault.crack = 1.1; // mid-crack, progress ring visible
    g.level.lockedDoors[0].open = true; // door picked, vault room open
    g.grid = g.rebuildGrid();
  } else if (name === 'getaway') {
    g.startLevel(0);
    g.screen = 'levelComplete';
    g.time = 118;
    g.alarm = 12;
    g.player.x = tileCenter(28);
    g.player.y = tileCenter(2);
    g.player.angle = -Math.PI / 2;
    for (const it of g.loot.items) it.taken = true;
    g.guards[0].x = tileCenter(10);
    g.guards[0].y = tileCenter(8);
    g.guards[0].angle = Math.PI;
    g.guards[1].x = tileCenter(20);
    g.guards[1].y = tileCenter(8);
    g.guards[1].angle = 0;
  }
}
