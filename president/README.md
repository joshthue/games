# President (Scum)

Climbing/shedding for four (you vs 3 bots). Lead any number of same-rank cards; each player
beats it with the same count at a higher rank (3 low … A … **2 highest**), or passes. When
everyone else passes, the last to play clears the pile and leads. First out is President,
last is Scum — and next round the Scum hands the President their best cards (the President
returns their worst; VP and Vice-Scum swap one). President 3 / VP 2 / Vice-Scum 1 / Scum 0;
first to the target wins.

Single-file PWA. Pure engine (`window.PREZ`, no DOM) + separate UI on the four-seat table,
sharing `gn-header`, `gn-setup`, `cardsize`, `sfx`.

## Engine
`ord()` puts the 2 above the ace. `legalPlays` gives the legal combos (fresh lead: any
count; following: match the count, beat the rank). `play`/`pass` with `settleAfter` handle
the trick: a pass takes you out until the pile clears, and the pile clears when the turn
returns to its owner (or no one else can act). `score`/`assignRoles` and `autoPass`
(the between-round card exchange) complete the round loop. Bots lead low, hold 2s and aces,
play the cheapest beat, and pass to conserve when the pile is low and their hand is big.

## UI
Tap same-rank cards to select; Play (must match the pile's count and beat it) or Pass. Role
badges, finish-order numbers, a pile readout, and a round-start summary of the card
exchange.

**Teaching mode** (toggle in setup or the menu) shows a coach line on every turn of yours —
not just the opening lead. On a lead it names the lowest cards to shed and which 2s/aces to
hold; facing a pile it names the exact lowest winning play, or says to pass when nothing beats
it (or when your only beat is a 2 — the top card — worth saving). The line is driven off the
engine's own `legalPlays`, so it never suggests an illegal play. (It renders only on your turn;
the coach is cleared while the bots act, where the status line already narrates.)

## Testing
`scratchpad/prez-test.js` — rank order, legal follows, pass/clear, finishing order + roles,
card passing, + a 120-game/535-round bot soak with exactly four finishers every round.
`scratchpad/prez-pw.js` — Playwright full game to a winner across four viewports, no
overflow, no console errors.

## Test door
`window.__PZ` exposes `G`, `H`, `play(cards)`, `pass()`, `legal()`, `start()`.
