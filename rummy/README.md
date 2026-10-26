# Rummy

Table rummy for 2-4 (you vs 1-3 bots). Draw, lay melds face-up on the table, lay off onto
anyone's melds, then discard. First to empty their hand goes out and scores the pip value
left in the others' hands. First to the target wins.

Single-file PWA. Pure engine (`window.RUMMY`, no DOM) + separate UI, sharing `gn-header`,
`gn-setup`, `sfx`.

## Engine
`isSet`/`isRun`/`validMeld`/`canLayOff`, `bestMelds` (the same set-packing solver as Gin),
`layMeld`/`layOff`/`discard`, and `scoreRound`. The stock does **not** reshuffle — when it
runs out the round ends and the lowest-deadwood hand takes the stalemate, so a game always
terminates. Bots draw the discard only when it extends their melds, lay down everything they
can, lay off, and discard their highest loose card.

## UI
Tap cards to select; lay a selected set/run, or select one card and lay it off onto a
glowing table meld; discard to end your turn. A one-tap **Lay all melds** convenience lays
every meld the solver finds plus any lay-offs.

## Testing
`scratchpad/rummy-test.js` — meld/run validation, lay-off legality, lay down & go out, round
scoring, + a 150-game bot soak all reaching the target. `scratchpad/rummy-pw.js` /
`rummy-layout.js` — Playwright full game to a winner (390×844) plus layout + play across the
other three viewports, no overflow, no console errors.

## Test door
`window.__RUM` exposes `G`, `H`, `drawStock()`, `drawDiscard()`, `layAll()`, `discard(c)`,
`start()`.
