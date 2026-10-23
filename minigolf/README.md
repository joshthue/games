# Putting Green

A single championship putting green — **Birch Hollow** — with **nine pins cut** across it,
one `index.html`. Top-down, putt-only, drag-back control. Folder is `minigolf/`; the game is
titled **Putting Green**. Live at <https://joshthue.github.io/games/minigolf/>.

> Reconceived mid-build (Oct 22) from an obstacle mini-golf course into one realistic green
> with rotating pins — Josh's call, and the better idea. The physics engine and the grain work
> carried straight over.

## How it plays
- One big irregular green with **nine flags**. Tap a flag (or its number in the strip) to pick
  the pin you're putting to; the selected pin is gold with a ring around its cup.
- **Pull back from the ball** to aim and set pace (slingshot) — further back is harder — then
  release. A dotted line previews the start direction and a ring shows power.
- Read the green: **contours** (shaded tiers/hills) push the ball and make putts **break**;
  **grain** (the fine streaks) runs the ball out downgrain, dies it short into the grain, and
  bends the line across it. Run off the putting surface into the **fringe** and the ball dies.
- Hole all nine; your score is total putts (a 2-putt average is solid). **Cut new pins**
  re-cuts all nine for a fresh set of reads; **Replay pin** re-drops the current one.

## The physics (the whole game)
`window.MINIGOLF`, pure, no DOM:
- **Constant-deceleration** rolling (a real ball rolls out and stops; not exponential decay),
  so power maps to distance in a controllable, roughly quadratic way (a max putt crosses the
  green; gentle putts are precise).
- **Walls** (here just the green's bounding box) use swept circle-vs-segment collision with
  sub-stepping, so a hard putt **never tunnels** through at any power.
- **Slopes** add a constant acceleration vector (the hills/tiers).
- **Grain** resolves the grass direction into along-travel (eases/stiffens the roll) and cross
  (bends the line). Downgrain rolls ~3× an upgrain putt of the same pace; cross-grain breaks it
  several units. This is the "pro green" feel.
- **Off the green** (point-in-polygon test against the green outline) the deceleration triples
  — the fringe/rough bites and grain stops mattering.
- **Cup capture** is speed-gated: a ball crossing the cup slowly drops; a rocket lips out.

`window.MGGREEN` is the green as data: the green outline polygon, the slope/contour regions,
the grain patches (an overall lean plus patches combed differently), and a pool of candidate
pin positions (cup + a putting spot each). `cutPins(seed)` shuffles the pool and takes nine.

## How it's built
Three script blocks in the one file, per the house standard: the engine (`window.MINIGOLF`),
the green data (`window.MGGREEN`), and the UI — a canvas renderer (green surface clipped to the
outline, mow stripes, contour shading, grain streaks, nine flags with the selected one gold,
the ball, drag-back aim) plus the drag-back input, pin selection, scorecard and resume. Shared
`../gn-header.js`, `../gn-setup.js`, `../sfx.js`; felt-and-gold theme; build stamp.

`window.__MG` is the test door: `select(i)`, `putt(vx,vy)`, `puttToward(x,y,power)`, `recut()`.

## Testing
Engine and green are proven in node by extracting their `<script>` blocks from this file and
`eval`-ing them:
- **physics** (`mg-engine-test`): friction always stops the ball in bounds; containment firing
  max power in 16 directions; correct reflection; **no tunneling** through a thin wall at any
  power; slopes curve a straight putt; **grain** — downgrain rolls further than upgrain, cross
  bends the line; cup catches a judged putt and lips out a rocket; energy only rises at bounces.
- **green** (`mg-green-test`): every candidate pin's cup and putting spot sit on the green;
  every pin is holeable by a search putter despite slope + grain + rough edges; `cutPins` is
  deterministic by seed and returns nine distinct pins.

A Playwright pass checks every viewport (390×844, 320×568, 430×932, 834×1112) for no horizontal
overflow and no console/page errors, then plays a full nine-pin round through the UI via the
test door, holing every pin.

## Possible next steps (not built)
Daily pins from a date seed + a shared leaderboard (ntfy, like Poker Squares); a "stimp"
(green-speed) setting; multiple greens on a daily rotation; a gentle break-arrow read as a
teaching aid. All deferred — v1 is one green, nine pins, cut-on-demand practice.
