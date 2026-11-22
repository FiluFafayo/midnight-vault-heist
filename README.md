[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/FiluFafayo/midnight-vault-heist/rank.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/FiluFafayo/midnight-vault-heist/reward.svg)](https://make.fun/c/best-heist-game-20261122-0559)

# Midnight Vault Heist

An original top-down stealth heist game, built for the
[make.fun best heist game bounty](https://make.fun/c/best-heist-game-20261122-0559).

One thief, three jobs, no witnesses. Slip through the Meridian Gallery,
crack the bank vault, and lift the Aurelia diamond from the penthouse —
reading patrol routes and vision cones before every move, and getting
out through the teal exit before the alarm hits 100.

## The jobs

- **Mission 1 — The Gallery.** Lift $2,000 of art. Two guards, one camera.
- **Mission 2 — The Bank Vault.** Crack the $3,000 vault behind a locked door, take $4,000 in total. Three guards, two cameras.
- **Mission 3 — The Penthouse.** The Aurelia diamond, $2,500. Take $6,000 and walk out. Four guards, three cameras.

## How to play

Open `game/index.html` in a desktop browser (or serve the repo with
`node serve.ts`). No build step, no network request: every scene is
drawn with canvas primitives, and every sound is a Web Audio synth.

- **WASD / arrows** — move
- **Shift** — sneak (slower, harder to spot)
- **E** — crack a vault or safe, pick a locked door ($100)
- **1** — smoke bomb ($150): breaks every line of sight for 4s
- **2** — EMP pulse ($200): blinds the cameras for 8s
- **Click** — toss a coin: nearby guards walk over to investigate
- **P** — pause, **M** — mute, **R** — retry a busted mission

Guards patrol, pause, get suspicious when they glimpse you, and chase
when the alarm climbs past 55. Cameras sweep their arcs. Shadow zones
and sneaking halve how fast you are spotted; breaking line of sight
always cools the alarm back down. Fill the loot target and the exit
opens — reach it for a clean getaway and a speed bonus.

## Layout

- `game/` — the static game: `index.html` plus one module per job
  (`src/levels.js`, `src/guards.js`, `src/vision.js`, `src/loot.js`,
  `src/render.js`, `src/input.js`, `src/audio.js`, `src/shots.js`,
  `src/config.js`, `src/main.js`)
- `screenshots/` — four renders of the game itself
- `main.ts` — the make.fun hand-in program
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
