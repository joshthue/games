# Golf Tees

The triangle peg puzzle from the restaurant table, with golf tees: 15 holes in rows of 1-2-3-4-5,
14 tees. Pull one to start, then jump tees over each other in straight lines; the jumped tee comes out.
Leave as few standing as you can. Ratings are our own words, not anybody's placemat.

## Playing
- **Start**: tap any tee to pull it out (every starting hole can be finished with one tee; the
  solver proves it at load).
- **Jump**: tap a tee (it lifts, gold ring), then a glowing hole; or drag the tee there. Tees that can
  jump breathe gold; a tee that can't shakes.
- **Undo** takes back as many jumps as you like; **Hint** lights a jump that keeps your best finish
  alive. The strip shows tees left, the **best you can still do** (Menu can hide it), and one-tee wins.
- No jumps left: the rating (One tee. Genius / Two left. Pretty sharp / Three left. Not bad / …),
  games, one-tee wins and best, with **Same start again** or **Pull a different tee**.

## Flare (Oct 10)
- The jumping tee arcs up and over, growing as it rises with its shadow stretching and a spin, then
  lands with a squash and a dust ring.
- The jumped tee is knocked up spinning with a burst of sparks in its colour and an "out!", and flies
  into the **pulled** tray under the board (each tee keeps its colour all game, through undo too).
- The same tee jumping again calls **Double jump!**, **Triple jump!** …
- One tee left: confetti, gold sparks and a gold glow on the last tee.
- Reduced Motion turns the animation off; moves land instantly.

## How it's built
- **Engine** `window.TEES`, no DOM: a board is a 15-bit number. `JUMPS` (36 = 18 lines of three, both
  ways), `moves`, `apply`, `best(b)` = the fewest tees you can still finish with (memoised over all
  2^15 boards, ~25 ms the first time), `hint(b)` = a move that keeps `best`.
- **Screen**: a wooden CSS triangle, holes and tees as positioned elements sized from the space left
  (`fit()`), animation with the Web Animations API. One screen, no scroll (checked with real iPhone
  notch/home-bar insets, 320 to 430 wide). Stats in `tees_stats`.

## Tested
`node tees/rules.test.js`: 36 jumps each with its reverse, opening moves, a jump moves one tee and
removes one, every start solvable to one, the hint line from every start ends with one tee. Browser:
solved to one tee through the UI (taps and a drag) at 320×568, 375×667, 390×844, 430×932 with real
insets; undo keeps colours; no scroll; no errors.
