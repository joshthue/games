# Mexican Train

Mexican Train dominoes on a double-twelve set (91 tiles), one `index.html`, you against
up to three bots. Live at <https://joshthue.github.io/games/dominoes/>.

## How it plays
- Each **round** opens on a **centre double** — 12-12 the first round, then 11-11, 10-10,
  and so on down. From the hub run the **trains**: one per player, plus one shared
  **Mexican train**.
- On your turn add **one** tile whose end matches the open end of a train you may use. You
  may always build on **your own** train and the **Mexican** train; you may build on another
  player's train only while it's **open** (a marker is on it).
- **Doubles must be answered.** Play a double and its matching end has to be covered before
  anyone moves on. If you can cover your own double the same turn, you must; if you can't,
  the obligation passes down the table until someone does.
- Can't play? **Draw** one. If it still won't go, your turn passes and a marker opens your
  train for everyone until you play on it yourself.
- The round ends when someone empties their hand (or everyone blocks). Everyone else counts
  the **pips still in their hand** — those are points, and **low is good**. Lowest total
  after the last round (4 / 7 / 13) wins.

## Teaching mode
A toggle on the start screen and in Menu. With it on:
- trains you're allowed to play on are outlined in **green**; a **red** outline marks a
  double that's waiting to be covered;
- the dimmed tiles in your hand are the ones that don't fit any open end;
- **Hint** lifts the tile to play and the green coach line says *why* (shed your heaviest,
  cover a double you can answer, use the Mexican train when your own is stuck);
- the round recap explains the scoring and the strategy.

## How it's built
Two script blocks in the one file, per the house standard:
1. **`window.DOMS`** — the pure engine. The 91-tile set, deal, `legalMoves`, `play`, the
   double-obligation chain, markers, drawing, blocking, `score`, win detection, and the bot.
   **No DOM.**
2. **The UI** — the only block that touches the page. The hub, a scroll row per train, the
   hand, teaching coach, resume-from-`localStorage`. Asks `window.DOMS` for every rule.

Tiles render as pip faces for 0–9 and clean numerals for 10–12 (legible on a phone). Red
sixes are an optional toggle. Shared pieces: `../gn-header.js`, `../gn-setup.js`,
`../cardsize.js` (drives tile size via the shared control), `../sfx.js`. Felt-and-gold
theme and the build stamp at the bottom.

`window.__DOMS` is the test door: `play(tile, train)`, `drawPass()`, and getters for the
game and current hand.

## Testing
The engine is proven in node by extracting its `<script>` block from this file and
`eval`-ing it (never a second copy):
- set integrity (91 tiles, 13 doubles, unique ids) and deal conservation;
- legal-move restriction, one-tile-per-turn, and the full **double chain** (lay → must cover
  same turn if able → else the obligation passes to the next player, whose only legal moves
  are covering tiles);
- markers opening a train on a pass, drawing, and block detection;
- scoring the losers' pips;
- a soak of 120 games / 480 rounds, each asserted to terminate and to conserve all 91 tiles
  (hands + trains + boneyard + centre).

A Playwright pass checks every viewport (390×844, 320×568, 430×932, 834×1112) for no
horizontal overflow and no console/page errors, then plays a full game through the UI via
the test door to a winner.
