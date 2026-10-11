# Chinese Checkers

The 121-hole star, 10 marbles each. You (blue, the bottom point) against 1, 2, 3 or 5 bots, Easy or
Normal. First to fill the point across the star wins.

## Rules
- A move is a **step** to a neighbouring empty hole, or a **chain of hops**: over one neighbouring
  marble (anybody's) into the empty hole straight beyond, as many times as you like with the same
  marble. Not both in one move. Nothing is captured.
- **Win**: your target point is full and at least one marble in it is yours, so a marble somebody
  leaves parked in your target can't block you forever.
- Seats: 2 players top and bottom; 3 on alternate points; 4 as two facing pairs; 6 everywhere.

## On the phone
- Tap one of your marbles (the ones that can move breathe gold): every hole it can reach lights
  green; **gold** rings are chains of 3+ hops. Tap one, or drag the marble there.
- Your target point is outlined in dashed blue.
- The marble steps or hops along its real path, arcing up for each hop with a stretching shadow and
  landing with a puff; chains of 3+ call **"5 hops!"**. The bots' last move leaves a trail of dots
  (Menu can turn it off) and the moved marble keeps a white ring.
- **Hint** lights the move the Normal bot would make. **Undo** takes back your last move and the
  bots' replies (30 deep). The game saves after every move (`cc_game`) and resumes on reopen.
- One screen, no scroll, sized from the space left (checked with real iPhone notch/home-bar insets
  at 320, 390 and 430 wide, 2 to 6 players). With 4+ players on a phone the strip shows colours only.

## How it's built
- **Engine** `window.CC`, no DOM: cube coordinates; the star is every hole whose coordinates are all
  <= 4 or all >= -4 (two big triangles), 121 holes; points are where a coordinate passes ±4.
  `reach()` = steps plus a breadth-first search of hop chains (the moving marble's own hole counts
  as empty mid-chain), `apply`, `won`.
- **Bot**: every marble costs its distance to the tip of its target; inside the target, deeper
  costs less. A move is worth what it saves, plus a pull to bring up stragglers; Normal adds half
  of its best follow-up move and never just undoes its last move. Easy picks among its top three
  with noise. Normal beat Easy 100 of 100 one-on-one; a bot turn takes about 1 ms.

## Tested
`node chinesecheckers/rules.test.js`: board shape, seats, steps, hops, chains, no double jumps, no
landing back home mid-chain, the parked-marble win rule, and 64 bot-only games (2/3/4/6 players,
both levels) that all finish with every move legal. Browser: full games through the UI with taps,
a drag, undo and a reload-resume, no scroll, no errors.
