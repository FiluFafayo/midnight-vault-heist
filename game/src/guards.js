// Guard and camera AI for Midnight Vault Heist.
// A guard patrols its route ping-pong style, pauses at each end, and
// looks where it walks. When it spots the thief it turns suspicious and
// walks to the last seen point; while the alarm is high it chases.
// A camera sweeps its arc on a fixed mount and never moves.
import {
  TILE,
  GUARD_PATROL_SPEED,
  GUARD_CHASE_SPEED,
  GUARD_FOV,
  GUARD_RANGE,
  CAMERA_FOV,
  CAMERA_RANGE,
  CHASE_ALARM,
  clamp,
} from './config.js';
import { inVisionCone, tileCenter, circleHitsSolid } from './vision.js';

export const GUARD_STATE = { PATROL: 'patrol', SUSPICIOUS: 'suspicious', CHASE: 'chase' };

export class Guard {
  constructor(def) {
    this.path = def.path.map((p) => ({ x: tileCenter(p.x), y: tileCenter(p.y) }));
    this.pause = def.pause || 1;
    this.x = this.path[0].x;
    this.y = this.path[0].y;
    this.angle = 0;
    this.targetIndex = 1;
    this.direction = 1;
    this.wait = 0;
    this.state = GUARD_STATE.PATROL;
    this.lastSeen = null;
    this.lastSeenAge = 0;
    this.investigateUntil = 0;
    this.lookTimer = 0;
    this.lookAngle = 0;
  }

  // Move toward a point, sliding along walls. Returns true on arrival.
  stepToward(grid, tx, ty, speed, dt) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) return true;
    const nx = this.x + (dx / d) * speed * dt;
    const ny = this.y + (dy / d) * speed * dt;
    if (!circleHitsSolid(grid, nx, this.y, 13)) this.x = nx;
    if (!circleHitsSolid(grid, this.x, ny, 13)) this.y = ny;
    this.angle = Math.atan2(dy, dx);
    return d < speed * dt + 2;
  }

  update(dt, ctx) {
    const { grid, player, alarm, time } = ctx;
    const sight = inVisionCone(grid, this, GUARD_RANGE, GUARD_FOV / 2, player.x, player.y);
    if (sight.seen && !ctx.smokeActive) {
      this.lastSeen = { x: player.x, y: player.y };
      this.lastSeenAge = 0;
      if (alarm >= CHASE_ALARM) this.state = GUARD_STATE.CHASE;
      else this.state = GUARD_STATE.SUSPICIOUS;
    } else {
      this.lastSeenAge += dt;
      if (this.state !== GUARD_STATE.PATROL && this.lastSeenAge > 3.5) {
        this.state = GUARD_STATE.PATROL;
        this.lastSeen = null;
      }
    }

    if (this.state === GUARD_STATE.CHASE && this.lastSeen) {
      this.stepToward(grid, this.lastSeen.x, this.lastSeen.y, GUARD_CHASE_SPEED, dt);
      if (Math.hypot(this.lastSeen.x - this.x, this.lastSeen.y - this.y) < 26) {
        this.state = GUARD_STATE.SUSPICIOUS;
      }
    } else if (this.state === GUARD_STATE.SUSPICIOUS && this.lastSeen) {
      const arrived = this.stepToward(grid, this.lastSeen.x, this.lastSeen.y, GUARD_PATROL_SPEED * 1.4, dt);
      if (arrived) {
        // Look around the spot, then give up and resume the route.
        this.lookTimer += dt;
        this.angle = this.lookAngle + Math.sin(this.lookTimer * 2.2) * 1.4;
        if (this.lookTimer > 2.5) {
          this.lookTimer = 0;
          this.lookAngle = this.angle;
          this.state = GUARD_STATE.PATROL;
          this.lastSeen = null;
        }
      }
    } else {
      // Patrol: walk the route, ping-pong, pausing at each end.
      if (this.wait > 0) {
        this.wait -= dt;
        this.angle += Math.sin(time * 0.8 + this.x) * 0.15 * dt;
      } else {
        const target = this.path[this.targetIndex];
        const arrived = this.stepToward(grid, target.x, target.y, GUARD_PATROL_SPEED, dt);
        if (arrived) {
          this.wait = this.pause;
          this.targetIndex += this.direction;
          if (this.targetIndex >= this.path.length || this.targetIndex < 0) {
            this.direction *= -1;
            this.targetIndex += this.direction * 2;
          }
        }
      }
    }

    // A thrown coin pulls a patrolling guard over to look.
    if (ctx.coin && this.state === GUARD_STATE.PATROL) {
      const d = Math.hypot(ctx.coin.x - this.x, ctx.coin.y - this.y);
      if (d < 300) {
        this.state = GUARD_STATE.SUSPICIOUS;
        this.lastSeen = { x: ctx.coin.x, y: ctx.coin.y };
        this.lookAngle = this.angle;
      }
    }
    return sight;
  }
}

export class Camera {
  constructor(def) {
    this.x = tileCenter(def.x);
    this.y = tileCenter(def.y);
    this.baseAngle = def.baseAngle;
    this.sweep = def.sweep;
    this.speed = def.speed;
    this.angle = def.baseAngle;
    this.disabledUntil = 0;
    this.phase = Math.random() * 6;
  }

  update(dt, ctx) {
    if (ctx.time < this.disabledUntil) return { seen: false, d: 0 };
    this.angle = this.baseAngle + Math.sin(ctx.time * this.speed + this.phase) * this.sweep;
    const sight = inVisionCone(ctx.grid, this, CAMERA_RANGE, CAMERA_FOV / 2, ctx.player.x, ctx.player.y);
    return sight;
  }
}

export function conePolygon(x, y, angle, halfAngle, range, grid) {
  // A fan of rays, each clipped at the first wall it hits, so the drawn
  // cone hugs the room instead of painting through walls.
  const steps = 26;
  const pts = [{ x, y }];
  for (let i = 0; i <= steps; i++) {
    const a = angle - halfAngle + (2 * halfAngle * i) / steps;
    let r = range;
    const step = TILE / 3;
    for (let d = step; d <= range; d += step) {
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d;
      const tx = Math.floor(px / TILE);
      const ty = Math.floor(py / TILE);
      if (tx < 0 || ty < 0 || tx >= 32 || ty >= 20 || grid.blocksSight[ty * 32 + tx] === 1) {
        r = d - step;
        break;
      }
    }
    pts.push({ x: x + Math.cos(a) * Math.max(r, 8), y: y + Math.sin(a) * Math.max(r, 8) });
  }
  return pts;
}

export { clamp };
