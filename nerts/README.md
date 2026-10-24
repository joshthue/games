# Nerts

Competitive solitaire (also called Nertz, Pounce or Racing Demon). Everybody plays their own deck at
the same time onto shared piles in the middle; nobody takes turns. You against 1 to 3 bots
(Bea, Cy, Dot) that play in real time at a speed you pick. Laid out from mockup B (Oct 9): your work
piles under the middle, your Nerts pile, waste and stock pinned along the bottom under your thumb;
middle cards are plain (no owner colour) - except for a moment after they land (v153).

## How it plays
- **Nerts pile**: 13 cards, top one face up. Empty it and you call Nerts; the round stops for everybody.
- **Work piles**: four, built **down** in **alternating colours**. Move a card or a run between them;
  an empty work pile takes any card.
- **Stock**: turn over three at a time onto the waste; play the waste's top card. When the stock is
  out, tap it again to turn the waste back over.
- **The middle**: shared. Any ace starts a pile; then up by suit to the king, by anybody.
- **Stuck**: if nobody moves a card for 14 s, every stock moves its top card to the bottom (the real
  rule when everyone's stuck). The line above your Nerts pile says so (v154; it used to be a pop-up over
  the board) and clears when the next card moves. After 10 of those in a row with no progress, the round ends where it is.
- **Score**: +1 per card you got into the middle, −2 per card left in your Nerts pile. Game to 50 or 100.

## On the phone
- **Double tap** a card to send it to the middle (v154). A single **tap** picks it up (gold), then tap a
  work pile. A double tap on a card that can't go up says why ("only the top card…" / "can't go in the
  middle yet"). **Menu → One tap plays to the middle** restores the old way (one tap sends it if it
  fits); with that on, the second tap of a double tap is swallowed so it can't play the card underneath.
- **Drag** a card, or a run from a work pile, onto a work pile or the middle; where it would land
  lights green while you drag.
- **Tap the stock** to turn three. The opponent strip shows each bot's Nerts cards left and goes gold
  at 3 or fewer; the line above your cards calls it out.
- Menu, Rules, or switching away from the app **pauses the bots**.
- One screen, never scrolls: the page is the screen minus the notch and home bar, `fit()` sizes your
  cards from the width and the height left after the header, opponents, middle and bottom bar, and
  each work pile squeezes its overlap to fit (verified with real notch/home-bar insets on a 15 Pro
  Max, 13/14, SE and 320-wide SE, during full rounds).
- Card size S is a little smaller; M fills; L and XL stop at M (bigger can't fit without scrolling).
  Card text enlarges the print.
- Totals and the round number persist between rounds (`nerts_game`); a round in progress doesn't
  (it's a race; reopening deals the next one). **Keep going** on the start sheet picks it back up.

## How it's built
1. **The engine**, `window.NERTS`, no DOM: the deal (seedable), `canMove`/`move` for every source and
   target, `flip`, `rotate`, scoring, `moves()` (useful moves, best first) and `botStep()` (one action:
   the first useful move it notices, else a flip). A bot's skill is the chance it notices each move;
   Relaxed 0.8 at ~1.7 s an action, Normal 0.95 at ~1.05 s, Fast 1.0 at ~0.65 s, each ±30%.
2. **The screen**: one timer per bot, a 1 s stall check, tap and drag on pointer events.

## Tested
- `node nerts/rules.test.js`: the deal, the middle (aces start, up by suit, no skipping), work piles
  (down, alternating, empty takes anything, runs), moving runs, calling Nerts, flipping three and
  turning the waste over in order, rotating, scoring.
- `node nerts/soak.test.js [N]`: N bot-only rounds (2-4 players, mixed skills): cards conserved, work
  piles always legal runs, middle piles always A-up in one suit, every round ends (about 97% by a
  Nerts call, the rest by the stuck rule).
- Browser: full rounds played through the UI by tapping into the middle, dragging between piles and
  flipping the stock, at 320×568, 390×844 and 430×932 with real insets: every move lands, no scroll,
  round-over screen and Next round work, Menu/Rules pause the bots.

## Who just played to the middle (v153)
- A card that lands in the middle wears its player's colour for 1.4 s - **you blue** (the swatch by
  "Your work piles"), Bea yellow, Cy red, Dot green, the same colours as the opponent strip - with a
  small pop as it lands (no pop with Reduce Motion). The colour then goes; the middle stays plain.
- Sound: your card is a solid *place*, a bot's a lighter *chip*, so you can hear the bots beating you
  to a pile without looking. Menu -> Sound turns both off.
- Built: `centerSnap()` before a move, `landed(p, before)` after it finds the pile that changed and
  stamps `LAND[pile]`; `render()` adds `.land` with `--lc` while it's fresh, and one timer re-renders to
  clear it. Cleared on each new round.
