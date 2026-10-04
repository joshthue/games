# YachtRock

Solo dice for a high score, after the public-domain game **Yacht** (the "Yahtzee" name is a
Hasbro trademark and is not used anywhere). Thirteen turns, up to three rolls each, thirteen boxes.

First game built to the **Game Night standard header**: one row of text pills
(`‹ Games` · game buttons · Rules · Menu) and the game name on its own line in gold Georgia,
never wrapping — `fitName()` shrinks the type instead. No emoji or suit glyphs in the header.

## Rules as built
- Upper: Aces–Sixes score that number's total; 63+ earns **+35**. The bonus row shows a
  "pace" against three-of-each for the boxes filled so far.
- Lower: 3/4 of a kind (sum), full house 25, small straight 30, large straight 40, Yacht 50, Chance (sum).
- **+100** for every Yacht after a 50 in the Yacht box.
- **Forced joker**: any Yacht after the Yacht box is filled (50 or 0) must go in its own upper box
  if open; else any open lower box with FH/straights scoring in full; else an upper box for 0.
- Tap a box to highlight it, tap again (or press Score) to commit — one stray tap can't burn a box.

## Code
- **Block 1 `window.YR`** is the pure engine (no DOM): `raw(cat,dice)`, `options(sheet,dice)`
  (legal boxes + scores, joker applied), `totals(sheet,yachtBonuses)`.
- **Block 2** is the UI. Dice are CSS 3D cubes (six faces, `preserve-3d`); a roll adds one or two
  full turns on each axis on top of the target face's orientation, so every roll tumbles forward,
  plus a hop keyframe, staggered 70ms per die. Held dice sit lower with a gold ring and don't roll.
  `prefers-reduced-motion` drops both.
- **Initials for the top ten**: a finished game that makes the top ten asks for up to three
  letters/digits, arcade style, prefilled with the last initials used (so closing the sheet keeps
  them). Entries are `{s, d, i}`; older entries without `i` show `---`.
- localStorage: `yr_game_v1` (game in progress, resumes after the app closes), `yr_stats_v1`
  (best, played, average, top ten with initials), `yr_opts_v1` (box previews, last initials).
- Test door: `window.__YR` (`G`, `roll`, `pick`, `commit`, `toggleHold`, `set(dice)`).
- Build stamp: `BUILD_V` const, date from `document.lastModified`.
