# Gin Rummy

Two-handed, you vs the bot. Draw and discard to build melds (sets and runs); get your
leftover deadwood to 10 or less and knock, or clear it for gin. First to 100.

Single-file PWA. Pure engine (`window.GIN`, no DOM) + separate UI, sharing `gn-header`,
`gn-setup`, `sfx`.

## Engine
- `bestMelds(hand)` — the minimum-deadwood partition via a set-packing solver over all
  candidate melds (so four of a kind that would be better split into 3-of-a-kind + a run is
  resolved correctly). Returns melds, deadwood, and the leftover cards.
- `layoff(knockerMelds, defenderDead)` — extends the knocker's melds with the defender's
  dead cards to compute the reduced deadwood.
- `knock()` resolves gin (+25, no lay-offs), a normal knock (difference), or an **undercut**
  (defender ties or beats → +25 plus the difference).
- Bot: draws the discard only when it lowers deadwood; discards to the minimum; knocks at
  ≤10.

## UI
Melded cards wear a gold bar; a live deadwood readout shows what you'd knock with; the Knock
button lights (and reads "Gin!") only when a discard gets you to ≤10 (0). **Sort** cycles the
hand through three orderings — by suit (spot runs), by rank (spot sets), and melds-first
(your melds grouped, then deadwood). The card you just **drew lifts up** so you can spot it in
your sorted hand — teal ring for a stock draw, red for the upcard you took off the discard.
When you draw that upcard you **can't discard it the same turn** (the standard Gin rule): it
shows raised in red, taps on it are refused, and the knock/deadwood readouts exclude it. The
menu has a **four-color deck** (clubs green, diamonds blue) to tell the suits apart at a glance,
plus **Card size** and **Card text** (S/M/L/XL, the shared `cardsize.js` control used across the
card games) that scale the cards and the printed rank/pip — the hand re-fans to fit, so it never overflows.

## Testing
`scratchpad/gin-test.js` — meld detection, min-deadwood on known hands, gin, lay-off,
undercut scoring, + a 120-game bot soak all reaching 100 with a winner.
`scratchpad/gin-pw.js` — Playwright full game to a winner across four viewports, no
overflow, no console errors.

## Test door
`window.__GIN` exposes `G`, `H`, `drawStock()`, `drawDiscard()`, `discard(c)`, `knock(c)`,
`start()`.
