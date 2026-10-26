# Farkle

Push-your-luck dice. Roll six, set aside the scoring ones, and decide each time whether
to risk the rest or bank. A roll with nothing scoring is a **Farkle** and wipes the
turn. First to 10,000 (or 5,000) wins; when someone gets there everyone else gets one
last turn.

Single-file PWA. Pure engine (`window.FARKLE`, no DOM) + separate UI, sharing
`gn-header.js`, `gn-setup.js`, `sfx.js`. The flat-pip die, tumble/thud roll and
hold/select states are the shared dice shell also used by Pig and Liar's Dice.

## Scoring (locked variant)
- 1 = 100, 5 = 50
- three 1s = 1000; three 2s–6s = face × 100
- four of a kind = 1000, five = 2000, six = 3000 (flat, any face)
- straight 1-2-3-4-5-6 = 1500
- three pairs = 1500 (any six dice that pair up: 2+2+2, 4+2, 6)
- two triplets = 2500
The solver always takes the highest-scoring reading of a selection (four 1s score
1000+100, not a flat 1000).

## Engine
- `scoreSelection(dice)` → `{valid, pts}` — a set-aside is valid only if **every** die in
  it is consumed by a scoring combo (you can't park a dead 2 next to a 1).
- `scoreRoll(dice)` / `isFarkle(dice)` — best obtainable from a roll; farkle = 0.
- `bestKeep(dice)` — the max-points fully-scoring subset (bot pick and the Hint).
- `botBank(turnPts, diceLeft, myTotal, target, level)` — bank thresholds by dice left,
  always banks to win, always re-rolls hot dice.

## Bots & teaching
Easy / Normal. Bots keep the best-scoring dice each roll and bank on dice-left thresholds
(Normal pushes harder than Easy). Teaching mode glows the best keep, shows its value, and
warns as the Farkle odds climb with fewer dice.

## Testing
`scratchpad/farkle-test.js` — every combo, selection validity, farkle detection,
`bestKeep` picks, `botBank` sanity, plus a 400-game bot soak (all terminate, ~60 turns
avg, scores monotonic). `scratchpad/farkle-pw.js` — Playwright drives a full game to a
winner through the real UI in four viewports, no overflow, no console errors.

## Test door
`window.__FK` exposes `G`, `st`, and `roll()`, `bank()`, `pick(i)`, `hint()`,
`autoKeep()`, `start()`.
