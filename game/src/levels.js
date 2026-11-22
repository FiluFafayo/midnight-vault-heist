// Level data for Midnight Vault Heist.
// Coordinates are tiles on a 32 x 20 grid. Walls, crates and tables are
// solid and block both movement and sight. Carpet is decoration, shadow
// zones halve how fast guards spot the thief. Loot, guards and cameras
// are placed by tile coordinates, not by map characters, so each room
// can be laid out and checked on its own.
export const LEVELS = [
  {
    id: 'gallery',
    name: 'Mission 1 — The Gallery',
    brief:
      'Lift $2,000 of art from the Meridian Gallery, then slip out the north door. Two guards walk the floor and one camera sweeps the hall.',
    target: 2000,
    parSeconds: 150,
    player: { x: 2, y: 17 },
    exit: { x: 29, y: 1 },
    walls: [
      { x: 8, y: 1, w: 1, h: 6 },
      { x: 8, y: 13, w: 1, h: 6 },
      { x: 23, y: 1, w: 1, h: 6 },
      { x: 23, y: 13, w: 1, h: 6 },
      { x: 1, y: 9, w: 6, h: 1 },
      { x: 25, y: 9, w: 6, h: 1 },
      { x: 14, y: 9, w: 4, h: 1 },
    ],
    crates: [
      { x: 4, y: 4 },
      { x: 5, y: 14 },
      { x: 12, y: 5 },
      { x: 19, y: 14 },
      { x: 27, y: 5 },
      { x: 27, y: 15 },
    ],
    tables: [
      { x: 11, y: 3, w: 2, h: 1 },
      { x: 18, y: 3, w: 2, h: 1 },
      { x: 11, y: 16, w: 2, h: 1 },
      { x: 18, y: 16, w: 2, h: 1 },
    ],
    carpet: [
      { x: 10, y: 1, w: 12, h: 8 },
      { x: 10, y: 11, w: 12, h: 8 },
    ],
    shadow: [
      { x: 1, y: 11, w: 6, h: 7 },
      { x: 25, y: 11, w: 6, h: 7 },
    ],
    loot: [
      { kind: 'painting', x: 2, y: 2, value: 600 },
      { kind: 'painting', x: 29, y: 3, value: 600 },
      { kind: 'painting', x: 2, y: 12, value: 600 },
      { kind: 'gold', x: 15, y: 2, value: 400 },
      { kind: 'gold', x: 15, y: 17, value: 400 },
      { kind: 'gold', x: 29, y: 12, value: 400 },
    ],
    guards: [
      {
        path: [
          { x: 3, y: 8 },
          { x: 13, y: 8 },
        ],
        pause: 1.2,
      },
      {
        path: [
          { x: 18, y: 8 },
          { x: 28, y: 8 },
        ],
        pause: 1.2,
      },
    ],
    cameras: [{ x: 15, y: 8, baseAngle: Math.PI / 2, sweep: 1.1, speed: 0.55 }],
  },
  {
    id: 'bank',
    name: 'Mission 2 — The Bank Vault',
    brief:
      'The vault holds $3,000 behind a locked door. Crack it, grab $4,000 in total, and get out. Three guards, two cameras, and teller counters that funnel every route.',
    target: 4000,
    parSeconds: 210,
    player: { x: 2, y: 17 },
    exit: { x: 15, y: 1 },
    lockedDoors: [{ x: 19, y: 5, w: 1, h: 2 }],
    walls: [
      { x: 8, y: 1, w: 1, h: 7 },
      { x: 8, y: 12, w: 1, h: 7 },
      { x: 19, y: 1, w: 1, h: 4 },
      { x: 19, y: 7, w: 1, h: 2 },
      { x: 21, y: 1, w: 10, h: 1 },
      { x: 20, y: 8, w: 11, h: 1 },
      { x: 30, y: 2, w: 1, h: 6 },
      { x: 13, y: 10, w: 5, h: 1 },
      { x: 24, y: 10, w: 7, h: 1 },
    ],
    crates: [
      { x: 4, y: 4 },
      { x: 5, y: 14 },
      { x: 12, y: 5 },
      { x: 15, y: 15 },
      { x: 27, y: 14 },
    ],
    tables: [
      { x: 10, y: 3, w: 3, h: 1 },
      { x: 10, y: 6, w: 3, h: 1 },
      { x: 10, y: 13, w: 3, h: 1 },
      { x: 10, y: 16, w: 3, h: 1 },
      { x: 24, y: 13, w: 3, h: 1 },
      { x: 24, y: 16, w: 3, h: 1 },
    ],
    carpet: [{ x: 21, y: 2, w: 9, h: 6 }],
    shadow: [
      { x: 1, y: 11, w: 6, h: 7 },
      { x: 22, y: 12, w: 8, h: 6 },
    ],
    loot: [
      { kind: 'vault', x: 26, y: 4, value: 3000 },
      { kind: 'gold', x: 3, y: 3, value: 500 },
      { kind: 'gold', x: 15, y: 3, value: 500 },
      { kind: 'gold', x: 3, y: 13, value: 500 },
      { kind: 'gold', x: 15, y: 17, value: 500 },
      { kind: 'painting', x: 29, y: 17, value: 800 },
    ],
    guards: [
      {
        path: [
          { x: 3, y: 8 },
          { x: 16, y: 8 },
        ],
        pause: 1.0,
      },
      {
        path: [
          { x: 17, y: 12 },
          { x: 25, y: 12 },
        ],
        pause: 1.0,
      },
      {
        path: [
          { x: 25, y: 3 },
          { x: 28, y: 3 },
        ],
        pause: 1.6,
      },
    ],
    cameras: [
      { x: 15, y: 11, baseAngle: Math.PI / 2, sweep: 1.0, speed: 0.5 },
      { x: 25, y: 9, baseAngle: -Math.PI / 2, sweep: 1.2, speed: 0.65 },
    ],
  },
  {
    id: 'penthouse',
    name: 'Mission 3 — The Penthouse',
    brief:
      'One last job: the Aurelia diamond, $2,500, on the top floor. Four guards, three cameras, and nowhere to hide but the shadows. Take $6,000 and walk out.',
    target: 6000,
    parSeconds: 260,
    player: { x: 2, y: 17 },
    exit: { x: 29, y: 1 },
    walls: [
      { x: 10, y: 1, w: 1, h: 5 },
      { x: 10, y: 14, w: 1, h: 5 },
      { x: 21, y: 1, w: 1, h: 5 },
      { x: 21, y: 14, w: 1, h: 5 },
      { x: 1, y: 9, w: 8, h: 1 },
      { x: 23, y: 9, w: 8, h: 1 },
      { x: 14, y: 4, w: 4, h: 1 },
      { x: 14, y: 15, w: 4, h: 1 },
    ],
    crates: [
      { x: 5, y: 4 },
      { x: 13, y: 7 },
      { x: 18, y: 12 },
      { x: 26, y: 4 },
      { x: 26, y: 15 },
      { x: 5, y: 14 },
    ],
    tables: [
      { x: 12, y: 2, w: 2, h: 1 },
      { x: 18, y: 2, w: 2, h: 1 },
      { x: 12, y: 17, w: 2, h: 1 },
      { x: 18, y: 17, w: 2, h: 1 },
      { x: 15, y: 9, w: 2, h: 1 },
    ],
    carpet: [
      { x: 11, y: 1, w: 10, h: 8 },
      { x: 11, y: 11, w: 10, h: 8 },
    ],
    shadow: [
      { x: 1, y: 11, w: 8, h: 7 },
      { x: 23, y: 11, w: 8, h: 7 },
      { x: 12, y: 8, w: 8, h: 3 },
    ],
    loot: [
      { kind: 'diamond', x: 15, y: 6, value: 2500 },
      { kind: 'painting', x: 2, y: 2, value: 900 },
      { kind: 'painting', x: 29, y: 3, value: 900 },
      { kind: 'painting', x: 2, y: 12, value: 900 },
      { kind: 'gold', x: 15, y: 17, value: 600 },
      { kind: 'gold', x: 29, y: 12, value: 600 },
      { kind: 'gold', x: 5, y: 7, value: 600 },
    ],
    guards: [
      {
        path: [
          { x: 3, y: 8 },
          { x: 13, y: 8 },
        ],
        pause: 0.9,
      },
      {
        path: [
          { x: 18, y: 8 },
          { x: 28, y: 8 },
        ],
        pause: 0.9,
      },
      {
        path: [
          { x: 12, y: 6 },
          { x: 19, y: 6 },
        ],
        pause: 1.4,
      },
      {
        path: [
          { x: 7, y: 10 },
          { x: 24, y: 10 },
        ],
        pause: 0.8,
      },
    ],
    cameras: [
      { x: 16, y: 10, baseAngle: Math.PI / 2, sweep: 1.2, speed: 0.6 },
      { x: 5, y: 10, baseAngle: -Math.PI / 2, sweep: 0.9, speed: 0.5 },
      { x: 26, y: 10, baseAngle: -Math.PI / 2, sweep: 0.9, speed: 0.5 },
    ],
  },
];
