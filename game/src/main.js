// Entry point for Midnight Vault Heist: the game loop, the state
// machine (title, briefing, play, paused, busted, level complete,
// heist complete) and the alarm, the one number every watcher feeds.
// Detection is fair on purpose: a watcher has to hold you in its cone,
// the alarm climbs instead of snapping, and breaking line of sight
// always cools it back down.
import {
  TILE,
  VIEW_W,
  VIEW_H,
  HUD_H,
  PLAYER_SPEED,
  SNEAK_SPEED,
  GUARD_RANGE,
  CAMERA_RANGE,
  ALARM_MAX,
  ALARM_DECAY,
  CHASE_ALARM,
  SPOTTED_ALARM,
  clamp,
} from './config.js';
import { LEVELS } from './levels.js';
import { buildGrid, circleHitsSolid, hasLineOfSight, reachableTiles, tileCenter } from './vision.js';
import { Guard, Camera } from './guards.js';
import { LootPile, ToolBelt, nearExit } from './loot.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { draw } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

export class Game {
  constructor() {
    this.input = new Input(canvas);
    this.sounds = new SoundBank();
    this.screen = 'title';
    this.levelIndex = 0;
    this.totalLoot = 0;
    this.frozen = false; // screenshot setups hold the scene still
    this.startLevel(0);
    this.screen = 'title';
  }

  startLevel(i) {
    this.levelIndex = i;
    this.level = LEVELS[i];
    this.grid = buildGrid(this.level);
    this.player = {
      x: tileCenter(this.level.player.x),
      y: tileCenter(this.level.player.y),
      angle: -Math.PI / 2,
      radius: 12,
    };
    this.guards = this.level.guards.map((g) => new Guard(g));
    this.cameras = this.level.cameras.map((c) => new Camera(c));
    this.loot = new LootPile(this.level.loot);
    this.tools = new ToolBelt();
    this.alarm = 0;
    this.time = 0;
    this.sneaking = false;
    this.wasSeen = false;
    this.alarmSoundOn = false;
    this.screen = 'briefing';
  }

  rebuildGrid() {
    // Locked doors that were picked stop blocking sight and movement.
    const doors = this.level.lockedDoors || [];
    this.grid = buildGrid({ ...this.level, lockedDoors: doors.filter((d) => !d.open) });
    return this.grid;
  }

  inShadow() {
    const tx = Math.floor(this.player.x / TILE);
    const ty = Math.floor(this.player.y / TILE);
    return (this.level.shadow || []).some(
      (z) => tx >= z.x && tx < z.x + z.w && ty >= z.y && ty < z.y + z.h,
    );
  }

  movePlayer(dt) {
    const axis = this.input.axis();
    if (axis.x === 0 && axis.y === 0) return;
    const speed = this.input.sneaking ? SNEAK_SPEED : PLAYER_SPEED;
    const nx = this.player.x + axis.x * speed * dt;
    const ny = this.player.y + axis.y * speed * dt;
    if (!circleHitsSolid(this.grid, nx, this.player.y, this.player.radius)) this.player.x = nx;
    if (!circleHitsSolid(this.grid, this.player.x, ny, this.player.radius)) this.player.y = ny;
    this.player.angle = Math.atan2(axis.y, axis.x);
  }

  tryDoor() {
    for (const d of this.level.lockedDoors || []) {
      if (d.open) continue;
      const cx = tileCenter(d.x + Math.floor(d.w / 2));
      const cy = tileCenter(d.y + Math.floor(d.h / 2));
      if (Math.hypot(this.player.x - cx, this.player.y - cy) < TILE * 1.6) {
        if (this.loot.effectiveValue() >= 100) {
          d.open = true;
          this.loot.spent += 100;
          this.rebuildGrid();
          this.sounds.vaultOpen();
        }
        return;
      }
    }
  }

