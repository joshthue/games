# Checkers (English draughts)

Move up the diagonals, jump the bot, crown kings, clear the board. You're the cream pieces
at the bottom.

Single-file PWA. Pure engine (`window.CHK`, no DOM) + separate UI, sharing `gn-header.js`,
`gn-setup.js`, `sfx.js`.

## Rules implemented
- Men move/capture diagonally **forward** one square; kings any diagonal (non-flying —
  one square, English style).
- **Captures are mandatory**, and a multi-jump must be played to the end — the engine
  enumerates whole capture chains as single moves.
- Reaching the far row **crowns** a man and ends the move (standard English rule).
- Win by taking all the opponent's pieces or leaving them no legal move.
- **Draw** when 60 plies pass with no capture and no man advancing (a kings' stand-off),
  so a drawn endgame can't shuffle forever.

## UI
Step-through jumps: tap a piece, then tap each landing square; a forced chain keeps the
piece selected until it's finished ("Keep jumping!"). Capturing pieces are ringed, legal
landings dotted (red for a jump), and forced captures are spelled out.

## Engine / bot
`completeMoves`, `applyMove`, `winner`, `evaluate` (material with kings at 175, plus man
advancement, centre and back-row bonuses). `bestMove` is alpha-beta negamax with
capture-first ordering; difficulty Easy depth 3, Normal 6, Hard 9.

## Testing
`scratchpad/chk-test.js` — opening move count, forced capture, multi-jump chains,
promotion-ends-move, king directions incl. **capturing backward**, winner detection, and
the bot **beating a random mover 30/30** at depth 5 with only legal moves.
`scratchpad/chk-pw.js` — Playwright plays full games to a result (wins and the draw rule)
through the real step-through UI in four viewports, no overflow, no console errors.

## Test door
`window.__CHK` exposes `B`, `st`, `moves()`, `tap(idx)`, `start()`.
