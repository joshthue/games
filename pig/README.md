# Pig

The simplest press-your-luck dice game there is. Roll one die over and over, adding each
roll to your turn pot — but roll a **1** and the pot is gone. Hold to bank it. First to
100 (or 50) wins.

Single-file PWA, same dice shell as Farkle and Liar's Dice (`gn-header.js`,
`gn-setup.js`, `sfx.js`). The engine (`window.PIG`) is deliberately tiny — the whole
game is one die and a decision.

## Engine
- `rollDie(rnd)` — 1–6.
- `botHold(turnPts, myScore, oppMax, target, level)` — the classic **hold-at-20**
  heuristic: hold to win when you can, chase hard when an opponent is a roll from
  winning, otherwise bank around 20 (Easy banks a touch earlier at ~16).

## Feel
Big chunky die, a turn-pot readout, a risk bar that fills the longer you push, and an
"Oink!" when a 1 ends the turn. Teaching mode nudges you toward banking around 20 and
calls out when holding would win.

## Testing
`scratchpad/pig-pw.js` — Playwright plays a full game to a winner through the real UI in
four viewports (390×844, 320×568, 430×932, 834×1112), no overflow, no console errors.

## Test door
`window.__PIG` exposes `G`, `st`, and `roll()`, `hold()`, `start()`.