  update(dt) {
    this.time += dt;
    this.sneaking = this.input.sneaking;
    this.movePlayer(dt);
    this.tools.update(this.time);

    // Tools.
    if (this.input.wasPressed('1')) {
      const cost = this.tools.use('smoke', this.time, this.loot.effectiveValue());
      if (cost > 0) {
        this.loot.spent += cost;
        this.sounds.smoke();
      }
    }
    if (this.input.wasPressed('2')) {
      const cost = this.tools.use('emp', this.time, this.loot.effectiveValue());
      if (cost > 0) {
        this.loot.spent += cost;
        this.sounds.emp();
        for (const cam of this.cameras) cam.disabledUntil = this.time + 8;
      }
    }
    const click = this.input.takeClick();
    if (click) {
      const wx = click.x;
      const wy = click.y - HUD_H;
      if (wy > 0 && this.tools.throwCoin(wx, wy, this.time)) this.sounds.coin();
    }
    if (this.input.wasPressed('e')) this.tryDoor();

    // Loot.
    const gained = this.loot.update(dt, this.player, this.input.cracking, (it) => {
      if (it.kind === 'vault' || it.kind === 'diamond') this.sounds.vaultOpen();
      else this.sounds.pickup();
    });
    void gained;

    // Watchers feed the alarm.
    const smoke = this.time < this.tools.smokeUntil;
    const mult = (this.sneaking ? 0.5 : 1) * (this.inShadow() ? 0.5 : 1);
    let seenNow = false;
    let rate = 0;
    const ctx = {
      grid: this.grid,
      player: this.player,
      alarm: this.alarm,
      time: this.time,
      smokeActive: smoke,
      coin: this.tools.coin,
    };
    for (const g of this.guards) {
      const sight = g.update(dt, ctx);
      if (sight.seen && !smoke) {
        seenNow = true;
        rate += (20 + 42 * (1 - sight.d / GUARD_RANGE)) * mult;
      }
      // A chasing guard that reaches the thief ends the mission.
      if (g.state === 'chase' && Math.hypot(g.x - this.player.x, g.y - this.player.y) < 26) {
        this.bust();
        return;
      }
    }
    for (const cam of this.cameras) {
      const sight = cam.update(dt, ctx);
      if (sight.seen && !smoke && this.time >= cam.disabledUntil) {
        seenNow = true;
        rate += 30 * mult;
      }
    }
    if (seenNow && !this.wasSeen) this.sounds.spotted();
    this.wasSeen = seenNow;
    if (seenNow) {
      this.alarm = clamp(this.alarm + Math.min(rate, 95) * dt, 0, ALARM_MAX);
    } else {
      this.alarm = clamp(this.alarm - ALARM_DECAY * dt, 0, ALARM_MAX);
    }
    if (this.alarm >= SPOTTED_ALARM && !this.alarmSoundOn) {
      this.sounds.startAlarm();
      this.alarmSoundOn = true;
    } else if (this.alarm < SPOTTED_ALARM - 10 && this.alarmSoundOn) {
      this.sounds.stopAlarm();
      this.alarmSoundOn = false;
    }
    if (this.alarm >= ALARM_MAX) {
      this.bust();
      return;
    }

    // Getaway: target met and the thief reaches the exit.
    if (this.loot.effectiveValue() >= this.level.target && nearExit(this.player, this.level.exit)) {
      this.totalLoot += this.loot.effectiveValue();
      this.sounds.getaway();
      this.sounds.stopAlarm();
      this.alarmSoundOn = false;
      this.screen = 'levelComplete';
    }
  }

  bust() {
    this.screen = 'busted';
    this.sounds.stopAlarm();
    this.alarmSoundOn = false;
    this.sounds.busted();
  }

  handleKeys() {
    const input = this.input;
    if (input.wasPressed('m')) this.sounds.toggleMute();
    if (input.wasPressed('p') && this.screen === 'play') {
      this.screen = 'paused';
    } else if (input.wasPressed('p') && this.screen === 'paused') {
      this.screen = 'play';
    }
    if (this.screen === 'title' && (input.wasPressed('enter') || input.wasPressed(' '))) {
      this.sounds.ensure();
      this.screen = 'briefing';
    } else if (this.screen === 'briefing' && (input.wasPressed('enter') || input.wasPressed(' '))) {
      this.screen = 'play';
    } else if (this.screen === 'busted' && input.wasPressed('r')) {
      this.startLevel(this.levelIndex);
      this.screen = 'play';
    } else if (this.screen === 'levelComplete' && input.wasPressed('enter')) {
      if (this.levelIndex < LEVELS.length - 1) {
        this.startLevel(this.levelIndex + 1);
        this.screen = 'play';
      } else {
        this.screen = 'heistComplete';
      }
    } else if (this.screen === 'heistComplete' && input.wasPressed('enter')) {
      this.totalLoot = 0;
      this.startLevel(0);
      this.screen = 'play';
    }
  }

  frame(dt) {
    this.handleKeys();
    if (this.screen === 'play' && !this.frozen) this.update(dt);
    draw(ctx, this);
    this.input.endFrame();
  }
}

const game = new Game();
let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  game.frame(dt);
  requestAnimationFrame(loop);
}

// Screenshot setups freeze the scene so the capture is the staged frame.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  applyShot(game, shot);
  game.frozen = true;
}
requestAnimationFrame(loop);

// Play-test hooks: reachability of every loot piece and the exit,
// plus the live state, so an automated check can prove the level.
window.__heist = {
  game,
  reachable() {
    const seen = reachableTiles(game.grid, game.level.player.x, game.level.player.y);
    const at = (tx, ty) => seen[ty * 32 + tx] === 1;
    return {
      exit: at(game.level.exit.x, game.level.exit.y),
      loot: game.level.loot.map((l) => ({ kind: l.kind, x: l.x, y: l.y, ok: at(l.x, l.y) })),
    };
  },
  state() {
    return {
      screen: game.screen,
      level: game.level.id,
      alarm: Math.round(game.alarm),
      loot: game.loot.effectiveValue(),
      player: { x: Math.round(game.player.x), y: Math.round(game.player.y) },
    };
  },
};
