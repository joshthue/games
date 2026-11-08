# Royal Draw Rush (`royaldrawrush/`)

A real-time, Tetris/Klax-style spin-off of Royal Draw. Cards fall one at a time; you
drop each into a column; a row of five that makes a poker hand scores and clears. Share
Royal Draw's deck, four-colour faces and poker scoring, but none of its turn-based board.

## How it plays
- The well is **5 columns wide, 8 rows tall**, with an overflow line at the top.
- The **current card** sits in the HUD (left) with a draining fall-bar; the **next three**
  are shown on the right.
- **Tap a column** to drop the card in — it lands on top of that column's stack (gravity).
- Dawdle and the fall timer auto-drops the card into the **shortest** column, so a timeout
  never screws you; you lose by stacking junk, not by the clock.

## Clearing
- When a row of five fills and scores a **pair or better** it clears; the rows above fall
  down. Hand value = Royal Draw's scoring table (American or English, Menu).
- Clear **two or more rows in one drop** for a combo — the points are multiplied by the
  number of rows.
- A **junk row (high card, 0 pts) does not clear** in the default *Pair+* mode — it sits
  there eating height. Let the stack cross the overflow line (all columns full with nothing
  clearable) and it's game over. Menu → Clearing → **Any row** flips to a forgiving endless
  mode where every full row clears (junk for 0).

## Speed
- `level = 1 + floor(linesCleared / 4)`. The fall timer is `max(900, 4200 - (level-1)*230)` ms,
  so it tightens from 4.2 s down to 0.9 s.

## Scoring & records
- Best run (top score, rows cleared, level reached) is kept in `localStorage` under
  `royaldrawrush.v1`, alongside prefs (clearing rule, scoring system, sound).

## Conventions (shared with the hub)
- Standard `gn-header.js` header (Games / Scores / Rules / Menu), `sfx.js` for sound,
  `../sw.js` for offline. Portrait layout; cards sized by `fit()` to fit width and 8 rows.

## Test door
`window.RUSH` exposes `get()`, `setCurrent(card)`, `setQueue([...])`, `drop(col)`, `reset()`,
and `prefs`, for headless checks. Verified: a flush row clears for 20 (American), a high-card
row stays in Pair+ but clears in Any mode, a full house scores 25, and a stacked card falls
after the row below it clears.
