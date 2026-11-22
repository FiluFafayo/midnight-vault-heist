// Loot, tools and objectives for Midnight Vault Heist.
// Loot is picked up by walking over it; the vault and the diamond safe
// take a 2-second crack while the thief holds E nearby. Tools cost
// loot: smoke breaks sight, EMP blinds cameras, a coin toss pulls a
// guard off its route. The exit opens once the level's target is met.
import { TILE, TOOLS, clamp } from './config.js';
import { tileCenter } from './vision.js';

export class LootPile {
  constructor(defs) {
    this.spent = 0; // loot spent on tools and lockpicks
    this.items = defs.map((d) => ({
      kind: d.kind,
      x: tileCenter(d.x),
      y: tileCenter(d.y),
      value: d.value,
      taken: false,
      crack: 0,
      crackNeeded: d.kind === 'vault' || d.kind === 'diamond' ? 2 : 0,
    }));
  }

  totalValue() {
    return this.items.reduce((s, it) => s + it.value, 0);
  }

  takenValue() {
    return this.items.filter((it) => it.taken).reduce((s, it) => s + it.value, 0);
  }

  // What the thief actually keeps after paying for tools.
  effectiveValue() {
    return Math.max(0, this.takenValue() - this.spent);
  }

  // Returns the value of anything picked up this tick.
  update(dt, player, holdingCrack, onPickup) {
    let gained = 0;
    for (const it of this.items) {
      if (it.taken) continue;
      const d = Math.hypot(player.x - it.x, player.y - it.y);
      if (it.crackNeeded > 0) {
        if (d < TILE * 1.1 && holdingCrack) {
          it.crack += dt;
          if (it.crack >= it.crackNeeded) {
            it.taken = true;
            gained += it.value;
            onPickup(it);
          }
        } else {
          it.crack = Math.max(0, it.crack - dt * 2);
        }
      } else if (d < TILE * 0.75) {
        it.taken = true;
        gained += it.value;
        onPickup(it);
      }
    }
    return gained;
  }
}

export class ToolBelt {
  constructor() {
    this.smoke = 2;
    this.emp = 2;
    this.coins = 3;
    this.smokeUntil = 0;
    this.empUntil = 0;
    this.coin = null; // {x, y, until} — the last thrown coin
  }

  canAfford(tool, loot) {
    if (tool === 'smoke') return this.smoke > 0 && loot >= TOOLS.smoke.cost;
    if (tool === 'emp') return this.emp > 0 && loot >= TOOLS.emp.cost;
    if (tool === 'coin') return this.coins > 0;
    return false;
  }

  // Spends the tool and returns the loot cost (0 for coins).
  use(tool, now, loot) {
    if (tool === 'smoke' && this.canAfford('smoke', loot)) {
      this.smoke -= 1;
      this.smokeUntil = now + 4;
      return TOOLS.smoke.cost;
    }
    if (tool === 'emp' && this.canAfford('emp', loot)) {
      this.emp -= 1;
      this.empUntil = now + 8;
      return TOOLS.emp.cost;
    }
    return 0;
  }

  throwCoin(x, y, now) {
    if (this.coins <= 0) return false;
    this.coins -= 1;
    this.coin = { x, y, until: now + 4 };
    return true;
  }

  update(now) {
    if (this.coin && now > this.coin.until) this.coin = null;
  }
}

export function nearExit(player, exitTile) {
  const ex = tileCenter(exitTile.x);
  const ey = tileCenter(exitTile.y);
  return Math.hypot(player.x - ex, player.y - ey) < TILE * 0.9;
}

export { clamp };
