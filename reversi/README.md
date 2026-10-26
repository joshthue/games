# Reversi (Othello)

Flank the bot's discs to flip them to your colour; most discs when the board fills wins.
Dark moves first. You choose dark or light.

Single-file PWA. Pure engine (`window.OTH`, no DOM) + separate UI, sharing `gn-header.js`,
`gn-setup.js`, `sfx.js`.

## Engine
- Board `Int8Array(64)`, 1 = dark, 2 = light. `legalMoves`, `applyMove` (flips every
  flanked line), `gameOver`/`winner`, pass handling.
- `evaluate(b,p)` = positional weight matrix (corners prized, the squares next to an empty
  corner penalised) + mobility difference.
- `bestMove` is alpha-beta with corner-first ordering. **Exact endgame solver**: once ≤10
  squares remain it searches to the end and maximises the final disc count (worst
  measured ~0.2s; the 11–12-empty exact search was far too slow for a phone, so the
  threshold is 10). Difficulty: Easy depth 2, Normal 4, Hard 6.

## Bots & teaching
Easy / Normal / Hard. Legal-move dots (toggleable), a Hint that stars the engine's pick,
and teaching notes that push you toward corners and warn about handing one away.

## Testing
`scratchpad/oth-test.js` — start position, opening moves, flipping, illegal rejection,
terminal/winner, a corner grab, and the bot **beating a random mover 40/40** with zero
illegal moves. `scratchpad/oth-pw.js` — Playwright plays a full game to a result through
the real UI in four viewports (incl. the exact endgame), no overflow, no console errors.

## Test door
`window.__OTH` exposes `B`, `st` (with `youColor`), `place(idx)`, `start()`.
