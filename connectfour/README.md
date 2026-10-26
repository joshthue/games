# Connect Four

Drop discs and line up four — across, down, or diagonal — before the bot. You're red.

Single-file PWA. Pure engine (`window.C4`, no DOM) + separate UI, sharing `gn-header.js`,
`gn-setup.js`, `sfx.js`.

## Engine
- Board `Int8Array(42)`, `index = row*7 + col`, row 0 = bottom.
- `winner(b)` / `winningLine(b)` scan all four directions.
- `evaluate(b,p)` scores every length-4 window (open 2s/3s, blocks the opponent's) plus a
  centre-column bonus.
- `bestMove(b,p,depth)` is alpha-beta negamax with centre-first move ordering;
  `chooseMove` picks the depth by difficulty — Easy depth 2 (plus randomness), Normal 5,
  Hard 7.

## Bots & teaching
Easy / Normal / Hard. Teaching mode calls out when you can win immediately and warns when
the bot threatens a win you must block. Undo steps back to your last decision.

## Testing
`scratchpad/c4-test.js` — win detection in every direction, the bot takes an immediate
win, blocks an immediate threat, and **wins 120/120 against a random mover** at depth 5.
`scratchpad/c4-pw.js` — Playwright plays a full game to a result through the real UI in
four viewports, no overflow, no console errors.

## Test door
`window.__C4` exposes `B`, `st`, `drop(col)`, `start()`.
